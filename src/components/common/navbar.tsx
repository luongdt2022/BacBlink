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
  Calculator,
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

function getRoleBadgeStyle(role?: string) {
  switch (role?.toUpperCase()) {
    case "SELLER":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-400/40";
    case "BUYER":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-400/40";
    case "INNOVATIVE_ENTERPRISE":
      return "bg-purple-500/20 text-purple-300 border-purple-400/40";
    case "EXPERT":
      return "bg-amber-500/20 text-amber-300 border-amber-400/40";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "bg-rose-500/20 text-rose-300 border-rose-400/40";
    default:
      return "bg-white/10 text-white/90 border-white/20";
  }
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
  });
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);

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
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
      if (desktopNavRef.current && !desktopNavRef.current.contains(target)) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
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

  const navLinks: NavItem[] = [
    { href: "/", label: t("home"), icon: Home },
    {
      href: "/gioi-thieu",
      label: t("about"),
      icon: Compass,
      children: [
        {
          href: "/gioi-thieu",
          label: "Về Viện NacenTech & NacenTwin",
          description: "Tầm nhìn, sứ mệnh & mạng lưới chuyển giao công nghệ Quốc gia",
          icon: BookOpen,
        },
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
        {
          href: "/matrix",
          label: "Khung Pháp lý & Chuẩn mực",
          description: "Nghị định 13/2023, Thông tư 17/2019 và Thang đo TRL 1-9",
          icon: ShieldCheck,
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
          label: "Khảo sát Năng lực ĐMST",
          description: "Chấm điểm 8 nhóm năng lực, xuất Radar Chart & cấp huy hiệu",
          icon: Sparkles,
        },
        {
          href: "/dieu-tra-trinh-do-nang-luc",
          label: "Đánh giá Năng lực TT 17",
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
          href: "/dieu-tra-trinh-do-nang-luc",
          label: "Đánh giá Trình độ DN (TT 17)",
          description: "Tự đánh giá 26 tiêu chí định lượng 5 nhóm THIOC theo Thông tư 17/2019/TT-BKHCN",
          icon: FileText,
          badge: "TT 17",
        },
        {
          href: "/dich-vu-khac",
          label: "Tư vấn & Bảo hộ SHTT",
          description: "Định giá công nghệ, bảo hộ sáng chế & dịch vụ pháp lý SHTT",
          icon: Scale,
        },
        {
          href: "/assessments/buyer",
          label: "Thẩm định & Định giá Công nghệ",
          description: "Xác định giá trị chuyển giao công nghệ, chuẩn hóa thang đo TRL 1-9",
          icon: Calculator,
        },
        {
          href: "/dich-vu-khac#doanh-nghiep-khcn",
          label: "Hồ sơ Doanh nghiệp KH&CN",
          description: "Tư vấn phương án sản xuất kinh doanh từ kết quả KH&CN và ưu đãi thuế",
          icon: Building2,
        },
        {
          href: "/portal/matching/radar",
          label: "Radar Ghép nối Cung - Cầu",
          description: "Bản đồ radar thuật toán AI tự động tìm đối tác công nghệ tương thích",
          icon: Radar,
          badge: "AI",
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
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#3C5999]/95 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/95 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 shrink-0" title="Trang chủ NacenTwin">
              <img
                src="/NACENTECH_Main-Logo-G.png"
                alt="NacenTech Emblem"
                className="h-10 w-auto object-contain bg-white/10 rounded-lg p-1 backdrop-blur-xs"
              />
              <div className="flex flex-col text-left">
                <span className="text-base font-extrabold tracking-tight text-white leading-none">
                  NacenTwin
                </span>
                <span className="mt-1 text-xs font-medium leading-tight text-white/80">
                  Viện Đổi Mới Sáng Tạo Quốc Gia · Bộ Khoa Học & Công Nghệ
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#3C5999]/95 backdrop-blur-md transition-all duration-200 shadow-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-2 xl:gap-4">
            {/* Brand Logo with Official NacenTech Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0" title="Trang chủ NacenTwin">
              <img
                src="/NACENTECH_Main-Logo-G.png"
                alt="NacenTech Emblem"
                className="h-10 w-auto object-contain bg-white/10 rounded-lg p-1 backdrop-blur-xs"
              />
              <div className="flex flex-col text-left">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-none">
                  NacenTwin
                </span>
                <span className="mt-1 hidden text-[11px] font-medium leading-none text-white/80 2xl:inline">
                  Viện Đổi Mới Sáng Tạo Quốc Gia
                </span>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav ref={desktopNavRef} className="hidden flex-1 items-center justify-center gap-0.5 xl:gap-1.5 lg:flex" aria-label="Điều hướng chính">
              {navLinks.map((link) => {
                const isActive = isActiveLink(link);
                const hasChildren = Boolean(link.children && link.children.length > 0);

                if (!hasChildren) {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`focus-ring relative inline-flex items-center rounded-lg px-2.5 py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition ${
                        isActive
                          ? "text-white font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-white/40 after:rounded-full"
                          : "text-white/85 hover:text-white hover:bg-white/10"
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
                      className={`focus-ring relative inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                        isActive || isOpen
                          ? "text-white font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-white/40 after:rounded-full"
                          : "text-white/85 hover:text-white hover:bg-white/10"
                      }`}
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`size-3.5 text-white/70 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-white" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </Link>

                    {/* Mega Dropdown Panel on Hover & Click */}
                    <div
                      className={`nav-dropdown-menu absolute ${link.alignRight ? "right-0" : "left-0"} top-full pt-2 z-50`}
                      style={isOpen ? { display: "block", visibility: "visible", opacity: 1, pointerEvents: "auto", transform: "translateY(0)" } : undefined}
                    >
                      <div className="w-84 sm:w-88 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900 ring-1 ring-black/5">
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
                                className={`group flex items-start gap-3 rounded-xl p-2.5 transition ${
                                  isSubActive
                                    ? "bg-blue-50 text-brand-900 font-bold dark:bg-slate-800 dark:text-cyan-300"
                                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80"
                                }`}
                              >
                                <div
                                  className={`grid size-9 shrink-0 place-items-center rounded-xl transition ${
                                    isSubActive
                                      ? "bg-brand-600 text-white shadow-xs"
                                      : "bg-blue-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white dark:bg-slate-800 dark:text-cyan-400 dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950"
                                  }`}
                                >
                                  <SubIcon className="size-4" aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold leading-tight group-hover:text-brand-700 dark:group-hover:text-cyan-300 transition-colors">
                                      {subItem.label}
                                    </span>
                                    {subItem.badge && (
                                      <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        {subItem.badge}
                                      </span>
                                    )}
                                  </div>
                                  {subItem.description && (
                                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug">
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
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Language Switcher */}
              <div className="text-white">
                <I18nToggle variant="navbar" />
              </div>

              {/* User Session */}
              {user ? (
                <div className="hidden items-center gap-2 sm:flex">
                  <div ref={accountMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setAccountMenuOpen((open) => !open)}
                      className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-2.5 py-1 text-left transition bg-white/10 hover:bg-white/15 border border-white/10"
                      aria-label="Mở menu tài khoản"
                      aria-expanded={accountMenuOpen}
                      aria-haspopup="menu"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cyan-400 text-slate-900 font-bold shadow-xs">
                        <UserRound className="size-4" aria-hidden="true" />
                      </span>
                      <span className="hidden min-w-0 xl:block">
                        <span className="block max-w-[90px] 2xl:max-w-[130px] truncate text-xs font-bold text-white">
                          {user.fullName || user.email}
                        </span>
                        <span className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </span>
                      <ChevronDown className={`size-3.5 text-white/70 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>

                    {accountMenuOpen && (
                      <div
                        role="menu"
                        aria-label="Menu tài khoản"
                        className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 ring-1 ring-black/5"
                      >
                        <div className="border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                            {user.fullName || user.email}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(user.role)}`}>
                              {getRoleDisplayName(user.role)}
                            </span>
                          </div>
                        </div>

                        <Link
                          href="/dashboard"
                          role="menuitem"
                          onClick={() => setAccountMenuOpen(false)}
                          className="focus-ring flex min-h-11 items-center gap-2.5 px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
                        >
                          <LayoutDashboard className="size-4 text-brand-600 dark:text-cyan-400" aria-hidden="true" />
                          <span>Dashboard & CR</span>
                        </Link>
                        <Link
                          href={getWorkspacePath(user.role)}
                          role="menuitem"
                          onClick={() => setAccountMenuOpen(false)}
                          className="focus-ring flex min-h-11 items-center gap-2.5 px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
                        >
                          <Briefcase className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                          <span>Không gian làm việc</span>
                        </Link>
                        <Link
                          href="/settings"
                          role="menuitem"
                          onClick={() => setAccountMenuOpen(false)}
                          className="focus-ring flex min-h-11 items-center gap-2.5 px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
                        >
                          <Settings className="size-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                          <span>Cài đặt tài khoản</span>
                        </Link>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => toggleTheme()}
                          className="focus-ring flex min-h-11 w-full items-center justify-between px-3.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
                        >
                          <span className="flex items-center gap-2.5">
                            {theme === "light" ? <Moon className="size-4 text-slate-600 dark:text-slate-300" aria-hidden="true" /> : <Sun className="size-4 text-amber-400" aria-hidden="true" />}
                            <span>Giao diện: {theme === "light" ? "Sáng" : "Tối"}</span>
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {theme === "light" ? "Bật tối" : "Bật sáng"}
                          </span>
                        </button>

                        <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setLogoutModalOpen(true);
                          }}
                          className="focus-ring flex min-h-11 w-full items-center gap-2.5 px-3.5 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          <LogOut className="size-4" aria-hidden="true" />
                          <span>{t("logout")}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DEFECT-04: Nút Đăng xuất nhanh trực tiếp trên Header */}
                  <button
                    type="button"
                    onClick={() => setLogoutModalOpen(true)}
                    className="focus-ring inline-flex size-9 items-center justify-center rounded-xl text-white/80 hover:bg-rose-500/20 hover:text-rose-300 transition border border-transparent hover:border-rose-400/30"
                    title="Đăng xuất nhanh"
                    aria-label="Đăng xuất nhanh"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                  </button>

                  {user.role?.toUpperCase() === "PUBLIC_USER" && (
                    <Link
                      href="/settings"
                      className="hidden 2xl:inline-flex items-center rounded-lg bg-cyan-500/20 px-2.5 py-1 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/30 border border-cyan-400/30"
                    >
                      {t("expert_upgrade")}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="hidden items-center sm:flex">
                  <Link
                    href="/login"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-white/95 px-4 py-2 text-xs xl:text-sm font-bold text-brand-700 shadow-md hover:shadow-lg transition whitespace-nowrap cursor-pointer"
                  >
                    <LogIn className="size-4 text-brand-700" />
                    <span>{t("login")}</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="focus-ring min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl p-2 text-white hover:bg-white/10 lg:hidden"
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer & Backdrop */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 top-[72px] z-40 bg-slate-950/70 backdrop-blur-xs transition-opacity lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide Down Sheet */}
            <div
              id="mobile-navigation"
              className="fixed inset-x-0 top-[72px] z-50 max-h-[calc(100dvh-72px)] overflow-y-auto border-b border-white/10 bg-[#1e2f57]/98 text-white shadow-2xl backdrop-blur-xl transition-all dark:border-slate-800 dark:bg-slate-950/98 lg:hidden"
            >
              <div className="p-4 space-y-4">
                {/* 1. User Header or Guest CTA */}
                {user ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      <div className="grid size-11 place-items-center rounded-full bg-cyan-400 text-slate-950 font-bold text-base shadow-xs">
                        {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-white">
                          {user.fullName || user.email}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold border ${getRoleBadgeStyle(user.role)}`}>
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
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-white/10 p-2.5 font-semibold text-white transition hover:bg-white/20 shadow-xs"
                      >
                        <LayoutDashboard className="size-4 text-cyan-400 shrink-0" />
                        <span className="truncate">Dashboard & CR</span>
                      </Link>
                      <Link
                        href={getWorkspacePath(user.role)}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-white/10 p-2.5 font-semibold text-white transition hover:bg-white/20 shadow-xs"
                      >
                        <Briefcase className="size-4 text-emerald-400 shrink-0" />
                        <span className="truncate">Không gian việc</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-white/10 p-2.5 font-semibold text-white transition hover:bg-white/20 shadow-xs"
                      >
                        <Settings className="size-4 text-slate-300 shrink-0" />
                        <span className="truncate">Cài đặt tài khoản</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setLogoutModalOpen(true);
                        }}
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-rose-500/20 p-2.5 font-semibold text-rose-300 transition hover:bg-rose-500/30 shadow-xs text-left cursor-pointer border border-rose-400/30"
                      >
                        <LogOut className="size-4 text-rose-400 shrink-0" />
                        <span className="truncate">{t("logout")}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                    <p className="text-xs font-semibold text-white/80">
                      Chào mừng bạn đến với Cổng Quốc Gia NacenTwin
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="focus-ring flex-1 flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-white/95 py-2.5 text-xs font-bold text-brand-700 shadow-xs transition"
                      >
                        <LogIn className="size-4 text-brand-700" />
                        <span>{t("login")}</span>
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="focus-ring flex-1 flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 py-2.5 text-xs font-bold text-white shadow-xs transition"
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
                  className="flex min-h-11 items-center justify-between rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-blue-900/60 to-cyan-900/60 p-3 text-white shadow-xs transition hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-cyan-500 text-slate-950 shadow-xs">
                      <ClipboardCheck className="size-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white">Khảo sát năng lực ĐMST</div>
                      <div className="text-[11px] text-cyan-200 font-medium">
                        Đo lường 8 nhóm năng lực theo chuẩn Quốc gia
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                    43 câu
                  </span>
                </Link>

                {/* 3. Main Navigation List */}
                <div className="space-y-1">
                  <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
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
                            className={`group flex min-h-11 items-center justify-between rounded-xl px-3 py-2.5 transition ${
                              isActive
                                ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30 shadow-xs"
                                : "text-white/85 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`grid size-8 place-items-center rounded-lg transition ${
                                  isActive
                                    ? "bg-cyan-400 text-slate-950"
                                    : "bg-white/10 text-white/80 group-hover:bg-white/20 group-hover:text-white"
                                }`}
                              >
                                <Icon className="size-4" />
                              </div>
                              <span className="text-sm">{link.label}</span>
                            </div>
                            {link.badge ? (
                              <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
                                {link.badge}
                              </span>
                            ) : (
                              <ChevronRight
                                className={`size-4 transition ${
                                  isActive
                                    ? "text-cyan-300"
                                    : "text-white/40 group-hover:text-white group-hover:translate-x-0.5"
                                }`}
                              />
                            )}
                          </Link>
                        );
                      }

                      return (
                        <div key={link.href} className="space-y-1">
                          <div
                            className={`group flex min-h-11 items-center justify-between rounded-xl px-3 py-2.5 transition ${
                              isActive
                                ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30 shadow-xs"
                                : "text-white/85 hover:bg-white/10 hover:text-white"
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
                                    ? "bg-cyan-400 text-slate-950"
                                    : "bg-white/10 text-white/80 group-hover:bg-white/20 group-hover:text-white"
                                }`}
                              >
                                <Icon className="size-4" />
                              </div>
                              <span className="text-sm truncate">{link.label}</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => toggleMobileSubmenu(link.href)}
                              className="min-h-11 min-w-11 grid place-items-center rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"
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
                            <div className="ml-6 pl-3 border-l-2 border-cyan-400/30 space-y-1 my-1">
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
                                    className={`flex min-h-11 items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                                      isSubActive
                                        ? "bg-cyan-500/20 text-cyan-300 font-bold"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <SubIcon className="size-3.5 shrink-0 text-cyan-400" />
                                      <span className="truncate">{subItem.label}</span>
                                    </div>
                                    {subItem.badge && (
                                      <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold uppercase text-emerald-300 border border-emerald-400/30">
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
                <div className="space-y-3 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/80">
                      Giao diện hiển thị:
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleTheme()}
                      className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      {theme === "light" ? (
                        <>
                          <Moon className="size-3.5 text-cyan-300" />
                          <span>Chế độ Tối</span>
                        </>
                      ) : (
                        <>
                          <Sun className="size-3.5 text-amber-300" />
                          <span>Chế độ Sáng</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/80">
                      Cỡ chữ văn bản:
                    </span>
                    <FontsizeControl />
                  </div>
                  <div className="pt-2 text-center text-[11px] text-white/60">
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
