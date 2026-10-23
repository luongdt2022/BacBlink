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
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { authClient, UserContext } from "@/lib/auth-client";
import { ExpertDashboard } from "@/components/expert-detail/expert-dashboard";
import { SellerDashboard } from "@/components/portal/seller-dashboard";

interface PortalModule {
  Icon: LucideIcon;
  title: string;
  copy: string;
  href: string;
}

const generalModules: PortalModule[] = [
  {
    Icon: Cpu,
    title: "Gian hàng Công nghệ",
    copy: "Chào bán giải pháp và sản phẩm R&D.",
    href: "/portal/seller/technologies",
  },
  {
    Icon: ShoppingBag,
    title: "Bài toán Đổi mới Công nghệ",
    copy: "Đăng nhu cầu đổi mới công nghệ và tìm kiếm nguồn cung.",
    href: "/portal/buyer/demands",
  },
  {
    Icon: BarChart3,
    title: "Đánh Giá Công Nghệ (TT17)",
    copy: "Đo lường năng lực và điểm nghẽn dây chuyền.",
    href: "/assessments/tt17",
  },
  {
    Icon: Building2,
    title: "Hồ Sơ Doanh Nghiệp",
    copy: "Quản lý định danh MST và hồ sơ năng lực.",
    href: "/portal/enterprise/profile",
  },
];

function GeneralPortalDashboard({ user }: { user: UserContext | null }) {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-surface workspace-banner p-6 text-white shadow-xl shadow-brand-950/10 sm:p-8">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-label font-semibold text-brand-200">
            <Sparkles className="h-3.5 w-3.5 text-brand-200" />
            Không gian Tác nghiệp Thị trường & Đổi mới sáng tạo
          </div>
          <h1 className="font-bold tracking-tight type-page-title">
            Xin chào, {user?.fullName || "Quý Thành Viên"}!
          </h1>
          <p className="max-w-2xl text-body leading-relaxed text-brand-100">
            Chọn mô-đun phù hợp với quyền và nhu cầu tác nghiệp của anh/chị.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {generalModules.map(({ Icon, title, copy, href }) => (
          <Link
            key={title}
            href={href}
            className="group space-y-3 rounded-surface border border-slate-200 bg-white p-5 shadow-xs transition hover:border-brand-700 hover:shadow-md focus-ring min-h-11 flex flex-col justify-between dark:bg-slate-900 dark:border-slate-700"
          >
            <div>
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-brand-700 dark:text-brand-200 group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-700 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-card-title mt-3 text-slate-900 dark:text-white group-hover:text-brand-700 transition-colors">
                {title}
              </h3>
              <p className="mt-1 text-body text-slate-500 dark:text-slate-300">
                {copy}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function PortalDashboard() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);

  useEffect(() => {
    const u = authClient.getUser();
    setUser(u);
    const cached = localStorage.getItem("nacentwin_active_role");
    if (cached) {
      setActiveRole(cached);
    } else if (u?.role?.toUpperCase() === "SELLER") {
      setActiveRole("SELLER");
    } else if (u?.role?.toUpperCase() === "BUYER") {
      setActiveRole("BUYER");
    } else {
      setActiveRole(u?.role ?? null);
    }
  }, []);

  const currentRole = (activeRole || user?.role || "").toUpperCase();

  if (currentRole === "VERIFIED_EXPERT" || currentRole === "EXPERT") {
    return <ExpertDashboard />;
  }

  if (currentRole === "SELLER") {
    return <SellerDashboard user={user} />;
  }

  return <GeneralPortalDashboard user={user} />;
}
