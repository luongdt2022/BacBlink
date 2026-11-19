# Implementation Plan: Manual Intake Match API

**Branch**: `010-manual-intake-match` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)

## Summary

Add two authenticated endpoints (`POST /my/intakes/:id/compute-matches` for users, `POST /admin/intakes/:id/compute-matches` for admins) that trigger the matching algorithm on demand via `intakes-queue` (BullMQ). Pre-conditions: intake must be `published` AND have `aiProcessedContent` (set by `/beautify`). The HTTP response is immediate (fire-and-forget); matching runs asynchronously in `IntakesProcessor`. The automatic pipeline (triggered after chunk-embed) also enqueues via the same queue instead of running inline.

## Technical Context

**Language/Version**: TypeScript / Node.js 22
**Primary Dependencies**: NestJS 11, TypeORM (PostgreSQL), BullMQ (`intakes-queue`), existing `JwtAuthGuard` / `AdminAuthGuard`
**Storage**: PostgreSQL — read `intakes` (status + aiProcessedContent check), write `intake_matches` (delete + insert in queue processor)
**Testing**: Jest — unit tests not requested
**Target Platform**: Linux server (NestJS REST API)
**Project Type**: Web service (REST API)
**Performance Goals**: HTTP response immediate (< 100ms); actual matching completes within seconds in queue
**Constraints**: Fire-and-forget queue; `aiProcessedContent` required; no schema changes
**Scale/Scope**: 2 new endpoints, 2 new files, 3 modified files; zero migrations

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Module Cohesion | ✅ PASS | `IntakesProcessor` stays in `IntakesModule`; no cross-module repo access |
| II — API Contract Stability | ✅ PASS | `{ success, data }` shape; `JwtAuthGuard` / `AdminAuthGuard` applied correctly |
| III — Async AI Pipeline | ✅ PASS | Manual endpoint is fire-and-forget via queue; automatic pipeline also queues |
| IV — Migration-Gated Schema | ✅ PASS | No schema changes |
| V — Simplicity | ✅ PASS | `IntakesProcessor` wraps existing `computeMatches`; no new abstraction layers |

## Project Structure

### Documentation (this feature)

```text
specs/010-manual-intake-match/
├── plan.md              ← this file
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── manual-match-api.md
└── tasks.md
```

### Source Code (affected files)

```text
src/intakes/
├── constants/
│   └── intakes.constants.ts         ← NEW: INTAKES_QUEUE_NAME, IntakesJobName
├── queue/
│   └── intakes.processor.ts         ← NEW: @Processor for intakes-queue
├── intakes.service.ts               ← modified: queue injection, aiProcessedContent check, computeMatchesManual, pipeline enqueue
├── intakes.module.ts                ← modified: BullModule.registerQueue, IntakesProcessor provider
├── user-intakes.controller.ts       ← modified: POST :id/compute-matches in MyIntakesController
└── admin-intakes.controller.ts      ← modified: POST :id/compute-matches in IntakesController
```

## Implementation Notes

### Queue architecture

- **Queue**: `intakes-queue` (separate from `ai-queue` to avoid circular dependency with `AiModule`)
- **Producer**: `IntakesService` via `@InjectQueue(INTAKES_QUEUE_NAME)`
- **Consumer**: `IntakesProcessor` (in `IntakesModule`) — has access to `IntakesService`
- **Job data**: `{ intakeId: string }`

### Validation chain (manual trigger)

```
HTTP request
  → validate ownership (user endpoint only)
  → 404 if not found
  → 422 if status !== 'published'
  → 422 if !aiProcessedContent
  → enqueue { intakeId } to intakes-queue
  → return { message: 'Matching has been queued' }
```

### Automatic pipeline update

```
applyChunkEmbedding
  → indexIntake (ES)
  → check matchingAuto setting
  → enqueue { intakeId } to intakes-queue (was: void this.computeMatches())
```

### computeMatches guard

```typescript
if (!intake.aiProcessedContent) {
  // log and skip — automatic pipeline jobs may arrive before beautify
  return;
}
```

### Future notification hook

```typescript
// In IntakesProcessor, COMPUTE_MATCHES case:
await this.intakesService.computeMatches(job.data.intakeId);
// TODO: emit notification event here when notification module is ready
```
