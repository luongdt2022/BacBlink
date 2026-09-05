using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Persistence.Platform;
using Npgsql;

namespace NacenTech.Persistence;

/// <summary>
/// MOD-01: một CommitAsync = một transaction. Domain event của aggregate → outbox trong cùng SaveChanges.
/// Version của aggregate bị sửa tăng 1; EF dùng Version gốc trong WHERE nên hai transition đồng thời chỉ một thắng (AC 34).
/// </summary>
public sealed class EfUnitOfWork(NacenTechDbContext db, ICurrentActor actor, IClock clock) : IUnitOfWork, IOutbox, IJobQueue
{
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private readonly List<JobQueueEntry> _pendingJobs = [];

    public async Task CommitAsync(CancellationToken ct = default)
    {
        BumpVersions();
        DrainDomainEvents();

        // `EnableRetryOnFailure` không cho phép transaction do người dùng mở nếu không chạy qua execution
        // strategy — cả khối phải là một đơn vị retry được, nếu không MOD-01 sẽ vỡ ở lần mất kết nối đầu tiên.
        var strategy = db.Database.CreateExecutionStrategy();
        try
        {
            await strategy.ExecuteAsync(async token =>
            {
                var ownsTransaction = db.Database.CurrentTransaction is null;
                var transaction = ownsTransaction ? await db.Database.BeginTransactionAsync(token) : null;
                try
                {
                    await db.SaveChangesAsync(token);
                    await InsertPendingJobsAsync(token);
                    if (transaction is not null) await transaction.CommitAsync(token);
                }
                catch
                {
                    if (transaction is not null) await transaction.RollbackAsync(token);
                    throw;
                }
                finally
                {
                    if (transaction is not null) await transaction.DisposeAsync();
                }
            }, ct);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            throw await TranslateConcurrencyAsync(ex, ct);
        }
    }

    /// <summary>
    /// ADR-0003: "0 hàng bị ảnh hưởng" có hai nguyên nhân rất khác nhau. Lệch phiên bản thật là xung đột đồng
    /// thời và người dùng phải tải lại. Hàng không tồn tại là lỗi lập trình — ánh xạ sai khiến EF phát `UPDATE`
    /// cho một hàng lẽ ra phải `INSERT` — và phải nổi lên đúng như vậy thay vì nguỵ trang thành xung đột.
    /// Chính việc nguỵ trang đó đã che B-32 suốt đợt: thông điệp bảo tải lại và thử lại, việc không bao giờ giúp.
    /// </summary>
    private async Task<Exception> TranslateConcurrencyAsync(DbUpdateConcurrencyException ex, CancellationToken ct)
    {
        var currentVersion = -1;

        foreach (var entry in ex.Entries)
        {
            PropertyValues? databaseValues;
            try
            {
                databaseValues = await entry.GetDatabaseValuesAsync(ct);
            }
            catch
            {
                // Không đọc lại được thì không kết luận được; giữ nguyên cách hiểu cũ.
                return Conflict(currentVersion);
            }

            if (databaseValues is null)
            {
                var key = entry.Metadata.FindPrimaryKey()?.Properties.Select(p => entry.Property(p.Name).CurrentValue);
                return new InvalidOperationException(
                    $"Ánh xạ sai: EF phát UPDATE cho {entry.Metadata.DisplayName()} id={string.Join(",", key ?? [])} " +
                    "nhưng hàng đó không tồn tại. Khoá do ứng dụng sinh phải khai ValueGeneratedNever (ADR-0003).",
                    ex);
            }

            if (entry.Entity is AggregateRoot && databaseValues[nameof(AggregateRoot.Version)] is int dbVersion)
            {
                currentVersion = dbVersion;
            }
        }

        return Conflict(currentVersion);

        static ConcurrencyException Conflict(int version) =>
            new("Bản ghi đã bị thay đổi bởi một yêu cầu khác. Tải lại và thử lại.", version);
    }

    public void Enqueue(IDomainEvent @event) => db.OutboxMessages.Add(ToMessage(@event));

