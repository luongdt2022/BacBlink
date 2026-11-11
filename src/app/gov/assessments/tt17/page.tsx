"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Award, RotateCcw, AlertCircle, CheckCircle2, ChevronDown, Check, X } from "lucide-react";
import {
  Tt17Assessment,
  getAssessmentById,
  getGovAssessmentQueue,
  reviewAssessment,
} from "@/services/api/assessment-tt17";
import { GovPageHeader } from "@/components/gov/gov-page-header";
import { resolveProvinceName, resolveSectorName, resolveTt17Classification } from "@/lib/gov-label-resolver";
import { authClient } from "@/lib/auth-client";
import { PROVINCES_34 } from "@/lib/constants/provinces";
import {
  Tt17SurveyDetailView,
  hasRawSurveyForm,
} from "@/components/assessments/tt17-survey-detail-view";

export default function GovAssessmentQueuePage() {
  const [assessments, setAssessments] = useState<Tt17Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScope, setSelectedScope] = useState<string>("");
  const [scopeReady, setScopeReady] = useState(false);
  const [isProvincialLocked, setIsProvincialLocked] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedClassification, setSelectedClassification] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Drawer / Modal Review
  const [reviewingItem, setReviewingItem] = useState<Tt17Assessment | null>(null);
  const [modalTab, setModalTab] = useState<"FORM" | "SCORES">("FORM");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const openReviewModal = (item: Tt17Assessment, tab: "FORM" | "SCORES" = "FORM") => {
    setReviewingItem(item);
    setModalTab(tab);
    setReviewNotes(item.reviewNotes || "");
    setReviewError(null);
    if (typeof window !== "undefined" && !process.env.VITEST && (!item.scoreResult?.criteria || item.scoreResult.criteria.length === 0)) {
      getAssessmentById(item.id)
        .then((full) => {
          if (full) {
            setReviewingItem((prev) => (prev?.id === item.id ? full : prev));
          }
        })
        .catch(() => {});
    }
  };
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const u = authClient.getUser();
    const role = (u?.role || "").toUpperCase();
    const scopeType = (u?.scopeType || "").toUpperCase();
    if (
      (role === "PROVINCIAL_ADMIN" || role === "PROVINCE_LEADER" || role === "PROVINCE_OFFICER" || scopeType === "PROVINCE") &&
      u?.scopeId &&
      u.scopeId !== "GLOBAL" &&
      u.scopeId !== "ALL"
    ) {
      setSelectedScope(u.scopeId.toUpperCase());
      setIsProvincialLocked(true);
    } else if (role === "SUPER_ADMIN" || role === "OPERATOR_ADMIN" || role === "ADMIN" || scopeType === "GLOBAL") {
      setSelectedScope("ALL");
      setIsProvincialLocked(false);
    } else {
      setSelectedScope(u?.scopeId || "ALL");
      setIsProvincialLocked(false);
    }
    setScopeReady(true);
  }, []);

  const fetchQueue = async () => {
    if (!scopeReady) return;
    setLoading(true);
    try {
      const data = await getGovAssessmentQueue(
        selectedScope || undefined,
        selectedStatus === "ALL" ? undefined : selectedStatus
      );
      setAssessments(data);
    } catch (err) {
      console.error("Lỗi khi tải hàng đợi thẩm định:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scopeReady) {
      fetchQueue();
    }
  }, [scopeReady, selectedScope, selectedStatus]);

  const handleAction = async (action: "APPROVE" | "REJECT" | "REQUEST_CHANGES") => {
    if (!reviewingItem) return;
    const trimmedNotes = reviewNotes.trim();

    if (action === "REJECT" || action === "REQUEST_CHANGES") {
      if (!trimmedNotes || trimmedNotes.length < 10) {
        setReviewError("Lý do xử lý bắt buộc phải có ít nhất 10 ký tự hợp lệ theo Quy tắc BR-ADM-004.");
        return;
      }
    }

    setSubmittingReview(true);
    setReviewError(null);
    try {
      const updated = await reviewAssessment(reviewingItem.id, action, trimmedNotes);
      setAssessments((prev) =>
        prev.map((item) => (item.id === reviewingItem.id ? updated : item))
      );
      setReviewingItem(null);
      setReviewNotes("");
      setToastMessage(
        action === "APPROVE"
          ? `Đã phê duyệt và cấp chứng nhận Phụ lục IV cho ${updated.enterpriseName}!`
          : action === "REQUEST_CHANGES"
          ? `Đã gửi yêu cầu bổ sung số liệu tới ${updated.enterpriseName}!`
          : `Đã từ chối hồ sơ của ${updated.enterpriseName}!`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Lỗi khi xử lý thẩm định:", err);
      setReviewError("Đã xảy ra lỗi trong quá trình thẩm định!");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      if (selectedClassification !== "ALL") {
        if (item.scoreResult?.classification !== selectedClassification) return false;
      }
      if (searchTerm) {
        const sectorName = resolveSectorName(item.industryCode);
        const match =
          item.enterpriseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.taxCode.includes(searchTerm) ||
          item.industryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sectorName.toLowerCase().includes(searchTerm.toLowerCase());
        if (!match) return false;
      }
      return true;
    });
  }, [assessments, searchTerm, selectedClassification]);

  // KPI stats
  const kpiStats = useMemo(() => {
    const total = assessments.length;
    const pending = assessments.filter((a) => a.status === "SUBMITTED" || a.status === "IN_REVIEW").length;
    const approved = assessments.filter((a) => a.status === "APPROVED").length;
    const advanced = assessments.filter((a) => a.scoreResult?.classification === "TIEN_TIEN" || a.scoreResult?.classification === "TRUNG_BINH_TIEN_TIEN").length;
    const avgScore = total > 0
      ? (assessments.reduce((acc, a) => acc + (a.scoreResult?.totalScore || 0), 0) / total).toFixed(1)
      : "0.0";
    return { total, pending, approved, advanced, avgScore };
  }, [assessments]);

  const getStatusBadge = (status: Tt17Assessment["status"]) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">Đã duyệt (Phụ lục IV)</span>;
      case "SUBMITTED":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap inline-block bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Chờ thẩm định</span>;
      case "IN_REVIEW":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap inline-block bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">Đang đối soát</span>;
      case "CHANGES_REQUESTED":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap inline-block bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">Yêu cầu bổ sung</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap inline-block bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">Đã từ chối</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap inline-block bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Bản nháp</span>;
    }
  };

  const getClassificationBadge = (cls?: string) => {
    const info = resolveTt17Classification(cls);
    return (
      <span className={`px-2.5 py-0.5 text-xs font-bold rounded border whitespace-nowrap inline-block ${info.badgeClass}`}>
        {info.label.split("(")[0].trim()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-4 py-3 rounded-control shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* GovPageHeader */}
      <GovPageHeader
        breadcrumbs={[
          { label: "Cổng Công Vụ", href: "/gov" },
          { label: "Tổng Quan & Phê Duyệt", href: "/gov" },
          { label: "Hội Đồng Chấm Điểm TT17" },
        ]}
        title="Hội Đồng Chấm Điểm & Thẩm Định TT17"
        subtitle="Tiếp nhận, kiểm tra đối soát số liệu tự kê khai Phụ lục I và phê duyệt cấp Phiếu kết quả Phụ lục IV theo Thông tư 17/2019/TT-BKHCN."
        icon={Award}
        scopeCode={selectedScope}
        slaText="SLA ≤ 48h"
        makerCheckerText="Maker-Checker 2 Cấp"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">Địa bàn:</span>
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                disabled={isProvincialLocked}
                className="form-control-sm"
              >
                {!isProvincialLocked && (
                  <option value="ALL">Toàn quốc (Tất cả Tỉnh/Thành)</option>
                )}
                {PROVINCES_34.filter((p) => p.code !== "ALL").map((prov) => (
                  <option key={prov.code} value={prov.code}>
                    {prov.name} ({prov.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchQueue}
              className="h-10 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-control text-xs font-semibold transition flex items-center gap-1.5 shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Làm mới danh sách"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase">Tổng hồ sơ địa bàn</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{kpiStats.total}</div>
          <div className="text-xs text-slate-500 mt-1">Đã số hóa theo TT17</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-4 shadow-xs">
          <div className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase">Điểm trung bình (τ)</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">{kpiStats.avgScore} <span className="text-sm font-normal text-slate-400">/ 100</span></div>
          <div className="text-xs text-indigo-600 mt-1">Trung bình toàn bộ DN khảo sát</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-4 shadow-xs">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Đã cấp chứng nhận</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{kpiStats.approved}</div>
          <div className="text-xs text-emerald-600 mt-1">Phụ lục IV hợp lệ ({kpiStats.pending} chờ duyệt)</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase">Tiên tiến & TB-Tiên tiến</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{kpiStats.advanced}</div>
          <div className="text-xs text-slate-500 mt-1">τ ≥ 60 & T_ĐB ≥ 0.60</div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm theo tên DN, MST, mã hoặc tên ngành..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control w-full text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Bộ lọc phân loại công nghệ TT17 */}
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="form-control text-xs"
            aria-label="Lọc xếp loại công nghệ"
          >
            <option value="ALL">Tất cả xếp loại</option>
            <option value="TIEN_TIEN">Trình độ Tiên tiến</option>
            <option value="TRUNG_BINH_TIEN_TIEN">Trung bình Tiên tiến</option>
            <option value="TRUNG_BINH">Trình độ Trung bình</option>
            <option value="LAC_HAU">Trình độ Lạc hậu</option>
          </select>

          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: "ALL", label: "Tất cả trạng thái" },
              { id: "SUBMITTED", label: "Chờ thẩm định" },
              { id: "IN_REVIEW", label: "Đang đối soát" },
              { id: "APPROVED", label: "Đã phê duyệt" },
              { id: "CHANGES_REQUESTED", label: "Yêu cầu bổ sung" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedStatus(f.id)}
                className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedStatus === f.id
                    ? "bg-brand-700 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
                <th className="py-3 px-4">Doanh nghiệp / MST</th>
                <th className="py-3 px-4">Địa bàn & Ngành (VSIC)</th>
                <th className="py-3 px-4 text-center">5 Nhóm (T / E / O / R / I)</th>
                <th className="py-3 px-4 text-center">Điểm Tổng (τ)</th>
                <th className="py-3 px-4 text-center">Hệ Số T_ĐB</th>
                <th className="py-3 px-4 text-center">Xếp loại</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải danh sách hồ sơ thẩm định...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Không tìm thấy hồ sơ nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((item) => {
                  const hasRaw = hasRawSurveyForm(item.surveyData, item.hasRawSurvey);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => openReviewModal(item)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-brand-700 transition">
                          {item.enterpriseName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500 dark:text-slate-400">MST: {item.taxCode}</span>
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
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                            {resolveProvinceName(item.scopeId)} ({item.scopeId})
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 inline-block">
                            {item.industryCode}: {resolveSectorName(item.industryCode)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <span title="Nhóm T (Thiết bị - Max 30)">{item.scoreResult?.scoreT ?? 0}</span>
                        {" / "}
                        <span title="Nhóm E (Hiệu quả - Max 20)">{item.scoreResult?.scoreE ?? 0}</span>
                        {" / "}
                        <span title="Nhóm O (Tổ chức - Max 19)">{item.scoreResult?.scoreO ?? 0}</span>
                        {" / "}
                        <span title="Nhóm R (R&D - Max 17)">{item.scoreResult?.scoreR ?? 0}</span>
                        {" / "}
                        <span title="Nhóm I (Đổi mới - Max 14)">{item.scoreResult?.scoreI ?? 0}</span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                          {item.scoreResult?.totalScore ?? "--"}
                        </span>
                        <span className="text-xs text-slate-400">/100</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {item.scoreResult?.syncCoefficient ?? "--"}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getClassificationBadge(item.scoreResult?.classification)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td
                        className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          data-testid="open-review-btn"
                          onClick={() => openReviewModal(item, "SCORES")}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          Xem Form & Thẩm định
                        </button>
                        <Link
                          href={`/assessments/tt17/${item.id}/report`}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition inline-block"
                        >
                          Báo cáo
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thẩm Định / Review Drawer với Scrollbar mượt mà */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-surface max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 p-5 pb-4 bg-slate-50/70 dark:bg-slate-800/40">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    Hồ Sơ Đánh Giá TT17
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                    {resolveProvinceName(reviewingItem.scopeId)} ({reviewingItem.scopeId})
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {reviewingItem.enterpriseName}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  MST: <strong>{reviewingItem.taxCode}</strong> | Ngành: <strong>{reviewingItem.industryCode} ({resolveSectorName(reviewingItem.industryCode)})</strong> | Niên độ: {reviewingItem.assessmentYear}
                </p>
              </div>
              <button
                onClick={() => setReviewingItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-control cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 max-h-[calc(92vh-140px)] scrollbar-thin">
              {/* Data Summary Grid + 5 nhóm */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-surface border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">Tổng điểm (τ):</div>
                  <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {reviewingItem.scoreResult.totalScore} / 100
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Hệ số đồng bộ (T_ĐB):</div>
                  <div className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                    {reviewingItem.scoreResult.syncCoefficient}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Xếp loại TT17:</div>
                  <div className="mt-0.5">{getClassificationBadge(reviewingItem.scoreResult.classification)}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">5 Nhóm (T/E/O/R/I):</div>
                  <div className="text-sm font-mono font-extrabold text-indigo-700 dark:text-indigo-400 mt-0.5">
                    {reviewingItem.scoreResult.scoreT} / {reviewingItem.scoreResult.scoreE} / {reviewingItem.scoreResult.scoreO} / {reviewingItem.scoreResult.scoreR} / {reviewingItem.scoreResult.scoreI}
                  </div>
                </div>
              </div>

              {/* Thanh chuyển Tab: Chi tiết Form Đã Submit vs Ma trận 26 Tiêu chí */}
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
                  2. Bảng Điểm 26 Tiêu Chí & Kết Luận Thẩm Định (Phụ Lục II & IV)
                </button>
              </div>

              {modalTab === "FORM" ? (
                <Tt17SurveyDetailView assessment={reviewingItem} />
              ) : (
                <div className="space-y-5">
                  {/* Breakdown 5 nhóm thành phần công nghệ */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                      Chi tiết 5 nhóm thành phần công nghệ (TT17)
                    </h3>
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                        <div className="text-slate-500">Thiết bị (T)</div>
                        <div className="font-bold text-slate-800 dark:text-white mt-0.5">{reviewingItem.scoreResult.scoreT}/30</div>
                      </div>
                      <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                        <div className="text-slate-500">Hiệu quả (E)</div>
                        <div className="font-bold text-slate-800 dark:text-white mt-0.5">{reviewingItem.scoreResult.scoreE}/20</div>
                      </div>
                      <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                        <div className="text-slate-500">Tổ chức (O)</div>
                        <div className="font-bold text-slate-800 dark:text-white mt-0.5">{reviewingItem.scoreResult.scoreO}/19</div>
                      </div>
                      <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                        <div className="text-slate-500">R&D (R)</div>
                        <div className="font-bold text-slate-800 dark:text-white mt-0.5">{reviewingItem.scoreResult.scoreR}/17</div>
                      </div>
                      <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800">
                        <div className="text-slate-500">Đổi mới (I)</div>
                        <div className="font-bold text-slate-800 dark:text-white mt-0.5">{reviewingItem.scoreResult.scoreI}/14</div>
                      </div>
                    </div>
                  </div>

                  {/* Danh sách 26 tiêu chí */}
                  {reviewingItem.scoreResult.criteria && reviewingItem.scoreResult.criteria.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                        <span>Ma Trận Chi Tiết 26 Tiêu Chí Đánh Giá</span> (TC01 – TC26)
                      </h3>
                      <div className="border border-slate-200 dark:border-slate-800 rounded-control divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {reviewingItem.scoreResult.criteria.map((c) => (
                          <div key={c.code} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-slate-900 dark:text-white">{c.code}: {c.name}</span>
                              <span className="ml-1 text-slate-500 font-normal text-xs">(Nhóm {c.group})</span>
                              {c.isBottleneck && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-rose-100 text-rose-700 font-bold">
                                  Điểm nghẽn
                                </span>
                              )}
                            </div>
                            <div className="shrink-0 font-mono font-bold text-slate-700 dark:text-slate-300">
                              {c.achievedScore} / {c.maxScore} điểm
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review notes input */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ý kiến thẩm định & kết luận của Sở KH&CN:
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => {
                    setReviewNotes(e.target.value);
                    if (reviewError) setReviewError(null);
                  }}
                  placeholder="Ghi rõ nhận xét về số liệu thiết bị, tài chính 3 năm, căn cứ pháp lý để cấp hoặc yêu cầu giải trình (tối thiểu 10 ký tự)..."
                  className="w-full text-xs p-3 border border-slate-300 dark:border-slate-700 rounded-control bg-slate-50 dark:bg-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-white"
                />
                {reviewError && (
                  <p className="text-caption text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{reviewError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setReviewingItem(null)}
                disabled={submittingReview}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-control text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleAction("REQUEST_CHANGES")}
                  disabled={submittingReview}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-control text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Yêu cầu giải trình / Bổ sung
                </button>

                <button
                  type="button"
                  onClick={() => handleAction("REJECT")}
                  disabled={submittingReview}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-control text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Từ chối hồ sơ
                </button>

                <button
                  type="button"
                  onClick={() => handleAction("APPROVE")}
                  disabled={submittingReview}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-control text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {submittingReview ? "Đang xử lý..." : "Duyệt & Cấp Phụ lục IV"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
