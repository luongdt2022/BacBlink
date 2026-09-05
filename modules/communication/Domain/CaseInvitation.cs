using NacenTech.Contracts.Events;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Communication.Application;

namespace NacenTech.Modules.Communication.Domain;

/// <summary>
/// `collaboration_requests` → CaseInvitation (§30.1). AC 24: accept KHÔNG tự loại các lời mời khác;
/// exclusivity phải có DecisionRecord riêng, không suy diễn từ một lần accept.
/// </summary>
public sealed class CaseInvitation : AggregateRoot
{
    private CaseInvitation() { }

    private CaseInvitation(SubjectRef requester, SubjectRef target, Guid requesterPersonId, Guid targetPersonId, string? message, string status)
    {
        RequesterKind = requester.Kind;
        RequesterId = requester.Id;
        TargetKind = target.Kind;
        TargetId = target.Id;
        RequesterPersonId = requesterPersonId;
        TargetPersonId = targetPersonId;
        Message = message;
        Status = status;
    }

    public string RequesterKind { get; private set; } = string.Empty;
    public Guid RequesterId { get; private set; }
    public string TargetKind { get; private set; } = string.Empty;
    public Guid TargetId { get; private set; }
    public Guid RequesterPersonId { get; private set; }
    public Guid TargetPersonId { get; private set; }
    public string? Message { get; private set; }
    public string Status { get; private set; } = InvitationStatuses.Pending;
    public DateTimeOffset? RespondedAt { get; private set; }

    public SubjectRef RequesterSubject => new(RequesterKind, RequesterId);
    public SubjectRef TargetSubject => new(TargetKind, TargetId);

    public static CaseInvitation Create(SubjectRef requester, SubjectRef target, Guid requesterPersonId, Guid targetPersonId, string? message)
    {
        var invitation = new CaseInvitation(requester, target, requesterPersonId, targetPersonId, message, InvitationStatuses.Pending);
        invitation.Raise(new CaseInvitationCreated(invitation.Id, requester, target, requesterPersonId, targetPersonId));
        return invitation;
    }

    /// <summary>ETL: dựng lại trạng thái đã có, không phát event.</summary>
    public static CaseInvitation Restore(Guid id, SubjectRef requester, SubjectRef target, Guid requesterPersonId, Guid targetPersonId, string? message, string status, DateTimeOffset createdAt, DateTimeOffset updatedAt, LegacyRef legacy)
    {
        var invitation = new CaseInvitation(requester, target, requesterPersonId, targetPersonId, message, status);
        invitation.OverrideId(id);
        invitation.ApplyLegacy(legacy, createdAt, updatedAt);
        if (status != InvitationStatuses.Pending) invitation.RespondedAt = updatedAt;
        invitation.ClearDomainEvents();
        return invitation;
    }

    public void ApplyImport(string? message, string status, DateTimeOffset updatedAt)
    {
        Message = message;
        Status = status;
        RespondedAt = status == InvitationStatuses.Pending ? null : updatedAt;
        ClearDomainEvents();
    }

    public void Accept(DateTimeOffset now)
    {
        EnsurePending("accept");
        Status = InvitationStatuses.Accepted;
        RespondedAt = now;
        Touch();
        Raise(new CaseInvitationAccepted(Id, RequesterSubject, TargetSubject, RequesterPersonId, TargetPersonId));
    }

    public void Decline(DateTimeOffset now)
    {
        EnsurePending("reject");
        Status = InvitationStatuses.Declined;
        RespondedAt = now;
        Touch();
        Raise(new CaseInvitationDeclined(Id, RequesterSubject, TargetSubject, RequesterPersonId, TargetPersonId));
    }

    public void Cancel(DateTimeOffset now)
    {
        EnsurePending("cancel");
        Status = InvitationStatuses.Cancelled;
        RespondedAt = now;
        Touch();
    }

    private void EnsurePending(string verb)
    {
        if (Status != InvitationStatuses.Pending)
            throw new ValidationException($"Cannot {verb} a request with status \"{LegacyStatus(Status)}\"");
    }

    private static string LegacyStatus(string status) => status switch
    {
        InvitationStatuses.Accepted => "accepted",
        InvitationStatuses.Declined => "rejected",
        InvitationStatuses.Cancelled => "cancelled",
        _ => "pending",
    };
}

/// <summary>Projection thông báo trong ứng dụng. Nguồn sự thật là business event/outbox, không phải bảng này (§30.1).</summary>
public sealed class Notification : Entity
{
    private Notification() { }

    public Notification(Guid personId, string type, string payload, DateTimeOffset createdAt)
    {
        PersonId = personId;
        Type = type;
        Payload = payload;
        CreatedAt = createdAt;
    }

    public Guid PersonId { get; private set; }
    public string Type { get; private set; } = string.Empty;
    public string Payload { get; private set; } = "{}";
    public bool IsRead { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public void MarkRead() => IsRead = true;

    public void ApplyImport(string type, string payload, bool isRead)
    {
        Type = type;
        Payload = payload;
        IsRead = isRead;
    }

    public void OverrideIdentity(Guid id) => Id = id;
}
