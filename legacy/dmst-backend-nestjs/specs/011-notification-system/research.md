# Research: Notification System

**Feature**: 011-notification-system
**Date**: 2026-04-01

## Decision 1: Notification creation is synchronous (no queue)

**Decision**: `NotificationsService.create()` is called directly from `IntakesProcessor` after `computeMatches` completes. No separate notification queue is introduced.

**Rationale**: Creating a database row is a fast, low-risk operation (< 10ms). Adding a queue would introduce a second async hop with no benefit — the notification creation is already inside an async BullMQ worker. The `MailModule` similarly calls its service directly from a processor. YAGNI applies.

**Alternatives considered**:
- Separate `notifications-queue` → Rejected: over-engineering; notifications are lightweight DB writes, not AI-scale operations; adds a second async hop with no benefit

---

## Decision 2: Separate `NotificationsModule` (not part of IntakesModule)

**Decision**: Create `src/notifications/` as a standalone module. `IntakesModule` imports `NotificationsModule` and injects `NotificationsService` into `IntakesProcessor`.

**Rationale**: Principle I (Module Cohesion) requires each module to own its domain. Notifications are a cross-cutting concern that will eventually serve multiple modules (matching, onboarding, admin events). Keeping them in a separate module lets future modules (`MailModule`, future events) use `NotificationsService` without depending on `IntakesModule`. No circular dependency: `NotificationsModule` does not import `IntakesModule`.

**Alternatives considered**:
- Add `Notification` entity directly to `IntakesModule` → Rejected: violates Principle I; notifications are not intake-specific; would block future reuse
- `@Global()` on `NotificationsModule` → Rejected: only one consumer today (`IntakesModule`); global scope is premature per Principle V

---

## Decision 3: JSONB payload column (extensible, schemaless)

**Decision**: Store notification content in a `payload` JSONB column. The `type` enum column defines the notification category and dictates the payload shape. The current `MATCH_FOUND` payload shape:

```json
{
  "message": "System found 5 matching partner intakes for your intake \"IP Title\".",
  "navigationPath": "/intakes/{intakeId}/matches",
  "intakeId": "uuid",
  "intakeTitle": "string",
  "matchCount": 5
}
```

**Rationale**: Future notification types (onboarding, admin alerts, system events) will have different data fields. A JSONB column avoids migrations when new types are introduced — only the TypeScript payload type and enum entry change. PostgreSQL JSONB supports indexing if query performance becomes an issue later.

**Alternatives considered**:
- Separate typed columns per field (`navigationPath`, `matchCount`, etc.) → Rejected: requires migration for every new type, violates Principle IV extensibility goal
- Separate `notification_payloads` table → Rejected: over-normalization for JSON data; adds join complexity with no benefit

---

## Decision 4: Notification created only when matchCount > 0

**Decision**: `computeMatches` returns the row count after saving. `IntakesProcessor` only calls `notificationsService.create()` if `matchCount > 0`. Zero-match runs produce no notification.

**Rationale**: Spec FR-001 and acceptance scenario 2 both state no notification should be created for zero matches. Notifying users of "no results" would create noise and reduce notification value.

**Alternatives considered**:
- Always create a notification regardless of match count → Rejected: spec explicitly prohibits zero-match notifications; creates noise

---

## Decision 5: computeMatches returns match count

**Decision**: Change `computeMatches` return type from `Promise<void>` to `Promise<number>` (the number of saved rows). `IntakesProcessor` uses the return value to decide whether to create a notification.

**Rationale**: The processor needs the match count to implement Decision 4. Returning the count from `computeMatches` is the simplest approach — the count is already known inside the function (`rows.length`). No additional query needed.

**Alternatives considered**:
- Re-query `intake_matches` after the call → Rejected: unnecessary round-trip; data is available inside `computeMatches`
- Pass a callback/event emitter → Rejected: over-engineering per Principle V

---

## Decision 6: Both embedded unreadCount AND a dedicated unread-count endpoint

**Decision**: The paginated list response embeds `unreadCount` alongside `data`, `total`, `page`, `limit`, `totalPages`. Additionally, a dedicated `GET /my/notifications/unread-count` endpoint is provided for badge polling without loading the full list.

**Rationale**: Two distinct consumers exist: (1) the notification panel (needs list + count together → embedded `unreadCount` avoids double round-trip), (2) the header badge which polls every 30–60 seconds without opening the panel (needs count only → dedicated lightweight endpoint avoids loading full list data). Both consumers are real and have different data needs. Principle V allows the extra endpoint because of these two distinct use cases.

**Alternatives considered**:
- Only embed unreadCount in list, no separate endpoint → Rejected: forces the badge to load full paginated list on every poll; wasteful and heavier than necessary
- Only separate endpoint, no embedded count → Rejected: notification panel must make two requests on open; double round-trip degrades UX

---

## Decision 7: Hard delete for notifications (no soft-delete)

**Decision**: `DELETE /my/notifications/:id` and `DELETE /my/notifications/all` perform hard deletes. No `deletedAt` column, no soft-delete.

**Rationale**: Notifications are ephemeral UX artifacts, not business records. Soft-delete adds complexity (filter in every query, extra index, migration) with no benefit — there is no undo use case and no audit requirement for deleted notifications. The `intake_matches` table already provides the authoritative record of what matched.

**Alternatives considered**:
- Soft-delete with `deletedAt` → Rejected: requires migration, extra query filters everywhere, violates Principle V (no extra complexity without real need)
- No delete at all → Rejected: inbox grows indefinitely; poor UX; user explicitly requested dismiss functionality
