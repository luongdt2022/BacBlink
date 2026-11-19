namespace NacenTech.Kernel.Domain;

/// <summary>
/// Domain event phát sinh trong aggregate. Mọi domain event đồng thời là integration event
/// (được serialize vào outbox) — giữ một khái niệm để không phải map hai lần.
/// </summary>
public interface IDomainEvent
{
    Guid EventId { get; }
    DateTimeOffset OccurredAt { get; }
}

public abstract record DomainEvent : IDomainEvent
{
    public Guid EventId { get; init; } = Guid.CreateVersion7();
    public DateTimeOffset OccurredAt { get; init; } = DateTimeOffset.UtcNow;
}
