"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Building2,
  ShieldCheck,
  Award,
  Layers,
  MapPin,
  Sparkles,
  Send,
  X,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  FileCheck2,
  Cpu,
  Wrench,
  Sprout,
  FlaskConical,
  Zap,
  Globe,
  ArrowUpDown,
  ArrowRight,
  Copy,
  Check
} from "lucide-react";
import {
  fetchEnterprises,
  type EnterpriseDirectoryItem,
  type EnterpriseDirectoryResponse
} from "@/lib/enterprise-client";
import { getActiveSectors, type SectorOption } from "@/lib/master-data-client";
import { PROVINCES_34 } from "@/app/khao-sat-nhu-cau/types";
import { EnterpriseAvatar } from "@/components/common/enterprise-avatar";
import { SearchableProvinceCombobox } from "@/components/common/searchable-province-combobox";
import { brokerageApi } from "@/services/api/brokerage";

const SUBJECT_TYPES = [
  { code: "", label: "Tất cả loại hình chủ thể" },
  { code: "ENTERPRISE", label: "Doanh nghiệp thường" },
  { code: "INNOVATIVE_ENTERPRISE", label: "Doanh nghiệp ĐMST" },
  { code: "COOPERATIVE", label: "Hợp tác xã" },
  { code: "INSTITUTE_UNIVERSITY", label: "Viện nghiên cứu / Trường ĐH" },
  { code: "HOUSEHOLD_BUSINESS", label: "Hộ kinh doanh cá thể" },
];

const TNI_LEVELS = [
  { code: "", label: "Tất cả mức độ TNI" },
  { code: "HIGH", label: "TNI Rất cao / Cao (≥ 75 điểm)" },
  { code: "MEDIUM", label: "TNI Trung bình (50 - 74 điểm)" },
  { code: "LOW", label: "TNI Cơ bản (< 50 điểm)" },
];

const INNOVATION_TIERS = [
  { code: "", label: "Tất cả mức độ ĐMST" },
  { code: "LEADING", label: "⭐️ Dẫn đầu (≥ 75 điểm)" },
  { code: "DEVELOPING", label: "🥈 Đang phát triển (50 - 74 điểm)" },
  { code: "POTENTIAL", label: "🥉 Tiềm năng (< 50 điểm)" },
  { code: "UNRATED", label: "⚪ Chưa đánh giá" },
];

const TT17_LEVELS = [
  { code: "", label: "Tất cả trình độ công nghệ" },
  { code: "TIEN_TIEN", label: "🚀 Tiên tiến (≥ 75đ & T_ĐB ≥ 0.65)" },
  { code: "TRUNG_BINH_TIEN_TIEN", label: "⚡ Trung bình tiên tiến (60 - 74đ)" },
  { code: "TRUNG_BINH", label: "⚙️ Trung bình (35 - 59đ)" },
  { code: "LAC_HAU", label: "⚠️ Lạc hậu (< 35đ)" },
  { code: "UNRATED", label: "⚪ Chưa đánh giá" },
];


/**
 * Hàm sinh danh sách các trang phân trang động kèm dấu ba chấm
 */
function getPaginationItems(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | string)[] = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("...");
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push("...");
    pages.push(total);
  }
  return pages;
}

export interface EnterprisesDirectoryProps {
  initialSortBy?: string;
  initialInnovationTier?: string;
  initialTt17Classification?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  badgeLabel?: string;
}

