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
  getAssessmentById,
  getGovAssessmentQueue,
  DemandSurveyItem,
  getGovDemandSurveys,
} from "@/services/api/assessment-tt17";
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

function resolveProvinceCodeFromText(raw?: string): string {
  if (!raw) return "ALL";
  const s = raw.toLowerCase().trim();
  if (s.includes("hà nội") || s === "hn") return "HN";
  if (s.includes("tiền giang") || s === "tg") return "TG";
  if (s.includes("ninh thuận") || s === "nt") return "NT";
  if (s.includes("hải phòng") || s === "hp") return "HP";
  if (s.includes("đà nẵng") || s === "dn") return "DN";
  if (s.includes("hồ chí minh") || s.includes("tp. hcm") || s === "sg") return "SG";
  if (s.includes("thái nguyên") || s === "tn") return "TN";
  return "ALL";
}

function resolveDemandTniBadge(classification?: string, score?: number) {
  const c = (classification || "").toUpperCase();
  if (c === "VERY_HIGH" || c === "CAP_THIET" || (score !== undefined && score !== null && score >= 75)) {
    return {
      label: "Rất cao (TNI ≥ 75)",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    };
  }
  if (c === "HIGH" || c === "STRATEGIC" || (score !== undefined && score !== null && score >= 60)) {
    return {
      label: "Cao (TNI 60–74)",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    };
  }
  if (c === "MEDIUM" || (score !== undefined && score !== null && score >= 45)) {
    return {
      label: "Trung bình (TNI 45–59)",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    };
  }
  return {
    label: "Thấp (TNI < 45)",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  };
}

export interface UnifiedSurveyRecord {
  id: string;
  surveyCode?: string;
  surveyType: "TT17" | "SME_DEMAND" | "INNOVATION";
  surveyTypeLabel: string;
  enterpriseName: string;
  taxCode: string;
  scopeId: string;
  provinceDisplay: string;
  submittedAt?: string;
  createdAt?: string;
  scoreDisplay: string;
  classification: string;
  classificationBadge: { label: string; badgeClass: string };
  originalTt17?: Tt17Assessment;
  originalDemand?: DemandSurveyItem;
}

