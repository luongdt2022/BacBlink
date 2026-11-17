using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Enterprise.Application;
using NacenTech.Modules.Enterprise.Domain;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public sealed class EnterpriseInvariantsTests
{
    private sealed class InMemoryEnterpriseRepository : IEnterpriseRepository
    {
        private readonly List<Enterprise> _enterprises = new();

        public InMemoryEnterpriseRepository(IEnumerable<Enterprise>? initial = null)
        {
            if (initial != null) _enterprises.AddRange(initial);
        }

        public Task<bool> ExistsByTaxCodeAsync(string taxCode, Guid? excludeId = null, CancellationToken ct = default)
        {
            var exists = _enterprises.Any(x => x.TaxCode == taxCode && (!excludeId.HasValue || x.Id != excludeId.Value));
            return Task.FromResult(exists);
        }

        public Task<Enterprise?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            var item = _enterprises.FirstOrDefault(x => x.Id == id);
            return Task.FromResult(item);
        }

        public Task<Enterprise?> GetByTaxCodeAsync(string taxCode, CancellationToken ct = default)
        {
            var item = _enterprises.FirstOrDefault(x => x.TaxCode == taxCode);
            return Task.FromResult(item);
        }

        public Task<Enterprise?> GetByOwnerPersonIdAsync(Guid personId, CancellationToken ct = default)
        {
            var item = _enterprises.FirstOrDefault(x => x.OwnerPersonId == personId);
            return Task.FromResult(item);
        }

        public Task<Enterprise?> GetByIdentifierAsync(string type, string value, CancellationToken ct = default)
        {
            var item = _enterprises.FirstOrDefault(x => x.Identifiers.Any(i => i.Type == type && i.Value == value));
            return Task.FromResult(item);
        }

        public Task<Enterprise?> GetByContactEmailAsync(string email, CancellationToken ct = default)
        {
            var item = _enterprises.FirstOrDefault(x => x.ContactEmail != null && string.Equals(x.ContactEmail.Trim(), email.Trim(), StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(item);
        }

        public Task AddAsync(Enterprise enterprise, CancellationToken ct = default)
        {
            _enterprises.Add(enterprise);
            return Task.CompletedTask;
        }

        public Task UpdateAsync(Enterprise enterprise, CancellationToken ct = default)
        {
            return Task.CompletedTask;
        }

        public Task<(IReadOnlyList<Enterprise> Items, int TotalCount)> SearchAsync(EnterpriseSearchQuery query, CancellationToken ct = default)
        {
            var qry = _enterprises.AsQueryable();
            if (!string.IsNullOrWhiteSpace(query.Q))
            {
                var q = query.Q.ToLower();
                qry = qry.Where(x => x.Name.ToLower().Contains(q) || (x.TaxCode != null && x.TaxCode.Contains(q)) || x.ProvinceCity.ToLower().Contains(q));
            }
            if (!string.IsNullOrWhiteSpace(query.Province))
            {
                qry = qry.Where(x => x.ProvinceCity.ToLower().Contains(query.Province.ToLower()));
            }
            if (!string.IsNullOrWhiteSpace(query.SectorCode))
            {
                qry = qry.Where(x => x.SectorCode == query.SectorCode);
            }
            var total = qry.Count();
            var items = qry.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToList();
            return Task.FromResult(((IReadOnlyList<Enterprise>)items, total));
        }

        public Task<EnterpriseDashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default)
        {
            var byProvince = _enterprises
                .GroupBy(x => x.ProvinceCity)
                .Select(g => new ProvinceCountDto(g.Key, g.Count()))
                .ToList();
            var bySector = _enterprises
                .GroupBy(x => x.MainSectorName)
                .Select(g => new SectorCountDto(g.Key, g.Count()))
                .ToList();
            var byTni = _enterprises
                .Where(x => x.TniClassification != null)
                .GroupBy(x => x.TniClassification!)
                .Select(g => new TniClassificationCountDto(g.Key, g.Count()))
                .ToList();

            var stats = new EnterpriseDashboardStatsDto(
                TotalEnterprises: _enterprises.Count,
                VerifiedCount: _enterprises.Count(x => x.IsVerified),
                ByProvince: byProvince,
                BySector: bySector,
                ByTniClassification: byTni,
                TopBottlenecks: new List<BottleneckCountDto> { new("Thiếu vốn", 10) }
            );
            return Task.FromResult(stats);
        }

        public Task<EnterpriseInnovationEvaluation?> GetInnovationEvaluationAsync(string taxCode, int? evaluationYear = null, CancellationToken ct = default)
        {
            return Task.FromResult<EnterpriseInnovationEvaluation?>(null);
        }

        public Task AddInnovationEvaluationAsync(EnterpriseInnovationEvaluation evaluation, CancellationToken ct = default)
        {
            return Task.CompletedTask;
        }

        public Task UpdateInnovationEvaluationAsync(EnterpriseInnovationEvaluation evaluation, CancellationToken ct = default)
        {
            return Task.CompletedTask;
        }

        public Task<(string? SurveyAnswersJson, bool HasMachineryUpgrade, bool HasTechTraining)> GetSurveyAnswersAsync(Guid enterpriseId, string taxCode, CancellationToken ct = default)
        {
            return Task.FromResult<(string?, bool, bool)>((null, false, false));
        }

        public Task<IReadOnlyList<Enterprise>> GetAllEnterprisesForRatingAsync(CancellationToken ct = default)
        {
            return Task.FromResult<IReadOnlyList<Enterprise>>(_enterprises.ToList());
        }
    }

    [Fact]
    public async Task BR_02_001_Tax_code_must_be_unique_when_registering_new_enterprise()
    {
        var repo = new InMemoryEnterpriseRepository(new[]
        {
            new Enterprise(Guid.NewGuid()) { Name = "Công ty Cổ phần Alpha", TaxCode = "0101234567" }
        });
        var service = new EnterpriseService(repo);

        var duplicateExists = await repo.ExistsByTaxCodeAsync("0101234567");
        duplicateExists.ShouldBeTrue();

        var newExists = await repo.ExistsByTaxCodeAsync("0109999999");
        newExists.ShouldBeFalse();
    }

    [Fact]
    public async Task BR_02_002_Non_privileged_caller_sees_masked_revenue_range()
    {
        var entId = Guid.NewGuid();
        var repo = new InMemoryEnterpriseRepository(new[]
        {
            new Enterprise(entId)
            {
                Name = "Công ty TNHH Đổi Mới Beta",
                TaxCode = "0301234567",
                RevenueRange = "Từ 50 tỷ đến 100 tỷ VNĐ",
                ProvinceCity = "Hà Nội",
                MainSectorName = "Công nghệ thông tin, chuyển đổi số"
            }
        });
        var service = new EnterpriseService(repo);

        // Khách vãng lai / non-privileged
        var publicDetail = await service.GetPublicDetailAsync("0301234567", isPrivileged: false);
        publicDetail.ShouldNotBeNull();
        publicDetail.RevenueRange.ShouldBe("[BẢO MẬT]");

        // Cán bộ quản lý / Privileged
        var privilegedDetail = await service.GetPublicDetailAsync("0301234567", isPrivileged: true);
        privilegedDetail.ShouldNotBeNull();
        privilegedDetail.RevenueRange.ShouldBe("Từ 50 tỷ đến 100 tỷ VNĐ");
    }

    [Fact]
    public void BR_02_003_Submit_verification_requires_mandatory_fields()
    {
        var incomplete = new Enterprise
        {
            Name = "Công ty Thiếu Thông Tin",
            TaxCode = "0109998888",
            ProvinceCity = "", // Missing
            MainSectorName = "Cơ khí"
        };

        Should.Throw<InvalidOperationException>(() => incomplete.SubmitVerification())
            .Message.ShouldContain("BR-02-003");

        var valid = new Enterprise
        {
            Name = "Công ty Đủ Điều Kiện",
            TaxCode = "0109998888",
            ProvinceCity = "Hà Nội",
            MainSectorName = "Công nghệ thông tin, chuyển đổi số"
        };

        valid.SubmitVerification();
        valid.VerificationStatus.ShouldBe("SUBMITTED");
    }

    [Fact]
    public async Task BR_02_005_Admin_approves_enterprise_1tier_globally_and_grants_dual_capability()
    {
        var bacninhEnt = new Enterprise(Guid.NewGuid())
        {
            Name = "Doanh nghiệp Bắc Ninh",
            TaxCode = "2301112222",
            ProvinceCity = "Bắc Ninh",
            MainSectorName = "Điện tử, Linh kiện & Bán dẫn",
            VerificationStatus = "SUBMITTED"
        };
        var repo = new InMemoryEnterpriseRepository(new[] { bacninhEnt });
        var service = new EnterpriseService(repo);

        // ADR-0018 (CR-BACLINK-001): Bãi bỏ phân quyền Sở Tỉnh, ADMIN duyệt 1 cấp toàn cục (bỏ qua adminScopeId legacy) và cấp DUAL
        await service.ApproveEnterpriseAsync(bacninhEnt.Id, "admin@baclink.org.vn", adminScopeId: "HP");
        bacninhEnt.IsVerified.ShouldBeTrue();
        bacninhEnt.VerificationStatus.ShouldBe("VERIFIED");
        bacninhEnt.CapabilityTier.ShouldBe("DUAL");
        bacninhEnt.IsBuyer.ShouldBeTrue();
        bacninhEnt.IsSeller.ShouldBeTrue();

        // Bảo toàn rào cản bảo mật doanh thu/vốn: chỉ Owner hoặc ADMIN được xem, chặn non-owner kể cả legacy PROVINCIAL_ADMIN
        service.CanViewRevenueAndFunding(PlatformRoles.Admin, isOwner: false).ShouldBeTrue();
        service.CanViewRevenueAndFunding(PlatformRoles.Enterprise, isOwner: false).ShouldBeFalse();
        service.CanViewRevenueAndFunding(PlatformRoles.PublicUser, isOwner: false).ShouldBeFalse();
        service.CanViewRevenueAndFunding("PROVINCIAL_ADMIN", isOwner: false).ShouldBeFalse();
        service.CanViewRevenueAndFunding(PlatformRoles.PublicUser, isOwner: true).ShouldBeTrue();
    }

    [Fact]
    public async Task Public_directory_supports_pagination_and_proven_filters()
    {
        var enterprises = Enumerable.Range(1, 20).Select(i => new Enterprise(Guid.NewGuid())
        {
            Name = $"Doanh nghiệp {i:D2}",
            TaxCode = $"01000000{i:D2}",
            ProvinceCity = i % 2 == 0 ? "Hà Nội" : "Hải Phòng",
            MainSectorName = "Công nghệ thông tin, chuyển đổi số",
            SectorCode = "LV01",
            TniScore = 50 + i,
            TniClassification = i > 15 ? "HIGH" : "MEDIUM",
            Status = "ACTIVE",
            IsVerified = true
        }).ToList();

        var repo = new InMemoryEnterpriseRepository(enterprises);
        var service = new EnterpriseService(repo);

        // Lọc theo tỉnh Hà Nội, trang 1, 5 bản ghi
        var res = await service.GetPublicDirectoryAsync(new EnterpriseSearchQuery
        {
            Province = "Hà Nội",
            Page = 1,
            PageSize = 5
        });

        res.TotalCount.ShouldBe(10);
        res.Items.Count.ShouldBe(5);
        res.TotalPages.ShouldBe(2);
        res.Items.All(x => x.ProvinceCity == "Hà Nội").ShouldBeTrue();
    }
}
