# Feature Specification: Public Intake Feed

**Feature Branch**: `012-public-intake-feed`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User description: "hãy xem api http://localhost:3022/api/v1/my/intakes?page=1&limit=10 và tạo một api tương tự như api này nhưng ở dạng có thể thấy được hết các bài ở chế độ published của tất cả các user khác"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse published intakes from other users (Priority: P1)

As an authenticated user, I want to view a paginated list of published intakes created by other users so that I can discover relevant public content without seeing my own entries mixed in.

**Why this priority**: This is the core business outcome of the feature and delivers immediate discovery value even without advanced filtering.

**Independent Test**: Can be fully tested by signing in as a user who has at least one personal intake and confirming the feed returns only published intakes owned by other users, with pagination metadata.

**Acceptance Scenarios**:

1. **Given** an authenticated user and at least one published intake owned by another user, **When** the user requests the discovery feed, **Then** the system returns those published intakes and excludes the requester's own intakes.
2. **Given** draft and published intakes exist across multiple users, **When** the user requests the discovery feed, **Then** only published intakes are returned.
3. **Given** there are more matching intakes than fit on one page, **When** the user requests a specific page and limit, **Then** the system returns the corresponding slice and complete pagination metadata.

---

### User Story 2 - Refine the discovery feed with filters (Priority: P2)

As an authenticated user, I want to narrow the discovery feed using the same basic filters I already use in my personal list so that I can find relevant published intakes faster.

**Why this priority**: Filtering improves usability and keeps the new feed aligned with the existing intake browsing experience.

**Independent Test**: Can be tested by creating published intakes with different types, sectors, and keywords, then confirming each filter limits the returned results correctly while still excluding the requester's own content.

**Acceptance Scenarios**:

1. **Given** published intakes of different types, **When** the user applies a type filter, **Then** only published intakes of that type from other users are returned.
2. **Given** published intakes linked to different sectors, **When** the user applies a sector filter, **Then** only matching published intakes from other users are returned.
3. **Given** published intakes with different titles or descriptions, **When** the user searches by keyword, **Then** only matching published intakes from other users are returned.

---

### User Story 3 - Handle empty and changing result sets safely (Priority: P3)

As an authenticated user, I want the discovery feed to respond predictably when no content matches or content visibility changes so that the browsing experience remains stable and understandable.

**Why this priority**: Predictable handling of empty or changing datasets reduces confusion and prevents front-end or user workflow failures.

**Independent Test**: Can be tested by requesting a page with no matching records, then changing an intake from published to non-published and confirming it disappears from later requests without causing an error response.

**Acceptance Scenarios**:

1. **Given** no published intakes from other users match the current filters, **When** the user requests the discovery feed, **Then** the system returns an empty list with valid pagination metadata.
2. **Given** a published intake becomes unavailable after a previous request, **When** the user refreshes or requests a later page, **Then** the unavailable intake is no longer returned.

### Edge Cases

- What happens when the authenticated user is the only user with any intakes in the system? The feed returns no records and valid pagination metadata.
- What happens when all matching intakes are drafts or otherwise unavailable? The feed returns no records and does not expose unavailable content.
- How does the system handle a page number beyond the final page? The feed returns an empty list and preserves pagination metadata without throwing an error.
- How does the system handle mixed ownership in matching results? Only intakes owned by users other than the requester are returned.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated user to retrieve a paginated discovery feed of intakes created by other users.
- **FR-002**: The system MUST include only intakes whose visibility status is published in the discovery feed.
- **FR-003**: The system MUST exclude any intake owned by the requesting user from the discovery feed.
- **FR-004**: The system MUST support pagination controls equivalent to the personal intake list, including page selection, page size, total results, and total pages.
- **FR-005**: The system MUST support filtering the discovery feed by intake type.
- **FR-006**: The system MUST support filtering the discovery feed by sector.
- **FR-007**: The system MUST support keyword search against the intake content used for list discovery.
- **FR-008**: The system MUST order discovery results from newest to oldest by default.
- **FR-009**: The system MUST return enough summary information in each discovery item for a user to identify the intake and distinguish that it belongs to another user.
- **FR-010**: The system MUST return an empty collection rather than an error when no published intakes from other users match the request.
- **FR-011**: The system MUST stop returning an intake as soon as it is no longer eligible for public discovery.

### Key Entities *(include if feature involves data)*

- **Discovery Feed Item**: A published intake that is eligible to be shown to an authenticated user because it belongs to another account and matches the active filters.
- **Requesting User Context**: The signed-in user identity used to exclude self-owned intakes from the discovery feed.
- **Discovery Filter Set**: The combination of pagination, type, sector, and keyword criteria applied to narrow the published feed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of discovery feed results are published intakes owned by users other than the requester.
- **SC-002**: In acceptance testing, users can retrieve the first page of the discovery feed and confirm whether relevant content exists in 5 seconds or less.
- **SC-003**: In acceptance testing, users can narrow discovery results by type, sector, or keyword in a single request with correct updated totals and page counts.
- **SC-004**: In acceptance testing, empty-result and out-of-range page requests return a valid paginated response in 100% of cases.

## Assumptions

- The feature reuses the existing signed-in user context already available for personal intake operations.
- The discovery feed is intended for authenticated users, because excluding the requester's own intakes requires knowledge of who is making the request.
- Existing intake metadata already provides the summary information needed to present a browsable list of published items from other users.
- Intakes that are draft, deleted, or otherwise unavailable are out of scope for public discovery and must not be exposed by this feature.
