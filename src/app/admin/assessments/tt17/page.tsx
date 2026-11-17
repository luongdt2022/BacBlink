"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  Building2,
  CheckCircle2,
  ExternalLink,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
  Eye,
  X,
} from "lucide-react";
import {
  Tt17Assessment,
  Tt17DashboardData,
  getAssessmentById,
  getGovAssessmentQueue,
  getTt17Dashboard,
} from "@/services/api/assessment-tt17";
import {
  resolveProvinceName,
  resolveSectorName,
  resolveTt17Classification,
} from "@/lib/gov-label-resolver";
import { PROVINCES_34 } from "@/lib/constants/provinces";
import {
  Tt17SurveyDetailView,
  hasRawSurveyForm,
} from "@/components/assessments/tt17-survey-detail-view";

export default function SuperAdminTt17DashboardPage() {
  const [dashboard, setDashboard] = useState<Tt17DashboardData | null>(null);
  const [assessments, setAssessments] = useState<Tt17Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedScope, setSelectedScope] = useState<string>("ALL");
  const [selectedClassification, setSelectedClassification] = useState<string>("ALL");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Modal xem nhanh chi tiết Form đã submit & 26 tiêu chí của DN
  const [inspectingItem, setInspectingItem] = useState<Tt17Assessment | null>(null);
  const [modalTab, setModalTab] = useState<"FORM" | "SCORES">("FORM");

  const openInspectModal = (item: Tt17Assessment) => {
    setInspectingItem(item);
    setModalTab("FORM");
    if (typeof window !== "undefined" && !process.env.VITEST && (!item.scoreResult?.criteria || item.scoreResult.criteria.length === 0)) {
      getAssessmentById(item.id)
        .then((full) => {
          if (full) {
            setInspectingItem((prev) => (prev?.id === item.id ? full : prev));
          }
        })
        .catch(() => {});
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, queueRes] = await Promise.all([
        getTt17Dashboard({
          scopeId: selectedScope === "ALL" ? undefined : selectedScope,
          industryCode: selectedIndustry === "ALL" ? undefined : selectedIndustry,
          classification: selectedClassification === "ALL" ? undefined : selectedClassification,
        }),
        getGovAssessmentQueue(
          selectedScope === "ALL" ? undefined : selectedScope,
          undefined
        ),
      ]);
      setDashboard(dashRes);
      setAssessments(queueRes);
      setCurrentPage(1);
    } catch (err) {
      console.error("Lỗi khi tải Dashboard TT17:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedScope, selectedIndustry, selectedClassification]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      if (selectedClassification !== "ALL") {
        if (selectedClassification === "LAC_HAU") {
          if (
            item.scoreResult?.classification !== "LAC_HAU" &&
            item.scoreResult?.classification !== "CAN_THAM_DINH"
          ) {
            return false;
          }
        } else if (item.scoreResult?.classification !== selectedClassification) {
          return false;
        }
      }
      if (selectedIndustry !== "ALL") {
        if (item.industryCode?.toUpperCase() !== selectedIndustry.toUpperCase()) {
          return false;
        }
      }
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const sector = resolveSectorName(item.industryCode).toLowerCase();
        const prov = resolveProvinceName(item.scopeId).toLowerCase();
        const match =
          item.enterpriseName.toLowerCase().includes(q) ||
          item.taxCode.toLowerCase().includes(q) ||
          item.industryCode.toLowerCase().includes(q) ||
          sector.includes(q) ||
          prov.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [assessments, selectedClassification, selectedIndustry, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAssessments.length / pageSize));
  const paginatedAssessments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssessments.slice(start, start + pageSize);
  }, [filteredAssessments, currentPage]);

  const getClassificationBadge = (cls?: string) => {
    const info = resolveTt17Classification(cls);
    return (
      <span className={`px-2.5 py-0.5 text-xs font-bold rounded border whitespace-nowrap inline-block ${info.badgeClass}`}>
        {info.label.split("(")[0].trim()}
      </span>
    );
  };

  const groupBars = useMemo(() => {
    const g = dashboard?.avgGroupScores;
    if (!g) return [];
    return [
      {
        code: "T",
        name: "Nhóm A (T): Hiện trạng Công nghệ & Thiết bị",
        score: g.scoreT,
        max: g.maxT,
        pct: Math.round((g.scoreT / g.maxT) * 100),
        color: "bg-blue-600",
      },
      {
        code: "E",
        name: "Nhóm B (E): Hiệu quả Khai thác Công nghệ",
        score: g.scoreE,
        max: g.maxE,
        pct: Math.round((g.scoreE / g.maxE) * 100),
        color: "bg-emerald-600",
      },
      {
        code: "O",
        name: "Nhóm C (O): Năng lực Tổ chức & Quản lý",
        score: g.scoreO,
        max: g.maxO,
        pct: Math.round((g.scoreO / g.maxO) * 100),
        color: "bg-amber-500",
      },
      {
        code: "R",
        name: "Nhóm D (R): Năng lực Nghiên cứu & Phát triển (R&D)",
        score: g.scoreR,
        max: g.maxR,
        pct: Math.round((g.scoreR / g.maxR) * 100),
        color: "bg-purple-600",
      },
      {
        code: "I",
        name: "Nhóm Đ (I): Đổi mới Sáng tạo & Chuyển đổi số 4.0",
        score: g.scoreI,
        max: g.maxI,
        pct: Math.round((g.scoreI / g.maxI) * 100),
        color: "bg-indigo-600",
      },
    ];
  }, [dashboard]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
              <Award className="w-4 h-4" />
              <span>Trung Tâm Điều Hành Quốc Gia · Thông Tư 17/2019/TT-BKHCN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Dashboard Đánh Giá Trình Độ & Năng Lực Công Nghệ Doanh Nghiệp (TT17)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {dashboard ? (
                <>
                  Tổng hợp dữ liệu thực tế từ cơ sở dữ liệu quốc gia ({dashboard.totalAssessments} DN trên toàn quốc
                  {dashboard.byProvince?.length ? ` · ${dashboard.byProvince.length} Tỉnh/Thành có dữ liệu` : ""}).
                </>
              ) : (
                "Tổng hợp dữ liệu thực tế từ cơ sở dữ liệu quốc gia theo Thông tư 17/2019/TT-BKHCN."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/admin/assessments/records"
              className="h-9 px-3.5 bg-brand-700 hover:bg-brand-800 text-white rounded-control text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Danh sách Phiếu Đánh Giá</span>
            </Link>
            <button
              type="button"
              onClick={loadData}
              className="h-9 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-control text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Bộ lọc toàn cục */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Địa bàn / Khu công nghiệp Bắc Ninh (BACLINK):
            </label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="form-control w-full text-xs font-semibold"
            >
              {(() => {
                const countByScope = new Map(dashboard?.byProvince?.map((p) => [p.scopeId, p.count]) ?? []);
                const totalAll = dashboard
                  ? dashboard.byProvince?.reduce((s, p) => s + p.count, 0) || dashboard.totalAssessments
                  : null;
                const tgCount = countByScope.get("TG");
                const ntCount = countByScope.get("NT");
                return (
                  <>
                    <option value="ALL">
                      {totalAll !== null
                        ? `Toàn quốc — Tất cả Tỉnh/Thành (${totalAll} DN)`
                        : "Toàn quốc — Tất cả Tỉnh/Thành"}
                    </option>
                    <option value="TG">
                      {tgCount !== undefined ? `Tỉnh Tiền Giang (TG) — ${tgCount} DN` : "Tỉnh Tiền Giang (TG)"}
                    </option>
                    <option value="NT">
                      {ntCount !== undefined ? `Tỉnh Ninh Thuận (NT) — ${ntCount} DN` : "Tỉnh Ninh Thuận (NT)"}
                    </option>
                    {PROVINCES_34.filter((p) => p.code !== "ALL" && p.code !== "TG" && p.code !== "NT").map((prov) => {
                      const pCount = countByScope.get(prov.code);
                      return (
                        <option key={prov.code} value={prov.code}>
                          {pCount !== undefined ? `${prov.name} (${prov.code}) — ${pCount} DN` : `${prov.name} (${prov.code})`}
                        </option>
                      );
                    })}
                  </>
                );
              })()}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Xếp loại trình độ công nghệ (TT17):
            </label>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="form-control w-full text-xs font-semibold"
            >
              <option value="ALL">Tất cả mức xếp loại</option>
              <option value="TIEN_TIEN">Trình độ Tiên tiến (τ ≥ 75đ)</option>
              <option value="TRUNG_BINH_TIEN_TIEN">Trung bình Tiên tiến (60–74đ)</option>
              <option value="TRUNG_BINH">Trình độ Trung bình (35–59đ)</option>
              <option value="LAC_HAU">Trình độ Lạc hậu (&lt; 35đ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Ngành chế biến, chế tạo (VSIC):
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="form-control w-full text-xs font-semibold"
            >
              <option value="ALL">Tất cả 23 ngành VSIC</option>
              {dashboard?.byIndustry?.map((ind) => (
                <option key={ind.industryCode} value={ind.industryCode}>
                  {ind.industryCode}: {resolveSectorName(ind.industryCode)} ({ind.count} DN)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        data-testid={loading ? "tt17-kpi-skeleton" : "tt17-kpi-grid"}
        aria-busy={loading ? "true" : undefined}
      >
        <div
          aria-busy={loading ? "true" : undefined}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Tổng DN Đã Đánh Giá</span>
            <Building2 className="w-5 h-5 text-brand-600" />
          </div>
          {loading ? (
            <>
              <div className="h-9 w-24 rounded-md animate-shimmer mt-2" />
              <div className="h-4 w-44 rounded animate-shimmer mt-1.5" />
            </>
          ) : (
            <>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {dashboard?.totalAssessments ?? 0}
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">
                {dashboard?.approvedCount ?? 0} DN đã duyệt Phụ lục IV · {dashboard?.submittedCount ?? 0} chờ duyệt
              </div>
            </>
          )}
        </div>

        <div
          aria-busy={loading ? "true" : undefined}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-indigo-600">Điểm Tổng Bình Quân (τ)</span>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          {loading ? (
            <>
              <div className="h-9 w-24 rounded-md animate-shimmer mt-2" />
              <div className="h-4 w-44 rounded animate-shimmer mt-1.5" />
            </>
          ) : (
            <>
              <div className="text-3xl font-black text-indigo-700 dark:text-indigo-400 mt-2">
                {dashboard?.avgTotalScore ?? 0}
                <span className="text-sm font-normal text-slate-400 ml-1">/ 100</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Thấp nhất: <strong>{dashboard?.minTotalScore ?? 0}đ</strong> · Cao nhất: <strong>{dashboard?.maxTotalScore ?? 0}đ</strong>
              </div>
            </>
          )}
        </div>

        <div
          aria-busy={loading ? "true" : undefined}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-emerald-700">Hệ Số Đồng Bộ TB (T_ĐB)</span>
            <Layers className="w-5 h-5 text-emerald-600" />
          </div>
          {loading ? (
            <>
              <div className="h-9 w-24 rounded-md animate-shimmer mt-2" />
              <div className="h-4 w-44 rounded animate-shimmer mt-1.5" />
            </>
          ) : (
            <>
              <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
                {dashboard?.avgSyncCoefficient ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Đo lường độ cân bằng 5 nhóm T-E-O-R-I
              </div>
            </>
          )}
        </div>

        <div
          aria-busy={loading ? "true" : undefined}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-amber-700">Tỷ Lệ Đạt Trung Bình Trở Lên</span>
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
          </div>
          {loading ? (
            <>
              <div className="h-9 w-24 rounded-md animate-shimmer mt-2" />
              <div className="h-4 w-44 rounded animate-shimmer mt-1.5" />
            </>
          ) : (
            (() => {
              const total = dashboard?.totalAssessments || 0;
              const lacHau = dashboard?.byClassification?.find((c) => c.classification === "LAC_HAU")?.count || 0;
              const passCount = Math.max(0, total - lacHau);
              const pct = total > 0 ? ((passCount * 100) / total).toFixed(1) : "0.0";
              return (
                <>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                    {pct}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    <strong>{passCount}</strong> / {total} DN đạt ≥ 35 điểm (Còn {lacHau} DN Lạc hậu)
                  </div>
                </>
              );
            })()
          )}
        </div>
      </div>

      {/* Bảng Tổng Hợp Theo Tỉnh / Thành Phố (Tiền Giang 166 DN, Ninh Thuận 8 DN...) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Bảng Tổng Hợp Kết Quả Đánh Giá TT17 Theo Địa Bàn & KCN Bắc Ninh (BACLINK)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bấm vào từng địa bàn để lọc danh sách doanh nghiệp và phân tích chi tiết 26 tiêu chí của tỉnh đó.
            </p>
          </div>
          {selectedScope !== "ALL" && (
            <button
              type="button"
              onClick={() => setSelectedScope("ALL")}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
            >
              Xem lại Toàn bộ
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-bold">
                <th className="py-3 px-4">Địa bàn / KCN (BACLINK)</th>
                <th className="py-3 px-3 text-center">Tổng số DN</th>
                <th className="py-3 px-3 text-center">Điểm TB (τ)</th>
                <th className="py-3 px-3 text-center">Min – Max</th>
                <th className="py-3 px-3 text-center">Điểm TB 5 Nhóm (T / E / O / R / I)</th>
                <th className="py-3 px-3 text-center">Hệ số T_ĐB</th>
                <th className="py-3 px-3 text-center">Tiên tiến / TB-TT</th>
                <th className="py-3 px-3 text-center">Trung bình</th>
                <th className="py-3 px-3 text-center">Lạc hậu</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && !dashboard ? (
                [0, 1, 2].map((rowIdx) => (
                  <tr key={rowIdx} aria-busy="true">
                    <td className="py-3 px-4"><div className="h-5 w-36 rounded animate-shimmer" /></td>
                    <td className="py-3 px-3"><div className="h-5 w-14 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 px-3"><div className="h-5 w-14 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 px-3"><div className="h-5 w-16 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 px-3"><div className="h-5 w-28 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 px-3"><div className="h-5 w-12 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 px-3"><div className="h-5 w-10 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 px-3"><div className="h-5 w-10 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 px-3"><div className="h-5 w-10 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 px-4"><div className="h-6 w-20 ml-auto rounded animate-shimmer" /></td>
                  </tr>
                ))
              ) : dashboard?.byProvince?.map((p) => {
                const isSelected = selectedScope === p.scopeId;
                return (
                  <tr
                    key={p.scopeId}
                    className={`transition ${
                      isSelected
                        ? "bg-brand-50/70 dark:bg-brand-950/30 font-semibold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-800 text-xs font-extrabold">
                          {p.scopeId}
                        </span>
                        <span>{resolveProvinceName(p.scopeId)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-slate-900 dark:text-white text-sm">
                      {p.count} DN
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-sm">
                        {p.avgTotalScore}
                      </span>
                      <span className="text-slate-400">/100</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                      {p.minTotalScore} – {p.maxTotalScore}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700 dark:text-slate-300">
                      {p.avgScoreT} / {p.avgScoreE} / {p.avgScoreO} / {p.avgScoreR} / {p.avgScoreI}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700">
                      {p.avgSyncCoefficient}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {p.tienTienCount + p.trungBinhTienTienCount}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        {p.trungBinhCount}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                        {p.lacHauCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedScope(isSelected ? "ALL" : p.scopeId)}
                        className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "bg-brand-700 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                        }`}
                      >
                        {isSelected ? "Đang lọc" : "Lọc địa bàn"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2 Cột: Điểm TB 5 Nhóm Thành Phần (T-E-O-R-I) & Cơ Cấu Xếp Loại TT17 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột 1: 5 Nhóm thành phần công nghệ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-6 shadow-xs">
          <h3 className="text-sm font-extrabold uppercase text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Điểm Bình Quân 5 Nhóm Thành Phần Công Nghệ (TT17)</span>
          </h3>
          <div className="space-y-4">
            {loading && !dashboard
              ? [0, 1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="space-y-1.5" aria-busy="true">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-56 rounded animate-shimmer" />
                      <div className="h-4 w-24 rounded animate-shimmer" />
                    </div>
                    <div className="w-full h-2.5 rounded-full animate-shimmer" />
                  </div>
                ))
              : groupBars.map((bar) => (
              <div key={bar.code} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{bar.name}</span>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                    {bar.score} / {bar.max} điểm ({bar.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar.color} transition-all duration-300`}
                    style={{ width: `${Math.min(100, Math.max(2, bar.pct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột 2: Cơ cấu xếp loại trình độ công nghệ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-6 shadow-xs">
          <h3 className="text-sm font-extrabold uppercase text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Cơ Cấu Phân Loại Trình Độ Công Nghệ Doanh Nghiệp</span>
          </h3>
          <div className="space-y-3">
            {loading && !dashboard
              ? [0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    aria-busy="true"
                    className="p-3.5 rounded-control border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="space-y-2">
                      <div className="h-5 w-36 rounded animate-shimmer" />
                      <div className="h-3.5 w-44 rounded animate-shimmer" />
                    </div>
                    <div className="space-y-1.5 text-right">
                      <div className="h-6 w-14 ml-auto rounded animate-shimmer" />
                      <div className="h-3.5 w-10 ml-auto rounded animate-shimmer" />
                    </div>
                  </div>
                ))
              : dashboard?.byClassification?.map((c) => {
              const info = resolveTt17Classification(c.classification);
              const isSelected = selectedClassification === c.classification;
              return (
                <div
                  key={c.classification}
                  onClick={() =>
                    setSelectedClassification(isSelected ? "ALL" : c.classification)
                  }
                  className={`p-3.5 rounded-control border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-brand-600 bg-brand-50/50 dark:bg-brand-950/30"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded border ${info.badgeClass}`}>
                        {c.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Điểm trung bình nhóm: <strong>{c.avgScore} / 100</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      {c.count} DN
                    </div>
                    <div className="text-xs font-bold text-slate-500">{c.percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phân tích Điểm nghẽn 26 Tiêu chí TT17 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-extrabold uppercase text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Phân Tích Mức Độ Đạt Điểm & Điểm Nghẽn Trên 26 Tiêu Chí (TC01 – TC26)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đánh giá điểm trung bình thực đạt so với điểm tối đa của từng tiêu chí theo Thông tư 17/2019/TT-BKHCN.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto scrollbar-thin pr-1">
          {loading && !dashboard
            ? [0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  aria-busy="true"
                  className="p-3 rounded-control border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-4 w-44 rounded animate-shimmer" />
                    <div className="h-5 w-14 rounded animate-shimmer shrink-0" />
                  </div>
                  <div className="h-1.5 w-full rounded-full animate-shimmer" />
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-20 rounded animate-shimmer" />
                    <div className="h-3 w-24 rounded animate-shimmer" />
                  </div>
                </div>
              ))
            : dashboard?.criteriaStats?.map((crit) => {
            const isLow = crit.achievementRate < 40;
            return (
              <div
                key={crit.code}
                className="p-3 rounded-control border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-mono mr-1.5">
                      {crit.code}
                    </span>
                    {crit.name}
                  </div>
                  <span
                    className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-mono font-bold ${
                      isLow
                        ? "bg-rose-100 text-rose-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {crit.avgScore}/{crit.maxScore}đ
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isLow ? "bg-rose-500" : "bg-emerald-600"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(3, crit.achievementRate))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Đạt TB: {crit.achievementRate}%</span>
                    <span>Điểm nghẽn: {crit.bottleneckCount} DN ({crit.bottleneckRate}%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bảng Danh Sách Chi Tiết Doanh Nghiệp (166 DN Tiền Giang, 8 DN Ninh Thuận...) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Danh Sách Chi Tiết Hồ Sơ Đánh Giá Doanh Nghiệp</span>
              {loading && assessments.length === 0 ? (
                <span
                  aria-busy="true"
                  className="inline-block h-5 w-16 rounded animate-shimmer"
                />
              ) : (
                <span>({filteredAssessments.length} DN)</span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tra cứu điểm 5 nhóm (T/E/O/R/I), ma trận 26 tiêu chí và phiếu kết quả Phụ lục IV của từng doanh nghiệp.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm tên DN, mã số thuế, ngành, tỉnh..."
              className="form-control w-full pl-9 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-bold text-[11px]">
                <th className="py-2.5 pl-4 pr-2">STT</th>
                <th className="py-2.5 px-2.5">Doanh nghiệp / MST</th>
                <th className="py-2.5 px-2">Tỉnh / Thành</th>
                <th className="py-2.5 px-2">Ngành VSIC</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">T / E / O / R / I</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Điểm (τ)</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">T_ĐB</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Xếp loại</th>
                <th className="py-2.5 pl-2 pr-4 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [0, 1, 2, 3, 4].map((rowIdx) => (
                  <tr key={rowIdx} aria-busy="true" data-testid="tt17-table-skeleton-row">
                    <td className="py-3 pl-4 pr-2"><div className="h-4 w-6 rounded animate-shimmer" /></td>
                    <td className="py-3 px-2.5 space-y-1.5">
                      <div className="h-4 w-40 rounded animate-shimmer" />
                      <div className="h-3 w-28 rounded animate-shimmer" />
                    </td>
                    <td className="py-3 px-2"><div className="h-5 w-20 rounded animate-shimmer" /></td>
                    <td className="py-3 px-2"><div className="h-4 w-28 rounded animate-shimmer" /></td>
                    <td className="py-3 px-2"><div className="h-4 w-24 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 px-2"><div className="h-5 w-12 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 px-2"><div className="h-4 w-10 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 px-2"><div className="h-5 w-20 mx-auto rounded animate-shimmer" /></td>
                    <td className="py-3 pl-2 pr-4"><div className="h-6 w-24 ml-auto rounded animate-shimmer" /></td>
                  </tr>
                ))
              ) : paginatedAssessments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Không tìm thấy doanh nghiệp phù hợp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                paginatedAssessments.map((item, idx) => {
                  const stt = (currentPage - 1) * pageSize + idx + 1;
                  const hasRaw = hasRawSurveyForm(item.surveyData, item.hasRawSurvey);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => openInspectModal(item)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                    >
                      <td className="py-2.5 pl-4 pr-2 font-mono text-slate-500">{stt}</td>
                      <td className="py-2.5 px-2.5 min-w-[180px] max-w-[230px]">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-brand-700 transition leading-snug">
                          {item.enterpriseName}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-500">MST: {item.taxCode}</span>
                          {hasRaw ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                              Có dữ liệu Form
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                              Chỉ có điểm tổng hợp
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[11px] whitespace-nowrap inline-block">
                          {resolveProvinceName(item.scopeId)} ({item.scopeId})
                        </span>
                      </td>
                      <td className="py-2.5 px-2 max-w-[165px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug">
                          {item.industryCode}: {resolveSectorName(item.industryCode)}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {item.scoreResult?.scoreT ?? 0}/{item.scoreResult?.scoreE ?? 0}/{item.scoreResult?.scoreO ?? 0}/{item.scoreResult?.scoreR ?? 0}/{item.scoreResult?.scoreI ?? 0}
                      </td>
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                          {item.scoreResult?.totalScore ?? 0}
                        </span>
                        <span className="text-slate-400 text-[11px]">/100</span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {item.scoreResult?.syncCoefficient ?? 0}
                      </td>
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        {getClassificationBadge(item.scoreResult?.classification)}
                      </td>
                      <td
                        className="py-2.5 pl-2 pr-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openInspectModal(item)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-semibold transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Xem Form & 26 TC</span>
                          </button>
                          <Link
                            href={`/assessments/tt17/${item.id}/report`}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition inline-block"
                          >
                            Báo cáo
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="text-slate-500">
              Hiển thị {(currentPage - 1) * pageSize + 1} –{" "}
              {Math.min(currentPage * pageSize, filteredAssessments.length)} trên tổng số{" "}
              <strong>{filteredAssessments.length}</strong> doanh nghiệp
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-40 font-semibold cursor-pointer"
              >
                Trang trước
              </button>
              <span className="px-3 py-1.5 font-bold">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-40 font-semibold cursor-pointer"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal xem nhanh Form đã submit & 26 tiêu chí của DN */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 p-5 bg-slate-50/70 dark:bg-slate-800/40">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                    {resolveProvinceName(inspectingItem.scopeId)} ({inspectingItem.scopeId})
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {inspectingItem.enterpriseName}
                  </h2>
                  {getClassificationBadge(inspectingItem.scoreResult?.classification)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  MST: <strong>{inspectingItem.taxCode}</strong> · Ngành: <strong>{inspectingItem.industryCode} (
                  {resolveSectorName(inspectingItem.industryCode)})</strong> · Năm đánh giá:{" "}
                  {inspectingItem.assessmentYear}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                  <div className="text-slate-500">Nhóm T (Thiết bị)</div>
                  <div className="font-extrabold text-sm mt-0.5">
                    {inspectingItem.scoreResult?.scoreT}/30
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                  <div className="text-slate-500">Nhóm E (Hiệu quả)</div>
                  <div className="font-extrabold text-sm mt-0.5">
                    {inspectingItem.scoreResult?.scoreE}/20
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                  <div className="text-slate-500">Nhóm O (Tổ chức)</div>
                  <div className="font-extrabold text-sm mt-0.5">
                    {inspectingItem.scoreResult?.scoreO}/19
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                  <div className="text-slate-500">Nhóm R (R&D)</div>
                  <div className="font-extrabold text-sm mt-0.5">
                    {inspectingItem.scoreResult?.scoreR}/17
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                  <div className="text-slate-500">Nhóm I (Đổi mới)</div>
                  <div className="font-extrabold text-sm mt-0.5">
                    {inspectingItem.scoreResult?.scoreI}/14
                  </div>
                </div>
              </div>

              {/* Thanh chuyển Tab */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setModalTab("FORM")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    modalTab === "FORM"
                      ? "bg-brand-700 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  1. Chi Tiết Form Kê Khai Đã Submit (Phụ Lục I - 6 Mục Chỉ Số)
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("SCORES")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    modalTab === "SCORES"
                      ? "bg-brand-700 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  2. Ma Trận Điểm 26 Tiêu Chí Đánh Giá (TC01 – TC26)
                </button>
              </div>

              {modalTab === "FORM" ? (
                <Tt17SurveyDetailView assessment={inspectingItem} />
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {inspectingItem.scoreResult?.criteria?.map((c) => (
                    <div key={c.code} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
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

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="text-xs font-bold">
                Tổng điểm (τ):{" "}
                <span className="text-emerald-700 text-sm font-black">
                  {inspectingItem.scoreResult?.totalScore}/100
                </span>{" "}
                · Hệ số T_ĐB: <strong>{inspectingItem.scoreResult?.syncCoefficient}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/assessments/tt17/${inspectingItem.id}/report`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                >
                  Xem Phiếu Phụ Lục IV Đầy Đủ
                </Link>
                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold cursor-pointer"
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
