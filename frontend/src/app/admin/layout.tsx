"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { AdminWorkspaceSkeleton } from "@/components/admin/admin-workspace-skeleton";
import {
  LayoutDashboard,
  Inbox,
  Users,
  Database,
  History,
  Sliders,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  ChevronsUpDown,
  BadgeCheck,
  Newspaper,
} from "lucide-react";

interface MenuItem {
  href: string;
  tabValue?: string;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
}

interface MenuGroup {
  key: string;
  title: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    key: "group1",
    title: "1. Trung Tâm Điều Hành",
    items: [
      {
        href: "/admin",
        label: "Tổng quan hệ thống",
        icon: LayoutDashboard,
        keywords: "dashboard bi 360 tong quan he thong dieu hanh baclink live",
      },
    ],
  },
  {
    key: "group2",
    title: "2. Phê Duyệt Hồ Sơ",
    items: [
      {
        href: "/admin/approvals",
        label: "Hàng đợi phê duyệt",
        icon: Inbox,
        keywords: "hang doi phe duyet ho so doanh nghiep hoi vien baclink 1 cap",
      },
    ],
  },
  {
    key: "group3",
    title: "3. Quản Trị Danh Mục & Phân Quyền",
    items: [
      {
        href: "/admin/members",
        label: "Quản lý hội viên",
        icon: BadgeCheck,
        keywords: "hoi vien membership hoi phi gia han chung nhan tieu bieu tam ngung hang",
      },
      {
        href: "/admin/users",
        label: "Quản lý người dùng",
        icon: Users,
        keywords: "quan ly nguoi dung user tai khoan all users admin danh sach thanh vien",
      },
      {
        href: "/admin/roles",
        label: "Phân quyền (RBAC)",
        icon: ShieldCheck,
        keywords: "rbac 3 cap admin enterprise public_user vai tro quyen han phan quyen",
      },
      {
        href: "/admin/sectors",
        label: "Ngành Công Nghiệp & Địa Bàn",
        icon: Database,
        keywords: "8 nganh cong nghiep baclink dia ban kcn bac ninh trl danh muc linh vuc",
      },
      {
        href: "/admin/elearning",
        label: "Đào tạo & học liệu số",
        icon: GraduationCap,
        keywords: "hoc lieu so dao tao elearning lms khoa hoc bai giang",
      },
    ],
  },
  {
    key: "group4",
    title: "4. Giám Sát & Vận Hành",
    items: [
      {
        href: "/admin/cms",
        label: "Quản lý nội dung",
        icon: Newspaper,
        keywords: "noi dung cms tin tuc bai viet tai lieu thu vien faq doi tac chinh sach dieu le",
      },
      {
        href: "/admin/contact-requests",
        label: "Hộp thư liên hệ",
        icon: Inbox,
        keywords: "hop thu lien he yeu cau ho tro kien nghi hop tac bao chi contact",
      },
      {
        href: "/admin/audit-logs",
        label: "Nhật ký kiểm toán",
        icon: History,
        keywords: "nhat ky kiem toan audit logs vet truy cap he thong an toan cap 3",
      },
      {
        href: "/admin/system-config",
        label: "Cấu hình hệ thống",
        icon: Sliders,
        keywords: "cau hinh tham so he thong thiet lap nd 85",
      },
      {
        href: "/admin/blockchain",
        label: "Blockchain & ZKP",
        icon: ShieldCheck,
        keywords: "blockchain zkp ndachain so cai mat ma merkle zero knowledge proof",
      },
    ],
  },
];

const PENDING_ROUTE_FAILSAFE_MS = 12000;

function normalizeAdminTarget(pathname: string): string {
  return pathname;
}

interface AdminSidebarNavProps {
  pathname: string;
  currentTab: string;
  currentTargetHref: string;
  pendingHref: string | null;
  onNavigateStart: (targetHref: string | null) => void;
}

