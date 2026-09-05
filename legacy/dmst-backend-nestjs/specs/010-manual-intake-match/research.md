# Research: Manual Intake Match API

**Feature**: 010-manual-intake-match
**Date**: 2026-03-31

## Decision 1: Queue architecture — separate `intakes-queue` vs `ai-queue`

**Decision**: Create a new `intakes-queue` with `IntakesProcessor` in `IntakesModule`, separate from the existing `ai-queue`.

**Rationale**: Adding `computeMatches` to `AiProcessor` would require injecting `IntakesService` into `AiModule`, creating a circular dependency (`IntakesModule → AiModule → IntakesModule`). A separate queue owned by `IntakesModule` eliminates this entirely. `QueueModule` is `@Global()` so `BullModule.registerQueue` works anywhere.

**Alternatives considered**:
- Add to `ai-queue` in `AiProcessor` → Rejected: circular dependency, violates Principle I (module cohesion)
- Keep inline `void this.computeMatches()` (no queue) → Rejected: user explicitly requested queue for future notification support

---

## Decision 2: `aiProcessedContent` is required before matching

**Decision**: Both `computeMatchesManual` (throw 422) and `computeMatches` (silently skip) check for `aiProcessedContent`.

**Rationale**: Matching quality depends on beautified content. Without `aiProcessedContent`, the query text falls back to raw `content` which produces lower-quality embeddings. Forcing beautify-first ensures consistent match quality. The silent skip in `computeMatches` is intentional: the automatic pipeline may trigger matching before the user runs `/beautify` — in that case the job should not fail the queue, just be a no-op.

**Alternatives considered**:
- Fall back to raw `content` silently → Rejected: produces inconsistent match quality; user explicitly requested this gate
- Always throw in `computeMatches` too → Rejected: would cause queue job failures in the automatic pipeline which runs without user interaction

---

## Decision 3: Fire-and-forget response (no matchCount)

**Decision**: `computeMatchesManual` enqueues the job and returns `{ message: 'Matching has been queued' }` immediately. No match count in the response.

**Rationale**: With async queue execution, the match count is unavailable at response time. The caller can read results via `GET /:id/matches` after the job completes. This is consistent with BullMQ fire-and-forget patterns.

**Alternatives considered**:
- Wait for job completion and return count (synchronous) → Rejected: blocks HTTP thread during BGE-M3 + ES operations; user explicitly requested queue
- Return job ID for polling → Rejected: over-engineering for current needs; notification module will handle this later

---

## Decision 4: Automatic pipeline also uses queue

**Decision**: Replace `void this.computeMatches(intakeId)` in `applyChunkEmbedding` with `void this.intakesQueue.add(COMPUTE_MATCHES, { intakeId })`.

**Rationale**: Consistent architecture — all match computation goes through the queue regardless of trigger source. This makes the system easier to reason about and ensures the notification hook works for both automatic and manual triggers.

---

## Decision 5: Future notification integration point

**Decision**: The `IntakesProcessor` COMPUTE_MATCHES case is the designated integration point for the notification module.

**Rationale**: The processor runs after `computeMatches` completes and has the `intakeId` available. Adding `void notificationService.notifyMatchingComplete(intakeId)` here (after `computeMatches`) requires only injecting the notification service into `IntakesProcessor` — no changes to `IntakesService` or controllers.
