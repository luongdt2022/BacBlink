using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Lms.Domain;

namespace NacenTech.Modules.Lms.Infrastructure;

public sealed class ExpertLmsCourseLookup(DbContext db) : IExpertLmsCourseLookup
{
    public async Task<IReadOnlyDictionary<Guid, int>> GetPublishedCourseCountsAsync(
        IReadOnlyCollection<Guid> expertProfileIds,
        CancellationToken ct)
    {
        if (expertProfileIds.Count == 0)
            return new Dictionary<Guid, int>();

        var query = from i in db.Set<LearningMaterialInstructor>().AsNoTracking()
                    join m in db.Set<LearningMaterial>().AsNoTracking() on i.MaterialId equals m.Id
                    where expertProfileIds.Contains(i.ExpertProfileId)
                          && m.Status == LmsStatuses.Published
                          && !m.IsDeleted
                    select i.ExpertProfileId;

        return await query
            .GroupBy(expertProfileId => expertProfileId)
            .ToDictionaryAsync(g => g.Key, g => g.Count(), ct);
    }

    public async Task<IReadOnlyList<ExpertLmsCourseBrief>> GetPublishedCoursesByExpertAsync(
        Guid expertProfileId,
        CancellationToken ct)
    {
        if (expertProfileId == Guid.Empty)
            return [];

        var query = from i in db.Set<LearningMaterialInstructor>().AsNoTracking()
                    join m in db.Set<LearningMaterial>().AsNoTracking() on i.MaterialId equals m.Id
                    where i.ExpertProfileId == expertProfileId
                          && m.Status == LmsStatuses.Published
                          && !m.IsDeleted
                    orderby (m.PublishedAt ?? m.CreatedAt) descending
                    select new ExpertLmsCourseBrief(
                        m.Id,
                        m.MaterialCode,
                        m.Title,
                        m.LessonType,
                        m.DurationMinutes,
                        m.ClusterName,
                        m.SectorCode);

        return await query.ToListAsync(ct);
    }
}
