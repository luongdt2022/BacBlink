# Feature Specification: Intake Match Tab Refresh

**Feature Branch**: `008-intake-match-tab`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "mục Nhu cầu phù hợp trong màn hình intakes/detail?id=94a09839-64cb-4190-b266-9c589e423d02 hãy cho nó thành một tab nổi bật, hãy nghiên cứu UI cho phù hợp, button tìm kiếm giải pháp phù hợp cũng thiêt kế lại, nếu đã có giải pháp rồi thì khi click vào hãy bật một popup xác nhận tìm kiếm lại."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Highlight Matching as a Primary Tab (Priority: P1)

A logged-in user opens the Intake Detail page and can immediately recognize that matching is a primary workflow, not a secondary section at the bottom. The existing "Nhu cầu phù hợp" or "Giải pháp phù hợp" area is elevated into a visually prominent tab in the main detail experience, making match results easier to discover and revisit.

**Why this priority**: Visibility is the core problem. If users do not notice the matching area, they will miss the value of the feature even when matches already exist.

**Independent Test**: Open a published intake detail page that already has matches → confirm a dedicated, visually prominent matching tab is visible in the main page layout → click it → confirm matched results are shown within that tab without needing to scroll to a hidden bottom section.

**Acceptance Scenarios**:

1. **Given** a user is viewing an intake detail page with existing match results, **When** the page loads, **Then** the matching area is presented as a dedicated tab that is visually more prominent than a normal content subsection.
2. **Given** a user is viewing the detail page, **When** they scan the main content tabs, **Then** they can immediately distinguish the matching tab from surrounding content through stronger visual emphasis and clear labeling.
3. **Given** the intake has one or more matches, **When** the user opens the matching tab, **Then** they see the matched items and the total result count in the tab context.
4. **Given** the intake has no matches yet, **When** the user opens the matching tab, **Then** they see a clear empty state that explains no suitable results have been found yet.

---

### User Story 2 - Redesign the Match Search Action (Priority: P2)

A user viewing a published intake can trigger matching from a redesigned action that feels intentional and high-value instead of looking like a generic sidebar button. The action communicates both purpose and current state, helping the user understand whether they are about to generate match results for the first time.

**Why this priority**: The user explicitly asked for a stronger UI treatment. The call-to-action must be visually aligned with the elevated importance of matching in the page.

**Independent Test**: Open a published intake detail page with no matches → locate the redesigned match action without guidance → click it → confirm the system starts matching and the action clearly communicates progress and intent.

**Acceptance Scenarios**:

1. **Given** a user is viewing their own published intake detail page, **When** the page renders, **Then** the match-search action appears with a more distinctive visual treatment than standard metadata or utility actions.
2. **Given** the intake has not yet produced match results, **When** the user clicks the action, **Then** the system starts a match search immediately and provides clear in-context feedback that the request is being processed.
3. **Given** the page contains other information panels and controls, **When** the user compares them visually, **Then** the match-search action remains identifiable as a primary workflow action.

---

### User Story 3 - Confirm Before Re-searching Existing Matches (Priority: P3)

If a user already has match results for an intake, clicking the match-search action should not immediately overwrite or refresh them. Instead, the system pauses and asks the user to confirm that they want to search again, making the action deliberate and reducing accidental reruns.

**Why this priority**: Once results already exist, rerunning the search is a higher-impact action. A confirmation step protects the user from accidental clicks and makes the consequence explicit.

**Independent Test**: Open a published intake detail page that already has matches → click the redesigned match-search action → confirm a confirmation popup appears before any new search starts → choose cancel and confirm nothing changes → click again and confirm the search runs only after explicit confirmation.

**Acceptance Scenarios**:

1. **Given** a user is viewing a published intake detail page with existing match results, **When** they click the match-search action, **Then** a confirmation popup appears before any new search is triggered.
2. **Given** the confirmation popup is open, **When** the user cancels, **Then** the popup closes and the existing match results remain unchanged.
3. **Given** the confirmation popup is open, **When** the user confirms they want to search again, **Then** the system starts a new match search and provides the same progress feedback as a first-time search.
4. **Given** a published intake has no existing matches, **When** the user clicks the match-search action, **Then** no confirmation popup is shown and the search starts directly.

