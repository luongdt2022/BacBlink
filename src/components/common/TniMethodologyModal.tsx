"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calculator,
  Flame,
  TrendingUp,
  Cpu,
  ShieldAlert,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  HelpCircle,
  ShieldCheck,
  Layers
} from "lucide-react";

interface TniMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TniMethodologyModal({ isOpen, onClose }: TniMethodologyModalProps) {
  const [activeTab, setActiveTab] = useState<"FORMULA" | "DIMENSIONS" | "THRESHOLDS" | "EMPIRICAL_304">("FORMULA");

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 z-10 transition-all transform animate-in zoom-in-95 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Phương Pháp Luận Chỉ Số Nhu Cầu Công Nghệ (TNI)
                </h2>
                <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs px-2.5 py-0.5 font-bold border border-rose-300 dark:border-rose-700">
                  Chuẩn hóa thang 100
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cơ sở khoa học thuật toán K-L-N-O & Kết quả thực nghiệm 304 Doanh nghiệp Việt Nam (PO-DEC-20261008-03)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-5 sm:px-6 pt-3 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={() => setActiveTab("FORMULA")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === "FORMULA"
                ? "border-rose-600 text-rose-600 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            1. Công thức Toán học
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("DIMENSIONS")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === "DIMENSIONS"
                ? "border-rose-600 text-rose-600 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            2. 4 Trục Đo K-L-N-O
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("THRESHOLDS")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === "THRESHOLDS"
                ? "border-rose-600 text-rose-600 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            3. 4 Ngưỡng Phân Hạng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("EMPIRICAL_304")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === "EMPIRICAL_304"
                ? "border-rose-600 text-rose-600 dark:text-rose-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            4. Thực Nghiệm 304 Doanh Nghiệp
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm">
          {/* TAB 1: CÔNG THỨC */}
          {activeTab === "FORMULA" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="rounded-2xl border-2 border-rose-300 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 p-5 text-center">
                <span className="text-xs font-extrabold text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                  Công Thức Chuẩn Hóa Điểm Nhu Cầu Công Nghệ (Technology Need Index)
                </span>
                <div className="mt-3 py-3 px-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 shadow-sm inline-block">
                  <code className="text-base sm:text-lg font-mono font-black text-rose-700 dark:text-rose-300">
                    TNI = ROUND( (35×K + 30×L + 20×N + 15×O) / 5 )
                  </code>
                </div>
                <p className="mt-2 text-xs text-rose-900/80 dark:text-rose-300/80 max-w-xl mx-auto">
                  Trong đó K, L, N, O nhận giá trị nguyên từ 1 đến 5. Kết quả sau khi chia cho 5 sẽ tự động quy đổi về dải thang điểm 100 tuyệt đối (20 ≤ TNI ≤ 100).
                </p>
              </div>

              {/* Giải thích tỷ trọng */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-xs font-bold text-slate-500">Trục K · Urgency</div>
                  <div className="text-lg font-black text-rose-600 mt-1">35%</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Mức độ cấp thiết giải quyết sự cố sản xuất
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-xs font-bold text-slate-500">Trục L · Impact</div>
                  <div className="text-lg font-black text-amber-600 mt-1">30%</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Tầm ảnh hưởng tài chính & rủi ro doanh thu
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-xs font-bold text-slate-500">Trục N · Investment</div>
                  <div className="text-lg font-black text-blue-600 mt-1">20%</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Khả năng bố trí ngân sách & vốn giải ngân
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-xs font-bold text-slate-500">Trục O · Readiness</div>
                  <div className="text-lg font-black text-emerald-600 mt-1">15%</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Năng lực nhân sự kỹ thuật tiếp nhận & hấp thụ
                  </div>
                </div>
              </div>

              {/* Hai Tầng Kiểm Định TNI */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <h4 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-rose-600" />
                  Quy Trình 2 Tầng Xác Thực Nhu Cầu (TNI Verification)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
                    <span className="font-bold text-amber-900 dark:text-amber-300">Tầng 1: Tự đánh giá (SELF_DECLARED)</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Doanh nghiệp thực hiện điền phiếu khảo sát nhu cầu, hệ thống tự động tính điểm TNI tức thì để đưa vào luồng gợi ý công nghệ và phân loại sơ bộ.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">Tầng 2: Thẩm định Nhà Nước (VERIFIED_BY_GOV)</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Cán bộ Sở KH&CN / Chuyên gia Trung tâm ĐMST thẩm định tính xác thực của sự cố, báo cáo tài chính và năng lực tiếp nhận trước khi phê duyệt hỗ trợ vốn/liên kết 1-1.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 4 TRỤC ĐO K-L-N-O */}
          {activeTab === "DIMENSIONS" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400 text-sm">
                  <Flame className="w-4 h-4" />
                  Trục K: Mức độ cấp thiết (Urgency) — Trọng số 35%
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 1</span>: Thăm dò ý tưởng, chưa ảnh hưởng sản xuất
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 2</span>: Nâng cấp định kỳ theo kế hoạch năm
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 3</span>: Giảm hiệu suất dây chuyền, xử lý tạm thời
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 4</span>: Sự cố dừng dây chuyền, khẩn cấp cần xử lý
                  </div>
                  <div className="p-2.5 rounded-lg border bg-rose-50 dark:bg-rose-950/40 border-rose-300">
                    <span className="font-black text-rose-700 dark:text-rose-300">Điểm 5</span>: Đình trệ toàn nhà máy, rủi ro đứt gãy cung ứng
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Trục L: Tầm ảnh hưởng doanh thu/chi phí (Impact) — Trọng số 30%
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 1</span>: Không đáng kể đến chi phí vận hành
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 2</span>: Ảnh hưởng nhỏ lẻ (&lt; 5% doanh thu năm)
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 3</span>: Ảnh hưởng 5% – 20% doanh thu hoặc chi phí
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 4</span>: Ảnh hưởng &gt; 20% doanh thu toàn năm
                  </div>
                  <div className="p-2.5 rounded-lg border bg-amber-50 dark:bg-amber-950/40 border-amber-300">
                    <span className="font-black text-amber-700 dark:text-amber-300">Điểm 5</span>: Tác động sống còn đến sự tồn tại của DN
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  Trục N: Khả năng đầu tư & Ngân sách (Investment) — Trọng số 20%
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 1</span>: Chưa có ngân sách, đợi tài trợ 100%
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 2</span>: Ngân sách hạn hẹp (&lt; 100 triệu VNĐ)
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 3</span>: Có thể cân đối (100 – 500 triệu VNĐ)
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 4</span>: Quỹ R&D / Vay ưu đãi (500 tr – 2 tỷ VNĐ)
                  </div>
                  <div className="p-2.5 rounded-lg border bg-blue-50 dark:bg-blue-950/40 border-blue-300">
                    <span className="font-black text-blue-700 dark:text-blue-300">Điểm 5</span>: Nguồn lực dồi dào, giải ngân tức thì (&gt; 2 tỷ VNĐ)
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  <Cpu className="w-4 h-4" />
                  Trục O: Năng lực tiếp nhận & hấp thụ (Adoption Readiness) — Trọng số 15%
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 1</span>: Chưa có nhân sự kỹ thuật tiếp nhận
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 2</span>: Cần chuyển giao & đào tạo toàn diện từ đầu
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 3</span>: Có kỹ sư cơ bản, thiếu kinh nghiệm sâu
                  </div>
                  <div className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-950">
                    <span className="font-black text-slate-700 dark:text-slate-300">Điểm 4</span>: Đội ngũ kỹ sư sẵn sàng làm chủ ngay
                  </div>
                  <div className="p-2.5 rounded-lg border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300">
                    <span className="font-black text-emerald-700 dark:text-emerald-300">Điểm 5</span>: Bộ phận R&D chuyên trách, sẵn sàng cải tiến
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 4 NGƯỠNG PHÂN HẠNG */}
          {activeTab === "THRESHOLDS" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 p-4 flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-xs">
                  $\ge 80$
                </span>
                <div>
                  <h4 className="font-extrabold text-rose-900 dark:text-rose-300 text-sm">
                    PHÂN KHÚC: NHU CẦU RẤT CAO (VERY_HIGH)
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    <strong>Chính sách điều phối P0:</strong> Đẩy ngay vào luồng Matching 1-1 tự động với Sáng chế TRL 7–9. Bố trí chuyên gia chuyển giao công nghệ làm việc trực tiếp trong vòng 24 giờ để khảo sát hiện trường.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-black text-xs">
                  65 – 79.9
                </span>
                <div>
                  <h4 className="font-extrabold text-amber-900 dark:text-amber-300 text-sm">
                    PHÂN KHÚC: NHU CẦU CAO (HIGH)
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    <strong>Chính sách điều phối P1:</strong> Ghép nối tự động theo đợt với các hồ sơ Seller phù hợp; gửi thông báo đẩy đến các viện nghiên cứu và chủ sở hữu công nghệ sẵn sàng chuyển giao.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-yellow-300 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20 p-4 flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-yellow-600 text-white font-black text-xs">
                  50 – 64.9
                </span>
                <div>
                  <h4 className="font-extrabold text-yellow-900 dark:text-yellow-300 text-sm">
                    PHÂN KHÚC: NHU CẦU TRUNG BÌNH (MEDIUM)
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    <strong>Chính sách tiếp nhận:</strong> Gợi ý danh mục công nghệ hiện có trên sàn; hỗ trợ tư vấn lộ trình đổi mới công nghệ và hướng dẫn tiếp cận nguồn vốn hỗ trợ doanh nghiệp của địa phương.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-slate-600 text-white font-black text-xs">
                  &lt; 50
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                    PHÂN KHÚC: NHU CẦU THẤP (LOW)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    <strong>Chính sách hỗ trợ:</strong> Lưu hồ sơ theo dõi; đề xuất tham gia các hội thảo phổ biến công nghệ và đào tạo nâng cao nhận thức chuyển đổi số.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THỰC NGHIỆM 304 DN */}
          {activeTab === "EMPIRICAL_304" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-300 text-xs uppercase">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Báo Cáo Thực Nghiệm 304 Doanh Nghiệp Việt Nam (REPORT-TNI-304DN-v1.0)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Thuật toán TNI đã được kiểm chứng thực tế trên 304 hồ sơ khảo sát doanh nghiệp đổi mới sáng tạo từ tệp dữ liệu quốc gia (tháng 10/2026), bảo đảm phân phối chuẩn, không có bản ghi khuyết thiếu và không bị hiệu ứng lệch trần/sàn.
                </p>
              </div>

              {/* Bảng phân vị thực nghiệm */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-[11px] text-slate-500 font-bold">Điểm Cao Nhất (Max)</div>
                  <div className="text-xl font-black text-rose-600 mt-1">90.0 / 100</div>
                  <div className="text-[10px] text-slate-500">DN xuất khẩu, R&D mạnh</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-[11px] text-slate-500 font-bold">Điểm Trung Bình (Mean)</div>
                  <div className="text-xl font-black text-amber-600 mt-1">68.94 / 100</div>
                  <div className="text-[10px] text-slate-500">Mặt bằng chuẩn DNNVV</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-[11px] text-slate-500 font-bold">Điểm Trung Vị (Median)</div>
                  <div className="text-xl font-black text-blue-600 mt-1">66.5 / 100</div>
                  <div className="text-[10px] text-slate-500">Phân vị 50% mẫu</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-[11px] text-slate-500 font-bold">Điểm Thấp Nhất (Min)</div>
                  <div className="text-xl font-black text-slate-600 mt-1">51.5 / 100</div>
                  <div className="text-[10px] text-slate-500">Máy móc truyền thống</div>
                </div>
              </div>

              {/* Phân bố 4 phân khúc */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">Phân khúc</th>
                      <th className="p-3">Dải điểm</th>
                      <th className="p-3">Số lượng DN</th>
                      <th className="p-3">Tỷ lệ (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr className="bg-rose-50/40 dark:bg-rose-950/20">
                      <td className="p-3 font-bold text-rose-700">Rất cao (VERY_HIGH)</td>
                      <td className="p-3">$\ge 80$</td>
                      <td className="p-3 font-bold">18 DN</td>
                      <td className="p-3 font-bold text-rose-700">5.9%</td>
                    </tr>
                    <tr className="bg-amber-50/40 dark:bg-amber-950/20">
                      <td className="p-3 font-bold text-amber-700">Cao (HIGH)</td>
                      <td className="p-3">65 – 79.9</td>
                      <td className="p-3 font-bold">155 DN</td>
                      <td className="p-3 font-bold text-amber-700">51.0%</td>
                    </tr>
                    <tr className="bg-yellow-50/40 dark:bg-yellow-950/20">
                      <td className="p-3 font-bold text-yellow-800">Trung bình (MEDIUM)</td>
                      <td className="p-3">50 – 64.9</td>
                      <td className="p-3 font-bold">131 DN</td>
                      <td className="p-3 font-bold text-yellow-800">43.1%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-500">Thấp (LOW)</td>
                      <td className="p-3">&lt; 50</td>
                      <td className="p-3">0 DN</td>
                      <td className="p-3">0.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Cơ sở dữ liệu khảo sát 304 DN ĐMST Việt Nam · Cổng ĐMST Quốc Gia NacenTech
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default TniMethodologyModal;
