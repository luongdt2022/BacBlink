# Tasks: Notification Center

**Input**: Design documents from `/specs/007-notification-center/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: No test tasks generated — not requested in the specification.

**Organization**: Tasks are grouped by user story (US1 → US2 → US3). New files are created before the Sidebar is modified.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3])

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the feature slice directory structure and shared utilities that all stories depend on.

- [x] T001 Create directory structure `src/features/notifications/api/`, `src/features/notifications/hooks/`, `src/features/notifications/utils/`, `src/features/notifications/components/` (create empty placeholder files or directories as needed)
- [x] T002 [P] Create `src/features/notifications/utils/formatRelativeTime.ts`: export `formatRelativeTime(isoString: string): string` — returns "vừa xong" if <60s ago, "N phút trước" if <60min, "N giờ trước" if <24h, "N ngày trước" if <7d, else "DD/MM/YYYY" (use `new Date(isoString)` and `Date.now()` for calculations, no external date library)
- [x] T003 [P] Create `src/features/notifications/api/notification.ts`: define and export `Notification` interface (`id: string`, `type: 'MATCH_FOUND'`, `payload: MatchFoundPayload`, `isRead: boolean`, `createdAt: string`), `MatchFoundPayload` interface (`message`, `navigationPath`, `intakeId`, `intakeTitle`, `matchCount`), and `NotificationListResponse` interface (`data: Notification[]`, `total`, `page`, `limit`, `totalPages`, `unreadCount`); import `getAuthHeaders` from `@/services/api/client`; declare `const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'` and `const API_BASE_PATH = '/api/v1'` at the bottom of the file (same pattern as `src/features/intakes/api/intake.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Complete all API functions and the polling hook. All user stories depend on these.

**⚠️ CRITICAL**: T005–T007 (panel and sidebar) cannot begin until T004 is complete.

- [x] T004 Complete all 6 API functions in `src/features/notifications/api/notification.ts`:
  - `getUnreadCount(): Promise<number>` — `GET ${API_BASE}${API_BASE_PATH}/my/notifications/unread-count`, returns `json.unreadCount`, throws on non-ok
  - `getNotifications(): Promise<NotificationListResponse>` — `GET .../my/notifications?page=1&limit=20`, returns full response object, throws on non-ok
  - `markRead(id: string): Promise<void>` — `PATCH .../my/notifications/${id}/read`, throws on non-ok
  - `markAllRead(): Promise<void>` — `PATCH .../my/notifications/read-all`, throws on non-ok
  - `deleteNotification(id: string): Promise<void>` — `DELETE .../my/notifications/${id}`, throws on non-ok
  - `deleteAllNotifications(): Promise<void>` — `DELETE .../my/notifications/all`, throws on non-ok
  - All use `method`, `headers: getAuthHeaders()` pattern; `getAuthHeaders()` already returns `Content-Type: application/json` + `Authorization: Bearer <token>`

- [x] T005 Create `src/features/notifications/hooks/useNotificationPolling.ts`: export `useNotificationPolling(): { unreadCount: number }` — uses `useState(0)` for `unreadCount`, `useEffect` that calls `getUnreadCount()` immediately on mount and then every 10 000 ms via `setInterval`; on error silently catches and retains last count; clears interval on unmount with `return () => clearInterval(intervalId)`

**Checkpoint**: API layer + polling hook complete — US1, US2, US3 implementation can now begin

---

## Phase 3: User Story 1 — Unread Badge in Sidebar (Priority: P1) 🎯 MVP

**Goal**: Bell icon with red badge in the sidebar, auto-updating every 10 seconds via polling.

**Independent Test**: Log in → see Bell icon in sidebar between nav menu and user profile → trigger matching job on backend → wait ≤10 seconds → badge appears with correct count → with zero unread count the badge is hidden entirely.

### Implementation for User Story 1

- [x] T006 [US1] Modify `src/shared/components/navigation/Sidebar.tsx`: add `Bell` to the lucide-react import line; add imports for `useNotificationPolling` from `@/features/notifications/hooks/useNotificationPolling`; add `useState` for `showNotifications: boolean` (initial `false`); add a second `useRef<HTMLDivElement>(null)` named `notificationPanelRef`; add a second `useEffect` click-outside handler for `notificationPanelRef` (same pattern as the existing `userMenuRef` handler, setting `setShowNotifications(false)`); call `const { unreadCount } = useNotificationPolling()` inside the component body

- [x] T007 [US1] In `src/shared/components/navigation/Sidebar.tsx` JSX, insert the Bell button block between the closing `</nav>` tag and the opening `<div className="relative border-t border-[#e5e7eb] p-4"` of the user profile section:
  ```tsx
  <div className="relative border-t border-[#e5e7eb] px-3 py-2" ref={notificationPanelRef}>
    <button
      onClick={() => setShowNotifications(!showNotifications)}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#f3f4f6]"
    >
      <div className="relative">
        <Bell className="size-5 text-[#4b5563]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      <span className="text-sm text-[#4b5563]">Thông báo</span>
    </button>
  </div>
  ```

