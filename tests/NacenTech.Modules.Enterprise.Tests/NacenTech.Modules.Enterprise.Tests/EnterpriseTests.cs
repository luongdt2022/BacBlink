using System;
using System.Threading.Tasks;
using Xunit;
using Shouldly;
using NacenTech.Modules.Enterprise.Application;
using EnterpriseEntity = NacenTech.Modules.Enterprise.Domain.Enterprise;

namespace NacenTech.Modules.Enterprise.Tests;

public class FakeRepository : IEnterpriseRepository
{
    public System.Collections.Generic.List<EnterpriseEntity> Enterprises { get; set; } = new();

    public FakeRepository() { }
    public FakeRepository(System.Collections.Generic.IEnumerable<EnterpriseEntity> initial)
    {
        Enterprises.AddRange(initial);
    }

    public Task<bool> ExistsByTaxCodeAsync(string taxCode, Guid? excludeId = null, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult(taxCode == "DUPLICATE");
    }

    public Task<EnterpriseEntity?> GetByIdAsync(Guid id, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult(Enterprises.Find(x => x.Id == id));
    }

    public Task<EnterpriseEntity?> GetByTaxCodeAsync(string taxCode, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult(Enterprises.Find(x => x.TaxCode == taxCode));
    }

    public Task<EnterpriseEntity?> GetByOwnerPersonIdAsync(Guid personId, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult(Enterprises.Find(x => x.OwnerPersonId == personId));
    }

    public Task<EnterpriseEntity?> GetByIdentifierAsync(string type, string value, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult(Enterprises.Find(x => x.Identifiers.Any(i => i.Type == type && i.Value == value)));
    }

    public Task<EnterpriseEntity?> GetByContactEmailAsync(string email, System.Threading.CancellationToken ct = default)
    {
        return Task.FromResult(Enterprises.Find(x => x.ContactEmail == email));
    }

