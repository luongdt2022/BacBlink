# Tasks: Password Change Confirmation Email

**Input**: Design documents from `/specs/004-password-change-email-template/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md N/A | data-model.md N/A | contracts/ N/A

**Tests**: Not requested in spec — no test tasks generated.

**Organization**: No setup or foundational phases needed — all infrastructure (`nodemailer`, `handlebars`, `MailModule`) already exists. Tasks are organized in a single implementation phase covering all 3 user stories, followed by a polish phase for verification.

---

## Phase 1: Implementation — Password Change Confirmation Email

**Purpose**: Implement the full confirmation email flow covering all 3 user stories.

**Goal**: A modern, DMST-branded confirmation email is sent to the user after every successful password change.

**Independent Test**: Call `POST /auth/change-password` as an authenticated user with valid passwords. Verify the success response returns immediately and a correctly addressed email with subject "Your password was changed — DMST System" is dispatched.

### Implementation

- [ ] T001 [P] [US1] [US2] Create `password-changed.hbs` email template in `src/mail/templates/password-changed.hbs`
  > Create the DMST-branded confirmation email template. Design requirements from spec.md and plan.md:
  > - Structure: Header (DMST red `#DC2626` brand bar) → Greeting (`{{firstName}}` or `{{email}}` fallback) → Confirmation heading ("Your password has been changed") → Body copy with timestamp → Security advisory block (light amber/yellow, left border, "If this wasn't you") → Footer (copyright)
  > - Use table-based inline-CSS layout — same pattern as `reset-password.hbs` for email client compatibility
  > - Must be readable without images loaded
  > - Template context: `firstName` (string or null), `email`

- [ ] T002 [P] [US1] [US3] Add `sendPasswordChangedEmail()` method to `src/mail/mail.service.ts`
  > In `src/mail/mail.service.ts`, add the following method after the existing `sendIntakeStatusUpdateEmail()` method:
  > ```typescript
  > async sendPasswordChangedEmail(email: string, firstName: string | null): Promise<void> {
  >   await this.sendMail({
  >     to: email,
  >     subject: 'Your password was changed — DMST System',
  >     template: 'password-changed',
  >     context: { firstName: firstName ?? email, email },
  >   });
  > }
  > ```

- [ ] T003 [US1] Inject `MailService` into `src/auth/auth.service.ts` and call after password update
  > In `src/auth/auth.service.ts`:
  > 1. Add `private readonly mailService: MailService` to the constructor parameters.
  > 2. Import `MailService` from `'../mail/mail.service'`.
  > 3. At the end of the `changePassword()` method, after `await this.usersService.save(user)` and the `console.log`, add:
  >    ```typescript
  >    await this.mailService.sendPasswordChangedEmail(user.email, user.firstName);
  >    ```
  >    The call is intentionally awaited so the email attempt is started before the HTTP response is returned — the `sendMail()` method itself is synchronous (nodemailer uses a transport); delivery errors are not propagated to the caller per the fire-and-forget assumption in the spec.

- [ ] T004 [US1] Add `MailModule` to imports in `src/auth/auth.module.ts`
  > In `src/auth/auth.module.ts`, add `MailModule` to the `imports` array so `AuthService` can inject `MailService`:
  > ```typescript
  > imports: [
  >   // ... existing imports
  >   MailModule,
  > ],
  > ```
  > Import `MailModule` from `'../mail/mail.module'`.

**Checkpoint**: At this point, the full email flow is implemented. US1, US2, and US3 are all satisfied.

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation.

- [ ] T005 Verify build passes
  > Run `npm run lint` and `npm test` from the repository root. Confirm both commands exit cleanly (pre-existing lint errors in `src/auth/` and `src/users/` are out of scope for this feature and existed before this change).

**Checkpoint**: Feature complete — ready to commit.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Implementation)**: No dependencies — runs first.
- **Phase 2 (Polish)**: Runs after Phase 1.

### Within Phase 1

- T001 (template creation) and T002 (MailService method) can run in parallel — they touch different files and neither depends on the other.
- T003 (AuthService) depends on T002 being complete — it calls `MailService.sendPasswordChangedEmail()`.
- T004 (AuthModule) depends on T003 — it must add `MailModule` so the injection in T003 works at runtime.

### Parallel Opportunities

- T001 ∥ T002 (different files, no shared state)

---

## Parallel Example

```bash
# Phase 1: Parallel tasks T001 and T002
Task T001: Create password-changed.hbs template in src/mail/templates/password-changed.hbs
Task T002: Add sendPasswordChangedEmail() method in src/mail/mail.service.ts

# Then sequential:
Task T003: Inject MailService into AuthService, call sendPasswordChangedEmail() after save
Task T004: Add MailModule to AuthModule imports

# Phase 2:
Task T005: Verify npm run lint && npm test pass
```

---

## Implementation Strategy

### MVP Scope

This feature is a single-phase implementation. All 3 user stories are covered by completing T001–T004. No incremental delivery needed.

1. Complete T001 + T002 in parallel
2. Complete T003 (AuthService — injects MailService, calls method)
3. Complete T004 (AuthModule — adds MailModule import)
4. Complete T005 → build verified
5. **Commit**

### Suggested Commit Order

```
# Commit 1: Template + MailService method (T001 + T002 — parallel)
feat(mail): add password-changed template and sendPasswordChangedEmail method

# Commit 2: AuthService integration (T003 + T004)
feat(auth): send password change confirmation email after successful update

# Commit 3: Verification (T005)
chore: verify lint and tests pass
```

---

## Notes

- **No setup phase**: NestJS `ConfigModule`, `nodemailer`, and `MailService` are already in place.
- **No foundational phase**: No prerequisites block the implementation.
- **No tests generated**: Spec does not explicitly request tests.
- **[P] tasks**: T001 and T002 are parallelizable (different files).
- **Total task count**: 5 tasks across 2 phases.
- **User story coverage**:
  - US1 (Password change triggers email) → T001, T002, T003, T004 ✅
  - US2 (Modern template design) → T001 ✅
  - US3 (Sender/subject identity) → T002 (subject line) ✅
