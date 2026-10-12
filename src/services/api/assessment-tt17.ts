import { authClient } from "@/lib/auth-client";

export interface MachineryItem {
  name: string;
  originCountry: string;
  manufactureYear: number;
  startUsageYear: number;
  originalCost: number;
  currentBookValue: number;
  isAutomated: boolean;
  isAdvancedCountry: boolean;
}

export interface FinancialSeriesItem {
  year: number;
  industrialOutputValue: number; // G_sp (VNĐ)
  netRevenue: number; // G_dt (VNĐ)
  directWorkersCount: number; // M_tt
}

export interface Tt17SurveyData {
  // Mục A: Thông tin chung & Định danh
  companyName?: string;
  taxCode?: string;
  contactPerson?: string;
  totalCapital: number;
  totalWorkforce: number;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyType: string;

  // Mục B: Nhóm T
  machineries: MachineryItem[];
  depreciationCoefficient: number; // K_kh (0.0 - 1.0)
  modernEquipmentRatio: number; // %
  advancedCountryEquipmentRatio: number; // %
  automationRatio: number; // %
  averageEquipmentAge: number; // năm
  lineSynchronizationLevel: number; // 1 - 5
  materialConsumptionRatio: number; // %

  // Mục C: Nhóm E
  financialSeries: FinancialSeriesItem[];
  defectProductRatio: number; // %
  capacityUtilizationRatio: number; // %
  exportRevenueRatio: number; // %
  energySavingRatio: number; // %

  // Mục D: Nhóm O
  isoCertifications: string[];
  softwareApplications: string[];
  productivityTools: string[];
  digitalMaturityLevel: number; // 1 - 5
  environmentalCompliant: boolean;

  // Mục Đ: Nhóm R
  rdWorkforceCount: number;
  hasLabOrTestingFacility: boolean;
  rdExpenseRatio: number; // %
  rdProjectsCount: number;
  technologyMasteryLevel: number; // 1 - 5

  // Mục E: Nhóm I
  grantedPatentsCount: number;
  registeredIpCount: number;
  newProductRevenueRatio: number; // %
  academyPartnershipCount: number;
  hasInternalInnovationPolicy: boolean;
}

export interface CriterionScore {
  code: string;
  group: "T" | "E" | "O" | "R" | "I";
  name: string;
  maxScore: number;
  achievedScore: number;
  isBottleneck: boolean;
  recommendation: string;
}

export interface Tt17ScoreResult {
  scoreT: number;
  scoreE: number;
  scoreO: number;
  scoreR: number;
  scoreI: number;
  totalScore: number;
  syncCoefficient: number;
  classification: "TIEN_TIEN" | "TRUNG_BINH_TIEN_TIEN" | "TRUNG_BINH" | "LAC_HAU" | "CAN_THAM_DINH";
  classificationLabel: string;
  criteria: CriterionScore[];
  bottlenecks: string[];
}

export interface Tt17Assessment {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  taxCode: string;
  assessmentYear: number;
  status: "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED";
  scopeType: string;
  scopeId: string;
  industryCode: string;
  surveyData: Tt17SurveyData;
  scoreResult: Tt17ScoreResult;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
}

export const INITIAL_SURVEY_DATA: Tt17SurveyData = {
  companyName: "",
  taxCode: "",
  contactPerson: "",
  totalCapital: 0,
  totalWorkforce: 0,
  companyAddress: "",
  companyPhone: "",
  companyEmail: "",
  companyType: "Công ty Cổ phần",

  machineries: [],
  depreciationCoefficient: 0,
  modernEquipmentRatio: 0,
  advancedCountryEquipmentRatio: 0,
  automationRatio: 0,
  averageEquipmentAge: 0,
  lineSynchronizationLevel: 1,
  materialConsumptionRatio: 100,

  financialSeries: [],
  defectProductRatio: 0,
  capacityUtilizationRatio: 0,
  exportRevenueRatio: 0,
  energySavingRatio: 0,

  isoCertifications: [],
  softwareApplications: [],
  productivityTools: [],
  digitalMaturityLevel: 1,
  environmentalCompliant: false,

  rdWorkforceCount: 0,
  hasLabOrTestingFacility: false,
  rdExpenseRatio: 0,
  rdProjectsCount: 0,
  technologyMasteryLevel: 1,

  grantedPatentsCount: 0,
  registeredIpCount: 0,
  newProductRevenueRatio: 0,
  academyPartnershipCount: 0,
  hasInternalInnovationPolicy: false,
};

