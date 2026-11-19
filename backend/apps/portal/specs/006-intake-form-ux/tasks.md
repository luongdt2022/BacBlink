# Tasks: Intake Form UX Update

**Input**: Design documents from `/specs/006-intake-form-ux/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: No test tasks generated — not requested in the specification.

**Organization**: Tasks are grouped by user story (US1 → US2). All changes are in a single file: `src/features/intakes/pages/IntakeFormPage.tsx`.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to ([US1], [US2])

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new files or directories needed — all changes are additive modifications to one existing file.

- [x] T001 Verify `src/features/intakes/pages/IntakeFormPage.tsx` is on branch `006-intake-form-ux` and matches plan.md targets

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Remove the old dual-button pattern and consolidate into one unified `handleSave` function. Both user stories depend on this refactor.

**⚠️ CRITICAL**: T003 (UI changes) cannot begin until T002 is complete — the save handler drives the new button.

- [x] T002 In `src/features/intakes/pages/IntakeFormPage.tsx`: delete `handleSaveDraft` function entirely and rename `handlePublish` to `handleSave`; inside `handleSave` replace the hardcoded `requestData.status = 'published'` with no override (use `status` state directly from `buildRequestData()`); add a branch `if (status === 'draft')` that skips the content validation block and uses the draft toast message `'Đã lưu nháp thành công. Đang chờ AI xử lý nội dung.'`, keeping the publish path's content validation and toast message when `status === 'published'`

**Checkpoint**: `handleSave()` is callable and correctly dispatches based on `status` state — US1 and US2 implementation can now begin

---

## Phase 3: User Story 1 — Status Selector Replaces Draft Button (Priority: P1) 🎯 MVP

**Goal**: Remove the standalone "Lưu nháp" button from the sidebar. Replace with a 2-option status selector ("Nháp" / "Công khai") bound to `status` state, and a single "Lưu" button that calls `handleSave`.

**Independent Test**: Open intake create or edit page → confirm no "Lưu nháp" button → confirm status selector shows "Nháp" and "Công khai" options → select "Nháp" → click "Lưu" → intake saved as draft. Select "Công khai" → click "Lưu" → intake saved as published.

### Implementation for User Story 1

- [x] T003 [US1] In `src/features/intakes/pages/IntakeFormPage.tsx` action buttons section (currently `<div className="space-y-2 border-t border-gray-200 p-4">`): remove the `<Button variant="outline" onClick={handleSaveDraft} ...>Lưu nháp</Button>` button element entirely

- [x] T004 [US1] In `src/features/intakes/pages/IntakeFormPage.tsx`, inside the action buttons section after the "Làm đẹp dữ liệu" button (or at the top of the section if not in edit mode): add a status selector using a 2-column button grid — identical visual pattern to the existing "Loại" (IP/Challenge) selector: `<div className="grid grid-cols-2 gap-2">` containing two `<button type="button">` elements — first button sets `status` to `'draft'` with label "Nháp" and `<Save className="h-4 w-4" />` icon, second button sets `status` to `'published'` with label "Công khai" and `<Globe className="h-4 w-4" />` icon; active state classes: `border-primary bg-primary/5 text-primary`; inactive classes: `border-gray-300 text-gray-600 hover:border-gray-400`; both buttons share `rounded-lg border px-3 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2` base classes

- [x] T005 [US1] In `src/features/intakes/pages/IntakeFormPage.tsx`, replace the existing "Công bố" `<Button onClick={handlePublish} ...>` with `<Button onClick={handleSave} disabled={isSubmitting} className="w-full">` containing `<Save className="mr-2 h-4 w-4" />` and label `{isSubmitting ? 'Đang lưu...' : 'Lưu'}`; remove the `<Globe>` icon from this button (Globe is now used in the selector)

**Checkpoint**: US1 fully functional — no "Lưu nháp" button visible; status selector present; single "Lưu" button dispatches correctly based on selection. Testable via quickstart.md §1–4.

---

## Phase 4: User Story 2 — Action Card Visual Prominence (Priority: P2)

**Goal**: Make the action card at the bottom of the left sidebar visually distinct from the scrollable form fields above.

**Independent Test**: Open any intake form page → scan the left sidebar → the action card at the bottom should appear visually elevated/distinct without reading any label.

### Implementation for User Story 2

- [x] T006 [US2] In `src/features/intakes/pages/IntakeFormPage.tsx`, change the action section wrapper `<div className="space-y-2 border-t border-gray-200 p-4">` to `<div className="space-y-3 rounded-t-xl bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">` — this removes the flat border-t and adds a top shadow that makes the card appear to float above the scrollable content; also update `space-y-2` to `space-y-3` for slightly more breathing room between controls

**Checkpoint**: US1 + US2 both independently verifiable — full feature testable end-to-end via quickstart.md.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation

- [x] T007 Run `npm run lint` and confirm no errors in the modified file (`src/features/intakes/pages/IntakeFormPage.tsx`)
- [ ] T008 Validate all 6 scenarios in `specs/006-intake-form-ux/quickstart.md` manually against the running app

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup / verification)
  └─► Phase 2 (T002 — Unified handleSave handler) — BLOCKS Phase 3
        └─► Phase 3 (US1: T003–T005) — sequential, same file
              └─► Phase 4 (US2: T006) — same file, depends on T003–T005 existing
                    └─► Phase 5 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: Depends on T002 (Foundational). No dependency on US2.
- **US2 (P2)**: Depends on T003–T005 (button structure must exist to restyle the wrapper). One styling task.

### Within Each Story

- T002 (handler) → T003 (remove old button) → T004 (add selector) → T005 (update save button) — sequential, all same file
- T006 (card styling) — depends on T003–T005 (wrapper div must be final before restyling)

### Parallel Opportunities

- No genuine parallel opportunities — all tasks modify the same file sequentially
- T007 (lint) can run alongside manual testing (T008)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 — Verify target file
2. T002 — Unify save handler (CRITICAL)
3. T003–T005 — Remove old button, add selector, update save button
4. **STOP and VALIDATE**: Status selector visible, "Lưu" button works for both draft and publish
5. Ship US1 as MVP; T006 (visual polish) is additive

### Incremental Delivery

1. T001 → T002 → Foundation ready (handler unified)
2. T003–T005 → US1 live (selector functional) — **MVP**
3. T006 → US2 visual card elevated
4. T007–T008 → Lint + manual QA

### Files Changed Summary

| File | Action | Tasks |
|------|--------|-------|
| `src/features/intakes/pages/IntakeFormPage.tsx` | **MODIFY** | T002, T003, T004, T005, T006 |

---

## Notes

- [P] tasks can be done in parallel (different files) — none in this feature (single file)
- [Story] label maps each task to its user story for traceability
- T004 insertion point: inside the action card div, before the "Lưu" button and after the "Làm đẹp dữ liệu" button (if in edit mode); add a `<Label className="text-xs font-medium text-gray-500">Trạng thái</Label>` heading above the selector for clarity
- `Save` and `Globe` icons are already imported in `IntakeFormPage.tsx` — no new imports needed
- The `status` state already exists and is initialized from intake data on load — the selector simply reads and writes this state
