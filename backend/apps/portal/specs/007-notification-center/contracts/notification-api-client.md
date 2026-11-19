# API Client Contract: Notification Center

**Source**: Backend spec `011-notification-system/contracts/notification-api.md`
**Base path**: `${API_BASE}${API_BASE_PATH}/my/notifications`
**Auth**: All requests require `Authorization: Bearer <token>` (via `getAuthHeaders()`)

---

## 1. GET /my/notifications/unread-count

**Purpose**: Lightweight badge polling endpoint — called every 10 seconds.

**Request**: No body, no query params.

**Response 200**:
```json
{ "unreadCount": 3 }
```

**Frontend usage**: `getUnreadCount()` → returns `number`

---

## 2. GET /my/notifications

**Purpose**: Fetch notification list for the panel (on-demand, not polled).

**Query params**:
- `page=1` (default)
- `limit=20` (default; panel shows max 20)
- `isRead` (optional filter — not used by panel; panel shows all)

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "MATCH_FOUND",
      "payload": {
        "message": "System found 5 matching partner intakes for your intake \"IP Title\".",
        "navigationPath": "/intakes/uuid/matches",
        "intakeId": "uuid",
        "intakeTitle": "IP Title",
        "matchCount": 5
      },
      "isRead": false,
      "createdAt": "2026-04-01T10:00:00.000Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "unreadCount": 3
}
```

**Frontend usage**: `getNotifications()` → returns `Notification[]`

---

## 3. PATCH /my/notifications/:id/read

**Purpose**: Mark a single notification as read (called when user clicks notification item).

**Request**: No body.

**Response 200**:
```json
{ "id": "uuid", "isRead": true }
```

**Frontend usage**: `markRead(id)` — fire-and-forget after optimistic update

---

## 4. PATCH /my/notifications/read-all

**Purpose**: Mark all notifications as read.

**Request**: No body.

**Response 200**:
```json
{ "updatedCount": 3 }
```

**Frontend usage**: `markAllRead()` — called by "Đánh dấu tất cả đã đọc" button

---

## 5. DELETE /my/notifications/:id

**Purpose**: Delete a single notification.

**Response 204**: No body.

**Frontend usage**: `deleteNotification(id)` — called by × icon on notification item

---

## 6. DELETE /my/notifications/all

**Purpose**: Clear all notifications in the user's inbox.

**Response 204**: No body.

**Frontend usage**: `deleteAllNotifications()` — called after inline confirm in "Xóa tất cả"

---

## Error Handling

| Status | Meaning | Frontend action |
|--------|---------|-----------------|
| 401 | Unauthenticated | Ignore silently (user may have logged out) |
| 404 | Notification not found (own) | Revert optimistic update, show error toast |
| 5xx | Server error | Revert optimistic update, show error toast |
