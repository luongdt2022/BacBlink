using Microsoft.EntityFrameworkCore;
using NacenTech.Contracts.Events;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Technology.Domain;

namespace NacenTech.Modules.Technology.Application;

public sealed class TechnologySubjectProvider(DbContext db) : ISubjectSummaryProvider, ISubjectContentProvider
{
    public string Kind => SubjectKinds.TechnologyAsset;

    public async Task<SubjectSummary?> GetAsync(Guid id, CancellationToken ct)
    {
        var t = await db.Set<TechnologyAsset>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return t is null ? null : ToSummary(t);
    }

    public async Task<IReadOnlyDictionary<Guid, SubjectSummary>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return new Dictionary<Guid, SubjectSummary>();
        var list = await db.Set<TechnologyAsset>().AsNoTracking().Where(t => ids.Contains(t.Id)).ToListAsync(ct);
        return list.ToDictionary(t => t.Id, ToSummary);
    }

    async Task<SubjectContent?> ISubjectContentProvider.GetAsync(Guid id, CancellationToken ct)
    {
        var t = await db.Set<TechnologyAsset>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (t is null) return null;
        var current = t.Versions.OrderByDescending(v => v.VersionNo).First();
        return new SubjectContent(SubjectRef.Technology(t.Id), current.Title, current.Description);
    }

    private static SubjectSummary ToSummary(TechnologyAsset t)
    {
        var current = t.Versions.OrderByDescending(v => v.VersionNo).First();
        return new SubjectSummary(SubjectRef.Technology(t.Id), current.Title, t.AiTitle ?? current.Title, t.OwnerPersonId,
            t.PublicationStatus == PublicationStatuses.Published && t.DeletedAt is null, t.SectorIds);
    }
}

public sealed class TechnologyChunkingStatusHandler(DbContext db) : IIntegrationEventHandler<SubjectChunkingCompleted>
{
    public async Task HandleAsync(SubjectChunkingCompleted @event, CancellationToken ct)
    {
        if (@event.Subject.Kind != SubjectKinds.TechnologyAsset) return;
        var asset = await db.Set<TechnologyAsset>().FirstOrDefaultAsync(t => t.Id == @event.Subject.Id, ct);
        asset?.SetAiStatus(null, @event.Success ? AiStatuses.Completed : AiStatuses.Failed);
    }
}
