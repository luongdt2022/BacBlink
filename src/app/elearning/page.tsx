"use client";

import React, { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import { Async, type AsyncState } from "@/components/ui/async";
import {
  fetchLmsCatalog,
  type LmsCatalogResponse,
  type LmsMaterialCardDto,
  type LmsLessonType,
} from "@/lib/api/lms";
import { authClient, ROLES } from "@/lib/auth-client";

const LESSON_TYPE_LABELS: Record<LmsLessonType, { label: string; badgeClass: string }> = {
  TYPE_A: {
    label: "Loại A - Cơ sở",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900",
  },
  TYPE_B: {
    label: "Loại B - Chuyên sâu",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900",
  },
  TYPE_B_PLUS: {
    label: "Loại B+ - Nâng cao",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900",
  },
};

export default function ElearningCatalogPage() {
  const [data, setData] = useState<LmsCatalogResponse | null>(null);
  const [asyncState, setAsyncState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Filters
  const [keyword, setKeyword] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [page, setPage] = useState<number>(1);
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
      const res = await fetchLmsCatalog({
        keyword: keyword.trim() || undefined,
        lessonType: selectedType || undefined,
        page,
        pageSize: 10,
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
  }, [keyword, selectedType, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type === selectedType ? "" : type);
    setPage(1);
  };

  const clearFilters = () => {
    setKeyword("");
    setSelectedType("");
    setPage(1);
  };

  const isManagementAllowed =
    userRole === ROLES.SUPER_ADMIN ||
    userRole === ROLES.ADMIN ||
    userRole === ROLES.OPERATOR_ADMIN ||
    userRole === ROLES.VERIFIED_EXPERT ||
    userRole === ROLES.EXPERT;

  const managementHref =
    userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN || userRole === ROLES.OPERATOR_ADMIN
      ? "/admin/elearning"
      : "/portal/expert/elearning";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-brand-700/50">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-200 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Học liệu số & Tri thức Đổi mới Sáng tạo
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Cổng Đào Tạo Trực Tuyến & Chuyển Giao Tri Thức
              </h1>
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                Kho bài giảng số hóa 5 thành phần chuẩn hóa từ mạng lưới Chuyên gia KH&CN hàng đầu.
                Tích hợp công nghệ nạp tri thức vector AI tự động cho Trợ lý ảo NacenTwin.
              </p>
            </div>

            {isManagementAllowed && (
              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <Link
                  href={managementHref}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-lg transition transform hover:-translate-y-0.5"
                >
                  <ShieldCheck className="w-5 h-5 text-slate-900" />
                  <span>Bàn Làm Việc Quản Trị Học Liệu</span>
                </Link>
              </div>
            )}
          </div>

          {/* 2. 4 THẺ KPI STRIP ĐỘNG TỪ POSTGRESQL */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 bg-brand-500/20 rounded-xl text-brand-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {data?.kpis.totalCourses ?? 0}
                </div>
                <div className="text-xs text-slate-300 font-medium">Khóa học / Bài giảng</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-300">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {data?.kpis.totalDurationHours ?? 0}h
                </div>
                <div className="text-xs text-slate-300 font-medium">Thời lượng tích lũy</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-300">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {data?.kpis.totalInstructors ?? 0}
                </div>
                <div className="text-xs text-slate-300 font-medium">Chuyên gia giảng dạy</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl text-amber-300">
                <Star className="w-6 h-6 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {data?.kpis.averageRating ? data.kpis.averageRating.toFixed(1) : "5.0"}
                </div>
                <div className="text-xs text-slate-300 font-medium">Đánh giá trung bình</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SƠ ĐỒ LỘ TRÌNH HỌC TẬP 3 BƯỚC TƯƠNG TÁC (LOẠI A -> B -> B+) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-600" />
                Lộ Trình Đào Tạo Đổi Mới Công Nghệ 3 Cấp Độ
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Lựa chọn cấp độ phù hợp để tự động lọc danh sách bài học bên dưới
              </p>
            </div>
            {selectedType && (
              <button
                type="button"
                onClick={() => setSelectedType("")}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc cấp độ
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bước 1: Loại A */}
            <div
              onClick={() => handleTypeSelect("TYPE_A")}
              className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                selectedType === "TYPE_A"
                  ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 dark:bg-blue-950/40"
                  : "bg-slate-50/60 border-slate-200 hover:border-blue-300 dark:bg-slate-800/40 dark:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  Cấp độ 1: Loại A
                </span>
                <span className="text-xs text-slate-400 font-mono">Đại chúng</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Tri thức Đổi mới sáng tạo Cơ sở
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                Bài giảng nền tảng thời lượng ngắn, video tổng quan lý thuyết, tư duy ĐMST và chuyển giao công nghệ cơ bản.
              </p>
              <div className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>Khám phá bài học Loại A</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Bước 2: Loại B */}
            <div
              onClick={() => handleTypeSelect("TYPE_B")}
              className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                selectedType === "TYPE_B"
                  ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40"
                  : "bg-slate-50/60 border-slate-200 hover:border-emerald-300 dark:bg-slate-800/40 dark:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Cấp độ 2: Loại B
                </span>
                <span className="text-xs text-slate-400 font-mono">Doanh nghiệp</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Chuyên sâu Ngành & Thực hành TRL
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                Dành cho Doanh nghiệp & Viện trường: Kèm công cụ thực hành, tài liệu hướng dẫn và khảo sát đánh giá theo TT17.
              </p>
              <div className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Khám phá bài học Loại B</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Bước 3: Loại B+ */}
            <div
              onClick={() => handleTypeSelect("TYPE_B_PLUS")}
              className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                selectedType === "TYPE_B_PLUS"
                  ? "bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 dark:bg-purple-950/40"
                  : "bg-slate-50/60 border-slate-200 hover:border-purple-300 dark:bg-slate-800/40 dark:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                  Cấp độ 3: Loại B+
                </span>
                <span className="text-xs text-slate-400 font-mono">Chuyên gia</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                Chuyên đề Nâng cao & Đào tạo Chuyên gia
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                Chương trình công nghệ cao, tư vấn trực tiếp 1-1 với Chuyên gia phụ trách và sát hạch cấp chứng nhận.
              </p>
              <div className="flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span>Khám phá bài học Loại B+</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THANH BỘ LỌC VÀ CHUYỂN ĐỔI CHẾ ĐỘ HIỂN THỊ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề bài giảng, tên chuyên gia..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition"
            >
              Tìm kiếm
            </button>
          </form>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-white text-brand-700 shadow-xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
                title="Dạng lưới thẻ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "table"
                    ? "bg-white text-brand-700 shadow-xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
                title="Dạng bảng danh sách"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. DANH SÁCH HỌC LIỆU BỌC TRONG <ASYNC> */}
        <Async
          state={asyncState}
          onRetry={loadData}
          errorMessage={errorMessage}
          loadingSkeleton={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-80 p-4 space-y-4">
                  <div className="bg-slate-200 dark:bg-slate-800 rounded-xl h-44 w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          }
          emptyContent={
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Chưa tìm thấy học liệu phù hợp
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Không có bài học nào khớp với tiêu chí tìm kiếm hoặc phân loại hiện tại.
              </p>
              {(keyword || selectedType) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              )}
            </div>
          }
        >
          {data && (
            <>
              {viewMode === "grid" ? (
                /* GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.materials.items.map((item) => {
                    const typeInfo = LESSON_TYPE_LABELS[item.lessonType] || {
                      label: item.lessonType,
                      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                    };

                    return (
                      <Link
                        key={item.id}
                        href={`/elearning/${item.id}`}
                        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
                      >
                        {/* Thumbnail Container */}
                        <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                              <PlayCircle className="w-12 h-12 opacity-50" />
                            </div>
                          )}

                          {/* Huy hiệu thời lượng */}
                          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-xs font-mono font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-300" />
                            <span>{item.durationMinutes}p</span>
                          </div>

                          {/* Huy hiệu Loại bài */}
                          <div className="absolute top-2.5 left-2.5">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border shadow-xs ${typeInfo.badgeClass}`}
                            >
                              {typeInfo.label}
                            </span>
                          </div>

                          {/* Huy hiệu AI RAG */}
                          {item.hasAiKnowledge && (
                            <div className="absolute top-2.5 right-2.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                                <Sparkles className="w-3 h-3" />
                                <span>✨ Đã nạp AI</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="text-[11px] font-mono text-slate-400">
                              Mã: {item.materialCode}
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                          </div>

                          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {item.leadInstructorAvatar ? (
                                <img
                                  src={item.leadInstructorAvatar}
                                  alt={item.leadInstructorName || "Chuyên gia"}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 flex items-center justify-center text-xs font-bold">
                                  {item.leadInstructorName ? item.leadInstructorName[0] : "C"}
                                </div>
                              )}
                              <div className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-[130px]">
                                {item.leadInstructorName || "Chuyên gia NacenTech"}
                              </div>
                            </div>

                            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Học ngay <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                /* TABLE VIEW */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-5 py-3.5">Mã học liệu</th>
                          <th className="px-5 py-3.5">Tiêu đề bài giảng</th>
                          <th className="px-5 py-3.5">Loại bài</th>
                          <th className="px-5 py-3.5">Thời lượng</th>
                          <th className="px-5 py-3.5">Giảng viên</th>
                          <th className="px-5 py-3.5">AI Tri thức</th>
                          <th className="px-5 py-3.5 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.materials.items.map((item) => {
                          const typeInfo = LESSON_TYPE_LABELS[item.lessonType] || {
                            label: item.lessonType,
                            badgeClass: "bg-slate-100 text-slate-700",
                          };
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                              <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {item.materialCode}
                              </td>
                              <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                                {item.title}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${typeInfo.badgeClass}`}>
                                  {typeInfo.label}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-xs">
                                {item.durationMinutes} phút
                              </td>
                              <td className="px-5 py-3.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                                {item.leadInstructorName || "—"}
                              </td>
                              <td className="px-5 py-3.5">
                                {item.hasAiKnowledge ? (
                                  <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5" /> Có
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">Không</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <Link
                                  href={`/elearning/${item.id}`}
                                  className="text-xs font-bold text-brand-600 hover:text-brand-800 dark:text-brand-400 hover:underline"
                                >
                                  Xem chi tiết
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PHÂN TRANG */}
              {data.materials.totalPages > 1 && (
                <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500">
                    Trang {data.materials.page} / {data.materials.totalPages} (Tổng số {data.materials.totalCount} bài học)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      Trang trước
                    </button>
                    <button
                      type="button"
                      disabled={page >= data.materials.totalPages}
                      onClick={() => setPage((p) => Math.min(data.materials.totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Async>
      </section>
    </div>
  );
}
