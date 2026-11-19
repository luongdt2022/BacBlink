# Tasks: Intake Match Tab Refresh

**Input**: Design documents from `/specs/008-intake-match-tab/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: No dedicated test tasks generated — the specification did not request TDD or new automated test coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation of each increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Every task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the existing intake detail feature slice for the match-tab refresh without changing behavior yet.

- [X] T001 Review and annotate the target interaction points in `src/features/intakes/pages/IntakeDetailPage.tsx` for current tabs, current match CTA, and current bottom `MatchesSection` placement
- [X] T002 Review `src/features/intakes/components/MatchesSection.tsx` and confirm the component boundaries needed to support both tab-content rendering and empty/result states for the new design

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared page-state and reusable interaction primitives required by all user stories.

**⚠️ CRITICAL**: User story work should not begin until the detail-page tab state and rerun decision flow are prepared.

- [X] T003 Modify `src/features/intakes/pages/IntakeDetailPage.tsx` to introduce shared derived state for `hasMatches`, `matchCount`, and the new active match tab selection
- [X] T004 [P] Add shared confirm-dialog state and handlers in `src/features/intakes/pages/IntakeDetailPage.tsx` for rerun confirmation, cancel, and confirmed execution paths
- [X] T005 [P] Refactor `src/features/intakes/components/MatchesSection.tsx` props contract so the component can cleanly render within the new tab layout for both populated and empty match states

**Checkpoint**: Intake detail page has the shared state needed to render the match tab, redesigned CTA, and rerun-confirm behavior.

---

## Phase 3: User Story 1 - Highlight Matching as a Primary Tab (Priority: P1) 🎯 MVP

**Goal**: Promote `Nhu cầu phù hợp` / `Giải pháp phù hợp` into a prominent main tab so results are discoverable without scrolling to a lower-page section.

**Independent Test**: Open a published intake detail page with matches → see a highlighted match tab in the main tabs area → click it once → view the result list directly in the main content area.

### Implementation for User Story 1

- [X] T006 [US1] Update the main `TabsList` and `TabsTrigger` structure in `src/features/intakes/pages/IntakeDetailPage.tsx` to add a highlighted match tab with intake-type-aware label and visible match count
- [X] T007 [US1] Add a dedicated match `TabsContent` block in `src/features/intakes/pages/IntakeDetailPage.tsx` that renders `MatchesSection` inside the primary tab system
- [X] T008 [US1] Remove the old bottom-of-page `MatchesSection` placement from `src/features/intakes/pages/IntakeDetailPage.tsx` so matching is no longer duplicated as a lower-page section
- [X] T009 [US1] Redesign `src/features/intakes/components/MatchesSection.tsx` to support the new prominent tab presentation, including clearer tab-context heading, result count treatment, and a stronger empty state when no matches exist

**Checkpoint**: User Story 1 is complete when the match experience is accessible as a prominent tab and no longer hidden in a bottom section.

---

## Phase 4: User Story 2 - Redesign the Match Search Action (Priority: P2)

**Goal**: Turn the current sidebar button into a stronger, stateful primary CTA that better communicates matching as a high-value workflow.

**Independent Test**: Open a published intake detail page without matches → identify the redesigned sidebar CTA immediately → click it → matching starts and visible progress feedback appears.

### Implementation for User Story 2

- [X] T010 [US2] Redesign the matching action container in `src/features/intakes/pages/IntakeDetailPage.tsx` from a plain action row into a more prominent CTA block/card while preserving published-only visibility rules
- [X] T011 [US2] Update the CTA copy, hierarchy, icon usage, and loading/disabled states in `src/features/intakes/pages/IntakeDetailPage.tsx` so the action communicates first-time search intent more clearly
- [X] T012 [US2] Connect the empty-state guidance in `src/features/intakes/components/MatchesSection.tsx` to the redesigned CTA language so the tab and sidebar action tell a consistent story

**Checkpoint**: User Story 2 is complete when the sidebar search action reads as the primary CTA and still triggers the existing manual matching flow correctly.

---

## Phase 5: User Story 3 - Confirm Before Re-searching Existing Matches (Priority: P3)

**Goal**: Protect existing result sets by requiring explicit confirmation before rerunning matching when results already exist.

**Independent Test**: Open a published intake detail page that already has matches → click the redesigned CTA → confirmation popup appears → cancel leaves state untouched → confirm starts rerun.

### Implementation for User Story 3

- [X] T013 [US3] Update the match CTA click flow in `src/features/intakes/pages/IntakeDetailPage.tsx` so first-time matching starts immediately while existing matches open the confirmation path
- [X] T014 [US3] Implement the rerun confirmation popup in `src/features/intakes/pages/IntakeDetailPage.tsx` using the shared dialog primitives from `src/shared/components/ui/dialog.tsx`
- [X] T015 [US3] Wire confirm and cancel outcomes in `src/features/intakes/pages/IntakeDetailPage.tsx` so cancel preserves the current results view and confirm reuses the existing `computeMatches` execution and loading feedback
- [X] T016 [US3] Ensure duplicate rerun requests are blocked in `src/features/intakes/pages/IntakeDetailPage.tsx` while the matching request is already in progress

**Checkpoint**: User Story 3 is complete when reruns require confirmation only for existing results and the existing match workflow remains intact.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency pass and manual verification across all user stories.

- [X] T017 [P] Refine copy, spacing, and visual consistency across `src/features/intakes/pages/IntakeDetailPage.tsx` and `src/features/intakes/components/MatchesSection.tsx` so the match tab, CTA, and confirm popup feel cohesive
- [ ] T018 Run `npm run lint` and `npm test` to validate the updated intake detail experience
- [ ] T019 Run the scenarios in `specs/008-intake-match-tab/quickstart.md` and confirm US1-US3 behaviors manually

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup)
  └─► Phase 2 (Foundational)
        └─► Phase 3 (US1 - prominent matching tab)
              └─► Phase 4 (US2 - redesigned match CTA)
                    └─► Phase 5 (US3 - rerun confirmation)
                          └─► Phase 6 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: Depends on foundational tab/match state in Phase 2. Delivers the MVP by making results discoverable.
- **US2 (P2)**: Depends on the shared state from Phase 2 and should follow US1 so the CTA language can align with the new tab treatment.
- **US3 (P3)**: Depends on the redesigned CTA from US2 because confirmation is attached to that action path.

### Within Each User Story

- T006 → T007 → T008 are sequential in `src/features/intakes/pages/IntakeDetailPage.tsx`
- T009 follows T007 because `MatchesSection.tsx` should reflect the final tab placement
- T010 → T011 sequential in `src/features/intakes/pages/IntakeDetailPage.tsx`
- T012 should follow T010-T011 so the empty-state copy matches the finalized CTA
- T013 → T014 → T015 → T016 sequential because they share the same CTA execution path in `src/features/intakes/pages/IntakeDetailPage.tsx`

### Parallel Opportunities

- T004 and T005 can run in parallel after T003
- T017 can run in parallel with T019 once implementation is complete

---

## Parallel Example: Foundational Phase

```bash
Task: "Add rerun confirmation state and handlers in src/features/intakes/pages/IntakeDetailPage.tsx"
Task: "Refactor MatchesSection props for tab-context rendering in src/features/intakes/components/MatchesSection.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE** against quickstart scenarios 1-4
5. Ship/demo the prominent match-tab experience

### Incremental Delivery

1. Setup + Foundational → establish page state and structure
2. US1 → move results into a prominent tab (MVP)
3. US2 → redesign the sidebar search CTA
4. US3 → add confirmation for reruns when results already exist
5. Polish → lint, test, and quickstart verification

### Suggested MVP Scope

- Phase 1
- Phase 2
- Phase 3 (US1 only)

This is the minimum slice that solves the primary discoverability problem.

---

## Notes

- All tasks follow the required checklist format with IDs, optional markers, story labels, and concrete file paths.
- `src/features/intakes/pages/IntakeDetailPage.tsx` is the main integration point and should be edited carefully to avoid conflicting tab-state changes.
- `src/features/intakes/components/MatchesSection.tsx` remains the reusable renderer for match content; keep business labels aligned with intake type.
- No new backend contract work is planned; the existing `computeMatches` flow is reused.
