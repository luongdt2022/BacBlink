import { authClient } from "@/lib/auth-client";

export interface IndustryBenchmark {
  industryCode: string;
  industryName: string;
  kChuan1: number; // Hệ số tự động hóa trung bình (triệu đồng/lao động)
  kChuan2: number; // Hệ số chi phí năng lượng trung bình (Gnl / Gdt)
  kChuan3: number; // Hệ số chi phí nguyên vật liệu trung bình (Gnvl / Gdt)
  kChuan4: number; // Năng suất lao động trung bình (triệu đồng/người/năm)
}

export const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmark> = {
  "C.10": { industryCode: "C.10", industryName: "Sản xuất chế biến thực phẩm", kChuan1: 200, kChuan2: 0.07, kChuan3: 0.75, kChuan4: 150 },
  "C.11": { industryCode: "C.11", industryName: "Sản xuất đồ uống", kChuan1: 200, kChuan2: 0.05, kChuan3: 0.20, kChuan4: 150 },
  "C.12": { industryCode: "C.12", industryName: "Sản xuất sản phẩm thuốc lá", kChuan1: 200, kChuan2: 0.07, kChuan3: 0.45, kChuan4: 200 },
  "C.13": { industryCode: "C.13", industryName: "Dệt", kChuan1: 200, kChuan2: 0.05, kChuan3: 0.40, kChuan4: 75 },
  "C.14": { industryCode: "C.14", industryName: "Sản xuất trang phục", kChuan1: 200, kChuan2: 0.05, kChuan3: 0.65, kChuan4: 75 },
  "C.15": { industryCode: "C.15", industryName: "Sản xuất da và các sản phẩm có liên quan", kChuan1: 200, kChuan2: 0.05, kChuan3: 0.35, kChuan4: 75 },
  "C.16": { industryCode: "C.16", industryName: "Chế biến gỗ và sản xuất sản phẩm từ gỗ, tre, nứa", kChuan1: 150, kChuan2: 0.05, kChuan3: 0.65, kChuan4: 100 },
  "C.17": { industryCode: "C.17", industryName: "Sản xuất giấy và sản phẩm từ giấy", kChuan1: 250, kChuan2: 0.05, kChuan3: 0.65, kChuan4: 100 },
  "C.18": { industryCode: "C.18", industryName: "In, sao chép bản ghi các loại", kChuan1: 250, kChuan2: 0.05, kChuan3: 0.65, kChuan4: 100 },
  "C.19": { industryCode: "C.19", industryName: "Sản xuất than cốc, sản phẩm dầu mỏ tinh chế", kChuan1: 300, kChuan2: 0.10, kChuan3: 0.75, kChuan4: 150 },
  "C.20": { industryCode: "C.20", industryName: "Sản xuất hóa chất và sản phẩm hóa chất", kChuan1: 250, kChuan2: 0.10, kChuan3: 0.55, kChuan4: 150 },
  "C.21": { industryCode: "C.21", industryName: "Sản xuất thuốc, hóa dược và dược liệu", kChuan1: 300, kChuan2: 0.07, kChuan3: 0.60, kChuan4: 200 },
  "C.22": { industryCode: "C.22", industryName: "Sản xuất sản phẩm từ cao su và plastic", kChuan1: 250, kChuan2: 0.10, kChuan3: 0.55, kChuan4: 150 },
  "C.23": { industryCode: "C.23", industryName: "Sản xuất sản phẩm từ khoáng phi kim loại khác", kChuan1: 250, kChuan2: 0.10, kChuan3: 0.40, kChuan4: 100 },
  "C.24": { industryCode: "C.24", industryName: "Sản xuất kim loại", kChuan1: 300, kChuan2: 0.10, kChuan3: 0.65, kChuan4: 150 },
  "C.25": { industryCode: "C.25", industryName: "Sản xuất sản phẩm từ kim loại đúc sẵn (trừ máy móc, TB)", kChuan1: 300, kChuan2: 0.07, kChuan3: 0.65, kChuan4: 100 },
  "C.26": { industryCode: "C.26", industryName: "Sản xuất sản phẩm điện tử, máy vi tính và quang học", kChuan1: 300, kChuan2: 0.05, kChuan3: 0.45, kChuan4: 100 },
  "C.27": { industryCode: "C.27", industryName: "Sản xuất thiết bị điện", kChuan1: 300, kChuan2: 0.05, kChuan3: 0.45, kChuan4: 100 },
  "C.28": { industryCode: "C.28", industryName: "Sản xuất máy móc, thiết bị chưa được phân vào đâu", kChuan1: 300, kChuan2: 0.07, kChuan3: 0.55, kChuan4: 150 },
  "C.29": { industryCode: "C.29", industryName: "Sản xuất xe có động cơ", kChuan1: 300, kChuan2: 0.07, kChuan3: 0.65, kChuan4: 150 },
  "C.30": { industryCode: "C.30", industryName: "Sản xuất phương tiện vận tải khác", kChuan1: 300, kChuan2: 0.07, kChuan3: 0.65, kChuan4: 150 },
  "C.31": { industryCode: "C.31", industryName: "Sản xuất giường, tủ, bàn, ghế", kChuan1: 150, kChuan2: 0.05, kChuan3: 0.55, kChuan4: 100 },
  "C.32": { industryCode: "C.32", industryName: "Công nghiệp chế biến, chế tạo khác", kChuan1: 200, kChuan2: 0.07, kChuan3: 0.55, kChuan4: 150 },
};

export interface MachineryItem {
  name: string; // Cột 1: Tên thiết bị, máy móc, công nghệ
  quantity?: number; // Cột 2: Số lượng
  manufactureYear: number; // Cột 3: Năm sản xuất
  startUsageYear: number; // Cột 4: Năm đưa vào sử dụng
  productName?: string; // Cột 5: Tên sản phẩm / bán sản phẩm
  designedCapacityYear?: number | string; // Cột 6: Sản lượng theo thiết kế tối đa/năm
  originCountry?: string;
  originalCost?: number;
  currentBookValue?: number;
  isAutomated?: boolean;
  isAdvancedCountry?: boolean;
}

export interface FinancialSeriesItem {
  year: number;
  industrialOutputValue: number; // G_sp (VNĐ)
  netRevenue: number; // G_dt (VNĐ)
  totalCosts?: number; // G_cp (VNĐ)
  actualOutput?: number; // P_tt
  designedCapacity?: number; // P
  directWorkersCount: number; // M_tt
}

export interface Tt17SurveyData {
  // Mục A: Thông tin chung & Pháp nhân
  companyName?: string;
  taxCode?: string;
  contactPerson?: string;
  totalCapital: number; // Tổng nguồn vốn (VNĐ)
  totalWorkforce: number; // Tổng số lao động M
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyType: string;
  industryCode?: string; // C.10 - C.32 (Ngành 1 chính)

  // Mục A.9: Ngành sản xuất kinh doanh phụ (Theo thứ tự doanh thu/LĐ giảm dần - Phụ lục I TT17)
  secondaryIndustry2?: string;
  secondaryIndustry3?: string;

