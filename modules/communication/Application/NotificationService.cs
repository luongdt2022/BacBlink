using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Communication.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Communication.Application;

public sealed class NotificationService(DbContext db, IUnitOfWork uow, ICurrentActor actor, IAuthorizationGate gate, IClock clock) : INotificationService
{
    internal static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task<PagedResult<NotificationDto>> ListAsync(Guid? personId, bool? isRead, string? type, PageRequest page, CancellationToken ct)
    {
        if (personId is null)
        {
            gate.Require(new AuthorizationRequest(Actions.NotificationReadAny, actor.PlatformRole), "Notification", null);
        }
        else
        {
            RequireSelf(personId.Value, null);
        }

        var q = db.Set<Notification>().AsNoTracking().AsQueryable();
        if (personId is { } pid) q = q.Where(n => n.PersonId == pid);
        if (isRead is { } read) q = q.Where(n => n.IsRead == read);
        if (!string.IsNullOrEmpty(type)) q = q.Where(n => n.Type == type);

        var total = await q.CountAsync(ct);
        var data = await q.OrderByDescending(n => n.CreatedAt).Skip(page.Skip).Take(page.Limit).ToListAsync(ct);
        return new PagedResult<NotificationDto>(data.Select(ToDto).ToList(), total, page.Page, page.Limit);
    }

    public async Task<int> UnreadCountAsync(Guid personId, CancellationToken ct)
    {
        RequireSelf(personId, null);
        return await db.Set<Notification>().AsNoTracking().CountAsync(n => n.PersonId == personId && !n.IsRead, ct);
    }

    public async Task<NotificationDto> MarkReadAsync(Guid id, Guid personId, CancellationToken ct)
    {
        RequireSelf(personId, id);
        var n = await db.Set<Notification>().FirstOrDefaultAsync(x => x.Id == id && x.PersonId == personId, ct)
                ?? throw new NotFoundException($"Notification with ID {id} not found");
        n.MarkRead();
        await uow.CommitAsync(ct);
        return ToDto(n);
    }

    public async Task MarkAllReadAsync(Guid personId, CancellationToken ct)
    {
        RequireSelf(personId, null);
        await db.Set<Notification>().Where(n => n.PersonId == personId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);
        await uow.CommitAsync(ct);
    }

    public async Task DeleteAsync(Guid id, Guid personId, CancellationToken ct)
    {
        RequireSelf(personId, id);
        var n = await db.Set<Notification>().FirstOrDefaultAsync(x => x.Id == id && x.PersonId == personId, ct)
                ?? throw new NotFoundException($"Notification with ID {id} not found");
        db.Remove(n);
        await uow.CommitAsync(ct);
    }

    public async Task DeleteAllAsync(Guid personId, CancellationToken ct)
    {
        RequireSelf(personId, null);
        await db.Set<Notification>().Where(n => n.PersonId == personId).ExecuteDeleteAsync(ct);
        await uow.CommitAsync(ct);
    }

    public async Task CreateAsync(Guid personId, string type, object payload, CancellationToken ct)
    {
        Add(db, personId, type, payload, clock.UtcNow);
        await uow.CommitAsync(ct);
    }

    /// <summary>Dùng bởi event handler: thêm vào DbContext nhưng KHÔNG commit (dispatcher commit).</summary>
    internal static void Add(DbContext db, Guid personId, string type, object payload, DateTimeOffset now)
        => db.Add(new Notification(personId, type, JsonSerializer.Serialize(payload, Json), now));

    private void RequireSelf(Guid personId, Guid? objectId)
    {
        var relation = actor.PersonId == personId ? OrganizationRelations.Owner : OrganizationRelations.None;
        var action = relation == OrganizationRelations.Owner ? Actions.NotificationManageSelf : Actions.NotificationReadAny;
        gate.Require(new AuthorizationRequest(action, actor.PlatformRole, OrganizationRelation: relation), "Notification", objectId);
    }

    private static NotificationDto ToDto(Notification n)
        => new(n.Id, n.PersonId, n.Type, JsonDocument.Parse(n.Payload).RootElement.Clone(), n.IsRead, n.CreatedAt);
}
