import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPassword } from '@/services/api/auth';
import { AUTH_UI_CLASS, getAuthInputClass } from '../constants/authUi';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next: { email?: string } = {};
    if (!email.trim()) {
      next.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Email không hợp lệ';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
      toast.success(
        'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.'
      );
    } catch (err) {
      const error = err as Error;
      setSubmitted(true);
      toast.success(
        'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.'
      );
      console.warn('forgotPassword API error (may be silent):', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={AUTH_UI_CLASS.page}>
        <div className={AUTH_UI_CLASS.background}>
          <div className={AUTH_UI_CLASS.backgroundGlow} />
          <div className={AUTH_UI_CLASS.backgroundGlowSecondary} />
          <div className={AUTH_UI_CLASS.backgroundGrid} />
        </div>
        <div className={AUTH_UI_CLASS.shell}>
          <section className={AUTH_UI_CLASS.card}>
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-foreground">Kiểm tra email của bạn</h2>
              <p className="mx-auto mb-8 max-w-[300px] text-sm leading-relaxed text-muted-foreground">
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến{' '}
                <span className="font-semibold text-foreground">{email}</span>.
              </p>
              <Link
                to="/login"
                className={`${AUTH_UI_CLASS.actionLink} inline-flex items-center gap-2`}
              >
                <ArrowLeft size={16} />
                Quay lại đăng nhập
              </Link>
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

          <div className="mt-8">
            <h2 className={AUTH_UI_CLASS.formTitle}>Khôi phục mật khẩu</h2>
            <p className={AUTH_UI_CLASS.formSubtitle}>
              Chúng tôi sẽ gửi hướng dẫn qua email
            </p>

            <form onSubmit={handleSubmit} className={AUTH_UI_CLASS.formStack}>
              <div>
                <label htmlFor="forgot-email" className={AUTH_UI_CLASS.fieldLabel}>
                  Email đã đăng ký
                </label>
                <div className={AUTH_UI_CLASS.inputWrapper}>
                  <Mail className={AUTH_UI_CLASS.inputIcon} size={18} />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    className={getAuthInputClass(Boolean(errors.email), true)}
                  />
                </div>
                {errors.email && <p className={AUTH_UI_CLASS.fieldError}>{errors.email}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className={AUTH_UI_CLASS.submitButton}>
                <span className={AUTH_UI_CLASS.submitButtonGradient} />
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
                </span>
              </button>

              <div className={AUTH_UI_CLASS.bottomText}>
                Nhớ mật khẩu?{' '}
                <Link to="/login" className={AUTH_UI_CLASS.actionLink}>
                  Đăng nhập ngay
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
