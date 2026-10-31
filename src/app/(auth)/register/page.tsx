"use client";

import React, { useEffect, useState } from "react";
import { AppButton } from "@/components/ui/design-system";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Phone, AlertCircle, CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react";
import { API_BASE, readApiError, userFacingRequestError } from "@/lib/api-client";
import { authClient, getRedirectPathByRole } from "@/lib/auth-client";

const initialFormData = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  acceptPdpd: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = authClient.getUser();
    const token = authClient.getToken();
    if (user && token) {
      router.replace(getRedirectPathByRole(user.role));
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSuccessMessage(null);
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.lastName.trim()) {
      setError("Vui lòng nhập Họ và Tên đệm.");
      return;
    }

    if (!formData.firstName.trim()) {
      setError("Vui lòng nhập Tên.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError("Địa chỉ email chưa đúng định dạng.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (!formData.confirmPassword) {
      setError("Vui lòng xác nhận mật khẩu.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!formData.acceptPdpd) {
      setError("Bạn cần đồng ý với Điều khoản Bảo vệ Dữ liệu Cá nhân (Nghị định 13/2023/NĐ-CP) để tiếp tục.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim() || null,
          phone: formData.phone.trim() || null,
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Đăng ký không thành công."));
      }

      setSuccessMessage(
        "Đăng ký thành công! Tài khoản công chúng của bạn đã sẵn sàng để đăng nhập. Thông tin trên form đã được xoá."
      );
      setFormData(initialFormData);
    } catch (err: unknown) {
      setError(userFacingRequestError(err, "Lỗi máy chủ khi đăng ký tài khoản."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full bg-slate-50/70 px-4 py-6 sm:px-6 sm:py-10 lg:min-h-[calc(100vh-4rem)] lg:px-8 lg:py-14 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-7 text-center lg:hidden">
          <div className="mb-3 flex justify-center">
            <img
              src="/NACENTECH_Main-Logo-G.png"
              alt="NacenTech Logo"
              className="h-11 w-auto object-contain"
            />
          </div>
          <h1 className="type-section-title text-slate-900 dark:text-white">Đăng ký tài khoản</h1>
          <p className="mx-auto mt-2 max-w-xl text-body text-slate-600 dark:text-slate-400">
            Gia nhập Mạng lưới Đổi mới sáng tạo & Chuyên gia KH&CN NacenTech
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid lg:grid-cols-[0.82fr_1.18fr] dark:border-slate-800 dark:bg-slate-900">
          <aside className="relative hidden overflow-hidden bg-brand-800 px-10 py-12 text-white lg:flex lg:flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.32),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_42%)]" />
            <div className="relative">
              <img
                src="/NACENTECH_Main-Logo-G.png"
                alt="NacenTech Logo"
                className="h-12 w-auto object-contain brightness-0 invert"
              />
              <p className="mt-14 text-sm font-semibold uppercase tracking-[0.16em] text-teal-100">NacenTech Network</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight">Một tài khoản, kết nối cả hệ sinh thái.</h1>
              <p className="mt-5 max-w-sm text-lg leading-8 text-slate-100">
                Bắt đầu với tài khoản công chúng. Hồ sơ chuyên môn và vai trò nghiệp vụ sẽ được xác thực, phân quyền theo quy trình.
              </p>
            </div>
            <div className="relative mt-auto space-y-4 pt-12 text-sm leading-6 text-teal-50">
              {[
                "Đăng ký nhanh, an toàn và minh bạch.",
                "Bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.",
                "Nâng cấp vai trò sau khi hồ sơ được phê duyệt.",
              ].map((item) => (
                <div className="flex items-start gap-3" key={item}>
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-200" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <section className="px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-11">
            <header className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-teal-300">Tài khoản NacenTech</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tạo tài khoản mới</h2>
              <p className="mt-2 max-w-2xl text-body text-slate-600 dark:text-slate-400">Điền thông tin cơ bản để bắt đầu sử dụng nền tảng.</p>
            </header>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/60">
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div className="text-label text-rose-700 dark:text-rose-200">{error}</div>
            </div>
          )}

          {successMessage && (
            <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/60">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div className="text-label text-emerald-800 dark:text-emerald-200">
                <p className="font-semibold">Tạo tài khoản thành công</p>
                <p className="mt-1">{successMessage}</p>
                <Link href="/login" className="mt-3 inline-flex items-center gap-2 font-semibold text-brand-700 hover:text-brand-800 focus-ring dark:text-teal-300">
                  <ArrowLeft className="h-4 w-4" />
                  Đi đến trang Đăng nhập
                </Link>
              </div>
            </div>
          )}

            <form className="space-y-5" onSubmit={handleSubmit} method="post" noValidate>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-label font-medium text-slate-700 dark:text-slate-100">Họ & Tên đệm *</label>
                  <input
                    type="text"
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-label font-medium text-slate-700 dark:text-slate-100">Tên *</label>
                  <input
                    type="text"
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="An"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label font-medium text-slate-700 dark:text-slate-100">Địa chỉ Email *</label>
                <div className="mt-1 relative rounded-control">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nguyenvanan@institute.gov.vn"
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-label font-medium text-slate-700 dark:text-slate-100">Mật khẩu (≥8 ký tự) *</label>
                  <input
                    type="password"
                    required
                    name="password"
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-label font-medium text-slate-700 dark:text-slate-100">Xác nhận mật khẩu *</label>
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    minLength={8}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label font-medium text-slate-700 dark:text-slate-100">Số điện thoại</label>
                <div className="mt-1 relative rounded-control">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-300">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0912345678"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* PDPD Compliance Checkbox */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start">
                  <input
                    id="acceptPdpd"
                    name="acceptPdpd"
                    type="checkbox"
                    checked={formData.acceptPdpd}
                    onChange={handleChange}
                    className="h-4 w-4 text-brand-700 focus:ring-innovation-500 border-slate-300 rounded mt-0.5 focus-ring accent-brand-700 dark:border-slate-700 dark:text-brand-200"
                  />
                  <label htmlFor="acceptPdpd" className="ml-3 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Tôi đồng ý để Hệ thống NacenTech thu thập và xử lý dữ liệu cá nhân cho mục đích xác thực hồ sơ và kết nối chuyên gia theo quy định tại <strong>Nghị định 13/2023/NĐ-CP</strong> về Bảo vệ Dữ liệu Cá nhân.
                  </label>
                </div>
              </div>

              <div>
                <AppButton variant="cta"
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border rounded-control shadow-sm text-label font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-innovation-500 disabled:opacity-50 transition focus-ring"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Đăng ký thành viên</span>
                    </>
                  )}
                </AppButton>
              </div>

              <div className="text-center pt-2">
                <p className="text-body text-slate-500 dark:text-slate-300">
                  Đã có tài khoản?{" "}
                  <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800 focus-ring dark:text-brand-200">
                    Đăng nhập tại đây
                  </Link>
                </p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
