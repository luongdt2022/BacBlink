"use client";

import React, { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, Mail, Newspaper, FileText, Users } from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import { cmsClient, type CmsArticleSummary, type CmsDocument } from "@/lib/cms-client";
import { BACLINK_COMMITTEES, COMMITTEE_BLOCKS, type Committee } from "@/lib/constants/organization";
import { openContactModal } from "@/lib/contact-client";
import { DocumentList, formatIssuedOn, sortByIssuedDesc } from "@/components/cms/cms-document-list";

/** CR-BACLINK-008 · REQ-BL08-ABOUT-010 — chi tiết một ban chuyên môn. */
export default function CoCauToChucChiTietPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const committee = BACLINK_COMMITTEES.find((c) => c.code.toLowerCase() === code.toLowerCase());
  if (!committee) return notFound();
  return <CommitteeDetail committee={committee} />;
}

function CommitteeDetail({ committee }: { committee: Committee }) {
  const [articles, setArticles] = useState<CmsArticleSummary[]>([]);
  const [articleState, setArticleState] = useState<AsyncState>("loading");
  const [docs, setDocs] = useState<CmsDocument[]>([]);
  const [docState, setDocState] = useState<AsyncState>("loading");

  const loadArticles = useCallback(() => {
    setArticleState("loading");
    cmsClient
      .articles({ committee: committee.code, limit: 6 })
      .then((r) => {
        setArticles(r.data);
        setArticleState(r.data.length ? "success" : "empty");
      })
      .catch(() => setArticleState("error"));
  }, [committee.code]);

  const loadDocs = useCallback(() => {
    setDocState("loading");
    cmsClient
      .documents({ committee: committee.code })
      .then((list) => {
        const sorted = sortByIssuedDesc(list);
        setDocs(sorted);
        setDocState(sorted.length ? "success" : "empty");
      })
      .catch(() => setDocState("error"));
  }, [committee.code]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <section className="workspace-banner px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-3">
          <nav aria-label="Breadcrumb" className="text-xs text-white/70">
            <Link href="/" className="hover:text-white">Trang chủ</Link> /{" "}
            <Link href="/gioi-thieu" className="hover:text-white">Về BACLINK</Link> /{" "}
            <Link href="/gioi-thieu/co-cau-to-chuc" className="hover:text-white">Cơ cấu tổ chức</Link> /{" "}
            <span className="text-white" aria-current="page">{committee.name}</span>
          </nav>
          <h1 className="type-page-title break-words text-white">{committee.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-white/85">
            <Layers className="size-4" aria-hidden="true" /> Khối {COMMITTEE_BLOCKS[committee.block]}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <section aria-labelledby="chuc-nang" className="space-y-3">
          <h2 id="chuc-nang" className="type-section-title text-slate-900 dark:text-white">Chức năng</h2>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">{committee.functions}</p>
          <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <Users className="size-4" aria-hidden="true" />
            Trưởng ban: {committee.head ?? "Đang cập nhật"}
          </p>
        </section>

        <section aria-labelledby="bai-viet" className="space-y-4">
          <h2 id="bai-viet" className="type-section-title flex items-center gap-2 text-slate-900 dark:text-white">
            <Newspaper className="size-5" aria-hidden="true" /> Hoạt động của ban
          </h2>
          <Async
            state={articleState}
            onRetry={loadArticles}
            emptyTitle="Chưa có tin hoạt động"
            emptyMessage="Các hoạt động của ban sẽ được đăng tại mục tin tức."
          >
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => {
                const published = formatIssuedOn(a.publishedAt);
                return (
                  <li key={a.id} className="min-w-0">
                    <Link
                      href={`/tin-tuc/${a.slug}`}
                      className="flex h-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <span className="break-words font-bold text-slate-900 dark:text-white">{a.title}</span>
                      {a.excerpt && <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{a.excerpt}</span>}
                      {published && <span className="mt-auto pt-2 text-xs text-slate-500 dark:text-slate-400">{published}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Async>
        </section>

        <section aria-labelledby="tai-lieu" className="space-y-4">
          <h2 id="tai-lieu" className="type-section-title flex items-center gap-2 text-slate-900 dark:text-white">
            <FileText className="size-5" aria-hidden="true" /> Tài liệu của ban
          </h2>
          <Async
            state={docState}
            onRetry={loadDocs}
            emptyTitle="Chưa có tài liệu"
            emptyMessage="Tài liệu của ban sẽ được Văn phòng Hiệp hội cập nhật."
          >
            <DocumentList docs={docs} showType={false} />
          </Async>
        </section>

        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 sm:flex-row sm:items-center">
          <p>Muốn tham gia hoạt động của ban này?</p>
          <button
            type="button"
            onClick={() => openContactModal("GENERAL", `Tôi muốn liên hệ ${committee.name}: `)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600"
          >
            <Mail className="size-4" aria-hidden="true" /> Liên hệ ban này
          </button>
        </div>
      </div>
    </main>
  );
}
