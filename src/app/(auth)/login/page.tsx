"use client";

import React, { useState } from "react";
import { AppButton } from "@/components/ui/design-system";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient, getRedirectPathByRole, UserContext } from "@/lib/auth-client";
import { API_BASE, readApiError, userFacingRequestError } from "@/lib/api-client";
import { useToast } from "@/components/common/toast";
import { LogIn, KeyRound, Mail, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

type LoginResponse = { accessToken?: string; user?: UserContext };

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const rawMsg = await readApiError(res, "Tài khoản hoặc mật khẩu không chính xác.");
        if (
          !rawMsg ||
          rawMsg === "Đăng nhập không thành công." ||
          rawMsg.toLowerCase().includes("invalid")
        ) {
          throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
        }
        throw new Error(rawMsg);
      }

      const data = (await res.json()) as LoginResponse;
      if (!data.accessToken || !data.user?.id || !data.user.role || !data.user.fullName) {
        throw new Error("Phản hồi đăng nhập không hợp lệ. Vui lòng thử lại.");
      }
      authClient.setSession(data.accessToken, data.user);
      router.push(getRedirectPathByRole(data.user.role));
    } catch (err: unknown) {
      authClient.clearSession();
      const message = userFacingRequestError(err, "Không thể kết nối tới hệ thống đăng nhập.");
      setError(message);
      toast.error(message, "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full bg-slate-50/70 px-4 py-6 sm:px-6 sm:py-10 lg:min-h-[calc(100vh-4rem)] lg:px-8 lg:py-14 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="mb-7 text-center lg:hidden">
          <div className="mb-3 flex justify-center">
            <img
              src="/NACENTECH_Main-Logo-G.png"
              alt="NacenTech Logo"
              className="h-11 w-auto object-contain"
            />
          </div>
          <h1 className="type-section-title text-slate-900 dark:text-white">Đăng nhập NacenTwin</h1>
          <p className="mx-auto mt-2 max-w-xl text-body text-slate-600 dark:text-slate-400">
            Cổng kết nối cung – cầu công nghệ, thúc đẩy đổi mới sáng tạo
          </p>
        </div>

        {/* Split-Screen Main Container */}
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid lg:grid-cols-[0.82fr_1.18fr] dark:border-slate-800 dark:bg-slate-900">
          {/* Left Hero Banner */}
          <aside className="relative hidden overflow-hidden bg-brand-800 px-10 py-12 text-white lg:flex lg:flex-col justify-between">
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
                Truy cập không gian tác nghiệp thị trường công nghệ, hồ sơ chuyên gia KH&CN và phân hệ quản lý số.
              </p>
            </div>
            <div className="relative mt-auto space-y-4 pt-12 text-sm leading-6 text-teal-50">
              {[
                "Xác thực an toàn, bảo mật và minh bạch.",
                "Bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.",
                "Liên thông mạng lưới Sở KH&CN và các lĩnh vực công nghệ trọng điểm.",
              ].map((item) => (
                <div className="flex items-start gap-3" key={item}>
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-200" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Right Action Section */}
          <section className="px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-11 flex flex-col justify-center">
            <header className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-teal-300">Tài khoản NacenTech</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Đăng nhập tài khoản</h2>
              <p className="mt-2 max-w-2xl text-body text-slate-600 dark:text-slate-400">Điền thông tin đăng nhập để truy cập vào hệ thống.</p>
            </header>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/60">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                <div className="text-label text-rose-700 dark:text-rose-300">{error}</div>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-label font-bold text-slate-700 dark:text-slate-300">
                  Email đăng ký
                </label>
                <div className="mt-1 relative rounded-control shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-300">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenban@tochuc.vn"
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-control bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-body font-medium focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label font-bold text-slate-700 dark:text-slate-300">
                  Mật khẩu
                </label>
                <div className="mt-1 relative rounded-control shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-300">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-control bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-body font-medium focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-label pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-brand-700 focus:ring-innovation-500 border-slate-300 dark:border-slate-700 rounded focus-ring accent-brand-700 dark:text-brand-200"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-slate-600 dark:text-slate-400">
                    Ghi nhớ phiên làm việc
                  </label>
                </div>

                <a href="#" className="font-semibold text-brand-700 hover:text-brand-800 focus-ring dark:text-brand-200">
                  Quên mật khẩu?
                </a>
              </div>

              <div className="pt-2">
                <AppButton
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border rounded-control shadow-md text-label font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-innovation-500 disabled:opacity-50 transition focus-ring"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Đăng nhập vào Hệ Thống</span>
                    </>
                  )}
                </AppButton>
              </div>

              {/* Khối Tài Khoản Mẫu Thử Nghiệm (Demo Quick Fill) */}
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tài khoản mẫu thử nghiệm (Mật khẩu: Password@123)
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Click để điền nhanh
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {[
                    { label: "Super Admin", email: "super.admin@demo.nacentech.vn", color: "hover:bg-purple-50 text-purple-700 border-purple-200" },
                    { label: "Sở KH&CN Hà Nội", email: "hanoi.admin@demo.nacentech.vn", color: "hover:bg-blue-50 text-blue-700 border-blue-200" },
                    { label: "Doanh Nghiệp Buyer", email: "buyer.user@demo.nacentech.vn", color: "hover:bg-amber-50 text-amber-700 border-amber-200" },
                    { label: "Doanh Nghiệp Seller", email: "seller.user@demo.nacentech.vn", color: "hover:bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { label: "Chuyên Gia KH&CN", email: "expert.user@demo.nacentech.vn", color: "hover:bg-indigo-50 text-indigo-700 border-indigo-200" },
                    { label: "Người Dùng Thường", email: "public.user@demo.nacentech.vn", color: "hover:bg-slate-100 text-slate-700 border-slate-200" },
                  ].map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword("Password@123");
                      }}
                      className={`text-left px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-900 transition font-medium flex items-center justify-between ${acc.color}`}
                    >
                      <span className="font-semibold truncate">{acc.label}</span>
                      <span className="text-[10px] opacity-75 font-mono">Điền</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-body text-slate-500 dark:text-slate-300">
                  Chưa có tài khoản?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-brand-700 hover:text-brand-800 focus-ring dark:text-brand-200 inline-flex items-center gap-1"
                  >
                    <span>Đăng ký thành viên mới</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
