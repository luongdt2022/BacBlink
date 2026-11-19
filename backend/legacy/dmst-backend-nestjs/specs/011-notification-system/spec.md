# Feature Specification: Notification System

**Feature Branch**: `011-notification-system`
**Created**: 2026-04-01
**Status**: Draft
**Input**: User description: "hệ thống cần thêm một bảng notification cho cả user và admin, lưu lại thông tin thông báo, message sẽ được khai báo trong 1 json, hiện tại đang có một loại thông báo là hệ thống đã tìm được đối tác theo intake khi thực hiện matching, khi click vào thông báo ở phía UI sẽ link tới page tương ứng nên cần lưu trữ các thông tin và bảng có thể mở rộng với nhiều loại dữ liệu khác về sau"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Receive Matching Notification (Priority: P1)

When the system completes intake matching and finds partner intakes, the intake owner receives a notification. The notification contains a structured message and a navigation link so the user can jump directly to the matched result page when they click the notification in the UI.

**Why this priority**: This is the immediate business need — the matching pipeline (feature 010) already runs asynchronously and needs a way to inform users of results. Without this, users must manually check for matches.

**Independent Test**: Can be tested by triggering a matching job and verifying that a notification record is created for the intake owner, containing the correct message payload and navigation target. Delivers value independently — users are informed of match results.

**Acceptance Scenarios**:

1. **Given** a matching job completes and finds at least one partner intake, **When** the job finishes, **Then** a notification is created for the intake owner with type `MATCH_FOUND`, a JSON payload describing the match, and a navigation link to the matches page for that intake.
2. **Given** a matching job completes and finds zero partner intakes, **When** the job finishes, **Then** no notification is created (silence is the correct response for no matches).
3. **Given** a notification is created, **When** the user opens the notification list, **Then** the notification appears as unread with the correct message and a clickable link target.

---

### User Story 2 - View and Manage Personal Notifications (Priority: P2)

A logged-in user can retrieve their personal notification list with pagination, see which notifications are unread, and mark one or all notifications as read. The notification count badge in the UI reflects the current unread count.

**Why this priority**: Listing and reading notifications is the primary consumer-facing interaction. Without this, the notification records have no UI surface.

**Independent Test**: Can be tested by seeding notifications for a user then calling the list and mark-read endpoints. Verifies unread count, pagination, and read-status toggling independently of the creation flow.

**Acceptance Scenarios**:

1. **Given** a user has 5 notifications (3 unread, 2 read), **When** they request their notification list, **Then** the response returns all 5 notifications sorted newest-first, with correct `isRead` status on each.
2. **Given** a user has unread notifications, **When** they mark a single notification as read, **Then** that notification's `isRead` becomes `true` and the unread count decreases by 1.
3. **Given** a user has multiple unread notifications, **When** they mark all as read, **Then** all notifications are updated to `isRead = true` and the unread count returns to 0.
4. **Given** a user has more than the page limit of notifications, **When** they request page 2, **Then** the correct paginated subset is returned with accurate total count.
5. **Given** a user requests another user's notification, **When** the request is processed, **Then** a 404 is returned — users can only access their own notifications.

---

### User Story 3 - Real-Time Badge Count Polling (Priority: P3)

The UI header shows a notification badge with the current unread count. It needs a dedicated lightweight endpoint to poll every 30–60 seconds without loading the full notification list (which is heavier and paginated).

**Why this priority**: The badge is always visible while browsing the app. Polling the full list for just a number is wasteful and slow. A dedicated count endpoint keeps the badge snappy with minimal payload.

**Independent Test**: Call the unread-count endpoint with a JWT token and verify it returns the correct integer count. Verify the count decreases after mark-read calls. Can be tested without loading any notification details.

**Acceptance Scenarios**:

1. **Given** a user has 4 unread notifications, **When** they call the unread-count endpoint, **Then** the response returns `{ "count": 4 }` immediately.
2. **Given** a user marks 2 notifications as read, **When** they call the unread-count endpoint again, **Then** the response returns `{ "count": 2 }`.
3. **Given** a user has no unread notifications, **When** they call the unread-count endpoint, **Then** the response returns `{ "count": 0 }`.

---

### User Story 4 - Dismiss Notifications (Priority: P4)

Users can dismiss (delete) individual notifications they no longer need, or clear their entire notification inbox in one action. This keeps the notification panel clean and reduces noise.

**Why this priority**: Without delete capability, the notification list grows indefinitely and users have no way to manage their inbox. Dismissal is standard UX for notification panels.

**Independent Test**: Seed notifications for a user, call delete-one and delete-all endpoints, verify the notifications are removed from subsequent list responses. Can be tested entirely independently.

**Acceptance Scenarios**:

1. **Given** a user has a notification, **When** they delete it by ID, **Then** the notification no longer appears in their list and the total count decreases by 1.
2. **Given** a user has 5 notifications, **When** they delete all, **Then** the list returns empty and total count is 0.
3. **Given** a user attempts to delete another user's notification, **When** the request is processed, **Then** a 404 is returned.
4. **Given** a user calls delete-all, **When** there are no notifications to delete, **Then** a 200 is returned with a confirmation message (idempotent).

