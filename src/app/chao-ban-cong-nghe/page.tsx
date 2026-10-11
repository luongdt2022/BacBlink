"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  ShieldCheck,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
  Building2,
  Tag,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  FileText,
} from "lucide-react";
import {
  fetchPublicOffers,
  SECTORS_18_CATALOG,
} from "@/services/api/technology-offer";
import { TechnologyOffer } from "@/types/technology-offer";
import { getTechnologyImage } from "@/lib/technology-media";

export default function ChaoBanCongNghePage() {
  const [offers, setOffers] = useState<TechnologyOffer[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"ALL" | "COMMERCIAL" | "TRANSFER">("ALL");
  const [selectedTrl, setSelectedTrl] = useState<number | undefined>(undefined);
  const [selectedIp, setSelectedIp] = useState("ALL");

  const loadData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      let hasTechTransfer: boolean | undefined = undefined;
      let offerType: string | undefined = undefined;

      if (activeTab === "COMMERCIAL") {
        hasTechTransfer = false;
      } else if (activeTab === "TRANSFER") {
        hasTechTransfer = true;
      }

      const res = await fetchPublicOffers({
        search: search.trim() || undefined,
        sectorCode: selectedSector !== "ALL" ? selectedSector : undefined,
        offerType: offerType,
        hasTechTransfer: hasTechTransfer,
        minTrl: selectedTrl,
        ipStatus: selectedIp !== "ALL" ? selectedIp : undefined,
      });

      setOffers(res.data);
      setTotal(res.total);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSector, activeTab, selectedTrl, selectedIp]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      loadData();
    });
  };

  const getTrlBadgeColor = (level?: number | null) => {
    if (!level) return "bg-slate-100 text-slate-700 border-slate-200";
    if (level >= 8) return "bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold";
    if (level >= 6) return "bg-brand-100 text-brand-800 border-brand-300 font-bold";
    if (level >= 4) return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
    return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
  };

  const getIpStatusLabel = (status?: string | null) => {
    switch (status) {
      case "PATENT_GRANTED":
        return "Bằng Độc Quyền Sáng Chế";
      case "UTILITY_MODEL":
        return "Giải Pháp Hữu Ích";
      case "TRADE_SECRET":
        return "Bí Quyết Công Nghệ (Know-how)";
      case "PATENT_PENDING":
        return "Đang Nộp Đơn Thẩm Định";
      case "SOFTWARE_COPYRIGHT":
        return "Bản Quyền Phần Mềm";
      default:
        return "Chưa Đăng Ký SHTT";
    }
  };

  return (
    <div className="min-h-screen bg-surface-page dark:bg-slate-950 text-text-primary dark:text-slate-100 flex flex-col">
      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-brand-700 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0" />
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Sàn Giao Dịch Công Nghệ & SHTT Quốc Gia (NacenTwin)
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Hồ Sơ Chào Bán & Chuyển Giao Công Nghệ
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Khám phá hơn 1.200 công nghệ, sáng chế có bảo hộ SHTT và thiết bị thương mại từ các
              Viện nghiên cứu, Trường đại học và Doanh nghiệp ĐMST trên toàn quốc.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/portal/seller/technologies"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 backdrop-blur-sm"
            >
              <Layers className="w-4 h-4 text-teal-300" />
              Kho Seller Workspace
            </Link>
            <Link
              href="/portal/seller/technologies/create"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-emerald-950/20"
            >
              <PlusCircle className="w-4 h-4" />
              Đăng Chào Bán Mới
            </Link>
          </div>
        </div>
      </section>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* TABS */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "ALL"
                  ? "bg-white text-brand-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất Cả ({total})
            </button>
            <button
              onClick={() => setActiveTab("TRANSFER")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "TRANSFER"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Chuyển Giao SHTT & TRL
            </button>
            <button
              onClick={() => setActiveTab("COMMERCIAL")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === "COMMERCIAL"
                  ? "bg-white text-brand-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Thiết Bị Thương Mại
            </button>
          </div>

          {/* SEARCH INPUT */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm công nghệ, đơn vị nghiên cứu..."
                className="w-full h-11 pl-9 pr-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-control focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="h-11 bg-brand-700 hover:bg-brand-800 text-white px-5 rounded-control text-sm font-bold transition shrink-0"
            >
              Tìm
            </button>
          </form>
        </div>
      </div>

      {/* MAIN CONTENT BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR BỘ LỌC ĐA TẦNG 10 LĨNH VỰC */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Lọc 10 Lĩnh vực TT17 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                10 Lĩnh Vực Trọng Điểm (TT17)
              </h3>
              {selectedSector !== "ALL" && (
                <button
                  onClick={() => setSelectedSector("ALL")}
                  className="text-xs text-emerald-600 hover:underline font-bold"
                >
                  Đặt lại
                </button>
              )}
            </div>

            <div className="space-y-1">
              {SECTORS_18_CATALOG.map((sec) => (
                <button
                  key={sec.code}
                  onClick={() => setSelectedSector(sec.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition ${
                    selectedSector === sec.code
                      ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate pr-2">{sec.name}</span>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    {sec.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Lọc Thang đo TRL (1 - 9) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Mức Sẵn Sàng Công Nghệ (TRL)
            </h3>
            <p className="text-xs text-slate-500">
              Lọc theo độ hoàn thiện của công nghệ chuyển giao:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { trl: undefined, label: "Tất cả" },
                { trl: 7, label: "TRL 7+" },
                { trl: 8, label: "TRL 8+" },
                { trl: 9, label: "TRL 9" },
                { trl: 5, label: "TRL 5+" },
                { trl: 3, label: "TRL 3+" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTrl(item.trl)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition text-center ${
                    selectedTrl === item.trl
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lọc Tình trạng Bảo hộ SHTT */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Tình Trạng SHTT
            </h3>
            <div className="space-y-1.5">
              {[
                { code: "ALL", label: "Tất cả tình trạng" },
                { code: "PATENT_GRANTED", label: "Bằng độc quyền sáng chế" },
                { code: "UTILITY_MODEL", label: "Bằng giải pháp hữu ích" },
                { code: "TRADE_SECRET", label: "Bí quyết công nghệ (Know-how)" },
              ].map((ip) => (
                <button
                  key={ip.code}
                  onClick={() => setSelectedIp(ip.code)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${
                    selectedIp === ip.code
                      ? "bg-brand-50 text-brand-900 font-bold border border-brand-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {ip.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* RESULTS GRID (5 UX STATES) */}
        <section className="lg:col-span-3 space-y-6">
          {/* Header kết quả */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                Danh Sách Hồ Sơ Công Nghệ Niêm Yết
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {offers.length} kết quả
              </span>
            </div>
            <button
              onClick={loadData}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>

          {/* STATE 1: LOADING */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-pulse"
                >
                  <div className="h-5 bg-slate-200 rounded-lg w-1/3"></div>
                  <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
                  <div className="h-16 bg-slate-100 rounded-lg"></div>
                  <div className="h-8 bg-slate-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          )}

          {/* STATE 2: ERROR */}
          {!isLoading && hasError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-4">
              <p className="text-sm font-bold text-rose-800">
                Không thể tải danh sách công nghệ vào lúc này.
              </p>
              <button
                onClick={loadData}
                className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-700 transition"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* STATE 3: EMPTY */}
          {!isLoading && !hasError && offers.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Không tìm thấy hồ sơ công nghệ phù hợp
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hãy thử nới lỏng các tiêu chí lọc theo ngành, mức TRL hoặc tìm kiếm với từ khóa khác.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedSector("ALL");
                  setActiveTab("ALL");
                  setSelectedTrl(undefined);
                  setSelectedIp("ALL");
                }}
                className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

          {/* STATE 4: SUCCESS (CARDS GRID) */}
          {!isLoading && !hasError && offers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer) => {
                const coverImage = getTechnologyImage(offer.sectorCode, offer.title);
                return (
                  <div
                    key={offer.id}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between border-t-4 border-t-emerald-600"
                  >
                    <div>
                      {/* Media Thumbnail Container */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                        <Image
                          src={coverImage}
                          alt={offer.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                        {/* Top Overlay Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="mono text-xs font-bold text-slate-800 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md shadow-sm">
                            {offer.offerCode}
                          </span>
                          <span className="text-xs bg-slate-900/85 backdrop-blur-md text-white px-2.5 py-1 rounded-md font-bold shadow-sm">
                            {offer.offerType === "SOLUTION"
                              ? "Giải pháp"
                              : offer.offerType === "DEVICE"
                              ? "Thiết bị"
                              : "Sản phẩm"}
                          </span>
                        </div>

                        {/* Bottom Overlay Badges */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 line-clamp-1 max-w-[60%]">
                            {offer.sectorName}
                          </span>
                          {offer.hasTechTransfer && offer.trlLevel && (
                            <span
                              className={`text-xs px-2.5 py-1 rounded-md border shadow-sm flex items-center gap-1 ${getTrlBadgeColor(
                                offer.trlLevel
                              )}`}
                            >
                              <Award className="w-3.5 h-3.5" />
                              TRL {offer.trlLevel}/9
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-6 space-y-3">
                        {/* Title */}
                        <Link
                          href={`/chao-ban-cong-nghe/${offer.id}`}
                          className="text-base font-extrabold text-slate-900 hover:text-emerald-600 transition block leading-snug line-clamp-2"
                        >
                          {offer.title}
                        </Link>

                        {/* Summary */}
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {offer.summary}
                        </p>

                        {/* SHTT Info Badge */}
                        {offer.hasTechTransfer && (
                          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 space-y-1">
                            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="truncate">{getIpStatusLabel(offer.ipStatus)}</span>
                              {offer.ipRegistrationNumber && (
                                <span className="mono text-xs bg-white px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                                  {offer.ipRegistrationNumber}
                                </span>
                              )}
                            </div>
                            {offer.developerOrigin && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{offer.developerOrigin}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Pricing & Action */}
                    <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Hình thức thương mại</p>
                      <p className="text-xs font-extrabold text-slate-900">
                        {offer.pricingType === "CONTACT" && "Thỏa thuận / Liên hệ"}
                        {offer.pricingType === "FIXED" &&
                          offer.priceAmount &&
                          `${(offer.priceAmount / 1_000_000).toLocaleString("vi-VN")} Triệu ${
                            offer.unit ? "/" + offer.unit : ""
                          }`}
                        {offer.pricingType === "RANGE" &&
                          offer.priceMin &&
                          offer.priceMax &&
                          `${(offer.priceMin / 1_000_000).toLocaleString("vi-VN")} - ${(
                            offer.priceMax / 1_000_000
                          ).toLocaleString("vi-VN")} Triệu`}
                      </p>
                    </div>

                    <Link
                      href={`/chao-ban-cong-nghe/${offer.id}`}
                      className="bg-brand-50 hover:bg-brand-100 text-brand-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      Chi tiết hồ sơ <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </section>
      </main>
    </div>
  );
}
