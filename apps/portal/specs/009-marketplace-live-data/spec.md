# Feature Specification: Marketplace Live Data

**Feature Branch**: `009-marketplace-live-data`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User description: "ở màn hình này, hiện tại chưa gọi API để lấy data thật http://localhost:5173/marketplace đang có các thành phần kho công nghệ IP, thị trường bài toán challenge. hãy gọi api này để lấy data /api/v1/my/intakes?page=1&limit=10, api sector để làm filter /api/v1/sectors, phần Mức độ TRL, Đơn vị, Nguồn cung (Giải pháp công nghệ), Ngân sách,  tạm thời bỏ. hình ảnh của intake chưa có thì để ảnh default."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load Marketplace Tabs From Real Intake Data (Priority: P1)

An authenticated user opens the Marketplace page and sees the two existing marketplace areas, "Kho Công nghệ/IP" and "Thị trường Bài toán", populated from real intake data instead of mock content. The page separates the returned records into the appropriate tab based on intake type so the marketplace reflects the user's actual accessible dataset.

**Why this priority**: Without real data, the marketplace is not trustworthy or usable. Replacing mock content with live records is the core value of this feature.

**Independent Test**: Open `/marketplace` while authenticated → confirm the page requests the real intake list → confirm the IP tab shows only IP-type records and the Challenge tab shows only Challenge-type records from the returned dataset.

**Acceptance Scenarios**:

1. **Given** an authenticated user opens the Marketplace page, **When** the page loads, **Then** the marketplace uses the intake list endpoint as the source of truth rather than local mock data.
2. **Given** the intake list contains records of type `ip` and `challenge`, **When** the page organizes the results, **Then** IP records appear under "Kho Công nghệ/IP" and Challenge records appear under "Thị trường Bài toán".
3. **Given** the intake list request returns up to 10 records, **When** the page finishes loading, **Then** the visible marketplace cards reflect that returned set and the result count matches the displayed cards.
4. **Given** the intake list request returns no records for one tab, **When** the user opens that tab, **Then** the page shows a clear empty state instead of mock cards.

---

### User Story 2 - Filter Marketplace Results By Sector (Priority: P2)

An authenticated user can narrow marketplace results by sector using filter options loaded from the sector list endpoint. The same real sector list is used across both marketplace tabs so filtering stays aligned with the intake data model.

**Why this priority**: Once the page uses live intake data, filtering must also use live reference data; otherwise the filter choices become inconsistent and misleading.

**Independent Test**: Open `/marketplace` → wait for filters to load → select one or more sector filters → confirm both the visible result count and cards update to only show records belonging to the chosen sectors.

**Acceptance Scenarios**:

1. **Given** the Marketplace page loads successfully, **When** the sector filter area is shown, **Then** the available sector options come from the sector list endpoint rather than hard-coded values.
2. **Given** a user selects one or more sectors in the active tab, **When** filtering is applied, **Then** only records associated with those sectors remain visible.
3. **Given** no sectors are selected, **When** the page is displaying results, **Then** sector filtering does not exclude any records.
4. **Given** the active tab changes between IP and Challenge, **When** the user views the filter area, **Then** the sector filter remains usable with the same live sector vocabulary.

---

### User Story 3 - Simplify Filters And Fallback Media (Priority: P3)

The Marketplace page temporarily hides filters that are not yet backed by live data and ensures every intake card still renders cleanly when a record has no uploaded image. This keeps the live-data version usable and visually stable while unsupported filter dimensions remain out of scope.

**Why this priority**: Showing unsupported filters or broken card images would immediately reduce trust in the live marketplace, even if the primary data load works.

**Independent Test**: Open `/marketplace` with live data containing records without images → confirm cards render with a default image; confirm the TRL, Đơn vị, Nguồn cung, and Ngân sách filters are not shown.

**Acceptance Scenarios**:

1. **Given** the live-data marketplace is rendered, **When** the user opens the filter column, **Then** the unsupported filters for TRL, Đơn vị, Nguồn cung, and Ngân sách are absent from the UI.
2. **Given** a marketplace card is built from an intake without a profile image, **When** the card renders, **Then** a default placeholder image is displayed instead of an empty or broken image region.
3. **Given** some live records have images and others do not, **When** the result grid is displayed, **Then** all cards still maintain a consistent layout and usable visual presentation.

---

### Edge Cases

- What happens when the intake list endpoint succeeds but returns only IP records or only Challenge records? → The populated tab shows live records and the other tab shows an empty state.
- What happens when the sector list endpoint fails but intake data loads? → Marketplace records still load, and the sector filter area falls back to an unavailable or empty-filter state without showing invalid hard-coded options.
- What happens when an intake has no sector associations? → The record remains visible when no filter is selected and is excluded when the user filters to specific sectors.
- What happens when the intake has no image? → The card uses the default image.
- What happens when the search query is used together with sector filtering? → Both constraints apply together to the visible results in the active tab.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Marketplace page MUST load its primary record set from the authenticated intake list source instead of mock data.
- **FR-002**: The Marketplace page MUST request up to 10 intake records for the initial live-data view.
- **FR-003**: The page MUST separate loaded records into the existing IP and Challenge marketplace tabs using the intake type.
- **FR-004**: The displayed result count in each tab MUST reflect the number of visible live records after search and filter rules are applied.
- **FR-005**: The Marketplace page MUST load sector options from the sector list source and use them as the available filter choices.
- **FR-006**: Users MUST be able to filter visible IP and Challenge records by sector using the live sector list.
- **FR-007**: When no sector filter is selected, the marketplace MUST show all records that match the active tab and search criteria.
- **FR-008**: The Marketplace page MUST keep the existing keyword search behavior for the live-data result set.
- **FR-009**: The Marketplace page MUST temporarily remove the filters for Mức độ TRL, Đơn vị, Nguồn cung (Giải pháp công nghệ), and Ngân sách from the live-data UI.
- **FR-010**: When an intake has no image, its marketplace card MUST display a default placeholder image.
- **FR-011**: The Marketplace page MUST show an empty state when the active tab has no visible records after loading and filtering.
- **FR-012**: The page MUST remain usable when sector data is unavailable, without falling back to outdated hard-coded filter values.

### Key Entities *(include if feature involves data)*

- **Marketplace Intake Record**: A live intake item shown in the Marketplace page; key attributes include `id`, `type`, title, owner/enterprise display text, sector associations, optional image, and tab placement.
- **Sector Filter Option**: A live sector reference item used to build filter choices and match records by sector association.
- **Marketplace Card Media State**: The visual state that determines whether a record uses its own image or the shared default placeholder image.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users opening the Marketplace page see live marketplace records instead of mock content on their first page load.
- **SC-002**: Users can switch between the IP and Challenge tabs and always see records that match the selected tab's intake type.
- **SC-003**: Users can narrow results by sector in the active tab in under 2 interactions after the filter options load.
- **SC-004**: 100% of marketplace cards render with a visible image area, even when the underlying intake has no uploaded image.
- **SC-005**: The live-data Marketplace page exposes only currently supported filters, reducing dead-end filter interactions to zero for the temporarily removed dimensions.

## Assumptions

- The Marketplace page is intended for authenticated users in this iteration, so using the authenticated intake source is acceptable for the live-data rollout.
- The first release of live marketplace data uses the initial page of 10 records without introducing pagination changes in this feature.
- Existing intake records already contain enough information to populate the current marketplace card layouts with reasonable display text.
- A single shared default image asset can represent records that do not yet have uploaded media.
- Temporarily removed filters can return in a later iteration once supported live data is available for them.
