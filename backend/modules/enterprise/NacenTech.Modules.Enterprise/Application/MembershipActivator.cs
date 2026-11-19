using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Enterprise.Application;

/// <summary>
/// CR-BACLINK-008 — vòng đời hội viên. Bảng `enterprise.memberships` / `membership_tiers` (migration
/// 20261119120000) không map EF; thao tác bằng SQL tham số hóa trong transaction riêng, khóa advisory
/// để cấp số chứng nhận `BL-{YYYY}-{NNNN}` không trùng khi duyệt song song.
/// </summary>
public sealed class MembershipActivator(DbContext db, IClock clock) : IMembershipActivator
{
    public const string DefaultTier = "OFFICIAL_M";

    public async Task<string?> ActivateForOwnerAsync(Guid ownerPersonId, string? tierCode, Guid? approvedBy, CancellationToken ct)
    {
        var enterpriseId = await db.Database.SqlQuery<Guid>($"""
            SELECT id AS "Value" FROM enterprise.enterprises
            WHERE owner_person_id = {ownerPersonId}
            ORDER BY is_verified DESC, updated_at DESC LIMIT 1
            """).ToListAsync(ct);
        if (enterpriseId.Count == 0) return null;
        var entId = enterpriseId[0];

        var tier = string.IsNullOrWhiteSpace(tierCode) ? DefaultTier : tierCode.Trim().ToUpperInvariant();
        var tierFee = await db.Database.SqlQuery<decimal>($"""
            SELECT annual_fee AS "Value" FROM enterprise.membership_tiers WHERE code = {tier} AND is_active
            """).ToListAsync(ct);
        if (tierFee.Count == 0)
        {
            tier = DefaultTier;
            tierFee = await db.Database.SqlQuery<decimal>($"""
                SELECT annual_fee AS "Value" FROM enterprise.membership_tiers WHERE code = {tier}
                """).ToListAsync(ct);
        }

        var today = DateOnly.FromDateTime(clock.UtcNow.UtcDateTime);
        var validTo = new DateOnly(today.Year, 12, 31);
        // BR-BL08-FEE-006: kết nạp sau 30/06 thu 50% năm đầu.
        var fee = (tierFee.FirstOrDefault()) * (today.Month > 6 ? 0.5m : 1m);

        // Một câu lệnh upsert duy nhất (không mở transaction trong module — MOD rule).
        // Hai phê duyệt song song có thể tính cùng số → unique index uq_memberships_certificate_no chặn,
        // ta thử lại với số kế tiếp.
        var prefix = $"BL-{today.Year}-";
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                var id = Guid.NewGuid();
                var result = await db.Database.SqlQuery<string>($"""
                    WITH seq AS (
                        SELECT coalesce(max(substring(certificate_no from 9)::int), 0) + 1 AS n
                        FROM enterprise.memberships WHERE certificate_no LIKE {prefix + "%"}
                    )
                    INSERT INTO enterprise.memberships
                        (id, enterprise_id, tier_code, status, certificate_no, valid_from, valid_to, fee_amount, approved_by, status_note)
                    SELECT {id}, {entId}, {tier}, 'ACTIVE', {prefix} || lpad(seq.n::text, 4, '0'), {today}, {validTo}, {fee}, {approvedBy},
                           'Cấp khi phê duyệt hồ sơ gia nhập'
                    FROM seq
                    ON CONFLICT (enterprise_id) DO UPDATE
                        SET status = 'ACTIVE',
                            certificate_no = coalesce(enterprise.memberships.certificate_no, EXCLUDED.certificate_no),
                            valid_to = GREATEST(coalesce(enterprise.memberships.valid_to, EXCLUDED.valid_to), EXCLUDED.valid_to),
                            status_note = 'Kích hoạt lại khi phê duyệt', updated_at = now()
                    RETURNING certificate_no AS "Value"
                    """).ToListAsync(ct);
                return result.FirstOrDefault();
            }
            catch (Exception ex) when (attempt < 5 && IsCertificateNoConflict(ex))
            {
                await Task.Delay(20 * attempt, ct);
            }
        }
    }

    private static bool IsCertificateNoConflict(Exception ex)
    {
        for (var e = ex; e is not null; e = e.InnerException!)
        {
            if (e.GetType().Name == "PostgresException" && e.Message.Contains("uq_memberships_certificate_no", StringComparison.Ordinal))
                return true;
            if (e.InnerException is null) break;
        }
        return false;
    }

    public async Task SuspendForOwnerAsync(Guid ownerPersonId, string reason, CancellationToken ct)
    {
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            UPDATE enterprise.memberships m
            SET status = 'SUSPENDED', status_note = {reason}, updated_at = now()
            FROM enterprise.enterprises e
            WHERE e.id = m.enterprise_id AND e.owner_person_id = {ownerPersonId}
            """, ct);
    }

    public async Task<bool> IsTaxCodeOwnedByOtherMemberAsync(string taxCode, Guid personId, CancellationToken ct)
    {
        var n = await db.Database.SqlQuery<int>($"""
            SELECT count(*)::int AS "Value" FROM enterprise.enterprises
            WHERE tax_code = {taxCode} AND is_verified = true
              AND owner_person_id IS NOT NULL AND owner_person_id <> {personId}
            """).SingleAsync(ct);
        return n > 0;
    }
}
