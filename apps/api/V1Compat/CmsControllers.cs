using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Domain;
using NacenTech.Persistence;
using ValidationException = NacenTech.Kernel.Domain.ValidationException;

namespace NacenTech.Api.V1Compat;

public sealed record CmsArticleRow(
    Guid Id, string Slug, string Title, string CategorySlug, string? CommitteeCode, string? Excerpt, string BodyJson,
    string? ThumbnailUrl, string? Author, string? Location, string? SourceUrl, string TagsJson, bool IsFeatured,
    string Status, DateTimeOffset? PublishedAt);

public sealed record CmsDocumentRow(Guid Id, string DocType, string Title, string? Description, string FileUrl, string? CommitteeCode, DateOnly? IssuedOn, bool IsPublic, int SortOrder);
public sealed record CmsMediaRow(Guid Id, string Kind, string Album, string? Title, string Url, string? ThumbnailUrl, DateOnly? TakenOn, bool IsPublic, int SortOrder);
public sealed record CmsFaqRow(Guid Id, string Question, string Answer, int SortOrder, bool IsPublic);
public sealed record CmsPartnerRow(Guid Id, string Name, string? LogoUrl, string? Website, int SortOrder, bool IsPublic);

public sealed class CmsArticleDto
{
    [MaxLength(200)] public string? Slug { get; set; }
    [Required, MaxLength(500)] public string Title { get; set; } = string.Empty;
    [Required, MaxLength(50)] public string CategorySlug { get; set; } = string.Empty;
    [MaxLength(30)] public string? CommitteeCode { get; set; }
    [MaxLength(2000)] public string? Excerpt { get; set; }
    /// <summary>Nội dung Markdown (không nhận HTML thô khi hiển thị — NFR-BL09-SAFE-HTML-001).</summary>
    [MaxLength(100_000)] public string? Body { get; set; }
    [MaxLength(500)] public string? ThumbnailUrl { get; set; }
    [MaxLength(200)] public string? Author { get; set; }
    [MaxLength(300)] public string? Location { get; set; }
    [MaxLength(500)] public string? SourceUrl { get; set; }
    public List<string>? Tags { get; set; }
    public bool IsFeatured { get; set; }
    public bool Publish { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
}

public sealed class CmsDocumentDto
{
    [Required] public string DocType { get; set; } = string.Empty;
    [Required, MaxLength(400)] public string Title { get; set; } = string.Empty;
    [MaxLength(4000)] public string? Description { get; set; }
    [Required, MaxLength(600)] public string FileUrl { get; set; } = string.Empty;
    [MaxLength(30)] public string? CommitteeCode { get; set; }
    public DateOnly? IssuedOn { get; set; }
    public bool IsPublic { get; set; } = true;
    public int SortOrder { get; set; }
}

public sealed class CmsMediaDto
{
    [Required] public string Kind { get; set; } = string.Empty;
    [MaxLength(200)] public string? Album { get; set; }
    [MaxLength(300)] public string? Title { get; set; }
    [Required, MaxLength(600)] public string Url { get; set; } = string.Empty;
    [MaxLength(600)] public string? ThumbnailUrl { get; set; }
    public DateOnly? TakenOn { get; set; }
    public bool IsPublic { get; set; } = true;
    public int SortOrder { get; set; }
}

public sealed class CmsFaqDto
{
    [Required] public string Question { get; set; } = string.Empty;
    [Required] public string Answer { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsPublic { get; set; } = true;
}

public sealed class CmsPartnerDto
{
    [Required, MaxLength(300)] public string Name { get; set; } = string.Empty;
    [MaxLength(600)] public string? LogoUrl { get; set; }
    [MaxLength(500)] public string? Website { get; set; }
    public int SortOrder { get; set; }
    public bool IsPublic { get; set; } = true;
}

/// <summary>
/// CR-BACLINK-009 · API-BL09-CMS-001. Public đọc ẩn danh (chỉ nội dung đã xuất bản/công khai — BR-BL09-PUBLIC-ONLY-003);
/// ghi chỉ ADMIN. Bảng `content.cms_*` (migration 20261119140000).
/// </summary>
[Route("api/v1")]
public sealed partial class CmsController(NacenTechDbContext db) : V1ControllerBase
{
    public static readonly HashSet<string> DocTypes =
        ["DIEU_LE", "BAO_CAO_THUONG_NIEN", "BAO_CAO_NGANH", "CAM_NANG", "BIEU_MAU", "VAN_BAN_CHINH_SACH", "DU_LIEU_CONG_NGHIEP"];

