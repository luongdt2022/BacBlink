# Feature Specification: Manual Intake Match API

**Feature Branch**: `010-manual-intake-match`
**Created**: 2026-03-31
**Status**: Draft
**Input**: User description: "Thêm API matching thủ công cho intake: intake phải published mới matching được, chỉ matching với intake published của user khác (kể cả admin), logic matching giữ nguyên như hiện tại."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User triggers manual matching for their own intake (Priority: P1)

As a seller (IP owner) or buyer (Challenge owner), I want to be able to manually trigger the matching process for one of my published intakes so that I can refresh its match results on demand, without waiting for the automatic pipeline.

**Why this priority**: This is the core use case — owners need a way to force re-computation of matches for a specific intake at any time.

**Independent Test**: Call the manual match endpoint with a published intake owned by the logged-in user. Verify that `intake_matches` rows are updated and the response confirms success. Fully testable in isolation.

**Acceptance Scenarios**:

1. **Given** a logged-in user with a published intake, **When** they call the manual match endpoint for that intake, **Then** the system runs the matching logic and updates `intake_matches`, returning a success response with the count of matches found.
2. **Given** a logged-in user whose intake is in draft status, **When** they call the manual match endpoint for that intake, **Then** the system returns an error indicating that only published intakes can be matched.
3. **Given** a logged-in user, **When** they call the manual match endpoint for an intake that belongs to a different user, **Then** the system returns an authorization error.
4. **Given** a published intake with no matching counterparts from other users, **When** the manual match endpoint is called, **Then** the system returns success with zero matches (no error thrown).

---

### User Story 2 - Admin triggers manual matching for any intake (Priority: P2)

As an admin, I want to be able to manually trigger the matching process for any published intake in the system so that I can manage and refresh match data without restrictions on ownership.

**Why this priority**: Admin operations are secondary to user self-service but necessary for platform management.

**Independent Test**: Call the admin manual match endpoint with any published intake ID. Verify match results update in `intake_matches`. Testable independently of user story 1.

**Acceptance Scenarios**:

1. **Given** an admin with a valid admin token, **When** they call the admin manual match endpoint for any published intake, **Then** the system runs matching and updates `intake_matches`, returning success.
2. **Given** an admin, **When** they call the admin manual match endpoint for a draft intake, **Then** the system returns an error: the intake must be published to be matched.
3. **Given** an admin, **When** they call the admin manual match endpoint for a non-existent intake ID, **Then** the system returns a not-found error.

---

### Edge Cases

- What happens when the intake has no content or no sectors? → Return error: intake is not ready for matching (no embeddable content or no sector filter applicable).
- What happens when no other users' published intakes of the opposite type exist in the same sectors? → Return success with zero matches found; `intake_matches` is cleared for this intake.
- What happens when the AI embedding service is unavailable? → Return a service-unavailable error; `intake_matches` is not modified.
- What happens when a user tries to manually match an intake they do not own? → Return a forbidden or not-found error (do not leak existence of other users' intakes).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a manual matching endpoint accessible to authenticated regular users for their own intakes.
- **FR-002**: The system MUST expose a manual matching endpoint accessible to authenticated admin users for any intake.
- **FR-003**: The system MUST reject manual match requests for intakes that are not in published status, returning a clear error message.
- **FR-004**: The system MUST only produce matches against intakes owned by users other than the intake's owner (own intakes are never matched, regardless of role).
- **FR-005**: The system MUST only consider published intakes from other users as valid match candidates; draft intakes are excluded.
- **FR-006**: The matching logic MUST follow the same algorithm as the automatic pipeline: embed intake content → hybrid search (kNN + BM25) for opposite type in same sectors → store top results in `intake_matches`.
- **FR-007**: The system MUST replace (delete then insert) the existing `intake_matches` rows for the intake when manual matching completes.
- **FR-008**: The user-facing endpoint MUST verify that the requesting user owns the intake before triggering matching.
- **FR-009**: The endpoint MUST return the count of matches found and a success/failure status upon completion.
- **FR-010**: The system MUST support both IP and Challenge intake types for manual matching.

### Key Entities

- **Intake**: The unit being matched. Must have `type` (ip or challenge), `status` (must be `published`), `userId` (owner), `sectorIds`, and content for embedding.
- **IntakeMatch**: The stored result of a match pairing — links one IP intake with one Challenge intake with a relevance score, matched chunk, and timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can manually trigger matching for their published intake and receive a response within 30 seconds under normal load.
- **SC-002**: 100% of manual match requests for draft intakes are rejected with a clear error before any matching computation begins.
- **SC-003**: After a successful manual match, `intake_matches` reflects only matches against other users' published intakes — no own-user matches, no draft-intake matches.
- **SC-004**: The endpoint correctly handles both IP and Challenge intake types in 100% of cases.

## Assumptions

- The `computeMatches` internal service method already correctly filters by opposite type and same sectors; the new endpoints wrap this logic rather than duplicate it.
- Manual matching is synchronous (the HTTP response is returned after matching completes), consistent with the existing `/beautify` endpoint pattern.
- The `user_settings.matchingAuto` flag is irrelevant for manual matching — manual triggering always proceeds regardless of the user's auto-match preference.
- Admin users' intakes are treated like regular users' intakes when determining "other users" — an admin's intake will be matched against other users' intakes and vice versa.
- No rate limiting is specified for v1; this can be added later if needed.
- The existing embedding service and search infrastructure are assumed to be available and operational.
