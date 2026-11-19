# API Contract: Notification System

**Feature**: 011-notification-system
**Date**: 2026-04-01

---

## User Endpoints (`/my/notifications`)

All endpoints require `JwtAuthGuard`. Users can only access their own notifications.

---

### GET /my/notifications

List the authenticated user's notifications, newest first.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page (max 100) |
| `isRead` | boolean | *(all)* | Filter by read status |
| `type` | string | *(all)* | Filter by notification type |

**Response 200**:

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "type": "MATCH_FOUND",
        "payload": {
          "message": "System found 5 matching partner intakes for your intake \"AI-Powered Diagnostics\".",
          "navigationPath": "/intakes/abc123/matches",
          "intakeId": "abc123",
          "intakeTitle": "AI-Powered Diagnostics",
          "matchCount": 5
        },
        "isRead": false,
        "createdAt": "2026-04-01T10:00:00.000Z"
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2,
    "unreadCount": 3
  }
}
```

**Notes**:
- `unreadCount` reflects the total unread count across ALL the user's notifications, not just the current page.
- Results sorted by `createdAt DESC`.

---

### PATCH /my/notifications/:id/read

Mark a single notification as read.

**Path Parameters**: `id` — notification UUID

**Response 200**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "MATCH_FOUND",
    "payload": { "..." : "..." },
    "isRead": true,
    "createdAt": "2026-04-01T10:00:00.000Z"
  }
}
```

**Response 404** — Notification not found or does not belong to the current user:

```json
{
  "statusCode": 404,
  "message": "Notification with ID {id} not found"
}
```

---

### PATCH /my/notifications/read-all

Mark all of the authenticated user's notifications as read.

**Response 200**:

```json
{
  "success": true,
  "data": {
    "message": "All notifications marked as read"
  }
}
```

---

### GET /my/notifications/unread-count

Get the authenticated user's current unread notification count. Lightweight — suitable for frequent polling to power a header badge.

**Response 200**:

```json
{
  "success": true,
  "data": {
    "count": 4
  }
}
```

**Notes**:
- Returns `0` when there are no unread notifications (never 404).
- Register this route BEFORE `/:id` routes to avoid capture conflict.

---

### DELETE /my/notifications/:id

Permanently delete a single notification.

**Path Parameters**: `id` — notification UUID

**Response 200**:

```json
{
  "success": true,
  "data": {
    "message": "Notification deleted"
  }
}
```

**Response 404** — Notification not found or does not belong to the current user:

```json
{
  "statusCode": 404,
  "message": "Notification with ID {id} not found"
}
```

---

### DELETE /my/notifications/all

Permanently delete all of the authenticated user's notifications (clear inbox).

**Response 200**:

```json
{
  "success": true,
  "data": {
    "message": "All notifications deleted"
  }
}
```

**Notes**:
- Idempotent — returns 200 even if there are no notifications to delete.
- Register this route BEFORE `/:id` routes to avoid capture conflict.

---

## Admin Endpoints (`/admin/notifications`)

All endpoints require `AdminGuard`.

---

### GET /admin/notifications

List all notifications with optional filters.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page (max 100) |
| `userId` | uuid | *(all)* | Filter by recipient user |
| `type` | string | *(all)* | Filter by notification type |
| `isRead` | boolean | *(all)* | Filter by read status |

**Response 200**:

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "userId": "user-uuid",
        "type": "MATCH_FOUND",
        "payload": { "..." : "..." },
        "isRead": false,
        "createdAt": "2026-04-01T10:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "unreadCount": null
  }
}
```

**Notes**:
- `userId` is included in each record (admin view shows ownership).
- `unreadCount` is `null` in the admin list response (not applicable for cross-user view).

---

## Internal: Notification Creation (Service-to-Service)

Notifications are never created via HTTP — they are created by `NotificationsService` called from `IntakesProcessor` after a successful matching job. No public endpoint for creation.

**Trigger**: `IntakesProcessor` → `COMPUTE_MATCHES` job → `intakesService.computeMatches()` returns `matchCount > 0` → `notificationsService.createMatchFoundNotification({ intakeId, intakeTitle, userId, matchCount })`.

---

## Notification Type Reference

| Type | Trigger | navigationPath |
|------|---------|----------------|
| `MATCH_FOUND` | Matching job completes with results | `/intakes/{intakeId}/matches` |
