"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import { cmsClient, DOC_TYPE_LABEL, type CmsDocument } from "@/lib/cms-client";
import { openContactModal } from "@/lib/contact-client";
import { DocumentList } from "@/components/cms/cms-document-list";

const ALL = "all";
const DOC_TYPES = Object.keys(DOC_TYPE_LABEL);

function TaiLieuContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("loai") ?? ALL;
  const loai = DOC_TYPES.includes(raw) ? raw : ALL;

  const [draft, setDraft] = useState("");
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<CmsDocument[]>([]);
  const [state, setState] = useState<AsyncState>("loading");

  const load = useCallback(() => {
    setState("loading");
    cmsClient
      .documents({ type: loai === ALL ? undefined : loai, q: keyword || undefined })
      .then((docs) => {
        setItems(docs);
        setState(docs.length ? "success" : "empty");
      })
      .catch(() => setState("error"));
  }, [loai, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  const filters = [{ value: ALL, label: "Tất cả" }, ...DOC_TYPES.map((v) => ({ value: v, label: DOC_TYPE_LABEL[v] }))];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="workspace-banner px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-2">
          <Link href="/chinh-sach" className="text-xs text-white/75 hover:text-white">← Chính sách & tri thức</Link>
          <h1 className="type-page-title text-white">Kho tài liệu</h1>
          <p className="text-sm text-white/85">Tài liệu, biểu mẫu và báo cáo do Hiệp hội công bố để hội viên tải về.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setKeyword(draft.trim());
          }}
          className="flex gap-2"
        >
          <label htmlFor="tai-lieu-q" className="sr-only">Tìm tài liệu</label>
          <input
            id="tai-lieu-q"
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tìm theo tên tài liệu…"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm tài liệu"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800"
          >
            <Search className="size-4" aria-hidden="true" /> Tìm
          </button>
        </form>

        <nav aria-label="Lọc theo loại tài liệu" className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = f.value === loai;
            return (
              <Link
                key={f.value}
                href={f.value === ALL ? "/tai-lieu" : `/tai-lieu?loai=${f.value}`}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded-full bg-brand-700 px-3 py-1.5 text-xs font-bold text-white"
                    : "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }
              >
                {f.label}
              </Link>
            );
          })}
        </nav>

        <Async
          state={state}
          onRetry={load}
          emptyTitle="Chưa có tài liệu"
          emptyMessage="Tài liệu sẽ được Văn phòng Hiệp hội cập nhật. Cần tài liệu cụ thể? Gửi yêu cầu."
          emptyAction={{ label: "Gửi yêu cầu", onClick: () => openContactModal("GENERAL") }}
        >
          <h2 className="sr-only">Danh sách tài liệu</h2>
          <DocumentList docs={items} />
        </Async>
      </div>
    </main>
  );
}

export default function TaiLieuPage() {
  return (
    <Suspense fallback={null}>
      <TaiLieuContent />
    </Suspense>
  );
}
