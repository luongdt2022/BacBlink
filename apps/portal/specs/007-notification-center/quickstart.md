# Quickstart: Notification Center

## Prerequisites

- Dev server running (`npm run dev`)
- Backend running with notification system deployed (011-notification-system)
- At least one authenticated user with a published + beautified intake
- Backend worker (BullMQ) running so `compute-matches` can complete and trigger notification creation

---

## 1. Verify Bell icon appears in sidebar

Log in → navigate to any page.

**Expected**: A Bell icon is visible in the left sidebar, between the nav menu and the user profile section. If unread count = 0, no badge is shown on the Bell.

---

## 2. Verify unread badge appears after a matching job

Trigger a matching job:
```bash
curl -X POST http://localhost:3000/api/v1/my/intakes/<intake-id>/compute-matches \
  -H "Authorization: Bearer <token>"
```

Wait up to 10 seconds for the polling interval.

**Expected**: A numeric badge (e.g., "1") appears on the Bell icon without a page reload.

---

## 3. Open the notification panel

Click the Bell icon in the sidebar.

**Expected**:
- A panel opens to the right of the sidebar (overlaying the main content area)
- The most recent notification appears at the top with message text, e.g., "System found 5 matching partner intakes for your intake..."
- The notification item has a blue dot or bold text indicating it is unread
- Relative time is shown (e.g., "2 phút trước")

---

## 4. Click a notification item — mark read + navigate

Click on the notification item in the panel.

**Expected**:
- The notification's visual state changes to "read" (dot disappears, text weight normal)
- The sidebar badge decrements by 1 (or disappears if it was the last unread)
- The app navigates to the notification's target page (e.g., `/intakes/<id>/matches` or `/intakes`)

---

## 5. Mark all notifications as read

With multiple unread notifications, open the panel and click "Đánh dấu tất cả đã đọc".

**Expected**:
- All items in the panel switch to read state simultaneously (no reload)
- Sidebar badge disappears

---

## 6. Delete a single notification

Hover over a notification item in the panel → click the × (delete) icon.

**Expected**: The notification item disappears from the panel immediately (optimistic removal).

---

## 7. Clear all notifications

Click "Xóa tất cả" in the panel header.

**Expected**:
- Button label changes to "Xác nhận xóa tất cả?" with a "Hủy" option
- Clicking "Xác nhận" clears all items and shows the empty state: "Chưa có thông báo nào"
- Clicking "Hủy" reverts to the normal state

---

## 8. Empty state

Ensure no notifications exist (or clear all in step 7).

**Expected**: Panel shows "Chưa có thông báo nào" with an appropriate icon. Bell icon has no badge.

---

## 9. Close panel by clicking outside

With the panel open, click anywhere in the main content area outside the panel.

**Expected**: Panel closes.

---

## 10. Backend unreachable during polling

Stop the backend server. Wait 10+ seconds.

**Expected**: The badge retains its last known count. No error toast or visible error message is shown to the user.
