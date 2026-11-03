"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient, getRoleDisplayName, getWorkspacePath, UserContext } from "@/lib/auth-client";
import { useI18n, I18nToggle } from "./i18n-provider";
import { useTheme } from "./theme-provider";
import { ConfirmModal } from "./confirm-modal";
import { useToast } from "./toast";
import { FontsizeControl } from "./fontsize-control";
import {
  LogOut,
  LogIn,
  Menu,
  X,
  ChevronDown,
  UserRound,
  LayoutDashboard,
  Settings,
  Briefcase,
  Moon,
  Sun,
  ClipboardCheck,
  Home,
  Sparkles,
  Rocket,
  Target,
  Building2,
  GraduationCap,
  Award,
  BookOpen,
  Compass,
  ChevronRight,
  UserPlus,
  Users,
  Scale,
  FileText,
  PlusCircle,
  Cpu,
  Flame,
  ClipboardList,
  Radar,
  ShieldCheck,
  Ticket,
  Layers,
} from "lucide-react";

interface SubNavItem {
  href: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  alignRight?: boolean;
  children?: SubNavItem[];
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  const [user, setUser] = useState<UserContext | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [expandedMobileLinks, setExpandedMobileLinks] = useState<Record<string, boolean>>({
    "/gioi-thieu": false,
    "/trien-lam": false,
    "/chao-ban-cong-nghe": false,
    "/nhu-cau-cong-nghe": true,
    "/doanh-nghiep-dmst": false,
    "/chuyen-gia": true,
    "/dich-vu-khac": false,
    "/huong-dan": false,
  });
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const handleDropdownEnter = (href: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setOpenDropdown(href);
  };

  const handleDropdownLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  const handleDropdownToggle = (href: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setOpenDropdown((prev) => (prev === href ? null : href));
  };

