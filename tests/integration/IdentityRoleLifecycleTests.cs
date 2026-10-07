using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Audit.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>AC-DELTA-01..03: dữ liệu riêng; public register và provision/login của đủ 10 role.</summary>
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
    public async Task Privileged_provisioning_and_login_cover_all_ten_canonical_roles_with_scope_and_audit()
    {
        var actorId = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor
        {
            PersonId = actorId, PlatformRole = PlatformRoles.SuperAdmin, ScopeType = ScopeTypes.Global,
        });
        using var scope = provider.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();
        var auth = scope.ServiceProvider.GetRequiredService<IAuthenticationService>();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var nonce = Guid.NewGuid().ToString("N");

        foreach (var (role, scopeType, scopeId) in Roles())
        {
            var person = await persons.ProvisionAsync(new ProvisionPersonCommand(
                $"{role.ToLowerInvariant()}-{nonce}@test.local", Password, "Role", null, null, null,
                role, scopeType, scopeId), CancellationToken.None);
            var login = await auth.LoginAsync(person.Email, Password, null, CancellationToken.None);

            login.Person.PlatformRole.ShouldBe(role);
            login.Person.ScopeType.ShouldBe(scopeType);
            login.Person.ScopeId.ShouldBe(scopeId);
            var claims = LoginClaims(login.AccessToken);
            claims.ShouldContain(new KeyValuePair<string, string>("role", role));
            claims.ShouldContain(new KeyValuePair<string, string>("scope_type", scopeType));
            claims.ShouldContain(new KeyValuePair<string, string>("scope_id", scopeId ?? string.Empty));
        }

        (await db.Set<AuditEvent>().CountAsync(x => x.ActorRef == actorId && x.Action == "person.provision_role" && x.Outcome == AuditOutcomes.Success))
            .ShouldBeGreaterThanOrEqualTo(10);
    }

    private static IEnumerable<(string Role, string ScopeType, string? ScopeId)> Roles()
    {
        yield return (PlatformRoles.SuperAdmin, ScopeTypes.Global, null);
        yield return (PlatformRoles.OperatorAdmin, ScopeTypes.Global, null);
        yield return (PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HN");
        yield return (PlatformRoles.SectorAdmin, ScopeTypes.Sector, "CN_THONG_TIN");
        yield return (PlatformRoles.ClusterAdmin, ScopeTypes.OrgUnit, "DH_QGHN");
        yield return (PlatformRoles.Seller, ScopeTypes.Global, null);
        yield return (PlatformRoles.Buyer, ScopeTypes.Global, null);
        yield return (PlatformRoles.InnovationEntity, ScopeTypes.OrgUnit, "NACEN");
        yield return (PlatformRoles.VerifiedExpert, ScopeTypes.Sector, "CN_THONG_TIN");
        yield return (PlatformRoles.PublicUser, ScopeTypes.Global, null);
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
