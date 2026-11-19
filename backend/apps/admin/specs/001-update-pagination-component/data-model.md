# Data Model: Update Pagination Component

## Pagination Component Interface

The feature is a UI component migration. No application data entities are affected; the "data model" here is the component API contract.

### New Pagination Component (`@/shared/ui/pagination`)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentPage` | `number` | Yes | 1-indexed current page number |
| `totalPages` | `number` | Yes | Total number of pages; component renders nothing if ≤ 1 |
| `onPageChange` | `(page: number) => void` | Yes | Callback invoked with the new page number on user interaction |
| `className` | `string` | No | Additional CSS classes passed to the root `<div>` |

**Internal behavior** (not part of the contract but documented for testability):
- Renders nothing when `totalPages <= 1`
- Disables Previous button when `currentPage <= 1`
- Disables Next button when `currentPage >= totalPages`
- Displays ellipsis (`…`) when total pages exceed the visible range threshold
- Applies `bg-brand` / `border-brand` style to the active page button

### Prop Compatibility with Existing Code

| Target File | Existing Props | Compatible |
|-------------|---------------|------------|
| `UserActivityTab.tsx` | `currentPage`, `totalPages`, `onPageChange` | ✅ Yes |
| `UserSettingsTab.tsx` | `currentPage`, `totalPages`, `onPageChange` | ✅ Yes |
| `IntakesPage.tsx` | `page`, `totalPages`, `setPage` (via `() => setPage(n)`) | ✅ Yes |

All three files pass `onPageChange` as an inline arrow function calling their existing state setters — no changes to state logic required.
