# Tasks: Manual Intake Match API

**Input**: Design documents from `/specs/010-manual-intake-match/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not requested in spec — no test tasks generated.

**Organization**: 2 user stories → 2 implementation phases. No schema changes.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Create `src/intakes/constants/intakes.constants.ts` — define `INTAKES_QUEUE_NAME = 'intakes-queue'` and `IntakesJobName.COMPUTE_MATCHES = 'intakes.compute-matches'`
- [X] T002 Create `src/intakes/queue/intakes.processor.ts` — `@Processor(INTAKES_QUEUE_NAME)` that handles `COMPUTE_MATCHES` job by calling `intakesService.computeMatches(job.data.intakeId)`
- [X] T003 Update `src/intakes/intakes.module.ts` — add `BullModule.registerQueue({ name: INTAKES_QUEUE_NAME })` to imports and `IntakesProcessor` to providers

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Update `IntakesService` with queue injection, aiProcessedContent validation, and fire-and-forget `computeMatchesManual`.

**⚠️ CRITICAL**: Both controller endpoints depend on these service changes.

- [X] T004 Update `src/intakes/intakes.service.ts` — inject `@InjectQueue(INTAKES_QUEUE_NAME) private readonly intakesQueue: Queue`; in `computeMatches()` add early return if `!intake.aiProcessedContent` (log + skip); in `applyChunkEmbedding()` replace `void this.computeMatches(intakeId)` with `void this.intakesQueue.add(IntakesJobName.COMPUTE_MATCHES, { intakeId })`; add `computeMatchesManual()` method that validates published + aiProcessedContent (422 if either missing), enqueues job, returns `{ message: 'Matching has been queued' }`

**Checkpoint**: Service compiles. `computeMatchesManual` throws 422 without aiProcessedContent. Automatic pipeline enqueues to `intakes-queue`.

---

## Phase 3: User Story 1 — User endpoint (Priority: P1) 🎯 MVP

**Goal**: Authenticated users trigger manual matching for their own published + beautified intakes via `POST /my/intakes/:id/compute-matches`.

**Independent Test**: Call endpoint with published + beautified intake → 200 `{ success: true, data: { message: 'Matching has been queued' } }`. Verify 422 for draft or missing aiProcessedContent. Verify 404 for another user's intake.

### Implementation for User Story 1

- [X] T005 [US1] Add `POST :id/compute-matches` handler to `MyIntakesController` in `src/intakes/user-intakes.controller.ts` — `@Param('id', ParseUUIDPipe)`, `@CurrentUser()`, calls `computeMatchesManual(id, user.id)`, returns `{ success: true, data }`. Swagger decorators: `@ApiOperation`, `@ApiParam`, `@ApiResponse` (200, 404, 422).

**Checkpoint (US1 complete)**: Returns `{ message: 'Matching has been queued' }` for valid request; 422 for draft or no aiProcessedContent; 404 for wrong owner.

---

## Phase 4: User Story 2 — Admin endpoint (Priority: P2)

**Goal**: Admin triggers matching for any published + beautified intake via `POST /admin/intakes/:id/compute-matches`.

**Independent Test**: Admin JWT + any published beautified intake → 200 `{ message: 'Matching has been queued' }`. 422 for draft or no aiProcessedContent. 404 for missing intake.

### Implementation for User Story 2

- [X] T006 [US2] Add `POST :id/compute-matches` handler to `IntakesController` in `src/intakes/admin-intakes.controller.ts` — `@Param('id', ParseUUIDPipe)`, calls `computeMatchesManual(id)` (no userId), returns `{ success: true, data }`. Swagger decorators.

**Checkpoint (US2 complete)**: Admin endpoint works for any intake regardless of ownership.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T007 Run TypeScript compiler check (`npx tsc --noEmit`) — zero errors confirmed
- [ ] T008 Run quickstart.md validation scenarios 1–9 against the running server

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001, T002, T003 can run in parallel (different files)
- **Foundational (Phase 2)**: Depends on Phase 1 completion
- **US1 (Phase 3)**: Depends on T004
- **US2 (Phase 4)**: Depends on T004; can run in parallel with T005
- **Polish (Phase 5)**: Depends on T005, T006

### Parallel Opportunities

- T001, T002, T003 can run in parallel (different new files)
- T005 and T006 can run in parallel (different controller files)

---

## Implementation Strategy

### MVP First

1. T001 → T002 → T003 → T004 → T005
2. **STOP and VALIDATE** via quickstart.md scenarios 1–5
3. T006 (admin endpoint)

### Full Parallel

1. T001 ∥ T002 ∥ T003
2. T004
3. T005 ∥ T006
4. T007 → T008

---

## Notes

- **Zero migrations**: no schema changes
- **2 new files**: `constants/intakes.constants.ts`, `queue/intakes.processor.ts`
- **aiProcessedContent required**: both automatic pipeline (silently skips) and manual endpoint (422 error)
- **Response changed**: no longer `{ matchCount }` — now `{ message: 'Matching has been queued' }` (async fire-and-forget)
- **Future notification**: add logic in `IntakesProcessor` after `computeMatches()` completes in COMPUTE_MATCHES case
- 422 messages: `"...must be published..."` or `"...no AI-processed content — please run /beautify first"`
