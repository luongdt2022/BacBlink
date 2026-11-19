# Implementation Plan: Implement Tri-Part Layout with Top Header

**Branch**: `014-tri-part-layout-header` | **Date**: 2026-05-14 | **Spec**: [specs/014-tri-part-layout-header/spec.md](specs/014-tri-part-layout-header/spec.md)
**Input**: Feature specification to evolve the dashboard layout from 2-part to 3-part (Sidebar, Top Header, Content).

## Summary

The goal is to refactor the global dashboard structure to introduce a fixed Top Header. This header will house the global identity (User Menu) and global actions (Notifications), which are currently located in the Sidebar. This change will improve navigation focus in the Sidebar and provide persistent access to user-related functions.

## Technical Context

**Language/Version**: TypeScript / React 18+  
**Primary Dependencies**: Tailwind CSS 4.x, Lucide React, Shadcn UI  
**Target Platform**: Web (Responsive)  
**Constraints**: Must maintain existing notification polling and user authentication logic.  
**Scale/Scope**: Refactoring `Sidebar`, creating `TopHeader`, and updating `DashboardLayout`.

## Constitution Check

- [x] **I. Library-First**: UI components are stored in `src/shared/components`.
- [x] **II. CLI Interface**: N/A.
- [x] **III. Test-First**: NEEDS CLARIFICATION. No test runner is currently set up.
- [x] **IV. Integration Testing**: NEEDS CLARIFICATION.

## Project Structure

### Documentation

```text
specs/014-tri-part-layout-header/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code

```text
src/
├── shared/
│   └── components/
│       ├── layout/
│       │   ├── DashboardLayout.tsx  # Update to include TopHeader
│       │   └── TopHeader.tsx        # New component
│       └── navigation/
│           └── Sidebar.tsx          # Remove profile/notification logic
└── features/
    └── notifications/
        └── components/
            └── NotificationPanel.tsx # Will be used in TopHeader
```

---

## Phase 0: Outline & Research

### Tasks

- **Task 0.1**: Audit `Sidebar.tsx` to identify all state and hooks related to notifications and user menu that need to be extracted.
- **Task 0.2**: Determine the standard height for the `TopHeader` (e.g., `h-16`) and update CSS variables in `theme.css`.
- **Task 0.3**: Research the best way to handle the Sidebar toggle button on mobile (should it stay in the Sidebar drawer or move to the Header?).

---

## Phase 1: Design & Contracts

### Tasks

- **Task 1.1**: Define the component interface for `TopHeader.tsx`.
- **Task 1.2**: Update the layout CSS contract in `theme-contract.md` to include header height and content offset.
- **Task 1.3**: Update agent context to reflect the new tri-part layout architecture.

---

## Phase 2: Implementation (Summary)

- Create `src/shared/components/layout/TopHeader.tsx`.
- Extract user/notification logic from `Sidebar.tsx` and migrate to `TopHeader.tsx`.
- Update `DashboardLayout.tsx` to render `Sidebar`, `TopHeader`, and `children` correctly using flex/grid.
- Adjust responsive styles to ensure the header stays fixed and the content scrolls underneath.
- Validate on mobile and desktop.
