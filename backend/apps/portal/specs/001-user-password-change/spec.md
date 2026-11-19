# Feature Specification: User Password Change

**Feature Branch**: `001-user-password-change`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "mình cần build thêm tính năng đổi mật khẩu cho user site, cần update ui cũng như update backend (dmst-backend cùng cấp)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Change Password Successfully (Priority: P1)

Authenticated user wants to change their current password to a new one so they can maintain account security.

**Why this priority**: Core feature requirement — without this, the password change capability does not exist at all. This is the primary user journey.

**Independent Test**: Can be fully tested by navigating to the password change form, filling in valid credentials, submitting, and verifying the new password works for subsequent login.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and on the password change page, **When** the user enters the correct current password and a new password that meets all complexity requirements (and confirmation matches), **Then** the system saves the new password and displays a success message.

2. **Given** the user is authenticated and on the password change page, **When** the user successfully changes the password, **Then** the user is prompted to log in again with the new password.

---

### User Story 2 - Reject Invalid Old Password (Priority: P1)

Authenticated user attempts to change their password but enters the wrong current password.

**Why this priority**: Security requirement — the system must verify the user's identity before allowing a password change. Prevents unauthorized password changes.

**Independent Test**: Can be tested by entering an incorrect old password and verifying the system rejects the request without modifying the password.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and on the password change page, **When** the user enters an incorrect current password along with a valid new password, **Then** the system displays an error message indicating the current password is incorrect and does NOT change the password.

---

### User Story 3 - Enforce New Password Complexity (Priority: P1)

Authenticated user tries to set a new password that does not meet minimum security requirements.

**Why this priority**: Security requirement — weak passwords increase account vulnerability. The system must enforce a baseline password strength policy.

**Independent Test**: Can be tested by attempting to submit a new password that is too short, too simple, or otherwise non-compliant with the password policy.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and on the password change page, **When** the user enters a new password that is below the minimum length or does not meet the required character mix, **Then** the system displays a validation error describing the specific requirement that was not met, and does NOT change the password.

2. **Given** the user is authenticated and on the password change page, **When** the user enters a new password that is the same as the current password, **Then** the system displays an error indicating the new password must be different from the current password.

---

### User Story 4 - Prevent Password Reuse (Priority: P2)

Authenticated user attempts to reuse their most recent previous password.

**Why this priority**: Security best practice — prevents users from quickly cycling back to an old password. Simple implementation (last 1 password) that covers the most common reuse case.

**Independent Test**: Can be tested by changing the password, then attempting to change it back to the previous password, and verifying the system rejects it.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and on the password change page, **When** the user enters a new password that is identical to the most recently used password, **Then** the system displays an error indicating the new password was used recently and must be different.

---

### User Story 5 - Require Password Confirmation Match (Priority: P2)

Authenticated user tries to set a new password but the confirmation field does not match.

**Why this priority**: Prevents accidental typos when users set a new password — a standard UX pattern that reduces user frustration and support load.

**Independent Test**: Can be tested by entering different values in the new password and confirmation fields and verifying the form is rejected.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and on the password change page, **When** the user enters a valid new password but the confirmation does not match, **Then** the system displays a validation error indicating the passwords do not match and does NOT change the password.

---

### Edge Cases

- What happens when the user tries to access the password change page without being authenticated? → System redirects to login page.
- What happens when the session expires during the password change process? → System redirects to login page; form data is not preserved.
- What happens when the backend is temporarily unavailable during submission? → System displays an appropriate error message and allows the user to retry.
- What happens when the new password matches a previously used password? → System rejects the new password and displays an error; the last 1 previous password is stored for comparison (password history).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a password change form accessible only to authenticated users.
- **FR-002**: The password change form MUST include fields for: current password, new password, and new password confirmation.
- **FR-003**: The system MUST validate the current password before processing the change request.
- **FR-004**: The new password MUST meet minimum complexity requirements: minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.
- **FR-005**: The new password MUST NOT be identical to the current password.
- **FR-006**: The new password and confirmation fields MUST match exactly.
- **FR-007**: Upon successful password change, the system MUST log the user out and require re-authentication with the new password.
- **FR-008**: All password change attempts (success and failure) MUST be logged for audit purposes.
- **FR-009**: The system MUST display clear, user-friendly error messages for each validation failure.
- **FR-010**: The system MUST provide real-time feedback on password strength as the user types.
- **FR-011**: The backend MUST expose a secure password change endpoint that requires authentication.
- **FR-012**: The password change endpoint does NOT perform breached password checks; standard complexity rules (FR-004) are the baseline security requirement.
- **FR-013**: The system MUST prevent reuse of the most recently used password (password history depth: 1).

### Key Entities

- **User**: Represents the authenticated user account. Attributes: user ID, current password hash, password change timestamp.
- **PasswordChangeEvent**: Represents a password change audit log entry. Attributes: user ID, timestamp, outcome (success/failure), failure reason (if applicable), IP address.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authenticated users can complete a valid password change in under 10 seconds from form submission to re-login prompt.
- **SC-002**: 100% of password change attempts receive appropriate user-facing feedback (success or error message) within 3 seconds.
- **SC-003**: The password change form correctly validates and rejects at least 99% of invalid inputs before submission.
- **SC-004**: After a successful password change, the old password is immediately invalidated and cannot be used for authentication.

## Assumptions

- The user site already has an authentication system (login/logout) that will be reused.
- Password complexity rules follow industry-standard best practices (minimum 8 characters, mixed character types).
- The dmst-backend at the same directory level as the user site will be updated with the password change API endpoint.
- The user site will call the backend API to handle password updates.
- Sessions will be invalidated server-side upon successful password change, requiring the user to re-authenticate.
- Passwords are stored using a secure hashing algorithm (e.g., bcrypt, Argon2) — specific algorithm choice is an implementation detail.
