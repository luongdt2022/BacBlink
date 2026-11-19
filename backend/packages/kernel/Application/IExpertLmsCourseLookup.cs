namespace NacenTech.Kernel.Application;

public sealed record ExpertLmsCourseBrief(
    Guid Id,
    string MaterialCode,
    string Title,
    string LessonType,
    int DurationMinutes,
    string? ClusterName,
    string? SectorCode);

/// <summary>Cross-module lookup for published LMS courses linked to an expert; keeps LMS entities out of Brokerage.</summary>
public interface IExpertLmsCourseLookup
{
    Task<IReadOnlyDictionary<Guid, int>> GetPublishedCourseCountsAsync(IReadOnlyCollection<Guid> expertProfileIds, CancellationToken ct);
    Task<IReadOnlyList<ExpertLmsCourseBrief>> GetPublishedCoursesByExpertAsync(Guid expertProfileId, CancellationToken ct);
}
