import React from "react";
import { Download, FileText } from "lucide-react";
import { DOC_TYPE_LABEL, type CmsDocument } from "@/lib/cms-client";

/** Chuyển "2025-06-27" hoặc "2025-06-27T..." thành "27/06/2025"; không hợp lệ → null. */
export function formatIssuedOn(iso?: string | null): string | null {
  const m = iso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null;
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
}

/** Mới nhất trước; tài liệu thiếu ngày ban hành xếp sau cùng. */
export function sortByIssuedDesc<T extends { issuedOn?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.issuedOn ?? "").localeCompare(a.issuedOn ?? ""));
}

/** Lưới thẻ tài liệu, mỗi thẻ có nút "Tải về" mở tệp ở tab mới. */
export function DocumentList({ docs, showType = true }: { docs: CmsDocument[]; showType?: boolean }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {docs.map((d) => {
        const issued = formatIssuedOn(d.issuedOn);
        return (
          <li
            key={d.id}
            className="flex h-full min-w-0 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <FileText className="size-6 text-brand-600 dark:text-cyan-400" aria-hidden="true" />
            {showType && (
              <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-cyan-300">
                {DOC_TYPE_LABEL[d.docType] ?? d.docType}
              </span>
            )}
            <h3 className="break-words font-bold text-slate-900 dark:text-white">{d.title}</h3>
            {d.description && (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{d.description}</p>
            )}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
              {issued ? (
                <span className="text-xs text-slate-500 dark:text-slate-400">Ban hành: {issued}</span>
              ) : (
                <span />
              )}
              <a
                href={d.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Tải về: ${d.title}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-3 py-2 text-xs font-bold text-white hover:bg-brand-800"
              >
                <Download className="size-4" aria-hidden="true" /> Tải về
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
