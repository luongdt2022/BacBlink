# Tasks: Match on Original Content Only

**Input**: Design documents from `/specs/013-match-original-content/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Not requested — no test tasks generated.

**Organization**: 4 user stories mapped to targeted edits across 3 source files + 1 doc update.
No setup or foundational phases needed — all changes are isolated logic modifications to existing files.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths in every task description

---

## Phase 3: User Story 1 — Trigger matching without prior beautification (Priority: P1) 🎯 MVP

**Goal**: Remove the guard that requires `aiProcessedContent` before matching, and switch all compute-matches query vectors to use original `title` + `content`.

**Independent Test**: Create a published intake with content but no `/beautify` call → `POST /my/intakes/:id/compute-matches` → expect 200 and rows in `intake_matches`.

- [x] T001 [US1] Replace `aiProcessedContent` guard with `content` guard in `computeMatchesManual` in `src/intakes/intakes.service.ts` (line ~930: change throw message to "has no content to match", change condition from `!intake.aiProcessedContent` to `!intake.content`)
- [x] T002 [US1] Fix `computeMatches` queryText to use original `title` + `content` in `src/intakes/intakes.service.ts` (line ~843: remove `if (!intake.aiProcessedContent)` guard; line ~851: replace `aiProcessTitle ?? title` and `aiProcessedContent ?? content` with plain `title` and `content`)
- [x] T003 [US1] Fix `findMatchingChallenges` queryText to use original `title` + `content` in `src/intakes/intakes.service.ts` (line ~956: replace `aiProcessTitle ?? title` and `aiProcessedContent ?? content` with plain `title` and `content`)

**Checkpoint**: After T001–T003, a published intake with only original content can trigger matching successfully. Admin flow (US3) is also covered — `computeMatchesManual` is shared between user and admin controllers.

---

## Phase 4: User Story 2 — BM25 scoring uses only original content (Priority: P1)

**Goal**: Remove `ai_process_title` from the Elasticsearch BM25 `should` clause so matching scores are not influenced by beautified data.

**Independent Test**: Verify a beautified and un-beautified intake with identical original content receive equivalent BM25 contributions. The `ai_process_title` field remains in ES documents for display — only the query changes.

- [x] T004 [P] [US2] Remove `{ match: { ai_process_title: { query, boost: 1.5 } } }` from the BM25 `should` array in `src/search/search.service.ts` (line ~118; keep `text` boost 1.0 and `intake_title` boost 2.0 unchanged)

**Checkpoint**: After T004, BM25 scoring uses only `text` and `intake_title`. T004 is [P] because it is in a different file from T001–T003 and has no dependency on them.

---

## Phase 5: User Story 3 — Admin matching without beautify (Priority: P2)

**Goal**: Confirm admin flow works without additional code changes.

**Independent Test**: `POST /admin/intakes/:id/compute-matches` on a published intake with no `aiProcessedContent` → expect 200.

> **No implementation tasks**: The admin controller delegates to `computeMatchesManual`, which is already fixed in T001. No separate code changes are needed for the admin flow.

**Checkpoint**: US3 is verified behaviorally after T001 is complete.

---

## Phase 6: User Story 4 — Backfill script uses original content (Priority: P2)

**Goal**: Align the `backfill-matches` maintenance script with the runtime matching logic — use `title` + `content` for the query vector and drop `ai_process_title` from BM25.

**Independent Test**: Run `npm run backfill:matches` — verify intakes without `aiProcessedContent` are not skipped, and output match counts align with runtime results.

- [x] T005 [P] [US4] Fix queryText in `src/database/scripts/backfill-matches.ts` (line ~142: replace `aiProcessTitle ?? title` and `aiProcessedContent ?? content` with plain `title` and `content`; update skip condition from `!queryText.trim()` to also skip if `!intake.content`)
- [x] T006 [US4] Remove `{ match: { ai_process_title: { query: queryText, boost: 1.5 } } }` from the BM25 `should` array in `src/database/scripts/backfill-matches.ts` (line ~68)

**Checkpoint**: After T005–T006, the backfill script is consistent with the runtime matching logic. T005 is [P] — different file from T001–T004.

---

## Final Phase: Polish & Doc Updates

**Purpose**: Update existing documentation to reflect the removed beautify prerequisite.

- [x] T007 Update `specs/010-manual-intake-match/quickstart.md`: (1) remove line 10 "Intakes must have been beautified so `aiProcessedContent` is set"; (2) remove "beautified" from scenario titles at lines 14 and 99; (3) remove Scenario 3 entirely ("Reject match when aiProcessedContent is missing", lines 57–78); (4) remove beautify steps from Recommended test sequence (lines 168–173)

**Checkpoint**: All documentation matches actual behavior.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 3 (US1)**: No dependencies — start immediately
- **Phase 4 (US2)**: No dependency on Phase 3 — start immediately in parallel (different file)
- **Phase 5 (US3)**: No new code — verified after Phase 3 completes
- **Phase 6 (US4)**: No dependency on Phases 3–4 — start immediately in parallel (different file)
- **Final Phase**: Depends on Phase 3 (US1) logic being confirmed correct — do last

### Within Each Phase

- T001 → T002 → T003: Sequential (same file — `src/intakes/intakes.service.ts`)
- T004: Parallel with T001–T003 (different file — `src/search/search.service.ts`)
- T005 → T006: Sequential within Phase 6 (same file — `src/database/scripts/backfill-matches.ts`); Phase 6 is parallel with Phases 3–4

### Parallel Opportunities

```bash
# All three groups can start simultaneously:
Group A (intakes.service.ts): T001 → T002 → T003
Group B (search.service.ts):  T004
Group C (backfill-matches.ts): T005 → T006

# After all groups done:
T007  # doc update
```

---

## Implementation Strategy

### MVP (Minimum Viable — US1 + US2)

1. Complete T001, T002, T003 (Phase 3) — unblocks user-facing matching
2. Complete T004 (Phase 4) — BM25 fairness
3. **STOP and VALIDATE**: Use `quickstart.md` scenario 1 to confirm
4. Deploy — users can now match without beautifying first

### Full Delivery

1. MVP above
2. T005, T006 (Phase 6) — backfill consistency
3. T007 (Final) — doc cleanup
4. Run full `quickstart.md` validation

---

## Notes

- [P] tasks = different files, can run concurrently with other [P] tasks in separate edit sessions
- T001–T003 are in the same file — edit sequentially to avoid conflicts
- T005–T006 are in the same file — edit sequentially
- No migration, no new files, no new npm dependencies
- `ai_process_title` stays in the ES document and in search result responses — only removed from BM25 query scoring
