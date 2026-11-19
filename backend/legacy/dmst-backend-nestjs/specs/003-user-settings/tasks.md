---
description: "Task list for Personalized User Settings"
---

# Tasks: Personalized User Settings

**Input**: Design documents from `specs/003-user-settings/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No test tasks — not explicitly requested in the feature specification.

**Organization**: Foundational phase creates the shared entity/DTO. US1 adds the API
endpoints. US2 wires the setting into the intake AI pipeline. US2 depends on US1
(needs `UserSettingsService` injected into `IntakesService`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: [US1] or [US2] — maps to user stories from spec.md
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: No new directories needed — all files go into existing module directories.

- [x] T001 Verify `src/users/dto/` and `src/users/controllers/` and `src/users/services/` directories exist (they do — no action needed; placeholder for plan alignment)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entity and DTO that both US1 and US2 depend on. MUST be complete before
user story work begins.

- [x] T002 Create `UserSetting` entity in `src/users/user-setting.entity.ts` with columns: `id` (UUID PK), `userId` (UUID FK → users, UNIQUE), `matchingAuto` (boolean, default true), `createdAt`, `updatedAt`; add `@OneToOne` relation to `User`

- [x] T003 [P] Create `UpdateSettingsDto` in `src/users/dto/update-settings.dto.ts` with optional boolean field `matchingAuto` validated by `@IsBoolean()` and `@IsOptional()`; export from `src/users/dto/index.ts`

- [x] T004 Generate TypeORM migration for the `user_settings` table by running `npm run migration:generate -- --name=addUserSettings` and verify the generated file creates the table with correct columns, UNIQUE constraint on `user_id`, FK to `users`, and `ON DELETE CASCADE`

**Checkpoint**: Entity, DTO, and migration file exist. `npm run build` passes.

---

## Phase 3: User Story 1 — View and Update Personal Settings (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can `GET /my/settings` to see their settings (with defaults
for new users) and `PATCH /my/settings` to update them. Settings are per-user isolated.

**Independent Test**: `GET /my/settings` returns `{ matchingAuto: true }` for a new user.
`PATCH /my/settings` with `{ matchingAuto: false }` returns `{ matchingAuto: false }`.
A second user's settings remain `{ matchingAuto: true }` — no cross-user leakage.

### Implementation for User Story 1

- [x] T005 [US1] Create `UserSettingsService` in `src/users/services/user-settings.service.ts` with:
  - `getSettings(userId: string): Promise<UserSetting>` — finds or creates (upsert) the settings row with defaults
  - `updateSettings(userId: string, dto: UpdateSettingsDto): Promise<UserSetting>` — saves provided fields and returns updated row
  - Inject `Repository<UserSetting>` via `@InjectRepository(UserSetting)`

- [x] T006 [US1] Create `UserSettingsController` in `src/users/controllers/user-settings.controller.ts` with:
  - `@Controller('my/settings')`, `@UseGuards(JwtAuthGuard)`, `@ApiBearerAuth()`, `@ApiTags('User Settings')`
  - `GET /` → calls `userSettingsService.getSettings(user.id)`, returns settings object
  - `PATCH /` → `@Body() dto: UpdateSettingsDto`, calls `userSettingsService.updateSettings(user.id, dto)`, returns updated settings
  - Add `@ApiOperation` decorators for both endpoints

- [x] T007 [US1] Update `src/users/users.module.ts`:
  - Add `UserSetting` to `TypeOrmModule.forFeature([User, UserSetting])`
  - Add `UserSettingsService` to `providers`
  - Add `UserSettingsController` to `controllers`
  - Add `UserSettingsService` to `exports` (needed by IntakesModule in US2)

- [x] T008 [US1] Export `UserSettingsController` and `UserSettingsService` from `src/users/controllers/index.ts` and `src/users/services/index.ts` respectively

**Checkpoint**: `GET /my/settings` and `PATCH /my/settings` return correct responses.
New user gets `{ matchingAuto: true }`. Setting is isolated per user.

---

## Phase 4: User Story 2 — Matching Auto Controls AI Pipeline (Priority: P2)

**Goal**: When `matchingAuto` is OFF for the intake's owner, `computeMatches` is NOT called
automatically after chunk-embed-index completes. When ON (default), existing behaviour
is preserved.

**Independent Test**: Set `matchingAuto = false` via `PATCH /my/settings`. Create an intake
with content. Wait 30s. Query `intake_matches` — no new rows for that intake. Switch to
`matchingAuto = true`, create another intake — matches appear.

**Dependencies**: Requires T005–T008 (US1) complete so `UserSettingsService` is available.

### Implementation for User Story 2

- [x] T009 [US2] Update `src/intakes/intakes.module.ts`: add `UsersModule` to the `imports` array so `UserSettingsService` is available to `IntakesService`

- [x] T010 [US2] Update `IntakesService` constructor in `src/intakes/intakes.service.ts` to inject `UserSettingsService` from `UsersModule`

- [x] T011 [US2] Update `applyChunkEmbedding(intakeId, text)` in `src/intakes/intakes.service.ts` (~line 117): after Elasticsearch indexing completes, fetch the intake's `userId`, call `userSettingsService.getSettings(userId)`, and only call `void this.computeMatches(intakeId)` if `settings.matchingAuto === true`; if `userId` is null (seed/admin intake), always call `computeMatches`

**Checkpoint**: With `matchingAuto = false`, no `intake_matches` rows are created after
an intake is submitted. With `matchingAuto = true`, matches are created as before.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T012 [P] Run migration locally: `npm run migration:run` and verify `user_settings` table exists in the database with correct schema

- [x] T013 [P] Run `npm run lint` and fix any linting issues in the new files (build passes ✅)

- [ ] T014 Run quickstart validation from `specs/003-user-settings/quickstart.md`: verify GET/PATCH endpoints, per-user isolation, and matching gate behaviour

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T002–T004)
- **User Story 2 (Phase 4)**: Depends on US1 completion (T005–T008 must be done first)
- **Polish (Phase 5)**: Depends on all user story phases complete

### Within Each User Story

- **US1**: T005 (service) → T006 (controller, depends on service) → T007 (module wiring) → T008 (exports)
- **US2**: T009 (module import) → T010 (constructor injection) → T011 (pipeline logic)
- T003 [P] can run in parallel with T002 (different files, both in Foundational)

---

## Parallel Opportunities

```bash
# Foundational phase — run in parallel:
Task: "T002 Create UserSetting entity in src/users/user-setting.entity.ts"
Task: "T003 Create UpdateSettingsDto in src/users/dto/update-settings.dto.ts"
# T004 (migration generate) must wait for T002 to complete

# Polish phase — run in parallel:
Task: "T012 Run migration and verify table schema"
Task: "T013 Run npm run lint and fix issues"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: T002–T004 (entity + DTO + migration)
2. Complete Phase 3: T005–T008 (service + controller + module wiring)
3. **STOP and VALIDATE**: Test `GET /my/settings` and `PATCH /my/settings` with Swagger/curl
4. Settings are live and per-user — US1 is independently valuable

### Incremental Delivery

1. T002–T004 → Foundation ready
2. T005–T008 → Settings API live (MVP!)
3. T009–T011 → Matching gate wired in
4. T012–T014 → Validated

---

## Notes

- T002 and T003 are in different files and can run in parallel
- T004 (`migration:generate`) MUST run after T002 (entity must exist for TypeORM to diff)
- T010 and T011 both modify `intakes.service.ts` — run sequentially
- The `UserSetting` entity needs to be added to `TypeOrmModule.forFeature` in `UsersModule` (T007), NOT in `IntakesModule` — ownership stays in the users domain
- For T011: `applyChunkEmbedding` currently only has `intakeId` and `text` parameters; the intake's `userId` must be fetched from the intake repository inside the method
