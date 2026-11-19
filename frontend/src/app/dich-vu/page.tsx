import React from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Cpu, Globe2, GraduationCap, Handshake, Leaf, Megaphone, Scale } from "lucide-react";
import { PageHero, ACCENTS } from "@/components/common/page-hero";
import { BUSINESS_SERVICES } from "@/lib/constants/services";
import { ORG } from "@/lib/constants/organization";

export const metadata = {
  title: `Dịch vụ hỗ trợ doanh nghiệp | ${ORG.shortName}`,
  description: "8 nhóm dịch vụ hỗ trợ doanh nghiệp của Hiệp hội: chính sách, kết nối cung cầu, đào tạo, công nghệ, năng suất, chuyển đổi xanh, xúc tiến thương mại, hợp tác quốc tế.",
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "ho-tro-chinh-sach": Scale, "ket-noi-cung-cau": Handshake, "dao-tao-nhan-luc": GraduationCap, "cong-nghe-chuyen-doi-so": Cpu,
  "nang-suat-chat-luong": BadgeCheck, "chuyen-doi-xanh-esg": Leaf, "xuc-tien-thuong-mai": Megaphone, "hop-tac-quoc-te": Globe2,
};

/** CR-BACLINK-010 · REQ-BL10-SERVICE-001 — Hub dịch vụ. */
export default function DichVuHubPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHero
        eyebrow="Dịch vụ hội viên"
        title="Dịch vụ hỗ trợ doanh nghiệp"
        desc={`Mỗi dịch vụ nêu rõ: dành cho ai, giải quyết vấn đề gì, ${ORG.shortName} hỗ trợ như thế nào và đăng ký ở đâu.`}
        chips={[{ icon: BadgeCheck, label: "8 nhóm dịch vụ" }, { icon: Handshake, label: "Do 9 ban chuyên môn phụ trách" }, { icon: Scale, label: "Đăng ký trực tuyến" }]}
      />
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BUSINESS_SERVICES.map((s, i) => {
            const Ic = ICONS[s.slug] ?? BadgeCheck;
            const ac = ACCENTS[i % ACCENTS.length];
            return (
              <li key={s.slug}>
                <Link href={`/dich-vu/${s.slug}`} className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 dark:border-slate-800 dark:bg-slate-900 ${ac.ring}`}>
                  <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${ac.bar} transition-transform duration-500 group-hover:scale-x-100`} />
                  <Ic className="pointer-events-none absolute -bottom-5 -right-4 size-28 text-slate-900/[0.04] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 dark:text-white/[0.05]" aria-hidden="true" />
                  <div className="relative flex items-center justify-between">
                    <span className={`grid size-12 place-items-center rounded-2xl ${ac.chip}`}><Ic className="size-6" aria-hidden="true" /></span>
                    <span className="text-xs font-black text-slate-300 dark:text-slate-700">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h2 className="relative mt-4 text-lg font-extrabold leading-snug text-slate-900 group-hover:text-brand-700 dark:text-white">{s.title}</h2>
                  <p className="relative mt-2 flex-1 text-sm text-slate-600 dark:text-slate-300">{s.summary}</p>
                  <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700 dark:text-cyan-300">Xem chi tiết &amp; đăng ký <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="rounded-2xl border border-brand-100 bg-brand-50/60 px-5 py-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Cần dịch vụ chuyên sâu về sở hữu trí tuệ, thẩm định – định giá công nghệ, chuẩn hóa chuỗi cung ứng FDI?{" "}
          <Link href="/dich-vu-khac" className="font-bold text-brand-700 underline dark:text-cyan-300">Xem dịch vụ chuyên sâu</Link>.
        </p>
      </div>
    </main>
  );
}
