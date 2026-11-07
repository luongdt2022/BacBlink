"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Check,
  Copy,
  Handshake,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { type EnterprisePublicDetail, type InnovationEvaluation } from "@/lib/enterprise-client";
import { type TechnologyOffer } from "@/types/technology-offer";
import { EnterpriseAvatar } from "@/components/common/enterprise-avatar";
import RadarChart from "@/components/RadarChart";
import { getTechnologyImage } from "@/lib/technology-media";
import { SectorBannerBackground } from "./SectorBannerBackground";
import { AppCard } from "@/components/ui/app-card";
import { AppBadge } from "@/components/ui/app-badge";
import { AppTabs } from "@/components/ui/app-tabs";
import { AppButton } from "@/components/ui/design-system";

interface InnovativeProfileProps {
  data: EnterprisePublicDetail;
  enterpriseOffers: TechnologyOffer[];
  offersLoading: boolean;
  innovationRating: InnovationEvaluation | null;
  innovationLoading: boolean;
  onOpenConnectModal: () => void;
}

export function InnovativeProfile({
  data,
  enterpriseOffers,
  offersLoading,
  innovationRating,
  innovationLoading,
  onOpenConnectModal,
}: InnovativeProfileProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "innovation" | "products" | "rd" | "ip" | "needs"
  >("overview");
  const [copiedTaxCode, setCopiedTaxCode] = useState(false);

  const handleCopyTaxCode = () => {
    if (typeof window !== "undefined" && data.taxCode) {
      navigator.clipboard.writeText(data.taxCode);
      setCopiedTaxCode(true);
      setTimeout(() => setCopiedTaxCode(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* PROFILE HERO BANNER CHUẨN BD-04 & NATIONAL INNOVATION HUB */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Sector Watermark Background Overlay */}
        <SectorBannerBackground
          sectorCode={data.sectorCode}
          sectorName={data.mainSectorName}
          opacity={0.15}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              <span>{data.provinceCity || "Toàn quốc"}</span>
            </span>
            <span className="bg-[#2D9A85]/80 backdrop-blur-md border border-[#2D9A85] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>DN Đổi Mới Sáng Tạo</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/enterprises"
              className="text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 border border-slate-700 px-3.5 py-1.5 rounded-xl transition"
            >
              ← Danh bạ
            </Link>
          </div>
        </div>

        {/* Profile Hero Body */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar Logo lớn: 112x112px (w-28 h-28), rounded-2xl, viền sáng */}
            <div className="w-28 h-28 rounded-2xl bg-white p-2 shadow-2xl border-2 border-white/20 shrink-0 relative group flex items-center justify-center">
              <EnterpriseAvatar
                name={data.name}
                sectorName={data.mainSectorName}
                sectorCode={data.sectorCode}
                website={data.website}
                size="lg"
              />
              {data.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-md"
                  title="Đã xác thực số hóa bởi Sở KH&CN / Viện NacenTech"
                >
                  <BadgeCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Titles & Meta */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-slate-800 text-teal-300 border border-slate-700">
                  {data.subjectType || "DN ĐMST"}
                </span>

                {/* Digital Verification Badge */}
                {data.isVerified ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Đã xác thực (Sở KH&amp;CN)</span>
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Chờ thẩm định</span>
                  </span>
                )}

                {data.tniClassification && (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full text-xs font-bold">
                    TNI: {data.tniClassification} ({data.tniScore?.toFixed(1) || "N/A"})
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {data.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-300">
                {/* Monospace TaxCode with 1-click copy */}
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-slate-400">MST:</span>
                  <span className="font-mono font-semibold tracking-wider text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700 select-all">
                    {data.taxCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTaxCode}
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    title={copiedTaxCode ? "Đã sao chép mã định danh" : "Sao chép MST"}
                  >
                    {copiedTaxCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {copiedTaxCode && (
                    <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                      Đã sao chép mã định danh
                    </span>
                  )}
                </div>

                <span>•</span>
                <span>
                  Trụ sở: <strong className="text-white">{data.provinceCity}</strong>
                </span>

                {data.addressDetail && (
                  <>
                    <span>•</span>
                    <span className="max-w-md truncate" title={data.addressDetail}>
                      {data.addressDetail}
                    </span>
                  </>
                )}

                {data.website && (
                  <>
                    <span>•</span>
                    <a
                      href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-300 hover:underline font-medium"
                    >
                      {data.website}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CTA Button Emerald #2D9A85 */}
          <div className="shrink-0 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={onOpenConnectModal}
              className="bg-[#2D9A85] hover:bg-[#247B6A] text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-emerald-900/40 transition active:scale-[0.98] flex items-center gap-2 text-sm"
            >
              <Handshake className="w-4 h-4 text-teal-200" />
              <span>Đặt Lịch Kết Nối R&amp;D</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar Scientific Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 text-sm font-medium overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex-1 min-w-[160px] py-4 text-center border-b-2 transition ${
              activeTab === "overview"
                ? "border-[#2D9A85] text-[#2D9A85] font-bold bg-teal-50/40"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            🏢 Tổng Quan Doanh Nghiệp
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("innovation")}
            className={`flex-1 min-w-[170px] py-4 text-center border-b-2 transition ${
              activeTab === "innovation"
                ? "border-[#2D9A85] text-[#2D9A85] font-bold bg-teal-50/40"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            ⭐ Năng Lực ĐMST
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex-1 min-w-[180px] py-4 text-center border-b-2 transition ${
              activeTab === "products"
                ? "border-[#2D9A85] text-[#2D9A85] font-bold bg-teal-50/40"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            📦 Sản Phẩm Chào Bán ({enterpriseOffers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rd")}
            className={`flex-1 min-w-[160px] py-4 text-center border-b-2 transition ${
              activeTab === "rd"
                ? "border-[#2D9A85] text-[#2D9A85] font-bold bg-teal-50/40"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            🔬 Năng Lực R&amp;D &amp; ĐMST
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ip")}
            className={`flex-1 min-w-[160px] py-4 text-center border-b-2 transition ${
              activeTab === "ip"
                ? "border-[#2D9A85] text-[#2D9A85] font-bold bg-teal-50/40"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            💡 Sở Hữu Trí Tuệ ({data.intellectualProperties?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("needs")}
            className={`flex-1 min-w-[160px] py-4 text-center border-b-2 transition ${
              activeTab === "needs"
                ? "border-[#2D9A85] text-[#2D9A85] font-bold bg-teal-50/40"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            🎯 Nhu Cầu &amp; Chuỗi Giá Trị
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* TAB: INNOVATION (RADAR CHART) */}
          {activeTab === "innovation" && (
            <div className="space-y-8">
              {/* Header Summary Banner */}
              <div className="relative overflow-hidden bg-brand-700 text-white rounded-2xl p-6 md:p-8 shadow-md border border-brand-800">
                <SectorBannerBackground
                  sectorCode={data.sectorCode}
                  sectorName={data.mainSectorName}
                  opacity={0.4}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold text-teal-300 border border-white/20">
                      <span>Bộ Tiêu Chí ĐMST Quốc Gia v1.0</span>
                      <span>•</span>
                      <span>Kỳ 2024</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white">
                      Hồ Sơ Năng Lực Đổi Mới Sáng Tạo
                    </h3>
                    <p className="text-xs md:text-sm text-white/85 max-w-xl leading-relaxed">
                      Đánh giá toàn diện trên 8 nhóm năng lực (37 tiêu chí chuẩn hóa, thang 100 điểm) theo Quyết định PO-DEC-20261014-03 của Cục ĐMST và Sở KH&amp;CN.
                    </p>
                  </div>

                  {/* Total Score & Tier Badge Card */}
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shrink-0 shadow-sm">
                    <div className="text-center">
                      <div className="text-xs uppercase tracking-wider text-teal-100 font-semibold">Tổng Điểm</div>
                      <div className="text-3xl md:text-4xl font-black text-amber-300">
                        {innovationRating ? innovationRating.totalScore.toFixed(1) : "--"}
                        <span className="text-sm font-semibold text-white/70">/100</span>
                      </div>
                    </div>

                    <div className="w-px h-12 bg-white/20"></div>

                    <div>
                      <div className="text-xs uppercase tracking-wider text-teal-100 font-semibold">Phân Tầng</div>
                      {innovationRating?.classification === "LEADING" ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs mt-1 shadow-sm">
                          ⭐️ {innovationRating.badgeName || "Huy hiệu Vàng ĐMST"}
                        </div>
                      ) : innovationRating?.classification === "DEVELOPING" ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-brand-900 font-extrabold text-xs mt-1 shadow-sm">
                          🥈 {innovationRating.badgeName || "Huy hiệu Bạc ĐMST"}
                        </div>
                      ) : innovationRating?.classification === "POTENTIAL" ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-600 text-white font-extrabold text-xs mt-1 shadow-sm">
                          🥉 {innovationRating.badgeName || "Huy hiệu Đồng ĐMST"}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 text-white font-extrabold text-xs mt-1 border border-white/30">
                          ⚪ Chưa Đánh Giá
                        </div>
                      )}
                      <div className="text-xs text-white/80 mt-0.5">
                        {innovationRating?.reviewedBy ? `Thẩm định: ${innovationRating.reviewedBy}` : "Tính toán tự động"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {innovationLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse py-8">
                  <div className="h-96 bg-slate-100 rounded-2xl"></div>
                  <div className="h-96 bg-slate-100 rounded-2xl"></div>
                </div>
              ) : !innovationRating || innovationRating.radarChartData.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 space-y-3">
                  <div className="text-4xl text-slate-400">📊</div>
                  <h4 className="text-base font-bold text-slate-800">
                    Chưa có dữ liệu đánh giá ĐMST cho doanh nghiệp này
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Doanh nghiệp có thể hoàn thiện bảng câu hỏi khảo sát tại Bàn làm việc để hệ thống tự động lượng hóa 8 nhóm năng lực.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left: Radar Chart Component */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base">
                            Biểu Đồ Radar Năng Lực 360°
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Trực quan hóa mức độ đáp ứng trên 8 đỉnh năng lực cốt lõi
                          </p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                          8 Trục
                        </span>
                      </div>

                      <RadarChart data={innovationRating.radarChartData} />
                    </div>

                    {/* Thresholds Legend */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-2">
                      <div className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                        Thang Chuẩn Phân Tầng Năng Lực:
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                          ⭐️ Dẫn đầu: ≥ 75đ
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 font-semibold">
                          🥈 Đang phát triển: 50–74đ
                        </div>
                        <div className="p-1.5 rounded-lg bg-orange-50 text-orange-900 border border-orange-200 font-semibold">
                          🥉 Tiềm năng: &lt; 50đ
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: 8 Capability Groups Matrix Breakdown */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-extrabold text-slate-900 text-base">
                        Ma Trận Điểm 8 Nhóm Tiêu Chí Thành Phần
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Chi tiết tỷ lệ hoàn thành trên từng nhóm năng lực (Tổng điểm chuẩn 100đ)
                      </p>
                    </div>

                    <div className="space-y-4">
                      {innovationRating.groupScores.map((g) => {
                        const pct = g.percentage || (g.maxScore > 0 ? Math.round((g.score / g.maxScore) * 100) : 0);
                        const barColor =
                          pct >= 75
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                            : pct >= 50
                            ? "bg-gradient-to-r from-brand-500 to-teal-600"
                            : "bg-gradient-to-r from-amber-500 to-orange-500";

                        return (
                          <div
                            key={g.groupCode}
                            className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition space-y-2 group"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                                  {g.groupCode}
                                </span>
                                <span className="font-bold text-slate-800 text-sm">
                                  {g.groupName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-sm">
                                  {g.score.toFixed(1)}
                                  <span className="text-xs text-slate-400 font-normal"> / {g.maxScore}đ</span>
                                </span>
                                <span
                                  className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                                    pct >= 75
                                      ? "bg-emerald-100 text-emerald-800"
                                      : pct >= 50
                                      ? "bg-teal-100 text-teal-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {pct}%
                                </span>
                              </div>
                            </div>

                            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* PDPD Privacy Notice */}
                    <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-800 leading-relaxed flex items-start gap-2">
                      <span className="text-base shrink-0">🛡️</span>
                      <span>
                        <strong>Bảo vệ dữ liệu (PDPD):</strong> Theo Nghị định 13/2023/NĐ-CP, chi tiết doanh thu từ sản phẩm mới và kinh phí R&amp;D nội bộ được bảo mật đối với người xem công chúng. Chỉ chủ sở hữu và cán bộ Sở KH&amp;CN phụ trách địa bàn mới có quyền khai thác số liệu chi tiết.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Danh Mục Sản Phẩm &amp; Giải Pháp Chào Bán
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Các giải pháp công nghệ, thiết bị và sản phẩm thương mại của {data.name} niêm yết trên Sàn NacenTwin
                  </p>
                </div>
                <Link
                  href="/chao-ban-cong-nghe"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200 self-start sm:self-auto"
                >
                  Xem tất cả trên Sàn công nghệ →
                </Link>
              </div>

              {offersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8 animate-pulse">
                  <div className="h-40 bg-slate-100 rounded-2xl"></div>
                  <div className="h-40 bg-slate-100 rounded-2xl"></div>
                </div>
              ) : enterpriseOffers.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 space-y-3">
                  <div className="text-3xl text-slate-400">📦</div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Doanh nghiệp chưa có sản phẩm chào bán niêm yết công khai
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Hồ sơ sản phẩm đang được cập nhật hoặc đang trong quá trình thẩm định của Sở KH&amp;CN.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {enterpriseOffers.map((item) => {
                    const coverImg = getTechnologyImage(item.sectorCode, item.title, (item as any).mainImageUrl);
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between space-y-3 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-caption">
                            <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs">
                              {item.offerCode}
                            </span>
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                              {item.sectorName}
                            </span>
                          </div>
                          <Link
                            href={`/chao-ban-cong-nghe/${item.id}`}
                            className="text-sm font-extrabold text-slate-900 group-hover:text-brand-600 transition line-clamp-2 leading-snug block"
                          >
                            {item.title}
                          </Link>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {item.summary}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-900">
                            {item.pricingType === "CONTACT" && "Thỏa thuận"}
                            {item.pricingType === "FIXED" &&
                              item.priceAmount &&
                              `${(item.priceAmount / 1_000_000).toLocaleString("vi-VN")} Triệu VND`}
                            {item.pricingType === "RANGE" &&
                              item.priceMin &&
                              item.priceMax &&
                              `${(item.priceMin / 1_000_000).toLocaleString("vi-VN")} - ${(item.priceMax / 1_000_000).toLocaleString("vi-VN")} Triệu VND`}
                          </span>
                          <Link
                            href={`/chao-ban-cong-nghe/${item.id}`}
                            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                          >
                            Chi tiết sản phẩm →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    Thông tin ngành &amp; quy mô
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Lĩnh vực chính (TT17):</span>
                      <span className="font-semibold text-slate-800">{data.mainSectorName || "Chưa phân loại"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Hình thức sở hữu:</span>
                      <span className="font-semibold text-slate-800">{data.ownershipType || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Quy mô lao động:</span>
                      <span className="font-semibold text-slate-800">{data.workforceScale || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Tỷ lệ ĐH &amp; Sau ĐH:</span>
                      <span className="font-semibold text-slate-800">{data.highQualificationRatio || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Địa bàn hoạt động:</span>
                      <span className="font-semibold text-slate-800">{data.operatingZone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    Tài chính &amp; Tuân thủ PDPD
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Doanh thu ước tính:</span>
                      <span className="font-semibold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded text-xs">
                        {data.revenueRange || "[BẢO MẬT THEO NĐ 13/2023]"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Tham gia chuỗi giá trị:</span>
                      <span className="font-semibold text-slate-800">{data.inValueChain ? "✓ Có tham gia" : "Chưa ghi nhận"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Định hướng xuất khẩu:</span>
                      <span className="font-semibold text-slate-800">{data.isExporting ? "✓ Có xuất khẩu" : "Nội địa"}</span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                    ℹ️ Căn cứ Nghị định 13/2023/NĐ-CP (PDPD), số liệu doanh thu và kết quả tài chính chi tiết được che mờ đối với công chúng, chỉ cấp cho cơ quan có thẩm quyền.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: R&D & INNOVATION */}
          {activeTab === "rd" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-center">
                  <div className="text-xs uppercase font-bold text-brand-700 tracking-wider">Chỉ số TNI</div>
                  <div className="text-3xl font-extrabold text-brand-900 mt-2">
                    {data.tniScore ? data.tniScore.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-xs font-semibold text-brand-700 mt-1">
                    Phân hạng: {data.tniClassification || "Đang đánh giá"}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-xs uppercase font-bold text-slate-600 tracking-wider">Bộ phận R&amp;D</div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    {data.hasRdUnit ? "✓ Đã thành lập" : "Chưa có"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {data.hasRdBudget ? "Có phân bổ ngân sách R&D" : "Chưa có quỹ riêng"}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-xs uppercase font-bold text-slate-600 tracking-wider">Dự án ĐMST</div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    {data.projects?.length || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Dự án công bố kết nối</div>
                </div>
              </div>

              {/* Projects List */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-base">Danh mục dự án ĐMST tiêu biểu</h3>
                {data.projects && data.projects.length > 0 ? (
                  <div className="space-y-3">
                    {data.projects.map((p) => (
                      <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                          {p.status && (
                            <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                              {p.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">{p.description}</p>
                        {p.partners && (
                          <div className="text-xs text-slate-500">
                            Đối tác liên kết: <strong className="text-slate-700">{p.partners}</strong>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                    Doanh nghiệp chưa công bố dự án ĐMST nào.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: INTELLECTUAL PROPERTY */}
          {activeTab === "ip" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base">Tài sản sở hữu trí tuệ đã xác lập</h3>
                <span className="text-xs text-slate-500">Cục Sở hữu Trí tuệ &amp; Hồ sơ tự kê khai</span>
              </div>

              {data.intellectualProperties && data.intellectualProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.intellectualProperties.map((ip) => (
                    <div key={ip.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {ip.type}
                        </span>
                        {ip.registrationNumber && (
                          <span className="text-xs font-mono text-slate-500">
                            Số: {ip.registrationNumber}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm leading-snug">{ip.title}</h4>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                  Chưa có tài sản sở hữu trí tuệ nào được công bố.
                </div>
              )}
            </div>
          )}

          {/* TAB: NEEDS & VALUE CHAIN */}
          {activeTab === "needs" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Bottlenecks */}
                <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-3">
                  <h3 className="font-bold text-rose-900 text-sm uppercase tracking-wider">
                    ⚠️ Điểm nghẽn lớn nhất đang gặp phải
                  </h3>
                  {data.topBottlenecks && data.topBottlenecks.length > 0 ? (
                    <ul className="space-y-2">
                      {data.topBottlenecks.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-rose-800">
                          <span className="font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-rose-700 italic">Chưa ghi nhận điểm nghẽn đặc thù.</div>
                  )}
                </div>

                {/* Support Needs */}
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                  <h3 className="font-bold text-emerald-900 text-sm uppercase tracking-wider">
                    🎯 Nhu cầu hỗ trợ từ Hệ sinh thái &amp; Nhà nước
                  </h3>
                  {data.supportNeeds && data.supportNeeds.length > 0 ? (
                    <ul className="space-y-2">
                      {data.supportNeeds.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-emerald-800">
                          <span className="font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-emerald-700 italic">Chưa ghi nhận nhu cầu cụ thể.</div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-brand-50 rounded-2xl border border-brand-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-brand-900 text-sm">Bạn quan tâm đến việc hợp tác cùng doanh nghiệp này?</h4>
                  <p className="text-xs text-brand-700 mt-0.5">
                    Gửi yêu cầu kết nối để mở luồng trao đổi trực tiếp qua mạng lưới Đổi mới sáng tạo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenConnectModal}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shrink-0 transition"
                >
                  🤝 Gửi đề xuất ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