    /// <summary>Danh mục bài viết cho phép (mở rộng theo góp ý khách hàng Menu 5/6/7).</summary>
    public static readonly HashSet<string> Categories =
    [
        "chuoi-cung-ung", "ban-dan", "hop-tac-quoc-te", "hoat-dong",
        "tin-hoi-vien", "hoat-dong-cac-ban", "chinh-sach-moi", "giai-thich-chinh-sach", "kien-nghi", "case-study", "truyen-thong-bao-chi",
    ];

    private const string ArticleCols = """
        id AS "Id", slug AS "Slug", title AS "Title", category_slug AS "CategorySlug", committee_code AS "CommitteeCode",
        excerpt AS "Excerpt", body_json::text AS "BodyJson", thumbnail_url AS "ThumbnailUrl", author AS "Author", location AS "Location",
        source_url AS "SourceUrl", tags_json::text AS "TagsJson", is_featured AS "IsFeatured", status AS "Status", published_at AS "PublishedAt"
        """;

    private static object Shape(CmsArticleRow r, bool withBody)
    {
        using var body = JsonDocument.Parse(string.IsNullOrWhiteSpace(r.BodyJson) ? "{}" : r.BodyJson);
        using var tags = JsonDocument.Parse(string.IsNullOrWhiteSpace(r.TagsJson) ? "[]" : r.TagsJson);
        return new
        {
            r.Id, r.Slug, r.Title, r.CategorySlug, r.CommitteeCode, r.Excerpt, r.ThumbnailUrl, r.Author, r.Location, r.SourceUrl,
            r.IsFeatured, r.Status, r.PublishedAt,
            Tags = tags.RootElement.Clone(),
            Body = withBody ? body.RootElement.Clone() : (JsonElement?)null,
        };
    }

    // ------------------------------------------------------------------ PUBLIC · bài viết
    [HttpGet("public/cms/articles")]
    [AllowAnonymous]
    public async Task<IActionResult> Articles([FromQuery] string? category, [FromQuery] string? committee, [FromQuery] string? q,
        [FromQuery] bool? featured, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        var p = Math.Max(page ?? 1, 1);
        var l = Math.Clamp(limit ?? 12, 1, 100);
        var offset = (p - 1) * l;
        var like = string.IsNullOrWhiteSpace(q) ? null : $"%{q.Trim()}%";
        var cat = string.IsNullOrWhiteSpace(category) || category == "all" ? null : category;

        var rows = await db.Database.SqlQueryRaw<CmsArticleRow>("SELECT " + ArticleCols + """
             FROM content.cms_articles
            WHERE status = 'PUBLISHED' AND published_at <= now()
              AND ({0}::text IS NULL OR category_slug = {0})
              AND ({1}::text IS NULL OR committee_code = {1})
              AND ({2}::text IS NULL OR title ILIKE {2} OR excerpt ILIKE {2})
              AND ({3}::boolean IS NULL OR is_featured = {3})
            ORDER BY is_featured DESC, published_at DESC
            LIMIT {4} OFFSET {5}
            """, (object?)cat ?? DBNull.Value, (object?)committee ?? DBNull.Value, (object?)like ?? DBNull.Value, (object?)featured ?? DBNull.Value, l, offset).ToListAsync(ct);
        var total = await db.Database.SqlQueryRaw<int>("""
            SELECT count(*)::int AS "Value" FROM content.cms_articles
            WHERE status = 'PUBLISHED' AND published_at <= now()
              AND ({0}::text IS NULL OR category_slug = {0})
              AND ({1}::text IS NULL OR committee_code = {1})
              AND ({2}::text IS NULL OR title ILIKE {2} OR excerpt ILIKE {2})
              AND ({3}::boolean IS NULL OR is_featured = {3})
            """, (object?)cat ?? DBNull.Value, (object?)committee ?? DBNull.Value, (object?)like ?? DBNull.Value, (object?)featured ?? DBNull.Value).SingleAsync(ct);

        var categories = await db.Database.SqlQuery<CategoryCount>($"""
            SELECT category_slug AS "Slug", count(*)::int AS "Count" FROM content.cms_articles
            WHERE status = 'PUBLISHED' AND published_at <= now() GROUP BY category_slug ORDER BY 2 DESC
            """).ToListAsync(ct);

        return Ok(new { success = true, data = rows.Select(r => Shape(r, false)), total, page = p, limit = l, totalPages = (int)Math.Ceiling(total / (double)l), categories });
    }

