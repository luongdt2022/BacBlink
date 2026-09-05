# Tasks: User Settings Screen

**Input**: Design documents from `/specs/004-user-settings-screen/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: No test tasks generated — not requested in the specification.

**Organization**: Tasks are grouped by user story (US1 → US2 → US3) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3])

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new `settings` feature module directory structure

- [x] T001 Create directory structure `src/features/settings/api/` and `src/features/settings/pages/` per plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API client for `GET /my/settings` and `PATCH /my/settings`. All user stories depend on this layer.

**⚠️ CRITICAL**: Phases 3–5 cannot begin until T002–T004 are complete.

- [x] T002 Create `src/features/settings/api/settings.ts` and define `UserSettings` and `UpdateSettingsRequest` TypeScript interfaces (see data-model.md)
- [x] T003 Implement `getMySettings(): Promise<UserSettings>` in `src/features/settings/api/settings.ts` — `GET /api/v1/my/settings` using `getAuthHeaders()` from `src/services/api/client.ts`; throw on non-ok response
- [x] T004 Implement `updateMySettings(payload: UpdateSettingsRequest): Promise<UserSettings>` in `src/features/settings/api/settings.ts` — `PATCH /api/v1/my/settings` using `getAuthHeaders()`; throw on non-ok response so callers can revert optimistic UI

**Checkpoint**: `getMySettings()` and `updateMySettings()` are callable — US1 work can now begin

---

## Phase 3: User Story 1 — View and Toggle Auto-Matching Setting (Priority: P1) 🎯 MVP

**Goal**: Authenticated user can open the Settings page at `/settings`, see their current `matchingAuto` preference, toggle it, and have the change persisted immediately with feedback.

**Independent Test**: Navigate to `/settings` → toggle shows ON (default for new user) → flip to OFF → reload → toggle still shows OFF. No other feature needed.

### Implementation for User Story 1

- [x] T005 [US1] Create `src/features/settings/pages/SettingsPage.tsx` with `isLoading`, `isSaving`, `error`, and `settings` local state; call `getMySettings()` on mount; render loading spinner while fetching; render inline error if fetch fails (disabled toggle)
- [x] T006 [US1] Add `matchingAuto` toggle control to `SettingsPage.tsx` using shadcn/ui `Switch` component (or equivalent); implement optimistic update: flip state immediately on click, call `updateMySettings()`, revert state on failure
- [x] T007 [US1] Integrate `toast.success()` / `toast.error()` (sonner) into the save handler in `src/features/settings/pages/SettingsPage.tsx`; disable the toggle while `isSaving` is true to prevent concurrent requests

**Checkpoint**: `SettingsPage` is a fully functional, standalone component — US1 independently testable by visiting `/settings` directly

---

## Phase 4: User Story 2 — Settings Are Per-User (Priority: P2)

**Goal**: Verify that per-user isolation is enforced correctly — each user's settings are independent.

**Independent Test**: Log in as User A, set auto-matching OFF. In a separate browser session, log in as User B, open Settings — auto-matching shows ON (their own default).

**Note**: Per-user isolation is guaranteed by:
1. The backend associating settings with the authenticated user's JWT identity
2. `getAuthHeaders()` sending the current user's Bearer token on every request (implemented in T003/T004)
3. `SettingsPage` local state being unmounted on logout — no settings state persists across users

### Implementation for User Story 2

- [x] T008 [US2] Audit `src/features/settings/api/settings.ts` to confirm both `getMySettings()` and `updateMySettings()` call `getAuthHeaders()` per-request (not cached at module level); no shared state outside the functions — add comment confirming per-request auth if not already explicit

**Checkpoint**: Per-user isolation confirmed — US2 independently verifiable via the two-session test in quickstart.md §5

---

## Phase 5: User Story 3 — Navigate to Settings from Sidebar (Priority: P3)

**Goal**: Users can reach `/settings` from the sidebar user dropdown from any authenticated page; the Settings entry is highlighted when active.

**Independent Test**: While logged in, click the Settings entry in the sidebar user dropdown → `/settings` loads and the entry is highlighted active. Navigate away and back.

### Implementation for User Story 3

- [x] T009 [US3] Add `settings: '/settings'` to the `MENU_ID_TO_PATH` map and add `if (pathname.startsWith('/settings')) return 'settings';` to `pathToActiveItem()` in `src/app/config/routes.ts`
- [x] T010 [P] [US3] Import `SettingsPage` and add a `SettingsRouteWrapper` function + `<Route path="settings" element={<SettingsRouteWrapper />} />` inside the `<RequireAuth>` block in `src/app/router/routes.tsx`
- [x] T011 [P] [US3] Add a `{ id: 'settings', label: 'Cài đặt', icon: Settings }` entry to the `userMenuItems` array in `src/shared/components/navigation/Sidebar.tsx`; add click handler that calls `navigate('/settings')` and closes the dropdown (same pattern as the existing `change-password` item); import `Settings` icon from `lucide-react`

**Checkpoint**: All 3 user stories independently functional — full feature testable end-to-end via quickstart.md

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and minor cleanup

- [ ] T012 Validate all 6 scenarios in `specs/004-user-settings-screen/quickstart.md` manually against the running app (default state, toggle off, per-user isolation, matching gate, error state)
- [x] T013 [P] Add page title / heading to `SettingsPage.tsx` consistent with other pages (e.g., "Cài đặt") so the screen is identifiable without the URL

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └─► Phase 2 (Foundational) — BLOCKS all user stories
        ├─► Phase 3 (US1) — can start after Phase 2
        ├─► Phase 4 (US2) — can start after Phase 2; requires US1 page to exist for manual test
        └─► Phase 5 (US3) — can start after Phase 2; requires US1 page (T005-T007) for route
              └─► Phase 6 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (T002–T004) only. No dependency on US2 or US3.
- **US2 (P2)**: Depends on Foundational (T002–T004). Manual verification requires US1 page to exist.
- **US3 (P3)**: Depends on Foundational + US1 page component (T005–T007) to be importable in `routes.tsx`.

### Within Each Story

- T005 (scaffold) → T006 (toggle logic) → T007 (toasts) — sequential, same file
- T009 (routes.ts) → T010 and T011 can run in parallel (different files)

### Parallel Opportunities

- T010 and T011 are in different files and can be done simultaneously after T009
- T012 and T013 (Polish) can run in parallel

---

## Parallel Example: User Story 3

```
# After T009 completes, launch in parallel:
Task T010: Register /settings route in src/app/router/routes.tsx
Task T011: Add Settings entry to sidebar dropdown in src/shared/components/navigation/Sidebar.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001)
2. Complete Phase 2 (T002–T004) — CRITICAL
3. Complete Phase 3 (T005–T007)
4. **STOP and VALIDATE**: Visit `/settings` directly → toggle works → persists on reload
5. Ship US1 as MVP; US2 and US3 can follow

