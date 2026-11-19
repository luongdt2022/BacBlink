# Research: Intake Form UX Update

**Branch**: `006-intake-form-ux` | **Date**: 2026-04-01

## Finding 1 — Status selector UI pattern

**Decision**: Use a two-button toggle group styled identically to the existing "Loại" (IP / Challenge) selector already in `IntakeFormPage.tsx` (a 2-column `grid` of `<button>` elements with active/inactive Tailwind classes).

**Rationale**: No new component import required. Reusing the same visual pattern keeps the sidebar consistent. The `status` state already exists and drives the selector's default value.

**Alternatives considered**:
- `shadcn/ui RadioGroup` — would require an import not currently used in this file; overkill for 2 options.
- `shadcn/ui Tabs` — already imported but semantically wrong for a form field (Tabs implies content panels, not a value selector).

---

## Finding 2 — Merging save handlers

**Decision**: Replace `handleSaveDraft` and `handlePublish` with a single `handleSave` function. It reads the current `status` state to decide which validation path and toast message to use.

**Rationale**: The `buildRequestData()` helper already reads `status` from state. The only differences between the two handlers are: (a) `status` forced to `'draft'`/`'published'`, (b) content validation for publish, (c) toast message text. A single handler branches on `status` state and covers both cases cleanly.

**Alternatives considered**: Keep both handlers internally, expose only one button — rejected because the draft handler explicitly overrides `status` to `'draft'`, which would conflict with the selector-driven approach.

---

## Finding 3 — Action card visual prominence

**Decision**: Wrap the action buttons section in a card with a white background, `shadow-md`, rounded top corners, and a slightly elevated appearance. The existing `border-t border-gray-200 p-4` div becomes `rounded-t-xl bg-white shadow-md p-4`.

**Rationale**: The sidebar background is `bg-white`; making the action card white-on-white with a top shadow creates the "floating card" effect that visually separates it from the scrollable fields above without changing the color scheme.

**Alternatives considered**: Colored background (e.g., `bg-gray-50`) — rejected because it could look like a disabled zone. A heavier border alone — rejected because it doesn't provide sufficient visual separation.

---

## Finding 4 — Files changed

Only one file requires modification:

| File | Change |
|------|--------|
| `src/features/intakes/pages/IntakeFormPage.tsx` | Remove `handleSaveDraft`, add `handleSave`, add status selector UI, restyle action card |

No new files, no new API calls, no router changes, no new imports beyond what's already present. The `Save` icon import already exists. `Globe` icon already exists and will be reused for the selector.