  // Mục A.10: Địa chỉ cơ sở sản xuất 1, 2, 3 (Phục vụ thẩm định thực địa)
  productionFacilityAddress1?: string;
  productionFacilityAddress2?: string;
  productionFacilityAddress3?: string;

  // Mục B: Máy móc & Thiết bị sản xuất
  machineries: MachineryItem[];
  originalCostEquipment: number; // G_bd: Nguyên giá thiết bị ban đầu (VNĐ)
  currentBookValueEquipment: number; // G_sx: Giá trị thiết bị hiện tại đã khấu hao (VNĐ)
  newInvestEquipment3Years: number; // G_tbm1: Thiết bị mới mở rộng SX trong 3 năm (VNĐ)
  replacementEquipment3Years: number; // G_tbm2: Thiết bị mới thay thế bảo dưỡng trong 3 năm (VNĐ)
  digitalEquipmentValue: number; // G_sh: Giá trị thiết bị liên quan đến số hóa SX (VNĐ)
  transferredTechTypes: string[]; // 'dong_bo' | 'ban_quyen' | 'cai_tien' | 'sang_che'
  transferredTechValue: number; // Tổng giá trị hợp đồng chuyển giao công nghệ (VNĐ)

  // Legacy/Fallback fields
  depreciationCoefficient?: number; // K_kh fallback
  modernEquipmentRatio?: number;
  advancedCountryEquipmentRatio?: number;
  automationRatio?: number;
  averageEquipmentAge?: number;
  lineSynchronizationLevel?: number;
  materialConsumptionRatio?: number;

  // Mục C: Hoạt động SXKD 3 năm
  financialSeries: FinancialSeriesItem[];
  // Mục C.2: Tên tối đa 03 sản phẩm có doanh thu cao nhất (Trang 24–25 Phụ lục I TT17)
  mainProduct1Name?: string;
  mainProduct1Share?: number;
  mainProduct2Name?: string;
  mainProduct2Share?: number;
  mainProduct3Name?: string;
  mainProduct3Share?: number;
  mainProductStandard: "co_so" | "quoc_gia" | "quoc_te" | "co_so_vuot_quoc_te"; // TC07
  energyCostYear: number; // G_nl: Chi phí điện & nhiên liệu năm gần nhất (VNĐ)
  materialCostYear: number; // G_nvl: Chi phí nguyên vật liệu năm gần nhất (VNĐ)
  hasKaizenPolicy: boolean; // Chương trình thúc đẩy sáng kiến
  kaizenCount3Years: number; // Số lượng sáng kiến
  hasHighImpactKaizen: boolean; // Sáng kiến hiệu quả kinh tế cao
  kaizenHighlights?: string; // Tên 1-3 sáng kiến cải tiến tiêu biểu (tùy chọn)
  maintenanceLevel: 1 | 2 | 3 | 4; // TC10: 1-sự cố, 2-định kỳ, 3-chuyên sâu, 4-chẩn đoán

  // Legacy/Fallback Mục C
  defectProductRatio?: number;
  capacityUtilizationRatio?: number;
  exportRevenueRatio?: number;
  energySavingRatio?: number;

  // Mục D: Nhân lực & Quản trị Môi trường
  directWorkers: number; // M_tt: Công nhân trực tiếp
  indirectStaff: number; // M_gt = M - M_tt
  trainedWorkers: number; // Công nhân qua đào tạo nghề
  highSkilledWorkers: number; // M_bc: Công nhân bậc cao / nghệ nhân
  qualifiedManagers: number; // M_ql: Cán bộ quản lý phù hợp
  qualifiedProfessionals: number; // M_nv: Cán bộ nghiệp vụ ĐH trở lên
  trainingCost3Years: number; // G_dthl: Tổng chi cho đào tạo huấn luyện 3 năm (VNĐ)
  softwareApplications: string[]; // MES, ERP, PLM, PDM, PPS, SCM (TC14)
  dataCollectionSystems: string[]; // SCADA/PDA, MDC, FMS/DCS, CIM (TC04 tích hợp)
  isoCertifications: string[]; // ISO 9001, HACCP, GMP, ISO 22000 (TC16)
  productivityTools: string[]; // 5S, Kaizen, Lean, Six Sigma (TC16)
  environmentalCompliant: boolean; // Hệ thống xử lý chất thải đạt chuẩn
  hasIso14001: boolean; // Chứng chỉ ISO 14001
  hasWasteRecycling: boolean; // Tái chế, tái sử dụng chất thải (TC17)

  // Legacy/Fallback Mục D
  digitalMaturityLevel?: number;

  // Mục Đ: CNTT & Năng lực R&D
  itInfrastructureLevel: 1 | 2 | 3; // 1: cơ bản, 2: tự động hóa quy trình, 3: tích hợp toàn diện (TC18)
  itExpenses3Years: number; // G_tt: Tổng chi cho CNTT 3 năm (VNĐ) (TC19)
  rdFacilityLevel: 1 | 2 | 3; // 1: kiêm nhiệm, 2: lab/chuyên trách, 3: viện/trung tâm R&D (TC21)
  rdWorkforceCount: number; // M_r&d: Nhân lực làm R&D (TC20)
  rdExpenses3Years: number; // G_rd: Tổng chi R&D 3 năm (VNĐ) (TC22)
  hasSciTechFund: boolean; // Thành lập Quỹ phát triển KH&CN (TC22)

  // Legacy/Fallback Mục Đ
  hasLabOrTestingFacility?: boolean;
  rdExpenseRatio?: number;
  rdProjectsCount?: number;
  technologyMasteryLevel?: number;

  // Mục E: Đổi mới sáng tạo & Chuyển đổi số 4.0
  // Mục E.1: Tên 1–3 sản phẩm mới tiêu biểu tạo ra trong 3 năm qua (Trang 29–30 Phụ lục I TT17)
  newProductNames?: string;
  newProductType: "none" | "kieu_dang" | "tinh_nang" | "hoan_toan_moi"; // TC23
  newProductRevenueRatio: number; // % doanh thu từ sản phẩm mới (TC23)
  rdTechnologyResult: "none" | "dang_nghien_cuu" | "thu_nghiem_lab" | "giai_phap_huu_ich" | "bang_sang_che"; // TC24
  academyPartnershipType: "none" | "chuyen_gia_dao_tao" | "du_an_rd"; // TC25
  digitalStrategyLevel: "chua_biet" | "chuan_bi" | "dang_thuc_hien" | "da_xay_dung"; // TC26
  digitalTechnologies: string[]; // Cloud, Robot, AR, VR, BigData, TichHop, MoHinhHoa, AnNinhMang, IoT, VatLieuMoi, Blockchain, In3D
  digitalAdoptionScope: "nghien_cuu" | "mot_so_bo_phan" | "toan_nha_may"; // TC26

  // Legacy/Fallback Mục E
  grantedPatentsCount?: number;
  registeredIpCount?: number;
  academyPartnershipCount?: number;
  hasInternalInnovationPolicy?: boolean;
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
  companyType: "Công ty TNHH",
  industryCode: "C.10",
  secondaryIndustry2: "",
  secondaryIndustry3: "",
  productionFacilityAddress1: "",
  productionFacilityAddress2: "",
  productionFacilityAddress3: "",

