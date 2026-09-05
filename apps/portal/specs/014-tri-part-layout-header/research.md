# Research: Tri-Part Layout Migration

## 1. Sidebar Logic Audit

The following hooks and states need to be moved from `Sidebar.tsx` to `TopHeader.tsx`:
- `useAuth()` (for user info and logout)
- `useApp()` (for change password modal)
- `useNotificationPolling()` (for badge count)
- `NotificationPanel` component usage
- `userMenuRef`, `bellButtonRef`, `panelRef` (refs for click-outside detection)
- `showUserMenu`, `showNotifications` state

## 2. Layout Constants

- **Header Height**: `64px` (4rem) is standard for modern SaaS headers.
- **Z-Index**: Header should be `z-40`, Sidebar Drawer `z-50`.

## 3. Mobile Navigation Toggle

- **Decision**: On mobile, the Header should contain the "Hamburger" menu icon to open the Sidebar drawer. This is more conventional than having the toggle floating in the content area.
