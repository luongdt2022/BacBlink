"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./i18n-provider";
import { Globe2, Mail, MapPin, Play } from "lucide-react";

export function Footer() {
  const { t } = useI18n();
  const pathname = usePathname();

  const isDedicatedSurvey =
    pathname?.startsWith("/khao-sat-doanh-nghiep") ||
    pathname?.startsWith("/khao-sat-cong-nghe");

  if (isDedicatedSurvey) {
    return (
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/NACENTECH_Main-Logo-G.png" alt="NacenTwin Logo" className="h-6 w-auto object-contain" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Nền Tảng Khảo Sát Nhu Cầu & Đổi Mới Công Nghệ Quốc Gia NacenTwin
            </span>
          </div>
          <div>
            © {new Date().getFullYear()} NacenTech — Viện Đổi Mới Sáng Tạo Quốc Gia (Bộ Khoa học & Công nghệ)
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border-default bg-surface-subtle text-sm text-slate-600 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.55fr_1fr_1fr] lg:gap-16">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/NACENTECH_Main-Logo-G.png"
                alt="NacenTech Logo"
                className="h-11 w-auto object-contain"
              />
              <div>
                <div className="text-sm font-bold tracking-tight text-text-primary dark:text-white">
                  {t("ministry_title")}
                </div>
                <div className="text-sm font-medium text-nacen-green-700 dark:text-nacen-green-200">
                  {t("institute_title")}
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3 pt-2 leading-relaxed text-text-secondary dark:text-slate-400">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-nacen-green-700" />
                <span>{t("footer_address")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-nacen-green-700" />
                <span>{t("footer_contact")}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:max-w-lg lg:col-span-2">
            <div className="space-y-4">
              <h4 className="font-semibold text-text-primary dark:text-white">Liên kết nhanh</h4>
              <ul className="space-y-3 text-text-secondary dark:text-slate-400">
                <li><Link href="/" className="focus-ring rounded-sm text-brand-700 transition hover:text-brand-800 hover:underline dark:text-brand-200 dark:hover:text-white">{t("home")}</Link></li>
                <li><Link href="/huong-dan" className="focus-ring rounded-sm text-brand-700 transition hover:text-brand-800 hover:underline dark:text-brand-200 dark:hover:text-white">Hướng dẫn sử dụng</Link></li>
                <li><Link href="/profile/upgrade" className="focus-ring rounded-sm text-brand-700 transition hover:text-brand-800 hover:underline dark:text-brand-200 dark:hover:text-white">{t("expert_upgrade")}</Link></li>
                <li><Link href="/login" className="focus-ring rounded-sm text-brand-700 transition hover:text-brand-800 hover:underline dark:text-brand-200 dark:hover:text-white">{t("login")}</Link></li>
                <li><Link href="/register" className="focus-ring rounded-sm text-brand-700 transition hover:text-brand-800 hover:underline dark:text-brand-200 dark:hover:text-white">{t("register")}</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-text-primary dark:text-white">Quy chuẩn &amp; Pháp lý</h4>
              <ul className="space-y-3 text-text-secondary dark:text-slate-400">
                <li>Nghị định 13/2023/NĐ-CP (PDPD)</li>
                <li>Thông tư 17/2021/TT-BKHCN</li>
                <li>Thang đo công nghệ TRL 1-9</li>
                <li>Bảo mật Scoped RBAC 3 chiều</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border-default pt-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-text-secondary sm:flex-row sm:text-left">
          <div>{t("footer_rights")}</div>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-border-default bg-white text-text-secondary dark:border-slate-700 dark:bg-slate-900"><Globe2 className="h-4 w-4" /></span>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-border-default bg-white text-text-secondary dark:border-slate-700 dark:bg-slate-900"><Play className="ml-0.5 h-4 w-4" /></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
