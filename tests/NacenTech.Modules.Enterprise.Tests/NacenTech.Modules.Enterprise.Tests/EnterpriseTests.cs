using System;
using System.Threading.Tasks;
using Xunit;
using Shouldly;
using NacenTech.Modules.Enterprise.Application;
using EnterpriseEntity = NacenTech.Modules.Enterprise.Domain.Enterprise;

namespace NacenTech.Modules.Enterprise.Tests;

public class FakeRepository : IEnterpriseRepository
{
    public Task<bool> ExistsByTaxCodeAsync(string taxCode, Guid? excludeId = null, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult(taxCode == "DUPLICATE");
    }

    public Task<EnterpriseEntity?> GetByIdAsync(Guid id, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult<EnterpriseEntity?>(null);
    }

    public Task<EnterpriseEntity?> GetByTaxCodeAsync(string taxCode, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult<EnterpriseEntity?>(null);
    }

    public Task AddAsync(EnterpriseEntity enterprise, System.Threading.CancellationToken ct = default)
    {
        return Task.CompletedTask;
    }

    public Task UpdateAsync(EnterpriseEntity enterprise, System.Threading.CancellationToken ct = default)
    {
        return Task.CompletedTask;
    }

    public Task<(System.Collections.Generic.IReadOnlyList<EnterpriseEntity> Items, int TotalCount)> SearchAsync(EnterpriseSearchQuery query, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult<(System.Collections.Generic.IReadOnlyList<EnterpriseEntity>, int)>((new System.Collections.Generic.List<EnterpriseEntity>(), 0));
    }

    public Task<EnterpriseDashboardStatsDto> GetDashboardStatsAsync(System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult(new EnterpriseDashboardStatsDto(0, 0, new System.Collections.Generic.List<ProvinceCountDto>(), new System.Collections.Generic.List<SectorCountDto>(), new System.Collections.Generic.List<TniClassificationCountDto>(), new System.Collections.Generic.List<BottleneckCountDto>()));
    }

    public Task<Domain.EnterpriseInnovationEvaluation?> GetInnovationEvaluationAsync(string taxCode, int? evaluationYear = null, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult<Domain.EnterpriseInnovationEvaluation?>(null);
    }

    public Task AddInnovationEvaluationAsync(Domain.EnterpriseInnovationEvaluation evaluation, System.Threading.CancellationToken ct = default)
    {
        return Task.CompletedTask;
    }

    public Task UpdateInnovationEvaluationAsync(Domain.EnterpriseInnovationEvaluation evaluation, System.Threading.CancellationToken ct = default)
    {
        return Task.CompletedTask;
    }

    public Task<(string? SurveyAnswersJson, bool HasMachineryUpgrade, bool HasTechTraining)> GetSurveyAnswersAsync(Guid enterpriseId, string taxCode, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult<(string?, bool, bool)>((null, false, false));
    }

    public Task<System.Collections.Generic.IReadOnlyList<EnterpriseEntity>> GetAllEnterprisesForRatingAsync(System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult<System.Collections.Generic.IReadOnlyList<EnterpriseEntity>>(new System.Collections.Generic.List<EnterpriseEntity>());
    }
}

public class EnterpriseTests
{
    [Fact]
    public async Task Test_BR_02_001_DuplicateTaxCodeDetected()
    {
        var repo = new FakeRepository();
        var exists = await repo.ExistsByTaxCodeAsync("DUPLICATE");
        exists.ShouldBeTrue();
    }
    
    [Fact]
    public async Task Test_BR_02_001_UniqueTaxCodeSucceeds()
    {
        var repo = new FakeRepository();
        var exists = await repo.ExistsByTaxCodeAsync("UNIQUE");
        exists.ShouldBeFalse();
    }

    [Theory]
    [InlineData("USER", true, true)]
    [InlineData("USER", false, false)]
    [InlineData("PUBLIC_USER", false, false)]
    [InlineData("ADMIN", false, true)]
    [InlineData("OPERATOR_ADMIN", false, true)]
    public void Test_BR_02_002_PrivacyForRevenueAndFunding(string role, bool isOwner, bool expected)
    {
        var repo = new FakeRepository();
        var svc = new EnterpriseService(repo);
        
        var canView = svc.CanViewRevenueAndFunding(role, isOwner);
        canView.ShouldBe(expected);
    }

    [Fact]
    public void Test_InnovationRatingEngine_UnratedWhenNoData()
    {
        var ent = new EnterpriseEntity(Guid.NewGuid()) { TaxCode = "0100000000" };
        var result = InnovationRatingEngine.Calculate(ent);

        result.Classification.ShouldBe("UNRATED");
        result.ClassificationLabel.ShouldBe("Chưa đánh giá");
        result.TotalScore.ShouldBe(0.0m);
        result.GroupScores.Count.ShouldBe(8);
        result.RadarChartData.Count.ShouldBe(8);
    }

