using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using NacenTech.Persistence;

namespace NacenTech.Api.Infrastructure;

/// <summary>
/// CR-BACLINK-009 · BR-BL09-NO-FABRICATION-001 / BR-BL09-SLUG-STABLE-002.
/// Nạp một lần 98 bài tin hiện có (apps/api/Seed/cms_articles.json, giữ nguyên slug) và 5 FAQ quy trình
/// vào CMS khi bảng còn trống. Idempotent: chạy lại không ghi đè nội dung Admin đã sửa (ON CONFLICT DO NOTHING).
/// Không tạo nội dung chính sách/báo cáo/đối tác.
/// </summary>
public sealed class CmsSeedHostedService(IServiceScopeFactory scopes, ILogger<CmsSeedHostedService> log) : IHostedService
{
    private sealed record SeedArticle(
        string Slug, string Title, string Category, string CategorySlug, string PublishedAt, string? Author, string? Location,
        string? Excerpt, string? Thumbnail, string? LeadParagraph, List<string>? ContentParagraphs, List<string>? KeyTakeaways,
        JsonElement? Quote, JsonElement? Gallery, List<string>? Tags, bool Featured, string? SourceUrl);

    public static readonly (string Q, string A)[] Faqs =
    [
        ("Doanh nghiệp đăng ký gia nhập BACLINK như thế nào?",
         "Tạo tài khoản, sau đó điền hồ sơ doanh nghiệp (mã số thuế, ngành, địa bàn, giấy phép kinh doanh) tại mục Đăng ký hội viên. Ban Quản trị Hiệp hội xét duyệt và kích hoạt quyền hội viên."),
        ("Tôi muốn tìm nhà cung cấp hoặc đăng nhu cầu mua hàng?",
         "Xem Danh bạ hội viên và Nhu cầu mua hàng. Hội viên đăng nhập có thể gửi yêu cầu báo giá và đề xuất kết nối trực tiếp."),
        ("Làm sao đăng ký tham dự sự kiện, hội thảo của Hiệp hội?",
         "Chọn sự kiện tại Lịch sự kiện và bấm Đăng ký; hệ thống cấp mã vé điện tử."),
        ("Doanh nghiệp gặp vướng mắc về chính sách thì gửi kiến nghị ở đâu?",
         "Dùng biểu mẫu tại trang Liên hệ, chọn chủ đề “Kiến nghị, vướng mắc chính sách”. Văn phòng sẽ chuyển tới Ban Chính sách & Đối thoại đầu tư."),
        ("Tôi muốn tham gia hoạt động của một ban chuyên môn?",
         "Chọn ban tương ứng ở mục Đầu mối các ban tại trang Liên hệ và gửi yêu cầu; Văn phòng Hiệp hội sẽ kết nối với ban."),
    ];

    public async Task StartAsync(CancellationToken ct)
    {
        try
        {
            using var scope = scopes.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var exists = await db.Database.SqlQuery<bool>($"SELECT to_regclass('content.cms_articles') IS NOT NULL AS \"Value\"").SingleAsync(ct);
            if (!exists) { log.LogWarning("CMS seed bỏ qua: chưa có bảng content.cms_articles (migration chưa chạy)."); return; }

            var articlesSeeded = await SeedArticlesAsync(db, ct);
            var faqs = await SeedFaqsAsync(db, ct);
            if (articlesSeeded + faqs > 0) log.LogInformation("CMS seed: {Articles} bài viết, {Faqs} FAQ", articlesSeeded, faqs);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "CMS seed thất bại (không chặn khởi động API)");
        }
    }

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;

    private async Task<int> SeedArticlesAsync(NacenTechDbContext db, CancellationToken ct)
    {
        if (await db.Database.SqlQuery<int>($"SELECT count(*)::int AS \"Value\" FROM content.cms_articles").SingleAsync(ct) > 0) return 0;
        var path = Path.Combine(AppContext.BaseDirectory, "Seed", "cms_articles.json");
        if (!File.Exists(path)) { log.LogWarning("Không thấy {Path}", path); return 0; }

        var opts = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        var items = JsonSerializer.Deserialize<List<SeedArticle>>(await File.ReadAllTextAsync(path, ct), opts) ?? [];
        var n = 0;
        foreach (var a in items)
        {
            // Bỏ nhãn kiểm thử còn sót ở tiêu đề (hiển thị công khai cho khách).
            var title = Regex.Replace(a.Title, @"^\s*\[TEST[^\]]*\]\s*", "", RegexOptions.IgnoreCase).Trim();
            var body = JsonSerializer.Serialize(new
            {
                lead = a.LeadParagraph, paragraphs = a.ContentParagraphs ?? [], takeaways = a.KeyTakeaways ?? [],
                quote = a.Quote, gallery = a.Gallery, category = a.Category,
            });
            var tags = JsonSerializer.Serialize(a.Tags ?? []);
            var published = DateTimeOffset.TryParse(a.PublishedAt, out var p) ? p.ToUniversalTime() : DateTimeOffset.UtcNow;
            var id = Guid.NewGuid();
            n += await db.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO content.cms_articles
                    (id, slug, title, category_slug, excerpt, body_json, thumbnail_url, author, location, source_url, tags_json, is_featured, status, published_at)
                VALUES ({id}, {a.Slug}, {title}, {a.CategorySlug}, {a.Excerpt}, {body}::jsonb, {a.Thumbnail}, {a.Author}, {a.Location},
                        {a.SourceUrl}, {tags}::jsonb, {a.Featured}, 'PUBLISHED', {published})
                ON CONFLICT (slug) DO NOTHING
                """, ct);
        }
        return n;
    }

    private static async Task<int> SeedFaqsAsync(NacenTechDbContext db, CancellationToken ct)
    {
        if (await db.Database.SqlQuery<int>($"SELECT count(*)::int AS \"Value\" FROM content.cms_faqs").SingleAsync(ct) > 0) return 0;
        var n = 0;
        for (var i = 0; i < Faqs.Length; i++)
        {
            var id = Guid.NewGuid();
            n += await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO content.cms_faqs (id, question, answer, sort_order) VALUES ({id}, {Faqs[i].Q}, {Faqs[i].A}, {i + 1})", ct);
        }
        return n;
    }
}