  machineries: [
    {
      name: "",
      quantity: 1,
      manufactureYear: 2021,
      startUsageYear: 2022,
      productName: "",
      designedCapacityYear: "",
    },
  ],
  originalCostEquipment: 0,
  currentBookValueEquipment: 0,
  newInvestEquipment3Years: 0,
  replacementEquipment3Years: 0,
  digitalEquipmentValue: 0,
  transferredTechTypes: [],
  transferredTechValue: 0,

  financialSeries: [
    { year: 2023, industrialOutputValue: 0, netRevenue: 0, directWorkersCount: 0, actualOutput: 0, designedCapacity: 0 },
    { year: 2024, industrialOutputValue: 0, netRevenue: 0, directWorkersCount: 0, actualOutput: 0, designedCapacity: 0 },
    { year: 2025, industrialOutputValue: 0, netRevenue: 0, directWorkersCount: 0, actualOutput: 0, designedCapacity: 0 },
  ],
  mainProduct1Name: "",
  mainProduct1Share: 0,
  mainProduct2Name: "",
  mainProduct2Share: 0,
  mainProduct3Name: "",
  mainProduct3Share: 0,
  mainProductStandard: "co_so",
  energyCostYear: 0,
  materialCostYear: 0,
  hasKaizenPolicy: false,
  kaizenCount3Years: 0,
  hasHighImpactKaizen: false,
  maintenanceLevel: 1,

  directWorkers: 0,
  indirectStaff: 0,
  trainedWorkers: 0,
  highSkilledWorkers: 0,
  qualifiedManagers: 0,
  qualifiedProfessionals: 0,
  trainingCost3Years: 0,
  softwareApplications: [],
  dataCollectionSystems: [],
  isoCertifications: [],
  productivityTools: [],
  environmentalCompliant: false,
  hasIso14001: false,
  hasWasteRecycling: false,

  itInfrastructureLevel: 1,
  itExpenses3Years: 0,
  rdFacilityLevel: 1,
  rdWorkforceCount: 0,
  rdExpenses3Years: 0,
  hasSciTechFund: false,

  newProductNames: "",
  newProductType: "none",
  newProductRevenueRatio: 0,
  rdTechnologyResult: "none",
  academyPartnershipType: "none",
  digitalStrategyLevel: "chua_biet",
  digitalTechnologies: [],
  digitalAdoptionScope: "nghien_cuu",
};

// Dữ liệu mẫu kiểm chuẩn TT17: CÔNG TY TNHH ĐẠI HƯNG (Cột D Excel Benchmark)
export const SAMPLE_BENCHMARK_DAIHUNG: Tt17SurveyData = {
  companyName: "CÔNG TY TNHH ĐẠI HƯNG",
  taxCode: "1200345678",
  contactPerson: "Trần Đại Hưng",
  companyAddress: "Ấp Tân Bình, Xã Tân Hội, Thị xã Cai Lậy, Tiền Giang",
  companyPhone: "02733888999",
  companyEmail: "daihung@example.vn",
  companyType: "Công ty TNHH",
  industryCode: "C.10",
  totalCapital: 10000000000,
  totalWorkforce: 50,
  directWorkers: 50,
  indirectStaff: 0,

  machineries: [
    {
      name: "",
      quantity: 1,
      manufactureYear: 2021,
      startUsageYear: 2022,
      productName: "",
      designedCapacityYear: "",
    },
  ],
  originalCostEquipment: 10000000000,
  currentBookValueEquipment: 3000000000,
  newInvestEquipment3Years: 3000000000,
  replacementEquipment3Years: 0,
  digitalEquipmentValue: 15000000000,
  transferredTechTypes: [],
  transferredTechValue: 0,

  financialSeries: [
    { year: 2023, industrialOutputValue: 25000000000, netRevenue: 25000000000, directWorkersCount: 45, actualOutput: 40, designedCapacity: 100 },
    { year: 2024, industrialOutputValue: 28000000000, netRevenue: 28000000000, directWorkersCount: 48, actualOutput: 40, designedCapacity: 100 },
    { year: 2025, industrialOutputValue: 31726700000, netRevenue: 31726700000, directWorkersCount: 50, actualOutput: 40, designedCapacity: 100 },
  ],
  mainProduct1Name: "Gạo thơm xuất khẩu ST25",
  mainProduct1Share: 60,
  mainProduct2Name: "Gạo tấm xuất khẩu",
  mainProduct2Share: 25,
  mainProduct3Name: "Cám gạo trích ly",
  mainProduct3Share: 15,
  mainProductStandard: "co_so",
  energyCostYear: 300000000,
  materialCostYear: 4000000000,
  hasKaizenPolicy: true,
  kaizenCount3Years: 2,
  hasHighImpactKaizen: false,
  maintenanceLevel: 2,

  trainedWorkers: 20,
  highSkilledWorkers: 2,
  qualifiedManagers: 0,
  qualifiedProfessionals: 0,
  trainingCost3Years: 200000000,
  softwareApplications: ["ERP", "MES"],
  dataCollectionSystems: [],
  isoCertifications: [],
  productivityTools: ["5S"],
  environmentalCompliant: true,
  hasIso14001: true,
  hasWasteRecycling: true,

  itInfrastructureLevel: 1,
  itExpenses3Years: 10000000,
  rdFacilityLevel: 1,
  rdWorkforceCount: 1,
  rdExpenses3Years: 0,
  hasSciTechFund: false,

  newProductNames: "Gạo hữu cơ hút chân không đóng gói túi zip 1kg",
  newProductType: "kieu_dang",
  newProductRevenueRatio: 0,
  rdTechnologyResult: "dang_nghien_cuu",
  academyPartnershipType: "chuyen_gia_dao_tao",
  digitalStrategyLevel: "chua_biet",
  digitalTechnologies: ["IoT"],
  digitalAdoptionScope: "nghien_cuu",
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
  const url = id === "current" ? "/api/v1/assessments/tt17/current" : `/api/v1/assessments/tt17/${id}`;
  try {
    const res = await fetch(url, { headers: authClient.getAuthHeaders() });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.error("Lỗi khi tải báo cáo đánh giá:", err);
  }
  return null;
}

