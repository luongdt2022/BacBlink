"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, PlayCircle, X } from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import { cmsClient, type CmsMedia } from "@/lib/cms-client";

/** Thư viện ảnh & video theo album. Video chỉ mở liên kết, không nhúng iframe. */
export default function ThuVienPage() {
  const [items, setItems] = useState<CmsMedia[]>([]);
  const [state, setState] = useState<AsyncState>("loading");
  const [lightbox, setLightbox] = useState<CmsMedia | null>(null);

  const load = useCallback(() => {
    setState("loading");
    cmsClient
      .media()
      .then((list) => {
        setItems([...list].sort((a, b) => a.sortOrder - b.sortOrder));
        setState(list.length ? "success" : "empty");
      })
      .catch(() => setState("error"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const albums = useMemo(() => {
    const map = new Map<string, CmsMedia[]>();
    items.forEach((m) => map.set(m.album, [...(map.get(m.album) ?? []), m]));
    return [...map.entries()];
  }, [items]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="workspace-banner px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-2">
          <Link href="/tin-tuc" className="text-xs text-white/75 hover:text-white">← Tin tức</Link>
          <h1 className="type-page-title text-white">Thư viện ảnh & video</h1>
          <p className="text-sm text-white/85">Hình ảnh và video các hoạt động của Hiệp hội, sắp xếp theo album.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Async
          state={state}
          onRetry={load}
          emptyContent={
            <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="font-bold text-slate-900 dark:text-white">Chưa có ảnh/video</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Hình ảnh và video hoạt động sẽ được đăng cùng các tin tức.</p>
              <Link href="/tin-tuc" className="inline-flex text-sm font-bold text-brand-700 hover:underline dark:text-cyan-300">
                Xem tin tức →
              </Link>
            </div>
          }
        >
          <div className="space-y-10">
            {albums.map(([album, list], idx) => (
              <section key={album} aria-labelledby={`album-${idx}`} className="space-y-4">
                <h2 id={`album-${idx}`} className="type-section-title text-slate-900 dark:text-white">{album}</h2>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {list.map((m) =>
                    m.kind === "IMAGE" ? (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => setLightbox(m)}
                          aria-label={`Phóng to ảnh: ${m.title ?? album}`}
                          className="block w-full overflow-hidden rounded-xl border border-slate-200 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-800 dark:bg-slate-900"
                        >
                          <img
                            src={m.thumbnailUrl ?? m.url}
                            alt={m.title ?? album}
                            loading="lazy"
                            className="aspect-square w-full object-cover"
                          />
                        </button>
                      </li>
                    ) : (
                      <li
                        key={m.id}
                        className="flex min-w-0 flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-start gap-2">
                          <PlayCircle className="size-5 shrink-0 text-brand-600 dark:text-cyan-400" aria-hidden="true" />
                          <p className="break-words text-sm font-semibold text-slate-900 dark:text-white">{m.title ?? "Video"}</p>
                        </div>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Mở video: ${m.title ?? album}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:underline dark:text-cyan-300"
                        >
                          Mở video <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </section>
            ))}
          </div>
        </Async>
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title ?? lightbox.album}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Đóng ảnh"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
          <img
            src={lightbox.url}
            alt={lightbox.title ?? lightbox.album}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </main>
  );
}
