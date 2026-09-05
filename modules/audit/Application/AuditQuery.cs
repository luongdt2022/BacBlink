using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Audit.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Audit.Application;

public sealed class AuditQuery(
    DbContext db,
    IUnitOfWork uow,
    ICurrentActor actor,
    IAuthorizationGate gate,
    IOptions<AuditRetentionOptions> retention,
    IAuditWriter audit,
    IClock clock) : IAuditQuery
{
    /// <summary>
    /// ADR-0006, câu 4: lượt tra nhật ký **tự ghi vào nhật ký**. Câu "ai canh người canh gác" phải có câu trả
    /// lời ở đúng chỗ người ta sẽ tìm nó. Ghi sau khi truy vấn chạy xong, để lượt xem hiện tại không tự xuất
    /// hiện trong chính kết quả của nó.
    /// </summary>
    private void Viewed(Guid? objectId, string details)
        => audit.Append(new AuditEntry(actor.PersonId, actor.PlatformRole, Actions.StatsRead, "AuditEvent", objectId, null,
            null, AuditOutcomes.Success, null, actor.CorrelationId, actor.IpAddress, actor.UserAgent, details));

    public async Task<PagedResult<AuditEventDto>> ListAsync(AuditQueryFilter filter, PageRequest page, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.StatsRead, actor.PlatformRole), "AuditEvent", null);

        var q = db.Set<AuditEvent>().AsNoTracking().AsQueryable();
        if (filter.ActorRef is not null) q = q.Where(e => e.ActorRef == filter.ActorRef);
        if (!string.IsNullOrEmpty(filter.ObjectKind)) q = q.Where(e => e.ObjectKind == filter.ObjectKind);
        if (filter.ObjectId is not null) q = q.Where(e => e.ObjectId == filter.ObjectId);
        if (!string.IsNullOrEmpty(filter.Outcome)) q = q.Where(e => e.Outcome == filter.Outcome);
        // Khoảng thời gian: nửa mở [From, To) để hai khoảng liền nhau không chồng lấn một dòng nào.
        if (filter.From is { } from) q = q.Where(e => e.OccurredAt >= from);
        if (filter.To is { } to) q = q.Where(e => e.OccurredAt < to);

        var total = await q.CountAsync(ct);
        var data = await q.OrderByDescending(e => e.OccurredAt)
            .Skip(page.Skip).Take(page.Limit)
            .Select(e => new AuditEventDto(e.Id, e.ActorRef, e.ActorRole, e.Action, e.ObjectKind, e.ObjectId, e.ObjectVersion,
                e.Purpose, e.Outcome, e.RuleId, e.CorrelationId, e.OccurredAt, e.Details))
            .ToListAsync(ct);

        Viewed(null, $"actorRef={filter.ActorRef?.ToString() ?? "-"}; objectKind={filter.ObjectKind ?? "-"}; objectId={filter.ObjectId?.ToString() ?? "-"}; " +
                     $"outcome={filter.Outcome ?? "-"}; from={filter.From?.ToString("O") ?? "-"}; to={filter.To?.ToString("O") ?? "-"}; page={page.Page}; matched={total}");
        return new PagedResult<AuditEventDto>(data, total, page.Page, page.Limit);
    }

    /// <summary>
    /// Đi qua **cùng** cửa phân quyền với `ListAsync`. Không được nới lỏng ở đường đọc một dòng: nếu đường danh
    /// sách chặn còn đường chi tiết không chặn thì ai biết một định danh vẫn đọc được, và đó đúng là hình dạng
    /// của B-20 ở một module khác.
    /// </summary>
    public async Task<AuditEventDetailDto?> FindAsync(Guid id, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.StatsRead, actor.PlatformRole), "AuditEvent", id);

        var e = await db.Set<AuditEvent>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (e is null) return null;

        Viewed(id, "detail");
        return new AuditEventDetailDto(
            new AuditEventDto(e.Id, e.ActorRef, e.ActorRole, e.Action, e.ObjectKind, e.ObjectId, e.ObjectVersion,
                e.Purpose, e.Outcome, e.RuleId, e.CorrelationId, e.OccurredAt, e.Details),
            e.IpAddress,
            e.UserAgent,
            clock.UtcNow.AddDays(-retention.Value.DeviceDataRetentionDays));
    }

    /// <summary>Cắt IP/device hết retention; event và chuỗi hành động giữ nguyên (§23.5).</summary>
    public async Task<int> PurgeDeviceDataAsync(DateTimeOffset olderThan, CancellationToken ct)
    {
        var affected = await db.Set<AuditEvent>()
            .Where(e => e.OccurredAt < olderThan && (e.IpAddress != null || e.UserAgent != null))
            .ExecuteUpdateAsync(s => s
                .SetProperty(e => e.IpAddress, _ => null)
                .SetProperty(e => e.UserAgent, _ => null), ct);
        await uow.CommitAsync(ct);
        return affected;
    }
}
