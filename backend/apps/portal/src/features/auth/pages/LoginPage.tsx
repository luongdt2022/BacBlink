import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { login as apiLogin } from '@/services/api/auth';
import { useAuth } from '@/app/providers/AuthProvider';
import { AUTH_UI_CLASS, getAuthInputClass } from '@/features/auth/constants/authUi';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from || '/ips', { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Email không hợp lệ';
    }
    if (!password) next.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { token } = await apiLogin({ email: email.trim(), password });
      login(token);
      toast.success('Đăng nhập thành công.');
      navigate(from || '/ips', { replace: true });
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={AUTH_UI_CLASS.page}>
      {/* Background Decor */}
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

          <div className="mt-8">
            <h2 className={AUTH_UI_CLASS.formTitle}>Đăng nhập</h2>
            <p className={AUTH_UI_CLASS.formSubtitle}>
              Vui lòng nhập thông tin tài khoản của bạn
            </p>

            <form onSubmit={handleSubmit} className={AUTH_UI_CLASS.formStack}>
              <div>
                <label htmlFor="login-email" className={AUTH_UI_CLASS.fieldLabel}>
                  Email
                </label>
                <div className={AUTH_UI_CLASS.inputWrapper}>
                  <Mail className={AUTH_UI_CLASS.inputIcon} size={18} />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    className={getAuthInputClass(Boolean(errors.email), true)}
                  />
                </div>
                {errors.email && <p className={AUTH_UI_CLASS.fieldError}>{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="login-password" className={AUTH_UI_CLASS.fieldLabel}>
                  Mật khẩu
                </label>
                <div className={AUTH_UI_CLASS.inputWrapper}>
                  <Lock className={AUTH_UI_CLASS.inputIcon} size={18} />
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Nhập mật khẩu"
                    className={getAuthInputClass(Boolean(errors.password), true)}
                  />
                </div>
                {errors.password && (
                  <p className={AUTH_UI_CLASS.fieldError}>{errors.password}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className={AUTH_UI_CLASS.actionLink}
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={AUTH_UI_CLASS.submitButton}
              >
                <span className={AUTH_UI_CLASS.submitButtonGradient} />
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? 'Đang xác thực...' : 'Đăng nhập ngay'}
                </span>
              </button>
            </form>

            <div className={AUTH_UI_CLASS.bottomText}>
              Chưa có tài khoản?{' '}
              <Link to="/register" className={AUTH_UI_CLASS.actionLink}>
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
