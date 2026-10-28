"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Globe } from "lucide-react";

export type Language = "vi" | "en";

const dictionary: Record<Language, Record<string, string>> = {
  vi: {
    brand_title: "Hệ thống ĐMST & Chuyển giao Công nghệ",
    brand_sub: "Viện Đổi Mới Sáng Tạo Quốc Gia (NacenTech)",
    home: "Trang chủ",
    about: "Giới thiệu",
    technology_offers: "Công nghệ",
    technology_demands: "Nhu cầu",
    innovative_enterprises: "DN ĐMST",
    experts: "Chuyên gia",
    services: "Dịch vụ",
    user_guide: "Hướng dẫn",
    wireframes: "Wireframes",
    expert_upgrade: "Nâng hạng tài khoản",
    enterprise: "Doanh nghiệp",
    marketplace: "Sàn Công nghệ",
    admin_portal: "Quản trị",
    login: "Đăng nhập",
    register: "Đăng ký",
    logout: "Đăng xuất",
    welcome: "Xin chào",
    role: "Vai trò",
    search_placeholder: "Tìm kiếm công nghệ, bằng sáng chế, chuyên gia...",
    ministry_title: "BỘ KHOA HỌC VÀ CÔNG NGHỆ",
    institute_title: "VIỆN ĐỔI MỚI SÁNG TẠO QUỐC GIA (NACENTECH)",
    footer_address: "Địa chỉ: Số 25 Lê Thánh Tông, Hoàn Kiếm, Hà Nội",
    footer_contact: "Email: contact@nacentech.gov.vn | Hotline: 024.3933.1234",
    footer_rights: "© 2026 NacenTwin - Mạng lưới Đổi mới sáng tạo & Chuyển giao Công nghệ Quốc gia.",
  },
  en: {
    brand_title: "Innovation & Technology Transfer Portal",
    brand_sub: "National Center for Technological Progress (NacenTech)",
    home: "Home",
    about: "About",
    technology_offers: "Technology Offers",
    technology_demands: "Technology Demands",
    innovative_enterprises: "Innovative Enterprises",
    experts: "Experts",
    services: "Services",
    user_guide: "User Guide",
    wireframes: "Wireframes",
    expert_upgrade: "Account upgrade",
    enterprise: "Enterprises",
    marketplace: "Tech Marketplace",
    admin_portal: "Admin Portal",
    login: "Sign In",
    register: "Sign Up",
    logout: "Sign Out",
    welcome: "Welcome",
    role: "Role",
    search_placeholder: "Search technologies, patents, experts...",
    ministry_title: "MINISTRY OF SCIENCE AND TECHNOLOGY",
    institute_title: "INSTITUTE OF APPLIED TECHNOLOGY (NACENTECH)",
    footer_address: "Address: 25 Le Thanh Tong, Hoan Kiem, Hanoi, Vietnam",
    footer_contact: "Email: contact@nacentech.gov.vn | Hotline: +84.24.3933.1234",
    footer_rights: "© 2026 NacenTwin - National Innovation & Technology Transfer Network.",
  },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANG_STORAGE_KEY = "nacentwin_lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("vi");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
    if (saved === "vi" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem(LANG_STORAGE_KEY, l);
  };

  const toggleLang = () => {
    setLang(lang === "vi" ? "en" : "vi");
  };

  const t = (key: string): string => {
    return dictionary[lang]?.[key] || dictionary["vi"]?.[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function I18nToggle({ className = "" }: { className?: string }) {
  const { lang, toggleLang } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={`focus-ring inline-flex min-h-11 items-center gap-1.5 px-2.5 py-1.5 rounded-control text-label font-semibold text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition ${className}`}
      title="Chuyển đổi Ngôn ngữ (VI / EN)"
      aria-label={`Chuyển ngôn ngữ sang ${lang === "vi" ? "English" : "Tiếng Việt"}`}
      aria-pressed={lang === "en"}
    >
      <Globe className="w-3.5 h-3.5 text-brand-700 dark:text-brand-200" />
      <span>{lang.toUpperCase()}</span>
    </button>
  );
}
