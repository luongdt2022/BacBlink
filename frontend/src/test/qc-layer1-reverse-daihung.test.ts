import { describe, expect, it } from "vitest";
import {
  calculateLocalScore,
  Tt17SurveyData,
} from "@/services/api/assessment-tt17";

describe("ĐỐI SOÁT KIỂM CHUẨN THỰC TẾ: CÔNG TY TNHH ĐẠI HƯNG (CỘT D - EXCEL TT17)", () => {
  it("Tính ngược số liệu thô và đối soát với đáp án Excel (T=16, E=10, O=8, R=5, I=4, Total=43, Kđb=0.42)", () => {
    // --------------------------------------------------------------------------
    // Dữ liệu thô tính ngược cho CÔNG TY TNHH ĐẠI HƯNG (Ngành C.10 - Chế biến thực phẩm)
    // --------------------------------------------------------------------------
    const surveyDaiHung: Tt17SurveyData = {
      companyName: "CÔNG TY TNHH ĐẠI HƯNG",
      taxCode: "1200345678",
      contactPerson: "Trần Đại Hưng",
      companyAddress: "Ấp Tân Bình, Xã Tân Hội, Thị xã Cai Lậy, Tiền Giang",
      companyPhone: "02733888999",
      companyEmail: "daihung@tiengiang-food.vn",
      companyType: "Công ty TNHH",
      industryCode: "C.10",
      totalCapital: 10000000000,
      totalWorkforce: 50,
      directWorkers: 50,
      indirectStaff: 0,
      machineries: [],

      // === NHÓM T: HIỆN TRẠNG THIẾT BỊ (Mục tiêu: 16đ) ===
      // TC01 (2đ): Khấu hao 70% (giữa 60% và 80%)
      originalCostEquipment: 10000000000,
      currentBookValueEquipment: 3000000000,
      // TC02 (1đ): Cường độ vốn Gsx / Gdt = 3 tỷ / 31.7 tỷ = 9.5% (< 40%)
      // TC03 (1đ): Đổi mới 30% (3 tỷ / 10 tỷ)
      newInvestEquipment3Years: 3000000000,
      replacementEquipment3Years: 0,
      // TC04 (3đ): Số hóa 15 tỷ cho 50 LĐ = 300 trđ/LĐ >= 1.5 * 200 trđ (kChuan1 = 200 trđ)
      digitalEquipmentValue: 15000000000,
      dataCollectionSystems: [],
      // TC05 (4đ): Chi phí năng lượng = 300 tr / 31.7 tỷ = 0.94% <= 0.25 * 7%
      energyCostYear: 300000000,
      // TC06 (4đ): Chi phí nguyên vật liệu = 4 tỷ / 31.7 tỷ = 12.6% <= 0.25 * 75%
      materialCostYear: 4000000000,
      // TC07 (1đ): Tiêu chuẩn cơ sở
      mainProductStandard: "co_so",

      // === NHÓM E: HIỆU QUẢ KHAI THÁC CÔNG NGHỆ (Mục tiêu: 10đ) ===
      financialSeries: [
        { year: 2023, netRevenue: 25000000000, industrialOutputValue: 25000000000, directWorkersCount: 45, actualOutput: 40, designedCapacity: 100 },
        { year: 2024, netRevenue: 28000000000, industrialOutputValue: 28000000000, directWorkersCount: 48, actualOutput: 40, designedCapacity: 100 },
        { year: 2025, netRevenue: 31726700000, industrialOutputValue: 31726700000, directWorkersCount: 50, actualOutput: 40, designedCapacity: 100 },
      ],
      // TC08 (5đ): Năng suất LĐ = 31.7 tỷ / 50 LĐ = 634 trđ >= 3 * 150 trđ
      // TC09 (1đ): Sáng kiến Kaizen cơ bản
      hasKaizenPolicy: true,
      kaizenCount3Years: 2,
      hasHighImpactKaizen: false,
      // TC10 (2đ): Bảo dưỡng định kỳ cấp 2
      maintenanceLevel: 2,
      // TC11 (1đ): Không nhận chuyển giao công nghệ mới
      transferredTechTypes: [],
      transferredTechValue: 0,
      // TC12 (1đ): Nhân lực cơ bản
      trainedWorkers: 20,
      highSkilledWorkers: 2,
      qualifiedManagers: 0,
      qualifiedProfessionals: 0,

      // === NHÓM O: NĂNG LỰC TỔ CHỨC, QUẢN LÝ (Mục tiêu: 8đ) ===
      // TC13 (1đ): Chi phí đào tạo 200 tr / 31.7 tỷ = 0.63% (0.5% - 1%)
      trainingCost3Years: 200000000,
      // TC14 (2đ): Ứng dụng 2 phần mềm (ERP, MES)
      softwareApplications: ["ERP", "MES"],
      // TC15 (1đ): OEE 40 / 100 = 40% (< 45%)
      // TC16 (1đ): Công cụ 5S cơ bản
      isoCertifications: [],
      productivityTools: ["5S"],
      // TC17 (3đ): ISO 14001 + Tuân thủ MT + Tái chế
      hasIso14001: true,
      environmentalCompliant: true,
      hasWasteRecycling: true,

      // === NHÓM R: NĂNG LỰC NGHIÊN CỨU & PHÁT TRIỂN (Mục tiêu: 5đ) ===
      // TC18 (1đ): Hạ tầng CNTT cơ bản Mức 1
      itInfrastructureLevel: 1,
      // TC19 (1đ): Chi phí thông tin 10 tr / 31.7 tỷ = 0.03% (0.01% - 0.05%)
      itExpenses3Years: 10000000,
      // TC20 (1đ): Nhân lực R&D < 3%
      rdWorkforceCount: 1,
      // TC21 (1đ): Hạ tầng R&D Mức 1
      rdFacilityLevel: 1,
      // TC22 (1đ): Quỹ KH&CN & Chi phí R&D cơ bản
      hasSciTechFund: false,
      rdExpenses3Years: 0,

      // === NHÓM I: NĂNG LỰC ĐỔI MỚI SÁNG TẠO (Mục tiêu: 4đ) ===
      // TC23 (1đ): Sản phẩm mới cải tiến kiểu dáng (< 5% doanh thu)
      newProductType: "kieu_dang",
      newProductRevenueRatio: 0,
      // TC24 (1đ): Thử nghiệm công nghệ phòng Lab
      rdTechnologyResult: "dang_nghien_cuu",
      // TC25 (1đ): Thuê chuyên gia tư vấn
      academyPartnershipType: "chuyen_gia_dao_tao",
      // TC26 (1đ): Chưa có chiến lược CĐS riêng (0đ), mới ứng dụng nghiên cứu 1 công nghệ (1đ)
      digitalStrategyLevel: "chua_biet",
      digitalTechnologies: ["IoT"],
      digitalAdoptionScope: "nghien_cuu",
    };

    const result = calculateLocalScore(surveyDaiHung, "C.10");

    // Đối soát nhóm điểm với Excel
    expect(result.scoreT).toBe(16);
    expect(result.scoreE).toBe(10);
    expect(result.scoreO).toBe(8);
    expect(result.scoreR).toBe(5);
    expect(result.scoreI).toBe(4);

    // Đối soát Tổng điểm với ô D35 trong Excel
    expect(result.totalScore).toBe(43);

    // Đối soát Hệ số đồng bộ Kđb với ô D36 trong Excel (0.417 ~ 0.42)
    expect(result.syncCoefficient).toBe(0.42);

    // Đối soát xếp loại
    expect(result.classification).toBe("TRUNG_BINH");
    expect(result.classificationLabel).toBe("Trung bình");
  });
});
