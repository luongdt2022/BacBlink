"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { WorkspaceRouteSkeleton } from "@/components/common/workspace-route-skeleton";
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
  ShieldCheck,
  FileText,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { fetchMyEnterpriseProfile } from "@/lib/enterprise-client";
import { resolveExpertActiveMenu } from "@/lib/expert-nav";
import { RoleSwitcher } from "@/components/common/role-switcher";
import { useToast } from "@/components/common/toast";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
  key?: string;
  badge?: string | number;
  badgeType?: "count" | "new" | "coming-soon";
  disabled?: boolean;
  disabledMessage?: string;
}

/** Tự động nhận diện nhãn hồ sơ tương thích động theo loại hình chủ thể & role */
function resolveProfileLabel(role?: string | null, subjectType?: string | null, orgName?: string | null): string {
  const upperRole = (role ?? "").toUpperCase();
  const st = (subjectType ?? "").toLowerCase();
  const on = (orgName ?? "").toLowerCase();

  // 1. Nhận diện theo loại hình chủ thể từ profile
  if (st.includes("viện") || st.includes("trường") || st.includes("học viện") || st.includes("đại học")) {
    return "Hồ sơ Viện / Trường";
  }
  if (st.includes("htx") || st.includes("hợp tác xã")) {
    return "Hồ sơ Hợp tác xã";
  }
  if (st.includes("đmst") || st.includes("đổi mới sáng tạo")) {
    return "Hồ sơ Doanh nghiệp ĐMST";
  }

  // 2. Nhận diện theo tên đơn vị
  if (on.includes("viện") || on.includes("trường") || on.includes("học viện") || on.includes("đại học")) {
    return "Hồ sơ Viện / Trường";
  }

  // 3. Nhận diện theo vai trò (Role)
  if (upperRole === "CLUSTER_ADMIN") {
    return "Hồ sơ Viện / Trường";
  }
  if (upperRole === "INNOVATION_ENTITY") {
    return "Hồ sơ Doanh nghiệp ĐMST";
  }

  // Mặc định cho Doanh nghiệp (BUYER / SELLER)
  return "Hồ sơ Doanh nghiệp";
}

// 1. Bên Mua Công Nghệ (BUYER) - Tập trung giải bài toán, tìm cung & tiến trình hợp tác (Delta v13: 3 Sections)
const buyerNavItems: NavItem[] = [
  // Khối 1: Tác nghiệp Đặt hàng & Hợp tác
  {
    href: "/portal",
    label: "Tổng quan Mua sắm",
    icon: LayoutDashboard,
    section: "Tác nghiệp Mua sắm",
  },
  {
    href: "/portal/buyer/demands",
    label: "Nhu cầu & Đơn mua",
    icon: ShoppingBag,
  },
  {
    href: "/portal/buyer/consultations",
    label: "Tư Vấn Chuyên Gia",
    icon: Inbox,
  },
  {
    href: "/portal/opportunities/pipeline",
    label: "Giao dịch & MOU",
    icon: Kanban,
  },

  // Khối 2: Khám phá & Ghép nối AI
  {
    href: "/portal/matching/radar",
    label: "Radar Ghép Nối AI",
    icon: Sparkles,
    section: "Khám phá & Ghép nối",
    badge: "Mới",
    badgeType: "new",
  },

  // Khối 3: Chẩn đoán & Năng lực
  {
    href: "/khao-sat-nhu-cau",
    label: "Khảo sát Nhu cầu (TNI)",
    icon: ClipboardList,
    section: "Chẩn đoán & Hồ sơ",
  },
  {
    href: "/assessments/tt17",
    label: "Đánh giá Năng lực TT17",
    icon: FileCheck,
  },
  {
    href: "/portal/enterprise/profile",
    label: "Hồ sơ Doanh nghiệp",
    icon: Building2,
  },
];

// 2. Nhà Cung Ứng Công Nghệ (SELLER) - Quản lý sản phẩm/công nghệ, đón nhận liên hệ & giao dịch (3 nhóm đồng bộ với Bên Mua)
const sellerNavItems: NavItem[] = [
  // Khối 1: Tác nghiệp Bán hàng & Giao dịch
  { href: "/portal", label: "Tổng quan Gian hàng", icon: LayoutDashboard, section: "Tác nghiệp Bán hàng" },
  { href: "/portal/seller/technologies", label: "Sản phẩm & Công nghệ", icon: Cpu },
  { href: "/portal/seller/connection-requests", label: "Khách hàng liên hệ", icon: Inbox },
  { href: "/portal/opportunities/pipeline", label: "Giao dịch & MOU", icon: Kanban },

  // Khối 2: Khám phá & Ghép nối AI
  {
    href: "/portal/matching/radar",
    label: "Tìm nhu cầu mua (AI)",
    icon: Sparkles,
    section: "Khám phá & Ghép nối",
    badge: "Mới",
    badgeType: "new",
  },

  // Khối 3: Chẩn đoán & Hồ sơ
  { href: "/assessments/tt17", label: "Đánh giá Năng lực TT17", icon: FileCheck, section: "Chẩn đoán & Hồ sơ" },
  { href: "/portal/enterprise/profile", label: "Hồ sơ Doanh nghiệp", icon: Building2 },
];

