using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Identity.Domain;

/// <summary>
/// TASK-07: Nhật ký kiểm toán thẩm định và phê duyệt bất biến (Append-only Audit Log) đạt chuẩn ATTT Cấp độ 3.
/// </summary>
public sealed class ApprovalAuditLog : Entity
{
    private ApprovalAuditLog() { }

    public ApprovalAuditLog(
        Guid actorId,
        string actorRole,
        string action,
        string targetEntity,
        string targetId,
        string ipAddress,
        string? detailsJson = null)
    {
        ActorId = actorId;
        ActorRole = actorRole;
        Action = action;
        TargetEntity = targetEntity;
        TargetId = targetId;
        IpAddress = string.IsNullOrWhiteSpace(ipAddress) ? "127.0.0.1" : ipAddress;
        DetailsJson = detailsJson;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid ActorId { get; private set; }
    public string ActorRole { get; private set; } = string.Empty;
    public string Action { get; private set; } = string.Empty;
    public string TargetEntity { get; private set; } = string.Empty;
    public string TargetId { get; private set; } = string.Empty;
    public string IpAddress { get; private set; } = string.Empty;
    public string? DetailsJson { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
}
