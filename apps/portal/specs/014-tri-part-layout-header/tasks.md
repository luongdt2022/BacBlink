# Tasks: Implement Tri-Part Layout with Top Header

**Input**: Design documents from `specs/014-tri-part-layout-header/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and layout tokens

- [x] T001 [P] Define `--header-height` CSS variable in `src/styles/theme.css`
- [x] T002 [P] Create the boilerplate for `src/shared/components/layout/TopHeader.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Extract user menu logic (useAuth, useApp, refs) from `src/shared/components/navigation/Sidebar.tsx` into a reusable hook or shared logic
- [x] T004 [P] Extract notification logic (useNotificationPolling, refs) from `src/shared/components/navigation/Sidebar.tsx`
- [x] T005 Update `src/shared/components/layout/DashboardLayout.tsx` to accept the 3-part layout structure (Sidebar, Header, Content)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Global Identity Access (Priority: P1) 🎯 MVP

**Goal**: Move user identity and menu to the top header for persistent access.

**Independent Test**: Navigate to any page and verify the user profile (avatar/name) is present in the top-right header area and functional.

### Implementation for User Story 1

- [x] T006 [P] [US1] Implement user profile dropdown in `src/shared/components/layout/TopHeader.tsx`
- [x] T007 [US1] Remove user profile section and bottom menu from `src/shared/components/navigation/Sidebar.tsx`
- [x] T008 [US1] Wire up logout and password change actions in the new `TopHeader` user menu

**Checkpoint**: User identity is now accessible via the Top Header.

---

## Phase 4: User Story 2 - Persistent Notification Access (Priority: P1)

**Goal**: Move the notification bell to the top header for better visibility and access.

**Independent Test**: Click the bell icon in the header and verify the notification panel opens and displays the correct badge count.

### Implementation for User Story 2

- [x] T009 [P] [US2] Implement notification bell and badge in `src/shared/components/layout/TopHeader.tsx`
- [x] T010 [US2] Remove notification bell section from `src/shared/components/navigation/Sidebar.tsx`
- [x] T011 [US2] Integrate `NotificationPanel` with the header bell icon using appropriate refs

**Checkpoint**: Notifications are now persistently available in the Top Header.

---

## Phase 5: User Story 3 - Unified Tri-Part Responsive Layout (Priority: P2)

**Goal**: Seamless sidebar, header, and content coordination across devices.

**Independent Test**: Resize browser to mobile view and verify the "Hamburger" menu in the header opens the sidebar drawer.

### Implementation for User Story 3

- [x] T012 [US3] Move the mobile menu toggle (Hamburger) from the content area/sidebar to `src/shared/components/layout/TopHeader.tsx`
- [x] T013 [US3] Update `src/shared/components/layout/DashboardLayout.tsx` to handle fixed header positioning and content scroll offsets
- [x] T014 [US3] Adjust Sidebar drawer z-index and overlay to coordinate with the new Header

**Checkpoint**: The tri-part layout is fully responsive and visually cohesive.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks and cleanup.

- [x] T015 Audit z-index across Header, Sidebar, and Modals to prevent overlap issues
- [x] T016 Refine Header shadow and blur effects in `src/styles/theme.css` or `src/shared/components/layout/TopHeader.tsx`
- [x] T017 Run `npm run build` to verify no regressions in the layout refactor

---

## Dependencies & Execution Order

... (rest of file)
