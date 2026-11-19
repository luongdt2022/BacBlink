using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Modules.Identity.Infrastructure;

/// <summary>Identity adapter that exposes verified Identity province scopes to the Brokerage use case.</summary>
public sealed class ExpertProvinceScopeLookup(DbContext db) : IExpertProvinceScopeLookup
{
    public async Task<IReadOnlyCollection<Guid>> GetPersonIdsInProvinceAsync(string provinceCode, CancellationToken ct)
    {
        var normalizedCode = provinceCode.Trim().ToUpperInvariant();
        return await db.Set<Person>().AsNoTracking()
            .Where(x => x.IsActive && x.PlatformRole == PlatformRoles.VerifiedExpert &&
                        x.ScopeType == ScopeTypes.Province && x.ScopeId == normalizedCode)
            .Select(x => x.Id)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyDictionary<Guid, string>> GetProvinceScopesAsync(IReadOnlyCollection<Guid> personIds, CancellationToken ct)
    {
        if (personIds.Count == 0) return new Dictionary<Guid, string>();
        return await db.Set<Person>().AsNoTracking()
            .Where(x => personIds.Contains(x.Id) && x.IsActive && x.PlatformRole == PlatformRoles.VerifiedExpert &&
                        x.ScopeType == ScopeTypes.Province && x.ScopeId != null)
            .Select(x => new { x.Id, x.ScopeId })
            .ToDictionaryAsync(x => x.Id, x => x.ScopeId!, ct);
    }
}
