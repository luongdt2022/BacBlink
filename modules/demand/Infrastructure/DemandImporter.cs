using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Demand.Domain;

namespace NacenTech.Modules.Demand.Infrastructure;

/// <summary>ETL `intakes(type=challenge)` (§30.1). Idempotent theo Id legacy; không phát event.</summary>
public sealed class DemandImporter(DbContext db, IUnitOfWork uow) : IDemandImporter
{
    public async Task ImportAsync(LegacyDemandImport import, CancellationToken ct)
    {
        var existing = await db.Set<DemandBrief>().FirstOrDefaultAsync(d => d.Id == import.Id, ct);
        if (existing is null)
        {
            db.Add(DemandBrief.Import(import));
        }
        else
        {
            existing.ApplyImportFields(import);
            existing.ReplaceImportedVersion(import);
            existing.ApplyLegacy(import.Legacy, import.CreatedAt, import.UpdatedAt);
        }
        await uow.CommitAsync(ct);
    }

    public Task<int> CountAsync(CancellationToken ct) => db.Set<DemandBrief>().AsNoTracking().CountAsync(ct);
}
