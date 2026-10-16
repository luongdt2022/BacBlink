"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient, getRoleDisplayName, UserContext } from "@/lib/auth-client";
import { useI18n, I18nToggle } from "./i18n-provider";
import { ThemeToggle } from "./theme-toggle";
import { ConfirmModal } from "./confirm-modal";
import { useToast } from "./toast";
import { FontsizeControl } from "./fontsize-control";
import {
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ChevronDown,
  UserRound,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();

  const [user, setUser] = useState<UserContext | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(authClient.getUser());
  }, [pathname]);

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
  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/gioi-thieu", label: t("about") },
    { href: "/chao-ban-cong-nghe", label: t("technology_offers") },
    { href: "/nhu-cau-cong-nghe", label: t("technology_demands") },
    { href: "/doanh-nghiep-dmst", label: t("innovative_enterprises") },
    { href: "/trien-lam", label: "Sự kiện Techmart" },
    { href: "/chuyen-gia", label: t("experts") },
    { href: "/huong-dan", label: t("user_guide") || "Hướng dẫn" },
    { href: "/dich-vu-khac", label: t("services") },
    { href: "/wireframes", label: t("wireframes") || "Wireframes" },
  ];

  const isActiveLink = (href: string) => href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

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
            <nav className="hidden flex-1 items-center justify-center gap-0.5 2xl:gap-1 xl:flex" aria-label="Điều hướng chính">
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`focus-ring rounded-control px-2 py-1.5 2xl:px-2.5 2xl:py-2 text-[13px] 2xl:text-sm font-semibold whitespace-nowrap transition ${
                      isActive
                        ? "bg-brand-50 text-brand-800 font-bold dark:bg-brand-950/70 dark:text-brand-200"
                        : "text-slate-700 hover:bg-brand-50 hover:text-brand-800 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Tools & User Session */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Language Switcher */}
              <I18nToggle />

              {/* Dark/Light Theme Toggle */}
              <ThemeToggle />

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
                        <Link href="/settings" role="menuitem" onClick={() => setAccountMenuOpen(false)} className="focus-ring flex min-h-11 items-center px-3 text-label font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-brand-200">
                          Cài đặt tài khoản
                        </Link>
                        <Link href="/assessments/tt17" role="menuitem" onClick={() => setAccountMenuOpen(false)} className="focus-ring flex min-h-11 items-center px-3 text-label font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-brand-200">
                          Đánh giá công nghệ (TT17)
                        </Link>
                        {authClient.hasRole(["PROVINCIAL_ADMIN", "PROVINCE_OFFICER", "PROVINCE_LEADER", "ADMIN", "SUPER_ADMIN"]) && (
                          <Link href="/gov/assessments/tt17" role="menuitem" onClick={() => setAccountMenuOpen(false)} className="focus-ring flex min-h-11 items-center px-3 text-label font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-slate-800">
                            Thẩm định TT17 (Sở KH&CN)
                          </Link>
                        )}
                        <button type="button" role="menuitem" onClick={() => { setAccountMenuOpen(false); setLogoutModalOpen(true); }} className="focus-ring flex min-h-11 w-full items-center gap-2 px-3 text-left text-label font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300">
                          <LogOut className="size-4" aria-hidden="true" />
                          {t("logout")}
                        </button>
                      </div>
                    )}
                  </div>
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
                <div className="hidden items-center gap-1.5 sm:flex">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 rounded-control border border-border-default px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-[13px] 2xl:text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <LogIn className="w-3.5 h-3.5 text-text-secondary" />
                    <span>{t("login")}</span>
                  </Link>

                  <Link
                    href="/register"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-control bg-nacen-green-500 px-3 2xl:px-4 py-1.5 2xl:py-2 text-[13px] 2xl:text-sm font-semibold text-white shadow-sm transition hover:bg-nacen-green-600 whitespace-nowrap"
                  >
                    <UserPlus className="w-3.5 h-3.5 shrink-0" />
                    <span>{t("register")}</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="focus-ring min-h-11 min-w-11 inline-flex items-center justify-center rounded-control p-2 text-text-secondary hover:bg-brand-50 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white xl:hidden"
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div id="mobile-navigation" className="max-h-[75dvh] overflow-y-auto space-y-2 border-t border-border-default bg-white px-4 pt-3 pb-4 dark:border-slate-800 dark:bg-slate-950 xl:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-control px-3 py-2.5 text-label font-semibold ${
                  isActiveLink(link.href)
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user ? (
              <div className="flex flex-wrap gap-3 border-t border-border-default py-3 sm:hidden">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="focus-ring rounded-control border border-border-default px-4 py-3 text-label font-semibold text-brand-700 dark:text-brand-200">{t("login")}</Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="focus-ring rounded-control bg-nacen-green-500 px-4 py-3 text-label font-semibold text-white hover:bg-nacen-green-600">{t("register")}</Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 border-t border-border-default py-3 sm:hidden">
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="focus-ring rounded-control px-4 py-3 text-label font-semibold text-brand-700 dark:text-brand-200">Cài đặt tài khoản</Link>
                <button type="button" onClick={() => { setMobileMenuOpen(false); setLogoutModalOpen(true); }} className="focus-ring rounded-control px-4 py-3 text-label font-semibold text-brand-700 dark:text-brand-200">{t("logout")}</button>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border-default pt-3 xl:hidden">
              <span className="text-xs font-semibold text-text-secondary dark:text-slate-400">Cỡ chữ hiển thị:</span>
              <FontsizeControl />
            </div>
          </div>
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
