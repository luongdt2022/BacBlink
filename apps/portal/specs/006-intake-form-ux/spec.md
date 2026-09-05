# Feature Specification: Intake Form UX Update

**Feature Branch**: `006-intake-form-ux`
**Created**: 2026-04-01
**Status**: Draft
**Input**: User description: "update UI cho màn hình intakes/edit và các màn hình liên quan để tăng trải nghiệm UX, không còn nút lưu nháp, hãy thay vào đó là 2 option chọn công khai hay lưu nháp, button công khai thì đổi thành Lưu, làm nổi bật phần card chứa những button để nó không bị rối vào với mọi thứ xung quanh"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Status Selector Replaces Draft Button (Priority: P1)

A user editing or creating an intake currently sees two separate action buttons: "Lưu nháp" and "Công bố". This causes confusion about which button is the primary action. Instead, the user selects the desired status (Nháp or Công khai) via a segmented toggle/radio group, then clicks a single "Lưu" button to save. The save button always reads "Lưu" regardless of which status is selected.

**Why this priority**: This is the core UX change. Removing the separate draft button and replacing both actions with a status picker + single save button simplifies the mental model and reduces accidental publishes.

**Independent Test**: Open the intake create or edit page → confirm there is no "Lưu nháp" button → confirm there is a status selector with two options ("Nháp" and "Công khai") → select "Nháp" → click "Lưu" → intake is saved as draft. Repeat selecting "Công khai" → click "Lưu" → intake is saved as published.

**Acceptance Scenarios**:

1. **Given** a user is on the intake create/edit page, **When** the page loads, **Then** there is no standalone "Lưu nháp" button visible.
2. **Given** a user is on the intake create/edit page, **When** the page loads, **Then** a segmented control with two options — "Nháp" and "Công khai" — is visible in the action area.
3. **Given** a user has selected "Nháp" in the status selector, **When** they click "Lưu", **Then** the intake is saved/updated with status `draft`.
4. **Given** a user has selected "Công khai" in the status selector, **When** they click "Lưu", **Then** the intake is saved/updated with status `published` (existing validation: title and content required).
5. **Given** an existing intake with status `published` is opened for editing, **When** the page loads, **Then** the status selector defaults to "Công khai".
6. **Given** an existing intake with status `draft` is opened for editing, **When** the page loads, **Then** the status selector defaults to "Nháp".

---

### User Story 2 - Action Card Visual Prominence (Priority: P2)

The action button area at the bottom of the left sidebar currently blends into the surrounding form content, making it hard to identify as the primary action zone. The card containing the action buttons should stand out visually so users can immediately find where to save their work.

**Why this priority**: Visual clarity reduces cognitive load. Once US1 establishes the interaction model, US2 makes the action area easy to find. Can be implemented independently but delivers less value alone.

**Independent Test**: Open the intake create/edit page → without reading any labels, identify which area of the sidebar contains the save action → the action area should be visually distinct from the scrollable form fields above it.

**Acceptance Scenarios**:

1. **Given** a user opens the intake form page, **When** they look at the left sidebar, **Then** the action card at the bottom is visually separated and distinct from the scrollable form fields above (e.g., elevated background, shadow, or stronger border).
2. **Given** the action card contains the status selector and "Lưu" button, **When** a user scans the sidebar, **Then** they can identify the action zone without reading any labels.

---

### Edge Cases

- What if a user switches from "Công khai" to "Nháp" on a currently published intake and clicks "Lưu"? → The intake status is updated to `draft`.
- The status selector always has a pre-selected option (defaulting to the current saved status or "Nháp" for new intakes), so an empty/unselected state is not possible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The sidebar action area MUST NOT contain a standalone "Lưu nháp" button.
- **FR-002**: The sidebar action area MUST contain a segmented status selector with exactly two options: "Nháp" and "Công khai".
- **FR-003**: The status selector MUST default to "Nháp" for new intakes and to the current intake status for existing intakes.
- **FR-004**: The sidebar action area MUST contain a single primary save button labelled "Lưu".
- **FR-005**: Clicking "Lưu" MUST save the intake with the status currently selected in the status selector.
- **FR-006**: Existing validation rules (title required for draft; title + content required for published) MUST remain unchanged.
- **FR-007**: The status badge in the sidebar header MUST update to reflect the saved status after a successful save.
- **FR-008**: The action card MUST be visually prominent and clearly separated from the scrollable form fields above it.
- **FR-009**: The "Làm đẹp dữ liệu" button (edit mode only) MUST remain in the action area alongside the new controls.
- **FR-010**: The "Lưu" button MUST show a loading/disabled state while a save operation is in progress.

### Key Entities

- **IntakeStatus**: `'draft'` | `'published'` — the selected status in the selector determines which save handler is invoked.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users encounter only one save button ("Lưu") instead of two competing buttons ("Lưu nháp" / "Công bố").
- **SC-002**: Saving with a specific status requires exactly two interactions: one selector choice + one button click.
- **SC-003**: The action card is distinguishable from surrounding form content at a glance — no label reading required to locate it.
- **SC-004**: All existing save and publish behaviors (API calls, toast messages, navigation, validation) are preserved with no regression.

## Assumptions

- The change applies to both the create intake page and the edit intake page.
- "Công khai" in the selector maps to `status: 'published'`; "Nháp" maps to `status: 'draft'`.
- Existing success toast messages for draft and publish are reused unchanged.
- No backend changes are required — frontend only.
- The status badge in the sidebar header continues to reflect the last-saved status, not the selector's live selection.