**Checkpoint**: Bell icon with badge visible in sidebar; badge updates every 10s; hidden when count = 0. Testable via quickstart.md §1–2.

---

## Phase 4: User Story 2 — Notification Panel (Priority: P2)

**Goal**: Click Bell → panel opens to the right of sidebar showing up to 20 notifications newest-first, with read/unread distinction, click-to-navigate, and click-outside-to-close.

**Independent Test**: Open panel → notifications listed newest-first → unread items show blue dot → clicking a notification item marks it read (dot disappears) + navigates to notification's link → clicking outside closes panel → empty state shown when no notifications.

### Implementation for User Story 2

- [x] T008 [US2] Create `src/features/notifications/components/NotificationPanel.tsx`:
  - Props: `{ onClose: () => void; onUnreadChange: (delta: number) => void }`
  - State: `notifications: Notification[]`, `isLoading: boolean` (initial `true`), `confirmDeleteAll: boolean` (initial `false`)
  - On mount: call `getNotifications()`, set `notifications` from `response.data`, set `isLoading(false)`
  - Render a panel positioned absolutely to the right of the sidebar: `className="absolute left-full top-0 z-50 ml-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl"` with `style={{ maxHeight: '80vh', overflowY: 'auto' }}`
  - Panel header: `<div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">` containing `<h3 className="font-semibold text-gray-900 text-sm">Thông báo</h3>` and a button "Đánh dấu tất cả đã đọc" `className="text-xs text-primary hover:underline"` (calls `handleMarkAllRead`)
  - Loading state: render 3 skeleton rows `<div className="h-16 animate-pulse bg-gray-100 rounded-lg m-3" />`
  - Empty state (when `!isLoading && notifications.length === 0`): centered `<Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />` + `<p className="text-sm text-gray-500 text-center">Chưa có thông báo nào</p>` inside `<div className="py-10 px-4">`
  - Notification list: map `notifications` to items (see T009)
  - Panel footer: `<div className="border-t border-gray-100 px-4 py-2">` with "Xóa tất cả" / confirm UI (see T010)
  - Import `useNavigate` from `react-router-dom` for navigation on item click

