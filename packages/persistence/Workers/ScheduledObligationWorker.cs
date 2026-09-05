using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NacenTech.Kernel.Application;
using NacenTech.Persistence.Platform;

namespace NacenTech.Persistence.Workers;

/// <summary>
/// §26.5: lịch dài hạn sống trong PostgreSQL. Worker chết nhiều ngày → khi sống lại backfill toàn bộ mục quá hạn.
/// FIRED là at-least-once; handler idempotent theo obligation id.
/// </summary>
public sealed class ScheduledObligationWorker(IServiceScopeFactory scopes, ILogger<ScheduledObligationWorker> log) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                var fired = await RunOnceAsync(ct);
                if (fired == 0) await Task.Delay(TimeSpan.FromSeconds(30), ct);
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested) { }
            catch (Exception ex)
            {
                log.LogError(ex, "Scheduled obligation loop error");
                await Task.Delay(TimeSpan.FromSeconds(30), ct);
            }
        }
    }

    public async Task<int> RunOnceAsync(CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<NacenTechDbContext>();
        var now = DateTimeOffset.UtcNow;
        var due = await db.ScheduledObligations
            .Where(o => o.State == ScheduledObligationStates.Scheduled && o.DueAt <= now)
            .OrderBy(o => o.DueAt)
            .Take(100)
            .ToListAsync(ct);
        if (due.Count == 0) return 0;

        var handlers = sp.GetServices<IScheduledObligationHandler>().ToDictionary(h => h.Kind);
        foreach (var o in due)
        {
            try
            {
                if (handlers.TryGetValue(o.Kind, out var h)) await h.HandleAsync(o.Id, o.CaseId, o.PayloadRef, ct);
                o.State = ScheduledObligationStates.Fired;
                o.FiredAt = now;
                o.Attempts++;
            }
            catch (Exception ex)
            {
                o.Attempts++;
                o.LastError = ex.Message;
                log.LogError(ex, "Obligation {Id} kind={Kind} failed", o.Id, o.Kind);
            }
        }
        await sp.GetRequiredService<IUnitOfWork>().CommitAsync(ct);
        return due.Count;
    }
}