    /// <summary>
    /// Job được gom lại và insert ở CommitAsync bằng `ON CONFLICT DO NOTHING`: hai event cùng yêu cầu
    /// một việc (ví dụ `SubjectContentChanged` và `SubjectPublished` cùng cần chunk-embed) là chuyện bình thường,
    /// không phải lỗi — trùng `dedupKey` phải bị bỏ qua im lặng thay vì làm hỏng cả transaction.
    /// </summary>
    public void Enqueue<TJob>(TJob job, DateTimeOffset? runAfter = null, string? dedupKey = null) where TJob : IJob
    {
        // Trùng trong cùng một transaction thì bỏ ngay, khỏi cần tới database.
        if (dedupKey is not null && _pendingJobs.Any(j => j.DedupKey == dedupKey)) return;

        _pendingJobs.Add(new JobQueueEntry
        {
            Kind = TypeNames.Of(typeof(TJob)),
            Payload = JsonSerializer.Serialize(job, job.GetType(), Json),
            EnqueuedAt = clock.UtcNow,
            RunAfter = runAfter ?? clock.UtcNow,
            DedupKey = dedupKey,
            CorrelationId = actor.CorrelationId,
        });
    }

    private async Task InsertPendingJobsAsync(CancellationToken ct)
    {
        if (_pendingJobs.Count == 0) return;

        const string sql = """
            INSERT INTO platform.job_queue
                (id, kind, payload, enqueued_at, run_after, dedup_key, attempts, max_attempts, correlation_id)
            VALUES (@id, @kind, CAST(@payload AS jsonb), @enqueued_at, @run_after, @dedup_key, 0, @max_attempts, @correlation_id)
            ON CONFLICT (dedup_key) WHERE dedup_key IS NOT NULL AND completed_at IS NULL AND failed_at IS NULL
            DO NOTHING;
            """;

        foreach (var job in _pendingJobs)
        {
            await db.Database.ExecuteSqlRawAsync(sql,
                [
                    new NpgsqlParameter("id", NpgsqlTypes.NpgsqlDbType.Uuid) { Value = job.Id },
                    new NpgsqlParameter("kind", NpgsqlTypes.NpgsqlDbType.Varchar) { Value = job.Kind },
                    new NpgsqlParameter("payload", NpgsqlTypes.NpgsqlDbType.Text) { Value = job.Payload },
                    new NpgsqlParameter("enqueued_at", NpgsqlTypes.NpgsqlDbType.TimestampTz) { Value = job.EnqueuedAt },
                    new NpgsqlParameter("run_after", NpgsqlTypes.NpgsqlDbType.TimestampTz) { Value = job.RunAfter },
                    new NpgsqlParameter("dedup_key", NpgsqlTypes.NpgsqlDbType.Varchar) { Value = (object?)job.DedupKey ?? DBNull.Value },
                    new NpgsqlParameter("max_attempts", NpgsqlTypes.NpgsqlDbType.Integer) { Value = job.MaxAttempts },
                    new NpgsqlParameter("correlation_id", NpgsqlTypes.NpgsqlDbType.Varchar) { Value = (object?)job.CorrelationId ?? DBNull.Value },
                ],
                ct);
        }
        _pendingJobs.Clear();
    }

    private void BumpVersions()
    {
        foreach (var entry in db.ChangeTracker.Entries<AggregateRoot>())
        {
            if (entry.State is EntityState.Modified || HasOwnedOrCollectionChanges(entry))
            {
                var prop = entry.Property(nameof(AggregateRoot.Version));
                prop.CurrentValue = (int)(prop.OriginalValue ?? 0) + 1;
                entry.Property(nameof(AggregateRoot.UpdatedAt)).CurrentValue = clock.UtcNow;
            }
        }
    }

    private static bool HasOwnedOrCollectionChanges(EntityEntry<AggregateRoot> entry)
    {
        // Sửa collection con (attachments, sectors) cũng phải bump version của aggregate.
        return entry.State == EntityState.Unchanged && entry.Navigations.Any(n => n is CollectionEntry c && c.IsModified);
    }

    private void DrainDomainEvents()
    {
        var aggregates = db.ChangeTracker.Entries<AggregateRoot>().Select(e => e.Entity).Where(a => a.DomainEvents.Count > 0).ToList();
        foreach (var aggregate in aggregates)
        {
            foreach (var evt in aggregate.DomainEvents) db.OutboxMessages.Add(ToMessage(evt));
            aggregate.ClearDomainEvents();
        }
    }

    private OutboxMessage ToMessage(IDomainEvent evt) => new()
    {
        Type = TypeNames.Of(evt.GetType()),
        Payload = JsonSerializer.Serialize(evt, evt.GetType(), Json),
        OccurredAt = evt.OccurredAt,
        CorrelationId = actor.CorrelationId,
    };
}

/// <summary>Tên kiểu ổn định cho outbox/job (namespace + tên, không kèm version assembly).</summary>
public static class TypeNames
{
    public static string Of(Type t) => t.FullName ?? t.Name;
}
