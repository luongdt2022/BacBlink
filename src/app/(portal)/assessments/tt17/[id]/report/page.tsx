"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Tt17Assessment,
  getAssessmentById,
  CriterionScore,
} from "@/services/api/assessment-tt17";
import { Tt17SurveyDetailView } from "@/components/assessments/tt17-survey-detail-view";
import { BlockchainZkpBadge } from "@/components/blockchain/BlockchainZkpBadge";

export default function AssessmentReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [assessment, setAssessment] = useState<Tt17Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "T" | "E" | "O" | "R" | "I">("ALL");
  const [viewMode, setViewMode] = useState<"ANALYTICS" | "APPENDIX_IV">("ANALYTICS");

  const handleExportWord = async () => {
    if (!assessment || isExportingWord) return;
    try {
      setIsExportingWord(true);
      const { exportTt17SurveyDocx, downloadDocxBlob } = await import("@/services/survey-docx-exporter");
      const blob = await exportTt17SurveyDocx(assessment);
      const safeTax = (assessment.taxCode || assessment.surveyData?.taxCode || "DN").replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      );
      downloadDocxBlob(blob, `phieu_thu_thap_tt17_out_${safeTax}.docx`);
    } catch (err) {
      console.error("Lỗi khi xuất Word TT17:", err);
    } finally {
      setIsExportingWord(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getAssessmentById(id || "current");
        setAssessment(data);
      } catch (err) {
        console.error("Lỗi khi tải báo cáo đánh giá:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Đang khởi tạo báo cáo đánh giá TT17...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Không tìm thấy hồ sơ đánh giá</h2>
          <p className="text-sm text-slate-600 mb-6">Mã hồ sơ không tồn tại hoặc bạn không có quyền truy cập báo cáo này.</p>
          <Link
            href="/assessments/tt17"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
          >
            Quay lại Tổng quan
          </Link>
        </div>
      </div>
    );
  }

  const { scoreResult, surveyData } = assessment;

  const getStatusBadge = (status: Tt17Assessment["status"]) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Đã phê duyệt (Sở KH&CN)</span>;
      case "SUBMITTED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Đã gửi thẩm định</span>;
      case "IN_REVIEW":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Đang đối soát</span>;
      case "CHANGES_REQUESTED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">Yêu cầu bổ sung số liệu</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">Bản nháp nội bộ</span>;
    }
  };

  const getClassificationBadge = (cls: string) => {
    switch (cls) {
      case "TIEN_TIEN":
        return {
          bg: "bg-emerald-50 border-emerald-300 text-emerald-900",
          pill: "bg-emerald-600 text-white",
          desc: "Đạt trình độ công nghệ tiên tiến (Tổng điểm ≥ 75 & Hệ số đồng bộ ≥ 0.65). Doanh nghiệp sở hữu dây chuyền tự động hóa cao, làm chủ công nghệ và có năng lực R&D vượt trội.",
        };
      case "TRUNG_BINH_TIEN_TIEN":
        return {
          bg: "bg-teal-50 border-teal-300 text-teal-900",
          pill: "bg-teal-600 text-white",
          desc: "Đạt trình độ trung bình tiên tiến (Tổng điểm 60 - <75 & Hệ số đồng bộ ≥ 0.50). Thiết bị hiện đại và năng suất tốt nhưng cần thúc đẩy hơn ở mảng tài sản trí tuệ và sáng kiến.",
        };
      case "TRUNG_BINH":
        return {
          bg: "bg-amber-50 border-amber-300 text-amber-900",
          pill: "bg-amber-600 text-white",
          desc: "Đạt trình độ trung bình (Tổng điểm 35 - <60 & Hệ số đồng bộ ≥ 0.30). Cần hiện đại hóa thiết bị công nghệ và đào tạo chuyên sâu nhân lực kỹ thuật.",
        };
      case "CAN_THAM_DINH":
        return {
          bg: "bg-amber-50 border-amber-300 text-amber-900",
          pill: "bg-amber-600 text-white",
          desc: "Lệch pha đồng bộ công nghệ (Điểm tổng cao nhưng Hệ số đồng bộ T_ĐB thấp). Cần Hội đồng chuyên gia Sở KH&CN thẩm định trực tiếp dây chuyền thực tế.",
        };
      default:
        return {
          bg: "bg-rose-50 border-rose-300 text-rose-900",
          pill: "bg-rose-600 text-white",
          desc: "Trình độ công nghệ lạc hậu (Tổng điểm < 35 hoặc Hệ số đồng bộ < 0.30). Cần thay thế cấp bách dây chuyền lạc hậu để tránh rủi ro tiêu hao năng lượng và ô nhiễm.",
        };
    }
  };

  const classInfo = getClassificationBadge(scoreResult.classification);

  const filteredCriteria = activeTab === "ALL"
    ? scoreResult.criteria
    : scoreResult.criteria.filter((c) => c.group === activeTab);

  const bottleneckList = scoreResult.criteria.filter((c) => c.isBottleneck);

  // SVG Radar Chart calculations
  const radarDimensions = [
    { label: "T - Thiết bị (30đ)", value: scoreResult.scoreT, max: 30, angle: 0 },
    { label: "E - Hiệu quả (20đ)", value: scoreResult.scoreE, max: 20, angle: 72 },
    { label: "O - Tổ chức (19đ)", value: scoreResult.scoreO, max: 19, angle: 144 },
    { label: "R - R&D (17đ)", value: scoreResult.scoreR, max: 17, angle: 216 },
    { label: "I - Đổi mới (14đ)", value: scoreResult.scoreI, max: 14, angle: 288 },
  ];

  const centerX = 160;
  const centerY = 160;
  const maxRadius = 110;

  const getCoordinates = (angleDeg: number, radius: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad),
    };
  };

  const dataPoints = radarDimensions.map((d) => {
    const ratio = Math.min(1, Math.max(0, d.value / d.max));
    const r = ratio * maxRadius;
    return getCoordinates(d.angle, r);
  });

  const polygonPath = dataPoints.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href="/assessments/tt17"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Quay lại danh sách"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-slate-800">Báo Cáo Đánh Giá Trình Độ Công Nghệ</h1>
                {getStatusBadge(assessment.status)}
                <BlockchainZkpBadge
                  entityType="TT17_ASSESSMENT"
                  entityId={assessment.id}
                  entityCode={assessment.taxCode}
                />
              </div>
              <p className="text-xs text-slate-500">
                {assessment.enterpriseName} | MST: {assessment.taxCode} | Niên độ: {assessment.assessmentYear} | Mã ngành: {assessment.industryCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setViewMode(viewMode === "ANALYTICS" ? "APPENDIX_IV" : "ANALYTICS")}
              className="flex-1 sm:flex-none px-3.5 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {viewMode === "ANALYTICS" ? "Xem Mẫu Phụ Lục IV (In)" : "Xem Phân Tích Đồ Thị"}
            </button>

            <button
              onClick={handleExportWord}
              disabled={isExportingWord}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isExportingWord ? "Đang xuất..." : "Xuất Word (.docx)"}
            </button>

            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In Phiếu Kết Quả
            </button>
          </div>
        </div>

        {viewMode === "ANALYTICS" ? (
          <>
            {/* Classification & Summary Banner */}
            <div className={`p-6 rounded-xl border ${classInfo.bg} shadow-sm space-y-4`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Kết luận xếp loại</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${classInfo.pill}`}>
                      {scoreResult.classificationLabel}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-slate-700 leading-relaxed max-w-3xl">{classInfo.desc}</p>
                </div>

                <div className="flex items-center gap-6 bg-white/80 p-3.5 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Điểm Tổng (τ)</div>
                    <div className="text-2xl font-black text-emerald-700">{scoreResult.totalScore} <span className="text-xs font-medium text-slate-500">/ 100</span></div>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Hệ Số Đồng Bộ (T_ĐB)</div>
                    <div className="text-2xl font-black text-slate-800">{scoreResult.syncCoefficient}</div>
                  </div>
                </div>
              </div>

              {/* 5 Component Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {[
                  { label: "Nhóm T - Thiết bị", val: scoreResult.scoreT, max: 30, pct: Math.round((scoreResult.scoreT / 30) * 100) },
                  { label: "Nhóm E - Hiệu quả", val: scoreResult.scoreE, max: 20, pct: Math.round((scoreResult.scoreE / 20) * 100) },
                  { label: "Nhóm O - Tổ chức", val: scoreResult.scoreO, max: 19, pct: Math.round((scoreResult.scoreO / 19) * 100) },
                  { label: "Nhóm R - Năng lực R&D", val: scoreResult.scoreR, max: 17, pct: Math.round((scoreResult.scoreR / 17) * 100) },
                  { label: "Nhóm I - Đổi mới ST", val: scoreResult.scoreI, max: 14, pct: Math.round((scoreResult.scoreI / 14) * 100) },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/90 p-3 rounded-lg border border-slate-200">
                    <div className="text-xs font-medium text-slate-600 truncate">{item.label}</div>
                    <div className="text-base font-bold text-slate-800 mt-0.5">
                      {item.val} <span className="text-xs font-normal text-slate-500">/{item.max}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Chart & Bottlenecks Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Radar Chart Card */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-slate-800">Biểu Đồ Radar 5 Nhóm Thành Phần</h2>
                  <span className="text-xs text-slate-500">Chuẩn hóa 5 trục</span>
                </div>

                <div className="relative w-80 h-80 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 320 320">
                    {/* Concentric Grid Polygons */}
                    {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, lIdx) => {
                      const r = level * maxRadius;
                      const gridPts = radarDimensions
                        .map((d) => getCoordinates(d.angle, r))
                        .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                        .join(" ") + " Z";
                      return (
                        <path
                          key={lIdx}
                          d={gridPts}
                          fill={lIdx === 4 ? "#f8fafc" : "none"}
                          stroke="#cbd5e1"
                          strokeWidth={lIdx === 4 ? "1.5" : "0.75"}
                          strokeDasharray={lIdx === 4 ? "none" : "2 2"}
                        />
                      );
                    })}

                    {/* Spokes */}
                    {radarDimensions.map((d, sIdx) => {
                      const endPt = getCoordinates(d.angle, maxRadius);
                      return (
                        <line
                          key={sIdx}
                          x1={centerX}
                          y1={centerY}
                          x2={endPt.x}
                          y2={endPt.y}
                          stroke="#cbd5e1"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Value Polygon */}
                    <path
                      d={polygonPath}
                      fill="rgba(16, 185, 129, 0.25)"
                      stroke="#059669"
                      strokeWidth="2.5"
                    />

                    {/* Data Points */}
                    {dataPoints.map((p, pIdx) => (
                      <circle
                        key={pIdx}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="#059669"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* Labels */}
                    {radarDimensions.map((d, lIdx) => {
                      const labelPt = getCoordinates(d.angle, maxRadius + 22);
                      return (
                        <text
                          key={lIdx}
                          x={labelPt.x}
                          y={labelPt.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="text-xs font-semibold fill-slate-700"
                        >
                          {d.label.split(" - ")[0]} ({d.value}/{d.max})
                        </text>
                      );
                    })}
                  </svg>
                </div>

                <div className="mt-3 text-center text-xs text-slate-500">
                  <p>Màu xanh biểu thị vùng năng lực hiện tại của doanh nghiệp so với chuẩn 100%.</p>
                </div>
              </div>

              {/* Technology Bottlenecks & Demand Bridge */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" />
                      Chuẩn Đoán Điểm Nghẽn Công Nghệ & Khuyến Nghị Nâng Cấp
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Các tiêu chí đạt dưới 40% điểm tối đa cần ưu tiên tìm kiếm giải pháp chuyển giao hoặc tư vấn
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    {bottleneckList.length} điểm nghẽn
                  </span>
                </div>

                {bottleneckList.length === 0 ? (
                  <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-lg">
                    <svg className="w-10 h-10 text-emerald-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-bold text-emerald-800">Không có điểm nghẽn nghiêm trọng</h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      Dây chuyền và các chỉ số vận hành của doanh nghiệp đều đạt từ mức 40% trở lên.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {bottleneckList.map((bn) => (
                      <div
                        key={bn.code}
                        className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-200 text-rose-900">
                              {bn.code}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{bn.name}</span>
                          </div>
                          <div className="text-xs font-semibold text-rose-700 whitespace-nowrap">
                            Đạt: {bn.achievedScore} / {bn.maxScore}đ ({(bn.achievedScore / bn.maxScore * 100).toFixed(0)}%)
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 bg-white p-2 rounded border border-rose-100">
                          <strong className="text-slate-700">Khuyến nghị: </strong> {bn.recommendation}
                        </p>

                        {/* Bridge CTA button to TASK-03 */}
                        <div className="flex items-center justify-end pt-1">
                          <Link
                            href={`/portal/buyer/demands?source=tt17_bottleneck&criterionCode=${encodeURIComponent(bn.code)}&title=${encodeURIComponent(`Tìm giải pháp khắc phục điểm nghẽn ${bn.name} (${bn.code})`)}&sector=${encodeURIComponent(assessment.industryCode)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Đăng Bài Toán Tìm Mua Giải Pháp (TASK-03)
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Appendix I: Submitted Survey Form Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-sm font-bold text-slate-800">
                  Hồ Sơ Dữ Liệu Khảo Sát Doanh Nghiệp Đã Submit (Phụ Lục I - TT17)
                </h2>
                <p className="text-xs text-slate-500">
                  Chi tiết từng chỉ số đầu vào theo 6 mục của Phiếu thu thập thông tin trình độ công nghệ
                </p>
              </div>
              <Tt17SurveyDetailView assessment={assessment} />
            </div>

            {/* Appendix II: Detail 26 Criteria Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Bảng Điểm Chi Tiết 26 Tiêu Chí Đánh Giá (Phụ Lục II - TT17)
                  </h2>
                  <p className="text-xs text-slate-500">Đối chiếu thang điểm quy chuẩn theo Thông tư 17/2019/TT-BKHCN</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                  {(["ALL", "T", "E", "O", "R", "I"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 rounded-md transition ${
                        activeTab === tab
                          ? "bg-white text-emerald-700 shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab === "ALL" ? "Tất cả (26)" : `Nhóm ${tab}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
                      <th className="py-2.5 px-3">Mã TC</th>
                      <th className="py-2.5 px-3">Nhóm</th>
                      <th className="py-2.5 px-3">Nội dung Tiêu chí</th>
                      <th className="py-2.5 px-3 text-center">Điểm Tối Đa</th>
                      <th className="py-2.5 px-3 text-center">Điểm Đạt</th>
                      <th className="py-2.5 px-3 text-center">Tỷ lệ</th>
                      <th className="py-2.5 px-3">Đánh giá / Khuyến nghị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCriteria.map((cr) => {
                      const pct = Math.round((cr.achievedScore / cr.maxScore) * 100);
                      return (
                        <tr
                          key={cr.code}
                          className={`hover:bg-slate-50/80 transition ${cr.isBottleneck ? "bg-rose-50/30" : ""}`}
                        >
                          <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">{cr.code}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                              Nhóm {cr.group}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{cr.name}</td>
                          <td className="py-2.5 px-3 text-center font-semibold text-slate-500">{cr.maxScore}đ</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{cr.achievedScore}đ</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                cr.isBottleneck
                                  ? "bg-rose-100 text-rose-800"
                                  : pct >= 80
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {cr.isBottleneck ? (
                              <span className="text-rose-700 font-semibold">{cr.recommendation}</span>
                            ) : (
                              cr.recommendation
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* APPENDIX IV PRINT VIEW */
          <div className="bg-white border border-slate-300 rounded-xl p-10 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
            
            {/* National Emblem & Form Header */}
            <div className="text-center space-y-1 border-b-2 border-slate-800 pb-6">
              <div className="text-xs uppercase font-bold tracking-wider text-slate-700">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-xs font-semibold text-slate-600 underline underline-offset-4">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="pt-4 text-base font-extrabold text-slate-900 uppercase">
                PHIẾU ĐÁNH GIÁ KẾT QUẢ TRÌNH ĐỘ VÀ NĂNG LỰC CÔNG NGHỆ SẢN XUẤT
              </div>
              <div className="text-xs italic text-slate-500">
                (Ban hành kèm theo Thông tư số 17/2019/TT-BKHCN ngày 10/12/2019 của Bộ trưởng Bộ KH&CN)
              </div>
            </div>

            {/* Enterprise Information */}
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-800">
              <div>
                <p><strong>1. Tên doanh nghiệp: </strong>{assessment.enterpriseName}</p>
                <p className="mt-1"><strong>2. Mã số thuế: </strong>{assessment.taxCode}</p>
                <p className="mt-1"><strong>3. Địa chỉ trụ sở: </strong>{surveyData.companyAddress}</p>
              </div>
              <div>
                <p><strong>4. Ngành kinh tế cấp 2: </strong>Mã {assessment.industryCode}</p>
                <p className="mt-1"><strong>5. Tổng số lao động: </strong>{surveyData.totalWorkforce} người</p>
                <p className="mt-1"><strong>6. Niên độ đánh giá: </strong>Năm {assessment.assessmentYear}</p>
              </div>
            </div>

            {/* Summary Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-800">BẢNG KẾT QUẢ TÍNH TOÁN 5 NHÓM TIÊU CHÍ (PHỤ LỤC II)</h3>
              <table className="w-full text-xs border border-slate-300 border-collapse text-left">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300">STT</th>
                    <th className="p-2 border-r border-slate-300">Nhóm thành phần công nghệ</th>
                    <th className="p-2 border-r border-slate-300 text-center">Trọng số tối đa</th>
                    <th className="p-2 border-r border-slate-300 text-center">Điểm đạt được</th>
                    <th className="p-2 text-center">Tỷ lệ %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 border-r border-slate-300 text-center font-semibold">1</td>
                    <td className="p-2 border-r border-slate-300 font-medium">Nhóm T - Trình độ thiết bị, công nghệ</td>
                    <td className="p-2 border-r border-slate-300 text-center">30.00</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold text-emerald-800">{scoreResult.scoreT}</td>
                    <td className="p-2 text-center">{((scoreResult.scoreT / 30) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 text-center font-semibold">2</td>
                    <td className="p-2 border-r border-slate-300 font-medium">Nhóm E - Hiệu quả khai thác công nghệ</td>
                    <td className="p-2 border-r border-slate-300 text-center">20.00</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold text-emerald-800">{scoreResult.scoreE}</td>
                    <td className="p-2 text-center">{((scoreResult.scoreE / 20) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 text-center font-semibold">3</td>
                    <td className="p-2 border-r border-slate-300 font-medium">Nhóm O - Năng lực tổ chức, quản lý</td>
                    <td className="p-2 border-r border-slate-300 text-center">19.00</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold text-emerald-800">{scoreResult.scoreO}</td>
                    <td className="p-2 text-center">{((scoreResult.scoreO / 19) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 text-center font-semibold">4</td>
                    <td className="p-2 border-r border-slate-300 font-medium">Nhóm R - Năng lực nghiên cứu phát triển (R&D)</td>
                    <td className="p-2 border-r border-slate-300 text-center">17.00</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold text-emerald-800">{scoreResult.scoreR}</td>
                    <td className="p-2 text-center">{((scoreResult.scoreR / 17) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-300 text-center font-semibold">5</td>
                    <td className="p-2 border-r border-slate-300 font-medium">Nhóm I - Năng lực đổi mới sáng tạo</td>
                    <td className="p-2 border-r border-slate-300 text-center">14.00</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold text-emerald-800">{scoreResult.scoreI}</td>
                    <td className="p-2 text-center">{((scoreResult.scoreI / 14) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={2} className="p-2 border-r border-slate-300 uppercase">
                      Tổng điểm tổng hợp (τ) & Hệ số đồng bộ (T_ĐB)
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center">100.00</td>
                    <td className="p-2 border-r border-slate-300 text-center text-emerald-900 font-black">
                      {scoreResult.totalScore}
                    </td>
                    <td className="p-2 text-center text-slate-800 font-black">
                      T_ĐB: {scoreResult.syncCoefficient}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Conclusion */}
            <div className="p-4 border border-slate-300 rounded bg-slate-50 text-xs space-y-1.5">
              <p>
                <strong>KẾT LUẬN XẾP LOẠI: </strong>
                <span className="font-extrabold uppercase text-emerald-900 underline">
                  {scoreResult.classificationLabel}
                </span>
              </p>
              <p className="text-slate-600 italic">
                Căn cứ theo Điều 9 Thông tư 17/2019/TT-BKHCN, doanh nghiệp đáp ứng đầy đủ điều kiện xếp loại tương ứng với tổng điểm và hệ số đồng bộ đạt được.
              </p>
              {assessment.reviewNotes && (
                <p className="text-slate-700 pt-1">
                  <strong>Ý kiến cơ quan quản lý (Sở KH&CN): </strong>{assessment.reviewNotes}
                </p>
              )}
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
              <div>
                <p className="font-bold uppercase">ĐẠI DIỆN DOANH NGHIỆP</p>
                <p className="italic text-slate-500">(Ký tên, đóng dấu và ghi rõ họ tên)</p>
                <div className="h-24" />
                <p className="font-semibold text-slate-800">{assessment.enterpriseName}</p>
              </div>

              <div>
                <p className="italic text-slate-600">Ngày ..... tháng ..... năm 20....</p>
                <p className="font-bold uppercase mt-1">CƠ QUAN THẨM ĐỊNH (SỞ KH&CN)</p>
                <p className="italic text-slate-500">(Ký tên, đóng dấu xác nhận)</p>
                <div className="h-24" />
                <p className="font-semibold text-slate-800">
                  {assessment.status === "APPROVED" ? "ĐÃ XÁC NHẬN ĐIỆN TỬ" : "CHƯA PHÊ DUYỆT"}
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
