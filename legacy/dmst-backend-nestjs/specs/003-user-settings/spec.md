# Feature Specification: Personalized User Settings

**Feature Branch**: `003-user-settings`
**Created**: 2026-03-27
**Status**: Draft
**Input**: User description: "thêm chức năng setting cho user, mỗi user sẽ có những setting
giống nhau nhưng value của mỗi user sẽ khác nhau, mang tính chất cá nhân hóa.
ban đầu sẽ có 1 setting là matching auto: on/off"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View and Update Personal Settings (Priority: P1)

An authenticated user opens their settings page and sees all available settings with their
current values. They can toggle "Matching Auto" on or off. The change is saved immediately
and persists across sessions.

**Why this priority**: This is the core interaction. Without the ability to read and write
settings, none of the downstream personalization can work.

**Independent Test**: Log in as User A, set Matching Auto = OFF. Log out and log back in.
Verify Matching Auto is still OFF. Log in as User B — verify User B's Matching Auto is
independent of User A's value.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they request their settings, **Then** the response
   includes all defined settings with the user's current values (or system defaults if not
   yet customized).

2. **Given** a logged-in user whose Matching Auto is ON, **When** they update it to OFF,
   **Then** the setting is saved and subsequent reads return OFF for that user only.

3. **Given** two users with different Matching Auto values, **When** each retrieves their
   own settings, **Then** each sees only their own value — neither user's setting affects
   the other.

4. **Given** a newly registered user who has never configured settings, **When** they
   request their settings, **Then** they receive the system defaults (Matching Auto = ON).

---

### User Story 2 — Matching Auto Controls AI Pipeline Trigger (Priority: P2)

When a user submits or updates an intake and their Matching Auto setting is ON, the AI
matching pipeline runs automatically. When Matching Auto is OFF, the pipeline does not
trigger automatically — the user must trigger matching manually.

**Why this priority**: This setting only has real value if it actually affects system
behaviour. Without this story, the setting is a no-op toggle.

**Independent Test**: Set Matching Auto = OFF for a user, submit an intake, and verify no
auto-matching job is queued. Switch to ON, submit another intake, and verify the matching
job runs.

**Acceptance Scenarios**:

1. **Given** a user with Matching Auto = ON, **When** they create or update an intake,
   **Then** the matching pipeline starts automatically after the intake is saved.

2. **Given** a user with Matching Auto = OFF, **When** they create or update an intake,
   **Then** no automatic matching pipeline is triggered.

3. **Given** a user with Matching Auto = OFF, **When** they explicitly request to run
   matching on an intake, **Then** matching runs on demand regardless of the setting.

---

### Edge Cases

- What happens if a user tries to update a setting key that does not exist?
  The request is rejected with a clear error — unknown setting keys are not accepted.
- What happens if a non-authenticated user tries to read or write settings?
  The request is rejected; settings are only accessible to authenticated users.
- What happens when new settings are introduced in the future?
  Existing users automatically receive the new setting's default value on their next
  settings read — no manual migration needed per user.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose an endpoint for authenticated users to retrieve all
  their current settings and values.
- **FR-002**: The system MUST expose an endpoint for authenticated users to update one or
  more of their settings in a single request.
- **FR-003**: Each user's settings MUST be stored independently — changing one user's
  setting MUST NOT affect any other user.
- **FR-004**: Settings that a user has not yet explicitly configured MUST return the system
  default value (Matching Auto default: ON).
- **FR-005**: The system MUST validate that only recognised setting keys are accepted on
  update; unrecognised keys MUST be rejected.
- **FR-006**: The `matching_auto` setting (ON/OFF) MUST control whether the AI matching
  pipeline is triggered automatically when the user creates or updates an intake.
- **FR-007**: When `matching_auto` is OFF, authenticated users MUST still be able to
  trigger matching on demand via a manual action.

### Key Entities

- **UserSettings**: Represents the collection of personalised preferences for a single user.
  Contains one record per user (or per user+key pair). Key attributes: owner (user),
  `matching_auto` (boolean, default true).
- **SettingKey**: The enumerated list of valid setting identifiers. Initially contains only
  `matching_auto`. New keys are added here when new settings are introduced.

### Assumptions

- Settings are user-facing only — admin users follow the same model and have their own
  independent settings.
- The initial setting (`matching_auto`) defaults to ON for all users (preserving current
  behaviour for existing users).
- Settings are accessed via the authenticated `/my/*` namespace, consistent with the
  project's existing route conventions.
- "Manual trigger" for matching (FR-007) reuses the existing on-demand match endpoint
  already available in the intakes module.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can read their settings and receive a response in under 500ms.
- **SC-002**: A user can update a setting and have it take effect on the very next intake
  submission — zero delay between save and behaviour change.
- **SC-003**: 100% of intake submissions correctly respect the submitting user's
  `matching_auto` value — no cross-user leakage of settings.
- **SC-004**: Newly registered users receive correct defaults without any manual
  per-user setup — verified by reading settings immediately after registration.
