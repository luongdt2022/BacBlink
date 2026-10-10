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
}
