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

const expertNavItems = [
  { href: "/portal", label: "Tổng quan chuyên gia", icon: LayoutDashboard },
  { href: "/portal/expert/profile", label: "Hồ sơ LLKH của tôi", icon: GraduationCap },
  { href: "/portal/matching/radar", label: "Radar Cơ hội AI", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Cơ hội đồng hành", icon: Kanban },
  { href: "/profile/upgrade/expert", label: "Cập nhật / Nâng cấp LLKH", icon: FileCheck },
];

const buyerNavItems = [
  { href: "/portal", label: "Tổng quan Mua sắm", icon: LayoutDashboard },
  { href: "/portal/buyer/demands", label: "Bài toán Tìm mua (Buyer)", icon: ShoppingBag },
  { href: "/khao-sat-nhu-cau", label: "Khảo sát Nhu cầu DNNVV", icon: ClipboardList },
  { href: "/assessments/tt17", label: "Đánh giá Năng lực TT17", icon: FileCheck },
  { href: "/portal/matching/radar", label: "Radar Ghép Nối AI", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Pipeline Cơ Hội (Kanban)", icon: Kanban },
  { href: "/portal/enterprise/profile", label: "Hồ sơ Doanh nghiệp", icon: Building2 },
];

const sellerNavItems = [
  { href: "/portal", label: "Tổng quan Chào bán", icon: LayoutDashboard },
  { href: "/portal/seller/technologies", label: "Kho Công nghệ (TRL)", icon: Cpu },
  { href: "/portal/seller/technologies/create", label: "Niêm yết Công nghệ mới", icon: Sparkles },
  { href: "/portal/matching/radar", label: "Radar Ghép Nối Cầu AI", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Pipeline Thương mại hóa", icon: Kanban },
  { href: "/portal/enterprise/profile", label: "Hồ sơ Đơn vị / Viện Trường", icon: Building2 },
];

const innovationEntityNavItems = [
  { href: "/portal", label: "Tổng quan ĐMST", icon: LayoutDashboard },
  { href: "/portal/buyer/demands", label: "Bài toán Tìm mua (Buyer)", icon: ShoppingBag },
  { href: "/portal/seller/technologies", label: "Kho Chào bán (TRL)", icon: Cpu },
  { href: "/assessments/tt17", label: "Đánh giá Năng lực TT17", icon: FileCheck },
  { href: "/portal/matching/radar", label: "Radar Ghép Nối AI", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Pipeline Cơ Hội (Kanban)", icon: Kanban },
  { href: "/portal/enterprise/profile", label: "Hồ sơ Doanh nghiệp ĐMST", icon: Building2 },
];

const publicNavItems = [
  { href: "/portal", label: "Tổng quan Workspace", icon: LayoutDashboard },
  { href: "/portal/matching/radar", label: "Radar Ghép Nối AI", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Pipeline Cơ Hội (Kanban)", icon: Kanban },
  { href: "/profile/upgrade/expert", label: "Đăng ký Chuyên gia KH&CN", icon: GraduationCap },
  { href: "/settings", label: "Nâng hạng & Cài đặt", icon: FileCheck },
];

const adminPortalNavItems = [
  { href: "/portal", label: "Tổng quan Sàn B2B", icon: LayoutDashboard },
  { href: "/portal/matching/radar", label: "Radar Ghép Nối Toàn Sàn", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Giám sát Cơ Hội (Kanban)", icon: Kanban },
  { href: "/portal/seller/technologies", label: "Kho Chào bán (TRL)", icon: Cpu },
  { href: "/portal/buyer/demands", label: "Bài toán Tìm mua", icon: ShoppingBag },
  { href: "/portal/expert/profile", label: "Hồ sơ Chuyên gia KH&CN", icon: GraduationCap },
  { href: "/portal/enterprise/profile", label: "Hồ sơ Doanh nghiệp", icon: Building2 },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(authClient.getUser()?.role ?? null);
  }, [pathname]);

  const upperRole = (userRole ?? "").toUpperCase();
  const isExpert = upperRole === "VERIFIED_EXPERT" || upperRole === "EXPERT";
  const isBuyer = upperRole === "BUYER";
  const isSeller = upperRole === "SELLER";
  const isInnovationEntity = upperRole === "INNOVATION_ENTITY";
  const isAdmin = upperRole === "SUPER_ADMIN" || upperRole === "OPERATOR_ADMIN" || upperRole === "ADMIN";
  const isGov =
    upperRole === "PROVINCIAL_ADMIN" ||
    upperRole === "SECTOR_ADMIN" ||
    upperRole === "CLUSTER_ADMIN" ||
    upperRole === "PROVINCE_OFFICER" ||
    upperRole === "PROVINCE_LEADER";

  let navItems = publicNavItems;
  let workspaceTitle = "Workspace Tác Nghiệp";
  let workspaceBadge = "Cổng Thị Trường B2B & Chuyên Gia";

  if (isExpert) {
    navItems = expertNavItems;
    workspaceTitle = "Workspace Chuyên Gia";
    workspaceBadge = "Chuyên Gia KH&CN";
  } else if (isBuyer) {
    navItems = buyerNavItems;
    workspaceTitle = "Workspace Bên Mua";
    workspaceBadge = "Bên Mua Công Nghệ";
  } else if (isSeller) {
    navItems = sellerNavItems;
    workspaceTitle = "Workspace Nhà Cung Ứng";
    workspaceBadge = "Nhà Cung Ứng Công Nghệ";
  } else if (isInnovationEntity) {
    navItems = innovationEntityNavItems;
    workspaceTitle = "Workspace Đổi Mới Sáng Tạo";
    workspaceBadge = "Doanh Nghiệp ĐMST";
  } else if (isAdmin) {
    navItems = adminPortalNavItems;
    workspaceTitle = "Góc Nhìn Quản Trị Thị Trường";
    workspaceBadge = "Quản Trị Viên Hệ Thống";
  } else if (isGov) {
    navItems = adminPortalNavItems;
    workspaceTitle = "Giám Sát Thị Trường Địa Bàn";
    workspaceBadge = "Cán Bộ Quản Trị Nhà Nước";
  }

  return (
    <RoleGuard
      allowedRoles={[
        "SELLER",
        "BUYER",
        "INNOVATION_ENTITY",
        "VERIFIED_EXPERT",
        "EXPERT",
        "SUPER_ADMIN",
        "OPERATOR_ADMIN",
        "ADMIN",
        "PROVINCIAL_ADMIN",
        "SECTOR_ADMIN",
        "CLUSTER_ADMIN",
        "PROVINCE_OFFICER",
        "PROVINCE_LEADER",
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
              <span>{workspaceBadge}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mt-2 text-card-title">
              {workspaceTitle}
            </h3>
          </div>

          {/* Quick link card to Admin / Gov Consoles if user has elevated privileges */}
          {isAdmin && (
            <div className="mb-4 p-2.5 rounded-lg bg-brand-50 border border-brand-200 dark:bg-brand-950/40 dark:border-brand-900">
              <p className="text-caption text-brand-800 dark:text-brand-300 font-medium mb-1.5">
                Bạn đang xem góc nhìn thị trường B2B
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900 dark:text-brand-200 hover:underline"
              >
                <span>Về Tổng Hành Dinh Quản Trị</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {isGov && (
            <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900">
              <p className="text-caption text-emerald-800 dark:text-emerald-300 font-medium mb-1.5">
                Bạn đang xem góc nhìn thị trường B2B
              </p>
              <Link
                href="/gov"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-200 hover:underline"
              >
                <span>Về Cổng Quản Trị Nhà Nước</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/portal"
                  ? pathname === "/portal"
                  : pathname === item.href || pathname?.startsWith(item.href + "/");
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
            {isExpert && (
              <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center gap-2.5 px-3 py-2 text-label font-semibold text-slate-400 dark:text-slate-300">
                  <ClipboardList className="h-4 w-4" />
                  <span>Yêu cầu tư vấn & kết nối</span>
                  <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-caption dark:bg-slate-800">
                    Sắp có
                  </span>
                </div>
              </div>
            )}
          </nav>
        </aside>

        {/* Workspace Content */}
        <div className="min-w-0 flex-1 p-4 sm:p-8">{children}</div>
      </div>
    </RoleGuard>
  );
}
