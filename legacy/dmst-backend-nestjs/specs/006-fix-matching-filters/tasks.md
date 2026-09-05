# Tasks: Matching Filter — Cross-User & Published Only

**Input**: Design documents from `specs/006-fix-matching-filters/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Organization**: Single user story (P1). No setup or foundational phases required —
this is a targeted edit to one existing method with no new entities or infrastructure.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: User Story 1 — Matches computed only against other users' published intakes (Priority: P1) 🎯

**Goal**: `computeMatches` only populates `intake_matches` with candidates that belong to a
different user AND have `status=published`. The `matchingAuto` gate is preserved as-is.

**Independent Test**: Run the validation SQL from `specs/006-fix-matching-filters/quickstart.md`.
Both queries must return 0 rows:
- `intake_matches` linking two intakes with the same non-null `user_id`
- `intake_matches` referencing any intake with `status = 'draft'`

### Implementation

- [x] T001 [US1] Add post-filter to `computeMatches` in `src/intakes/intakes.service.ts`: after ES returns hits, fetch valid candidate IDs from PostgreSQL with `WHERE id IN (:...ids) AND status = 'published' AND (:ownerId IS NULL OR user_id != :ownerId)`, then filter `result.hits` to only those IDs before inserting into `intake_matches`

**Checkpoint**: `computeMatches` now only inserts cross-user published matches. Validate with quickstart SQL.

---

## Phase 2: Polish & Validation

**Purpose**: Confirm the change works end-to-end and update documentation.

- [ ] T002 Run quickstart validation from `specs/006-fix-matching-filters/quickstart.md` — verify cross-user filter (scenario 1), published-status filter (scenario 2), valid matches still computed (scenario 3), and `matchingAuto=off` gate (scenario 4)

---

## Dependencies & Execution Order

### Phase Dependencies

- **US1 (Phase 1)**: Can start immediately — no setup or foundational phase required
- **Polish (Phase 2)**: Depends on T001 completion

### Within User Story 1

- T001: Single targeted edit — no parallelism required
- T002: Manual validation after T001

### Parallel Opportunities

- None — this is a single-file, single-method change

---

## Implementation Strategy

### MVP (the only scope)

1. Complete T001: Edit `computeMatches` in `src/intakes/intakes.service.ts`
2. Complete T002: Run quickstart validation
3. Commit and merge

---

## Notes

- The post-filter is a single `WHERE id IN (...) AND status = 'published' AND (...user_id filter)` query using TypeORM's `In` operator
- `ownerId` is `intake.userId` from the source intake (already fetched at the top of `computeMatches`)
- When `ownerId` is null (seed/admin intake), the SQL condition `:ownerId IS NULL OR user_id != :ownerId` evaluates as true for all rows — only the published-status filter applies
- No migration, no ES changes, no new files
