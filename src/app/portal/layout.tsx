"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  LayoutDashboard,
  Cpu,
  ShoppingBag,
  GraduationCap,
  Building2,
  FileCheck,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  Sparkles,
  Kanban,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const portalNavItems = [
  { href: "/portal", label: "Tổng quan Workspace", icon: LayoutDashboard },
  { href: "/portal/matching/radar", label: "Radar Ghép Nối AI", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Pipeline Cơ Hội (Kanban)", icon: Kanban },
  { href: "/portal/expert/profile", label: "Hồ sơ Chuyên gia KH&CN", icon: GraduationCap },
  { href: "/portal/technologies", label: "Gian hàng Chào bán (TRL)", icon: Cpu },
  { href: "/portal/demands", label: "Bài toán Tìm mua (Buyer)", icon: ShoppingBag },
  { href: "/portal/enterprise", label: "Hồ sơ Doanh nghiệp", icon: Building2 },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(authClient.getUser()?.role ?? null);
  }, [pathname]);

  const isExpert = userRole === "VERIFIED_EXPERT";
  const isPublicUser = userRole === "PUBLIC_USER" || userRole === "USER";

  const navItems = isExpert
    ? [
        { href: "/portal", label: "Tổng quan chuyên gia", icon: LayoutDashboard },
        { href: "/portal/matching/radar", label: "Radar Ghép Nối AI", icon: Sparkles },
        { href: "/portal/opportunities/pipeline", label: "Cơ hội đồng hành", icon: Kanban },
        { href: "/portal/expert/profile", label: "Hồ sơ của tôi", icon: GraduationCap },
        { href: "/profile/upgrade/expert", label: "Chỉnh sửa / Bổ sung", icon: FileCheck },
      ]
    : isPublicUser
    ? [
        { href: "/portal", label: "Tổng quan Workspace", icon: LayoutDashboard },
        { href: "/portal/matching/radar", label: "Radar Ghép Nối AI", icon: Sparkles },
        { href: "/portal/opportunities/pipeline", label: "Pipeline Cơ Hội (Kanban)", icon: Kanban },
        { href: "/profile/upgrade/expert", label: "Đăng ký Chuyên gia KH&CN", icon: GraduationCap },
        { href: "/settings", label: "Nâng hạng & Cài đặt", icon: FileCheck },
      ]
    : portalNavItems;

  return (
    <RoleGuard
      allowedRoles={[
        "SELLER",
        "BUYER",
        "INNOVATION_ENTITY",
        "VERIFIED_EXPERT",
        "EXPERT",
        "SUPER_ADMIN",
        "ADMIN",
        "USER",
        "PUBLIC_USER",
      ]}
      portalName="Cổng Không Gian Thị Trường & Đổi Mới Sáng Tạo"
    >
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-surface-page dark:bg-slate-950 lg:flex-row">
        {/* Workspace Sidebar */}
        <aside className="w-full shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:w-72">
          <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-200 text-caption font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Cổng Thị Trường B2B & Chuyên Gia</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mt-2 text-card-title">
              Workspace Tác Nghiệp
            </h3>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`focus-ring flex min-h-11 items-center gap-2.5 px-3 py-2 rounded-control text-label font-semibold transition ${
                    isActive
                      ? "bg-brand-700 text-white shadow-sm shadow-brand-700/20"
                      : "text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-700 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {isExpert && <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800"><div className="flex items-center gap-2.5 px-3 py-2 text-label font-semibold text-slate-400 dark:text-slate-300"><ClipboardList className="h-4 w-4" /><span>Yêu cầu tư vấn & kết nối</span><span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-caption dark:bg-slate-800">Sắp có</span></div></div>}
          </nav>
        </aside>

        {/* Workspace Content */}
        <div className="min-w-0 flex-1 p-4 sm:p-8">{children}</div>
      </div>
    </RoleGuard>
  );
}
