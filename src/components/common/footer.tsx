"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "./i18n-provider";
import { Eye } from "lucide-react";

export function Footer() {
  const { t } = useI18n();
  const pathname = usePathname();

  const isDedicatedSurvey =
    pathname?.startsWith("/khao-sat-doanh-nghiep") ||
    pathname?.startsWith("/khao-sat-cong-nghe");

  return (
    <footer className="w-full bg-brand-700 text-white transition-colors dark:bg-slate-950 dark:border-t dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        {/* Main Info - Căn giữa trang trọng theo phong cách Cổng thông tin Nhà nước (chuẩn sti.gov.vn) */}
        <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
          <p className="text-sm sm:text-base font-bold tracking-wide">
            Cơ quan chủ quản: {t("ministry_title")}
          </p>
          <p className="text-sm sm:text-base font-semibold text-white/95">
            Đơn vị vận hành: {t("institute_title")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3 gap-y-1 text-xs sm:text-sm text-white/85 pt-1 leading-relaxed">
            <span>{t("footer_address")}</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span>Điện thoại: 024.3933.1234</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span>E-mail: contact@nacentech.gov.vn</span>
          </div>
        </div>

        {/* Divider & Sub-footer: Bản quyền, Trạng thái thử nghiệm & Lượt truy cập */}
        <div className="mt-5 sm:mt-7 pt-4 border-t border-white/20 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/80 dark:text-slate-400">
          <div>{t("footer_rights")}</div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 sm:gap-3 text-white/90 dark:text-slate-300">
            <span className="text-white/85 font-normal">
              {t("footer_system_status") || "Hệ thống đang trong giai đoạn thử nghiệm."}
            </span>
            <span className="hidden sm:inline text-white/40">|</span>
            <div className="flex items-center gap-1.5">
              <Eye className="size-3.5 text-white/70" />
              <span>Lượt truy cập:</span>
              <span className="font-semibold text-white tracking-wider">2,689,450</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
