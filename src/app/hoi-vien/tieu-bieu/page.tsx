"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import { membershipClient, type FeaturedMember } from "@/lib/membership-client";

/** CR-BACLINK-008 · REQ-BL08-MEMBER-PUBLIC-006 — Hội viên tiêu biểu do Ban Quản trị chọn (không tự suy diễn). */
export default function HoiVienTieuBieuPage() {
  const [items, setItems] = useState<FeaturedMember[]>([]);
  const [state, setState] = useState<AsyncState>("loading");
  const load = () => {
    setState("loading");
    membershipClient.featured(24).then((r) => { setItems(r); setState(r.length ? "success" : "empty"); }).catch(() => setState("error"));
  };
  useEffect(load, []);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="workspace-banner px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-2">
          <Link href="/hoi-vien" className="text-xs text-white/75 hover:text-white">← Hội viên</Link>
          <h1 className="type-page-title text-white">Hội viên tiêu biểu</h1>
          <p className="text-sm text-white/85">Doanh nghiệp hội viên đang hiệu lực, do Ban Quản trị Hiệp hội lựa chọn giới thiệu.</p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Async state={state} onRetry={load} emptyTitle="Chưa có hội viên tiêu biểu" emptyMessage="Danh sách sẽ được Ban Quản trị cập nhật. Xem toàn bộ tại Danh bạ hội viên.">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((m) => (
              <li key={m.enterpriseId}>
                <Link href={m.taxCode ? `/enterprises/${m.taxCode}` : "/enterprises"} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <Award className="size-6 text-amber-500" aria-hidden="true" />
                  <span className="mt-2 font-bold text-slate-900 dark:text-white">{m.name}</span>
                  <span className="mt-1 text-xs text-slate-500">{m.sectorName}</span>
                  <span className="mt-auto pt-3 text-[11px] font-semibold text-brand-700 dark:text-cyan-300">{m.tierName}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Async>
        <div className="mt-6"><Link href="/enterprises" className="text-sm font-bold text-brand-700 hover:underline dark:text-cyan-300">Xem toàn bộ Danh bạ hội viên →</Link></div>
      </div>
    </main>
  );
}