// 3. Chuyên Gia KH&CN (EXPERT / VERIFIED_EXPERT) - Thuần chất LLKH, tư vấn & đồng hành
const expertNavItems: NavItem[] = [
  // Khối 1: Tác nghiệp hàng ngày
  { href: "/portal/expert/profile", label: "Tổng quan Chuyên gia", icon: LayoutDashboard, key: "profile", section: "Tác nghiệp hàng ngày" },
  { href: "/portal/expert/elearning", label: "Đào tạo & Học liệu số", icon: GraduationCap, key: "elearning", badge: "LMS", badgeType: "new" },
  { href: "/portal/expert/consultations", label: "Hộp Thư Tư Vấn & Kết Nối", icon: Inbox, key: "consultations", badge: 2, badgeType: "count" },
  { href: "/portal/matching/radar", label: "Radar Cơ hội Phù hợp (AI)", icon: Sparkles, key: "radar", badge: "Mới", badgeType: "new" },
  { href: "/portal/expert/projects", label: "Dự án Đồng hành & Hợp tác", icon: Kanban, key: "projects" },
  { href: "/portal/buyer/demands", label: "Đơn hàng & Nhu cầu đặt mua", icon: ShoppingBag, key: "orders-demands" },

  // Khối 2: Kinh tế & Hợp đồng (Sắp ra mắt)
  {
    href: "/portal/expert/contracts",
    label: "Hợp đồng & Thù lao",
    icon: FileText,
    key: "contracts",
    section: "Kinh tế & Hợp đồng",
    disabled: true,
    badge: "Sắp ra mắt",
    badgeType: "coming-soon",
    disabledMessage: "Tính năng Hợp đồng & Thù lao đang được phát triển theo lộ trình.",
  },

  // Khối 3: Hồ sơ & Quản trị
  { href: "/portal/expert/profile/edit", label: "Hồ sơ LLKH của tôi", icon: GraduationCap, key: "profile-edit", section: "Hồ sơ & Quản trị" },
  { href: "/portal/expert/account", label: "Cài đặt & Tài khoản", icon: ShieldCheck, key: "account" },
];

// 4. Doanh Nghiệp ĐMST (INNOVATION_ENTITY) - Phân tách 2 khối Cung-Cầu & Năng lực
const innovationEntityNavItems: NavItem[] = [
  { href: "/portal", label: "Tổng quan Hoạt động ĐMST", icon: LayoutDashboard, section: "Hoạt động Cung – Cầu" },
  { href: "/portal/buyer/demands", label: "Bài toán Cần Mua", icon: ShoppingBag },
  { href: "/portal/buyer/consultations", label: "Tư Vấn Chuyên Gia", icon: Inbox },
  { href: "/portal/seller/technologies", label: "Công nghệ Chào Bán", icon: Cpu },
  { href: "/portal/matching/radar", label: "Radar Ghép Nối AI", icon: Sparkles },
  { href: "/portal/opportunities/pipeline", label: "Tiến trình Hợp tác", icon: Kanban },
  { href: "/assessments/tt17", label: "Tự Đánh giá TT17", icon: FileCheck, section: "Năng lực & Hồ sơ" },
  { href: "/portal/enterprise/profile", label: "Hồ sơ Doanh nghiệp ĐMST", icon: Building2 },
];

