# Research: User Password Change — Modal Approach

## Backend Endpoint Design (unchanged from previous plan)

### Decision: `POST /api/v1/auth/change-password`
- **Rationale**: Follows existing `/auth/login`, `/auth/register`, `/auth/me` naming pattern. NestJS `AuthController` already handles user-auth endpoints under `/auth/` prefix.
- **Alternatives considered**:
  - `/users/change-password` — rejected, inconsistent with existing auth module structure
  - `PATCH /auth/password` — rejected, change-password is a distinct action (not a partial update)

### Decision: Stateless JWT session invalidation
- **Rationale**: The backend uses stateless JWT tokens stored in frontend cookies. The simplest way to enforce re-login after password change is to return a success response and have the frontend clear the token cookie.
- **Alternatives considered**:
  - Redis-backed token blacklist — requires Redis setup not currently used for auth; significant complexity increase for minimal security gain
  - Token version number in JWT payload — requires re-issuing token on every password change; adds complexity with no benefit vs. simple cookie clear

### Decision: Password history depth = 1 (previous password only)
- **Rationale**: As specified in FR-013. One previous hash stored alongside current hash in the User entity.
- **Alternatives considered**:
  - Separate `PasswordHistory` table with N rows — rejected; overkill for depth-1
  - Store only hash of last password — rejected; same as current approach but less flexible for future depth increase

### Decision: `class-validator` for DTO validation (already in use)
- **Rationale**: NestJS backend already uses `class-validator` + `ValidationPipe` globally. No new dependencies needed.

## Frontend Architecture — Modal Approach

### Decision: Modal overlay via AppProvider + AppShell
- **Rationale**: All existing modals in the app (DeleteConfirmModal, SubmitProposalModal, OpenDealModal) follow this pattern. Consistent with app architecture. Modal rendered at app root level, not inside a specific page.
- **Trigger**: Sidebar "Đổi mật khẩu" menu item → `openChangePasswordModal()` from `useApp()` hook.
- **No route**: No `/change-password` URL needed. Modal overlays whatever page the user is currently on.
- **Backdrop click**: Closes modal without action (standard modal behavior).
- **Success flow**: On success → `removeAccessToken()` → close modal → `logout()` from `useAuth()` → navigate to `/login`.

### Alternatives considered (and rejected)

| Alternative | Why Rejected |
|-------------|-------------|
| Dedicated route `/change-password` | Creates a new page for a single quick action; adds URL complexity; forces page navigation and back-button issues |
| Inline in Sidebar popover | Limited space; form would be cramped; harder to do password strength indicator well |
| Separate route + modal hybrid | Over-engineered; no benefit over pure modal |

### Decision: Inline PasswordStrengthIndicator in modal
- **Rationale**: Not reused elsewhere; inlining keeps modal self-contained and avoids extra file.
- **Design**: 4-segment colored bar (Weak=red, Fair=orange, Good=yellow, Strong=green) with label.

### Decision: Form state local to modal
- **Rationale**: Modal is self-contained; no need for global form state.
- **Fields**: currentPassword, newPassword, confirmPassword, errors (record), isSubmitting.
- **Validation**: Same regex as backend for consistency.
- **Error mapping**: Backend error messages are parsed and mapped to specific form fields (not shown as generic toast).
