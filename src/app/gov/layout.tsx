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
    <aside className="w-full shrink-0 border-r border-brand-800 bg-brand-700 text-white lg:w-80 flex flex-col justify-between h-full">
      {/* KHỐI TRÊN: HEADER + STATUS + TÌM KIẾM + NAV */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Header Tầng 1: Quản Trị Nhà Nước */}
        <div className="p-4 pb-3 border-b border-white/15 bg-brand-800/30">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Tầng 1: Quản Trị Nhà Nước</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleAllGroups}
                title="Thu gọn / Mở rộng tất cả"
                className="text-white/60 hover:text-white p-1 rounded-md hover:bg-white/10 transition"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
              </button>
              {onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="lg:hidden p-1 rounded-md hover:bg-white/10 text-white"
                  title="Đóng menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <h3 className="text-sm font-black text-white mt-2.5 flex items-center justify-between gap-2 tracking-tight">
            <span className="truncate">{orgTitle}</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md border border-white/30 font-bold shrink-0">
              {scopeCode}
            </span>
          </h3>
          <p className="text-xs text-white/75 mt-0.5 leading-snug">
            Cổng Công Vụ & Thẩm Định Địa Bàn
          </p>

          {/* Quick Menu Filter Input */}
          <div className="relative mt-3">
            <Search className="w-3.5 h-3.5 text-white/50 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh tác vụ (Hồ sơ, TT17, SLA...)"
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
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider text-white/85 hover:text-white hover:bg-white/10 transition group text-left"
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
                  </button>

                  {open && (
                    <div className="space-y-1 pl-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isLinkActive(item.href);

                        return (
                          <Link
                            key={`${item.href}_${item.label}`}
                            href={item.href}
                            onClick={() => {
                              if (onCloseMobile) onCloseMobile();
                            }}
                            className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
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
      <div className="p-4 pt-3 border-t border-white/15 bg-brand-800/40 shrink-0 space-y-3">
        {/* User Card */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {user?.fullName?.charAt(0) || "S"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-white">
                {user?.fullName || "Cán bộ Sở KH&CN"}
              </p>
              <p className="text-xs text-white/70 truncate">
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
            className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Security & Standard Badge */}
        <div className="p-2.5 rounded-lg bg-brand-900/60 border border-white/15 text-white space-y-1">
          <div className="font-bold text-white flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>An Toàn TT: Cấp 3</span>
            </span>
            <span className="text-xs bg-white/15 px-1.5 py-0.5 rounded text-white border border-white/20 font-mono">
              NĐ 85/2016
            </span>
          </div>
          <p className="text-xs leading-tight text-white/75">
            Cơ chế Maker-Checker 2 cấp · Lưu vết kiểm toán địa bàn
          </p>
        </div>

        {/* Cổng Khám Phá Link */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition duration-150"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
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
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-brand-700 text-white border-b border-brand-800">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              data-testid="gov-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white shrink-0"
              title="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-sm truncate">
                Sở KH&CN {PROVINCES_34.find((p) => p.code === (user?.scopeId || "HN").toUpperCase())?.name || user?.scopeId || "Hà Nội"}
              </span>
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded font-bold shrink-0">
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
