using System;
using System.Collections.Generic;
using NacenTech.Modules.Assessment.Application;
using Xunit;

namespace NacenTech.Modules.Assessment.Tests;

public sealed class Tt17ScoringEngineTests
{
    private readonly Tt17ScoringEngine _engine = new();

    [Fact]
    public void Advanced_Enterprise_Achieves_TienTien_Classification()
    {
        var survey = new Tt17SurveyDataDto
        {
            IndustryCode = "C.28",
            TotalCapital = 150_000_000_000,
            TotalWorkforce = 200,
            DirectWorkers = 100,
            IndirectStaff = 100,

            // Nhóm T: Công nghệ cao (30đ)
            OriginalCostEquipment = 50_000_000_000,
            CurrentBookValueEquipment = 42_000_000_000, // K_kh = 16% < 20% -> 5đ
            NewInvestEquipment3Years = 30_000_000_000,
            ReplacementEquipment3Years = 10_000_000_000, // K_dm = 80% >= 75% -> 3đ
            DigitalEquipmentValue = 100_000_000_000, // K_tdh = 1000 >= 1.5 * 300 -> 3đ
            DataCollectionSystems = new List<string> { "SCADA", "MDC", "FMS", "CIM" }, // 4đ -> TC04 = 7đ
            EnergyCostYear = 500_000_000, // K_nl <= 0.25 * K_chuan -> 4đ
            MaterialCostYear = 5_000_000_000, // K_nvl <= 0.25 * K_chuan -> 4đ
            MainProductStandard = "co_so_vuot_quoc_te", // 4đ
            // ScoreT = 5 + 3 + 3 + 7 + 4 + 4 + 4 = 30đ

            // Nhóm E: Hiệu quả cao (20đ)
            FinancialSeries = new List<FinancialSeriesDto>
            {
                new() { Year = 2023, IndustrialOutputValue = 50_000_000_000, NetRevenue = 48_000_000_000, DirectWorkersCount = 100 },
                new() { Year = 2024, IndustrialOutputValue = 55_000_000_000, NetRevenue = 52_000_000_000, DirectWorkersCount = 100 },
                new() { Year = 2025, IndustrialOutputValue = 60_000_000_000, NetRevenue = 60_000_000_000, DirectWorkersCount = 100 },
            }, // K_ns = 600 >= 3 * 150 -> 5đ
            HasKaizenPolicy = true,
            KaizenCount3Years = 5,
            HasHighImpactKaizen = true, // 3đ
            MaintenanceLevel = 4, // 4đ
            TransferredTechTypes = new List<string> { "sang_che" }, // 4đ
            HighSkilledWorkers = 30, // 30% >= 20% -> 1đ
            QualifiedManagers = 60, // 60% >= 50% -> 1đ
            QualifiedProfessionals = 70, // 70% >= 60% -> 1đ
            TrainedWorkers = 90, // 90% >= 80% -> 1đ -> TC12 = 4đ
            // ScoreE = 5 + 3 + 4 + 4 + 4 = 20đ

            // Nhóm O: Quản trị tốt (19đ)
            TrainingCost3Years = 1_500_000_000, // K_dthl = 2.5% >= 2% -> 3đ
            SoftwareApplications = new List<string> { "MES", "ERP", "PLM", "PDM", "SCM" }, // 5đ
            IsoCertifications = new List<string> { "ISO 9001", "ISO 22000" }, // 2đ
            ProductivityTools = new List<string> { "5S", "Kaizen" }, // 1đ -> TC16 = 3đ
            EnvironmentalCompliant = true,
            HasIso14001 = true,
            HasWasteRecycling = true, // 3đ
            // TC15: OEE fallback 85% -> 5đ
            // ScoreO = 3 + 5 + 5 + 3 + 3 = 19đ

            // Nhóm R: R&D mạnh (17đ)
            ItInfrastructureLevel = 3, // 3đ
            ItExpenses3Years = 300_000_000, // K_tt = 0.5% >= 0.25% -> 3đ
            RdWorkforceCount = 20, // H5 = 10% >= 2.5%, M_rd = 20 >= 15 -> 4đ
            RdFacilityLevel = 3, // 3đ
            RdExpenses3Years = 1_200_000_000, // K_rd = 2.0% >= 1.5% -> 3đ
            HasSciTechFund = true, // 1đ -> TC22 = 4đ
            // ScoreR = 3 + 3 + 4 + 3 + 4 = 17đ

            // Nhóm I: Đổi mới sáng tạo (14đ)
            NewProductType = "hoan_toan_moi",
            NewProductRevenueRatio = 25.0, // 3 + 1 = 4đ
            RdTechnologyResult = "bang_sang_che", // 4đ
            AcademyPartnershipType = "du_an_rd", // 2đ
            DigitalStrategyLevel = "da_xay_dung", // 1đ
            DigitalTechnologies = new List<string> { "Cloud", "Robot", "IoT" },
            DigitalAdoptionScope = "toan_nha_may" // 3đ -> TC26 = 4đ
            // ScoreI = 4 + 4 + 2 + 4 = 14đ
        };

        var result = _engine.Calculate(survey);

        Assert.Equal(30.0, result.ScoreT);
        Assert.Equal(20.0, result.ScoreE);
        Assert.Equal(19.0, result.ScoreO);
        Assert.Equal(17.0, result.ScoreR);
        Assert.Equal(14.0, result.ScoreI);
        Assert.Equal(100.0, result.TotalScore);
        Assert.Equal(1.0, result.SyncCoefficient);
        Assert.Equal("TIEN_TIEN", result.Classification);
        Assert.Empty(result.Bottlenecks);
    }

