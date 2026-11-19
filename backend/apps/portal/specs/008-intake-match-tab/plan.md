# Implementation Plan: Intake Match Tab Refresh

**Branch**: `008-intake-match-tab` | **Date**: 2026-04-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-intake-match-tab/spec.md`

## Summary

Elevate the current match-results area on the Intake Detail page into a prominent first-class tab, redesign the manual matching call-to-action so it reads as a primary workflow, and add a confirmation popup before rerunning matching when results already exist. The work is confined to the existing frontend intake detail experience and reuses the current manual matching backend behavior.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 18  
**Primary Dependencies**: React Router, Tailwind CSS, shadcn/ui Tabs + Dialog primitives, lucide-react, sonner  
**Storage**: N/A - existing backend-driven intake detail data only  
**Testing**: `npm test` and `npm run lint`  
**Target Platform**: Web SPA (desktop-first Vite application)  
**Project Type**: Frontend web application  
**Performance Goals**: Matching tab should feel immediately discoverable on page load; opening the confirm popup should feel instantaneous; switching into the matching tab should not introduce perceptible delay beyond current detail-page rendering  
**Constraints**: Reuse the existing `computeMatches` workflow; no backend contract changes assumed; preserve current published-only eligibility; avoid creating a separate route for matches  
**Scale/Scope**: One detail page, one existing results component, one new confirmation interaction, no cross-feature data migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file contains placeholder text only and defines no active project-specific gates. No blocking violations identified before planning. Post-design review unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/008-intake-match-tab/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── intake-match-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── features/
│   └── intakes/
│       ├── api/
│       │   └── intake.ts
│       ├── components/
│       │   ├── MatchCard.tsx
│       │   └── MatchesSection.tsx
│       └── pages/
│           └── IntakeDetailPage.tsx
└── shared/
    └── components/
        ├── modals/
        │   └── DeleteConfirmModal.tsx
        └── ui/
            ├── button.tsx
            ├── dialog.tsx
            └── tabs.tsx
```

**Structure Decision**: Keep all changes inside the existing `intakes` frontend slice. The page composition lives in `IntakeDetailPage.tsx`, match results remain in `MatchesSection.tsx`, and any confirmation interaction can reuse the existing shared dialog primitives without adding a new feature boundary.

## Complexity Tracking

No constitution violations requiring justification.
