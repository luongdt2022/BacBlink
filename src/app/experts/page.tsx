"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Check,
  Sparkles,
  ChevronRight,
  Send,
  X,
  Award,
  Layers,
  GraduationCap,
  Building2,
  RefreshCw,
  MessageSquarePlus,
  AlertCircle,
} from "lucide-react";
import { AppLink, AppButton } from "@/components/ui/design-system";
import { API_BASE } from "@/lib/api-client";
import { getPublicExpertFilterOptions, type MasterDataOption } from "@/lib/master-data-client";

interface ExpertCardItem {
  expertCode: string;
  fullName: string;
  academicRank: string;
  degree: string;
  organizationName: string;
  positionTitle?: string | null;
  primarySectorCode?: string | null;
  primarySectorName?: string | null;
  expertiseSectors: string[];
  masteredTechCodes: string[];
  provinceCode?: string | null;
  provinceName?: string | null;
  publicationCount: number;
  patentCount: number;
  projectCount: number;
  isVerified: boolean;
  isAcceptingConsultation: boolean;
}

interface DirectoryResponse {
  items: ExpertCardItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEGREE_OPTIONS = [
  { value: "GS", label: "Giáo sư (GS)" },
  { value: "PGS", label: "Phó Giáo sư (PGS)" },
  { value: "DOCTOR", label: "Tiến sĩ (TS / TSKH)" },
  { value: "MASTER", label: "Thạc sĩ / Kỹ sư chính" },
];

export default function ExpertsDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDegree, setSelectedDegree] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [acceptingConsultation, setAcceptingConsultation] = useState(false);
  const [sectorOptions, setSectorOptions] = useState<MasterDataOption[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<MasterDataOption[]>([]);
  const [filterDataLoaded, setFilterDataLoaded] = useState(false);
  const [filterDataError, setFilterDataError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [directoryData, setDirectoryData] = useState<DirectoryResponse>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 9,
    totalPages: 1,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetExpert, setModalTargetExpert] = useState<ExpertCardItem | null>(null);
  const [modalCompanyName, setModalCompanyName] = useState("");
  const [modalContactName, setModalContactName] = useState("");
  const [modalContactPhone, setModalContactPhone] = useState("");
  const [modalContactEmail, setModalContactEmail] = useState("");
  const [modalProblemSummary, setModalProblemSummary] = useState("");
  const [modalMode, setModalMode] = useState("ONLINE");
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [modalSending, setModalSending] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchDirectory = async (
    overrideQ?: string,
    overrideDegree?: string,
    overrideSector?: string,
    overrideProvince?: string,
    overridePage?: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const qVal = overrideQ !== undefined ? overrideQ : searchTerm;
      const degVal = overrideDegree !== undefined ? overrideDegree : selectedDegree;
      const secVal = overrideSector !== undefined ? overrideSector : selectedSector;
      const provVal = overrideProvince !== undefined ? overrideProvince : selectedProvince;
      const pageVal = overridePage !== undefined ? overridePage : currentPage;

      const params = new URLSearchParams();
      if (qVal.trim()) params.set("q", qVal.trim());
      if (degVal) params.set("degree", degVal);
      if (secVal) params.set("sectorCode", secVal);
      if (provVal) params.set("provinceCode", provVal);
      if (acceptingConsultation) params.set("acceptingConsultation", "true");
      params.set("page", pageVal.toString());
      params.set("pageSize", "9");

      const res = await fetch(`${API_BASE}/api/v1/public/experts?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Lỗi tải danh bạ chuyên gia (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setDirectoryData(json.data);
      } else {
        throw new Error(json.message || "Dữ liệu không hợp lệ");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const requestedSector = new URLSearchParams(window.location.search).get("sector");
    if (requestedSector) setSelectedSector(requestedSector);
  }, []);

  useEffect(() => {
    fetchDirectory();
  }, [currentPage, selectedDegree, selectedSector, selectedProvince, acceptingConsultation]);

  const loadFilterData = async () => {
    setFilterDataError(null);
    try {
      const filters = await getPublicExpertFilterOptions();
      setSectorOptions(filters.sectors);
      setProvinceOptions(filters.provinces);
      setFilterDataLoaded(true);
    } catch (err) {
      setFilterDataError(err instanceof Error ? err.message : "Không tải được danh mục bộ lọc.");
    }
  };

  useEffect(() => { void loadFilterData(); }, []);

  // Debounce Search 300ms theo TC-C2-EXP-DIR02
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchDirectory(searchTerm, selectedDegree, selectedSector, selectedProvince, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDirectory(searchTerm, selectedDegree, selectedSector, selectedProvince, 1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDegree("");
    setSelectedSector("");
    setSelectedProvince("");
    setAcceptingConsultation(false);
    setCurrentPage(1);
    setMobileFiltersOpen(false);
  };

  const openConnectModal = (expert: ExpertCardItem) => {
    setModalTargetExpert(expert);
    setModalCompanyName("");
    setModalContactName("");
    setModalContactPhone("");
    setModalContactEmail("");
    setModalProblemSummary("");
    setModalMode("ONLINE");
    setModalSubmitted(false);
    setModalError(null);
    setModalOpen(true);
  };

  const handleSendConnectRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTargetExpert) return;
    setModalError(null);
    setModalSending(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/public/experts/${encodeURIComponent(modalTargetExpert.expertCode)}/consultation-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: modalContactName,
          organizationName: modalCompanyName,
          email: modalContactEmail,
          phone: modalContactPhone,
          message: `${modalProblemSummary}\nHình thức tư vấn: ${modalMode === "ONLINE" ? "Trực tuyến" : "Khảo sát trực tiếp"}`,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Chưa gửi được yêu cầu. Vui lòng thử lại.");
      setModalSubmitted(true);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Chưa gửi được yêu cầu. Vui lòng thử lại.");
    } finally {
      setModalSending(false);
    }
  };

  const getRankBadge = (rank: string, degree: string) => {
    if (rank === "GS") return { label: "Giáo sư (GS)", cls: "bg-brand-50 text-brand-800 border-brand-200" };
    if (rank === "PGS") return { label: "Phó Giáo sư (PGS)", cls: "bg-brand-50 text-brand-800 border-brand-200" };
    if (degree === "DOCTOR") return { label: "Tiến sĩ (TS)", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    return { label: "Thạc sĩ / KS", cls: "bg-slate-100 text-slate-800 border-slate-200" };
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. HERO SEARCH BANNER */}
      <section className="workspace-banner text-white py-7 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <nav className="flex items-center gap-2 text-caption text-brand-100 mb-4 font-medium">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-200" />
            <span className="text-white font-semibold">Danh bạ Chuyên gia KH&CN</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-brand-100 text-caption font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              Mạng lưới Nhà khoa học & Chuyên gia Đổi mới Sáng tạo
            </div>
            <h1 className="font-extrabold tracking-tight text-white leading-tight type-page-title">
              Danh Bạ Chuyên Gia Khoa Học & Công Nghệ
            </h1>
            <p className="mt-2 text-caption text-brand-100 leading-relaxed max-w-2xl">
              Tìm chuyên gia theo năng lực, lĩnh vực KH&CN đã chuẩn hóa và địa bàn thẩm định để giải quyết bài toán kỹ thuật.
            </p>

            {/* Big Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-4 bg-white p-1.5 rounded-xl shadow-lg flex flex-col sm:flex-row gap-1.5 max-w-3xl">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo họ tên chuyên gia, đơn vị công tác, từ khóa nghiên cứu..."
                  className="w-full pl-11 pr-4 py-2.5 text-body text-slate-800 placeholder-slate-400 bg-transparent rounded-lg focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-label font-bold rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Search className="w-4 h-4" />
                Tìm kiếm
              </button>
            </form>

            {/* Quick chips */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-caption text-brand-100">
              <span className="font-medium text-brand-200">Xu hướng:</span>
              {["#Trí tuệ nhân tạo", "#Vật liệu nano", "#Năng lượng tái tạo", "#Cơ khí chính xác"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const term = tag.replace("#", "");
                    setSearchTerm(term);
                    setCurrentPage(1);
                    fetchDirectory(term, selectedDegree, selectedSector, selectedProvince, 1);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition text-caption"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN LAYOUT (SIDEBAR FILTER + CARDS GRID) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1">
        <button type="button" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} aria-expanded={mobileFiltersOpen} className="lg:hidden mb-3 px-3 py-2 rounded-lg border border-slate-200 bg-white text-caption font-semibold text-slate-700">
          {mobileFiltersOpen ? "Đóng bộ lọc" : "Bộ lọc & tiêu chí"}
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)] gap-5 items-start">

          {/* LEFT SIDEBAR: BỘ LỌC 4 TRỤC */}
          <aside className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block bg-white rounded-xl border border-slate-200 p-4 shadow-xs lg:sticky lg:top-20 dark:bg-slate-900 dark:border-slate-800`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-700 dark:text-brand-200" />
                <h2 className="text-card-title font-bold text-slate-900 dark:text-white">Bộ Lọc Chuyên Sâu</h2>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-caption font-semibold text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-white"
              >
                Đặt lại
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-body dark:divide-slate-800">
              {/* Trục 1: Học vị */}
              <div className="py-4">
                <label className="block text-caption font-bold uppercase tracking-wider text-slate-500 mb-2.5 dark:text-slate-400">
                  Học hàm & Học vị
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-caption text-slate-700 cursor-pointer dark:text-slate-300">
                    <input
                      type="radio"
                      name="degree"
                      checked={selectedDegree === ""}
                  onChange={() => { setCurrentPage(1); setSelectedDegree(""); }}
                      className="text-brand-700 focus:ring-brand-500"
                    />
                    <span>Tất cả học vị</span>
                  </label>
                  {DEGREE_OPTIONS.map((deg) => (
                    <label key={deg.value} className="flex items-center gap-2.5 text-caption text-slate-700 cursor-pointer dark:text-slate-300">
                      <input
                        type="radio"
                        name="degree"
                        checked={selectedDegree === deg.value}
                        onChange={() => { setCurrentPage(1); setSelectedDegree(deg.value); }}
                        className="text-brand-700 focus:ring-brand-500"
                      />
                      <span>{deg.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Taxonomy SECTOR từ API/DB */}
              <div className="py-4">
                <label className="block text-caption font-bold uppercase tracking-wider text-slate-500 mb-2.5 dark:text-slate-400">
                  Lĩnh vực chuyên môn{filterDataLoaded ? ` (${sectorOptions.length})` : ""}
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <label className="flex items-center gap-2.5 text-caption text-slate-700 cursor-pointer dark:text-slate-300">
                    <input
                      type="radio"
                      name="sector"
                      checked={selectedSector === ""}
                      onChange={() => { setCurrentPage(1); setSelectedSector(""); }}
                      className="text-brand-700 focus:ring-brand-500"
                    />
                    <span>Tất cả ngành nghề</span>
                  </label>
                  {sectorOptions.map((sec) => (
                    <label key={sec.code} className="flex items-center gap-2.5 text-caption text-slate-700 cursor-pointer dark:text-slate-300">
                      <input
                        type="radio"
                        name="sector"
                        checked={selectedSector === sec.code}
                        onChange={() => { setCurrentPage(1); setSelectedSector(sec.code); }}
                        className="text-brand-700 focus:ring-brand-500"
                      />
                      <span className="truncate">{sec.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Trục 3: Địa bàn Sở Tỉnh */}
              <div className="py-4">
                <label className="block text-caption font-bold uppercase tracking-wider text-slate-500 mb-2.5 dark:text-slate-400">
                  Địa bàn Tỉnh / Thành phố
                </label>
                <select
                  value={selectedProvince}
                  onChange={(e) => { setCurrentPage(1); setSelectedProvince(e.target.value); }}
                  className="w-full text-caption rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                  <option value="">Tất cả địa bàn</option>
                  {provinceOptions.map((prov) => (
                    <option key={prov.code} value={prov.code}>
                      {prov.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trục 4: Tiêu chí kiểm định */}
              <div className="py-4">
                <label className="block text-caption font-bold uppercase tracking-wider text-slate-500 mb-2.5 dark:text-slate-400">
                  Trạng thái chuyên gia
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-caption text-slate-700 cursor-pointer dark:text-slate-300">
                    <input type="checkbox" checked={acceptingConsultation} onChange={(e) => { setCurrentPage(1); setAcceptingConsultation(e.target.checked); }} className="w-4 h-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500" />
                    <span>Sẵn sàng tiếp nhận tư vấn</span>
                  </label>
                  <p className="text-caption text-slate-500 dark:text-slate-400">Danh bạ chỉ hiển thị hồ sơ đã duyệt và công khai.</p>
                </div>
              </div>
            </div>

            {filterDataError && <div role="alert" className="mt-3 text-caption text-red-700 dark:text-red-300">{filterDataError} <button type="button" onClick={() => void loadFilterData()} className="underline font-semibold">Thử lại</button></div>}

            <button type="button" onClick={() => setMobileFiltersOpen(false)} className="lg:hidden mt-3 w-full py-2 rounded-lg bg-brand-700 text-white text-caption font-semibold">
              Xong
            </button>
          </aside>

          {/* RIGHT CONTENT: GRID CARDS & 5 UX STATES */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <div>
                <div className="text-body font-bold text-slate-900 dark:text-white">
                  Tìm thấy{" "}
                  <span className="text-brand-700 font-extrabold font-mono dark:text-brand-200">{directoryData.totalCount}</span> chuyên gia
                  phù hợp
                </div>
                <p className="text-caption text-slate-500 mt-0.5 dark:text-slate-400">
                  Hồ sơ đã được phê duyệt và công khai.
                </p>
              </div>

              <span className="text-caption text-slate-500 dark:text-slate-400">Ưu tiên học hàm, sau đó cập nhật gần nhất</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="expert-loading-grid">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs animate-pulse space-y-4 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-200 rounded-2xl dark:bg-slate-800"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-24 dark:bg-slate-800"></div>
                        <div className="h-4 bg-slate-200 rounded w-36 dark:bg-slate-800"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-full dark:bg-slate-800"></div>
                    <div className="h-10 bg-slate-100 rounded-xl dark:bg-slate-800"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-4 dark:bg-slate-900 dark:border-red-900/50" data-testid="expert-error-state">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto dark:bg-red-950/60 dark:text-red-300">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-card-title font-bold text-slate-900 dark:text-white">Không thể tải dữ liệu danh bạ</h3>
                <p className="text-caption text-slate-500 max-w-md mx-auto dark:text-slate-400">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchDirectory()}
                  className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-caption font-bold rounded-xl inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                </button>
              </div>
            ) : directoryData.items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 dark:bg-slate-900 dark:border-slate-800" data-testid="expert-empty-state">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto dark:bg-slate-800 dark:text-slate-500">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-card-title font-bold text-slate-900 dark:text-white">Không tìm thấy chuyên gia phù hợp</h3>
                <p className="text-caption text-slate-500 max-w-md mx-auto dark:text-slate-400">
                  Không có chuyên gia nào khớp với các tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Vui lòng nới lỏng bộ lọc.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-caption font-bold rounded-xl dark:bg-slate-800 dark:text-slate-200"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="expert-card-grid">
                {directoryData.items.map((expert) => {
                  const badge = getRankBadge(expert.academicRank, expert.degree);
                  return (
                    <div
                      key={expert.expertCode}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-brand-300 transition-colors flex flex-col justify-between group dark:bg-slate-900 dark:border-slate-800"
                    >
                      <div>
                        <div className="flex items-start gap-3.5">
                          <div className="relative shrink-0">
                            <div className="w-11 h-11 rounded-xl bg-brand-700 flex items-center justify-center text-white font-extrabold text-body">
                              {getInitials(expert.fullName)}
                            </div>
                            {expert.isVerified && (
                              <span
                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white"
                                title="Đã xác thực"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-caption font-bold border ${badge.cls}`}>
                                {badge.label}
                              </span>
                              <span className="px-2 py-0.5 rounded text-caption font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                <ShieldCheck className="w-3 h-3" /> Đã xác thực
                              </span>
                            </div>
                            <h3 className="text-body font-extrabold text-slate-900 mt-1 group-hover:text-brand-700 transition truncate dark:text-white dark:group-hover:text-brand-200">
                              <Link href={`/experts/${expert.expertCode}`}>{expert.fullName}</Link>
                            </h3>
                            <p className="text-caption text-slate-500 truncate mt-0.5 dark:text-slate-400" title={expert.organizationName}>
                              {expert.organizationName}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                          <div className="text-caption font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                            Lĩnh vực TT17 chính:
                          </div>
                          <span className="inline-block px-2.5 py-1 rounded-lg text-caption font-bold bg-brand-50 text-brand-800 border border-brand-200 dark:bg-brand-950/70 dark:text-brand-200 dark:border-brand-800">
                            {sectorOptions.find((s) => s.code === expert.primarySectorCode)?.name ||
                              expert.primarySectorName ||
                              "Công nghệ chủ chốt"}
                          </span>

                          {expert.masteredTechCodes && expert.masteredTechCodes.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {expert.masteredTechCodes.slice(0, 3).map((code) => (
                                <span key={code} className="px-2 py-0.5 rounded text-caption bg-slate-100 text-slate-600 font-mono dark:bg-slate-800 dark:text-slate-300">
                                  {code}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-center dark:bg-slate-800/60">
                          <div>
                            <div className="text-caption font-extrabold text-slate-800 font-mono dark:text-slate-200">
                              {expert.publicationCount > 0 ? `${expert.publicationCount}+` : "0"}
                            </div>
                            <div className="text-caption text-slate-500 dark:text-slate-400">Công bố</div>
                          </div>
                          <div>
                            <div className="text-caption font-extrabold text-slate-800 font-mono dark:text-slate-200">
                              {expert.patentCount > 0 ? expert.patentCount : "0"}
                            </div>
                            <div className="text-caption text-slate-500 dark:text-slate-400">Sáng chế</div>
                          </div>
                          <div>
                            <div className="text-caption font-extrabold text-brand-700 font-mono dark:text-brand-200">
                              {expert.projectCount > 0 ? expert.projectCount : "0"}
                            </div>
                            <div className="text-caption text-slate-500 dark:text-slate-400">Đề tài KH</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 dark:border-slate-800">
                        <Link
                          href={`/experts/${expert.expertCode}`}
                          className="flex-1 py-2 text-center text-caption font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition dark:bg-brand-950/60 dark:text-brand-200 dark:hover:bg-brand-900/60"
                        >
                          Xem hồ sơ chi tiết
                        </Link>
                        <button
                          type="button"
                          onClick={() => openConnectModal(expert)}
                          data-testid="connect-expert-btn"
                          className="px-3 py-2 text-caption font-bold text-slate-700 hover:text-brand-700 hover:bg-brand-50 rounded-xl border border-slate-200 transition flex items-center gap-1.5 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"
                          title="Gửi yêu cầu kết nối"
                        >
                          <MessageSquarePlus className="w-4 h-4" />
                          <span>Kết nối</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {directoryData.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 text-caption dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Trang <span className="font-bold text-slate-700 dark:text-slate-200">{directoryData.page}</span> /{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">{directoryData.totalPages}</span> (Tổng số{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">{directoryData.totalCount}</span> chuyên gia)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                  >
                    Trước
                  </button>
                  {Array.from({ length: directoryData.totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setCurrentPage(pg)}
                      className={`px-3 py-1.5 rounded-lg text-caption font-bold ${
                        currentPage === pg
                          ? "bg-brand-700 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage >= directoryData.totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(directoryData.totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>

      {modalOpen && modalTargetExpert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in duration-200 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center dark:bg-brand-950 dark:text-brand-200">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-card-title font-bold text-slate-900 dark:text-white">Gửi Yêu Cầu Kết Nối & Tư Vấn</h3>
                <p className="text-caption text-slate-500 mt-0.5 dark:text-slate-400">
                  Gửi tới: <span className="font-semibold text-slate-700 dark:text-slate-200">{modalTargetExpert.fullName}</span> (
                  {modalTargetExpert.organizationName})
                </p>
              </div>
            </div>

            {modalSubmitted ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto dark:bg-emerald-900 dark:text-emerald-200">
                  <Check className="w-5 h-5" />
                </div>
                <div className="text-body font-bold text-emerald-900 dark:text-emerald-200">Đã tiếp nhận yêu cầu</div>
                <p className="text-caption text-emerald-700 dark:text-emerald-300">
                  Yêu cầu đã được chuyển tới đội ngũ NacenTech để điều phối kết nối với chuyên gia.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendConnectRequest} className="space-y-4 text-caption">
                {modalError && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{modalError}</div>}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Tên Doanh nghiệp / Tổ chức của bạn (*)</label>
                  <input
                    type="text"
                    required
                    value={modalCompanyName}
                    onChange={(e) => setModalCompanyName(e.target.value)}
                    placeholder="VD: Công ty Cổ phần Công nghệ ABC"
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 border dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Họ và tên người liên hệ (*)</label>
                    <input
                      type="text"
                      required
                      value={modalContactName}
                      onChange={(e) => setModalContactName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 border dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Số điện thoại di động (*)</label>
                    <input
                      type="tel"
                      required
                      pattern="(03|05|07|08|09)[0-9]{8}"
                      value={modalContactPhone}
                      onChange={(e) => setModalContactPhone(e.target.value)}
                      placeholder="VD: 0912345678"
                      className="w-full rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 border dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Email công việc (*)</label>
                  <input
                    type="email"
                    required
                    value={modalContactEmail}
                    onChange={(e) => setModalContactEmail(e.target.value)}
                    placeholder="VD: contact@doanhnghiep.vn"
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 border dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Tóm tắt bài toán công nghệ cần tư vấn (*)</label>
                  <textarea
                    required
                    rows={3}
                    value={modalProblemSummary}
                    onChange={(e) => setModalProblemSummary(e.target.value)}
                    placeholder="Mô tả ngắn gọn khó khăn kỹ thuật hoặc nhu cầu chuyển giao cần chuyên gia hỗ trợ..."
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 border dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Hình thức tư vấn mong muốn</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer dark:text-slate-300">
                      <input
                        type="radio"
                        name="mode"
                        checked={modalMode === "ONLINE"}
                        onChange={() => setModalMode("ONLINE")}
                        className="text-brand-700"
                      />
                      <span>Họp trực tuyến (Online)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer dark:text-slate-300">
                      <input
                        type="radio"
                        name="mode"
                        checked={modalMode === "ONSITE"}
                        onChange={() => setModalMode("ONSITE")}
                        className="text-brand-700"
                      />
                      <span>Khảo sát trực tiếp tại xưởng</span>
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-caption leading-relaxed dark:bg-amber-950/60 dark:border-amber-900 dark:text-amber-200">
                  <strong>Lưu ý bảo mật:</strong> Yêu cầu được gửi tới đội ngũ NacenTech để điều phối. Không chia sẻ thông tin bí mật kinh doanh trước khi ký Thỏa thuận bảo mật (NDA).
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={modalSending}
                    className="px-5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold shadow-sm transition"
                  >
                    {modalSending ? "Đang gửi…" : "Gửi yêu cầu"}
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
