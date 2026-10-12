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
} from "lucide-react";
import { Async, AsyncState } from "@/components/ui/async";
import QuickDemandModal from "@/components/demand/QuickDemandModal";
import { getTniClassification } from "@/components/demand/TniRealtimeCalculator";
import { useToast } from "@/components/common/toast";
import { authClient, ROLES } from "@/lib/auth-client";
import { getActiveSectors, SectorOption } from "@/lib/master-data-client";
import { SECTORS_18_CATALOG } from "@/services/api/technology-offer";

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
  const [publicDemands, setPublicDemands] = useState<PublicDemandItem[]>([]);
  const [sectors, setSectors] = useState<SectorOption[]>(
    SECTORS_18_CATALOG.filter((s) => s.code !== "ALL")
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [asyncState, setAsyncState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load 10 Lĩnh vực TT17 từ API Master Data
  useEffect(() => {
    getActiveSectors()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSectors(data);
        }
      })
      .catch(() => {
        // Fallback an toàn với SECTORS_18_CATALOG
        setSectors(SECTORS_18_CATALOG.filter((s) => s.code !== "ALL"));
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
    const fullName = getSectorName(code);
    return fullName.split("–")[0].split("-")[0].trim();
  };

  // Lọc tìm kiếm và ngân sách phía Client
  const filteredDemands = publicDemands.filter((item) => {
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

  // Xử lý bảo vệ phân quyền khi bấm "Đăng Nhanh Bài Toán"
  const handleOpenQuickDemand = () => {
    const user = authClient.getUser();
    if (!user) {
      toast.info(
        "Quý đơn vị vui lòng đăng nhập tài khoản Doanh nghiệp (Buyer) để đăng bài toán, hoặc điền Phiếu Khảo Sát DNNVV mở.",
        "Yêu Cầu Xác Thực"
      );
      return;
    }

    const role = (user.role || "").toUpperCase();
    if (
      role === ROLES.BUYER ||
      role === ROLES.INNOVATION_ENTITY ||
      role === ROLES.ADMIN ||
      role === ROLES.SUPER_ADMIN
    ) {
      setIsModalOpen(true);
    } else {
      toast.warning(
        `Tài khoản của bạn đang có vai trò [${user.role}]. Chỉ Bên Mua (Buyer) hoặc Doanh nghiệp ĐMST mới có quyền đăng bài toán kỹ thuật.`,
        "Chưa Đủ Thẩm Quyền"
      );
    }
  };

  const toggleBookmark = (id: string, title: string) => {
    setBookmarkedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        toast.success(`Đã lưu bài toán "${title.slice(0, 40)}..." vào danh sách theo dõi.`, "Đã Lưu Bài Toán");
      } else {
        toast.info("Đã bỏ lưu bài toán khỏi danh sách theo dõi.", "Bỏ Theo Dõi");
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20">
      {/* HERO BANNER SECTION (ĐẠT CHUẨN ĐỘ TƯƠNG PHẢN WCAG AA & WIREFRAME BASIC DESIGN) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 text-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-brand-900/80 shadow-md">
        {/* Lớp nghệ thuật vi mạch vi tính nền mờ nhẹ */}
        <div
          aria-hidden="true"
          className="innovation-hero-art pointer-events-none absolute inset-0 opacity-20"
        />
        {/* Dark overlay đảm bảo 100% tương phản cho text */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/80 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Cột trái: Tiêu đề & Giới thiệu sắc nét */}
          <div className="space-y-3.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold backdrop-blur-md border border-cyan-400/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              Sàn Giao Dịch Bài Toán & Nhu Cầu Đổi Mới Công Nghệ (NacenTwin)
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              Nhu Cầu Đổi Mới Công Nghệ Từ Doanh Nghiệp
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
              Các bài toán kỹ thuật thực tế từ các DNNVV đã được chuẩn hóa chỉ số cấp thiết TNI (Technology Need Index).
              Hỗ trợ kết nối nhà khoa học, viện trường và doanh nghiệp công nghệ giải quyết điểm nghẽn sản xuất.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/khao-sat-nhu-cau"
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 backdrop-blur-sm shadow-sm"
              >
                <ClipboardCheck className="w-4 h-4 text-cyan-300" />
                Phiếu Khảo Sát DNNVV
              </Link>
              <button
                onClick={handleOpenQuickDemand}
                className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-950/30 border border-emerald-400/30"
              >
                <PlusCircle className="w-4 h-4" />
                Đăng Nhanh Bài Toán
              </button>
            </div>
          </div>

          {/* Cột phải: 3 Khối Quick Metrics từ Basic Design Wireframe */}
          <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 shrink-0 text-center shadow-xl">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">142</div>
              <div className="text-[10px] sm:text-xs text-slate-200 font-semibold uppercase mt-0.5">
                Bài Toán Đang Tìm
              </div>
            </div>
            <div className="border-x border-white/20 px-3 sm:px-4">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">68.5 tỷ</div>
              <div className="text-[10px] sm:text-xs text-slate-200 font-semibold uppercase mt-0.5">
                Tổng Ngân Sách Mua
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300">24 Giờ</div>
              <div className="text-[10px] sm:text-xs text-slate-200 font-semibold uppercase mt-0.5">
                Sở KH&CN Kết Nối
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTERS BAR (ĐẦY ĐỦ 10 LĨNH VỰC TT17 & KHOẢNG NGÂN SÁCH) */}
      <div className="bg-white dark:bg-slate-900 border-b border-border-default dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên bài toán, công đoạn, giải pháp mong muốn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-control focus:ring-2 focus:ring-brand-500 outline-none transition font-medium text-slate-900 dark:text-white"
              />
            </div>

            {/* Combobox 10 Lĩnh vực TT17 Đầy Đủ */}
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="form-control text-sm font-semibold max-w-[260px]"
            >
              <option value="">Tất cả Lĩnh vực TT17</option>
              {sectors.map((sec) => (
                <option key={sec.code} value={sec.code}>
                  {sec.code} — {sec.name}
                </option>
              ))}
            </select>

            {/* Khoảng Ngân Sách Đầu Tư */}
            <select
              value={filterBudget}
              onChange={(e) => setFilterBudget(e.target.value)}
              className="form-control text-sm font-semibold max-w-[200px]"
            >
              <option value="">Tất cả Ngân Sách</option>
              <option value="LT_500M">Dưới 500 triệu VNĐ</option>
              <option value="500M_1B">500 triệu – 1 tỷ VNĐ</option>
              <option value="1B_3B">1 – 3 tỷ VNĐ</option>
              <option value="GT_3B">Trên 3 tỷ VNĐ</option>
            </select>

            {/* TNI Level Filter */}
            <select
              value={filterTni}
              onChange={(e) => setFilterTni(e.target.value)}
              className="form-control text-sm font-semibold max-w-[220px]"
            >
              <option value="">Tất cả Mức Ưu Tiên TNI</option>
              <option value="VERY_HIGH">TNI Rất Cao (≥ 80) — Ưu tiên P0</option>
              <option value="HIGH">TNI Cao (65 - 79) — Ưu tiên P1</option>
              <option value="MEDIUM">TNI Trung Bình (50 - 64)</option>
            </select>

            {(searchQuery || filterSector || filterBudget || filterTni) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterSector("");
                  setFilterBudget("");
                  setFilterTni("");
                }}
                className="h-11 px-3 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-control transition"
                title="Xóa bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa lọc
              </button>
            )}
          </div>

          <div className="text-xs text-text-secondary dark:text-slate-400 shrink-0">
            Hiển thị <strong className="text-text-primary dark:text-white font-bold">{filteredDemands.length}</strong> bài toán đang tìm cung
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER WITH 5 UX STATES */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
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
          {/* SUCCESS LISTING GRID (HUMANIZED CARDS - KHÔNG HIỂN THỊ MÃ ID THÔ) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDemands.map((item) => {
              const tniMeta = getTniClassification(item.tniScore || 70);
              const sectorName = getSectorName(item.sectorCode);
              const sectorShortName = getSectorShortName(item.sectorCode);
              const isBookmarked = !!bookmarkedIds[item.id];

              return (
                <article
                  key={item.id}
                  className="group surface-card p-6 flex flex-col justify-between hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <div className="space-y-4">
                    {/* Header: Hiển thị TÊN LĨNH VỰC TIẾNG VIỆT thay vì mã thô */}
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-brand-700 dark:text-cyan-300 bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 px-3 py-1 rounded-lg">
                        {sectorName}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${tniMeta.badgeClass}`}
                        title={tniMeta.label}
                      >
                        <Flame className="w-3 h-3" /> TNI: {item.tniScore || 75}
                      </span>
                    </div>

                    {/* Problem Title */}
                    <div>
                      <h3 className="text-base font-bold text-text-primary dark:text-white group-hover:text-brand-700 dark:group-hover:text-cyan-300 transition line-clamp-2">
                        {item.technicalProblem}
                      </h3>

                      {/* Doanh nghiệp ẩn danh theo PDPD Masking */}
                      <p className="mt-2 text-xs text-text-secondary dark:text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Doanh nghiệp:{" "}
                          <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                            [DN {sectorShortName} - {item.province || "Hà Nội"}]
                          </strong>{" "}
                          <span className="text-slate-400 text-[10px] font-medium">(PDPD Masked)</span>
                        </span>
                      </p>

                      {/* Công đoạn kỹ thuật */}
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

                    {/* Budget & Target */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        Ngân sách: {item.budgetRange || "Thỏa thuận"}
                      </span>
                      <span className="text-slate-400 text-xs font-mono">
                        Mã: #{item.itemCode ? item.itemCode.slice(-6) : item.id.slice(0, 6)}
                      </span>
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Bảo vệ danh tính (PDPD)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBookmark(item.id, item.technicalProblem)}
                        className={`p-2 rounded-lg border transition ${
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-cyan-400 hover:text-brand-800 group-hover:translate-x-0.5 transition px-2.5 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-800"
                      >
                        Chi tiết & Chào giải pháp <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Async>
      </main>

      {/* QUICK DEMAND MODAL */}
      <QuickDemandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newItem) => {
          setPublicDemands((prev) => [newItem, ...prev]);
          setAsyncState("success");
        }}
      />
    </div>
  );
}
