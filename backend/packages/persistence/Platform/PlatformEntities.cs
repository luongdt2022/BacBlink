namespace NacenTech.Persistence.Platform;

/// <summary>Outbox transactional (§21.2). Vòng đời giây; worker phát tán at-least-once.</summary>
public sealed class OutboxMessage
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public required string Type { get; set; }
    public required string Payload { get; set; }
    public DateTimeOffset OccurredAt { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }
    public int Attempts { get; set; }
    public DateTimeOffset? LockedUntil { get; set; }
    public string? LastError { get; set; }
    public string? CorrelationId { get; set; }
}

/// <summary>Hàng đợi job trong PostgreSQL (D2-145). Enqueue cùng transaction với ghi dữ liệu.</summary>
public sealed class JobQueueEntry
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public required string Kind { get; set; }
    public required string Payload { get; set; }
    public DateTimeOffset EnqueuedAt { get; set; }
    public DateTimeOffset RunAfter { get; set; }
    public string? DedupKey { get; set; }
    public int Attempts { get; set; }
    public int MaxAttempts { get; set; } = 5;
    public DateTimeOffset? LockedUntil { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset? FailedAt { get; set; }
    public string? LastError { get; set; }
    public string? CorrelationId { get; set; }
}

/// <summary>Lịch dài hạn §26.5 — checkpoint 6/12/24 tháng, obligation due, hold SLA, key expiry, retention review.</summary>
public sealed class ScheduledObligation
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid? CaseId { get; set; }
    public required string Kind { get; set; }
    public DateTimeOffset DueAt { get; set; }
    public string TimezoneForDisplay { get; set; } = "Asia/Ho_Chi_Minh";
    public Guid? PayloadRef { get; set; }
    public string State { get; set; } = ScheduledObligationStates.Scheduled;
    public DateTimeOffset? FiredAt { get; set; }
    public DateTimeOffset? AcknowledgedAt { get; set; }
    public int Attempts { get; set; }
    public string? LastError { get; set; }
    public string? CancelReason { get; set; }
    public Guid? CancelledByActorRef { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public static class ScheduledObligationStates
{
    public const string Scheduled = "SCHEDULED";
    public const string Fired = "FIRED";
    public const string Acknowledged = "ACKNOWLEDGED";
    public const string Cancelled = "CANCELLED";
}

/// <summary>Idempotency-Key cho command ghi trên /api/v2 (§22.1): retry trả cùng response, không thực thi lại.</summary>
public sealed class IdempotencyRecord
{
    public required string Key { get; set; }
    public Guid? ActorRef { get; set; }
    public required string RequestHash { get; set; }
    public int StatusCode { get; set; }
    public string? ResponseBody { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