---

### Edge Cases

- What happens when the intake is in draft status? → The match-search action remains unavailable, consistent with the existing rule that matching is only available for published intakes.
- What happens when old match results exist but are stale or no longer relevant? → The interface still treats them as existing results and requires confirmation before running a new search.
- What happens when the user closes the confirmation popup without choosing an action? → No new search is triggered and the current page state remains unchanged.
- What happens when a new search returns zero results after older results existed? → The matching tab updates to the latest result state and shows the empty state clearly.
- What happens when matching is already in progress and the user clicks again? → The action stays unavailable until the current request completes, preventing duplicate runs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Intake Detail page MUST present the matching area as a dedicated tab in the main detail experience rather than only as a lower-page content section.
- **FR-002**: The dedicated matching tab MUST be visually emphasized so users can quickly identify it as an important workflow area.
- **FR-003**: The label of the matching tab MUST reflect the intake type using the existing business language for counterpart results.
- **FR-004**: When match results exist, the matching tab MUST display the result count in a way that is visible from the tab itself.
- **FR-005**: When no match results exist, the matching tab MUST display a clear empty state that guides the user toward running a match search.
- **FR-006**: The match-search action on the Intake Detail page MUST be redesigned so it stands out from surrounding informational elements and standard actions.
- **FR-007**: The redesigned match-search action MUST only be available for published intakes that are eligible for manual matching.
- **FR-008**: When the intake has no existing match results, clicking the match-search action MUST start the search immediately.
- **FR-009**: When the intake already has one or more match results, clicking the match-search action MUST open a confirmation popup before any new search begins.
- **FR-010**: The confirmation popup MUST explain that a new search will rerun matching for the current intake and require the user to explicitly confirm or cancel.
- **FR-011**: If the user cancels from the confirmation popup, the system MUST not start a new search and MUST preserve the current results view.
- **FR-012**: If the user confirms from the confirmation popup, the system MUST start a new search and show the same progress feedback used for first-time matching.
- **FR-013**: The interface MUST prevent duplicate match-search requests while a search is already in progress.
- **FR-014**: The matching tab and the redesigned action MUST work together so users can understand both the current result state and the next recommended action from the same page.

### Key Entities *(include if feature involves data)*

- **Intake Detail Matching Tab**: The primary page destination for viewing counterpart match results for the current intake; includes label, emphasis state, result count, and tab content.
- **Match Search Action**: The primary call-to-action for generating or regenerating matches for the current intake; includes default state, loading state, and eligibility state.
- **Re-search Confirmation**: A confirmation popup shown only when prior results already exist; records the user's choice to proceed or cancel before rerunning matching.
- **Match Result Set**: The currently available counterpart results associated with the intake; may be populated, empty, or replaced by a more recent search outcome.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a standard desktop viewport, users can identify the matching tab as a primary area of the Intake Detail page within 5 seconds of page load.
- **SC-002**: Users can open the matching tab and reach the current result list in 1 click from the Intake Detail page.
- **SC-003**: Users with existing match results receive an explicit confirmation step before rerunning matching in 100% of retest attempts.
- **SC-004**: Users can distinguish whether an intake already has results or still needs a first-time search without reading backend status or leaving the detail page.
- **SC-005**: The redesigned match-search action provides visible progress feedback quickly enough that users do not retry due to uncertainty after clicking.

## Assumptions

- The Intake Detail page already has an established tab pattern that can accommodate one more high-priority tab without introducing a separate page.
- Existing match results remain the authoritative source for whether a confirmation popup is required before rerunning matching.
- The current manual matching workflow and backend permissions remain unchanged; this feature only improves the detail-page experience around that workflow.
- The confirmation step is limited to published intakes that already have at least one current result.
- Desktop web is the primary design target for this enhancement; responsive refinements can follow the same behavior later.
