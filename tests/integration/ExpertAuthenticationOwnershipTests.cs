using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Api.V1Compat;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Modules.Policy.Application;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>ADR-0018 &amp; Q1: Cố vấn kỹ thuật giữ role 3 cấp (PUBLIC_USER/ENTERPRISE) với ScopeTypes.Global, không cấp role thứ 4, và Owner Detail bị cô lập theo PersonId + ExpertProfile.Status == APPROVED.</summary>
[Collection(PostgresCollection.Name)]
public sealed class ExpertAuthenticationOwnershipTests(PostgresFixture fixture)
{
    [Fact]
    public async Task Advisor_login_preserves_3tier_global_role_and_only_approved_owner_reads_its_detail()
    {
        var owner = Guid.CreateVersion7();
        var other = Guid.CreateVersion7();
        const string password = "Expert-password-2026!";

        await using (var setup = fixture.BuildProvider())
        using (var scope = setup.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
            db.Add(Person.Register($"expert-{owner:N}@test.local", hasher.Hash(password), hasher.CurrentAlgorithm,
                "Nguyễn", "Minh An", null, "BACLINK", true, PlatformRoles.PublicUser, ScopeTypes.Global, null));
            db.Add(Person.Register($"expert-{other:N}@test.local", hasher.Hash(password), hasher.CurrentAlgorithm,
                "Trần", "Khác", null, "BACLINK", true, PlatformRoles.PublicUser, ScopeTypes.Global, null));
            var approvedProfile = Profile(owner);
            approvedProfile.Approve("Đạt chuẩn Ban Cố vấn Kỹ thuật BACLINK");
            approvedProfile.SetPublicListing(true, true, "Cố vấn kỹ thuật sản xuất công nghiệp BACLINK");
            db.Add(approvedProfile);
            await db.SaveChangesAsync();
        }

        await using (var loginProvider = fixture.BuildProvider())
        using (var scope = loginProvider.CreateScope())
        {
            var auth = scope.ServiceProvider.GetRequiredService<IAuthenticationService>();
            var result = await auth.LoginAsync($"expert-{owner:N}@test.local", password, null, CancellationToken.None);
            result.AccessToken.ShouldNotBeNullOrEmpty();
            result.Person.PlatformRole.ShouldBe(PlatformRoles.PublicUser);
            result.Person.ScopeType.ShouldBe(ScopeTypes.Global);
            result.Person.ScopeId.ShouldBeNull();
        }

        // Owner có ExpertProfile APPROVED -> được đọc detail & truy cập ExpertController.GetMyDetail (dù giữ role PUBLIC_USER)
        await using var ownerProvider = fixture.BuildProvider(new TestActor { PersonId = owner, PlatformRole = PlatformRoles.PublicUser, ScopeType = ScopeTypes.Global, ScopeId = null });
        using (var scope = ownerProvider.CreateScope())
        {
            (await scope.ServiceProvider.GetRequiredService<IExpertService>().GetMyDetailAsync(owner, CancellationToken.None)).ShouldNotBeNull();
            var controller = new ExpertController(
                scope.ServiceProvider.GetRequiredService<IExpertService>(),
                scope.ServiceProvider.GetRequiredService<IApprovalService>(),
                scope.ServiceProvider.GetRequiredService<IAuditWriter>(),
                scope.ServiceProvider.GetRequiredService<ITaxonomyService>(),
                scope.ServiceProvider.GetRequiredService<NacenTechDbContext>())
            {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { RequestServices = scope.ServiceProvider } }
            };
            (await controller.GetMyDetail(CancellationToken.None)).ShouldBeOfType<OkObjectResult>();
        }

        // Other (cũng PUBLIC_USER nhưng không sở hữu ExpertProfile APPROVED) -> GetMyDetailAsync trả null và ExpertController chặn ForbiddenException
        await using var otherProvider = fixture.BuildProvider(new TestActor { PersonId = other, PlatformRole = PlatformRoles.PublicUser, ScopeType = ScopeTypes.Global, ScopeId = null });
        using (var scope = otherProvider.CreateScope())
        {
            (await scope.ServiceProvider.GetRequiredService<IExpertService>().GetMyDetailAsync(other, CancellationToken.None)).ShouldBeNull();
            var controller = new ExpertController(
                scope.ServiceProvider.GetRequiredService<IExpertService>(),
                scope.ServiceProvider.GetRequiredService<IApprovalService>(),
                scope.ServiceProvider.GetRequiredService<IAuditWriter>(),
                scope.ServiceProvider.GetRequiredService<ITaxonomyService>(),
                scope.ServiceProvider.GetRequiredService<NacenTechDbContext>())
            {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { RequestServices = scope.ServiceProvider } }
            };
            await Should.ThrowAsync<ForbiddenException>(() => controller.GetMyDetail(CancellationToken.None));
        }
    }

    private static ExpertProfile Profile(Guid owner) => new(
        owner, "TS. Nguyễn Minh An", 1980, "male", $"CCCD-{owner:N}"[..20], new DateOnly(2021, 5, 20), "NONE", null,
        "DOCTOR", 2015, "Ban Cố vấn Kỹ thuật BACLINK", "Bắc Ninh", null, null, ["IND_ELEC"], null, null, "[{\"title\":\"Smart Factory MES\"}]", null, true, false, DateTimeOffset.UtcNow, true, ["MES", "Lean"]);
}

