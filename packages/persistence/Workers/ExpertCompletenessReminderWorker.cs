using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Communication.Application;
using NacenTech.Modules.Communication.Domain;

namespace NacenTech.Persistence.Workers;

/// <summary>
/// TASK-05 Delta v15 [CR-2026-008]: Background worker định kỳ quét các hồ sơ chuyên gia đã duyệt (APPROVED).
/// Gửi thông báo nhắc nhở hoàn thiện hồ sơ nếu:
/// 1. Điểm hoàn thiện hồ sơ &lt; 70% (BR-EXP-045a)
/// HOẶC
/// 2. Hồ sơ không được cập nhật quá 30 ngày (BR-EXP-045b: stale profile)
///
/// Chống spam / Idempotency (BR-EXP-046):
/// Tối đa 1 thông báo/chuyên gia trong vòng 7 ngày gần nhất.
/// </summary>
public sealed class ExpertCompletenessReminderWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopes;
    private readonly ILogger<ExpertCompletenessReminderWorker> _log;
    private readonly TimeSpan _checkInterval;

    public ExpertCompletenessReminderWorker(
        IServiceScopeFactory scopes,
        ILogger<ExpertCompletenessReminderWorker> log)
        : this(scopes, log, TimeSpan.FromHours(1))
    {
    }

    public ExpertCompletenessReminderWorker(
        IServiceScopeFactory scopes,
        ILogger<ExpertCompletenessReminderWorker> log,
        TimeSpan checkInterval)
    {
        _scopes = scopes;
        _log = log;
        _checkInterval = checkInterval;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        // Chờ 10 giây khi khởi động trước khi thực hiện lần quét đầu tiên
        try { await Task.Delay(TimeSpan.FromSeconds(10), ct); }
        catch (OperationCanceledException) when (ct.IsCancellationRequested) { return; }

        while (!ct.IsCancellationRequested)
        {
            try
            {
                await RunOnceAsync(ct);
                await Task.Delay(_checkInterval, ct);
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested) { }
            catch (Exception ex)
            {
                _log.LogError(ex, "Lỗi trong chu trình quét nhắc nhở hoàn thiện hồ sơ chuyên gia");
                await Task.Delay(TimeSpan.FromSeconds(30), ct);
            }
        }
    }

    public Task<int> RunOnceAsync(CancellationToken ct = default) => RunOnceAsync(null, ct);

    public async Task<int> RunOnceAsync(Guid? targetPersonId, CancellationToken ct = default)
    {
        using var scope = _scopes.CreateScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<NacenTechDbContext>();
        var notifications = sp.GetRequiredService<INotificationService>();
        var clock = sp.GetService<IClock>();

        var now = clock?.UtcNow ?? DateTimeOffset.UtcNow;
        var reminderCutoff = now.AddDays(-7);
        var staleCutoff = now.AddDays(-30);

        // BR-EXP-044: Chỉ quét hồ sơ chuyên gia APPROVED có PersonId hợp lệ
        var query = db.Set<ExpertProfile>()
            .Where(p => p.Status == ExpertStatuses.Approved && p.PersonId != null);

        if (targetPersonId is not null)
            query = query.Where(p => p.PersonId == targetPersonId);

        var approvedProfiles = await query.ToListAsync(ct);

        if (approvedProfiles.Count == 0) return 0;

        var sentCount = 0;

        foreach (var profile in approvedProfiles)
        {
            var completeness = profile.CalculateCompleteness();
            var isLowCompleteness = completeness.Score < 70;
            var isStale = profile.UpdatedAt <= staleCutoff;

            // Nếu đạt cả hai điều kiện: điểm >= 70 và không stale thì bỏ qua
            if (!isLowCompleteness && !isStale) continue;

            var personId = profile.PersonId!.Value;

            // BR-EXP-046: Chống spam - tối đa 1 thông báo / 7 ngày
            var recentlyReminded = await db.Set<Notification>().AsNoTracking()
                .AnyAsync(n => n.PersonId == personId
                               && n.Type == NotificationTypes.ExpertCompletenessReminder
                               && n.CreatedAt >= reminderCutoff, ct);

            if (recentlyReminded)
            {
                _log.LogDebug("Bỏ qua nhắc nhở cho chuyên gia {ExpertCode} (PersonId: {PersonId}) vì đã gửi trong vòng 7 ngày qua.",
                    profile.ExpertCode, personId);
                continue;
            }

            var missingDescription = completeness.Missing.Count > 0
                ? string.Join(", ", completeness.Missing)
                : "Chưa có nội dung bổ sung";

            var reminderMessage = isLowCompleteness
                ? $"Hồ sơ chuyên gia của bạn đạt {completeness.Score}% độ hoàn thiện (còn thiếu: {missingDescription}). Vui lòng cập nhật để tăng uy tín và cơ hội kết nối."
                : "Hồ sơ chuyên gia của bạn chưa được cập nhật trong hơn 30 ngày qua. Vui lòng rà soát và bổ sung thông tin mới nhất.";

            var payload = new
            {
                expertCode = profile.ExpertCode,
                fullName = profile.FullName,
                completenessScore = completeness.Score,
                missingItems = completeness.Missing,
                isStale,
                message = reminderMessage,
                navigationPath = "/portal/expert/profile/edit",
                remindedAtUtc = now
            };

            await notifications.CreateAsync(personId, NotificationTypes.ExpertCompletenessReminder, payload, ct);
            sentCount++;

            _log.LogInformation("Đã gửi thông báo nhắc nhở hoàn thiện hồ sơ tới chuyên gia {ExpertCode} (PersonId: {PersonId}, Điểm: {Score}%)",
                profile.ExpertCode, personId, completeness.Score);
        }

        return sentCount;
    }
}