export function EnterprisesDirectoryView(props: EnterprisesDirectoryProps = {}) {
  const {
    initialSortBy = "tni_desc",
    initialInnovationTier = "",
    initialTt17Classification = "",
    pageTitle,
    pageSubtitle,
    badgeLabel,
  } = props;
  const [data, setData] = useState<EnterpriseDirectoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sectors dynamic state (CR-2026-011)
  const [sectors, setSectors] = useState<SectorOption[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(true);
  const [sectorsError, setSectorsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setSectorsLoading(true);
    setSectorsError(false);
    getActiveSectors()
      .then((items) => {
        if (isMounted) {
          setSectors(items);
          setSectorsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSectorsError(true);
          setSectorsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filters & Sorting state
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [sectorCode, setSectorCode] = useState("");
  const [subjectType, setSubjectType] = useState("");
  const [tniClassification, setTniClassification] = useState("");
  const [innovationTier, setInnovationTier] = useState(initialInnovationTier);
  const [tt17Classification, setTt17Classification] = useState(initialTt17Classification);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [page, setPage] = useState(1);

  // Modal đề xuất kết nối
  const [connectModalEnt, setConnectModalEnt] = useState<EnterpriseDirectoryItem | null>(null);
  const [connectOrgName, setConnectOrgName] = useState("");
  const [connectContact, setConnectContact] = useState("");
  const [connectNote, setConnectNote] = useState("");
  const [connectResult, setConnectResult] = useState<{
    requestCode: string;
    submittedAt: string;
    entName: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const loadData = async (
    pageTarget = 1,
    sortOverride?: string,
    filterOverrides?: {
      q?: string;
      province?: string;
      sectorCode?: string;
      subjectType?: string;
      tniClassification?: string;
      innovationTier?: string;
      tt17Classification?: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    const activeQ = filterOverrides?.q !== undefined ? filterOverrides.q : q;
    const activeProvince = filterOverrides?.province !== undefined ? filterOverrides.province : province;
    const activeSectorCode = filterOverrides?.sectorCode !== undefined ? filterOverrides.sectorCode : sectorCode;
    const activeSubjectType = filterOverrides?.subjectType !== undefined ? filterOverrides.subjectType : subjectType;
    const activeTni = filterOverrides?.tniClassification !== undefined ? filterOverrides.tniClassification : tniClassification;
    const activeInnovationTier = filterOverrides?.innovationTier !== undefined ? filterOverrides.innovationTier : innovationTier;
    const activeTt17 = filterOverrides?.tt17Classification !== undefined ? filterOverrides.tt17Classification : tt17Classification;
    const activeSort = sortOverride !== undefined ? sortOverride : sortBy;

    try {
      const res = await fetchEnterprises({
        q: activeQ || undefined,
        province: activeProvince || undefined,
        sectorCode: activeSectorCode || undefined,
        subjectType: activeSubjectType || undefined,
        tniClassification: activeTni || undefined,
        innovationTier: activeInnovationTier || undefined,
        tt17Classification: activeTt17 || undefined,
        sortBy: activeSort,
        page: pageTarget,
        pageSize: 9,
      });
      setData(res);
      setPage(pageTarget);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách doanh nghiệp.");
    } finally {
      setLoading(false);
    }
  };

  const isMountedRef = React.useRef(false);

  // DEFECT-03: Khởi tạo filters từ URL query params khi component mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const urlQ = sp.get("q") || "";
    const urlProvince = sp.get("province") || "";
    const urlSectorCode = sp.get("sectorCode") || "";
    const urlSubjectType = sp.get("subjectType") || "";
    const urlTni = sp.get("tniClassification") || "";
    const urlInnovationTier = sp.get("innovationTier") || initialInnovationTier || "";
    const urlTt17 = sp.get("tt17Classification") || initialTt17Classification || "";
    const urlSort = sp.get("sortBy") || initialSortBy || "tni_desc";

    if (urlQ) setQ(urlQ);
    if (urlProvince) setProvince(urlProvince);
    if (urlSectorCode) setSectorCode(urlSectorCode);
    if (urlSubjectType) setSubjectType(urlSubjectType);
    if (urlTni) setTniClassification(urlTni);
    if (urlInnovationTier) setInnovationTier(urlInnovationTier);
    if (urlTt17) setTt17Classification(urlTt17);
    if (urlSort) setSortBy(urlSort);

    loadData(1, urlSort, {
      q: urlQ,
      province: urlProvince,
      sectorCode: urlSectorCode,
      subjectType: urlSubjectType,
      tniClassification: urlTni,
      innovationTier: urlInnovationTier,
      tt17Classification: urlTt17,
    });
  }, []);

  // DEFECT-03: Đồng bộ state thay đổi ra URL mà không reload trang
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    if (typeof window !== "undefined") {
      const sp = new URLSearchParams();
      if (q) sp.set("q", q);
      if (province) sp.set("province", province);
      if (sectorCode) sp.set("sectorCode", sectorCode);
      if (subjectType) sp.set("subjectType", subjectType);
      if (tniClassification) sp.set("tniClassification", tniClassification);
      if (innovationTier) sp.set("innovationTier", innovationTier);
      if (tt17Classification) sp.set("tt17Classification", tt17Classification);
      if (sortBy && sortBy !== "tni_desc") sp.set("sortBy", sortBy);

      const qs = sp.toString();
      const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }

    loadData(1);
  }, [province, sectorCode, subjectType, tniClassification, innovationTier, tt17Classification, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (q) sp.set("q", q);
      else sp.delete("q");
      const qs = sp.toString();
      const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
    loadData(1);
  };

  const handleResetFilters = () => {
    setQ("");
    setProvince("");
    setSectorCode("");
    setSubjectType("");
    setTniClassification("");
    setInnovationTier("");
    setTt17Classification("");
    setSortBy("tni_desc");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
    loadData(1, "tni_desc", {
      q: "",
      province: "",
      sectorCode: "",
      subjectType: "",
      tniClassification: "",
      innovationTier: "",
      tt17Classification: ""
    });
  };

  const [isSubmittingConnect, setIsSubmittingConnect] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectModalEnt) return;

    setIsSubmittingConnect(true);
    setConnectError(null);
    try {
      const fullMessage = `[Liên hệ: ${connectContact.trim()}] ${connectNote.trim()}`;
      const res = await brokerageApi.createConnectionRequest({
        senderOrgName: connectOrgName.trim(),
        senderRole: "BUYER",
        receiverOrgName: connectModalEnt.name,
        message: fullMessage,
        proposedBudgetRange: "Thỏa thuận",
      });

      setConnectResult({
        requestCode: res.requestCode,
        submittedAt: new Date().toLocaleString("vi-VN"),
        entName: connectModalEnt.name
      });
    } catch (err: any) {
      setConnectError(err.message || "Không thể gửi yêu cầu kết nối. Vui lòng thử lại.");
    } finally {
      setIsSubmittingConnect(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const hasActiveFilters = Boolean(q || province || sectorCode || subjectType || tniClassification || innovationTier || tt17Classification);

  return (
    <div className="min-h-screen bg-surface-page dark:bg-slate-950 text-text-primary dark:text-slate-100 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-brand-700 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0" />
        <div className="relative max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-200 border border-brand-400/30 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            {badgeLabel || "CSDL Quốc Gia Doanh Nghiệp ĐMST & Đổi Mới Công Nghệ"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {pageTitle || "Danh Bạ Doanh Nghiệp & Chủ Thể Đổi Mới Sáng Tạo"}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            {pageSubtitle || "Tra cứu năng lực khoa học công nghệ, bản quyền sở hữu trí tuệ, phòng R&D và chỉ số nhu cầu đổi mới sáng tạo (TNI) của các doanh nghiệp trên 34 tỉnh/thành trọng điểm ĐMST toàn quốc."}
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên doanh nghiệp, mã số thuế (MST), tỉnh thành, ngành nghề..."
                className="w-full h-11 pl-11 pr-4 rounded-control bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-sm"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-6 bg-brand-800 hover:bg-brand-900 text-white rounded-control font-bold flex items-center justify-center gap-2 transition shadow-md text-sm shrink-0 border border-brand-600/40"
            >
              <Search className="w-4 h-4" /> Tra Cứu
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-11 px-4 bg-white/10 hover:bg-white/20 text-white rounded-control font-medium flex items-center justify-center gap-1.5 transition text-xs shrink-0 border border-white/20"
              >
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            )}
          </form>
          {/* Quick CTA Khảo Sát ĐMST (Tối ưu không gian: 1 câu chú thích ngắn gọn + 1 button) */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-white/85 font-medium">
              <Sparkles className="w-4 h-4 text-white/80 shrink-0" />
              Doanh nghiệp của bạn chưa có Điểm ĐMST? Làm bài khảo sát 43 câu để hiển thị trên CSDL Quốc gia và kết nối công nghệ.
            </span>
            <Link
              href="/khao-sat-dmst"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-brand-700 font-bold text-xs transition shadow-xs whitespace-nowrap"
            >
              <span>Làm khảo sát ngay (15 phút)</span>
              <ChevronRight className="w-3.5 h-3.5 text-brand-700" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Bộ Lọc */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="surface-card p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border-default dark:border-slate-800">
                <span className="font-bold text-text-primary dark:text-white text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-700" /> Bộ Lọc Đa Chiều
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-brand-700 dark:text-brand-400 hover:underline font-semibold"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Lọc Tỉnh Thành */}
              <div>
                <label className="block text-label font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Địa Bàn Hoạt Động (Tỉnh/Thành)
                </label>
                <SearchableProvinceCombobox
                  value={province}
                  onChange={(val) => setProvince(val)}
                  placeholder="Tất cả Tỉnh / Thành phố"
                />
              </div>

              {/* Lọc Lĩnh Vực TT17 */}
              <div>
                <label htmlFor="filter-sector" className="block text-label font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Lĩnh Vực Công Nghệ TT17
                </label>
                <select
                  id="filter-sector"
                  value={sectorCode}
                  onChange={(e) => setSectorCode(e.target.value)}
                  className="form-control w-full"
                  disabled={sectorsLoading}
                >
                  <option value="">
                    {sectorsLoading
                      ? "Đang tải danh mục lĩnh vực..."
                      : sectorsError
                      ? "Lỗi tải lĩnh vực (chọn tất cả)"
                      : "Tất cả lĩnh vực công nghệ"}
                  </option>
                  {sectors.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Lọc Loại Hình Chủ Thể */}
              <div>
                <label className="block text-label font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Loại Hình Chủ Thể
                </label>
                <select
                  value={subjectType}
                  onChange={(e) => setSubjectType(e.target.value)}
                  className="form-control w-full"
                >
                  {SUBJECT_TYPES.map((t) => (
                    <option key={t.code} value={t.code}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Lọc Phân Tầng TNI */}
              <div>
                <label className="block text-label font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Chỉ Số Nhu Cầu ĐMST (TNI)
                </label>
                <select
                  value={tniClassification}
                  onChange={(e) => setTniClassification(e.target.value)}
                  className="form-control w-full"
                >
                  {TNI_LEVELS.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Lọc Trình Độ Công Nghệ TT17 */}
              <div>
                <label className="block text-label font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Trình Độ Công Nghệ (TT17)
                </label>
                <select
                  value={tt17Classification}
                  onChange={(e) => setTt17Classification(e.target.value)}
                  className="form-control w-full"
                >
                  {TT17_LEVELS.map((lvl) => (
                    <option key={lvl.code} value={lvl.code}>{lvl.label}</option>
                  ))}
                </select>
              </div>

              {/* Lọc Mức Độ ĐMST 8 Nhóm */}
              <div>
                <label className="block text-label font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Mức Độ ĐMST (Thang 100đ)
                </label>
                <select
                  value={innovationTier}
                  onChange={(e) => setInnovationTier(e.target.value)}
                  className="form-control w-full"
                >
                  {INNOVATION_TIERS.map((tier) => (
                    <option key={tier.code} value={tier.code}>{tier.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Box Dashboard Link */}
            <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-brand-200/80 dark:border-slate-700 p-5 space-y-3">
              <div className="flex items-center gap-2 text-brand-900 dark:text-brand-300 font-bold text-sm">
                <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Thống Kê Doanh Nghiệp ĐMST
              </div>
              <p className="text-xs text-brand-700 dark:text-slate-300 leading-relaxed">
                Xem báo cáo phân tích biểu đồ chuyên sâu về phân bố địa bàn, cơ cấu ngành nghề và rào cản công nghệ.
              </p>
              <Link
                href="/admin/enterprises/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Mở Analytics Dashboard <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Grid Thẻ Doanh Nghiệp */}
          <section className="lg:col-span-3 space-y-6">
            {/* Thanh Tiêu Đề & Sorting Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Kết quả tra cứu:{" "}
                <span className="text-brand-700 dark:text-brand-400 font-extrabold">{data?.totalCount ?? 0}</span> doanh nghiệp
              </span>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-semibold hidden sm:inline">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      const newSort = e.target.value;
                      setSortBy(newSort);
                      loadData(1, newSort);
                    }}
                    className="form-control text-xs py-1 px-2.5 h-8 font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="tni_desc">Chỉ số TNI cao nhất</option>
                    <option value="tt17_desc">Điểm trình độ TT17 cao nhất</option>
                    <option value="innovation_desc">Điểm ĐMST cao nhất</option>
                    <option value="ip_desc">Nhiều sáng chế / SHTT nhất</option>
                    <option value="name_asc">Tên doanh nghiệp (A → Z)</option>
                    <option value="name_desc">Tên doanh nghiệp (Z → A)</option>
                    <option value="recent">Mới cập nhật</option>
                  </select>
                </div>
                <div className="text-xs text-slate-400 hidden md:block">
                  Trang {data?.page ?? 1} / {data?.totalPages ?? 1}
                </div>
              </div>
            </div>

            {/* UX STATE: LOADING */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
                    </div>
                    <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl mt-4"></div>
                  </div>
                ))}
              </div>
            )}

            {/* UX STATE: ERROR */}
            {!loading && error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="font-bold text-red-900 dark:text-red-200 text-base">Đã xảy ra lỗi khi tải dữ liệu</h3>
                <p className="text-xs text-red-600 dark:text-red-400 max-w-md mx-auto">{error}</p>
                <button
                  onClick={() => loadData(page)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 inline-flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                </button>
              </div>
            )}

            {/* UX STATE: EMPTY */}
            {!loading && !error && data && data.items.length === 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Không tìm thấy doanh nghiệp phù hợp</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Hãy thử điều chỉnh bộ lọc địa bàn, ngành nghề hoặc xóa từ khóa tìm kiếm để khám phá thêm doanh nghiệp khác.
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-brand-700 text-white rounded-xl text-xs font-bold hover:bg-brand-800 transition"
                  >
                    Xem tất cả doanh nghiệp
                  </button>
                  {tt17Classification && (
                    <button
                      onClick={() => setTt17Classification("")}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition border border-slate-300 dark:border-slate-700"
                    >
                      Xóa bộ lọc TT17
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* UX STATE: SUCCESS (Cards Grid - 5 Tầng Thông Tin Cốt Lõi) */}
            {!loading && !error && data && data.items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.items.map((ent) => (
                  <div
                    key={ent.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg transition flex flex-col justify-between p-5 relative group"
                  >
                    <div>
                      {/* TẦNG 1: Avatar Nhận Diện & Định Danh */}
                      <div className="flex items-start gap-3 mb-3">
                        <EnterpriseAvatar
                          name={ent.name}
                          sectorName={ent.mainSectorName}
                          sectorCode={ent.sectorCode}
                          website={ent.website}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              MST: {ent.taxCode}
                            </span>
                            {ent.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                Đã xác thực
                              </span>
                            )}
                            {ent.tt17Classification === "TIEN_TIEN" && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                                🚀 Tiên tiến (TT17)
                              </span>
                            )}
                            {ent.tt17Classification === "TRUNG_BINH_TIEN_TIEN" && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                ⚡ TB Tiên tiến (TT17)
                              </span>
                            )}
                            {ent.tt17Classification === "TRUNG_BINH" && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                                ⚙️ Trung bình (TT17)
                              </span>
                            )}
                            {ent.tt17Classification === "LAC_HAU" && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                ⚠️ Lạc hậu (TT17)
                              </span>
                            )}
                            {(ent.innovationTier === "LEADING" || (ent.innovationScore && ent.innovationScore >= 75)) && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                ⭐️ Vàng ĐMST
                              </span>
                            )}
                            {(ent.innovationTier === "DEVELOPING" || (ent.innovationScore && ent.innovationScore >= 50 && ent.innovationScore < 75)) && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                                🥈 Bạc ĐMST
                              </span>
                            )}
                            {(ent.innovationTier === "POTENTIAL" || (ent.innovationScore && ent.innovationScore < 50 && ent.innovationScore > 0)) && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
                                🥉 Đồng ĐMST
                              </span>
                            )}
                            {ent.ownershipType && (
                              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                                {ent.ownershipType}
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/enterprises/${ent.taxCode}`}
                            className="font-bold text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-400 line-clamp-2 text-sm leading-snug transition"
                            title={ent.name}
                          >
                            {ent.name}
                          </Link>
                        </div>
                      </div>

                      {/* TẦNG 2: Vị Thế Địa Bàn & Ngành Nghề */}
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{ent.provinceCity || "Toàn quốc"}</span>
                          {ent.operatingZone && ent.operatingZone !== "Ngoài các khu trên" && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-medium truncate max-w-[130px]" title={ent.operatingZone}>
                              {ent.operatingZone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-start gap-2">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 font-medium">{ent.mainSectorName || "Chưa phân ngành"}</span>
                        </div>
                        {ent.workforceScale && (
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Quy mô: {ent.workforceScale}</span>
                          </div>
                        )}
                      </div>

                      {/* TẦNG 3: Năng Lực R&D, Chuỗi Giá Trị & Xuất Khẩu (Chỉ hiển thị khi có dữ liệu) */}
                      {(ent.hasRdUnit || ent.inValueChain || ent.isExporting) && (
                        <div className="flex items-center gap-1.5 flex-wrap text-xs mb-3">
                          {ent.hasRdUnit && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium">
                              <FlaskConical className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Có phòng R&D
                            </span>
                          )}
                          {ent.inValueChain && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-medium">
                              <Globe className="w-3 h-3 text-sky-600 dark:text-sky-400" /> Chuỗi giá trị
                            </span>
                          )}
                          {ent.isExporting && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-medium">
                              <TrendingUp className="w-3 h-3 text-teal-600 dark:text-teal-400" /> Xuất khẩu
                            </span>
                          )}
                        </div>
                      )}

                      {/* TẦNG 4: Hộp Chỉ Số 2 Trục Đối Quát (Trình Độ TT17 & Nhu Cầu TNI) & SHTT */}
                      <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-3 grid gap-2 ${
                        (ent.ipCount && ent.ipCount > 0) ? "grid-cols-3" : "grid-cols-2"
                      }`}>
                        {/* Cột 1: Trình Độ Công Nghệ TT17 (Trục Cung / Năng lực) */}
                        <div>
                          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Trình độ TT17</div>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-sm font-extrabold text-sky-700 dark:text-sky-400">
                              {ent.tt17Score !== undefined && ent.tt17Score !== null ? ent.tt17Score.toFixed(1) : "--"}
                            </span>
                            <span className="text-xs text-slate-400">/100</span>
                          </div>
                          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5 truncate" title={
                            ent.tt17Classification === "TIEN_TIEN" ? "Tiên tiến" :
                            ent.tt17Classification === "TRUNG_BINH_TIEN_TIEN" ? "TB Tiên tiến" :
                            ent.tt17Classification === "TRUNG_BINH" ? "Trung bình" :
                            ent.tt17Classification === "LAC_HAU" ? "Lạc hậu" : "Chưa đánh giá"
                          }>
                            {ent.tt17Classification === "TIEN_TIEN" ? `Tiên tiến${ent.tt17SyncCoefficient ? ` (T_ĐB: ${ent.tt17SyncCoefficient.toFixed(2)})` : ""}` :
                             ent.tt17Classification === "TRUNG_BINH_TIEN_TIEN" ? `TB Tiên tiến${ent.tt17SyncCoefficient ? ` (T_ĐB: ${ent.tt17SyncCoefficient.toFixed(2)})` : ""}` :
                             ent.tt17Classification === "TRUNG_BINH" ? `Trung bình${ent.tt17SyncCoefficient ? ` (T_ĐB: ${ent.tt17SyncCoefficient.toFixed(2)})` : ""}` :
                             ent.tt17Classification === "LAC_HAU" ? "Lạc hậu" :
                             <span className="text-slate-400 dark:text-slate-500 font-normal">Chưa đánh giá TT17</span>}
                          </div>
                        </div>

                        {/* Cột 2: Chỉ Số Nhu Cầu TNI (Trục Cầu / Cấp thiết) */}
                        <div className="border-l border-slate-200 dark:border-slate-700 pl-2">
                          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Chỉ số TNI</div>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-sm font-extrabold text-brand-700 dark:text-brand-400">
                              {ent.tniScore !== undefined && ent.tniScore !== null ? ent.tniScore.toFixed(1) : "--"}
                            </span>
                            <span className="text-xs text-slate-400">/100</span>
                          </div>
                          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                            {ent.tniClassification === "VERY_HIGH" ? "Cấp thiết (≥85)" :
                             ent.tniClassification === "HIGH" ? "Nhu cầu cao (75-84)" :
                             ent.tniClassification === "MEDIUM" ? "Trung bình (50-74)" : "Cơ bản"}
                          </div>
                        </div>

                        {/* Cột 3: Bằng SHTT (Tôn vinh dữ liệu mạnh) */}
                        {ent.ipCount !== undefined && ent.ipCount > 0 && (
                          <div className="border-l border-slate-200 dark:border-slate-700 pl-2">
                            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Bằng SHTT</div>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                                {ent.ipCount}
                              </span>
                              <span className="text-xs text-slate-400">sáng chế</span>
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
                              Đã công bố Cục SHTT
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Huy Hiệu & Điểm Năng Lực ĐMST (8 Nhóm Tiêu Chí) */}
                      {ent.innovationScore !== undefined && ent.innovationScore !== null && ent.innovationScore > 0 && (
                        <div className="mb-3 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 dark:from-slate-800/80 dark:to-slate-800/80 border border-amber-200/80 dark:border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {ent.innovationTier === "LEADING" || ent.innovationScore >= 75 ? (
                              <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                ⭐️ ĐMST Dẫn Đầu
                              </span>
                            ) : ent.innovationTier === "DEVELOPING" || ent.innovationScore >= 50 ? (
                              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                🥈 ĐMST Đang Phát Triển
                              </span>
                            ) : (
                              <span className="text-xs font-extrabold text-orange-700 dark:text-orange-300 flex items-center gap-1">
                                🥉 ĐMST Tiềm Năng
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-0.5 font-black text-slate-900 dark:text-white text-xs">
                            <span className="text-sm font-black text-brand-700 dark:text-brand-400">{ent.innovationScore.toFixed(1)}</span>
                            <span className="text-xs text-slate-400 font-semibold">/100đ</span>
                          </div>
                        </div>
                      )}

                      {/* Top Nhu Cầu Hỗ Trợ Nổi Bật Tag Pills */}
                      {ent.supportNeeds && ent.supportNeeds.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Nhu cầu hỗ trợ nổi bật:
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {ent.supportNeeds.slice(0, 3).map((need, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                              >
                                {need}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* TẦNG 5: Action Controls */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setConnectModalEnt(ent);
                          setConnectResult(null);
                          setConnectOrgName("");
                          setConnectContact("");
                          setConnectNote("");
                        }}
                        className="btn-press inline-flex items-center px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:hover:bg-brand-900 dark:text-cyan-300 font-bold text-xs transition cursor-pointer"
                      >
                        Kết Nối
                      </button>
                      <Link
                        href={`/enterprises/${ent.taxCode}`}
                        className="inline-flex items-center gap-0.5 font-bold text-brand-700 hover:text-brand-800 dark:text-cyan-400 dark:hover:text-cyan-300 text-xs transition"
                      >
                        <span>Hồ Sơ Chi Tiết</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Thuật Toán Động (Có Ellipsis ...) */}
            {!loading && data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => loadData(page - 1)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Trước
                </button>

                {getPaginationItems(data.page, data.totalPages).map((pItem, idx) => {
                  if (pItem === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-400">
                        ...
                      </span>
                    );
                  }
                  const pNum = Number(pItem);
                  return (
                    <button
                      key={pNum}
                      onClick={() => loadData(pNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        pNum === page
                          ? "bg-brand-700 text-white shadow-sm"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={page >= data.totalPages}
                  onClick={() => loadData(page + 1)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1"
                >
                  Sau <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODAL KẾT NỐI HỢP TÁC (Zero-Mock Minh Bạch) */}
      {connectModalEnt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setConnectModalEnt(null);
                setConnectResult(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-0.5 rounded-full mb-2">
                <Send className="w-3.5 h-3.5" /> Gửi Đề Xuất Kết Nối Công Nghệ
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                {connectModalEnt.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Mã số thuế: <span className="font-mono font-semibold">{connectModalEnt.taxCode}</span> • Địa bàn: {connectModalEnt.provinceCity}
              </p>
            </div>

            {connectResult ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center space-y-4">
                <FileCheck2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-base">Đã Ghi Nhận Đề Xuất Kết Nối!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                    Yêu cầu kết nối của bạn đã được lưu vào hệ thống điều phối Nacentwin.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-left space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Mã đề xuất:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-brand-700 dark:text-brand-400">{connectResult.requestCode}</span>
                      <button
                        onClick={() => handleCopyCode(connectResult.requestCode)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Sao chép mã"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Thời gian tiếp nhận:</span>
                    <span>{connectResult.submittedAt}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Trạng thái:</span>
                    <span className="font-bold text-amber-600">Đang chờ thẩm định kết nối</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cán bộ phụ trách sẽ liên hệ qua thông tin bạn đã cung cấp trong vòng 24–48h làm việc.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setConnectModalEnt(null);
                    setConnectResult(null);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
                >
                  Đóng cửa sổ
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Đơn vị / Cá nhân đề xuất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={connectOrgName}
                    onChange={(e) => setConnectOrgName(e.target.value)}
                    placeholder="VD: Viện Công Nghệ Nacentech, Công ty CP Đầu Tư..."
                    className="w-full text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Thông tin liên hệ (Email hoặc Số điện thoại) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={connectContact}
                    onChange={(e) => setConnectContact(e.target.value)}
                    placeholder="VD: contact@nacentech.vn / 0912345678"
                    className="w-full text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nội dung đề xuất hợp tác / Nhu cầu liên kết công nghệ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={connectNote}
                    onChange={(e) => setConnectNote(e.target.value)}
                    placeholder="Mô tả tóm tắt nhu cầu cung ứng thiết bị, tìm kiếm chuyển giao công nghệ, hợp tác R&D hoặc tư vấn..."
                    className="w-full text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  * Theo quy định bảo vệ dữ liệu cá nhân NĐ 13/2023/NĐ-CP, thông tin liên lạc của đại diện doanh nghiệp sẽ được kết nối chính thức sau khi hồ sơ đáp ứng tiêu chí sơ tuyển.
                </div>

                {connectError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{connectError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConnectModalEnt(null);
                      setConnectError(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingConnect}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white shadow-md flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmittingConnect ? "Đang gửi..." : "Gửi Đề Xuất"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EnterprisesDirectoryView;
