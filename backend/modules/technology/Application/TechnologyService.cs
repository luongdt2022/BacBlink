using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Technology.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Technology.Application;

public sealed class TechnologyService(DbContext db, IUnitOfWork uow, ICurrentActor actor, IAuthorizationGate gate, IClock clock) : ITechnologyService
{
    public async Task<TechnologyAssetDto> CreateAsync(CreateTechnologyCommand command, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(command.Title)) throw new ValidationException("title should not be empty");
        var relation = command.OwnerPersonId is not null && command.OwnerPersonId == actor.PersonId
            ? OrganizationRelations.Owner : OrganizationRelations.None;
        gate.Require(new AuthorizationRequest(Actions.SubjectCreate, actor.PlatformRole, OrganizationRelation: relation), "TechnologyAsset", null);

        var asset = TechnologyAsset.Create(command, actor.PersonId, clock.UtcNow);
        db.Add(asset);
        await uow.CommitAsync(ct);
        return ToDto(asset);
    }

    public async Task<TechnologyAssetDto> GetAsync(Guid id, bool includeDeleted, CancellationToken ct)
    {
        var asset = await LoadAsync(id, includeDeleted, ct);
        var isOwner = asset.OwnerPersonId is not null && asset.OwnerPersonId == actor.PersonId;
        var action = isOwner ? Actions.SubjectReadOwn
            : asset.PublicationStatus == PublicationStatuses.Published ? Actions.SubjectReadPublic : Actions.SubjectReadAny;
        gate.Require(new AuthorizationRequest(action, actor.PlatformRole,
            OrganizationRelation: isOwner ? OrganizationRelations.Owner : OrganizationRelations.None), "TechnologyAsset", id);
        return ToDto(asset);
    }

    /// <summary>Không gate — caller quyết định hiển thị gì.</summary>
    public async Task<TechnologyAssetDto?> FindAsync(Guid id, bool includeDeleted, CancellationToken ct)
    {
        var asset = await Query(includeDeleted).AsNoTracking().FirstOrDefaultAsync(t => t.Id == id, ct);
        return asset is null ? null : ToDto(asset);
    }

    /// <summary>Không gate — lookup nội bộ.</summary>
    public async Task<IReadOnlyDictionary<Guid, TechnologyAssetDto>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return new Dictionary<Guid, TechnologyAssetDto>();
        var list = await Query(true).AsNoTracking().Where(t => ids.Contains(t.Id)).ToListAsync(ct);
        return list.ToDictionary(t => t.Id, ToDto);
    }

    /// <summary>Không gate — facade chọn query theo endpoint.</summary>
    public async Task<PagedResult<TechnologyAssetDto>> ListAsync(TechnologyQuery query, CancellationToken ct)
    {
        var q = Filter(query);
        var total = await q.CountAsync(ct);
        var data = await q.AsNoTracking().OrderByDescending(t => t.CreatedAt).Skip(query.Page.Skip).Take(query.Page.Limit).ToListAsync(ct);
        return new PagedResult<TechnologyAssetDto>(data.Select(ToDto).ToList(), total, query.Page.Page, query.Page.Limit);
    }

    public async Task<(int Draft, int Published)> CountByStatusAsync(TechnologyQuery query, CancellationToken ct)
    {
        var q = Filter(query with { PublicationStatus = null, PublishedOnly = false });
        var draft = await q.CountAsync(t => t.PublicationStatus == PublicationStatuses.Draft, ct);
        var published = await q.CountAsync(t => t.PublicationStatus == PublicationStatuses.Published, ct);
        return (draft, published);
    }

    public async Task<TechnologyAssetDto> UpdateAsync(Guid id, UpdateTechnologyCommand command, CancellationToken ct)
    {
        var asset = await LoadAsync(id, false, ct);
        RequireWrite(asset, id, Actions.SubjectUpdate);
        asset.Update(command, actor.PersonId, clock.UtcNow);
        await uow.CommitAsync(ct);
        return ToDto(asset);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var asset = await LoadAsync(id, false, ct);
        RequireWrite(asset, id, Actions.SubjectDelete);
        asset.SoftDelete(clock.UtcNow);
        await uow.CommitAsync(ct);
    }

    public async Task SetAiResultAsync(Guid id, string aiTitle, string aiProcessedContent, CancellationToken ct)
    {
        var asset = await LoadAsync(id, true, ct);
        asset.SetAiResult(aiTitle, aiProcessedContent);
        await uow.CommitAsync(ct);
    }

    public async Task SetAiStatusAsync(Guid id, string? processingStatus, string? chunkingStatus, CancellationToken ct)
    {
        var asset = await LoadAsync(id, true, ct);
        asset.SetAiStatus(processingStatus, chunkingStatus);
        await uow.CommitAsync(ct);
    }

    private void RequireWrite(TechnologyAsset asset, Guid id, string action)
    {
        var isOwner = asset.OwnerPersonId is not null && asset.OwnerPersonId == actor.PersonId;
        gate.Require(new AuthorizationRequest(action, actor.PlatformRole,
            OrganizationRelation: isOwner ? OrganizationRelations.Owner : OrganizationRelations.None), "TechnologyAsset", id);
    }

    private IQueryable<TechnologyAsset> Query(bool includeDeleted)
    {
        var q = db.Set<TechnologyAsset>().AsQueryable();
        return includeDeleted ? q : q.Where(t => t.DeletedAt == null);
    }

    private IQueryable<TechnologyAsset> Filter(TechnologyQuery query)
    {
        var q = Query(query.IncludeDeleted);
        if (query.OwnerPersonId is { } owner) q = q.Where(t => t.OwnerPersonId == owner);
        if (query.ExcludeOwnerPersonId is { } exclude) q = q.Where(t => t.OwnerPersonId != exclude);
        if (query.PublishedOnly) q = q.Where(t => t.PublicationStatus == PublicationStatuses.Published);
        if (!string.IsNullOrEmpty(query.PublicationStatus)) q = q.Where(t => t.PublicationStatus == query.PublicationStatus);
        if (query.SectorId is { } sector) q = q.Where(t => t.SectorIds.Contains(sector));
        if (query.CategoryId is { } category) q = q.Where(t => t.CategoryId == category);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            q = q.Where(t => t.Versions.Any(v => v.VersionNo == t.CurrentVersionNo &&
                (EF.Functions.ILike(v.Title, pattern) || (v.Description != null && EF.Functions.ILike(v.Description, pattern)))));
        }
        return q;
    }

    private async Task<TechnologyAsset> LoadAsync(Guid id, bool includeDeleted, CancellationToken ct)
        => await Query(includeDeleted).FirstOrDefaultAsync(t => t.Id == id, ct)
           ?? throw new NotFoundException($"Intake with ID {id} not found");

    internal static TechnologyAssetDto ToDto(TechnologyAsset t)
    {
        var current = t.Versions.OrderByDescending(v => v.VersionNo).First();
        return new TechnologyAssetDto(t.Id, t.OwnerPersonId, t.PublicationStatus, t.QualityLevel, t.CurrentVersionNo,
            current.Title, current.Description, t.AiTitle, t.AiProcessedContent, t.AiProcessingStatus, t.AiChunkingStatus,
            t.SectorIds, t.CategoryId, t.CreatedAt, t.UpdatedAt, t.DeletedAt, t.Version);
    }
}
