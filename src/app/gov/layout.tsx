"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { authClient, UserContext } from "@/lib/auth-client";
import {
  ShieldCheck,
  FileCheck2,
  MapPin,
  Layers,
  BarChart3,
  Clock,
  Building2,
  Users,
  Inbox,
  GraduationCap,
  ShoppingBag,
  Building,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  RotateCcw,
  BadgeCheck,
  Search,
  LogOut,
  ExternalLink,
} from "lucide-react";

const PROVINCE_MAP: Record<string, string> = {
  HN: "Hà Nội",
  SG: "TP. Hồ Chí Minh",
  HCM: "TP. Hồ Chí Minh",
  HP: "Hải Phòng",
  DN: "Đà Nẵng",
  CT: "Cần Thơ",
};

function GovSidebarNav({
  user,
  onCloseMobile,
}: {
  user: UserContext | null;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const currentTab =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("tab") || "ALL"
      : "ALL";

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

  const isLinkActive = (href: string, tabValue?: string) => {
    if (tabValue) {
      return (
        (pathname === "/gov" || pathname === "/gov/approvals") &&
        currentTab.toUpperCase() === tabValue.toUpperCase()
      );
    }
    if (href === "/gov" || href === "/gov/approvals") {
      return (
        (pathname === "/gov" || pathname === "/gov/approvals") &&
        (currentTab.toUpperCase() === "ALL" || !currentTab || currentTab === "all")
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const scopeCode = (user?.scopeId || "HN").toUpperCase();
  const provinceName = PROVINCE_MAP[scopeCode] || user?.scopeId || "Địa Phương";
  const orgTitle = user?.organizationName || `Sở KH&CN ${provinceName}`;

  return (
    <aside className="w-full shrink-0 border-r border-brand-800 bg-brand-700 p-4 text-white lg:w-72 flex flex-col justify-between overflow-y-auto max-h-screen sticky top-0">
      <div className="space-y-4">
        {/* Header Tầng 1: Quản Trị Nhà Nước */}
        <div className="pb-3 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-caption font-bold uppercase tracking-wider border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Tầng 1: Quản Trị Nhà Nước</span>
            </div>
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <h3 className="text-sm font-black text-white mt-2 flex items-center justify-between">
            <span className="truncate">{orgTitle}</span>
            <span className="text-caption bg-white/20 px-1.5 py-0.5 rounded border border-white/30 font-bold ml-1 shrink-0">
              {scopeCode}
            </span>
          </h3>
          <p className="text-caption text-white/80 mt-0.5">
            Cổng Công Vụ & Thẩm Định Địa Bàn
          </p>

          <div className="mt-2.5 flex items-center gap-2.5 text-caption text-white/90 font-medium">
            <div className="flex items-center gap-1 text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-400/30">
              <Clock className="w-3 h-3" />
              <span>SLA &le; 48h</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-200 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-400/30">
              <FileCheck2 className="w-3 h-3" />
              <span>Maker-Checker</span>
            </div>
          </div>
        </div>

        {/* 4 NHÓM ACCORDION */}
        <nav className="space-y-3">
          {/* NHÓM 1: KIỂM DUYỆT HỒ SƠ ĐỊA BÀN */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleGroup("group1")}
              className="w-full flex items-center justify-between px-2 text-caption font-extrabold uppercase tracking-wider text-white/80 hover:text-white transition"
            >
              <div className="flex items-center gap-1">
                {openGroups.group1 ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>1. Kiểm Duyệt Hồ Sơ Địa Bàn</span>
              </div>
              <span className="text-caption bg-white/10 px-1.5 py-0.5 rounded text-white/90 border border-white/20 font-bold">
                SLA 48h
              </span>
            </button>

            {openGroups.group1 && (
              <div className="space-y-0.5">
                <Link
                  href="/gov?tab=ALL"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/gov", "ALL")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox
                      className={`w-4 h-4 ${
                        isLinkActive("/gov", "ALL")
                          ? "text-brand-700"
                          : "text-white"
                      }`}
                    />
                    <span>Tất cả hồ sơ chờ duyệt</span>
                  </div>
                  <span
                    className={`text-caption px-1.5 py-0.5 rounded-full font-bold ${
                      isLinkActive("/gov", "ALL")
                        ? "bg-brand-100 text-brand-800"
                        : "bg-white/15 text-white border border-white/20"
                    }`}
                  >
                    Hàng đợi
                  </span>
                </Link>

                <Link
                  href="/gov?tab=EXPERT"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/gov", "EXPERT")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap
                      className={`w-4 h-4 ${
                        isLinkActive("/gov", "EXPERT")
                          ? "text-brand-700"
                          : "text-white"
                      }`}
                    />
                    <span>Chuyên gia KH&CN</span>
                  </div>
                  <span className="text-caption text-white/70">EXP</span>
                </Link>

                <Link
                  href="/gov?tab=SHOP"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/gov", "SHOP")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2
                      className={`w-4 h-4 ${
                        isLinkActive("/gov", "SHOP")
                          ? "text-brand-700"
                          : "text-white"
                      }`}
                    />
                    <span>Shop Chào Bán / Sáng chế</span>
                  </div>
                  <span className="text-caption text-white/70">TRL</span>
                </Link>

                <Link
                  href="/gov?tab=DEMAND"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/gov", "DEMAND")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag
                      className={`w-4 h-4 ${
                        isLinkActive("/gov", "DEMAND")
                          ? "text-brand-700"
                          : "text-white"
                      }`}
                    />
                    <span>Nhu cầu Công nghệ</span>
                  </div>
                  <span className="text-caption text-white/70">Buyer</span>
                </Link>

                <Link
                  href="/gov?tab=ACCOUNT"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/gov", "ACCOUNT")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building
                      className={`w-4 h-4 ${
                        isLinkActive("/gov", "ACCOUNT")
                          ? "text-brand-700"
                          : "text-white"
                      }`}
                    />
                    <span>Tài khoản Pháp nhân</span>
                  </div>
                  <span className="text-caption text-white/70">DN</span>
                </Link>

                <Link
                  href="/gov/approvals/enterprises"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/gov/approvals/enterprises")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BadgeCheck
                      className={`w-4 h-4 ${
                        isLinkActive("/gov/approvals/enterprises")
                          ? "text-brand-700"
                          : "text-white"
                      }`}
                    />
                    <span>Thẩm định DN ĐMST</span>
                  </div>
                  <span className="text-caption bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-1 py-0.2 rounded font-bold">
                    Badge
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* NHÓM 2: THẨM ĐỊNH CÔNG NGHỆ TT17 */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => toggleGroup("group2")}
              className="w-full flex items-center justify-between px-2 text-caption font-extrabold uppercase tracking-wider text-amber-200 hover:text-white transition"
            >
              <div className="flex items-center gap-1">
                {openGroups.group2 ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>2. Thẩm Định Công Nghệ TT17</span>
              </div>
              <span className="text-caption bg-white/20 text-white px-1.5 py-0.5 rounded border border-white/30 font-bold">
                TT17
              </span>
            </button>

            {openGroups.group2 && (
              <div className="space-y-0.5">
                <Link
                  href="/gov/assessments/tt17"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/gov/assessments/tt17")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3
                      className={`w-4 h-4 ${
                        isLinkActive("/gov/assessments/tt17")
                          ? "text-brand-700"
                          : "text-white"
                      }`}
                    />
                    <span>Hội đồng Chấm điểm TT17</span>
                  </div>
                  <span className="text-caption bg-amber-500/30 text-amber-200 border border-amber-400/30 px-1 py-0.2 rounded font-bold">
                    26 Tiêu chí
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* NHÓM 3: GIÁM SÁT CUNG - CẦU & ĐỊA BÀN */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => toggleGroup("group3")}
              className="w-full flex items-center justify-between px-2 text-caption font-extrabold uppercase tracking-wider text-cyan-200 hover:text-white transition"
            >
              <div className="flex items-center gap-1">
                {openGroups.group3 ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>3. Giám Sát Cung–Cầu & Địa Bàn</span>
              </div>
              <span className="text-caption bg-white/20 text-white px-1.5 py-0.5 rounded border border-white/30 font-bold">
                Giám sát
              </span>
            </button>

            {openGroups.group3 && (
              <div className="space-y-0.5">
                <Link
                  href="/gov/opportunities"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/gov/opportunities")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers
                      className={`w-4 h-4 ${
                        isLinkActive("/gov/opportunities")
                          ? "text-brand-700"
                          : "text-white"
                      }`}
                    />
                    <span>Tiến trình Đàm phán & SLA</span>
                  </div>
                  <span className="text-caption text-white/70">48h</span>
                </Link>

                <Link
                  href="/gov/demands"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/gov/demands")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Search
                      className={`w-4 h-4 ${
                        isLinkActive("/gov/demands")
                          ? "text-brand-700"
                          : "text-white"
                      }`}
                    />
                    <span>Bài toán Nhu cầu DNNVV</span>
                  </div>
                  <span className="text-caption bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 px-1 py-0.2 rounded font-bold">
                    Địa bàn
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* NHÓM 4: QUẢN TRỊ CÔNG VỤ & NHÂN SỰ SỞ */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => toggleGroup("group4")}
              className="w-full flex items-center justify-between px-2 text-caption font-extrabold uppercase tracking-wider text-emerald-200 hover:text-white transition"
            >
              <div className="flex items-center gap-1">
                {openGroups.group4 ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>4. Quản Trị Công Vụ & Nhân Sự</span>
              </div>
              <span className="text-caption bg-white/20 text-white px-1.5 py-0.5 rounded border border-white/30 font-bold">
                Nội bộ
              </span>
            </button>

            {openGroups.group4 && (
              <div className="space-y-0.5">
                <Link
                  href="/gov/settings/staff"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isLinkActive("/gov/settings/staff")
                      ? "bg-white text-brand-700 shadow-sm font-bold"
                      : "text-white hover:bg-brand-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users
                      className={`w-4 h-4 ${
                        isLinkActive("/gov/settings/staff")
                          ? "text-brand-700"
                          : "text-white"
                      }`}
                    />
                    <span>Phân công Cán bộ & Chuyên viên</span>
                  </div>
                  <span className="text-caption text-white/70">Sở</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Footer Cán Bộ Sở */}
      <div className="pt-4 border-t border-white/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs border border-white/20">
              {user?.fullName?.charAt(0) || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">
                {user?.fullName || "Cán bộ Sở KH&CN"}
              </p>
              <p className="text-caption text-white/70 truncate">
                {user?.role || "PROVINCIAL_ADMIN"}
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
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-caption font-semibold border border-white/20 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="gov-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                Sở KH&CN {PROVINCE_MAP[user?.scopeId || "HN"] || user?.scopeId || "Hà Nội"}
              </span>
              <span className="text-caption bg-white/20 px-1.5 py-0.5 rounded font-bold">
                {user?.scopeId || "HN"}
              </span>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded font-medium border border-emerald-400/30">
            SLA &le; 48h
          </span>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <GovSidebarNav user={user} />
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full">
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