- [x] T009 [US2] In `NotificationPanel.tsx`, implement `handleMarkSingleRead(notification: Notification)` (optimistic: set `isRead=true` on item, call `onUnreadChange(-1)` if was unread, call `markRead(id)`, on error revert and show `toast.error`); implement notification item JSX inside the list map:
  ```tsx
  <div
    key={n.id}
    onClick={() => handleItemClick(n)}
    className={`flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
  >
    <div className="mt-1.5 shrink-0">
      {!n.isRead
        ? <div className="h-2 w-2 rounded-full bg-blue-500" />
        : <div className="h-2 w-2 rounded-full bg-transparent" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm leading-snug ${!n.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
        {n.payload.message}
      </p>
      <p className="mt-0.5 text-xs text-gray-400">{formatRelativeTime(n.createdAt)}</p>
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); handleDelete(n); }}
      className="shrink-0 rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  </div>
  ```
  `handleItemClick(n)`: call `handleMarkSingleRead(n)`, then `navigate(n.payload.navigationPath ?? '/intakes')`, then `onClose()`; import `X` from `lucide-react`

- [x] T010 [US2] In `NotificationPanel.tsx`, implement:
  - `handleMarkAllRead()`: optimistic — set all `isRead=true`, count how many were unread → call `onUnreadChange(-unreadWas)`, call `markAllRead()`, on error revert all + `toast.error`
  - `handleDelete(n: Notification)`: optimistic — remove from list, if `!n.isRead` call `onUnreadChange(-1)`, call `deleteNotification(n.id)`, on error re-insert + `toast.error`
  - `handleDeleteAll()`: when `confirmDeleteAll === false` set `setConfirmDeleteAll(true)` and auto-reset after 4000ms; when confirmed: optimistic — count unread, clear list, call `onUnreadChange(-unreadCount)`, call `deleteAllNotifications()`, on error restore + `toast.error`, finally `setConfirmDeleteAll(false)`
  - Footer JSX: `{!confirmDeleteAll ? <button onClick={handleDeleteAll} className="text-xs text-gray-400 hover:text-red-500">Xóa tất cả</button> : <span className="flex items-center gap-2 text-xs"><span className="text-red-500">Xác nhận xóa tất cả?</span><button onClick={handleDeleteAll} className="font-medium text-red-500 hover:underline">Xác nhận</button><button onClick={() => setConfirmDeleteAll(false)} className="text-gray-400 hover:underline">Hủy</button></span>}`

- [x] T011 [US2] In `src/shared/components/navigation/Sidebar.tsx`, add the `NotificationPanel` import from `@/features/notifications/components/NotificationPanel` and render it conditionally inside the notification `<div ref={notificationPanelRef}>` block (below the Bell button): `{showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} onUnreadChange={(delta) => {/* update local count via setter */}} />}`; also pass a local `setUnreadCount` state setter — switch from reading `unreadCount` directly from the hook to using a local `const [badgeCount, setBadgeCount] = useState(0)` state that is set by the polling hook's value on each poll tick (via a `useEffect` that watches the polled value) and also adjusted by `onUnreadChange` delta for immediate panel-driven updates

**Checkpoint**: US2 complete — panel opens, items listed with read/unread styling, click-to-navigate, click-outside-closes. Testable via quickstart.md §3–5, §9.

---

## Phase 5: User Story 3 — Mark Read & Delete (Priority: P3)

**Goal**: Full inbox management — mark all read, delete individual, clear all with confirmation.

**Independent Test**: Open panel with multiple unread items → "Đánh dấu tất cả đã đọc" → all dots disappear + badge = 0 → hover item → × delete → item removed → "Xóa tất cả" → confirm → empty state.

### Implementation for User Story 3

**Note**: All US3 handlers (`handleMarkAllRead`, `handleDelete`, `handleDeleteAll`) are already implemented as part of T010 in the panel component. This phase validates that the UI controls that trigger them are properly wired up and visible.

- [x] T012 [US3] Verify in `src/features/notifications/components/NotificationPanel.tsx` that the "Đánh dấu tất cả đã đọc" header button is visible and calls `handleMarkAllRead`; that each notification item renders the `×` delete button and calls `handleDelete(n)` on click with `e.stopPropagation()`; and that the footer renders the "Xóa tất cả" / confirm flow correctly — fix any issues found; import `toast` from `sonner` for error toasts if not already imported

**Checkpoint**: US3 complete — all management actions work with optimistic updates. Testable via quickstart.md §5–8.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation

- [x] T013 Run `npm run lint` and confirm no errors in all modified/created files
- [x] T014 Validate scenarios §1–10 in `specs/007-notification-center/quickstart.md` manually against the running app

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup — T001–T003, parallel)
  └─► Phase 2 (T004 API functions, T005 polling hook — sequential within phase)
        └─► Phase 3 (US1: T006–T007 Sidebar Bell + badge)
              └─► Phase 4 (US2: T008–T011 NotificationPanel)
                    └─► Phase 5 (US3: T012 verify panel wiring)
                          └─► Phase 6 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: Depends on T005 (polling hook). No dependency on US2/US3.
- **US2 (P2)**: Depends on T004 (API), T006–T007 (Bell must exist to anchor panel). Cannot start before US1.
- **US3 (P3)**: Structurally implemented in T010; T012 is a verification step. Depends on US2 panel existing.

### Within Each Story

- T002 + T003 can run in parallel (different files, no dependency)
- T004 (API bodies) must follow T003 (type definitions)
- T005 (hook) must follow T004 (uses `getUnreadCount`)
- T006 → T007 sequential (same file)
- T008 → T009 → T010 sequential (same file, progressive completion)
- T011 must follow T008–T010 (imports NotificationPanel into Sidebar)

### Parallel Opportunities

- T002 + T003 in Phase 1 can run in parallel (different files)
- T013 (lint) + T014 (manual QA) can run together

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 — Create directory structure
2. T002 + T003 — Utilities + API types (parallel)
3. T004 — API function bodies
4. T005 — Polling hook
5. T006 + T007 — Sidebar Bell icon + badge
6. **STOP and VALIDATE**: Bell visible, badge updates every 10s — quickstart.md §1–2
7. Ship US1 as MVP

### Incremental Delivery

1. T001–T005 → Foundation ready (API + polling)
2. T006–T007 → US1 live (Bell + badge) — **MVP**
3. T008–T011 → US2 live (panel + navigation)
4. T012 → US3 verified (all management actions)
5. T013–T014 → Lint + manual QA

### Files Changed Summary

| File | Action | Tasks |
|------|--------|-------|
| `src/features/notifications/api/notification.ts` | **CREATE** | T003, T004 |
| `src/features/notifications/hooks/useNotificationPolling.ts` | **CREATE** | T005 |
| `src/features/notifications/utils/formatRelativeTime.ts` | **CREATE** | T002 |
| `src/features/notifications/components/NotificationPanel.tsx` | **CREATE** | T008, T009, T010, T012 |
| `src/shared/components/navigation/Sidebar.tsx` | **MODIFY** | T006, T007, T011 |

---

## Notes

- [P] tasks in Phase 1 touch different files — safe to run in parallel
- `Bell` and `X` are in `lucide-react` (already installed) — no new packages needed
- `toast` from `sonner` is already used in this project — no new packages needed
- `useNavigate` from `react-router-dom` is already used in this project
- Panel position `left-full ml-2` places it flush against the sidebar's right edge; adjust `top` offset if needed to align with the Bell button vertically
- The `onUnreadChange` callback in T011 enables the Sidebar to immediately reflect user actions (mark read/delete) without waiting for the next poll cycle
- Unread count badge caps at "99+" to avoid wide badge on high counts
