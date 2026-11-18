"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserRound,
  GraduationCap,
  Building2,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Briefcase,
  Layers,
  Settings,
  Clock,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  Lock
} from "lucide-react";
import { authClient, getRoleDisplayName, UserContext } from "@/lib/auth-client";
import { AppButton } from "@/components/ui/design-system";
import { useToast } from "@/components/common/toast";

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<UserContext | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "upgrade" | "workspaces">("profile");

  useEffect(() => {
    const sessionUser = authClient.getUser();
    if (!sessionUser) {
      router.replace("/login?redirect=/profile");
      return;
    }
    setUser(sessionUser);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleName = getRoleDisplayName(user.role);
  const isExpert = user.role?.toUpperCase() === "VERIFIED_EXPERT" || user.role?.toUpperCase() === "EXPERT";
  const isEnterprise = ["ENTERPRISE", "BUYER", "SELLER", "INNOVATION_ENTITY"].includes(user.role?.toUpperCase() ?? "");
  const isAdmin = ["SUPER_ADMIN", "OPERATOR_ADMIN", "ADMIN"].includes(user.role?.toUpperCase() ?? "");

  // Generate Monogram from name
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "BL";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* HEADER BREADCRUMB */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-teal-300">
            Tài Khoản & Định Danh
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Hồ Sơ Cá Nhân & Nâng Hạng Vai Trò
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Quản lý định danh thành viên, kiểm tra mức độ xác thực và khám phá lộ trình nâng cấp thẩm quyền tác nghiệp.
          </p>
        </div>

        {/* HERO PROFILE CARD */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-brand-700 text-2xl font-bold text-white shadow-md">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                    {user.fullName || "Thành viên BACLINK"}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200 dark:bg-brand-950 dark:text-brand-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {roleName}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mã định danh: <span className="font-mono font-medium text-slate-700 dark:text-slate-200">USR-{user.id?.slice(-6).toUpperCase() || "DEMO"}</span> · Phạm vi: <span className="font-semibold text-slate-700 dark:text-slate-200">{user.scopeType || "GLOBAL"}</span>
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Đã bảo vệ dữ liệu PDPD
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 sm:flex-col sm:items-end">
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Settings className="w-4 h-4" />
                <span>Cài đặt bảo mật</span>
              </Link>
              <Link
                href="/portal"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-800 transition"
              >
                <span>Vào Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("profile")}
            className={`border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "profile"
                ? "border-brand-700 text-brand-700 dark:border-teal-400 dark:text-teal-300"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Thông Tin Cá Nhân
          </button>
          <button
            onClick={() => setActiveTab("upgrade")}
            className={`flex items-center gap-1.5 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "upgrade"
                ? "border-brand-700 text-brand-700 dark:border-teal-400 dark:text-teal-300"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Lộ Trình Nâng Hạng</span>
          </button>
          <button
            onClick={() => setActiveTab("workspaces")}
            className={`border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "workspaces"
                ? "border-brand-700 text-brand-700 dark:border-teal-400 dark:text-teal-300"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Không Gian Tác Nghiệp
          </button>
        </div>

        {/* TAB 1: THÔNG TIN CHI TIẾT */}
        {activeTab === "profile" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <UserRound className="w-4 h-4 text-brand-700" />
                Hồ Sơ Định Danh
              </h3>
              <dl className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Họ và tên:</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{user.fullName || "Chưa cập nhật"}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Email:</dt>
                  <dd className="font-mono text-slate-900 dark:text-white">{user.email}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Phạm vi tác quyền:</dt>
                  <dd className="text-slate-900 dark:text-white">{user.scopeType || "GLOBAL"} ({user.scopeId || "Hiệp hội BACLINK"})</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Loại tài khoản:</dt>
                  <dd className="font-semibold text-brand-700 dark:text-teal-400">{roleName}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Bảo Vệ Quyền Riêng Tư (PDPD)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tài khoản tuân thủ nghiêm ngặt Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Mọi thông tin nhạy cảm đều được mã hóa và ẩn danh hóa trên sàn công khai.
              </p>
              <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  Đã đồng ý chính sách xử lý dữ liệu PDPD
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NÂNG HẠNG VAI TRÒ */}
        {activeTab === "upgrade" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5 dark:border-brand-900 dark:bg-brand-950/30">
              <p className="text-xs font-semibold text-brand-900 dark:text-brand-200">
                💡 Nâng cấp thẩm quyền giúp mở rộng không gian làm việc chuyên môn, đưa giải pháp công nghệ lên sàn giao dịch và kết nối hợp tác trực tiếp.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* CARD UPGRADE CHUYÊN GIA */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="inline-flex rounded-xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Trở Thành Chuyên Gia KH&CN
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Kê khai học vị, hồ sơ nghiên cứu và bằng sáng chế để được Hội đồng BACLINK Bắc Ninh thẩm định cấp chứng nhận <strong>VERIFIED_EXPERT</strong>.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Xuất hiện trên Mạng lưới Chuyên gia BACLINK Bắc Ninh
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tiếp nhận lời mời tư vấn từ Doanh nghiệp
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  {isExpert ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> Bạn đã là Chuyên gia được xác thực
                    </span>
                  ) : (
                    <Link
                      href="/profile/upgrade/expert"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-800 transition"
                    >
                      <span>Bắt Đầu Nâng Hạng Chuyên Gia</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>

              {/* CARD UPGRADE DOANH NGHIỆP */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Định Danh Doanh Nghiệp Hội Viên BACLINK
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Liên kết Mã số thuế (MST) của pháp nhân để đăng bài toán tìm mua (Bên Mua) hoặc niêm yết chào bán công nghệ & năng lực sản xuất (Bên Bán).
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Xác thực tự động Định Danh Doanh Nghiệp Hội Viên BACLINK
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Kích hoạt Radar Ghép nối Cung–Cầu AI
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Link
                    href="/portal/enterprise/profile/edit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 shadow-sm hover:bg-emerald-100 transition dark:bg-emerald-950 dark:text-emerald-300"
                  >
                    <span>Liên Kết & Khai Báo Doanh Nghiệp</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KHÔNG GIAN TÁC NGHIỆP */}
        {activeTab === "workspaces" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Lối Tắt Không Gian Tác Nghiệp Đang Hoạt Động
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  href="/portal"
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition flex flex-col justify-between space-y-2 dark:border-slate-800"
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-700" /> Bàn Làm Việc Portal
                  </div>
                  <p className="text-xs text-slate-500">Trung tâm điều phối cơ hội và ghép nối công nghệ.</p>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 hover:border-teal-500 hover:shadow-md transition flex flex-col justify-between space-y-2 dark:border-teal-900"
                  >
                    <div className="font-bold text-xs text-teal-900 dark:text-teal-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-700" /> Console Quản Trị
                    </div>
                    <p className="text-xs text-slate-500">Trung tâm quản trị giám sát và kiểm duyệt Hiệp hội BACLINK.</p>
                  </Link>
                )}

                <Link
                  href="/settings"
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition flex flex-col justify-between space-y-2 dark:border-slate-800"
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-600" /> Cài Đặt Tài Khoản
                  </div>
                  <p className="text-xs text-slate-500">Đổi mật khẩu, bảo mật 2 lớp và đăng xuất an toàn.</p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
