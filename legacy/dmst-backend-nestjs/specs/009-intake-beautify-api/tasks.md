# Tasks: Intake AI Beautification Endpoint

**Input**: Design documents from `specs/009-intake-beautify-api/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Organization**: Single user story (P1). No setup or foundational phases required —
3 targeted edits to existing files, no new entities or infrastructure.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: User Story 1 — On-demand AI beautification for authenticated users (Priority: P1) 🎯

**Goal**: Any authenticated user (regular or admin) can call a single endpoint to run the
B2B marketing LLM on a specific intake, persist the result, and receive the updated values
synchronously. Regular users are restricted to their own intakes; admins have unrestricted
access.

**Independent Test**: Run the 5 quickstart scenarios in `specs/009-intake-beautify-api/quickstart.md`:
1. User beautifies own intake → 200 with saved `aiProcessTitle`/`aiProcessedContent`
2. User cannot beautify another user's intake → 404/403
3. Admin beautifies any intake → 200
4. Intake with no content → 422
5. Unauthenticated request → 401

### Implementation

- [x] T001 [US1] Add `beautifyIntake(intakeId: string, userId?: string): Promise<{id, title, aiProcessTitle, aiProcessedContent, aiProcessingStatus}>` to `src/intakes/intakes.service.ts`: fetch intake (if userId provided use `findOneForUserCheck`, else plain findOne), throw `UnprocessableEntityException` if no content, call `this.aiService.completion({ prompt: buildB2bMarketingPrompt(...) })`, parse JSON result, update `aiProcessTitle`/`aiProcessedContent`/`aiProcessingStatus=COMPLETED` in DB, return updated fields; on parse/AI error throw `InternalServerErrorException` without modifying DB

- [x] T002 [P] [US1] Add `POST :id/beautify` action to `MyIntakesController` in `src/intakes/user-intakes.controller.ts`: `@Post(':id/beautify')` with `@ApiOperation`, `@Param('id', ParseUUIDPipe)`, call `intakesService.beautifyIntake(id, req.user.id)`, return `{ success: true, data: result }`

- [x] T003 [P] [US1] Add `POST :id/beautify` action to `IntakesController` in `src/intakes/admin-intakes.controller.ts`: `@Post(':id/beautify')` with `@ApiOperation`, `@Param('id', ParseUUIDPipe)`, call `intakesService.beautifyIntake(id)` (no userId — admin bypass), return `{ success: true, data: result }`

**Note on T002/T003 parallelism**: Both modify different controller files and both depend
on T001 (the service method). Execute T001 first, then T002 and T003 can run in parallel.

**Checkpoint**: Both endpoints respond correctly per quickstart scenarios.

---

## Phase 2: Polish & Validation

- [ ] T004 Run quickstart validation from `specs/009-intake-beautify-api/quickstart.md` — verify all 5 scenarios

---

## Dependencies & Execution Order

- **T001**: Must complete first (service method — both controllers depend on it)
- **T002, T003**: Can run in parallel after T001 (different files)
- **T004**: After T001 + T002 + T003

---

## Parallel Execution

```
T001 (service method)
  ├── T002 (user controller)   ← parallel
  └── T003 (admin controller)  ← parallel
        └── T004 (validation)
```

---

## Implementation Strategy

1. Implement T001 (service) — the core logic
2. Implement T002 + T003 in parallel (controller wiring)
3. Run T004 validation

---

## Notes

- `beautifyIntake` uses `findOneForUserCheck(id, userId)` for user calls (throws 404 if not found or not owned)
- For admin calls, pass no `userId`; use plain `intakeRepository.findOne({ where: { id } })` — throw 404 if not found
- `UnprocessableEntityException` (422) when `!intake.content`
- Do NOT call `applyChunkEmbedding` or `computeMatches` — scope is beautification only
- `AiService.completion()` and `buildB2bMarketingPrompt` already exist — no new imports needed beyond `UnprocessableEntityException`, `InternalServerErrorException` from `@nestjs/common`
