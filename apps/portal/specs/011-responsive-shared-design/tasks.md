# Tasks: Shared Responsive Web Design

**Input**: Design documents from `/specs/011-responsive-shared-design/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: No dedicated automated test tasks generated. This feature requires lint/build validation plus manual responsive quickstart checks.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Each task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish responsive scope and baseline references for implementation.

- [X] T001 Capture target screen inventory and responsive scope in `specs/011-responsive-shared-design/plan.md`
- [X] T002 Record baseline responsive validation checklist notes in `specs/011-responsive-shared-design/quickstart.md`
- [X] T003 Define shared responsive acceptance reference in `specs/011-responsive-shared-design/contracts/responsive-ui-contract.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared responsive shell and global layout rules that all user stories depend on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T004 Implement shared breakpoint/container spacing rules in `src/styles/theme.css` and `src/styles/index.css`
- [X] T005 [P] Add responsive content container behavior to `src/shared/components/layout/DashboardLayout.tsx`
- [X] T006 [P] Add mobile/tablet navigation behavior to `src/shared/components/navigation/Sidebar.tsx`
- [X] T007 Align app route-level layout assumptions for responsive shell in `src/app/router/routes.tsx`

**Checkpoint**: Shared shell and global responsive rules are ready for page-level adoption.

---

## Phase 3: User Story 1 - Use Core Screens on Mobile Without Layout Breaks (Priority: P1) 🎯 MVP

**Goal**: Make representative core screens readable and operable on small viewports without horizontal overflow.

**Independent Test**: Open `/marketplace`, `/intakes`, `/infrastructure`, and one `/services/*` page at 360px and verify no clipped primary content/actions and no horizontal scroll in primary flows.

### Implementation for User Story 1

- [X] T008 [US1] Refactor responsive stacking for search/filter/tabs/result regions in `src/features/marketplace/pages/MarketplacePage.tsx`
- [X] T009 [P] [US1] Refactor responsive list/filter/action layout in `src/features/intakes/pages/IntakesPage.tsx`
- [X] T010 [P] [US1] Refactor responsive section flow and card density in `src/features/infrastructure/pages/InfrastructurePage.tsx`
- [X] T011 [US1] Refactor responsive detail header/metadata/action placement in `src/features/intakes/pages/IntakeDetailPage.tsx`
- [X] T012 [US1] Refactor responsive page structure for service screens in `src/features/services/pages/TechExpertPage.tsx`, `src/features/services/pages/OperationExpertPage.tsx`, and `src/features/services/pages/TrainingPage.tsx`

**Checkpoint**: Core representative screens are mobile-usable and independently testable.

---

## Phase 4: User Story 2 - Keep A Consistent Visual Language Across Desktop and Responsive (Priority: P2)

**Goal**: Preserve current color/style language while adapting spacing and hierarchy across breakpoints.

**Independent Test**: Compare desktop vs mobile rendering on representative screens and verify palette, shape language, and typography hierarchy remain consistent.

### Implementation for User Story 2

- [X] T013 [US2] Define shared responsive style constraints and utility usage notes in `src/styles/theme.css`
- [X] T014 [P] [US2] Normalize color/spacing/heading hierarchy in `src/features/marketplace/pages/MarketplacePage.tsx` and `src/features/intakes/pages/IntakesPage.tsx`
- [X] T015 [P] [US2] Normalize color/spacing/heading hierarchy in `src/features/infrastructure/pages/InfrastructurePage.tsx` and `src/features/intakes/pages/IntakeDetailPage.tsx`
- [X] T016 [US2] Normalize shell-level style consistency in `src/shared/components/layout/DashboardLayout.tsx` and `src/shared/components/navigation/Sidebar.tsx`

**Checkpoint**: Responsive behavior exists without introducing a separate mobile visual theme.

---

## Phase 5: User Story 3 - Standardize A Shared Responsive Design Pattern For Future Pages (Priority: P3)

**Goal**: Establish a reusable responsive page pattern that can be applied consistently across modules.

**Independent Test**: Verify representative pages use a common container/stacking pattern and remain stable after route transitions and viewport changes.

