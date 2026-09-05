# Implementation Plan: User Settings Screen

**Branch**: `004-user-settings-screen` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-user-settings-screen/spec.md`

## Summary

Add a Settings screen at `/settings` that lets authenticated users view and toggle their `matchingAuto` preference. The screen integrates with the existing backend endpoints `GET /my/settings` and `PATCH /my/settings`. Navigation is extended by adding a Settings entry to the sidebar user dropdown. The feature follows the established feature-slice pattern: new `settings` feature module under `src/features/`, an API client module, a single page component, and route/nav additions.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict)
**Primary Dependencies**: React 18, React Router 6, shadcn/ui, Tailwind CSS, sonner (toasts), lucide-react (icons)
**Storage**: No local storage — state fetched from backend on mount, written on toggle
**Testing**: Vitest (unit), no E2E test framework detected
**Target Platform**: Desktop web browser (Chrome/Firefox/Edge)
**Project Type**: Web application (SPA — Vite + React)
**Performance Goals**: Settings page loads within 1 second on a standard connection
**Constraints**: Feature-sliced architecture under `src/features/`; authenticated routes only; no new external dependencies
**Scale/Scope**: Single settings object per user; one toggle control in v1

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution file is a template with unfilled placeholders — no project-specific principles have been ratified. Gates are therefore evaluated against observed conventions in the codebase:

| Gate | Status | Notes |
|------|--------|-------|
| Feature-slice structure (`src/features/<name>/`) | PASS | New `settings` module follows the same layout as `intakes`, `auth`, etc. |
| Authenticated route | PASS | Route added inside `<RequireAuth>` wrapper in `routes.tsx` |
| Shared API client used (`apiFetch` / `getAuthHeaders`) | PASS | Settings API client uses `src/services/api/client.ts` helpers |
| Toast notifications via sonner | PASS | `toast()` used for save success/failure, same as `IntakesPage` |
| No new external dependencies | PASS | Only existing packages used |

No violations. Complexity tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/004-user-settings-screen/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── settings-api.md  # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── settings/                     # NEW feature module
│   │   ├── api/
│   │   │   └── settings.ts           # getMySettings(), updateMySettings()
│   │   └── pages/
│   │       └── SettingsPage.tsx      # Settings screen component
│   └── intakes/                      # Reference — existing feature (unchanged)
│       ├── api/intake.ts
│       └── pages/IntakesPage.tsx
├── app/
│   ├── config/
│   │   └── routes.ts                 # ADD: 'settings' → '/settings' entry
│   ├── layouts/
│   │   └── RootLayout.tsx            # Unchanged
│   └── router/
│       └── routes.tsx                # ADD: /settings route + RouteWrapper
└── shared/
    └── components/
        └── navigation/
            └── Sidebar.tsx           # ADD: Settings entry to user dropdown menu
```

**Structure Decision**: Feature-slice (Option 1 variant). New `settings` feature module mirrors the `intakes` feature layout. No new top-level directories created.
