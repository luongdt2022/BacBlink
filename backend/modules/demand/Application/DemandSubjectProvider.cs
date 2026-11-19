using Microsoft.EntityFrameworkCore;
using NacenTech.Contracts.Events;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Demand.Domain;

namespace NacenTech.Modules.Demand.Application;

/// <summary>Cho module khác (matching, communication) đọc tóm tắt/nội dung public mà không join xuyên schema.</summary>
public sealed class DemandSubjectProvider(DbContext db) : ISubjectSummaryProvider, ISubjectContentProvider
{
    public string Kind => SubjectKinds.DemandBrief;

    public async Task<SubjectSummary?> GetAsync(Guid id, CancellationToken ct)
    {
        var d = await db.Set<DemandBrief>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return d is null ? null : ToSummary(d);
    }

    public async Task<IReadOnlyDictionary<Guid, SubjectSummary>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return new Dictionary<Guid, SubjectSummary>();
        var list = await db.Set<DemandBrief>().AsNoTracking().Where(d => ids.Contains(d.Id)).ToListAsync(ct);
        return list.ToDictionary(d => d.Id, ToSummary);
    }

    async Task<SubjectContent?> ISubjectContentProvider.GetAsync(Guid id, CancellationToken ct)
    {
        var d = await db.Set<DemandBrief>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (d is null) return null;
        var current = d.Versions.OrderByDescending(v => v.VersionNo).First();
        return new SubjectContent(SubjectRef.Demand(d.Id), current.Title, current.ProblemStatement);
    }

    private static SubjectSummary ToSummary(DemandBrief d)
    {
        var current = d.Versions.OrderByDescending(v => v.VersionNo).First();
        return new SubjectSummary(SubjectRef.Demand(d.Id), current.Title, d.AiTitle ?? current.Title, d.OwnerPersonId,
            d.Status == DemandStatuses.Published && d.DeletedAt is null, d.SectorIds);
    }
}

/// <summary>Matching báo kết quả chunk/embed; cập nhật `AiChunkingStatus` (thay callback fire-and-forget của NestJS).</summary>
public sealed class DemandChunkingStatusHandler(DbContext db) : IIntegrationEventHandler<SubjectChunkingCompleted>
{
    public async Task HandleAsync(SubjectChunkingCompleted @event, CancellationToken ct)
    {
        if (@event.Subject.Kind != SubjectKinds.DemandBrief) return;
        var brief = await db.Set<DemandBrief>().FirstOrDefaultAsync(d => d.Id == @event.Subject.Id, ct);
        brief?.SetAiStatus(null, @event.Success ? AiStatuses.Completed : AiStatuses.Failed);
    }
}
