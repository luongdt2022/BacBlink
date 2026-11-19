import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resendActivation, verifyEmail as apiVerifyEmail } from '@/services/api/auth';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { AUTH_UI_CLASS, getAuthInputClass } from '../constants/authUi';

type Status = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Liên kết xác thực không hợp lệ. Không tìm thấy mã token.');
      return;
    }

    apiVerifyEmail(token)
      .then(() => {
        setStatus('success');
      })
      .catch((err: Error & { code?: string }) => {
        setStatus('error');
        setErrorMessage(
          err.message ||
          'Xác thực thất bại. Liên kết có thể đã hết hạn hoặc không hợp lệ.',
        );
      });
  }, [searchParams]);

  const handleResend = async () => {
    if (!resendEmail.trim() || isResending) return;
    setIsResending(true);
    try {
      const result = await resendActivation(resendEmail);
      toast.success(result.message);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Gửi lại email xác thực thất bại.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={AUTH_UI_CLASS.page}>
      <div className={AUTH_UI_CLASS.background}>
        <div className={AUTH_UI_CLASS.backgroundGlow} />
        <div className={AUTH_UI_CLASS.backgroundGlowSecondary} />
        <div className={AUTH_UI_CLASS.backgroundGrid} />
      </div>

      <div className={AUTH_UI_CLASS.shell}>
        <section className={AUTH_UI_CLASS.card}>
          <div className="mb-8 flex justify-center">
            <img src="/logo/NACENTECH_Main-Logo-G.png" alt="NACENTECH" className="h-10 w-auto" />
          </div>

          {status === 'loading' && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">Đang xác thực</h2>
              <p className="text-sm text-muted-foreground">Vui lòng chờ trong giây lát...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className={AUTH_UI_CLASS.successIconWrap}>
                <CheckCircle2 size={32} />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">Xác thực thành công!</h2>
              <p className="mx-auto mb-8 max-w-[300px] text-sm leading-relaxed text-muted-foreground">
                Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.
              </p>
              <button
                onClick={() => navigate('/login')}
                className={AUTH_UI_CLASS.submitButton}
              >
                <span className={AUTH_UI_CLASS.submitButtonGradient} />
                <span className="relative">Đăng nhập ngay</span>
              </button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/5 text-destructive">
                  <XCircle size={32} />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-foreground">Xác thực thất bại</h2>
                <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{errorMessage}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-slate-50/50 p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mail size={18} className="text-primary" />
                  Gửi lại email xác thực
                </div>
                <div className="space-y-4">
                  <div className={AUTH_UI_CLASS.inputWrapper}>
                    <Mail className={AUTH_UI_CLASS.inputIcon} size={18} />
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={getAuthInputClass(false, true)}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!resendEmail.trim() || isResending}
                    onClick={handleResend}
                    className={AUTH_UI_CLASS.submitButton}
                  >
                    <span className={AUTH_UI_CLASS.submitButtonGradient} />
                    <span className="relative flex items-center justify-center gap-2">
                      {isResending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isResending ? 'Đang gửi...' : 'Gửi lại email'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Link
                  to="/register"
                  className={`${AUTH_UI_CLASS.actionLink} inline-flex items-center gap-2`}
                >
                  <ArrowLeft size={16} />
                  Quay lại đăng ký
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