    [Fact]
    public void Outdated_Enterprise_Achieves_LacHau_Classification()
    {
        var survey = new Tt17SurveyDataDto
        {
            IndustryCode = "C.28",
            TotalCapital = 5_000_000_000,
            TotalWorkforce = 50,
            DirectWorkers = 40,
            IndirectStaff = 10,

            // Nhóm T: Cũ kỹ, lạc hậu
            OriginalCostEquipment = 100_000_000,
            CurrentBookValueEquipment = 10_000_000, // K_kh = 90% >= 80% -> 1đ
            NewInvestEquipment3Years = 0,
            ReplacementEquipment3Years = 0, // K_dm = 0% -> 0đ
            DigitalEquipmentValue = 0, // K_tdh = 0 -> 0đ
            DataCollectionSystems = new List<string>(), // 0đ
            EnergyCostYear = 500_000_000, // > K_chuan -> 1đ
            MaterialCostYear = 5_000_000_000, // > K_chuan -> 1đ
            MainProductStandard = "co_so", // 1đ
            // ScoreT = 1 + 1 + 0 + 0 + 1 + 1 + 1 = 5đ

            // Nhóm E: Hiệu quả thấp
            FinancialSeries = new List<FinancialSeriesDto>
            {
                new() { Year = 2025, IndustrialOutputValue = 1_000_000_000, NetRevenue = 1_000_000_000, DirectWorkersCount = 40 }
            }, // K_ns = 25 < 0.25 * 150 -> 1đ
            HasKaizenPolicy = false,
            KaizenCount3Years = 0,
            HasHighImpactKaizen = false, // 1đ
            MaintenanceLevel = 1, // 1đ
            TransferredTechTypes = new List<string>(), // 1đ
            HighSkilledWorkers = 0,
            QualifiedManagers = 0,
            QualifiedProfessionals = 0,
            TrainedWorkers = 0, // 1đ
            // ScoreE = 1 + 1 + 1 + 1 + 1 = 5đ

            // Nhóm O: Quản lý thủ công
            TrainingCost3Years = 0, // 0đ
            SoftwareApplications = new List<string>(), // 0đ
            IsoCertifications = new List<string>(),
            ProductivityTools = new List<string>(), // 1đ
            EnvironmentalCompliant = false, // 1đ
            HasIso14001 = false,
            HasWasteRecycling = false,
            // ScoreO = 0 + 0 + 1 + 1 + 1 = 3đ

            // Nhóm R: Không có R&D
            ItInfrastructureLevel = 1, // 1đ
            ItExpenses3Years = 0, // 0đ
            RdWorkforceCount = 0, // 1đ
            RdFacilityLevel = 1, // 1đ
            RdExpenses3Years = 0, // 1đ
            HasSciTechFund = false,
            // ScoreR = 1 + 0 + 1 + 1 + 1 = 4đ

            // Nhóm I: Không có sáng chế
            NewProductType = "kieu_dang", // 1đ
            NewProductRevenueRatio = 0,
            RdTechnologyResult = "dang_nghien_cuu", // 1đ
            AcademyPartnershipType = "none", // 0đ
            DigitalStrategyLevel = "chua_biet", // 0đ
            DigitalTechnologies = new List<string>(),
            DigitalAdoptionScope = "nghien_cuu" // 0đ
            // ScoreI = 1 + 1 + 0 + 0 = 2đ
        };

        var result = _engine.Calculate(survey);

        Assert.True(result.TotalScore < 35.0, $"Expected < 35, got {result.TotalScore}");
        Assert.True(result.SyncCoefficient < 0.30, $"Expected < 0.30, got {result.SyncCoefficient}");
        Assert.Equal("LAC_HAU", result.Classification);
        Assert.NotEmpty(result.Bottlenecks);
    }

