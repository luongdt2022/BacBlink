# Implementation Plan: Update Pagination Component

**Branch**: `001-update-pagination-component` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-update-pagination-component/spec.md`

## Summary

Replace all three existing pagination usages (two `SimplePagination` usages in the User Activity and Settings tabs, one component-import usage in the Intakes page) with the new unified `Pagination` component at `@/shared/ui/pagination`. The new component provides full page-number navigation with ellipsis support, replacing the old prev/next-only and pre-built composite variants. After migration, the superseded old components are removed.

## Technical Context

**Language/Version**: TypeScript 5 / React 18
**Primary Dependencies**: React, Tailwind CSS, shadcn/ui (Button, AlertDialog), Lucide React, React Router DOM
**Storage**: N/A (UI migration, no data changes)
**Testing**: Vitest + React Testing Library (`npm test`), ESLint (`npm run lint`), TypeScript (`npm run typecheck`)
**Target Platform**: Web browser (SPA)
**Project Type**: Frontend web application (React + Vite)
**Performance Goals**: No performance impact expected; purely import/component substitution
**Constraints**: Migration must not alter any data, state, or business logic
**Scale/Scope**: 3 files to migrate, 2 old component files to remove after verification

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is a template with no active principles defined. No gates apply.

✅ **Pass** — No active constitutional gates; feature is a non-breaking UI component migration.

## Project Structure

### Documentation (this feature)

```text
specs/001-update-pagination-component/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output (Component API contract)
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── shared/
│   ├── ui/
│   │   ├── pagination.tsx          # NEW updated Pagination (target)
│   │   ├── SimplePagination.tsx    # OLD — remove after migration
│   │   └── button.tsx
│   └── components/
│       └── Pagination.tsx          # OLD composite — subsumed by pagination.tsx
├── features/
│   ├── users/
│   │   └── components/
│   │       ├── UserActivityTab.tsx   # Migrate: SimplePagination → Pagination
│   │       └── UserSettingsTab.tsx   # Migrate: SimplePagination → Pagination
│   └── intakes/
│       └── pages/
│           └── IntakesPage.tsx       # Migrate: old pagination imports → new path
```

**Structure Decision**: Single frontend project (React + Vite). The migration touches shared UI components and three feature page/tab files. No new projects or files are introduced; the old component files are deleted after migration is verified.

## Complexity Tracking

> No constitutional violations. No complexity tracking required.

## Phase 0: Research Findings

No unknowns identified. Migration is fully understood from codebase analysis:

- **Old `SimplePagination`** (`@/shared/ui/SimplePagination`): prev/next buttons only, no page numbers. Used in `UserActivityTab.tsx` (×2) and `UserSettingsTab.tsx` (×1).
- **Old composite Pagination components** (`@/shared/ui/pagination`): `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`. Used in `IntakesPage.tsx` with a custom `generatePageNumbers` helper inline.
- **New `Pagination`** (`@/shared/ui/pagination`): self-contained component accepting `currentPage`, `totalPages`, `onPageChange`, and `className`. Renders page indicator, full page numbers with ellipsis, and prev/next buttons internally.

**Migration pattern**:
- For files using `SimplePagination`: Replace import and component usage with new `Pagination` (same prop names).
- For `IntakesPage.tsx`: Remove inline `generatePageNumbers`, remove composite pagination imports, replace with new `Pagination`.

## Phase 1: Design

### Component API Contract

The new `Pagination` component interface:

| Prop | Type | Description |
|------|------|-------------|
| `currentPage` | `number` | 1-indexed current page number |
| `totalPages` | `number` | Total number of pages |
| `onPageChange` | `(page: number) => void` | Callback fired when user selects a page |
| `className` | `string` (optional) | Additional CSS classes |

**Contract guarantee**: All three target files already use `currentPage`, `totalPages`, and `onPageChange` with identical semantics. No prop mapping or adapter is required.

### Files to Modify

| File | Change |
|------|--------|
| `src/features/users/components/UserActivityTab.tsx` | Replace `SimplePagination` import and 2 usages with new `Pagination` |
| `src/features/users/components/UserSettingsTab.tsx` | Replace `SimplePagination` import and usage with new `Pagination` |
| `src/features/intakes/pages/IntakesPage.tsx` | Remove `generatePageNumbers` helper; replace composite pagination imports with `Pagination`; remove all composite pagination JSX |
| `src/shared/ui/SimplePagination.tsx` | Delete (after migration verified) |
| `src/shared/components/Pagination.tsx` | Delete (superseded by updated `src/shared/ui/pagination.tsx`; after migration verified) |

### Migration Notes

- No data-layer changes are needed — state (`page`, `setPage`) remains unchanged.
- Inline `generatePageNumbers` helper in `IntakesPage.tsx` becomes unused after migration and must be removed.
- A global search should be run after migration to confirm zero remaining imports of the old files before deletion.
- `npm run typecheck` and `npm run lint` should pass after each file migration.
