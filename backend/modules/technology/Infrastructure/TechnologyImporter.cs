using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Technology.Application;
using NacenTech.Modules.Technology.Domain;

namespace NacenTech.Modules.Technology.Infrastructure;

/// <summary>ETL `intakes(type=ip)` (§30.1). Không tự gắn TRANSACTION_READY.</summary>
public sealed class TechnologyImporter(DbContext db, IUnitOfWork uow) : ITechnologyImporter
{
    public async Task ImportAsync(LegacyTechnologyImport import, CancellationToken ct)
    {
        var existing = await db.Set<TechnologyAsset>().FirstOrDefaultAsync(t => t.Id == import.Id, ct);
        if (existing is null)
        {
            db.Add(TechnologyAsset.Import(import));
        }
        else
        {
            existing.ApplyImportFields(import);
            existing.ReplaceImportedVersion(import);
            existing.ApplyLegacy(import.Legacy, import.CreatedAt, import.UpdatedAt);
        }
        await uow.CommitAsync(ct);
    }

    public Task<int> CountAsync(CancellationToken ct) => db.Set<TechnologyAsset>().AsNoTracking().CountAsync(ct);
}
