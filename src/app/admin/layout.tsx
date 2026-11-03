"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  Lock,
  LayoutDashboard,
  Award,
  FileSpreadsheet,
  Inbox,
  AlarmClock,
  Zap,
  Users,
  Network,
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
        label: "Tổng quan Dashboard 360° & BI Toàn quốc",
        icon: LayoutDashboard,
        keywords: "dashboard bi 360 tong quan dieu hanh toan quoc live",
      },
      {
        href: "/admin/assessments/tt17",
        label: "Dashboard Đánh giá Công nghệ TT17",
        icon: Award,
        keywords: "dashboard danh gia cong nghe tt17 tien giang ninh thuan 26 tieu chi doanh nghiep",
      },
      {
        href: "/admin/assessments/records",
        label: "Danh sách Phiếu Thu thập & Đánh giá DN",
                icon: FileSpreadsheet,
        keywords: "danh sach ban ghi phieu thu thap tt17 danh gia nhu cau xuat word in",
      },
    ],
  },
  {
    key: "group2",
    title: "2. Phê Duyệt Toàn Quốc",
    items: [
      {
        href: "/admin/approvals",
        label: "Tất cả Hàng đợi Phê duyệt",
        icon: Inbox,
        keywords: "hang doi phe duyet ho so 34 tinh",
      },
      {
        href: "/admin/approvals",
        tabValue: "sla",
        label: "Cảnh báo Quá hạn SLA Sở Tỉnh",
        icon: AlarmClock,
        keywords: "canh bao qua han sla 72h so tinh tre hen",
      },
      {
        href: "/admin/approvals",
        tabValue: "override",
        label: "Phê duyệt Vượt cấp / Can thiệp",
        icon: Zap,
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
        keywords: "rbac 10 vai tro quyen han user phan quyen nguoi dung",
      },
      {
        href: "/admin/org-tree",
        label: "Cây Thư mục 34 Tỉnh/Thành",
        icon: Network,
        keywords: "cay thu muc 34 tinh thanh co cau to chuc don vi",
      },
      {
        href: "/admin/sectors",
        label: "Danh mục 10 Lĩnh Vực TT17 & TRL",
        icon: Database,
        keywords: "10 linh vuc tt17 trl tieu chi danh muc linh vuc",
      },
      {
        href: "/admin/elearning",
        label: "Quản trị Đào tạo & Học liệu số",
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
        href: "/admin/audit-logs",
        label: "Nhật ký Kiểm toán Toàn quốc (Audit Logs)",
        icon: History,
        keywords: "nhat ky kiem toan audit logs vet truy cap he thong an toan cap 3",
      },
      {
        href: "/admin/system-config",
        label: "Cấu hình Tham số & SLA Hệ thống",
        icon: Sliders,
        keywords: "cau hinh tham so sla he thong thiet lap nd 85",
      },
      {
        href: "/admin/blockchain",
        label: "Trung tâm Blockchain & ZKP",
        icon: ShieldCheck,
        keywords: "blockchain zkp ndachain so cai mat ma merkle zero knowledge proof an toan chuoi khoi bo cong an",
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
    <aside className="w-full shrink-0 border-r border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 lg:w-80 flex flex-col justify-between h-auto lg:h-[calc(100vh-68px)] lg:sticky lg:top-[68px] lg:self-start z-30 shadow-xs">
      {/* KHỐI TRÊN: HEADER + TÌM KIẾM + NAV */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Header Tầng 0 */}
        <div className="p-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-200 text-caption font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Tầng 0: Quản Trị Tối Cao</span>
            </div>
            <button
              type="button"
              onClick={toggleAllGroups}
              title="Thu gọn / Mở rộng tất cả"
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 p-1.5 rounded-lg transition"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mt-2 text-card-title">
            Trung Tâm Quản Trị Hệ Thống
          </h3>
          <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
            Phân hệ quản trị 34 tỉnh/thành trọng điểm
          </p>

          {/* Quick Menu Filter */}
          <div className="relative mt-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh tác vụ (RBAC, SLA, Tỉnh...)"
              className="form-control w-full pl-8 pr-7 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
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
        <nav className="p-3 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
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
                <div key={group.key} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-caption font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 hover:bg-slate-100/70 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800/50 transition group text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="shrink-0 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-transform duration-200">
                        {open ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className="truncate">{group.title}</span>
                    </div>
                  </button>

                  {open && (
                    <div className="space-y-1">
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
                            className={`focus-ring flex min-h-11 items-center gap-2.5 px-3 py-2 rounded-control text-label font-semibold transition ${
                              active
                                ? "bg-brand-700 text-white shadow-sm shadow-brand-700/20"
                                : "text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-700 dark:hover:text-white"
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                active
                                  ? "text-white"
                                  : "text-slate-400 group-hover:text-brand-600 dark:text-slate-400 dark:group-hover:text-brand-400"
                              }`}
                            />
                            <span className="truncate leading-normal flex-1">{item.label}</span>
                            
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
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 shrink-0 space-y-2">
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 text-slate-700 dark:text-slate-300 space-y-1 shadow-2xs">
          <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between text-caption">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>An Toàn TT: Cấp 3</span>
            </span>
            <span className="text-caption bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
              NĐ 85/2016
            </span>
          </div>
          <p className="text-caption leading-relaxed text-slate-500 dark:text-slate-400">
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
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950 lg:flex-row">
        <AdminSidebarNav />

        {/* Admin Main Workspace */}
        <div className="min-w-0 flex-1 p-4 sm:p-8 overflow-y-auto">{children}</div>
      </div>
    </RoleGuard>
  );
}
