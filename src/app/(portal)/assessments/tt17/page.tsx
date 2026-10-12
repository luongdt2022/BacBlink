"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppButton } from "@/components/ui/design-system";
import { Async, UXState } from "@/components/ui/async";
import { authClient } from "@/lib/auth-client";
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
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setUxState("loading");
        const user = authClient.getUser();
        setCurrentUser(user);
        const list = await getAssessmentHistory();
        setHistory(list);
        setUxState("success");
      } catch {
        setUxState("error");
      }
    }
    loadData();
  }, []);

  const isPublicUser = !currentUser || ["PUBLIC_USER", "USER", "GUEST"].includes(currentUser.role?.toUpperCase() ?? "");
  const displayLatest = isPublicUser ? null : history[0];
  const latest = displayLatest;

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
              {displayLatest ? "Kê Khai Kỳ Mới" : "Bắt Đầu Kê Khai Khảo Sát"}
            </AppButton>
          </Link>
        </div>
      </div>

      {!displayLatest ? (
        /* HERO BANNER CHO KHÁCH KHẢO SÁT VÀ PUBLIC USER (MÀU SÁNG & HOA VĂN CHÌM BÊN DƯỚI) */
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-8 sm:p-12 shadow-sm space-y-6">
            {/* HOA VĂN BÊN DƯỚI: HỌA TIẾT NACENTECH INNOVATION & TECH GRID */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[url('/innovation-hero-background.png')] bg-cover bg-bottom bg-no-repeat opacity-[0.10] dark:opacity-20 mix-blend-multiply"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(#3c5999_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-[0.04]"
            />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold text-xs border border-emerald-200/90 dark:border-emerald-800">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Khảo Sát Thực Địa Doanh Nghiệp Sản Xuất · TT 17/2019/TT-BKHCN</span>
              </div>

              <div className="max-w-3xl space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Phiếu Khảo Sát & Tự Chẩn Đoán Trình Độ Công Nghệ Sản Xuất
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Hệ thống hỗ trợ các doanh nghiệp ngành chế biến, chế tạo (VSIC C.10 – C.32) tự đánh giá toàn diện qua 26 tiêu chí, tính toán tức thời hệ số đồng bộ $T_ĐB$ và bóc tách các khâu điểm nghẽn dây chuyền.
                </p>
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                  <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium flex items-start gap-2">
                    <span className="text-base shrink-0">💡</span>
                    <span>
                      <strong className="font-bold">Cơ chế Khảo sát Mở:</strong> Quý Doanh nghiệp có thể điền form trực tiếp mà không cần đăng ký tài khoản trước. Hệ thống sẽ tự động khởi tạo hồ sơ doanh nghiệp và lưu trữ bảo mật khi nộp bài.
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50/90 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition hover:shadow-md hover:border-emerald-200">
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-1.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span>100 Điểm Khách Quan</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Đánh giá 26 tiêu chí theo thang điểm chuẩn Thông tư 17, xếp hạng 4 mức trình độ công nghệ.
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition hover:shadow-md hover:border-brand-200">
                  <div className="text-brand-700 dark:text-brand-300 font-bold text-sm mb-1.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-700 dark:text-brand-300">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span>Biểu Đồ Mạng Nhện Realtime</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Vẽ biểu đồ Radar 5 trục (T-E-O-R-I) theo thời gian thực và xác định điểm nghẽn dây chuyền.
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition hover:shadow-md hover:border-teal-200">
                  <div className="text-teal-700 dark:text-teal-300 font-bold text-sm mb-1.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-300">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <span>Tự Động Cấp Tài Khoản</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Nhập Mã số thuế và Email liên hệ, hệ thống tự động khởi tạo tài khoản quản trị khi nộp bài.
                  </p>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <Link href="/assessments/tt17/wizard">
                  <AppButton variant="primary" className="px-6 py-3 text-base font-bold shadow-md hover:shadow-lg transition">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Bắt Đầu Kê Khai Khảo Sát Ngay (Mở Form)
                  </AppButton>
                </Link>
                <a
                  href="https://congbao.chinhphu.vn/van-ban/thong-tu-so-17-2019-tt-bkhcn-30405/29385.htm"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-300 transition underline underline-offset-4"
                >
                  Tra cứu văn bản Thông tư 17/2019/TT-BKHCN &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
    )}
  </div>
);
}


