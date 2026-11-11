"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  Kanban,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  PlusCircle,
  Cpu,
  Clock,
  Layers,
  Building2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Flame,
  Handshake,
} from "lucide-react";
import { brokerageApi } from "@/services/api/brokerage";
import { ConnectionRequest, Opportunity } from "@/types/brokerage";
import { authClient, UserContext } from "@/lib/auth-client";
import QuickDemandModal from "@/components/demand/QuickDemandModal";

interface DemandItem {
  id?: string;
  itemCode: string;
  stageName: string;
  technicalProblem: string;
  desiredSolution?: string;
  sectorCode: string;
  budgetRange: string;
  tniScore: number;
  tniClassification: string;
  matchingCount?: number;
  status: string;
  createdAt?: string;
}

export function BuyerDashboard({ user }: { user: UserContext | null }) {
  const [isLoading, setIsLoading] = useState(true);
  const [demands, setDemands] = useState<DemandItem[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [radarMatchCount, setRadarMatchCount] = useState<number>(0);
  const [isQuickDemandOpen, setIsQuickDemandOpen] = useState(false);

  const loadBuyerData = async () => {
    setIsLoading(true);
    try {
      const token = authClient.getToken();
      const demandFetchInit: RequestInit | undefined = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      const [demandsRes, opps, radarSummary] = await Promise.all([
        fetch("/api/v1/buyer/demands", demandFetchInit)
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
        brokerageApi.getOpportunities().catch(() => []),
        brokerageApi.getRadarSummary().catch(() => ({ totalCount: 0 })),
      ]);

      const safeDemands = Array.isArray(demandsRes)
        ? demandsRes
        : Array.isArray((demandsRes as any)?.data)
        ? (demandsRes as any).data
        : [];
      const safeOpps = Array.isArray(opps)
        ? opps
        : Array.isArray((opps as any)?.data)
        ? (opps as any).data
        : [];

      setDemands(safeDemands);
      setOpportunities(safeOpps);
      setRadarMatchCount(radarSummary?.totalCount ?? 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBuyerData();
  }, []);

  const safeDemandsList = Array.isArray(demands) ? demands : [];
  const safeOppsList = Array.isArray(opportunities) ? opportunities : [];

  const closedDemandStatuses = new Set(["CLOSED", "COMPLETED", "REJECTED", "CANCELLED"]);
  const openDemands = safeDemandsList.filter(
    (d) => !d.status || !closedDemandStatuses.has(d.status.toUpperCase())
  );
  const activeOpportunities = safeOppsList.filter((o) =>
    ["INITIATED", "NEGOTIATING", "MOU_SIGNED"].includes(o.stage)
  );
  const signedMous = safeOppsList.filter((o) => o.stage === "MOU_SIGNED" || o.stage === "COMPLETED");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. EXECUTIVE WORKSPACE BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-700 text-white p-6 sm:p-8 shadow-xl shadow-brand-950/15 border border-brand-800/40">
        <div
          aria-hidden="true"
          className="innovation-hero-art pointer-events-none absolute inset-0 opacity-80"
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold text-teal-200">
              <ShoppingBag className="w-3.5 h-3.5 text-teal-300" />
              <span>Trung Tâm Điều Hành Mua Sắm & Đổi Mới Công Nghệ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Xin chào, {user?.fullName || "Doanh Nghiệp Đổi Mới"}!
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Quản trị bài toán kỹ thuật, kết nối nhà cung ứng công nghệ, theo dõi tiến trình thử nghiệm và ký kết MOU chuyển giao giải pháp.
            </p>
          </div>

          {/* 3 Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsQuickDemandOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-brand-700 text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-brand-700" />
              <span>+ Khai Báo Bài Toán Nhanh</span>
            </button>

            <Link
              href="/khao-sat-nhu-cau"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-sm transition"
            >
              <FileCheck2 className="w-4 h-4 text-teal-300" />
              <span>Khảo Sát Nhu Cầu (TNI 4 Bước)</span>
            </Link>

            <Link
              href="/portal/matching/radar"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-sm transition"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Radar Ghép Nối AI</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. KPI METRICS CARDS (INTERACTIVE LIVING LINKS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Bài toán đang mở */}
        <Link
          href="/portal/buyer/demands"
          className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-brand-500/60 dark:hover:border-brand-500/60 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-cyan-300 flex items-center justify-center font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Nhu Cầu Đang Tìm Cung
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {isLoading ? "..." : openDemands.length}
            </div>
            <span className="text-xs text-brand-600 dark:text-cyan-400 font-semibold mt-1 block">
              Quản lý nhu cầu &amp; đơn hàng &rarr;
            </span>
          </div>
        </Link>

        {/* KPI 2: Giải pháp AI gợi ý */}
        <Link
          href="/portal/matching/radar"
          className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-teal-500/60 dark:hover:border-teal-500/60 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Giải Pháp AI Gợi Ý
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {isLoading ? "..." : radarMatchCount}
            </div>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-1 block">
              Khám phá giải pháp tương thích &rarr;
            </span>
          </div>
        </Link>

        {/* KPI 3: Giao dịch đang đàm phán */}
        <Link
          href="/portal/opportunities/pipeline"
          className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-amber-500/60 dark:hover:border-amber-500/60 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
              <Kanban className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Giao Dịch Đang Đàm Phán
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {isLoading ? "..." : activeOpportunities.length}
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
              Vào Deal Room đàm phán &rarr;
            </span>
          </div>
        </Link>

        {/* KPI 4: Thỏa thuận đã ký MOU */}
        <Link
          href="/portal/opportunities/pipeline"
          className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Thỏa Thuận Đã Ký MOU
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {isLoading ? "..." : signedMous.length}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              Xem tiến trình thử nghiệm &rarr;
            </span>
          </div>
        </Link>
      </div>

      {/* 3. DUAL WORKSPACE GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* WIDGET 1: DEALS ACTIVE (TIẾN TRÌNH HỢP TÁC & MOU) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                <Kanban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Tiến Trình Thương Thảo & Deal Room
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Các thương vụ đang kết nối và đàm phán 1-1 với Viện - Trường
                </p>
              </div>
            </div>
            <Link
              href="/portal/opportunities/pipeline"
              className="text-xs font-bold text-brand-700 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              Xem tất cả &rarr;
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : activeOpportunities.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                <Handshake className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chưa có thương vụ hợp tác nào trong phễu
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Khám phá các công nghệ sẵn sàng trên Radar để gửi yêu cầu kết nối đầu tiên.
                </p>
                <Link
                  href="/portal/matching/radar"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition shadow-sm mt-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Khám Phá Radar AI
                </Link>
              </div>
            ) : (
              activeOpportunities.slice(0, 3).map((opp) => (
                <div
                  key={opp.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-4 hover:border-brand-500 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-brand-700 dark:text-cyan-400">
                        {opp.opportunityCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                        {opp.stage}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {opp.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Đối tác: <strong>{opp.sellerOrgName}</strong> • {opp.estimatedValueMillionVnd ? `${opp.estimatedValueMillionVnd.toLocaleString('vi-VN')} Tr VNĐ` : 'Thương lượng'}
                    </p>
                  </div>

                  <Link
                    href={`/portal/opportunities/${opp.id}/deal-room`}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
                  >
                    Vào Deal Room &rarr;
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* WIDGET 2: BÀI TOÁN KỸ THUẬT MỚI NHẤT & TNI */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-cyan-300">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Nhu Cầu Đang Tìm Cung
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nhu cầu đổi mới đã công khai và số lượng giải pháp AI tìm thấy
                </p>
              </div>
            </div>
            <Link
              href="/portal/buyer/demands"
              className="text-xs font-bold text-brand-700 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              Quản lý tất cả &rarr;
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : demands.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chưa có bài toán kỹ thuật nào được đăng tải
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Khai báo bài toán hoặc khảo sát TNI để hệ thống AI tự động quét giải pháp phù hợp.
                </p>
                <button
                  onClick={() => setIsQuickDemandOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm mt-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> + Đăng Bài Toán Ngay
                </button>
              </div>
            ) : (
              demands.slice(0, 3).map((d) => (
                <div
                  key={d.itemCode || d.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-4 hover:border-brand-500 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-brand-700 dark:text-cyan-400">
                        {d.itemCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                        TNI: {d.tniScore}/100
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {d.technicalProblem}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Công đoạn: <strong>{d.stageName}</strong> • {d.budgetRange || "Chưa xác định"}
                    </p>
                  </div>

                  <Link
                    href={`/portal/matching/radar?demandCode=${d.itemCode}`}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 shadow-xs transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400" />
                    <span>Xem Radar</span>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Demand Modal */}
      <QuickDemandModal
        isOpen={isQuickDemandOpen}
        onClose={() => setIsQuickDemandOpen(false)}
        onSuccess={() => {
          setIsQuickDemandOpen(false);
          loadBuyerData();
        }}
      />
    </div>
  );
}
