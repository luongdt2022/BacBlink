# Dashboard UI Polish And Sidebar Navigation Design

## Scope

Polish the existing dashboard presentation without changing data flow, API contracts, or chart logic. Add a dedicated `Dashboard` entry to the sidebar so primary areas of the admin app are directly reachable from navigation.

## Goals

- Preserve the current dashboard information architecture.
- Improve visual hierarchy, spacing, and card framing so the page feels more deliberate and less flat.
- Keep the implementation aligned with the current React, Tailwind, and shadcn-style patterns already used in the project.
- Add a sidebar link for `/dashboard` and make navigation state clearer.

## Non-Goals

- No changes to backend services, stats queries, or chart data shaping.
- No new dashboard widgets that require new business logic.
- No major IA rewrite of the sidebar or route tree.

## Proposed UI Changes

### Dashboard Page

- Keep the current sequence: page header, stats grid, two-column chart area, full-width sector chart.
- Replace the plain top row with a stronger header block containing:
  - page title
  - short descriptive subtitle
  - time range filter grouped into the same visual region
- Introduce a softer page canvas with more intentional section spacing.

### Stats Cards

- Strengthen contrast between label and value.
- Refine icon treatment to feel more like a metric badge than a generic square.
- Add subtle shadow and border treatment to lift cards off the page without making the UI heavy.

### Chart Sections

- Give each chart container a clearer header area and more consistent padding.
- Use a slightly elevated card style shared across charts.
- Keep loading and error behavior unchanged.

### Sidebar

- Add a top-level `Dashboard` item pointing to `/dashboard`.
- Keep the existing entries for intakes, users, and implementations.
- Improve active-state styling so the selected route is easier to scan.
- Polish branding and user/logout sections so the sidebar feels consistent with the dashboard refresh.

## Interaction And State

- Existing route behavior remains unchanged.
- Existing active-route matching continues to rely on pathname prefix checks.
- Time range selection behavior remains unchanged.

## Error Handling

- Keep the current destructive alert for dashboard fetch errors.
- Preserve skeleton loading for dashboard cards and charts.

## Testing

- Verify `/dashboard` is reachable from the sidebar.
- Verify active navigation styling on `/dashboard`, `/intakes`, `/users`, and `/implementations`.
- Verify dashboard renders correctly in loading, error, and populated states.
- Verify responsive layout still works on desktop and smaller widths.

## Implementation Notes

- Prefer reusing and refining `DashboardPage`, `DashboardLayout`, `StatsGrid`, `ChartSection`, and `StatsCard`.
- Avoid introducing new dependencies.
- Keep copy concise and consistent with the existing Vietnamese UI labels.
