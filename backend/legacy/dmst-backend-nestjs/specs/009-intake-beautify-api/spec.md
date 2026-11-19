# Feature Specification: Intake AI Beautification Endpoint

**Feature Branch**: `009-intake-beautify-api`
**Created**: 2026-03-30
**Status**: Draft
**Input**: User description: "tôi cần một endpoint dùng chung cho cả phía admin và user cần authentication làm đẹp theo intake và lưu vào db"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Authenticated user triggers AI beautification for their intake (Priority: P1)

A logged-in user wants to apply AI-generated content enhancement to one of their intakes
on demand. They call a single endpoint with the intake ID, the system runs the B2B
marketing rewrite, and the improved title and content are saved back to that intake
immediately. The user receives the updated intake data in the response.

**Why this priority**: This is the core value of the feature — letting any authenticated
actor (regular user or admin) invoke the beautification on demand and see the persisted
result without having to query the database separately.

**Independent Test**: Call the endpoint with a valid intake ID and a valid JWT. Confirm
the response contains non-null `aiProcessTitle` and `aiProcessedContent`, and verify the
same values are persisted in the intake record immediately after the call returns.

**Acceptance Scenarios**:

1. **Given** a logged-in user who owns an intake with title and content,
   **When** they call the beautification endpoint with that intake's ID,
   **Then** the system returns the intake with updated `aiProcessTitle` and
   `aiProcessedContent`, and those values are saved in the database.

2. **Given** a logged-in admin,
   **When** they call the beautification endpoint with any intake's ID,
   **Then** the system processes and saves the beautified content regardless of which user
   owns the intake.

3. **Given** a logged-in user who does NOT own the target intake,
   **When** they call the beautification endpoint,
   **Then** the system returns an error and does not modify the intake.

4. **Given** an unauthenticated request,
   **When** the beautification endpoint is called,
   **Then** the system rejects the request with an authentication error.

---

### Edge Cases

- What if the intake has no content? The system returns an error indicating beautification
  requires content; no AI call is made.
- What if the AI service is unavailable or returns an unparseable response? The system
  returns an error and leaves the existing `aiProcessTitle`/`aiProcessedContent` unchanged.
- What if the intake does not exist? The system returns a not-found error.
- What if beautification is called multiple times on the same intake? Each call overwrites
  the previous result with newly generated content.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a single authenticated endpoint that accepts an intake
  ID and triggers AI beautification for that intake.
- **FR-002**: Any authenticated user MUST be able to call the endpoint for intakes they own;
  admins MUST be able to call it for any intake.
- **FR-003**: The system MUST reject unauthenticated requests.
- **FR-004**: The system MUST reject requests from regular users targeting intakes they do
  not own.
- **FR-005**: The system MUST return an error if the target intake has no content.
- **FR-006**: On success, the system MUST persist the AI-generated title and content to the
  intake record and return the updated values synchronously in the response.
- **FR-007**: On AI failure (service error or unparseable response), the system MUST return
  an error and leave the existing intake data unchanged.

### Key Entities

- **Intake**: The record being beautified. Relevant fields: `id`, `title`, `content`,
  `aiProcessTitle` (output), `aiProcessedContent` (output), `aiProcessingStatus`.
  After a successful call, `aiProcessTitle` and `aiProcessedContent` are updated and
  `aiProcessingStatus` is set to completed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated user can trigger beautification and receive the saved result
  within a single request — no separate fetch needed.
- **SC-002**: An admin can beautify any intake; a regular user can only beautify their own.
  Unauthorized attempts return a clear error 100% of the time.
- **SC-003**: After a successful call, the intake's AI-generated title and content in the
  database match exactly what was returned in the response.
- **SC-004**: Calling the endpoint on an intake without content returns a descriptive error
  without making any AI service call.

## Assumptions

- Authentication uses the existing JWT mechanism already in place for all `/my/*` routes.
- Admins are identified by the existing admin role/guard already used on `/admin/*` routes.
- The endpoint is synchronous: the AI call is awaited and the result is returned directly
  in the HTTP response (not fire-and-forget).
- The endpoint does NOT trigger the subsequent chunk-embed or matching pipeline steps —
  it only updates `aiProcessTitle`, `aiProcessedContent`, and `aiProcessingStatus`.
- No new permission model is introduced; ownership check reuses the existing pattern
  (user can only operate on their own intakes; admin bypasses ownership).
- The existing B2B marketing prompt logic is reused without modification.
