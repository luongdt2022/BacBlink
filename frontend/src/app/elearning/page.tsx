"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Search,
  BookOpen,
  Clock,
  Users,
  Star,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  X,
  PlayCircle,
  FileText,
  HelpCircle,
  Compass,
  Briefcase,
  Cpu,
  TrendingUp,
  Award,
  Video,
  FileCode,
  CheckSquare
} from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import {
  fetchLmsCatalog,
  type LmsCatalogResponse,
  type LmsMaterialCardDto,
} from "@/lib/api/lms";
import { authClient, ROLES } from "@/lib/auth-client";

// Danh mục 6 Cụm chuyên đề đào tạo kỹ thuật công nghiệp BACLINK
const CLUSTERS = [
  { code: "A", name: "Cụm A: Nhận diện nhu cầu & Bài toán", total: 10, range: "Bài 1–10", step: 1, color: "blue" },
  { code: "B", name: "Cụm B: Tìm kiếm nguồn cung & TRL", total: 10, range: "Bài 11–20", step: 3, color: "emerald" },
  { code: "C", name: "Cụm C: Đánh giá, kết nối & Thí điểm", total: 10, range: "Bài 21–30", step: 4, color: "purple" },
  { code: "D", name: "Cụm D: Xu hướng & Lộ trình đổi mới", total: 6, range: "Bài 31–36", step: 7, color: "amber" },
  { code: "E", name: "Cụm E: Technology Spotlight", total: 10, range: "Bài 37–46", step: 7, color: "cyan" },
  { code: "F", name: "Cụm F: Giao dịch & Bên cung công nghệ", total: 4, range: "Bài 47–50", step: 7, color: "rose" },
];

// Danh mục 5 Lộ trình học tập
const PATHWAYS = [
  { code: "LT1", name: "LT1: Nền tảng nhận thức", desc: "Mọi đối tượng quan tâm sản xuất công nghiệp & tiếp cận công nghệ" },
  { code: "LT2", name: "LT2: Doanh nghiệp bên cầu", desc: "DN chẩn đoán nhu cầu, tìm kiếm & tiếp nhận công nghệ" },
  { code: "LT3", name: "LT3: Kỹ thuật & Quản lý Nhà máy", desc: "Tối ưu hóa dây chuyền, kiểm soát chất lượng và an toàn công nghiệp" },
  { code: "LT4", name: "LT4: Đơn vị cung ứng giải pháp", desc: "Nhà máy, chuyên gia kỹ thuật chào bán & thương mại hóa công nghệ" },
  { code: "LT5", name: "LT5: Chuyên đề chuyên sâu", desc: "Cập nhật công nghệ tiêu biểu (AI, IoT, Tự động hóa, Bán dẫn, ESG)" },
];

// Danh mục 8 Mô-đun năng lực công nghiệp
const MODULES = [
  { code: "M1", name: "M1: Nền tảng công nghệ & Sản xuất công nghiệp" },
  { code: "M2", name: "M2: Chẩn đoán nhu cầu & Năng lực hấp thụ" },
  { code: "M3", name: "M3: Tìm kiếm & Khai thác dữ liệu nguồn cung" },
  { code: "M4", name: "M4: TRL & Đánh giá mức độ sẵn sàng" },
  { code: "M5", name: "M5: Đánh giá, so sánh & Lựa chọn công nghệ" },
  { code: "M6", name: "M6: Kết nối chuyên gia & Nhà cung cấp" },
  { code: "M7", name: "M7: PoC, pilot, tiếp nhận & Quản trị rủi ro" },
  { code: "M8", name: "M8: Lộ trình nâng cấp nhà máy & Dự án cuối khóa" },
];

