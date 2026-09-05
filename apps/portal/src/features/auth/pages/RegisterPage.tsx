import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck, Sparkles, User, Mail, Phone, Building, Lock, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { register as apiRegister } from '@/services/api/auth';
import { AUTH_UI_CLASS, getAuthInputClass } from '@/features/auth/constants/authUi';

const PASSWORD_RULES = [
  { id: 'length', label: 'Ít nhất 8 ký tự', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'Chữ hoa (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'Chữ thường (a-z)', test: (v: string) => /[a-z]/.test(v) },
  { id: 'digit', label: 'Số (0-9)', test: (v: string) => /\d/.test(v) },
] as const;

function passwordStrength(password: string): 'empty' | 'weak' | 'medium' | 'strong' {
  if (!password) return 'empty';
  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  if (passed <= 1) return 'weak';
  if (passed <= 3) return 'medium';
  return 'strong';
}

const strengthBarClass: Record<'empty' | 'weak' | 'medium' | 'strong', string> = {
  empty: 'bg-transparent',
  weak: 'bg-destructive',
  medium: 'bg-amber-500',
  strong: 'bg-emerald-600',
};

const strengthTextClass: Record<'empty' | 'weak' | 'medium' | 'strong', string> = {
  empty: 'text-muted-foreground',
  weak: 'text-destructive',
  medium: 'text-amber-600',
  strong: 'text-emerald-700',
};

const strengthBarWidth: Record<'empty' | 'weak' | 'medium' | 'strong', string> = {
  empty: '0%',
  weak: '33%',
  medium: '66%',
  strong: '100%',
};

export function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const strength = passwordStrength(form.password);

  const setField =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = 'Vui lòng nhập họ';
    if (!form.email.trim()) next.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Email không hợp lệ';
    }
    if (!form.password) next.password = 'Vui lòng nhập mật khẩu';
    else if (strength === 'weak') next.password = 'Mật khẩu quá yếu';
    if (!form.confirmPassword) {
      next.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await apiRegister({
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        organization: form.organization.trim() || undefined,
      });
      toast.success(result.message);
      setIsSuccess(true);
    } catch (err) {
      const error = err as Error & { code?: string };
      if (error.code === 'EMAIL_ALREADY_IN_USE') {
        setErrors({ email: 'Email đã được sử dụng.' });
      } else {
        toast.error(error.message ?? 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={AUTH_UI_CLASS.page}>
        <div className={AUTH_UI_CLASS.background}>
          <div className={AUTH_UI_CLASS.backgroundGlow} />
          <div className={AUTH_UI_CLASS.backgroundGlowSecondary} />
          <div className={AUTH_UI_CLASS.backgroundGrid} />
        </div>
        <div className={AUTH_UI_CLASS.shell}>
          <div className={AUTH_UI_CLASS.card}>
            <h2 className="text-center text-2xl font-bold text-foreground">
              Đăng ký thành công!
            </h2>
            <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
              Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/login" className={`${AUTH_UI_CLASS.actionLink} inline-flex items-center gap-2`}>
                <ArrowLeft size={16} />
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
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

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={AUTH_UI_CLASS.formTitle}>Tạo tài khoản</h2>
                <p className={AUTH_UI_CLASS.formSubtitle}>Điền thông tin bên dưới để bắt đầu</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={AUTH_UI_CLASS.formStack}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={AUTH_UI_CLASS.fieldLabel}>
                    Họ <span className="text-destructive">*</span>
                  </label>
                  <div className={AUTH_UI_CLASS.inputWrapper}>
                    <User className={AUTH_UI_CLASS.inputIcon} size={18} />
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={setField('firstName')}
                      placeholder="Nhập họ"
                      className={getAuthInputClass(Boolean(errors.firstName), true)}
                    />
                  </div>
                  {errors.firstName && (
                    <p className={AUTH_UI_CLASS.fieldError}>{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className={AUTH_UI_CLASS.fieldLabel}>
                    Tên <span className={AUTH_UI_CLASS.fieldHint}>(tùy chọn)</span>
                  </label>
                  <div className={AUTH_UI_CLASS.inputWrapper}>
                    <User className={AUTH_UI_CLASS.inputIcon} size={18} />
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={setField('lastName')}
                      placeholder="Nhập tên"
                      className={getAuthInputClass(false, true)}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={AUTH_UI_CLASS.fieldLabel}>
                    Email <span className="text-destructive">*</span>
                  </label>
                  <div className={AUTH_UI_CLASS.inputWrapper}>
                    <Mail className={AUTH_UI_CLASS.inputIcon} size={18} />
                    <input
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={setField('email')}
                      placeholder="you@example.com"
                      className={getAuthInputClass(Boolean(errors.email), true)}
                    />
                  </div>
                  {errors.email && <p className={AUTH_UI_CLASS.fieldError}>{errors.email}</p>}
                </div>

                <div>
                  <label className={AUTH_UI_CLASS.fieldLabel}>
                    Số điện thoại{' '}
                    <span className={AUTH_UI_CLASS.fieldHint}>(tùy chọn)</span>
                  </label>
                  <div className={AUTH_UI_CLASS.inputWrapper}>
                    <Phone className={AUTH_UI_CLASS.inputIcon} size={18} />
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={setField('phone')}
                      placeholder="0123456789"
                      className={getAuthInputClass(false, true)}
                    />
                  </div>
                </div>

                <div>
                  <label className={AUTH_UI_CLASS.fieldLabel}>
                    Tổ chức <span className={AUTH_UI_CLASS.fieldHint}>(tùy chọn)</span>
                  </label>
                  <div className={AUTH_UI_CLASS.inputWrapper}>
                    <Building className={AUTH_UI_CLASS.inputIcon} size={18} />
                    <input
                      type="text"
                      value={form.organization}
                      onChange={setField('organization')}
                      placeholder="Tên công ty"
                      className={getAuthInputClass(false, true)}
                    />
                  </div>
                </div>

                <div>
                  <label className={AUTH_UI_CLASS.fieldLabel}>
                    Mật khẩu <span className="text-destructive">*</span>
                  </label>
                  <div className={AUTH_UI_CLASS.inputWrapper}>
                    <Lock className={AUTH_UI_CLASS.inputIcon} size={18} />
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={setField('password')}
                      placeholder="Nhập mật khẩu"
                      className={getAuthInputClass(Boolean(errors.password), true)}
                    />
                  </div>
                  {errors.password && <p className={AUTH_UI_CLASS.fieldError}>{errors.password}</p>}
                </div>

                <div>
                  <label className={AUTH_UI_CLASS.fieldLabel}>
                    Xác nhận mật khẩu <span className="text-destructive">*</span>
                  </label>
                  <div className={AUTH_UI_CLASS.inputWrapper}>
                    <Lock className={AUTH_UI_CLASS.inputIcon} size={18} />
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={setField('confirmPassword')}
                      placeholder="Nhập lại mật khẩu"
                      className={getAuthInputClass(Boolean(errors.confirmPassword), true)}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className={AUTH_UI_CLASS.fieldError}>{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {form.password && (
                <div className="rounded-2xl border border-primary/5 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${strengthBarClass[strength]}`}
                        style={{ width: strengthBarWidth[strength] }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${strengthTextClass[strength]}`}>
                      {strength === 'empty' ? '' : strength === 'weak' ? 'Yếu' : strength === 'medium' ? 'Trung bình' : 'Mạnh'}
                    </span>
                  </div>

                  <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(form.password);
                      return (
                        <li key={rule.id} className="flex items-center gap-2 text-[11px] font-semibold">
                          <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${passed ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-300 text-slate-300'}`}>
                            {passed ? '✓' : ''}
                          </span>
                          <span className={passed ? 'text-foreground' : 'text-muted-foreground'}>
                            {rule.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className={AUTH_UI_CLASS.submitButton}>
                <span className={AUTH_UI_CLASS.submitButtonGradient} />
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Đang khởi tạo...' : 'Tạo tài khoản ngay'}
                </span>
              </button>
            </form>

            <div className={AUTH_UI_CLASS.bottomText}>
              Đã có tài khoản?{' '}
              <Link to="/login" className={AUTH_UI_CLASS.actionLink}>
                Đăng nhập
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
