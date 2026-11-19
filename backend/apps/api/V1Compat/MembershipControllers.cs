using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Persistence;
using ValidationException = NacenTech.Kernel.Domain.ValidationException;

namespace NacenTech.Api.V1Compat;

public sealed record MembershipTierRow(string Code, string Name, string MemberType, string? Audience, decimal AnnualFee, decimal JoiningFee, int SortOrder, bool IsActive);

public sealed record MembershipRow(
    Guid Id, Guid EnterpriseId, string EnterpriseName, string? TaxCode, string? SectorName, string? ProvinceCity,
    string TierCode, string TierName, string Status, string? CertificateNo, DateOnly? ValidFrom, DateOnly? ValidTo,
    decimal? FeeAmount, DateTimeOffset? FeePaidAt, string? FeeNote, bool IsFeatured, int? FeaturedOrder,
    DateTimeOffset? RenewalRequestedAt, string? StatusNote);

public sealed record FeaturedMemberRow(Guid EnterpriseId, string Name, string? TaxCode, string? SectorName, string? ProvinceCity, string TierName, int? FeaturedOrder);

public sealed record CertificateVerifyRow(string CertificateNo, string EnterpriseName, string? TaxCode, string TierName, string Status, DateOnly? ValidFrom, DateOnly? ValidTo);

/// <summary>
/// CR-BACLINK-008 · API-BL08-TIERS-001 / -FEATURED-002 / -MY-004 / -ADMIN-005 — vòng đời hội viên.
/// Bảng `enterprise.membership_tiers`, `enterprise.memberships` (migration 20261119120000).
/// Trạng thái hội viên KHÔNG thay đổi role (BR-BL08-ROLE-DECOUPLE-004).
/// </summary>
[Route("api/v1")]
public sealed class MembershipController(NacenTechDbContext db, IMembershipActivator activator, IClock clock) : V1ControllerBase
{
    private const string SelectMembership = """
        SELECT m.id AS "Id", m.enterprise_id AS "EnterpriseId", e.name AS "EnterpriseName", e.tax_code AS "TaxCode",
               e.main_sector_name AS "SectorName", e.province_city AS "ProvinceCity",
               m.tier_code AS "TierCode", t.name AS "TierName", m.status AS "Status", m.certificate_no AS "CertificateNo",
               m.valid_from AS "ValidFrom", m.valid_to AS "ValidTo", m.fee_amount AS "FeeAmount", m.fee_paid_at AS "FeePaidAt",
               m.fee_note AS "FeeNote", m.is_featured AS "IsFeatured", m.featured_order AS "FeaturedOrder",
               m.renewal_requested_at AS "RenewalRequestedAt", m.status_note AS "StatusNote"
        FROM enterprise.memberships m
        JOIN enterprise.enterprises e ON e.id = m.enterprise_id
        JOIN enterprise.membership_tiers t ON t.code = m.tier_code
        """;

    // ------------------------------------------------------------------ PUBLIC
    [HttpGet("public/membership/tiers")]
    [AllowAnonymous]
    public async Task<IActionResult> Tiers(CancellationToken ct)
    {
        var rows = await db.Database.SqlQuery<MembershipTierRow>($"""
            SELECT code AS "Code", name AS "Name", member_type AS "MemberType", audience AS "Audience",
                   annual_fee AS "AnnualFee", joining_fee AS "JoiningFee", sort_order AS "SortOrder", is_active AS "IsActive"
            FROM enterprise.membership_tiers WHERE is_active ORDER BY sort_order
            """).ToListAsync(ct);
        return Ok(Ok200(rows));
    }

