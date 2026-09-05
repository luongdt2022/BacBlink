# Research: Manual Intake Match Button

**Branch**: `005-manual-intake-match` | **Date**: 2026-03-31

## Findings

### Decision 1: Where to add the API call

**Decision**: Add `computeMatches(id: string)` to the existing `src/features/intakes/api/intake.ts` file, following the same pattern as `beautifyIntake()` added in the previous feature.

**Rationale**: The intake API file already contains all intake-related API calls (`createIntake`, `updateIntake`, `deleteIntake`, `beautifyIntake`, etc.). Adding here keeps the feature slice cohesive. No new file needed.

**Alternatives considered**: A separate `match.ts` API file — rejected because a single function doesn't warrant its own module.

---

### Decision 2: Ownership check — frontend vs. backend

**Decision**: Rely on the backend's `/my/intakes/:id/compute-matches` endpoint for ownership enforcement. The frontend does **not** need to check `intake.userId === currentUser.id` before showing the button.

**Rationale**: The detail page currently loads intakes by ID without ownership filtering (`getIntakeById` hits the public `/api/v1/intakes/:id` endpoint). Adding a frontend ownership check would require exposing `userId` on the intake response and importing `useAuth`. The backend already enforces ownership — a 404 is returned if the intake doesn't belong to the authenticated user. Since the detail page is accessed from the user's own list (`/intakes`), and the button is gated on `published` status, the risk of accidental misuse is negligible for this iteration.

**Alternatives considered**: Frontend ownership guard (`intake.userId === currentUser.id`) — deferred; requires backend to return `userId` in the detail response (not currently in the `Intake` interface).

---

### Decision 3: Button visibility rule

**Decision**: Show the button only when `intake.status === 'published'`. For draft intakes, hide the button entirely (don't disable it with a tooltip).

**Rationale**: The backend rejects matching on draft intakes with HTTP 422. Hiding the button for drafts is cleaner than showing a disabled state that requires explanation. The spec allows either "hidden or disabled" — hidden is simpler.

**Alternatives considered**: Disabled button with tooltip — more discoverable but adds complexity for a secondary use case.

---

### Decision 4: Toast pattern

**Decision**: Use `toast.loading(message)` which returns a toast ID, then `toast.dismiss(id)` followed by `toast.success()` or `toast.error()`. Same pattern as `handleBeautify` in `IntakeFormPage`.

**Rationale**: Consistent with the existing codebase convention established in the beautify feature. The loading toast persists until explicitly dismissed, satisfying SC-002 (visible within 300ms).

**Alternatives considered**: Inline spinner on the button only — rejected because the spec explicitly requires a notification message ("Hệ thống đang xử lý, vui lòng chờ giây lát").

---

### Decision 5: Button visual prominence

**Decision**: Use the primary filled `Button` variant (solid blue background, white text) with the `Sparkles` icon from lucide-react. All other buttons in the right sidebar info panel are plain text links or outlined buttons — the filled primary variant will naturally stand out.

**Rationale**: The existing sidebar only has action buttons in the header area (Edit, Delete). The info panel itself has no buttons. A full-width solid primary button with an icon satisfies FR-002 and SC-004 without custom CSS.

**Alternatives considered**: Custom gradient button — over-engineering; the primary filled variant already provides sufficient visual weight.

---

## No NEEDS CLARIFICATION markers remain

All decisions resolved. Spec is clean.
