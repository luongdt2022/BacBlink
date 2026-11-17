using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// TSK-GAP-03: Kiểm thử toàn trình biến đổi vai trò (Role Mutation) trong PostgreSQL thật:
/// 1. Đăng ký ban đầu: Bắt buộc là PUBLIC_USER.
/// 2. Phê duyệt Shop Seller (TASK-04): Thăng hạng thành SELLER, sinh token chứa claim SELLER.
/// 3. Phê duyệt Khảo sát Nhu cầu Buyer (TASK-03): Thăng hạng thành BUYER, sinh token chứa claim BUYER.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class ShopAndDemandRoleMutationTests(PostgresFixture fixture)
{
    private const string Password = "NacenTech-Password-2026!";

    [Fact]
    public async Task Seller_approval_mutates_public_user_to_seller_and_issues_seller_jwt()
    {
        var nonce = Guid.NewGuid().ToString("N");
        var email = $"seller-{nonce}@test.local";

        await using var provider = fixture.BuildProvider();
        using (var scope = provider.CreateScope())
        {
            var auth = scope.ServiceProvider.GetRequiredService<IAuthenticationService>();
            var registered = await auth.RegisterAsync(new RegisterCommand(
                email, Password, Password, "Doanh Nghiệp", "Bán CN", "0912345678", "Công Ty Cổ Phần Công Nghệ Mẫu"),
                "127.0.0.1", CancellationToken.None);

            registered.PlatformRole.ShouldBe(PlatformRoles.PublicUser);
        }

        // 2. Thẩm định & Ký duyệt Shop Seller (TASK-04) -> Cấp role SELLER
        await using (var scopeProvider = fixture.BuildProvider())
        using (var scope = scopeProvider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var normalized = Person.Normalize(email);
            var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Email == normalized);
            person.ShouldNotBeNull();

            // Cán bộ duyệt cấp role SELLER
            person.AssignRoleAndScope(PlatformRoles.Seller, ScopeTypes.Global, null);
            await db.SaveChangesAsync();
        }

        // 3. Đăng nhập lại: Token JWT chuẩn hóa trả role ENTERPRISE (hợp nhất SELLER/BUYER) & scope GLOBAL
        await using (var verifyProvider = fixture.BuildProvider())
        using (var scope = verifyProvider.CreateScope())
        {
            var auth = scope.ServiceProvider.GetRequiredService<IAuthenticationService>();
            var login = await auth.LoginAsync(email, Password, null, CancellationToken.None);

            login.Person.PlatformRole.ShouldBe(PlatformRoles.Enterprise);
            login.Person.ScopeType.ShouldBe(ScopeTypes.Global);
            var claims = ParseJwtClaims(login.AccessToken);
            claims.ShouldContain(new KeyValuePair<string, string>("role", PlatformRoles.Enterprise));
            claims.ShouldContain(new KeyValuePair<string, string>("scope_type", ScopeTypes.Global));
        }
    }

    [Fact]
    public async Task Buyer_survey_approval_mutates_public_user_to_buyer_and_issues_buyer_jwt()
    {
        var nonce = Guid.NewGuid().ToString("N");
        var email = $"buyer-{nonce}@test.local";

        await using var provider = fixture.BuildProvider();
        using (var scope = provider.CreateScope())
        {
            var auth = scope.ServiceProvider.GetRequiredService<IAuthenticationService>();
            var registered = await auth.RegisterAsync(new RegisterCommand(
                email, Password, Password, "Doanh Nghiệp", "Mua CN", "0987654321", "Tập Đoàn Sản Xuất Mẫu"),
                "127.0.0.1", CancellationToken.None);

            registered.PlatformRole.ShouldBe(PlatformRoles.PublicUser);
        }

        // 2. Thẩm định & Phê duyệt Khảo sát Nhu cầu DNNVV (TASK-03) -> Cấp role BUYER
        await using (var scopeProvider = fixture.BuildProvider())
        using (var scope = scopeProvider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var normalized = Person.Normalize(email);
            var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Email == normalized);
            person.ShouldNotBeNull();

            // Cán bộ duyệt cấp role BUYER
            person.AssignRoleAndScope(PlatformRoles.Buyer, ScopeTypes.Global, null);
            await db.SaveChangesAsync();
        }

        // 3. Đăng nhập lại: Token JWT chuẩn hóa trả role ENTERPRISE & scope GLOBAL
        await using (var verifyProvider = fixture.BuildProvider())
        using (var scope = verifyProvider.CreateScope())
        {
            var auth = scope.ServiceProvider.GetRequiredService<IAuthenticationService>();
            var login = await auth.LoginAsync(email, Password, null, CancellationToken.None);

            login.Person.PlatformRole.ShouldBe(PlatformRoles.Enterprise);
            login.Person.ScopeType.ShouldBe(ScopeTypes.Global);
            var claims = ParseJwtClaims(login.AccessToken);
            claims.ShouldContain(new KeyValuePair<string, string>("role", PlatformRoles.Enterprise));
            claims.ShouldContain(new KeyValuePair<string, string>("scope_type", ScopeTypes.Global));
        }
    }

    private static IReadOnlyCollection<KeyValuePair<string, string>> ParseJwtClaims(string token)
    {
        var payload = token.Split('.')[1].Replace('-', '+').Replace('_', '/');
        payload = payload.PadRight(payload.Length + (4 - payload.Length % 4) % 4, '=');
        using var json = JsonDocument.Parse(Encoding.UTF8.GetString(Convert.FromBase64String(payload)));
        return json.RootElement.EnumerateObject().Select(x => new KeyValuePair<string, string>(x.Name,
            x.Value.ValueKind == JsonValueKind.String ? x.Value.GetString() ?? string.Empty : x.Value.ToString())).ToArray();
    }
}
