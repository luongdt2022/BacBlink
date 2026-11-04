"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Eye,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  Loader2,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  Tt17Assessment,
  getGovAssessmentQueue,
} from "@/services/api/assessment-tt17";
import {
  exportTt17SurveyDocx,
  downloadDocxBlob,
} from "@/services/survey-docx-exporter";
import { PROVINCES_34 } from "@/lib/constants/provinces";
import {
  resolveProvinceName,
  resolveTt17Classification,
} from "@/lib/gov-label-resolver";
import {
  Tt17SurveyDetailView,
} from "@/components/assessments/tt17-survey-detail-view";
import { Async, AsyncState } from "@/components/ui/async";
import { AppButton } from "@/components/ui/design-system";

function normalizeText(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

interface SearchableProvinceComboboxProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

function SearchableProvinceCombobox({
  value,
  onChange,
  id = "scope-filter",
}: SearchableProvinceComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const selectedProvince = useMemo(() => {
    return PROVINCES_34.find((p) => p.code.toUpperCase() === value.toUpperCase()) || PROVINCES_34[0];
  }, [value]);

  const filteredList = useMemo(() => {
    if (!query.trim()) return PROVINCES_34;
    const qNorm = normalizeText(query);
    const qRaw = query.toLowerCase().trim();
    return PROVINCES_34.filter((p) => {
      const nameNorm = normalizeText(p.name);
      const codeNorm = p.code.toLowerCase();
      return nameNorm.includes(qNorm) || p.name.toLowerCase().includes(qRaw) || codeNorm.includes(qRaw);
    });
  }, [query]);

  const groupedProvinces = useMemo(() => {
    const groups: { title: string; items: typeof PROVINCES_34 }[] = [
      { title: "Toàn quốc", items: [] },
      { title: "Miền Bắc (12 Tỉnh/Thành)", items: [] },
      { title: "Miền Trung & Tây Nguyên (11 Tỉnh/Thành)", items: [] },
      { title: "Miền Nam & Liên kết (11 Tỉnh/Thành)", items: [] },
    ];
    for (const p of filteredList) {
      if (p.code === "ALL") {
        groups[0].items.push(p);
      } else if (p.region === "BAC") {
        groups[1].items.push(p);
      } else if (p.region === "TRUNG_TAY_NGUYEN") {
        groups[2].items.push(p);
      } else {
        groups[3].items.push(p);
      }
    }
    return groups.filter((g) => g.items.length > 0);
  }, [filteredList]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden native select for test automation & accessibility */}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        {PROVINCES_34.map((p) => (
          <option key={p.code} value={p.code}>
            {p.code === "ALL" ? "Toàn quốc (34 Tỉnh / Thành phố)" : `${p.name} (${p.code})`}
          </option>
        ))}
      </select>

      {/* Trigger Button: Exact h-10 balanced with other inputs */}
      <button
        type="button"
        data-testid="province-combobox-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-10 w-full text-xs font-semibold px-3 bg-slate-50 dark:bg-slate-800 border rounded-xl flex items-center justify-between gap-1.5 transition text-left cursor-pointer ${
          isOpen
            ? "border-cyan-500 ring-2 ring-cyan-500/20 bg-white dark:bg-slate-900"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
      >
        <span className="truncate text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span className="truncate">
            {selectedProvince.code === "ALL"
              ? "Toàn quốc (34 Tỉnh / Thành phố)"
              : `${selectedProvince.name} (${selectedProvince.code})`}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-cyan-600 dark:text-cyan-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[280px] sm:min-w-[320px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search box inside dropdown */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm tỉnh thành (nhập tên hoặc mã)..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List items */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-100/60 dark:divide-slate-800/60 text-xs">
            {groupedProvinces.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-slate-400">
                Không tìm thấy tỉnh/thành nào khớp với &quot;{query}&quot;
              </div>
            ) : (
              groupedProvinces.map((group) => (
                <div key={group.title} className="py-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {group.title}
                  </div>
                  {group.items.map((p) => {
                    const isSelected = p.code.toUpperCase() === value.toUpperCase();
                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => {
                          onChange(p.code);
                          setIsOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                          isSelected
                            ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="truncate">
                          {p.code === "ALL" ? p.name : `${p.name} (${p.code})`}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAssessmentRecordsPage() {
  const [assessments, setAssessments] = useState<Tt17Assessment[]>([]);
  const [asyncState, setAsyncState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isExportingId, setIsExportingId] = useState<string | null>(null);

  // Bộ lọc
  const [scopeFilter, setScopeFilter] = useState<string>("ALL");
  const [surveyTypeFilter, setSurveyTypeFilter] = useState<string>("ALL");
  const [classificationFilter, setClassificationFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Modal xem chi tiết
  const [inspectingItem, setInspectingItem] = useState<Tt17Assessment | null>(null);
  const [modalTab, setModalTab] = useState<"FORM" | "SCORES">("FORM");

  const loadData = useCallback(async () => {
    setAsyncState("loading");
    setErrorMessage("");
    try {
      const data = await getGovAssessmentQueue(
        scopeFilter === "ALL" ? undefined : scopeFilter
      );
      setAssessments(data || []);
      setAsyncState("success");
    } catch (err) {
      console.error("Lỗi khi tải danh sách bản ghi phiếu:", err);
      setErrorMessage("Không thể tải danh sách hồ sơ khảo sát & đánh giá từ máy chủ.");
      setAsyncState("error");
    }
  }, [scopeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Bộ lọc tổng hợp
  const filteredRecords = useMemo(() => {
    return assessments.filter((item) => {
      // 1. Lọc Tỉnh thành
      if (scopeFilter !== "ALL") {
        const itemProv = (item.scopeId || (item as any).province || (item.surveyData as any)?.province || "").toUpperCase();
        if (itemProv !== scopeFilter.toUpperCase()) return false;
      }

      // 2. Lọc loại phiếu
      if (surveyTypeFilter === "SME_DEMAND" || surveyTypeFilter === "INNOVATION") {
        // Queue hiện tại từ API TT17 không chứa SME demand hoặc Innovation thuần túy
        return false;
      }

      // 3. Lọc Xếp loại / Phân tầng
      if (classificationFilter !== "ALL") {
        const cls = (item.scoreResult?.classification || item.scoreResult?.classificationLabel || "").toUpperCase();
        if (classificationFilter === "TIEN_TIEN" || classificationFilter === "LEADING") {
          if (cls !== "TIEN_TIEN" && cls !== "TRUNG_BINH_TIEN_TIEN") return false;
        } else if (classificationFilter === "KHA" || classificationFilter === "DEVELOPING") {
          if (cls !== "KHA" && cls !== "TRUNG_BINH_TIEN_TIEN") return false;
        } else if (classificationFilter === "TRUNG_BINH" || classificationFilter === "POTENTIAL") {
          if (cls !== "TRUNG_BINH") return false;
        } else if (classificationFilter === "LAC_HAU" || classificationFilter === "UNRATED") {
          if (cls !== "LAC_HAU") return false;
        }
      }

      // 4. Tìm kiếm Tên DN hoặc MST
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchName = (item.enterpriseName || item.surveyData?.companyName || "").toLowerCase().includes(term);
        const matchTax = (item.taxCode || item.surveyData?.taxCode || "").toLowerCase().includes(term);
        const matchId = (item.id || "").toLowerCase().includes(term);
        if (!matchName && !matchTax && !matchId) return false;
      }

      return true;
    });
  }, [assessments, scopeFilter, surveyTypeFilter, classificationFilter, searchTerm]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Tính trạng thái UX hiện tại cho bảng
  const tableAsyncState: AsyncState = useMemo(() => {
    if (asyncState === "loading") return "loading";
    if (asyncState === "error") return "error";
    if (filteredRecords.length === 0) return "empty";
    return "success";
  }, [asyncState, filteredRecords.length]);

  // Xử lý xuất file Word (.docx)
  const handleExportDocx = async (assessment: Tt17Assessment) => {
    try {
      setIsExportingId(assessment.id);
      const blob = await exportTt17SurveyDocx(assessment);
      const safeTax = (assessment.taxCode || assessment.surveyData?.taxCode || "MST").replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      );
      const safeName = (assessment.enterpriseName || assessment.surveyData?.companyName || "DN")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
        .substring(0, 30);
      downloadDocxBlob(blob, `Phieu_TT17_${safeTax}_${safeName || "DN"}.docx`);
    } catch (err) {
      console.error("Lỗi khi xuất văn bản DOCX:", err);
      alert("Đã xảy ra lỗi khi tạo file Word (.docx). Vui lòng thử lại!");
    } finally {
      setIsExportingId(null);
    }
  };

  const handleResetFilters = () => {
    setScopeFilter("ALL");
    setSurveyTypeFilter("ALL");
    setClassificationFilter("ALL");
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HEADER CHÍNH */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Quản Lý Bản Ghi Phiếu Thu Thập & Đánh Giá Doanh Nghiệp
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Tổng hợp toàn văn bản ghi khảo sát thực địa Thông tư 17/2019/TT-BKHCN & Nhu cầu Đổi mới sáng tạo của Doanh nghiệp trên 34 tỉnh/thành phố.
            </p>
          </div>

          {/* 3 Nút CTA tải template trắng */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/templates/surveys/phieu_thu_thap_tt17.docx"
              download="phieu_thu_thap_tt17.docx"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-xs hover:shadow"
              title="Mẫu phiếu thu thập số liệu đánh giá trình độ và năng lực công nghệ sản xuất (TT17/2019/TT-BKHCN)"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Tải mẫu Đánh giá TT17 (.docx)</span>
            </a>
            <a
              href="/templates/surveys/phieu_khao_sat_dmst_43_cau_mau_trang.docx"
              download="phieu_khao_sat_dmst_43_cau_mau_trang.docx"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-xs hover:shadow"
              title="Mẫu phiếu khảo sát & đánh giá năng lực đổi mới sáng tạo doanh nghiệp (43 câu hỏi / 8 nhóm năng lực)"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Tải mẫu Khảo sát ĐMST (.docx)</span>
            </a>
            <a
              href="/templates/surveys/phieu_khao_sat_nhu_cau_dnnvv_mau_trang.docx"
              download="phieu_khao_sat_nhu_cau_dnnvv_mau_trang.docx"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs hover:shadow"
              title="Mẫu phiếu khảo sát hiện trạng & nhu cầu công nghệ DNNVV (Tính toán chỉ số TNI)"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Tải mẫu Nhu cầu DNNVV (.docx)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. BỘ LỌC TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-cyan-500" />
            <span>Bộ lọc tìm kiếm đa chiều</span>
          </div>
          {(scopeFilter !== "ALL" || surveyTypeFilter !== "ALL" || classificationFilter !== "ALL" || searchTerm) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* 1. Lọc Tỉnh thành (Searchable Combobox) */}
          <div>
            <label
              htmlFor="scope-filter"
              className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 h-4 flex items-center truncate"
            >
              Tỉnh thành
            </label>
            <SearchableProvinceCombobox
              id="scope-filter"
              value={scopeFilter}
              onChange={(val) => {
                setScopeFilter(val);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* 2. Lọc Loại phiếu */}
          <div>
            <label
              htmlFor="survey-type-filter"
              className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 h-4 flex items-center truncate"
            >
              Loại phiếu khảo sát
            </label>
            <select
              id="survey-type-filter"
              value={surveyTypeFilter}
              onChange={(e) => {
                setSurveyTypeFilter(e.target.value);
                setClassificationFilter("ALL");
                setCurrentPage(1);
              }}
              className="h-10 w-full text-xs font-semibold px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả loại phiếu (3 loại)</option>
              <option value="TT17">Phiếu TT17 (Công nghệ sản xuất)</option>
              <option value="INNOVATION">Phiếu ĐMST (43 câu hỏi ĐMST)</option>
              <option value="SME_DEMAND">Phiếu Nhu cầu ĐMST (DNNVV)</option>
            </select>
          </div>

          {/* 3. Lọc Xếp loại / Phân tầng động theo loại phiếu */}
          <div>
            <label
              htmlFor="classification-filter"
              className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 h-4 flex items-center truncate"
            >
              {surveyTypeFilter === "INNOVATION"
                ? "Phân tầng năng lực ĐMST"
                : surveyTypeFilter === "SME_DEMAND"
                ? "Mức độ cấp thiết TNI"
                : surveyTypeFilter === "TT17"
                ? "Xếp loại trình độ TT17"
                : "Phân loại / Xếp loại"}
            </label>
            <select
              id="classification-filter"
              value={classificationFilter}
              onChange={(e) => {
                setClassificationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full text-xs font-semibold px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
            >
              {surveyTypeFilter === "INNOVATION" ? (
                <>
                  <option value="ALL">Tất cả phân tầng</option>
                  <option value="LEADING">Dẫn đầu (Leading - ≥ 75đ)</option>
                  <option value="DEVELOPING">Đang phát triển (Developing - 50–74đ)</option>
                  <option value="POTENTIAL">Tiềm năng (Potential - &lt; 50đ)</option>
                  <option value="UNRATED">Chưa đánh giá (Unrated)</option>
                </>
              ) : surveyTypeFilter === "SME_DEMAND" ? (
                <>
                  <option value="ALL">Tất cả mức độ</option>
                  <option value="VERY_HIGH">Rất cao (TNI ≥ 75)</option>
                  <option value="HIGH">Cao (TNI 60–74)</option>
                  <option value="MEDIUM">Trung bình (TNI 45–59)</option>
                  <option value="LOW">Thấp (TNI &lt; 45)</option>
                </>
              ) : surveyTypeFilter === "TT17" ? (
                <>
                  <option value="ALL">Tất cả xếp loại</option>
                  <option value="TIEN_TIEN">Tiên tiến (≥ 75đ & T_ĐB ≥ 0.75)</option>
                  <option value="KHA">Khá / TB Tiên tiến (60–74đ)</option>
                  <option value="TRUNG_BINH">Trung bình (50–59đ)</option>
                  <option value="LAC_HAU">Lạc hậu (&lt; 50đ)</option>
                </>
              ) : (
                <>
                  <option value="ALL">Tất cả phân loại</option>
                  <option value="TIEN_TIEN">Tiên tiến / Dẫn đầu (≥ 75đ)</option>
                  <option value="KHA">Khá / Đang phát triển (50–74đ)</option>
                  <option value="TRUNG_BINH">Trung bình / Tiềm năng</option>
                  <option value="LAC_HAU">Lạc hậu / Thấp (&lt; 50đ)</option>
                </>
              )}
            </select>
          </div>

          {/* 4. Ô Input tìm kiếm theo Tên DN / MST */}
          <div>
            <label
              htmlFor="search-input"
              className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 h-4 flex items-center truncate"
            >
              Tìm theo Tên DN / Mã số thuế
            </label>
            <div className="relative h-10 w-full">
              <input
                id="search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Nhập tên DN hoặc MST..."
                className="h-10 w-full text-xs font-semibold pl-8 pr-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none placeholder:text-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div>
            Tìm thấy: <strong className="text-slate-800 dark:text-white font-bold">{filteredRecords.length}</strong> bản ghi phiếu
            {scopeFilter !== "ALL" && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-medium">
                {resolveProvinceName(scopeFilter)}
              </span>
            )}
          </div>
          <div>
            Trang {currentPage} / {totalPages}
          </div>
        </div>
      </div>

      {/* 3. BẢNG DANH SÁCH BẢN GHI (5 UX STATES QUA <Async>) */}
      <Async
        state={tableAsyncState}
        errorMessage={errorMessage}
        onRetry={loadData}
        loadingSkeleton={
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
              ))}
            </div>
          </div>
        }
        emptyContent={
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center mx-auto text-cyan-600 dark:text-cyan-400">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Không tìm thấy bản ghi phiếu nào
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Không có hồ sơ nào khớp với bộ lọc tìm kiếm hiện tại hoặc chưa có phiếu khảo sát nào được nộp trên địa bàn này.
              </p>
            </div>
            <AppButton variant="outline" onClick={handleResetFilters}>
              Đặt lại tất cả bộ lọc
            </AppButton>
          </div>
        }
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3.5">Mã hồ sơ</th>
                  <th className="px-4 py-3.5">Doanh nghiệp & MST</th>
                  <th className="px-4 py-3.5">Tỉnh / Thành</th>
                  <th className="px-4 py-3.5">Loại phiếu</th>
                  <th className="px-4 py-3.5">Ngày kê khai / nộp</th>
                  <th className="px-4 py-3.5">Điểm TT17 / Xếp loại</th>
                  <th className="px-4 py-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedRecords.map((item) => {
                  const classificationInfo = resolveTt17Classification(
                    item.scoreResult?.classification || item.scoreResult?.classificationLabel
                  );
                  const isExporting = isExportingId === item.id;
                  const dateDisplay = item.submittedAt
                    ? new Date(item.submittedAt).toLocaleDateString("vi-VN")
                    : item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                    : "—";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Cột 1: Mã hồ sơ */}
                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                          #{item.id.slice(0, 8)}
                        </span>
                      </td>

                      {/* Cột 2: Tên DN & MST */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate" title={item.enterpriseName || item.surveyData?.companyName}>
                          {item.enterpriseName || item.surveyData?.companyName || "Chưa cập nhật tên DN"}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] mt-0.5">
                          <span>MST:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {item.taxCode || item.surveyData?.taxCode || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Cột 3: Tỉnh / Thành */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span>{resolveProvinceName(item.scopeId)}</span>
                        </div>
                      </td>

                      {/* Cột 4: Loại phiếu */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800">
                          <FileText className="w-3 h-3" />
                          <span>Phiếu TT17</span>
                        </span>
                      </td>

                      {/* Cột 5: Ngày kê khai/nộp */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{dateDisplay}</span>
                        </div>
                      </td>

                      {/* Cột 6: Điểm TT17 / Xếp loại */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">
                            {item.scoreResult?.totalScore ?? 0}/100
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border truncate max-w-[140px] ${classificationInfo.badgeClass}`}
                            title={classificationInfo.label}
                          >
                            {classificationInfo.label.split("(")[0].trim()}
                          </span>
                        </div>
                      </td>

                      {/* Cột 7: Hành động */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => {
                              setInspectingItem(item);
                              setModalTab("FORM");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                            title="Xem chi tiết Form & Điểm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem chi tiết</span>
                          </button>

                          {/* Nút Xuất file Word (.docx) để in */}
                          <button
                            type="button"
                            disabled={isExporting}
                            onClick={() => handleExportDocx(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 dark:text-cyan-300 text-xs font-bold border border-cyan-200 dark:border-cyan-800 transition cursor-pointer disabled:opacity-50"
                            title="Xuất file Word (.docx) để in thực địa"
                          >
                            {isExporting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span>{isExporting ? "Đang xuất..." : "Xuất Word (.docx)"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
              <div>
                Hiển thị bản ghi {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, filteredRecords.length)} trên tổng số {filteredRecords.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 cursor-pointer font-medium"
                >
                  Trước
                </button>
                <span className="px-3 py-1 font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 cursor-pointer font-medium"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </Async>

      {/* 4. MODAL XEM CHI TIẾT BẢN GHI PHIẾU */}
      {inspectingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
              <div className="space-y-1 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-xs font-bold">
                    Bản ghi Phiếu TT17 #{inspectingItem.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    MST: {inspectingItem.taxCode || inspectingItem.surveyData?.taxCode}
                  </span>
                  <span className="text-xs text-slate-500">
                    · Địa bàn: <strong>{resolveProvinceName(inspectingItem.scopeId)}</strong>
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {inspectingItem.enterpriseName || inspectingItem.surveyData?.companyName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Thống kê điểm nhanh */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 text-[11px] font-semibold">T (Thiết bị)</div>
                  <div className="font-extrabold text-sm text-cyan-700 dark:text-cyan-400 mt-0.5">
                    {inspectingItem.scoreResult?.scoreT}/30
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 text-[11px] font-semibold">E (Hiệu quả)</div>
                  <div className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {inspectingItem.scoreResult?.scoreE}/20
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 text-[11px] font-semibold">O (Tổ chức)</div>
                  <div className="font-extrabold text-sm text-indigo-700 dark:text-indigo-400 mt-0.5">
                    {inspectingItem.scoreResult?.scoreO}/19
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 text-[11px] font-semibold">R (Năng lực)</div>
                  <div className="font-extrabold text-sm text-teal-700 dark:text-teal-400 mt-0.5">
                    {inspectingItem.scoreResult?.scoreR}/17
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 text-[11px] font-semibold">I (ĐMST)</div>
                  <div className="font-extrabold text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                    {inspectingItem.scoreResult?.scoreI}/14
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">Tổng điểm (τ)</div>
                  <div className="font-black text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {inspectingItem.scoreResult?.totalScore}/100
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setModalTab("FORM")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    modalTab === "FORM"
                      ? "bg-cyan-700 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  1. Chi tiết Form Kê Khai Khảo Sát (Phụ Lục I)
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("SCORES")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    modalTab === "SCORES"
                      ? "bg-cyan-700 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  2. Ma Trận Điểm 26 Tiêu Chí Đánh Giá (TC01 – TC26)
                </button>
              </div>

              {modalTab === "FORM" ? (
                <Tt17SurveyDetailView assessment={inspectingItem} />
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs overflow-hidden">
                  {inspectingItem.scoreResult?.criteria?.map((c) => (
                    <div
                      key={c.code}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white mr-2">
                          {c.code} (Nhóm {c.group}):
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{c.name}</span>
                        {c.isBottleneck && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-bold">
                            Điểm nghẽn
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white shrink-0 ml-3">
                        {c.achievedScore} / {c.maxScore} điểm
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs">
                Xếp loại:{" "}
                <strong className="text-slate-900 dark:text-white">
                  {resolveTt17Classification(inspectingItem.scoreResult?.classification || inspectingItem.scoreResult?.classificationLabel).label}
                </strong>{" "}
                · Hệ số T_ĐB: <strong>{inspectingItem.scoreResult?.syncCoefficient ?? "—"}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportDocx(inspectingItem)}
                  disabled={isExportingId === inspectingItem.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất file Word (.docx) để in</span>
                </button>
                <Link
                  href={`/assessments/tt17/${inspectingItem.id}/report`}
                  target="_blank"
                  className="inline-flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Báo cáo Phụ lục IV</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
                  className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
