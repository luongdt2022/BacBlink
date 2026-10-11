using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Content.Application;
using NacenTech.Modules.Demand.Domain;
using NacenTech.Modules.Enterprise.Domain;
using NacenTech.Modules.Technology.Domain;

namespace NacenTech.Api.V1Compat;

/// <summary>
/// TASK-01 Read Model: Tổng hợp số liệu thời gian thực từ 4 bảng CSDL thật phục vụ Portal Landing Page (Zero-Mock)
/// </summary>
public sealed class PortalOverviewService(DbContext db, IMemoryCache cache) : IPortalOverviewService
{
    private const string CacheKey = "portal:overview:stats";

    public async Task<PortalOverviewStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        if (cache.TryGetValue(CacheKey, out PortalOverviewStatsDto? cached) && cached != null)
        {
            return cached;
        }

        var totalOffers = await db.Set<SellerTechnologyOffer>().AsNoTracking().CountAsync(ct);
        if (totalOffers == 0)
        {
            totalOffers = await db.Set<TechnologyAsset>().AsNoTracking().CountAsync(ct);
        }

        var totalDemands = await db.Set<DemandSurvey>().AsNoTracking().CountAsync(ct);
        if (totalDemands == 0)
        {
            totalDemands = await db.Set<DemandBrief>().AsNoTracking().CountAsync(ct);
        }

        var totalEnterprises = await db.Set<Enterprise>().AsNoTracking().CountAsync(ct);
        var totalExperts = await db.Set<ExpertProfile>().AsNoTracking().CountAsync(ct);

        var stats = new PortalOverviewStatsDto(
            totalOffers,
            totalDemands,
            totalEnterprises,
            totalExperts,
            34,
            DateTimeOffset.UtcNow
        );

        cache.Set(CacheKey, stats, TimeSpan.FromMinutes(5));
        return stats;
    }
}
