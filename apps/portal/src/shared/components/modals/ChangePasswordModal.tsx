import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { changePassword as apiChangePassword } from '@/services/api/auth';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

function getStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: '', color: '' };

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

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resetKey?: string;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
  resetKey,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    resetForm();
  }, [resetKey]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!currentPassword) {
      next.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
    }

    if (!newPassword) {
      next.newPassword = 'Vui lòng nhập mật khẩu mới.';
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      next.newPassword =
        'Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
    } else if (newPassword === currentPassword) {
      next.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại.';
    }

    if (!confirmPassword) {
      next.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
    } else if (confirmPassword !== newPassword) {
      next.confirmPassword = 'Xác nhận mật khẩu không khớp.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiChangePassword({ currentPassword, newPassword, confirmPassword });
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';

      if (
        message === 'Current password is incorrect' ||
        message.includes('8 ký tự') ||
        message.includes('uppercase') ||
        message.includes('password') ||
        message.includes('không đúng')
      ) {
        setErrors((prev) => ({ ...prev, currentPassword: message }));
      } else if (message.includes('khớp') || message.includes('mismatch') || message.includes('match')) {
        setErrors((prev) => ({ ...prev, confirmPassword: message }));
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const { level, label, color } = getStrength(newPassword);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 cursor-pointer bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Đổi mật khẩu</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Cập nhật mật khẩu tài khoản của bạn
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-[#f3f4f6] hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label
              htmlFor="cp-current"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Mật khẩu hiện tại
            </label>
            <input
              id="cp-current"
              type="password"
              autoComplete="current-password"
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.currentPassword) setErrors((p) => ({ ...p, currentPassword: '' }));
              }}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground placeholder-[#9ca3af] transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.currentPassword
                  ? 'border-[#dc2626] focus:border-[#dc2626]'
                  : 'border-[#e5e7eb] focus:border-primary'
              }`}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-[#dc2626]">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="cp-new"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Mật khẩu mới
            </label>
            <input
              id="cp-new"
              type="password"
              autoComplete="new-password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: '' }));
              }}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground placeholder-[#9ca3af] transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.newPassword
                  ? 'border-[#dc2626] focus:border-[#dc2626]'
                  : 'border-[#e5e7eb] focus:border-primary'
              }`}
            />
            {errors.newPassword ? (
              <p className="mt-1 text-xs text-[#dc2626]">{errors.newPassword}</p>
            ) : (
              newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex h-1.5 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 rounded-full transition-colors ${
                          i <= level ? color : 'bg-[#e5e7eb]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Độ mạnh:{' '}
                    <span
                      className={`font-medium ${
                        level >= 3
                          ? 'text-[#22c55e]'
                          : level >= 2
                            ? 'text-[#f97316]'
                            : 'text-[#ef4444]'
                      }`}
                    >
                      {label}
                    </span>
                  </p>
                </div>
              )
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="cp-confirm"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              id="cp-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
              }}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground placeholder-[#9ca3af] transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.confirmPassword
                  ? 'border-[#dc2626] focus:border-[#dc2626]'
                  : 'border-[#e5e7eb] focus:border-primary'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-[#dc2626]">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#f3f4f6] disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
