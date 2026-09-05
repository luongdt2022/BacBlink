using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NacenTech.Kernel.Application;
using Npgsql;

namespace NacenTech.Persistence.Workers;

/// <summary>Worker job queue PostgreSQL (D2-145), thay ba queue BullMQ (`ai`, `intakes`, `mail`).</summary>
public sealed class JobQueueWorker(IServiceScopeFactory scopes, TypeCatalog catalog, ILogger<JobQueueWorker> log) : BackgroundService
{
    private static readonly TimeSpan Idle = TimeSpan.FromSeconds(1);

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                var n = await RunOnceAsync(ct);
                if (n == 0) await Task.Delay(Idle, ct);
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested) { }
            catch (Exception ex)
            {
                log.LogError(ex, "Job queue loop error");
                await Task.Delay(TimeSpan.FromSeconds(5), ct);
            }
        }
    }

    public async Task<int> RunOnceAsync(CancellationToken ct)
    {
        List<Claimed> claimed;
        using (var scope = scopes.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            claimed = await ClaimAsync(db, ct);
        }
        foreach (var job in claimed) await ProcessAsync(job, ct);
        return claimed.Count;
    }

    private static async Task<List<Claimed>> ClaimAsync(NacenTechDbContext db, CancellationToken ct)
    {
        const string sql = """
            UPDATE platform.job_queue j
               SET locked_until = now() + interval '10 minutes', attempts = j.attempts + 1
             WHERE j.id IN (
                   SELECT id FROM platform.job_queue
                    WHERE completed_at IS NULL AND failed_at IS NULL AND run_after <= now()
                      AND (locked_until IS NULL OR locked_until < now())
                    ORDER BY run_after
                    LIMIT 10
                    FOR UPDATE SKIP LOCKED)
            RETURNING j.id, j.kind, j.payload;
            """;
        var conn = (NpgsqlConnection)db.Database.GetDbConnection();
        if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(ct);
        await using var cmd = new NpgsqlCommand(sql, conn);
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        var list = new List<Claimed>();
        while (await reader.ReadAsync(ct)) list.Add(new Claimed(reader.GetGuid(0), reader.GetString(1), reader.GetString(2)));
        return list;
    }

    private async Task ProcessAsync(Claimed job, CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<NacenTechDbContext>();
        var row = await db.JobQueue.SingleAsync(x => x.Id == job.Id, ct);
        try
        {
            var type = catalog.Resolve(job.Kind) ?? throw new InvalidOperationException($"Unknown job kind {job.Kind}");
            var payload = (IJob)JsonSerializer.Deserialize(job.Payload, type, EfUnitOfWork.Json)!;
            var handlerType = typeof(IJobHandler<>).MakeGenericType(type);
            var handler = sp.GetService(handlerType) ?? throw new InvalidOperationException($"No handler for job {job.Kind}");
            var method = handlerType.GetMethod(nameof(IJobHandler<IJob>.HandleAsync))!;
            await (Task)method.Invoke(handler, [payload, ct])!;
            await sp.GetRequiredService<IUnitOfWork>().CommitAsync(ct);
            row.CompletedAt = DateTimeOffset.UtcNow;
            row.LockedUntil = null;
            row.LastError = null;
            await db.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Job {Kind} id={Id} failed attempt={Attempts}", job.Kind, job.Id, row.Attempts);
            db.ChangeTracker.Clear();
            var retry = await db.JobQueue.SingleAsync(x => x.Id == job.Id, ct);
            retry.LastError = ex.ToString()[..Math.Min(4000, ex.ToString().Length)];
            if (retry.Attempts >= retry.MaxAttempts)
            {
                retry.FailedAt = DateTimeOffset.UtcNow;
            }
            else
            {
                retry.LockedUntil = null;
                retry.RunAfter = DateTimeOffset.UtcNow.AddSeconds(Math.Min(900, 5 * Math.Pow(2, retry.Attempts)));
            }
            await db.SaveChangesAsync(ct);
        }
    }

    private sealed record Claimed(Guid Id, string Kind, string Payload);
}
