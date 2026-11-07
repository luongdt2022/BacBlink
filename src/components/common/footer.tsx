"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "./i18n-provider";
import {
  Eye,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Activity,
} from "lucide-react";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="w-full bg-[#3C5999] text-white border-t border-white/10 transition-colors dark:bg-slate-950 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Bố cục 2 cột tối giản, tinh gọn & thanh thoát */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* CỘT TRÁI: Nhận diện Cổng & Cơ quan chủ quản (7 cột) */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/NACENTECH_Main-Logo-G.png"
                alt="NacenTech Logo"
                className="h-9 w-auto object-contain bg-white/10 rounded-lg p-1 backdrop-blur-xs"
              />
              <div>
                <span className="text-base font-extrabold tracking-tight text-white block leading-none">
                  NacenTwin
                </span>
                <span className="text-[11px] font-semibold text-cyan-300 block mt-0.5">
                  Cổng Đổi Mới Sáng Tạo Quốc Gia
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-white/90 leading-relaxed">
              <p className="font-bold tracking-wide text-white">
                Cơ quan chủ quản: <span className="font-extrabold text-cyan-300">{t("ministry_title")}</span>
              </p>
              <p className="font-semibold text-white/95">
                Đơn vị vận hành: <span className="font-bold text-white">{t("institute_title")}</span>
              </p>
              <div className="flex items-start gap-1.5 pt-0.5 text-white/85">
                <MapPin className="size-3.5 shrink-0 mt-0.5 text-cyan-300" aria-hidden="true" />
                <span>{t("footer_address")}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/85 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <Phone className="size-3.5 shrink-0 text-cyan-300" aria-hidden="true" />
                  <span>024.3933.1234</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="size-3.5 shrink-0 text-cyan-300" aria-hidden="true" />
                  <span>contact@nacentech.gov.vn</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-white/70">
              Giấy phép thiết lập Cổng TTĐT số 128/GP-BTTTT do Bộ Thông tin &amp; Truyền thông cấp.
            </div>
          </div>

          {/* CỘT PHẢI: Hỗ trợ 24/7 & An toàn thông tin (5 cột) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-3 md:items-end">
            {/* Hotline 24/7 Card gọn */}
            <div className="w-full sm:max-w-xs rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Tổng đài hỗ trợ kỹ thuật 24/7
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-cyan-400 text-slate-950 font-bold shadow-xs">
                    <Phone className="size-3.5" aria-hidden="true" />
                  </div>
                  <div>
                    <a
                      href="tel:02439331234"
                      className="text-sm sm:text-base font-extrabold text-white hover:text-cyan-300 transition-colors"
                    >
                      024.3933.1234
                    </a>
                    <div className="text-[10px] text-white/70">Hotline: 1900 6886</div>
                  </div>
                </div>

                <div className="text-right border-l border-white/15 pl-3">
                  <div className="flex items-center gap-1 text-[11px] text-white/80 justify-end">
                    <Eye className="size-3 text-cyan-300" aria-hidden="true" />
                    <span className="font-bold text-white">2.689.450</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-300 justify-end">
                    <Activity className="size-2.5" aria-hidden="true" />
                    <span>1.420 online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Huy hiệu an toàn NCSC Cấp độ 3 */}
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-200">
              <ShieldCheck className="size-3.5 shrink-0 text-cyan-300" aria-hidden="true" />
              <span>Chứng nhận an toàn thông tin Cấp độ 3 (NCSC)</span>
            </div>
          </div>
        </div>

        {/* Sub-footer thanh mảnh: Bản quyền & Liên kết chính sách */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-white/80">
          <div>{t("footer_rights")}</div>
          <div className="flex items-center gap-x-3 text-white/90 text-xs">
            <Link href="/dieu-khoan" className="hover:text-cyan-300 transition-colors">
              Điều khoản sử dụng
            </Link>
            <span className="text-white/30">•</span>
            <Link href="/bao-mat" className="hover:text-cyan-300 transition-colors">
              Chính sách bảo mật
            </Link>
            <span className="text-white/30">•</span>
            <Link href="/wireframes" className="hover:text-cyan-300 transition-colors">
              Sơ đồ cổng (Sitemap)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