  const toggleMobileSubmenu = (href: string) => {
    setExpandedMobileLinks((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  useEffect(() => {
    setUser(authClient.getUser());
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // Prevent background scroll when mobile navigation drawer is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const closeAccountMenu = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };

    document.addEventListener("mousedown", closeAccountMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeAccountMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const handleConfirmLogout = () => {
    authClient.clearSession();
    setUser(null);
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    setLogoutModalOpen(false);
    toast.info("Đã đăng xuất khỏi hệ thống an toàn.", "Thông báo");
    router.push("/");
  };

  // TASK-01 Basic Design: public navigation is the product's seven core modules,
  // not internal workspaces such as Admin, Government, or Market portals.
  const navLinks: NavItem[] = [
    { href: "/", label: t("home"), icon: Home },
    {
      href: "/gioi-thieu",
      label: t("about"),
      icon: BookOpen,
      children: [
        {
          href: "/gioi-thieu",
          label: "Về Viện NacenTech & NacenTwin",
          description: "Tầm nhìn, sứ mệnh & mạng lưới chuyển giao công nghệ Quốc gia",
          icon: BookOpen,
        },
        {
          href: "/huong-dan",
          label: "Cẩm nang Hướng dẫn Sử dụng",
          description: "Tài liệu thao tác chuẩn hóa cho Doanh nghiệp, Viện trường & Chuyên gia",
          icon: Compass,
        },
        {
          href: "/matrix",
          label: "Khung Pháp lý & Chuẩn mực",
          description: "Nghị định 13/2023, Thông tư 17/2019 và Thang đo TRL 1-9",
          icon: Layers,
        },
      ],
    },
    {
      href: "/trien-lam",
      label: "Sự kiện Techmart",
      icon: Sparkles,
      badge: "Mới",
      children: [
        {
          href: "/trien-lam",
          label: "Không gian Triển lãm Ảo",
          description: "Khám phá các gian hàng công nghệ trực tuyến & Techmart Quốc gia",
          icon: Sparkles,
          badge: "Mới",
        },
        {
          href: "/trien-lam/dang-ky-tham-quan",
          label: "Đăng ký Tham quan & Kết nối",
          description: "Nhận thẻ ra vào triển lãm, đặt lịch hẹn giao thương B2B trực tiếp",
          icon: Ticket,
        },
      ],
    },
    {
      href: "/chao-ban-cong-nghe",
      label: t("technology_offers"),
      icon: Rocket,
      children: [
        {
          href: "/chao-ban-cong-nghe",
          label: "Sàn Chào bán Công nghệ",
          description: "Danh mục sáng chế, giải pháp kỹ thuật sẵn sàng chuyển giao",
          icon: Rocket,
        },
        {
          href: "/portal/seller/technologies/create",
          label: "Đăng Chào bán Công nghệ mới",
          description: "Gửi hồ sơ công nghệ, giải pháp để tiếp cận doanh nghiệp & nhà đầu tư",
          icon: PlusCircle,
        },
        {
          href: "/khao-sat-cong-nghe",
          label: "Khảo sát Năng lực Cung",
          description: "Tự đánh giá mức độ sẵn sàng công nghệ theo thang đo chuẩn TRL 1-9",
          icon: Cpu,
        },
      ],
    },
    {
      href: "/nhu-cau-cong-nghe",
      label: t("technology_demands"),
      icon: Target,
      children: [
        {
          href: "/nhu-cau-cong-nghe",
          label: "Bảng Nhu cầu Đổi mới",
          description: "Tra cứu bài toán kỹ thuật, đơn đặt hàng từ các doanh nghiệp",
          icon: Target,
        },
        {
          href: "/khao-sat-nhu-cau",
          label: "Khảo sát Nhu cầu Công nghệ (TNI)",
          description: "Form 4 bước tính chỉ số TNI & bắt mạch nhu cầu cấp thiết",
          icon: Flame,
          badge: "TNI",
        },
        {
          href: "/khao-sat-doanh-nghiep",
          label: "Đăng nhanh Nhu cầu Kỹ thuật",
          description: "Phiếu đặt hàng bài toán kỹ thuật trực tiếp tới Viện trường & Chuyên gia",
          icon: ClipboardList,
        },
      ],
    },
    {
      href: "/doanh-nghiep-dmst",
      label: t("innovative_enterprises"),
      icon: Building2,
      children: [
        {
          href: "/doanh-nghiep-dmst",
          label: "Danh bạ Doanh nghiệp ĐMST",
          description: "Bảng xếp hạng, danh bạ doanh nghiệp KH&CN và hồ sơ năng lực",
          icon: Building2,
        },
        {
          href: "/khao-sat-dmst",
          label: "Khảo sát Năng lực ĐMST (43 tiêu chuẩn)",
          description: "Chấm điểm 8 nhóm năng lực, xuất Radar Chart & cấp huy hiệu",
          icon: Sparkles,
        },
        {
          href: "/assessments/tt17/wizard",
          label: "Đánh giá Năng lực TT 17/2019",
          description: "Tự đánh giá 26 tiêu chí định lượng 5 nhóm THIOC theo Thông tư 17",
          icon: Award,
        },
      ],
    },
    {
      href: "/chuyen-gia",
      label: t("experts"),
      icon: GraduationCap,
      children: [
        {
          href: "/chuyen-gia",
          label: "Mạng lưới Chuyên gia",
          description: "Tra cứu danh bạ nhà khoa học, chuyên gia & cố vấn ĐMST",
          icon: Users,
        },
        {
          href: "/elearning",
          label: "E-Learning & Đào tạo",
          description: "Cổng học liệu số, video bài giảng trực tuyến & kiểm tra trắc nghiệm",
          icon: BookOpen,
          badge: "LMS",
        },
        {
          href: "/profile/upgrade",
          label: "Đăng ký Chuyên gia",
          description: "Nộp hồ sơ gia nhập mạng lưới chuyên gia được thẩm định",
          icon: GraduationCap,
        },
      ],
    },
    {
      href: "/dich-vu-khac",
      label: t("services"),
      icon: Award,
      alignRight: true,
      children: [
        {
          href: "/dich-vu-khac",
          label: "Tư vấn & Sở hữu Trí tuệ",
          description: "Định giá công nghệ, bảo hộ sáng chế & dịch vụ pháp lý SHTT",
          icon: Scale,
        },
        {
          href: "/portal/matching/radar",
          label: "Radar Ghép nối Cung - Cầu",
          description: "Bản đồ radar thuật toán AI tự động tìm đối tác công nghệ tương thích",
          icon: Radar,
        },
        {
          href: "/assessments/buyer",
          label: "Thẩm định Hồ sơ Công nghệ",
          description: "Thẩm định độc lập hỗ trợ thương mại hóa, mua bán & sáp nhập",
          icon: ShieldCheck,
        },
      ],
    },
    {
      href: "/huong-dan",
      label: t("user_guide") || "Hướng dẫn",
      icon: Compass,
      alignRight: true,
      children: [
        {
          href: "/huong-dan",
          label: "Trung tâm Hướng dẫn Toàn trình",
          description: "Cẩm nang thao tác chuẩn hóa cho Doanh nghiệp, Chuyên gia & Cán bộ",
          icon: Compass,
        },
        {
          href: "/wireframes",
          label: "Sơ đồ Kiến trúc Chức năng",
          description: "Sơ đồ wireframe và phân rã các luồng giao diện hệ thống",
          icon: Layers,
        },
      ],
    },
  ];

  const isActiveLink = (link: NavItem) => {
    if (link.href === "/") return pathname === link.href;
    if (pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`))) return true;
    if (link.children) {
      return link.children.some(
        (child) => pathname === child.href || (child.href !== "/" && pathname.startsWith(`${child.href}/`))
      );
    }
    return false;
  };

  const isDedicatedSurvey =
    pathname?.startsWith("/khao-sat-doanh-nghiep") ||
    pathname?.startsWith("/khao-sat-cong-nghe");

  if (isDedicatedSurvey) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-border-default/90 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[64px] items-center justify-between py-2.5">
            {/* Brand Logo only for dedicated survey */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0" title="Trang chủ NacenTwin">
              <img
                src="/NACENTECH_Main-Logo-G.png"
                alt="NacenTech Emblem"
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col text-left">
                <span className="text-base font-extrabold tracking-tight text-text-primary dark:text-white leading-none">
                  NacenTwin
                </span>
                <span className="mt-0.5 text-xs font-semibold leading-tight text-nacen-green-700 dark:text-nacen-green-200">
                  Viện Đổi Mới Sáng Tạo Quốc Gia · Bộ Khoa Học & Công Nghệ
                </span>
              </div>
            </Link>

            {/* Survey Header Tools */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border-default/90 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/95">
        <div className="page-container">
          <div className="flex min-h-[68px] items-center gap-2 xl:gap-3 2xl:gap-5 py-3">
            {/* Brand Logo with Official NacenTech Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <img
                src="/NACENTECH_Main-Logo-G.png"
                alt="NacenTech Emblem"
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col text-left">
                <span className="text-base font-extrabold tracking-tight text-text-primary dark:text-white leading-none">
                  NacenTwin
                </span>
                <span className="mt-0.5 hidden text-xs font-semibold leading-tight text-nacen-green-700 dark:text-nacen-green-200 2xl:inline">
                  Viện Đổi Mới Sáng Tạo Quốc Gia
                </span>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden flex-1 items-center justify-center gap-0.5 2xl:gap-1 lg:flex" aria-label="Điều hướng chính">
              {navLinks.map((link) => {
                const isActive = isActiveLink(link);
                const hasChildren = Boolean(link.children && link.children.length > 0);

                if (!hasChildren) {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`focus-ring rounded-control px-2 py-1.5 2xl:px-2.5 2xl:py-2 text-xs 2xl:text-sm font-semibold whitespace-nowrap transition ${
                        isActive
                          ? "bg-brand-50 text-brand-800 font-bold dark:bg-brand-950/70 dark:text-brand-200"
                          : "text-slate-700 hover:bg-brand-50 hover:text-brand-800 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                }

                const isOpen = openDropdown === link.href;

                return (
                  <div
                    key={link.href}
                    className={`nav-has-dropdown relative ${isOpen ? "is-open" : ""}`}
                    onMouseEnter={() => handleDropdownEnter(link.href)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <Link
                      href={link.href}
                      onClick={() => handleDropdownToggle(link.href)}
                      className={`focus-ring inline-flex items-center gap-1 rounded-control px-2 py-1.5 2xl:px-2.5 2xl:py-2 text-xs 2xl:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                        isActive || isOpen
                          ? "bg-brand-50 text-brand-800 font-bold dark:bg-brand-950/70 dark:text-brand-200"
                          : "text-slate-700 hover:bg-brand-50 hover:text-brand-800 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                      }`}
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`size-3.5 opacity-60 transition-transform duration-200 ${
                          isOpen ? "rotate-180 opacity-100" : ""
                        }`}
                      />
                    </Link>

                    {/* Dropdown Menu on Hover & Click */}
                    <div
                      className={`nav-dropdown-menu absolute ${link.alignRight ? "right-0" : "left-0"} top-full pt-1.5 z-50`}
                      style={isOpen ? { display: "block", visibility: "visible", opacity: 1, pointerEvents: "auto", transform: "translateY(0)" } : undefined}
                    >
                      <div className="w-80 rounded-2xl border border-border-default bg-white p-2 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900 ring-1 ring-black/5">
                        <div className="space-y-1">
                          {link.children?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive =
                              pathname === subItem.href ||
                              (subItem.href !== "/" && pathname.startsWith(`${subItem.href}/`));
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setOpenDropdown(null)}
                                className={`flex items-start gap-3 rounded-xl p-2.5 transition ${
                                  isSubActive
                                    ? "bg-brand-50 text-brand-900 font-bold dark:bg-brand-950/80 dark:text-brand-100"
                                    : "text-slate-700 hover:bg-brand-50/80 hover:text-brand-800 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white"
                                }`}
                              >
                                <div
                                  className={`grid size-9 shrink-0 place-items-center rounded-xl transition ${
                                    isSubActive
                                      ? "bg-brand-600 text-white shadow-xs"
                                      : "bg-slate-100 text-slate-500 hover:bg-brand-100 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  <SubIcon className="size-4.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold leading-tight">{subItem.label}</span>
                                    {subItem.badge && (
                                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        {subItem.badge}
                                      </span>
                                    )}
                                  </div>
                                  {subItem.description && (
                                    <p className="mt-0.5 text-[11px] leading-snug font-normal text-slate-500 dark:text-slate-400 line-clamp-2">
                                      {subItem.description}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Right Side Tools & User Session */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Language Switcher */}
              <I18nToggle />

              <div className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

              {/* User Session */}
              {user ? (
                <div className="hidden items-center gap-2 sm:flex">
                  <div ref={accountMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setAccountMenuOpen((open) => !open)}
                      className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-control px-2 py-1.5 text-left transition hover:bg-brand-50 dark:hover:bg-slate-800"
                      aria-label="Mở menu tài khoản"
                      aria-expanded={accountMenuOpen}
                      aria-haspopup="menu"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-200">
                        <UserRound className="size-4" aria-hidden="true" />
                      </span>
                      <span className="hidden min-w-0 xl:block">
                        <span className="block max-w-[90px] 2xl:max-w-[130px] truncate text-xs font-bold text-text-primary dark:text-white">{user.fullName || user.email}</span>
                        <span className="block text-caption font-semibold text-brand-700 dark:text-brand-200">{getRoleDisplayName(user.role)}</span>
                      </span>
                      <ChevronDown className={`size-4 text-slate-500 transition-transform dark:text-slate-400 ${accountMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>

                    {accountMenuOpen && (
                      <div role="menu" aria-label="Menu tài khoản" className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-surface border border-border-default bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                          <p className="truncate text-label font-bold text-text-primary dark:text-white">{user.fullName || user.email}</p>
                          <p className="truncate text-caption text-text-secondary dark:text-slate-400">{getRoleDisplayName(user.role)}</p>
                        </div>
                        <Link href="/dashboard" role="menuitem" onClick={() => setAccountMenuOpen(false)} className="focus-ring flex min-h-11 items-center gap-2 px-3 text-label font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-brand-200">
                          <LayoutDashboard className="size-4" aria-hidden="true" />
                          Dashboard & CR
                        </Link>
                        <Link href={getWorkspacePath(user.role)} role="menuitem" onClick={() => setAccountMenuOpen(false)} className="focus-ring flex min-h-11 items-center gap-2 px-3 text-label font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-brand-200">
                          <Briefcase className="size-4" aria-hidden="true" />
                          Không gian làm việc
                        </Link>
                        <Link href="/settings" role="menuitem" onClick={() => setAccountMenuOpen(false)} className="focus-ring flex min-h-11 items-center gap-2 px-3 text-label font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-brand-200">
                          <Settings className="size-4" aria-hidden="true" />
                          Cài đặt tài khoản
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => toggleTheme()}
                          className="focus-ring flex min-h-11 w-full items-center justify-between px-3 text-left text-label font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-brand-200"
                        >
                          <span className="flex items-center gap-2">
                            {theme === "light" ? <Moon className="size-4 text-slate-600 dark:text-slate-300" aria-hidden="true" /> : <Sun className="size-4 text-amber-400" aria-hidden="true" />}
                            <span>Giao diện: {theme === "light" ? "Sáng" : "Tối"}</span>
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {theme === "light" ? "Bật tối" : "Bật sáng"}
                          </span>
                        </button>
                        <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                        <button type="button" role="menuitem" onClick={() => { setAccountMenuOpen(false); setLogoutModalOpen(true); }} className="focus-ring flex min-h-11 w-full items-center gap-2 px-3 text-left text-label font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300">
                          <LogOut className="size-4" aria-hidden="true" />
                          {t("logout")}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DEFECT-04: Nút Đăng xuất nhanh trực tiếp trên Header */}
                  <button
                    type="button"
                    onClick={() => setLogoutModalOpen(true)}
                    className="focus-ring inline-flex size-9 items-center justify-center rounded-control text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                    title="Đăng xuất nhanh"
                    aria-label="Đăng xuất nhanh"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                  </button>

                  {user.role?.toUpperCase() === "PUBLIC_USER" && (
                    <Link
                      href="/settings"
                      className="hidden 2xl:inline-flex items-center rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100 dark:bg-brand-950/70 dark:text-brand-200 dark:hover:bg-brand-800"
                    >
                      {t("expert_upgrade")}
                    </Link>
                  )}

                </div>
              ) : (
                <div className="hidden items-center sm:flex">
                  <Link
                    href="/login"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-control bg-nacen-green-500 hover:bg-nacen-green-600 px-3.5 2xl:px-4 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-semibold text-white shadow-xs transition whitespace-nowrap"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t("login")}</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="focus-ring min-h-11 min-w-11 inline-flex items-center justify-center rounded-control p-2 text-text-secondary hover:bg-brand-50 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer & Backdrop */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 top-[65px] sm:top-[69px] z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide Down Sheet */}
            <div
              id="mobile-navigation"
              className="fixed inset-x-0 top-[65px] sm:top-[69px] z-50 max-h-[calc(100dvh-65px)] sm:max-h-[calc(100dvh-69px)] overflow-y-auto border-b border-border-default bg-white/98 shadow-2xl backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-950/98 lg:hidden"
            >
              <div className="p-4 space-y-4">
                {/* 1. User Header or Guest CTA */}
                {user ? (
                  <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-3.5 dark:border-brand-900/40 dark:bg-brand-950/40">
                    <div className="flex items-center gap-3 pb-3 border-b border-brand-100/80 dark:border-brand-900/40">
                      <div className="grid size-11 place-items-center rounded-full bg-brand-700 text-white font-bold text-base shadow-xs">
                        {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-text-primary dark:text-white">
                          {user.fullName || user.email}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-brand-700 shadow-xs dark:bg-slate-900 dark:text-brand-300">
                            {getRoleDisplayName(user.role)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Profile Links Grid */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl bg-white p-2.5 font-semibold text-slate-700 transition hover:bg-brand-100 hover:text-brand-800 dark:bg-slate-900 dark:text-slate-200 shadow-xs"
                      >
                        <LayoutDashboard className="size-4 text-brand-600 dark:text-brand-400 shrink-0" />
                        <span className="truncate">Dashboard & CR</span>
                      </Link>
                      <Link
                        href={getWorkspacePath(user.role)}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl bg-white p-2.5 font-semibold text-slate-700 transition hover:bg-brand-100 hover:text-brand-800 dark:bg-slate-900 dark:text-slate-200 shadow-xs"
                      >
                        <Briefcase className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">Không gian việc</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl bg-white p-2.5 font-semibold text-slate-700 transition hover:bg-brand-100 hover:text-brand-800 dark:bg-slate-900 dark:text-slate-200 shadow-xs"
                      >
                        <Settings className="size-4 text-slate-600 dark:text-slate-400 shrink-0" />
                        <span className="truncate">Cài đặt tài khoản</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setLogoutModalOpen(true);
                        }}
                        className="flex items-center gap-2 rounded-xl bg-white p-2.5 font-semibold text-rose-600 transition hover:bg-rose-50 dark:bg-slate-900 dark:text-rose-400 shadow-xs text-left cursor-pointer"
                      >
                        <LogOut className="size-4 text-rose-500 shrink-0" />
                        <span className="truncate">{t("logout")}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border-default bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                    <p className="text-xs font-semibold text-text-secondary dark:text-slate-400">
                      Chào mừng bạn đến với Cổng Quốc Gia NacenTwin
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-nacen-green-500 hover:bg-nacen-green-600 py-2.5 text-xs font-bold text-white shadow-xs transition"
                      >
                        <LogIn className="size-4" />
                        <span>{t("login")}</span>
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <UserPlus className="size-4" />
                        <span>{t("register")}</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* 2. Highlighted National Survey Banner */}
                <Link
                  href="/khao-sat-dmst"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 p-3 text-blue-900 shadow-xs transition hover:shadow-md dark:border-blue-900/50 dark:from-blue-950/70 dark:via-sky-950/50 dark:to-indigo-950/70 dark:text-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-xs">
                      <ClipboardCheck className="size-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold">Khảo sát năng lực ĐMST</div>
                      <div className="text-[11px] text-blue-700/80 dark:text-blue-300 font-medium">
                        Đo lường 8 nhóm năng lực theo chuẩn Quốc gia
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    43 câu
                  </span>
                </Link>

                {/* 3. Main Navigation List */}
                <div className="space-y-1">
                  <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Danh mục hệ thống
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {navLinks.map((link) => {
                      const isActive = isActiveLink(link);
                      const Icon = link.icon;
                      const hasChildren = Boolean(link.children && link.children.length > 0);
                      const isExpanded = expandedMobileLinks[link.href];

                      if (!hasChildren) {
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                              isActive
                                ? "bg-brand-50 text-brand-800 font-bold dark:bg-brand-950/80 dark:text-brand-200 shadow-xs"
                                : "text-slate-700 hover:bg-slate-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-900"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`grid size-8 place-items-center rounded-lg transition ${
                                  isActive
                                    ? "bg-brand-200/80 text-brand-800 dark:bg-brand-900 dark:text-brand-200"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700"
                                }`}
                              >
                                <Icon className="size-4" />
                              </div>
                              <span className="text-sm">{link.label}</span>
                            </div>
                            {link.badge ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                {link.badge}
                              </span>
                            ) : (
                              <ChevronRight
                                className={`size-4 transition ${
                                  isActive
                                    ? "text-brand-600 dark:text-brand-300"
                                    : "text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 dark:text-slate-600"
                                }`}
                              />
                            )}
                          </Link>
                        );
                      }

                      return (
                        <div key={link.href} className="space-y-1">
                          <div
                            className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                              isActive
                                ? "bg-brand-50 text-brand-800 font-bold dark:bg-brand-950/80 dark:text-brand-200 shadow-xs"
                                : "text-slate-700 hover:bg-slate-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-900"
                            }`}
                          >
                            <Link
                              href={link.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 flex-1 min-w-0"
                            >
                              <div
                                className={`grid size-8 place-items-center rounded-lg transition ${
                                  isActive
                                    ? "bg-brand-200/80 text-brand-800 dark:bg-brand-900 dark:text-brand-200"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700"
                                }`}
                              >
                                <Icon className="size-4" />
                              </div>
                              <span className="text-sm truncate">{link.label}</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => toggleMobileSubmenu(link.href)}
                              className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                              aria-label={`Mở rộng danh mục ${link.label}`}
                            >
                              <ChevronDown
                                className={`size-4 transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </div>

                          {/* Sub items collapsible */}
                          {isExpanded && (
                            <div className="ml-6 pl-3 border-l-2 border-brand-200/70 dark:border-slate-800 space-y-1 my-1">
                              {link.children?.map((subItem) => {
                                const SubIcon = subItem.icon;
                                const isSubActive =
                                  pathname === subItem.href ||
                                  (subItem.href !== "/" && pathname.startsWith(`${subItem.href}/`));
                                return (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                                      isSubActive
                                        ? "bg-brand-50 text-brand-800 font-bold dark:bg-brand-950/80 dark:text-brand-200"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-900"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <SubIcon className="size-3.5 shrink-0 text-slate-400" />
                                      <span className="truncate">{subItem.label}</span>
                                    </div>
                                    {subItem.badge && (
                                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        {subItem.badge}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Drawer Utilities & Footer */}
                <div className="space-y-3 border-t border-border-default pt-3 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-secondary dark:text-slate-400">
                      Giao diện hiển thị:
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleTheme()}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {theme === "light" ? (
                        <>
                          <Moon className="size-3.5 text-slate-600" />
                          <span>Chế độ Tối</span>
                        </>
                      ) : (
                        <>
                          <Sun className="size-3.5 text-amber-400" />
                          <span>Chế độ Sáng</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-secondary dark:text-slate-400">
                      Cỡ chữ văn bản:
                    </span>
                    <FontsizeControl />
                  </div>
                  <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
                    Cổng dữ liệu số Quốc gia · NacenTech (Bộ KH&CN)
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc hiện tại?"
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        variant="warning"
      />
    </>
  );
}
