"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Globe } from "lucide-react";

export type Language = "vi" | "en";

const dictionary: Record<Language, Record<string, string>> = {
  vi: {
    brand_title: "Cổng Thông Tin & Kết Nối Chuỗi Cung Ứng Công Nghiệp",
    brand_sub: "Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)",
    home: "Trang chủ",
    about: "Giới thiệu",
    events: "Tin tức",
    technology_offers: "Cung ứng",
    technology_demands: "Nhu cầu",
    innovative_enterprises: "Hội viên",
    experts: "Cố vấn",
    services: "Dịch vụ",
    user_guide: "Hướng dẫn",
    wireframes: "Sơ đồ cổng",
    expert_upgrade: "Nâng hạng hội viên",
    enterprise: "Doanh nghiệp",
    marketplace: "Sàn Cung ứng & Công nghệ",
    admin_portal: "Quản trị",
    login: "Đăng nhập",
    register: "Đăng ký",
    logout: "Đăng xuất",
    welcome: "Xin chào",
    role: "Vai trò",
    search_placeholder: "Tìm kiếm năng lực sản xuất, linh kiện, nhà máy, cố vấn...",
    ministry_title: "UBND TỈNH BẮC NINH",
    institute_title: "HIỆP HỘI SẢN XUẤT CÔNG NGHIỆP TỈNH BẮC NINH (BACLINK)",
    footer_address: "Địa chỉ: Số 7 Lý Thái Tổ, Phường Suối Hoa, TP. Bắc Ninh, Tỉnh Bắc Ninh",
    footer_contact: "Email: contact@baclink.org.vn | Hotline: 0222.3888.686",
    footer_rights: "© 2026 BACLINK - Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh. QĐ thành lập số 1652/QĐ-UBND.",
    footer_system_status: "Hệ thống kết nối chuỗi cung ứng công nghiệp Bắc Ninh.",
  },
  en: {
    brand_title: "Industrial Manufacturing & Supply Chain Portal",
    brand_sub: "Bac Ninh Association of Industrial Manufacturing (BACLINK)",
    home: "Home",
    about: "About",
    events: "News",
    technology_offers: "Supply",
    technology_demands: "Demands",
    innovative_enterprises: "Members",
    experts: "Advisors",
    services: "Services",
    user_guide: "User Guide",
    wireframes: "Sitemap",
    expert_upgrade: "Membership Upgrade",
    enterprise: "Enterprises",
    marketplace: "Supply & Tech Marketplace",
    admin_portal: "Admin Portal",
    login: "Sign In",
    register: "Sign Up",
    logout: "Sign Out",
    welcome: "Welcome",
    role: "Role",
    search_placeholder: "Search manufacturing capabilities, parts, factories, advisors...",
    ministry_title: "PEOPLE'S COMMITTEE OF BAC NINH PROVINCE",
    institute_title: "BAC NINH ASSOCIATION OF INDUSTRIAL MANUFACTURING (BACLINK)",
    footer_address: "Address: No. 7 Ly Thai To, Suoi Hoa Ward, Bac Ninh City, Vietnam",
    footer_contact: "Email: contact@baclink.org.vn | Hotline: +84.222.3888.686",
    footer_rights: "© 2026 BACLINK - Bac Ninh Association of Industrial Manufacturing. Decision No. 1652/QD-UBND.",
    footer_system_status: "Bac Ninh industrial supply chain portal.",
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

export function I18nToggle({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "navbar";
}) {
  const { lang, toggleLang } = useI18n();
  const isNavbar = variant === "navbar";

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={`focus-ring inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-control text-label font-semibold transition ${
        isNavbar
          ? "text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl font-bold shadow-2xs"
          : "text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
      } ${className}`}
      title="Chuyển đổi Ngôn ngữ (VI / EN)"
      aria-label={`Chuyển ngôn ngữ sang ${lang === "vi" ? "English" : "Tiếng Việt"}`}
      aria-pressed={lang === "en"}
    >
      <Globe className={`w-3.5 h-3.5 ${isNavbar ? "text-white/85" : "text-brand-700 dark:text-brand-200"}`} />
      <span className={isNavbar ? "text-white font-bold" : ""}>{lang.toUpperCase()}</span>
    </button>
  );
}