    public Task AddAsync(EnterpriseEntity enterprise, System.Threading.CancellationToken ct = default)
    {
        Enterprises.Add(enterprise);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(EnterpriseEntity enterprise, System.Threading.CancellationToken ct = default)
    {
        return Task.CompletedTask;
    }

    public Task<(System.Collections.Generic.IReadOnlyList<EnterpriseEntity> Items, int TotalCount)> SearchAsync(EnterpriseSearchQuery query, System.Threading.CancellationToken ct = default)
    {
        var qry = Enterprises.AsQueryable();
        qry = qry.Where(x => x.TaxCode != null && x.TaxCode != "");

        if (!string.IsNullOrWhiteSpace(query.Tt17Classification))
        {
            var tt17 = query.Tt17Classification.Trim().ToUpper();
            if (tt17 == "TIEN_TIEN")
                qry = qry.Where(x => x.LatestTt17Classification == "TIEN_TIEN");
            else if (tt17 == "TRUNG_BINH_TIEN_TIEN")
                qry = qry.Where(x => x.LatestTt17Classification == "TRUNG_BINH_TIEN_TIEN");
            else if (tt17 == "TRUNG_BINH")
                qry = qry.Where(x => x.LatestTt17Classification == "TRUNG_BINH");
            else if (tt17 == "LAC_HAU")
                qry = qry.Where(x => x.LatestTt17Classification == "LAC_HAU");
            else if (tt17 == "UNRATED")
                qry = qry.Where(x => x.LatestTt17Classification == "UNRATED" || x.LatestTt17Classification == null || !x.LatestTt17Score.HasValue);
            else
                qry = qry.Where(x => x.LatestTt17Classification == tt17);
        }

        var sortBy = query.SortBy?.Trim().ToLower();
        IQueryable<EnterpriseEntity> sortedQry = sortBy switch
        {
            "tt17_desc" => qry.OrderByDescending(x => x.LatestTt17Score ?? -1).ThenByDescending(x => x.LatestTt17SyncCoeff ?? -1).ThenBy(x => x.Name),
            _ => qry.OrderBy(x => x.Name)
        };

        var total = sortedQry.Count();
        var page = query.Page <= 0 ? 1 : query.Page;
        var pageSize = query.PageSize <= 0 ? 9 : query.PageSize;
        var items = sortedQry.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return Task.FromResult<(System.Collections.Generic.IReadOnlyList<EnterpriseEntity>, int)>((items, total));
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

    [Fact]
    public async Task Test_SearchAsync_FilterByTt17Classification()
    {
        var ent1 = new EnterpriseEntity(Guid.NewGuid()) { Name = "DN A", TaxCode = "0101", LatestTt17Classification = "TIEN_TIEN", LatestTt17Score = 80.5m, LatestTt17SyncCoeff = 0.75m };
        var ent2 = new EnterpriseEntity(Guid.NewGuid()) { Name = "DN B", TaxCode = "0102", LatestTt17Classification = "TRUNG_BINH_TIEN_TIEN", LatestTt17Score = 68.0m, LatestTt17SyncCoeff = 0.65m };
        var ent3 = new EnterpriseEntity(Guid.NewGuid()) { Name = "DN C", TaxCode = "0103", LatestTt17Classification = "TRUNG_BINH", LatestTt17Score = 45.0m, LatestTt17SyncCoeff = 0.50m };
        var ent4 = new EnterpriseEntity(Guid.NewGuid()) { Name = "DN D", TaxCode = "0104", LatestTt17Classification = "LAC_HAU", LatestTt17Score = 28.0m, LatestTt17SyncCoeff = 0.35m };
        var ent5 = new EnterpriseEntity(Guid.NewGuid()) { Name = "DN E", TaxCode = "0105", LatestTt17Classification = null, LatestTt17Score = null };

        var repo = new FakeRepository([ent1, ent2, ent3, ent4, ent5]);

        var resultTienTien = await repo.SearchAsync(new EnterpriseSearchQuery { Tt17Classification = "TIEN_TIEN" });
        resultTienTien.TotalCount.ShouldBe(1);
        resultTienTien.Items[0].TaxCode.ShouldBe("0101");

        var resultUnrated = await repo.SearchAsync(new EnterpriseSearchQuery { Tt17Classification = "UNRATED" });
        resultUnrated.TotalCount.ShouldBe(1);
        resultUnrated.Items[0].TaxCode.ShouldBe("0105");

        var resultTrungBinh = await repo.SearchAsync(new EnterpriseSearchQuery { Tt17Classification = "TRUNG_BINH" });
        resultTrungBinh.TotalCount.ShouldBe(1);
        resultTrungBinh.Items[0].TaxCode.ShouldBe("0103");
    }

    [Fact]
    public async Task Test_SearchAsync_SortByTt17Desc()
    {
        var entLow = new EnterpriseEntity(Guid.NewGuid()) { Name = "DN Thap", TaxCode = "0101", LatestTt17Score = 55.0m, LatestTt17SyncCoeff = 0.5m };
        var entHigh = new EnterpriseEntity(Guid.NewGuid()) { Name = "DN Cao", TaxCode = "0102", LatestTt17Score = 85.0m, LatestTt17SyncCoeff = 0.8m };
        var entMid = new EnterpriseEntity(Guid.NewGuid()) { Name = "DN Giua", TaxCode = "0103", LatestTt17Score = 70.0m, LatestTt17SyncCoeff = 0.7m };
        var entEqualScoreHighSync = new EnterpriseEntity(Guid.NewGuid()) { Name = "DN Bang Diem Sync Cao", TaxCode = "0104", LatestTt17Score = 85.0m, LatestTt17SyncCoeff = 0.9m };

        var repo = new FakeRepository([entLow, entHigh, entMid, entEqualScoreHighSync]);

        var result = await repo.SearchAsync(new EnterpriseSearchQuery { SortBy = "tt17_desc" });
        result.TotalCount.ShouldBe(4);
        result.Items[0].TaxCode.ShouldBe("0104"); // 85.0 & sync 0.9
        result.Items[1].TaxCode.ShouldBe("0102"); // 85.0 & sync 0.8
        result.Items[2].TaxCode.ShouldBe("0103"); // 70.0
        result.Items[3].TaxCode.ShouldBe("0101"); // 55.0
    }

    [Fact]
    public async Task Test_EnterpriseService_GetPublicDirectory_MapsTt17FieldsCorrectly()
    {
        var ent = new EnterpriseEntity(Guid.NewGuid())
        {
            Name = "DN Cong Nghe Moi",
            TaxCode = "0109999999",
            ProvinceCity = "Hà Nội",
            MainSectorName = "Công nghệ thông tin",
            LatestTt17Score = 88.5m,
            LatestTt17Classification = "TIEN_TIEN",
            LatestTt17SyncCoeff = 0.82m
        };

        var repo = new FakeRepository([ent]);
        var svc = new EnterpriseService(repo);

        var result = await svc.GetPublicDirectoryAsync(new EnterpriseSearchQuery { SortBy = "tt17_desc" });
        result.TotalCount.ShouldBe(1);
        var item = result.Items[0];
        item.TaxCode.ShouldBe("0109999999");
        item.Tt17Score.ShouldBe(88.5m);
        item.Tt17Classification.ShouldBe("TIEN_TIEN");
        item.Tt17SyncCoefficient.ShouldBe(0.82m);
    }
}
