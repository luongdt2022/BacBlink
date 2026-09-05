# Quickstart: User Password Change — Modal Approach

## Backend Changes (dmst-backend/) — DONE

All backend changes are complete from the previous implementation pass:
- `previousPasswordHash` added to `user.entity.ts`
- `ChangePasswordDto` created at `auth/dto/change-password.dto.ts`
- `changePassword()` method in `auth.service.ts`
- `POST /auth/change-password` endpoint in `auth.controller.ts`
- `save()` method added to `users.service.ts`
- `previousPasswordHash = null` on admin reset in `admin-users.service.ts`

---

## Frontend Changes ([Nacentech] PoC DMST - User Role.1/)

### 1. Add modal state to AppProvider

**File:** `src/app/providers/AppProvider.tsx`

Add to `AppContextValue` interface:
```typescript
showChangePasswordModal: boolean;
openChangePasswordModal: () => void;
closeChangePasswordModal: () => void;
```

Add state and handlers:
```typescript
const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

const openChangePasswordModal = useCallback(() => {
  setShowChangePasswordModal(true);
}, []);

const closeChangePasswordModal = useCallback(() => {
  setShowChangePasswordModal(false);
}, []);
```

Add to `value` object.

### 2. Create ChangePasswordModal

**File:** `src/shared/components/modals/ChangePasswordModal.tsx`

Pattern: same as `DeleteConfirmModal` — controlled by `isOpen` prop and `onClose` prop.

- `isOpen: boolean` — controls visibility
- `onClose: () => void` — called on backdrop click or cancel
- Inline `PasswordStrengthIndicator` (no separate file needed)
- Form calls `changePassword()` from `src/services/api/auth.ts`
- On success: call `onClose()`, then `logout()` from `useAuth()`, navigate to `/login`
- On error: parse message, map to specific field errors

```typescript
// PasswordStrengthIndicator inline (4-segment bar)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
function getStrength(password) {
  const checks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  if (passed <= 1) return { level: 1, label: 'Yếu', color: 'bg-[#ef4444]' };
  if (passed === 2) return { level: 2, label: 'Trung bình', color: 'bg-[#f97316]' };
  if (passed === 3) return { level: 3, label: 'Khá', color: 'bg-[#eab308]' };
  return { level: 4, label: 'Mạnh', color: 'bg-[#22c55e]' };
}
```

### 3. Render ChangePasswordModal in AppShell

**File:** `src/app/App.tsx` (inside `AppShell` function)

```typescript
import { ChangePasswordModal } from '@/shared/components/modals/ChangePasswordModal';
import { useAuth } from '@/app/providers/AuthProvider';

function AppShell() {
  const app = useApp();
  const { logout } = useAuth();

  const handleModalSuccess = () => {
    removeAccessToken();
    app.closeChangePasswordModal();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <AppRoutes />
      <ChangePasswordModal
        isOpen={app.showChangePasswordModal}
        onClose={app.closeChangePasswordModal}
        onSuccess={handleModalSuccess}
      />
      {/* ... existing modals ... */}
    </>
  );
}
```

### 4. Wire Sidebar to open modal

**File:** `src/shared/components/navigation/Sidebar.tsx`

In the user menu item click handler for `change-password`:
```typescript
import { useApp } from '@/app/providers/AppProvider';

const { openChangePasswordModal } = useApp();

if (item.id === 'change-password') {
  openChangePasswordModal();
}
```

Remove the `navigate('/change-password')` that was added in the previous implementation pass.

---

## Cleanup: Remove Previous Implementation Files

These were created for the route-based approach and are no longer needed:

- `src/features/auth/pages/ChangePasswordPage.tsx` — DELETE
- `src/features/auth/components/PasswordStrengthIndicator.tsx` — DELETE (inlined into modal)
- `src/app/router/routes.tsx` — remove `ChangePasswordRouteWrapper`, route entry, and `ChangePasswordPage` import