export default function AdminAssessmentRecordsPage() {
  const [assessments, setAssessments] = useState<Tt17Assessment[]>([]);
  const [demandSurveys, setDemandSurveys] = useState<DemandSurveyItem[]>([]);
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
  const [inspectingDemandItem, setInspectingDemandItem] = useState<DemandSurveyItem | null>(null);
  const [modalTab, setModalTab] = useState<"FORM" | "SCORES">("FORM");

  const openInspectTt17 = (item: Tt17Assessment) => {
    setInspectingItem(item);
    setModalTab("FORM");
    getAssessmentById(item.id)
      .then((full) => {
        if (full) {
          setInspectingItem((prev) => (prev?.id === item.id ? full : prev));
        }
      })
      .catch(() => {});
  };

  const inspectingDemandDetails = useMemo(() => {
    if (!inspectingDemandItem?.surveyDetails) return null;
    if (typeof inspectingDemandItem.surveyDetails === "object") return inspectingDemandItem.surveyDetails;
    try {
      return JSON.parse(inspectingDemandItem.surveyDetails);
    } catch {
      return null;
    }
  }, [inspectingDemandItem]);

  const loadData = useCallback(async () => {
    setAsyncState("loading");
    setErrorMessage("");
    try {
      const [tt17Data, demandData] = await Promise.all([
        getGovAssessmentQueue(scopeFilter === "ALL" ? undefined : scopeFilter),
        getGovDemandSurveys(scopeFilter === "ALL" ? undefined : scopeFilter),
      ]);
      setAssessments(tt17Data || []);
      setDemandSurveys(demandData || []);
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

  // Hợp nhất dữ liệu các loại phiếu
  const unifiedRecords: UnifiedSurveyRecord[] = useMemo(() => {
    const list: UnifiedSurveyRecord[] = [];

    // 1. Bản ghi Phiếu TT17
    for (const item of assessments) {
      const cls = (item.scoreResult?.classification || item.scoreResult?.classificationLabel || "").toUpperCase();
      const clsInfo = resolveTt17Classification(cls);
      list.push({
        id: item.id,
        surveyCode: `TT17-${item.id.slice(0, 8)}`,
        surveyType: "TT17",
        surveyTypeLabel: "Phiếu TT17",
        enterpriseName: item.enterpriseName || item.surveyData?.companyName || "Chưa cập nhật tên DN",
        taxCode: item.taxCode || item.surveyData?.taxCode || "—",
        scopeId: item.scopeId || "HN",
        provinceDisplay: resolveProvinceName(item.scopeId),
        submittedAt: item.submittedAt,
        createdAt: item.createdAt,
        scoreDisplay: `${item.scoreResult?.totalScore ?? 0}/100`,
        classification: cls,
        classificationBadge: { label: clsInfo.label.split("(")[0].trim(), badgeClass: clsInfo.badgeClass },
        originalTt17: item,
      });
    }

    // 2. Bản ghi Phiếu Nhu cầu DN (SME Demand)
    for (const item of demandSurveys) {
      const score = item.tniScore;
      const cls = (item.tniClassification || (score !== undefined && score !== null && score >= 75 ? "VERY_HIGH" : score !== undefined && score !== null && score >= 60 ? "HIGH" : score !== undefined && score !== null && score >= 45 ? "MEDIUM" : "LOW")).toUpperCase();
      const badge = resolveDemandTniBadge(cls, score);
      const provCode = resolveProvinceCodeFromText(item.province);
      list.push({
        id: item.id,
        surveyCode: item.surveyCode || `SUR-${item.id.slice(0, 8)}`,
        surveyType: "SME_DEMAND",
        surveyTypeLabel: "Phiếu Nhu cầu DN",
        enterpriseName: item.companyName || "Doanh nghiệp khảo sát",
        taxCode: item.taxCode || "—",
        scopeId: provCode,
        provinceDisplay: item.province || (provCode !== "ALL" ? resolveProvinceName(provCode) : "Toàn quốc"),
        submittedAt: item.submittedAt,
        createdAt: item.createdAt,
        scoreDisplay: score !== undefined && score !== null ? `TNI: ${score}` : "Chờ tính TNI",
        classification: cls,
        classificationBadge: badge,
        originalDemand: item,
      });
    }

    return list;
  }, [assessments, demandSurveys]);

  // Bộ lọc tổng hợp
  const filteredRecords = useMemo(() => {
    return unifiedRecords.filter((item) => {
      // 1. Lọc Tỉnh thành
      if (scopeFilter !== "ALL") {
        if (item.scopeId.toUpperCase() !== scopeFilter.toUpperCase()) return false;
      }

      // 2. Lọc loại phiếu
      if (surveyTypeFilter !== "ALL") {
        if (item.surveyType !== surveyTypeFilter) return false;
      }

      // 3. Lọc Xếp loại / Phân tầng
      if (classificationFilter !== "ALL") {
        if (item.surveyType === "TT17") {
          const cls = item.classification;
          if (classificationFilter === "TIEN_TIEN" || classificationFilter === "LEADING") {
            if (cls !== "TIEN_TIEN" && cls !== "TRUNG_BINH_TIEN_TIEN") return false;
          } else if (classificationFilter === "KHA" || classificationFilter === "DEVELOPING") {
            if (cls !== "KHA" && cls !== "TRUNG_BINH_TIEN_TIEN") return false;
          } else if (classificationFilter === "TRUNG_BINH" || classificationFilter === "POTENTIAL") {
            if (cls !== "TRUNG_BINH") return false;
          } else if (classificationFilter === "LAC_HAU" || classificationFilter === "UNRATED") {
            if (cls !== "LAC_HAU") return false;
          }
        } else if (item.surveyType === "SME_DEMAND") {
          const cls = item.classification;
          if (classificationFilter === "VERY_HIGH" && cls !== "VERY_HIGH" && cls !== "CAP_THIET") return false;
          if (classificationFilter === "HIGH" && cls !== "HIGH" && cls !== "STRATEGIC") return false;
          if (classificationFilter === "MEDIUM" && cls !== "MEDIUM") return false;
          if (classificationFilter === "LOW" && cls !== "LOW") return false;
        }
      }

      // 4. Tìm kiếm Tên DN hoặc MST hoặc Mã phiếu
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchName = item.enterpriseName.toLowerCase().includes(term);
        const matchTax = item.taxCode.toLowerCase().includes(term);
        const matchId = item.id.toLowerCase().includes(term);
        const matchCode = (item.surveyCode || "").toLowerCase().includes(term);
        if (!matchName && !matchTax && !matchId && !matchCode) return false;
      }

      return true;
    });
  }, [unifiedRecords, scopeFilter, surveyTypeFilter, classificationFilter, searchTerm]);

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
  const handleExportDocx = async (target: UnifiedSurveyRecord | Tt17Assessment | DemandSurveyItem) => {
    try {
      const targetId = target.id;
      setIsExportingId(targetId);

      let isDemand = false;
      let demandItem: DemandSurveyItem | null = null;
      let tt17Item: Tt17Assessment | null = null;

      if ("surveyType" in target) {
        const sType = (target as any).surveyType;
        if (sType === "SME_DEMAND" || sType === "DEEP_SURVEY") {
          isDemand = true;
          demandItem = (target as any).originalDemand || (target as DemandSurveyItem);
        } else if (sType === "TT17") {
          isDemand = false;
          tt17Item = (target as any).originalTt17 || (target as unknown as Tt17Assessment);
        }
      }

      if (!demandItem && !tt17Item) {
        if ("evaluationLevels" in target || "enterpriseName" in target) {
          isDemand = false;
          tt17Item = target as unknown as Tt17Assessment;
        } else {
          isDemand = true;
          demandItem = target as unknown as DemandSurveyItem;
        }
      }

      if (isDemand && demandItem) {
        const { exportDemandSmeDocx, downloadDocxBlob } = await import("@/services/survey-docx-exporter");
        const blob = await exportDemandSmeDocx(demandItem);
        const safeTax = (demandItem.taxCode || "MST").replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeName = (demandItem.companyName || "DN")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "")
          .substring(0, 30);
        downloadDocxBlob(blob, `Phieu_Nhu_Cau_DN_${safeTax}_${safeName || "DN"}.docx`);
      } else if (tt17Item) {
        if (!tt17Item.scoreResult?.criteria?.length) {
          const full = await getAssessmentById(tt17Item.id);
          if (full) tt17Item = full;
        }
        const { exportTt17SurveyDocx, downloadDocxBlob } = await import("@/services/survey-docx-exporter");
        const blob = await exportTt17SurveyDocx(tt17Item);
        const safeTax = (tt17Item.taxCode || tt17Item.surveyData?.taxCode || "MST").replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeName = (tt17Item.enterpriseName || tt17Item.surveyData?.companyName || "DN")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "")
          .substring(0, 30);
        downloadDocxBlob(blob, `Phieu_TT17_${safeTax}_${safeName || "DN"}.docx`);
      }
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
              <span>Tải mẫu Nhu cầu DN (.docx)</span>
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
              className="form-control-sm w-full font-semibold rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="ALL">Tất cả loại phiếu (3 loại)</option>
              <option value="TT17">Phiếu TT17 (Công nghệ sản xuất)</option>
              <option value="INNOVATION">Phiếu ĐMST (43 câu hỏi ĐMST)</option>
              <option value="SME_DEMAND">Phiếu Nhu cầu DN</option>
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
              className="form-control-sm w-full font-semibold rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
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
                  const isExporting = isExportingId === item.id;
                  const dateDisplay = item.submittedAt
                    ? new Date(item.submittedAt).toLocaleDateString("vi-VN")
                    : item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                    : "—";

                  return (
                    <tr
                      key={`${item.surveyType}-${item.id}`}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Cột 1: Mã hồ sơ */}
                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                          #{item.surveyCode || item.id.slice(0, 8)}
                        </span>
                      </td>

                      {/* Cột 2: Tên DN & MST */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate" title={item.enterpriseName}>
                          {item.enterpriseName}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] mt-0.5">
                          <span>MST:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {item.taxCode}
                          </span>
                        </div>
                      </td>

                      {/* Cột 3: Tỉnh / Thành */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span>{item.provinceDisplay}</span>
                        </div>
                      </td>

                      {/* Cột 4: Loại phiếu */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          item.surveyType === "SME_DEMAND"
                            ? "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800"
                            : item.surveyType === "INNOVATION"
                            ? "bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800"
                            : "bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800"
                        }`}>
                          <FileText className="w-3 h-3" />
                          <span>{item.surveyTypeLabel}</span>
                        </span>
                      </td>

                      {/* Cột 5: Ngày kê khai/nộp */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{dateDisplay}</span>
                        </div>
                      </td>

                      {/* Cột 6: Điểm TT17 / Xếp loại hoặc Điểm TNI */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black text-sm ${
                            item.surveyType === "SME_DEMAND"
                              ? "text-teal-700 dark:text-teal-400"
                              : "text-emerald-700 dark:text-emerald-400"
                          }`}>
                            {item.scoreDisplay}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border truncate max-w-[140px] ${item.classificationBadge.badgeClass}`}
                            title={item.classificationBadge.label}
                          >
                            {item.classificationBadge.label.split("(")[0].trim()}
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
                              if (item.surveyType === "TT17" && item.originalTt17) {
                                openInspectTt17(item.originalTt17);
                              } else if (item.originalDemand) {
                                setInspectingDemandItem(item.originalDemand);
                              }
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
                            title={item.surveyType === "TT17" ? "Xuất file Word (.docx) để in thực địa" : "Xuất file Word (.docx) chứa dữ liệu doanh nghiệp"}
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

      {/* 4. MODAL XEM CHI TIẾT BẢN GHI PHIẾU TT17 */}
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

      {/* 5. MODAL XEM CHI TIẾT PHIẾU NHU CẦU DN */}
      {inspectingDemandItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
              <div className="space-y-1 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold">
                    Bản ghi Phiếu Nhu cầu DN #{inspectingDemandItem.surveyCode || inspectingDemandItem.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    MST: {inspectingDemandItem.taxCode || "—"}
                  </span>
                  <span className="text-xs text-slate-500">
                    · Địa bàn: <strong>{inspectingDemandItem.province || "Toàn quốc"}</strong>
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {inspectingDemandItem.companyName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectingDemandItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Thống kê chỉ số nhanh */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-center">
                  <div className="text-teal-700 dark:text-teal-300 text-[11px] font-bold">Chỉ số TNI</div>
                  <div className="font-black text-lg text-teal-800 dark:text-teal-200 mt-0.5">
                    {inspectingDemandItem.tniScore !== undefined && inspectingDemandItem.tniScore !== null ? inspectingDemandItem.tniScore : "—"}
                  </div>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium mt-0.5">
                    {resolveDemandTniBadge(inspectingDemandItem.tniClassification, inspectingDemandItem.tniScore).label}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-slate-500 text-[11px] font-semibold">Quy mô lao động</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1">
                    {inspectingDemandItem.employeeScale || inspectingDemandItem.enterpriseSize || "—"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-slate-500 text-[11px] font-semibold">Doanh thu 3 năm</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1">
                    {inspectingDemandItem.revenueRange3y || "—"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-slate-500 text-[11px] font-semibold">Trạng thái hồ sơ</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-1">
                    {inspectingDemandItem.status || "SUBMITTED"}
                  </div>
                </div>
              </div>

              {/* I. CHI TIẾT BÀI TOÁN KỸ THUẬT & NHU CẦU ĐỔI MỚI CÔNG NGHỆ */}
              {inspectingDemandItem.items && inspectingDemandItem.items.length > 0 && (
                <div className="border border-teal-200 dark:border-teal-800 rounded-xl p-4 bg-teal-50/20 dark:bg-teal-950/20 space-y-3">
                  <div className="font-bold text-teal-800 dark:text-teal-200 text-xs uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span>I. Chi tiết bài toán kỹ thuật & Nhu cầu đổi mới công nghệ</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold text-[11px]">
                      {inspectingDemandItem.items.length} bài toán
                    </span>
                  </div>
                  <div className="space-y-3">
                    {inspectingDemandItem.items.map((it, idx) => (
                      <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-teal-200/80 dark:border-teal-800/80 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            #{it.itemCode || `DMD-${idx + 1}`} · <span className="text-teal-600">{it.stageName || "Sản xuất chính"}</span>
                          </div>
                          {it.tniScore !== undefined && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                              TNI: {it.tniScore}/100
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Vấn đề kỹ thuật / Khuyết tật:</span>{" "}
                          <span className="font-bold text-rose-700 dark:text-rose-400">{it.technicalProblem}</span>
                        </div>
                        {it.desiredSolution && (
                          <div>
                            <span className="text-slate-500 font-medium">Giải pháp công nghệ mong muốn:</span>{" "}
                            <span className="text-slate-800 dark:text-slate-200">{it.desiredSolution}</span>
                          </div>
                        )}
                        {it.expectedGoal && (
                          <div>
                            <span className="text-slate-500 font-medium">Mục tiêu kỳ vọng:</span>{" "}
                            <span className="text-slate-700 dark:text-slate-300">{it.expectedGoal}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            Dự toán ngân sách: <strong className="text-slate-800 dark:text-slate-200">{it.budgetRange || "Thương lượng"}</strong>
                          </div>
                          {it.urgencyScore && (
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                              <span>4 Chiều TNI:</span>
                              <strong>K={it.urgencyScore}</strong>
                              <span>·</span>
                              <strong>L={it.impactScore}</strong>
                              <span>·</span>
                              <strong>N={it.investmentCapacity}</strong>
                              <span>·</span>
                              <strong>O={it.adoptionReadiness}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* II. THÔNG TIN DOANH NGHIỆP & NGƯỜI ĐẠI DIỆN */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>II. Thông tin liên hệ & Người đại diện</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500">Người liên hệ:</span>{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {inspectingDemandItem.contactName || "—"}
                    </strong>
                    {inspectingDemandItem.contactTitle && (
                      <span className="text-slate-400"> ({inspectingDemandItem.contactTitle})</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">Số điện thoại:</span>{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {inspectingDemandItem.contactPhone || "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {inspectingDemandItem.contactEmail || "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Trụ sở chính:</span>{" "}
                    <span className="text-slate-700 dark:text-slate-300">
                      {inspectingDemandItem.headquartersAddress || inspectingDemandItem.province || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* III. HIỆN TRẠNG MÁY MÓC & 8 TIÊU CHÍ TRÌNH ĐỘ CÔNG NGHỆ */}
              {inspectingDemandDetails && inspectingDemandDetails.currentEquipments && Array.isArray(inspectingDemandDetails.currentEquipments) && inspectingDemandDetails.currentEquipments.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    <span>III. Danh mục máy móc, thiết bị chủ lực hiện tại</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-[11px]">
                          <th className="py-2 pr-2">Công đoạn</th>
                          <th className="py-2 px-2">Tên thiết bị / Máy móc</th>
                          <th className="py-2 px-2">Xuất xứ / Năm ĐT</th>
                          <th className="py-2 pl-2 text-right">Khấu hao / Tình trạng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {inspectingDemandDetails.currentEquipments.map((eq: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="py-2 pr-2 font-medium text-slate-700 dark:text-slate-300">{eq.StageName || "—"}</td>
                            <td className="py-2 px-2 font-bold text-slate-900 dark:text-white">{eq.MachineName || "—"}</td>
                            <td className="py-2 px-2 text-slate-600 dark:text-slate-400">{eq.TechOrigin || "—"} ({eq.InvestmentYear || "—"})</td>
                            <td className="py-2 pl-2 text-right text-emerald-600 font-semibold">{eq.DepreciationStatus || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 8 TIÊU CHÍ TRÌNH ĐỘ CÔNG NGHỆ */}
              {inspectingDemandDetails && inspectingDemandDetails.criteria8 && typeof inspectingDemandDetails.criteria8 === "object" && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                    Đánh giá hiện trạng trình độ công nghệ (8 Tiêu chí)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(inspectingDemandDetails.criteria8).map(([key, val], idx) => {
                      const num = Number(val) || 0;
                      return (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] leading-tight">{key}</span>
                          <span className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-bold shrink-0">
                            {num} / 5
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* IV. KHÂU KHÓ NHẤT & ĐIỂM NGHẼN KỸ THUẬT */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>IV. Điểm nghẽn kỹ thuật & Khâu sản xuất ách tắc</span>
                </div>
                {inspectingDemandDetails && inspectingDemandDetails.hardestStage && (
                  <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg space-y-1">
                    <div className="text-[11px] text-rose-600 font-bold">Khâu sản xuất gặp nhiều khó khăn nhất:</div>
                    <div className="font-bold text-slate-900 dark:text-white">{inspectingDemandDetails.hardestStage}</div>
                    {inspectingDemandDetails.primaryCause && (
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] pt-1 border-t border-rose-200/50 dark:border-rose-900/50 mt-1">
                        Nguyên nhân cốt lõi: <em>{inspectingDemandDetails.primaryCause}</em>
                      </div>
                    )}
                  </div>
                )}
                {inspectingDemandItem.topBottlenecks && inspectingDemandItem.topBottlenecks.length > 0 && (
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold mb-1.5">Danh mục điểm nghẽn kỹ thuật nhận diện:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectingDemandItem.topBottlenecks.map((b, idx) => {
                        const sev = inspectingDemandDetails?.bottlenecksDetail?.[b];
                        return (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold text-xs">
                            {b} {sev ? `(Mức độ: ${sev}/5)` : ""}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* V. NHÂN LỰC KỸ THUẬT & NĂNG LỰC HẤP THỤ CÔNG NGHỆ */}
              {inspectingDemandDetails && inspectingDemandDetails.technicalPersonnel && typeof inspectingDemandDetails.technicalPersonnel === "object" && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>V. Đội ngũ nhân lực kỹ thuật</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 text-[11px] block">Kỹ thuật viên / Thợ giỏi:</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-sm">{inspectingDemandDetails.technicalPersonnel.technicians ?? 0} người</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 text-[11px] block">Kỹ sư / Cử nhân kỹ thuật:</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-sm">{inspectingDemandDetails.technicalPersonnel.engineers ?? 0} người</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 text-[11px] block">Nhân sự CNTT:</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-sm">{inspectingDemandDetails.technicalPersonnel.it ?? 0} người</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 text-[11px] block">Nhân sự Tự động hóa:</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-sm">{inspectingDemandDetails.technicalPersonnel.automation ?? 0} người</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 text-[11px] block">Nhân sự Nghiên cứu R&D:</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-sm">{inspectingDemandDetails.technicalPersonnel.rd ?? 0} người</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 text-[11px] block">Kiểm soát chất lượng (QC):</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-sm">{inspectingDemandDetails.technicalPersonnel.quality ?? 0} người</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* NĂNG LỰC HẤP THỤ CÔNG NGHỆ (9 TIÊU CHÍ) */}
              {inspectingDemandDetails && inspectingDemandDetails.adoptionCapacity && typeof inspectingDemandDetails.adoptionCapacity === "object" && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                    Đánh giá năng lực hấp thụ & làm chủ công nghệ (Thang 1-5)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(inspectingDemandDetails.adoptionCapacity).map(([key, val], idx) => {
                      const num = Number(val) || 0;
                      return (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] leading-tight">{key}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
                            {num} / 5
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VI. ĐỊNH HƯỚNG CÔNG NGHỆ 2026–2030 & ĐỀ XUẤT HỖ TRỢ */}
              {inspectingDemandDetails && inspectingDemandDetails.futureDirections && Array.isArray(inspectingDemandDetails.futureDirections) && inspectingDemandDetails.futureDirections.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>VI. Định hướng công nghệ tiên tiến giai đoạn 2026–2030</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {inspectingDemandDetails.futureDirections.map((fd: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-medium text-xs">
                        {fd}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ĐỐI TÁC MONG MUỐN & NHU CẦU HỖ TRỢ */}
              {inspectingDemandDetails && inspectingDemandDetails.desiredPartners && Array.isArray(inspectingDemandDetails.desiredPartners) && inspectingDemandDetails.desiredPartners.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Đối tác mong muốn kết nối giải pháp</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {inspectingDemandDetails.desiredPartners.map((dp: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium text-xs">
                        {dp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nhu cầu hỗ trợ từ cơ quan nhà nước */}
              {inspectingDemandItem.supportNeeds && inspectingDemandItem.supportNeeds.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Nhu cầu hỗ trợ từ Hiệp hội BACLINK / Viện / Chuyên gia</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {inspectingDemandItem.supportNeeds.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* VII. CHỮ KÝ ĐIỆN TỬ ĐẠI DIỆN DOANH NGHIỆP */}
              {inspectingDemandItem.representativeSignatureUrl && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>VII. Chữ ký điện tử Đại diện Doanh nghiệp</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={inspectingDemandItem.representativeSignatureUrl}
                      alt="Chữ ký điện tử"
                      className="max-h-24 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500">
                Ngày gửi: <strong>{inspectingDemandItem.submittedAt ? new Date(inspectingDemandItem.submittedAt).toLocaleDateString("vi-VN") : "—"}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isExportingId === inspectingDemandItem.id}
                  onClick={() => handleExportDocx(inspectingDemandItem)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {isExportingId === inspectingDemandItem.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isExportingId === inspectingDemandItem.id ? "Đang xuất..." : "Xuất file Word (.docx)"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingDemandItem(null)}
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
