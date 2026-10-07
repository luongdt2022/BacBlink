using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>Phase 10: account thật không được mất role/scope và Owner Detail bị cô lập theo PersonId.</summary>
[Collection(PostgresCollection.Name)]
public sealed class ExpertAuthenticationOwnershipTests(PostgresFixture fixture)
{
    [Fact]
    public async Task Verified_expert_login_preserves_role_scope_and_only_owner_reads_its_detail()
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
                "Nguyễn", "Minh An", null, "NacenTech", true, PlatformRoles.VerifiedExpert, ScopeTypes.Sector, "CN_THONG_TIN"));
            db.Add(Person.Register($"expert-{other:N}@test.local", hasher.Hash(password), hasher.CurrentAlgorithm,
                "Trần", "Khác", null, "NacenTech", true, PlatformRoles.VerifiedExpert, ScopeTypes.Sector, "CN_THONG_TIN"));
            db.Add(Profile(owner));
            await db.SaveChangesAsync();
        }

        await using (var loginProvider = fixture.BuildProvider())
        using (var scope = loginProvider.CreateScope())
        {
            var auth = scope.ServiceProvider.GetRequiredService<IAuthenticationService>();
            var result = await auth.LoginAsync($"expert-{owner:N}@test.local", password, null, CancellationToken.None);
            result.AccessToken.ShouldNotBeNullOrEmpty();
            result.Person.PlatformRole.ShouldBe(PlatformRoles.VerifiedExpert);
            result.Person.ScopeType.ShouldBe(ScopeTypes.Sector);
            result.Person.ScopeId.ShouldBe("CN_THONG_TIN");
        }

        await using var ownerProvider = fixture.BuildProvider(new TestActor { PersonId = owner, PlatformRole = PlatformRoles.VerifiedExpert, ScopeType = ScopeTypes.Sector, ScopeId = "CN_THONG_TIN" });
        using (var scope = ownerProvider.CreateScope())
            (await scope.ServiceProvider.GetRequiredService<IExpertService>().GetMyDetailAsync(owner, CancellationToken.None)).ShouldNotBeNull();

        await using var otherProvider = fixture.BuildProvider(new TestActor { PersonId = other, PlatformRole = PlatformRoles.VerifiedExpert, ScopeType = ScopeTypes.Sector, ScopeId = "CN_THONG_TIN" });
        using (var scope = otherProvider.CreateScope())
            (await scope.ServiceProvider.GetRequiredService<IExpertService>().GetMyDetailAsync(other, CancellationToken.None)).ShouldBeNull();
    }

    private static ExpertProfile Profile(Guid owner) => new(
        owner, "TS. Nguyễn Minh An", 1980, "male", $"CCCD-{owner:N}"[..20], new DateOnly(2021, 5, 20), "NONE", null,
        "DOCTOR", 2015, "Viện NacenTech", null, null, null, ["CN_THONG_TIN"], null, null, null, null, false, false, DateTimeOffset.UtcNow);
}