export default function ElearningCatalogPage() {
  const [data, setData] = useState<LmsCatalogResponse | null>(null);
  const [asyncState, setAsyncState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Filters
  const [keyword, setKeyword] = useState<string>("");
  const [selectedCluster, setSelectedCluster] = useState<string>("");
  const [selectedPathway, setSelectedPathway] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>(""); // CG / ĐH
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Auth User check
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const user = authClient.getUser();
    if (user?.role) {
      setUserRole(user.role.toUpperCase());
    }
  }, []);

  const loadData = useCallback(async () => {
    setAsyncState("loading");
    setErrorMessage("");
    try {
      // Tải đủ danh mục 50+ bài học một lần để lọc đa chiều tức thời (Zero-Flicker)
      const res = await fetchLmsCatalog({
        page: 1,
        pageSize: 100,
      });
      setData(res);
      if (res.materials.items.length === 0) {
        setAsyncState("empty");
      } else {
        setAsyncState("success");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Không thể tải danh mục học liệu số.");
      setAsyncState("error");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const clearAllFilters = () => {
    setKeyword("");
    setSelectedCluster("");
    setSelectedPathway("");
    setSelectedModule("");
    setSelectedFormat("");
  };

  // Client-side filtering cho các tiêu chí metadata mở rộng
  const filteredItems = useMemo(() => {
    if (!data?.materials?.items) return [];
    return data.materials.items.filter((item) => {
      let roadmapMeta: {
        moduleCode?: string;
        pathways?: string[];
        videoFormat?: string;
        templateCodes?: string[];
      } = {};
      if (item.learningRoadmapJson) {
        try {
          roadmapMeta = typeof item.learningRoadmapJson === "string"
            ? JSON.parse(item.learningRoadmapJson)
            : item.learningRoadmapJson;
        } catch {
          roadmapMeta = {};
        }
      }

      // 1. Cluster filter (A..F)
      if (selectedCluster && item.clusterCode !== selectedCluster) {
        return false;
      }
      // 2. Pathway filter (LT1..LT5)
      if (selectedPathway) {
        const pathways = Array.isArray(roadmapMeta.pathways) ? roadmapMeta.pathways : [];
        if (!pathways.includes(selectedPathway)) return false;
      }
      // 3. Module filter (M1..M8)
      if (selectedModule) {
        if (roadmapMeta.moduleCode !== selectedModule) return false;
      }
      // 4. Format filter (CG vs ĐH)
      if (selectedFormat) {
        const isCG = roadmapMeta.videoFormat
          ? roadmapMeta.videoFormat === "CG"
          : (item.durationMinutes || 0) >= 10;
        if (selectedFormat === "CG" && !isCG) return false;
        if (selectedFormat === "ĐH" && isCG) return false;
      }
      // 5. Keyword filter
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        const inCode = item.materialCode.toLowerCase().includes(kw);
        const inTitle = item.title.toLowerCase().includes(kw);
        const inCluster = (item.clusterName || "").toLowerCase().includes(kw);
        const inTemplates = Array.isArray(roadmapMeta.templateCodes)
          ? roadmapMeta.templateCodes.some((t) => t.toLowerCase().includes(kw))
          : false;
        if (!inCode && !inTitle && !inCluster && !inTemplates) return false;
      }
      return true;
    });
  }, [data, selectedCluster, selectedPathway, selectedModule, selectedFormat, keyword]);

  const isManagementAllowed =
    userRole === ROLES.SUPER_ADMIN ||
    userRole === ROLES.ADMIN ||
    userRole === ROLES.OPERATOR_ADMIN ||
    userRole === ROLES.ENTERPRISE ||
    userRole === ROLES.VERIFIED_EXPERT ||
    userRole === ROLES.EXPERT;

  const managementHref =
    userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN || userRole === ROLES.OPERATOR_ADMIN
      ? "/admin/elearning"
      : "/portal/expert/elearning";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* 1. HERO BANNER HỌC VIỆN ĐÀO TẠO KỸ THUẬT BACLINK */}
      <section className="relative overflow-hidden workspace-banner text-white py-10 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 border-b border-brand-600/40">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-brand-100 text-xs font-semibold tracking-wide backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-200" />
                Học Viện Đào Tạo Kỹ Thuật Công Nghiệp & Quản Trị Nhà Máy BACLINK
              </div>
              <h1 className="type-page-title text-white">
                Cổng Học Liệu Số & Không Gian Đào Tạo Nguồn Cung Công Nghệ
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                Trang bị kiến thức quản trị sản xuất tinh gọn Lean/5S, tiêu chuẩn IATF 16949/ISO 9001, tự động hóa SMT/ESD, chuyển đổi số nhà máy và lộ trình ESG cho kỹ sư, quản đốc và cán bộ doanh nghiệp hội viên BACLINK.
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap gap-3">
              {isManagementAllowed && (
                <Link
                  href={managementHref}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#042142] font-bold text-xs shadow-md transition"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-900" />
                  <span>Quản Trị Học Liệu</span>
                </Link>
              )}
            </div>
          </div>

          {/* 4 THẺ KPI STRIP ĐỘNG */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-300 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">50</div>
                <div className="text-xs text-slate-300 font-medium">Video bài giảng (30 CG + 20 ĐH)</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">31h</div>
                <div className="text-xs text-slate-300 font-medium">8 Mô-đun năng lực (M1–M8)</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-300 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">5</div>
                <div className="text-xs text-slate-300 font-medium">Lộ trình học tập (LT1–LT5)</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-300 shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">18</div>
                <div className="text-xs text-slate-300 font-medium">BM01–BM13 & TĐG01–TĐG05</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THANH LỌC 6 CỤM NĂNG LỰC SẢN XUẤT CÔNG NGHIỆP (TAB BAR) */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCluster("")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCluster === ""
                  ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300"
              }`}
            >
              Tất cả 6 Cụm (50 bài)
            </button>
            {CLUSTERS.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setSelectedCluster(selectedCluster === c.code ? "" : c.code)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  selectedCluster === c.code
                    ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300"
                }`}
              >
                <span>{c.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-xs ${selectedCluster === c.code ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
                  {c.total}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2B. KHỐI 5 LỘ TRÌNH HỌC TẬP (LT1–LT5) & 8 MÔ-ĐUN NĂNG LỰC (M1–M8) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        {/* 5 Lộ trình học tập (LT1..LT5) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>5 Lộ Trình Học Tập Chuyên Biệt (LT1–LT5) & Sơ Đồ 3 Bước (Loại A → Loại B → Loại B+)</span>
            </h2>
            <button
              type="button"
              onClick={() => setSelectedPathway("")}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                selectedPathway === ""
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Tất cả lộ trình
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {PATHWAYS.map((p) => {
              const active = selectedPathway === p.code;
              return (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => setSelectedPathway(active ? "" : p.code)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    active
                      ? "border-brand-600 bg-brand-50/70 dark:bg-brand-950/60 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-brand-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-brand-600 text-white">
                      {p.code}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {p.code === "LT1" ? "Loại A" : p.code === "LT5" ? "Loại B+" : "Loại B"}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {p.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 8 Mô-đun năng lực (M1..M8) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              8 Mô-đun năng lực (M1–M8):
            </span>
            <span className="text-brand-600 dark:text-brand-400 font-semibold">
              Tổng 31 giờ học chuyên đề công nghiệp BACLINK
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedModule("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                selectedModule === ""
                  ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              Tất cả 8 Mô-đun
            </button>
            {MODULES.map((m) => {
              const active = selectedModule === m.code;
              return (
                <button
                  key={m.code}
                  type="button"
                  onClick={() => setSelectedModule(active ? "" : m.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    active
                      ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. BỘ LỌC ĐA CHIỀU (SEARCH + FORMAT + RESET) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo mã bài (EL-001..EL-050), tên chuyên đề, từ khóa công nghệ..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </form>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedFormat("")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${selectedFormat === "" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
                >
                  Tất cả hình thức
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("CG")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${selectedFormat === "CG" ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
                >
                  Chuyên gia (CG - 30 bài)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat("ĐH")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${selectedFormat === "ĐH" ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
                >
                  Đồ họa (ĐH - 20 bài)
                </button>
              </div>

              {(selectedCluster || selectedPathway || selectedModule || selectedFormat || keyword) && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Xóa bộ lọc
                </button>
              )}

              <div className="hidden sm:flex items-center border-l border-slate-200 dark:border-slate-800 pl-2 gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg ${viewMode === "grid" ? "bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400" : "text-slate-400"}`}
                  title="Dạng lưới"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg ${viewMode === "table" ? "bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400" : "text-slate-400"}`}
                  title="Dạng bảng"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DANH SÁCH KHÓA HỌC E-LEARNING (5 UX STATES QUA <ASYNC>) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span>Hiển thị {filteredItems.length} khóa học</span>
            {selectedCluster && (
              <span className="text-brand-600 dark:text-brand-400 font-bold">
                (Đang lọc Cụm {selectedCluster})
              </span>
            )}
          </div>
        </div>

        <Async
          state={asyncState}
          errorMessage={errorMessage}
          onRetry={loadData}
          emptyMessage="Không tìm thấy bài học nào phù hợp với bộ lọc hiện tại."
        >
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const isCG = (item.durationMinutes || 0) >= 10;
                return (
                  <div
                    key={item.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition flex flex-col"
                  >
                    {/* Top card header */}
                    <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-black bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {item.materialCode}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            isCG
                              ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                              : "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                          }`}>
                            {isCG ? "Chuyên gia (CG)" : "Đồ họa (ĐH)"}
                          </span>
                          {item.clusterCode && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                              Cụm {item.clusterCode}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition line-clamp-2 min-h-[2.5rem]">
                        <Link href={`/elearning/${item.id}`}>{item.title}</Link>
                      </h3>
                    </div>

                    {/* Middle features */}
                    <div className="p-5 pt-3 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                        {item.clusterName && (
                          <div className="flex items-start gap-1.5 line-clamp-1">
                            <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="truncate">{item.clusterName}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{item.microVideosCount || 3} Micro-videos</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span>{item.inVideoQuizzesCount || 6} Quiz tương tác</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{item.practiceRubricsCount || 7} Tiêu chí rubric</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{item.faqsCount || 8} Câu hỏi FAQs</span>
                          </div>
                        </div>
                      </div>

                      {/* Instructor & CTA */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                            {(item.leadInstructorName || "BL").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                            {item.leadInstructorName || "Ban Cố vấn Kỹ thuật BACLINK"}
                          </span>
                        </div>

                        <Link
                          href={`/elearning/${item.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 group-hover:translate-x-0.5 transition"
                        >
                          <span>Vào học</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Mã bài</th>
                      <th className="px-4 py-3">Tên chuyên đề</th>
                      <th className="px-4 py-3">Cụm năng lực</th>
                      <th className="px-4 py-3">Hình thức</th>
                      <th className="px-4 py-3">Cấu phần</th>
                      <th className="px-4 py-3">Giảng viên</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                          {item.materialCode}
                        </td>
                        <td className="px-4 py-3 max-w-sm">
                          <Link href={`/elearning/${item.id}`} className="font-bold text-slate-900 dark:text-white hover:text-brand-600 line-clamp-1">
                            {item.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Cụm {item.clusterCode || "A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {(item.durationMinutes || 0) >= 10 ? "Chuyên gia (CG)" : "Đồ họa (ĐH)"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          3 Videos · {item.inVideoQuizzesCount || 6} Quiz · {item.practiceRubricsCount || 7} Rubrics
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {item.leadInstructorName || "Ban Cố vấn Kỹ thuật BACLINK"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/elearning/${item.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition"
                          >
                            <span>Vào học</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Async>
      </section>
    </div>
  );
}
