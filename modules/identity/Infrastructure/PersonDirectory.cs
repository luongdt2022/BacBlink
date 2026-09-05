using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Modules.Identity.Infrastructure;

/// <summary>Lookup xuyên module (§9.1): module khác chỉ biết interface ở Kernel, không tham chiếu assembly identity.</summary>
public sealed class PersonDirectory(DbContext db) : IPersonDirectory, IMatchingPreferenceProvider
{
    public async Task<PersonBrief?> GetAsync(Guid personId, CancellationToken ct)
    {
        var p = await db.Set<Person>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == personId, ct);
        return p is null ? null : PersonMapper.ToBrief(p);
    }

    public async Task<IReadOnlyDictionary<Guid, PersonBrief>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return new Dictionary<Guid, PersonBrief>();
        var list = await db.Set<Person>().AsNoTracking().Where(p => ids.Contains(p.Id)).ToListAsync(ct);
        return list.ToDictionary(p => p.Id, PersonMapper.ToBrief);
    }

    public async Task<bool> AutoMatchingEnabledAsync(Guid personId, CancellationToken ct)
        => await db.Set<Person>().AsNoTracking().Where(p => p.Id == personId).Select(p => (bool?)p.MatchingAuto).FirstOrDefaultAsync(ct) ?? false;
}
