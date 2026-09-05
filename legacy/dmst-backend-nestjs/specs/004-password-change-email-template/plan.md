# Implementation Plan: Password Change Confirmation Email

**Branch**: `004-password-change-email-template` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-password-change-email-template/spec.md`

## Summary

Add a password change confirmation email to the existing `AuthService.changePassword()` flow. A new `password-changed.hbs` template is created, `MailService` gains a `sendPasswordChangedEmail()` method, and `AuthService` calls it after the password is updated. The email is dispatched asynchronously (fire-and-forget) so the API response is not blocked.

## Technical Context

**Language/Version**: TypeScript / NestJS 11
**Primary Dependencies**: `nodemailer`, `handlebars`, `@nestjs/config` (all already in project)
**Storage**: N/A
**Testing**: Jest (`npm test`) — no new test files required by spec
**Target Platform**: Linux server (Docker)
**Project Type**: Web service (NestJS REST API)
**Performance Goals**: `/auth/change-password` response under 500ms (email is async)
**Constraints**: Gmail SMTP; table-based inline-CSS HTML for email client compatibility
**Scale/Scope**: 3 files across 2 modules

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Module Cohesion | ✅ Pass | `MailService` lives in `MailModule`; `AuthModule` imports `MailModule` — clean dependency, no circular imports |
| II. API Contract Stability | ✅ Pass | No route changes; `AuthController.changePassword` response unchanged |
| III. Async AI Pipeline Integrity | ✅ Pass | N/A — no AI pipeline involvement |
| IV. Migration-Gated Schema Changes | ✅ Pass | N/A — no database schema changes |
| V. Simplicity & Minimal Complexity | ✅ Pass | One template, one service method, one call site; no new abstractions |

No complexity deviations. No gates violated.

## Project Structure

### Source Code (repository root)

```text
src/
├── mail/
│   ├── mail.module.ts         # ← Update: add MailModule to AuthModule imports
│   ├── mail.service.ts        # ← Update: add sendPasswordChangedEmail()
│   └── templates/
│       └── password-changed.hbs  # ← New: confirmation email template
└── auth/
    └── auth.service.ts        # ← Update: inject MailService, call after password update
```

**Structure Decision**: Three files modified/created. `MailModule` is added to `AuthModule`'s imports so `AuthService` can inject `MailService`. No new module or abstraction introduced.

## Phase 0: Research

No unknowns. All technology is already in the project. The async/fire-and-forget email pattern is established by existing `MailService` usage (e.g., `sendWelcomeEmail` called after user creation in `UsersService`).

## Phase 1: Design & Contracts

### Data Model

No new entities. No database schema changes.

### Interface Contracts

No external interface contracts change. The `POST /auth/change-password` route response remains:
```json
{ "message": "Password changed successfully. Please log in again." }
```

### Quickstart

After the feature is deployed, operators should verify:
1. Set `MAIL_*` env vars (already configured for feature 003).
2. Call `POST /auth/change-password` as an authenticated user with valid passwords.
3. Check the recipient inbox for a DMST-branded confirmation email with subject "Your password was changed — DMST System".

### Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh claude` after plan approval. No new technologies — all dependencies (`nodemailer`, `handlebars`, `@nestjs/config`) already present.

## Implementation Tasks

### Task 1 — Create `password-changed.hbs` template

Build the new confirmation email template in `src/mail/templates/password-changed.hbs`. Design must match DMST brand (red `#DC2626` accent, white card, clean typography). Structure: Header → Greeting → Confirmation message → Security advisory block → Footer. Use table-based inline-CSS layout (same pattern as existing `reset-password.hbs`). Template context variables: `{{firstName}}`, `{{email}}`.

### Task 2 — Add `sendPasswordChangedEmail()` to `MailService`

In `src/mail/mail.service.ts`, add:

```typescript
async sendPasswordChangedEmail(email: string, firstName: string | null): Promise<void> {
  await this.sendMail({
    to: email,
    subject: 'Your password was changed — DMST System',
    template: 'password-changed',
    context: { firstName: firstName ?? email, email },
  });
}
```

### Task 3 — Inject `MailService` in `AuthService`

In `src/auth/auth.service.ts`:
1. Add `MailService` to the constructor.
2. Call `this.mailService.sendPasswordChangedEmail(user.email, user.firstName)` at the end of `changePassword()`, after the `save()` call and log statement.

### Task 4 — Add `MailModule` to `AuthModule` imports

In `src/auth/auth.module.ts`, add `MailModule` to the `imports` array so `AuthService` can inject `MailService`.

### Task 5 — Verify build

Run `npm run lint` and `npm test` from the repository root. Confirm both commands exit cleanly (pre-existing lint errors in `src/auth/` and `src/users/` are out of scope for this feature).

## Verification

- `npm run lint` passes (ignoring pre-existing errors in unrelated files)
- `npm test` passes
- `POST /auth/change-password` returns success response under 500ms
- Confirmation email is dispatched to the authenticated user's address with the correct subject and template
