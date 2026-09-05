# Research: Notification Center

**Branch**: `007-notification-center` | **Date**: 2026-04-01

---

## Finding 1 — Bell icon placement: sidebar nav bar (above user profile section)

**Decision**: Add the Bell icon as a standalone button in the sidebar, positioned between the main `<nav>` menu list and the user profile section at the bottom. It sits inside the sidebar layout as a fixed element (not scrollable with the nav items).

**Rationale**: The sidebar is the persistent chrome. Users already look at the bottom of the sidebar for account-related actions (profile, settings, logout). A bell between the nav and the user zone is visually natural and doesn't disrupt menu item flow. The badge floats top-right over the bell.

**Alternatives considered**:
- Top header bar bell — no header bar exists in this app layout; the sidebar IS the chrome.
- Add to user dropdown menu — too buried; users would miss new notifications.

---

## Finding 2 — Notification panel: popover anchored to Bell in sidebar

**Decision**: Render the notification panel as a `<div>` positioned absolutely with `left-full` (to the right of the sidebar), using a `useRef` + click-outside hook (same pattern as the existing `userMenuRef` in Sidebar). No new library needed.

**Rationale**: The sidebar is `w-64` fixed. A panel opening to the right (same level as page content, overlaying it slightly) is the most discoverable UX. Same DOM architecture as the existing user menu dropdown — proven pattern in this codebase.

**Alternatives considered**:
- Full-page `/notifications` route — overkill for a notification list; adds a navigation step.
- shadcn Popover — would work but requires wrapping the Bell in a Popover trigger; the manual approach reuses the exact existing pattern and avoids an extra import.

---

## Finding 3 — Polling implementation: `useEffect` + `setInterval` in a custom hook

**Decision**: Create `src/features/notifications/hooks/useNotificationPolling.ts` that uses `useEffect` with `setInterval` (10-second interval) to call `GET /my/notifications/unread-count`. The hook is mounted in `Sidebar.tsx` and exposes `{ unreadCount }`. Panel data (`GET /my/notifications`) is fetched only when the panel is opened (lazy fetch), not polled.

**Rationale**: Polling the lightweight count endpoint every 10s is cheap (returns a single integer). The heavier list endpoint is only called on demand. This matches the user's explicit "vài giây gọi check" requirement.

**Alternatives considered**:
- Poll the full list every 10s — wasteful; panel data changes less frequently than the user cares.
- React Query `refetchInterval` — not currently used in this codebase; would introduce a new dependency.

---

## Finding 4 — API module placement: `src/features/notifications/api/notification.ts`

**Decision**: New feature slice following the existing `src/features/<name>/api/<name>.ts` convention. Exports:
- `getUnreadCount(): Promise<number>`
- `getNotifications(): Promise<Notification[]>`
- `markRead(id: string): Promise<void>`
- `markAllRead(): Promise<void>`
- `deleteNotification(id: string): Promise<void>`
- `deleteAllNotifications(): Promise<void>`

Uses `getAuthHeaders()` + `API_BASE` + `API_BASE_PATH` from `src/services/api/client.ts` — identical pattern to `src/features/intakes/api/intake.ts`.

**Alternatives considered**: Putting API calls directly in the component — rejected (no other feature does this; testability suffers).

---

## Finding 5 — NotificationPanel component placement

**Decision**: Create `src/features/notifications/components/NotificationPanel.tsx`. The `Sidebar.tsx` imports and renders it conditionally when `showNotifications === true`. The panel renders as a sibling within the sidebar's outermost relative container.

**Rationale**: Keeps Sidebar.tsx clean — the panel is self-contained. Pattern mirrors how modal components are co-located near their trigger in this codebase.

---

## Finding 6 — Relative time formatting: manual helper (no new lib)

**Decision**: Implement a simple `formatRelativeTime(isoString: string): string` helper in `src/features/notifications/utils/formatRelativeTime.ts`. Rules: <60s → "vừa xong", <60min → "N phút trước", <24h → "N giờ trước", <7d → "N ngày trước", else → DD/MM/YYYY.

**Rationale**: No date library is currently installed. `date-fns` or `dayjs` would add ~15KB for a 10-line utility. The app's existing code has no date formatting library.

---

## Finding 7 — Confirmation before "Xóa tất cả": inline confirmation state

**Decision**: When user clicks "Xóa tất cả", the button label changes to "Xác nhận xóa tất cả?" with a Cancel link next to it (2-second grace window). No modal dialog. Clicking "Xác nhận" fires `deleteAllNotifications()`. Clicking Cancel or waiting reverts.

**Rationale**: A modal dialog for a simple destructive action inside a panel is excessive. The inline confirmation pattern is cleaner and keeps the panel lightweight.

---

## Finding 8 — Files changed summary

| File | Action |
|------|--------|
| `src/features/notifications/api/notification.ts` | CREATE — 6 API functions |
| `src/features/notifications/hooks/useNotificationPolling.ts` | CREATE — polling hook |
| `src/features/notifications/utils/formatRelativeTime.ts` | CREATE — relative time helper |
| `src/features/notifications/components/NotificationPanel.tsx` | CREATE — panel component |
| `src/shared/components/navigation/Sidebar.tsx` | MODIFY — add Bell + badge + panel trigger |

No router changes needed (no new page route). No new shadcn components needed. `Bell` icon from `lucide-react` (already installed).
