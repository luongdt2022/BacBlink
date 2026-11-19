using System;
using System.Collections.Generic;

namespace NacenTech.Modules.Assessment.Application;

public sealed class Tt17AssessmentDto
{
    public Guid Id { get; set; }
    public Guid EnterpriseId { get; set; }
    public string EnterpriseName { get; set; } = "";
    public string TaxCode { get; set; } = "";
    public int AssessmentYear { get; set; }
    public string Status { get; set; } = "DRAFT"; // DRAFT, SUBMITTED, IN_REVIEW, CHANGES_REQUESTED, APPROVED
    public string ScopeType { get; set; } = "PROVINCE";
    public string ScopeId { get; set; } = "";
    public string IndustryCode { get; set; } = ""; // C.10 - C.32
    public Tt17SurveyDataDto SurveyData { get; set; } = new();
    public Tt17ScoreResultDto ScoreResult { get; set; } = new();
    public string? ReviewNotes { get; set; }
    public bool? HasRawSurvey { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
}

public sealed class Tt17SurveyDataDto
{
    // Mục A: Thông tin chung & Định danh
    public string CompanyName { get; set; } = "";
    public string TaxCode { get; set; } = "";
    public string ContactPerson { get; set; } = "";
    public double TotalCapital { get; set; } // Tổng nguồn vốn (VNĐ)
    public int TotalWorkforce { get; set; } // Lao động M
    public string CompanyAddress { get; set; } = "";
    public string CompanyPhone { get; set; } = "";
    public string CompanyEmail { get; set; } = "";
    public string CompanyType { get; set; } = "";
    public string IndustryCode { get; set; } = "C.28";

    // Mục B: Nhóm T - Thiết bị & Công nghệ theo Phiếu thu thập
    public List<MachineryDto> Machineries { get; set; } = new();
    public double OriginalCostEquipment { get; set; } // G_bd: Nguyên giá ban đầu (VNĐ)
    public double CurrentBookValueEquipment { get; set; } // G_sx: Giá trị hiện tại đã khấu hao (VNĐ)
    public double NewInvestEquipment3Years { get; set; } // G_tbm1: Thiết bị mới mở rộng 3 năm (VNĐ)
    public double ReplacementEquipment3Years { get; set; } // G_tbm2: Thiết bị mới thay thế bảo dưỡng 3 năm (VNĐ)
    public double DigitalEquipmentValue { get; set; } // G_sh: Thiết bị số hóa quá trình SX (VNĐ)
    public List<string> TransferredTechTypes { get; set; } = new(); // dong_bo, ban_quyen, cai_tien, sang_che
    public double TransferredTechValue { get; set; } // Tổng giá trị hợp đồng chuyển giao (VNĐ)

    // Legacy/Fallback fields
    public double DepreciationCoefficient { get; set; } // K_kh (0.0 - 1.0)
    public double ModernEquipmentRatio { get; set; } // % thiết bị thế hệ mới
    public double AdvancedCountryEquipmentRatio { get; set; } // % máy móc OECD/G7
    public double AutomationRatio { get; set; } // % thiết bị CNC/PLC/Robot
    public double AverageEquipmentAge { get; set; } // Tuổi bình quân thiết bị (năm)
    public int LineSynchronizationLevel { get; set; } // 1 - 5 (mức độ đồng bộ)
    public double MaterialConsumptionRatio { get; set; } // % so với định mức

    // Mục C: Nhóm E - Hiệu quả khai thác
    public List<FinancialSeriesDto> FinancialSeries { get; set; } = new(); // 3 năm
    public string MainProductStandard { get; set; } = "quoc_te"; // co_so, quoc_gia, quoc_te, co_so_vuot_quoc_te
    public double EnergyCostYear { get; set; } // G_nl: Chi phí điện & nhiên liệu năm gần nhất (VNĐ)
    public double MaterialCostYear { get; set; } // G_nvl: Chi phí nguyên vật liệu năm gần nhất (VNĐ)
    public bool HasKaizenPolicy { get; set; } = true;
    public int KaizenCount3Years { get; set; } = 3;
    public bool HasHighImpactKaizen { get; set; } = true;
    public int MaintenanceLevel { get; set; } = 2; // 1-sự cố, 2-định kỳ, 3-chuyên sâu, 4-chẩn đoán

    // Legacy/Fallback Mục C
    public double DefectProductRatio { get; set; } // % sản phẩm lỗi
    public double CapacityUtilizationRatio { get; set; } // % công suất thiết kế
    public double ExportRevenueRatio { get; set; } // % doanh thu xuất khẩu
    public double EnergySavingRatio { get; set; } // % tiết kiệm năng lượng

    // Mục D: Nhóm O - Nhân lực & Quản trị Môi trường
    public int DirectWorkers { get; set; } // M_tt
    public int IndirectStaff { get; set; } // M_gt
    public int TrainedWorkers { get; set; }
    public int HighSkilledWorkers { get; set; } // M_bc
    public int QualifiedManagers { get; set; } // M_ql
    public int QualifiedProfessionals { get; set; } // M_nv
    public double TrainingCost3Years { get; set; } // G_dthl (VNĐ)
    public List<string> IsoCertifications { get; set; } = new(); // ISO 9001, ISO 14001...
    public List<string> SoftwareApplications { get; set; } = new(); // ERP, MES, CRM...
    public List<string> DataCollectionSystems { get; set; } = new(); // SCADA, MDC, FMS, CIM
    public List<string> ProductivityTools { get; set; } = new(); // 5S, Kaizen, Lean...
    public int DigitalMaturityLevel { get; set; } = 2; // 1 - 5
    public bool EnvironmentalCompliant { get; set; } = true;
    public bool HasIso14001 { get; set; } = true;
    public bool HasWasteRecycling { get; set; } = true;

