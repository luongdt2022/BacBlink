# Implementation Plan: Update Mail Service with Environment Configuration

**Branch**: `003-update-mail-service-config` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-update-mail-service-config/spec.md`

## Summary

Update `src/config/mail.config.ts` to map the user-provided env vars (`MAIL_HOST`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`) and ensure the `MailModule` correctly registers and provides the `mailConfig`. Existing `MailService` and all its methods remain unchanged.

## Technical Context

**Language/Version**: TypeScript / NestJS 11
**Primary Dependencies**: `nodemailer`, `handlebars`, `@nestjs/config`
**Storage**: N/A
**Testing**: Jest (`npm test`)
**Target Platform**: Linux server (Docker)
**Project Type**: Web service (NestJS REST API)
**Performance Goals**: N/A
**Constraints**: Gmail SMTP — port 587 (STARTTLS) or 465 (SSL)
**Scale/Scope**: 2 files (`mail.config.ts`, `mail.module.ts`), no new dependencies

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Module Cohesion | ✅ Pass | `MailModule` owns mail config; no cross-module coupling introduced |
| II. API Contract Stability | ✅ Pass | No route changes; existing `MailService` public API unchanged |
| III. Async AI Pipeline Integrity | ✅ Pass | N/A — no AI pipeline involvement |
| IV. Migration-Gated Schema Changes | ✅ Pass | N/A — no database schema changes |
| V. Simplicity & Minimal Complexity | ✅ Pass | Only env var name alignment; no new abstractions |

No complexity deviations. No gates violated.

## Project Structure

### Source Code (repository root)

```text
src/
├── config/
│   └── mail.config.ts         # ← Update: MAIL_PASS → MAIL_PASSWORD
└── mail/
    ├── mail.module.ts          # ← Update: register mailConfig
    ├── mail.service.ts         # ← No changes needed (already correct)
    └── templates/              # ← Unchanged
        ├── welcome.hbs
        ├── reset-password.hbs
        ├── intake-submitted.hbs
        ├── intake-status-update.hbs
        └── assign-expert.hbs
```

**Structure Decision**: Two files need modification within the existing module structure. No new files or directories required.

## Phase 0: Research

No unknowns remain. All environment variable names are provided by the user. No research required.

## Phase 1: Design & Contracts

### Data Model

No new entities. The existing `MailConfig` interface in `src/config/mail.config.ts` is updated:

| Field | Before | After | Required |
|-------|--------|-------|----------|
| `host` | `MAIL_HOST` ✅ | `MAIL_HOST` | Yes |
| `port` | `MAIL_PORT` ✅ | `MAIL_PORT` (default `587`) | No |
| `secure` | `MAIL_SECURE` ✅ | `MAIL_SECURE` (default `false`) | No |
| `auth.user` | `MAIL_USER` ✅ | `MAIL_USER` | Yes |
| `auth.pass` | `MAIL_PASS` ❌ | `MAIL_PASSWORD` ✅ | Yes |
| `from` | `MAIL_FROM` ✅ | `MAIL_FROM` | Yes |
| `fromName` | `MAIL_FROM_NAME` ✅ | `MAIL_FROM_NAME` (default `"DMST System"`) | No |

### Interface Contracts

No external interface contracts change. `MailService` public API (methods: `sendMail`, `sendWelcomeEmail`, `sendResetPasswordEmail`, `sendIntakeSubmittedEmail`, `sendIntakeStatusUpdateEmail`) remains identical.

### Quickstart

```bash
# Required env vars to set
MAIL_HOST=smtp.gmail.com
MAIL_USER=namdhinsight@gmail.com
MAIL_PASSWORD=<app-password>        # ← was MAIL_PASS
MAIL_FROM=example@example.com

# Optional
MAIL_PORT=587                        # default 587
MAIL_SECURE=false                     # default false (use STARTTLS on 587)
MAIL_FROM_NAME="DMST System"          # default "DMST System"

# For Gmail: use an App Password, not your account password
# Generate at: https://myaccount.google.com/apppasswords
```

### Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh claude` after plan approval to sync the constitution context.

## Implementation Tasks

### Task 1 — Fix `MAIL_PASS` → `MAIL_PASSWORD` in `mail.config.ts`

Update the `auth.pass` field mapping from `MAIL_PASS` to `MAIL_PASSWORD`.

### Task 2 — Register `mailConfig` in `MailModule`

Import `mailConfig` (from `@app/config/mail.config`) in `MailModule`'s `ConfigModule.forRoot()` call so the `mail` namespace is registered and `MailService` can retrieve it via `configService.getOrThrow('mail')`.

### Task 3 — Update `.env.example`

Add or update the mail block so operators know which env vars to set. Align `MAIL_PASS` → `MAIL_PASSWORD`.

### Task 4 — Verify build

Run `npm run lint` and `npm test` to confirm no regressions.

## Verification

- `npm run lint` passes
- `npm test` passes
- App starts with the 4 required env vars set
- App throws at startup if any required env var is missing
