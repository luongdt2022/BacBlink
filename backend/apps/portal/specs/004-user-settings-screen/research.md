# Research: User Settings Screen

**Branch**: `004-user-settings-screen` | **Date**: 2026-03-27

## Findings

### Decision 1: API integration pattern

**Decision**: Use `fetch` directly with `getAuthHeaders()` from `src/services/api/client.ts`, matching the pattern used in `src/features/intakes/api/intake.ts` for authenticated `my/` endpoints.

**Rationale**: The `apiFetch` helper does not expose error details reliably (it swallows non-ok responses). For the `PATCH /my/settings` endpoint, we need to inspect error status to revert the optimistic UI. Direct `fetch` with `getAuthHeaders()` — used by `getMyIntakes`, `createIntake`, etc. — gives full control over the response.

**Alternatives considered**: `apiFetch` helper — rejected because it returns `{ data, status }` without throwing, requiring callers to check `status` manually and handling inconsistently with `createIntake`.

---

### Decision 2: Optimistic UI vs. explicit save

**Decision**: Optimistic UI — toggle flips immediately in the UI, the PATCH request fires in the background. On failure, the toggle reverts and a toast error is shown.

**Rationale**: The setting is a single boolean. The operation is fast and low-risk. Optimistic toggle is the expected UX for a toggle control. This matches the pattern the UX spec describes: "immediate save on toggle, no Save button".

**Alternatives considered**: Loading state on the toggle (disabled during save) — rejected as it introduces unnecessary latency perception for a simple boolean flip.

---

### Decision 3: Navigation placement — sidebar top-level vs. user dropdown

**Decision**: Add Settings as an entry in the **user dropdown menu** at the bottom of the Sidebar (next to "Hồ sơ cá nhân", "Đổi mật khẩu", "Đăng xuất"), navigating to `/settings`.

**Rationale**: The main `menuItems` array in `Sidebar.tsx` drives top-level navigation for primary features (Marketplace, Deal Room, Infrastructure, etc.). Settings is a user-preference utility, not a primary workflow. Adding it to the user dropdown keeps the main nav uncluttered and matches conventions in similar applications. The spec also lists this as the preferred location.

**Alternatives considered**: Top-level sidebar item — rejected to avoid inflating the primary nav with utility items.

---

### Decision 4: Component state management

**Decision**: Local `useState` hooks in `SettingsPage.tsx` — `isLoading`, `isSaving`, `matchingAuto` (nullable for loading state). No global state store.

**Rationale**: Settings are only needed on the Settings page. No other component reads `matchingAuto`. A global store (context, Zustand, etc.) would be over-engineering for a single-page, single-value preference.

**Alternatives considered**: React Context — rejected (only one consumer). Zustand store — rejected (no cross-component sharing needed).

---

### Decision 5: Default value on load failure

**Decision**: If the GET request fails, show an inline error message and keep the toggle in an indeterminate/disabled state rather than showing a fake default.

**Rationale**: Showing `true` (default) when the load fails could mislead the user into thinking auto-matching is active when we don't actually know. An explicit error state is safer.

**Alternatives considered**: Show default `true` on failure — rejected to avoid misleading the user about their actual preference.

---

## No NEEDS CLARIFICATION markers remain

All unknowns resolved. Spec is clean.
