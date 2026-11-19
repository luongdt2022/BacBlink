using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using ValidationException = NacenTech.Kernel.Domain.ValidationException;
using NacenTech.Persistence;

namespace NacenTech.Api.V1Compat;

public sealed class ContactRequestDtoIn
{
    [Required(ErrorMessage = "Vui lòng nhập họ và tên")]
    [MaxLength(150)] public string FullName { get; set; } = string.Empty;

    [MaxLength(30)] [RegularExpression(@"^[0-9+ .()-]{8,20}$", ErrorMessage = "Số điện thoại không hợp lệ")]
    public string? Phone { get; set; }

    [MaxLength(200)] [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string? Email { get; set; }

    [MaxLength(200)] public string? Organization { get; set; }

    [MaxLength(50)] public string? Topic { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập nội dung")]
    [MinLength(10, ErrorMessage = "Nội dung tối thiểu 10 ký tự")] [MaxLength(4000)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(300)] public string? SourcePath { get; set; }

    /// <summary>Honeypot chống spam: người thật không thấy ô này nên luôn để trống.</summary>
    public string? Website { get; set; }
}

public sealed record ContactRequestRow(
    Guid Id, string FullName, string? Phone, string? Email, string? Organization, string Topic,
    string Message, string? SourcePath, string Status, DateTimeOffset CreatedAt, string? HandledNote = null, DateTimeOffset? HandledAt = null);

/// <summary>
/// CR-BACLINK-008 · REQ-BL08-CONTACT-009 / API-BL08-CONTACT-006 — hộp thư liên hệ công khai của Hiệp hội.
/// Giới hạn 5 yêu cầu / IP / giờ (policy "contact-public") + honeypot.
/// </summary>
[Route("api/v1")]
public sealed class ContactRequestsController(NacenTechDbContext db) : V1ControllerBase
{
    public static readonly HashSet<string> Topics = ["GENERAL", "MEMBERSHIP", "SERVICE", "POLICY", "PARTNERSHIP", "PRESS", "EVENT"];
    private static readonly HashSet<string> Statuses = ["NEW", "IN_PROGRESS", "DONE", "SPAM"];

    [HttpPost("public/contact-requests")]
    [AllowAnonymous]
    [EnableRateLimiting("contact-public")]
    public async Task<IActionResult> Create([FromBody] ContactRequestDtoIn dto, CancellationToken ct)
    {
        var phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
        var email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
        if (phone is null && email is null)
            throw new ValidationException("Vui lòng cung cấp số điện thoại hoặc email để Hiệp hội liên hệ lại");

        var id = Guid.NewGuid();
        // Honeypot: giả vờ thành công, không ghi CSDL.
        if (!string.IsNullOrWhiteSpace(dto.Website))
            return Ok(Ok200(new { id, status = "NEW" }));

        var topic = dto.Topic?.Trim().ToUpperInvariant();
        if (topic is null || !Topics.Contains(topic)) topic = "GENERAL";

        // Người gửi đã đăng nhập (có token hợp lệ) → gắn để họ theo dõi tại /portal/requests. Ẩn danh thì để null.
        Guid? personId = Actor.IsAuthenticated ? Actor.PersonId : null;
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO communication.contact_requests
                (id, full_name, phone, email, organization, topic, message, source_path, status, created_at, person_id)
            VALUES ({id}, {dto.FullName.Trim()}, {phone}, {email}, {dto.Organization?.Trim()}, {topic},
                    {dto.Message.Trim()}, {dto.SourcePath}, 'NEW', now(), {personId})
            """, ct);

        return Ok(Ok200(new { id, status = "NEW" }));
    }

    [HttpGet("admin/contact-requests")]
    [Authorize]
    public async Task<IActionResult> List([FromQuery] string? status, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        RequireAdmin();
        if (status is not null && !Statuses.Contains(status)) throw new ValidationException("status không hợp lệ");
        var p = Math.Max(page ?? 1, 1);
        var l = Math.Clamp(limit ?? 20, 1, 100);
        var offset = (p - 1) * l;

        var rows = await db.Database.SqlQuery<ContactRequestRow>($"""
            SELECT id AS "Id", full_name AS "FullName", phone AS "Phone", email AS "Email",
                   organization AS "Organization", topic AS "Topic", message AS "Message",
                   source_path AS "SourcePath", status AS "Status", created_at AS "CreatedAt",
                   handled_note AS "HandledNote", handled_at AS "HandledAt"
            FROM communication.contact_requests
            WHERE {status}::text IS NULL OR status = {status}
            ORDER BY created_at DESC
            LIMIT {l} OFFSET {offset}
            """).ToListAsync(ct);
        var total = await db.Database.SqlQuery<int>($"""
            SELECT count(*)::int AS "Value" FROM communication.contact_requests
            WHERE {status}::text IS NULL OR status = {status}
            """).SingleAsync(ct);

        return Ok(new { success = true, data = rows, total, page = p, limit = l, totalPages = (int)Math.Ceiling(total / (double)l) });
    }

    public sealed class ContactStatusDtoIn { [Required] public string Status { get; set; } = string.Empty; [MaxLength(2000)] public string? Note { get; set; } }

    [HttpPatch("admin/contact-requests/{id:guid}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] ContactStatusDtoIn dto, CancellationToken ct)
    {
        RequireAdmin();
        if (!Statuses.Contains(dto.Status)) throw new ValidationException("status không hợp lệ");
        var by = PersonId;
        var n = await db.Database.ExecuteSqlInterpolatedAsync($"""
            UPDATE communication.contact_requests
            SET status = {dto.Status}, handled_by = {by}, handled_at = now(),
                handled_note = coalesce({dto.Note?.Trim()}, handled_note)
            WHERE id = {id}
            """, ct);
        if (n == 0) throw new NotFoundException("Không tìm thấy yêu cầu liên hệ");
        return Ok(Ok200(new { id, status = dto.Status }));
    }

    /// <summary>CR-BACLINK-010 · REQ-BL10-MYREQ-003 — người dùng đã đăng nhập xem các yêu cầu/kiến nghị của chính mình và trạng thái xử lý.</summary>
    [HttpGet("my/contact-requests")]
    [Authorize]
    public async Task<IActionResult> Mine(CancellationToken ct)
    {
        var me = PersonId;
        var rows = await db.Database.SqlQuery<ContactRequestRow>($"""
            SELECT id AS "Id", full_name AS "FullName", phone AS "Phone", email AS "Email", organization AS "Organization", topic AS "Topic",
                   message AS "Message", source_path AS "SourcePath", status AS "Status", created_at AS "CreatedAt",
                   handled_note AS "HandledNote", handled_at AS "HandledAt"
            FROM communication.contact_requests WHERE person_id = {me} ORDER BY created_at DESC LIMIT 100
            """).ToListAsync(ct);
        return Ok(Ok200(rows));
    }
}