    // Mục Đ: Nhóm R - CNTT & R&D
    public int ItInfrastructureLevel { get; set; } = 2; // 1: cơ bản, 2: quy trình, 3: tích hợp
    public double ItExpenses3Years { get; set; } // G_tt (VNĐ)
    public int RdFacilityLevel { get; set; } = 2; // 1: kiêm nhiệm, 2: lab, 3: viện/trung tâm
    public int RdWorkforceCount { get; set; } // M_r&d
    public double RdExpenses3Years { get; set; } // G_rd (VNĐ)
    public bool HasSciTechFund { get; set; } = true;
    public bool HasLabOrTestingFacility { get; set; }
    public double RdExpenseRatio { get; set; } // % R&D trên doanh thu
    public int RdProjectsCount { get; set; }
    public int TechnologyMasteryLevel { get; set; } = 2; // 1 - 5

    // Mục E: Nhóm I - Đổi mới sáng tạo & CĐS
    public string NewProductType { get; set; } = "tinh_nang"; // none, kieu_dang, tinh_nang, hoan_toan_moi
    public double NewProductRevenueRatio { get; set; } // % doanh thu SP mới 3 năm
    public string RdTechnologyResult { get; set; } = "giai_phap_huu_ich"; // none, dang_nghien_cuu, thu_nghiem_lab, giai_phap_huu_ich, bang_sang_che
    public string AcademyPartnershipType { get; set; } = "du_an_rd"; // none, chuyen_gia_dao_tao, du_an_rd
    public string DigitalStrategyLevel { get; set; } = "dang_thuc_hien"; // chua_biet, chuan_bi, dang_thuc_hien, da_xay_dung
    public List<string> DigitalTechnologies { get; set; } = new(); // Cloud, Robot, IoT...
    public string DigitalAdoptionScope { get; set; } = "mot_so_bo_phan"; // nghien_cuu, mot_so_bo_phan, toan_nha_may

    // Legacy/Fallback Mục E
    public int GrantedPatentsCount { get; set; } // Sáng chế / GPHI
    public int RegisteredIpCount { get; set; } // Kiểu dáng, Nhãn hiệu
    public int AcademyPartnershipCount { get; set; } // Hợp tác Viện/Trường
    public bool HasInternalInnovationPolicy { get; set; } = true;
}

public sealed class MachineryDto
{
    public string Name { get; set; } = "";
    public string OriginCountry { get; set; } = "";
    public int ManufactureYear { get; set; }
    public int StartUsageYear { get; set; }
    public decimal OriginalCost { get; set; }
    public decimal CurrentBookValue { get; set; }
    public bool IsAutomated { get; set; }
    public bool IsAdvancedCountry { get; set; }
    public string ProductName { get; set; } = "";
    public decimal DesignedCapacityYear { get; set; }
}

public sealed class FinancialSeriesDto
{
    public int Year { get; set; }
    public decimal IndustrialOutputValue { get; set; } // G_sp (VNĐ)
    public decimal NetRevenue { get; set; } // G_dt (VNĐ)
    public decimal TotalCosts { get; set; } // G_cp (VNĐ)
    public decimal ActualOutput { get; set; } // P_tt
    public decimal DesignedCapacity { get; set; } // P
    public int DirectWorkersCount { get; set; } // M_tt
}

public sealed class IndustryBenchmarkDto
{
    public string IndustryCode { get; set; } = "C.28";
    public string IndustryName { get; set; } = "";
    public double KChuan1 { get; set; } = 300.0; // Triệu đồng/LĐ
    public double KChuan2 { get; set; } = 0.07;  // Gnl/Gdt
    public double KChuan3 { get; set; } = 0.55;  // Gnvl/Gdt
    public double KChuan4 { get; set; } = 150.0; // Triệu đồng/người/năm
}

public sealed class Tt17ScoreResultDto
{
    public double ScoreT { get; set; } // Max 30
    public double ScoreE { get; set; } // Max 20
    public double ScoreO { get; set; } // Max 19
    public double ScoreR { get; set; } // Max 17
    public double ScoreI { get; set; } // Max 14
    public double TotalScore { get; set; } // Max 100
    public double SyncCoefficient { get; set; } // T_ĐB
    public string Classification { get; set; } = "CAN_THAM_DINH"; // LAC_HAU, TRUNG_BINH, TRUNG_BINH_TIEN_TIEN, TIEN_TIEN, CAN_THAM_DINH
    public string ClassificationLabel { get; set; } = "";
    public List<CriterionScoreDto> Criteria { get; set; } = new();
    public List<string> Bottlenecks { get; set; } = new(); // Danh sách mã tiêu chí điểm nghẽn
}

public sealed class CriterionScoreDto
{
    public string Code { get; set; } = ""; // TC01 - TC26
    public string Group { get; set; } = ""; // T, E, O, R, I
    public string Name { get; set; } = "";
    public double MaxScore { get; set; }
    public double AchievedScore { get; set; }
    public bool IsBottleneck { get; set; }
    public string Recommendation { get; set; } = "";
}

public sealed class SaveAssessmentDraftDto
{
    public int AssessmentYear { get; set; }
    public string IndustryCode { get; set; } = "";
    public string ScopeId { get; set; } = "";
    public string? EnterpriseName { get; set; }
    public string? TaxCode { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public Tt17SurveyDataDto SurveyData { get; set; } = new();
}

public sealed class ReviewAssessmentDto
{
    public string Action { get; set; } = ""; // APPROVE, REJECT, REQUEST_CHANGES
    public string? ReviewNotes { get; set; }
    public Dictionary<string, double>? AdjustedScores { get; set; } // Mã TC -> Điểm điều chỉnh
}
