"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronRight, GraduationCap, Lightbulb, LogOut, Mail, Moon, ShieldCheck, Sun, UserRound } from "lucide-react";
import { authClient, getRedirectPathByRole, getRoleDisplayName, UserContext } from "@/lib/auth-client";
import { useTheme } from "@/components/common/theme-provider";
import { ConfirmModal } from "@/components/common/confirm-modal";
import { useToast } from "@/components/common/toast";
import { AppButton } from "@/components/ui/design-system";

const scopeLabels: Record<string, string> = {
  GLOBAL: "Toàn quốc",
  PROVINCE: "Tỉnh / thành phố",
  SECTOR: "Ngành / lĩnh vực",
  ORG_UNIT: "Đơn vị liên kết",
};

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<UserContext | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    const sessionUser = authClient.getUser();
    if (!sessionUser) {
      router.replace("/login");
      return;
    }
    setUser(sessionUser);
  }, [router]);

  if (!user) return null;

  const isPublicUser = ["PUBLIC_USER", "USER", "GUEST"].includes(user.role?.toUpperCase() ?? "");
  const scope = scopeLabels[user.scopeType?.toUpperCase() ?? "GLOBAL"] ?? "Theo phạm vi được cấp";

  const handleConfirmLogout = () => {
    authClient.clearSession();
    setLogoutModalOpen(false);
    toast.info("Đã đăng xuất khỏi hệ thống an toàn.", "Thông báo");
    router.push("/");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-teal-300">Tài khoản NacenTech</p>
        <h1 className="mt-2 type-page-title text-slate-950 dark:text-white">Cài đặt tài khoản</h1>
        <p className="mt-2 text-body text-slate-600 dark:text-slate-300">Xem thông tin tài khoản, vai trò và phạm vi hoạt động hiện tại.</p>

        <section className="mt-7 overflow-hidden rounded-surface border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4 border-b border-slate-200 p-5 sm:p-6 dark:border-slate-800">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200">
              <UserRound className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-card-title font-bold text-slate-950 dark:text-white">{user.fullName || "Thành viên NacenTech"}</h2>
              <p className="mt-0.5 truncate text-body text-slate-600 dark:text-slate-300">{user.email}</p>
            </div>
          </div>

          <dl className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex gap-4 p-5 sm:p-6"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-200" /><div><dt className="text-label text-slate-500 dark:text-slate-400">Vai trò</dt><dd className="mt-1 text-body font-semibold text-slate-900 dark:text-white">{getRoleDisplayName(user.role)}</dd></div></div>
            <div className="flex gap-4 p-5 sm:p-6"><Building2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-200" /><div><dt className="text-label text-slate-500 dark:text-slate-400">Phạm vi hoạt động</dt><dd className="mt-1 text-body font-semibold text-slate-900 dark:text-white">{scope}{user.scopeId ? ` · ${user.scopeId}` : ""}</dd></div></div>
            <div className="flex gap-4 p-5 sm:p-6"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-200" /><div><dt className="text-label text-slate-500 dark:text-slate-400">Email đăng nhập</dt><dd className="mt-1 text-body font-semibold text-slate-900 dark:text-white">{user.email}</dd></div></div>
          </dl>
        </section>

        <section className="mt-5 rounded-surface border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-card-title font-bold text-slate-950 dark:text-white">{isPublicUser ? "Nâng hạng tài khoản" : "Tiếp theo"}</h2>
          {isPublicUser ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link href="/profile/upgrade/expert" className="focus-ring rounded-xl border border-brand-200 bg-brand-50 p-4 text-brand-800 transition hover:border-brand-500 hover:bg-brand-100 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-100 dark:hover:bg-brand-950">
                <GraduationCap className="h-5 w-5" />
                <span className="mt-3 block font-semibold">Chuyên gia KH&CN</span>
                <span className="mt-1 block text-label">Khai báo hồ sơ 3 bước, thẩm định LLKH.</span>
                <span className="mt-4 inline-flex items-center gap-1 text-label font-bold">Nộp hồ sơ <ChevronRight className="h-4 w-4" /></span>
              </Link>
              <Link href="/portal/enterprise/profile" className="focus-ring rounded-xl border border-brand-200 bg-brand-50 p-4 text-brand-800 transition hover:border-brand-500 hover:bg-brand-100 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-100 dark:hover:bg-brand-950">
                <Building2 className="h-5 w-5" />
                <span className="mt-3 block font-semibold">Doanh nghiệp</span>
                <span className="mt-1 block text-label">Quản lý hồ sơ năng lực 10 nhóm tiêu chí.</span>
                <span className="mt-4 inline-flex items-center gap-1 text-label font-bold">Vào hồ sơ <ChevronRight className="h-4 w-4" /></span>
              </Link>
              <Link href="/profile/upgrade?action=enterprise" className="focus-ring rounded-xl border border-brand-200 bg-brand-50 p-4 text-brand-800 transition hover:border-brand-500 hover:bg-brand-100 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-100 dark:hover:bg-brand-950">
                <Lightbulb className="h-5 w-5" />
                <span className="mt-3 block font-semibold">Doanh nghiệp ĐMST</span>
                <span className="mt-1 block text-label">Xác thực MST, tệp ĐKKD để xin công nhận pháp nhân ĐMST.</span>
                <span className="mt-4 inline-flex items-center gap-1 text-label font-bold">Gửi thẩm định <ChevronRight className="h-4 w-4" /></span>
              </Link>
            </div>
          ) : (
            <Link href={getRedirectPathByRole(user.role)} className="focus-ring mt-4 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 p-4 text-brand-800 transition hover:border-brand-500 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-100">
              <span><span className="block font-semibold">Mở không gian làm việc</span><span className="mt-1 block text-label">Trở về khu vực phù hợp với vai trò của bạn.</span></span><ChevronRight className="h-5 w-5 shrink-0" />
            </Link>
          )}
        </section>

        <section className="mt-5 rounded-surface border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-card-title font-bold text-slate-950 dark:text-white">Giao diện hiển thị</h2>
              <p className="mt-1 text-body text-slate-600 dark:text-slate-300">
                Tùy chỉnh chế độ hiển thị nền sáng hoặc tối phù hợp với mắt và điều kiện ánh sáng.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`focus-ring inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition border ${
                  theme === "light"
                    ? "border-brand-500 bg-brand-50 text-brand-800 shadow-xs dark:bg-brand-950/60 dark:text-brand-200"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                aria-pressed={theme === "light"}
              >
                <Sun className={`h-4 w-4 ${theme === "light" ? "text-amber-500" : "text-slate-400"}`} />
                <span>Chế độ Sáng</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`focus-ring inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition border ${
                  theme === "dark"
                    ? "border-brand-500 bg-brand-50 text-brand-800 shadow-xs dark:bg-brand-950/60 dark:text-brand-200"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                aria-pressed={theme === "dark"}
              >
                <Moon className={`h-4 w-4 ${theme === "dark" ? "text-cyan-400" : "text-slate-400"}`} />
                <span>Chế độ Tối</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">Đang hoàn thiện</span>
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-surface border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="mt-2 text-body text-slate-600 dark:text-slate-300">Đăng xuất khỏi thiết bị này khi bạn đã hoàn tất công việc hoặc đang dùng thiết bị chung.</p>
          <AppButton variant="outline" type="button" onClick={() => setLogoutModalOpen(true)} className="mt-4">
            <LogOut className="size-4" aria-hidden="true" />
            Đăng xuất
          </AppButton>
        </section>
      </div>

      <ConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc hiện tại?"
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        variant="warning"
      />
    </main>
  );
}
