# Feature Specification: Update Pagination Component

**Feature Branch**: `001-update-pagination-component`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "mình cần thay thế chỗ nào dùng pagination thì sử dụng component pagination mới được update" (Replace all existing pagination usages with the new updated pagination component)

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Migrate pagination on User Activity page (Priority: P1)

The admin user views their IP and Lab tables on the User Activity page. Both tables currently use the old `SimplePagination` component (prev/next only). After migration, both tables display the updated pagination component with full page number navigation, ellipsis for large page ranges, and a page indicator.

**Why this priority**: User Activity page is a core user-facing page with two independent paginated tables; both must be migrated to maintain UI consistency and provide full navigation capability.

**Independent Test**: Can be fully tested by navigating to the User Activity page, changing pages on both the IP table and Lab table, and verifying the page indicator, page numbers, and prev/next buttons all update the correct table.

**Acceptance Scenarios**:

1. **Given** the admin is on the User Activity page with the IP table showing page 1 of 2+, **When** they click page number 2, **Then** the IP table updates to show page 2 and the pagination reflects current page = 2
2. **Given** the admin is on the User Activity page with the IP table on page 1 of 5+, **When** they click the "Next" button, **Then** the table advances to page 2 and the pagination shows page numbers with ellipsis as appropriate
3. **Given** the admin is on the User Activity page with the Lab table showing page 1 of 5+, **When** they click a middle page number, **Then** the Lab table updates and pagination correctly displays ellipsis around distant page numbers
4. **Given** the admin is on the first page of any table, **When** they click the Previous button, **Then** it remains disabled and no navigation occurs
5. **Given** the admin is on the last page of any table, **When** they click the Next button, **Then** it remains disabled and no navigation occurs

---

### User Story 2 - Migrate pagination on User Settings page (Priority: P1)

The admin user views their Challenges/Bài toán table on the User Settings page. The table currently uses the old `SimplePagination` component (prev/next only). After migration, it displays the updated pagination component with full page number navigation.

**Why this priority**: User Settings is a primary user dashboard page; migration is needed to ensure consistent pagination experience across all pages.

**Independent Test**: Can be fully tested by navigating to the User Settings page, interacting with the Challenges table pagination, and verifying page numbers and navigation controls work correctly.

**Acceptance Scenarios**:

1. **Given** the admin is on the User Settings page with the Challenges table on page 1 of 2+, **When** they click page 2, **Then** the table updates and the active page indicator shows page 2
2. **Given** the admin is on the User Settings page with the Challenges table on page 1, **When** they click the Next button, **Then** the table advances to page 2 with correct page number highlighted

---

### User Story 3 - Migrate pagination on Intakes page (Priority: P1)

The admin user views the Intakes table on the Intakes management page. The page already uses the component-based pagination (`Pagination`, `PaginationContent`, etc.) but imports from the old `shared/ui/pagination` file. After migration, the page imports from the new `shared/ui/pagination` file which has the updated implementation.

**Why this priority**: Intakes page is a central data management page; migration ensures it uses the latest pagination implementation for consistent behavior.

**Independent Test**: Can be fully tested by navigating to the Intakes page, changing page numbers, and verifying all pagination controls (prev, next, page numbers, ellipsis) behave correctly.

**Acceptance Scenarios**:

1. **Given** the admin is on the Intakes page, **When** they click any page number, **Then** the table updates and the active page is visually highlighted
2. **Given** the admin is on the Intakes page with 5+ pages, **When** they navigate to a middle page, **Then** ellipsis appears correctly between the first/last pages and the current range

---

### Edge Cases

- When totalPages equals 1, the pagination bar should not render at all (consistent with the new component's behavior)
- When the user rapidly clicks page numbers, pagination state must remain consistent without ghost selections
- When navigating from a deep page back to page 1, ellipsis and page number rendering must update correctly

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST replace all usages of `SimplePagination` from `@/shared/ui/SimplePagination` with the new `Pagination` component from `@/shared/ui/pagination` on the User Activity page (IP table and Lab table)
- **FR-002**: System MUST replace the `SimplePagination` usage on the User Settings page with the new `Pagination` component
- **FR-003**: System MUST replace the import of pagination components from `@/shared/ui/pagination` (old) with the new updated `Pagination` component from the same path on the Intakes page
- **FR-004**: All migrated pagination instances MUST accept `currentPage`, `totalPages`, and `onPageChange` props matching the new component's interface
- **FR-005**: After migration, the old `SimplePagination` component MUST be removed from `@/shared/ui/SimplePagination` if no other consumers remain
- **FR-006**: The old `@/shared/ui/pagination` exports that were superseded by the update MUST be removed if no other consumers remain after migration
- **FR-007**: System MUST maintain the same visual layout and positioning of the pagination bar after migration (footer of each table section)

### Key Entities *(include if feature involves data)*

- **Pagination Component (New)**: Updated shared UI component at `@/shared/ui/pagination` providing full page number navigation with ellipsis, Previous/Next buttons, and page indicator
- **SimplePagination Component (Old)**: Legacy component at `@/shared/ui/SimplePagination` providing only Previous/Next buttons with page counter text
- **User Activity Tab**: Page with two independent paginated tables (IP table, Lab table) that currently use the old SimplePagination
- **User Settings Tab**: Page with one paginated table (Challenges/Bài toán) that currently uses the old SimplePagination
- **Intakes Page**: Management page with a paginated intake table that currently imports pagination components from the old `shared/ui/pagination` file

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 100% of existing pagination usages (3 files: UserActivityTab, UserSettingsTab, IntakesPage) are replaced with the new Pagination component
- **SC-002**: All 3 paginated tables continue to navigate correctly between pages after migration, with no regression in pagination behavior
- **SC-003**: The old SimplePagination component is removed or confirmed unused after all migrations are complete
- **SC-004**: Visual appearance of pagination remains consistent — page indicator, page numbers, and prev/next controls appear in the same footer position of each table

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- The new `Pagination` component at `@/shared/ui/pagination` is already fully implemented and ready for use
- The new component's API (`currentPage`, `totalPages`, `onPageChange`) is compatible with all existing pagination state management patterns in the three target files
- Migration is purely a find-and-replace of import statements and component usage; no behavioral changes to the data or state management logic are needed
- The old `@/shared/ui/pagination` and `@/shared/ui/SimplePagination` files will be removed after migration confirms no other usages exist
- No other pages beyond the 3 identified files use the old pagination components
