using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Communication.Domain;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Demand.Domain;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Modules.Policy.Application;
using NacenTech.Modules.Technology.Application;
using NacenTech.Modules.Technology.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Api.V1Compat;

/// <summary>
/// Read model cho dashboard admin (§9.1 cho phép projection riêng ở reporting).
/// Đây là chỗ duy nhất trong facade đọc trực tiếp nhiều schema, và chỉ đọc — không ghi.
/// </summary>
public sealed class StatsReadModel(DbContext db, ITaxonomyService taxonomy, ICurrentActor actor, IAuthorizationGate gate)
{
    public async Task<object> IntakeStatsAsync(int? days, CancellationToken ct)
    {
        Require();
        var boundary = Boundary(days);

        var demandRows = await db.Set<DemandBrief>().AsNoTracking()
            .Where(d => boundary == null || d.CreatedAt >= boundary)
            .Select(d => new { d.CreatedAt, d.Status, d.SectorIds }).ToListAsync(ct);
        var techRows = await db.Set<TechnologyAsset>().AsNoTracking()
            .Where(t => boundary == null || t.CreatedAt >= boundary)
            .Select(t => new { t.CreatedAt, Status = t.PublicationStatus, t.SectorIds }).ToListAsync(ct);

        var byMonth = demandRows.Select(r => (r.CreatedAt, Type: "challenge"))
            .Concat(techRows.Select(r => (r.CreatedAt, Type: "ip")))
            .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                ipCount = g.Count(x => x.Type == "ip"),
                challengeCount = g.Count(x => x.Type == "challenge"),
            }).ToList();

        var sectorIds = demandRows.SelectMany(r => r.SectorIds).Concat(techRows.SelectMany(r => r.SectorIds)).Distinct().ToArray();
        var terms = await taxonomy.GetManyAsync(sectorIds, ct);
        var bySector = demandRows.SelectMany(r => r.SectorIds).Concat(techRows.SelectMany(r => r.SectorIds))
            .GroupBy(s => s)
            .Select(g => new { sector = terms.TryGetValue(g.Key, out var t) ? t.Name : g.Key.ToString(), count = g.Count() })
            .OrderByDescending(x => x.count).ToList();

        return new
        {
            total = demandRows.Count + techRows.Count,
            byMonth,
            byStatus = new
            {
                draft = new
                {
                    ipCount = techRows.Count(t => t.Status == PublicationStatuses.Draft),
                    challengeCount = demandRows.Count(d => d.Status == DemandStatuses.Draft),
                },
                published = new
                {
                    ipCount = techRows.Count(t => t.Status == PublicationStatuses.Published),
                    challengeCount = demandRows.Count(d => d.Status == DemandStatuses.Published),
                },
            },
            byType = new { ip = techRows.Count, challenge = demandRows.Count },
            bySector,
        };
    }

    public async Task<object> UserStatsAsync(int? days, CancellationToken ct)
    {
        Require();
        var boundary = Boundary(days);
        var rows = await db.Set<Person>().AsNoTracking().Select(p => new { p.CreatedAt, p.PlatformRole, p.IsActive }).ToListAsync(ct);

        var byMonth = rows.Where(r => boundary == null || r.CreatedAt >= boundary)
            .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new { year = g.Key.Year, month = g.Key.Month, count = g.Count() }).ToList();

        return new
        {
            total = rows.Count,
            byMonth,
            byRole = new
            {
                user = rows.Count(r => r.PlatformRole == PlatformRoles.User),
                admin = rows.Count(r => r.PlatformRole == PlatformRoles.Admin),
            },
            byStatus = new { active = rows.Count(r => r.IsActive), inactive = rows.Count(r => !r.IsActive) },
        };
    }

    public async Task<object> NotificationStatsAsync(int? days, CancellationToken ct)
    {
        Require();
        var boundary = Boundary(days);
        var rows = await db.Set<Notification>().AsNoTracking()
            .Where(n => boundary == null || n.CreatedAt >= boundary)
            .Select(n => new { n.CreatedAt, n.Type, n.IsRead }).ToListAsync(ct);

        int Count(string type) => rows.Count(r => r.Type == type);
        var byMonth = rows.GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                matchFound = g.Count(x => x.Type == Modules.Communication.Application.NotificationTypes.MatchFound),
                collaborationRequestReceived = g.Count(x => x.Type == Modules.Communication.Application.NotificationTypes.CollaborationRequestReceived),
                collaborationRequestAccepted = g.Count(x => x.Type == Modules.Communication.Application.NotificationTypes.CollaborationRequestAccepted),
                collaborationRequestRejected = g.Count(x => x.Type == Modules.Communication.Application.NotificationTypes.CollaborationRequestRejected),
            }).ToList();

        return new
        {
            total = rows.Count,
            byType = new
            {
                matchFound = Count(Modules.Communication.Application.NotificationTypes.MatchFound),
                collaborationRequestReceived = Count(Modules.Communication.Application.NotificationTypes.CollaborationRequestReceived),
                collaborationRequestAccepted = Count(Modules.Communication.Application.NotificationTypes.CollaborationRequestAccepted),
                collaborationRequestRejected = Count(Modules.Communication.Application.NotificationTypes.CollaborationRequestRejected),
            },
            byMonth,
            readRate = rows.Count > 0 ? (int)Math.Round(rows.Count(r => r.IsRead) / (double)rows.Count * 100) : 0,
        };
    }

    private void Require() => gate.Require(new AuthorizationRequest(Actions.StatsRead, actor.PlatformRole), "Stats", null);

    private static DateTimeOffset? Boundary(int? days) => days is null ? null : DateTimeOffset.UtcNow.AddDays(-days.Value);
}

[Route("api/v1/admin/stats")]
[Authorize]
public sealed class StatsController(StatsReadModel stats) : V1ControllerBase
{
    [HttpGet("intakes")]
    public async Task<IActionResult> Intakes([FromQuery] string? days, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(Ok200(await stats.IntakeStatsAsync(ParseDays(days), ct)));
    }

    [HttpGet("users")]
    public async Task<IActionResult> Users([FromQuery] string? days, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(Ok200(await stats.UserStatsAsync(ParseDays(days), ct)));
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> Notifications([FromQuery] string? days, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(Ok200(await stats.NotificationStatsAsync(ParseDays(days), ct)));
    }

    /// <summary>Legacy nhận số 1–90 hoặc chuỗi "all"; mặc định 30.</summary>
    private static int? ParseDays(string? days)
    {
        if (string.IsNullOrEmpty(days)) return 30;
        if (days == "all") return null;
        if (!int.TryParse(days, out var value) || value < 1 || value > 90)
            throw new ValidationException("days must be a number between 1 and 90, or the string 'all'");
        return value;
    }
}