    [HttpGet("public/members/featured")]
    [AllowAnonymous]
    public async Task<IActionResult> Featured([FromQuery] int? limit, CancellationToken ct)
    {
        var l = Math.Clamp(limit ?? 8, 1, 24);
        var rows = await db.Database.SqlQuery<FeaturedMemberRow>($"""
            SELECT e.id AS "EnterpriseId", e.name AS "Name", e.tax_code AS "TaxCode", e.main_sector_name AS "SectorName",
                   e.province_city AS "ProvinceCity", t.name AS "TierName", m.featured_order AS "FeaturedOrder"
            FROM enterprise.memberships m
            JOIN enterprise.enterprises e ON e.id = m.enterprise_id
            JOIN enterprise.membership_tiers t ON t.code = m.tier_code
            WHERE m.is_featured AND m.status = 'ACTIVE'
            ORDER BY m.featured_order NULLS LAST, e.name
            LIMIT {l}
            """).ToListAsync(ct);
        return Ok(Ok200(rows));
    }

    [HttpGet("public/memberships/verify/{certificateNo}")]
    [AllowAnonymous]
    public async Task<IActionResult> Verify(string certificateNo, CancellationToken ct)
    {
        var no = certificateNo.Trim().ToUpperInvariant();
        var rows = await db.Database.SqlQuery<CertificateVerifyRow>($"""
            SELECT m.certificate_no AS "CertificateNo", e.name AS "EnterpriseName", e.tax_code AS "TaxCode",
                   t.name AS "TierName", m.status AS "Status", m.valid_from AS "ValidFrom", m.valid_to AS "ValidTo"
            FROM enterprise.memberships m
            JOIN enterprise.enterprises e ON e.id = m.enterprise_id
            JOIN enterprise.membership_tiers t ON t.code = m.tier_code
            WHERE m.certificate_no = {no}
            """).ToListAsync(ct);
        if (rows.Count == 0) throw new NotFoundException("Không tìm thấy chứng nhận hội viên với số này.");
        return Ok(Ok200(rows[0]));
    }

    // ------------------------------------------------------------------ MY
    [HttpGet("my/membership")]
    [Authorize]
    public async Task<IActionResult> Mine(CancellationToken ct)
    {
        var me = PersonId;
        var rows = await db.Database.SqlQueryRaw<MembershipRow>(
            SelectMembership + " WHERE e.owner_person_id = {0} ORDER BY m.updated_at DESC LIMIT 1", me).ToListAsync(ct);
        if (rows.Count == 0) return Ok(new { success = true, data = (object?)null });
        return Ok(Ok200(WithDerived(rows[0])));
    }

    [HttpPost("my/membership/renewal-requests")]
    [Authorize]
    public async Task<IActionResult> RequestRenewal(CancellationToken ct)
    {
        var me = PersonId;
        var n = await db.Database.ExecuteSqlInterpolatedAsync($"""
            UPDATE enterprise.memberships m SET renewal_requested_at = now(), updated_at = now()
            FROM enterprise.enterprises e
            WHERE e.id = m.enterprise_id AND e.owner_person_id = {me}
            """, ct);
        if (n == 0) throw new NotFoundException("Tài khoản chưa có tư cách hội viên để gia hạn.");
        return Ok(Ok200(new { requested = true }));
    }

    // ------------------------------------------------------------------ ADMIN
    [HttpGet("admin/memberships")]
    [Authorize]
    public async Task<IActionResult> AdminList([FromQuery] string? status, [FromQuery] string? q, [FromQuery] int? expiringDays, CancellationToken ct)
    {
        RequireAdmin();
        var today = DateOnly.FromDateTime(clock.UtcNow.UtcDateTime);
        var horizon = expiringDays is > 0 ? today.AddDays(expiringDays.Value) : (DateOnly?)null;
        var like = string.IsNullOrWhiteSpace(q) ? null : $"%{q.Trim()}%";
        var rows = await db.Database.SqlQueryRaw<MembershipRow>(
            SelectMembership + """
             WHERE ({0}::text IS NULL OR m.status = {0})
               AND ({1}::text IS NULL OR e.name ILIKE {1} OR e.tax_code ILIKE {1} OR m.certificate_no ILIKE {1})
               AND ({2}::date IS NULL OR m.valid_to <= {2})
             ORDER BY (m.renewal_requested_at IS NULL), m.valid_to NULLS LAST, e.name
            """, (object?)status ?? DBNull.Value, (object?)like ?? DBNull.Value, (object?)horizon ?? DBNull.Value).ToListAsync(ct);

        var candidates = await db.Database.SqlQuery<FeaturedMemberRow>($"""
            SELECT e.id AS "EnterpriseId", e.name AS "Name", e.tax_code AS "TaxCode", e.main_sector_name AS "SectorName",
                   e.province_city AS "ProvinceCity", '' AS "TierName", NULL::int AS "FeaturedOrder"
            FROM enterprise.enterprises e
            WHERE e.is_verified AND NOT EXISTS (SELECT 1 FROM enterprise.memberships m WHERE m.enterprise_id = e.id)
            ORDER BY e.name
            """).ToListAsync(ct);

        return Ok(Ok200(new { items = rows.Select(WithDerived).ToList(), verifiedWithoutMembership = candidates }));
    }

