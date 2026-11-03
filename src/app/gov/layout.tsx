"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { authClient, UserContext } from "@/lib/auth-client";
import { PROVINCES_34 } from "@/lib/constants/provinces";
import {
  ShieldCheck,
  FileCheck2,
  Users,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  BadgeCheck,
  Search,
  LogOut,
  ExternalLink,
  Layers,
  BarChart3,
  ChevronsUpDown,
  LayoutDashboard,
} from "lucide-react";

interface GovMenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  keywords?: string;
}

interface GovMenuGroup {
  key: string;
  title: string;
  items: GovMenuItem[];
}

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  PROVINCIAL_ADMIN: "Lãnh đạo Sở (Admin)",
  PROVINCE_LEADER: "Lãnh đạo Sở (Checker)",
  PROVINCE_OFFICER: "Chuyên viên Thẩm tra (Maker)",
  SECTOR_ADMIN: "Quản trị Phân ngành",
  CLUSTER_ADMIN: "Quản trị Vùng / Cụm",
  SUPER_ADMIN: "Quản trị Tối cao Tầng 0",
  ADMIN: "Quản trị Hệ thống",
};

const GOV_MENU_GROUPS: GovMenuGroup[] = [
  {
    key: "group1",
    title: "1. Tổng Quan & Phê Duyệt",
    items: [
      {
        href: "/gov",
        label: "Tổng quan địa bàn",
        icon: LayoutDashboard,
        keywords: "tong quan dia ban dashboard chi so kpi can xu ly ngay",
      },
      {
        href: "/gov/approvals",
        label: "Hàng đợi kiểm duyệt",
        icon: FileCheck2,
        keywords: "hang doi kiem duyet phe duyet ho so san pham chuyen gia nhu cau phap nhan",
      },
      {
        href: "/gov/approvals/enterprises",
        label: "Thẩm định DN ĐMST",
        icon: BadgeCheck,
        keywords: "tham dinh doanh nghiep doi moi sang tao dmst cap huy hieu badge",
      },
    ],
  },
  {
    key: "group2",
    title: "2. Thẩm Định Công Nghệ TT17",
    items: [
      {
        href: "/gov/assessments/tt17",
        label: "Hội đồng Chấm điểm TT17",
        icon: BarChart3,
        keywords: "hoi dong cham diem thong tu 17 tt17 26 tieu chi danh gia trinh do",
      },
    ],
  },
  {
    key: "group3",
    title: "3. Giám Sát Cung–Cầu & Địa Bàn",
    items: [
      {
        href: "/gov/opportunities",
        label: "Tiến trình Đàm phán & SLA",
        icon: Layers,
        keywords: "tien trinh dam phan co hoi ket noi sla 48h giao dich",
      },
      {
        href: "/gov/demands",
        label: "Bài toán Nhu cầu DNNVV",
        icon: Search,
        keywords: "bai toan nhu cau dnnvv dia ban dia phuong dat hang cong nghe",
      },
    ],
  },
  {
    key: "group4",
    title: "4. Quản Trị Công Vụ & Nhân Sự",
    items: [
      {
        href: "/gov/settings/staff",
        label: "Phân công Cán bộ & Chuyên viên",
        icon: Users,
        keywords: "phan cong can bo chuyen vien nhan su so phong ban phan quyen",
      },
    ],
  },
];

