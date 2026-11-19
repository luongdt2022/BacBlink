# Implementation Plan: Marketplace Live Data

**Branch**: `009-marketplace-live-data` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-marketplace-live-data/spec.md`

## Summary

Replace Marketplace mock content with live intake data from the authenticated intake list, drive sector filters from the live sector catalog, temporarily remove unsupported filter dimensions, and ensure cards remain visually complete by falling back to a default image when an intake has no uploaded media.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 18  
**Primary Dependencies**: React Router, Tailwind CSS, lucide-react, existing intake API client, existing marketplace cards and filter components  
**Storage**: N/A - frontend reads existing backend APIs only  
**Testing**: `npm run lint` and `npm run build`  
**Target Platform**: Web SPA (Vite, desktop-first authenticated dashboard)  
**Project Type**: Frontend web application  
**Performance Goals**: Marketplace should render the first live result set without noticeable delay beyond a standard dashboard page load; tab switches and sector filtering should feel immediate once data is loaded  
**Constraints**: Reuse current marketplace layout and card structure; do not expand scope into pagination; temporarily remove unsupported filters rather than backfilling synthetic data; preserve current tab split between IP and Challenge  
**Scale/Scope**: One page, two card types, one filter component module, reuse of existing intake and sector APIs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file contains placeholder text only and defines no active project-specific gates. No blocking violations identified before planning. Post-design review unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/009-marketplace-live-data/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── marketplace-ui-data.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── intakes/
│   │   └── api/
│   │       └── intake.ts
│   └── marketplace/
│       ├── components/
│       │   ├── ChallengeCard.tsx
│       │   ├── IPCard.tsx
│       │   └── MarketplaceFilters.tsx
│       └── pages/
│           └── MarketplacePage.tsx
└── shared/
    └── components/
        └── figma/
            └── ImageWithFallback.tsx
```

**Structure Decision**: Keep the work inside the existing `marketplace` feature slice and reuse `intakes/api/intake.ts` as the live data source. The page orchestration belongs in `MarketplacePage.tsx`, while card normalization and filter simplification stay in the existing marketplace components.

## Complexity Tracking

No constitution violations requiring justification.
