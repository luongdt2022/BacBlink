"use client";

import React, { useState, useEffect, useTransition, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Filter,
  ShieldCheck,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
  Building2,
  RefreshCw,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Compass,
  Lightbulb,
} from "lucide-react";
import {
  fetchPublicOffers,
  SECTORS_18_CATALOG,
} from "@/services/api/technology-offer";
import { TechnologyOffer, SectorItem } from "@/types/technology-offer";
import { Async, AsyncState } from "@/components/ui/async";
import { getActiveSectors, SectorOption } from "@/lib/master-data-client";
import { portalClient, PortalOverviewStats } from "@/lib/portal-client";
import { getTechnologyImage } from "@/lib/technology-media";
import { SectorBannerBackground } from "@/components/enterprise/SectorBannerBackground";

function ChaoBanCongNgheContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Query Parameters Parsing
  const initialSearch = searchParams.get("search") || "";
  const initialSector = searchParams.get("sector") || "ALL";
  const initialTab = (searchParams.get("tab") as "ALL" | "COMMERCIAL" | "TRANSFER") || "ALL";
  const initialTrl = searchParams.get("trl") ? Number(searchParams.get("trl")) : undefined;
  const initialIp = searchParams.get("ip") || "ALL";
  const initialSort = searchParams.get("sort") || "latest";
  const initialPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  // State
  const [offers, setOffers] = useState<TechnologyOffer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Baseline platform data for dynamic counting & metrics
  const [baselineOffers, setBaselineOffers] = useState<TechnologyOffer[]>([]);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [activeSectors, setActiveSectors] = useState<SectorOption[]>(
    SECTORS_18_CATALOG.filter((s) => s.code !== "ALL")
  );
  const [heroStatsState, setHeroStatsState] = useState<AsyncState>("loading");
  const [portalStats, setPortalStats] = useState<PortalOverviewStats | null>(null);
  const [heroStatsVersion, setHeroStatsVersion] = useState(0);

  // Filters state
  const [search, setSearch] = useState(initialSearch);
  const [selectedSector, setSelectedSector] = useState(initialSector);
  const [activeTab, setActiveTab] = useState<"ALL" | "COMMERCIAL" | "TRANSFER">(initialTab);
  const [selectedTrl, setSelectedTrl] = useState<number | undefined>(initialTrl);
  const [selectedIp, setSelectedIp] = useState(initialIp);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Synchronize state with URL query parameters
  const updateUrl = (updates: {
    search?: string;
    sector?: string;
    tab?: "ALL" | "COMMERCIAL" | "TRANSFER";
    trl?: number;
    ip?: string;
    sort?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    const newSearch = updates.search !== undefined ? updates.search : search;
    const newSector = updates.sector !== undefined ? updates.sector : selectedSector;
    const newTab = updates.tab !== undefined ? updates.tab : activeTab;
    const newTrl = updates.trl !== undefined ? updates.trl : selectedTrl;
    const newIp = updates.ip !== undefined ? updates.ip : selectedIp;
    const newSort = updates.sort !== undefined ? updates.sort : sortBy;
    const newPage = updates.page !== undefined ? updates.page : currentPage;

    if (newSearch.trim()) params.set("search", newSearch.trim());
    else params.delete("search");

    if (newSector !== "ALL") params.set("sector", newSector);
    else params.delete("sector");

    if (newTab !== "ALL") params.set("tab", newTab);
    else params.delete("tab");

    if (newTrl !== undefined) params.set("trl", String(newTrl));
    else params.delete("trl");

    if (newIp !== "ALL") params.set("ip", newIp);
    else params.delete("ip");

    if (newSort !== "latest") params.set("sort", newSort);
    else params.delete("sort");

    if (newPage > 1) params.set("page", String(newPage));
    else params.delete("page");

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Load active sectors and portal stats dynamically
  useEffect(() => {
    let cancelled = false;
    getActiveSectors()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setActiveSectors(data);
        }
      })
      .catch(() => {});

    setHeroStatsState("loading");
    portalClient
      .getStats()
      .then((data) => {
        if (!cancelled) {
          setPortalStats(data);
          setHeroStatsState("success");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHeroStatsState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [heroStatsVersion]);

  // Load baseline offers once to calculate dynamic counts
  useEffect(() => {
    const loadBaseline = async () => {
      try {
        const res = await fetchPublicOffers({ limit: 100 });
        setBaselineOffers(res.data);
        setGlobalTotal(res.total);
      } catch (e) {
        console.error("Lỗi khi tải dữ liệu tổng thể:", e);
      }
    };
    loadBaseline();
  }, []);

  // Compute dynamic sector counts from baseline offers
  const sectorCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of baselineOffers) {
      if (item.sectorCode) {
        map[item.sectorCode] = (map[item.sectorCode] || 0) + 1;
      }
    }
    return map;
  }, [baselineOffers]);

  // Tab counts based on baseline offers
  const transferCount = useMemo(
    () => baselineOffers.filter((x) => x.hasTechTransfer).length,
    [baselineOffers]
  );
  const commercialCount = useMemo(
    () => baselineOffers.filter((x) => !x.hasTechTransfer).length,
    [baselineOffers]
  );
  const patentCount = useMemo(
    () => baselineOffers.filter((x) => x.ipStatus === "PATENT_GRANTED").length,
    [baselineOffers]
  );

  // Main data loader based on active filters
  const loadData = async (page = currentPage) => {
    setIsLoading(true);
    setHasError(false);
    try {
      let hasTechTransfer: boolean | undefined = undefined;
      if (activeTab === "COMMERCIAL") hasTechTransfer = false;
      else if (activeTab === "TRANSFER") hasTechTransfer = true;

      const res = await fetchPublicOffers({
        search: search.trim() || undefined,
        sectorCode: selectedSector !== "ALL" ? selectedSector : undefined,
        hasTechTransfer: hasTechTransfer,
        minTrl: selectedTrl,
        ipStatus: selectedIp !== "ALL" ? selectedIp : undefined,
        page: page,
        limit: 12,
      });

      // Apply client-side sorting if needed
      let sortedItems = [...res.data];
      if (sortBy === "trl_desc") {
        sortedItems.sort((a, b) => (b.trlLevel || 0) - (a.trlLevel || 0));
      } else if (sortBy === "patent") {
        sortedItems.sort((a, b) => {
          const aPatent = a.ipStatus === "PATENT_GRANTED" ? 1 : 0;
          const bPatent = b.ipStatus === "PATENT_GRANTED" ? 1 : 0;
          return bPatent - aPatent;
        });
      } else if (sortBy === "price_asc") {
        sortedItems.sort((a, b) => (a.priceAmount || a.priceMin || 0) - (b.priceAmount || b.priceMin || 0));
      } else if (sortBy === "price_desc") {
        sortedItems.sort((a, b) => (b.priceAmount || b.priceMax || 0) - (a.priceAmount || a.priceMin || 0));
      }

      setOffers(sortedItems);
      setTotal(res.total);
      setTotalPages(res.totalPages || Math.ceil(res.total / 12) || 1);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [selectedSector, activeTab, selectedTrl, selectedIp, sortBy, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateUrl({ search, page: 1 });
    startTransition(() => {
      loadData(1);
    });
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
    updateUrl({ search: "", page: 1 });
    startTransition(() => {
      loadData(1);
    });
  };

  const handleSectorChange = (code: string) => {
    setSelectedSector(code);
    setCurrentPage(1);
    updateUrl({ sector: code, page: 1 });
  };

  const handleTabChange = (tab: "ALL" | "COMMERCIAL" | "TRANSFER") => {
    setActiveTab(tab);
    setCurrentPage(1);
    updateUrl({ tab, page: 1 });
  };

  const handleTrlChange = (trl?: number) => {
    setSelectedTrl(trl);
    setCurrentPage(1);
    updateUrl({ trl, page: 1 });
  };

  const handleIpChange = (ip: string) => {
    setSelectedIp(ip);
    setCurrentPage(1);
    updateUrl({ ip, page: 1 });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateUrl({ sort });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    updateUrl({ page: newPage });
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  const resetAllFilters = () => {
    setSearch("");
    setSelectedSector("ALL");
    setActiveTab("ALL");
    setSelectedTrl(undefined);
    setSelectedIp("ALL");
    setSortBy("latest");
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  // Helper mappings
  const getTrlBadgeColor = (level?: number | null) => {
    if (!level) return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    if (level >= 7) return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-extrabold";
    if (level >= 4) return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-bold";
    return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 font-bold";
  };

  const getIpStatusLabel = (status?: string | null) => {
    switch (status) {
      case "PATENT_GRANTED":
        return "Bằng Độc Quyền Sáng Chế";
      case "UTILITY_MODEL":
        return "Giải Pháp Hữu Ích";
      case "TRADE_SECRET":
        return "Bí Quyết Công Nghệ (Know-how)";
      case "COPYRIGHT_REGISTERED":
      case "SOFTWARE_COPYRIGHT":
        return "Đã Đăng Ký Bản Quyền";
      case "PATENT_APPLICATION":
      case "PATENT_PENDING":
        return "Đang Nộp Đơn Thẩm Định";
      default:
        return "Chưa Đăng Ký SHTT";
    }
  };

  const getOfferTypeLabel = (type?: string | null) => {
    switch (type) {
      case "SOFTWARE":
        return "Phần mềm";
      case "EQUIPMENT":
        return "Thiết bị / Dây chuyền";
      case "PROCESS":
        return "Quy trình công nghệ";
      case "SOLUTION":
        return "Giải pháp";
      case "DEVICE":
        return "Thiết bị";
      default:
        return "Sản phẩm";
    }
  };

  const formatPrice = (offer: TechnologyOffer) => {
    if (offer.pricingType === "CONTACT") return "Thỏa thuận / Liên hệ";
    if (offer.pricingType === "FIXED" && offer.priceAmount) {
      const amount = offer.priceAmount;
      if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} Tỷ ${
          offer.unit ? "/" + offer.unit : ""
        }`;
      }
      return `${(amount / 1_000_000).toLocaleString("vi-VN")} Triệu ${offer.unit ? "/" + offer.unit : ""}`;
    }
    if (offer.pricingType === "RANGE" && offer.priceMin && offer.priceMax) {
      const min = offer.priceMin;
      const max = offer.priceMax;
      if (max >= 1_000_000_000) {
        return `${(min / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} - ${(
          max / 1_000_000_000
        ).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} Tỷ`;
      }
      return `${(min / 1_000_000).toLocaleString("vi-VN")} - ${(max / 1_000_000).toLocaleString("vi-VN")} Triệu`;
    }
    return "Thỏa thuận";
  };

  // Check if any filter is currently active
  const hasActiveFilters =
    selectedSector !== "ALL" ||
    activeTab !== "ALL" ||
    selectedTrl !== undefined ||
    selectedIp !== "ALL" ||
    search.trim() !== "";

  const selectedSectorName =
    SECTORS_18_CATALOG.find((s) => s.code === selectedSector)?.name || selectedSector;

  return (
    <div className="min-h-screen bg-surface-page dark:bg-slate-950 text-text-primary dark:text-slate-100 flex flex-col">
      {/* HERO BANNER SECTION (WITH BASIC DESIGN WIREFRAME QUICK METRICS) */}
      <section className="relative overflow-hidden bg-brand-700 text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0 opacity-80" />
        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Sàn Giao Dịch Chào Bán Công Nghệ, Thiết Bị & Sáng Chế (NacenTwin)
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Thị Trường Công Nghệ & Sáng Chế Thương Mại Hóa
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xl">
              Sàn niêm yết các giải pháp kỹ thuật, sáng chế và thiết bị thương mại đã được thẩm định
              pháp lý từ các Viện nghiên cứu, Trường đại học và Doanh nghiệp ĐMST trên toàn quốc.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/portal/seller/technologies"
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 backdrop-blur-sm shadow-sm"
              >
                <Layers className="w-4 h-4 text-teal-300" />
                Kho Seller Workspace
              </Link>
              <Link
                href="/portal/seller/technologies/create"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-emerald-950/20"
              >
                <PlusCircle className="w-4 h-4" />
                Đăng Chào Bán Mới
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar có chuẩn hóa 5 UX States qua <Async> */}
          <div className="shrink-0">
            <Async
              state={heroStatsState}
              onRetry={() => setHeroStatsVersion((v) => v + 1)}
              loadingSkeleton={
                <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/20 shrink-0 text-center animate-pulse">
                  <div className="px-1 sm:px-2">
                    <div className="h-7 w-12 bg-white/20 rounded mx-auto mb-1" />
                    <div className="text-caption text-white/85 font-bold uppercase mt-1 tracking-wider">
                      Hồ Sơ Niêm Yết
                    </div>
                  </div>
                  <div className="border-x border-white/20 px-2 sm:px-3">
                    <div className="h-7 w-12 bg-white/20 rounded mx-auto mb-1" />
                    <div className="text-caption text-white/85 font-bold uppercase mt-1 tracking-wider">
                      Phân Loại TT17
                    </div>
                  </div>
                  <div className="px-1 sm:px-2">
                    <div className="h-7 w-12 bg-white/20 rounded mx-auto mb-1" />
                    <div className="text-caption text-white/85 font-bold uppercase mt-1 tracking-wider">
                      Sáng Chế Độc Quyền
                    </div>
                  </div>
                </div>
              }
              errorContent={
                <div className="bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/20 shrink-0 text-center text-white">
                  <p className="text-xs text-rose-200">Không thể tải số liệu thống kê.</p>
                  <button
                    type="button"
                    onClick={() => setHeroStatsVersion((v) => v + 1)}
                    className="mt-1 text-xs font-bold underline hover:text-white cursor-pointer"
                  >
                    Tải lại số liệu
                  </button>
                </div>
              }
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 shrink-0 text-center shadow-lg">
                <div className="px-1 sm:px-2">
                  <div className="text-xl sm:text-2xl font-black text-emerald-300">
                    {(portalStats?.totalOffers ?? globalTotal ?? 0).toLocaleString("vi-VN")}
                  </div>
                  <div className="text-caption text-white/85 font-bold uppercase mt-1 tracking-wider">
                    Hồ Sơ Niêm Yết
                  </div>
                </div>
                <div className="border-x border-white/20 px-2 sm:px-3">
                  <div className="text-xl sm:text-2xl font-black text-teal-300">
                    {activeSectors.length > 0 ? `${activeSectors.length} Lĩnh Vực` : "10 Lĩnh Vực"}
                  </div>
                  <div className="text-caption text-white/85 font-bold uppercase mt-1 tracking-wider">
                    Phân Loại TT17
                  </div>
                </div>
                <div className="px-1 sm:px-2">
                  <div className="text-xl sm:text-2xl font-black text-amber-300">
                    {(patentCount ?? 0).toLocaleString("vi-VN")} Bằng
                  </div>
                  <div className="text-caption text-white/85 font-bold uppercase mt-1 tracking-wider">
                    Sáng Chế Độc Quyền
                  </div>
                </div>
              </div>
            </Async>
          </div>
        </div>
      </section>

      {/* FILTER TABS & SEARCH BAR (STICKY NAV) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* TABS (WITH SEMANTIC GLOBAL COUNTS) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => handleTabChange("ALL")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-white dark:bg-slate-700 text-brand-800 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Tất Cả Loại Hình ({globalTotal})
            </button>
            <button
              onClick={() => handleTabChange("TRANSFER")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "TRANSFER"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-700"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Chuyển Giao SHTT & TRL ({transferCount})
            </button>
            <button
              onClick={() => handleTabChange("COMMERCIAL")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === "COMMERCIAL"
                  ? "bg-white dark:bg-slate-700 text-brand-800 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              Thiết Bị Thương Mại ({commercialCount})
            </button>
          </div>

          {/* SEARCH INPUT (WITH CLEAR BUTTON) */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm công nghệ, sáng chế, đơn vị..."
                className="w-full h-10 pl-9 pr-8 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-control focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 dark:text-white"
              />
              {search.trim() && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title="Xóa từ khóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-10 bg-brand-700 hover:bg-brand-800 text-white px-4 rounded-control text-xs sm:text-sm font-bold transition shrink-0 shadow-sm"
            >
              Tìm
            </button>
          </form>
        </div>
      </div>

      {/* MAIN CONTENT BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* SIDEBAR BỘ LỌC ĐA TẦNG 10 LĨNH VỰC CHUẨN CSDL */}
        <aside className="lg:col-span-1 space-y-5">
          {/* Lọc 10 Lĩnh vực TT17 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                {activeSectors.length > 0 ? `${activeSectors.length} Lĩnh Vực Công Nghệ` : "Lĩnh Vực Công Nghệ"}
              </h3>
              {selectedSector !== "ALL" && (
                <button
                  onClick={() => handleSectorChange("ALL")}
                  className="text-xs text-emerald-600 hover:underline font-bold"
                >
                  Đặt lại
                </button>
              )}
            </div>

            <div className="space-y-1">
              <button
                key="ALL"
                onClick={() => handleSectorChange("ALL")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition ${
                  selectedSector === "ALL"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-800"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate pr-2">Tất cả lĩnh vực</span>
                <span
                  className={`text-caption px-2 py-0.5 rounded-full font-bold ${
                    selectedSector === "ALL"
                      ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {globalTotal}
                </span>
              </button>

              {activeSectors
                .filter((sec) => sec.code !== "ALL")
                .map((sec) => {
                  const count = sectorCounts[sec.code] || 0;
                  const isSelected = selectedSector === sec.code;
                  return (
                    <button
                      key={sec.code}
                      onClick={() => handleSectorChange(sec.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-800"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="truncate pr-2">{sec.name}</span>
                      <span
                        className={`text-caption px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Lọc Thang đo TRL (1 - 9) Quang Phổ 3 Phân Đoạn Chuẩn BD-04 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Mức Sẵn Sàng Công Nghệ (TRL)
            </h3>
            <p className="text-caption text-slate-500 dark:text-slate-400">
              Quang phổ 3 phân đoạn mức độ sẵn sàng chuyển giao:
            </p>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { trl: undefined, label: "Tất cả", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
                { trl: 7, label: "TRL 7-9 Thương Mại", color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300" },
                { trl: 8, label: "TRL 8+", color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300" },
                { trl: 9, label: "TRL 9 Hoàn thiện", color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300" },
                { trl: 4, label: "TRL 4-6 Pilot", color: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300" },
                { trl: 1, label: "TRL 1-3 Lab", color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTrlChange(item.trl)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition text-center ${
                    selectedTrl === item.trl
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : `${item.color} border-slate-200 dark:border-slate-700 hover:opacity-80`
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lọc Tình trạng Bảo hộ SHTT (Mapping đầy đủ chuẩn CSDL) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                Tình Trạng Sở Hữu Trí Tuệ (SHTT)
              </h3>
              <p className="mt-1 text-caption text-slate-500 dark:text-slate-400">
                Tình trạng bảo hộ pháp lý: Sáng chế, giải pháp hữu ích, bí quyết hoặc bản quyền
              </p>
            </div>
            <div className="space-y-1.5">
              {[
                { code: "ALL", label: "Tất cả tình trạng" },
                { code: "PATENT_GRANTED", label: "Bằng độc quyền sáng chế" },
                { code: "UTILITY_MODEL", label: "Bằng giải pháp hữu ích" },
                { code: "TRADE_SECRET", label: "Bí quyết công nghệ (Know-how)" },
                { code: "COPYRIGHT_REGISTERED", label: "Đã đăng ký bản quyền" },
                { code: "PATENT_APPLICATION", label: "Đang nộp đơn thẩm định" },
              ].map((ip) => (
                <button
                  key={ip.code}
                  onClick={() => handleIpChange(ip.code)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${
                    selectedIp === ip.code
                      ? "bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-200 font-bold border border-brand-200 dark:border-brand-800"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {ip.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* RESULTS GRID & CONTROLS */}
        <section className="lg:col-span-3 space-y-5">
          {/* HEADER KẾT QUẢ & DROPDOWN SẮP XẾP */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Danh Sách Hồ Sơ Công Nghệ Niêm Yết
              </h2>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {total} kết quả
              </span>
              {totalPages > 1 && (
                <span className="text-caption text-slate-500">
                  (Trang {currentPage}/{totalPages})
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="latest">Mới niêm yết gần nhất</option>
                  <option value="trl_desc">Cấp TRL cao nhất (9 → 1)</option>
                  <option value="patent">Có bằng sáng chế độc quyền</option>
                  <option value="price_asc">Giá chuyển giao: Thấp → Cao</option>
                  <option value="price_desc">Giá chuyển giao: Cao → Thấp</option>
                </select>
              </div>

              <button
                onClick={() => loadData(currentPage)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 p-1"
                title="Làm mới danh sách"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>
          </div>

          {/* ACTIVE FILTER CHIPS (ALLOWS INDIVIDUAL FILTER REMOVAL) */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-500 text-caption uppercase tracking-wider">
                Đang lọc:
              </span>

              {selectedSector !== "ALL" && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                  Ngành: {selectedSectorName}
                  <button onClick={() => handleSectorChange("ALL")} className="hover:text-emerald-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeTab !== "ALL" && (
                <span className="inline-flex items-center gap-1 bg-brand-100 text-brand-800 px-2 py-0.5 rounded-md font-bold">
                  Loại: {activeTab === "TRANSFER" ? "Chuyển giao SHTT" : "Thiết bị thương mại"}
                  <button onClick={() => handleTabChange("ALL")} className="hover:text-brand-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedTrl !== undefined && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">
                  TRL {selectedTrl}+
                  <button onClick={() => handleTrlChange(undefined)} className="hover:text-amber-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedIp !== "ALL" && (
                <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md font-bold">
                  Sở Hữu Trí Tuệ: {getIpStatusLabel(selectedIp)}
                  <button onClick={() => handleIpChange("ALL")} className="hover:text-teal-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {search.trim() && (
                <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-bold">
                  Từ khóa: "{search}"
                  <button onClick={handleClearSearch} className="hover:text-slate-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={resetAllFilters}
                className="text-caption font-bold text-rose-600 hover:underline ml-auto"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

          {/* STATE 1: LOADING */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 animate-pulse"
                >
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4"></div>
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
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
                onClick={() => loadData(currentPage)}
                className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-700 transition shadow-sm"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* STATE 3: EMPTY */}
          {!isLoading && !hasError && offers.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Không tìm thấy hồ sơ công nghệ phù hợp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Hãy thử nới lỏng các tiêu chí lọc theo lĩnh vực, mức TRL hoặc tìm kiếm với từ khóa khác.
              </p>
              <button
                onClick={resetAllFilters}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

          {/* STATE 4: SUCCESS (CARDS GRID & BALANCED LAYOUT) */}
          {!isLoading && !hasError && offers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {offers.map((offer) => {
                const coverImage = getTechnologyImage(offer.sectorCode, offer.title, offer.mainImageUrl);
                const isCustomImage = coverImage.startsWith("data:") || coverImage.startsWith("http");
                return (
                  <div
                    key={offer.id}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between border-t-4 border-t-emerald-600"
                  >
                    <div>
                      {/* Media Thumbnail Container (Chuẩn tỷ lệ 16:9 sắc nét) */}
                      <Link
                        href={`/chao-ban-cong-nghe/${offer.id}`}
                        className="relative block aspect-[16/9] w-full overflow-hidden bg-brand-700"
                        title={offer.title}
                      >
                        <Image
                          src={coverImage}
                          alt={offer.title}
                          fill
                          unoptimized={isCustomImage}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Sector Watermark Overlay */}
                        <SectorBannerBackground
                          sectorCode={offer.sectorCode}
                          sectorName={offer.sectorName}
                          opacity={0.45}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                        {/* Top Overlay Badges */}
                        <div className="absolute top-2.5 right-2.5">
                          <span className="text-caption bg-slate-900/85 backdrop-blur-md text-white px-2 py-0.5 rounded font-bold shadow-sm">
                            {getOfferTypeLabel(offer.offerType)}
                          </span>
                        </div>

                        {/* Bottom Overlay Badges */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                          <span className="text-caption font-bold text-white bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 line-clamp-1 max-w-[60%]">
                            {offer.sectorName}
                          </span>
                          {offer.hasTechTransfer && offer.trlLevel && (
                            <span
                              className={`text-caption px-2 py-0.5 rounded border shadow-sm flex items-center gap-1 ${getTrlBadgeColor(
                                offer.trlLevel
                              )}`}
                            >
                              <Award className="w-3 h-3" />
                              TRL {offer.trlLevel}/9
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Card Content Body */}
                      <div className="p-3.5 sm:p-4 space-y-2.5">
                        {/* Compact Offer Code Monospace */}
                        <div className="text-caption font-mono text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase">
                          Mã: {offer.offerCode}
                        </div>

                        {/* Title */}
                        <Link
                          href={`/chao-ban-cong-nghe/${offer.id}`}
                          className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white hover:text-emerald-600 transition block leading-snug line-clamp-2"
                        >
                          {offer.title}
                        </Link>

                        {/* Summary */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {offer.summary}
                        </p>

                        {/* SHTT & Đơn vị chào bán Info Badge */}
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/50 rounded-lg p-2 space-y-1.5 text-xs">
                          {offer.hasTechTransfer && (
                            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-bold truncate">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{getIpStatusLabel(offer.ipStatus)}</span>
                              {offer.ipRegistrationNumber && (
                                <span className="text-caption font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                                  • Số: {offer.ipRegistrationNumber}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Đơn vị chào bán / Doanh nghiệp sở hữu */}
                          {(offer.enterpriseName || offer.developerOrigin || offer.enterpriseTaxCode) ? (
                            offer.enterpriseTaxCode ? (
                              <Link
                                href={`/enterprises/${offer.enterpriseTaxCode}`}
                                className="flex items-center gap-1.5 text-caption text-brand-700 dark:text-brand-400 hover:text-brand-900 font-medium group/seller truncate"
                                title={`Xem hồ sơ doanh nghiệp: ${offer.enterpriseName || offer.developerOrigin || "Xem chi tiết"}`}
                              >
                                <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                <span className="truncate group-hover/seller:underline">
                                  {offer.enterpriseName || offer.developerOrigin || `MST: ${offer.enterpriseTaxCode}`}
                                </span>
                                <span className="text-xs font-mono text-brand-500 opacity-0 group-hover/seller:opacity-100 transition">↗</span>
                              </Link>
                            ) : (
                              <div
                                className="flex items-center gap-1.5 text-caption text-slate-600 dark:text-slate-400 font-medium truncate"
                                title={offer.enterpriseName || offer.developerOrigin || "Đang cập nhật đơn vị"}
                              >
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {offer.enterpriseName || offer.developerOrigin || "Đang cập nhật đơn vị"}
                                </span>
                              </div>
                            )
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Pricing & Action Emerald CTA */}
                    <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-caption text-slate-400 font-medium">Hình thức thương mại</p>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                          {formatPrice(offer)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/chao-ban-cong-nghe/${offer.id}`}
                          className="bg-[#2D9A85] hover:bg-[#247B6A] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-sm active:scale-95"
                        >
                          <span>Yêu Cầu Kết Nối</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* BALANCED FILLER CARD WHEN ONLY 1 RESULT (SOLVES THE 1-ITEM VOID) */}
              {offers.length === 1 && (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between items-center text-center space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="space-y-2 mt-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                      Khám phá thêm giải pháp công nghệ
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Bạn đang xem kết quả duy nhất phù hợp với bộ lọc hiện tại. Thử nới lỏng điều kiện hoặc xem các lĩnh vực liên quan.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSectorChange("ALL")}
                    className="mb-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shadow-xs"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    Xem tất cả 10 lĩnh vực ({globalTotal})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STATE 5: PAGINATION CONTROLS (RESTORED FROM BASIC DESIGN WIREFRAME) */}
          {!isLoading && !hasError && totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Trang Trước
              </button>

              <div className="flex items-center gap-1 text-xs font-bold">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-lg transition ${
                      currentPage === p
                        ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Trang Tiếp
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function ChaoBanCongNghePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-page flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4 max-w-md w-full animate-pulse text-center">
            <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto"></div>
            <div className="h-24 bg-slate-100 rounded"></div>
          </div>
        </div>
      }
    >
      <ChaoBanCongNgheContent />
    </Suspense>
  );
}
