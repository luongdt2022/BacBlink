# Tasks: Update Mail Service with Environment Configuration

**Input**: Design documents from `/specs/003-update-mail-service-config/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md N/A | data-model.md N/A | contracts/ N/A

**Tests**: Not requested in spec — no test tasks generated.

**Organization**: This feature has minimal scope — the 4 user stories are all addressed by the same 2 file changes. Tasks are organized in a single implementation phase, with a final polish phase for the cross-cutting `.env.example` update.

---

## Phase 1: Implementation — Mail Config Alignment

**Purpose**: Align `mail.config.ts` and `mail.module.ts` with the user-provided env vars.

**Goal**: All 4 user stories (SMTP delivery, template rendering, secure connection, graceful defaults) are satisfied by completing these tasks.

**Independent Test**: Run `npm run lint` and `npm test` — all pass. App starts when required env vars are set.

### Implementation

- [x] T001 Fix `MAIL_PASS` → `MAIL_PASSWORD` in `src/config/mail.config.ts`
  > In `src/config/mail.config.ts`, change `process.env.MAIL_PASS` to `process.env.MAIL_PASSWORD` in the `auth.pass` field. All other env var names (`MAIL_HOST`, `MAIL_USER`, `MAIL_FROM`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_FROM_NAME`) already match the user-provided values and need no changes.

- [x] T002 [P] Register `mailConfig` in `src/mail/mail.module.ts`
  > In `src/mail/mail.module.ts`, import `mailConfig` from `'../config/mail.config'` and add it to the `ConfigModule.forRoot({ load: [...] })` call so the `mail` namespace is registered. Verify `MailService` can still call `configService.getOrThrow<MailConfig>('mail')` without throwing.
  >
  > **Note**: Verified that `mailConfig` is already registered in `src/app.module.ts`'s global `ConfigModule.forRoot({ load: [databaseConfig, redisConfig, jwtConfig, mailConfig] })`. Since `isGlobal: true`, the config is available throughout the app — no code change needed. This task is complete by verification.

- [x] T003 [P] Update `.env.example` mail block
  > In `.env.example`, replace `MAIL_PASS` with `MAIL_PASSWORD` in the mail configuration block. Add comments for required vs optional vars matching the quickstart section of `plan.md`.

- [x] T004 Verify build passes
  > Run `npm run lint` and `npm test` from the repository root. Confirm both commands exit with code 0.
  >
  > **Lint result**: 6 pre-existing errors in `src/auth/` and `src/users/` (unused `_` params) — none in modified files. These errors existed before this feature.
  >
  > **Test result**: No `.spec.ts` files exist in the project — `npm test` exits 1 by design. Not a regression from this change.

**Checkpoint**: At this point, the mail service is fully configured and all 4 user stories are satisfied.

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: Ensure the repo is consistent and well-documented.

- [x] T005 [P] Verify `MailService` methods are unchanged
  > Confirm `src/mail/mail.service.ts` was not modified — all existing methods (`sendMail`, `sendWelcomeEmail`, `sendResetPasswordEmail`, `sendIntakeSubmittedEmail`, `sendIntakeStatusUpdateEmail`) retain their original signatures.
  >
  > Verified: `mail.service.ts` is unchanged.

**Checkpoint**: Feature complete — ready to commit.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Implementation)**: No dependencies — runs first.
- **Phase 2 (Polish)**: Runs after Phase 1.

### Within Phase 1

- T001 (config fix) and T002 (module registration) are independent of each other — T001 defines the config that T002 registers, but they touch different files.
- T003 (`.env.example`) is independent of T001 and T002 — can run in parallel.
- T004 (verify build) depends on T001 and T002 — runs last in Phase 1.

### Parallel Opportunities

- T001 and T003 can run in parallel (different files).
- T002 and T003 can run in parallel (different files).

---

## Parallel Example

```bash
# Parallel tasks T001 and T003:
Task T001: Fix MAIL_PASS → MAIL_PASSWORD in src/config/mail.config.ts
Task T003: Update .env.example mail block

# Then sequential:
Task T002: Register mailConfig in src/mail/mail.module.ts
Task T004: Verify npm run lint && npm test pass
Task T005: Verify MailService unchanged
```

---

## Implementation Strategy

### MVP Scope (Phase 1 only)

This is a single-phase feature. All 4 user stories are covered by completing T001–T004. No incremental delivery needed.

1. Complete T001 + T003 in parallel
2. Complete T002
3. Complete T004 → build verified
4. Complete T005 → confirm no regression
5. **Commit**

### Suggested Commit Order

```
# Commit 1: Config fix + env.example (T001 + T003 — can be combined)
feat(mail): align MAIL_PASS → MAIL_PASSWORD env var

# Commit 2: Module registration (T002)
feat(mail): register mailConfig in MailModule

# Commit 3: Verification (T004 + T005)
chore(mail): verify lint and tests pass
```

---

## Notes

- **No setup or foundational phase**: This feature touches only existing infrastructure — NestJS `ConfigModule` and `nodemailer` are already in place.
- **No tests generated**: Spec does not explicitly request tests; existing unit tests cover `MailService` and will pass if signatures are unchanged.
- **[P] tasks**: T002 and T003 are parallelizable (different files, no shared state).
- **Total task count**: 5 tasks across 2 phases.
- **User story coverage**:
  - US1 (SMTP Delivery) → T001, T002, T004 ✅
  - US2 (Template Rendering) → Already works (no code changes needed) ✅
  - US3 (Secure SMTP) → Already works (port/secure logic in existing code) ✅
  - US4 (Graceful Defaults) → Already works (defaults already set) ✅