### Implementation for User Story 3

- [X] T017 [US3] Create reusable responsive section wrapper component in `src/shared/components/layout/ResponsivePageSection.tsx`
- [X] T018 [US3] Adopt shared responsive section wrapper in `src/features/marketplace/pages/MarketplacePage.tsx` and `src/features/intakes/pages/IntakesPage.tsx`
- [X] T019 [P] [US3] Adopt shared responsive section wrapper in `src/features/infrastructure/pages/InfrastructurePage.tsx`
- [X] T020 [P] [US3] Adopt shared responsive section wrapper in `src/features/services/pages/TechExpertPage.tsx`, `src/features/services/pages/OperationExpertPage.tsx`, and `src/features/services/pages/TrainingPage.tsx`
- [X] T021 [US3] Document reusable responsive implementation pattern in `specs/011-responsive-shared-design/contracts/responsive-ui-contract.md` and `specs/011-responsive-shared-design/quickstart.md`

**Checkpoint**: Shared responsive pattern is reusable and documented for future page adoption.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all responsive stories.

- [X] T022 [P] Refine responsive empty/loading/error state readability in `src/features/marketplace/pages/MarketplacePage.tsx`, `src/features/intakes/pages/IntakesPage.tsx`, and `src/features/infrastructure/pages/InfrastructurePage.tsx`
- [X] T023 Run `npm run lint` and `npm run build` from repo root using scripts in `package.json` to validate responsive updates
- [ ] T024 Run scenarios in `specs/011-responsive-shared-design/quickstart.md` and confirm US1-US3 behavior manually

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup)
  └─► Phase 2 (Foundational)
        └─► Phase 3 (US1 - mobile usability)
              └─► Phase 4 (US2 - visual consistency)
                    └─► Phase 5 (US3 - shared responsive pattern)
                          └─► Phase 6 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: Depends on foundational shell responsiveness; delivers MVP by making representative screens usable on mobile.
- **US2 (P2)**: Depends on US1 baseline responsive behavior so style consistency is tuned on top of stable layouts.
- **US3 (P3)**: Depends on US1 and US2 because reusable pattern extraction should reflect already-validated behavior and style.

### Within Each User Story

- T008 → T011 sequence for US1 core flows, with T009 and T010 parallelizable after T008 starts
- T013 before T014-T016 for US2 because shared style constraints guide page-level normalization
- T017 before T018-T021 for US3 because wrapper and pattern must exist before broad adoption/documentation

### Parallel Opportunities

- T005 and T006 can run in parallel after T004
- T009 and T010 can run in parallel in US1
- T014 and T015 can run in parallel in US2
- T019 and T020 can run in parallel in US3
- T022 can run in parallel with T024 after implementation phases complete

---

## Parallel Example: User Story 1

```bash
Task: "Refactor responsive list/filter/action layout in src/features/intakes/pages/IntakesPage.tsx"
Task: "Refactor responsive section flow and card density in src/features/infrastructure/pages/InfrastructurePage.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Adopt shared responsive section wrapper in src/features/infrastructure/pages/InfrastructurePage.tsx"
Task: "Adopt shared responsive section wrapper in src/features/services/pages/TechExpertPage.tsx, src/features/services/pages/OperationExpertPage.tsx, and src/features/services/pages/TrainingPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE** with mobile quickstart checks on representative routes
5. Demo responsive MVP for core screens

### Incremental Delivery

1. Setup + Foundational → shared responsive shell ready
2. US1 → core mobile usability across representative pages
3. US2 → style consistency tuning across breakpoints
4. US3 → reusable responsive pattern extraction and documentation
5. Polish → lint/build plus manual quickstart verification

### Suggested MVP Scope

- Phase 1
- Phase 2
- Phase 3 (US1 only)

This scope delivers the first end-user value by removing major mobile usability blockers on high-traffic routes.

---

## Notes

- All tasks follow required checklist format with Task ID, optional `[P]`, optional `[US#]`, and explicit file paths.
- No dedicated automated test tasks were added because the specification did not request TDD or new test suites.
- Manual responsive validation in quickstart remains mandatory for acceptance.
