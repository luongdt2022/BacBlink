# Feature Specification: Update Mail Service with Environment Configuration

**Feature Branch**: `003-update-mail-service-config`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "update mail service module, i have only the config like this # mail
MAIL_HOST=smtp.gmail.com
MAIL_USER=namdhinsight@gmail.com
MAIL_PASSWORD=ipzjipxivcngndxe
MAIL_FROM=example@example.com"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Email Delivery via SMTP (Priority: P1)

As the system, I need to send transactional emails using the configured SMTP server so that users receive timely notifications.

**Why this priority**: Email is a core communication channel; if it is misconfigured, users receive no notifications.

**Independent Test**: Can be tested by calling `MailService.sendWelcomeEmail()` and verifying the email is sent via the configured SMTP without throwing.

**Acceptance Scenarios**:

1. **Given** a valid SMTP environment configuration, **When** `MailService.sendWelcomeEmail()` is called, **Then** the email is sent from the configured `MAIL_FROM` address to the recipient.
2. **Given** a valid SMTP environment configuration, **When** `MailService.sendResetPasswordEmail()` is called, **Then** the email contains the correct reset link and is delivered successfully.
3. **Given** the app is started, **When** any mail method is called, **Then** no "config key not found" error is thrown.

---

### User Story 2 - Template-Based Email Rendering (Priority: P1)

As the system, I need to render HTML email templates with dynamic context so that emails contain personalized, structured content.

**Why this priority**: All existing mail methods depend on Handlebars templates; they must continue to work after the config update.

**Independent Test**: Can be tested by calling `MailService.sendIntakeSubmittedEmail()` with a valid intake ID and verifying the rendered HTML contains the intake ID.

**Acceptance Scenarios**:

1. **Given** the `welcome.hbs` template exists, **When** `sendWelcomeEmail` is called, **Then** the rendered email contains the recipient's name.
2. **Given** the `reset-password.hbs` template exists, **When** `sendResetPasswordEmail` is called, **Then** the rendered email contains the correct reset URL.
3. **Given** an intake ID is provided, **When** `sendIntakeSubmittedEmail` is called, **Then** the rendered email contains the intake ID.

---

### User Story 3 - Secure SMTP Connection (Priority: P2)

As the system, I need to connect to Gmail's SMTP server securely so that email credentials are not exposed in transit.

**Why this priority**: Using a secure connection protects user credentials and email content.

**Independent Test**: Can be tested by verifying the nodemailer transporter is configured with the correct `secure` flag based on the port used.

**Acceptance Scenarios**:

1. **Given** `MAIL_PORT` is 465, **When** the transporter is created, **Then** `secure` is set to `true`.
2. **Given** `MAIL_PORT` is 587 or unspecified, **When** the transporter is created, **Then** `secure` is set to `false` (STARTTLS).

---

### User Story 4 - Graceful Defaults (Priority: P2)

As the system operator, I need the mail service to start with sensible defaults so that the app does not crash if some env vars are missing.

**Why this priority**: Prevents production outages when optional env vars are omitted.

**Independent Test**: Can be tested by starting the app without `MAIL_FROM_NAME` set and verifying the mail service still initializes.

**Acceptance Scenarios**:

1. **Given** `MAIL_FROM_NAME` is not set, **When** `MailService` initializes, **Then** it defaults to `"DMST System"`.
2. **Given** `MAIL_PORT` is not set, **When** `MailService` initializes, **Then** it defaults to port `587`.
3. **Given** `MAIL_SECURE` is not set, **When** `MailService` initializes, **Then** it defaults to `false`.

---

### Edge Cases

- What happens when `MAIL_HOST` is an unreachable server? The system should throw a connection error at send time, not at startup.
- What happens when `MAIL_PASSWORD` is empty or unset? The system should throw during config validation, alerting operators.
- What happens when the `from` email address does not match the authenticated Gmail account? Gmail may reject the email; the system should handle this gracefully with a clear error message.
- What happens when the email template file is missing? The system should throw an error with the template name.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST read `MAIL_HOST` from environment variables to configure the SMTP server address.
- **FR-002**: System MUST read `MAIL_USER` from environment variables to set the SMTP authentication username.
- **FR-003**: System MUST read `MAIL_PASSWORD` from environment variables to set the SMTP authentication password.
- **FR-004**: System MUST read `MAIL_FROM` from environment variables to set the sender email address.
- **FR-005**: System MUST read `MAIL_FROM_NAME` from environment variables to set the sender display name; if not set, it MUST default to `"DMST System"`.
- **FR-006**: System MUST read `MAIL_PORT` from environment variables; if not set, it MUST default to port `587`.
- **FR-007**: System MUST read `MAIL_SECURE` from environment variables; if not set, it MUST default to `false`.
- **FR-008**: The transporter MUST be created with `secure: true` when port 465 is used, and `secure: false` for other ports.
- **FR-009**: System MUST continue to support all existing mail methods: `sendWelcomeEmail`, `sendResetPasswordEmail`, `sendIntakeSubmittedEmail`, `sendIntakeStatusUpdateEmail`, and `sendMail`.
- **FR-010**: System MUST throw a configuration error if `MAIL_HOST`, `MAIL_USER`, or `MAIL_PASSWORD` is not provided.

### Key Entities

- **MailConfig**: Holds all mail configuration values loaded from environment variables: host, port, secure flag, auth credentials, and sender identity.
- **MailService**: The injectable NestJS service responsible for composing and sending templated emails via nodemailer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five existing mail methods (`sendWelcomeEmail`, `sendResetPasswordEmail`, `sendIntakeSubmittedEmail`, `sendIntakeStatusUpdateEmail`, `sendMail`) continue to work without modification to their public interface.
- **SC-002**: The app starts successfully when all required env vars (`MAIL_HOST`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`) are provided.
- **SC-003**: The app throws a descriptive error during startup if any required env var is missing.
- **SC-004**: The `MAIL_FROM` sender address is correctly reflected in the email's "From" header for all outgoing emails.
