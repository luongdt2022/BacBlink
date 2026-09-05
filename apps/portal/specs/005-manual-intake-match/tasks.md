# Tasks: Manual Intake Match Button

**Input**: Design documents from `/specs/005-manual-intake-match/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: No test tasks generated — not requested in the specification.

**Organization**: Tasks are grouped by user story (US1 → US2) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to ([US1], [US2])

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new directories needed — both changes are additive modifications to existing files.

- [x] T001 Verify `src/features/intakes/api/intake.ts` and `src/features/intakes/pages/IntakeDetailPage.tsx` are the correct target files per plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the `computeMatches()` API function. Both user stories depend on this.

**⚠️ CRITICAL**: T003 (IntakeDetailPage) cannot begin until T002 is complete.

- [x] T002 Add `computeMatches(id: string): Promise<{ matchCount: number }>` to `src/features/intakes/api/intake.ts` — `POST /api/v1/my/intakes/:id/compute-matches` using `getAuthHeaders()` from `src/services/api/client.ts`; use same `API_BASE` constant already at bottom of the file; throw on non-ok response

**Checkpoint**: `computeMatches()` is callable — US1 and US2 implementation can now begin

---

## Phase 3: User Story 1 — Trigger Manual Match from Intake Detail Sidebar (Priority: P1) 🎯 MVP

**Goal**: A user viewing their own published intake can click a button in the right sidebar to trigger matching. A loading toast appears immediately; on completion a success toast shows the match count; on failure an error toast appears and the button is re-enabled.

**Independent Test**: Open a published intake detail page → click the "Tìm kiếm giải pháp phù hợp" button in the right sidebar → loading toast appears → success toast with match count appears. No other feature change needed.

### Implementation for User Story 1

- [x] T003 [US1] Import `Sparkles` from `lucide-react` and `computeMatches` from `../api/intake` in `src/features/intakes/pages/IntakeDetailPage.tsx`
- [x] T004 [US1] Add `isMatching` boolean state (`useState(false)`) to `IntakeDetailPage` in `src/features/intakes/pages/IntakeDetailPage.tsx`
- [x] T005 [US1] Add `handleComputeMatches` async handler in `src/features/intakes/pages/IntakeDetailPage.tsx`: call `toast.loading('Hệ thống đang xử lý, vui lòng chờ giây lát...')`, set `isMatching=true`, await `computeMatches(intake.id)`, on success dismiss toast and call `toast.success('Tìm thấy N kết quả phù hợp')` (where N = `data.matchCount`), on failure dismiss toast and call `toast.error('Không thể tìm kiếm kết quả. Vui lòng thử lại.')`, always set `isMatching=false` in finally
- [x] T006 [US1] Add the "Tìm kiếm giải pháp phù hợp" `Button` to the right info panel in `src/features/intakes/pages/IntakeDetailPage.tsx` — place it at the top of the info panel content (before the metadata items, line ~432), render only when `intake.status === 'published'`, use the default (filled primary) `Button` variant, add `Sparkles` icon, set `disabled={isMatching}`, `onClick={handleComputeMatches}`, label: `isMatching ? 'Đang tìm kiếm...' : 'Tìm kiếm giải pháp phù hợp'`, `className="w-full"` for full sidebar width

**Checkpoint**: US1 fully functional and independently testable via quickstart.md §1–4 and §6

---

## Phase 4: User Story 2 — Button is Visually Prominent (Priority: P2)

**Goal**: The Match button visually stands out from other sidebar elements. Using the filled primary `Button` variant with the `Sparkles` icon already achieves this; this phase validates and optionally enhances the visual treatment.

**Independent Test**: Open any intake detail page → without explanation, identify the Match button as the most visually prominent element in the right sidebar compared to all other controls.

**Note**: US2 is structurally satisfied by T006's use of the filled primary `Button` variant (solid blue background, white text) with an icon. The right sidebar info panel has no other buttons — the Match button will naturally stand out. This phase adds a visual separator and optional label to reinforce prominence.

### Implementation for User Story 2

- [x] T007 [US2] Add a visual separator and a short descriptive label above the Match button in `src/features/intakes/pages/IntakeDetailPage.tsx` — insert a `<div className="mb-3 border-b border-gray-100 pb-3">` wrapping the button, or add a `<p className="mb-2 text-xs font-medium text-gray-500">Hành động</p>` heading above the button to give it a distinct section in the sidebar

**Checkpoint**: US1 + US2 both independently verifiable — full feature testable end-to-end via quickstart.md

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation

- [x] T008 Run `npm run lint` and confirm no errors in the modified files (`src/features/intakes/api/intake.ts` and `src/features/intakes/pages/IntakeDetailPage.tsx`)
- [ ] T009 Validate all 6 scenarios in `specs/005-manual-intake-match/quickstart.md` manually against the running app

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup / verification)
  └─► Phase 2 (T002 — Foundational API function) — BLOCKS Phase 3
        └─► Phase 3 (US1: T003–T006) — sequential, same file
              └─► Phase 4 (US2: T007) — same file, depends on T006
                    └─► Phase 5 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: Depends on T002 (Foundational). No dependency on US2.
- **US2 (P2)**: Depends on T006 (button already rendered in the sidebar) to be meaningful. One small visual enhancement task.

### Within Each Story

- T003 (imports) → T004 (state) → T005 (handler) → T006 (button render) — sequential, all in the same file
- T007 (visual label) — depends on T006 (button must exist to add a section header above it)

### Parallel Opportunities

- T002 and T001 (setup verification) can overlap conceptually but T002 modifies a file so run after T001
- No genuine parallel opportunities in this feature — both modified files are different but tasks within each are sequential

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 — Verify target files
2. T002 — Add `computeMatches()` API function (CRITICAL)
3. T003–T006 — Button + state + handler in IntakeDetailPage
4. **STOP and VALIDATE**: Published intake → button appears → click → loading toast → success toast
5. Ship US1 as MVP; T007 (visual polish) is additive

### Incremental Delivery

1. T001 → T002 → Foundation ready (API callable)
2. T003–T006 → US1 live (button functional) — **MVP**
3. T007 → US2 visual prominence enhanced
4. T008–T009 → Lint + manual QA

### Files Changed Summary

| File | Action | Tasks |
|------|--------|-------|
| `src/features/intakes/api/intake.ts` | **MODIFY** | T002 |
| `src/features/intakes/pages/IntakeDetailPage.tsx` | **MODIFY** | T003, T004, T005, T006, T007 |

---

## Notes

- [P] tasks can be done in parallel (different files) — none in this feature
- [Story] label maps each task to its user story for traceability
- T006 insertion point: right sidebar info panel, `src/features/intakes/pages/IntakeDetailPage.tsx` line ~432 (inside `<div className="rounded-lg border border-gray-200 bg-white p-4">`)
- The `API_BASE` constant in `intake.ts` is declared at the bottom of the file (line 295) — `computeMatches` must reference it the same way as `createIntake`, `getMyIntakes`, etc.
- `toast.loading()` returns a toast ID — store it in a `const toastId` variable and pass it to `toast.dismiss(toastId)` in both success and error paths
