# Implementation Plan: Notification Center

**Branch**: `007-notification-center` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-notification-center/spec.md`

## Summary

Add a notification center to the sidebar: a Bell icon with a polling unread-count badge (10-second interval) and a dropdown panel for viewing, reading, and deleting notifications. No new page route needed — the panel is a popover anchored to the Bell in `Sidebar.tsx`. Four new files + one modified file.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict) + React 18
**Primary Dependencies**: Tailwind CSS, shadcn/ui, lucide-react (`Bell` icon), sonner (toasts)
**Storage**: N/A — all state in-memory; no local persistence
**Testing**: Not requested
**Target Platform**: Web SPA (Vite)
**Project Type**: Frontend web application
**Performance Goals**: Badge updates within 10 seconds; panel opens in <300ms
**Constraints**: No new npm packages; no new routes; no new shadcn components
**Scale/Scope**: 4 new files + 1 modified file

## Constitution Check

Constitution file contains only template placeholders — no active project-specific gates. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/007-notification-center/
├── plan.md              ✓ (this file)
├── research.md          ✓
├── data-model.md        ✓
├── quickstart.md        ✓
├── contracts/
│   └── notification-api-client.md  ✓
└── tasks.md             (created by /speckit.tasks)
```

### Source Code

```text
src/
├── features/
│   └── notifications/                         ← NEW feature slice
│       ├── api/
│       │   └── notification.ts                ← NEW — 6 API functions
│       ├── hooks/
│       │   └── useNotificationPolling.ts      ← NEW — 10s polling hook
│       ├── utils/
│       │   └── formatRelativeTime.ts          ← NEW — relative time helper
│       └── components/
│           └── NotificationPanel.tsx          ← NEW — panel component
└── shared/
    └── components/
        └── navigation/
            └── Sidebar.tsx                    ← MODIFY — Bell + badge + panel
```

## Implementation Design

### `notification.ts` — API functions

```typescript
import { getAuthHeaders } from '@/services/api/client';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';
const API_BASE_PATH = '/api/v1';

export interface Notification { id, type, payload, isRead, createdAt }
export interface MatchFoundPayload { message, navigationPath, intakeId, intakeTitle, matchCount }
export interface NotificationListResponse { data: Notification[], total, page, limit, totalPages, unreadCount }

export async function getUnreadCount(): Promise<number>
export async function getNotifications(): Promise<NotificationListResponse>
export async function markRead(id: string): Promise<void>
export async function markAllRead(): Promise<void>
export async function deleteNotification(id: string): Promise<void>
export async function deleteAllNotifications(): Promise<void>
```

### `useNotificationPolling.ts` — Polling hook

```typescript
// Polls GET /my/notifications/unread-count every 10s
// Returns { unreadCount: number }
// Clears interval on unmount
// Silently ignores fetch errors (retains last count)
export function useNotificationPolling(): { unreadCount: number }
```

### `formatRelativeTime.ts` — Utility

```typescript
// <1min → "vừa xong"
// <60min → "N phút trước"
// <24h → "N giờ trước"
// <7d → "N ngày trước"
// else → "DD/MM/YYYY"
export function formatRelativeTime(isoString: string): string
```

### `NotificationPanel.tsx` — Panel component

Props: `{ onClose: () => void; onUnreadChange: (delta: number) => void }`

Internal state: `notifications`, `isLoading`, `confirmDeleteAll`

Layout:
```
┌─────────────────────────────────┐
│ Thông báo          [Đánh dấu tất cả đã đọc] │
├─────────────────────────────────┤
│ ● [bold] Message text           │
│   2 phút trước           [×]   │
├─────────────────────────────────┤
│   [read] Message text           │
│   1 ngày trước           [×]   │
├─────────────────────────────────┤
│ [Xóa tất cả]                   │
└─────────────────────────────────┘
```

- Blue filled circle `●` = unread indicator; absent = read
- Clicking item → `markRead(id)` (optimistic) + `navigate(payload.navigationPath)`
- `×` icon → `deleteNotification(id)` (optimistic)
- "Đánh dấu tất cả đã đọc" → `markAllRead()` (optimistic)
- "Xóa tất cả" → inline confirm → `deleteAllNotifications()` (optimistic)
- Loading: 3 skeleton rows while fetching
- Empty state: Bell icon + "Chưa có thông báo nào"

### `Sidebar.tsx` modifications

1. Import `Bell` from `lucide-react`, `useNotificationPolling` hook, `NotificationPanel` component.
2. Add `showNotifications` boolean state + `notificationPanelRef` ref.
3. Add click-outside handler for `notificationPanelRef` (same pattern as `userMenuRef`).
4. Insert Bell button between `</nav>` and the user profile `<div>`:

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

  {showNotifications && (
    <NotificationPanel
      onClose={() => setShowNotifications(false)}
      onUnreadChange={(delta) => setUnreadCount(c => c + delta)}
    />
  )}
</div>
```

5. The `unreadCount` state in Sidebar is initialized from `useNotificationPolling` and can also be adjusted by the panel via `onUnreadChange` callback for immediate badge updates on user actions.

## Complexity Tracking

No constitution violations. No complexity justification needed.