// 5. Thành Viên Đại Chúng (PUBLIC_USER / USER) - Khám phá và hub đăng ký nâng hạng (CR-TASK-03-DELTA-01: T-03.DEL-03, CR-TASK-03-DELTA-02)
const publicNavItems: NavItem[] = [
  { href: "/portal", label: "Trang tổng quan", icon: LayoutDashboard },
  { href: "/portal/buyer/demands", label: "Nhu cầu công nghệ", icon: ShoppingBag },
  { href: "/portal/buyer/consultations", label: "Tư Vấn Chuyên Gia", icon: Inbox },
  { href: "/portal/matching/radar", label: "Radar Ghép Nối AI", icon: Sparkles, badge: "Mới", badgeType: "new" },
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

const PENDING_ROUTE_FAILSAFE_MS = 12000;

function PortalShellSuspenseFallback() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-surface-page dark:bg-slate-950 lg:flex-row">
      <aside className="w-full shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:w-72 space-y-4">
        <div className="h-6 w-40 rounded animate-shimmer" />
        <div className="h-10 w-full rounded-lg animate-shimmer" />
        <div className="space-y-2 pt-2">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="h-9 w-full rounded-lg animate-shimmer" />
          ))}
        </div>
      </aside>
      <div className="min-w-0 flex-1 p-3 sm:p-4">
        <WorkspaceRouteSkeleton
          testId="portal-route-skeleton"
          srText="Đang tải không gian làm việc..."
        />
      </div>
    </div>
  );
}

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams?.toString() ?? "";
  const currentTab = searchParams?.get("tab") || "";
  const currentTargetHref = searchParamsKey ? `${pathname}?${searchParamsKey}` : pathname;
  const toast = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const handleNavigateStart = useCallback((targetHref: string | null) => {
    setPendingHref((prev) => (prev === targetHref ? prev : targetHref));
  }, []);

  // Đồng bộ role & activeRole từ local session khi chuyển route mà không gọi lại API profile
  useEffect(() => {
    const user = authClient.getUser();
    setUserRole(user?.role ?? null);

    const savedActiveRole = typeof window !== "undefined" ? localStorage.getItem("nacentwin_active_role") : null;
    if (savedActiveRole) {
      setActiveRole(savedActiveRole);
    }
  }, [pathname]);

  // Nạp hồ sơ doanh nghiệp 1 lần (chỉ cho nhóm vai trò doanh nghiệp) và khi profile/role thay đổi
  useEffect(() => {
    let cancelled = false;
    const initialUser = authClient.getUser();
    const initialRole = (initialUser?.role ?? "").toUpperCase();
    const isEnterpriseUser = ["BUYER", "SELLER", "INNOVATION_ENTITY"].includes(initialRole);

    const loadProfile = () => {
      if (!isEnterpriseUser) return;
      fetchMyEnterpriseProfile()
        .then((p) => {
          if (cancelled || !p) return;
          setUserProfile(p);
          if (p.activeRole) {
            setActiveRole(p.activeRole);
            localStorage.setItem("nacentwin_active_role", p.activeRole);
          }
        })
        .catch(() => {});
    };

    loadProfile();

    // Lắng nghe sự kiện chuyển đổi vai trò tức thì từ RoleSwitcher
    const handleRoleSwitched = (e: Event) => {
      const customEvent = e as CustomEvent<{ role: string }>;
      if (customEvent.detail?.role) {
        setActiveRole(customEvent.detail.role);
      }
    };

    const handleProfileUpdated = () => {
      loadProfile();
    };

    window.addEventListener("nacentwin_role_switched", handleRoleSwitched);
    window.addEventListener("nacentwin_enterprise_profile_updated", handleProfileUpdated);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "nacentwin_active_role" && e.newValue) {
        setActiveRole(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      cancelled = true;
      window.removeEventListener("nacentwin_role_switched", handleRoleSwitched);
      window.removeEventListener("nacentwin_enterprise_profile_updated", handleProfileUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname, searchParamsKey]);

  useEffect(() => {
    if (!pendingHref) return;
    const timer = setTimeout(() => {
      setPendingHref(null);
    }, PENDING_ROUTE_FAILSAFE_MS);
    return () => clearTimeout(timer);
  }, [pendingHref]);

  const upperRole = (userRole ?? "").toUpperCase();
  const isExpert = upperRole === "VERIFIED_EXPERT" || upperRole === "EXPERT";
  const isAdmin = upperRole === "SUPER_ADMIN" || upperRole === "OPERATOR_ADMIN" || upperRole === "ADMIN";
  const isGov =
    upperRole === "PROVINCIAL_ADMIN" ||
    upperRole === "SECTOR_ADMIN" ||
    upperRole === "CLUSTER_ADMIN" ||
    upperRole === "PROVINCE_OFFICER" ||
    upperRole === "PROVINCE_LEADER";

  // Nhóm doanh nghiệp (BUYER, SELLER, INNOVATION_ENTITY) có thể chuyển đổi linh hoạt qua RoleSwitcher
  const isEnterpriseRole = ["BUYER", "SELLER", "INNOVATION_ENTITY"].includes(upperRole);
  const effectiveRole = isEnterpriseRole
    ? (activeRole?.toUpperCase() || upperRole)
    : upperRole;

  const isBuyer = effectiveRole === "BUYER";
  const isSeller = effectiveRole === "SELLER";
  const isInnovationEntity = upperRole === "INNOVATION_ENTITY" && !activeRole;

  let navItems: NavItem[] = publicNavItems;
  let workspaceTitle = "Không Gian Thành Viên";
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

  const dynamicProfileLabel = resolveProfileLabel(
    effectiveRole || userRole,
    userProfile?.subjectType,
    authClient.getUser()?.organizationName
  );

  const displayedNavItems = navItems.map((item) => {
    if (item.href === "/portal/enterprise/profile") {
      return { ...item, label: dynamicProfileLabel };
    }
    return item;
  });

  return (
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

          <RoleSwitcher className="mb-4" />

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
                <span>Về Trung Tâm Quản Trị Hệ Thống</span>
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
            {displayedNavItems.map((item) => {
              const Icon = item.icon;
              const basePath = item.href.split("?")[0];
              const itemQuery = item.href.includes("?") ? new URLSearchParams(item.href.split("?")[1]) : null;
              const activeExpertKey = isExpert ? resolveExpertActiveMenu(pathname) : null;

              let isActive = false;
              if (item.disabled) {
                isActive = false;
              } else if (pendingHref !== null) {
                isActive = item.href === pendingHref;
              } else if (isExpert && item.key) {
                isActive = item.key === activeExpertKey;
              } else if (basePath === "/portal") {
                isActive = pathname === "/portal";
              } else if (pathname === basePath || pathname?.startsWith(basePath + "/")) {
                if (itemQuery && itemQuery.has("tab")) {
                  isActive = currentTab === itemQuery.get("tab");
                } else {
                  isActive = true;
                }
              }

              const renderBadge = () => {
                if (!item.badge) return null;
                if (item.badgeType === "coming-soon") {
                  return (
                    <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  );
                }
                if (item.badgeType === "count") {
                  return (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  );
                }
                if (item.badgeType === "new") {
                  return (
                    <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                      {item.badge}
                    </span>
                  );
                }
                return (
                  <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {item.badge}
                  </span>
                );
              };

              return (
                <React.Fragment key={item.href + item.label}>
                  {item.section && (
                    <div className="pt-3 pb-1 px-3 text-caption font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {item.section}
                    </div>
                  )}
                  {item.disabled ? (
                    <button
                      type="button"
                      aria-disabled="true"
                      aria-label={`${item.label} (${item.disabledMessage || "Tính năng đang được phát triển theo lộ trình, hiện chưa khả dụng"})`}
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info(
                          item.disabledMessage || "Tính năng Hợp đồng & Thù lao đang được phát triển theo lộ trình.",
                          "Sắp Ra Mắt"
                        );
                      }}
                      className="focus-ring flex min-h-11 w-full items-center gap-2.5 px-3 py-2 rounded-control text-label font-semibold transition cursor-not-allowed opacity-60 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                      {renderBadge()}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (
                          e.defaultPrevented ||
                          e.button !== 0 ||
                          e.ctrlKey ||
                          e.metaKey ||
                          e.shiftKey ||
                          e.altKey
                        ) {
                          return;
                        }
                        const isSameTarget = item.href.includes("?")
                          ? item.href === currentTargetHref
                          : item.href === pathname;
                        handleNavigateStart(isSameTarget ? null : item.href);
                      }}
                      className={`focus-ring flex min-h-11 items-center gap-2.5 px-3 py-2 rounded-control text-label font-semibold transition ${
                        isActive
                          ? "bg-brand-700 text-white shadow-sm shadow-brand-700/20"
                          : "text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-700 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                      {renderBadge()}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </aside>

        {/* Workspace Content */}
        <div
          data-testid="portal-main-workspace"
          className="min-w-0 flex-1 p-3 sm:p-4"
        >
          {pendingHref !== null ? (
            <WorkspaceRouteSkeleton
              testId="portal-route-skeleton"
              srText="Đang tải không gian làm việc..."
            />
          ) : (
            children
          )}
        </div>
      </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={PORTAL_ALLOWED_ROLES}
      portalName="Cổng Không Gian Thị Trường & Đổi Mới Sáng Tạo"
    >
      <React.Suspense fallback={<PortalShellSuspenseFallback />}>
        <PortalLayoutInner>{children}</PortalLayoutInner>
      </React.Suspense>
    </RoleGuard>
  );
}
