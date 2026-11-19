# Feature Specification: Implement Tri-Part Layout with Top Header

**Feature Branch**: `014-tri-part-layout-header`  
**Created**: 2026-05-14  
**Status**: Draft  
**Input**: User description: "mình giờ muốn đổi layout 1 chút giờ sẽ bao gồm 3 phần thay vì 2 phần như cũ nhé, giờ sẽ có sidebar + content và header(mới) sẽ có phần thông báo và tài khoản nằm trên header"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Global Identity Access (Priority: P1)

As a user, I want my account information and profile actions to be visible at the top of every page so that I can easily verify my identity and access settings regardless of the vertical scroll position.

**Why this priority**: Moving the user menu to the top header is a fundamental shift in the layout structure and user identity placement.

**Independent Test**: Can be tested by navigating to any page and verifying the user profile (avatar/name) is present in the top-right header area.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they view any dashboard page, **Then** a top header must be visible containing their avatar and name.
2. **Given** the top header is visible, **When** a user clicks on the account section, **Then** a dropdown menu with profile, settings, and logout actions must appear.

---

### User Story 2 - Persistent Notification Access (Priority: P1)

As a user, I want the notification bell to be located in the top header so that I can monitor alerts while interacting with the main content area.

**Why this priority**: Notifications are a primary global action and should be separated from navigation items in the sidebar.

**Independent Test**: Can be tested by clicking the bell icon in the header and verifying the notification panel opens.

**Acceptance Scenarios**:

1. **Given** a user is on the Intakes page, **When** they look at the top header, **Then** they should see a notification bell icon.
2. **Given** there are unread notifications, **When** the user views the header, **Then** the bell icon should display a numeric badge.

---

### User Story 3 - Unified Tri-Part Responsive Layout (Priority: P2)

As a user, I want the sidebar, header, and content areas to work together seamlessly across different screen sizes so that the application remains usable on mobile and desktop.

**Why this priority**: Essential for maintaining a professional and functional UX across devices.

**Independent Test**: Can be tested by resizing the browser window and verifying the header adapts (e.g., handles the mobile menu toggle).

**Acceptance Scenarios**:

1. **Given** a desktop screen, **When** the sidebar is expanded, **Then** the header should span the remaining width and stay fixed at the top.
2. **Given** a mobile device, **When** the app is loaded, **Then** the header should contain the mobile menu toggle, and the sidebar should be hidden by default.

---

### Edge Cases

- **Mobile View**: Does the header stay fixed or scroll? (Fixed is preferred for quick access to notifications).
- **Long Content**: Ensure the main content area has the correct top margin/padding to account for the fixed header height.
- **Sidebar Collapse**: Does the header width adjust when the sidebar is collapsed?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement a `TopHeader` component containing the user menu and notification bell.
- **FR-002**: System MUST update `DashboardLayout` to include the `TopHeader` in a 3-part layout (Sidebar + Header + Content).
- **FR-003**: System MUST remove the user profile section and notification bell from the `Sidebar` component.
- **FR-004**: Top Header MUST remain fixed at the top of the viewport during scrolling.
- **FR-005**: System MUST ensure the notification badge count is synchronized between the global state and the new header icon.
- **FR-006**: On mobile view, the Header MUST include the trigger button for the Sidebar drawer.

### Key Entities *(include if feature involves data)*

- **Layout State**: Controls whether the header is fixed and the offset for the main content area.
- **Notification State**: Needs to be shared or accessible by the new Header component.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User menu and Notifications are migrated from the Sidebar to the Top Header.
- **SC-002**: Vertical real estate in the Sidebar is increased by removing account/utility blocks.
- **SC-003**: 100% of pages wrapped in DashboardLayout display the new 3-part structure.
- **SC-004**: Zero layout shifts (CLS) when the header loads or when the sidebar is toggled.

## Assumptions

- **Component Reuse**: We will reuse existing `NotificationPanel` and `DropdownMenu` components in the new header.
- **Z-Index**: The header will have a high z-index to stay above content but below modals.
- **Height**: The header height will be consistent (e.g., 64px or 72px) to allow for predictable content padding.