export async function getCurrentAssessment(year?: number): Promise<Tt17Assessment | null> {
  const url = year ? `/api/v1/assessments/tt17/current?year=${year}` : "/api/v1/assessments/tt17/current";
  try {
    const res = await fetch(url, { headers: authClient.getAuthHeaders() });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.error("Lỗi khi tải hồ sơ đánh giá:", err);
  }
  return null;
}

export async function getAssessmentHistory(): Promise<Tt17Assessment[]> {
  try {
    const res = await fetch("/api/v1/assessments/tt17/history", { headers: authClient.getAuthHeaders() });
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (err) {
    console.error("Lỗi khi tải lịch sử đánh giá:", err);
  }
  return [];
}

export async function getAssessmentById(id: string): Promise<Tt17Assessment | null> {
  try {
    const res = await fetch(`/api/v1/assessments/tt17/${id}`, { headers: authClient.getAuthHeaders() });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.error("Lỗi khi tải chi tiết hồ sơ đánh giá:", err);
  }
  return null;
}

export interface SaveAssessmentDraftPayload {
  assessmentYear: number;
  industryCode: string;
  scopeId: string;
  surveyData: Tt17SurveyData;
  enterpriseName?: string;
  taxCode?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export async function saveAssessmentDraft(payload: SaveAssessmentDraftPayload): Promise<Tt17Assessment> {
  const res = await fetch("/api/v1/assessments/tt17/draft", {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authClient.getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Không thể lưu nháp hồ sơ đánh giá.");
  }
  const json = await res.json();
  return json.data;
}

export interface SubmitAssessmentPayload {
  assessmentYear: number;
  industryCode: string;
  scopeId: string;
  surveyData: Tt17SurveyData;
  enterpriseName?: string;
  taxCode?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface SubmitAssessmentResponse extends Tt17Assessment {
  autoProvisioned?: boolean;
  message?: string;
  account?: {
    email: string;
    taxCode?: string;
    enterpriseName?: string;
    role?: string;
    temporaryPassword?: string;
    message?: string;
  };
  credentials?: {
    email: string;
    temporaryPassword?: string;
    enterpriseCode?: string;
  };
}

export async function submitAssessment(payload: SubmitAssessmentPayload): Promise<SubmitAssessmentResponse> {
  const res = await fetch("/api/v1/assessments/tt17/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authClient.getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Không thể nộp hồ sơ đánh giá.");
  }
  const json = await res.json();
  const creds = json.credentials || (json.account ? {
    email: json.account.email,
    temporaryPassword: json.account.temporaryPassword || "NacenTech@2026",
    enterpriseCode: json.account.taxCode,
  } : undefined);

  return {
    ...json.data,
    autoProvisioned: json.autoProvisioned,
    message: json.message,
    account: json.account,
    credentials: creds,
  };
}


export async function getGovAssessmentQueue(scopeId?: string, status?: string): Promise<Tt17Assessment[]> {
  try {
    const p = new URLSearchParams();
    if (scopeId) p.set("scopeId", scopeId);
    if (status) p.set("status", status);
    const res = await fetch(`/api/v1/gov/assessments/tt17?${p.toString()}`, { headers: authClient.getAuthHeaders() });
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (err) {
    console.error("Lỗi khi tải hàng đợi đánh giá:", err);
  }
  return [];
}

export async function reviewAssessment(id: string, action: "APPROVE" | "REJECT" | "REQUEST_CHANGES", reviewNotes?: string): Promise<Tt17Assessment> {
  const res = await fetch(`/api/v1/gov/assessments/tt17/${id}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authClient.getAuthHeaders() },
    body: JSON.stringify({ action, reviewNotes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Không thể xử lý phê duyệt hồ sơ.");
  }
  const json = await res.json();
  return json.data;
}

// Thuật toán tính tốc độ tăng năng suất lao động bình quân từ chuỗi tài chính 3 năm (Chuẩn Backend Tt17ScoringEngine)
export function calculateLaborProductivityGrowth(series?: FinancialSeriesItem[]): number {
  if (!series || series.length < 2) return 5.0; // Mặc định 5% nếu chưa đủ chuỗi 2 kỳ
  const ordered = [...series].sort((a, b) => a.year - b.year);
  const y1 = ordered[0];
  const yLast = ordered[ordered.length - 1];

  const val1 = y1.industrialOutputValue || y1.netRevenue || 0;
  const workers1 = y1.directWorkersCount || (y1 as any).workforce || 0;
  const prod1 = workers1 > 0 ? val1 / workers1 : 0;

  const valLast = yLast.industrialOutputValue || yLast.netRevenue || 0;
  const workersLast = yLast.directWorkersCount || (yLast as any).workforce || 0;
  const prodLast = workersLast > 0 ? valLast / workersLast : 0;

  if (prod1 <= 0) return 5.0;
  const totalGrowth = ((prodLast - prod1) / prod1) * 100.0;
  const years = Math.max(1, yLast.year - y1.year);
  return Math.round((totalGrowth / years) * 100) / 100;
}

// Client-side instant calculator simulation (Zero-Mock 26 Tiêu Chí Chuẩn Thông Tư 17)
export function calculateLocalScore(survey: Tt17SurveyData): Tt17ScoreResult {
  const criteria: CriterionScore[] = [];

  // T
  const s01 = survey.depreciationCoefficient <= 0.3 ? 4 : survey.depreciationCoefficient <= 0.5 ? 3 : survey.depreciationCoefficient <= 0.7 ? 2 : 1;
  criteria.push({ code: "TC01", group: "T", name: "Hệ số hao mòn máy móc, thiết bị (K_kh)", maxScore: 4, achievedScore: s01, isBottleneck: s01 < 1.6, recommendation: "Đổi mới thiết bị cũ." });
  const s02 = survey.modernEquipmentRatio >= 70 ? 5 : survey.modernEquipmentRatio >= 50 ? 4 : survey.modernEquipmentRatio >= 30 ? 3 : survey.modernEquipmentRatio >= 15 ? 2 : 1;
  criteria.push({ code: "TC02", group: "T", name: "Tỷ lệ máy móc thiết bị thế hệ mới", maxScore: 5, achievedScore: s02, isBottleneck: s02 < 2, recommendation: "Tăng tỷ lệ thiết bị thế hệ mới." });
  const s03 = survey.advancedCountryEquipmentRatio >= 60 ? 5 : survey.advancedCountryEquipmentRatio >= 40 ? 4 : survey.advancedCountryEquipmentRatio >= 20 ? 3 : 2;
  criteria.push({ code: "TC03", group: "T", name: "Tỷ lệ máy móc nhập khẩu nước tiên tiến G7/OECD", maxScore: 5, achievedScore: s03, isBottleneck: s03 < 2, recommendation: "Tiếp cận công nghệ G7." });
  const s04 = survey.automationRatio >= 70 ? 5 : survey.automationRatio >= 50 ? 4 : survey.automationRatio >= 30 ? 3 : 2;
  criteria.push({ code: "TC04", group: "T", name: "Mức độ tự động hóa máy móc (CNC/PLC/Robot)", maxScore: 5, achievedScore: s04, isBottleneck: s04 < 2, recommendation: "Đẩy mạnh ứng dụng CNC/Robot." });
  const s05 = survey.averageEquipmentAge <= 5 ? 4 : survey.averageEquipmentAge <= 10 ? 3 : 2;
  criteria.push({ code: "TC05", group: "T", name: "Tuổi trung bình của máy móc chính", maxScore: 4, achievedScore: s05, isBottleneck: s05 < 1.6, recommendation: "Thay thế máy móc trên 10 năm." });
  const s06 = Math.min(3, Math.max(1, survey.lineSynchronizationLevel * 0.6));
  criteria.push({ code: "TC06", group: "T", name: "Mức độ đồng bộ của dây chuyền công nghệ", maxScore: 3, achievedScore: s06, isBottleneck: s06 < 1.2, recommendation: "Đồng bộ hóa công đoạn." });
  const s07 = survey.materialConsumptionRatio <= 95 ? 4 : survey.materialConsumptionRatio <= 100 ? 3 : 2;
  criteria.push({ code: "TC07", group: "T", name: "Mức tiêu hao nguyên vật liệu so với định mức", maxScore: 4, achievedScore: s07, isBottleneck: s07 < 1.6, recommendation: "Giảm hao hụt nguyên vật liệu." });
  const scoreT = Math.min(30, s01 + s02 + s03 + s04 + s05 + s06 + s07);

  // E
  const laborGrowth = calculateLaborProductivityGrowth(survey.financialSeries);
  const s08 = laborGrowth >= 15 ? 5 : laborGrowth >= 10 ? 4 : laborGrowth >= 5 ? 3 : laborGrowth >= 0 ? 2 : 1;
  criteria.push({ code: "TC08", group: "E", name: "Tốc độ tăng năng suất lao động", maxScore: 5, achievedScore: s08, isBottleneck: s08 < 2, recommendation: "Cải tiến năng suất lao động." });
  const s09 = survey.defectProductRatio <= 1 ? 4 : survey.defectProductRatio <= 3 ? 3 : 2;
  criteria.push({ code: "TC09", group: "E", name: "Tỷ lệ sản phẩm lỗi trong sản xuất", maxScore: 4, achievedScore: s09, isBottleneck: s09 < 1.6, recommendation: "Áp dụng kiểm soát chất lượng." });
  const s10 = survey.capacityUtilizationRatio >= 85 ? 4 : survey.capacityUtilizationRatio >= 70 ? 3 : 2;
  criteria.push({ code: "TC10", group: "E", name: "Mức độ sử dụng công suất thiết kế", maxScore: 4, achievedScore: s10, isBottleneck: s10 < 1.6, recommendation: "Tối ưu công suất vận hành." });
  const s11 = survey.exportRevenueRatio >= 50 ? 4 : survey.exportRevenueRatio >= 30 ? 3 : 2;
  criteria.push({ code: "TC11", group: "E", name: "Tỷ lệ xuất khẩu & chuỗi giá trị toàn cầu", maxScore: 4, achievedScore: s11, isBottleneck: s11 < 1.6, recommendation: "Mở rộng xuất khẩu." });
  const s12 = survey.energySavingRatio >= 10 ? 3 : survey.energySavingRatio >= 5 ? 2 : 1;
  criteria.push({ code: "TC12", group: "E", name: "Mức độ tiết kiệm năng lượng", maxScore: 3, achievedScore: s12, isBottleneck: s12 < 1.2, recommendation: "Đầu tư công nghệ tiết kiệm điện." });
  const scoreE = Math.min(20, s08 + s09 + s10 + s11 + s12);

  // O
  const s13 = survey.isoCertifications.length >= 3 ? 5 : survey.isoCertifications.length >= 2 ? 4 : survey.isoCertifications.length >= 1 ? 3 : 0;
  criteria.push({ code: "TC13", group: "O", name: "Áp dụng hệ thống quản lý ISO", maxScore: 5, achievedScore: s13, isBottleneck: s13 < 2, recommendation: "Áp dụng ISO 9001/14001." });
  const s14 = survey.softwareApplications.length >= 3 ? 5 : survey.softwareApplications.length >= 2 ? 4 : survey.softwareApplications.length >= 1 ? 3 : 0;
  criteria.push({ code: "TC14", group: "O", name: "Ứng dụng phần mềm quản trị ERP / MES", maxScore: 5, achievedScore: s14, isBottleneck: s14 < 2, recommendation: "Triển khai ERP và MES." });
  const s15 = survey.productivityTools.length >= 2 ? 3 : survey.productivityTools.length >= 1 ? 2 : 0;
  criteria.push({ code: "TC15", group: "O", name: "Công cụ cải tiến 5S, Kaizen, Lean", maxScore: 3, achievedScore: s15, isBottleneck: s15 < 1.2, recommendation: "Thực hành 5S/Kaizen." });
  const s16 = Math.min(3, Math.max(0, survey.digitalMaturityLevel * 0.6));
  criteria.push({ code: "TC16", group: "O", name: "Mức độ chuyển đổi số và an toàn thông tin", maxScore: 3, achievedScore: s16, isBottleneck: s16 < 1.2, recommendation: "Thúc đẩy chuyển đổi số." });
  const s17 = survey.environmentalCompliant ? 3 : 0;
  criteria.push({ code: "TC17", group: "O", name: "Tuân thủ quy định bảo vệ môi trường", maxScore: 3, achievedScore: s17, isBottleneck: s17 < 1.2, recommendation: "Xử lý chất thải đạt chuẩn." });
  const scoreO = Math.min(19, s13 + s14 + s15 + s16 + s17);

  // R
  const rdRatio = survey.totalWorkforce > 0 ? (survey.rdWorkforceCount * 100) / survey.totalWorkforce : 0;
  const s18 = rdRatio >= 5 ? 4 : rdRatio >= 3 ? 3 : rdRatio >= 1 ? 2 : 0;
  criteria.push({ code: "TC18", group: "R", name: "Tỷ lệ nhân lực hoạt động R&D", maxScore: 4, achievedScore: s18, isBottleneck: s18 < 1.6, recommendation: "Tăng cường kỹ sư R&D." });
  const s19 = survey.hasLabOrTestingFacility ? 3 : 0;
  criteria.push({ code: "TC19", group: "R", name: "Cơ sở vật chất R&D (Phòng Lab/CAD)", maxScore: 3, achievedScore: s19, isBottleneck: s19 < 1.2, recommendation: "Xây dựng phòng Lab thử nghiệm." });
  const s20 = survey.rdExpenseRatio >= 2 ? 4 : survey.rdExpenseRatio >= 1 ? 3 : survey.rdExpenseRatio >= 0.5 ? 2 : 0;
  criteria.push({ code: "TC20", group: "R", name: "Tỷ lệ kinh phí R&D trên doanh thu", maxScore: 4, achievedScore: s20, isBottleneck: s20 < 1.6, recommendation: "Tăng ngân sách R&D." });
  const s21 = survey.rdProjectsCount >= 3 ? 3 : survey.rdProjectsCount >= 1 ? 2 : 0;
  criteria.push({ code: "TC21", group: "R", name: "Số đề tài, dự án R&D đã thực hiện", maxScore: 3, achievedScore: s21, isBottleneck: s21 < 1.2, recommendation: "Đăng ký đề tài KH&CN." });
  const s22 = Math.min(3, Math.max(0, survey.technologyMasteryLevel * 0.6));
  criteria.push({ code: "TC22", group: "R", name: "Khả năng làm chủ và cải tiến công nghệ", maxScore: 3, achievedScore: s22, isBottleneck: s22 < 1.2, recommendation: "Nâng cao năng lực làm chủ thiết bị." });
  const scoreR = Math.min(17, s18 + s19 + s20 + s21 + s22);

  // I
  const s23 = survey.grantedPatentsCount >= 2 ? 4 : survey.grantedPatentsCount >= 1 ? 3.5 : survey.registeredIpCount >= 2 ? 3 : survey.registeredIpCount >= 1 ? 2 : 0;
  criteria.push({ code: "TC23", group: "I", name: "Tài sản trí tuệ (Sáng chế, GPHI)", maxScore: 4, achievedScore: s23, isBottleneck: s23 < 1.6, recommendation: "Đăng ký bằng sáng chế/GPHI." });
  const s24 = survey.newProductRevenueRatio >= 30 ? 4 : survey.newProductRevenueRatio >= 20 ? 3 : survey.newProductRevenueRatio >= 10 ? 2 : 0;
  criteria.push({ code: "TC24", group: "I", name: "Doanh thu từ sản phẩm mới thương mại hóa", maxScore: 4, achievedScore: s24, isBottleneck: s24 < 1.6, recommendation: "Đẩy mạnh đưa sản phẩm mới ra thị trường." });
  const s25 = survey.academyPartnershipCount >= 2 ? 3 : survey.academyPartnershipCount >= 1 ? 2 : 0;
  criteria.push({ code: "TC25", group: "I", name: "Hợp tác ĐMST với Viện / Trường", maxScore: 3, achievedScore: s25, isBottleneck: s25 < 1.2, recommendation: "Liên kết Viện/Trường." });
  const s26 = survey.hasInternalInnovationPolicy ? 3 : 0;
  criteria.push({ code: "TC26", group: "I", name: "Chính sách khuyến khích sáng kiến nội bộ", maxScore: 3, achievedScore: s26, isBottleneck: s26 < 1.2, recommendation: "Xây dựng quỹ khen thưởng sáng kiến." });
  const scoreI = Math.min(14, s23 + s24 + s25 + s26);

  const total = Math.round((scoreT + scoreE + scoreO + scoreR + scoreI) * 100) / 100;
  let sync = 0;
  if (scoreT > 0 && scoreE > 0 && scoreO > 0 && scoreR > 0 && scoreI > 0) {
    sync = Math.round(Math.pow(scoreT / 30, 0.3) * Math.pow(scoreE / 20, 0.2) * Math.pow(scoreO / 19, 0.19) * Math.pow(scoreR / 17, 0.17) * Math.pow(scoreI / 14, 0.14) * 100) / 100;
  }

  let classification: Tt17ScoreResult["classification"] = "CAN_THAM_DINH";
  let classificationLabel = "Cần thẩm định chuyên gia";

  if (total >= 75 && sync >= 0.65) {
    classification = "TIEN_TIEN";
    classificationLabel = "Tiên tiến";
  } else if (total >= 60 && total < 75 && sync >= 0.5) {
    classification = "TRUNG_BINH_TIEN_TIEN";
    classificationLabel = "Trung bình tiên tiến";
  } else if (total >= 35 && total < 60 && sync >= 0.3) {
    classification = "TRUNG_BINH";
    classificationLabel = "Trung bình";
  } else if (total < 35 && sync < 0.3) {
    classification = "LAC_HAU";
    classificationLabel = "Lạc hậu";
  }

  const bottlenecks = criteria.filter((c) => c.isBottleneck).map((c) => c.code);

  return {
    scoreT: Math.round(scoreT * 100) / 100,
    scoreE: Math.round(scoreE * 100) / 100,
    scoreO: Math.round(scoreO * 100) / 100,
    scoreR: Math.round(scoreR * 100) / 100,
    scoreI: Math.round(scoreI * 100) / 100,
    totalScore: total,
    syncCoefficient: sync,
    classification,
    classificationLabel,
    criteria,
    bottlenecks,
  };
}