    [Fact]
    public void Disconnected_Scores_Triggers_CanThamDinh_Status()
    {
        // Lệch pha chuẩn TT17: T và E rất cao (50đ), O khá (11đ) -> Tổng điểm = 61đ
        // Nhưng R và I bằng 0 khiến T_ĐB = 0.0 (< 0.50)
        var survey = new Tt17SurveyDataDto
        {
            IndustryCode = "C.28",
            TotalCapital = 50_000_000_000,
            TotalWorkforce = 200,
            DirectWorkers = 100,
            IndirectStaff = 100,

            // T = 30đ
            OriginalCostEquipment = 50_000_000_000,
            CurrentBookValueEquipment = 42_000_000_000,
            NewInvestEquipment3Years = 30_000_000_000,
            ReplacementEquipment3Years = 10_000_000_000,
            DigitalEquipmentValue = 100_000_000_000,
            DataCollectionSystems = new List<string> { "SCADA", "MDC", "FMS", "CIM" },
            EnergyCostYear = 500_000_000,
            MaterialCostYear = 5_000_000_000,
            MainProductStandard = "co_so_vuot_quoc_te",

            // E = 20đ
            FinancialSeries = new List<FinancialSeriesDto>
            {
                new() { Year = 2025, IndustrialOutputValue = 60_000_000_000, NetRevenue = 60_000_000_000, DirectWorkersCount = 100 }
            },
            HasKaizenPolicy = true,
            KaizenCount3Years = 5,
            HasHighImpactKaizen = true,
            MaintenanceLevel = 4,
            TransferredTechTypes = new List<string> { "sang_che" },
            HighSkilledWorkers = 30,
            QualifiedManagers = 60,
            QualifiedProfessionals = 70,
            TrainedWorkers = 90,

            // O = 11đ
            TrainingCost3Years = 0, // 0đ
            SoftwareApplications = new List<string> { "ERP", "MES", "SCM" }, // 3đ
            IsoCertifications = new List<string> { "ISO 9001" }, // 2đ
            ProductivityTools = new List<string> { "5S" }, // 1đ -> 3đ
            EnvironmentalCompliant = true,
            HasIso14001 = false,
            HasWasteRecycling = false, // 1đ
            // TC15 OEE fallback 4đ -> 3 + 3 + 1 + 4 = 11đ

            // R hoàn toàn bằng 0
            ItInfrastructureLevel = 0,
            ItExpenses3Years = 0,
            RdWorkforceCount = 0,
            RdFacilityLevel = 0,
            RdExpenses3Years = 0,
            HasSciTechFund = false,

            // I hoàn toàn bằng 0
            NewProductType = "none",
            NewProductRevenueRatio = 0,
            RdTechnologyResult = "none",
            AcademyPartnershipType = "none",
            DigitalStrategyLevel = "chua_biet",
            DigitalTechnologies = new List<string>()
        };

        var result = _engine.Calculate(survey);
        Assert.True(result.TotalScore >= 60.0 && result.TotalScore < 75.0, $"Actual TotalScore: {result.TotalScore}");
        Assert.Equal(0.0, result.SyncCoefficient);
        // BR-02-DELTA-01: Điểm 60-74 nhưng hệ số đồng bộ < 0.50 bị giáng cấp xuống TRUNG_BINH
        Assert.Equal("TRUNG_BINH", result.Classification);
    }

    [Fact]
    public void DivisionByZero_SafelyReturnsDefaultScores_WithoutThrowing()
    {
        // Khi doanh nghiệp mới thành lập hoặc không có doanh thu: G_bd = 0, M_tt = 0, G_dt = 0
        var emptySurvey = new Tt17SurveyDataDto
        {
            OriginalCostEquipment = 0,
            CurrentBookValueEquipment = 0,
            TotalCapital = 0,
            TotalWorkforce = 0,
            DirectWorkers = 0,
            IndirectStaff = 0,
            EnergyCostYear = 0,
            MaterialCostYear = 0,
            FinancialSeries = new List<FinancialSeriesDto>()
        };

        var result = _engine.Calculate(emptySurvey, "C.10");

        Assert.NotNull(result);
        Assert.True(result.TotalScore > 0);
        Assert.False(double.IsNaN(result.TotalScore));
        Assert.False(double.IsInfinity(result.TotalScore));
        Assert.False(double.IsNaN(result.SyncCoefficient));
    }

    [Fact]
    public void Tt17Assessment_Lifecycle_Enforces_State_Transitions()
    {
        var assessment = new Tt17Assessment(
            Guid.NewGuid(),
            "Công ty CP Cơ khí Chính xác Hải Phòng",
            "0201234567",
            2026,
            "HP",
            "C.28"
        );

        Assert.Equal("DRAFT", assessment.Status);

        // Update draft
        assessment.UpdateDraft("{\"modernRatio\": 50}", "{\"totalScore\": 65}");
        Assert.Contains("modernRatio", assessment.SurveyDataJson);

        // Submit
        assessment.Submit("{\"totalScore\": 65, \"classification\": \"TRUNG_BINH_TIEN_TIEN\"}");
        Assert.Equal("SUBMITTED", assessment.Status);
        Assert.NotNull(assessment.SubmittedAtUtc);

        // Review Approve
        var reviewerId = Guid.NewGuid();
        assessment.Review("APPROVE", reviewerId, "Hồ sơ và BCTC 3 năm đầy đủ hợp lệ.", null);
        Assert.Equal("APPROVED", assessment.Status);
        Assert.NotNull(assessment.ApprovedAtUtc);
        Assert.Equal(reviewerId, assessment.ReviewerId);
    }
}