    [Fact]
    public void Test_InnovationRatingEngine_CalculatesWithSampleSurvey()
    {
        var ent = new EnterpriseEntity(Guid.NewGuid())
        {
            TaxCode = "2400120030",
            Name = "CÔNG TY TNHH MỘT THÀNH VIÊN LÂM NGHIỆP ĐÔNG BẮC",
            HasRdUnit = true,
            HasRdBudget = true,
            RdBudgetAmount = 500_000_000m,
            IsExporting = true,
            InValueChain = true,
            HighQualificationRatio = "10–30%"
        };

        var surveyJson = """
        {
            "governance_platforms": ["ERP", "CRM"],
            "innovation_activities": {
                "new_product": "Có",
                "improved_product": "Có",
                "process": "Có",
                "organization": "Có",
                "marketing": "Có"
            },
            "tech_acquisition": ["R&D nội bộ", "Mua công nghệ mới", "Chuyển giao công nghệ"],
            "digital_strategy": "Đã ban hành chiến lược",
            "digital_maturity": "Nâng cao",
            "digitized_activities": ["Bán hàng", "Sản xuất", "Nhân sự", "Kế toán"],
            "applied_technologies": ["Cloud", "AI"],
            "revenue_ratio_from_innovation": "Từ 30% đến 50%",
            "recorded_impacts": ["Tăng doanh thu", "Nâng cao chất lượng", "Giảm chi phí"],
            "collaborations": {
                "universities": "Thường xuyên",
                "research_institutes": "Thường xuyên",
                "other_enterprises": "Thỉnh thoảng",
                "innovation_centers": "Thường xuyên",
                "investment_funds": "Thường xuyên",
                "state_agencies": "Thường xuyên",
                "international_orgs": "Thường xuyên"
            },
            "received_public_support": "Có",
            "accessed_funds": "Có",
            "innovation_results": ["Sản phẩm mới", "Quy trình mới", "Bằng sáng chế"],
            "ip_assets": ["Bí quyết kỹ thuật", "Phần mềm máy tính"]
        }
        """;

        var result = InnovationRatingEngine.Calculate(ent, surveyJson, hasMachineryUpgrade: true, hasTechTraining: true);

        result.TotalScore.ShouldBeGreaterThanOrEqualTo(75.0m);
        result.Classification.ShouldBe("LEADING");
        result.ClassificationLabel.ShouldBe("Dẫn đầu");
        result.BadgeName.ShouldBe("Huy hiệu Vàng ĐMST");
        result.GroupScores.Count.ShouldBe(8);
        result.CriteriaDetails.Count.ShouldBe(37);
    }

    [Fact]
    public void Test_InnovationRatingEngine_8GroupsMaxScoreSumTo100()
    {
        var ent = new EnterpriseEntity(Guid.NewGuid()) { TaxCode = "0100000000" };
        var result = InnovationRatingEngine.Calculate(ent);

        result.GroupScores.Count.ShouldBe(8);
        var sumMax = result.GroupScores.Sum(g => g.MaxScore);
        sumMax.ShouldBe(100.0m);

        result.GroupScores.First(g => g.GroupCode == "QT").MaxScore.ShouldBe(12.0m);
        result.GroupScores.First(g => g.GroupCode == "CN").MaxScore.ShouldBe(18.0m);
        result.GroupScores.First(g => g.GroupCode == "SP").MaxScore.ShouldBe(20.0m);
        result.GroupScores.First(g => g.GroupCode == "IP").MaxScore.ShouldBe(10.0m);
        result.GroupScores.First(g => g.GroupCode == "S").MaxScore.ShouldBe(10.0m);
        result.GroupScores.First(g => g.GroupCode == "TT").MaxScore.ShouldBe(15.0m);
        result.GroupScores.First(g => g.GroupCode == "NL").MaxScore.ShouldBe(7.0m);
        result.GroupScores.First(g => g.GroupCode == "LK").MaxScore.ShouldBe(8.0m);
    }

    [Fact]
    public void Test_InnovationRatingEngine_ThresholdClassification()
    {
        var entDeveloping = new EnterpriseEntity(Guid.NewGuid())
        {
            TaxCode = "0100000001",
            HasRdUnit = true,
            HasRdBudget = false,
            IsExporting = false,
            InValueChain = true
        };

        var partialSurvey = """
        {
            "governance_platforms": ["ERP"],
            "digital_strategy": "Đang xây dựng chiến lược",
            "applied_technologies": ["Cloud"],
            "collaborations": { "universities": "Thỉnh thoảng" }
        }
        """;

        var result = InnovationRatingEngine.Calculate(entDeveloping, partialSurvey);
        result.TotalScore.ShouldBeGreaterThan(0);
        result.Classification.ShouldBeOneOf("DEVELOPING", "POTENTIAL");
        result.RadarChartData.Count.ShouldBe(8);
    }
}
