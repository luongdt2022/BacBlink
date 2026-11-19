"use client";

import React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { ORG, ORG_DECISION_TEXT } from "@/lib/constants/organization";
import { tr } from "@/lib/constants/i18n-public";
import { openContactModal } from "@/lib/contact-client";

/** Liên kết dòng dưới cùng — chỉ trỏ tới route đang tồn tại (UI-BL07-CLEAN-WEB-001). */
export const FOOTER_LINKS: { href: string; label: string }[] = [
  { href: "/gioi-thieu", label: "Giới thiệu Hiệp hội" },
  { href: "/hoi-vien", label: "Hội viên" },
  { href: "/tin-tuc", label: "Tin tức & hoạt động" },
  { href: "/chinh-sach", label: "Chính sách & tri thức" },
  { href: "/lien-he", label: "Liên hệ & gửi yêu cầu" },
];

/**
 * Footer BACLINK dạng gọn (2 cột) — CR-BACLINK-008.
 * Không số liệu không nguồn (BR-BL08-NO-UNSOURCED-STATS-002) và không công bố điện thoại/email/Zalo
 * (chưa có kênh liên hệ chính thức): mọi liên hệ đi qua biểu mẫu "Gửi yêu cầu".
 */
export function Footer() {
  const { lang } = useI18n();
  const isEn = lang === "en";
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#042142] text-white border-t border-amber-400/20 transition-colors dark:bg-slate-950 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-center">
          {/* Trái: nhận diện & cơ quan chủ quản */}
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-white to-amber-200 shadow-md shrink-0 overflow-hidden">
                <img src="/baclink-logo-256.png" alt="BACLINK Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white block leading-none flex items-center gap-1.5">
                  {ORG.shortName}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 tracking-wider">
                    {ORG.tagline.toUpperCase()}
                  </span>
                </span>
                <span className="text-[11px] font-medium text-white/80 block mt-0.5">
                  {ORG.motto}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-white/90 leading-normal">
              <p className="font-medium text-white/90">
                {isEn ? "Governing body" : "Đơn vị chủ quản"}:{" "}
                <span className="font-bold text-amber-300">{isEn ? ORG.fullNameEn.toUpperCase() : ORG.fullNameUpper}</span>
              </p>
              <div className="flex items-center gap-1.5 text-white/80">
                <MapPin className="size-3.5 shrink-0 text-white/70" aria-hidden="true" />
                <span>{isEn ? ORG.addressEn : ORG.address}</span>
              </div>
            </div>

            <div className="text-[11px] text-white/60">
              {isEn ? `Established under Decision No. ${ORG.decision.numberEn} dated ${ORG.decision.date}.` : `Thành lập theo ${ORG_DECISION_TEXT}.`}
            </div>
          </div>

          {/* Phải: thẻ Văn phòng + gửi yêu cầu */}
          <div className="md:col-span-5 flex flex-col justify-center space-y-2 md:items-end">
            <div className="w-full sm:max-w-xs rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-md shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/85">
                {tr(lang, "Văn phòng Hiệp hội")}
              </div>
              <button
                type="button"
                onClick={() => openContactModal()}
                className="mt-2 w-full rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-[#042142] hover:bg-slate-100 transition-colors"
              >
                {tr(lang, "Liên hệ & gửi yêu cầu")}
              </button>
            </div>
          </div>
        </div>

        {/* Dòng dưới: bản quyền & liên kết */}
        <div className="mt-3.5 pt-2.5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-white/75">
          <div>© {year} {ORG.shortName} – {isEn ? ORG.fullNameEn : ORG.fullName}.</div>
          <nav aria-label="Liên kết chân trang" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-white/85">
            {FOOTER_LINKS.map((l, i) => (
              <React.Fragment key={l.href}>
                {i > 0 && <span className="text-white/30" aria-hidden="true">•</span>}
                <Link href={l.href} prefetch={false} className="hover:text-white transition-colors">{tr(lang, l.label)}</Link>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
