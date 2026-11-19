# Feature Specification: Notification Center

**Feature Branch**: `007-notification-center`
**Created**: 2026-04-01
**Status**: Draft
**Input**: User description: "Tạo màn hình thông báo notification cho người dùng — hiển thị badge số thông báo chưa đọc trên sidebar, dropdown panel danh sách thông báo, đánh dấu đã đọc, xóa thông báo, polling vài giây"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unread Badge in Sidebar (Priority: P1)

A logged-in user can always see how many unread notifications they have, without navigating anywhere. A badge showing the unread count appears on the Bell icon in the sidebar navigation. The count refreshes automatically every 10 seconds so the user stays informed without manual refreshing.

**Why this priority**: Awareness is the foundation — users must know notifications exist before they can act on them. This is the entry point for all other notification interactions and can be shipped as a standalone MVP.

**Independent Test**: Log in → confirm a Bell icon with a badge appears in the sidebar → trigger a matching job on the backend that produces a notification → wait up to 10 seconds → confirm the badge count increments. With zero unread notifications the badge is hidden (not showing "0").

**Acceptance Scenarios**:

1. **Given** the user is logged in and has unread notifications, **When** any page is loaded or after a polling interval (≤10 seconds), **Then** the Bell icon in the sidebar shows a numeric badge with the unread count.
2. **Given** the user has zero unread notifications, **When** the page loads, **Then** no badge is shown on the Bell icon (clean state, no "0" badge).
3. **Given** the user is not logged in, **When** the page loads, **Then** no Bell icon or badge is displayed.
4. **Given** the backend is unreachable, **When** the polling request fails, **Then** the badge retains its last known count and no error is shown to the user.

---

### User Story 2 - Notification Panel (Dropdown) (Priority: P2)

A user clicks the Bell icon in the sidebar and a notification panel slides open (as a dropdown or side panel), listing their most recent notifications in reverse chronological order. Each notification shows the message text, relative time (e.g., "5 phút trước"), and a visual distinction between read and unread items (unread items appear bold or with a colored indicator). The panel shows up to 20 notifications at a time.

**Why this priority**: Without a panel, the badge count alone is useless. Viewing notifications is the primary user action.

**Independent Test**: Have at least one unread notification → click the Bell icon → panel opens within 300ms → notification items are listed (newest first) → unread items are visually distinct from read items → clicking outside the panel closes it.

**Acceptance Scenarios**:

