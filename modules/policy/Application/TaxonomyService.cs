using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Policy.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Policy.Application;

public sealed class TaxonomyService(DbContext db, IUnitOfWork uow, ICurrentActor actor, IAuthorizationGate gate)
    : ITaxonomyService, ITaxonomyNameResolver
{
    private IQueryable<TaxonomyTerm> Terms => db.Set<TaxonomyTerm>();

    public async Task<IReadOnlyList<TaxonomyTermDto>> ListAsync(string kind, bool activeOnly, CancellationToken ct)
    {
        var q = Terms.AsNoTracking().Where(t => t.Kind == kind);
        if (activeOnly) q = q.Where(t => t.IsActive);
        return await q.OrderBy(t => t.Code != null ? t.Code : t.Name)
            .Select(t => new TaxonomyTermDto(t.Id, t.Kind, t.Name, t.IsActive, t.Code, t.MetadataJson)).ToListAsync(ct);
    }

    public async Task<TaxonomyTermDto?> FindAsync(Guid id, CancellationToken ct)
        => await Terms.AsNoTracking().Where(t => t.Id == id)
            .Select(t => new TaxonomyTermDto(t.Id, t.Kind, t.Name, t.IsActive, t.Code, t.MetadataJson)).FirstOrDefaultAsync(ct);

    public async Task<IReadOnlyDictionary<Guid, TaxonomyTermDto>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return new Dictionary<Guid, TaxonomyTermDto>();
        var list = await Terms.AsNoTracking().Where(t => ids.Contains(t.Id))
            .Select(t => new TaxonomyTermDto(t.Id, t.Kind, t.Name, t.IsActive, t.Code, t.MetadataJson)).ToListAsync(ct);
        return list.ToDictionary(t => t.Id);
    }

    public async Task<IReadOnlyDictionary<Guid, string>> NamesAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return new Dictionary<Guid, string>();
        var rows = await Terms.AsNoTracking().Where(t => ids.Contains(t.Id)).Select(t => new { t.Id, t.Name }).ToListAsync(ct);
        return rows.ToDictionary(r => r.Id, r => r.Name);
    }

    public async Task<TaxonomyTermDto> CreateAsync(string kind, string name, CancellationToken ct)
        => await CreateAsync(kind, name, null, null, ct);

    public async Task<TaxonomyTermDto> CreateAsync(string kind, string name, string? code, string? metadataJson, CancellationToken ct)
    {
        Guard(kind, name);
        gate.Require(new AuthorizationRequest(Actions.TaxonomyManage, actor.PlatformRole), "TaxonomyTerm", null);
        var term = new TaxonomyTerm(kind, name.Trim(), code?.Trim(), metadataJson);
        db.Add(term);
        await uow.CommitAsync(ct);
        return new TaxonomyTermDto(term.Id, term.Kind, term.Name, term.IsActive, term.Code, term.MetadataJson);
    }

    public async Task<TaxonomyTermDto> RenameAsync(Guid id, string name, CancellationToken ct)
    {
        var term = await LoadAsync(id, ct);
        Guard(term.Kind, name);
        gate.Require(new AuthorizationRequest(Actions.TaxonomyManage, actor.PlatformRole), "TaxonomyTerm", id);
        term.Rename(name.Trim());
        await uow.CommitAsync(ct);
        return new TaxonomyTermDto(term.Id, term.Kind, term.Name, term.IsActive, term.Code, term.MetadataJson);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var term = await LoadAsync(id, ct);
        gate.Require(new AuthorizationRequest(Actions.TaxonomyManage, actor.PlatformRole), "TaxonomyTerm", id);
        term.Deactivate();
        await uow.CommitAsync(ct);
    }

    private async Task<TaxonomyTerm> LoadAsync(Guid id, CancellationToken ct)
        => await db.Set<TaxonomyTerm>().FirstOrDefaultAsync(t => t.Id == id, ct)
           ?? throw new NotFoundException($"Taxonomy term with ID {id} not found");

    private static void Guard(string kind, string name)
    {
        if (kind != TaxonomyKinds.Sector && kind != TaxonomyKinds.Category) throw new ValidationException($"kind không hợp lệ: {kind}");
        if (string.IsNullOrWhiteSpace(name)) throw new ValidationException("name should not be empty");
        if (name.Trim().Length > 255) throw new ValidationException("name must be shorter than or equal to 255 characters");
    }
}
