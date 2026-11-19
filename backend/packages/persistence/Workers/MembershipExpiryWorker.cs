using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Communication.Application;

namespace NacenTech.Persistence.Workers;

/// <summary>
/// CR-BACLINK-008 · T-00.BL08.13 · BR-BL08-MEMBER-LIFECYCLE-003 / BR-BL08-ROLE-DECOUPLE-004.
/// Mỗi chu kỳ (mặc định 6 giờ):
/// 1. ACTIVE có valid_to &lt; hôm nay → EXPIRED.
/// 2. EXPIRED quá 90 ngày → SUSPENDED (bỏ cờ tiêu biểu).
/// 3. ACTIVE còn ≤ 30 ngày → gửi thông báo nhắc gia hạn tới chủ sở hữu (tối đa 1 lần / 7 ngày).
/// Không đổi role của tài khoản.
/// </summary>
public sealed class MembershipExpiryWorker(IServiceScopeFactory scopes, ILogger<MembershipExpiryWorker> log) : BackgroundService
{
    public static readonly TimeSpan Interval = TimeSpan.FromHours(6);
    public const int GraceDays = 90;
    public const int ReminderDays = 30;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        try { await Task.Delay(TimeSpan.FromSeconds(15), ct); }
        catch (OperationCanceledException) when (ct.IsCancellationRequested) { return; }

        while (!ct.IsCancellationRequested)
        {
            try
            {
                var r = await RunOnceAsync(ct);
                if (r.Expired + r.Suspended + r.Reminded > 0)
                    log.LogInformation("Membership sweep: expired={Expired} suspended={Suspended} reminded={Reminded}", r.Expired, r.Suspended, r.Reminded);
                await Task.Delay(Interval, ct);
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested) { }
            catch (Exception ex)
            {
                log.LogError(ex, "Lỗi chu trình quét hạn hội viên");
                await Task.Delay(TimeSpan.FromMinutes(1), ct);
            }
        }
    }

    public sealed record SweepResult(int Expired, int Suspended, int Reminded);

    private sealed record ReminderTarget(Guid MembershipId, Guid PersonId, string EnterpriseName, DateOnly ValidTo, string? CertificateNo);

    public async Task<SweepResult> RunOnceAsync(CancellationToken ct = default)
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var clock = scope.ServiceProvider.GetRequiredService<IClock>();
        var notifications = scope.ServiceProvider.GetRequiredService<INotificationService>();
        var today = DateOnly.FromDateTime(clock.UtcNow.UtcDateTime);
        var graceLimit = today.AddDays(-GraceDays);
        var remindUntil = today.AddDays(ReminderDays);

        var expired = await db.Database.ExecuteSqlInterpolatedAsync($"""
            UPDATE enterprise.memberships SET status = 'EXPIRED', status_note = 'Hết hạn hội viên (tự động)', updated_at = now()
            WHERE status = 'ACTIVE' AND valid_to IS NOT NULL AND valid_to < {today}
            """, ct);

        var suspended = await db.Database.ExecuteSqlInterpolatedAsync($"""
            UPDATE enterprise.memberships
            SET status = 'SUSPENDED', is_featured = false,
                status_note = 'Tạm ngưng do quá hạn gia hạn 90 ngày (tự động)', updated_at = now()
            WHERE status = 'EXPIRED' AND valid_to IS NOT NULL AND valid_to < {graceLimit}
            """, ct);

        var targets = await db.Database.SqlQuery<ReminderTarget>($"""
            SELECT m.id AS "MembershipId", e.owner_person_id AS "PersonId", e.name AS "EnterpriseName",
                   m.valid_to AS "ValidTo", m.certificate_no AS "CertificateNo"
            FROM enterprise.memberships m
            JOIN enterprise.enterprises e ON e.id = m.enterprise_id
            WHERE m.status = 'ACTIVE' AND e.owner_person_id IS NOT NULL
              AND m.valid_to BETWEEN {today} AND {remindUntil}
              AND m.renewal_requested_at IS NULL
              AND (m.last_reminded_at IS NULL OR m.last_reminded_at < now() - interval '7 days')
            """).ToListAsync(ct);

        foreach (var t in targets)
        {
            await notifications.CreateAsync(t.PersonId, NotificationTypes.MembershipExpiring, new
            {
                title = "Tư cách hội viên BACLINK sắp hết hạn",
                message = $"Hội viên {t.EnterpriseName} ({t.CertificateNo}) hết hạn ngày {t.ValidTo:dd/MM/yyyy}. Vui lòng gửi yêu cầu gia hạn.",
                link = "/portal/membership",
                validTo = t.ValidTo.ToString("yyyy-MM-dd"),
            }, ct);
            await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE enterprise.memberships SET last_reminded_at = now() WHERE id = {t.MembershipId}", ct);
        }

        return new SweepResult(expired, suspended, targets.Count);
    }
}
