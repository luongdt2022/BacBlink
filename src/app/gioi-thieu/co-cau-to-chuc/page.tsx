import React from "react";
import Link from "next/link";
import { Landmark, Layers, Mail, Users } from "lucide-react";
import {
  BACLINK_COMMITTEES,
  COMMITTEE_BLOCKS,
  ORG,
  ORG_DECISION_TEXT,
  type CommitteeBlock,
} from "@/lib/constants/organization";

export const metadata = {
  title: `Cơ cấu tổ chức & các ban chuyên môn | ${ORG.shortName}`,
  description: `Cơ cấu tổ chức ${ORG.fullName}: Ban Chấp hành và ${BACLINK_COMMITTEES.length} ban chuyên môn thuộc 4 khối hoạt động.`,
};

/** CR-BACLINK-008 · T-00.BL08.08 · REQ-BL08-ABOUT-010 */
export default function CoCauToChucPage() {
  const blocks = Object.keys(COMMITTEE_BLOCKS) as CommitteeBlock[];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <section className="workspace-banner text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <nav aria-label="Breadcrumb" className="text-xs text-white/70">
            <Link href="/" className="hover:text-white">Trang chủ</Link> /{" "}
            <Link href="/gioi-thieu" className="hover:text-white">Về BACLINK</Link> / <span className="text-white">Cơ cấu tổ chức</span>
          </nav>
          <h1 className="type-page-title text-white">Cơ cấu tổ chức & các ban chuyên môn</h1>
          <p className="text-white/85 text-sm max-w-3xl">
            {ORG.fullName} ({ORG.shortName}) — {ORG.legalForm.toLowerCase()}, thành lập theo {ORG_DECISION_TEXT}.
          </p>
        </div>
      </section>

      {/* Sơ đồ khung */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <h2 className="type-section-title text-slate-900 dark:text-white">Sơ đồ tổ chức</h2>
        <div className="flex flex-col items-center gap-3 text-center">
          {["Đại hội Hội viên", "Ban Chấp hành", "Ban Thường vụ · Chủ tịch · Phó Chủ tịch", "Văn phòng Hiệp hội"].map((level, i) => (
            <React.Fragment key={level}>
              {i > 0 && <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" aria-hidden="true" />}
              <div className="w-full max-w-md rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-bold text-brand-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-200">
                {level}
              </div>
            </React.Fragment>
          ))}
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
          <div className="w-full max-w-md rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold text-white">
            {BACLINK_COMMITTEES.length} ban chuyên môn · 4 khối hoạt động
          </div>
        </div>
      </section>

      {/* 9 ban theo 4 khối */}
      <section id="cac-ban" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        {blocks.map((block) => {
          const items = BACLINK_COMMITTEES.filter((c) => c.block === block);
          return (
            <div key={block} className="space-y-3">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
                <Layers className="size-5 text-brand-600 dark:text-cyan-400" aria-hidden="true" />
                Khối {COMMITTEE_BLOCKS[block]}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <article
                    key={c.code}
                    id={c.code.toLowerCase()}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      <Link href={`/gioi-thieu/co-cau-to-chuc/${c.code.toLowerCase()}`} className="hover:text-brand-700 hover:underline dark:hover:text-cyan-300">{c.name}</Link>
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{c.functions}</p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Users className="size-3.5" aria-hidden="true" />
                      Trưởng ban: {c.head ?? "Đang cập nhật"}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          );
        })}

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <Landmark className="size-4 shrink-0" aria-hidden="true" />
            Muốn tham gia hoạt động của một ban? Liên hệ Văn phòng Hiệp hội để được kết nối.
          </span>
          <Link
            href="/lien-he#dau-moi-cac-ban"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600"
          >
            <Mail className="size-4" aria-hidden="true" /> Liên hệ đầu mối các ban
          </Link>
        </div>
      </section>
    </main>
  );
}
