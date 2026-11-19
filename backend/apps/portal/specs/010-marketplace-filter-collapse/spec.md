# Feature Specification: Marketplace Filter Collapse Panel

**Feature Branch**: `010-marketplace-filter-collapse`  
**Created**: 2026-04-06  
**Status**: Draft  
**Input**: User description: "check lại tài liệu `specs/009-marketplace-live-data/quickstart.md` sau đó update UI phần filter, cho một button lọc ở bên dưới box tìm kiếm sử dụng dạng collapse để expand ra các dropdown"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggle Filter Panel From Search Area (Priority: P1)

As a marketplace user, I want a visible "Lọc" action directly under the search box so I can open and close filtering options without using a persistent sidebar.

**Why this priority**: This is the main UX change requested and affects discoverability of filtering controls for all users.

**Independent Test**: Open `/marketplace` and verify a filter button appears below search, defaults to collapsed state, and can expand/collapse the filter panel.

**Acceptance Scenarios**:

1. **Given** the marketplace page is loaded, **When** I view the search area, **Then** I see a filter button positioned below the search box.
2. **Given** the filter panel is collapsed, **When** I click the filter button, **Then** the panel expands and shows filter controls.
3. **Given** the filter panel is expanded, **When** I click the filter button again, **Then** the panel collapses without leaving stale visual artifacts.

---

### User Story 2 - Apply Filters Using Dropdown Controls (Priority: P2)

As a marketplace user, I want filters in dropdown format so I can quickly choose values and refine visible results.

**Why this priority**: The requested UI pattern is dropdown-based filtering inside an expandable area.

**Independent Test**: Expand filter panel, choose a dropdown value, and verify results and result count update correctly.

**Acceptance Scenarios**:

1. **Given** the panel is expanded, **When** I open a filter dropdown, **Then** I can see available options sourced from current marketplace filter data.
2. **Given** I select a dropdown option, **When** the selection is applied, **Then** visible results and the displayed total update consistently with the active filter.
3. **Given** a filter value is active, **When** I clear filter selection, **Then** the default unfiltered list for the current tab is restored.

---

### User Story 3 - Keep Tab and Pagination Behavior Consistent (Priority: P3)

As a marketplace user, I want the new filter UI to work consistently with tab switching and paginated results so browsing remains predictable.

**Why this priority**: The new filter presentation must not break existing live-data browsing behavior.

**Independent Test**: Apply filter, switch tabs, and paginate; verify each tab keeps coherent results with page size rules and filter context.

**Acceptance Scenarios**:

1. **Given** I am on one marketplace tab, **When** I switch to the other tab, **Then** filter UI remains available in the same location and layout pattern.
2. **Given** filtered results span multiple pages, **When** I navigate pages, **Then** each page shows up to 9 results with stable controls.
3. **Given** no results match current filter criteria, **When** the list refreshes, **Then** an empty state appears and the interface remains usable.

---

### Edge Cases

- What happens when the sector catalog cannot be loaded while intake results are available?
- How does the page behave when the selected dropdown value no longer exists in refreshed filter options?
- What happens when users rapidly toggle collapse state while results are loading?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The marketplace page MUST display a filter button directly below the search box for both tabs.
- **FR-002**: The filter area MUST use a collapsed-by-default panel that can be expanded and collapsed by the user.
- **FR-003**: Expanded filter content MUST be presented with dropdown-style controls instead of a persistent sidebar checklist layout.
- **FR-004**: The dropdown options MUST reflect currently available marketplace filter data and avoid hard-coded deprecated filter groups.
- **FR-005**: Applying or clearing a dropdown filter MUST refresh visible results and displayed totals for the active tab.
- **FR-006**: The page MUST preserve existing search behavior and combine it with active dropdown filter state.
- **FR-007**: The page MUST keep paginated browsing behavior with a fixed page size of 9 results per page.
- **FR-008**: When filter data fails to load, the page MUST keep marketplace results accessible and present a clear fallback message in the filter area.
- **FR-009**: The updated filter UI MUST remain visually consistent with the existing marketplace design language.

### Key Entities *(include if feature involves data)*

- **Filter Panel State**: Represents collapsed/expanded visibility and active controls for the current tab.
- **Dropdown Filter Option**: Represents a selectable filter value with user-facing label and underlying identifier.
- **Marketplace Query Context**: Represents active tab, search text, selected dropdown value, and current pagination state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of marketplace sessions show a visible filter button below the search box on both tabs.
- **SC-002**: Users can expand the filter panel and apply at least one dropdown filter in under 10 seconds in acceptance testing.
- **SC-003**: 100% of paginated result views display no more than 9 items per page after filter or search changes.
- **SC-004**: In manual regression checks, no legacy sidebar-only filter layout remains on the marketplace page.

## Assumptions

- The marketplace continues using the existing live-data source and current tab model (`ip` and `challenge`).
- Only currently supported filter dimensions remain in scope; previously removed filter groups stay out of scope.
- Dropdown filtering remains focused on the same business filter set already validated in the current feature baseline.
- Existing card, empty state, and loading state components remain reusable without a full visual redesign.
