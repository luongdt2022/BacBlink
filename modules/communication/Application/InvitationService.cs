using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Communication.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Communication.Application;

public sealed class InvitationService(
    DbContext db,
    IUnitOfWork uow,
    ICurrentActor actor,
    IAuthorizationGate gate,
    ISubjectResolver subjects,
    IClock clock) : IInvitationService
{
    public async Task<InvitationDto> CreateAsync(Guid requesterPersonId, SubjectRef requesterSubject, SubjectRef targetSubject, string? message, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.InvitationCreate, actor.PlatformRole), "CaseInvitation", null);

        var requester = await subjects.SummaryAsync(requesterSubject, ct) ?? throw new NotFoundException($"Intake {requesterSubject.Id} not found");
        var target = await subjects.SummaryAsync(targetSubject, ct) ?? throw new NotFoundException($"Intake {targetSubject.Id} not found");

        if (requester.OwnerPersonId != requesterPersonId)
            throw new ForbiddenException("You can only send collaboration requests from your own intakes");
        if (target.OwnerPersonId is null)
            throw new UnprocessableException("Target intake has no owner");
        if (requester.OwnerPersonId == target.OwnerPersonId)
            throw new ValidationException("You cannot send a collaboration request to your own intake");
        if (!requester.IsPublished)
            throw new ValidationException("Your intake must be published to send a collaboration request");
        if (!target.IsPublished)
            throw new ValidationException("The target intake must be published to receive a collaboration request");
        if (requesterSubject.Kind == targetSubject.Kind)
            throw new ValidationException("Collaboration requests must be between an IP intake and a Challenge intake");

        var duplicate = await db.Set<CaseInvitation>().AnyAsync(i => i.Status == InvitationStatuses.Pending &&
            ((i.RequesterKind == requesterSubject.Kind && i.RequesterId == requesterSubject.Id && i.TargetKind == targetSubject.Kind && i.TargetId == targetSubject.Id) ||
             (i.RequesterKind == targetSubject.Kind && i.RequesterId == targetSubject.Id && i.TargetKind == requesterSubject.Kind && i.TargetId == requesterSubject.Id)), ct);
        if (duplicate)
            throw new ValidationException("A pending collaboration request already exists between these two intakes");

        var invitation = CaseInvitation.Create(requesterSubject, targetSubject, requesterPersonId, target.OwnerPersonId.Value, message);
        db.Add(invitation);
        await uow.CommitAsync(ct);
        return ToDto(invitation);
    }

    public async Task<InvitationDto> AcceptAsync(Guid id, Guid personId, CancellationToken ct)
    {
        var invitation = await LoadAsync(id, ct);
        RequireTarget(invitation, personId, "You can only accept collaboration requests sent to you", id);
        invitation.Accept(clock.UtcNow);
        await uow.CommitAsync(ct);
        return ToDto(invitation);
    }

    public async Task<InvitationDto> DeclineAsync(Guid id, Guid personId, CancellationToken ct)
    {
        var invitation = await LoadAsync(id, ct);
        RequireTarget(invitation, personId, "You can only reject collaboration requests sent to you", id);
        invitation.Decline(clock.UtcNow);
        await uow.CommitAsync(ct);
        return ToDto(invitation);
    }

    public async Task CancelAsync(Guid id, Guid personId, CancellationToken ct)
    {
        var invitation = await LoadAsync(id, ct);
        if (invitation.RequesterPersonId != personId)
            throw new ForbiddenException("You can only cancel your own collaboration requests");
        gate.Require(new AuthorizationRequest(Actions.InvitationRespond, actor.PlatformRole, OrganizationRelation: OrganizationRelations.Owner), "CaseInvitation", id);
        invitation.Cancel(clock.UtcNow);
        await uow.CommitAsync(ct);
    }

    public async Task<InvitationDto> GetForParticipantAsync(Guid id, Guid personId, CancellationToken ct)
    {
        var invitation = await LoadAsync(id, ct);
        if (invitation.RequesterPersonId != personId && invitation.TargetPersonId != personId)
            throw new ForbiddenException("Access denied");
        gate.Require(new AuthorizationRequest(Actions.InvitationRead, actor.PlatformRole, OrganizationRelation: OrganizationRelations.Owner), "CaseInvitation", id);
        return ToDto(invitation);
    }

    public Task<PagedResult<InvitationDto>> ListSentAsync(Guid personId, PageRequest page, CancellationToken ct)
        => PageAsync(db.Set<CaseInvitation>().Where(i => i.RequesterPersonId == personId), page, ct);

    public Task<PagedResult<InvitationDto>> ListReceivedAsync(Guid personId, PageRequest page, CancellationToken ct)
        => PageAsync(db.Set<CaseInvitation>().Where(i => i.TargetPersonId == personId), page, ct);

    public Task<PagedResult<InvitationDto>> ListAllAsync(PageRequest page, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.InvitationReadAny, actor.PlatformRole), "CaseInvitation", null);
        return PageAsync(db.Set<CaseInvitation>(), page, ct);
    }

    public async Task<IReadOnlyList<InvitationDto>> ListForPersonAsync(Guid personId, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.InvitationReadAny, actor.PlatformRole), "CaseInvitation", null);
        var list = await db.Set<CaseInvitation>().AsNoTracking()
            .Where(i => i.RequesterPersonId == personId || i.TargetPersonId == personId)
            .OrderByDescending(i => i.CreatedAt).ToListAsync(ct);
        return list.Select(ToDto).ToList();
    }

    private async Task<PagedResult<InvitationDto>> PageAsync(IQueryable<CaseInvitation> q, PageRequest page, CancellationToken ct)
    {
        var total = await q.CountAsync(ct);
        var data = await q.AsNoTracking().OrderByDescending(i => i.CreatedAt).Skip(page.Skip).Take(page.Limit).ToListAsync(ct);
        return new PagedResult<InvitationDto>(data.Select(ToDto).ToList(), total, page.Page, page.Limit);
    }

    private void RequireTarget(CaseInvitation invitation, Guid personId, string message, Guid id)
    {
        if (invitation.TargetPersonId != personId) throw new ForbiddenException(message);
        gate.Require(new AuthorizationRequest(Actions.InvitationRespond, actor.PlatformRole, OrganizationRelation: OrganizationRelations.Owner), "CaseInvitation", id);
    }

    private async Task<CaseInvitation> LoadAsync(Guid id, CancellationToken ct)
        => await db.Set<CaseInvitation>().FirstOrDefaultAsync(i => i.Id == id, ct)
           ?? throw new NotFoundException($"Collaboration request {id} not found");

    internal static InvitationDto ToDto(CaseInvitation i)
        => new(i.Id, i.RequesterSubject, i.TargetSubject, i.RequesterPersonId, i.TargetPersonId, i.Status, i.Message, i.CreatedAt, i.UpdatedAt);
}
