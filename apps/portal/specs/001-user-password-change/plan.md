# Implementation Plan: User Password Change

**Branch**: `001-user-password-change` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-user-password-change/spec.md`

> **Revision note (2026-03-25)**: Frontend delivery changed from a dedicated route page to a modal overlay triggered from the Sidebar user menu. This aligns with the existing modal pattern used in the app (DeleteConfirmModal, SubmitProposalModal, OpenDealModal). The backend API remains unchanged.

## Summary

Add a password change feature for authenticated users across both the NestJS backend (`dmst-backend/`) and React frontend (`[Nacentech] PoC DMST - User Role.1/`). Backend exposes `POST /api/v1/auth/change-password`. Frontend delivers a modal overlay (not a page) triggered from the Sidebar user menu, following the existing `AppProvider` + `AppShell` pattern.

## Technical Context

**Language/Version**: TypeScript (NestJS backend), TypeScript + React 18 (frontend)
**Primary Dependencies**: NestJS, TypeORM, PostgreSQL, bcrypt, class-validator (backend); React 18, Vite, Tailwind CSS, shadcn/ui, lucide-react, sonner (frontend)
**Storage**: PostgreSQL via TypeORM; user passwords stored as bcrypt hashes
**Testing**: Backend unit/integration tests via Jest; frontend manual testing
**Target Platform**: Web SPA (Chrome/Edge/Firefox, desktop-first)
**Performance Goals**: Change-password API response < 500ms (p95)
**Constraints**: Backend must verify old password before allowing change; sessions invalidated server-side on success
**Scale/Scope**: Single-tenanted authenticated user portal; up to ~10k users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> Constitution file is a template placeholder — no active constraints to evaluate. Proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-password-change/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contract)
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Backend — dmst-backend/ (UNCHANGED from previous plan)
dmst-backend/
src/
├── auth/
│   ├── auth.controller.ts       # POST /auth/change-password (done)
│   ├── auth.service.ts          # changePassword() (done)
│   └── dto/
│       └── change-password.dto.ts  # ChangePasswordDto (done)
└── users/
    ├── user.entity.ts           # previousPasswordHash (done)
    └── services/
        ├── users.service.ts     # save() added (done)
        └── admin-users.service.ts  # history cleared on reset (done)

# Frontend — [Nacentech] PoC DMST - User Role.1/ (MODAL approach)
src/
├── shared/components/modals/
│   └── ChangePasswordModal.tsx  # NEW: modal overlay (replaces ChangePasswordPage.tsx)
├── services/api/
│   └── auth.ts                  # changePassword() API call (done)
└── app/providers/
    └── AppProvider.tsx          # Add: showChangePasswordModal state + open/close functions

# REMOVED (not needed in modal approach):
# src/features/auth/pages/ChangePasswordPage.tsx      — deleted
# src/app/router/routes.tsx                           — no new route added
# src/features/auth/components/PasswordStrengthIndicator.tsx — inlined in modal
```

**Structure Decision**: Modal overlay — consistent with existing app pattern (`DeleteConfirmModal`, `SubmitProposalModal`, `OpenDealModal`). State managed via `AppProvider`, modal rendered in `AppShell`. No new route needed.

## Phase 0 — Research

### Topics investigated (unchanged from previous plan — backend is done)

| Topic | Decision | Rationale |
|-------|----------|------------|
| Backend auth endpoint | `POST /api/v1/auth/change-password` | Already implemented |
| DTO validation | `class-validator` (already in use) | Already implemented |
| Password history | `previousPasswordHash` on User entity, depth=1 | Already implemented |
| Session invalidation | Frontend clears cookie, redirects to `/login` | Already implemented |
| Real-time password strength | Inline in modal component | Same component, different location |
| Toast library | Sonner (already installed) | Already used in app |

### Frontend modal pattern decision

**Decision**: State via `AppProvider` + render in `AppShell`
- **Rationale**: All existing modals (Deal, Proposal) follow this exact pattern. Consistent with app architecture. State lives in `AppProvider`, modal rendered at app root level (not inside a specific page).
- **Trigger**: Sidebar "Đổi mật khẩu" menu item calls `openChangePasswordModal()` from `useApp()`.
- **No route**: No `/change-password` URL needed. Modal overlays whatever page the user is currently on.
- **Backdrop click**: Closes modal without action.
- **Success flow**: On success → clear cookie → close modal → `logout()` from `useAuth()` → navigate to `/login`.

### Frontend component structure decision

**Decision**: Single `ChangePasswordModal.tsx` in `src/shared/components/modals/`
- **Rationale**: PasswordStrengthIndicator can be inlined in the modal (small, not reused elsewhere). Keeps the modal self-contained.
- **Pattern**: Same as `DeleteConfirmModal` — controlled by `isOpen` prop from `AppProvider`, `onClose` prop.
- **Form state**: Local useState for `currentPassword`, `newPassword`, `confirmPassword`, `errors`, `isSubmitting`.

### Cleanup of unused files from previous plan

**Decision**: Remove route and page created in previous implementation
- `src/features/auth/pages/ChangePasswordPage.tsx` — delete
- `src/features/auth/components/PasswordStrengthIndicator.tsx` — inline into modal (or keep as separate file for readability)
- `src/app/router/routes.tsx` — remove the `ChangePasswordRouteWrapper` and route entry
- `src/app/router/routes.tsx` — remove the `ChangePasswordPage` import

## Complexity Tracking

> No constitution violations. No complexity tracking rows needed.
