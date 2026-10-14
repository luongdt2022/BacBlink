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
  Inbox,
  Rocket,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
}

// 1. Bên Mua Công Nghệ (BUYER) - Tập trung giải bài toán, tìm cung & tiến trình hợp tác
const buyerNavItems: NavItem[] = [
  { href: "/portal", label: "Tổng quan Mua sắm", icon: LayoutDashboard },
  { href: "/portal/buyer/demands", label: "Bài toán Tìm mua", icon: ShoppingBag },
  { href: "/portal/matching/radar", label: "Radar Ghép Nối AI", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Tiến trình Hợp tác & MOU", icon: Kanban },
  { href: "/khao-sat-nhu-cau", label: "Khảo sát Nhu cầu (TNI)", icon: ClipboardList },
  { href: "/assessments/tt17", label: "Đánh giá Năng lực TT17", icon: FileCheck },
  { href: "/portal/enterprise/profile", label: "Hồ sơ Doanh nghiệp", icon: Building2 },
];

// 2. Nhà Cung Ứng Công Nghệ (SELLER) - Quản lý tài sản TRL, đón nhận leads & chuyển giao
const sellerNavItems: NavItem[] = [
  { href: "/portal", label: "Tổng quan Gian hàng", icon: LayoutDashboard },
  { href: "/portal/seller/technologies", label: "Kho Công nghệ (TRL)", icon: Cpu },
  { href: "/portal/opportunities/pipeline?tab=inbound", label: "Yêu cầu Kết nối Nhận được", icon: Inbox },
  { href: "/portal/matching/radar", label: "Radar Tìm Kiếm Nhu Cầu (AI)", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Tiến trình Chuyển giao & MOU", icon: Kanban },
  { href: "/portal/enterprise/profile", label: "Hồ sơ Đơn vị / Viện Trường", icon: Building2 },
];

// 3. Chuyên Gia KH&CN (EXPERT / VERIFIED_EXPERT) - Thuần chất LLKH, tư vấn & đồng hành
const expertNavItems: NavItem[] = [
  { href: "/portal", label: "Tổng quan Chuyên gia", icon: LayoutDashboard },
  { href: "/portal/expert/profile", label: "Hồ sơ LLKH của tôi", icon: GraduationCap },
  { href: "/portal/opportunities/pipeline?type=consulting", label: "Lời mời Tư vấn Doanh nghiệp", icon: ClipboardList },
  { href: "/portal/matching/radar", label: "Radar Cơ hội Phù hợp (AI)", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Dự án Đồng hành & Hợp tác", icon: Kanban },
];

// 4. Doanh Nghiệp ĐMST (INNOVATION_ENTITY) - Phân tách 2 khối Cung-Cầu & Năng lực
const innovationEntityNavItems: NavItem[] = [
  { href: "/portal", label: "Tổng quan Hoạt động ĐMST", icon: LayoutDashboard, section: "Hoạt động Cung – Cầu" },
  { href: "/portal/buyer/demands", label: "Bài toán Cần Mua", icon: ShoppingBag },
  { href: "/portal/seller/technologies", label: "Công nghệ Chào Bán", icon: Cpu },
  { href: "/portal/matching/radar", label: "Radar Ghép Nối AI", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Tiến trình Hợp tác", icon: Kanban },
  { href: "/assessments/tt17", label: "Tự Đánh giá TT17", icon: FileCheck, section: "Năng lực & Hồ sơ" },
  { href: "/portal/enterprise/profile", label: "Hồ sơ Doanh nghiệp ĐMST", icon: Building2 },
];

// 5. Thành Viên Đại Chúng (PUBLIC_USER / USER) - Khám phá và hub đăng ký nâng hạng
const publicNavItems: NavItem[] = [
  { href: "/portal", label: "Bàn làm việc Cá nhân", icon: LayoutDashboard },
  { href: "/portal/matching/radar", label: "Radar Khám Phá AI", icon: Sparkles },
  { href: "/profile/upgrade", label: "Đăng ký Nâng hạng Vai trò", icon: Rocket },
  { href: "/settings", label: "Cài đặt Tài khoản", icon: FileCheck },
];

// 6. Quản Trị Viên (ADMIN / GOV) - Góc nhìn Giám sát Thực địa
const adminPortalNavItems: NavItem[] = [
  { href: "/portal", label: "Tổng quan Sàn B2B", icon: LayoutDashboard },
  { href: "/portal/matching/radar", label: "Radar Ghép Nối Toàn Sàn", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Giám sát Kết nối Toàn Sàn", icon: Kanban },
  { href: "/portal/seller/technologies", label: "Kho Chào bán Toàn sàn", icon: Cpu },
  { href: "/portal/buyer/demands", label: "Bài toán Nhu cầu Toàn sàn", icon: ShoppingBag },
];

const PORTAL_ALLOWED_ROLES = [
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

  let navItems: NavItem[] = publicNavItems;
  let workspaceTitle = "Bàn Làm Việc Cá Nhân";
  let workspaceBadge = "Thành Viên Đại Chúng";

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
    workspaceTitle = "Góc Nhìn Giám Sát Thực Địa";
    workspaceBadge = "Quản Trị Viên Hệ Thống";
  } else if (isGov) {
    navItems = adminPortalNavItems;
    workspaceTitle = "Giám Sát Thị Trường Địa Bàn";
    workspaceBadge = "Cán Bộ Quản Trị Nhà Nước";
  }

  return (
    <RoleGuard
      allowedRoles={PORTAL_ALLOWED_ROLES}
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
              const basePath = item.href.split("?")[0];
              const isActive =
                basePath === "/portal"
                  ? pathname === "/portal"
                  : pathname === basePath || pathname?.startsWith(basePath + "/");
              return (
                <React.Fragment key={item.href + item.label}>
                  {item.section && (
                    <div className="pt-3 pb-1 px-3 text-caption font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {item.section}
                    </div>
                  )}
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
                </React.Fragment>
              );
            })}
          </nav>
        </aside>

        {/* Workspace Content */}
        <div className="min-w-0 flex-1 p-4 sm:p-8">{children}</div>
      </div>
    </RoleGuard>
  );
}
