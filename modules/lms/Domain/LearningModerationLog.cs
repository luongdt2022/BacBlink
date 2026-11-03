using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearningModerationLog : Entity
{
    private LearningModerationLog() { }

    public LearningModerationLog(
        Guid materialId,
        string action,
        Guid actorId,
        string actorName,
        string? reason = null,
        string? oldStatus = null,
        string? newStatus = null)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (string.IsNullOrWhiteSpace(action)) throw new ValidationException("action không được để trống");
        if (actorId == Guid.Empty) throw new ValidationException("actorId không được rỗng");
        if (string.IsNullOrWhiteSpace(actorName)) throw new ValidationException("actorName không được để trống");

        MaterialId = materialId;
        Action = action.Trim();
        ActorId = actorId;
        ActorName = actorName.Trim();
        Reason = reason?.Trim();
        OldStatus = oldStatus;
        NewStatus = newStatus;
        OccurredAt = DateTimeOffset.UtcNow;
    }

    public Guid MaterialId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string? Reason { get; private set; }
    public Guid ActorId { get; private set; }
    public string ActorName { get; private set; } = string.Empty;
    public string? OldStatus { get; private set; }
    public string? NewStatus { get; private set; }
    public DateTimeOffset OccurredAt { get; private set; } = DateTimeOffset.UtcNow;

    // Aliases
    public Guid ChangedByPersonId => ActorId;
    public DateTimeOffset ChangedAt => OccurredAt;
}
