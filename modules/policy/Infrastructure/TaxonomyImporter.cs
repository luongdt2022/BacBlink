using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Policy.Application;
using NacenTech.Modules.Policy.Domain;

namespace NacenTech.Modules.Policy.Infrastructure;

/// <summary>ETL `sectors`/`categories` → taxonomy version 1 (§30.1). Idempotent theo Id legacy.</summary>
public sealed class TaxonomyImporter(DbContext db, IUnitOfWork uow) : ITaxonomyImporter
{
    public async Task ImportTermAsync(LegacyTaxonomyImport term, CancellationToken ct)
    {
        var existing = await db.Set<TaxonomyTerm>().FirstOrDefaultAsync(t => t.Id == term.Id, ct);
        if (existing is null)
        {
            var created = new TaxonomyTerm(term.Kind, term.Name);
            created.OverrideId(term.Id);
            created.ApplyLegacy(term.Legacy, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);
            created.ApplyImport(term.Kind, term.Name, term.IsActive);
            db.Add(created);
        }
        else
        {
            existing.ApplyImport(term.Kind, term.Name, term.IsActive);
            existing.ApplyLegacy(term.Legacy, existing.CreatedAt, DateTimeOffset.UtcNow);
        }
        await uow.CommitAsync(ct);
    }

    public Task<int> CountAsync(string kind, CancellationToken ct)
        => db.Set<TaxonomyTerm>().AsNoTracking().CountAsync(t => t.Kind == kind, ct);
}
