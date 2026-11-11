"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  Database,
  FileSpreadsheet,
  Factory,
  GraduationCap,
  Lightbulb,
  TrendingUp,
  Users,
} from "lucide-react";
import { Tt17Assessment, Tt17SurveyData } from "@/services/api/assessment-tt17";
import { resolveProvinceName, resolveSectorName } from "@/lib/gov-label-resolver";

function formatVnd(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val) || val === 0) return "0 VNĐ";
  return new Intl.NumberFormat("vi-VN").format(Math.round(val)) + " VNĐ";
}

function formatMillionVnd(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val) || val === 0) return "0 triệu đồng";
  const million = val / 1_000_000;
  return (
    new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 2,
    }).format(million) + " triệu đồng"
  );
}

/**
 * Kiểm tra xem hồ sơ DN có dữ liệu raw từ form khảo sát (Phụ lục I) hay chỉ có điểm tổng hợp
 */
export function hasRawSurveyForm(survey?: Tt17SurveyData | null, hasRawSurveyHint?: boolean): boolean {
  if (typeof hasRawSurveyHint === "boolean") return hasRawSurveyHint;
  if (!survey) return false;
  const hasEquip =
    (survey.originalCostEquipment || 0) > 0 ||
    (survey.currentBookValueEquipment || 0) > 0 ||
    (survey.machineries && survey.machineries.length > 0) ||
    (survey.depreciationCoefficient || 0) > 0 ||
    (survey.modernEquipmentRatio || 0) > 0 ||
    (survey.automationRatio || 0) > 0;

  const hasWorkforce =
    (survey.totalWorkforce || 0) > 0 ||
    (survey.directWorkers || 0) > 0 ||
    (survey.trainedWorkers || 0) > 0;

  const hasOps =
    (survey.energyCostYear || 0) > 0 ||
    (survey.materialCostYear || 0) > 0 ||
    (survey.trainingCost3Years || 0) > 0 ||
    (survey.itExpenses3Years || 0) > 0 ||
    (survey.rdExpenses3Years || 0) > 0;

  return Boolean(hasEquip || hasWorkforce || hasOps);
}

const PRODUCT_STD_LABELS: Record<string, string> = {
  co_so: "Tiêu chuẩn cơ sở (TCCS)",
  quoc_gia: "Tiêu chuẩn Quốc gia (TCVN)",
  quoc_te: "Tiêu chuẩn Quốc tế / Khu vực (ISO, IEC, CE...)",
  co_so_vuot_quoc_te: "Tiêu chuẩn cơ sở cao hơn Tiêu chuẩn Quốc tế",
};

const MAINT_LEVEL_LABELS: Record<number, string> = {
  1: "Mức 1: Sửa chữa khi có sự cố hỏng hóc",
  2: "Mức 2: Bảo dưỡng định kỳ theo kế hoạch",
  3: "Mức 3: Bảo dưỡng dự đoán & chuyên sâu",
  4: "Mức 4: Bảo dưỡng thông minh tích hợp chẩn đoán tự động",
};

const IT_LEVEL_LABELS: Record<number, string> = {
  1: "Mức 1: Ứng dụng CNTT cơ bản (văn phòng, kế toán đơn lẻ)",
  2: "Mức 2: Tự động hóa quy trình quản trị và sản xuất từng phần",
  3: "Mức 3: Tích hợp dữ liệu toàn diện (ERP/MES/Cloud)",
};

const RD_FACILITY_LABELS: Record<number, string> = {
  1: "Mức 1: Nhóm nhân sự kiêm nhiệm cải tiến kỹ thuật",
  2: "Mức 2: Bộ phận / Phòng thí nghiệm R&D chuyên trách",
  3: "Mức 3: Viện / Trung tâm R&D độc lập có trang thiết bị hiện đại",
};