    public sealed class ActivateDto { [Required] public Guid EnterpriseId { get; set; } public string? TierCode { get; set; } }

    [HttpPost("admin/memberships/activate")]
    [Authorize]
    public async Task<IActionResult> Activate([FromBody] ActivateDto dto, CancellationToken ct)
    {
        RequireAdmin();
        var owner = await db.Database.SqlQuery<Guid?>($"SELECT owner_person_id AS \"Value\" FROM enterprise.enterprises WHERE id = {dto.EnterpriseId} AND is_verified").ToListAsync(ct);
        if (owner.Count == 0 || owner[0] is null) throw new ValidationException("Doanh nghiệp chưa xác thực hoặc chưa có tài khoản chủ sở hữu.");
        var cert = await activator.ActivateForOwnerAsync(owner[0]!.Value, dto.TierCode, PersonId, ct);
        return Ok(Ok200(new { certificateNo = cert }));
    }

    public sealed class RecordFeeDto
    {
        [Range(0, 1_000_000_000)] public decimal Amount { get; set; }
        [MaxLength(500)] public string? Note { get; set; }
    }

    [HttpPost("admin/memberships/{id:guid}/record-fee")]
    [Authorize]
    public async Task<IActionResult> RecordFee(Guid id, [FromBody] RecordFeeDto dto, CancellationToken ct)
    {
        RequireAdmin();
        await Exec($"""
            UPDATE enterprise.memberships SET fee_amount = {dto.Amount}, fee_paid_at = now(), fee_note = {dto.Note}, updated_at = now()
            WHERE id = {id}
            """, ct);
        return Ok(Ok200(new { id, feePaid = true }));
    }

    [HttpPost("admin/memberships/{id:guid}/renew")]
    [Authorize]
    public async Task<IActionResult> Renew(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        var today = DateOnly.FromDateTime(clock.UtcNow.UtcDateTime);
        // Gia hạn thêm 1 năm tính từ hạn cũ (hoặc từ hôm nay nếu đã quá hạn), luôn kết thúc 31/12.
        await Exec($"""
            UPDATE enterprise.memberships
            SET valid_to = make_date(extract(year from GREATEST(coalesce(valid_to, {today}), {today}))::int + 1, 12, 31),
                status = 'ACTIVE', fee_paid_at = NULL, renewal_requested_at = NULL, last_reminded_at = NULL,
                status_note = 'Gia hạn bởi Ban Quản trị', updated_at = now()
            WHERE id = {id}
            """, ct);
        return Ok(Ok200(new { id, renewed = true }));
    }

    public sealed class ReasonDto { [Required, MinLength(5)] public string Reason { get; set; } = string.Empty; }

    [HttpPost("admin/memberships/{id:guid}/suspend")]
    [Authorize]
    public async Task<IActionResult> Suspend(Guid id, [FromBody] ReasonDto dto, CancellationToken ct)
    {
        RequireAdmin();
        await Exec($"UPDATE enterprise.memberships SET status = 'SUSPENDED', status_note = {dto.Reason}, is_featured = false, updated_at = now() WHERE id = {id}", ct);
        return Ok(Ok200(new { id, status = "SUSPENDED" }));
    }

