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
} from "lucide-react";
import { Async, AsyncState } from "@/components/ui/async";
import QuickDemandModal from "@/components/demand/QuickDemandModal";
import { getTniClassification } from "@/components/demand/TniRealtimeCalculator";

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
  const [filterSector, setFilterSector] = useState("");
  const [filterTni, setFilterTni] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [publicDemands, setPublicDemands] = useState<PublicDemandItem[]>([]);
  const [asyncState, setAsyncState] = useState<AsyncState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const filteredDemands = publicDemands.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.technicalProblem?.toLowerCase().includes(query) ||
      item.itemCode?.toLowerCase().includes(query) ||
      item.stageName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20">
      {/* HERO BANNER SECTION (Theo chuẩn NacenTwin) */}
      <section className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-brand-700 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold backdrop-blur-sm border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              Sàn Giao Dịch Bài Toán & Nhu Cầu Đổi Mới Công Nghệ (NacenTwin)
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Nhu Cầu Đổi Mới Công Nghệ Từ Doanh Nghiệp
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Các bài toán kỹ thuật thực tế từ các DNNVV đã được chuẩn hóa chỉ số cấp thiết TNI (Technology Need Index).
              Hỗ trợ kết nối nhà khoa học, viện trường và doanh nghiệp công nghệ giải quyết điểm nghẽn sản xuất.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/khao-sat-nhu-cau"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 backdrop-blur-sm"
            >
              <ClipboardCheck className="w-4 h-4 text-cyan-300" />
              Phiếu Khảo Sát DNNVV
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-nacen-green-500 hover:bg-nacen-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-emerald-950/20"
            >
              <PlusCircle className="w-4 h-4" />
              Đăng Nhanh Bài Toán
            </button>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-border-default dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm bài toán, công đoạn, mã hồ sơ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition"
              />
            </div>

            {/* Sector Filter */}
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500 transition"
            >
              <option value="">Tất cả Lĩnh vực TT17</option>
              <option value="LV01">LV01 — Cơ khí chế tạo & Tự động hóa</option>
              <option value="LV07">LV07 — Nông nghiệp công nghệ cao</option>
              <option value="LV11">LV11 — Năng lượng & Môi trường</option>
            </select>

            {/* TNI Level Filter */}
            <select
              value={filterTni}
              onChange={(e) => setFilterTni(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500 transition"
            >
              <option value="">Tất cả Mức Ưu Tiên TNI</option>
              <option value="VERY_HIGH">TNI Rất Cao (≥ 80) — Ưu tiên P0</option>
              <option value="HIGH">TNI Cao (65 - 79) — Ưu tiên P1</option>
              <option value="MEDIUM">TNI Trung Bình (50 - 64)</option>
            </select>
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
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Xóa bộ lọc
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Đăng bài toán mới
                </button>
              </div>
            </div>
          }
        >
          {/* SUCCESS LISTING GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDemands.map((item) => {
              const tniMeta = getTniClassification(item.tniScore || 70);
              return (
                <article
                  key={item.id}
                  className="group surface-card p-6 flex flex-col justify-between hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        {item.itemCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${tniMeta.badgeClass}`}
                      >
                        <Flame className="w-3 h-3" /> TNI: {item.tniScore || 75}
                      </span>
                    </div>

                    {/* Problem Title */}
                    <div>
                      <h3 className="text-base font-bold text-text-primary dark:text-white group-hover:text-brand-700 dark:group-hover:text-cyan-300 transition line-clamp-2">
                        {item.technicalProblem}
                      </h3>
                      <p className="mt-1 text-xs text-text-secondary dark:text-slate-400 flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>Công đoạn: <strong className="text-slate-700 dark:text-slate-200">{item.stageName}</strong></span>
                      </p>
                    </div>

                    {/* Desired Solution Preview */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-text-secondary dark:text-slate-300 space-y-1">
                      <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                        Giải pháp mong muốn:
                      </span>
                      <p className="line-clamp-2 font-medium">
                        {item.desiredSolution || "Cần tư vấn chuyên gia và chuyển giao công nghệ phù hợp."}
                      </p>
                    </div>

                    {/* Budget & Scope */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                      <span className="font-semibold text-nacen-green-700 dark:text-emerald-400">
                        Ngân sách: {item.budgetRange || "Thỏa thuận"}
                      </span>
                      <span className="text-slate-400 text-xs">
                        Lĩnh vực: {item.sectorCode || "Cơ khí"}
                      </span>
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Bảo vệ danh tính (PDPD)</span>
                    </div>
                    <Link
                      href={`/nhu-cau-cong-nghe/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-cyan-400 hover:text-brand-800 group-hover:translate-x-0.5 transition"
                    >
                      Chi tiết & Chào giải pháp <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
