using System.Text.Json;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Communication.Application;

/// <summary>
/// Communication §9.5: CaseInvitation (từ collaboration_requests) và Notification projection.
/// KEEP_WITH_CHANGE so với NestJS: accept KHÔNG auto-reject các request pending khác (AC 24) và không tạo case.
/// </summary>
public sealed class CommunicationOptions
{
    public const string Section = "Communication";
    public string FrontendUrl { get; set; } = "http://localhost:5173";
    public string ActivationPath { get; set; } = "/activate-account";
    public string CompanyName { get; set; } = "NacenTech";
}

public static class InvitationStatuses
{
    public const string Pending = "PENDING";
    public const string Accepted = "ACCEPTED";
    public const string Declined = "DECLINED";
    public const string Cancelled = "CANCELLED";
}

public static class NotificationTypes
{
    public const string MatchFound = "match_found";
    public const string CollaborationRequestReceived = "collaboration_request_received";
    public const string CollaborationRequestAccepted = "collaboration_request_accepted";
    public const string CollaborationRequestRejected = "collaboration_request_rejected";
    public const string ExpertConsultationRequestReceived = "expert_consultation_request_received";
    public const string ExpertConsultationResponded = "expert_consultation_responded";
    public const string ExpertConsultationCompleted = "expert_consultation_completed";
    public const string ExpertConsultationReviewed = "expert_consultation_reviewed";
    public const string ExpertCompletenessReminder = "expert_completeness_reminder";
    /// <summary>CR-BACLINK-008: nhắc gia hạn hội viên trước 30 ngày / khi hết hạn.</summary>
    public const string MembershipExpiring = "membership_expiring";
}

public sealed record InvitationDto(
    Guid Id,
    SubjectRef RequesterSubject,
    SubjectRef TargetSubject,
    Guid RequesterPersonId,
    Guid TargetPersonId,
    string Status,
    string? Message,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public interface IInvitationService
{
    /// <summary>
    /// Kiểm: requester sở hữu requesterSubject (403); không tự mời chính mình (400); cả hai published (400);
    /// hai subject khác kind DEMAND↔TECHNOLOGY (400); không trùng pending hai chiều (400).
    /// </summary>
    Task<InvitationDto> CreateAsync(Guid requesterPersonId, SubjectRef requesterSubject, SubjectRef targetSubject, string? message, CancellationToken ct);
    Task<InvitationDto> AcceptAsync(Guid id, Guid personId, CancellationToken ct);
    Task<InvitationDto> DeclineAsync(Guid id, Guid personId, CancellationToken ct);
    Task CancelAsync(Guid id, Guid personId, CancellationToken ct);
    Task<InvitationDto> GetForParticipantAsync(Guid id, Guid personId, CancellationToken ct);
    Task<PagedResult<InvitationDto>> ListSentAsync(Guid personId, PageRequest page, CancellationToken ct);
    Task<PagedResult<InvitationDto>> ListReceivedAsync(Guid personId, PageRequest page, CancellationToken ct);
    Task<PagedResult<InvitationDto>> ListAllAsync(PageRequest page, CancellationToken ct);
    Task<IReadOnlyList<InvitationDto>> ListForPersonAsync(Guid personId, CancellationToken ct);
}

public sealed record NotificationDto(Guid Id, Guid PersonId, string Type, JsonElement Payload, bool IsRead, DateTimeOffset CreatedAt);

public interface INotificationService
{
    Task<PagedResult<NotificationDto>> ListAsync(Guid? personId, bool? isRead, string? type, PageRequest page, CancellationToken ct);
    Task<int> UnreadCountAsync(Guid personId, CancellationToken ct);
    Task<NotificationDto> MarkReadAsync(Guid id, Guid personId, CancellationToken ct);
    Task MarkAllReadAsync(Guid personId, CancellationToken ct);
    Task DeleteAsync(Guid id, Guid personId, CancellationToken ct);
    Task DeleteAllAsync(Guid personId, CancellationToken ct);
    Task CreateAsync(Guid personId, string type, object payload, CancellationToken ct);
}
