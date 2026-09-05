using NacenTech.Kernel.Domain;

namespace NacenTech.Kernel.Application;

/// <summary>
/// Tóm tắt một subject để module khác hiển thị/kiểm tra mà không join xuyên schema (§9.1).
/// </summary>
public sealed record SubjectSummary(
    SubjectRef Ref,
    string Title,
    string? DisplayTitle,
    Guid? OwnerPersonId,
    bool IsPublished,
    IReadOnlyList<Guid> SectorIds);

/// <summary>Nội dung văn bản public của subject để chunk/embed (không bao gồm confidential).</summary>
public sealed record SubjectContent(SubjectRef Ref, string Title, string? Body);

/// <summary>Module sở hữu subject kind nào thì implement provider cho kind đó.</summary>
public interface ISubjectSummaryProvider
{
    string Kind { get; }
    Task<SubjectSummary?> GetAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyDictionary<Guid, SubjectSummary>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct);
}

public interface ISubjectContentProvider
{
    string Kind { get; }
    Task<SubjectContent?> GetAsync(Guid id, CancellationToken ct);
}

/// <summary>Bộ phân giải dùng chung, gom provider theo kind.</summary>
public interface ISubjectResolver
{
    Task<SubjectSummary?> SummaryAsync(SubjectRef subject, CancellationToken ct);
    Task<IReadOnlyDictionary<SubjectRef, SubjectSummary>> SummariesAsync(IEnumerable<SubjectRef> subjects, CancellationToken ct);
    Task<SubjectContent?> ContentAsync(SubjectRef subject, CancellationToken ct);
}

public sealed class SubjectResolver(
    IEnumerable<ISubjectSummaryProvider> summaryProviders,
    IEnumerable<ISubjectContentProvider> contentProviders) : ISubjectResolver
{
    private readonly Dictionary<string, ISubjectSummaryProvider> _summary = summaryProviders.ToDictionary(p => p.Kind);
    private readonly Dictionary<string, ISubjectContentProvider> _content = contentProviders.ToDictionary(p => p.Kind);

    public Task<SubjectSummary?> SummaryAsync(SubjectRef subject, CancellationToken ct)
        => _summary.TryGetValue(subject.Kind, out var p) ? p.GetAsync(subject.Id, ct) : Task.FromResult<SubjectSummary?>(null);

    public async Task<IReadOnlyDictionary<SubjectRef, SubjectSummary>> SummariesAsync(IEnumerable<SubjectRef> subjects, CancellationToken ct)
    {
        var result = new Dictionary<SubjectRef, SubjectSummary>();
        foreach (var group in subjects.Distinct().GroupBy(s => s.Kind))
        {
            if (!_summary.TryGetValue(group.Key, out var provider)) continue;
            var many = await provider.GetManyAsync(group.Select(g => g.Id).ToArray(), ct);
            foreach (var (id, summary) in many) result[new SubjectRef(group.Key, id)] = summary;
        }
        return result;
    }

    public Task<SubjectContent?> ContentAsync(SubjectRef subject, CancellationToken ct)
        => _content.TryGetValue(subject.Kind, out var p) ? p.GetAsync(subject.Id, ct) : Task.FromResult<SubjectContent?>(null);
}
