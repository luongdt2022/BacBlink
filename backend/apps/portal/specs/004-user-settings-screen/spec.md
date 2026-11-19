# Feature Specification: User Settings Screen

**Feature Branch**: `004-user-settings-screen`
**Created**: 2026-03-27
**Status**: Draft
**Input**: User description: "check qua structure của project hiện tại và thêm một màn hình Cài đặt tích hợp cài đặt vào đó qua tài liệu '/home/sotatek/projects/dmst-backend/specs/003-user-settings/quickstart.md'"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Toggle Auto-Matching Setting (Priority: P1)

A logged-in user navigates to the Settings screen (accessible via sidebar or user menu) and sees their current preference for automatic matching. By default, auto-matching is enabled. The user can toggle it on or off. The change is saved immediately and persists across sessions.

**Why this priority**: Auto-matching is the core configurable behaviour that directly affects how the system processes new IP/Challenge intakes. Giving users control over this is the primary purpose of the Settings screen.

**Independent Test**: Open the Settings page, verify the toggle shows the current state (`matchingAuto: true` by default), flip it to off, reload the page, and confirm the setting stayed off. This alone delivers full value for this story.

**Acceptance Scenarios**:

1. **Given** a user has never changed their settings, **When** they open the Settings screen, **Then** the auto-matching toggle is shown in the ON state.
2. **Given** the auto-matching toggle is ON, **When** the user turns it OFF and the change is confirmed, **Then** the setting is saved and reflected the next time the page loads.
3. **Given** the auto-matching toggle is OFF, **When** the user turns it ON, **Then** the setting is saved and the system resumes auto-matching for subsequent intakes.
4. **Given** a network error occurs while saving, **When** the user attempts to change the setting, **Then** the system shows an error message and reverts the toggle to its previous state.

---

### User Story 2 - Settings Are Per-User (Priority: P2)

Each user's settings are isolated. Changing one user's auto-matching preference does not affect another user's preference.

**Why this priority**: Data isolation is a correctness guarantee that builds trust in the settings system. Without it, the P1 story could be harmful.

**Independent Test**: Log in as User A, disable auto-matching. Log in as User B (separate session), open Settings, and confirm auto-matching is still ON (default). This verifies isolation with no additional UI needed.

**Acceptance Scenarios**:

1. **Given** User A has set auto-matching to off, **When** User B views their Settings, **Then** User B sees their own default (auto-matching on), unaffected by User A's preference.
2. **Given** two users are logged in concurrently, **When** one changes their settings, **Then** the other user's settings remain unchanged.

---

### User Story 3 - Navigate to Settings from Sidebar (Priority: P3)

The user can reach the Settings screen from the existing sidebar navigation. A Settings entry appears in the sidebar (or user dropdown menu at the bottom of the sidebar), allowing the user to navigate to `/settings` from any authenticated page.

**Why this priority**: Discoverability matters, but the screen delivers value regardless of how the user arrives. A direct URL works as a fallback.

**Independent Test**: Click the Settings entry in the navigation, confirm the Settings screen loads at `/settings` and the navigation item is highlighted as active. No other feature dependency required.

**Acceptance Scenarios**:

1. **Given** the user is on any authenticated page, **When** they click the Settings link in the navigation, **Then** they are taken to the Settings screen and the navigation item is highlighted as active.
2. **Given** the user is on the Settings screen, **When** they navigate away and return using the browser back button, **Then** the Settings screen reloads with the current saved values.

---

### Edge Cases

- What happens when the backend is unavailable when loading settings? Show a loading state, then a non-blocking error notice; display a neutral/default state rather than a blank page.
- What happens when the toggle change request fails mid-flight? Revert the UI toggle to its previous state and display an error message via the existing notification system.
- What happens when the user changes the setting and immediately navigates away? The in-flight save completes silently in the background; no data loss occurs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated Settings page accessible at the `/settings` route, protected by authentication (unauthenticated access redirects to login).
- **FR-002**: System MUST display the user's current `matchingAuto` preference on the Settings page, loaded from the backend on page mount.
- **FR-003**: System MUST allow the user to toggle the `matchingAuto` preference on or off directly on the Settings page.
- **FR-004**: System MUST persist the updated `matchingAuto` preference to the backend when the user changes it, without requiring a separate Save button (immediate save on toggle).
- **FR-005**: System MUST display a success or failure notification after attempting to save the setting, using the existing notification pattern.
- **FR-006**: System MUST revert the UI toggle to its previous state if the backend save fails.
- **FR-007**: System MUST add a navigation entry for Settings in the sidebar or user dropdown, so users can reach `/settings` from any authenticated page.
- **FR-008**: System MUST highlight the Settings navigation item as active when the user is on the `/settings` route.
- **FR-009**: Settings data MUST be isolated per user; one user's preference MUST NOT affect another user's preference.

### Key Entities

- **UserSettings**: Represents a user's personal configuration. Key attribute: `matchingAuto` (boolean, default `true`). One record per authenticated user, created on first access if not yet present.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view and change their auto-matching preference in under 30 seconds from any screen in the application.
- **SC-002**: The setting change is reflected on the backend within 2 seconds of the user toggling it under normal network conditions.
- **SC-003**: 100% of setting changes correctly scope to the individual user — no cross-user data leakage occurs.
- **SC-004**: When the backend is unreachable, the Settings page degrades gracefully: users see a clear error state rather than a broken or blank screen.
- **SC-005**: The Settings navigation link is reachable from every authenticated page in the application.

## Assumptions

- The backend API already exposes `GET /my/settings` and `PATCH /my/settings` endpoints as documented in the quickstart. No new backend development is required for the core settings functionality.
- `matchingAuto` is the only user preference in scope for this feature. Additional settings may be added later as separate features.
- The existing sidebar navigation pattern (Sidebar component, `MENU_ID_TO_PATH`, and `pathToActiveItem`) will be extended to include the new Settings route, following the same pattern as other top-level routes (e.g., Intakes, Marketplace).
- The Settings entry placement — top-level sidebar item vs. user dropdown — is a UI decision for implementation. The user dropdown (currently containing profile, change password, logout) is the preferred location to keep the main nav uncluttered, but either location is acceptable.
- Toast/notification feedback follows the existing `sonner` pattern already used throughout the project.
- The feature targets authenticated desktop users; mobile/responsive layout is out of scope for this iteration.
