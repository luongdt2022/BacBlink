"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./i18n-provider";
import {
  Eye,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Award,
  Lock,
  Activity,
} from "lucide-react";

export function Footer() {
  const { t } = useI18n();
  const pathname = usePathname();

  const isDedicatedSurvey =
    pathname?.startsWith("/khao-sat-doanh-nghiep") ||
    pathname?.startsWith("/khao-sat-cong-nghe");

  return (
    <footer className="w-full bg-[#1e2f57] text-white transition-colors dark:bg-slate-950 dark:border-t dark:border-slate-800">
      {/* Main 4-Column Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* CỘT 1: Cơ quan chủ quản & Đơn vị vận hành */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/NACENTECH_Main-Logo-G.png"
                alt="NacenTech Logo"
                className="h-10 w-auto object-contain bg-white/10 rounded-lg p-1 backdrop-blur-xs"
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

            <div className="space-y-2 text-xs text-white/90 leading-relaxed">
              <p className="font-bold tracking-wide text-white">
                Cơ quan chủ quản: <span className="font-extrabold text-cyan-300">{t("ministry_title")}</span>
              </p>
              <p className="font-semibold text-white/95">
                Đơn vị vận hành: <span className="font-bold text-white">{t("institute_title")}</span>
              </p>
              <div className="flex items-start gap-2 pt-1 text-white/85">
                <MapPin className="size-4 shrink-0 mt-0.5 text-cyan-400" aria-hidden="true" />
                <span>{t("footer_address")}</span>
              </div>
              <div className="flex items-center gap-2 text-white/85">
                <Phone className="size-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
                <span>Điện thoại: 024.3933.1234</span>
              </div>
              <div className="flex items-center gap-2 text-white/85">
                <Mail className="size-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
                <span>E-mail: contact@nacentech.gov.vn</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-[11px] text-white/70">
              Giấy phép thiết lập Cổng TTĐT số 128/GP-BTTTT do Bộ Thông tin & Truyền thông cấp.
            </div>
          </div>

          {/* CỘT 2: Bản đồ Dịch vụ ĐMST */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Award className="size-4" aria-hidden="true" />
              <span>Dịch vụ Đổi mới sáng tạo</span>
            </h3>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <Link
                  href="/chao-ban-cong-nghe"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Sàn Chào bán Công nghệ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/nhu-cau-cong-nghe"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Bảng Nhu cầu Đổi mới công nghệ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/khao-sat-nhu-cau"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Khảo sát Nhu cầu Công nghệ (TNI)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dieu-tra-trinh-do-nang-luc"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Đánh giá Trình độ DN (TT 17)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/doanh-nghiep-dmst"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Danh bạ Doanh nghiệp ĐMST</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/chuyen-gia"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Mạng lưới Chuyên gia & Cố vấn</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/trien-lam"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Không gian Triển lãm Ảo Techmart</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: Hướng dẫn & Quy chuẩn pháp lý */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="size-4" aria-hidden="true" />
              <span>Hướng dẫn & Quy chuẩn</span>
            </h3>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <Link
                  href="/gioi-thieu"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Quy chế hoạt động Sàn công nghệ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/huong-dan"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Trung tâm Hướng dẫn Toàn trình</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/matrix"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Khung Pháp lý & Tiêu chuẩn TRL 1-9</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/wireframes"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Sơ đồ Kiến trúc Chức năng Hệ thống</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dich-vu-khac"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Biểu mẫu Chuyển giao Công nghệ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dich-vu-khac#doanh-nghiep-khcn"
                  className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                >
                  <ChevronRight className="size-3 text-cyan-400" aria-hidden="true" />
                  <span>Tư vấn Doanh nghiệp KH&CN & SHTT</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: An toàn thông tin, Tổng đài & Bộ đếm sống */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Lock className="size-4" aria-hidden="true" />
              <span>Hỗ trợ & An toàn thông tin</span>
            </h3>

            {/* Hotline 24/7 Card */}
            <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-blue-950/40 p-3.5 backdrop-blur-xs">
              <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wide">
                Tổng đài hỗ trợ kỹ thuật 24/7
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-cyan-500 text-slate-950 font-bold shadow-xs">
                  <Phone className="size-4 animate-pulse" aria-hidden="true" />
                </div>
                <div>
                  <a
                    href="tel:02439331234"
                    className="text-base font-extrabold text-white hover:text-cyan-300 transition-colors"
                  >
                    024.3933.1234
                  </a>
                  <div className="text-[10px] text-white/70">Hotline Quốc gia: 1900 6886</div>
                </div>
              </div>
            </div>

            {/* Bộ đếm lượt truy cập sống */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-white/80">
                <div className="flex items-center gap-1.5">
                  <Eye className="size-3.5 text-cyan-400" aria-hidden="true" />
                  <span>Lượt truy cập:</span>
                </div>
                <span className="font-extrabold text-white tracking-wider text-sm">2,689,450</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/70 pt-1 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <Activity className="size-3 text-emerald-400" aria-hidden="true" />
                  <span>Đang trực tuyến:</span>
                </div>
                <span className="font-semibold text-emerald-300">1,420</span>
              </div>
            </div>

            {/* Huy hiệu bảo mật & Thông báo trạng thái */}
            <div className="space-y-1.5 text-[11px] text-white/75">
              <div className="flex items-center gap-1.5 text-cyan-300">
                <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Chứng nhận an toàn thông tin Cấp độ 3 (NCSC)</span>
              </div>
              <div className="text-white/85">
                {t("footer_system_status") || "Hệ thống đang trong giai đoạn thử nghiệm."}
              </div>
            </div>
          </div>
        </div>

        {/* Divider & Sub-footer: Bản quyền, Điều khoản & Chính sách */}
        <div className="mt-10 pt-5 border-t border-white/15 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/80 dark:text-slate-400">
          <div>{t("footer_rights")}</div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1 text-white/90 dark:text-slate-300 text-xs">
            <Link href="/dieu-khoan" className="hover:text-cyan-300 transition-colors">
              Điều khoản sử dụng
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/bao-mat" className="hover:text-cyan-300 transition-colors">
              Chính sách bảo mật
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/wireframes" className="hover:text-cyan-300 transition-colors">
              Sơ đồ cổng (Sitemap)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
