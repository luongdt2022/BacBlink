using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Communication.Application;
using NacenTech.Modules.Communication.Domain;

namespace NacenTech.Modules.Communication.Infrastructure;

/// <summary>
/// ETL `collaboration_requests` và `notifications` (§30.1). Accepted không đồng nghĩa signed deal
/// hoặc exclusivity — chỉ chuyển đúng trạng thái đã có (§30.3).
/// </summary>
public sealed class CommunicationImporter(DbContext db, IUnitOfWork uow) : ICommunicationImporter
{
    public async Task ImportInvitationAsync(LegacyCollaborationRequestImport i, CancellationToken ct)
    {
        var status = i.Status.ToLowerInvariant() switch
        {
            "accepted" => InvitationStatuses.Accepted,
            "rejected" => InvitationStatuses.Declined,
            "cancelled" => InvitationStatuses.Cancelled,
            _ => InvitationStatuses.Pending,
        };

        var existing = await db.Set<CaseInvitation>().FirstOrDefaultAsync(x => x.Id == i.Id, ct);
        if (existing is null)
        {
            db.Add(CaseInvitation.Restore(i.Id, i.RequesterSubject, i.TargetSubject, i.RequesterPersonId, i.TargetPersonId,
                i.Message, status, i.CreatedAt, i.UpdatedAt, i.Legacy));
        }
        else
        {
            existing.ApplyImport(i.Message, status, i.UpdatedAt);
            existing.ApplyLegacy(i.Legacy, i.CreatedAt, i.UpdatedAt);
        }
        await uow.CommitAsync(ct);
    }

    public async Task ImportNotificationAsync(LegacyNotificationImport i, CancellationToken ct)
    {
        var existing = await db.Set<Notification>().FirstOrDefaultAsync(n => n.Id == i.Id, ct);
        if (existing is null)
        {
            var notification = new Notification(i.PersonId, i.Type, i.PayloadJson, i.CreatedAt);
            notification.OverrideIdentity(i.Id);
            notification.ApplyImport(i.Type, i.PayloadJson, i.IsRead);
            db.Add(notification);
        }
        else
        {
            existing.ApplyImport(i.Type, i.PayloadJson, i.IsRead);
        }
        await uow.CommitAsync(ct);
    }

    public Task<int> CountInvitationsAsync(CancellationToken ct) => db.Set<CaseInvitation>().AsNoTracking().CountAsync(ct);

    public Task<int> CountNotificationsAsync(CancellationToken ct) => db.Set<Notification>().AsNoTracking().CountAsync(ct);
}
