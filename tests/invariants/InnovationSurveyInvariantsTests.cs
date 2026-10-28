using System;
using System.Collections.Generic;
using System.Text.Json;
using NacenTech.Modules.Demand.Domain;
using NacenTech.Modules.Enterprise.Application;
using NacenTech.Modules.Enterprise.Domain;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public sealed class InnovationSurveyInvariantsTests
{
    // =========================================================================
    // BR-02-015: INVARIANT KHÓA & BẢO VỆ MÃ SỐ THUẾ KHI ĐÃ ĐĂNG NHẬP
    // =========================================================================

    [Fact]
    public void BR_02_015_WhenAuthenticated_WithMismatchedTaxCode_ShouldThrowInvalidOperationException()
    {
        // Arrange: User đã xác thực sở hữu DN có MST 0100255428
        bool isAuthenticated = true;
        string linkedEnterpriseTaxCode = "0100255428";
        string submittedTaxCode = "0108992134"; // Giả mạo hoặc sửa request

        // Act & Assert
        var ex = Should.Throw<InvalidOperationException>(() =>
        {
            InnovationSurveyInvariants.ValidateTaxCodeSubmission(
                isAuthenticated,
                linkedEnterpriseTaxCode,
                submittedTaxCode);
        });

        ex.Message.ShouldContain(InnovationSurveyInvariants.ErrTaxCodeMismatch);
        ex.Message.ShouldContain("BR-02-015");
    }

    [Fact]
    public void BR_02_015_WhenAuthenticated_WithMatchingTaxCode_ShouldPassValidation()
    {
        // Arrange: User đã xác thực và gửi đúng MST của DN mình
        bool isAuthenticated = true;
        string linkedEnterpriseTaxCode = "0100255428";
        string submittedTaxCode = "0100255428";

        // Act & Assert: Không phát sinh ngoại lệ
        Should.NotThrow(() =>
        {
            InnovationSurveyInvariants.ValidateTaxCodeSubmission(
                isAuthenticated,
                linkedEnterpriseTaxCode,
                submittedTaxCode);
        });
    }

    [Fact]
    public void BR_02_015_WhenGuestUser_ShouldNotEnforceTaxCodeMatch()
    {
        // Arrange: Khách vãng lai chưa đăng nhập
        bool isAuthenticated = false;
        string? linkedEnterpriseTaxCode = null;
        string submittedTaxCode = "0108992134";

        // Act & Assert: Khách vãng lai được phép nộp tự do
        Should.NotThrow(() =>
        {
            InnovationSurveyInvariants.ValidateTaxCodeSubmission(
                isAuthenticated,
                linkedEnterpriseTaxCode,
                submittedTaxCode);
        });
    }

    [Theory]
    [InlineData(true, true, true)]    // Authenticated + Có DN -> Khóa MST (true)
    [InlineData(true, false, false)]  // Authenticated nhưng chưa có DN -> Mở MST (false)
    [InlineData(false, true, false)]  // Khách vãng lai dù tìm thấy DN -> Mở MST (false)
    [InlineData(false, false, false)] // Khách vãng lai không có DN -> Mở MST (false)
    public void BR_02_015_DetermineIsTaxCodeLocked_ShouldBeTrueOnlyWhenAuthenticatedAndLinked(
        bool isAuthenticated, bool hasLinkedEnterprise, bool expectedLocked)
    {
        // Act
        var isLocked = InnovationSurveyInvariants.DetermineIsTaxCodeLocked(isAuthenticated, hasLinkedEnterprise);

        // Assert
        isLocked.ShouldBe(expectedLocked);
    }

    // =========================================================================
    // BR-02-016: LOGIC CHẤM ĐIỂM ĐMST BẰNG INNOVATION RATING ENGINE (43 CÂU HỎI)
    // =========================================================================

    [Fact]
    public void InnovationRatingEngine_WithFull43QuestionsLeading_ShouldScoreHighAndBeLeading()
    {
        // Arrange: Doanh nghiệp ĐMST xuất sắc với đầy đủ tiêu chí
        var enterprise = new Enterprise(Guid.NewGuid())
        {
            Name = "CÔNG TY CỔ PHẦN CÔNG NGHỆ DẪN ĐẦU",
            TaxCode = "0109999999",
            HasRdUnit = true,
            HasRdBudget = true,
            RdBudgetAmount = 500_000_000m,
            IsExporting = true,
            InValueChain = true,
            HighQualificationRatio = "Trên 50%"
        };

        var answers = new Dictionary<string, object?>
        {
            ["c01_legal_name"] = "CÔNG TY CỔ PHẦN CÔNG NGHỆ DẪN ĐẦU",
            ["c02_tax_code"] = "0109999999",
            ["c12_has_rd_unit"] = true,
            ["c13_has_training"] = true,
            ["c14_has_machinery_upgrade"] = true,
            ["c15_has_rd_budget"] = true,
            ["c16_governance_platforms"] = new[] { "ERP", "CRM", "HRM" },
            ["c17_new_products"] = true,
            ["c18_improved_products"] = true,
            ["c19_process_innovation"] = true,
            ["c20_org_innovation"] = true,
            ["c21_marketing_innovation"] = true,
            ["c22_tech_acquisition"] = new[] { "Tự nghiên cứu R&D nội bộ", "Mua thiết bị kèm công nghệ", "Tiếp nhận chuyển giao từ Viện, Trường ĐH" },
            ["c23_impact_outcomes"] = new[] { "Tăng doanh thu / lợi nhuận", "Nâng cao năng suất lao động", "Nâng cao chất lượng sản phẩm" },
            ["c24_digital_strategy"] = "Đã có chiến lược/kế hoạch bằng văn bản",
            ["c25_digital_maturity"] = "Toàn diện (Tích hợp sâu, tự động hóa)",
            ["c26_digitized_activities"] = new[] { "Kế toán", "Bán hàng", "Sản xuất", "R&D" },
            ["c27_digital_technologies"] = new[] { "Điện toán đám mây (Cloud Computing)", "Trí tuệ nhân tạo (AI)" },
            ["c28_collaborations"] = new Dictionary<string, string>
            {
                ["universities"] = "Thường xuyên",
                ["same_industry"] = "Thường xuyên",
                ["incubators"] = "Thỉnh thoảng",
                ["funds"] = "Thỉnh thoảng",
                ["gov_agencies"] = "Thường xuyên",
                ["international"] = "Thường xuyên"
            },
            ["c29_public_support"] = new[] { "Hỗ trợ tài chính, vốn mồi" },
            ["c30_funding_access"] = "Đã gọi vốn / nhận đầu tư thành công",
            ["c31_ip_assets"] = new[] { "Bằng độc quyền Sáng chế", "Nhãn hiệu / Thương hiệu", "Bản quyền phần mềm" },
            ["c32_innovation_results"] = new[] { "Được cấp văn bằng bảo hộ SHTT mới", "Thương mại hóa thành công sản phẩm mới ra thị trường" },
            ["c33_new_product_revenue_ratio"] = "Từ 50% tổng doanh thu trở lên",
            ["c34_recorded_impacts"] = new[] { "Tạo thêm việc làm", "Gia tăng uy tín thương hiệu và vị thế cạnh tranh quốc tế" },
            ["c35_is_exporting"] = true,
            ["c36_in_value_chain"] = true
        };

        var surveyJson = JsonSerializer.Serialize(answers);

        // Act
        var result = InnovationRatingEngine.Calculate(
            enterprise,
            surveyJson,
            hasMachineryUpgrade: true,
            hasTechTraining: true);

        // Assert: Doanh nghiệp đạt thứ hạng LEADING (>= 75đ)
        result.TotalScore.ShouldBeGreaterThanOrEqualTo(75.0m);
        result.Classification.ShouldBe("LEADING");
        result.BadgeName.ShouldBe("Huy hiệu Vàng ĐMST");

        // Kiểm tra đủ 8 nhóm năng lực
        result.GroupScores.Count.ShouldBe(8);
        result.GroupScores.ShouldContain(g => g.GroupCode == "QT" && g.Score > 0);
        result.GroupScores.ShouldContain(g => g.GroupCode == "CN" && g.Score > 0);
        result.GroupScores.ShouldContain(g => g.GroupCode == "SP" && g.Score > 0);
        result.GroupScores.ShouldContain(g => g.GroupCode == "IP" && g.Score > 0);
        result.GroupScores.ShouldContain(g => g.GroupCode == "S"  && g.Score > 0);
        result.GroupScores.ShouldContain(g => g.GroupCode == "TT" && g.Score > 0);
        result.GroupScores.ShouldContain(g => g.GroupCode == "NL" && g.Score > 0);
        result.GroupScores.ShouldContain(g => g.GroupCode == "LK" && g.Score > 0);

        // Kiểm tra biểu đồ Radar Chart 8 trục
        result.RadarChartData.Count.ShouldBe(8);
    }

    [Fact]
    public void InnovationRatingEngine_WithModeratePayload_ShouldComputeTierDeveloping()
    {
        // Arrange: Doanh nghiệp mức độ đang phát triển
        var enterprise = new Enterprise(Guid.NewGuid())
        {
            Name = "CÔNG TY TNHH PHÁT TRIỂN TIÊN TIẾN",
            TaxCode = "0108888888",
            HasRdUnit = false,
            HasRdBudget = false,
            IsExporting = false,
            InValueChain = true,
            HighQualificationRatio = "10 - dưới 30%"
        };

        var answers = new Dictionary<string, object?>
        {
            ["c01_legal_name"] = "CÔNG TY TNHH PHÁT TRIỂN TIÊN TIẾN",
            ["c02_tax_code"] = "0108888888",
            ["c12_has_rd_unit"] = false,
            ["c13_has_training"] = true,
            ["c14_has_machinery_upgrade"] = true,
            ["c15_has_rd_budget"] = false,
            ["c16_governance_platforms"] = new[] { "Phần mềm Kế toán số", "CRM (Quản lý khách hàng)" },
            ["c17_new_products"] = true,
            ["c18_improved_products"] = true,
            ["c19_process_innovation"] = true,
            ["c20_org_innovation"] = false,
            ["c21_marketing_innovation"] = true,
            ["c22_tech_acquisition"] = new[] { "Mua thiết bị, dây chuyền kèm công nghệ" },
            ["c23_impact_outcomes"] = new[] { "Nâng cao năng suất lao động" },
            ["c24_digital_strategy"] = "Đang trong quá trình xây dựng",
            ["c25_digital_maturity"] = "Nâng cao (Đang chuyển đổi từng khâu, kết nối dữ liệu)",
            ["c26_digitized_activities"] = new[] { "Kế toán", "Bán hàng" },
            ["c27_digital_technologies"] = new[] { "Điện toán đám mây (Cloud Computing)" },
            ["c28_collaborations"] = new Dictionary<string, string>
            {
                ["universities"] = "Không có",
                ["same_industry"] = "Thỉnh thoảng",
                ["incubators"] = "Không có",
                ["funds"] = "Không có",
                ["gov_agencies"] = "Không có",
                ["international"] = "Không có"
            },
            ["c31_ip_assets"] = new[] { "Nhãn hiệu / Thương hiệu đã được cấp văn bằng bảo hộ" },
            ["c32_innovation_results"] = new[] { "Thương mại hóa thành công sản phẩm mới ra thị trường" },
            ["c33_new_product_revenue_ratio"] = "Từ 10% đến dưới 30%",
            ["c35_is_exporting"] = false,
            ["c36_in_value_chain"] = true
        };

        var surveyJson = JsonSerializer.Serialize(answers);

        // Act
        var result = InnovationRatingEngine.Calculate(
            enterprise,
            surveyJson,
            hasMachineryUpgrade: true,
            hasTechTraining: true);

        // Assert: Nằm trong dải DEVELOPING (50 - 74.9)
        result.TotalScore.ShouldBeGreaterThanOrEqualTo(50.0m);
        result.TotalScore.ShouldBeLessThan(75.0m);
        result.Classification.ShouldBe("DEVELOPING");
        result.BadgeName.ShouldBe("Huy hiệu Bạc ĐMST");
    }

    [Fact]
    public void InnovationRatingEngine_WithMinimalData_ShouldComputeTierPotential()
    {
        // Arrange: Doanh nghiệp mới bắt đầu làm quen với ĐMST
        var enterprise = new Enterprise(Guid.NewGuid())
        {
            Name = "HỘ KINH DOANH KHỞI SỰ",
            TaxCode = "0107777777",
            HasRdUnit = false,
            HasRdBudget = false,
            IsExporting = false,
            InValueChain = false,
            HighQualificationRatio = "Dưới 10%"
        };

        var answers = new Dictionary<string, object?>
        {
            ["c01_legal_name"] = "HỘ KINH DOANH KHỞI SỰ",
            ["c02_tax_code"] = "0107777777",
            ["c12_has_rd_unit"] = false,
            ["c13_has_training"] = false,
            ["c14_has_machinery_upgrade"] = false,
            ["c15_has_rd_budget"] = false,
            ["c16_governance_platforms"] = new[] { "Chưa áp dụng nền tảng số nào" },
            ["c17_new_products"] = false,
            ["c18_improved_products"] = true, // Chỉ có cải tiến nhỏ
            ["c25_digital_maturity"] = "Khởi đầu (Số hóa tài liệu rời rạc, nhận thức sơ bộ)",
            ["c31_ip_assets"] = new[] { "Chưa đăng ký tài sản trí tuệ nào" },
            ["c33_new_product_revenue_ratio"] = "Dưới 10% tổng doanh thu"
        };

        var surveyJson = JsonSerializer.Serialize(answers);

        // Act
        var result = InnovationRatingEngine.Calculate(
            enterprise,
            surveyJson,
            hasMachineryUpgrade: false,
            hasTechTraining: false);

        // Assert: Điểm dưới 50đ, xếp loại POTENTIAL
        result.TotalScore.ShouldBeLessThan(50.0m);
        result.TotalScore.ShouldBeGreaterThan(0.0m);
        result.Classification.ShouldBe("POTENTIAL");
        result.BadgeName.ShouldBe("Huy hiệu Đồng ĐMST");
    }

    // =========================================================================
    // BR-02-016: THUẬT TOÁN TÍNH CHỈ SỐ TNI (4 CHIỀU K, L, N, O)
    // =========================================================================

    [Theory]
    [InlineData(5, 5, 5, 5, 100, TniClassification.VeryHigh)] // (5*35 + 5*30 + 5*20 + 5*15)/5 = 500/5 = 100
    [InlineData(4, 4, 3, 4, 76, TniClassification.High)]       // (140 + 120 + 60 + 60)/5 = 380/5 = 76
    [InlineData(3, 3, 2, 1, 50, TniClassification.Medium)]     // (105 + 90 + 40 + 15)/5 = 250/5 = 50
    [InlineData(1, 1, 1, 1, 20, TniClassification.Low)]        // (35 + 30 + 20 + 15)/5 = 100/5 = 20
    public void TniCalculationEngine_ShouldComputeAccurateScoreAndClassification(
        int k, int l, int n, int o, int expectedScore, TniClassification expectedClassification)
    {
        // Act
        var result = TniCalculationEngine.Calculate(k, l, n, o);

        // Assert
        result.Score.ShouldBe(expectedScore);
        result.Classification.ShouldBe(expectedClassification);
    }

    // =========================================================================
    // TÍCH HỢP DATA BINDING ENTITY DEMAND SURVEY
    // =========================================================================

    [Fact]
    public void DemandSurvey_SetInnovationDemandDetails_ShouldBindAllFieldsProperly()
    {
        // Arrange
        var survey = new DemandSurvey(
            surveyCode: "SUR-20261028-TEST01",
            surveyType: "INNOVATION_DEMAND",
            companyName: "CÔNG TY TNHH TRƯỜNG HOAN",
            taxCode: "0100255428",
            contactName: "Nguyễn Văn Hoan",
            contactPhone: "0912 345 678",
            contactEmail: "buyer.user@demo.nacentech.vn",
            businessType: "Tư nhân",
            enterpriseSize: "50 - dưới 100 người",
            employeeScale: "50 - dưới 100 người",
            revenueRange3y: "Từ 10 đến dưới 50 tỷ VNĐ",
            topBottlenecks: new List<string> { "Thiếu vốn", "Thiếu công nghệ" }
        );

        var enterpriseId = Guid.NewGuid();
        var supportNeeds = new List<string> { "Hỗ trợ tài chính", "Tư vấn công nghệ" };
        var answersJson = "{\"c01_legal_name\":\"CÔNG TY TNHH TRƯỜNG HOAN\"}";

        // Act
        survey.SetInnovationDemandDetails(
            enterpriseId: enterpriseId,
            surveyAnswers: answersJson,
            hasRdUnit: true,
            hasTechTraining: true,
            hasMachineryUpgrade: true,
            hasRdBudget: true,
            isExporting: false,
            inValueChain: true,
            supportNeeds: supportNeeds,
            recommendations: "Đề nghị đơn giản hóa thủ tục",
            tniScore: 76m,
            tniClassification: "HIGH",
            surveyYear: 2026
        );

        // Assert
        survey.EnterpriseId.ShouldBe(enterpriseId);
        survey.SurveyAnswers.ShouldBe(answersJson);
        survey.HasRdUnit.ShouldBe(true);
        survey.HasTechTraining.ShouldBe(true);
        survey.HasMachineryUpgrade.ShouldBe(true);
        survey.HasRdBudget.ShouldBe(true);
        survey.IsExporting.ShouldBe(false);
        survey.InValueChain.ShouldBe(true);
        survey.SupportNeeds.ShouldBe(supportNeeds);
        survey.Recommendations.ShouldBe("Đề nghị đơn giản hóa thủ tục");
        survey.TniScore.ShouldBe(76m);
        survey.TniClassification.ShouldBe("HIGH");
        survey.SurveyYear.ShouldBe(2026);
    }
}