1. **Given** the user clicks the Bell icon, **When** the panel opens, **Then** notifications appear sorted newest-first, with message text, type label (e.g., "Kết quả phù hợp"), and relative timestamp.
2. **Given** the panel is open and has unread items, **When** a user views the panel, **Then** unread notifications have a visible visual distinction (e.g., blue dot indicator or bold text) compared to read ones.
3. **Given** the panel is open, **When** the user clicks anywhere outside the panel, **Then** the panel closes.
4. **Given** the user has no notifications, **When** the panel opens, **Then** an empty state message is shown: "Chưa có thông báo nào".
5. **Given** the panel is open, **When** the user clicks a notification item, **Then** the notification is marked as read and the user is navigated to the relevant page (e.g., the intake's matches page).

---

### User Story 3 - Mark as Read & Delete Notifications (Priority: P3)

A user can manage their notification inbox: mark individual notifications as read, mark all as read at once, delete individual notifications, and clear the entire inbox. These actions update the panel in real time (optimistic UI — no full reload needed).

**Why this priority**: Inbox management lets users keep their notification list tidy and meaningful. Depends on the panel being functional (US2).

**Independent Test**: Open the panel with multiple unread notifications → click "Đánh dấu tất cả đã đọc" → confirm all items change to read state and the badge disappears → hover over a notification → click the delete icon → confirm the item is removed from the list.

**Acceptance Scenarios**:

1. **Given** the panel is open with unread notifications, **When** the user clicks "Đánh dấu tất cả đã đọc", **Then** all notifications switch to read state and the sidebar badge resets to zero.
2. **Given** the panel is open, **When** the user clicks the delete (×) icon on a notification, **Then** that notification is immediately removed from the panel.
3. **Given** the panel is open, **When** the user clicks "Xóa tất cả", **Then** the panel shows the empty state after confirmation.
4. **Given** a user clicks on a notification item (navigates to linked page), **When** the navigation happens, **Then** that notification is automatically marked as read.

---

### Edge Cases

- What if the backend returns more than 20 notifications? → Only the first 20 (page 1, limit 20) are shown; the panel does not paginate.
- What if a notification's `navigationPath` is not recognized or the target page does not exist? → Clicking the notification still marks it as read but navigates to `/intakes` as a safe fallback.
- What if the unread count jumps from 0 to N while the panel is already open? → The panel does not auto-refresh its list while open; it refreshes when re-opened.
- What if a delete request fails? → The item is restored in the panel (revert optimistic update) and a brief error toast is shown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A Bell icon MUST be displayed in the sidebar navigation for all authenticated users.
- **FR-002**: An unread count badge MUST appear on the Bell icon when the user has one or more unread notifications; it MUST be hidden when the count is zero.
- **FR-003**: The unread count MUST be refreshed automatically every 10 seconds without any user action.
- **FR-004**: Clicking the Bell icon MUST open a notification panel showing the most recent 20 notifications (newest-first).
- **FR-005**: Each notification item in the panel MUST display: message text, relative time, and a read/unread visual indicator.
- **FR-006**: Unread and read notifications MUST be visually distinguishable in the panel.
- **FR-007**: Clicking a notification item MUST mark it as read and navigate the user to the URL specified in the notification's link field.
- **FR-008**: The panel MUST show an empty-state message ("Chưa có thông báo nào") when there are no notifications.
- **FR-009**: The panel MUST close when the user clicks outside it.
- **FR-010**: Users MUST be able to mark all notifications as read via a single action ("Đánh dấu tất cả đã đọc").
- **FR-011**: Users MUST be able to delete individual notifications.
- **FR-012**: Users MUST be able to clear all notifications via a single action ("Xóa tất cả") with a confirmation prompt.
- **FR-013**: After clicking a notification that includes a navigation link, the app MUST navigate to that page.
- **FR-014**: If the backend is unreachable during polling, the last known badge count MUST be retained and no error must be displayed to the user.

### Key Entities

- **Notification**: A system-generated event record belonging to a user; has a message, type, read/unread state, timestamp, and an optional navigation path.
- **Unread Count**: A lightweight counter derived from the user's notifications; used exclusively for the badge display.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The unread badge count updates within 10 seconds of a new notification being created for the user — without any manual page refresh.
- **SC-002**: The notification panel opens and displays items within 300 milliseconds of clicking the Bell icon.
- **SC-003**: Users can view, act on (mark read / delete), and navigate from a notification in under 3 interactions (click bell → click action).
- **SC-004**: Zero unread notifications produces a clean sidebar with no badge visible — no "0" clutter.
- **SC-005**: All management actions (mark read, delete, clear all) reflect immediately in the panel without a full page reload.

## Assumptions

- The backend notification system (011-notification-system) is deployed and operational before this frontend feature is shipped.
- Only one notification type exists in v1: `MATCH_FOUND`. The panel shows all types with a generic card layout that can be extended.
- The notification panel is implemented as a dropdown/popover anchored to the Bell icon in the sidebar — not a separate full-screen page.
- Polling interval is set to 10 seconds as a reasonable balance between freshness and server load; this is configurable.
- The panel shows a maximum of 20 notifications without pagination (consistent with backend default limit).
- Clicking "Xóa tất cả" requires a brief in-UI confirmation (e.g., "Bạn có chắc muốn xóa tất cả thông báo?") before executing the delete-all action.
- Notification navigation paths are trusted — they point to routes within the same application.
- Admin notification management (US5 in the backend spec) is out of scope for this frontend feature — admin views are handled separately.
