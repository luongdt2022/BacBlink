# Tasks: User Password Change

**Feature**: User Password Change | **Branch**: `001-user-password-change`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Generated**: 2026-03-25

## Phase 1 — Foundational (backend entity + DTO)

All user stories depend on these tasks completing first.

### Goal
Extend the User entity with password history support and create the ChangePasswordDto with validation decorators.

### Independent Test Criteria
> Not independently testable — foundational only. Tests are integrated into user story phases below.

### Tasks

- [x] T001 Add `previousPasswordHash` column to `dmst-backend/src/users/user.entity.ts`
  - Add `@Column({ nullable: true }) previousPasswordHash?: string;` to the User entity class
  - Nullable to support users who have never changed their password
  - This field stores the bcrypt hash of the user's previous password for history depth-1 check

- [x] T002 Create `dmst-backend/src/auth/dto/change-password.dto.ts`
  - Define `ChangePasswordDto` class with three fields: `currentPassword`, `newPassword`, `confirmPassword`
  - Apply `@IsString()`, `@IsNotEmpty()` decorators to all three fields
  - Apply `@Matches(PASSWORD_REGEX, { message: '...' })` to `newPassword` where `PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/`
  - Note: confirmPassword vs newPassword match validation is handled in the service (not in DTO) since class-validator's cross-field validation requires custom validators

---

## Phase 2 — Backend: Auth Service & Controller

Implements the complete `POST /api/v1/auth/change-password` endpoint with all validation logic covering US1, US2, US3, US4, US5.

### Goal
Wire the DTO into the AuthController and implement the full change-password flow in AuthService.

### Independent Test Criteria
> Backend team: can test with `curl` or Postman by calling `POST /api/v1/auth/change-password` with various payloads — covers all error scenarios (wrong old password, complexity failure, reuse, mismatch).

### Tasks

- [x] T003 Add `changePassword()` method to `dmst-backend/src/auth/auth.service.ts`
  - Inject `UsersService` dependency if not already present
  - Implement full validation chain:
    1. Check `dto.newPassword === dto.confirmPassword` → throw `BadRequestException('Xác nhận mật khẩu không khớp')`
    2. Fetch user by `userId` from `UsersService` → throw `NotFoundException()` if not found
    3. `bcrypt.compare(dto.currentPassword, user.password)` → throw `UnauthorizedException('Mật khẩu hiện tại không đúng')` if false
    4. `bcrypt.compare(dto.newPassword, user.password)` → throw `BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại')` if true
    5. If `user.previousPasswordHash` exists: `bcrypt.compare(dto.newPassword, user.previousPasswordHash)` → throw `BadRequestException('Mật khẩu mới không được trùng với mật khẩu đã sử dụng gần nhất')` if true
    6. Rotate: `user.previousPasswordHash = user.password`
    7. `user.password = await bcrypt.hash(dto.newPassword, 10)`
    8. `await this.usersService.save(user)`
    9. Return `{ message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' }`
  - Add audit logging: `console.log` or use existing logger for both success and failure paths

- [x] T004 Add `POST /auth/change-password` endpoint to `dmst-backend/src/auth/auth.controller.ts`
  - Import and use `ChangePasswordDto` from `./dto/change-password.dto.ts`
  - Import `User` entity and `CurrentUser` decorator
  - Add `@Post('change-password')` handler with `@UseGuards(JwtAuthGuard)`
  - Call `this.authService.changePassword(currentUser.id, dto)` and return the result

- [x] T005 Update admin reset-password in `dmst-backend/src/users/services/admin-users.service.ts`
  - In the existing `resetPassword()` method, after setting the new hashed password, also set `user.previousPasswordHash = null`
  - This prevents users from getting blocked by password history after an admin-initiated reset

---

## Phase 3 — Frontend: API Integration & Routing

Wires the backend endpoint into the frontend API layer and adds the protected route.

### Goal
Enable the React frontend to call the change-password endpoint and protect the page with authentication.

### Independent Test Criteria
> Can be tested by confirming the `/change-password` route is accessible only when logged in; unauthenticated requests are redirected to `/login`.

### Tasks

- [x] T006 Add `changePassword()` function to `src/services/api/auth.ts`
  - Signature: `async function changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }>`
  - Use `apiFetch()` wrapper, method: `POST`, path: `/auth/change-password`
  - Return the `message` field from the response

- [x] T007 [P] Add `/change-password` route to `src/app/router/routes.tsx`
  - Add new route entry: `path: '/change-password'`, element: `<RequireAuth><ChangePasswordPage /></RequireAuth>`
  - Import `ChangePasswordPage` from `src/features/auth/pages/ChangePasswordPage.tsx`
  - Place it after the login route or in an appropriate position in the route array

