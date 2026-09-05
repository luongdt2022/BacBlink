# Data Model: Notification Center

**Branch**: `007-notification-center` | **Date**: 2026-04-01

## Frontend Data Shapes

These are TypeScript interfaces derived from the backend API contract (`011-notification-system/contracts/notification-api.md`). No database changes on the frontend.

---

### Notification

```typescript
interface Notification {
  id: string;                    // UUID
  type: 'MATCH_FOUND';          // v1 only; extensible enum
  payload: MatchFoundPayload;    // JSONB from backend
  isRead: boolean;
  createdAt: string;             // ISO 8601 timestamp
}

interface MatchFoundPayload {
  message: string;               // "System found N matching partner intakes for your intake \"Title\"."
  navigationPath: string;        // "/intakes/{intakeId}/matches"
  intakeId: string;
  intakeTitle: string;           // aiProcessTitle ?? title
  matchCount: number;
}
```

---

### NotificationListResponse

Response shape from `GET /my/notifications`:

```typescript
interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;          // Embedded — avoids a second request on panel open
}
```

---

### UnreadCountResponse

Response shape from `GET /my/notifications/unread-count`:

```typescript
interface UnreadCountResponse {
  unreadCount: number;
}
```

---

## State Managed in Components

### Sidebar (after modification)

| State | Type | Purpose |
|-------|------|---------|
| `unreadCount` | `number` | From polling hook; drives badge display |
| `showNotifications` | `boolean` | Controls panel open/close |
| `notificationPanelRef` | `RefObject` | Click-outside handler for panel |

### NotificationPanel

| State | Type | Purpose |
|-------|------|---------|
| `notifications` | `Notification[]` | Fetched on panel open |
| `isLoading` | `boolean` | Shows skeleton while fetching |
| `confirmDeleteAll` | `boolean` | Inline confirmation state for "Xóa tất cả" |

---

## Polling Hook State (`useNotificationPolling`)

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `unreadCount` | `number` | `0` | Returned to Sidebar for badge |

**Interval**: 10 000 ms (10 seconds). Clears on component unmount.

---

## Optimistic Updates

| Action | Optimistic Update | Revert On Error |
|--------|-------------------|-----------------|
| Mark single read | Set `isRead = true` on item; decrement `unreadCount` | Restore previous state; show error toast |
| Mark all read | Set all `isRead = true`; set `unreadCount = 0` | Restore all; show error toast |
| Delete single | Remove item from list; decrement `unreadCount` if was unread | Re-insert item; show error toast |
| Delete all | Clear list; set `unreadCount = 0` | Restore list; show error toast |
