using NacenTech.Kernel.Domain;

namespace NacenTech.Contracts.Events;

public sealed record CaseInvitationCreated(
    Guid InvitationId,
    SubjectRef RequesterSubject,
    SubjectRef TargetSubject,
    Guid RequesterPersonId,
    Guid TargetPersonId) : DomainEvent;

public sealed record CaseInvitationAccepted(
    Guid InvitationId,
    SubjectRef RequesterSubject,
    SubjectRef TargetSubject,
    Guid RequesterPersonId,
    Guid TargetPersonId) : DomainEvent;

public sealed record CaseInvitationDeclined(
    Guid InvitationId,
    SubjectRef RequesterSubject,
    SubjectRef TargetSubject,
    Guid RequesterPersonId,
    Guid TargetPersonId) : DomainEvent;
