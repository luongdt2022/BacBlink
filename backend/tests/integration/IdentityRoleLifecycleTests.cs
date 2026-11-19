using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Audit.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>CR-BACLINK-001: public register và provision/login của đủ 3 cấp (ADMIN, ENTERPRISE, PUBLIC_USER) + NormalizeTier cho legacy DB.</summary>
[Collection(PostgresCollection.Name)]
public sealed class IdentityRoleLifecycleTests(PostgresFixture fixture)
{
    private const string Password = "Role-lifecycle-2026!";

    [Fact]
    public async Task Public_registration_creates_an_active_public_user_that_can_log_in_immediately()
    {
        var nonce = Guid.NewGuid().ToString("N");
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var auth = scope.ServiceProvider.GetRequiredService<IAuthenticationService>();

        var registered = await auth.RegisterAsync(new RegisterCommand($"public-{nonce}@test.local", Password, Password, "Public", null, null, null), "127.0.0.1", CancellationToken.None);
        registered.PlatformRole.ShouldBe(PlatformRoles.PublicUser);
        registered.IsActive.ShouldBeTrue();
        registered.ScopeType.ShouldBe(ScopeTypes.Global);
        registered.ScopeId.ShouldBeNull();

        var login = await auth.LoginAsync(registered.Email, Password, null, CancellationToken.None);
        LoginClaims(login.AccessToken).ShouldContain(new KeyValuePair<string, string>("role", PlatformRoles.PublicUser));
        LoginClaims(login.AccessToken).ShouldContain(new KeyValuePair<string, string>("scope_type", ScopeTypes.Global));
    }

    [Fact]
    public async Task Privileged_provisioning_and_login_cover_all_three_canonical_tiers_with_global_scope_and_audit()
    {
        var actorId = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor
        {
            PersonId = actorId, PlatformRole = PlatformRoles.Admin, ScopeType = ScopeTypes.Global,
        });
        using var scope = provider.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();
        var auth = scope.ServiceProvider.GetRequiredService<IAuthenticationService>();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var nonce = Guid.NewGuid().ToString("N");

        foreach (var role in new[] { PlatformRoles.Admin, PlatformRoles.Enterprise, PlatformRoles.PublicUser })
        {
            var person = await persons.ProvisionAsync(new ProvisionPersonCommand(
                $"{role.ToLowerInvariant()}-{nonce}@test.local", Password, "Role", null, null, null,
                role, ScopeTypes.Global, null), CancellationToken.None);
            var login = await auth.LoginAsync(person.Email, Password, null, CancellationToken.None);

            login.Person.PlatformRole.ShouldBe(role);
            login.Person.ScopeType.ShouldBe(ScopeTypes.Global);
            login.Person.ScopeId.ShouldBeNull();
            var claims = LoginClaims(login.AccessToken);
            claims.ShouldContain(new KeyValuePair<string, string>("role", role));
            claims.ShouldContain(new KeyValuePair<string, string>("scope_type", ScopeTypes.Global));
            claims.ShouldContain(new KeyValuePair<string, string>("scope_id", string.Empty));
        }

        (await db.Set<AuditEvent>().CountAsync(x => x.ActorRef == actorId && x.Action == "person.provision_role" && x.Outcome == AuditOutcomes.Success))
            .ShouldBeGreaterThanOrEqualTo(3);
    }

    [Theory]
    [InlineData("SUPER_ADMIN", ScopeTypes.Global, null, PlatformRoles.Admin)]
    [InlineData("OPERATOR_ADMIN", ScopeTypes.Global, null, PlatformRoles.Admin)]
    [InlineData("SELLER", ScopeTypes.Global, null, PlatformRoles.Enterprise)]
    [InlineData("BUYER", ScopeTypes.Global, null, PlatformRoles.Enterprise)]
    [InlineData("VERIFIED_EXPERT", ScopeTypes.Sector, "LV01", PlatformRoles.Enterprise)]
    [InlineData("INNOVATION_ENTITY", ScopeTypes.Province, "HN", PlatformRoles.Enterprise)]
    [InlineData("PROVINCIAL_ADMIN", ScopeTypes.Province, "BN", PlatformRoles.PublicUser)]
    public async Task Legacy_person_in_db_logs_in_with_normalized_tier_and_global_scope(
        string legacyRole, string legacyScopeType, string? legacyScopeId, string expectedTier)
    {
        var nonce = Guid.NewGuid().ToString("N");
        var email = $"legacy-{legacyRole.ToLowerInvariant()}-{nonce}@test.local";

        await using var provider = fixture.BuildProvider();
        using (var seedScope = provider.CreateScope())
        {
            var db = seedScope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var hasher = seedScope.ServiceProvider.GetRequiredService<IPasswordHasher>();
            var person = Person.Register(email, hasher.Hash(Password), hasher.CurrentAlgorithm,
                "Legacy", "User", null, null, true, legacyRole, legacyScopeType, legacyScopeId);
            db.Set<Person>().Add(person);
            await db.SaveChangesAsync();
        }

        using var loginScope = provider.CreateScope();
        var auth = loginScope.ServiceProvider.GetRequiredService<IAuthenticationService>();
        var login = await auth.LoginAsync(email, Password, null, CancellationToken.None);

        login.Person.PlatformRole.ShouldBe(expectedTier);
        login.Person.ScopeType.ShouldBe(ScopeTypes.Global);
        login.Person.ScopeId.ShouldBeNull();
        var claims = LoginClaims(login.AccessToken);
        claims.ShouldContain(new KeyValuePair<string, string>("role", expectedTier));
        claims.ShouldContain(new KeyValuePair<string, string>("scope_type", ScopeTypes.Global));
        claims.ShouldContain(new KeyValuePair<string, string>("scope_id", string.Empty));
    }

    private static IReadOnlyCollection<KeyValuePair<string, string>> LoginClaims(string token)
    {
        var payload = token.Split('.')[1].Replace('-', '+').Replace('_', '/');
        payload = payload.PadRight(payload.Length + (4 - payload.Length % 4) % 4, '=');
        using var json = JsonDocument.Parse(Encoding.UTF8.GetString(Convert.FromBase64String(payload)));
        return json.RootElement.EnumerateObject().Select(x => new KeyValuePair<string, string>(x.Name,
            x.Value.ValueKind == JsonValueKind.String ? x.Value.GetString() ?? string.Empty : x.Value.ToString())).ToArray();
    }
}
