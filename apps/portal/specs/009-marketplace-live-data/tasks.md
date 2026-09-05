# Tasks: Marketplace Live Data

**Input**: Design documents from `/specs/009-marketplace-live-data/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: No dedicated automated test tasks generated — the specification did not request TDD or new test coverage.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Each task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the Marketplace page for switching from mock content to live data.

- [X] T001 Review live data requirements and current mock-driven rendering in `src/features/marketplace/pages/MarketplacePage.tsx`
- [X] T002 Review existing filter and card interfaces in `src/features/marketplace/components/MarketplaceFilters.tsx`, `src/features/marketplace/components/IPCard.tsx`, and `src/features/marketplace/components/ChallengeCard.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared live-data loading and normalization layer used by all Marketplace stories.

**⚠️ CRITICAL**: No user story work should begin until live intake records and sector options can be loaded and normalized.

- [X] T003 Modify `src/features/marketplace/pages/MarketplacePage.tsx` to replace mock datasets with page-level loading, error, and normalized-record state for live marketplace data
- [X] T004 [P] Add live data fetching in `src/features/marketplace/pages/MarketplacePage.tsx` using the existing intake and sector API clients as the page's source of truth
- [X] T005 [P] Add record normalization utilities inside `src/features/marketplace/pages/MarketplacePage.tsx` to map live intake records into the current IP and Challenge card display model, including owner/enterprise labels and sector IDs

**Checkpoint**: Marketplace can load live intake records and sector options into normalized page state.

---

## Phase 3: User Story 1 - Load Marketplace Tabs From Real Intake Data (Priority: P1) 🎯 MVP

**Goal**: Replace mock Marketplace content with live intake data and split it correctly into the IP and Challenge tabs.

**Independent Test**: Open `/marketplace` while authenticated → verify live records load → verify the IP tab only shows IP-type records and the Challenge tab only shows Challenge-type records.

### Implementation for User Story 1

- [X] T006 [US1] Update `src/features/marketplace/pages/MarketplacePage.tsx` to render the IP tab from normalized live records instead of `mockIPData`
- [X] T007 [US1] Update `src/features/marketplace/pages/MarketplacePage.tsx` to render the Challenge tab from normalized live records instead of `mockChallengeData`
- [X] T008 [US1] Add live empty-state and result-count handling in `src/features/marketplace/pages/MarketplacePage.tsx` so each tab reflects the currently visible live records
- [X] T009 [US1] Adjust `src/features/marketplace/components/IPCard.tsx` and `src/features/marketplace/components/ChallengeCard.tsx` to accept the normalized live record fields required by the new page mapping

**Checkpoint**: Marketplace tabs are backed by live data with correct type-based separation and no remaining mock result rendering.

---

## Phase 4: User Story 2 - Filter Marketplace Results By Sector (Priority: P2)

**Goal**: Drive Marketplace filtering from the live sector list and apply it to the visible live result set.

**Independent Test**: Open `/marketplace` → wait for live sector filters to load → select one or more sectors → verify result counts and visible cards update correctly in the active tab.

### Implementation for User Story 2

- [X] T010 [US2] Refactor `src/features/marketplace/components/MarketplaceFilters.tsx` so sector filter options come from props instead of hard-coded field lists
- [X] T011 [US2] Update `src/features/marketplace/pages/MarketplacePage.tsx` to pass live sector options into `IPFilters` and `ChallengeFilters`
- [X] T012 [US2] Implement sector-based filtering logic in `src/features/marketplace/pages/MarketplacePage.tsx` using live sector IDs for both the IP and Challenge tabs
- [X] T013 [US2] Add sector-filter fallback handling in `src/features/marketplace/pages/MarketplacePage.tsx` and `src/features/marketplace/components/MarketplaceFilters.tsx` so records remain usable when sector data is unavailable

**Checkpoint**: Marketplace filters are backed by live sectors and correctly narrow the visible result set.

---

## Phase 5: User Story 3 - Simplify Filters And Fallback Media (Priority: P3)

**Goal**: Remove unsupported filter dimensions from the live-data Marketplace UI and guarantee a default image when an intake has no uploaded media.

