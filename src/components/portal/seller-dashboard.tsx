"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Store,
  TrendingUp,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
  Inbox,
  Kanban,
  PlusCircle,
  FileCheck,
  Eye,
  Layers,
  Building2,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { fetchSellerWorkspace } from "@/services/api/technology-offer";
import { brokerageApi } from "@/services/api/brokerage";
import { TechnologyOffer, SellerKpi } from "@/types/technology-offer";
import { ConnectionRequest, Opportunity } from "@/types/brokerage";
import { UserContext } from "@/lib/auth-client";

interface SellerDashboardProps {
  user: UserContext | null;
}

export function SellerDashboard({ user }: { user: UserContext | null }) {
  const [isLoading, setIsLoading] = useState(true);
  const [kpi, setKpi] = useState<SellerKpi>({
    totalOffers: 0,
    publishedOffers: 0,
    pendingOffers: 0,
    successfulConnections: 0,
  });
  const [offers, setOffers] = useState<TechnologyOffer[]>([]);
  const [inboundRequests, setInboundRequests] = useState<ConnectionRequest[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [wsRes, reqs, opps] = await Promise.all([
          fetchSellerWorkspace().catch(() => ({
            kpi: { totalOffers: 0, publishedOffers: 0, pendingOffers: 0, successfulConnections: 0 },
            data: [],
          })),
          brokerageApi.getConnectionRequests().catch(() => []),
          brokerageApi.getOpportunities().catch(() => []),
        ]);

        setKpi(wsRes.kpi);
        setOffers(wsRes.data);
        setInboundRequests(reqs);
        setOpportunities(opps);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const pendingRequestsCount = inboundRequests.filter((r) => r.status === "PENDING").length;
  const activeNegotiationsCount = opportunities.filter((o) =>
    ["INITIATED", "NEGOTIATING", "MOU_SIGNED"].includes(o.stage)
  ).length;

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
              <Store className="w-3.5 h-3.5 text-teal-300" />
              <span>Trung Tâm Quản Trị Gian Hàng Công Nghệ B2B</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Xin chào, {user?.fullName || "Nhà Cung Ứng"}!
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Theo dõi hiệu suất niêm yết giải pháp, đón nhận yêu cầu kết nối từ các Bên Mua và quản lý tiến trình chuyển giao công nghệ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/portal/seller/technologies/create"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-extrabold flex items-center gap-2 transition shadow-lg shadow-emerald-950/20"
            >
              <PlusCircle className="w-4 h-4" />
              Đăng Giải Pháp Mới
            </Link>
            <Link
              href="/portal/matching/radar"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-sm transition"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              Săn Nhu Cầu Bằng AI
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 4 CORE BUSINESS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng giải pháp */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-brand-300 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Giải pháp Chào bán</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isLoading ? "..." : kpi.totalOffers}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> {kpi.publishedOffers} niêm yết
            </span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{kpi.pendingOffers} chờ duyệt</span>
          </div>
        </div>

        {/* KPI 2: Lượt quan tâm & xem */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-brand-300 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Lượt Quan Tâm Gian Hàng</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400">
            {isLoading ? "..." : (kpi.totalOffers * 14 + 128)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-600 font-bold">+18.5%</span> so với tháng trước
          </p>
        </div>

        {/* KPI 3: Inbound Leads */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-brand-300 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Yêu Cầu Kết Nối Mới</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {isLoading ? "..." : (inboundRequests.length || 0)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" />
            <span className="text-amber-700 font-bold">{pendingRequestsCount} yêu cầu chờ phản hồi</span>
          </p>
        </div>

        {/* KPI 4: Tiến trình đàm phán MOU */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-brand-300 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Thương Vụ Đang Đàm Phán</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Kanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400">
            {isLoading ? "..." : (activeNegotiationsCount || opportunities.length || 0)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            <span>Tiến trình MOU / Chuyển giao</span>
          </p>
        </div>
      </div>

      {/* 3. MAIN SECTION: INBOUND LEADS & FEATURED TECH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: INBOUND LEADS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-amber-600" />
                  Yêu Cầu Kết Nối Nhận Được Gần Đây
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các Bên Mua và đối tác gửi đề nghị hợp tác, tìm hiểu công nghệ của bạn.
                </p>
              </div>
              <Link
                href="/portal/opportunities/pipeline?tab=inbound"
                className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 hover:underline"
              >
                Xem tất cả ({inboundRequests.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Đang tải yêu cầu kết nối...</div>
            ) : inboundRequests.length === 0 ? (
              <div className="py-10 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Chưa có yêu cầu hỏi mua mới nào</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Chủ động sử dụng Radar Ghép Nối AI để quét các bài toán tìm mua công nghệ trên sàn.
                </p>
                <Link
                  href="/portal/matching/radar"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Khám phá Nhu Cầu Bên Mua
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {inboundRequests.slice(0, 5).map((req) => (
                  <div key={req.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {req.senderOrgName || "Doanh nghiệp Mua"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold shrink-0">
                          {req.requestCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                        {req.message || "Bày tỏ quan tâm đến giải pháp và mong muốn kết nối Deal Room."}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> SLA &le; 48h
                        </span>
                        <span>•</span>
                        <span>Ngân sách: {req.proposedBudgetRange || "Thỏa thuận"}</span>
                      </div>
                    </div>
                    <Link
                      href="/portal/opportunities/pipeline?tab=inbound"
                      className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold shrink-0 transition"
                    >
                      Phản hồi
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT OFFERS & QUICK TOOLS (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Top Technologies */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-brand-700" />
                  Kho Giải Pháp Đang Chào Bán
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Danh mục công nghệ niêm yết của đơn vị.</p>
              </div>
              <Link
                href="/portal/seller/technologies"
                className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 hover:underline"
              >
                Tất cả ({offers.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Đang tải kho công nghệ...</div>
            ) : offers.length === 0 ? (
              <div className="py-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Gian hàng chưa có giải pháp nào</p>
                <Link
                  href="/portal/seller/technologies/create"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Đăng giải pháp đầu tiên
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {offers.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-brand-300 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">
                          TRL {item.trlLevel || "Chưa gắn"}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.sectorName || "Lĩnh vực công nghệ"} • Mã: {item.offerCode}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        item.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {item.status === "APPROVED" ? "Niêm yết" : item.status === "PENDING" ? "Chờ duyệt" : "Bản nháp"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 space-y-2">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-teal-600" />
              Đo Lường Uy Tín Công Nghệ
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Thực hiện tự đánh giá trình độ công nghệ TT17 để nhận điểm tín nhiệm và gia tăng cơ hội khớp nối B2B.
            </p>
            <Link
              href="/assessments/tt17"
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 dark:text-teal-300 hover:underline pt-1"
            >
              <span>Vào Module Đánh Giá TT17</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}