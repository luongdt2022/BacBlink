# Quickstart: Notification System Validation

## Prerequisites

- NestJS app running (`npm run start:dev`)
- Redis running (BullMQ `intakes-queue` active)
- BGE-M3 and Elasticsearch running
- Feature 010 (Manual Intake Match) implemented
- Valid JWT for at least two users (User A, User B) and an admin JWT
- User A has a published + beautified intake (aiProcessedContent set)
- User B has a published + beautified intake in the same sector

---

## 1. Trigger matching and verify notification is created

```bash
# Trigger matching for User A's intake
curl -X POST http://localhost:3013/my/intakes/<user-a-intake-id>/compute-matches \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 200)**:
```json
{ "success": true, "data": { "message": "Matching has been queued" } }
```

**Wait ~10 seconds, then verify notification in DB**:
```sql
SELECT id, user_id, type, payload, is_read, created_at
FROM notifications
WHERE user_id = '<user-a-id>'
ORDER BY created_at DESC
LIMIT 5;
-- Expected: 1 row with type = 'match_found', is_read = false
-- payload.matchCount > 0, payload.navigationPath = '/intakes/<user-a-intake-id>/matches'
```

---

## 2. No notification when zero matches

**Setup**: Ensure User A's intake has NO matching partners (e.g., unique sector with no other published intakes).

```bash
curl -X POST http://localhost:3013/my/intakes/<isolated-intake-id>/compute-matches \
  -H "Authorization: Bearer <token-user-a>"
```

**Verify no new notification created**:
```sql
SELECT COUNT(*) FROM notifications
WHERE user_id = '<user-a-id>'
  AND created_at > now() - interval '30 seconds';
-- Expected: 0 (no notification for zero-match run)
```

---

## 3. List notifications (User A)

```bash
curl http://localhost:3013/my/notifications \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 200)**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "...",
        "type": "MATCH_FOUND",
        "payload": {
          "message": "System found N matching partner intakes for your intake \"...\".",
          "navigationPath": "/intakes/<intake-id>/matches",
          "intakeId": "<intake-id>",
          "intakeTitle": "...",
          "matchCount": 3
        },
        "isRead": false,
        "createdAt": "..."
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "unreadCount": 1
  }
}
```

---

## 4. Mark single notification as read

```bash
curl -X PATCH http://localhost:3013/my/notifications/<notification-id>/read \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 200)**: notification with `isRead: true`.

**Verify**: Call `GET /my/notifications` again — `unreadCount` should be 0.

---

## 5. Mark all notifications as read

**Setup**: Trigger matching twice to create 2 unread notifications.

```bash
curl -X PATCH http://localhost:3013/my/notifications/read-all \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 200)**:
```json
{ "success": true, "data": { "message": "All notifications marked as read" } }
```

**Verify**:
```sql
SELECT COUNT(*) FROM notifications
WHERE user_id = '<user-a-id>' AND is_read = false;
-- Expected: 0
```

---

## 6. User cannot access another user's notification

```bash
# User B tries to mark User A's notification as read
curl -X PATCH http://localhost:3013/my/notifications/<user-a-notification-id>/read \
  -H "Authorization: Bearer <token-user-b>"
```

**Expected (HTTP 404)**:
```json
{ "statusCode": 404, "message": "Notification with ID <id> not found" }
```

---

## 7. Unauthenticated request rejected

```bash
curl http://localhost:3013/my/notifications
```

**Expected (HTTP 401).**

---

## 8. Admin lists all notifications

```bash
curl "http://localhost:3013/admin/notifications?page=1&limit=10" \
  -H "Authorization: Bearer <admin-token>"
```

**Expected (HTTP 200)**: All notifications from all users, each record includes `userId`.

---

## 9. Admin filters by userId

```bash
curl "http://localhost:3013/admin/notifications?userId=<user-a-id>" \
  -H "Authorization: Bearer <admin-token>"
```

**Expected**: Only User A's notifications returned.

---

## 10. Non-admin blocked from admin endpoint

```bash
curl http://localhost:3013/admin/notifications \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 403).**

---

## 11. Pagination

**Setup**: Create 15+ notifications for User A (trigger matching 15 times or insert directly).

```bash
curl "http://localhost:3013/my/notifications?page=2&limit=10" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**: 5 items (or remainder), `total` ≥ 15, `totalPages` ≥ 2.

---

## 12. Filter by isRead

```bash
curl "http://localhost:3013/my/notifications?isRead=false" \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected**: Only unread notifications returned.

---

## 13. Get unread count (badge polling)

```bash
curl http://localhost:3013/my/notifications/unread-count \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 200)**:
```json
{
  "success": true,
  "data": { "count": 3 }
}
```

**Verify**: After `PATCH /my/notifications/read-all`, count returns to `0`.

---

## 14. Delete single notification

```bash
curl -X DELETE http://localhost:3013/my/notifications/<notification-id> \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 200)**:
```json
{
  "success": true,
  "data": { "message": "Notification deleted" }
}
```

**Verify**: `GET /my/notifications` no longer includes the deleted notification; total count decreases by 1.

---

## 15. Delete another user's notification returns 404

```bash
curl -X DELETE http://localhost:3013/my/notifications/<user-a-notification-id> \
  -H "Authorization: Bearer <token-user-b>"
```

**Expected (HTTP 404).**

---

## 16. Delete all notifications (clear inbox)

**Setup**: Ensure User A has at least 3 notifications.

```bash
curl -X DELETE http://localhost:3013/my/notifications/all \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 200)**:
```json
{
  "success": true,
  "data": { "message": "All notifications deleted" }
}
```

**Verify**:
```sql
SELECT COUNT(*) FROM notifications WHERE user_id = '<user-a-id>';
-- Expected: 0
```

---

## 17. Delete-all is idempotent (no notifications exist)

```bash
# Call delete-all a second time when inbox is already empty
curl -X DELETE http://localhost:3013/my/notifications/all \
  -H "Authorization: Bearer <token-user-a>"
```

**Expected (HTTP 200)** with same confirmation message — no error.

---

## Recommended test sequence

1. Set up User A (published + beautified IP intake) and User B (published + beautified Challenge intake, same sector)
2. Run `POST /my/intakes/:id/compute-matches` (User A) → wait ~10 seconds
3. Verify notification in DB (scenario 1)
4. Call `GET /my/notifications` (User A) → verify list and `unreadCount` (scenario 3)
5. Call `GET /my/notifications/unread-count` → verify badge count matches (scenario 13)
6. Call `PATCH /my/notifications/:id/read` → verify `isRead` toggles (scenario 4)
7. Run matching again, call `PATCH /my/notifications/read-all` → verify count drops to 0 (scenario 5)
8. Try cross-user access (scenarios 6, 15)
9. Call `DELETE /my/notifications/:id` → verify removed from list (scenario 14)
10. Call `DELETE /my/notifications/all` → verify inbox empty (scenario 16)
11. Call `GET /admin/notifications` and filter by userId (scenarios 8–9)
