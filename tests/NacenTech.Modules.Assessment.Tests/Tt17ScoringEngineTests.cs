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
            // Nhóm T: Công nghệ cao
            DepreciationCoefficient = 0.25, // 4đ
            ModernEquipmentRatio = 80.0, // 5đ
            AdvancedCountryEquipmentRatio = 70.0, // 5đ
            AutomationRatio = 80.0, // 5đ
            AverageEquipmentAge = 4.0, // 4đ
            LineSynchronizationLevel = 5, // 3đ
            MaterialConsumptionRatio = 92.0, // 4đ
            // ScoreT = 30.0

            // Nhóm E: Hiệu quả cao
            DefectProductRatio = 0.8, // 4đ
            CapacityUtilizationRatio = 90.0, // 4đ
            ExportRevenueRatio = 60.0, // 4đ
            EnergySavingRatio = 12.0, // 3đ
            FinancialSeries = new List<FinancialSeriesDto>
            {
                new() { Year = 2023, IndustrialOutputValue = 100_000_000_000, NetRevenue = 95_000_000_000, DirectWorkersCount = 200 },
                new() { Year = 2024, IndustrialOutputValue = 120_000_000_000, NetRevenue = 115_000_000_000, DirectWorkersCount = 200 },
                new() { Year = 2025, IndustrialOutputValue = 150_000_000_000, NetRevenue = 145_000_000_000, DirectWorkersCount = 200 },
            }, // Năng suất tăng trưởng cao -> 5đ
            // ScoreE = 20.0

            // Nhóm O: Quản trị tốt
            IsoCertifications = new List<string> { "ISO 9001", "ISO 14001", "ISO 22000" }, // 5đ
            SoftwareApplications = new List<string> { "ERP SAP", "MES", "CRM" }, // 5đ
            ProductivityTools = new List<string> { "5S", "Kaizen" }, // 3đ
            DigitalMaturityLevel = 5, // 3đ
            EnvironmentalCompliant = true, // 3đ
            // ScoreO = 19.0

            // Nhóm R: R&D mạnh
            TotalWorkforce = 300,
            RdWorkforceCount = 20, // 6.6% -> 4đ
            HasLabOrTestingFacility = true, // 3đ
            RdExpenseRatio = 2.5, // 4đ
            RdProjectsCount = 4, // 3đ
            TechnologyMasteryLevel = 5, // 3đ
            // ScoreR = 17.0

            // Nhóm I: Đổi mới sáng tạo
            GrantedPatentsCount = 3, // 4đ
            NewProductRevenueRatio = 35.0, // 4đ
            AcademyPartnershipCount = 3, // 3đ
            HasInternalInnovationPolicy = true // 3đ
            // ScoreI = 14.0
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
            // Nhóm T: Cũ kỹ, lạc hậu
            DepreciationCoefficient = 0.85, // 1đ
            ModernEquipmentRatio = 10.0, // 1đ
            AdvancedCountryEquipmentRatio = 5.0, // 1đ
            AutomationRatio = 5.0, // 1đ
            AverageEquipmentAge = 18.0, // 1đ
            LineSynchronizationLevel = 1, // 0.6đ
            MaterialConsumptionRatio = 110.0, // 1đ

            // Nhóm E: Hiệu quả thấp
            DefectProductRatio = 8.0, // 1đ
            CapacityUtilizationRatio = 40.0, // 1đ
            ExportRevenueRatio = 0.0, // 1đ
            EnergySavingRatio = 0.0, // 0đ
            FinancialSeries = new List<FinancialSeriesDto>(), // 5đ fallback

            // Nhóm O: Quản lý thủ công
            IsoCertifications = new List<string>(), // 1đ
            SoftwareApplications = new List<string>(), // 1đ
            ProductivityTools = new List<string>(), // 1đ
            DigitalMaturityLevel = 1, // 0.6đ
            EnvironmentalCompliant = false, // 1đ

            // Nhóm R: Không có R&D
            TotalWorkforce = 100,
            RdWorkforceCount = 0, // 1đ
            HasLabOrTestingFacility = false, // 1đ
            RdExpenseRatio = 0.1, // 1đ
            RdProjectsCount = 0, // 1đ
            TechnologyMasteryLevel = 1, // 0.6đ

            // Nhóm I: Không có sáng chế
            GrantedPatentsCount = 0,
            RegisteredIpCount = 0, // 1đ
            NewProductRevenueRatio = 0.0, // 1đ
            AcademyPartnershipCount = 0, // 1đ
            HasInternalInnovationPolicy = false // 1đ
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
        // Lệch pha chuẩn TT17: T và E rất cao (50đ), O khá (11đ) -> Tổng điểm = 61đ (ngưỡng Trung bình tiên tiến 60 - 75đ)
        // Nhưng R và I hoàn toàn bằng 0 khiến T_ĐB sụp đổ về 0.0 (< 0.50)
        // Không thể cấp chứng nhận Trung bình tiên tiến, mà kích hoạt trạng thái "Cần thẩm định chuyên gia"
        var survey = new Tt17SurveyDataDto
        {
            // T tối đa = 30
            DepreciationCoefficient = 0.2,
            ModernEquipmentRatio = 80.0,
            AdvancedCountryEquipmentRatio = 70.0,
            AutomationRatio = 80.0,
            AverageEquipmentAge = 4.0,
            LineSynchronizationLevel = 5,
            MaterialConsumptionRatio = 90.0,

            // E tối đa = 20
            DefectProductRatio = 0.5,
            CapacityUtilizationRatio = 90.0,
            ExportRevenueRatio = 60.0,
            EnergySavingRatio = 12.0,
            FinancialSeries = new List<FinancialSeriesDto>
            {
                new() { Year = 2023, IndustrialOutputValue = 100_000_000_000, NetRevenue = 95_000_000_000, DirectWorkersCount = 200 },
                new() { Year = 2025, IndustrialOutputValue = 150_000_000_000, NetRevenue = 145_000_000_000, DirectWorkersCount = 200 },
            },

            // O = 11đ
            IsoCertifications = new List<string> { "ISO 9001" }, // 3đ
            SoftwareApplications = new List<string> { "ERP" }, // 3đ
            ProductivityTools = new List<string> { "5S" }, // 2đ
            DigitalMaturityLevel = 0,
            EnvironmentalCompliant = true, // 3đ

            // R hoàn toàn bằng 0
            TotalWorkforce = 500,
            RdWorkforceCount = 0,
            HasLabOrTestingFacility = false,
            RdExpenseRatio = 0.0,
            RdProjectsCount = 0,
            TechnologyMasteryLevel = 0,

            // I hoàn toàn bằng 0
            GrantedPatentsCount = 0,
            RegisteredIpCount = 0,
            NewProductRevenueRatio = 0.0,
            AcademyPartnershipCount = 0,
            HasInternalInnovationPolicy = false
        };

        var result = _engine.Calculate(survey);
        // Tổng điểm nằm trong dải 60 <= tau < 75, nhưng T_ĐB = 0 do khuyết hẳn R&D và SHTT
        Assert.True(result.TotalScore >= 60.0 && result.TotalScore < 75.0, $"Actual TotalScore: {result.TotalScore}");
        Assert.Equal(0.0, result.SyncCoefficient);
        Assert.Equal("CAN_THAM_DINH", result.Classification);
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
