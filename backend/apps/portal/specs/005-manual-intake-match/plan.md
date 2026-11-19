# Implementation Plan: Manual Intake Match Button

**Branch**: `005-manual-intake-match` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-manual-intake-match/spec.md`

## Summary

Add a visually prominent "Tìm kiếm giải pháp phù hợp" button to the right sidebar of the Intake Detail page. The button triggers `POST /my/intakes/:id/compute-matches`, shows an immediate loading toast, then a success toast with `matchCount` on completion, or an error toast on failure. Button is only shown for `published` intakes; ownership check deferred to the API (the `/my/` endpoint already enforces ownership).

## Technical Context

**Language/Version**: TypeScript 5.9 (strict)
**Primary Dependencies**: React 18, React Router 6, shadcn/ui, Tailwind CSS, sonner (toasts), lucide-react (icons)
**Storage**: N/A — no local state persistence; data fetched on page mount
**Testing**: No test tasks (not requested in spec)
**Target Platform**: Desktop web browser (Chrome/Firefox/Edge)
**Project Type**: Web application (SPA — Vite + React)
**Performance Goals**: Loading toast visible within 300ms of click (per SC-002)
**Constraints**: Button only shown when `intake.status === 'published'`; no new external dependencies; follows existing feature-slice layout
**Scale/Scope**: Single button on one existing page; two modified files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No project-specific constitution ratified (template only). Gates evaluated against observed codebase conventions:

| Gate | Status | Notes |
|------|--------|-------|
| Feature-slice structure respected | PASS | New API function added to existing `src/features/intakes/api/intake.ts`; no new module needed (the feature touches an existing page) |
| Authenticated route | PASS | `IntakeDetailPage` is already inside `<RequireAuth>` |
| Shared API client (`getAuthHeaders`) | PASS | New `computeMatches()` uses `getAuthHeaders()` from `src/services/api/client.ts` |
| Toast notifications via sonner | PASS | `toast.loading()` / `toast.success()` / `toast.error()` — consistent with rest of app |
| No new external dependencies | PASS | Only existing packages used |

No violations. Complexity tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/005-manual-intake-match/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── match-api.md     # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── features/
│   └── intakes/
│       ├── api/
│       │   └── intake.ts          # MODIFY: add computeMatches(id) function
│       └── pages/
│           └── IntakeDetailPage.tsx  # MODIFY: add button + state + handler to right sidebar
```

**Structure Decision**: No new files or directories. Both changes are additive modifications to existing files within the `intakes` feature slice. The `IntakeDetailPage` right sidebar (line 429 of current file) is the exact insertion point for the button.
