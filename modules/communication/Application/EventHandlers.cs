using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NacenTech.Contracts.Events;
using NacenTech.Contracts.Jobs;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Communication.Application;

/// <summary>
/// Thay các lời gọi fire-and-forget của NestJS (`void this.notify...`) bằng handler chạy trên outbox at-least-once:
/// notification không còn mất khi tiến trình chết giữa chừng. Handler không commit — dispatcher commit.
/// </summary>
public sealed class MatchRoundCompletedHandler(DbContext db, ISubjectResolver subjects, IClock clock) : IIntegrationEventHandler<MatchRoundCompleted>
{
    public async Task HandleAsync(MatchRoundCompleted @event, CancellationToken ct)
    {
        if (@event.CandidateCount <= 0) return;
        var summary = await subjects.SummaryAsync(@event.Subject, ct);
        if (summary?.OwnerPersonId is not { } owner) return;

        var displayTitle = summary.DisplayTitle ?? summary.Title;
        var plural = @event.CandidateCount > 1 ? "s" : string.Empty;
        var ns = @event.Subject.Kind == SubjectKinds.DemandBrief ? "challenges" : "ips";

        NotificationService.Add(db, owner, NotificationTypes.MatchFound, new
        {
            message = $"System found {@event.CandidateCount} matching partner intake{plural} for your intake \"{displayTitle}\".",
            navigationPath = $"/{ns}/{@event.Subject.Id}?tab=matches",
            intakeId = @event.Subject.Id,
            intakeType = @event.Subject.Kind == SubjectKinds.DemandBrief ? "challenge" : "ip",
            intakeTitle = displayTitle,
            matchCount = @event.CandidateCount,
        }, clock.UtcNow);
    }
}

public sealed class InvitationEventsHandler(
    DbContext db,
    ISubjectResolver subjects,
    IPersonDirectory directory,
    IJobQueue jobs,
    IClock clock,
    IOptions<CommunicationOptions> options)
    : IIntegrationEventHandler<CaseInvitationCreated>,
      IIntegrationEventHandler<CaseInvitationAccepted>,
      IIntegrationEventHandler<CaseInvitationDeclined>
{
    private readonly CommunicationOptions _options = options.Value;

    public Task HandleAsync(CaseInvitationCreated e, CancellationToken ct)
        => NotifyAsync(e.InvitationId, e.RequesterSubject, e.TargetSubject, e.TargetPersonId, "received", ct);

    public Task HandleAsync(CaseInvitationAccepted e, CancellationToken ct)
        => NotifyAsync(e.InvitationId, e.RequesterSubject, e.TargetSubject, e.RequesterPersonId, "accepted", ct);

    public Task HandleAsync(CaseInvitationDeclined e, CancellationToken ct)
        => NotifyAsync(e.InvitationId, e.RequesterSubject, e.TargetSubject, e.RequesterPersonId, "rejected", ct);

    private async Task NotifyAsync(Guid invitationId, SubjectRef requesterSubject, SubjectRef targetSubject, Guid recipientPersonId, string type, CancellationToken ct)
    {
        var summaries = await subjects.SummariesAsync([requesterSubject, targetSubject], ct);
        var requesterTitle = Title(summaries, requesterSubject);
        var targetTitle = Title(summaries, targetSubject);

        var (notificationType, message, path) = type switch
        {
            "accepted" => (NotificationTypes.CollaborationRequestAccepted,
                $"Your collaboration request for \"{requesterTitle}\" has been accepted by \"{targetTitle}\".",
                "/my/collaboration-requests?tab=sent"),
            "rejected" => (NotificationTypes.CollaborationRequestRejected,
                $"Your collaboration request for \"{requesterTitle}\" was declined by \"{targetTitle}\".",
                "/my/collaboration-requests?tab=sent"),
            _ => (NotificationTypes.CollaborationRequestReceived,
                $"You received a collaboration request: \"{requesterTitle}\" wants to collaborate with \"{targetTitle}\".",
                "/my/collaboration-requests?tab=received"),
        };

        NotificationService.Add(db, recipientPersonId, notificationType, new
        {
            message,
            navigationPath = path,
            requestId = invitationId,
            requesterIntakeTitle = requesterTitle,
            targetIntakeTitle = targetTitle,
        }, clock.UtcNow);

        var recipient = await directory.GetAsync(recipientPersonId, ct);
        if (recipient is null) return;

        jobs.Enqueue(new SendMailJob(recipient.Email, MailTemplates.CollaborationRequest, new Dictionary<string, string>
        {
            ["type"] = type,
            ["recipientName"] = recipient.FirstName ?? recipient.Email,
            ["requesterIntakeTitle"] = requesterTitle,
            ["targetIntakeTitle"] = targetTitle,
            ["requestUrl"] = $"{_options.FrontendUrl.TrimEnd('/')}/collaboration-requests/{invitationId}",
            ["companyName"] = _options.CompanyName,
        }), dedupKey: $"collab-mail:{type}:{invitationId}");
    }

    private static string Title(IReadOnlyDictionary<SubjectRef, SubjectSummary> summaries, SubjectRef subject)
        => summaries.TryGetValue(subject, out var s) ? s.DisplayTitle ?? s.Title : string.Empty;
}