### Incremental Delivery

1. T001 → T002–T004 → Foundation ready
2. T005–T007 → US1 live at `/settings` (reachable via direct URL) — **MVP**
3. T008 → US2 per-user isolation confirmed
4. T009–T011 → US3 navigation wired up — Settings discoverable from sidebar
5. T012–T013 → Polish and final validation

### Files Changed Summary

| File | Action | Tasks |
|------|--------|-------|
| `src/features/settings/api/settings.ts` | **CREATE** | T002, T003, T004 |
| `src/features/settings/pages/SettingsPage.tsx` | **CREATE** | T005, T006, T007, T013 |
| `src/app/config/routes.ts` | **MODIFY** | T009 |
| `src/app/router/routes.tsx` | **MODIFY** | T010 |
| `src/shared/components/navigation/Sidebar.tsx` | **MODIFY** | T011 |

---

## Notes

- [P] tasks can be done in parallel (different files)
- [Story] label maps each task to its user story for traceability
- Commit after each checkpoint (end of each Phase)
- T001 creates empty dirs — verify with `ls src/features/settings/` before proceeding to T002
- US2 has one lightweight audit task (T008) — its correctness is primarily guaranteed by the Foundational phase pattern
- The `Settings` icon import in T011 is from `lucide-react` (already a project dependency)