function AdminSidebarNav({
  pathname,
  currentTab,
  currentTargetHref,
  pendingHref,
  onNavigateStart,
}: AdminSidebarNavProps) {
  // 4 nhóm Accordion: mở mặc định
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    group1: true,
    group2: true,
    group3: true,
    group4: true,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllGroups = () => {
    const allOpen = Object.values(openGroups).every(Boolean);
    const nextState: Record<string, boolean> = {};
    MENU_GROUPS.forEach((g) => {
      nextState[g.key] = !allOpen;
    });
    setOpenGroups(nextState);
  };

  const isLinkActive = (href: string, tabValue?: string) => {
    const linkHref = tabValue ? `${href}?tab=${tabValue}` : href;
    if (pendingHref !== null) {
      return linkHref === pendingHref;
    }

    if (tabValue) {
      return pathname === "/admin/approvals" && currentTab === tabValue;
    }
    if (href === "/admin") {
      return pathname === "/admin";
    }
    if (href === "/admin/approvals") {
      return (
        pathname === "/admin/approvals" &&
        (currentTab === "all" || currentTab === "" || !currentTab)
      );
    }
    if (href === "/admin/roles") {
      return (
        pathname === "/admin/roles" ||
        pathname.startsWith("/admin/roles/")
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Tìm kiếm nhanh menu
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MENU_GROUPS;

    return MENU_GROUPS.map((group) => {
      const matchingItems = group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          (item.keywords && item.keywords.toLowerCase().includes(q))
      );
      return {
        ...group,
        items: matchingItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [searchQuery]);

  const isGroupOpen = (key: string) => {
    if (searchQuery.trim().length > 0) return true;
    return !!openGroups[key];
  };

  return (
    <aside className="w-full shrink-0 border-r border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 lg:w-72 flex flex-col justify-between h-auto lg:h-[calc(100vh-68px)] lg:sticky lg:top-[68px] lg:self-start z-30 shadow-xs">
      {/* KHỐI TRÊN: HEADER + TÌM KIẾM + NAV */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Header Admin */}
        <div className="p-3.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Trung Tâm Quản Trị Hệ Thống
            </h3>
            <button
              type="button"
              onClick={toggleAllGroups}
              title="Thu gọn / Mở rộng tất cả"
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 p-1 rounded-lg transition"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Menu Filter */}
          <div className="relative mt-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh tác vụ (RBAC, Duyệt, Lĩnh vực...)"
              className="form-control w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title="Xóa tìm kiếm"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 4 NHÓM ACCORDION MENU (SCROLLABLE NỘI BỘ) */}
        <nav className="p-2.5 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
          {filteredGroups.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              <p>Không tìm thấy tác vụ phù hợp với &quot;{searchQuery}&quot;</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-brand-700 dark:text-brand-300 text-xs underline font-semibold hover:text-brand-800"
              >
                Hiện toàn bộ menu
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const open = isGroupOpen(group.key);
              return (
                <div key={group.key} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 hover:bg-slate-100/70 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800/50 transition group text-left"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="shrink-0 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-transform duration-200">
                        {open ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </span>
                      <span className="truncate">{group.title}</span>
                    </div>
                  </button>

                  {open && (
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isLinkActive(item.href, item.tabValue);
                        const linkHref = item.tabValue
                          ? `${item.href}?tab=${item.tabValue}`
                          : item.href;

                        return (
                          <Link
                            key={linkHref}
                            href={linkHref}
                            title={item.label}
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
                              if (linkHref !== currentTargetHref) {
                                onNavigateStart(linkHref);
                              } else {
                                onNavigateStart(null);
                              }
                            }}
                            className={`focus-ring flex min-h-9 items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                              active
                                ? "bg-brand-700 text-white shadow-xs font-semibold"
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-700 dark:hover:text-white"
                            }`}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                                active
                                  ? "text-white"
                                  : "text-slate-400 group-hover:text-brand-600 dark:text-slate-400 dark:group-hover:text-brand-400"
                              }`}
                            />
                            <span className="truncate leading-tight flex-1">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>
      </div>

      {/* FOOTER INFO (PINNED ĐÁY SIDEBAR) */}
      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 shrink-0 space-y-1.5">
        <div className="p-2 rounded-lg bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 text-slate-700 dark:text-slate-300 space-y-0.5 shadow-2xs">
          <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>An Toàn TT: Cấp 3</span>
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
              NĐ 85/2016
            </span>
          </div>
          <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
            Mã hóa đường truyền TLS 1.3 · Lưu vết 100% nhật ký bất biến
          </p>
        </div>
      </div>
    </aside>
  );
}

function AdminShellSuspenseFallback() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950 lg:flex-row">
      <aside className="w-full shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:w-72 p-4 space-y-4">
        <div className="h-6 w-48 rounded animate-shimmer" />
        <div className="h-9 w-full rounded-lg animate-shimmer" />
        <div className="space-y-2 pt-2">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="h-8 w-full rounded-lg animate-shimmer" />
          ))}
        </div>
      </aside>
      <div className="min-w-0 flex-1 p-3 sm:p-4 overflow-y-auto">
        <AdminWorkspaceSkeleton />
      </div>
    </div>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams?.toString() ?? "";
  const rawTab = searchParams?.get("tab") ?? null;
  const currentTab = rawTab || "all";
  const currentTargetHref = normalizeAdminTarget(pathname);

  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const pendingHrefRef = useRef<string | null>(null);

  const handleNavigateStart = useCallback((targetHref: string | null) => {
    pendingHrefRef.current = targetHref;
    setPendingHref((prev) => (prev === targetHref ? prev : targetHref));
  }, []);

  useEffect(() => {
    pendingHrefRef.current = null;
    setPendingHref(null);
  }, [pathname, searchParamsKey]);

  useEffect(() => {
    if (!pendingHref) return;

    const timer = setTimeout(() => {
      pendingHrefRef.current = null;
      setPendingHref(null);
    }, PENDING_ROUTE_FAILSAFE_MS);

    return () => clearTimeout(timer);
  }, [pendingHref]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950 lg:flex-row">
      <AdminSidebarNav
        pathname={pathname}
        currentTab={currentTab}
        currentTargetHref={currentTargetHref}
        pendingHref={pendingHref}
        onNavigateStart={handleNavigateStart}
      />

      {/* Admin Main Workspace */}
      <div
        data-testid="admin-main-workspace"
        className="min-w-0 flex-1 p-3 sm:p-4 overflow-y-auto"
      >
        {pendingHref !== null ? <AdminWorkspaceSkeleton /> : children}
      </div>
    </div>
  );
}

const ADMIN_ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN", "OPERATOR_ADMIN"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={ADMIN_ALLOWED_ROLES}
      portalName="Cổng Quản Trị Hệ Thống BACLINK"
    >
      <React.Suspense fallback={<AdminShellSuspenseFallback />}>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </React.Suspense>
    </RoleGuard>
  );
}
