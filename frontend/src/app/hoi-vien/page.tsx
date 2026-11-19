"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CheckCircle2, ClipboardList, FileText, Search, UserPlus } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Async, type AsyncState } from "@/components/ui/async";
import { membershipClient, formatVnd, type MembershipTier } from "@/lib/membership-client";
import { JOIN_STEPS, MEMBER_BENEFITS, MEMBER_CONDITIONS, MEMBER_DOCUMENTS } from "@/lib/constants/membership";
import { ORG } from "@/lib/constants/organization";
import { openContactModal } from "@/lib/contact-client";
import { tr } from "@/lib/constants/i18n-public";
import { useOptionalLang } from "@/components/common/i18n-provider";

const TYPE_LABEL: Record<MembershipTier["memberType"], string> = {
  OFFICIAL: "Chính thức",
  ASSOCIATE: "Liên kết",
  HONORARY: "Danh dự",
};

/** CR-BACLINK-008 · T-00.BL08.15 · REQ-BL08-MEMBER-PUBLIC-006 */
export default function HoiVienPage() {
  const lang = useOptionalLang();
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [state, setState] = useState<AsyncState>("loading");

  const load = () => {
    setState("loading");
    membershipClient
      .tiers()
      .then((t) => {
        setTiers(t);
        setState(t.length ? "success" : "empty");
      })
      .catch(() => setState("error"));
  };
  useEffect(load, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <PageHero
        eyebrow={`Hội viên ${ORG.shortName}`}
        title={tr(lang, "Gia nhập cộng đồng doanh nghiệp sản xuất Bắc Ninh")}
        desc={`Quyền lợi, đối tượng, hội phí và quy trình gia nhập ${ORG.fullName}. Đăng ký trực tuyến, theo dõi hồ sơ và nhận chứng nhận hội viên ngay trên cổng.`}
      >
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/hoi-vien/gia-nhap" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-[#042142] shadow-md hover:bg-slate-100">
              <UserPlus className="size-4" aria-hidden="true" /> {tr(lang, "Đăng ký hội viên")}
            </Link>
            <Link href="/hoi-vien/xac-thuc" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-bold hover:bg-white/10">
              <Search className="size-4" aria-hidden="true" /> {tr(lang, "Xác thực chứng nhận hội viên")}
            </Link>
          </div>
          <nav aria-label="Mục lục" className="flex flex-wrap gap-2 pt-3 text-xs">
            {[
              ["#quyen-loi", "Quyền lợi"],
              ["#loai-hinh-va-hoi-phi", "Đối tượng & hội phí"],
              ["#dieu-kien", "Điều kiện & hồ sơ"],
              ["#quy-trinh", "Quy trình gia nhập"],
              ["/hoi-vien/tieu-bieu", "Hội viên tiêu biểu"],
              ["/enterprises", "Danh bạ hội viên"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full bg-white/10 px-3 py-1.5 font-semibold hover:bg-white/20">{label}</Link>
            ))}
          </nav>
      </PageHero>

      <section id="quyen-loi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-5 scroll-mt-28">
        <h2 className="type-section-title text-slate-900 dark:text-white">{tr(lang, "Quyền lợi hội viên")}</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBER_BENEFITS.map((b) => (
            <li key={b} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50"><CheckCircle2 className="size-5" aria-hidden="true" /></span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      <section id="loai-hinh-va-hoi-phi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-4 scroll-mt-28">
        <h2 className="type-section-title text-slate-900 dark:text-white">{tr(lang, "Đối tượng, loại hình & hội phí")}</h2>
        <Async state={state} onRetry={load} errorMessage="Không tải được bảng hội phí." emptyTitle="Chưa công bố hạng hội viên">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-brand-50 text-left text-xs uppercase text-brand-800 dark:bg-slate-800/60 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">{tr(lang, "Loại hội viên")}</th>
                  <th className="px-4 py-3">{tr(lang, "Đối tượng")}</th>
                  <th className="px-4 py-3 text-right">{tr(lang, "Hội phí / năm")}</th>
                  <th className="px-4 py-3 text-right">{tr(lang, "Lệ phí gia nhập")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tiers.map((t) => (
                  <tr key={t.code} className="transition hover:bg-brand-50/40 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <span className="mr-2 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 dark:bg-slate-800 dark:text-cyan-300">{TYPE_LABEL[t.memberType]}</span>
                      <span className="font-semibold">{t.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.audience}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatVnd(t.annualFee)}</td>
                    <td className="px-4 py-3 text-right">{formatVnd(t.joiningFee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Hội phí tính theo năm dương lịch; kết nạp sau 30/06 đóng 50% hội phí năm đầu. Mức phí hiển thị là mức minh họa, Hiệp hội sẽ cập nhật theo Điều lệ chính thức.
          </p>
        </Async>
      </section>

      <section id="dieu-kien" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 grid grid-cols-1 gap-6 lg:grid-cols-2 scroll-mt-28">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white"><BadgeCheck className="size-5 text-brand-600" aria-hidden="true" /> Điều kiện gia nhập</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">{MEMBER_CONDITIONS.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white"><FileText className="size-5 text-brand-600" aria-hidden="true" /> Hồ sơ cần chuẩn bị</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">{MEMBER_DOCUMENTS.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </section>

      <section id="quy-trinh" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 space-y-5 scroll-mt-28">
        <h2 className="flex items-center gap-2 type-section-title text-slate-900 dark:text-white"><ClipboardList className="size-6 text-brand-600" aria-hidden="true" /> Quy trình gia nhập</h2>
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {JOIN_STEPS.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-black text-white shadow-md">{i + 1}</span>
              <p className="mt-3 font-bold text-sm">{s.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.desc}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3">
          <Link href="/hoi-vien/gia-nhap" className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white hover:bg-brand-800">
            <UserPlus className="size-4" aria-hidden="true" /> {tr(lang, "Bắt đầu đăng ký")}
          </Link>
          <button type="button" onClick={() => openContactModal("MEMBERSHIP")} className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-900">
            Cần tư vấn trước khi gia nhập
          </button>
        </div>
      </section>
    </main>
  );
}
