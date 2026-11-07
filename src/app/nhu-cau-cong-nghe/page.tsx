"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Flame,
  Sparkles,
  ArrowRight,
  PlusCircle,
  FileQuestion,
  Tag,
  MapPin,
  ClipboardCheck,
  ShieldCheck,
  Building2,
  Bookmark,
  CheckCircle2,
  Coins,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Async, AsyncState } from "@/components/ui/async";
import QuickDemandModal from "@/components/demand/QuickDemandModal";
import { ConfirmModal } from "@/components/common/confirm-modal";
import { getTniClassification } from "@/components/demand/TniRealtimeCalculator";
import { useToast } from "@/components/common/toast";
import { authClient, ROLES } from "@/lib/auth-client";
import { getActiveSectors, SectorOption } from "@/lib/master-data-client";
import { portalClient, PortalOverviewStats } from "@/lib/portal-client";
import { SECTORS_18_CATALOG } from "@/services/api/technology-offer";
import { SectorBannerBackground } from "@/components/enterprise/SectorBannerBackground";

interface PublicDemandItem {
  id: string;
  itemCode: string;
  stageName: string;
  technicalProblem: string;
  sectorCode: string;
  techGroupCode: string;
  budgetRange: string;
  tniScore: number;
  tniClassification: string;
  expectedGoal: string;
  desiredSolution: string;
  province?: string;
}

