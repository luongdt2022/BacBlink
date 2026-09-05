# User Site UI Polish Design

**Date:** 2026-03-31

**Goal:** Improve the DMST user-facing frontend so it feels cleaner, more professional, and more visually consistent, without changing route structure, feature behavior, or existing business flows.

## Scope

- Polish the shared shell used across authenticated pages.
- Improve consistency of page headers, content containers, cards, tables, filters, and settings surfaces.
- Apply the updated visual language to the highest-traffic user pages first:
  - `IntakesPage`
  - `MarketplacePage`
  - `SettingsPage`

## Non-Goals

- No route changes.
- No feature additions.
- No backend or API changes.
- No full redesign of page information architecture.

## Visual Direction

- Clean, bright, enterprise-oriented interface.
- Subtle depth rather than heavy gradients or flashy highlights.
- More deliberate spacing, stronger hierarchy, and consistent surface styling.
- Better active, hover, focus, and empty/loading/error state presentation.

## Design Decisions

### 1. Shared App Shell

- Keep the current left-sidebar layout.
- Shift the app canvas from a flat light gray to a softer tinted background.
- Treat sidebar and page content as distinct surfaces with clearer separation.
- Improve sidebar active state so it is easier to scan and feels more intentional.

### 2. Shared Surface System

- Standardize radius, border, shadow, and spacing across panels.
- Replace ad hoc white strips with reusable “panel” sections.
- Strengthen title, description, and action alignment in headers.

### 3. Intakes Page

- Make the search, filters, and summary area feel like one coherent control surface.
- Improve table readability with cleaner row hover, spacing, and action affordances.
- Preserve all current behaviors and data interactions.

### 4. Marketplace Page

- Keep the same tabs and filtering model.
- Reduce prototype-like styling by aligning search, tabs, sidebar filters, and result cards with the shared shell.
- Make the left filter column and right result area feel like one designed workspace.

### 5. Settings Page

- Upgrade the single settings screen into a cleaner, more premium settings surface.
- Improve state messaging for loading, error, and saving feedback.
- Keep the same toggle behavior and API contract.

## Components and Files

- `src/styles/theme.css`
  - Shared color tokens and app-level feel.
- `src/app/layouts/RootLayout.tsx`
  - Global authenticated shell background and spacing.
- `src/shared/components/layout/DashboardLayout.tsx`
  - Shared container treatment outside route layout usage.
- `src/shared/components/navigation/Sidebar.tsx`
  - Sidebar polish, active states, footer user section.
- `src/shared/components/header/PageHeader.tsx`
  - Unified page header surface and action styling.
- `src/features/intakes/pages/IntakesPage.tsx`
  - Data-table screen polish.
- `src/features/marketplace/pages/MarketplacePage.tsx`
  - Search/tab/filter/results polish.
- `src/features/settings/pages/SettingsPage.tsx`
  - Settings surface polish.

## Risks and Constraints

- Existing pages use a mix of hard-coded Tailwind colors and shared tokens; some polish work will need local cleanup rather than relying only on theme variables.
- Changes should remain responsive and avoid introducing layout regressions on smaller screens.
- The update should be incremental and localized to avoid accidental behavioral regressions.

## Testing Strategy

- Run lint after all UI edits.
- Verify key responsive layouts at shell level.
- Manually confirm:
  - Sidebar interaction and active highlighting.
  - Intakes search/filter/table rendering.
  - Marketplace tab switching and filter layout.
  - Settings loading/error/toggle states.
