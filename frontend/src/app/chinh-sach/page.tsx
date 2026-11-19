"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { type AsyncState } from "@/components/ui/async";
import { cmsClient, KNOWLEDGE_SECTIONS, type CmsArticleSummary, type CmsDocument } from "@/lib/cms-client";
import { formatIssuedOn, sortByIssuedDesc } from "@/components/cms/cms-document-list";

type KnowledgeSectionConfig = (typeof KNOWLEDGE_SECTIONS)[number];

/** Một mục của hub: tải độc lập, lỗi của mục này không ảnh hưởng mục khác. */
function KnowledgeSection({ section }: { section: KnowledgeSectionConfig }) {
  const [status, setStatus] = useState<AsyncState>("loading");
  const [articles, setArticles] = useState<CmsArticleSummary[]>([]);
  const [docs, setDocs] = useState<CmsDocument[]>([]);

  const load = useCallback(() => {
    setStatus("loading");
    if (section.kind === "article") {
      cmsClient
        .articles({ category: section.category, limit: 3 })
        .then((r) => {
          setArticles(r.data.slice(0, 3));
          setStatus(r.data.length ? "success" : "empty");
        })
        .catch(() => setStatus("error"));
      return;
    }
    const types = typeof section.docType === "string" ? [section.docType] : [...section.docType];
    Promise.allSettled(types.map((type) => cmsClient.documents({ type }))).then((results) => {
      if (results.every((r) => r.status === "rejected")) {
        setStatus("error");
        return;
      }
      const merged = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      const top = sortByIssuedDesc(merged).slice(0, 3);
      setDocs(top);
      setStatus(top.length ? "success" : "empty");
    });
  }, [section]);

  useEffect(() => {
    load();
  }, [load]);

  const headingId = `knowledge-${section.key}`;
  const viewAllHref =
    section.kind === "article"
      ? `/tin-tuc?category=${section.category}`
      : `/tai-lieu?loai=${typeof section.docType === "string" ? section.docType : section.docType[0]}`;

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="text-base font-extrabold text-slate-900 dark:text-white">
          {section.title}
        </h2>
        <Link href={viewAllHref} className="shrink-0 text-xs font-bold text-brand-700 hover:underline dark:text-cyan-300">
          Xem tất cả →
        </Link>
      </div>

      {status === "loading" && <p className="text-sm text-slate-500 dark:text-slate-400" aria-busy="true">Đang tải…</p>}

      {status === "error" && (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-rose-700 dark:text-rose-300">
          <span>Chưa tải được mục này.</span>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-bold hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/40"
          >
            Thử lại
          </button>
        </div>
      )}

      {status === "empty" && <p className="text-sm text-slate-500 dark:text-slate-400">Đang cập nhật</p>}

      {status === "success" && section.kind === "article" && (
        <ul className="space-y-2">
          {articles.map((a) => (
            <li key={a.id} className="text-sm">
              <Link href={`/tin-tuc/${a.slug}`} className="font-semibold text-slate-900 hover:text-brand-700 hover:underline dark:text-white dark:hover:text-cyan-300">
                {a.title}
              </Link>
              {formatIssuedOn(a.publishedAt) && (
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{formatIssuedOn(a.publishedAt)}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {status === "success" && section.kind === "document" && (
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id} className="text-sm">
              <a
                href={d.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Tải về: ${d.title}`}
                className="font-semibold text-slate-900 hover:text-brand-700 hover:underline dark:text-white dark:hover:text-cyan-300"
              >
                {d.title}
              </a>
              {formatIssuedOn(d.issuedOn) && (
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{formatIssuedOn(d.issuedOn)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Hub "Chính sách & tri thức": bảy mục, mỗi mục lấy từ CMS (không bịa nội dung). */
export default function ChinhSachPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="workspace-banner px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-2">
          <h1 className="type-page-title text-white">Chính sách & tri thức</h1>
          <p className="text-sm text-white/85">Chính sách mới, giải thích chính sách, báo cáo, dữ liệu và biểu mẫu dành cho hội viên.</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        {KNOWLEDGE_SECTIONS.map((s) => (
          <KnowledgeSection key={s.key} section={s} />
        ))}
      </div>
    </main>
  );
}
