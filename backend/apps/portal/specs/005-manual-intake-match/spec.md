# Feature Specification: Manual Intake Match Button

**Feature Branch**: `005-manual-intake-match`
**Created**: 2026-03-31
**Status**: Draft
**Input**: User description: "tôi muốn tạo một button matching giải pháp trong màn hình intake detail gọi vào api POST /my/intakes/:id/compute-matches, button nằm ở phần sidebar bên phải màn hình, nổi bật nó lên"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trigger Manual Match from Intake Detail Sidebar (Priority: P1)

A logged-in user views their own published intake on the Intake Detail page. In the right sidebar, a visually prominent "Tìm kiếm giải pháp phù hợp" (Match Solutions) button is displayed. When clicked, the system immediately shows a processing notification and triggers the matching algorithm. Once complete, the user sees a success notification indicating how many matches were found.

**Why this priority**: This is the entire feature — the button is the sole deliverable. Without it, no value is delivered.

**Independent Test**: Open any own published intake's detail page → locate the prominent Match button in the right sidebar → click it → confirm loading notification appears immediately → confirm success notification with match count appears after processing. No other feature dependency required.

**Acceptance Scenarios**:

1. **Given** a user is viewing their own published intake's detail page, **When** they click the Match Solutions button in the right sidebar, **Then** an immediate processing notification appears ("Hệ thống đang xử lý, vui lòng chờ giây lát") and the button is disabled to prevent double-clicks.
2. **Given** the matching process completes successfully, **When** the response is received, **Then** the processing notification is replaced with a success notification showing the number of matches found (e.g., "Tìm thấy 3 kết quả phù hợp").
3. **Given** the matching process fails or the server returns an error, **When** the error is received, **Then** the notification shows a clear error message and the button is re-enabled so the user can retry.
4. **Given** the intake is in draft status, **When** the user views the detail page, **Then** the Match button is hidden or visibly disabled, communicating it requires published status.

---

### User Story 2 - Button is Visually Prominent (Priority: P2)

The "Match Solutions" button is visually distinguished from other action buttons in the sidebar. It uses a distinctive color, icon, or elevated styling that draws the user's attention, communicating this is a primary, high-value action.

**Why this priority**: The user explicitly requested the button be prominent ("nổi bật nó lên"). Without visual distinction, the feature's intent is only partially met.

**Independent Test**: Open an intake detail page → observe the right sidebar → without any explanation, a new user should immediately identify the Match button as distinct from adjacent action buttons.

**Acceptance Scenarios**:

1. **Given** the intake detail page is displayed, **When** the user looks at the right sidebar, **Then** the Match button uses a distinctive visual treatment (accent color, icon, size) compared to other buttons.
2. **Given** the button is in its default state, **When** compared to "Edit" and other sidebar actions, **Then** the Match button stands out as the primary call-to-action.

---

### Edge Cases

- What happens when the intake is a draft? → Button is hidden or disabled; the backend rejects matching on non-published intakes with a 422 error.
- What happens when the user's session expires before clicking? → Standard authentication redirect to login applies.
- What happens when the matching process takes a long time? → The loading notification persists until a response is received.
- What happens when the user navigates away while matching is in progress? → The request may complete in the background, but no notification is shown after navigation.
- What happens when the intake belongs to another user? → Button is not shown; the detail page limits actions to the intake owner.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Match Solutions" button in the right sidebar of the Intake Detail page for the intake owner.
- **FR-002**: The button MUST be visually prominent — styled distinctly from other sidebar action buttons using a primary or accent color and an icon.
- **FR-003**: When clicked, the button MUST immediately show a processing notification ("Hệ thống đang xử lý, vui lòng chờ giây lát") and disable itself to prevent duplicate requests.
- **FR-004**: On successful completion, the system MUST show a success notification that includes the number of matches found.
- **FR-005**: On failure, the system MUST show an error notification and re-enable the button so the user can retry.
- **FR-006**: The button MUST only be active when the intake is in published status; for draft intakes it must be hidden or disabled.
- **FR-007**: The button MUST only appear for the intake's owner; it must not be shown to other users viewing the same intake.

### Key Entities

- **Intake**: The content item being matched. Key attributes: `id`, `status` (must be `published`), `userId` (must match current user).
- **MatchResult**: The outcome of the matching operation. Key attribute: `matchCount` (integer) — the number of compatible counterpart intakes found.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Match button is visible in the right sidebar without scrolling on a standard desktop viewport.
- **SC-002**: The processing notification appears within 300ms of the button click — no perceived delay before feedback.
- **SC-003**: 100% of manual match requests on published own intakes return a success or error notification — no silent failures.
- **SC-004**: The Match button is visually distinguishable from other sidebar actions by at least two independent observers without explanation (distinct color/icon/weight).

## Assumptions

- The Intake Detail page already has an established right sidebar section with action buttons; the Match button is added to this existing area.
- The user-facing endpoint is `POST /my/intakes/:id/compute-matches`. Admin-triggered matching is out of scope for this UI feature.
- The matching API responds synchronously — the HTTP response arrives when matching is complete, not as a fire-and-forget job requiring polling.
- Toast/notification feedback uses the existing `sonner` notification system already in the project.
- Only the intake owner sees the button; ownership is determined by the current authenticated user's identity.
- Mobile/responsive layout is not in scope for this iteration.
