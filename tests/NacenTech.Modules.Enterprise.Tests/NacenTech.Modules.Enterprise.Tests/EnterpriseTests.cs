using System;
using System.Threading.Tasks;
using Xunit;
using Shouldly;
using NacenTech.Modules.Enterprise.Application;
using EnterpriseEntity = NacenTech.Modules.Enterprise.Domain.Enterprise;

namespace NacenTech.Modules.Enterprise.Tests;

public class FakeRepository : IEnterpriseRepository
{
    public Task<bool> ExistsByTaxCodeAsync(string taxCode)
    {
        return Task.FromResult(taxCode == "DUPLICATE");
    }
}

public class EnterpriseTests
{
    [Fact]
    public async Task Test_BR_02_001_DuplicateTaxCodeThrowsException()
    {
        var repo = new FakeRepository();
        var svc = new EnterpriseService(repo);
        var ent = new EnterpriseEntity();
        
        var ex = await Record.ExceptionAsync(() => svc.CreateEnterpriseAsync(ent, "DUPLICATE"));
        
        ex.ShouldNotBeNull();
        ex.Message.ShouldContain("BR-02-001");
    }
    
    [Fact]
    public async Task Test_BR_02_001_UniqueTaxCodeSucceeds()
    {
        var repo = new FakeRepository();
        var svc = new EnterpriseService(repo);
        var ent = new EnterpriseEntity();
        
        var ex = await Record.ExceptionAsync(() => svc.CreateEnterpriseAsync(ent, "UNIQUE"));
        
        ex.ShouldBeNull();
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
