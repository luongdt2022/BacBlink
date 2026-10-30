"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  Lock,
  LayoutDashboard,
  Award,
  Inbox,
  AlarmClock,
  Zap,
  Users,
  Network,
  Database,
  History,
  Sliders,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  ChevronsUpDown,
} from "lucide-react";

interface MenuItem {
  href: string;
  tabValue?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  badge?: React.ReactNode | ((isActive: boolean) => React.ReactNode);
  keywords?: string;
}

interface MenuGroup {
  key: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    key: "group1",
    title: "1. Trung Tâm Điều Hành",
    badge: "BI 360°",
    badgeColor: "bg-white/15 text-white/90 border-white/20",
    items: [
      {
        href: "/admin",
        label: "Tổng quan Dashboard 360° & BI Toàn quốc",
        icon: LayoutDashboard,
        badge: (
          <span className="flex items-center gap-1.5 shrink-0 ml-auto pl-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs text-emerald-300 font-semibold hidden xl:inline">Live</span>
          </span>
        ),
        keywords: "dashboard bi 360 tong quan dieu hanh toan quoc live",
      },
      {
        href: "/admin/assessments/tt17",
        label: "Dashboard Đánh giá Công nghệ TT17",
        icon: Award,
        iconColor: "text-amber-300",
        badge: (isActive: boolean) => (
          <span
            className={`shrink-0 whitespace-nowrap text-xs font-bold px-2 py-0.5 rounded-full leading-none ml-auto transition-colors ${
              isActive
                ? "bg-brand-100 text-brand-800"
                : "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30"
            }`}
          >
            TT17
          </span>
        ),
        keywords: "dashboard danh gia cong nghe tt17 tien giang ninh thuan 26 tieu chi doanh nghiep",
      },
    ],
  },
  {
    key: "group2",
    title: "2. Phê Duyệt Toàn Quốc",
    badge: "HUB",
    badgeColor: "bg-amber-400/20 text-amber-200 border-amber-400/30",
    items: [
      {
        href: "/admin/approvals",
        label: "Tất cả Hàng đợi Phê duyệt",
        icon: Inbox,
        badge: (isActive: boolean) => (
          <span
            className={`shrink-0 whitespace-nowrap text-xs font-bold px-2 py-0.5 rounded-full leading-none ml-auto transition-colors ${
              isActive
                ? "bg-brand-100 text-brand-800"
                : "bg-white/20 text-white border border-white/20"
            }`}
          >
            34 Tỉnh
          </span>
        ),
        keywords: "hang doi phe duyet ho so 34 tinh",
      },
      {
        href: "/admin/approvals",
        tabValue: "sla",
        label: "Cảnh báo Quá hạn SLA Sở Tỉnh",
        icon: AlarmClock,
        iconColor: "text-rose-300",
        badge: () => (
          <span className="shrink-0 whitespace-nowrap text-xs font-bold px-2 py-0.5 rounded-full leading-none ml-auto bg-rose-500 text-white shadow-xs">
            SLA 72h
          </span>
        ),
        keywords: "canh bao qua han sla 72h so tinh tre hen",
      },
      {
        href: "/admin/approvals",
        tabValue: "override",
        label: "Phê duyệt Vượt cấp / Can thiệp",
        icon: Zap,
        iconColor: "text-amber-300",
        badge: () => (
          <span className="shrink-0 whitespace-nowrap text-xs font-extrabold px-2 py-0.5 rounded-full leading-none ml-auto bg-amber-400 text-slate-900 shadow-xs">
            Tầng 0
          </span>
        ),
        keywords: "vuot cap can thiep tang 0 dac quyen override",
      },
    ],
  },
  {
    key: "group3",
    title: "3. Quản Trị Danh Mục & Cơ Cấu",
    items: [
      {
        href: "/admin/roles",
        label: "Quản lý 10 Vai trò (RBAC)",
        icon: Users,
        iconColor: "text-emerald-300",
        keywords: "rbac 10 vai tro quyen han user phan quyen nguoi dung",
      },
      {
        href: "/admin/org-tree",
        label: "Cây Thư mục 34 Tỉnh/Thành",
        icon: Network,
        iconColor: "text-cyan-300",
        keywords: "cay thu muc 34 tinh thanh co cau to chuc don vi",
      },
      {
        href: "/admin/sectors",
        label: "Danh mục 10 Lĩnh Vực TT17 & TRL",
        icon: Database,
        iconColor: "text-cyan-300",
        keywords: "10 linh vuc tt17 trl tieu chi danh muc linh vuc",
      },
    ],
  },
  {
    key: "group4",
    title: "4. Giám Sát & Vận Hành",
    items: [
      {
        href: "/admin/audit-logs",
        label: "Nhật ký Kiểm toán Toàn quốc (Audit Logs)",
        icon: History,
        iconColor: "text-violet-300",
        keywords: "nhat ky kiem toan audit logs vet truy cap he thong an toan cap 3",
      },
      {
        href: "/admin/system-config",
        label: "Cấu hình Tham số & SLA Hệ thống",
        icon: Sliders,
        iconColor: "text-pink-300",
        keywords: "cau hinh tham so sla he thong thiet lap nd 85",
      },
    ],
  },
];