export async function saveAssessmentDraft(
  arg1: number | { assessmentYear?: number; industryCode?: string; scopeId?: string; surveyData: Tt17SurveyData },
  surveyData?: Tt17SurveyData,
  industryCode = "C.28",
  scopeId = "HP"
): Promise<Tt17Assessment> {
  let bodyPayload: any;
  if (typeof arg1 === "object" && arg1 !== null) {
    bodyPayload = {
      assessmentYear: arg1.assessmentYear || 2026,
      industryCode: arg1.industryCode || "C.28",
      scopeId: arg1.scopeId || "HP",
      surveyData: arg1.surveyData,
    };
  } else {
    bodyPayload = {
      assessmentYear: arg1 || 2026,
      industryCode: industryCode || "C.28",
      scopeId: scopeId || "HP",
      surveyData: surveyData,
    };
  }

  if (bodyPayload.surveyData?.machineries) {
    bodyPayload.surveyData.machineries = bodyPayload.surveyData.machineries.map((m: any) => ({
      ...m,
      designedCapacityYear: Number(m.designedCapacityYear) || 0,
      originalCost: Number(m.originalCost) || 0,
      currentBookValue: Number(m.currentBookValue) || 0,
      manufactureYear: Number(m.manufactureYear) || 0,
      startUsageYear: Number(m.startUsageYear) || 0,
    }));
  }

  const res = await fetch("/api/v1/assessments/tt17/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authClient.getAuthHeaders() },
    body: JSON.stringify(bodyPayload),
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
  const sanitizedSurveyData = payload.surveyData
    ? {
        ...payload.surveyData,
        machineries: payload.surveyData.machineries?.map((m: any) => ({
          ...m,
          designedCapacityYear: Number(m.designedCapacityYear) || 0,
          originalCost: Number(m.originalCost) || 0,
          currentBookValue: Number(m.currentBookValue) || 0,
          manufactureYear: Number(m.manufactureYear) || 0,
          startUsageYear: Number(m.startUsageYear) || 0,
        })),
      }
    : payload.surveyData;

  const sanitizedPayload = {
    ...payload,
    surveyData: sanitizedSurveyData,
  };

  const res = await fetch("/api/v1/assessments/tt17/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authClient.getAuthHeaders() },
    body: JSON.stringify(sanitizedPayload),
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

export interface Tt17DashboardProvinceStat {
  scopeId: string;
  provinceName: string;
  count: number;
  approvedCount: number;
  submittedCount: number;
  avgTotalScore: number;
  maxTotalScore: number;
  minTotalScore: number;
  avgScoreT: number;
  avgScoreE: number;
  avgScoreO: number;
  avgScoreR: number;
  avgScoreI: number;
  avgSyncCoefficient: number;
  tienTienCount: number;
  trungBinhTienTienCount: number;
  trungBinhCount: number;
  lacHauCount: number;
}

export interface Tt17DashboardClassificationStat {
  classification: string;
  label: string;
  count: number;
  percentage: number;
  avgScore: number;
}

export interface Tt17DashboardIndustryStat {
  industryCode: string;
  count: number;
  percentage: number;
  avgTotalScore: number;
  avgScoreT: number;
  avgScoreE: number;
  avgScoreO: number;
  avgScoreR: number;
  avgScoreI: number;
}

export interface Tt17DashboardCriterionStat {
  code: string;
  group: string;
  name: string;
  maxScore: number;
  avgScore: number;
  achievementRate: number;
  bottleneckCount: number;
  bottleneckRate: number;
}

export interface Tt17DashboardEnterpriseItem {
  id: string;
  enterpriseName: string;
  taxCode: string;
  scopeId: string;
  industryCode: string;
  status: string;
  totalScore: number;
  scoreT: number;
  scoreE: number;
  scoreO: number;
  scoreR: number;
  scoreI: number;
  syncCoefficient: number;
  classification: string;
}

export interface Tt17DashboardData {
  totalAssessments: number;
  approvedCount: number;
  submittedCount: number;
  draftCount: number;
  changesRequestedCount: number;
  avgTotalScore: number;
  maxTotalScore: number;
  minTotalScore: number;
  avgSyncCoefficient: number;
  avgGroupScores: {
    scoreT: number;
    maxT: number;
    scoreE: number;
    maxE: number;
    scoreO: number;
    maxO: number;
    scoreR: number;
    maxR: number;
    scoreI: number;
    maxI: number;
  };
  byProvince: Tt17DashboardProvinceStat[];
  byClassification: Tt17DashboardClassificationStat[];
  byIndustry: Tt17DashboardIndustryStat[];
  criteriaStats: Tt17DashboardCriterionStat[];
  topEnterprises: Tt17DashboardEnterpriseItem[];
  bottomEnterprises: Tt17DashboardEnterpriseItem[];
}

export async function getTt17Dashboard(params?: {
  scopeId?: string;
  industryCode?: string;
  classification?: string;
}): Promise<Tt17DashboardData | null> {
  try {
    const p = new URLSearchParams();
    if (params?.scopeId) p.set("scopeId", params.scopeId);
    if (params?.industryCode) p.set("industryCode", params.industryCode);
    if (params?.classification) p.set("classification", params.classification);
    const res = await fetch(`/api/v1/admin/assessments/tt17/dashboard?${p.toString()}`, {
      headers: authClient.getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu Dashboard TT17:", err);
  }
  return null;
}

export function calculateLaborProductivityGrowth(series?: FinancialSeriesItem[]): number {
  if (!series || series.length < 2) return 5.0;
  const ordered = [...series].sort((a, b) => a.year - b.year);
  const y1 = ordered[0];
  const yLast = ordered[ordered.length - 1];

  const val1 = y1.industrialOutputValue || y1.netRevenue || 0;
  const workers1 = y1.directWorkersCount || 0;
  const prod1 = workers1 > 0 ? val1 / workers1 : 0;

  const valLast = yLast.industrialOutputValue || yLast.netRevenue || 0;
  const workersLast = yLast.directWorkersCount || 0;
  const prodLast = workersLast > 0 ? valLast / workersLast : 0;

  if (prod1 <= 0) return 5.0;
  const totalGrowth = ((prodLast - prod1) / prod1) * 100.0;
  const years = Math.max(1, yLast.year - y1.year);
  return Math.round((totalGrowth / years) * 100) / 100;
}

// ============================================================================
// CALCULATE LOCAL SCORE: THUẬT TOÁN TÍNH ĐIỂM 26 TIÊU CHÍ TT17 TỪ PHIẾU THU THẬP
// ÁNH XẠ CHÍNH XÁC TỪ FILE EXCEL SSOT (Bảng khảo sát & Nhóm ngành)
// ============================================================================
export function calculateLocalScore(survey: Tt17SurveyData, industryCodeInput?: string): Tt17ScoreResult {
  const criteria: CriterionScore[] = [];
  const indCode = industryCodeInput || survey.industryCode || "C.28";
  const benchmark = INDUSTRY_BENCHMARKS[indCode] || INDUSTRY_BENCHMARKS["C.28"];

  // Dữ liệu tài chính năm gần nhất
  const series = survey.financialSeries || [];
  const sortedSeries = [...series].sort((a, b) => b.year - a.year);
  const latestFinancial: FinancialSeriesItem = sortedSeries[0] || {
    year: 2025,
    industrialOutputValue: 0,
    netRevenue: 0,
    directWorkersCount: 0,
    actualOutput: 0,
    designedCapacity: 0,
  };
  const gDt = latestFinancial.netRevenue || 0;
  const gSp = latestFinancial.industrialOutputValue || gDt;
  const mTt = survey.directWorkers || latestFinancial.directWorkersCount || Math.max(1, Math.round(survey.totalWorkforce * 0.7));
  const m = survey.totalWorkforce || Math.max(1, mTt + (survey.indirectStaff || 0));
  const mGt = Math.max(1, m - mTt);

  // --------------------------------------------------------------------------
  // NHÓM T: HIỆN TRẠNG CÔNG NGHỆ, THIẾT BỊ (TỐI ĐA 30 ĐIỂM)
  // --------------------------------------------------------------------------
  // TC01: Khấu hao TBCN (K_kh) - Max 5đ
  const gBd = survey.originalCostEquipment || 0;
  const gSx = survey.currentBookValueEquipment || 0;
  let kKh = 0;
  if (gBd > 0) {
    kKh = ((gBd - gSx) / gBd) * 100;
  } else if (survey.depreciationCoefficient !== undefined && survey.depreciationCoefficient > 0) {
    kKh = survey.depreciationCoefficient * 100;
  }
  let s01 = 1;
  if (gBd > 0 || (survey.depreciationCoefficient !== undefined && survey.depreciationCoefficient > 0)) {
    if (kKh < 20) s01 = 5;
    else if (kKh < 40) s01 = 4;
    else if (kKh < 60) s01 = 3;
    else if (kKh < 80) s01 = 2;
    else s01 = 1;
  }
  criteria.push({
    code: "TC01",
    group: "T",
    name: "Mức độ khấu hao thiết bị, công nghệ (K_kh)",
    maxScore: 5,
    achievedScore: s01,
    isBottleneck: s01 < 2,
    recommendation: "Đầu tư đổi mới các thiết bị đã khấu hao trên 60% để nâng cao hiệu suất.",
  });

  // TC02: Cường độ vốn TBCN (K_cd) - Max 3đ
  let kCd = 0;
  if (gDt > 0) {
    kCd = (gSx / gDt) * 100;
  }
  let s02 = 1;
  if (kCd >= 60) s02 = 3;
  else if (kCd >= 40) s02 = 2;
  else s02 = 1;
  criteria.push({
    code: "TC02",
    group: "T",
    name: "Cường độ vốn thiết bị, công nghệ (K_cđ)",
    maxScore: 3,
    achievedScore: s02,
    isBottleneck: s02 < 1.2,
    recommendation: "Gia tăng quy mô đầu tư máy móc trên mỗi đồng doanh thu.",
  });

  // TC03: Mức độ đổi mới TBCN (K_dm) - Max 3đ
  const gTbm1 = survey.newInvestEquipment3Years || 0;
  const gTbm2 = survey.replacementEquipment3Years || 0;
  let kDm = 0;
  if (gBd > 0) {
    kDm = ((gTbm1 + gTbm2) / gBd) * 100;
  } else if (survey.modernEquipmentRatio !== undefined && survey.modernEquipmentRatio > 0) {
    kDm = survey.modernEquipmentRatio;
  }
  let s03 = 0;
  if (kDm >= 75) s03 = 3;
  else if (kDm >= 50) s03 = 2;
  else if (kDm >= 25) s03 = 1;
  else s03 = 0;
  criteria.push({
    code: "TC03",
    group: "T",
    name: "Mức độ đổi mới thiết bị, công nghệ (K_đm)",
    maxScore: 3,
    achievedScore: s03,
    isBottleneck: s03 < 1.2,
    recommendation: "Lập kế hoạch mua sắm thiết bị mới mở rộng sản xuất hoặc thay thế định kỳ trong 3 năm.",
  });

  // TC04: Mức độ tự động hóa & tích hợp sản xuất - Max 7đ (Tự động hóa 3đ + Tích hợp 4đ)
  const gSh = survey.digitalEquipmentValue || 0;
  const kChuan1 = benchmark.kChuan1; // Triệu đồng / LĐ
  let kTdh = 0;
  if (mTt > 0 && gSh > 0) {
    kTdh = (gSh / 1000000) / mTt;
  } else if (survey.automationRatio !== undefined && survey.automationRatio > 0) {
    kTdh = (survey.automationRatio / 100) * 1.5 * kChuan1;
  }
  let s04Auto = 0;
  if (kTdh >= 1.5 * kChuan1) s04Auto = 3;
  else if (kTdh >= kChuan1) s04Auto = 2;
  else if (kTdh >= 0.5 * kChuan1) s04Auto = 1;
  else s04Auto = 0;

  const dataSys = survey.dataCollectionSystems || [];
  let s04Integ = 0;
  if (dataSys.some(s => /scada|pda/i.test(s))) s04Integ += 1;
  if (dataSys.some(s => /mdc/i.test(s))) s04Integ += 1;
  if (dataSys.some(s => /fms|dcs/i.test(s))) s04Integ += 1;
  if (dataSys.some(s => /cim/i.test(s))) s04Integ += 1;
  s04Integ = Math.min(4, Math.max(0, s04Integ));
  if (s04Integ === 0 && (survey.machineries || []).some(m => m.isAutomated)) s04Integ = 2;

  const s04 = Math.min(7, s04Auto + s04Integ);
  criteria.push({
    code: "TC04",
    group: "T",
    name: "Mức độ tự động hóa và tích hợp sản xuất (K_tđh & Hệ thống tích hợp)",
    maxScore: 7,
    achievedScore: s04,
    isBottleneck: s04 < 2.8,
    recommendation: `Đầu tư thiết bị số hóa (SCADA, MDC, CIM) đạt chuẩn ngành ${benchmark.industryCode} (K_chuẩn = ${kChuan1} trđ/LĐ).`,
  });

  // TC05: Tỷ lệ chi phí năng lượng (K_nl) - Max 4đ
  const gNl = survey.energyCostYear || 0;
  const kChuan2 = benchmark.kChuan2;
  let kNl = 0;
  if (gSp > 0) kNl = gNl / gSp;
  let s05 = 1;
  if (gSp > 0 && gNl > 0) {
    if (kNl <= 0.25 * kChuan2) s05 = 4;
    else if (kNl <= 0.5 * kChuan2) s05 = 3;
    else if (kNl <= kChuan2) s05 = 2;
    else s05 = 1;
  } else {
    s05 = 3;
  }
  criteria.push({
    code: "TC05",
    group: "T",
    name: "Tỷ lệ chi phí năng lượng sản xuất (K_nl)",
    maxScore: 4,
    achievedScore: s05,
    isBottleneck: s05 < 1.6,
    recommendation: `Tối ưu hóa tiêu hao điện/nhiên liệu nhằm đạt tỷ lệ dưới định mức ngành (${(kChuan2 * 100).toFixed(1)}%).`,
  });

  // TC06: Tỷ lệ chi phí nguyên vật liệu (K_nvl) - Max 4đ
  const gNvl = survey.materialCostYear || 0;
  const kChuan3 = benchmark.kChuan3;
  let kNvl = 0;
  if (gSp > 0) kNvl = gNvl / gSp;
  let s06 = 1;
  if (gSp > 0 && gNvl > 0) {
    if (kNvl <= 0.25 * kChuan3) s06 = 4;
    else if (kNvl <= 0.5 * kChuan3) s06 = 3;
    else if (kNvl <= kChuan3) s06 = 2;
    else s06 = 1;
  } else {
    s06 = 3;
  }
  criteria.push({
    code: "TC06",
    group: "T",
    name: "Tỷ lệ chi phí nguyên vật liệu sản xuất (K_nvl)",
    maxScore: 4,
    achievedScore: s06,
    isBottleneck: s06 < 1.6,
    recommendation: `Giảm tỷ lệ tiêu hao nguyên vật liệu so với chuẩn ngành (${(kChuan3 * 100).toFixed(1)}%).`,
  });

  // TC07: Tiêu chuẩn sản phẩm của dây chuyền - Max 4đ
  let s07 = 2;
  const prodStd = survey.mainProductStandard || "quoc_te";
  if (prodStd === "co_so_vuot_quoc_te") s07 = 4;
  else if (prodStd === "quoc_te") s07 = 3;
  else if (prodStd === "quoc_gia") s07 = 2;
  else s07 = 1;
  criteria.push({
    code: "TC07",
    group: "T",
    name: "Tiêu chuẩn sản phẩm của dây chuyền công nghệ",
    maxScore: 4,
    achievedScore: s07,
    isBottleneck: s07 < 1.6,
    recommendation: "Chuẩn hóa quy trình sản xuất theo tiêu chuẩn quốc tế (ISO, CE, FDA).",
  });

  const scoreT = Math.min(30, s01 + s02 + s03 + s04 + s05 + s06 + s07);

  // --------------------------------------------------------------------------
  // NHÓM E: HIỆU QUẢ KHAI THÁC CÔNG NGHỆ (TỐI ĐA 20 ĐIỂM)
  // --------------------------------------------------------------------------
  // TC08: Năng suất lao động (K_ns) - Max 5đ
  const kChuan4 = benchmark.kChuan4; // Triệu đồng / người / năm
  let kNs = 0;
  if (mTt > 0 && gSp > 0) {
    kNs = (gSp / 1000000) / mTt;
  }
  let s08 = 1;
  if (kNs >= 3.0 * kChuan4) s08 = 5;
  else if (kNs >= 2.0 * kChuan4) s08 = 4;
  else if (kNs >= 1.0 * kChuan4) s08 = 3;
  else if (kNs >= 0.5 * kChuan4) s08 = 2;
  else if (kNs >= 0.25 * kChuan4) s08 = 1;
  else s08 = 1;
  criteria.push({
    code: "TC08",
    group: "E",
    name: "Năng suất lao động bình quân (K_ns)",
    maxScore: 5,
    achievedScore: s08,
    isBottleneck: s08 < 2,
    recommendation: `Nâng cao giá trị sản xuất trên đầu công nhân (chuẩn ngành = ${kChuan4} trđ/người/năm).`,
  });

  // TC09: Áp dụng sáng kiến, cải tiến kỹ thuật Kaizen - Max 3đ
  let s09 = 0;
  if (survey.hasKaizenPolicy) s09 += 1;
  if (survey.kaizenCount3Years >= 3) s09 += 1;
  if (survey.hasHighImpactKaizen) s09 += 1;
  s09 = Math.min(3, Math.max(1, s09));
  criteria.push({
    code: "TC09",
    group: "E",
    name: "Áp dụng sáng kiến, cải tiến kỹ thuật, hợp lý hóa sản xuất",
    maxScore: 3,
    achievedScore: s09,
    isBottleneck: s09 < 1.2,
    recommendation: "Xây dựng phong trào thi đua phát huy sáng kiến Kaizen trong nhà máy.",
  });

  // TC10: Năng lực bảo dưỡng, sửa chữa máy móc - Max 4đ
  const maintLvl = survey.maintenanceLevel || 2;
  const s10 = Math.min(4, Math.max(1, maintLvl));
  criteria.push({
    code: "TC10",
    group: "E",
    name: "Năng lực bảo dưỡng, sửa chữa máy móc, thiết bị",
    maxScore: 4,
    achievedScore: s10,
    isBottleneck: s10 < 1.6,
    recommendation: "Nâng cấp quy trình bảo dưỡng từ sửa chữa sự cố sang bảo dưỡng chẩn đoán tổng thể.",
  });

  // TC11: Khả năng tiếp nhận chuyển giao công nghệ - Max 4đ
  let s11 = 1;
  const techTypes = survey.transferredTechTypes || [];
  if (techTypes.includes("sang_che")) s11 = 4;
  else if (techTypes.includes("cai_tien")) s11 = 3;
  else if (techTypes.includes("ban_quyen")) s11 = 2;
  else if (techTypes.includes("dong_bo")) s11 = 1;
  criteria.push({
    code: "TC11",
    group: "E",
    name: "Khả năng tiếp nhận chuyển giao công nghệ",
    maxScore: 4,
    achievedScore: s11,
    isBottleneck: s11 < 1.6,
    recommendation: "Tăng cường tiếp nhận chuyển giao công nghệ dạng bản quyền hoặc sáng chế.",
  });

  // TC12: Chất lượng nguồn nhân lực - Max 4đ
  let s12 = 0;
  const mBc = survey.highSkilledWorkers || 0;
  const mQl = survey.qualifiedManagers || 0;
  const mNv = survey.qualifiedProfessionals || 0;
  const trained = survey.trainedWorkers || 0;
  if (mTt > 0 && (mBc / mTt) >= 0.20) s12 += 1;
  if (mGt > 0 && (mQl / mGt) >= 0.50) s12 += 1;
  if (mGt > 0 && (mNv / mGt) >= 0.60) s12 += 1;
  if (mTt > 0 && (trained / mTt) >= 0.80) s12 += 1;
  s12 = Math.min(4, Math.max(1, s12));
  criteria.push({
    code: "TC12",
    group: "E",
    name: "Chất lượng nguồn nhân lực sản xuất",
    maxScore: 4,
    achievedScore: s12,
    isBottleneck: s12 < 1.6,
    recommendation: "Đào tạo nâng cao tay nghề thợ bậc cao và chuẩn hóa cán bộ quản lý.",
  });

  const scoreE = Math.min(20, s08 + s09 + s10 + s11 + s12);

  // --------------------------------------------------------------------------
  // NHÓM O: NĂNG LỰC TỔ CHỨC, QUẢN LÝ (TỐI ĐA 19 ĐIỂM)
  // --------------------------------------------------------------------------
  // TC13: Tỷ lệ chi phí cho đào tạo, huấn luyện (K_dthl) - Max 3đ
  const gDthl = survey.trainingCost3Years || 0;
  let kDthl = 0;
  if (gDt > 0) kDthl = (gDthl / gDt) * 100;
  let s13 = 1;
  if (kDthl >= 2.0) s13 = 3;
  else if (kDthl >= 1.0) s13 = 2;
  else if (kDthl >= 0.5) s13 = 1;
  else s13 = 0;
  criteria.push({
    code: "TC13",
    group: "O",
    name: "Tỷ lệ chi phí cho đào tạo, huấn luyện nhân lực (K_đthl)",
    maxScore: 3,
    achievedScore: s13,
    isBottleneck: s13 < 1.2,
    recommendation: "Tăng ngân sách đào tạo huấn luyện tay nghề hàng năm đạt tối thiểu 1% doanh thu.",
  });

  // TC14: Thông tin phục vụ sản xuất, quản lý (MES, ERP...) - Max 5đ
  const softList = survey.softwareApplications || [];
  let s14 = softList.length >= 5 ? 5 : softList.length >= 4 ? 4 : softList.length >= 3 ? 3 : softList.length >= 2 ? 2 : softList.length >= 1 ? 1 : 0;
  criteria.push({
    code: "TC14",
    group: "O",
    name: "Ứng dụng thông tin phục vụ sản xuất, quản lý (MES, ERP, SCM...)",
    maxScore: 5,
    achievedScore: s14,
    isBottleneck: s14 < 2,
    recommendation: "Triển khai đồng bộ các hệ thống ERP, MES, SCM để kết nối chuỗi cung ứng.",
  });

  // TC15: Quản lý hiệu suất thiết bị tổng thể OEE - Max 5đ
  const pTt = latestFinancial.actualOutput || 85;
  const p = latestFinancial.designedCapacity || 100;
  const oeeEst = p > 0 ? (pTt / p) * 100 : 75;
  let s15 = 1;
  if (oeeEst >= 85) s15 = 5;
  else if (oeeEst >= 70) s15 = 4;
  else if (oeeEst >= 60) s15 = 3;
  else if (oeeEst >= 45) s15 = 2;
  else s15 = 1;
  criteria.push({
    code: "TC15",
    group: "O",
    name: "Quản lý hiệu suất thiết bị tổng thể (OEE)",
    maxScore: 5,
    achievedScore: s15,
    isBottleneck: s15 < 2,
    recommendation: "Giảm thời gian dừng máy và nâng cao hiệu suất vận hành OEE lên trên 70%.",
  });

  // TC16: Áp dụng hệ thống quản lý chất lượng tiên tiến - Max 3đ
  let s16 = 0;
  const isoList = survey.isoCertifications || [];
  const prodTools = survey.productivityTools || [];
  if (isoList.some(i => /9001|22000|haccp|gmp/i.test(i))) s16 += 2;
  if (prodTools.some(p => /5s|kaizen|lean|six/i.test(p))) s16 += 1;
  s16 = Math.min(3, Math.max(1, s16));
  criteria.push({
    code: "TC16",
    group: "O",
    name: "Áp dụng tiêu chuẩn hệ thống quản lý chất lượng tiên tiến (ISO, 5S, Lean)",
    maxScore: 3,
    achievedScore: s16,
    isBottleneck: s16 < 1.2,
    recommendation: "Duy trì chứng chỉ ISO 9001 và thực hành liên tục 5S/Lean trong nhà xưởng.",
  });

  // TC17: Bảo vệ môi trường - Max 3đ
  let s17 = 1;
  if (survey.hasIso14001 && survey.environmentalCompliant && survey.hasWasteRecycling) s17 = 3;
  else if (survey.hasIso14001 && survey.environmentalCompliant) s17 = 2;
  else if (survey.environmentalCompliant) s17 = 1;
  criteria.push({
    code: "TC17",
    group: "O",
    name: "Bảo vệ môi trường và quản lý chất thải",
    maxScore: 3,
    achievedScore: s17,
    isBottleneck: s17 < 1.2,
    recommendation: "Đầu tư hệ thống xử lý nước thải/khí thải đạt chuẩn và áp dụng chứng chỉ ISO 14001.",
  });

  const scoreO = Math.min(19, s13 + s14 + s15 + s16 + s17);

  // --------------------------------------------------------------------------
  // NHÓM R: NĂNG LỰC NGHIÊN CỨU, PHÁT TRIỂN (TỐI ĐA 17 ĐIỂM)
  // --------------------------------------------------------------------------
  // TC18: Ứng dụng công nghệ thông tin - Max 3đ
  const itLvl = survey.itInfrastructureLevel || 2;
  const s18 = Math.min(3, Math.max(1, itLvl));
  criteria.push({
    code: "TC18",
    group: "R",
    name: "Ứng dụng công nghệ thông tin (Hạ tầng phần cứng & phần mềm)",
    maxScore: 3,
    achievedScore: s18,
    isBottleneck: s18 < 1.2,
    recommendation: "Nâng cấp hạ tầng máy chủ, an ninh mạng và phần mềm tích hợp toàn doanh nghiệp.",
  });

  // TC19: Chi phí thông tin (K_tt) - Max 3đ
  const gTt = survey.itExpenses3Years || 0;
  let kTt = 0;
  if (gDt > 0) kTt = (gTt / gDt) * 100;
  let s19 = 1;
  if (kTt >= 0.25) s19 = 3;
  else if (kTt >= 0.05) s19 = 2;
  else if (kTt >= 0.01) s19 = 1;
  else s19 = 0;
  criteria.push({
    code: "TC19",
    group: "R",
    name: "Chi phí thông tin và công nghệ thông tin (K_tt)",
    maxScore: 3,
    achievedScore: s19,
    isBottleneck: s19 < 1.2,
    recommendation: "Dành tối thiểu 0.05% doanh thu mua bản quyền phần mềm và dữ liệu KH&CN.",
  });

  // TC20: Nhân lực dành cho R&D - Max 4đ (Phân nhánh theo quy mô DN)
  const mRd = survey.rdWorkforceCount || 0;
  const totalCap = survey.totalCapital || 0;
  const h5 = m > 0 ? (mRd / m) * 100 : 0;
  let s20 = 1;
  if (totalCap >= 1000000000000 && m >= 3000) {
    if (h5 >= 1.0 && mRd >= 50) s20 = 4;
    else if (h5 >= 0.8 && mRd >= 40) s20 = 3;
    else if (h5 >= 0.6 && mRd >= 30) s20 = 2;
    else s20 = 1;
  } else if (totalCap >= 100000000000 && m >= 200) {
    if (h5 >= 2.5 && mRd >= 15) s20 = 4;
    else if (h5 >= 2.0 && mRd >= 12) s20 = 3;
    else if (h5 >= 1.5 && mRd >= 9) s20 = 2;
    else s20 = 1;
  } else {
    if (h5 >= 5.0) s20 = 4;
    else if (h5 >= 4.0) s20 = 3;
    else if (h5 >= 3.0) s20 = 2;
    else s20 = 1;
  }
  criteria.push({
    code: "TC20",
    group: "R",
    name: "Nhân lực dành cho nghiên cứu và phát triển (M_r&d)",
    maxScore: 4,
    achievedScore: s20,
    isBottleneck: s20 < 1.6,
    recommendation: "Tuyển dụng và bồi dưỡng đội ngũ kỹ sư chuyên trách hoạt động R&D.",
  });

  // TC21: Hạ tầng dành cho R&D - Max 3đ
  const rdFacLvl = survey.rdFacilityLevel || 2;
  const s21 = Math.min(3, Math.max(1, rdFacLvl));
  criteria.push({
    code: "TC21",
    group: "R",
    name: "Hạ tầng dành cho nghiên cứu và phát triển (Phòng Lab/CAD/Testing)",
    maxScore: 3,
    achievedScore: s21,
    isBottleneck: s21 < 1.2,
    recommendation: "Thành lập phòng thí nghiệm, phòng thiết kế CAD/CAM riêng biệt phục vụ R&D.",
  });

  // TC22: Quỹ KHCN & Chi phí R&D - Max 4đ (Phân nhánh theo 3 cấp quy mô DN - Điều 7 Khoản 5 TT17)
  const gRd = survey.rdExpenses3Years || 0;
  let kRd = 0;
  if (gDt > 0) kRd = (gRd / gDt) * 100;
  let s22 = 0;
  if (survey.hasSciTechFund) s22 += 1;
  if (totalCap >= 1000000000000 && m >= 3000) {
    if (kRd >= 0.1) s22 += 3;
    else if (kRd >= 0.06) s22 += 2;
    else if (kRd >= 0.02) s22 += 1;
  } else if (totalCap >= 100000000000 && m >= 200) {
    if (kRd >= 0.5) s22 += 3;
    else if (kRd >= 0.3) s22 += 2;
    else if (kRd >= 0.1) s22 += 1;
  } else {
    if (kRd >= 1.0) s22 += 3;
    else if (kRd >= 0.6) s22 += 2;
    else if (kRd >= 0.2) s22 += 1;
  }
  s22 = Math.min(4, Math.max(1, s22));
  criteria.push({
    code: "TC22",
    group: "R",
    name: "Quỹ phát triển KH&CN và đầu tư cho hoạt động R&D",
    maxScore: 4,
    achievedScore: s22,
    isBottleneck: s22 < 1.6,
    recommendation: "Trích lập Quỹ phát triển KH&CN của DN và nâng tỷ lệ chi R&D theo định mức quy mô.",
  });

  const scoreR = Math.min(17, s18 + s19 + s20 + s21 + s22);

  // --------------------------------------------------------------------------
  // NHÓM I: NĂNG LỰC ĐỔI MỚI SÁNG TẠO (TỐI ĐA 14 ĐIỂM)
  // --------------------------------------------------------------------------
  // TC23: Kết quả nghiên cứu, phát triển sản phẩm - Max 4đ (Điều 8 Khoản 1 TT17: Doanh thu SP mới >= 5% cộng +1đ)
  let s23 = 1;
  const prodType = survey.newProductType || "tinh_nang";
  if (prodType === "hoan_toan_moi") s23 = 3;
  else if (prodType === "tinh_nang") s23 = 2;
  else if (prodType === "kieu_dang") s23 = 1;
  if (prodType !== "none" && survey.newProductRevenueRatio >= 5) s23 = Math.min(4, s23 + 1);
  criteria.push({
    code: "TC23",
    group: "I",
    name: "Kết quả nghiên cứu, phát triển sản phẩm mới",
    maxScore: 4,
    achievedScore: s23,
    isBottleneck: s23 < 1.6,
    recommendation: "Đẩy mạnh thương mại hóa các sản phẩm mới có tính năng đột phá.",
  });

  // TC24: Kết quả nghiên cứu, phát triển công nghệ (Sáng chế/GPHI) - Max 4đ
  let s24 = 1;
  const techRes = survey.rdTechnologyResult || "giai_phap_huu_ich";
  if (techRes === "bang_sang_che") s24 = 4;
  else if (techRes === "giai_phap_huu_ich") s24 = 3;
  else if (techRes === "thu_nghiem_lab") s24 = 2;
  else s24 = 1;
  criteria.push({
    code: "TC24",
    group: "I",
    name: "Kết quả nghiên cứu, phát triển công nghệ (Bằng sáng chế, GPHI)",
    maxScore: 4,
    achievedScore: s24,
    isBottleneck: s24 < 1.6,
    recommendation: "Đăng ký bảo hộ sở hữu trí tuệ dưới dạng bằng sáng chế hoặc giải pháp hữu ích.",
  });

  // TC25: Năng lực liên kết hợp tác nghiên cứu, phát triển - Max 2đ
  let s25 = 1;
  const partnerType = survey.academyPartnershipType || "du_an_rd";
  if (partnerType === "du_an_rd") s25 = 2;
  else if (partnerType === "chuyen_gia_dao_tao") s25 = 1;
  else s25 = 0;
  criteria.push({
    code: "TC25",
    group: "I",
    name: "Năng lực liên kết, hợp tác nghiên cứu, phát triển với Viện/Trường",
    maxScore: 2,
    achievedScore: s25,
    isBottleneck: s25 < 1,
    recommendation: "Ký kết hợp tác nghiên cứu phát triển công nghệ với các trường đại học, viện nghiên cứu.",
  });

  // TC26: Năng lực chuyển đổi số của doanh nghiệp - Max 4đ
  let s26Strat = 0;
  const strat = survey.digitalStrategyLevel || "dang_thuc_hien";
  if (strat === "da_xay_dung") s26Strat = 1;
  else if (strat === "dang_thuc_hien") s26Strat = 1;
  else if (strat === "chuan_bi") s26Strat = 0.5;

  let s26Tech = 0;
  const digTechs = survey.digitalTechnologies || [];
  const scope = survey.digitalAdoptionScope || "mot_so_bo_phan";
  if (digTechs.length >= 3 && scope === "toan_nha_may") s26Tech = 3;
  else if (digTechs.length >= 2 || scope === "mot_so_bo_phan") s26Tech = 2;
  else if (digTechs.length >= 1 || scope === "nghien_cuu") s26Tech = 1;

  const s26 = Math.min(4, Math.round((s26Strat + s26Tech) * 10) / 10);
  criteria.push({
    code: "TC26",
    group: "I",
    name: "Năng lực chuyển đổi số trong sản xuất (Chiến lược & Công nghệ 4.0)",
    maxScore: 4,
    achievedScore: s26,
    isBottleneck: s26 < 1.6,
    recommendation: "Ban hành chiến lược chuyển đổi số và ứng dụng các công nghệ IoT, Robot, Big Data vào nhà máy.",
  });

  const scoreI = Math.min(14, s23 + s24 + s25 + s26);

  // --------------------------------------------------------------------------
  // TỔNG KẾT & HỆ SỐ ĐỒNG BỘ T_DB (ĐIỀU 9 THÔNG TƯ 17)
  // --------------------------------------------------------------------------
  const total = Math.round((scoreT + scoreE + scoreO + scoreR + scoreI) * 10) / 10;
  let sync = 0;
  if (scoreT > 0 && scoreE > 0 && scoreO > 0 && scoreR > 0 && scoreI > 0) {
    sync = Math.round(
      Math.pow(scoreT / 30, 0.3) *
      Math.pow(scoreE / 20, 0.2) *
      Math.pow(scoreO / 19, 0.19) *
      Math.pow(scoreR / 17, 0.17) *
      Math.pow(scoreI / 14, 0.14) * 100
    ) / 100;
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
    scoreT: Math.round(scoreT * 10) / 10,
    scoreE: Math.round(scoreE * 10) / 10,
    scoreO: Math.round(scoreO * 10) / 10,
    scoreR: Math.round(scoreR * 10) / 10,
    scoreI: Math.round(scoreI * 10) / 10,
    totalScore: total,
    syncCoefficient: sync,
    classification,
    classificationLabel,
    criteria,
    bottlenecks,
  };
}
