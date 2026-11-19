using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using NacenTech.Api.Infrastructure;
using NacenTech.Api.V1Compat;
using NacenTech.Kernel.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>CR-BACLINK-009 — CMS: slug, URL an toàn, hạng mục, seed idempotent.</summary>
[Collection(PostgresCollection.Name)]
public sealed class Task01BaclinkCmsTests(PostgresFixture fixture)
{
    [Theory]
    [InlineData("Chính sách ưu đãi đầu tư 2027", "chinh-sach-uu-dai-dau-tu-2027")]
    [InlineData("  Đại hội I — BACLINK!!  ", "dai-hoi-i-baclink")]
    [InlineData("Đ Đường Điện", "d-duong-dien")]
    [InlineData("!!!", "")]
    public void Slugify_Removes_Diacritics_And_Symbols(string input, string expected) =>
        CmsController.Slugify(input).ShouldBe(expected);

    [Fact]
    public void Slugify_Caps_Length() =>
        CmsController.Slugify(new string('a', 400)).Length.ShouldBeLessThanOrEqualTo(120);

    [Theory]
    [InlineData("https://example.com/a.pdf")]
    [InlineData("http://example.com")]
    [InlineData("/files/abc.pdf")]
    [InlineData(null)]
    [InlineData("")]
    public void SafeUrl_Accepts_Http_Https_And_Internal_Paths(string? url) =>
        Should.NotThrow(() => CmsController.RequireSafeUrl(url));

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("data:text/html,<script>alert(1)</script>")]
    [InlineData("//evil.example.com/x")]
    [InlineData("ftp://example.com/x")]
    [InlineData("vbscript:msgbox")]
    public void SafeUrl_Rejects_Dangerous_Schemes(string url) =>
        Should.Throw<ValidationException>(() => CmsController.RequireSafeUrl(url));

    [Fact]
    public void SafeUrl_Required_Rejects_Empty() =>
        Should.Throw<ValidationException>(() => CmsController.RequireSafeUrl("  ", required: true));

    [Fact]
    public void Document_Types_And_Categories_Cover_Customer_Menus()
    {
        CmsController.DocTypes.ShouldContain("DIEU_LE");
        CmsController.DocTypes.ShouldContain("BAO_CAO_THUONG_NIEN");
        CmsController.DocTypes.ShouldContain("BIEU_MAU");
        foreach (var c in new[] { "tin-hoi-vien", "hoat-dong-cac-ban", "chinh-sach-moi", "giai-thich-chinh-sach", "kien-nghi", "case-study", "truyen-thong-bao-chi" })
            CmsController.Categories.ShouldContain(c);
    }

    [Fact]
    public async Task Seeder_Is_Idempotent_And_Does_Not_Overwrite_Admin_Edits()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        // Bảo hiểm: test này TRUNCATE bảng CMS — chỉ được chạy trên CSDL kiểm thử dùng một lần, không bao giờ trên CSDL dev.
        db.Database.GetDbConnection().Database.ShouldContain("test", Case.Insensitive);
        await db.Database.ExecuteSqlRawAsync("TRUNCATE content.cms_articles, content.cms_faqs");

        var seeder = new CmsSeedHostedService(provider.GetRequiredService<IServiceScopeFactory>(), NullLogger<CmsSeedHostedService>.Instance);
        await seeder.StartAsync(CancellationToken.None);

        var count = await db.Database.SqlQuery<int>($"SELECT count(*)::int AS \"Value\" FROM content.cms_articles").SingleAsync();
        count.ShouldBeGreaterThan(50);
        (await db.Database.SqlQuery<int>($"SELECT count(*)::int AS \"Value\" FROM content.cms_faqs").SingleAsync()).ShouldBe(CmsSeedHostedService.Faqs.Length);
        (await db.Database.SqlQuery<int>($"SELECT count(*)::int AS \"Value\" FROM content.cms_articles WHERE title ~* '^\\[TEST'").SingleAsync()).ShouldBe(0);

        // Admin sửa một bài → seed chạy lại không ghi đè và không nhân đôi.
        await db.Database.ExecuteSqlRawAsync("UPDATE content.cms_articles SET title = 'ADMIN ĐÃ SỬA' WHERE id = (SELECT id FROM content.cms_articles LIMIT 1)");
        await seeder.StartAsync(CancellationToken.None);
        (await db.Database.SqlQuery<int>($"SELECT count(*)::int AS \"Value\" FROM content.cms_articles").SingleAsync()).ShouldBe(count);
        (await db.Database.SqlQuery<int>($"SELECT count(*)::int AS \"Value\" FROM content.cms_articles WHERE title = 'ADMIN ĐÃ SỬA'").SingleAsync()).ShouldBe(1);
    }

    [Fact]
    public async Task Article_Status_Constraint_Rejects_Invalid_Values()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var ex = await Should.ThrowAsync<Exception>(() => db.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO content.cms_articles (id, slug, title, category_slug, status) VALUES ({Guid.NewGuid()}, {"bad-" + Guid.NewGuid():N}, 'x', 'hoat-dong', 'HACKED')"));
        ex.ToString().ShouldContain("ck_cms_articles_status");
    }
}
