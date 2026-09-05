# Dashboard IP And Challenge Split Design

## Scope

Update the admin dashboard so intake-related metrics are no longer shown as a single aggregate bucket. Instead, the UI should distinguish `IP` and `Challenge` in both summary cards and charts. This requires extending the backend stats response and updating the frontend dashboard visualizations to consume the richer shape.

## Goals

- Make dashboard metrics immediately distinguishable between `IP` and `Challenge`.
- Preserve the current dashboard route and general information architecture.
- Keep user-related stats unchanged.
- Extend the existing admin stats API rather than creating a separate endpoint.

## Non-Goals

- No route changes.
- No redesign of non-dashboard pages.
- No changes to intake business rules or submission flows.
- No renaming of backend entities or endpoint paths.

## Proposed UI Changes

### Summary Cards

- Replace the current aggregate intake card with two cards:
  - `Tổng IP`
  - `Tổng Challenge`
- Keep the existing user cards:
  - `Tổng User`
  - `User đang hoạt động`
- Arrange the stats grid responsively so the extra card does not break the current layout.

### Monthly Trend Chart

- Replace the single-series intake line chart with a dual-series chart:
  - one line for `IP`
  - one line for `Challenge`
- Keep the time-range filter behavior unchanged.

### Status Chart

- Replace the single aggregate status chart with a grouped comparison chart where each status bucket displays:
  - `IP`
  - `Challenge`

### Sector Chart

- Keep the sector chart as an aggregate view for now.
- Continue using sector as a shared business grouping across both intake types.

## Backend API Changes

Extend `GET /admin/stats/intakes` to return richer intake breakdowns while preserving existing top-level fields used elsewhere.

### Existing Fields To Keep

- `total`
- `byType`
- `bySector`

### Fields To Extend

- `byMonth`:
  - `year`
  - `month`
  - `ipCount`
  - `challengeCount`
- `byStatus`:
  - `draft: { ipCount, challengeCount }`
  - `published: { ipCount, challengeCount }`

## Frontend Data Flow

- `statsService` updates the `IntakeStats` TypeScript type to match the new API shape.
- `useStats` continues to fetch from the same endpoints.
- Dashboard cards read totals from `byType`.
- The monthly chart reads `ipCount` and `challengeCount` from `byMonth`.
- The status chart reads grouped values from the new `byStatus` structure.

## Error Handling

- Keep the current error banner behavior for stats loading failures.
- Do not introduce fallback transformations that silently merge `IP` and `Challenge` again.

## Testing

- Verify backend response shape for `GET /admin/stats/intakes`.
- Verify frontend type compatibility after the API shape update.
- Verify dashboard cards show separate totals for `IP` and `Challenge`.
- Verify monthly and status charts render separate `IP` and `Challenge` series correctly.
- Verify user-related charts remain unchanged.