**Independent Test**: Open `/marketplace` with records missing images → confirm cards show a default image and confirm TRL, Đơn vị, Nguồn cung, and Ngân sách filters are absent.

### Implementation for User Story 3

- [X] T014 [US3] Simplify `src/features/marketplace/components/MarketplaceFilters.tsx` to remove the unsupported TRL, Đơn vị, Nguồn cung, and Ngân sách filter groups from the live-data UI
- [X] T015 [US3] Add default-image resolution in `src/features/marketplace/pages/MarketplacePage.tsx` when normalizing live records without `profilePicUrl`
- [X] T016 [US3] Update `src/features/marketplace/components/IPCard.tsx` to display the resolved default placeholder image cleanly when no live image is available
- [X] T017 [US3] Verify `src/features/marketplace/components/ChallengeCard.tsx` and `src/features/marketplace/pages/MarketplacePage.tsx` still maintain consistent layouts after unsupported filters are removed and live data replaces the mock list

**Checkpoint**: Unsupported filters are gone, and cards remain visually complete with default-image fallback.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across the live Marketplace experience.

- [X] T018 [P] Refine copy, loading, and empty-state messaging in `src/features/marketplace/pages/MarketplacePage.tsx` and `src/features/marketplace/components/MarketplaceFilters.tsx` for the live-data experience
- [X] T019 Run `npm run lint` and `npm run build` to validate the updated Marketplace page
- [ ] T020 Run the scenarios in `specs/009-marketplace-live-data/quickstart.md` and confirm US1-US3 behaviors manually

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup)
  └─► Phase 2 (Foundational)
        └─► Phase 3 (US1 - live marketplace data)
              └─► Phase 4 (US2 - live sector filters)
                    └─► Phase 5 (US3 - filter simplification + image fallback)
                          └─► Phase 6 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: Depends on the shared live-data loading work from Phase 2. Delivers the MVP by replacing mock content with real records.
- **US2 (P2)**: Depends on US1 because sector filtering applies to the live result set.
- **US3 (P3)**: Depends on US1 and should follow US2 so the final filter UI reflects only supported live-data dimensions.

### Within Each User Story

- T006 → T007 → T008 sequential in `src/features/marketplace/pages/MarketplacePage.tsx`
- T009 follows T006-T007 because card prop adjustments depend on finalized live mappings
- T010 → T011 → T012 sequential for live sector filters
- T013 follows T012 because fallback behavior should be added after the live filter path exists
- T014 and T015 can proceed once US2 is in place
- T016 follows T015 because image fallback is driven by the normalized record shape
- T017 follows T014-T016 as a consistency check across the simplified live UI

### Parallel Opportunities

- T004 and T005 can run in parallel after T003
- T014 and T015 can run in parallel after US2 completes
- T018 can run in parallel with T020 once implementation is complete

---

## Parallel Example: Foundational Phase

```bash
Task: "Add live intake and sector fetching in src/features/marketplace/pages/MarketplacePage.tsx"
Task: "Add live record normalization in src/features/marketplace/pages/MarketplacePage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE** against quickstart scenarios 1-3
5. Demo the live-data Marketplace tabs

### Incremental Delivery

1. Setup + Foundational → live data infrastructure ready
2. US1 → swap mock Marketplace content for live intake data (MVP)
3. US2 → add live sector-based filtering
4. US3 → remove unsupported filters and add image fallback
5. Polish → lint, build, and quickstart verification

### Suggested MVP Scope

- Phase 1
- Phase 2
- Phase 3 (US1 only)

This is the minimum slice that replaces the current mock Marketplace with usable live data.

---

## Notes

- All tasks follow the required checklist format with IDs, optional markers, story labels, and exact file paths.
- `src/features/marketplace/pages/MarketplacePage.tsx` is the main integration point and should own the live-data orchestration.
- `src/features/marketplace/components/MarketplaceFilters.tsx` should be simplified rather than extended for unsupported filter dimensions.
- `src/features/intakes/api/intake.ts` is reused as-is; no backend contract changes are planned in this feature.
