# Feature Specification: Update Intake List Filter

**Feature Branch**: `002-update-intake-list-filter`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "mình đang cần update lại api backend cũng như giao diện của list intake, cần update api phía backend, để nhận thêm param status đồng thời phải update lại hiển thị số lượng các item theo status ở nút filter"

## User Scenarios & Testing

### User Story 1 - Filter Intakes by Status (Priority: P1)

Authenticated user wants to filter their intakes by status (draft/published) directly from the API.

**Acceptance Scenarios**:

1. **Given** the user is on the intake list page, **When** the user clicks on a status filter tab (All/Draft/Published), **Then** the API is called with the `status` parameter and only filtered results are returned.

### User Story 2 - Display Status Counts in Filter Tabs (Priority: P1)

Authenticated user wants to see the count of intakes for each status directly in the filter tabs.

**Acceptance Scenarios**:

1. **Given** the user is on the intake list page, **When** the page loads, **Then** each filter tab shows the correct count (total, draft count, published count) from the API's `totalByStatus` response.
2. **Given** the user has applied other filters (type, sector, search), **When** the counts are displayed, **Then** the counts should reflect the filtered results.

## Requirements

### Functional Requirements

- **FR-001**: The `GET /api/v1/my/intakes` endpoint MUST accept an optional `status` query parameter (values: `draft`, `published`).
- **FR-002**: When `status` is provided, the API MUST return only intakes matching that status.
- **FR-003**: The API response MUST include a `totalByStatus` object with counts: `{ draft: number, published: number }`.
- **FR-004**: The frontend filter tabs MUST display counts from the API's `totalByStatus` field.
- **FR-005**: When filters change (status, type, sector, search), the counts MUST be updated to reflect the current filtered results.

### API Changes Required

**Backend** (`dmst-backend/src/intakes/intakes.service.ts`):

- Modify `findMyIntakes()` to:
  - Accept and apply `status` filter parameter
  - Return `totalByStatus` in the response (similar to `findAll()` method)

**Backend** (`dmst-backend/src/intakes/user-intakes.controller.ts`):

- Add `@ApiQuery` for `status` parameter to `findMyIntakes` endpoint (already defined in QueryIntakeDto but not used in controller)

**Frontend** (`src/features/intakes/api/intake.ts`):

- Update `getMyIntakes()` to pass `status` parameter to API call

**Frontend** (`src/features/intakes/pages/IntakesPage.tsx`):

- Pass `status` to API call
- Use `totalByStatus` from API response for filter tab counts instead of client-side counting
- Remove client-side filtering logic

## Success Criteria

- **SC-001**: Clicking on "Draft" filter tab calls API with `?status=draft` and shows only draft intakes.
- **SC-002**: Clicking on "Published" filter tab calls API with `?status=published` and shows only published intakes.
- **SC-003**: The filter tabs display accurate counts from `totalByStatus` API response.
- **SC-004**: Combined filters (status + search, status + type) work correctly.

## Technical Notes

- The `findAll()` method already implements `totalByStatus` - replicate this pattern in `findMyIntakes()`.
- The frontend currently does client-side filtering - this should be moved to server-side.