function AdminSidebarNav() {
  const pathname = usePathname();
  const currentTab = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") || "all" : "all";

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
        pathname.startsWith("/admin/roles/") ||
        pathname === "/admin/users" ||
        pathname.startsWith("/admin/users/")
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
    <aside className="w-full shrink-0 border-r border-brand-800 bg-brand-700 text-white lg:w-80 flex flex-col justify-between h-auto lg:h-[calc(100vh-68px)] lg:sticky lg:top-[68px] lg:self-start z-30">
      {/* KHỐI TRÊN: HEADER + TÌM KIẾM + NAV */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Header Tầng 0 */}
        <div className="p-4 pb-3 border-b border-white/15 bg-brand-800/30">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-xs">
              <Lock className="w-3.5 h-3.5 text-white/90 shrink-0" />
              <span>Tầng 0: Quản Trị Tối Cao</span>
            </div>
            <button
              type="button"
              onClick={toggleAllGroups}
              title="Thu gọn / Mở rộng tất cả"
              className="text-white/60 hover:text-white p-1 rounded-md hover:bg-white/10 transition"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <h3 className="text-sm font-black text-white mt-2 tracking-tight">Trung Tâm Quản Trị Hệ Thống</h3>
          <p className="text-xs text-white/75 mt-0.5 leading-snug">Phân hệ quản trị 34 tỉnh/thành trọng điểm</p>

          {/* Quick Menu Filter */}
          <div className="relative mt-3">
            <Search className="w-3.5 h-3.5 text-white/50 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh tác vụ (RBAC, SLA, Tỉnh...)"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/40 focus:bg-white/15 transition placeholder:text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-0.5"
                title="Xóa tìm kiếm"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 4 NHÓM ACCORDION MENU (SCROLLABLE NỘI BỘ) */}
        <nav className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
          {filteredGroups.length === 0 ? (
            <div className="p-4 text-center text-xs text-white/60">
              <p>Không tìm thấy tác vụ phù hợp với &quot;{searchQuery}&quot;</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-white text-xs underline font-semibold hover:text-white/80"
              >
                Hiện toàn bộ menu
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const open = isGroupOpen(group.key);
              return (
                <div key={group.key} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider text-white/80 hover:text-white hover:bg-white/10 transition group text-left"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="shrink-0 text-white/60 group-hover:text-white transition-transform duration-200">
                        {open ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className="truncate">{group.title}</span>
                    </div>
                    {group.badge && (
                      <span
                        className={`shrink-0 whitespace-nowrap text-xs font-bold px-2 py-0.5 rounded-full border ml-2 ${
                          group.badgeColor || "bg-white/15 text-white/90 border-white/20"
                        }`}
                      >
                        {group.badge}
                      </span>
                    )}
                  </button>

                  {open && (
                    <div className="space-y-1 pl-1">
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
                            className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              active
                                ? "bg-white text-brand-900 shadow-sm font-bold"
                                : "text-white/85 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-colors ${
                                  active
                                    ? "text-brand-700"
                                    : item.iconColor || "text-white/70 group-hover:text-white"
                                }`}
                              />
                              <span className="truncate leading-tight">{item.label}</span>
                            </div>
                            {typeof item.badge === "function"
                              ? item.badge(active)
                              : item.badge}
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
      <div className="p-4 pt-3 border-t border-white/15 bg-brand-800/40 shrink-0 space-y-2">
        <div className="p-2.5 rounded-lg bg-brand-900/60 border border-white/15 text-white space-y-1">
          <div className="font-bold text-white flex items-center justify-between text-caption">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs">An Toàn TT: Cấp 3</span>
            </span>
            <span className="text-xs bg-white/15 px-1.5 py-0.5 rounded text-white border border-white/20 font-mono">
              NĐ 85/2016
            </span>
          </div>
          <p className="text-xs leading-tight text-white/75">
            Mã hóa đường truyền TLS 1.3 · Lưu vết 100% nhật ký bất biến
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={["SUPER_ADMIN", "OPERATOR_ADMIN", "ADMIN"]}
      portalName="Cổng Quản Trị Hệ Thống Tối Cao (Bộ KH&CN / NacenTech)"
    >
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-100 dark:bg-slate-950 lg:flex-row">
        <AdminSidebarNav />

        {/* Admin Main Workspace */}
        <div className="min-w-0 flex-1 p-4 sm:p-8 overflow-y-auto">{children}</div>
      </div>
    </RoleGuard>
  );
}
