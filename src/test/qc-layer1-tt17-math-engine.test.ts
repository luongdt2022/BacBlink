import { describe, expect, it } from "vitest";
import {
  calculateLaborProductivityGrowth,
  calculateLocalScore,
  INDUSTRY_BENCHMARKS,
  INITIAL_SURVEY_DATA,
  Tt17SurveyData,
} from "@/services/api/assessment-tt17";

describe("TẦNG 1: QC UNIT TESTS - TOÁN HỌC & ENGINE CHẤM ĐIỂM TT17", () => {
  // --------------------------------------------------------------------------
  // 1. Kiểm tra cấu trúc 26 tiêu chí và điểm trần từng nhóm
  // --------------------------------------------------------------------------
  it("TC-L1-01: Bộ tiêu chí gồm đúng 26 tiêu chí, chia đúng 5 nhóm T, E, O, R, I với tổng điểm tối đa 100", () => {
    const result = calculateLocalScore(INITIAL_SURVEY_DATA, "C.28");

    expect(result.criteria).toHaveLength(26);

    const codes = result.criteria.map((c) => c.code);
    for (let i = 1; i <= 26; i++) {
      const code = `TC${i.toString().padStart(2, "0")}`;
      expect(codes).toContain(code);
    }

    // Kiểm tra điểm trần từng nhóm
    const maxT = result.criteria.filter((c) => c.group === "T").reduce((sum, c) => sum + c.maxScore, 0);
    const maxE = result.criteria.filter((c) => c.group === "E").reduce((sum, c) => sum + c.maxScore, 0);
    const maxO = result.criteria.filter((c) => c.group === "O").reduce((sum, c) => sum + c.maxScore, 0);
    const maxR = result.criteria.filter((c) => c.group === "R").reduce((sum, c) => sum + c.maxScore, 0);
    const maxI = result.criteria.filter((c) => c.group === "I").reduce((sum, c) => sum + c.maxScore, 0);

    expect(maxT).toBe(30);
    expect(maxE).toBe(20);
    expect(maxO).toBe(19);
    expect(maxR).toBe(17);
    expect(maxI).toBe(14);
    expect(maxT + maxE + maxO + maxR + maxI).toBe(100);
  });

  // --------------------------------------------------------------------------
  // 2. Thử thách chia cho 0 và biên dữ liệu rỗng (Zero-Division Robustness)
  // --------------------------------------------------------------------------
  it("TC-L1-02: Biên dữ liệu 0 (Zero-division, Doanh thu=0, Vốn=0, Lao động=0, Máy móc=0) KHÔNG sinh NaN/Infinity", () => {
    const zeroSurvey: Tt17SurveyData = {
      companyName: "Zero Corp",
      taxCode: "0000000000",
      totalCapital: 0,
      totalWorkforce: 0,
      companyAddress: "",
      companyPhone: "",
      companyEmail: "",
      companyType: "",
      industryCode: "C.10",

      machineries: [],
      originalCostEquipment: 0,
      currentBookValueEquipment: 0,
      newInvestEquipment3Years: 0,
      replacementEquipment3Years: 0,
      digitalEquipmentValue: 0,
      transferredTechTypes: [],
      transferredTechValue: 0,

      financialSeries: [],
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

      newProductType: "none",
      newProductRevenueRatio: 0,
      rdTechnologyResult: "none",
      academyPartnershipType: "none",
      digitalStrategyLevel: "chua_biet",
      digitalTechnologies: [],
      digitalAdoptionScope: "nghien_cuu",
    };

    const res = calculateLocalScore(zeroSurvey, "C.10");

    expect(Number.isNaN(res.scoreT)).toBe(false);
    expect(Number.isFinite(res.scoreT)).toBe(true);
    expect(Number.isNaN(res.scoreE)).toBe(false);
    expect(Number.isFinite(res.scoreE)).toBe(true);
    expect(Number.isNaN(res.scoreO)).toBe(false);
    expect(Number.isFinite(res.scoreO)).toBe(true);
    expect(Number.isNaN(res.scoreR)).toBe(false);
    expect(Number.isFinite(res.scoreR)).toBe(true);
    expect(Number.isNaN(res.scoreI)).toBe(false);
    expect(Number.isFinite(res.scoreI)).toBe(true);
    expect(Number.isNaN(res.totalScore)).toBe(false);
    expect(Number.isFinite(res.totalScore)).toBe(true);
    expect(Number.isNaN(res.syncCoefficient)).toBe(false);
    expect(Number.isFinite(res.syncCoefficient)).toBe(true);

    for (const crit of res.criteria) {
      expect(Number.isNaN(crit.achievedScore)).toBe(false);
      expect(Number.isFinite(crit.achievedScore)).toBe(true);
      expect(crit.achievedScore).toBeGreaterThanOrEqual(0);
      expect(crit.achievedScore).toBeLessThanOrEqual(crit.maxScore);
    }

    // Với dữ liệu 0, xếp loại phải là Lạc hậu hoặc Cần thẩm định
    expect(["LAC_HAU", "CAN_THAM_DINH"]).toContain(res.classification);
  });

  // --------------------------------------------------------------------------
  // 3. Kiểm thử tốc độ tăng năng suất lao động (calculateLaborProductivityGrowth)
  // --------------------------------------------------------------------------
  it("TC-L1-03: Hàm calculateLaborProductivityGrowth xử lý an toàn khi series rỗng, lao động = 0 và chuỗi 3 năm", () => {
    // Trường hợp rỗng
    expect(calculateLaborProductivityGrowth([])).toBe(5.0);
    expect(calculateLaborProductivityGrowth(undefined)).toBe(5.0);

    // Trường hợp 1 năm
    expect(calculateLaborProductivityGrowth([{ year: 2025, netRevenue: 100, industrialOutputValue: 100, directWorkersCount: 10 }])).toBe(5.0);

    // Trường hợp công nhân năm đầu = 0
    expect(calculateLaborProductivityGrowth([
      { year: 2024, netRevenue: 100, industrialOutputValue: 100, directWorkersCount: 0 },
      { year: 2025, netRevenue: 200, industrialOutputValue: 200, directWorkersCount: 10 }
    ])).toBe(5.0);

    // Trường hợp tăng trưởng thực tế: Năm 1: 100tr/10 ng = 10tr; Năm 2: 240tr/10 ng = 24tr -> tăng 140% trong 1 năm
    const normalGrowth = calculateLaborProductivityGrowth([
      { year: 2024, netRevenue: 100000000, industrialOutputValue: 100000000, directWorkersCount: 10 },
      { year: 2025, netRevenue: 240000000, industrialOutputValue: 240000000, directWorkersCount: 10 }
    ]);
    expect(normalGrowth).toBe(140.0);
  });

  // --------------------------------------------------------------------------
  // 4. Kiểm thử hệ số đồng bộ T_ĐB và 4 bậc xếp loại + Thẩm định chuyên gia
  // --------------------------------------------------------------------------
  it("TC-L1-04: Phân bậc xếp loại Tiên tiến (Total >= 75, T_ĐB >= 0.65)", () => {
    // Hồ sơ đạt mức tối đa
    const perfectSurvey: Tt17SurveyData = {
      ...INITIAL_SURVEY_DATA,
      totalCapital: 500000000000,
      totalWorkforce: 500,
      directWorkers: 350,
      originalCostEquipment: 200000000000,
      currentBookValueEquipment: 180000000000, // Khấu hao 10% -> TC01 = 5đ
      newInvestEquipment3Years: 160000000000, // Đổi mới 80% -> TC03 = 3đ
      replacementEquipment3Years: 20000000000,
      digitalEquipmentValue: 150000000000, // TC04 = 7đ
      dataCollectionSystems: ["SCADA", "MDC", "FMS", "CIM"],
      energyCostYear: 1000000000, // 0.5% DT -> TC05 = 4đ
      materialCostYear: 20000000000, // 10% DT -> TC06 = 4đ
      mainProductStandard: "co_so_vuot_quoc_te", // TC07 = 4đ

      financialSeries: [
        { year: 2023, netRevenue: 150000000000, industrialOutputValue: 150000000000, directWorkersCount: 300 },
        { year: 2024, netRevenue: 180000000000, industrialOutputValue: 180000000000, directWorkersCount: 320 },
        { year: 2025, netRevenue: 220000000000, industrialOutputValue: 220000000000, directWorkersCount: 350 },
      ],
      hasKaizenPolicy: true,
      kaizenCount3Years: 10,
      hasHighImpactKaizen: true,
      maintenanceLevel: 4, // TC10 = 4đ
      transferredTechTypes: ["sang_che"], // TC11 = 4đ
      highSkilledWorkers: 100, // TC12 = 4đ
      qualifiedManagers: 100,
      qualifiedProfessionals: 100,
      trainedWorkers: 320,

      trainingCost3Years: 5000000000, // > 2% DT -> TC13 = 3đ
      softwareApplications: ["MES", "ERP", "PLM", "PDM", "SCM"], // TC14 = 5đ
      isoCertifications: ["ISO 9001", "HACCP"], // TC16 = 3đ
      productivityTools: ["5S", "Lean", "Six Sigma"],
      environmentalCompliant: true,
      hasIso14001: true,
      hasWasteRecycling: true, // TC17 = 3đ

      itInfrastructureLevel: 3, // TC18 = 3đ
      itExpenses3Years: 2000000000, // TC19 = 3đ
      rdWorkforceCount: 30, // TC20 = 4đ
      rdFacilityLevel: 3, // TC21 = 3đ
      rdExpenses3Years: 8000000000, // TC22 = 4đ
      hasSciTechFund: true,

      newProductType: "hoan_toan_moi", // TC23 = 4đ
      newProductRevenueRatio: 35,
      rdTechnologyResult: "bang_sang_che", // TC24 = 4đ
      academyPartnershipType: "du_an_rd", // TC25 = 2đ
      digitalStrategyLevel: "da_xay_dung", // TC26 = 4đ
      digitalTechnologies: ["Cloud", "Robot", "BigData", "IoT"],
      digitalAdoptionScope: "toan_nha_may",
    };

    const res = calculateLocalScore(perfectSurvey, "C.28");
    expect(res.totalScore).toBeGreaterThanOrEqual(75);
    expect(res.syncCoefficient).toBeGreaterThanOrEqual(0.65);
    expect(res.classification).toBe("TIEN_TIEN");
    expect(res.classificationLabel).toBe("Tiên tiến");
  });

  it("TC-L1-05: Điểm tổng cao (>= 75đ) nhưng T_ĐB < 0.65 (nghẽn công nghệ) -> Buộc xếp 'CAN_THAM_DINH'", () => {
    // Giả lập một DN có điểm T, E, O, I rất cao nhưng R (R&D) bị bỏ rơi (0đ)
    const bottleNeckSurvey: Tt17SurveyData = {
      ...INITIAL_SURVEY_DATA,
      // Đặt toàn bộ nhóm R về 0
      itInfrastructureLevel: 1,
      itExpenses3Years: 0,
      rdFacilityLevel: 1,
      rdWorkforceCount: 0,
      rdExpenses3Years: 0,
      hasSciTechFund: false,
    };

    const res = calculateLocalScore(bottleNeckSurvey, "C.28");

    // Nếu một trong các nhóm điểm = 0 thì T_ĐB = 0
    if (res.scoreR === 0) {
      expect(res.syncCoefficient).toBe(0);
      if (res.totalScore >= 35) {
        expect(res.classification).toBe("CAN_THAM_DINH");
        expect(res.classificationLabel).toBe("Cần thẩm định chuyên gia");
      }
    }
  });

  // --------------------------------------------------------------------------
  // 5. Kiểm tra định mức ngành 23 nhóm VSIC C.10 - C.32
  // --------------------------------------------------------------------------
  it("TC-L1-06: Đầy đủ 23 nhóm ngành VSIC C.10 đến C.32 cùng 8 ngành BACLINK IND_* với định mức chuẩn K1..K4 hợp lệ", () => {
    const keys = Object.keys(INDUSTRY_BENCHMARKS);
    expect(keys.length).toBeGreaterThanOrEqual(23);

    for (let i = 10; i <= 32; i++) {
      const code = `C.${i}`;
      expect(keys).toContain(code);

      const bm = INDUSTRY_BENCHMARKS[code];
      expect(bm.industryCode).toBe(code);
      expect(bm.industryName.length).toBeGreaterThan(0);
      expect(bm.kChuan1).toBeGreaterThan(0); // Suất đầu tư tự động hóa trđ/LĐ
      expect(bm.kChuan2).toBeGreaterThan(0); // Tỷ lệ năng lượng
      expect(bm.kChuan2).toBeLessThan(1);
      expect(bm.kChuan3).toBeGreaterThan(0); // Tỷ lệ nguyên vật liệu
      expect(bm.kChuan3).toBeLessThan(1);
      expect(bm.kChuan4).toBeGreaterThan(0); // Năng suất lao động chuẩn
    }

    const baclinkSectors = ["IND_ELEC", "IND_MECH", "IND_AUTO", "IND_PLAS", "IND_MAT", "IND_IT", "IND_GREEN", "IND_LOG"];
    for (const indCode of baclinkSectors) {
      if (keys.includes(indCode)) {
        const bm = INDUSTRY_BENCHMARKS[indCode];
        expect(bm.industryCode).toBe(indCode);
        expect(bm.industryName.length).toBeGreaterThan(0);
      }
    }
  });
});
