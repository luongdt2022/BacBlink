"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Cpu,
  GraduationCap,
  ShoppingBag,
  Sparkles,
  Rocket,
  Plus,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { authClient, UserContext } from "@/lib/auth-client";
import { ExpertDashboard } from "@/components/expert-detail/expert-dashboard";
import { SellerDashboard } from "@/components/portal/seller-dashboard";
import { BuyerDashboard } from "@/components/portal/buyer-dashboard";

interface PublicExplorerCard {
  icon: LucideIcon;
  title: string;
  copy: string;
  href: string;
  badge?: string;
}

const publicExplorerCards: PublicExplorerCard[] = [
  {
    icon: Cpu,
    title: "Khám phá Sàn Công nghệ",
    copy: "Tiếp cận hàng trăm sáng chế, thiết bị và công nghệ sẵn sàng chuyển giao (TRL 1–9).",
    href: "/chao-ban-cong-nghe",
  },
  {
    icon: ShoppingBag,
    title: "Nhu cầu công nghệ của Bạn",
    copy: "Theo dõi các bài toán tìm mua, đặt hàng R&D và nhu cầu công nghệ đang quan tâm.",
    href: "/portal/buyer/demands",
  },
  {
    icon: Sparkles,
    title: "Radar Ghép Nối AI",
    copy: "Thuật toán AI tự động đối sánh và đề xuất giải pháp khi bạn gửi ít nhất 01 nhu cầu công nghệ.",
    href: "/portal/matching/radar",
    badge: "Chưa kích hoạt",
  },
];

function GeneralPortalDashboard({ user }: { user: UserContext | null }) {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Khối 1: Quick Action Hero Banner */}
      <section className="relative overflow-hidden rounded-surface workspace-banner p-6 text-white shadow-xl shadow-brand-950/10 sm:p-8">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-label font-semibold text-brand-200">
            <Sparkles className="h-3.5 w-3.5 text-brand-200" />
            <span>Thành viên Khám phá / Bên Mua tiềm năng</span>
          </div>
          <div>
            <h1 className="font-bold tracking-tight type-page-title text-2xl sm:text-3xl">
              Xin chào, {user?.fullName || "Quý Thành Viên"}!
            </h1>
            <p className="mt-2 max-w-2xl text-body leading-relaxed text-brand-100">
              Khám phá công nghệ và kết nối giải pháp đổi mới sáng tạo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/khao-sat-nhu-cau"
              className="inline-flex items-center gap-2 rounded-control bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 shadow-sm transition hover:bg-brand-50 focus-ring min-h-11"
            >
              <Plus className="h-4 w-4 text-brand-800" />
              <span>+ Gửi Nhu cầu Công nghệ mới</span>
            </Link>
            <Link
              href="/chao-ban-cong-nghe"
              className="inline-flex items-center gap-2 rounded-control border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-ring min-h-11"
            >
              <Cpu className="h-4 w-4 text-brand-200" />
              <span>Khám phá Sàn Công nghệ</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Khối 2: Lưới 3 Thẻ Mua Sắm & Khám Phá AI */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {publicExplorerCards.map(({ icon: Icon, title, copy, href, badge }) => (
          <Link
            key={title}
            href={href}
            className="group flex flex-col justify-between rounded-surface border border-slate-200 bg-white p-6 shadow-xs transition hover:border-brand-700 hover:shadow-md focus-ring min-h-11 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                {badge ? (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      badge === "Chưa kích hoạt"
                        ? "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    }`}
                  >
                    {badge}
                  </span>
                ) : (
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-700 group-hover:translate-x-1 transition-all" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-card-title text-slate-900 group-hover:text-brand-700 transition-colors dark:text-white dark:group-hover:text-brand-300">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {copy}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-700 dark:text-brand-300 dark:border-slate-800">
              <span>Truy cập ngay</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Khối 3: Banner Chuyển Đổi Nâng Hạng CTA */}
      <section className="relative overflow-hidden rounded-surface border border-brand-200 bg-gradient-to-r from-teal-50/80 via-white to-brand-50/60 p-6 shadow-sm sm:p-8 dark:border-brand-900/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-brand-950/40">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-900/60 dark:text-brand-200">
              <Rocket className="h-3.5 w-3.5" />
              <span>Lộ trình Mở rộng Quyền hạn</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              Nâng hạng Vai trò & Kết nối Pháp nhân
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Tài khoản cá nhân hiện tại phục vụ khám phá sơ bộ. Để đăng bán công nghệ, mở Deal Room ký kết MOU, hoặc thẩm định công nghệ chuyên gia với mã số thuế và định danh chính thức, vui lòng gửi hồ sơ nâng hạng.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-700 dark:text-slate-300 sm:grid-cols-4">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-brand-600 shrink-0" />
                <span>Doanh nghiệp Mua</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-brand-600 shrink-0" />
                <span>Nhà Cung ứng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-brand-600 shrink-0" />
                <span>Chuyên gia KH&CN</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0" />
                <span>DN Đổi mới sáng tạo</span>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <Link
              href="/profile/upgrade"
              className="inline-flex items-center gap-2 rounded-control bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-800 focus-ring min-h-11 dark:bg-brand-600 dark:hover:bg-brand-500"
            >
              <Rocket className="h-4 w-4" />
              <span>Đăng ký Nâng hạng Vai trò</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PortalDashboard() {
  const [user, setUser] = useState<UserContext | null>(() => authClient.getUser());
  const [activeRole, setActiveRole] = useState<string | null>(() => {
    const u = authClient.getUser();
    if (typeof window === "undefined") return null;
    const isEnterprise =
      u?.role?.toUpperCase() === "BUYER" ||
      u?.role?.toUpperCase() === "SELLER" ||
      u?.role?.toUpperCase() === "INNOVATION_ENTITY";
    const cached = isEnterprise ? localStorage.getItem("nacentwin_active_role") : null;
    if (cached) return cached;
    if (u?.role?.toUpperCase() === "SELLER") return "SELLER";
    if (u?.role?.toUpperCase() === "BUYER" || u?.role?.toUpperCase() === "INNOVATION_ENTITY") return "BUYER";
    return u?.role ?? null;
  });

  useEffect(() => {
    const u = authClient.getUser();
    setUser(u);
    const isEnterprise =
      u?.role?.toUpperCase() === "BUYER" ||
      u?.role?.toUpperCase() === "SELLER" ||
      u?.role?.toUpperCase() === "INNOVATION_ENTITY";
    const cached = isEnterprise ? localStorage.getItem("nacentwin_active_role") : null;
    if (cached) {
      setActiveRole(cached);
    } else if (u?.role?.toUpperCase() === "SELLER") {
      setActiveRole("SELLER");
    } else if (u?.role?.toUpperCase() === "BUYER" || u?.role?.toUpperCase() === "INNOVATION_ENTITY") {
      setActiveRole("BUYER");
    } else {
      setActiveRole(u?.role ?? null);
    }

    const handleStorageChange = () => {
      const updated = localStorage.getItem("nacentwin_active_role");
      if (updated) setActiveRole(updated);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const currentRole = (activeRole || user?.role || "").toUpperCase();

  if (currentRole === "VERIFIED_EXPERT" || currentRole === "EXPERT") {
    return <ExpertDashboard />;
  }

  if (currentRole === "SELLER") {
    return <SellerDashboard user={user} />;
  }

  if (currentRole === "BUYER" || currentRole === "INNOVATION_ENTITY") {
    return <BuyerDashboard user={user} />;
  }

  return <GeneralPortalDashboard user={user} />;
}