const NEW_PRODUCT_LABELS: Record<string, string> = {
  none: "Chưa có sản phẩm mới trong 3 năm",
  kieu_dang: "Cải tiến kiểu dáng, mẫu mã bao bì",
  tinh_nang: "Nâng cấp tính năng, chất lượng sản phẩm hiện có",
  hoan_toan_moi: "Sản phẩm hoàn toàn mới trên thị trường",
};

const RD_RESULT_LABELS: Record<string, string> = {
  none: "Chưa có kết quả nghiên cứu công nghệ",
  dang_nghien_cuu: "Đang trong giai đoạn nghiên cứu, thiết kế",
  thu_nghiem_lab: "Đã thử nghiệm thành công tại phòng Lab / Xưởng",
  giai_phap_huu_ich: "Đã đăng ký Giải pháp hữu ích / Thiết kế bố trí",
  bang_sang_che: "Đã được cấp Bằng độc quyền sáng chế",
};

const ACADEMY_LABELS: Record<string, string> = {
  none: "Chưa hợp tác với Viện nghiên cứu / Trường Đại học",
  chuyen_gia_dao_tao: "Thuê chuyên gia tư vấn, đào tạo ngắn hạn",
  du_an_rd: "Hợp tác thực hiện đề tài / dự án R&D & chuyển giao công nghệ",
};

const DIGITAL_STRATEGY_LABELS: Record<string, string> = {
  chua_biet: "Chưa xây dựng kế hoạch chuyển đổi số",
  chuan_bi: "Đang tìm hiểu và chuẩn bị kế hoạch chuyển đổi số",
  dang_thuc_hien: "Đang triển khai kế hoạch chuyển đổi số tại một số khâu",
  da_xay_dung: "Đã ban hành chiến lược và triển khai chuyển đổi số toàn diện",
};

function EmptySectionNotice({
  sectionTitle,
  groupCode,
  groupScore,
  maxScore,
}: {
  sectionTitle: string;
  groupCode: string;
  groupScore: number;
  maxScore: number;
}) {
  return (
    <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-800/60 flex items-start justify-between gap-4">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-amber-900 dark:text-amber-300">
            Chưa có dữ liệu kê khai chi tiết từ Form khảo sát cho mục này ({sectionTitle})
          </div>
          <p className="text-amber-800/90 dark:text-amber-400/90 leading-relaxed">
            Doanh nghiệp được đồng bộ từ bảng tổng hợp điểm số TT17 (chưa số hóa các chỉ số thô đầu vào của mục này). Hệ thống ghi nhận điểm kết quả thẩm định của nhóm <strong>{groupCode}</strong>.
          </p>
        </div>
      </div>
      <div className="shrink-0 text-right bg-white dark:bg-slate-900 px-3 py-1.5 rounded border border-amber-300 dark:border-amber-700">
        <div className="text-[10px] uppercase font-bold text-slate-500">Điểm Nhóm {groupCode}</div>
        <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">
          {groupScore} / {maxScore}đ
        </div>
      </div>
    </div>
  );
}

