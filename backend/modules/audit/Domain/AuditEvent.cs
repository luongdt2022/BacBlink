using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Audit.Domain;

/// <summary>
/// §21.4/§23.5: append-only, `ActorRef` là surrogate id (không PII). IP/device có retention riêng ngắn hơn
/// và bị cắt bởi job RETENTION_REVIEW mà không đụng vào event.
/// </summary>
public sealed class AuditEvent : Entity
{
    private AuditEvent() { }

    public AuditEvent(
        Guid? actorRef, string actorRole, string action, string objectKind, Guid? objectId, int? objectVersion,
        string? purpose, string outcome, string? ruleId, string correlationId, string? ipAddress, string? userAgent,
        string? details, DateTimeOffset occurredAt)
    {
        ActorRef = actorRef;
        ActorRole = actorRole;
        Action = action;
        ObjectKind = objectKind;
        ObjectId = objectId;
        ObjectVersion = objectVersion;
        Purpose = purpose;
        Outcome = outcome;
        RuleId = ruleId;
        CorrelationId = correlationId;
        IpAddress = ipAddress;
        UserAgent = userAgent;
        Details = details;
        OccurredAt = occurredAt;
    }

    public Guid? ActorRef { get; private set; }
    public string ActorRole { get; private set; } = string.Empty;
    public string Action { get; private set; } = string.Empty;
    public string ObjectKind { get; private set; } = string.Empty;
    public Guid? ObjectId { get; private set; }
    public int? ObjectVersion { get; private set; }
    public string? Purpose { get; private set; }
    public string Outcome { get; private set; } = string.Empty;
    public string? RuleId { get; private set; }
    public string CorrelationId { get; private set; } = string.Empty;
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public string? Details { get; private set; }
    public DateTimeOffset OccurredAt { get; private set; }
}
