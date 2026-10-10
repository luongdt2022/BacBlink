"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Tt17Assessment,
  getGovAssessmentQueue,
  reviewAssessment,
} from "@/services/api/assessment-tt17";

export default function GovAssessmentQueuePage() {
  const [assessments, setAssessments] = useState<Tt17Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScope, setSelectedScope] = useState<string>("HP");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Drawer / Modal Review
  const [reviewingItem, setReviewingItem] = useState<Tt17Assessment | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchQueue = async () => {
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
    fetchQueue();
  }, [selectedScope, selectedStatus]);

  const handleAction = async (action: "APPROVE" | "REJECT" | "REQUEST_CHANGES") => {
    if (!reviewingItem) return;
    setSubmittingReview(true);
    try {
      const updated = await reviewAssessment(reviewingItem.id, action, reviewNotes);
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
      alert("Đã xảy ra lỗi trong quá trình thẩm định!");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      if (searchTerm) {
        const match =
          item.enterpriseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.taxCode.includes(searchTerm) ||
          item.industryCode.toLowerCase().includes(searchTerm.toLowerCase());
        if (!match) return false;
      }
      return true;
    });
  }, [assessments, searchTerm]);

  // KPI stats
  const kpiStats = useMemo(() => {
    const total = assessments.length;
    const pending = assessments.filter((a) => a.status === "SUBMITTED" || a.status === "IN_REVIEW").length;
    const approved = assessments.filter((a) => a.status === "APPROVED").length;
    const advanced = assessments.filter((a) => a.scoreResult?.classification === "TIEN_TIEN").length;
    return { total, pending, approved, advanced };
  }, [assessments]);

  const getStatusBadge = (status: Tt17Assessment["status"]) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Đã duyệt (Phụ lục IV)</span>;
      case "SUBMITTED":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Chờ thẩm định</span>;
      case "IN_REVIEW":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">Đang đối soát</span>;
      case "CHANGES_REQUESTED":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">Yêu cầu bổ sung</span>;
      case "REJECTED":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">Đã từ chối</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">Bản nháp</span>;
    }
  };

  const getClassificationBadge = (cls?: string) => {
    switch (cls) {
      case "TIEN_TIEN":
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800">Tiên tiến</span>;
      case "TRUNG_BINH_TIEN_TIEN":
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-teal-100 text-teal-800">Trung bình TT</span>;
      case "TRUNG_BINH":
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800">Trung bình</span>;
      case "CAN_THAM_DINH":
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">Cần thẩm định HĐ</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-100 text-rose-800">Lạc hậu</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
            <svg className="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800">Cổng Quản Lý Nhà Nước</span>
              <h1 className="text-lg font-bold text-slate-800">
                Thẩm Định Hồ Sơ Đánh Giá Công Nghệ (Thông tư 17/2019/TT-BKHCN)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tiếp nhận, kiểm tra đối soát số liệu tự kê khai Phụ lục I và phê duyệt cấp Phiếu kết quả Phụ lục IV
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Địa bàn quản lý:</span>
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                className="bg-white text-xs font-bold text-slate-800 px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="HP">Sở KH&CN TP. Hải Phòng</option>
                <option value="HN">Sở KH&CN TP. Hà Nội</option>
                <option value="HCM">Sở KH&CN TP. Hồ Chí Minh</option>
                <option value="DN">Sở KH&CN TP. Đà Nẵng</option>
              </select>
            </div>

            <button
              onClick={fetchQueue}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              title="Làm mới danh sách"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500 uppercase">Tổng hồ sơ địa bàn</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{kpiStats.total}</div>
            <div className="text-xs text-slate-500 mt-1">Đã số hóa theo TT17</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-medium text-amber-700 uppercase">Hồ sơ chờ thẩm định</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{kpiStats.pending}</div>
            <div className="text-xs text-amber-600 mt-1">Cần chuyên viên đối soát</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-medium text-emerald-700 uppercase">Đã cấp chứng nhận</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{kpiStats.approved}</div>
            <div className="text-xs text-emerald-600 mt-1">Phụ lục IV hợp lệ</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500 uppercase">Doanh nghiệp Tiên tiến</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{kpiStats.advanced}</div>
            <div className="text-xs text-slate-500 mt-1">τ ≥ 75 & T_ĐB ≥ 0.65</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Tìm theo tên DN, MST, mã ngành..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {[
              { id: "ALL", label: "Tất cả" },
              { id: "SUBMITTED", label: "Chờ thẩm định" },
              { id: "IN_REVIEW", label: "Đang đối soát" },
              { id: "APPROVED", label: "Đã phê duyệt" },
              { id: "CHANGES_REQUESTED", label: "Yêu cầu bổ sung" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedStatus(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedStatus === f.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
                  <th className="py-3 px-4">Doanh nghiệp / MST</th>
                  <th className="py-3 px-4">Ngành cấp 2</th>
                  <th className="py-3 px-4 text-center">Năm</th>
                  <th className="py-3 px-4 text-center">Điểm Tổng (τ)</th>
                  <th className="py-3 px-4 text-center">Hệ Số T_ĐB</th>
                  <th className="py-3 px-4 text-center">Xếp loại</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
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
                  filteredAssessments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{item.enterpriseName}</div>
                        <div className="text-xs text-slate-500">MST: {item.taxCode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {item.industryCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700">
                        {item.assessmentYear}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-emerald-700 text-sm">
                          {item.scoreResult?.totalScore ?? "--"}
                        </span>
                        <span className="text-xs text-slate-400">/100</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {item.scoreResult?.syncCoefficient ?? "--"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getClassificationBadge(item.scoreResult?.classification)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          data-testid="open-review-btn"
                          onClick={() => {
                            setReviewingItem(item);
                            setReviewNotes(item.reviewNotes || "");
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold shadow-xs transition"
                        >
                          Thẩm định
                        </button>
                        <Link
                          href={`/assessments/tt17/${item.id}/report`}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition inline-block"
                        >
                          Báo cáo
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Thẩm Định / Review Drawer */}
        {reviewingItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-6">
              
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                      Hồ Sơ Đánh Giá TT17
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      {reviewingItem.enterpriseName}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    MST: {reviewingItem.taxCode} | Ngành: {reviewingItem.industryCode} | Niên độ: {reviewingItem.assessmentYear}
                  </p>
                </div>
                <button
                  onClick={() => setReviewingItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">Tổng điểm (τ):</div>
                  <div className="text-base font-extrabold text-emerald-700 mt-0.5">{reviewingItem.scoreResult.totalScore} / 100</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Hệ số đồng bộ (T_ĐB):</div>
                  <div className="text-base font-extrabold text-slate-800 mt-0.5">{reviewingItem.scoreResult.syncCoefficient}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Xếp loại dự kiến:</div>
                  <div className="mt-0.5">{getClassificationBadge(reviewingItem.scoreResult.classification)}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Số điểm nghẽn:</div>
                  <div className="text-base font-extrabold text-rose-600 mt-0.5">
                    {reviewingItem.scoreResult.bottlenecks?.length || 0} tiêu chí
                  </div>
                </div>
              </div>

              {/* Breakdown 5 components */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-slate-700">Chi tiết 5 nhóm thành phần công nghệ</h3>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-slate-100">
                    <div className="text-slate-500">Thiết bị (T)</div>
                    <div className="font-bold text-slate-800 mt-0.5">{reviewingItem.scoreResult.scoreT}/30</div>
                  </div>
                  <div className="p-2 rounded bg-slate-100">
                    <div className="text-slate-500">Hiệu quả (E)</div>
                    <div className="font-bold text-slate-800 mt-0.5">{reviewingItem.scoreResult.scoreE}/20</div>
                  </div>
                  <div className="p-2 rounded bg-slate-100">
                    <div className="text-slate-500">Tổ chức (O)</div>
                    <div className="font-bold text-slate-800 mt-0.5">{reviewingItem.scoreResult.scoreO}/19</div>
                  </div>
                  <div className="p-2 rounded bg-slate-100">
                    <div className="text-slate-500">R&D (R)</div>
                    <div className="font-bold text-slate-800 mt-0.5">{reviewingItem.scoreResult.scoreR}/17</div>
                  </div>
                  <div className="p-2 rounded bg-slate-100">
                    <div className="text-slate-500">Đổi mới (I)</div>
                    <div className="font-bold text-slate-800 mt-0.5">{reviewingItem.scoreResult.scoreI}/14</div>
                  </div>
                </div>
              </div>

              {/* Review notes input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Ý kiến thẩm định & kết luận của Sở KH&CN:
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Ghi rõ nhận xét về số liệu thiết bị, tài chính 3 năm, căn cứ pháp lý để cấp hoặc yêu cầu giải trình..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  disabled={submittingReview}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Đóng
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleAction("REQUEST_CHANGES")}
                    disabled={submittingReview}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    Yêu cầu giải trình / Bổ sung
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction("REJECT")}
                    disabled={submittingReview}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    Từ chối hồ sơ
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction("APPROVE")}
                    disabled={submittingReview}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    {submittingReview ? "Đang xử lý..." : "Duyệt & Cấp Phụ lục IV"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
