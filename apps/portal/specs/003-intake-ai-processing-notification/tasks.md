# Tasks: Intake AI Processing Notification

**Input**: Design documents from `/specs/003-intake-ai-processing-notification/`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓)
**Tests**: None requested

---

## Phase 1: Setup (No tasks needed)

**Note**: This is a frontend-only UI feature. No project setup, dependencies, or scaffolding required.

---

## Phase 2: Foundational (Type Definition)

**Purpose**: Add missing `aiProcessingStatus` field to `IntakeListItem` type — required by both user stories.

- [ ] T001 [US1][US2] Add `aiProcessingStatus` field to `IntakeListItem` interface in `src/features/intakes/api/intake.ts`
  - Add `export type AiProcessingStatus = 'processing' | 'completed' | 'failed' | null;`
  - Add `aiProcessingStatus: AiProcessingStatus;` to `IntakeListItem`

---

## Phase 3: User Story 1 - Toast Notification on Intake Create/Update (Priority: P1) 🎯 MVP

**Goal**: After a successful intake create or update, display a 5-second Sonner toast informing the user that AI is processing.

**Independent Test**: Submit intake form → verify 5-second toast appears → verify toast message is correct.

### Implementation for User Story 1

- [ ] T002 [P] [US1] Add AI toast to `handleSaveDraft` in `src/features/intakes/pages/IntakeFormPage.tsx`
  - After `await createIntake(...)` and `await updateIntake(...)`, call:
    `toast('Đang chờ AI xử lý nội dung. App sẽ thông báo cho bạn khi hoàn thiện.', { duration: 5000 });`
  - Apply to BOTH the create branch (`navigate('/intakes')` before toast or after) AND the update branch (`await refreshIntakeData()` before toast)

- [ ] T003 [P] [US1] Add AI toast to `handlePublish` in `src/features/intakes/pages/IntakeFormPage.tsx`
  - After `await createIntake(...)` and `await updateIntake(...)`, call the same toast
  - Apply to BOTH create and update branches in `handlePublish`

---

## Phase 4: User Story 2 - AI Processing Status Badge & Disabled Rows (Priority: P1)

**Goal**: Display AI processing status badge in intake list rows and disable click on processing items.

**Independent Test**: View intake list → verify AI badge shows on processing items → verify clicking a processing row does nothing → verify edit/delete still work.

### Implementation for User Story 2

- [ ] T004 [P] [US2] Import `Loader2` icon from `lucide-react` in `src/features/intakes/pages/IntakesPage.tsx`

- [ ] T005 [P] [US2] Create `AiProcessingBadge` component in `src/features/intakes/pages/IntakesPage.tsx`
  ```typescript
  function AiProcessingBadge({ status }: { status: string | null }) {
    if (status === 'processing') {
      return (
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          <Loader2 className="h-3 w-3 animate-spin" />
          Đang xử lý AI
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
          Xử lý AI thất bại
        </span>
      );
    }
    return null; // completed
  }
  ```

- [ ] T006 [US2] Add `isProcessing` condition and modify row rendering in `src/features/intakes/pages/IntakesPage.tsx`
  - Add `const isProcessing = intake.aiProcessingStatus === 'processing' || intake.aiProcessingStatus === null;`
  - Apply to `<tr>`: replace `className="cursor-pointer hover:bg-gray-50"` with `className={isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`

- [ ] T007 [US2] Disable row click when processing in `src/features/intakes/pages/IntakesPage.tsx`
  - Modify `handleRowClick`: add guard at top — `if (isProcessing) return;` — where `isProcessing` is computed per item inside `map()`

- [ ] T008 [US2] Add `AiProcessingBadge` to status column in `src/features/intakes/pages/IntakesPage.tsx`
  - In the "Trạng thái" column `<td>`, add `<AiProcessingBadge status={intake.aiProcessingStatus} />` below the existing `<StatusBadge status={intake.status} />`

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and linting.

- [ ] T009 [P] Run `npm test && npm run lint` in `/home/anhbui/projects/dmst/[Nacentech] PoC DMST - User Role.1` and fix any errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No blockers — can start immediately
- **User Story 1 (Phase 3)**: Depends on Phase 2 (T001 must complete first so the toast can use existing code patterns)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (T001 adds the type both stories need)
- **Polish (Phase 5)**: Depends on Phase 3 + Phase 4 completion

### User Story Dependencies

- **User Story 1**: Independent from User Story 2 — can be implemented and tested separately
- **User Story 2**: Independent from User Story 1 — can be implemented and tested separately

### Within Each User Story

- Type definition (Phase 2) must complete before both stories
- T002 and T003 can run in parallel (different functions in same file — same file, so sequential)
- T004 and T005 can run in parallel (different sections — imports vs component)
- T006, T007, T008 must run sequentially within US2 (component must exist before use in JSX)

---

## Parallel Opportunities

**After Phase 2 completes, T002 and T003 (US1) can start in parallel with T004 and T005 (US2) — all in separate subagents.**

```
T001 (Foundational)
       ↓
T002 (US1, T003 parallel)   ←→   T004 (US2, T005 parallel)
                                    ↓
                              T006 (US2, sequential)
                                    ↓
                              T007 (US2, sequential)
                                    ↓
                              T008 (US2, sequential)
                                    ↓
                              T009 (Polish)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Add type definition
2. Complete Phase 3: Toast notification
3. **STOP and VALIDATE**: Submit intake → toast appears for 5 seconds
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 2 (type) → Phase 3 (toast) → Demo toast feature
2. Phase 4 (badges + disabled rows) → Demo list feature
3. Phase 5 (lint) → Final polish

---

## Summary

| Count | Phase |
|-------|-------|
| 1 | Foundational (Phase 2) |
| 2 | User Story 1 (Phase 3) |
| 5 | User Story 2 (Phase 4) |
| 1 | Polish (Phase 5) |
| **9** | **Total tasks** |

**Parallel execution**: After T001, T002/T003 (US1) can run in parallel with T004/T005 (US2) via separate subagents.
