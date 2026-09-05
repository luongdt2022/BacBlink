import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { resetPassword } from '@/services/api/auth';
import { AUTH_UI_CLASS, getAuthInputClass } from '../constants/authUi';

type Status = 'loading' | 'ready' | 'submitting' | 'success' | 'error';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [status, setStatus] = useState<Status>(
    token ? 'ready' : 'error',
  );
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    const next: { password?: string; confirmPassword?: string } = {};
    if (!password) {
      next.password = 'Vui lòng nhập mật khẩu mới';
    } else if (password.length < 8) {
      next.password = 'Mật khẩu tối thiểu 8 ký tự';
    }
    if (!confirmPassword) {
      next.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (confirmPassword !== password) {
      next.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || status === 'submitting') return;
    setStatus('submitting');
    try {
      await resetPassword(token!, password);
      setStatus('success');
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập.');
    } catch (err) {
      setStatus('error');
      const error = err as Error;
      setErrorMessage(
        error.message ||
          'Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.',
      );
    }
  };

  if (!token) {
    return (
      <div className={AUTH_UI_CLASS.page}>
        <div className={AUTH_UI_CLASS.background}>
          <div className={AUTH_UI_CLASS.backgroundGlow} />
          <div className={AUTH_UI_CLASS.backgroundGlowSecondary} />
          <div className={AUTH_UI_CLASS.backgroundGrid} />
        </div>
        <div className={AUTH_UI_CLASS.shell}>
          <section className={AUTH_UI_CLASS.card}>
            <div className="mt-6 border-t border-border/70 pt-6 text-center">
              <h2 className="mb-2 text-xl font-semibold text-destructive">
                Liên kết không hợp lệ
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
              </p>
              <Link to="/login" className={AUTH_UI_CLASS.actionLink}>
                Quay lại đăng nhập
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={AUTH_UI_CLASS.page}>
        <div className={AUTH_UI_CLASS.background}>
          <div className={AUTH_UI_CLASS.backgroundGlow} />
          <div className={AUTH_UI_CLASS.backgroundGlowSecondary} />
          <div className={AUTH_UI_CLASS.backgroundGrid} />
        </div>
        <div className={AUTH_UI_CLASS.shell}>
          <section className={AUTH_UI_CLASS.card}>
            <div className={AUTH_UI_CLASS.logoBrand}>
              <img src="/logo/NACENTECH_Main-Logo-G.png" alt="Nacentech" className={AUTH_UI_CLASS.logoImg} />
              <p className={AUTH_UI_CLASS.logoTagline}>Nền tảng đổi mới sáng tạo quốc gia</p>
            </div>

            <div className="mt-6 border-t border-border/70 pt-6 text-center">
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                Mật khẩu đã được đặt lại
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Bạn có thể đăng nhập ngay với mật khẩu mới.
              </p>
              <button
                onClick={() => navigate('/login')}
                className={AUTH_UI_CLASS.submitButton}
              >
                Đăng nhập ngay
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={AUTH_UI_CLASS.page}>
      <div className={AUTH_UI_CLASS.background}>
        <div className={AUTH_UI_CLASS.backgroundGlow} />
        <div className={AUTH_UI_CLASS.backgroundGlowSecondary} />
        <div className={AUTH_UI_CLASS.backgroundGrid} />
      </div>
      <div className={AUTH_UI_CLASS.shell}>
        <section className={AUTH_UI_CLASS.card}>
          <div className={AUTH_UI_CLASS.logoBrand}>
            <img src="/logo/NACENTECH_Main-Logo-G.png" alt="Nacentech" className={AUTH_UI_CLASS.logoImg} />
            <p className={AUTH_UI_CLASS.logoTagline}>Nền tảng đổi mới sáng tạo quốc gia</p>
          </div>

          <div className={AUTH_UI_CLASS.intro}>
            <h1 className={AUTH_UI_CLASS.brandTitle}>Đặt lại mật khẩu mới</h1>
            <p className={AUTH_UI_CLASS.brandText}>
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>
          </div>

          <div className="mt-8">
            {status === 'error' && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className={AUTH_UI_CLASS.formStack}>
              <div>
                <label
                  htmlFor="reset-password"
                  className={AUTH_UI_CLASS.fieldLabel}
                >
                  Mật khẩu mới
                </label>
                <div className={AUTH_UI_CLASS.inputWrapper}>
                  <Lock className={AUTH_UI_CLASS.inputIcon} size={18} />
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((prev) => ({
                          ...prev,
                          password: undefined,
                        }));
                    }}
                    placeholder="Tối thiểu 8 ký tự"
                    className={`${getAuthInputClass(Boolean(errors.password), true)} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-primary"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className={AUTH_UI_CLASS.fieldError}>
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reset-confirm"
                  className={AUTH_UI_CLASS.fieldLabel}
                >
                  Xác nhận mật khẩu mới
                </label>
                <div className={AUTH_UI_CLASS.inputWrapper}>
                  <Lock className={AUTH_UI_CLASS.inputIcon} size={18} />
                  <input
                    id="reset-confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: undefined,
                        }));
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    className={getAuthInputClass(
                      Boolean(errors.confirmPassword),
                      true
                    )}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className={AUTH_UI_CLASS.fieldError}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className={AUTH_UI_CLASS.submitButton}
              >
                <span className={AUTH_UI_CLASS.submitButtonGradient} />
                <span className="relative flex items-center justify-center gap-3">
                  {status === 'submitting' && <Loader2 className="h-5 w-5 animate-spin" />}
                  {status === 'submitting'
                    ? 'Đang xử lý...'
                    : 'Đặt lại mật khẩu'}
                </span>
              </button>

              <div className={AUTH_UI_CLASS.bottomText}>
                <Link
                  to="/login"
                  className={`${AUTH_UI_CLASS.actionLink} inline-flex items-center gap-2`}
                >
                  <ArrowLeft size={16} />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
