"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Building2, Calendar, Cpu, Handshake, MapPin, ShoppingCart, TrendingUp } from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import { fetchPublicOffers } from "@/services/api/technology-offer";
import { portalClient, type TechmartEvent } from "@/lib/portal-client";
import { PageHero, ACCENTS } from "@/components/common/page-hero";
import { openContactModal } from "@/lib/contact-client";

type TabKey = "mua-hang" | "san-pham" | "doi-tac-cong-nghe" | "ket-noi-b2b" | "dau-tu";
type Item = { key: string; href: string; title: string; meta: string; extra?: string };

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; hint: string }[] = [
  { key: "mua-hang", label: "Nhu cầu mua hàng & tìm nhà cung cấp", icon: ShoppingCart, hint: "Bài toán đặt hàng, gia công của doanh nghiệp và tập đoàn đang tìm nhà cung cấp." },
  { key: "san-pham", label: "Sản phẩm & năng lực doanh nghiệp", icon: Building2, hint: "Sản phẩm, dây chuyền, năng lực sản xuất do hội viên đăng." },
  { key: "doi-tac-cong-nghe", label: "Tìm đối tác công nghệ", icon: Cpu, hint: "Công nghệ, giải pháp có thể chuyển giao hoặc hợp tác triển khai." },
  { key: "ket-noi-b2b", label: "Chương trình kết nối B2B", icon: Handshake, hint: "Phiên kết nối, hội chợ, hội thảo giao thương sắp diễn ra." },
  { key: "dau-tu", label: "Cơ hội đầu tư & hợp tác", icon: TrendingUp, hint: "Cơ hội đầu tư, liên doanh, hợp tác chiến lược do Hiệp hội giới thiệu." },
];

async function loadTab(tab: TabKey): Promise<Item[]> {
  switch (tab) {
    case "mua-hang": {
      const list = await portalClient.getPublicDemands({ limit: 30 });
      return list.map((d: Record<string, string | undefined>) => ({
        key: String(d.id),
        href: `/nhu-cau-cong-nghe/${d.id}`,
        title: d.technicalProblem || d.stageName || "Nhu cầu mua hàng",
        meta: [d.itemCode, d.province].filter(Boolean).join(" · "),
        extra: d.budgetRange ? `Ngân sách dự kiến: ${d.budgetRange}` : undefined,
      }));
    }
    case "san-pham":
    case "doi-tac-cong-nghe": {
      const r = await fetchPublicOffers({ limit: 30, ...(tab === "doi-tac-cong-nghe" ? { hasTechTransfer: true } : {}) });
      return r.data.map((o) => ({
        key: o.id,
        href: `/chao-ban-cong-nghe/${o.id}`,
        title: o.title,
        meta: [o.enterpriseName, o.sectorName].filter(Boolean).join(" · "),
        extra: o.summary || undefined,
      }));
    }
    case "ket-noi-b2b": {
      const r = await portalClient.listEvents("UPCOMING", 1, 20);
      return r.data.map((e: TechmartEvent) => ({
        key: e.id,
        href: "/trien-lam",
        title: e.title,
        meta: `${new Date(e.startDate).toLocaleDateString("vi-VN")} · ${e.location}`,
      }));
    }
    default:
      return []; // Chưa có nguồn dữ liệu cơ hội đầu tư: hiển thị "Đang cập nhật", không bịa nội dung.
  }
}

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = (TABS.find((t) => t.key === params.get("loai"))?.key ?? "mua-hang") as TabKey;
  const [items, setItems] = useState<Item[]>([]);
  const [state, setState] = useState<AsyncState>("loading");

  const load = useCallback(() => {
    setState("loading");
    loadTab(tab)
      .then((r) => { setItems(r); setState(r.length ? "success" : "empty"); })
      .catch(() => setState("error"));
  }, [tab]);
  useEffect(load, [load]);

  const active = TABS.find((t) => t.key === tab)!;

  return (
    <main className="min-h-screen bg-slate-50 pb-14 dark:bg-slate-950">
      <PageHero
        eyebrow="Cơ hội kinh doanh"
        title="Cơ hội kinh doanh"
        desc="Nơi doanh nghiệp tìm khách hàng, nhà cung cấp, đối tác công nghệ và chương trình kết nối do Hiệp hội tổ chức."
        chips={[{ icon: ShoppingCart, label: "Nhu cầu mua hàng" }, { icon: Cpu, label: "Đối tác công nghệ" }, { icon: Handshake, label: "Kết nối B2B" }]}
      />

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <div role="tablist" aria-label="Loại cơ hội" className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Ic = t.icon;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                type="button"
                onClick={() => router.replace(`/co-hoi-kinh-doanh?loai=${t.key}`, { scroll: false })}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${tab === t.key ? "bg-brand-700 text-white shadow-md shadow-brand-700/25" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand-400 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700"}`}
              >
                <Ic className="size-4" aria-hidden="true" /> {t.label}
              </button>
            );
          })}
        </div>
        <p className="rounded-xl border-l-4 border-amber-400 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">{active.hint}</p>

        <Async
          state={state}
          onRetry={load}
          emptyContent={
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="font-bold">Đang cập nhật</p>
              <p className="mt-1 text-sm text-slate-500">
                {tab === "dau-tu"
                  ? "Hiệp hội chưa công bố cơ hội đầu tư nào. Doanh nghiệp có đề xuất hợp tác, kêu gọi đầu tư có thể gửi thông tin để Văn phòng đăng tải."
                  : "Hiện chưa có mục nào trong nhóm này."}
              </p>
              <button type="button" onClick={() => openContactModal("PARTNERSHIP", `Tôi muốn đăng thông tin (${active.label}): `)} className="mt-4 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white">
                Gửi thông tin cho Văn phòng
              </button>
            </div>
          }
        >
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((i, idx) => {
              const ac = ACCENTS[idx % ACCENTS.length];
              const Tic = active.icon;
              return (
              <li key={i.key}>
                <Link href={i.href} className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 ${ac.ring}`}>
                  <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${ac.bar}`} />
                  <div className="flex items-center gap-2">
                    <span className={`grid size-9 place-items-center rounded-xl ${ac.chip}`}><Tic className="size-4" aria-hidden="true" /></span>
                    <span className="line-clamp-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">{i.meta.split(" · ")[0]}</span>
                  </div>
                  <h2 className="mt-3 font-extrabold text-slate-900 group-hover:text-brand-700 line-clamp-3 dark:text-white">{i.title}</h2>
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    {tab === "ket-noi-b2b" ? <Calendar className="size-3.5" aria-hidden="true" /> : <MapPin className="size-3.5" aria-hidden="true" />}
                    <span className="line-clamp-1">{i.meta}</span>
                  </p>
                  {i.extra && <p className="mt-2 flex-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 line-clamp-3 dark:bg-emerald-950/40 dark:text-emerald-300">{i.extra}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700 dark:text-cyan-300">Xem chi tiết <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              </li>
              );
            })}
          </ul>
        </Async>
      </div>
    </main>
  );
}

/** CR-BACLINK-010 · REQ-BL10-OPPS-002 — Trang gộp "Cơ hội kinh doanh" theo góp ý khách hàng (Menu 4). */
export default function CoHoiKinhDoanhPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
