# Tasks: Notification System

**Input**: Design documents from `/specs/011-notification-system/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the `NotificationsModule` skeleton and database foundation that all user stories depend on.

- [X] T001 Create `src/notifications/notification.entity.ts` — `Notification` entity with columns: `id` (uuid PK), `userId` (FK → users), `type` (NotificationType enum: `match_found`), `payload` (jsonb), `isRead` (boolean default false), `createdAt` (timestamptz); define `NotificationType` enum and `MatchFoundPayload` interface in same file
- [X] T002 Generate TypeORM migration for the `notifications` table: run `npm run migration:generate --name=CreateNotificationsTable` and verify the generated file at `src/database/migrations/1775029882198-CreateNotificationsTable.ts`
- [X] T003 Create `src/notifications/notifications.module.ts` — `NotificationsModule` importing `TypeOrmModule.forFeature([Notification, Intake])`; providers: `[NotificationsService]`; exports: `[NotificationsService]`; controllers: `[UserNotificationsController, AdminNotificationsController]`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: `NotificationsService` core + pipeline integration — required before any HTTP endpoint can be validated end-to-end.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Create `src/notifications/notifications.service.ts` — implement `createMatchFoundNotification({ intakeId, matchCount })`: fetch intake (`title`, `aiProcessTitle`, `userId`) via injected `IntakeRepository`, guard against null `userId`, build MATCH_FOUND payload, insert `Notification` entity using `new Notification()` assignment pattern (avoids TypeORM `DeepPartial` overload issues)
- [X] T005 Create `src/notifications/dto/list-notifications.dto.ts` — `ListNotificationsDto` with optional `page`, `limit` (`@Type(() => Number)`), `isRead` (`@Transform` string→boolean), `type` (`@IsEnum(NotificationType)`)
- [X] T006 Create `src/notifications/dto/admin-list-notifications.dto.ts` — `AdminListNotificationsDto` extending `ListNotificationsDto`; add optional `userId?: string` with `@IsOptional @IsUUID()`
- [X] T007 [P] Modify `src/intakes/intakes.service.ts` — change `computeMatches` return type from `Promise<void>` to `Promise<number>`; add `return 0` at all early-exit points; change final `await this.intakeMatchRepository.save(rows)` to `const saved = await ...; return saved.length`
- [X] T008 [P] Modify `src/intakes/intakes.module.ts` — add `NotificationsModule` to the `imports` array
- [X] T009 Modify `src/intakes/queue/intakes.processor.ts` — inject `NotificationsService` via constructor; in `COMPUTE_MATCHES` case: capture `matchCount` return value; call `notificationsService.createMatchFoundNotification(...)` only if `matchCount > 0`
- [X] T010 Modify `src/app.module.ts` — add `NotificationsModule` to the `imports` array

**Checkpoint**: Foundation ready — trigger a matching job, wait ~10 s, verify a `notifications` row is created in the DB.

---

## Phase 3: User Story 1 — Receive Matching Notification (Priority: P1) 🎯 MVP

**Goal**: Notifications are automatically created when a matching job completes with results; the `MATCH_FOUND` payload includes message + navigation path + match count.

**Independent Test**: Trigger `POST /my/intakes/:id/compute-matches`, wait ~10 s, verify row in `notifications` table with correct `type`, `payload`, `is_read = false` (quickstart scenario 1).

*(Notification creation is implemented in the Foundation phase — this phase only adds the list endpoint for API access.)*

- [X] T011 [US1] Add `findAllForUser(userId, dto)` method to `src/notifications/notifications.service.ts` — `findAndCount` with optional `isRead`/`type` filters, `createdAt DESC` order, skip/take pagination; separate `count` query for `unreadCount`; return `{ data, total, page, limit, totalPages, unreadCount }`
- [X] T012 [US1] Create `src/notifications/user-notifications.controller.ts` — `@Controller('my/notifications')` with `@UseGuards(JwtAuthGuard)`; add `@Get()` calling `findAllForUser`, wrapping in `{ success: true, data: result }` with Swagger decorators

**Checkpoint**: `GET /my/notifications` returns the notification created by the matching job; `unreadCount: 1`.

---

## Phase 4: User Story 2 — View and Manage Personal Notifications (Priority: P2)

**Goal**: Users can mark individual or all notifications as read; unread count updates; badge reflects real state.

**Independent Test**: Seed unread notifications, call `PATCH /my/notifications/:id/read` and `PATCH /my/notifications/read-all`; verify `isRead` flips and `unreadCount` drops in subsequent list calls (quickstart scenarios 4–5).

- [X] T013 [US2] Add `markOneRead(id, userId)` method to `src/notifications/notifications.service.ts` — find by `{ id, userId }`, throw `NotFoundException` if absent, set `isRead = true`, save and return entity
- [X] T014 [US2] Add `markAllRead(userId)` method to `src/notifications/notifications.service.ts` — `update({ userId, isRead: false }, { isRead: true })`; return `{ message: 'All notifications marked as read' }`
- [X] T015 [US2] Add `PATCH /read-all` and `PATCH /:id/read` handlers to `src/notifications/user-notifications.controller.ts` — register `read-all` BEFORE `/:id/read` to prevent route capture; `/:id/read` uses `ParseUUIDPipe`; both return `{ success: true, data }`; include Swagger decorators

**Checkpoint**: Mark-read and mark-all-read work; subsequent `GET /my/notifications` reflects updated `unreadCount`.

---

## Phase 5: User Story 3 — Real-Time Badge Count Polling (Priority: P3)

**Goal**: Lightweight `GET /my/notifications/unread-count` endpoint returns `{ count: N }` for frequent polling without loading the full notification list.

**Independent Test**: Call `GET /my/notifications/unread-count` with valid JWT; verify count is correct integer; verify count changes after mark-read calls. Does not require loading list (quickstart scenario 13).

- [X] T016 [US3] Add `getUnreadCount(userId)` method to `src/notifications/notifications.service.ts` — `count({ where: { userId, isRead: false } })`; return `{ count }`
- [X] T017 [US3] Add `GET /unread-count` handler to `src/notifications/user-notifications.controller.ts` — register BEFORE `/:id` to avoid route capture; returns `{ success: true, data: { count } }` with Swagger decorators

**Checkpoint**: `GET /my/notifications/unread-count` returns correct count; verified against list `unreadCount` field.

---

## Phase 6: User Story 4 — Dismiss Notifications (Priority: P4)

**Goal**: Users can permanently delete individual notifications or clear their entire inbox in one operation.

**Independent Test**: Seed notifications, call `DELETE /my/notifications/:id` and `DELETE /my/notifications/all`, verify records removed from DB and list total decreases (quickstart scenarios 14–17).

- [X] T018 [US4] Add `deleteOne(id, userId)` method to `src/notifications/notifications.service.ts` — find by `{ id, userId }`, throw `NotFoundException` if absent, `remove(notification)`; return `{ message: 'Notification deleted' }`
- [X] T019 [US4] Add `deleteAll(userId)` method to `src/notifications/notifications.service.ts` — `delete({ userId })`; return `{ message: 'All notifications deleted' }` (idempotent)
- [X] T020 [US4] Add `DELETE /all` and `DELETE /:id` handlers to `src/notifications/user-notifications.controller.ts` — register `DELETE /all` BEFORE `DELETE /:id`; both return `{ success: true, data }`; include Swagger decorators; add `Delete` to NestJS imports

**Checkpoint**: Delete endpoints work; cross-user delete returns 404; delete-all is idempotent.

---

## Phase 7: User Story 5 — Admin Views All Notifications (Priority: P5)

**Goal**: Admin can list all notifications across all users with optional filters (userId, type, isRead).

**Independent Test**: Call `GET /admin/notifications` and `GET /admin/notifications?userId=<id>` with admin JWT; verify 403 for non-admin (quickstart scenarios 8–10).

- [X] T021 [US5] Add `findAllAdmin(dto)` method to `src/notifications/notifications.service.ts` — `findAndCount` with optional filters (`userId`, `isRead`, `type`), `createdAt DESC` order, pagination; return `{ data, total, page, limit, totalPages, unreadCount: null }`
- [X] T022 [US5] Create `src/notifications/admin-notifications.controller.ts` — `@Controller('admin/notifications')` with `@UseGuards(AdminAuthGuard)`; `@Get()` calling `findAllAdmin`; wrapped in `{ success: true, data }`; Swagger decorators; registered in `NotificationsModule` controllers array

**Checkpoint**: All 5 user stories independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T023 [P] Run `npx tsc --noEmit` — confirm zero TypeScript errors across all new and modified files
- [X] T024 [P] Run `npx eslint src/notifications/` — confirm zero lint errors in the notifications module
- [ ] T025 Run `npm run migration:run` then `npm run start:dev` and execute quickstart.md validation scenarios 1–17 against the running server

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001, T002, T003 can run in parallel
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories; T007/T008 parallel; T009 depends on T004+T007+T008; T010 depends on T003
- **US1 (Phase 3)**: Depends on Phase 2 — T011→T012 sequential
- **US2 (Phase 4)**: Depends on Phase 2 — T013/T014 parallel; T015 depends on both
- **US3 (Phase 5)**: Depends on Phase 2 — T016→T017 sequential; independent of US1/US2
- **US4 (Phase 6)**: Depends on Phase 2 — T018/T019 parallel; T020 depends on both
- **US5 (Phase 7)**: Depends on Phase 2 — T021→T022 sequential; independent of US1–US4
- **Polish (Phase 8)**: Depends on all story phases — T023/T024 parallel; T025 sequential after server start

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependency on other stories
- **US2 (P2)**: Can start after Phase 2 — service methods additive to `notifications.service.ts`
- **US3 (P3)**: Can start after Phase 2 — independent of US1/US2
- **US4 (P4)**: Can start after Phase 2 — independent of US1–US3
- **US5 (P5)**: Can start after Phase 2 — independent of US1–US4

### Parallel Opportunities

- T001, T002, T003 (Phase 1) — parallel
- T007, T008 (Phase 2) — parallel (different files)
- T013, T014 (Phase 4) — parallel (different methods, coordinate if solo)
- T018, T019 (Phase 6) — parallel (different methods, coordinate if solo)
- T023, T024 (Phase 8) — parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T010)
3. Complete Phase 3: US1 (T011–T012)
4. **STOP and VALIDATE**: Trigger matching → verify notification created → `GET /my/notifications` returns it
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → notifications auto-created by matching pipeline ✅
2. Add US1 → users can view notifications via API ✅
3. Add US2 → mark read/unread; badge works ✅
4. Add US3 → dedicated badge count polling ✅
5. Add US4 → dismiss individual/all notifications ✅
6. Add US5 → admin audit view ✅

### Current Status (2026-04-01)

All implementation tasks T001–T024 are complete. Only T025 (quickstart validation against running server) remains pending.

---

## Notes

- Route order in `UserNotificationsController` is critical — static routes (`/unread-count`, `/read-all`, `/all`) MUST be registered before parameterized routes (`/:id/read`, `/:id`) to prevent NestJS capturing them as UUID parameters
- `createMatchFoundNotification` uses `new Notification()` direct assignment instead of `repository.create({...})` to avoid TypeORM `DeepPartial` overload conflicts with nullable `userId` type
- `computeMatches` return type change `void → number` is non-breaking — all callers that ignored the return value continue to work
- Admin list response has `unreadCount: null` (cross-user view; no single-user unread concept)
- Hard delete: no `deletedAt`, no soft-delete; `deleteAll` is idempotent
