using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Communication.Application;

public sealed record LegacyCollaborationRequestImport(
    Guid Id,
    SubjectRef RequesterSubject,
    SubjectRef TargetSubject,
    Guid RequesterPersonId,
    Guid TargetPersonId,
    string Status,        // pending|accepted|rejected|cancelled
    string? Message,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    LegacyRef Legacy);

public sealed record LegacyNotificationImport(
    Guid Id,
    Guid PersonId,
    string Type,
    string PayloadJson,
    bool IsRead,
    DateTimeOffset CreatedAt,
    LegacyRef Legacy);

public interface ICommunicationImporter
{
    Task ImportInvitationAsync(LegacyCollaborationRequestImport import, CancellationToken ct);
    Task ImportNotificationAsync(LegacyNotificationImport import, CancellationToken ct);
    Task<int> CountInvitationsAsync(CancellationToken ct);
    Task<int> CountNotificationsAsync(CancellationToken ct);
}