function GovSidebarNav({
  user,
  onCloseMobile,
}: {
  user: UserContext | null;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  // 4 nhóm Accordion: mở mặc định
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    group1: true,
    group2: true,
    group3: true,
    group4: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllGroups = () => {
    const allOpen = Object.values(openGroups).every(Boolean);
    const nextState: Record<string, boolean> = {};
    GOV_MENU_GROUPS.forEach((g) => {
      nextState[g.key] = !allOpen;
    });
    setOpenGroups(nextState);
  };

  const isLinkActive = (href: string) => {
    if (href === "/gov") {
      return pathname === "/gov";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const scopeCode = (user?.scopeId || "HN").toUpperCase();
  const provinceObj = PROVINCES_34.find((p) => p.code === scopeCode);
  const provinceName = provinceObj?.name || (scopeCode === "ALL" ? "Toàn quốc" : scopeCode);
  const orgTitle = user?.organizationName || `Sở KH&CN ${provinceName}`;
  const userRoleDisplay = ROLE_DISPLAY_NAMES[user?.role || ""] || user?.role || "PROVINCIAL_ADMIN";

  // Lọc nhanh tác vụ menu
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return GOV_MENU_GROUPS;

    return GOV_MENU_GROUPS.map((group) => {
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
    <aside className="w-full shrink-0 border-r border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 lg:w-80 flex flex-col justify-between h-full shadow-xs">
      {/* KHỐI TRÊN: HEADER + STATUS + TÌM KIẾM + NAV */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Header Tầng 1: Quản Trị Nhà Nước */}
        <div className="p-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200 text-caption font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Tầng 1: Quản Trị Nhà Nước</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleAllGroups}
                title="Thu gọn / Mở rộng tất cả"
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 p-1.5 rounded-lg transition"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
              </button>
              {onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  title="Đóng menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white mt-2 text-card-title flex items-center justify-between gap-2">
            <span className="truncate">{orgTitle}</span>
            <span className="text-caption bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-bold shrink-0">
              {scopeCode}
            </span>
          </h3>
          <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
            Cổng Công Vụ & Thẩm Định Địa Bàn
          </p>

          {/* Quick Menu Filter Input */}
          <div className="relative mt-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh tác vụ (Hồ sơ, TT17, SLA...)"
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
                        const active = isLinkActive(item.href);

                        return (
                          <Link
                            key={`${item.href}_${item.label}`}
                            href={item.href}
                            title={item.label}
                            onClick={() => {
                              if (onCloseMobile) onCloseMobile();
                            }}
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
                            <span className="truncate leading-normal">{item.label}</span>
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

      {/* FOOTER CÁN BỘ SỞ & CHUẨN AN TOÀN */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 shrink-0 space-y-2.5">
        {/* User Card */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 dark:bg-brand-950/60 dark:border-brand-800 flex items-center justify-center font-bold text-xs text-brand-700 dark:text-brand-300 shrink-0">
              {user?.fullName?.charAt(0) || "S"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-slate-900 dark:text-white">
                {user?.fullName || "Cán bộ Sở KH&CN"}
              </p>
              <p className="text-caption text-slate-500 dark:text-slate-400 truncate">
                {userRoleDisplay}
              </p>
            </div>
          </div>
          <button
            type="button"
            title="Đăng xuất"
            onClick={() => {
              authClient.clearSession();
              router.push("/login");
            }}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-rose-400 transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Security & Standard Badge */}
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
            Cơ chế Maker-Checker 2 cấp · Lưu vết kiểm toán địa bàn
          </p>
        </div>

        {/* Cổng Khám Phá Link */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition duration-150"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
          <span>Về Cổng Khám Phá Quốc Gia</span>
        </Link>
      </div>
    </aside>
  );
}

export default function GovLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserContext | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(authClient.getUser());
  }, []);

  return (
    <RoleGuard
      allowedRoles={[
        "PROVINCIAL_ADMIN",
        "SECTOR_ADMIN",
        "CLUSTER_ADMIN",
        "PROVINCE_OFFICER",
        "PROVINCE_LEADER",
        "SUPER_ADMIN",
        "ADMIN",
      ]}
      portalName="Cổng Thẩm Định & Quản Trị Nhà Nước (Sở Tỉnh & Ban Ngành)"
    >
      <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
        {/* Mobile Header Bar (Screen < lg) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              data-testid="gov-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 shrink-0"
              title="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-sm truncate">
                Sở KH&CN {PROVINCES_34.find((p) => p.code === (user?.scopeId || "HN").toUpperCase())?.name || user?.scopeId || "Hà Nội"}
              </span>
              <span className="text-caption bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold shrink-0 border border-slate-200 dark:border-slate-700">
                {(user?.scopeId || "HN").toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar (Sticky cố định khi cuộn trang nội dung dài) */}
        <div className="hidden lg:block shrink-0 lg:sticky lg:top-[68px] lg:self-start lg:h-[calc(100vh-68px)] z-30">
          <GovSidebarNav user={user} />
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full shadow-2xl">
              <GovSidebarNav
                user={user}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </RoleGuard>
  );
}
