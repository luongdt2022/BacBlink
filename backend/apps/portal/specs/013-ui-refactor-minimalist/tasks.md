# Tasks: Refactor UI for Modern Minimalist Look

**Input**: Design documents from `specs/013-ui-refactor-minimalist/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/theme-contract.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Register Inter 4.0 font using Google Fonts in `index.html`
- [x] T002 [P] Configure font-family in `src/styles/fonts.css` and update `tailwind.config.js` if necessary

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Map NACENTECH brand color tokens to CSS variables in `src/styles/theme.css` per theme-contract.md
- [x] T004 [P] Simplify global body background by removing complex gradients in `src/styles/theme.css`
- [x] T005 Update Tailwind theme configuration to reflect new semantic variables (primary, secondary, accent)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Unified Brand Experience (Priority: P1) 🎯 MVP

**Goal**: Ensure a consistent and professional interface that reflects the NACENTECH identity across main headers and sidebars.

**Independent Test**: Navigate to the Intakes page and verify headers and active navigation items use Teal Green (#00A388).

### Implementation for User Story 1

- [x] T006 [P] [US1] Update `src/shared/components/header/PageHeader.tsx` to use the new primary brand color
- [x] T007 [P] [US1] Update `src/shared/components/navigation/` (Sidebar or MobileNav) active states to use the brand identity
- [x] T008 [P] [US1] Refactor `src/shared/components/ui/button.tsx` default styles to use Teal Green as primary
- [x] T009 [P] [US1] Update `src/shared/components/ui/badge.tsx` variants to align with the new color palette

**Checkpoint**: At this point, the primary brand identity is visible and consistent across the main navigation and action elements.

---

## Phase 4: User Story 2 - Minimalist Content Focus (Priority: P2)

**Goal**: Clean and minimalist layout with plenty of white space to improve readability and focus.

**Independent Test**: Compare the Intakes list page with the previous version; it should feel "airier" with more padding and fewer borders.

### Implementation for User Story 2

- [x] T010 [US2] Update `src/shared/components/layout/ResponsivePageSection.tsx` to increase padding and refine shadow-based separation
- [x] T011 [US2] Refactor `src/features/intakes/pages/IntakesPage.tsx` to remove unnecessary decorative borders and increase spacing in the table
- [x] T012 [P] [US2] Update `src/shared/components/ui/card.tsx` (if exists) or equivalent surface components to use the new `radius` and subtle shadow tokens
- [x] T013 [US2] Refine `IntakeTableRow` in `src/features/intakes/pages/IntakesPage.tsx` for modern minimalist typography and spacing

**Checkpoint**: The application content areas now feel clean, modern, and focused.

---

## Phase 5: User Story 3 - Modern Component Interaction (Priority: P3)

**Goal**: Modern and responsive interactive elements (hover, focus, transitions) for a cutting-edge feel.

**Independent Test**: Interact with buttons and inputs; verify smooth transitions and brand-consistent focus states.

### Implementation for User Story 3

- [x] T014 [US3] Refine hover and active states for buttons in `src/shared/components/ui/button.tsx` using brand accent colors
- [x] T015 [US3] Update focus ring and border transitions for input fields in `src/shared/components/ui/input.tsx`
- [x] T016 [P] [US3] Update interactive feedback for items in `src/shared/components/ui/dropdown-menu.tsx`
- [x] T017 [US3] Implement smooth transitions for state changes in `src/features/intakes/components/AiProcessingBadge.tsx`

**Checkpoint**: All interactive elements provide modern, responsive, and brand-aligned feedback.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure final quality.

- [x] T018 Audit all pages for WCAG 2.1 AA contrast compliance with the new palette
- [x] T019 Update `README.md` or `docs/brand-guidelines.md` with implementation details of the new UI
- [x] T020 Run `npm run build` to ensure no CSS or TypeScript regressions were introduced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Polish (Final Phase)**: Depends on completion of implemented user stories.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- Once Phase 2 is complete, US1, US2, and US3 implementation tasks marked [P] can run in parallel.
- Specifically, T006, T007, T008, T009 are all independent within US1.
- T012 is independent within US2.
- T016 is independent within US3.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Branding)
4. **STOP and VALIDATE**: Verify the "NACENTECH" feel is established.

### Incremental Delivery

1. Add User Story 2 for layout improvements.
2. Add User Story 3 for interaction refinement.
3. Each phase delivers a visible improvement to the "modern minimalist" goal.
