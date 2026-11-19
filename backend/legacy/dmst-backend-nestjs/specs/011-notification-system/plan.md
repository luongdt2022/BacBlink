# Implementation Plan: Notification System

**Branch**: `011-notification-system` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)

## Summary

Add a `notifications` table and `NotificationsModule` that records system events for users. The `MATCH_FOUND` notification type is triggered automatically by `IntakesProcessor` after a successful `COMPUTE_MATCHES` job. Eight REST endpoints are provided: six for users (`GET /my/notifications`, `GET /my/notifications/unread-count`, `PATCH /my/notifications/read-all`, `PATCH /my/notifications/:id/read`, `DELETE /my/notifications/all`, `DELETE /my/notifications/:id`) and one for admins (`GET /admin/notifications`). `computeMatches` is updated to return a match count so the processor can decide whether to create a notification.

## Technical Context

**Language/Version**: TypeScript / Node.js 22
**Primary Dependencies**: NestJS 11, TypeORM (PostgreSQL), existing `JwtAuthGuard` / `AdminAuthGuard`
**Storage**: PostgreSQL — new `notifications` table (JSONB payload, enum type column)
**Testing**: Jest — unit tests not requested
**Target Platform**: Linux server (NestJS REST API)
**Project Type**: Web service (REST API)
**Performance Goals**: HTTP responses immediate (< 100ms); `GET /unread-count` designed for frequent badge polling; notification creation is inside async BullMQ processor — no HTTP blocking
**Constraints**: No separate notification queue; no real-time push (REST polling only); migration required for new table; hard delete (no soft-delete)
**Scale/Scope**: 1 new entity, 1 new module (service + 2 controllers + 2 DTOs), 1 migration, 2 modified files (`intakes.service.ts`, `intakes.processor.ts`), 1 modified module (`intakes.module.ts`), 1 modified app module

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Module Cohesion | ✅ PASS | `NotificationsModule` owns `notifications` table exclusively; `IntakesModule` imports it — no cross-module repo access |
| II — API Contract Stability | ✅ PASS | Paginated list returns `{ data[], total, page, limit, totalPages, unreadCount }`; all guards applied correctly; static routes registered before parameterized routes |
| III — Async AI Pipeline | ✅ PASS | Notification created inside `IntakesProcessor` (async BullMQ worker), never blocking HTTP |
| IV — Migration-Gated Schema | ✅ PASS | New `notifications` table delivered via TypeORM migration |
| V — Simplicity | ✅ PASS | No extra abstractions; `NotificationsService` consumed by `IntakesProcessor` + 2 controllers (2+ distinct consumers) |

## Project Structure

### Documentation (this feature)

```text
specs/011-notification-system/
├── plan.md              ← this file
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
├── contracts/
│   └── notification-api.md
└── tasks.md
```

### Source Code (affected files)

```text
src/notifications/
├── notification.entity.ts            ← NEW: Notification entity + NotificationType enum + payload interfaces
├── notifications.service.ts          ← NEW: all service methods (create, list, unreadCount, markRead, markAllRead, delete, deleteAll, adminList)
├── notifications.module.ts           ← NEW: module wiring — imports [Notification, Intake]; exports NotificationsService
├── user-notifications.controller.ts  ← NEW: /my/notifications (6 endpoints, JwtAuthGuard)
├── admin-notifications.controller.ts ← NEW: /admin/notifications (AdminAuthGuard)
└── dto/
    ├── list-notifications.dto.ts          ← NEW: page, limit, isRead, type
    └── admin-list-notifications.dto.ts    ← NEW: extends ListNotificationsDto + userId

src/intakes/
├── intakes.service.ts           ← modified: computeMatches returns number (match count)
├── intakes.module.ts            ← modified: import NotificationsModule
└── queue/
    └── intakes.processor.ts     ← modified: inject NotificationsService, call after computeMatches if matchCount > 0

src/app.module.ts                ← modified: import NotificationsModule

src/database/migrations/
└── 1775029882198-CreateNotificationsTable.ts  ← NEW: migration
```

## Implementation Notes

### Module wiring

`NotificationsModule` exports `NotificationsService`. `IntakesModule` imports `NotificationsModule`. `IntakesProcessor` receives `NotificationsService` via constructor injection. `NotificationsModule` also imports `TypeOrmModule.forFeature([Intake])` to allow `NotificationsService` to look up intake title/userId when building the `MATCH_FOUND` payload.

No circular dependency: `NotificationsModule` does not import `IntakesModule`.

### computeMatches return type change

```typescript
// Before
async computeMatches(intakeId: string): Promise<void>

// After
async computeMatches(intakeId: string): Promise<number>
// Returns: saved.length (number of matches saved; 0 if skipped or zero results)
```

### IntakesProcessor integration

```typescript
case IntakesJobName.COMPUTE_MATCHES: {
  const matchCount = await this.intakesService.computeMatches(job.data.intakeId);
  if (matchCount > 0) {
    await this.notificationsService.createMatchFoundNotification({
      intakeId: job.data.intakeId,
      matchCount,
    });
  }
  break;
}
```

`NotificationsService.createMatchFoundNotification` fetches the intake's `userId`, `title`, and `aiProcessTitle`, builds the payload, and inserts a `Notification` record. If `intake.userId` is null, the creation is silently skipped.

### Notification payload construction (MATCH_FOUND)

```typescript
{
  message: `System found ${matchCount} matching partner intake${matchCount > 1 ? 's' : ''} for your intake "${displayTitle}".`,
  navigationPath: `/intakes/${intakeId}/matches`,
  intakeId,
  intakeTitle: displayTitle,   // aiProcessTitle ?? title
  matchCount,
}
```

### User endpoint list with route ordering

Route registration order in `UserNotificationsController` is critical to avoid NestJS capturing static paths as UUID parameters:

1. `GET /` — list (paginated + unreadCount embedded)
2. `GET /unread-count` — lightweight badge count ← BEFORE `/:id`
3. `PATCH /read-all` — mark all read ← BEFORE `/:id/read`
4. `PATCH /:id/read` — mark single read
5. `DELETE /all` — clear inbox ← BEFORE `/:id`
6. `DELETE /:id` — delete single notification

### List response shape

```typescript
{
  data: Notification[],
  total: number,
  page: number,
  limit: number,
  totalPages: number,
  unreadCount: number,  // total unread for this user (all pages), null for admin list
}
```

### Delete behaviour

Hard delete — `notificationRepository.remove(entity)` for single, `notificationRepository.delete({ userId })` for all. No soft-delete. `deleteAll` is idempotent (returns 200 even when inbox is already empty).

### Future notification types

Adding a new type requires:
1. Add value to `NotificationType` enum
2. Define a TypeScript payload interface
3. Add a `create{Type}Notification()` method to `NotificationsService`
4. Call it from the relevant processor/service

No migration or schema change needed.

### Future: Real-time push

The `GET /my/notifications/unread-count` endpoint is designed for REST polling. When WebSocket/SSE is added, the notification creation in `NotificationsService` is the natural integration point for emitting events — no changes to the processor or controllers.