    public sealed record CategoryCount(string Slug, int Count);

    [HttpGet("public/cms/articles/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> Article(string slug, CancellationToken ct)
    {
        var rows = await db.Database.SqlQueryRaw<CmsArticleRow>("SELECT " + ArticleCols + """
             FROM content.cms_articles WHERE slug = {0} AND status = 'PUBLISHED' AND published_at <= now()
            """, slug).ToListAsync(ct);
        if (rows.Count == 0) throw new NotFoundException("Không tìm thấy bài viết.");
        return Ok(Ok200(Shape(rows[0], true)));
    }

    // ------------------------------------------------------------------ PUBLIC · tài liệu, media, FAQ, đối tác
    [HttpGet("public/cms/documents")]
    [AllowAnonymous]
    public async Task<IActionResult> Documents([FromQuery] string? type, [FromQuery] string? committee, [FromQuery] string? q, CancellationToken ct)
    {
        if (type is not null && !DocTypes.Contains(type)) throw new ValidationException("Loại tài liệu không hợp lệ");
        var like = string.IsNullOrWhiteSpace(q) ? null : $"%{q.Trim()}%";
        var rows = await db.Database.SqlQueryRaw<CmsDocumentRow>("""
            SELECT id AS "Id", doc_type AS "DocType", title AS "Title", description AS "Description", file_url AS "FileUrl",
                   committee_code AS "CommitteeCode", issued_on AS "IssuedOn", is_public AS "IsPublic", sort_order AS "SortOrder"
            FROM content.cms_documents
            WHERE is_public AND ({0}::text IS NULL OR doc_type = {0}) AND ({1}::text IS NULL OR committee_code = {1})
              AND ({2}::text IS NULL OR title ILIKE {2} OR description ILIKE {2})
            ORDER BY sort_order, issued_on DESC NULLS LAST, title
            LIMIT 200
            """, (object?)type ?? DBNull.Value, (object?)committee ?? DBNull.Value, (object?)like ?? DBNull.Value).ToListAsync(ct);
        return Ok(Ok200(rows));
    }

    [HttpGet("public/cms/media")]
    [AllowAnonymous]
    public async Task<IActionResult> Media(CancellationToken ct)
    {
        var rows = await db.Database.SqlQuery<CmsMediaRow>($"""
            SELECT id AS "Id", kind AS "Kind", album AS "Album", title AS "Title", url AS "Url", thumbnail_url AS "ThumbnailUrl",
                   taken_on AS "TakenOn", is_public AS "IsPublic", sort_order AS "SortOrder"
            FROM content.cms_media WHERE is_public ORDER BY album, sort_order, taken_on DESC NULLS LAST LIMIT 500
            """).ToListAsync(ct);
        return Ok(Ok200(rows));
    }

    [HttpGet("public/cms/faqs")]
    [AllowAnonymous]
    public async Task<IActionResult> Faqs(CancellationToken ct) =>
        Ok(Ok200(await db.Database.SqlQuery<CmsFaqRow>($"""
            SELECT id AS "Id", question AS "Question", answer AS "Answer", sort_order AS "SortOrder", is_public AS "IsPublic"
            FROM content.cms_faqs WHERE is_public ORDER BY sort_order, question
            """).ToListAsync(ct)));

    [HttpGet("public/cms/partners")]
    [AllowAnonymous]
    public async Task<IActionResult> Partners(CancellationToken ct) =>
        Ok(Ok200(await db.Database.SqlQuery<CmsPartnerRow>($"""
            SELECT id AS "Id", name AS "Name", logo_url AS "LogoUrl", website AS "Website", sort_order AS "SortOrder", is_public AS "IsPublic"
            FROM content.cms_partners WHERE is_public ORDER BY sort_order, name
            """).ToListAsync(ct)));

    // ------------------------------------------------------------------ ADMIN · bài viết
    [HttpGet("admin/cms/articles")]
    [Authorize]
    public async Task<IActionResult> AdminArticles([FromQuery] string? status, [FromQuery] string? q, CancellationToken ct)
    {
        RequireAdmin();
        var like = string.IsNullOrWhiteSpace(q) ? null : $"%{q.Trim()}%";
        var rows = await db.Database.SqlQueryRaw<CmsArticleRow>("SELECT " + ArticleCols + """
             FROM content.cms_articles
            WHERE ({0}::text IS NULL OR status = {0}) AND ({1}::text IS NULL OR title ILIKE {1})
            ORDER BY coalesce(published_at, created_at) DESC LIMIT 300
            """, (object?)status ?? DBNull.Value, (object?)like ?? DBNull.Value).ToListAsync(ct);
        return Ok(Ok200(rows.Select(r => Shape(r, false))));
    }

    [HttpGet("admin/cms/articles/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> AdminArticle(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        var rows = await db.Database.SqlQueryRaw<CmsArticleRow>("SELECT " + ArticleCols + " FROM content.cms_articles WHERE id = {0}", id).ToListAsync(ct);
        if (rows.Count == 0) throw new NotFoundException("Không tìm thấy bài viết.");
        return Ok(Ok200(Shape(rows[0], true)));
    }

    [HttpPost("admin/cms/articles")]
    [Authorize]
    public async Task<IActionResult> CreateArticle([FromBody] CmsArticleDto dto, CancellationToken ct)
    {
        RequireAdmin();
        ValidateArticle(dto);
        var id = Guid.NewGuid();
        var slug = await UniqueSlugAsync(string.IsNullOrWhiteSpace(dto.Slug) ? dto.Title : dto.Slug!, null, ct);
        var (status, published) = PublishState(dto);
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO content.cms_articles (id, slug, title, category_slug, committee_code, excerpt, body_json, thumbnail_url, author, location, source_url, tags_json, is_featured, status, published_at)
            VALUES ({id}, {slug}, {dto.Title.Trim()}, {dto.CategorySlug}, {dto.CommitteeCode}, {dto.Excerpt}, {BodyJson(dto)}::jsonb, {dto.ThumbnailUrl}, {dto.Author}, {dto.Location},
                    {dto.SourceUrl}, {JsonSerializer.Serialize(dto.Tags ?? [])}::jsonb, {dto.IsFeatured}, {status}, {published})
            """, ct);
        return Ok(Ok200(new { id, slug, status }));
    }

    [HttpPut("admin/cms/articles/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateArticle(Guid id, [FromBody] CmsArticleDto dto, CancellationToken ct)
    {
        RequireAdmin();
        ValidateArticle(dto);
        var slug = await UniqueSlugAsync(string.IsNullOrWhiteSpace(dto.Slug) ? dto.Title : dto.Slug!, id, ct);
        var (status, published) = PublishState(dto);
        var n = await db.Database.ExecuteSqlInterpolatedAsync($"""
            UPDATE content.cms_articles SET slug = {slug}, title = {dto.Title.Trim()}, category_slug = {dto.CategorySlug}, committee_code = {dto.CommitteeCode},
                excerpt = {dto.Excerpt}, body_json = {BodyJson(dto)}::jsonb, thumbnail_url = {dto.ThumbnailUrl}, author = {dto.Author}, location = {dto.Location},
                source_url = {dto.SourceUrl}, tags_json = {JsonSerializer.Serialize(dto.Tags ?? [])}::jsonb, is_featured = {dto.IsFeatured},
                status = {status}, published_at = {published}, updated_at = now()
            WHERE id = {id}
            """, ct);
        if (n == 0) throw new NotFoundException("Không tìm thấy bài viết.");
        return Ok(Ok200(new { id, slug, status }));
    }

    [HttpDelete("admin/cms/articles/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteArticle(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        return await Delete("content.cms_articles", id, ct);
    }

    // ------------------------------------------------------------------ ADMIN · tài liệu
    [HttpGet("admin/cms/documents")]
    [Authorize]
    public async Task<IActionResult> AdminDocuments(CancellationToken ct)
    {
        RequireAdmin();
        return Ok(Ok200(await db.Database.SqlQuery<CmsDocumentRow>($"""
            SELECT id AS "Id", doc_type AS "DocType", title AS "Title", description AS "Description", file_url AS "FileUrl",
                   committee_code AS "CommitteeCode", issued_on AS "IssuedOn", is_public AS "IsPublic", sort_order AS "SortOrder"
            FROM content.cms_documents ORDER BY doc_type, sort_order, title LIMIT 500
            """).ToListAsync(ct)));
    }

    [HttpPost("admin/cms/documents")]
    [Authorize]
    public async Task<IActionResult> CreateDocument([FromBody] CmsDocumentDto dto, CancellationToken ct)
    {
        RequireAdmin();
        ValidateDocument(dto);
        var id = Guid.NewGuid();
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO content.cms_documents (id, doc_type, title, description, file_url, committee_code, issued_on, is_public, sort_order)
            VALUES ({id}, {dto.DocType}, {dto.Title.Trim()}, {dto.Description}, {dto.FileUrl}, {dto.CommitteeCode}, {dto.IssuedOn}, {dto.IsPublic}, {dto.SortOrder})
            """, ct);
        return Ok(Ok200(new { id }));
    }

    [HttpPut("admin/cms/documents/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateDocument(Guid id, [FromBody] CmsDocumentDto dto, CancellationToken ct)
    {
        RequireAdmin();
        ValidateDocument(dto);
        var n = await db.Database.ExecuteSqlInterpolatedAsync($"""
            UPDATE content.cms_documents SET doc_type = {dto.DocType}, title = {dto.Title.Trim()}, description = {dto.Description}, file_url = {dto.FileUrl},
                committee_code = {dto.CommitteeCode}, issued_on = {dto.IssuedOn}, is_public = {dto.IsPublic}, sort_order = {dto.SortOrder}, updated_at = now()
            WHERE id = {id}
            """, ct);
        if (n == 0) throw new NotFoundException("Không tìm thấy tài liệu.");
        return Ok(Ok200(new { id }));
    }

    [HttpDelete("admin/cms/documents/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteDocument(Guid id, CancellationToken ct) { RequireAdmin(); return await Delete("content.cms_documents", id, ct); }

    // ------------------------------------------------------------------ ADMIN · media
    [HttpGet("admin/cms/media")]
    [Authorize]
    public async Task<IActionResult> AdminMedia(CancellationToken ct)
    {
        RequireAdmin();
        return Ok(Ok200(await db.Database.SqlQuery<CmsMediaRow>($"""
            SELECT id AS "Id", kind AS "Kind", album AS "Album", title AS "Title", url AS "Url", thumbnail_url AS "ThumbnailUrl",
                   taken_on AS "TakenOn", is_public AS "IsPublic", sort_order AS "SortOrder"
            FROM content.cms_media ORDER BY album, sort_order LIMIT 500
            """).ToListAsync(ct)));
    }

    [HttpPost("admin/cms/media")]
    [Authorize]
    public async Task<IActionResult> CreateMedia([FromBody] CmsMediaDto dto, CancellationToken ct)
    {
        RequireAdmin();
        ValidateMedia(dto);
        var id = Guid.NewGuid();
        var album = string.IsNullOrWhiteSpace(dto.Album) ? "Khác" : dto.Album.Trim();
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO content.cms_media (id, kind, album, title, url, thumbnail_url, taken_on, is_public, sort_order)
            VALUES ({id}, {dto.Kind}, {album}, {dto.Title}, {dto.Url}, {dto.ThumbnailUrl}, {dto.TakenOn}, {dto.IsPublic}, {dto.SortOrder})
            """, ct);
        return Ok(Ok200(new { id }));
    }

    [HttpPut("admin/cms/media/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateMedia(Guid id, [FromBody] CmsMediaDto dto, CancellationToken ct)
    {
        RequireAdmin();
        ValidateMedia(dto);
        var album = string.IsNullOrWhiteSpace(dto.Album) ? "Khác" : dto.Album.Trim();
        var n = await db.Database.ExecuteSqlInterpolatedAsync($"""
            UPDATE content.cms_media SET kind = {dto.Kind}, album = {album}, title = {dto.Title}, url = {dto.Url}, thumbnail_url = {dto.ThumbnailUrl},
                taken_on = {dto.TakenOn}, is_public = {dto.IsPublic}, sort_order = {dto.SortOrder} WHERE id = {id}
            """, ct);
        if (n == 0) throw new NotFoundException("Không tìm thấy mục thư viện.");
        return Ok(Ok200(new { id }));
    }

    [HttpDelete("admin/cms/media/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteMedia(Guid id, CancellationToken ct) { RequireAdmin(); return await Delete("content.cms_media", id, ct); }

    // ------------------------------------------------------------------ ADMIN · FAQ
    [HttpGet("admin/cms/faqs")]
    [Authorize]
    public async Task<IActionResult> AdminFaqs(CancellationToken ct)
    {
        RequireAdmin();
        return Ok(Ok200(await db.Database.SqlQuery<CmsFaqRow>($"""
            SELECT id AS "Id", question AS "Question", answer AS "Answer", sort_order AS "SortOrder", is_public AS "IsPublic"
            FROM content.cms_faqs ORDER BY sort_order, question
            """).ToListAsync(ct)));
    }

    [HttpPost("admin/cms/faqs")]
    [Authorize]
    public async Task<IActionResult> CreateFaq([FromBody] CmsFaqDto dto, CancellationToken ct)
    {
        RequireAdmin();
        var id = Guid.NewGuid();
        await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO content.cms_faqs (id, question, answer, sort_order, is_public) VALUES ({id}, {dto.Question.Trim()}, {dto.Answer.Trim()}, {dto.SortOrder}, {dto.IsPublic})", ct);
        return Ok(Ok200(new { id }));
    }

    [HttpPut("admin/cms/faqs/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateFaq(Guid id, [FromBody] CmsFaqDto dto, CancellationToken ct)
    {
        RequireAdmin();
        var n = await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE content.cms_faqs SET question = {dto.Question.Trim()}, answer = {dto.Answer.Trim()}, sort_order = {dto.SortOrder}, is_public = {dto.IsPublic}, updated_at = now() WHERE id = {id}", ct);
        if (n == 0) throw new NotFoundException("Không tìm thấy câu hỏi.");
        return Ok(Ok200(new { id }));
    }

    [HttpDelete("admin/cms/faqs/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteFaq(Guid id, CancellationToken ct) { RequireAdmin(); return await Delete("content.cms_faqs", id, ct); }

    // ------------------------------------------------------------------ ADMIN · đối tác
    [HttpGet("admin/cms/partners")]
    [Authorize]
    public async Task<IActionResult> AdminPartners(CancellationToken ct)
    {
        RequireAdmin();
        return Ok(Ok200(await db.Database.SqlQuery<CmsPartnerRow>($"""
            SELECT id AS "Id", name AS "Name", logo_url AS "LogoUrl", website AS "Website", sort_order AS "SortOrder", is_public AS "IsPublic"
            FROM content.cms_partners ORDER BY sort_order, name
            """).ToListAsync(ct)));
    }

    [HttpPost("admin/cms/partners")]
    [Authorize]
    public async Task<IActionResult> CreatePartner([FromBody] CmsPartnerDto dto, CancellationToken ct)
    {
        RequireAdmin();
        var id = Guid.NewGuid();
        await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO content.cms_partners (id, name, logo_url, website, sort_order, is_public) VALUES ({id}, {dto.Name.Trim()}, {dto.LogoUrl}, {dto.Website}, {dto.SortOrder}, {dto.IsPublic})", ct);
        return Ok(Ok200(new { id }));
    }

    [HttpPut("admin/cms/partners/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdatePartner(Guid id, [FromBody] CmsPartnerDto dto, CancellationToken ct)
    {
        RequireAdmin();
        var n = await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE content.cms_partners SET name = {dto.Name.Trim()}, logo_url = {dto.LogoUrl}, website = {dto.Website}, sort_order = {dto.SortOrder}, is_public = {dto.IsPublic}, updated_at = now() WHERE id = {id}", ct);
        if (n == 0) throw new NotFoundException("Không tìm thấy đối tác.");
        return Ok(Ok200(new { id }));
    }

    [HttpDelete("admin/cms/partners/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeletePartner(Guid id, CancellationToken ct) { RequireAdmin(); return await Delete("content.cms_partners", id, ct); }

    // ------------------------------------------------------------------ helpers
    private static readonly HashSet<string> AllowedTables = ["content.cms_articles", "content.cms_documents", "content.cms_media", "content.cms_faqs", "content.cms_partners"];

    private async Task<IActionResult> Delete(string table, Guid id, CancellationToken ct)
    {
        if (!AllowedTables.Contains(table)) throw new InvalidOperationException("Bảng không được phép");
        // Tên bảng lấy từ danh sách trắng cố định ở trên (không bao giờ từ input người dùng).
        var n = await db.Database.ExecuteSqlRawAsync($"DELETE FROM {table} WHERE id = {{0}}", [id], ct);
        if (n == 0) throw new NotFoundException("Không tìm thấy bản ghi.");
        return Ok(Ok200(new { id, deleted = true }));
    }

    private static void ValidateArticle(CmsArticleDto dto)
    {
        if (!Categories.Contains(dto.CategorySlug)) throw new ValidationException("Danh mục bài viết không hợp lệ");
        foreach (var url in new[] { dto.ThumbnailUrl, dto.SourceUrl }) RequireSafeUrl(url);
    }

    private static void ValidateDocument(CmsDocumentDto dto)
    {
        if (!DocTypes.Contains(dto.DocType)) throw new ValidationException("Loại tài liệu không hợp lệ");
        RequireSafeUrl(dto.FileUrl, required: true);
    }

    private static void ValidateMedia(CmsMediaDto dto)
    {
        if (dto.Kind is not ("IMAGE" or "VIDEO")) throw new ValidationException("Loại media phải là IMAGE hoặc VIDEO");
        RequireSafeUrl(dto.Url, required: true);
        RequireSafeUrl(dto.ThumbnailUrl);
    }

    /// <summary>Chỉ cho http(s) hoặc đường dẫn nội bộ bắt đầu bằng "/" — chặn javascript:/data: URL (XSS).</summary>
    public static void RequireSafeUrl(string? url, bool required = false)
    {
        if (string.IsNullOrWhiteSpace(url)) { if (required) throw new ValidationException("Thiếu đường dẫn"); return; }
        var u = url.Trim();
        var ok = (u.StartsWith('/') && !u.StartsWith("//")) || Uri.TryCreate(u, UriKind.Absolute, out var abs) && abs.Scheme is "http" or "https";
        if (!ok) throw new ValidationException("Đường dẫn không hợp lệ (chỉ nhận http/https hoặc đường dẫn nội bộ)");
    }

    private static string BodyJson(CmsArticleDto dto) => JsonSerializer.Serialize(new { markdown = dto.Body ?? "" });

    private static (string Status, DateTimeOffset? Published) PublishState(CmsArticleDto dto) =>
        dto.Publish ? ("PUBLISHED", dto.PublishedAt ?? DateTimeOffset.UtcNow) : ("DRAFT", dto.PublishedAt);

    /// <summary>BR-BL09-SLUG-STABLE-002: slug từ tiêu đề (bỏ dấu); trùng thì thêm hậu tố -2, -3...</summary>
    private async Task<string> UniqueSlugAsync(string source, Guid? selfId, CancellationToken ct)
    {
        var baseSlug = Slugify(source);
        if (baseSlug.Length == 0) baseSlug = "bai-viet";
        for (var i = 1; i < 200; i++)
        {
            var candidate = i == 1 ? baseSlug : $"{baseSlug}-{i}";
            var taken = await db.Database.SqlQueryRaw<int>("""
                SELECT count(*)::int AS "Value" FROM content.cms_articles WHERE slug = {0} AND ({1}::uuid IS NULL OR id <> {1})
                """, candidate, (object?)selfId ?? DBNull.Value).SingleAsync(ct);
            if (taken == 0) return candidate;
        }
        return $"{baseSlug}-{Guid.NewGuid():N}"[..40];
    }

    public static string Slugify(string s)
    {
        var d = s.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var c in d)
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark) sb.Append(c == 'đ' ? 'd' : c == 'Đ' ? 'D' : c);
        var slug = NonSlug().Replace(sb.ToString().ToLowerInvariant(), "-").Trim('-');
        return slug.Length > 120 ? slug[..120].Trim('-') : slug;
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonSlug();
}
