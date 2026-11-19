# Feature Specification: Password Change Confirmation Email

**Feature Branch**: `004-password-change-email-template`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "mình muốn thêm chức năng gửi mail khi đổi mật khẩu thành công về mail của người dùng bạn tạo/sửa 1 template email đẹp hiện đại human made chứ không ai generated nhé"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Password Change Triggers Confirmation Email (Priority: P1)

As a user, when I successfully change my password I receive an email confirming the action so that I know the change was registered and can detect unauthorized access.

**Why this priority**: Security confirmation emails are a critical trust signal — they reassure users that the change was intentional and help them detect account compromise.

**Independent Test**: Can be tested by calling `AuthService.changePassword()` (or the `/auth/change-password` endpoint) and verifying an email is dispatched to the user's address with the correct subject and content.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** they submit a valid `POST /auth/change-password` request, **Then** the system sends a confirmation email to the user's registered email address.
2. **Given** the email is sent, **Then** it contains the user's first name (if set) or email address, confirming it is addressed to them.
3. **Given** a password change is successful, **Then** the email is sent asynchronously — the API response returns immediately without waiting for the email to be delivered.
4. **Given** the password change fails (wrong current password, password too weak, etc.), **Then** no confirmation email is sent.

---

### User Story 2 - Email Template Design (Priority: P1)

As a user receiving the confirmation email, I see a professionally designed, modern email that matches the DMST brand so that the email feels legitimate and trustworthy.

**Why this priority**: A polished, human-crafted email template reinforces trust and differentiates from phishing. The template must use inline HTML styling for maximum email-client compatibility.

**Independent Test**: Can be verified by inspecting the rendered HTML of the sent email (via a test SMTP sink or log capture) and confirming it matches the design specification.

**Acceptance Scenarios**:

1. **Given** the email is opened, **Then** it displays the DMST brand logo/name and uses the DMST brand color palette (red accent, white background, clean typography).
2. **Given** the email is opened, **Then** it displays a clear confirmation message: "Your password has been changed successfully."
3. **Given** the email is opened, **Then** it includes a "If this wasn't you" warning block with a support contact hint, so users know how to respond to unauthorized access.
4. **Given** the email is opened on a mobile device, **Then** the layout remains readable (responsive or fluid-width table design).
5. **Given** the email client blocks images by default, **Then** the email content remains fully readable without any images loaded.

---

### User Story 3 - Email Subject and Sender Identity (Priority: P2)

As a user, I recognize the email as an official DMST communication so that I do not mistake it for spam.

**Why this priority**: Deliverability and trust depend on consistent, recognizable sender details.

**Independent Test**: Can be verified by checking the email headers (From, Subject) in a test SMTP sink.

**Acceptance Scenarios**:

1. **Given** the email is received, **Then** the From address matches the configured `MAIL_FROM` / `MAIL_FROM_NAME` ("DMST System").
2. **Given** the email is received, **Then** the subject line is descriptive and recognizable, e.g., "Your password was changed — DMST System".

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST send a password change confirmation email to the authenticated user's email address upon successful password change.
- **FR-002**: The email MUST be sent asynchronously (fire-and-forget) so that the API response is not blocked by email delivery.
- **FR-003**: The email MUST contain the user's first name (or their email address as a fallback) in the greeting.
- **FR-004**: The email MUST include a clear confirmation message and a security advisory block ("If this wasn't you, contact support").
- **FR-005**: System MUST NOT send the confirmation email if the password change fails (wrong current password, duplicate password, validation error).
- **FR-006**: A new `password-changed.hbs` Handlebars template MUST be created in `src/mail/templates/`.
- **FR-007**: A new `sendPasswordChangedEmail(email, firstName)` method MUST be added to `MailService` using the `password-changed` template.
- **FR-008**: `AuthService.changePassword()` MUST call `MailService.sendPasswordChangedEmail()` after the password is successfully updated in the database.
- **FR-009**: The email subject line MUST be specific and recognizable, distinguishable from generic transactional emails.

### Key Entities

- **MailService**: Existing injectable NestJS service. Extended with a new `sendPasswordChangedEmail(email, firstName)` method.
- **AuthService**: Existing service. Modified to inject `MailService` and call it after a successful password update.
- **password-changed.hbs**: New email template file — HTML email with DMST brand styling, confirmation message, and security advisory block.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The `/auth/change-password` endpoint continues to return a success response in under 500ms (email sending does not add latency).
- **SC-002**: A correctly addressed confirmation email is dispatched for every successful password change.
- **SC-003**: No confirmation email is sent when the password change fails due to incorrect current password, duplicate password, or validation errors.
- **SC-004**: The confirmation email is readable on both desktop and mobile email clients without external stylesheets or images loaded.

---

## Assumptions

- **Email delivery is fire-and-forget**: `MailService.sendMail()` may throw after the HTTP response is returned; the API response takes priority.
- **No transactional deduplication needed**: A password change always triggers exactly one confirmation email per successful attempt.
- **Gmail SMTP compatibility**: The HTML template uses table-based layout with inline CSS (industry standard for email client compatibility).

---

## Design: Password Changed Email Template (`password-changed.hbs`)

The following is the intended design for the `password-changed.hbs` template. This is the design artifact for implementation.

```html
<!-- DMST Password Changed Confirmation Email -->
<!-- Style: Modern, clean, brand-aligned (red accent #DC2626) -->
<!-- Structure: Header → Greeting → Confirmation message → Security advisory → Footer -->

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed Successfully</title>
</head>
<body>
  <!-- Outer wrapper: light gray background -->
  <!-- Card: white, centered, max-width 600px, rounded corners, subtle shadow -->

  <!-- Header: DMST red (#DC2626) brand bar with icon + title -->

  <!-- Body section -->
  <!-- Greeting: "Hi {{firstName || email}}" -->
  <!-- Heading: "Your password has been changed" (h2) -->
  <!-- Body copy: "Your password was updated on [date/time]. If you did this, no further action is needed." -->

  <!-- Security Advisory block: light amber/yellow background, left border accent -->
  <!-- "If this wasn't you" warning with advice to contact support -->

  <!-- Footer: copyright, unsubscribe hint -->
</body>
</html>
```

Full implementation follows the same table-based inline-CSS pattern as the existing `reset-password.hbs` template to ensure maximum email client compatibility.

---

## Edge Cases

- What happens if `firstName` is null? The template falls back to the user's email address in the greeting.
- What happens if the email fails to send? The API response is already returned; the error is logged but does not propagate to the user.
- What happens if the user changes their password multiple times in quick succession? Each successful change triggers a separate confirmation email.
