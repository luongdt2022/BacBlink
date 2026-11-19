using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Demand.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Demand.Application;

public sealed class DemandService(DbContext db, IUnitOfWork uow, ICurrentActor actor, IAuthorizationGate gate, IClock clock) : IDemandService
{
    public async Task<DemandBriefDto> CreateAsync(CreateDemandCommand command, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(command.Title)) throw new ValidationException("title should not be empty");
        var relation = command.OwnerPersonId is not null && command.OwnerPersonId == actor.PersonId
            ? OrganizationRelations.Owner : OrganizationRelations.None;
        gate.Require(new AuthorizationRequest(Actions.SubjectCreate, actor.PlatformRole, OrganizationRelation: relation), "DemandBrief", null);

        var brief = DemandBrief.Create(command, actor.PersonId, clock.UtcNow);
        db.Add(brief);
        await uow.CommitAsync(ct);
        return ToDto(brief);
    }

    /// <summary>Có gate: owner đọc bản của mình, người khác chỉ đọc khi đã published (hoặc là admin).</summary>
    public async Task<DemandBriefDto> GetAsync(Guid id, bool includeDeleted, CancellationToken ct)
    {
        var brief = await LoadAsync(id, includeDeleted, ct);
        var isOwner = brief.OwnerPersonId is not null && brief.OwnerPersonId == actor.PersonId;
        var action = isOwner ? Actions.SubjectReadOwn
            : brief.Status == DemandStatuses.Published ? Actions.SubjectReadPublic : Actions.SubjectReadAny;
        gate.Require(new AuthorizationRequest(action, actor.PlatformRole,
            OrganizationRelation: isOwner ? OrganizationRelations.Owner : OrganizationRelations.None), "DemandBrief", id);
        return ToDto(brief);
    }

    /// <summary>Không gate — caller (facade/service khác) quyết định hiển thị gì.</summary>
    public async Task<DemandBriefDto?> FindAsync(Guid id, bool includeDeleted, CancellationToken ct)
    {
        var brief = await Query(includeDeleted).AsNoTracking().FirstOrDefaultAsync(d => d.Id == id, ct);
        return brief is null ? null : ToDto(brief);
    }

    /// <summary>Không gate — dùng cho lookup nội bộ và projection.</summary>
    public async Task<IReadOnlyDictionary<Guid, DemandBriefDto>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return new Dictionary<Guid, DemandBriefDto>();
        var list = await Query(true).AsNoTracking().Where(d => ids.Contains(d.Id)).ToListAsync(ct);
        return list.ToDictionary(d => d.Id, ToDto);
    }

    /// <summary>Không gate — facade chọn query phù hợp với endpoint (public/mine/admin).</summary>
    public async Task<PagedResult<DemandBriefDto>> ListAsync(DemandQuery query, CancellationToken ct)
    {
        var q = Filter(query);
        var total = await q.CountAsync(ct);
        var data = await q.AsNoTracking().OrderByDescending(d => d.CreatedAt).Skip(query.Page.Skip).Take(query.Page.Limit).ToListAsync(ct);
        return new PagedResult<DemandBriefDto>(data.Select(ToDto).ToList(), total, query.Page.Page, query.Page.Limit);
    }

    public async Task<(int Draft, int Published)> CountByStatusAsync(DemandQuery query, CancellationToken ct)
    {
        var q = Filter(query with { Status = null, PublishedOnly = false });
        var draft = await q.CountAsync(d => d.Status == DemandStatuses.Draft, ct);
        var published = await q.CountAsync(d => d.Status == DemandStatuses.Published, ct);
        return (draft, published);
    }

    public async Task<DemandBriefDto> UpdateAsync(Guid id, UpdateDemandCommand command, CancellationToken ct)
    {
        var brief = await LoadAsync(id, false, ct);
        RequireWrite(brief, id, Actions.SubjectUpdate);
        brief.Update(command, actor.PersonId, clock.UtcNow);
        await uow.CommitAsync(ct);
        return ToDto(brief);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var brief = await LoadAsync(id, false, ct);
        RequireWrite(brief, id, Actions.SubjectDelete);
        brief.SoftDelete(clock.UtcNow);
        await uow.CommitAsync(ct);
    }

    public async Task SetAiResultAsync(Guid id, string aiTitle, string aiProcessedContent, CancellationToken ct)
    {
        var brief = await LoadAsync(id, true, ct);
        brief.SetAiResult(aiTitle, aiProcessedContent);
        await uow.CommitAsync(ct);
    }

    public async Task SetAiStatusAsync(Guid id, string? processingStatus, string? chunkingStatus, CancellationToken ct)
    {
        var brief = await LoadAsync(id, true, ct);
        brief.SetAiStatus(processingStatus, chunkingStatus);
        await uow.CommitAsync(ct);
    }

    private void RequireWrite(DemandBrief brief, Guid id, string action)
    {
        var isOwner = brief.OwnerPersonId is not null && brief.OwnerPersonId == actor.PersonId;
        gate.Require(new AuthorizationRequest(action, actor.PlatformRole,
            OrganizationRelation: isOwner ? OrganizationRelations.Owner : OrganizationRelations.None), "DemandBrief", id);
    }

    private IQueryable<DemandBrief> Query(bool includeDeleted)
    {
        var q = db.Set<DemandBrief>().AsQueryable();
        return includeDeleted ? q : q.Where(d => d.DeletedAt == null);
    }

    private IQueryable<DemandBrief> Filter(DemandQuery query)
    {
        var q = Query(query.IncludeDeleted);
        if (query.OwnerPersonId is { } owner) q = q.Where(d => d.OwnerPersonId == owner);
        if (query.ExcludeOwnerPersonId is { } exclude) q = q.Where(d => d.OwnerPersonId != exclude);
        if (query.PublishedOnly) q = q.Where(d => d.Status == DemandStatuses.Published);
        if (!string.IsNullOrEmpty(query.Status)) q = q.Where(d => d.Status == query.Status);
        if (query.SectorId is { } sector) q = q.Where(d => d.SectorIds.Contains(sector));
        if (query.CategoryId is { } category) q = q.Where(d => d.CategoryId == category);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            q = q.Where(d => d.Versions.Any(v => v.VersionNo == d.CurrentVersionNo &&
                (EF.Functions.ILike(v.Title, pattern) || (v.ProblemStatement != null && EF.Functions.ILike(v.ProblemStatement, pattern)))));
        }
        return q;
    }

    private async Task<DemandBrief> LoadAsync(Guid id, bool includeDeleted, CancellationToken ct)
        => await Query(includeDeleted).FirstOrDefaultAsync(d => d.Id == id, ct)
           ?? throw new NotFoundException($"Intake with ID {id} not found");

    internal static DemandBriefDto ToDto(DemandBrief d)
    {
        var current = d.Versions.OrderByDescending(v => v.VersionNo).First();
        return new DemandBriefDto(d.Id, d.OwnerPersonId, d.Status, d.CurrentVersionNo, current.Title, current.ProblemStatement,
            d.AiTitle, d.AiProcessedContent, d.AiProcessingStatus, d.AiChunkingStatus, d.SectorIds, d.CategoryId,
            d.CreatedAt, d.UpdatedAt, d.DeletedAt, d.Version);
    }
}