    [HttpPost("admin/memberships/{id:guid}/restore")]
    [Authorize]
    public async Task<IActionResult> Restore(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        var today = DateOnly.FromDateTime(clock.UtcNow.UtcDateTime);
        await Exec($"""
            UPDATE enterprise.memberships
            SET status = CASE WHEN valid_to IS NOT NULL AND valid_to < {today} THEN 'EXPIRED' ELSE 'ACTIVE' END,
                status_note = 'Khôi phục bởi Ban Quản trị', updated_at = now()
            WHERE id = {id}
            """, ct);
        return Ok(Ok200(new { id, restored = true }));
    }

    public sealed class FeaturedDto { public bool IsFeatured { get; set; } public int? Order { get; set; } }

    [HttpPut("admin/memberships/{id:guid}/featured")]
    [Authorize]
    public async Task<IActionResult> SetFeatured(Guid id, [FromBody] FeaturedDto dto, CancellationToken ct)
    {
        RequireAdmin();
        if (dto.IsFeatured)
        {
            var st = await db.Database.SqlQuery<string>($"SELECT status AS \"Value\" FROM enterprise.memberships WHERE id = {id}").ToListAsync(ct);
            if (st.Count == 0) throw new NotFoundException("Không tìm thấy hội viên.");
            if (st[0] != "ACTIVE") throw new ValidationException("Chỉ hội viên đang hiệu lực mới được đánh dấu tiêu biểu.");
        }
        await Exec($"UPDATE enterprise.memberships SET is_featured = {dto.IsFeatured}, featured_order = {dto.Order}, updated_at = now() WHERE id = {id}", ct);
        return Ok(Ok200(new { id, dto.IsFeatured }));
    }

    public sealed class TierDto
    {
        [Required, MaxLength(150)] public string Name { get; set; } = string.Empty;
        [MaxLength(500)] public string? Audience { get; set; }
        [Range(0, 1_000_000_000)] public decimal AnnualFee { get; set; }
        [Range(0, 1_000_000_000)] public decimal JoiningFee { get; set; }
        public bool IsActive { get; set; } = true;
    }

    [HttpPut("admin/membership/tiers/{code}")]
    [Authorize]
    public async Task<IActionResult> UpdateTier(string code, [FromBody] TierDto dto, CancellationToken ct)
    {
        RequireAdmin();
        await Exec($"""
            UPDATE enterprise.membership_tiers
            SET name = {dto.Name.Trim()}, audience = {dto.Audience}, annual_fee = {dto.AnnualFee}, joining_fee = {dto.JoiningFee},
                is_active = {dto.IsActive}, updated_at = now()
            WHERE code = {code.ToUpperInvariant()}
            """, ct);
        return Ok(Ok200(new { code }));
    }

    // ------------------------------------------------------------------ helpers
    private async Task Exec(FormattableString sql, CancellationToken ct)
    {
        var n = await db.Database.ExecuteSqlInterpolatedAsync(sql, ct);
        if (n == 0) throw new NotFoundException("Không tìm thấy bản ghi hội viên.");
    }

    private object WithDerived(MembershipRow r)
    {
        var today = DateOnly.FromDateTime(clock.UtcNow.UtcDateTime);
        int? daysLeft = r.ValidTo is { } v ? v.DayNumber - today.DayNumber : null;
        return new
        {
            r.Id, r.EnterpriseId, r.EnterpriseName, r.TaxCode, r.SectorName, r.ProvinceCity, r.TierCode, r.TierName,
            r.Status, r.CertificateNo, r.ValidFrom, r.ValidTo, r.FeeAmount, r.FeePaidAt, r.FeeNote, r.IsFeatured,
            r.FeaturedOrder, r.RenewalRequestedAt, r.StatusNote,
            daysLeft,
            feePaid = r.FeePaidAt is not null || r.FeeAmount == 0,
            expiringSoon = r.Status == "ACTIVE" && daysLeft is >= 0 and <= 30,
        };
    }
}
