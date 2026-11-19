# Implementation Plan: Shared Responsive Web Design

**Branch**: `011-responsive-shared-design` | **Date**: 2026-04-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-responsive-shared-design/spec.md`

## Summary

Create a shared responsive design baseline for key authenticated screens so the web app works cleanly on mobile, tablet, and desktop while preserving current color palette and visual language. The implementation will centralize responsive layout patterns in shared navigation/layout shells, then apply the same pattern to representative high-traffic pages.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 18  
**Primary Dependencies**: React Router, Tailwind CSS, shadcn/ui, lucide-react, existing shared layout/navigation components  
**Storage**: N/A - UI layout/design behavior only  
**Testing**: `npm run lint`, `npm run build`, manual viewport validation  
**Target Platform**: Web SPA in modern desktop/tablet/mobile browsers  
**Project Type**: Frontend web application  
**Performance Goals**: Maintain current page responsiveness without introducing noticeable UI lag during resize, nav toggle, filtering, and core page interactions  
**Constraints**: Keep existing color/styling direction; no backend contract changes; avoid breaking route behavior and current business flows; preserve accessibility and touch usability on small screens  
**Scale/Scope**: Shared responsive pass for representative authenticated screens from main navigation (`/marketplace`, `/intakes`, `/infrastructure`, selected `/services/*` index/create pages, shared shell components)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file is still template-only with placeholder principles and no enforceable project-specific gates. No blocking constitutional constraints were identified before research; post-design check remains unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/011-responsive-shared-design/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── responsive-ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── router/
│       └── routes.tsx
├── shared/
│   └── components/
│       ├── layout/
│       │   └── DashboardLayout.tsx
│       └── navigation/
│           └── Sidebar.tsx
└── features/
    ├── marketplace/
    │   └── pages/
    │       └── MarketplacePage.tsx
    ├── intakes/
    │   └── pages/
    │       ├── IntakesPage.tsx
    │       └── IntakeDetailPage.tsx
    ├── infrastructure/
    │   └── pages/
    │       └── InfrastructurePage.tsx
    └── services/
        └── pages/
            ├── TechExpertPage.tsx
            ├── OperationExpertPage.tsx
            └── TrainingPage.tsx
```

**Structure Decision**: Reuse the existing frontend feature slices and shared shell components. Introduce responsive behavior at shared shell level first, then align representative feature pages using the same spacing, stacking, and component rules.

## Responsive Screen Inventory

Baseline scope captured for this feature pass:

| Screen Key | Route | Primary Risks Before Refactor |
|------------|-------|-------------------------------|
| `marketplace.index` | `/marketplace` | Search/filter region and tab cards crowded on narrow width |
| `intakes.index` | `/intakes` | Dense table-first layout with weak mobile readability |
| `intakes.detail` | `/intakes/detail` | 5-column detail shell and tab list overflow |
| `infrastructure.index` | `/infrastructure` | Search/action clusters and card density not mobile-first |
| `services.tech-expert` | `/services/tech-expert` | Desktop table action clusters not touch-friendly |
| `services.operation-expert` | `/services/operation-expert` | Filter/table stack breaks visual rhythm on small widths |
| `services.training` | `/services/training` | Desktop table and action controls need mobile stacking |

Shared responsive pattern target for all entries:

- Shell: drawer navigation below desktop breakpoint, fixed/collapsible rail on desktop.
- Page container: consistent max width + adaptive inline spacing tokens.
- Section composition: stack-based sections using reusable `ResponsivePageSection`.
- Data region fallback: card/list fallback for narrow widths when desktop table density is too high.

## Complexity Tracking

No constitution violations requiring justification.
