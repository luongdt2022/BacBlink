"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Check,
  CheckCircle2,
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
  BookOpen,
  ChevronDown,
  Users,
} from "lucide-react";
import { AppLink, AppButton } from "@/components/ui/design-system";
import { API_BASE } from "@/lib/api-client";
import { authClient, type UserContext } from "@/lib/auth-client";
import { getPublicExpertFilterOptions, type MasterDataOption } from "@/lib/master-data-client";
import { resolveTechLabel } from "@/lib/tech-label-resolver";
import { ExpertAvatar } from "@/components/expert-detail/expert-avatar";
import { removeVietnameseDiacritics } from "@/components/common/searchable-province-combobox";

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
  avatarUrl?: string | null;
  connectionCount?: number;
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
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [provinceSearch, setProvinceSearch] = useState<string>("");
  const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState<boolean>(false);
  const provinceDropdownRef = useRef<HTMLDivElement>(null);
  const [acceptingConsultation, setAcceptingConsultation] = useState(false);
  const [sectorOptions, setSectorOptions] = useState<MasterDataOption[]>([]);
  const [sectorSearch, setSectorSearch] = useState<string>("");
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
  const [currentUser, setCurrentUser] = useState<UserContext | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    setCurrentUser(authClient.getUser());
  }, []);

  const directoryRequest = useRef<AbortController | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => () => directoryRequest.current?.abort(), []);

  // 1. Phục hồi state từ URL Parameters khi tải trang lần đầu
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q") || params.get("query");
    if (qParam) setSearchTerm(qParam);

    // Parse degrees (hỗ trợ degrees=GS,PGS, mảng lặp hoặc degree=GS)
    const degs = params.getAll("degrees");
    const singleDeg = params.get("degree");
    const allDegs: string[] = [];
    if (degs.length > 0) {
      degs.forEach((d) => d.split(",").forEach((x) => { if (x.trim()) allDegs.push(x.trim()); }));
    } else if (singleDeg) {
      singleDeg.split(",").forEach((x) => { if (x.trim()) allDegs.push(x.trim()); });
    }
    if (allDegs.length > 0) setSelectedDegrees(Array.from(new Set(allDegs)));

    // Parse sectorCodes (hỗ trợ sectorCodes=LV01,LV05, mảng lặp hoặc sectorCode=LV01 hoặc sector=LV01)
    const secs = params.getAll("sectorCodes");
    const singleSec = params.get("sectorCode") || params.get("sector");
    const allSecs: string[] = [];
    if (secs.length > 0) {
      secs.forEach((s) => s.split(",").forEach((x) => { if (x.trim()) allSecs.push(x.trim()); }));
    } else if (singleSec) {
      singleSec.split(",").forEach((x) => { if (x.trim()) allSecs.push(x.trim()); });
    }
    if (allSecs.length > 0) setSelectedSectors(Array.from(new Set(allSecs)));

    const provsParam = params.get("provinceCodes") || params.get("provinceCode") || params.get("province");
    if (provsParam) {
      const parsedProvs = provsParam.split(",").map(p => p.trim()).filter(Boolean);
      setSelectedProvinces(parsedProvs);
    }

    const consult = params.get("acceptingConsultation") || params.get("consultation");
    if (consult === "true") setAcceptingConsultation(true);

    const pageParam = params.get("page");
    if (pageParam && !isNaN(parseInt(pageParam))) {
      setCurrentPage(Math.max(1, parseInt(pageParam)));
    }
  }, []);

  // Click outside listener đóng dropdown combobox tỉnh
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        provinceDropdownRef.current &&
        !provinceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProvinceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 2. Đồng bộ URL Search Parameters khi state bộ lọc thay đổi
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (selectedDegrees.length > 0) params.set("degrees", selectedDegrees.join(","));
    if (selectedSectors.length > 0) params.set("sectorCodes", selectedSectors.join(","));
    if (selectedProvinces.length > 0) {
      params.set("provinceCodes", selectedProvinces.join(","));
      params.set("provinceCode", selectedProvinces.join(","));
    }
    if (acceptingConsultation) params.set("acceptingConsultation", "true");
    if (currentPage > 1) params.set("page", currentPage.toString());

    const searchString = params.toString();
    const newUrl = searchString ? `${window.location.pathname}?${searchString}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [searchTerm, selectedDegrees, selectedSectors, selectedProvinces, acceptingConsultation, currentPage]);

  const fetchDirectory = async (
    overrideQ?: string,
    overrideDegrees?: string[],
    overrideSectors?: string[],
    overrideProvinces?: string[],
    overridePage?: number
  ) => {
    directoryRequest.current?.abort();
    const request = new AbortController();
    directoryRequest.current = request;
    setLoading(true);
    setError(null);
    try {
      const qVal = overrideQ !== undefined ? overrideQ : searchTerm;
      const degVal = overrideDegrees !== undefined ? overrideDegrees : selectedDegrees;
      const secVal = overrideSectors !== undefined ? overrideSectors : selectedSectors;
      const provVal = overrideProvinces !== undefined ? overrideProvinces : selectedProvinces;
      const pageVal = overridePage !== undefined ? overridePage : currentPage;

      const params = new URLSearchParams();
      if (qVal.trim()) params.set("q", qVal.trim());
      if (degVal.length > 0) params.set("degrees", degVal.join(","));
      if (secVal.length > 0) params.set("sectorCodes", secVal.join(","));
      if (provVal.length > 0) {
        params.set("provinceCodes", provVal.join(","));
        params.set("provinceCode", provVal.join(","));
      }
      if (acceptingConsultation) params.set("acceptingConsultation", "true");
      params.set("page", pageVal.toString());
      params.set("pageSize", "9");

      const res = await fetch(`${API_BASE}/api/v1/public/experts?${params.toString()}`, { signal: request.signal });
      if (!res.ok) {
        throw new Error(`Lỗi tải danh bạ chuyên gia (${res.status})`);
      }
      const json = await res.json();
      if (request.signal.aborted) return;
      if (json.success && json.data) {
        setDirectoryData(json.data);
      } else {
        throw new Error(json.message || "Dữ liệu không hợp lệ");
      }
    } catch (err: any) {
      if (request.signal.aborted) return;
      console.error(err);
      setError(err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [currentPage, selectedDegrees, selectedSectors, selectedProvinces, acceptingConsultation]);

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

  // Lọc danh sách tỉnh thành theo từ khóa tìm kiếm (hỗ trợ có dấu và không dấu - TASK-05-CR144)
  const filteredProvinces = useMemo(() => {
    if (!provinceSearch.trim()) return provinceOptions;
    const norm = removeVietnameseDiacritics(provinceSearch);
    return provinceOptions.filter((p) => {
      const pNorm = removeVietnameseDiacritics(p.name);
      return (
        pNorm.includes(norm) ||
        p.name.toLowerCase().includes(provinceSearch.toLowerCase().trim()) ||
        p.code.toLowerCase().includes(provinceSearch.toLowerCase().trim())
      );
    });
  }, [provinceSearch, provinceOptions]);

  const toggleProvince = (code: string) => {
    setCurrentPage(1);
    setSelectedProvinces((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectAllProvinces = () => {
    setCurrentPage(1);
    setSelectedProvinces(provinceOptions.map((p) => p.code));
  };

  const clearAllProvinces = () => {
    setCurrentPage(1);
    setSelectedProvinces([]);
    setProvinceSearch("");
  };

  // Debounce Search 300ms theo TC-C2-EXP-DIR02
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchDirectory(searchTerm, selectedDegrees, selectedSectors, selectedProvinces, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDirectory(searchTerm, selectedDegrees, selectedSectors, selectedProvinces, 1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedDegrees([]);
    setSelectedSectors([]);
    setSelectedProvinces([]);
    setProvinceSearch("");
    setIsProvinceDropdownOpen(false);
    setSectorSearch("");
    setAcceptingConsultation(false);
    setCurrentPage(1);
    setMobileFiltersOpen(false);
  };

  const openConnectModal = (expert: ExpertCardItem) => {
    const user = authClient.getUser();
    setModalTargetExpert(expert);
    setModalProblemSummary("");
    setModalMode("ONLINE");
    setModalSubmitted(false);
    setModalError(null);

    if (user) {
      setCurrentUser(user);
      setModalCompanyName(user.organizationName || "");
      setModalContactName(user.fullName || "");
      setModalContactPhone(user.phone || user.phoneNumber || "");
      setModalContactEmail(user.email || "");
      setAutoFilled(true);
    } else {
      setModalCompanyName("");
      setModalContactName("");
      setModalContactPhone("");
      setModalContactEmail("");
      setAutoFilled(false);
    }
    setModalOpen(true);
  };

  const handleAutoFillUser = () => {
    const user = currentUser || authClient.getUser();
    if (!user) return;
    if (user.organizationName) {
      setModalCompanyName(user.organizationName);
    } else if (!modalCompanyName) {
      setModalCompanyName("Doanh nghiệp Đổi mới sáng tạo");
    }
    if (user.fullName) setModalContactName(user.fullName);
    if (user.phone || user.phoneNumber) setModalContactPhone(user.phone || user.phoneNumber || "");
    if (user.email) setModalContactEmail(user.email);
    setAutoFilled(true);
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
    if (rank === "GS" || rank === "PROFESSOR") return { label: "Giáo sư (GS)", cls: "bg-brand-50 text-brand-800 border-brand-200" };
    if (rank === "PGS" || rank === "ASSOCIATE_PROFESSOR") return { label: "Phó Giáo sư (PGS)", cls: "bg-brand-50 text-brand-800 border-brand-200" };
    if (degree === "DOCTOR" || degree === "TS") return { label: "Tiến sĩ (TS)", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    return { label: "Thạc sĩ / KS", cls: "bg-slate-100 text-slate-800 border-slate-200" };
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-surface-page dark:bg-slate-950 text-text-primary dark:text-slate-100 flex flex-col">
      {/* 1. COMPACT HERO SEARCH BANNER */}
      <section className="workspace-banner text-white py-4 sm:py-5 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <nav className="flex items-center gap-2 text-caption text-brand-100 mb-2.5 font-medium">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-200" />
            <span className="text-white font-semibold">Danh bạ Chuyên gia KH&CN</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-brand-100 text-caption font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              Mạng lưới Nhà khoa học & Chuyên gia Đổi mới Sáng tạo
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-extrabold tracking-tight text-white leading-tight type-page-title">
                  Tìm chuyên gia KH&CN
                </h1>
                <p className="mt-1 text-caption sm:text-body text-brand-100 leading-relaxed max-w-2xl">
                  Tra cứu năng lực, lĩnh vực và địa bàn thẩm định.
                </p>
              </div>
              <Link
                href="/experts/zalo-preview"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition shadow-sm"
              >
                <span>📲 Kênh Zalo Mini App Form</span>
              </Link>
            </div>

            {/* Compact Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-3 bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-md flex flex-col sm:flex-row gap-1.5 max-w-3xl border border-slate-200 dark:border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo họ tên chuyên gia, đơn vị công tác, từ khóa nghiên cứu..."
                  className="w-full h-11 pl-10 pr-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 bg-transparent rounded-lg focus:outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition shrink-0"
              >
                <Search className="w-4 h-4" />
                Tìm kiếm
              </button>
            </form>

            {/* Quick chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-caption text-brand-100">
              <span className="font-medium text-brand-200">Xu hướng:</span>
              {["#Trí tuệ nhân tạo", "#Vật liệu nano", "#Năng lượng tái tạo", "#Cơ khí chính xác"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const term = tag.replace("#", "");
                    setSearchTerm(term);
                    setCurrentPage(1);
                    fetchDirectory(term, selectedDegrees, selectedSectors, selectedProvinces, 1);
                  }}
                  className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition text-caption"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 SPOTLIGHT: CHUYÊN GIA TIÊU BIỂU / NỔI BẬT */}
      {directoryData.items.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-1 w-full" data-testid="featured-experts-rail">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-caption font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Chuyên gia Tiêu biểu & Nổi bật
              </h2>
              <span className="px-2 py-0.5 rounded-full text-caption font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                Mạng lưới đề xuất
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {directoryData.items.slice(0, 3).map((feat) => {
              const featBadge = getRankBadge(feat.academicRank, feat.degree);
              const sectorName =
                sectorOptions.find((s) => s.code === feat.primarySectorCode)?.name ||
                feat.primarySectorName ||
                "Công nghệ chủ chốt";
              return (
                <div
                  key={`spotlight-${feat.expertCode}`}
                  className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-brand-600 p-3 shadow-2xs hover:shadow-sm transition-shadow flex items-start gap-3 dark:bg-slate-900 dark:border-slate-800 dark:border-l-brand-500"
                >
                  <ExpertAvatar
                    fullName={feat.fullName}
                    avatarUrl={feat.avatarUrl}
                    expertCode={feat.expertCode}
                    size="sm"
                    isVerified={false}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded text-xs font-bold border ${featBadge.cls}`}>
                        {featBadge.label}
                      </span>
                      {feat.isVerified && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 dark:text-emerald-400">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> Xác thực
                        </span>
                      )}
                    </div>
                    <h3 className="text-caption font-bold text-slate-900 truncate mt-0.5 dark:text-white">
                      <Link href={`/experts/${feat.expertCode}`} className="hover:text-brand-700 dark:hover:text-brand-300">
                        {feat.fullName.replace(/^(GS\.|PGS\.|TS\.|ThS\.|KS\.)+\s*/gi, "").trim() || feat.fullName}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-500 truncate dark:text-slate-400" title={feat.organizationName}>
                      {feat.organizationName ? `Đơn vị: ${feat.organizationName}` : ""}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span
                        className="bg-brand-50 text-brand-800 border border-brand-200 text-xs px-2 py-0.5 rounded font-semibold truncate max-w-[180px] dark:bg-brand-950/70 dark:text-brand-200 dark:border-brand-800"
                        title={sectorName}
                      >
                        {sectorName}
                      </span>
                      {feat.masteredTechCodes &&
                        feat.masteredTechCodes.slice(0, 2).map((code) => {
                          const label = resolveTechLabel(code);
                          return (
                            <span
                              key={code}
                              className="bg-slate-100 text-slate-700 border border-slate-200 text-xs px-1.5 py-0.5 rounded truncate max-w-[130px] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                              title={label}
                            >
                              {label}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                  <Link
                    href={`/experts/${feat.expertCode}`}
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-brand-700 hover:bg-brand-50 transition dark:hover:bg-slate-800 dark:hover:text-brand-300"
                    title="Xem chi tiết"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
                className="focus-ring min-h-11 shrink-0 whitespace-nowrap text-caption font-semibold text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-white"
              >
                Đặt lại
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-body dark:divide-slate-800">
              {/* Trục 1: Học vị đa chọn */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-caption font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Học hàm & Học vị{selectedDegrees.length > 0 ? ` (${selectedDegrees.length})` : ""}
                  </label>
                  {selectedDegrees.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setSelectedDegrees([]); setCurrentPage(1); }}
                      className="text-xs text-brand-700 hover:underline dark:text-brand-300 font-semibold"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {DEGREE_OPTIONS.map((deg) => {
                    const checked = selectedDegrees.includes(deg.value);
                    return (
                      <label key={deg.value} className="flex items-center gap-2.5 text-caption text-slate-700 cursor-pointer dark:text-slate-300">
                        <input
                          type="checkbox"
                          name="degree"
                          checked={checked}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedDegrees((prev) =>
                              prev.includes(deg.value) ? prev.filter((v) => v !== deg.value) : [...prev, deg.value]
                            );
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                        />
                        <span>{deg.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Taxonomy SECTOR từ API/DB đa chọn */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-caption font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Lĩnh vực chuyên môn{selectedSectors.length > 0 ? ` (${selectedSectors.length})` : filterDataLoaded ? ` (${sectorOptions.length})` : ""}
                  </label>
                  {selectedSectors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setSelectedSectors([]); setCurrentPage(1); }}
                      className="text-xs text-brand-700 hover:underline dark:text-brand-300 font-semibold"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>
                {sectorOptions.length > 3 && (
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={sectorSearch}
                      onChange={(e) => setSectorSearch(e.target.value)}
                      placeholder="Lọc nhanh ngành..."
                      className="w-full pl-8 pr-2 py-1 text-caption rounded-lg border border-slate-200 bg-slate-50 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    />
                  </div>
                )}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {sectorOptions
                    .filter((sec) => sec.name.toLowerCase().includes(sectorSearch.toLowerCase().trim()))
                    .map((sec) => {
                      const checked = selectedSectors.includes(sec.code);
                      return (
                        <label key={sec.code} className="flex items-center gap-2.5 text-caption text-slate-700 cursor-pointer dark:text-slate-300">
                          <input
                            type="checkbox"
                            name="sector"
                            checked={checked}
                            onChange={() => {
                              setCurrentPage(1);
                              setSelectedSectors((prev) =>
                                prev.includes(sec.code) ? prev.filter((v) => v !== sec.code) : [...prev, sec.code]
                              );
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                          />
                          <span className="min-w-0 whitespace-normal">{sec.name}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Trục 3: Địa bàn Sở Tỉnh chuẩn hóa 34 Sở KH&CN theo 3 miền - Searchable Multi-select Combobox (TASK-05-CR144) */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-caption font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Địa bàn Tỉnh / Thành phố
                    {selectedProvinces.length > 0 && (
                      <span className="text-brand-600 dark:text-brand-400 font-semibold text-xs ml-1.5 lowercase">
                        ({selectedProvinces.length} đã chọn)
                      </span>
                    )}
                  </label>
                  {selectedProvinces.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllProvinces}
                      className="text-caption text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition cursor-pointer"
                    >
                      Bỏ chọn tất cả
                    </button>
                  )}
                </div>

                {/* Combobox Wrapper */}
                <div className="relative" ref={provinceDropdownRef}>
                  {/* Combobox Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsProvinceDropdownOpen((prev) => !prev)}
                    className="form-control w-full text-caption flex items-center justify-between text-left cursor-pointer bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 shadow-xs hover:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                    aria-expanded={isProvinceDropdownOpen}
                    aria-haspopup="listbox"
                    data-testid="province-filter-combobox"
                  >
                    <span className="truncate pr-2 text-slate-700 dark:text-slate-200">
                      {selectedProvinces.length === 0 ? (
                        <span className="text-slate-400">Chọn địa bàn (34 Sở KH&CN)...</span>
                      ) : selectedProvinces.length === 1 ? (
                        provinceOptions.find((p) => p.code === selectedProvinces[0])?.name || selectedProvinces[0]
                      ) : (
                        `Đã chọn (${selectedProvinces.length} Tỉnh/TP)`
                      )}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                      {selectedProvinces.length > 0 && (
                        <span
                          role="button"
                          aria-label="Xóa chọn tất cả địa bàn"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearAllProvinces();
                          }}
                          className="p-0.5 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isProvinceDropdownOpen ? "rotate-180 text-brand-600" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Hidden Native Select for test compatibility & screen readers */}
                  <select
                    value={selectedProvinces[0] || ""}
                    onChange={(e) => {
                      setCurrentPage(1);
                      if (e.target.value) {
                        setSelectedProvinces([e.target.value]);
                      } else {
                        setSelectedProvinces([]);
                      }
                    }}
                    className="sr-only"
                    data-testid="province-filter-select"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <option value="">Tất cả địa bàn (34 Sở KH&CN)</option>
                    <optgroup label="Miền Bắc (12 Tỉnh/TP)">
                      {provinceOptions.filter((p) => p.region === "NORTH").map((prov) => (
                        <option key={prov.code} value={prov.code}>
                          {prov.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Miền Trung & Tây Nguyên (10 Tỉnh/TP)">
                      {provinceOptions.filter((p) => p.region === "CENTRAL").map((prov) => (
                        <option key={prov.code} value={prov.code}>
                          {prov.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Miền Nam (12 Tỉnh/TP)">
                      {provinceOptions.filter((p) => p.region === "SOUTH").map((prov) => (
                        <option key={prov.code} value={prov.code}>
                          {prov.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  {/* Dropdown Floating Panel */}
                  {isProvinceDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full min-w-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden text-caption animate-in fade-in-50 zoom-in-95 duration-100">
                      {/* Search box inside dropdown */}
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            value={provinceSearch}
                            onChange={(e) => setProvinceSearch(e.target.value)}
                            placeholder="Nhập tìm kiếm tỉnh thành..."
                            className="w-full pl-8 pr-7 py-1.5 text-caption bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:border-brand-500"
                            autoFocus
                            data-testid="province-search-input"
                          />
                          {provinceSearch && (
                            <button
                              type="button"
                              onClick={() => setProvinceSearch("")}
                              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Quick action bar */}
                        <div className="flex items-center justify-between mt-1.5 px-0.5 text-caption">
                          <span className="text-slate-400">
                            {filteredProvinces.length} địa bàn
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={selectAllProvinces}
                              className="text-brand-600 dark:text-brand-400 hover:underline font-medium cursor-pointer"
                            >
                              Chọn tất cả
                            </button>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <button
                              type="button"
                              onClick={clearAllProvinces}
                              className="text-slate-500 hover:underline cursor-pointer"
                            >
                              Bỏ chọn
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Province list with checkboxes grouped by region */}
                      <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredProvinces.length === 0 ? (
                          <div className="py-4 text-center text-slate-400 text-xs">
                            Không tìm thấy tỉnh/thành phố phù hợp
                          </div>
                        ) : (
                          <>
                            {filteredProvinces.filter((p) => p.region === "NORTH").length > 0 && (
                              <div className="py-1">
                                <div className="px-2.5 py-1 text-caption font-bold text-slate-400 uppercase tracking-wider">
                                  Miền Bắc ({filteredProvinces.filter((p) => p.region === "NORTH").length})
                                </div>
                                {filteredProvinces
                                  .filter((p) => p.region === "NORTH")
                                  .map((prov) => (
                                    <label
                                      key={prov.code}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-slate-700 dark:text-slate-200 transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedProvinces.includes(prov.code)}
                                        onChange={() => toggleProvince(prov.code)}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                        data-testid={`province-checkbox-${prov.code}`}
                                      />
                                      <span className="truncate">{prov.name}</span>
                                    </label>
                                  ))}
                              </div>
                            )}

                            {filteredProvinces.filter((p) => p.region === "CENTRAL").length > 0 && (
                              <div className="py-1">
                                <div className="px-2.5 py-1 text-caption font-bold text-slate-400 uppercase tracking-wider">
                                  Miền Trung & Tây Nguyên ({filteredProvinces.filter((p) => p.region === "CENTRAL").length})
                                </div>
                                {filteredProvinces
                                  .filter((p) => p.region === "CENTRAL")
                                  .map((prov) => (
                                    <label
                                      key={prov.code}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-slate-700 dark:text-slate-200 transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedProvinces.includes(prov.code)}
                                        onChange={() => toggleProvince(prov.code)}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                        data-testid={`province-checkbox-${prov.code}`}
                                      />
                                      <span className="truncate">{prov.name}</span>
                                    </label>
                                  ))}
                              </div>
                            )}

                            {filteredProvinces.filter((p) => p.region === "SOUTH").length > 0 && (
                              <div className="py-1">
                                <div className="px-2.5 py-1 text-caption font-bold text-slate-400 uppercase tracking-wider">
                                  Miền Nam ({filteredProvinces.filter((p) => p.region === "SOUTH").length})
                                </div>
                                {filteredProvinces
                                  .filter((p) => p.region === "SOUTH")
                                  .map((prov) => (
                                    <label
                                      key={prov.code}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-slate-700 dark:text-slate-200 transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedProvinces.includes(prov.code)}
                                        onChange={() => toggleProvince(prov.code)}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                        data-testid={`province-checkbox-${prov.code}`}
                                      />
                                      <span className="truncate">{prov.name}</span>
                                    </label>
                                  ))}
                              </div>
                            )}

                            {filteredProvinces.filter(
                              (p) => !["NORTH", "CENTRAL", "SOUTH"].includes(p.region || "")
                            ).length > 0 && (
                              <div className="py-1">
                                <div className="px-2.5 py-1 text-caption font-bold text-slate-400 uppercase tracking-wider">
                                  Khác
                                </div>
                                {filteredProvinces
                                  .filter((p) => !["NORTH", "CENTRAL", "SOUTH"].includes(p.region || ""))
                                  .map((prov) => (
                                    <label
                                      key={prov.code}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-slate-700 dark:text-slate-200 transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedProvinces.includes(prov.code)}
                                        onChange={() => toggleProvince(prov.code)}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                        data-testid={`province-checkbox-${prov.code}`}
                                      />
                                      <span className="truncate">{prov.name}</span>
                                    </label>
                                  ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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

            {/* Active Filter Chips Bar (T141) */}
            {(Boolean(searchTerm.trim()) || selectedDegrees.length > 0 || selectedSectors.length > 0 || selectedProvinces.length > 0 || acceptingConsultation) && (
              <div className="flex flex-wrap items-center gap-2 mb-3" aria-label="Tiêu chí đang chọn">
                <span className="text-caption font-semibold text-slate-500 dark:text-slate-400">Đang lọc:</span>
                {searchTerm.trim() && (
                  <span className="min-h-8 px-2.5 py-1 inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-caption font-medium dark:bg-brand-950/70 dark:border-brand-800 dark:text-brand-300">
                    <span>Tìm kiếm: &ldquo;{searchTerm}&rdquo;</span>
                    <button
                      type="button"
                      aria-label="Xóa từ khóa tìm kiếm"
                      onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                      className="hover:text-brand-900 rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {selectedDegrees.map((deg) => (
                  <span key={deg} className="min-h-8 px-2.5 py-1 inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-caption font-medium dark:bg-brand-950/70 dark:border-brand-800 dark:text-brand-300">
                    <span>Học vị: {DEGREE_OPTIONS.find((x) => x.value === deg)?.label || deg}</span>
                    <button
                      type="button"
                      aria-label={`Bỏ chọn học vị ${deg}`}
                      onClick={() => {
                        setSelectedDegrees((prev) => prev.filter((v) => v !== deg));
                        setCurrentPage(1);
                      }}
                      className="hover:text-brand-900 rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {selectedSectors.map((sec) => (
                  <span key={sec} className="min-h-8 px-2.5 py-1 inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-caption font-medium dark:bg-brand-950/70 dark:border-brand-800 dark:text-brand-300">
                    <span>Ngành: {sectorOptions.find((x) => x.code === sec)?.name || sec}</span>
                    <button
                      type="button"
                      aria-label={`Bỏ chọn ngành ${sec}`}
                      onClick={() => {
                        setSelectedSectors((prev) => prev.filter((v) => v !== sec));
                        setCurrentPage(1);
                      }}
                      className="hover:text-brand-900 rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {selectedProvinces.map((provCode) => {
                  const provName = provinceOptions.find((x) => x.code === provCode)?.name || provCode;
                  return (
                    <span
                      key={provCode}
                      className="min-h-8 px-2.5 py-1 inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-caption font-medium dark:bg-brand-950/70 dark:border-brand-800 dark:text-brand-300"
                    >
                      <span>Địa bàn: {provName}</span>
                      <button
                        type="button"
                        aria-label={`Bỏ chọn địa bàn ${provName}`}
                        onClick={() => {
                          setSelectedProvinces((prev) => prev.filter((p) => p !== provCode));
                          setCurrentPage(1);
                        }}
                        className="hover:text-brand-900 rounded-full p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })}
                {acceptingConsultation && (
                  <span className="min-h-8 px-2.5 py-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-caption font-medium dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-300">
                    <span>Sẵn sàng nhận tư vấn</span>
                    <button
                      type="button"
                      aria-label="Bỏ lọc sẵn sàng nhận tư vấn"
                      onClick={() => { setAcceptingConsultation(false); setCurrentPage(1); }}
                      className="hover:text-emerald-900 rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-caption font-bold text-brand-700 hover:text-brand-800 underline ml-1 dark:text-brand-300"
                >
                  [Đặt lại bộ lọc]
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start" data-testid="expert-loading-grid">
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
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-brand-300 hover:shadow-md transition-all flex flex-col h-full group dark:bg-slate-900 dark:border-slate-800"
                    >
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-start gap-3">
                          <ExpertAvatar
                            fullName={expert.fullName}
                            avatarUrl={expert.avatarUrl}
                            expertCode={expert.expertCode}
                            size="md"
                            isVerified={expert.isVerified}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-caption font-bold border ${badge.cls}`}>
                                {badge.label}
                              </span>
                              <span className="px-2 py-0.5 rounded text-caption font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                <ShieldCheck className="w-3 h-3" /> Đã xác thực
                              </span>
                              {Boolean(expert.connectionCount && expert.connectionCount > 0) && (
                                <span
                                  data-testid="expert-connection-badge"
                                  className="px-2 py-0.5 rounded text-caption font-bold bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800"
                                >
                                  <Users className="w-3 h-3" />
                                  <span>🤝 {expert.connectionCount} lượt kết nối</span>
                                </span>
                              )}
                            </div>
                            <h3 className="text-body font-extrabold text-slate-900 mt-1 line-clamp-2 min-h-[44px] flex items-center group-hover:text-brand-700 transition break-words dark:text-white dark:group-hover:text-brand-200">
                              <Link href={`/experts/${expert.expertCode}`}>{expert.fullName}</Link>
                            </h3>
                            <p className="text-caption text-slate-500 truncate min-h-[20px] mt-0.5 dark:text-slate-400" title={expert.organizationName}>
                              {expert.organizationName}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 min-h-[64px]">
                          <div className="text-caption font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                            Ngành chuyên môn:
                          </div>
                          <span className="inline-block px-2.5 py-1 rounded-lg text-caption font-bold bg-brand-50 text-brand-800 border border-brand-200 max-w-full truncate dark:bg-brand-950/70 dark:text-brand-200 dark:border-brand-800">
                            {sectorOptions.find((s) => s.code === expert.primarySectorCode)?.name ||
                              expert.primarySectorName ||
                              "Công nghệ chủ chốt"}
                          </span>

                          <div className="mt-2 flex items-center gap-1.5 flex-wrap min-h-6">
                            {expert.masteredTechCodes && expert.masteredTechCodes.length > 0 ? (
                              <>
                                {expert.masteredTechCodes.slice(0, 2).map((code) => {
                                  const label = resolveTechLabel(code);
                                  return (
                                    <span
                                      key={code}
                                      className="px-2 py-0.5 rounded text-caption font-sans bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[160px] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                      title={label}
                                    >
                                      {label}
                                    </span>
                                  );
                                })}
                                {expert.masteredTechCodes.length > 2 && (
                                  <span
                                    data-testid="expert-tech-pill-badge"
                                    className="bg-slate-100 text-slate-600 border border-slate-200 text-xs px-2 py-0.5 rounded-full font-medium dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                  >
                                    +{expert.masteredTechCodes.length - 2} công nghệ
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-caption text-slate-400 italic font-sans">Đang cập nhật công nghệ</span>
                            )}
                          </div>
                        </div>

                        {((expert.publicationCount > 0) || (expert.patentCount > 0) || (expert.projectCount > 0)) && (
                          <div className="mt-3 flex flex-wrap gap-1.5 py-1.5" data-testid="expert-achievements-block">
                            {expert.publicationCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md text-caption font-semibold bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-sky-600" />
                                {expert.publicationCount}+ Công bố quốc tế
                              </span>
                            )}
                            {expert.patentCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md text-caption font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-600" />
                                {expert.patentCount} Bằng sáng chế
                              </span>
                            )}
                            {expert.projectCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md text-caption font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                <Layers className="w-3 h-3 text-emerald-600" />
                                {expert.projectCount} Đề tài KH
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 dark:border-slate-800">
                        <Link
                          href={`/experts/${expert.expertCode}`}
                          className="flex-1 min-h-11 flex items-center justify-center py-2 text-center text-caption font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition dark:bg-brand-950/60 dark:text-brand-200 dark:hover:bg-brand-900/60"
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

                {/* Khối gợi ý và tự động điền thông tin tài khoản */}
                {currentUser ? (
                  <div className="flex items-center justify-between bg-brand-50/80 dark:bg-brand-950/40 p-2.5 rounded-xl border border-brand-200/80 dark:border-brand-800 text-xs text-brand-900 dark:text-cyan-300">
                    <div className="flex items-center gap-1.5 font-medium truncate mr-2">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400 shrink-0" />
                      <span className="truncate">
                        Đang đăng nhập: <strong>{currentUser.fullName}</strong>
                        {currentUser.organizationName ? ` (${currentUser.organizationName})` : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillUser}
                      className="text-xs font-bold text-brand-700 dark:text-cyan-400 hover:underline shrink-0"
                    >
                      Điền lại từ tài khoản
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    <span className="truncate">
                      Đã có tài khoản Doanh nghiệp / Thành viên?
                    </span>
                    <Link
                      href="/login?redirect=/experts"
                      className="text-xs font-bold text-brand-700 dark:text-cyan-400 hover:underline shrink-0"
                    >
                      Đăng nhập để điền nhanh →
                    </Link>
                  </div>
                )}

                {autoFilled && currentUser && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Đã tự động điền thông tin từ hồ sơ tài khoản của bạn</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1 dark:text-slate-300">Tên Doanh nghiệp / Tổ chức của bạn (*)</label>
                  <input
                    type="text"
                    required
                    value={modalCompanyName}
                    onChange={(e) => setModalCompanyName(e.target.value)}
                    placeholder="VD: Công ty Cổ phần Công nghệ ABC"
                    className="form-control w-full text-sm"
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
                      className="form-control w-full text-sm"
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
                      className="form-control w-full text-sm"
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
                    className="form-control w-full text-sm"
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
                    className="h-11 px-5 rounded-control border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 text-sm transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={modalSending}
                    className="h-11 px-6 rounded-control bg-brand-700 hover:bg-brand-800 text-white font-bold shadow-sm transition text-sm disabled:opacity-50"
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