export function Tt17SurveyDetailView({ assessment }: { assessment: Tt17Assessment }) {
  const s = assessment.surveyData || ({} as Tt17SurveyData);
  const sr = assessment.scoreResult;
  const hasRaw = hasRawSurveyForm(s);

  // Kiểm tra dữ liệu từng phần
  const hasSecB =
    (s.originalCostEquipment || 0) > 0 ||
    (s.currentBookValueEquipment || 0) > 0 ||
    (s.machineries && s.machineries.length > 0) ||
    (s.depreciationCoefficient || 0) > 0 ||
    (s.modernEquipmentRatio || 0) > 0 ||
    (s.automationRatio || 0) > 0;

  const hasSecC =
    (s.energyCostYear || 0) > 0 ||
    (s.materialCostYear || 0) > 0 ||
    (s.financialSeries &&
      s.financialSeries.some(
        (f) => (f.directWorkersCount || 0) > 0 || (f.actualOutput || 0) > 0
      )) ||
    (s.defectProductRatio || 0) > 0 ||
    (s.capacityUtilizationRatio || 0) > 0;

  const hasSecD =
    (s.directWorkers || 0) > 0 ||
    (s.trainedWorkers || 0) > 0 ||
    (s.highSkilledWorkers || 0) > 0 ||
    (s.qualifiedManagers || 0) > 0 ||
    (s.qualifiedProfessionals || 0) > 0 ||
    (s.trainingCost3Years || 0) > 0 ||
    (s.isoCertifications && s.isoCertifications.length > 0) ||
    (s.softwareApplications && s.softwareApplications.length > 0) ||
    (s.productivityTools && s.productivityTools.length > 0);

  const hasSecE =
    (s.itExpenses3Years || 0) > 0 ||
    (s.rdWorkforceCount || 0) > 0 ||
    (s.rdExpenses3Years || 0) > 0 ||
    (s.rdExpenseRatio || 0) > 0 ||
    (s.rdProjectsCount || 0) > 0 ||
    Boolean(s.hasLabOrTestingFacility);

  const hasSecF =
    hasRaw &&
    ((s.newProductType && s.newProductType !== "none") ||
      (s.newProductRevenueRatio || 0) > 0 ||
      (s.rdTechnologyResult && s.rdTechnologyResult !== "none") ||
      (s.academyPartnershipType && s.academyPartnershipType !== "none") ||
      (s.digitalTechnologies && s.digitalTechnologies.length > 0) ||
      (s.grantedPatentsCount || 0) > 0 ||
      (s.registeredIpCount || 0) > 0);

  // Doanh thu năm gần nhất (có thể có cả ở 166 DN Tiền Giang từ cột Doanh thu bảng tổng hợp)
  const latestFin =
    s.financialSeries && s.financialSeries.length > 0
      ? [...s.financialSeries].sort((a, b) => b.year - a.year)[0]
      : null;

  return (
    <div className="space-y-5 text-xs">
      {/* Banner trạng thái dữ liệu Form */}
      {!hasRaw ? (
        <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700 flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-extrabold text-amber-900 dark:text-amber-200 text-sm">
              Hồ sơ chưa có dữ liệu bóc tách từng trường từ Phiếu khảo sát (Phụ lục I)
            </div>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              Doanh nghiệp <strong>{assessment.enterpriseName}</strong> ({resolveProvinceName(assessment.scopeId)}) được import từ <strong>Bảng tổng hợp kết quả tính toán TT17</strong>. Các trường thông tin nguyên giá máy móc, chi phí năng lượng/NVL, nhân sự R&D chi tiết từng mục chưa có dữ liệu thô; hệ thống chỉ lưu trữ kết quả chấm điểm 26 tiêu chí và 5 nhóm thành phần công nghệ.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-200">
                Đã có đầy đủ dữ liệu Form khảo sát gốc (Phụ lục I - Thông tư 17/2019/TT-BKHCN)
              </span>
              <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                Toàn bộ chỉ số đầu vào do doanh nghiệp kê khai được hiển thị chi tiết theo 6 mục dưới đây để đối soát với bảng điểm 26 tiêu chí.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0">
            Full Form Data
          </span>
        </div>
      )}

      {/* MỤC I: THÔNG TIN CHUNG & ĐỊNH DANH DOANH NGHIỆP */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="bg-slate-100/80 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Factory className="w-4 h-4 text-brand-600" />
            <span>MỤC I. THÔNG TIN ĐỊNH DANH & QUY MÔ DOANH NGHIỆP</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Địa bàn: {resolveProvinceName(assessment.scopeId)} ({assessment.scopeId})
          </span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-500">Tên doanh nghiệp:</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{assessment.enterpriseName}</div>
          </div>
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-500">Mã số thuế:</div>
            <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{assessment.taxCode}</div>
          </div>
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-500">Ngành chế biến, chế tạo (VSIC):</div>
            <div className="font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">
              {assessment.industryCode}: {resolveSectorName(assessment.industryCode)}
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-500">Loại hình / Quy mô:</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {s.companyType || "Chưa kê khai chi tiết"}
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-500">Tổng nguồn vốn / Tổng lao động (M):</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {s.totalCapital > 0 ? formatMillionVnd(s.totalCapital) : "Chưa có dữ liệu vốn"} ·{" "}
              {s.totalWorkforce > 0 ? `${s.totalWorkforce} lao động` : "Chưa có số LĐ"}
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-slate-500">Doanh thu thuần năm gần nhất (G_dt):</div>
            <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {latestFin && latestFin.netRevenue > 0
                ? `${formatMillionVnd(latestFin.netRevenue)} (Năm ${latestFin.year})`
                : "Chưa có dữ liệu"}
            </div>
          </div>
          {(s.companyAddress || s.contactPerson || s.companyPhone || s.companyEmail) && (
            <div className="sm:col-span-2 lg:col-span-3 p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-1">
              <span>
                <strong className="text-slate-500">Địa chỉ:</strong> {s.companyAddress || "—"}
              </span>
              {s.contactPerson && (
                <span>
                  <strong className="text-slate-500">Người đại diện/liên hệ:</strong> {s.contactPerson}
                </span>
              )}
              {s.companyPhone && (
                <span>
                  <strong className="text-slate-500">Điện thoại:</strong> {s.companyPhone}
                </span>
              )}
              {s.companyEmail && (
                <span>
                  <strong className="text-slate-500">Email:</strong> {s.companyEmail}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MỤC II: NHÓM T - HIỆN TRẠNG MÁY MÓC, THIẾT BỊ & CÔNG NGHỆ (TC01 - TC07) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="bg-blue-50/80 dark:bg-blue-950/40 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>MỤC II. HIỆN TRẠNG MÁY MÓC, THIẾT BỊ & DÂY CHUYỀN CÔNG NGHỆ (NHÓM T: TC01 – TC07)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
            Điểm Nhóm T: {sr?.scoreT ?? 0} / 30đ
          </span>
        </div>
        <div className="p-4 space-y-4">
          {!hasSecB ? (
            <EmptySectionNotice
              sectionTitle="Mục II - Thiết bị & Công nghệ (TC01 – TC07)"
              groupCode="T"
              groupScore={sr?.scoreT ?? 0}
              maxScore={30}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Nguyên giá thiết bị ban đầu (G_bd - TC01):</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatMillionVnd(s.originalCostEquipment)}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Giá trị thiết bị hiện tại đã khấu hao (G_sx - TC01, TC02):</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatMillionVnd(s.currentBookValueEquipment)}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Tỷ lệ khấu hao tính toán (K_kh - TC01):</div>
                  <div className="font-mono font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                    {s.originalCostEquipment > 0
                      ? `${(((s.originalCostEquipment - s.currentBookValueEquipment) / s.originalCostEquipment) * 100).toFixed(2)}%`
                      : s.depreciationCoefficient
                      ? `${(s.depreciationCoefficient * 100).toFixed(1)}%`
                      : "0%"}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Đầu tư TB mở rộng 3 năm (G_tbm1 - TC03):</div>
                  <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {formatMillionVnd(s.newInvestEquipment3Years)}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Đầu tư TB thay thế 3 năm (G_tbm2 - TC03):</div>
                  <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {formatMillionVnd(s.replacementEquipment3Years)}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Giá trị thiết bị số hóa SX (G_sh - TC04):</div>
                  <div className="font-mono font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">
                    {formatMillionVnd(s.digitalEquipmentValue)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Hệ thống tích hợp dữ liệu SX (TC04):</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {s.dataCollectionSystems && s.dataCollectionSystems.length > 0
                      ? s.dataCollectionSystems.join(", ")
                      : "Chưa trang bị SCADA/MDC/FMS/CIM"}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Tiêu chuẩn sản phẩm chính (TC07):</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {PRODUCT_STD_LABELS[s.mainProductStandard] || s.mainProductStandard || "Tiêu chuẩn cơ sở"}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Nhận chuyển giao công nghệ (TC11):</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {s.transferredTechTypes && s.transferredTechTypes.length > 0
                      ? `${s.transferredTechTypes.join(", ")} (${formatMillionVnd(s.transferredTechValue)})`
                      : "Chưa phát sinh hợp đồng chuyển giao"}
                  </div>
                </div>
              </div>

              {/* Danh mục máy móc thiết bị chi tiết */}
              {s.machineries && s.machineries.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-slate-700 dark:text-slate-300">
                    Danh mục máy móc, thiết bị sản xuất chính đã kê khai ({s.machineries.length} thiết bị):
                  </div>
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold">
                          <th className="py-2 px-3">STT</th>
                          <th className="py-2 px-3">Tên máy móc / Thiết bị</th>
                          <th className="py-2 px-3">Nước SX</th>
                          <th className="py-2 px-3 text-center">Năm SX</th>
                          <th className="py-2 px-3 text-center">Năm SD</th>
                          <th className="py-2 px-3 text-center">Tự động hóa</th>
                          <th className="py-2 px-3">Sản phẩm / Công đoạn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {s.machineries.map((m, idx) => (
                          <tr key={idx}>
                            <td className="py-1.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                            <td className="py-1.5 px-3 font-semibold text-slate-900 dark:text-white">{m.name}</td>
                            <td className="py-1.5 px-3">{m.originCountry || "—"}</td>
                            <td className="py-1.5 px-3 text-center font-mono">{m.manufactureYear || "—"}</td>
                            <td className="py-1.5 px-3 text-center font-mono">{m.startUsageYear || "—"}</td>
                            <td className="py-1.5 px-3 text-center">
                              {m.isAutomated ? (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                  Tự động / CNC
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                  Bán tự động / Cơ khí
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">{m.productName || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MỤC III: NHÓM E - HIỆU QUẢ KHAI THÁC CÔNG NGHỆ & TÀI CHÍNH 3 NĂM (TC05, TC06, TC08 - TC11) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>MỤC III. KẾT QUẢ SXKD 3 NĂM, NĂNG LƯỢNG, NVL & BẢO DƯỠNG (NHÓM E: TC08 – TC12)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
            Điểm Nhóm E: {sr?.scoreE ?? 0} / 20đ
          </span>
        </div>
        <div className="p-4 space-y-4">
          {!hasSecC ? (
            <EmptySectionNotice
              sectionTitle="Mục III - Chi phí Năng lượng, NVL, Chuỗi tài chính 3 năm & Kaizen"
              groupCode="E"
              groupScore={sr?.scoreE ?? 0}
              maxScore={20}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Chi phí năng lượng năm gần nhất (G_nl - TC05):</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatMillionVnd(s.energyCostYear)}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Chi phí nguyên vật liệu năm gần nhất (G_nvl - TC06):</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatMillionVnd(s.materialCostYear)}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Phong trào sáng kiến Kaizen (TC09):</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {s.hasKaizenPolicy ? "Có chính sách" : "Chưa có chính sách"} ·{" "}
                    <strong>{s.kaizenCount3Years || 0}</strong> sáng kiến/3 năm
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-slate-500">Quy trình bảo dưỡng thiết bị (TC10):</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {MAINT_LEVEL_LABELS[s.maintenanceLevel] || `Mức ${s.maintenanceLevel || 1}`}
                  </div>
                </div>
              </div>

              {s.financialSeries && s.financialSeries.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-slate-700 dark:text-slate-300">
                    Bảng kê khai chỉ số sản xuất kinh doanh 3 năm (G_sp, G_dt, G_cp, Sản lượng & Lao động trực tiếp):
                  </div>
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold">
                          <th className="py-2 px-3">Năm</th>
                          <th className="py-2 px-3 text-right">Giá trị SX công nghiệp (G_sp)</th>
                          <th className="py-2 px-3 text-right">Doanh thu thuần (G_dt)</th>
                          <th className="py-2 px-3 text-right">Tổng chi phí SX (G_cp)</th>
                          <th className="py-2 px-3 text-center">Sản lượng P_tt / Công suất P</th>
                          <th className="py-2 px-3 text-center">LĐ trực tiếp (M_tt)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {s.financialSeries.map((f, idx) => (
                          <tr key={idx}>
                            <td className="py-1.5 px-3 font-mono font-bold">{f.year}</td>
                            <td className="py-1.5 px-3 text-right font-mono">{formatMillionVnd(f.industrialOutputValue)}</td>
                            <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700">
                              {formatMillionVnd(f.netRevenue)}
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono">{formatMillionVnd(f.totalCosts)}</td>
                            <td className="py-1.5 px-3 text-center font-mono">
                              {f.actualOutput || 0} / {f.designedCapacity || 0}
                            </td>
                            <td className="py-1.5 px-3 text-center font-mono font-semibold">
                              {f.directWorkersCount || 0} người
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MỤC IV: NHÓM O - NHÂN LỰC, QUẢN TRỊ, TIÊU CHUẨN CHẤT LƯỢNG & MÔI TRƯỜNG (TC12 - TC17) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="bg-amber-50/80 dark:bg-amber-950/40 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span>MỤC IV. NGUỒN NHÂN LỰC, HỆ THỐNG QUẢN TRỊ, ISO & MÔI TRƯỜNG (NHÓM O: TC13 – TC17)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
            Điểm Nhóm O: {sr?.scoreO ?? 0} / 19đ
          </span>
        </div>
        <div className="p-4">
          {!hasSecD ? (
            <EmptySectionNotice
              sectionTitle="Mục IV - Cơ cấu nhân lực, Chi phí đào tạo, Phần mềm quản trị & Chứng chỉ ISO"
              groupCode="O"
              groupScore={sr?.scoreO ?? 0}
              maxScore={19}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Cơ cấu lao động trực tiếp / gián tiếp (TC12):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  Tổng: <strong>{s.totalWorkforce}</strong> · Trực tiếp (M_tt): <strong>{s.directWorkers}</strong> · Gián tiếp (M_gt): <strong>{s.indirectStaff}</strong>
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Chất lượng nhân sự kỹ thuật & quản lý (TC12):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  Qua ĐT nghề: <strong>{s.trainedWorkers}</strong> · Thợ bậc cao: <strong>{s.highSkilledWorkers}</strong> · Quản lý/Chuyên môn ĐH: <strong>{s.qualifiedManagers + s.qualifiedProfessionals}</strong>
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Tổng kinh phí đào tạo 3 năm (G_đthl - TC13):</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatMillionVnd(s.trainingCost3Years)}
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Phần mềm quản trị sản xuất & điều hành (TC14):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {s.softwareApplications && s.softwareApplications.length > 0
                    ? s.softwareApplications.join(", ")
                    : "Chưa triển khai ERP/MES/SCM"}
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Hệ thống quản lý chất lượng & Công cụ NSCL (TC16):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {[...(s.isoCertifications || []), ...(s.productivityTools || [])].length > 0
                    ? [...(s.isoCertifications || []), ...(s.productivityTools || [])].join(", ")
                    : "Chưa có chứng chỉ ISO / 5S / Lean"}
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Quản lý môi trường & Kinh tế tuần hoàn (TC17):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {s.environmentalCompliant ? "Đạt chuẩn XLNT" : "Chưa đạt chuẩn"} ·{" "}
                  {s.hasIso14001 ? "Có ISO 14001" : "Chưa có ISO 14001"} ·{" "}
                  {s.hasWasteRecycling ? "Có tái chế chất thải" : "Không tái chế"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MỤC V: NHÓM R - HẠ TẦNG CNTT & NĂNG LỰC NGHIÊN CỨU PHÁT TRIỂN R&D (TC18 - TC22) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="bg-purple-50/80 dark:bg-purple-950/40 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>MỤC V. HẠ TẦNG CNTT & NĂNG LỰC NGHIÊN CỨU PHÁT TRIỂN R&D (NHÓM R: TC18 – TC22)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
            Điểm Nhóm R: {sr?.scoreR ?? 0} / 17đ
          </span>
        </div>
        <div className="p-4">
          {!hasSecE ? (
            <EmptySectionNotice
              sectionTitle="Mục V - Hạ tầng CNTT, Chi phí CNTT & Nguồn lực R&D (TC18 – TC22)"
              groupCode="R"
              groupScore={sr?.scoreR ?? 0}
              maxScore={17}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Mức độ hạ tầng CNTT (TC18):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {IT_LEVEL_LABELS[s.itInfrastructureLevel] || `Mức ${s.itInfrastructureLevel || 1}`}
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Tổng chi đầu tư CNTT 3 năm (G_tt - TC19):</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatMillionVnd(s.itExpenses3Years)}
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Nhân lực chuyên trách / kiêm nhiệm R&D (M_r&d - TC20):</div>
                <div className="font-bold text-purple-700 dark:text-purple-400 mt-0.5">
                  {s.rdWorkforceCount || 0} nhân sự
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Tổ chức bộ phận / Trung tâm R&D (TC21):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {RD_FACILITY_LABELS[s.rdFacilityLevel] || `Mức ${s.rdFacilityLevel || 1}`}
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Tổng kinh phí R&D 3 năm (G_rd - TC22):</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatMillionVnd(s.rdExpenses3Years)}
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Quỹ phát triển KH&CN của doanh nghiệp (TC22):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {s.hasSciTechFund ? "Đã thành lập và trích lập Quỹ KH&CN" : "Chưa trích lập Quỹ phát triển KH&CN"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MỤC VI: NHÓM I - ĐỔI MỚI SÁNG TẠO, SỞ HỮU TRÍ TUỆ & CHUYỂN ĐỔI SỐ 4.0 (TC23 - TC26) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="bg-indigo-50/80 dark:bg-indigo-950/40 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
            <span>MỤC VI. ĐỔI MỚI SÁNG TẠO, SHTT & CHUYỂN ĐỔI SỐ 4.0 (NHÓM I: TC23 – TC26)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
            Điểm Nhóm I: {sr?.scoreI ?? 0} / 14đ
          </span>
        </div>
        <div className="p-4">
          {!hasSecF ? (
            <EmptySectionNotice
              sectionTitle="Mục VI - Sản phẩm mới, Sáng chế SHTT, Hợp tác Viện-Trường & Công nghệ 4.0 (TC23 – TC26)"
              groupCode="I"
              groupScore={sr?.scoreI ?? 0}
              maxScore={14}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Phát triển sản phẩm mới (TC23):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {NEW_PRODUCT_LABELS[s.newProductType] || s.newProductType || "Chưa có"} · Tỷ trọng DT:{" "}
                  <strong>{s.newProductRevenueRatio || 0}%</strong>
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Kết quả tự nghiên cứu công nghệ & SHTT (TC24):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {RD_RESULT_LABELS[s.rdTechnologyResult] || s.rdTechnologyResult || "Chưa có"}
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Liên kết Viện nghiên cứu – Trường Đại học (TC25):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {ACADEMY_LABELS[s.academyPartnershipType] || s.academyPartnershipType || "Chưa có"}
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Chiến lược Chuyển đổi số (TC26):</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {DIGITAL_STRATEGY_LABELS[s.digitalStrategyLevel] || s.digitalStrategyLevel || "Chưa xây dựng"}
                </div>
              </div>
              <div className="sm:col-span-2 p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-500">Công nghệ số 4.0 đã ứng dụng (TC26):</div>
                <div className="font-semibold text-indigo-700 dark:text-indigo-400 mt-0.5">
                  {s.digitalTechnologies && s.digitalTechnologies.length > 0
                    ? s.digitalTechnologies.join(", ")
                    : "Chưa ứng dụng các công nghệ Cloud, IoT, AI, Robot, Big Data"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
