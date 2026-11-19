namespace NacenTech.Kernel.Domain;

/// <summary>Thực thể có định danh. Id là UUID v7 để sắp xếp theo thời gian trong PostgreSQL.</summary>
public abstract class Entity
{
    public Guid Id { get; protected set; } = Guid.CreateVersion7();
}

/// <summary>
/// Aggregate root. `Version` là concurrency token bắt buộc (§7.5, §22.1: If-Match).
/// Domain event được gom lại và chuyển vào outbox trong cùng transaction bởi IUnitOfWork (MOD-03).
/// </summary>
public abstract class AggregateRoot : Entity
{
    private readonly List<IDomainEvent> _events = [];

    public int Version { get; protected set; }

    public DateTimeOffset CreatedAt { get; protected set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset UpdatedAt { get; protected set; } = DateTimeOffset.UtcNow;

    /// <summary>Tham chiếu bản ghi legacy khi record được ETL từ NacenTwin (§30.3).</summary>
    public LegacyRef? Legacy { get; protected set; }

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _events.AsReadOnly();

    protected void Raise(IDomainEvent @event) => _events.Add(@event);

    public void ClearDomainEvents() => _events.Clear();

    protected void Touch() => UpdatedAt = DateTimeOffset.UtcNow;

    /// <summary>Chỉ dùng bởi ETL tool: gán legacy ref và timestamps gốc.</summary>
    public void ApplyLegacy(LegacyRef legacy, DateTimeOffset createdAt, DateTimeOffset updatedAt)
    {
        Legacy = legacy;
        CreatedAt = createdAt;
        UpdatedAt = updatedAt;
    }

    /// <summary>Chỉ dùng bởi ETL tool: giữ nguyên UUID legacy để portal không phải remap id.</summary>
    public void OverrideId(Guid id) => Id = id;
}
