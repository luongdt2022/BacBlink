using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Persistence.Workers;

/// <summary>
/// TASK-07 DELTA V4 (CR-2026-020): Background worker định kỳ quét SLA của hàng đợi thẩm định cấp Sở.
/// Quy tắc BR-ADMIN-SLA:
/// - Thời hạn thẩm định là 72 giờ làm việc (Working Hours: 08:00 - 17:00, trừ T7/CN và nghỉ trưa 12:00-13:00).
/// - Định kỳ 15 phút quét các hồ sơ PENDING_REVIEW / PENDING_APPROVAL.
/// - Nếu đã trôi qua > 72 giờ làm việc, tự động đánh dấu is_sla_breached = true và ghi nhận sla_overdue_hours.
/// </summary>
public sealed class ApprovalSlaMonitorWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopes;
    private readonly ILogger<ApprovalSlaMonitorWorker> _log;
    private readonly TimeSpan _checkInterval;

    public ApprovalSlaMonitorWorker(
        IServiceScopeFactory scopes,
        ILogger<ApprovalSlaMonitorWorker> log)
        : this(scopes, log, TimeSpan.FromMinutes(15))
    {
    }

    public ApprovalSlaMonitorWorker(
        IServiceScopeFactory scopes,
        ILogger<ApprovalSlaMonitorWorker> log,
        TimeSpan checkInterval)
    {
        _scopes = scopes;
        _log = log;
        _checkInterval = checkInterval;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        // Chờ 10 giây khi khởi động trước lần quét đầu tiên
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
                _log.LogError(ex, "Lỗi khi quét SLA hàng đợi thẩm định phê duyệt.");
                try { await Task.Delay(TimeSpan.FromMinutes(1), ct); }
                catch (OperationCanceledException) when (ct.IsCancellationRequested) { }
            }
        }
    }

    public async Task RunOnceAsync(CancellationToken ct)
    {
        using var scope = _scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var clock = scope.ServiceProvider.GetService<IClock>();
        var now = clock?.UtcNow ?? DateTimeOffset.UtcNow;

        var pendingRequests = await db.Set<ApprovalRequest>()
            .Where(x => (x.Status == ApprovalStatuses.PendingReview || x.Status == ApprovalStatuses.PendingApproval)
                        && !x.IsSlaBreached)
            .ToListAsync(ct);

        if (pendingRequests.Count == 0) return;

        int breachedCount = 0;
        foreach (var req in pendingRequests)
        {
            var workingHours = CalculateWorkingHours(req.CreatedAt, now);
            if (workingHours > 72.0)
            {
                var overdue = workingHours - 72.0;
                req.MarkSlaBreached(overdue);
                breachedCount++;
            }
        }

        if (breachedCount > 0)
        {
            await db.SaveChangesAsync(ct);
            _log.LogInformation("Đã quét và cập nhật cờ quá hạn SLA cho {Count} hồ sơ thẩm định.", breachedCount);
        }
    }

    /// <summary>
    /// Tính tổng số giờ làm việc thực tế (Working Hours) giữa hai mốc thời gian:
    /// - Khung giờ làm việc: 08:00 - 12:00 và 13:00 - 17:00 (8h/ngày theo múi giờ Việt Nam UTC+7).
    /// - Loại trừ Thứ Bảy và Chủ Nhật.
    /// </summary>
    public static double CalculateWorkingHours(DateTimeOffset startUtc, DateTimeOffset endUtc)
    {
        if (endUtc <= startUtc) return 0.0;

        var vnOffset = TimeSpan.FromHours(7);
        var startVn = startUtc.ToOffset(vnOffset);
        var endVn = endUtc.ToOffset(vnOffset);

        double totalHours = 0.0;
        var current = startVn.Date;
        var lastDay = endVn.Date;

        while (current <= lastDay)
        {
            if (current.DayOfWeek != DayOfWeek.Saturday && current.DayOfWeek != DayOfWeek.Sunday)
            {
                var dayStart = new DateTimeOffset(current.Year, current.Month, current.Day, 8, 0, 0, vnOffset);
                var morningEnd = new DateTimeOffset(current.Year, current.Month, current.Day, 12, 0, 0, vnOffset);
                var afternoonStart = new DateTimeOffset(current.Year, current.Month, current.Day, 13, 0, 0, vnOffset);
                var dayEnd = new DateTimeOffset(current.Year, current.Month, current.Day, 17, 0, 0, vnOffset);

                var segStart = current == startVn.Date && startVn > dayStart ? startVn : dayStart;
                var segEnd = current == lastDay && endVn < dayEnd ? endVn : dayEnd;

                if (segStart < segEnd)
                {
                    // Ca sáng: 08:00 - 12:00
                    var mStart = segStart > dayStart ? segStart : dayStart;
                    var mEnd = segEnd < morningEnd ? segEnd : morningEnd;
                    if (mStart < mEnd) totalHours += (mEnd - mStart).TotalHours;

                    // Ca chiều: 13:00 - 17:00
                    var aStart = segStart > afternoonStart ? segStart : afternoonStart;
                    var aEnd = segEnd < dayEnd ? segEnd : dayEnd;
                    if (aStart < aEnd) totalHours += (aEnd - aStart).TotalHours;
                }
            }
            current = current.AddDays(1);
        }

        return Math.Round(totalHours, 2);
    }
}