---

### User Story 5 - Admin Views All Notifications (Priority: P5)

An admin can list all notifications across all users, filtered by user, type, or read status. This supports support and audit use cases.

**Why this priority**: Admin visibility is useful for debugging and support but not required for the core notification flow. Users are served first.

**Independent Test**: Can be tested independently by querying the admin notification list endpoint and applying filters. Does not depend on US1 or US2 being fully implemented — seed data suffices.

**Acceptance Scenarios**:

1. **Given** notifications exist for multiple users, **When** an admin lists all notifications, **Then** all notifications are returned with pagination and user ownership information.
2. **Given** an admin filters by `userId`, **When** the request is processed, **Then** only notifications for that user are returned.
3. **Given** a non-admin user calls the admin endpoint, **When** the request is processed, **Then** a 403 Forbidden is returned.

---

### Edge Cases

- What happens when a notification's payload references an entity that has since been deleted? The notification record remains intact (historical record), but the UI navigation link may lead to a 404 on the target page. This is acceptable behavior.
- What happens when the matching job fails before creating a notification? No notification is created — the job error is logged separately. Notification creation is a side-effect of successful matching only.
- What happens if a user's notification count grows very large (thousands)? Pagination prevents response size issues; no automatic archiving is required in v1.
- How does the system handle duplicate notifications (same intake matched again)? Each matching run creates a fresh notification; deduplication is not required in v1.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create a notification record automatically when an intake matching job completes and finds at least one partner intake.
- **FR-002**: Each notification MUST be associated with a single recipient user identified by their account.
- **FR-003**: Each notification MUST store a `type` field that identifies the notification category (e.g., `MATCH_FOUND`) to allow the UI and future code to render type-specific messages.
- **FR-004**: Each notification MUST store a structured JSON `payload` that includes at minimum: a human-readable message and a navigation path that the UI uses to route the user when the notification is clicked.
- **FR-005**: The `payload` schema MUST be extensible — future notification types can introduce different payload shapes without requiring a database migration.
- **FR-006**: Notifications MUST have a read/unread status, defaulting to unread on creation.
- **FR-007**: Authenticated users MUST be able to retrieve a paginated list of their own notifications, sorted by creation date descending.
- **FR-008**: Authenticated users MUST be able to retrieve the count of their unread notifications.
- **FR-009**: Authenticated users MUST be able to mark a single notification as read by its identifier.
- **FR-010**: Authenticated users MUST be able to mark all their notifications as read in a single operation.
- **FR-011**: Users MUST NOT be able to read, modify, or delete notifications belonging to other users.
- **FR-012**: Admin users MUST be able to list all notifications across all users with pagination and optional filters (by user, type, read status).
- **FR-013**: The notification data model MUST support future notification types without schema changes — new types are introduced by adding to the type enumeration and defining their payload shapes in application code.
- **FR-014**: Authenticated users MUST be able to retrieve their current unread notification count via a dedicated lightweight endpoint, suitable for frequent polling (e.g., to power a header badge).
- **FR-015**: Authenticated users MUST be able to permanently delete a single notification by its identifier.
- **FR-016**: Authenticated users MUST be able to permanently delete all their notifications in a single operation (clear inbox).

### Key Entities *(include if feature involves data)*

- **Notification**: A record of a system event relevant to a specific user. Key attributes: unique identifier, recipient user reference, notification type (categorized enum), structured JSON payload (message text + navigation path + type-specific data), read/unread status, creation timestamp. Relationships: belongs to one User.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After a matching job completes successfully with results, a notification appears in the recipient's list within the same job execution — no additional user action required.
- **SC-002**: Users can retrieve their notification list and unread count without noticeable delay, consistent with other list endpoints in the system.
- **SC-003**: Marking all notifications as read completes in a single request regardless of the total notification count for that user.
- **SC-004**: 100% of notifications created by the matching pipeline include a valid navigation path that the UI can use to route the user to the correct page.
- **SC-005**: The notification table supports at least 5 distinct notification types in the future without requiring a database schema change.
- **SC-006**: The unread count endpoint responds fast enough to be polled by the UI header badge without impacting other interactions.
- **SC-007**: Users can clear their entire notification inbox in a single action.

## Assumptions

- Only the `MATCH_FOUND` notification type is implemented in this feature; the schema is designed to accommodate future types without migration.
- The recipient of a `MATCH_FOUND` notification is the owner of the intake that was matched (the user whose matching job was triggered).
- Admins receive notifications through the same mechanism as regular users — as users who own intakes, not through a separate admin-only channel.
- Deletion is permanent (hard delete) — no soft-delete or undo. Users are assumed to understand dismissal is irreversible.
- Real-time push (WebSocket/SSE) is out of scope for v1; the UI reads notifications on demand via REST API.
- The navigation path stored in the payload is a frontend route string (e.g., `/intakes/:id/matches`), not an absolute URL — the UI composes the full link.
- Pagination defaults follow existing system conventions (default page size, consistent response shape).
- This feature depends on feature 010 (Manual Intake Match) being implemented — specifically the `IntakesProcessor` `COMPUTE_MATCHES` job handler, which is the designated integration point for notification creation.
