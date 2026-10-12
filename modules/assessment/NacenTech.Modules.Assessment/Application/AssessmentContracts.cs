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

    // Mục B: Nhóm T - Thiết bị & Công nghệ
    public List<MachineryDto> Machineries { get; set; } = new();
    public double DepreciationCoefficient { get; set; } // K_kh (0.0 - 1.0)
    public double ModernEquipmentRatio { get; set; } // % thiết bị thế hệ mới
    public double AdvancedCountryEquipmentRatio { get; set; } // % máy móc OECD/G7
    public double AutomationRatio { get; set; } // % thiết bị CNC/PLC/Robot
    public double AverageEquipmentAge { get; set; } // Tuổi bình quân thiết bị (năm)
    public int LineSynchronizationLevel { get; set; } // 1 - 5 (mức độ đồng bộ)
    public double MaterialConsumptionRatio { get; set; } // % so với định mức

    // Mục C: Nhóm E - Hiệu quả khai thác
    public List<FinancialSeriesDto> FinancialSeries { get; set; } = new(); // 3 năm
    public double DefectProductRatio { get; set; } // % sản phẩm lỗi
    public double CapacityUtilizationRatio { get; set; } // % công suất thiết kế
    public double ExportRevenueRatio { get; set; } // % doanh thu xuất khẩu
    public double EnergySavingRatio { get; set; } // % tiết kiệm năng lượng

    // Mục D: Nhóm O - Tổ chức & Quản lý
    public List<string> IsoCertifications { get; set; } = new(); // ISO 9001, ISO 14001...
    public List<string> SoftwareApplications { get; set; } = new(); // ERP, MES, CRM...
    public List<string> ProductivityTools { get; set; } = new(); // 5S, Kaizen, Lean...
    public int DigitalMaturityLevel { get; set; } // 1 - 5
    public bool EnvironmentalCompliant { get; set; } = true;

    // Mục Đ: Nhóm R - R&D
    public int RdWorkforceCount { get; set; } // M_r&d
    public bool HasLabOrTestingFacility { get; set; }
    public double RdExpenseRatio { get; set; } // % R&D trên doanh thu
    public int RdProjectsCount { get; set; }
    public int TechnologyMasteryLevel { get; set; } // 1 - 5

    // Mục E: Nhóm I - Đổi mới sáng tạo
    public int GrantedPatentsCount { get; set; } // Sáng chế / GPHI
    public int RegisteredIpCount { get; set; } // Kiểu dáng, Nhãn hiệu
    public double NewProductRevenueRatio { get; set; } // % doanh thu SP mới 3 năm
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
}

public sealed class FinancialSeriesDto
{
    public int Year { get; set; }
    public decimal IndustrialOutputValue { get; set; } // G_sp (VNĐ)
    public decimal NetRevenue { get; set; } // G_dt (VNĐ)
    public int DirectWorkersCount { get; set; } // M_tt
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
