# Research: Intake AI Beautification Endpoint

**Branch**: `009-intake-beautify-api` | **Date**: 2026-03-30

## Decision 1: Single service method vs duplicate logic per controller

**Decision**: Add one `beautifyIntake(intakeId, userId?)` method to `IntakesService`.
Both the user controller (`MyIntakesController`) and the admin controller
(`IntakesController`) call the same service method. When `userId` is provided the method
enforces ownership; when `userId` is absent (admin call) it skips the ownership check.

**Rationale**: Constitution I (Module Cohesion) — business logic belongs in the service.
Putting the LLM call in a controller would violate this. One parameterised service method
avoids duplication while preserving the existing two-controller layout (admin vs user).

**Alternatives considered**:
- New shared controller at `/intakes/:id/beautify` with JwtAuthGuard + role-based
  ownership check — rejected because the existing codebase does not mix admin/user routes
  in a shared controller; adding one now would break the established pattern.

## Decision 2: Synchronous vs fire-and-forget

**Decision**: Synchronous. `aiService.completion()` is awaited; the result is saved to the
DB and returned in the HTTP response.

**Rationale**: This is a user-triggered, on-demand action — the caller explicitly wants the
beautified result now. Constitution III (Async AI Pipeline Integrity) applies to the
4-step background pipeline, not to every AI call. A synchronous response avoids requiring
the client to poll for completion.

**Alternatives considered**: Fire-and-forget returning 202 Accepted — rejected because it
adds polling complexity for no benefit when the single LLM call completes in ~2-5 seconds.

## Decision 3: Scope — beautification only, no pipeline chaining

**Decision**: The endpoint updates `aiProcessTitle`, `aiProcessedContent`, and
`aiProcessingStatus` only. It does NOT trigger `applyChunkEmbedding` or `computeMatches`.

**Rationale**: Spec assumption: "does NOT chain into chunk-embed/matching". The chunking
and matching pipeline is already triggered separately (via `startAiProcessing`). Mixing
on-demand beautification with background pipeline steps would make the endpoint's side
effects unpredictable and harder to reason about.

## Decision 4: Error handling — leave data unchanged on failure

**Decision**: On LLM failure or JSON parse error, return HTTP 500 with an error message
and do NOT modify `aiProcessTitle`, `aiProcessedContent`, or `aiProcessingStatus`.

**Rationale**: FR-007 is explicit: "leave the existing intake data unchanged" on failure.
Partial updates (e.g., setting `aiProcessingStatus=FAILED` without clearing content)
would leave the record in an inconsistent state visible to the user.

## Decision 5: Route placement

**Decision**:
- User: `POST /my/intakes/:id/beautify` (inside `MyIntakesController`, `JwtAuthGuard`)
- Admin: `POST /admin/intakes/:id/beautify` (inside `IntakesController`, `AdminAuthGuard`)

**Rationale**: Follows the existing convention exactly. No new module, no new controller
class needed. The `beautifyIntake` service method is the single source of truth.
