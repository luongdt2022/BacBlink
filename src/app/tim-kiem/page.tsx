"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import { runSearch, type Group } from "@/lib/site-search";

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const q = (params.get("q") ?? "").trim();
  const [input, setInput] = useState(q);
  const [groups, setGroups] = useState<Group[]>([]);
  const [state, setState] = useState<AsyncState>("idle");

  useEffect(() => {
    setInput(q);
    if (q.length < 2) {
      setState("idle");
      return;
    }
    let alive = true;
    setState("loading");
    runSearch(q)
      .then((g) => {
        if (!alive) return;
        setGroups(g);
        setState(g.some((x) => x.hits.length) ? "success" : "empty");
      })
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (v) router.push(`/tim-kiem?q=${encodeURIComponent(v)}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="workspace-banner text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="type-page-title text-white">Tìm kiếm trên cổng BACLINK</h1>
          <form onSubmit={submit} role="search" className="flex gap-2">
            <label htmlFor="q" className="sr-only">Từ khóa</label>
            <input
              id="q"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tên doanh nghiệp, sản phẩm, nhu cầu, sự kiện..."
              className="flex-1 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#042142] shadow-md hover:bg-slate-100">
              <Search className="size-4" aria-hidden="true" /> Tìm
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state === "idle" ? (
          <p className="text-sm text-slate-500">Nhập tối thiểu 2 ký tự để tìm doanh nghiệp, cơ hội kinh doanh, sự kiện và tin tức.</p>
        ) : (
          <Async
            state={state}
            emptyIcon="search"
            emptyTitle={`Không tìm thấy kết quả cho “${q}”`}
            emptyMessage="Thử từ khóa ngắn hơn hoặc gửi yêu cầu để Văn phòng Hiệp hội hỗ trợ tìm đối tác."
            errorMessage="Không tải được kết quả tìm kiếm."
          >
            <div className="space-y-6">
              {groups
                .filter((g) => g.hits.length > 0)
                .map((g) => {
                  const Icon = g.icon;
                  return (
                    <section key={g.key} aria-label={g.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
                          <Icon className="size-5 text-brand-600" aria-hidden="true" /> {g.label}
                          <span className="text-xs font-semibold text-slate-500">({g.hits.length})</span>
                        </h2>
                        {g.moreHref && <Link href={g.moreHref} className="text-xs font-bold text-brand-700 hover:underline dark:text-cyan-300">Xem tất cả →</Link>}
                      </div>
                      <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                        {g.hits.map((h, i) => (
                          <li key={`${h.href}-${i}`} className="py-2.5">
                            <Link href={h.href} className="font-semibold text-sm text-slate-900 hover:text-brand-700 dark:text-white dark:hover:text-cyan-300">{h.title}</Link>
                            {h.meta && <p className="text-xs text-slate-500">{h.meta}</p>}
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
            </div>
          </Async>
        )}
      </div>
    </main>
  );
}

/** CR-BACLINK-008 · T-00.BL08.07 · REQ-BL08-SEARCH-004 */
export default function TimKiemPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