- [x] T008 Fix Sidebar navigation link in `src/shared/components/navigation/Sidebar.tsx`
  - Find the `// TODO: navigate to profile / change-password` comment
  - Replace with `navigate('/change-password')` inside the appropriate click handler for the "Đổi mật khẩu" menu item
  - Ensure the navigate function is imported from `react-router-dom`

---

## Phase 4 — Frontend: UI Page & Component

Implements the user-facing form with real-time strength feedback, covering US1, US2, US3, US4, US5.

### Goal
Deliver the complete ChangePasswordPage with all form validation, strength indicator, error display, and success flow.

### Independent Test Criteria
> Full end-to-end: navigate to `/change-password` (authenticated), fill form with valid data, submit → redirected to `/login`, log in with new password succeeds (US1). Also: submit with wrong old password → sees error (US2); submit with weak password → sees complexity error (US3); submit with previous password → sees reuse error (US4); submit with mismatching confirm → sees mismatch error (US5).

### Tasks

- [x] T009 Create `src/features/auth/components/PasswordStrengthIndicator.tsx`
  - Component props: `password: string`
  - Evaluate password against each rule: length ≥ 8, has uppercase, has lowercase, has digit, has special char
  - Show a 4-segment or 4-level colored bar: Weak (red), Fair (orange), Good (yellow), Strong (green)
  - Display a text label: "Yếu" / "Trung bình" / "Khá" / "Mạnh"
  - Update in real-time as user types (controlled by parent form state)
  - Use Tailwind CSS for styling; use existing color tokens if available

- [x] T010 Create `src/features/auth/pages/ChangePasswordPage.tsx`
  - Import `RequireAuth` wrapper from `src/app/providers/AuthProvider.tsx`
  - Import `changePassword` from `src/services/api/auth.ts`
  - Import `toast` from `sonner` (already used in the app)
  - Import `useNavigate` from `react-router-dom`
  - Import `PasswordStrengthIndicator` from `./components/PasswordStrengthIndicator.tsx`
  - Component state: `currentPassword`, `newPassword`, `confirmPassword`, `errors` (record), `isSubmitting`
  - Client-side validation (mirrors backend):
    - `currentPassword`: required, not empty
    - `newPassword`: must match the same regex used in backend DTO
    - `confirmPassword`: must equal `newPassword`
  - Form layout: centered card, page title "Đổi mật khẩu", three input fields with labels
  - Below `newPassword` field: render `<PasswordStrengthIndicator password={newPassword} />`
  - Submit button: disabled while `isSubmitting`, shows loading state
  - On submit: call `changePassword({ currentPassword, newPassword, confirmPassword })`
    - On success: show success toast, call `removeAccessToken()` (from `src/shared/utils/authCookie.ts`) to clear cookie, navigate to `/login`
    - On error: extract error `message` from response body, display in `errors` object below the relevant field
  - On unmount: clear all form state

---

## Phase 5 — Polish & Cross-Cutting

Final integration checks and audit requirements.

### Goal
Ensure audit logging is in place and all error messages are user-friendly.

### Independent Test Criteria
> Not independently testable — review and verification tasks only.

### Tasks

- [x] T011 Review all error messages in backend `auth.service.ts` and frontend `ChangePasswordPage.tsx`
  - Confirm all Vietnamese messages are clear and actionable (not technical)
  - Confirm frontend errors map correctly to their respective fields (not shown as a generic toast)
  - Confirm backend never leaks internal details (e.g., no "user not found" vs "wrong password" distinction in the response)

---

## Dependencies & Execution Order

```
Phase 1 (T001, T002)
       │
       ▼
Phase 2 (T003, T004, T005)    ← backend team can ship this independently
       │
       ▼
Phase 3 (T006, T007, T008)    ← frontend team wires backend API + route
       │
       ▼
Phase 4 (T009, T010)          ← frontend team builds full UI
       │
       ▼
Phase 5 (T011)                ← final review
```

## Parallel Execution Opportunities

| Phase | Tasks | Can run in parallel because |
|-------|-------|---------------------------|
| Phase 1 | T001, T002 | Independent files (entity vs DTO) |
| Phase 4 | T009, T010 | Independent files (indicator vs page) |
| Phase 3 | T006, T008 | Independent (API function vs Sidebar navigation) |

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 11 |
| User Stories covered | US1, US2, US3, US4, US5 |
| Backend tasks | T001–T005 |
| Frontend tasks | T006–T010 |
| Polish tasks | T011 |
| Parallelizable tasks | T001 ‖ T002, T006 ‖ T008, T009 ‖ T010 |
| MVP scope | T001–T010 (Phase 1–4) — all tasks are required for a complete feature |

## Implementation Strategy

**Sequential per phase, parallel within phase.** Backend (Phase 1–2) can be implemented and tested before frontend work begins. Phase 3 (routing/API) is a quick integration step before Phase 4 (full UI). No phase is optional — all 5 phases are required for a shippable feature.
