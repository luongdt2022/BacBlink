using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using Npgsql;

namespace NacenTech.Persistence.Workers;

/// <summary>
/// Phát tán outbox at-least-once. Claim bằng FOR UPDATE SKIP LOCKED để nhiều worker chạy song song.
/// Mỗi event xử lý trong scope riêng; handler ghi dữ liệu qua UnitOfWork của scope đó.
/// Consumer idempotent theo eventId (§21.2).
/// </summary>
public sealed class OutboxDispatcher(IServiceScopeFactory scopes, TypeCatalog catalog, ILogger<OutboxDispatcher> log) : BackgroundService
{
    private static readonly TimeSpan Idle = TimeSpan.FromMilliseconds(750);

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                var processed = await RunOnceAsync(ct);
                if (processed == 0) await Task.Delay(Idle, ct);
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested) { }
            catch (Exception ex)
            {
                log.LogError(ex, "Outbox dispatcher loop error");
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
        foreach (var msg in claimed)
        {
            await ProcessAsync(msg, ct);
        }
        return claimed.Count;
    }

    private static async Task<List<Claimed>> ClaimAsync(NacenTechDbContext db, CancellationToken ct)
    {
        const string sql = """
            UPDATE platform.outbox_messages o
               SET locked_until = now() + interval '60 seconds', attempts = o.attempts + 1
             WHERE o.id IN (
                   SELECT id FROM platform.outbox_messages
                    WHERE processed_at IS NULL AND (locked_until IS NULL OR locked_until < now()) AND attempts < 20
                    ORDER BY occurred_at
                    LIMIT 50
                    FOR UPDATE SKIP LOCKED)
            RETURNING o.id, o.type, o.payload, o.correlation_id;
            """;
        var conn = (NpgsqlConnection)db.Database.GetDbConnection();
        if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(ct);
        await using var cmd = new NpgsqlCommand(sql, conn);
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        var list = new List<Claimed>();
        while (await reader.ReadAsync(ct))
        {
            list.Add(new Claimed(reader.GetGuid(0), reader.GetString(1), reader.GetString(2), reader.IsDBNull(3) ? null : reader.GetString(3)));
        }
        return list;
    }

    private async Task ProcessAsync(Claimed msg, CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<NacenTechDbContext>();
        var correlation = sp.GetRequiredService<ICurrentActor>() as SystemActor;
        var row = await db.OutboxMessages.SingleAsync(x => x.Id == msg.Id, ct);
        try
        {
            var type = catalog.Resolve(msg.Type);
            if (type is null)
            {
                row.LastError = $"Unknown event type {msg.Type}";
                row.ProcessedAt = DateTimeOffset.UtcNow; // không thể xử lý được — đánh dấu để không kẹt queue, có log
                log.LogError("Outbox: unknown event type {Type} id={Id}", msg.Type, msg.Id);
                await db.SaveChangesAsync(ct);
                return;
            }
            var evt = (IDomainEvent)JsonSerializer.Deserialize(msg.Payload, type, EfUnitOfWork.Json)!;
            var handlerType = typeof(IIntegrationEventHandler<>).MakeGenericType(type);
            var handlers = sp.GetServices(handlerType).Where(h => h is not null).ToList();
            foreach (var handler in handlers)
            {
                var method = handlerType.GetMethod(nameof(IIntegrationEventHandler<IDomainEvent>.HandleAsync))!;
                await (Task)method.Invoke(handler, [evt, ct])!;
            }
            await sp.GetRequiredService<IUnitOfWork>().CommitAsync(ct);
            row.ProcessedAt = DateTimeOffset.UtcNow;
            row.LockedUntil = null;
            row.LastError = null;
            await db.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Outbox handler failed for {Type} id={Id} attempt={Attempts}", msg.Type, msg.Id, row.Attempts);
            db.ChangeTracker.Clear();
            var retryRow = await db.OutboxMessages.SingleAsync(x => x.Id == msg.Id, ct);
            retryRow.LastError = ex.ToString()[..Math.Min(4000, ex.ToString().Length)];
            retryRow.LockedUntil = DateTimeOffset.UtcNow.Add(Backoff(retryRow.Attempts));
            await db.SaveChangesAsync(ct);
        }
    }

    private static TimeSpan Backoff(int attempts) => TimeSpan.FromSeconds(Math.Min(600, Math.Pow(2, Math.Min(attempts, 10)) * 2));

    private sealed record Claimed(Guid Id, string Type, string Payload, string? CorrelationId);
}
