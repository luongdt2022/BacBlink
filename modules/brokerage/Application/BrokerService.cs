using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Brokerage.Application;

public sealed class BrokerService(DbContext db, IUnitOfWork uow, ICurrentActor actor, IAuthorizationGate gate, IClock clock) : IBrokerService
{
    public async Task<BrokerProfileDto> RegisterAsync(Guid personId, int capacity, IReadOnlyList<Guid> sectorIds, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.CaseAssignBroker, actor.PlatformRole), "BrokerProfile", null);
        if (await db.Set<BrokerProfile>().AnyAsync(p => p.PersonId == personId, ct))
            throw new ConflictException("Broker profile đã tồn tại cho người này");

        var profile = new BrokerProfile(personId, capacity, sectorIds);
        db.Add(profile);
        await uow.CommitAsync(ct);
        return await ToDtoAsync(profile, ct);
    }

    public async Task<BrokerProfileDto?> FindByPersonAsync(Guid personId, CancellationToken ct)
    {
        var profile = await db.Set<BrokerProfile>().AsNoTracking().FirstOrDefaultAsync(p => p.PersonId == personId, ct);
        return profile is null ? null : await ToDtoAsync(profile, ct);
    }

    public async Task<PagedResult<BrokerProfileDto>> ListAsync(PageRequest page, CancellationToken ct)
    {
        var q = db.Set<BrokerProfile>().AsNoTracking();
        var total = await q.CountAsync(ct);
        var data = await q.OrderByDescending(p => p.CreatedAt).Skip(page.Skip).Take(page.Limit).ToListAsync(ct);
        var dtos = new List<BrokerProfileDto>(data.Count);
        foreach (var p in data) dtos.Add(await ToDtoAsync(p, ct));
        return new PagedResult<BrokerProfileDto>(dtos, total, page.Page, page.Limit);
    }

    /// <summary>AC 84: vượt capacity thì từ chối rõ ràng để quá tải hiện thành hàng đợi có owner, không rơi case âm thầm.</summary>
    public async Task<AssignmentDto> AssignAsync(Guid caseId, Guid brokerPersonId, string role, DateTimeOffset? slaDueAt, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.CaseAssignBroker, actor.PlatformRole), "Assignment", caseId);

        var profile = await db.Set<BrokerProfile>().FirstOrDefaultAsync(p => p.PersonId == brokerPersonId, ct)
                      ?? throw new UnprocessableException("Broker không hợp lệ", "BROKER_INVALID");
        if (profile.Status != BrokerStatuses.Active)
            throw new UnprocessableException("Broker không hợp lệ", "BROKER_INVALID");

        var active = await db.Set<Assignment>().CountAsync(a => a.BrokerPersonId == brokerPersonId && a.Status == AssignmentStatuses.Active, ct);
        if (active >= profile.Capacity)
            throw new UnprocessableException("Broker đã đạt capacity; đưa vào hàng đợi có owner thay vì giao thêm", "CAPACITY_EXCEEDED");

        var assignment = new Assignment(caseId, brokerPersonId, role, clock.UtcNow, slaDueAt);
        db.Add(assignment);
        await uow.CommitAsync(ct);
        return ToDto(assignment);
    }

    public async Task EndAssignmentAsync(Guid assignmentId, CancellationToken ct)
    {
        var assignment = await db.Set<Assignment>().FirstOrDefaultAsync(a => a.Id == assignmentId, ct)
                         ?? throw new NotFoundException($"Assignment {assignmentId} not found");
        gate.Require(new AuthorizationRequest(Actions.CaseAssignBroker, actor.PlatformRole), "Assignment", assignmentId);
        assignment.End(clock.UtcNow);
        await uow.CommitAsync(ct);
    }

    public async Task<IReadOnlyList<AssignmentDto>> ListForCaseAsync(Guid caseId, CancellationToken ct)
    {
        var list = await db.Set<Assignment>().AsNoTracking().Where(a => a.CaseId == caseId)
            .OrderByDescending(a => a.AssignedAt).ToListAsync(ct);
        return list.Select(ToDto).ToList();
    }

    private async Task<BrokerProfileDto> ToDtoAsync(BrokerProfile p, CancellationToken ct)
    {
        var active = await db.Set<Assignment>().AsNoTracking()
            .CountAsync(a => a.BrokerPersonId == p.PersonId && a.Status == AssignmentStatuses.Active, ct);
        return new BrokerProfileDto(p.Id, p.PersonId, p.Status, p.Capacity, active, p.SectorIds, p.CreatedAt, p.UpdatedAt, p.Version);
    }

    private static AssignmentDto ToDto(Assignment a)
        => new(a.Id, a.CaseId, a.BrokerPersonId, a.Role, a.Status, a.AssignedAt, a.SlaDueAt, a.EndedAt);
}
