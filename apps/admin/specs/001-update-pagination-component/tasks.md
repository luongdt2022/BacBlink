# Tasks: Update Pagination Component

**Input**: Design documents from `/specs/001-update-pagination-component/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md
**Tests**: Not requested in feature specification — no test tasks generated.

**Organization**: Tasks are grouped by user story. No Setup or Foundational phases are required — the new `Pagination` component is already implemented and ready; this feature is purely a find-and-replace migration.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 - Migrate pagination on User Activity page (Priority: P1) 🎯 MVP

**Goal**: Replace both `SimplePagination` usages in `UserActivityTab.tsx` with the new `Pagination` component. The IP table and Lab table each get their own component instance sharing the same import.

**Independent Test**: Navigate to the User Activity page. Change pages on both the IP table and Lab table. Verify page numbers, ellipsis, prev/next buttons, and page indicator all update the correct table.

### Implementation

- [X] T001 [P] [US1] Replace `import { SimplePagination } from '@/shared/ui/SimplePagination'` with `import { Pagination } from '@/shared/components/Pagination'` in `src/features/users/components/UserActivityTab.tsx`
- [X] T002 [P] [US1] Replace `<SimplePagination ...>` JSX usage in the IP table (`<IPTable>`) with `<Pagination currentPage={page} totalPages={total} onPageChange={setPage} />` in `src/features/users/components/UserActivityTab.tsx`
- [X] T003 [P] [US1] Replace `<SimplePagination ...>` JSX usage in the Lab table (`<LabTable>`) with `<Pagination currentPage={page} totalPages={total} onPageChange={setPage} />` in `src/features/users/components/UserActivityTab.tsx`
- [X] T004 [US1] Run `npm run typecheck` and `npm run lint` to verify no type or lint errors in `src/features/users/components/UserActivityTab.tsx`

**Checkpoint**: User Activity page — both tables paginate correctly with the new component.

---

## Phase 2: User Story 2 - Migrate pagination on User Settings page (Priority: P1)

**Goal**: Replace the `SimplePagination` usage in `UserSettingsTab.tsx` with the new `Pagination` component.

**Independent Test**: Navigate to the User Settings page. Change pages on the Challenges/Bài toán table. Verify page numbers and navigation controls work correctly.

### Implementation

- [X] T005 [P] [US2] Replace `import { SimplePagination } from '@/shared/ui/SimplePagination'` with `import { Pagination } from '@/shared/components/Pagination'` in `src/features/users/components/UserSettingsTab.tsx`
- [X] T006 [P] [US2] Replace `<SimplePagination currentPage={page} totalPages={total} onPageChange={setPage} />` JSX with `<Pagination currentPage={page} totalPages={total} onPageChange={setPage} />` in `src/features/users/components/UserSettingsTab.tsx`
- [X] T007 [US2] Run `npm run typecheck` and `npm run lint` to verify no type or lint errors in `src/features/users/components/UserSettingsTab.tsx`

**Checkpoint**: User Settings page — Challenges table paginates correctly with the new component.

---

## Phase 3: User Story 3 - Migrate pagination on Intakes page (Priority: P1)

**Goal**: Replace the composite pagination imports and inline `generatePageNumbers` helper in `IntakesPage.tsx` with the single new `Pagination` component. Remove the unused helper and all composite pagination JSX.

**Independent Test**: Navigate to the Intakes page. Change page numbers. Verify prev, next, page numbers, and ellipsis all behave correctly.

### Implementation

- [X] T008 [P] [US3] Replace the composite pagination imports (`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis` from `@/shared/ui/pagination`) with `import { Pagination } from '@/shared/components/Pagination'` in `src/features/intakes/pages/IntakesPage.tsx`
- [X] T009 [P] [US3] Remove the `generatePageNumbers` function (lines ~32–60) in `src/features/intakes/pages/IntakesPage.tsx` — it is superseded by the new component's internal logic
- [X] T010 [P] [US3] Replace the entire pagination JSX block (lines ~161–197, from `<Pagination>` to `</Pagination>`) with a single `<Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />` in `src/features/intakes/pages/IntakesPage.tsx`
- [X] T011 [US3] Run `npm run typecheck` and `npm run lint` to verify no type or lint errors in `src/features/intakes/pages/IntakesPage.tsx`

**Checkpoint**: Intakes page — table paginates correctly with the new component.

---

## Phase 4: Polish & Cleanup

**Purpose**: Verify all migrations, confirm old components are unused, and remove them.

### Verification & Cleanup

- [X] T012 [P] Run a global search across `src/` for any remaining imports of `@/shared/ui/SimplePagination` — must return zero results before deleting
- [X] T013 [P] Run a global search across `src/` for any remaining imports of the composite pagination exports (`PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`) from `@/shared/ui/pagination` — must return zero results before deleting
- [X] T014 [P] Delete `src/shared/ui/SimplePagination.tsx` (superseded by new `Pagination` component; confirmed unused by T012)
- [X] T015 [P] Delete `src/shared/ui/pagination.tsx` (superseded by new `Pagination` component; confirmed unused by T013)
- [X] T016 Remove `export * from "./pagination"` and `export * from "./SimplePagination"` from `src/shared/ui/index.ts` to clean up barrel exports
- [X] T017 Run `npm run typecheck` and `npm run lint` to verify the entire codebase is clean after old file removal

**Checkpoint**: All migrations verified. Old components removed. No build or lint errors.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**: No dependencies — can start immediately
- **Phase 2 (US2)**: No dependencies — can run in parallel with Phase 1
- **Phase 3 (US3)**: No dependencies — can run in parallel with Phase 1 and Phase 2
- **Phase 4 (Polish)**: Depends on all three migration phases completing successfully

### User Story Dependencies

- **User Story 1**: No dependencies on other stories — fully independent
- **User Story 2**: No dependencies on other stories — fully independent
- **User Story 3**: No dependencies on other stories — fully independent

### Parallel Opportunities

- T001, T002, T003 (US1 implementation) can run in parallel after T001 completes
- T005, T006 (US2 implementation) can run in parallel with US1 tasks
- T008, T009, T010 (US3 implementation) can run in parallel with US1 and US2 tasks
- T012, T013, T014, T015 (Polish cleanup) can all run in parallel once migrations are done

---

## Parallel Example

```bash
# Phase 1 + 2 + 3 all run simultaneously:
Task: "Migrate UserActivityTab.tsx — replace SimplePagination with Pagination"
Task: "Migrate UserSettingsTab.tsx — replace SimplePagination with Pagination"
Task: "Migrate IntakesPage.tsx — replace composite pagination with Pagination"

# Polish runs after all migrations:
Task: "Verify zero imports of old components; delete old files"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Migrate `UserActivityTab.tsx`
2. **STOP and VALIDATE**: Test IP table and Lab table pagination
3. Deploy/demo if ready

### Incremental Delivery

1. Complete Phase 1 → Test independently → Deploy (MVP!)
2. Complete Phase 2 → Test independently → Deploy
3. Complete Phase 3 → Test independently → Deploy
4. Complete Phase 4 → Final verification

### Recommended Order

All three migration phases (US1, US2, US3) can be executed in parallel since they modify different files with no interdependencies. Polish/cleanup (Phase 4) must run last.

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 17 |
| US1 tasks | 4 |
| US2 tasks | 3 |
| US3 tasks | 4 |
| Polish tasks | 6 |
| Parallelizable tasks | 12 / 17 |
| MVP scope | Phase 1 (US1) — 4 tasks |
