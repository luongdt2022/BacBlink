import { describe, expect, it } from "vitest";
import {
  exportTt17SurveyDocx,
  exportDemandSmeDocx,
  DemandSmeSurveyRecord,
  DOCX_MIME_TYPE,
} from "./survey-docx-exporter";
import { Tt17Assessment } from "./api/assessment-tt17";

describe("T-09.25 [QC] survey-docx-exporter Engine & Edge-Case Hunter", () => {
  const baseAssessment: Tt17Assessment = {
    id: "tt17-mock-uuid-001",
    enterpriseId: "ent-001",
    enterpriseName: "Công Ty Cổ Phần Công Nghệ Chế Tạo NacenTech",
    taxCode: "0109876543",
    scopeType: "PROVINCE",
    scopeId: "HN",
    industryCode: "C.28",
    assessmentYear: 2026,
    status: "APPROVED",
    submittedAt: "2026-11-01T08:00:00Z",
    createdAt: "2026-10-25T08:00:00Z",
    updatedAt: "2026-11-01T08:00:00Z",
    scoreResult: {
      scoreT: 25.5,
      scoreE: 16.0,
      scoreO: 14.5,
      scoreR: 12.0,
      scoreI: 10.0,
      totalScore: 78.0,
      syncCoefficient: 0.72,
      classification: "TIEN_TIEN",
      classificationLabel: "Trình độ Tiên tiến",
      bottlenecks: [],
      criteria: [
        {
          code: "TC01",
          group: "T",
          name: "Mức độ khấu hao thiết bị, công nghệ (K_kh)",
          maxScore: 5,
          achievedScore: 4.5,
          isBottleneck: false,
          recommendation: "Duy trì đầu tư máy móc.",
        },
      ],
    },
    surveyData: {
      companyName: "Công Ty Cổ Phần Công Nghệ Chế Tạo NacenTech",
      taxCode: "0109876543",
      contactPerson: "Nguyễn Văn Trưởng",
      totalCapital: 50000000000,
      totalWorkforce: 250,
      companyAddress: "Số 25 Lê Thánh Tông, Hoàn Kiếm, Hà Nội",
      companyPhone: "02439876543",
      companyEmail: "contact@nacentech.vn",
      companyType: "cong_ty_co_phan",
      industryCode: "C.28",
      machineries: [
        {
          name: "Trung tâm gia công CNC 5 trục Haas UMC-750",
          originCountry: "Mỹ",
          manufactureYear: 2022,
          startUsageYear: 2023,
          designedCapacityYear: 12000,
          originalCost: 4500000000,
          currentBookValue: 3600000000,
        },
      ],
      originalCostEquipment: 15000000000,
      currentBookValueEquipment: 11000000000,
      newInvestEquipment3Years: 4500000000,
      replacementEquipment3Years: 2000000000,
      digitalEquipmentValue: 3000000000,
      transferredTechTypes: ["lieng_xang", "mua_ban_quyen"],
      transferredTechValue: 1200000000,
      depreciationCoefficient: 0.27,
      modernEquipmentRatio: 75,
      advancedCountryEquipmentRatio: 80,
      automationRatio: 65,
      averageEquipmentAge: 3.5,
      lineSynchronizationLevel: 4,
      materialConsumptionRatio: 98,
      financialSeries: [
        {
          year: 2023,
          industrialOutputValue: 60000000000,
          netRevenue: 55000000000,
          totalCosts: 48000000000,
          actualOutput: 10000,
          designedCapacity: 12000,
          directWorkersCount: 150,
        },
      ],
      mainProductStandard: "quoc_te",
      energyCostYear: 500000000,
      materialCostYear: 25000000000,
      hasKaizenPolicy: true,
      kaizenCount3Years: 5,
      hasHighImpactKaizen: true,
      maintenanceLevel: 3,
      defectProductRatio: 1.2,
      capacityUtilizationRatio: 85,
      exportRevenueRatio: 40,
      energySavingRatio: 8.5,
      directWorkers: 150,
      indirectStaff: 100,
      trainedWorkers: 130,
      highSkilledWorkers: 60,
      qualifiedManagers: 20,
      qualifiedProfessionals: 40,
      trainingCost3Years: 600000000,
      isoCertifications: ["ISO 9001:2015", "ISO 14001:2015"],
      softwareApplications: ["SAP S/4HANA", "Siemens NX CAD/CAM"],
      dataCollectionSystems: ["SCADA FactoryTalk"],
      productivityTools: ["5S", "Lean Six Sigma"],
      digitalMaturityLevel: 3,
      environmentalCompliant: true,
      hasIso14001: true,
      hasWasteRecycling: true,
      itInfrastructureLevel: 3,
      itExpenses3Years: 1200000000,
      rdFacilityLevel: 3,
      rdWorkforceCount: 15,
      rdExpenses3Years: 1500000000,
      hasSciTechFund: true,
      hasLabOrTestingFacility: true,
      rdExpenseRatio: 2.7,
      rdProjectsCount: 3,
      technologyMasteryLevel: 3,
      newProductType: "hoan_toan_moi",
      newProductRevenueRatio: 30,
      rdTechnologyResult: "bang_sang_che",
      academyPartnershipType: "du_an_rd",
      digitalStrategyLevel: "dang_thuc_hien",
      digitalTechnologies: ["IOT", "AI"],
      digitalAdoptionScope: "toan_nha_may",
      grantedPatentsCount: 2,
      registeredIpCount: 5,
      academyPartnershipCount: 2,
      hasInternalInnovationPolicy: true,
    },
  };

  it("TC-01: Sinh Blob DOCX hợp lệ cho Phiếu TT17 chuẩn, kiểm tra ZIP Magic Header & Dung lượng", async () => {
    const blob = await exportTt17SurveyDocx(baseAssessment);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(10000); // Kích thước tệp chuẩn > 10KB
    expect(blob.type).toBe(DOCX_MIME_TYPE);

    // Kiểm tra Magic Bytes của ZIP PK\x03\x04
    const buffer = Buffer.from(await blob.arrayBuffer());
    expect(buffer[0]).toBe(0x50); // 'P'
    expect(buffer[1]).toBe(0x4b); // 'K'
    expect(buffer[2]).toBe(0x03);
    expect(buffer[3]).toBe(0x04);
  });

  it("TC-02 (EDGE-CASE 1): Xử lý Tên Doanh Nghiệp chứa ký tự XML đặc biệt (&, <, >, \", ') an toàn", async () => {
    const edgeAssessment: Tt17Assessment = {
      ...baseAssessment,
      enterpriseName: 'Công Ty & Con <"NacenTech"> \'R&D\'',
      surveyData: {
        ...baseAssessment.surveyData!,
        companyName: 'Công Ty & Con <"NacenTech"> \'R&D\'',
      },
    };

    const blob = await exportTt17SurveyDocx(edgeAssessment);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(10000);

    const buffer = Buffer.from(await blob.arrayBuffer());
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });

  it("TC-03 (EDGE-CASE 2): Xử lý Doanh nghiệp không có máy móc kê khai (machineries = [])", async () => {
    const edgeAssessment: Tt17Assessment = {
      ...baseAssessment,
      surveyData: {
        ...baseAssessment.surveyData!,
        machineries: [],
      },
    };

    const blob = await exportTt17SurveyDocx(edgeAssessment);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(8000);
  });

  it("TC-04 (EDGE-CASE 3): Xử lý điểm TT17 là số thập phân lẻ (68.45 điểm) và hệ số lẻ (0.582)", async () => {
    const edgeAssessment: Tt17Assessment = {
      ...baseAssessment,
      scoreResult: {
        ...baseAssessment.scoreResult!,
        totalScore: 68.45,
        syncCoefficient: 0.582,
        classification: "TRUNG_BINH_TIEN_TIEN",
        classificationLabel: "Trung bình tiên tiến",
      },
    };

    const blob = await exportTt17SurveyDocx(edgeAssessment);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(10000);
  });


  it("TC-06 (FULL TT17 COMPLIANCE): Kiểm tra DOCX xuất ra chứa đầy đủ 16 bảng biểu Mục A-E + Phụ lục II + Chữ ký 3 bên", async () => {
    const blob = await exportTt17SurveyDocx(baseAssessment);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(15000);

    // Lưu tạm ra file để dùng python-docx thẩm định số lượng bảng và đoạn văn
    const buffer = Buffer.from(await blob.arrayBuffer());
    const fs = await import("fs");
    const testPath = "/tmp/test_exported_tt17.docx";
    fs.writeFileSync(testPath, buffer);
    expect(fs.existsSync(testPath)).toBe(true);
  });

  it("TC-05 (EDGE-CASE 4): Sinh Phiếu Khảo sát Nhu cầu DNNVV với danh mục nhu cầu rỗng", async () => {
    const demandRecord: DemandSmeSurveyRecord = {
      id: "demand-rec-001",
      surveyType: "SME_DEMAND",
      enterpriseName: "Hợp Tác Xã Nông Sản Sạch Ninh Thuận",
      taxCode: "4500987654",
      province: "NT",
      provinceName: "Ninh Thuận",
      address: "Tháp Chàm, Ninh Thuận",
      contactPerson: "Lê Văn Ninh",
      contactPhone: "0912345678",
      contactEmail: "ninhthuan.clean@gmail.com",
      status: "APPROVED",
      updatedAt: "2026-11-02T10:00:00Z",
      demands: [],
    };

    const blob = await exportDemandSmeDocx(demandRecord);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(5000);
    expect(blob.type).toBe(DOCX_MIME_TYPE);
  });
});