export default function PublicDemandsPage() {
  const toast = useToast();
  const [filterSector, setFilterSector] = useState("");
  const [filterTni, setFilterTni] = useState("");
  const [filterBudget, setFilterBudget] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);
  const [publicDemands, setPublicDemands] = useState<PublicDemandItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // Lưới 3 cột x 3 hàng
  const [statsState, setStatsState] = useState<AsyncState>("loading");
  const [statsData, setStatsData] = useState<PortalOverviewStats | null>(null);
  const [statsVersion, setStatsVersion] = useState(0);

  const [sectors, setSectors] = useState<SectorOption[]>(
    SECTORS_18_CATALOG.filter((s) => s.code !== "ALL")
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [asyncState, setAsyncState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load danh sách ID bài toán đã bookmark từ server nếu đã đăng nhập
  const fetchBookmarkedIds = async () => {
    const token = authClient.getToken();
    if (!token) {
      setBookmarkedIds({});
      return;
    }
    try {
      const res = await fetch("/api/v1/demands/bookmarks/ids", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const ids: string[] = await res.json();
        const map: Record<string, boolean> = {};
        if (Array.isArray(ids)) {
          ids.forEach((id) => {
            map[id] = true;
          });
        }
        setBookmarkedIds(map);
      }
    } catch {
      // Bỏ qua lỗi ngầm, không ảnh hưởng danh sách chính
    }
  };

  useEffect(() => {
    fetchBookmarkedIds();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatsState("loading");
    portalClient
      .getStats()
      .then((data) => {
        if (!cancelled) {
          setStatsData(data);
          setStatsState("success");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatsState("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [statsVersion]);

  // Load 10 Lĩnh vực TT17 từ API Master Data
  useEffect(() => {
    getActiveSectors()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSectors(data);
        }
      })
      .catch(() => {
        // Fallback danh mục rỗng nếu API lỗi, chờ retry
        setSectors([]);
      });
  }, []);

  const loadDemands = async () => {
    setAsyncState("loading");
    setErrorMessage("");
    try {
      const params = new URLSearchParams();
      if (filterSector) params.append("sectorCode", filterSector);
      if (filterTni) params.append("tniClassification", filterTni);

      const res = await fetch(`/api/v1/public/demands?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setPublicDemands(list);
        if (list.length === 0) {
          setAsyncState("empty");
        } else {
          setAsyncState("success");
        }
      } else {
        setErrorMessage("Không thể tải danh sách bài toán nhu cầu từ máy chủ.");
        setAsyncState("error");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Lỗi kết nối máy chủ API.");
      setAsyncState("error");
    }
  };

  useEffect(() => {
    loadDemands();
  }, [filterSector, filterTni]);

  // Ánh xạ mã lĩnh vực sang tên tiếng Việt
  const getSectorName = (code?: string) => {
    if (!code) return "Lĩnh vực chung";
    const found = sectors.find((s) => s.code.toUpperCase() === code.toUpperCase());
    return found?.name || code;
  };

  const getSectorShortName = (code?: string) => {
    return getSectorName(code);
  };

  const bookmarkedCount = Object.values(bookmarkedIds).filter(Boolean).length;

  // Lọc tìm kiếm và ngân sách phía Client
  const filteredDemands = publicDemands.filter((item) => {
    // 0. Bộ lọc Chỉ hiển thị bài toán đã lưu theo dõi
    if (filterBookmarkedOnly && !bookmarkedIds[item.id]) {
      return false;
    }

    // 1. Text Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchText =
        item.technicalProblem?.toLowerCase().includes(query) ||
        item.stageName?.toLowerCase().includes(query) ||
        getSectorName(item.sectorCode).toLowerCase().includes(query) ||
        item.desiredSolution?.toLowerCase().includes(query);
      if (!matchText) return false;
    }

    // 2. Budget Range Filter
    if (filterBudget) {
      const budget = item.budgetRange?.toLowerCase() || "";
      if (filterBudget === "LT_500M" && (budget.includes("tỷ") || budget.includes("3 -") || budget.includes("2 -") || budget.includes("1.5"))) return false;
      if (filterBudget === "500M_1B" && !budget.includes("500") && !budget.includes("1 tỷ")) return false;
      if (filterBudget === "1B_3B" && !budget.includes("1") && !budget.includes("2") && !budget.includes("3 tỷ")) return false;
      if (filterBudget === "GT_3B" && !budget.includes("3 - 7") && !budget.includes("5 tỷ") && !budget.includes("trên")) return false;
    }

    return true;
  });

  // Tự động reset trang về 1 khi người dùng thay đổi bộ lọc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSector, filterTni, filterBudget, searchQuery, filterBookmarkedOnly]);

  const totalPages = Math.ceil(filteredDemands.length / pageSize) || 1;
  const paginatedDemands = filteredDemands.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  // Xử lý bảo vệ phân quyền khi bấm "Đăng Nhanh Bài Toán" (CR-TASK-03-DELTA-01: T-03.DEL-01 & T-03.DEL-02)
  const handleOpenQuickDemand = () => {
    const user = authClient.getUser();
    if (!user) {
      toast.info(
        "Quý khách vui lòng đăng nhập hoặc đăng ký tài khoản thành viên công chúng miễn phí để đăng bài toán kỹ thuật, hoặc điền Phiếu Khảo Sát DNNVV mở.",
        "Yêu Cầu Xác Thực"
      );
      return;
    }

    const role = (user.role || "").toUpperCase();
    const allowedRoles: string[] = [
      ROLES.PUBLIC_USER,
      ROLES.USER,
      ROLES.BUYER,
      ROLES.SELLER,
      ROLES.INNOVATION_ENTITY,
      ROLES.VERIFIED_EXPERT,
      ROLES.EXPERT,
      ROLES.ADMIN,
      ROLES.SUPER_ADMIN,
      ROLES.OPERATOR_ADMIN,
      ROLES.PROVINCIAL_ADMIN,
    ];

    if (allowedRoles.includes(role)) {
      setIsModalOpen(true);
    } else {
      toast.warning(
        `Tài khoản của bạn đang có vai trò [${user.role}]. Vui lòng sử dụng tài khoản phù hợp để đăng bài toán kỹ thuật.`,
        "Chưa Đủ Thẩm Quyền"
      );
    }
  };

  const toggleBookmark = async (id: string, title: string) => {
    const user = authClient.getUser();
    const token = authClient.getToken();
    if (!user || !token) {
      setShowAuthModal(true);
      toast.warning(
        "Quý đơn vị vui lòng đăng nhập tài khoản Doanh nghiệp hoặc Chuyên gia để lưu bài toán vào danh sách theo dõi.",
        "Yêu Cầu Xác Thực"
      );
      return;
    }

    try {
      const res = await fetch(`/api/v1/demands/${id}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const result = await res.json();
        const isNowBookmarked = Boolean(result.isBookmarked);
        setBookmarkedIds((prev) => ({
          ...prev,
          [id]: isNowBookmarked,
        }));
        if (isNowBookmarked) {
          toast.success(
            result.message || `Đã lưu bài toán "${title.slice(0, 40)}..." vào danh sách theo dõi.`,
            "Đã Lưu Bài Toán"
          );
        } else {
          toast.info(
            result.message || "Đã bỏ lưu bài toán khỏi danh sách theo dõi.",
            "Bỏ Theo Dõi"
          );
        }
      } else if (res.status === 401) {
        setShowAuthModal(true);
        toast.warning(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục lưu bài toán.",
          "Yêu Cầu Xác Thực"
        );
      } else {
        toast.error("Không thể cập nhật trạng thái lưu bài toán.", "Lỗi");
      }
    } catch {
      toast.error("Lỗi kết nối khi cập nhật lưu bài toán.", "Lỗi");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20">
      {/* HERO BANNER SECTION (ĐỒNG BỘ NACENTWIN VÀ BASIC DESIGN WIREFRAME) */}
      <section className="relative overflow-hidden bg-brand-700 text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        {/* Lớp nghệ thuật vi mạch vi tính nền mờ nhẹ */}
        <div
          aria-hidden="true"
          className="innovation-hero-art pointer-events-none absolute inset-0 opacity-80"
        />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Cột trái: Tiêu đề & Giới thiệu sắc nét */}
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Sàn Giao Dịch Bài Toán & Nhu Cầu Đổi Mới Công Nghệ (NacenTwin)
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Nhu Cầu Đổi Mới Công Nghệ Từ Doanh Nghiệp
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xl">
              Các bài toán kỹ thuật thực tế từ các DNNVV đã được chuẩn hóa chỉ số cấp thiết TNI (Technology Need Index).
              Hỗ trợ kết nối nhà khoa học, viện trường và doanh nghiệp công nghệ giải quyết điểm nghẽn sản xuất.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/khao-sat-nhu-cau"
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 backdrop-blur-sm shadow-sm"
              >
                <ClipboardCheck className="w-4 h-4 text-teal-300" />
                Phiếu Khảo Sát DNNVV
              </Link>
              <button
                onClick={handleOpenQuickDemand}
                className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-emerald-950/20"
              >
                <PlusCircle className="w-4 h-4" />
                Đăng Nhanh Bài Toán
              </button>
            </div>
          </div>

          {/* Cột phải: 3 Khối Quick Metrics Động có chuẩn hóa 5 UX States qua <Async> */}
          <div className="shrink-0">
            <Async
              state={statsState}
              loadingSkeleton={
                <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/20 text-center animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="px-2">
                      <div className="h-7 w-16 bg-white/20 rounded mx-auto mb-1" />
                      <div className="h-3 w-20 bg-white/20 rounded mx-auto" />
                    </div>
                  ))}
                </div>
              }
              errorContent={
                <div className="bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/20 text-center text-white">
                  <p className="text-xs text-rose-200">Không thể tải số liệu thống kê.</p>
                  <button
                    type="button"
                    onClick={() => setStatsVersion((v) => v + 1)}
                    className="mt-1 text-xs font-bold underline hover:text-white cursor-pointer"
                  >
                    Tải lại số liệu
                  </button>
                </div>
              }
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 text-center shadow-lg">
                <div className="px-1 sm:px-2">
                  <div className="text-xl sm:text-2xl font-black text-amber-300">
                    {statsData?.totalDemands !== undefined
                      ? statsData.totalDemands.toLocaleString("vi-VN")
                      : (publicDemands.length > 0 ? publicDemands.length.toLocaleString("vi-VN") : "0")}
                  </div>
                  <div className="text-caption text-white/85 font-bold uppercase mt-1 tracking-wider">
                    Bài Toán Đang Tìm
                  </div>
                </div>
                <div className="border-x border-white/20 px-2 sm:px-3">
                  <div className="text-xl sm:text-2xl font-black text-emerald-300">
                    {(() => {
                      const val = statsData?.totalEstimatedValueMillionVnd;
                      if (!val || val === 0) return "0 VNĐ";
                      if (val >= 1000) {
                        return `${(val / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} Tỷ`;
                      }
                      return `${val.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} Triệu`;
                    })()}
                  </div>
                  <div className="text-caption text-white/85 font-bold uppercase mt-1 tracking-wider">
                    Tổng Ngân Sách Mua
                  </div>
                </div>
                <div className="px-1 sm:px-2">
                  <div className="text-xl sm:text-2xl font-black text-teal-300">
                    {statsData?.totalSuccessfulConnections !== undefined
                      ? statsData.totalSuccessfulConnections.toLocaleString("vi-VN")
                      : "0"}
                  </div>
                  <div className="text-caption text-white/85 font-bold uppercase mt-1 tracking-wider">
                    Kết Nối Sàn & MOU
                  </div>
                </div>
              </div>
            </Async>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTERS BAR (ĐẦY ĐỦ 10 LĨNH VỰC TT17 & KHOẢNG NGÂN SÁCH) */}
      <div className="bg-white dark:bg-slate-900 border-b border-border-default dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          <div className="flex-1 flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm tên bài toán, công đoạn, giải pháp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-control focus:ring-2 focus:ring-brand-500 outline-none transition font-medium text-slate-900 dark:text-white"
              />
            </div>

            {/* Combobox 10 Lĩnh vực TT17 Đầy Đủ */}
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="form-control text-xs sm:text-sm font-semibold h-10 w-auto max-w-[170px] xl:max-w-[190px] shrink-0"
            >
              <option value="">Tất cả Lĩnh vực</option>
              {sectors.map((sec) => (
                <option key={sec.code} value={sec.code}>
                  {sec.name}
                </option>
              ))}
            </select>

            {/* Khoảng Ngân Sách Đầu Tư */}
            <select
              value={filterBudget}
              onChange={(e) => setFilterBudget(e.target.value)}
              className="form-control text-xs sm:text-sm font-semibold h-10 w-auto max-w-[140px] xl:max-w-[160px] shrink-0"
            >
              <option value="">Tất cả Ngân Sách</option>
              <option value="LT_500M">Dưới 500 triệu</option>
              <option value="500M_1B">500 triệu – 1 tỷ</option>
              <option value="1B_3B">1 – 3 tỷ</option>
              <option value="GT_3B">Trên 3 tỷ</option>
            </select>

            {/* TNI Level Filter */}
            <select
              value={filterTni}
              onChange={(e) => setFilterTni(e.target.value)}
              className="form-control text-xs sm:text-sm font-semibold h-10 w-auto max-w-[150px] xl:max-w-[175px] shrink-0"
            >
              <option value="">Tất cả Mức TNI</option>
              <option value="VERY_HIGH">TNI Rất Cao (≥ 80)</option>
              <option value="HIGH">TNI Cao (65 - 79)</option>
              <option value="MEDIUM">TNI Trung Bình (50 - 64)</option>
            </select>

            {/* Bộ lọc Bài toán Đã lưu */}
            <button
              type="button"
              onClick={() => {
                if (!authClient.getUser()) {
                  setShowAuthModal(true);
                  toast.info(
                    "Quý đơn vị vui lòng đăng nhập để lọc danh sách bài toán đã lưu theo dõi.",
                    "Yêu Cầu Xác Thực"
                  );
                  return;
                }
                setFilterBookmarkedOnly((prev) => !prev);
              }}
              className={`h-10 px-3 text-xs font-bold rounded-control flex items-center gap-1.5 transition border shrink-0 whitespace-nowrap ${
                filterBookmarkedOnly
                  ? "bg-amber-500 border-amber-600 text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400"
              }`}
              title="Lọc các bài toán đã lưu theo dõi"
            >
              <Bookmark className={`w-3.5 h-3.5 ${filterBookmarkedOnly ? "fill-white" : "text-amber-500"}`} />
              <span>Đã lưu</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  filterBookmarkedOnly
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                }`}
              >
                {bookmarkedCount}
              </span>
            </button>

            {(searchQuery || filterSector || filterBudget || filterTni || filterBookmarkedOnly) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterSector("");
                  setFilterBudget("");
                  setFilterTni("");
                  setFilterBookmarkedOnly(false);
                }}
                className="h-10 px-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-control transition shrink-0 whitespace-nowrap"
                title="Xóa bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa lọc
              </button>
            )}
          </div>

          <div className="text-xs text-text-secondary dark:text-slate-400 shrink-0 whitespace-nowrap self-center">
            Hiển thị <strong className="text-text-primary dark:text-white font-bold">{filteredDemands.length}</strong> bài toán đang tìm cung
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER WITH 5 UX STATES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <Async
          state={asyncState}
          onRetry={loadDemands}
          errorMessage={errorMessage}
          loadingSkeleton={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
                  </div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                  <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          }
          emptyContent={
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm my-8">
              <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 rounded-2xl flex items-center justify-center mx-auto">
                <FileQuestion className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-text-primary dark:text-white">
                Không tìm thấy bài toán nhu cầu phù hợp
              </h3>
              <p className="text-xs text-text-secondary dark:text-slate-400">
                Chưa có bài toán nào khớp với bộ lọc lĩnh vực hoặc từ khóa hiện tại. Quý đơn vị có thể xóa bộ lọc hoặc đăng ký bài toán mới.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setFilterSector("");
                    setFilterTni("");
                    setFilterBudget("");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Xóa bộ lọc
                </button>
                <button
                  onClick={handleOpenQuickDemand}
                  className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Đăng bài toán mới
                </button>
              </div>
            </div>
          }
        >
          {/* SUCCESS LISTING GRID & PAGINATION (PHÂN TRANG 9 BÀI TOÁN/TRANG) */}
          <div className="space-y-6">
            {/* Header thông tin số lượng kết quả & trang */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Danh Sách Bài Toán Nhu Cầu
                </span>
                <span className="bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-cyan-300 font-bold px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                  {filteredDemands.length} bài toán
                </span>
                {totalPages > 1 && (
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    (Trang {currentPage} / {totalPages})
                  </span>
                )}
              </div>
            </div>

            {/* Grid bài toán nhu cầu */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDemands.map((item) => {
                const tniMeta = getTniClassification(item.tniScore || 70);
                const sectorName = getSectorName(item.sectorCode);
                const sectorShortName = getSectorShortName(item.sectorCode);
                const isBookmarked = !!bookmarkedIds[item.id];

                return (
                  <article
                    key={item.id}
                    className="group surface-card rounded-2xl overflow-hidden flex flex-col hover:border-brand-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    {/* Media Banner: Khung thu hẹp gọn gàng, có logo chìm theo ngành phù hợp */}
                    <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-brand-700 text-white border-b border-brand-500/40 p-3 sm:p-3.5 flex flex-col justify-between">
                      <SectorBannerBackground
                        sectorCode={item.sectorCode}
                        sectorName={sectorName}
                        opacity={0.5}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-transparent pointer-events-none" />
                      {/* Floating Badges Header: Tên Lĩnh Vực & TNI Score */}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center text-xs font-bold text-brand-900 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-sm">
                          {sectorName}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border backdrop-blur-md shadow-sm ${tniMeta.badgeClass}`}
                          title={tniMeta.label}
                        >
                          <Flame className="w-3 h-3" /> TNI: {item.tniScore || 75}
                        </span>
                      </div>

                      {/* Tiêu đề chữ lớn trên banner như mẫu tham khảo */}
                      <div className="relative z-10 pr-2">
                        <h4 className="text-xs sm:text-sm font-black tracking-wide text-white leading-snug line-clamp-2 drop-shadow-md uppercase">
                          {item.technicalProblem}
                        </h4>
                      </div>
                    </div>

                    {/* Card Content Body: Căn từ trên xuống, Ngân sách và Footer căn xuống đáy */}
                    <div className="p-6 flex flex-col justify-between flex-1">
                      {/* Top Section: Doanh nghiệp, Công đoạn & Giải pháp mong muốn */}
                      <div className="space-y-4">
                        {/* Doanh nghiệp ẩn danh theo PDPD Masking & Công đoạn kỹ thuật */}
                        <div>
                          <p className="text-xs text-text-secondary dark:text-slate-400 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              Doanh nghiệp:{" "}
                              <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                                [DN {sectorShortName} - {item.province || "Hà Nội"}]
                              </strong>{" "}
                              <span className="text-slate-400 text-xs font-medium">(PDPD Masked)</span>
                            </span>
                          </p>

                          <p className="mt-1 text-xs text-text-secondary dark:text-slate-400 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              Công đoạn: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{item.stageName}</strong>
                            </span>
                          </p>
                        </div>

                        {/* Desired Solution Preview */}
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-text-secondary dark:text-slate-300 space-y-1">
                          <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                            Giải pháp mong muốn:
                          </span>
                          <p className="line-clamp-2 font-medium text-slate-700 dark:text-slate-200">
                            {item.desiredSolution || "Cần tư vấn chuyên gia và chuyển giao công nghệ phù hợp."}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Section: Ngân sách & Footer căn xuống dưới */}
                      <div className="mt-5 pt-2 space-y-3">
                        {/* Budget & Target */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            Ngân sách: {item.budgetRange || "Thỏa thuận"}
                          </span>
                          <span className="text-slate-400 text-xs font-mono">
                            Mã: #{item.itemCode ? item.itemCode.slice(-6) : item.id.slice(0, 6)}
                          </span>
                        </div>

                        {/* Action Link Footer - Thu hẹp lại thành 1 dòng gọn gàng, bỏ chữ Bảo vệ danh tính(PDPD) */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center text-emerald-600 dark:text-emerald-400" title="Bảo vệ danh tính (PDPD)">
                            <ShieldCheck className="w-4 h-4" />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleBookmark(item.id, item.technicalProblem)}
                              className={`p-1.5 rounded-lg border transition ${
                                isBookmarked
                                  ? "bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/50 dark:border-amber-700"
                                  : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              }`}
                              title={isBookmarked ? "Bỏ lưu theo dõi" : "Lưu theo dõi bài toán"}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              href={`/nhu-cau-cong-nghe/${item.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#2D9A85] hover:bg-[#247B6A] transition px-3 py-1.5 rounded-xl shadow-sm active:scale-95"
                            >
                              <span>Đề Xuất Giải Pháp</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mt-8 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trang Trước
                </button>

                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-xl transition flex items-center justify-center ${
                        currentPage === p
                          ? "bg-brand-700 text-white shadow-md font-black"
                          : "border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition shadow-sm"
                >
                  Trang Tiếp
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Async>
      </div>

      {/* QUICK DEMAND MODAL */}
      <QuickDemandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newItem) => {
          setPublicDemands((prev) => [newItem, ...prev]);
          setAsyncState("success");
        }}
      />

      {/* AUTH REQUIRED MODAL CHO BOOKMARK */}
      <ConfirmModal
        isOpen={showAuthModal}
        title="Yêu Cầu Xác Thực Tài Khoản"
        message="Quý đơn vị vui lòng đăng nhập tài khoản Doanh nghiệp hoặc Chuyên gia để lưu bài toán vào danh sách theo dõi."
        confirmText="Đăng Nhập Ngay"
        cancelText="Để Sau"
        variant="info"
        onConfirm={() => {
          setShowAuthModal(false);
          window.location.href = "/login";
        }}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