/// <summary>Mail vòng đời tài khoản. Token đi qua outbox và job, không nằm trong log.</summary>
public sealed class IdentityMailHandler(IJobQueue jobs, IOptions<CommunicationOptions> options)
    : IIntegrationEventHandler<PersonRegistered>,
      IIntegrationEventHandler<ActivationResent>,
      IIntegrationEventHandler<AccountActivated>,
      IIntegrationEventHandler<PasswordChanged>,
      IIntegrationEventHandler<PasswordResetRequested>
{
    private readonly CommunicationOptions _options = options.Value;

    public Task HandleAsync(PersonRegistered e, CancellationToken ct)
    {
        EnqueueActivation(e.PersonId, e.Email, e.FirstName, e.ActivationToken, "register");
        return Task.CompletedTask;
    }

    public Task HandleAsync(ActivationResent e, CancellationToken ct)
    {
        EnqueueActivation(e.PersonId, e.Email, e.FirstName, e.ActivationToken, "resend");
        return Task.CompletedTask;
    }

    public Task HandleAsync(AccountActivated e, CancellationToken ct)
    {
        jobs.Enqueue(new SendMailJob(e.Email, MailTemplates.Welcome, new Dictionary<string, string>
        {
            ["firstName"] = e.FirstName ?? e.Email,
            ["loginUrl"] = $"{_options.FrontendUrl.TrimEnd('/')}/login",
        }), dedupKey: $"welcome:{e.PersonId}");
        return Task.CompletedTask;
    }

    public Task HandleAsync(PasswordChanged e, CancellationToken ct)
    {
        jobs.Enqueue(new SendMailJob(e.Email, MailTemplates.PasswordChanged, new Dictionary<string, string>
        {
            ["firstName"] = e.FirstName ?? e.Email,
            ["email"] = e.Email,
            ["changedAt"] = FormatVietnamTime(e.OccurredAt),
            ["ipAddress"] = e.IpAddress ?? "Không xác định",
            ["userAgent"] = e.UserAgent ?? "Không xác định",
            ["supportLink"] = $"{_options.FrontendUrl.TrimEnd('/')}/contact",
            ["companyName"] = _options.CompanyName,
        }), dedupKey: $"password-changed:{e.EventId}");
        return Task.CompletedTask;
    }

    public Task HandleAsync(PasswordResetRequested e, CancellationToken ct)
    {
        jobs.Enqueue(new SendMailJob(e.Email, MailTemplates.ResetPassword, new Dictionary<string, string>
        {
            ["resetUrl"] = $"{_options.FrontendUrl.TrimEnd('/')}/reset-password?token={e.ResetToken}",
        }), dedupKey: $"reset-password:{e.EventId}");
        return Task.CompletedTask;
    }

    private void EnqueueActivation(Guid personId, string email, string? firstName, string token, string reason)
    {
        jobs.Enqueue(new SendMailJob(email, MailTemplates.AccountActivation, new Dictionary<string, string>
        {
            ["firstName"] = firstName ?? email,
            ["activationLink"] = $"{_options.FrontendUrl.TrimEnd('/')}{_options.ActivationPath}?token={token}",
        }), dedupKey: $"activation:{reason}:{personId}:{token[..8]}");
    }

    /// <summary>Legacy hiển thị theo giờ Việt Nam; id timezone khác nhau giữa Windows và Linux.</summary>
    internal static string FormatVietnamTime(DateTimeOffset value)
    {
        TimeZoneInfo tz;
        try { tz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh"); }
        catch (TimeZoneNotFoundException) { tz = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"); }
        var local = TimeZoneInfo.ConvertTime(value, tz);
        return local.ToString("dd/MM/yyyy HH:mm:ss");
    }
}
