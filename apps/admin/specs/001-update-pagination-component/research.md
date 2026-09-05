# Research: Update Pagination Component

## Overview

No unknowns were identified in this feature. The entire migration is fully understood from codebase analysis of the source files and the new pagination component.

## Decision: Migrate to new Pagination component

**What was chosen**: Replace all three existing pagination usages with the new unified `Pagination` component at `@/shared/ui/pagination`.

**Rationale**:
- The new component is already implemented and available at `src/shared/ui/pagination.tsx`
- Its API (`currentPage`, `totalPages`, `onPageChange`) matches the prop semantics used in all three target files
- No prop mapping, adapters, or data-layer changes are required
- The old components (`SimplePagination` and the composite `Pagination*` exports) are superseded

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| Keep both old and new components | User explicitly requested migration to the new component |
| Migrate incrementally (keep old for fallback) | No fallback needed; new component is fully functional |
| Implement a shared wrapper/adapter | Unnecessary; API is already compatible |
