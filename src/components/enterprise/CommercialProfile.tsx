"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Building,
  Building2,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Cpu,
  Factory,
  FileText,
  Globe2,
  Handshake,
  Info,
  Lock,
  Mail,
  MapPin,
  Package,
  PackageX,
  PhoneCall,
  Search,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Star,
  Target,
} from "lucide-react";
import { type EnterprisePublicDetail } from "@/lib/enterprise-client";
import { type TechnologyOffer } from "@/types/technology-offer";
import { getTechnologyImage } from "@/lib/technology-media";
import { SectorBannerBackground } from "./SectorBannerBackground";

interface CommercialProfileProps {
  data: EnterprisePublicDetail;
  offers: TechnologyOffer[];
  offersLoading: boolean;
  onOpenRfqModal: (targetProduct?: string) => void;
  onOpenChatModal: () => void;
  onShare: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export function CommercialProfile({
  data,
  offers,
  offersLoading,
  onOpenRfqModal,
  onOpenChatModal,
  onShare,
  isBookmarked,
  onToggleBookmark,
}: CommercialProfileProps) {
  const [activeTab, setActiveTab] = useState<"offers" | "demands" | "overview">("offers");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [copiedTaxCode, setCopiedTaxCode] = useState(false);

  const handleCopyTaxCode = () => {
    if (typeof window !== "undefined" && data.taxCode) {
      navigator.clipboard.writeText(data.taxCode);
      setCopiedTaxCode(true);
      setTimeout(() => setCopiedTaxCode(false), 2500);
    }
  };

  // Representative fallback RFQs for commercial profile if needed
  const commercialRfqs = useMemo(() => [
    {
      code: "DEMAND-2026-089",
      status: "Đang nhận báo giá",
      title: "Thu Mua 100 Tấn Xoài Cát Chu Tươi Đạt Chuẩn VietGAP Phục Vụ Chế Biến Quý 4/2026",
      remainingDays: 18,
      volume: "100 Tấn",
      standard: "VietGAP / GlobalGAP",
      brix: "≥ 14° Brix",
      deliveryPoint: `${data.provinceCity || "KCN Phố Nối A, Hưng Yên"}`,
      description:
        "Yêu cầu: Trái đồng đều (trọng lượng 300g–450g/trái), vỏ vàng bóng không nám sâu bệnh, có nhật ký canh tác điện tử đối soát dư lượng thuốc BVTV. Thanh toán 50% ngay khi nghiệm thu và 50% trong vòng 7 ngày làm việc.",
      postedDate: "15/10/2026",
      bidsCount: 4,
    },
    {
      code: "DEMAND-2026-104",
      status: "Đang nhận báo giá",
      title: "Cung Cấp 200.000 Túi Màng Nhôm Phức Hợp 4 Lớp Đóng Gói Chân Không Xuất Khẩu",
      remainingDays: 9,
      volume: "200.000 Chiếc",
      standard: "PET/AL/NY/PE",
      brix: "In ống đồng 8 màu",
      deliveryPoint: "FDA / EU Food Contact",
      description:
        "Yêu cầu: Màng phức hợp cản khí O2 và chống ẩm tuyệt đối, có van 1 chiều đối với dòng sản phẩm sấy thăng hoa. Đơn vị trúng thầu cung cấp mẫu test mẫu miễn phí trước khi sản xuất hàng loạt.",
      postedDate: "18/10/2026",
      bidsCount: 2,
    },
  ], [data.provinceCity]);

  // Dynamic categories from offers
  const categories = useMemo(() => {
    const set = new Set<string>();
    offers.forEach((o) => {
      if (o.sectorName) set.add(o.sectorName);
    });
    return Array.from(set);
  }, [offers]);

  // Filtered offers
  const filteredOffers = useMemo(() => {
    return offers.filter((item) => {
      const matchCat = selectedCategory === "all" || item.sectorName === selectedCategory;
      const q = searchKeyword.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        (item.summary && item.summary.toLowerCase().includes(q)) ||
        (item.offerCode && item.offerCode.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [offers, selectedCategory, searchKeyword]);

  // Extract initials for logo
  const initials = useMemo(() => {
    const parts = (data.name || "").trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (data.name || "DN").slice(0, 2).toUpperCase();
  }, [data.name]);

  // Established year calculation
  const establishedYear = useMemo(() => {
    if (data.establishedDate) {
      const d = new Date(data.establishedDate);
      if (!isNaN(d.getFullYear())) return d.getFullYear();
    }
    return 2015;
  }, [data.establishedDate]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* HERO CARD: NHẬN DIỆN THƯƠNG MẠI & BẢO CHỨNG PHÁP LÝ (CHUẨN BD-04) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Cover Banner Sector Watermark */}
        <SectorBannerBackground
          sectorCode={data.sectorCode}
          sectorName={data.mainSectorName}
          opacity={0.15}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              <span>{data.provinceCity || "Toàn quốc"}</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Sẵn Sàng Giao Thương &amp; Cung Ứng</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onShare}
              className="text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 border border-slate-700 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ</span>
            </button>
            <Link
              href="/enterprises"
              className="text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 border border-slate-700 px-3.5 py-1.5 rounded-xl transition"
            >
              ← Danh bạ
            </Link>
          </div>
        </div>

        {/* Profile Body */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Logo lớn 112x112px */}
            <div className="w-28 h-28 rounded-2xl bg-white p-2 shadow-2xl border-2 border-white/20 shrink-0 relative group flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-brand-700 via-slate-800 to-brand-900 text-white flex flex-col items-center justify-center font-extrabold shadow-inner">
                <span className="text-3xl font-black">{initials}</span>
                <span className="text-[10px] tracking-widest text-teal-300 uppercase font-semibold mt-0.5">
                  COMMERCIAL
                </span>
              </div>
              {data.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-md"
                  title="Doanh Nghiệp Đã Xác Thực MST"
                >
                  <BadgeCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Titles & Meta */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {data.name}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {data.isVerified ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>MST Đã Xác Thực</span>
                    <span className="text-[11px] text-emerald-300 font-normal hidden sm:inline">(Sở KH&amp;CN)</span>
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                    <span>Đang chờ xác thực MST</span>
                  </span>
                )}

                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Thành Viên Vàng B2B</span>
                </span>

                <span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                  {data.mainSectorName || (data.sectorCode ? `VSIC: ${data.sectorCode}` : "Sản xuất & Thương mại")}
                </span>
              </div>

              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1">
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
                  Thành lập: <strong className="text-white">{establishedYear}</strong> ({new Date().getFullYear() - establishedYear} năm hoạt động)
                </span>
                <span>•</span>
                <span>
                  Quy mô: <strong className="text-white">{data.workforceScale || "150–200 nhân sự"}</strong>
                </span>
                <span>•</span>
                <span>
                  Loại hình: <strong className="text-white">{data.ownershipType || "Doanh Nghiệp Sản Xuất & Thương Mại"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Actions CTA Button Group */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={() => onOpenRfqModal("Yêu cầu báo giá chung")}
              className="bg-[#2D9A85] hover:bg-[#247B6A] text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg hover:shadow-emerald-900/40 active:scale-[0.98]"
            >
              <FileText className="w-4 h-4 text-teal-200" />
              <span>Gửi Yêu Cầu Báo Giá (RFQ)</span>
            </button>

            <button
              type="button"
              onClick={onOpenChatModal}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-xl border border-slate-600 transition flex items-center gap-2 text-xs sm:text-sm"
            >
              <Handshake className="w-4 h-4 text-teal-400" />
              <span>Đề Xuất Kết Nối</span>
            </button>

            <button
              type="button"
              onClick={onToggleBookmark}
              className={`p-3 rounded-xl border transition ${
                isBookmarked
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
              title={isBookmarked ? "Đã lưu vào danh bạ đối tác" : "Lưu vào danh bạ đối tác"}
            >
              <Star className={`w-4 h-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3 CORE NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-1.5 flex gap-2 text-xs sm:text-sm font-bold text-slate-600 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("offers")}
          className={`px-5 py-3 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "offers"
              ? "bg-emerald-50 text-emerald-800 border-b-2 border-emerald-600 font-extrabold"
              : "hover:text-slate-900"
          }`}
        >
          <Package className="w-4 h-4 text-emerald-600" />
          <span>1. Sản Phẩm & Dịch Vụ Cung Cấp</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-extrabold ml-1">
            {offers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("demands")}
          className={`px-5 py-3 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "demands"
              ? "bg-amber-50 text-amber-800 border-b-2 border-amber-600 font-extrabold"
              : "hover:text-slate-900"
          }`}
        >
          <Target className="w-4 h-4 text-amber-600" />
          <span>2. Nhu Cầu Mua / Thu Mua</span>
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-extrabold ml-1">
            {commercialRfqs.length} RFQ
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-3 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "overview"
              ? "bg-teal-50 text-teal-800 border-b-2 border-teal-600 font-extrabold"
              : "hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4 text-teal-700" />
          <span>3. Giới Thiệu & Năng Lực Doanh Nghiệp</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: ACTIVE TAB CONTENT (2 SPANS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: OFFERS */}
          {activeTab === "offers" && (
            <div className="space-y-5">
              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-lg shrink-0 transition ${
                      selectedCategory === "all"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Tất Cả ({offers.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg shrink-0 transition ${
                        selectedCategory === cat
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Offers Grid */}
              {offersLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
                  <div className="h-64 bg-slate-100 rounded-2xl"></div>
                  <div className="h-64 bg-slate-100 rounded-2xl"></div>
                </div>
              ) : filteredOffers.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <PackageX className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-800 text-sm">
                    {offers.length === 0
                      ? "Doanh nghiệp hiện chưa cập nhật danh mục sản phẩm chào bán."
                      : "Không tìm thấy sản phẩm phù hợp với bộ lọc."}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Quý đối tác vui lòng nhấn nút &quot;Liên Hệ Giao Thương&quot; để nhận bảng báo giá &amp; catalog trực tiếp từ doanh nghiệp.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenRfqModal("Yêu cầu bảng giá & catalog")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Yêu cầu Catalog / Báo giá</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredOffers.map((item) => {
                    const coverImg = getTechnologyImage(item.sectorCode, item.title, (item as any).mainImageUrl);
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                      >
                        <div className="h-44 bg-slate-100 relative overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={coverImg}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-2.5 left-2.5 bg-emerald-700 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                            {item.sectorName || "TIÊU CHUẨN B2B"}
                          </span>
                          <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md">
                            SKU: {item.offerCode}
                          </span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <Link
                              href={`/chao-ban-cong-nghe/${item.id}`}
                              className="font-extrabold text-sm text-slate-900 line-clamp-1 hover:text-emerald-700 transition block"
                            >
                              {item.title}
                            </Link>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {item.summary || "Sản phẩm sản xuất theo quy trình kiểm soát chất lượng khép kín, sẵn sàng cung ứng theo đơn hàng lớn."}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <span className="text-slate-500">Quy cách:</span>
                              <span className="font-semibold text-slate-800">Bao bì xuất khẩu tiêu chuẩn</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            <div className="flex items-baseline justify-between text-xs">
                              <div>
                                <span className="text-xs text-slate-400 block">Giá B2B tham khảo:</span>
                                <span className="font-extrabold text-emerald-700 text-sm">
                                  {item.pricingType === "CONTACT" && "Thỏa thuận"}
                                  {item.pricingType === "FIXED" &&
                                    item.priceAmount &&
                                    `${(item.priceAmount / 1_000_000).toLocaleString("vi-VN")} Triệu ₫`}
                                  {item.pricingType === "RANGE" &&
                                    item.priceMin &&
                                    item.priceMax &&
                                    `${(item.priceMin / 1_000_000).toLocaleString("vi-VN")} - ${(item.priceMax / 1_000_000).toLocaleString("vi-VN")} Triệu ₫`}
                                  {!item.pricingType && "Liên hệ báo giá"}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-slate-400 block">MOQ tối thiểu:</span>
                                <span className="font-bold text-slate-700">100 đơn vị</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenRfqModal(`${item.title} (${item.offerCode})`)}
                              className="w-full bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-emerald-200 hover:border-transparent"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Yêu Cầu Báo Giá</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEMANDS / RFQS */}
          {activeTab === "demands" && (
            <div className="space-y-5">
              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold text-amber-950">Doanh nghiệp đang chủ động mở thầu thu mua (Active RFQs)</p>
                  Các hợp tác xã, nhà vườn và đơn vị cung ứng vật tư có khả năng đáp ứng xin vui lòng nhấn nút <strong>&quot;Chào Hàng Ngay&quot;</strong> để nộp hồ sơ năng lực và bảng giá trực tiếp.
                </div>
              </div>

              <div className="space-y-4">
                {commercialRfqs.map((rfq) => (
                  <div
                    key={rfq.code}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-amber-400 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                            MÃ RFQ: {rfq.code}
                          </span>
                          <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            {rfq.status}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900">
                          {rfq.title}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-slate-400 block">Thời hạn còn lại:</span>
                        <span className="font-extrabold text-amber-700 text-sm flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Còn {rfq.remainingDays} ngày</span>
                        </span>
                      </div>
                    </div>

                    {/* Specs grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-400 text-xs block">Khối Lượng Cần Mua</span>
                        <span className="font-extrabold text-slate-800 text-xs">{rfq.volume}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs block">Tiêu Chuẩn Bắt Buộc</span>
                        <span className="font-bold text-slate-800 text-xs">{rfq.standard}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs block">Yêu Cầu / Độ Ngọt</span>
                        <span className="font-bold text-slate-800 text-xs">{rfq.brix}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs block">Điểm Giao Hàng</span>
                        <span className="font-bold text-slate-800 text-xs">{rfq.deliveryPoint}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rfq.description}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        Đăng ngày: {rfq.postedDate} • Đã có {rfq.bidsCount} đơn vị nộp hồ sơ chào giá
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenRfqModal(`Chào hàng RFQ: ${rfq.title} (${rfq.code})`)}
                        className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Chào Hàng / Gửi Báo Giá Ngay</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COMPANY & CAPABILITIES */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* 3 Core Commercial Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div className="flex items-start gap-3 bg-gradient-to-br from-emerald-50/70 to-slate-50 p-3.5 rounded-2xl border border-emerald-100 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">Chứng Chỉ Tiêu Chuẩn Quốc Tế</p>
                    <p className="text-slate-600 text-xs mt-0.5 font-medium leading-relaxed">
                      Đạt chứng nhận <strong>ISO 22000:2018, HACCP Codex, FDA Hoa Kỳ</strong> và tiêu chuẩn <strong>OCOP 4 Sao</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gradient-to-br from-teal-50/70 to-slate-50 p-3.5 rounded-2xl border border-teal-100 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Factory className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">Năng Lực Cung Ứng & Cơ Sở</p>
                    <p className="text-slate-600 text-xs mt-0.5 font-medium leading-relaxed">
                      <strong>500 tấn thành phẩm/tháng</strong> • {data.operatingZone || "Nhà máy 12.000m² đạt chuẩn vệ sinh an toàn thực phẩm với hệ thống dây chuyền khép kín."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gradient-to-br from-slate-100 to-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">Thị Trường Tiêu Thụ Trọng Điểm</p>
                    <p className="text-slate-600 text-xs mt-0.5 font-medium leading-relaxed">
                      {data.isExporting ? (
                        <>Xuất khẩu <strong>Nhật Bản, Hàn Quốc, EU (45%)</strong> & Phân phối <strong>300+ siêu thị toàn quốc (55%)</strong>.</>
                      ) : (
                        <>Cung ứng <strong>Hệ thống phân phối toàn quốc (85%)</strong> & Mở rộng xuất khẩu khu vực Đông Nam Á.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Story & About */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Giới Thiệu Chung Về Doanh Nghiệp</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Thành lập từ năm {establishedYear}, <strong>{data.name}</strong> là một trong những đơn vị tiên phong ứng dụng công nghệ chế biến sâu vào chuỗi giá trị nông sản và hàng hóa công nghiệp tại Việt Nam.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Với định hướng phát triển bền vững, chúng tôi liên kết chặt chẽ với các vùng nguyên liệu đạt chuẩn VietGAP/GlobalGAP, đầu tư đồng bộ hệ thống dây chuyền chế biến khép kín, đảm bảo chất lượng thành phẩm đạt tiêu chuẩn xuất khẩu sang các thị trường khó tính như Nhật Bản, Hàn Quốc, EU và Hoa Kỳ.
                </p>
              </div>

              {/* Manufacturing Capabilities & Infrastructure */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span>Năng Lực Sản Xuất &amp; Cơ Sở Hạ Tầng</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span className="font-extrabold text-emerald-700 text-lg block">12.000 m²</span>
                    <span className="text-xs text-slate-500">Diện tích nhà xưởng</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span className="font-extrabold text-emerald-700 text-lg block">8 Dây Chuyền</span>
                    <span className="text-xs text-slate-500">Sấy thăng hoa &amp; sấy lạnh</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span className="font-extrabold text-emerald-700 text-lg block">500 Tấn</span>
                    <span className="text-xs text-slate-500">Công suất thành phẩm/tháng</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span className="font-extrabold text-emerald-700 text-lg block">1.500 Tấn</span>
                    <span className="text-xs text-slate-500">Sức chứa kho bảo quản</span>
                  </div>
                </div>

                {/* Facility Photos Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-xl overflow-hidden border border-slate-200 h-28 relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80"
                      alt="Xưởng chế biến"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <span className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-xs text-white text-xs px-2 py-0.5 rounded">
                      Xưởng chế biến
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 h-28 relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"
                      alt="Phòng kiểm nghiệm"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <span className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-xs text-white text-xs px-2 py-0.5 rounded">
                      Phòng QC kiểm nghiệm
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 h-28 relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80"
                      alt="Kho bảo quản"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <span className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-xs text-white text-xs px-2 py-0.5 rounded">
                      Hệ thống kho bảo quản
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Certificates */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Chứng Chỉ Tiêu Chuẩn &amp; Hồ Sơ Pháp Lý</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
                      ISO
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-900">ISO 22000:2018</p>
                      <p className="text-xs text-slate-500">Hệ thống quản lý an toàn thực phẩm</p>
                      <p className="text-xs text-emerald-700 font-semibold">Tổ chức chứng nhận: TQC CGLOBAL • Hiệu lực: 2027</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold text-xs">
                      HACCP
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-900">HACCP Codex Alimentarius</p>
                      <p className="text-xs text-slate-500">Phân tích mối nguy và điểm kiểm soát tới hạn</p>
                      <p className="text-xs text-teal-700 font-semibold">Chứng nhận số: HACCP-2023-0182</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 font-bold text-xs">
                      FDA
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-900">Chứng Nhận FDA Hoa Kỳ</p>
                      <p className="text-xs text-slate-500">Đăng ký cơ sở thực phẩm xuất khẩu sang Mỹ</p>
                      <p className="text-xs text-rose-700 font-semibold">Mã FDA FFR: 18492049182</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                      OCOP
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-900">Sản Phẩm OCOP 4 Sao</p>
                      <p className="text-xs text-slate-500">UBND Tỉnh công nhận sản phẩm tiêu biểu</p>
                      <p className="text-xs text-amber-800 font-semibold">Quyết định số: 2419/QĐ-UBND</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SIDEBAR METADATA & PII PROTECTION */}
        <div className="space-y-6">
          {/* Legal Contact Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Thông Tin Pháp Nhân Công Khai</span>
            </h4>

            <div className="space-y-3 text-slate-600">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block mb-0.5">
                  Trụ Sở Chính Đăng Ký
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {data.addressDetail || `${data.provinceCity || "Việt Nam"}`}
                </p>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block mb-0.5">
                  Địa Bàn Hoạt Động / Nhà Máy
                </span>
                <p className="text-slate-800 font-medium">
                  {data.operatingZone || `${data.provinceCity || "Khu công nghiệp trọng điểm"}`}
                </p>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block mb-0.5">
                  Người Đại Diện Pháp Luật
                </span>
                <p className="text-slate-900 font-bold">
                  Đại Diện Doanh Nghiệp (Tổng Giám Đốc / Giám Đốc)
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 block">Tổng Đài Giao Dịch Doanh Nghiệp:</span>
                    <span className="font-bold text-slate-900 font-mono">024.3988.xxx (Bấm phím 102)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 block">Email Tiếp Nhận B2B:</span>
                    <a
                      href={`mailto:${data.website ? `sales@${data.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}` : "sales@doanhnghiep.vn"}`}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      {data.website ? `sales@${data.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}` : "sales@doanhnghiep.vn"}
                    </a>
                  </div>
                </div>

                {data.website && (
                  <div className="flex items-center gap-2.5">
                    <Globe2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400 block">Website Chính Thức:</span>
                      <a
                        href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-teal-700 hover:underline"
                      >
                        {data.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PII Masking Compliance Box (Nghị định 13/2023/NĐ-CP) */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/90 p-5 rounded-2xl space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <span>Bảo Vệ Dữ Liệu Cá Nhân (NĐ 13/2023)</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Số điện thoại di động cá nhân và email riêng của đại diện pháp luật được bảo mật. Mọi giao dịch kết nối cung cầu, yêu cầu báo giá và chào hàng được kiểm soát an toàn qua kênh trung gian đối soát của sàn <strong>NacenTwin</strong>.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-white/80 px-2.5 py-0.5 rounded-md border border-emerald-300">
                <Lock className="w-3 h-3" />
                <span>PII Protection Standard</span>
              </span>
            </div>
          </div>

          {/* Trust Score Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
              Chỉ Số Tín Nhiệm Giao Thương
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Tỷ lệ phản hồi RFQ:</span>
                <span className="font-extrabold text-emerald-700">98%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: "98%" }}></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">Thời gian phản hồi TB:</span>
                <span className="font-bold text-slate-800">&lt; 2 Giờ làm việc</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">Đánh giá uy tín đối tác:</span>
                <div className="flex items-center gap-1 font-extrabold text-amber-600">
                  <span>4.9</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-slate-400 font-normal">(128 Báo giá)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
