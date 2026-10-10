"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppButton } from "@/components/ui/design-system";
import { Async, UXState } from "@/components/ui/async";
import {
  Tt17Assessment,
  getAssessmentHistory,
} from "@/services/api/assessment-tt17";
import {
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  History,
  FileCheck2,
  FileText,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AssessmentDashboardPage() {
  const [uxState, setUxState] = useState<UXState>("loading");
  const [history, setHistory] = useState<Tt17Assessment[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setUxState("loading");
        const list = await getAssessmentHistory();
        setHistory(list);
        setUxState(list.length === 0 ? "empty" : "success");
      } catch {
        setUxState("error");
      }
    }
    loadData();
  }, []);

  const latest = history[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-xs mb-2 border border-emerald-200 dark:border-emerald-800">
            <Award className="w-3.5 h-3.5" />
            <span>Thông Tư 17/2019/TT-BKHCN</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Đánh Giá Trình Độ & Năng Lực Công Nghệ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Tự chẩn đoán 26 tiêu chí (5 nhóm T-E-O-R-I), đo lường hệ số đồng bộ $T_{"ĐB"}$ và nhận diện điểm nghẽn công nghệ cho doanh nghiệp sản xuất chế biến, chế tạo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/assessments/tt17/wizard">
            <AppButton variant="primary">
              <Sparkles className="w-4 h-4 mr-2" />
              Bắt Đầu Kê Khai Mới
            </AppButton>
          </Link>
        </div>
      </div>

      <Async
        state={uxState}
        onRetry={() => getAssessmentHistory().then(setHistory)}
        emptyContent={
          <div className="p-8 text-center text-slate-500">
            Doanh nghiệp chưa có kỳ đánh giá nào. Bấm 'Bắt Đầu Kê Khai Mới' để khởi tạo.
          </div>
        }
      >
        {latest && (
          <div className="space-y-8">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Điểm tổng */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                  <span>Tổng Điểm Đánh Giá (&tau;)</span>
                  <Award className="w-4 h-4 text-brand-700" />
                </div>
                <div className="my-3">
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {latest.scoreResult.totalScore}
                    <span className="text-base font-normal text-slate-500"> / 100</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Tổng hợp từ 26 tiêu chí Phụ lục II
                </div>
              </div>

              {/* Hệ số đồng bộ */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                  <span>Hệ Số Đồng Bộ (T_ĐB)</span>
                  <Layers className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="my-3">
                  <div className="text-4xl font-extrabold text-emerald-600">
                    {latest.scoreResult.syncCoefficient}
                    <span className="text-base font-normal text-slate-500"> / 1.0</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Mức độ cân đối giữa thiết bị, quản trị & R&D
                </div>
              </div>

              {/* Phân loại */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                  <span>Xếp Loại Trình Độ</span>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <div className="my-3">
                  <span
                    className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold ${
                      latest.scoreResult.classification === "TIEN_TIEN"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : latest.scoreResult.classification === "TRUNG_BINH_TIEN_TIEN"
                        ? "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300"
                        : latest.scoreResult.classification === "TRUNG_BINH"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {latest.scoreResult.classificationLabel}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Căn cứ Điều 9 Thông tư 17
                </div>
              </div>

              {/* Kỳ đánh giá */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                  <span>Kỳ Đánh Giá Hiện Tại</span>
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div className="my-3">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Năm {latest.assessmentYear}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {latest.status}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Mã ngành: <span className="font-semibold text-slate-700 dark:text-slate-300">{latest.industryCode}</span>
                </div>
              </div>
            </div>

            {/* Chi tiết 5 Nhóm Điểm Thành Phần */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Cơ Cấu Điểm 5 Nhóm Tiêu Chí (T - E - O - R - I)</span>
                <Link
                  href={`/assessments/tt17/${latest.id}/report`}
                  className="text-xs font-semibold text-brand-700 hover:underline flex items-center gap-1"
                >
                  Xem Báo Cáo Chi Tiết Phụ Lục II & IV
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* T */}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Nhóm T · Thiết Bị
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {latest.scoreResult.scoreT}
                    <span className="text-xs font-normal text-slate-500"> / 30đ</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-brand-700 h-full rounded-full"
                      style={{ width: `${(latest.scoreResult.scoreT / 30) * 100}%` }}
                    />
                  </div>
                </div>

                {/* E */}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Nhóm E · Khai Thác
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {latest.scoreResult.scoreE}
                    <span className="text-xs font-normal text-slate-500"> / 20đ</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${(latest.scoreResult.scoreE / 20) * 100}%` }}
                    />
                  </div>
                </div>

                {/* O */}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Nhóm O · Quản Trị
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {latest.scoreResult.scoreO}
                    <span className="text-xs font-normal text-slate-500"> / 19đ</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full"
                      style={{ width: `${(latest.scoreResult.scoreO / 19) * 100}%` }}
                    />
                  </div>
                </div>

                {/* R */}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Nhóm R · Nghiên Cứu
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {latest.scoreResult.scoreR}
                    <span className="text-xs font-normal text-slate-500"> / 17đ</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-rose-600 h-full rounded-full"
                      style={{ width: `${(latest.scoreResult.scoreR / 17) * 100}%` }}
                    />
                  </div>
                </div>

                {/* I */}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Nhóm I · Đổi Mới ST
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {latest.scoreResult.scoreI}
                    <span className="text-xs font-normal text-slate-500"> / 14đ</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full"
                      style={{ width: `${(latest.scoreResult.scoreI / 14) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bảng Lịch Sử Các Kỳ Đánh Giá (Yearly Snapshots) */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Lịch Sử Kỳ Đánh Giá (Yearly Snapshots)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Lưu trữ bất biến phục vụ thanh tra và đối soát
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4">Năm Đánh Giá</th>
                      <th className="px-6 py-4">Mã Ngành</th>
                      <th className="px-6 py-4">Điểm Tổng (&tau;)</th>
                      <th className="px-6 py-4">Hệ Số T_ĐB</th>
                      <th className="px-6 py-4">Xếp Loại</th>
                      <th className="px-6 py-4">Trạng Thái</th>
                      <th className="px-6 py-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          Năm {item.assessmentYear}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {item.industryCode}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          {item.scoreResult.totalScore}
                        </td>
                        <td className="px-6 py-4 text-emerald-600 font-semibold">
                          {item.scoreResult.syncCoefficient}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {item.scoreResult.classificationLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : item.status === "SUBMITTED"
                                ? "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300"
                                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {item.status === "APPROVED"
                              ? "Đã cấp chứng nhận"
                              : item.status === "SUBMITTED"
                              ? "Chờ thẩm định"
                              : "Bản nháp"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/assessments/tt17/${item.id}/report`}>
                              <button className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                Xem Phụ Lục IV
                              </button>
                            </Link>
                            {item.status === "DRAFT" && (
                              <Link href="/assessments/tt17/wizard">
                                <button className="px-3 py-1.5 rounded-lg bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800">
                                  Kê Khai Tiếp
                                </button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Async>
    </div>
  );
}
