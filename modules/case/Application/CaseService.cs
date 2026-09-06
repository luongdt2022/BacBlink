using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Case.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Case.Application;

public sealed class CaseService(
    DbContext db,
    IUnitOfWork uow,
    ICurrentActor actor,
    IAuthorizationGate gate,
    IAuditWriter audit,
    IClock clock,
    IPolicySnapshotResolver policy,
    IEntitlementGate entitlements) : ICaseService
{
    /// <summary>
    /// ADR-0006, câu 1: hành động ghi thành công để lại dòng `SUCCESS`, ghi **sau** `CommitAsync`. Nếu commit
    /// ném thì không tới đây; nếu tới đây thì việc đã xong và dòng đi bằng kết nối riêng của audit writer.
    /// Cửa phân quyền không phải chỗ ghi: nó chỉ biết lệnh được phép, không biết lệnh có xong.
    /// </summary>
    private void Succeeded(string action, CommercializationCase @case, string? details = null)
        => audit.Append(new AuditEntry(actor.PersonId, actor.PlatformRole, action, "CommercializationCase", @case.Id,
            @case.Version, null, AuditOutcomes.Success, null, actor.CorrelationId, actor.IpAddress, actor.UserAgent, details));

    public async Task<CaseDto> CreateAsync(CreateCaseCommand command, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.CaseCreate, actor.PlatformRole), "CommercializationCase", null);
        var code = await NextCaseCodeAsync(ct);
        var @case = CommercializationCase.Create(code, command, clock.UtcNow);
        db.Add(@case);

        // Bất biến 99: gói vận hành ghi **quota case**. Đây là chỗ duy nhất quota đó bị tiêu thụ, nên đây là chỗ
        // duy nhất đo được nó. Đo theo **chủ bài toán**, không theo người bấm nút: ở Phase 1 concierge người tạo
        // hồ sơ thường là môi giới, và tính vào quota của môi giới thì con số vô nghĩa.
        //
        // Cùng giao dịch với việc tạo hồ sơ (MOD-03) — nếu tách ra thì sẽ có những hồ sơ tồn tại mà không lần nào
        // được đếm, và đó là loại sai lệch không phát hiện được về sau.
        var decision = await entitlements.CheckAndMeterAsync(
            PayerRef.Person(command.ProblemOwnerPersonId), PlatformCapabilities.CaseIntake, 1, ct);
        if (!decision.Allowed)
            throw new UnprocessableException($"Không mở được hồ sơ mới: {decision.Reason}", "ENTITLEMENT_EXHAUSTED");

        await uow.CommitAsync(ct);
        Succeeded(Actions.CaseCreate, @case, $"caseCode={@case.CaseCode}; track={@case.Track}");
        return ToDto(@case);
    }

    public async Task<CaseDto> GetAsync(Guid id, CancellationToken ct)
    {
        var @case = await LoadAsync(id, ct);
        RequireCaseRead(@case, id);
        return ToDto(@case);
    }

    public async Task<PagedResult<CaseDto>> ListAsync(Guid? brokerPersonId, Guid? problemOwnerPersonId, string? stage, PageRequest page, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.CaseRead, actor.PlatformRole,
            CaseRole: actor.PlatformRole == PlatformRoles.Admin ? null : CaseRoles.ProblemOwner), "CommercializationCase", null);

        var q = db.Set<CommercializationCase>().AsQueryable();
        if (brokerPersonId is { } broker) q = q.Where(c => c.LeadBrokerPersonId == broker);
        if (problemOwnerPersonId is { } owner) q = q.Where(c => c.ProblemOwnerPersonId == owner);
        if (!string.IsNullOrEmpty(stage)) q = q.Where(c => c.Stage == stage);

        // Người dùng thường chỉ thấy case mình có vai trò.
        if (actor.PlatformRole != PlatformRoles.Admin && actor.PersonId is { } me)
            q = q.Where(c => c.Parties.Any(p => p.PersonId == me && p.Until == null));

        var total = await q.CountAsync(ct);
        var data = await q.AsNoTracking().OrderByDescending(c => c.CreatedAt).Skip(page.Skip).Take(page.Limit).ToListAsync(ct);
        return new PagedResult<CaseDto>(data.Select(ToDto).ToList(), total, page.Page, page.Limit);
    }

    /// <summary>
    /// §7.5: If-Match qua ExpectedVersion (lệch → 409 và KHÔNG tạo DecisionRecord);
    /// vào QUALIFICATION thì resolve PolicySnapshot trước (§9.3); một transaction ghi stage + version + record.
    /// </summary>
    public async Task<CaseDto> TransitionAsync(Guid id, TransitionCommand command, CancellationToken ct)
    {
        var @case = await LoadAsync(id, ct);
        RequireCaseAction(@case, Actions.CaseTransition, id);

        if (command.ExpectedVersion != @case.Version)
            throw new ConcurrencyException($"Case version mismatch; stage hiện tại {@case.Stage}", @case.Version);

        if (command.ToStage == Stages.Qualification && @case.PolicySnapshotId is null)
        {
            var snapshotId = await policy.ResolveForCaseAsync(@case.Id, @case.Track, ct);
            @case.SetPolicySnapshot(snapshotId);
        }

        var from = @case.Stage;
        @case.Transition(command.ToStage, command.Decision, command.ReasonCodes, command.Rationale,
            actor.PersonId ?? Guid.Empty, command.MandateRef, clock.UtcNow);
        await uow.CommitAsync(ct);
        Succeeded(Actions.CaseTransition, @case, $"{from}->{command.ToStage}; decision={command.Decision}");
        return ToDto(@case);
    }

    public async Task<CaseDto> AssignLeadBrokerAsync(Guid id, Guid brokerPersonId, int expectedVersion, CancellationToken ct)
    {
        var @case = await LoadAsync(id, ct);
        gate.Require(new AuthorizationRequest(Actions.CaseAssignBroker, actor.PlatformRole), "CommercializationCase", id);
        if (expectedVersion != @case.Version)
            throw new ConcurrencyException($"Case version mismatch; stage hiện tại {@case.Stage}", @case.Version);
        @case.AssignLeadBroker(brokerPersonId, clock.UtcNow);
        await uow.CommitAsync(ct);
        Succeeded(Actions.CaseAssignBroker, @case, $"broker={brokerPersonId}");
        return ToDto(@case);
    }

    public async Task<IReadOnlyList<DecisionRecordDto>> TimelineAsync(Guid id, CancellationToken ct)
    {
        var @case = await LoadAsync(id, ct);
        RequireCaseRead(@case, id);
        var records = await db.Set<DecisionRecord>().AsNoTracking()
            .Where(d => d.CaseId == id).OrderBy(d => d.DecidedAt).ToListAsync(ct);
        return records.Select(ToDto).ToList();
    }

    public async Task<CaseDto> OpenHoldAsync(Guid id, string reason, CancellationToken ct)
    {
        var @case = await LoadAsync(id, ct);
        RequireCaseAction(@case, Actions.CaseTransition, id);
        @case.OpenHold(reason, actor.PersonId, clock.UtcNow);
        await uow.CommitAsync(ct);
        Succeeded(Actions.CaseHoldOpen, @case, $"reason={reason}");
        return ToDto(@case);
    }

    public async Task<CaseDto> ReleaseHoldAsync(Guid id, Guid holdId, string rationale, CancellationToken ct)
    {
        var @case = await LoadAsync(id, ct);
        RequireCaseAction(@case, Actions.CaseTransition, id);
        @case.ReleaseHold(holdId, rationale, actor.PersonId ?? Guid.Empty, clock.UtcNow);
        await uow.CommitAsync(ct);
        Succeeded(Actions.CaseHoldRelease, @case, $"hold={holdId}");
        return ToDto(@case);
    }

    private void RequireCaseRead(CommercializationCase @case, Guid id) => RequireCaseAction(@case, Actions.CaseRead, id);

    /// <summary>
    /// B-42. Một người có thể giữ **nhiều** vai trò trong cùng hồ sơ (chủ bài toán kiêm môi giới chính là ca
    /// thường gặp nhất, vì chủ được thêm lúc tạo và môi giới thêm sau). Bảng quyết định chấm từng cặp
    /// (hành-động, vai-trò), nên câu hỏi đúng là "có vai trò nào được phép không": chấm từng vai, gặp vai cho
    /// phép thì thôi. Không vai nào cho phép thì gọi `Require` với vai đầu tiên — chính `Require` ghi dòng
    /// kiểm toán DENY và ném 403, nên đường từ chối vẫn để lại đúng một dấu vết như trước.
    ///
    /// Trước bản vá, chỗ này lấy `RoleOf` — vai đầu tiên theo thứ tự chèn — nên người vừa là chủ vừa là môi
    /// giới luôn bị chấm là chủ bài toán và không chuyển được giai đoạn hồ sơ mình phụ trách.
    /// </summary>
    private void RequireCaseAction(CommercializationCase @case, string action, Guid id)
    {
        var roles = actor.PersonId is { } me ? @case.RolesOf(me) : [];
        if (roles.Count == 0)
        {
            gate.Require(new AuthorizationRequest(action, actor.PlatformRole, CaseRole: null), "CommercializationCase", id);
            return;
        }

        foreach (var role in roles)
        {
            if (gate.Evaluate(new AuthorizationRequest(action, actor.PlatformRole, CaseRole: role)).IsPermitted) return;
        }

        gate.Require(new AuthorizationRequest(action, actor.PlatformRole, CaseRole: roles[0]), "CommercializationCase", id,
            roles.Count > 1 ? $"roles={string.Join(",", roles)}" : null);
    }

    private async Task<CommercializationCase> LoadAsync(Guid id, CancellationToken ct)
        => await db.Set<CommercializationCase>().FirstOrDefaultAsync(c => c.Id == id, ct)
           ?? throw new NotFoundException("Case not found");

    /// <summary>`NT-{yyyy}-{seq:000000}` (§5.1). Va chạm hiếm sẽ nổi lên thành lỗi unique, không âm thầm.</summary>
    private async Task<string> NextCaseCodeAsync(CancellationToken ct)
    {
        var year = clock.UtcNow.Year;
        var prefix = $"NT-{year}-";
        var count = await db.Set<CommercializationCase>().CountAsync(c => c.CaseCode.StartsWith(prefix), ct);
        return $"{prefix}{count + 1:000000}";
    }

    internal static CaseDto ToDto(CommercializationCase c) => new(
        c.Id, c.CaseCode, c.Track, c.Stage, c.Title, c.ProblemOwnerPersonId, c.LeadBrokerPersonId, c.DemandBriefId,
        c.DemandBriefVersionNo, c.PolicySnapshotId, c.ConfidentialityLevel, c.BudgetPathStatus, c.TargetDecisionAt,
        c.HasOpenHold, c.Version, c.CreatedAt, c.UpdatedAt,
        c.Parties.Select(p => new CasePartyDto(p.PersonId, p.Role, p.Since, p.Until)).ToList(),
        c.Holds.OrderBy(h => h.OpenedAt)
            .Select(h => new CaseHoldDto(h.Id, h.Reason, h.OpenedByActorRef, h.OpenedAt, h.ReleasedAt, h.ReleaseDecisionRecordId)).ToList());

    internal static DecisionRecordDto ToDto(DecisionRecord d) => new(
        d.Id, d.CaseId, d.FromStage, d.ToStage, d.Decision, d.ReasonCodes, d.Rationale, d.DecidedByActorRef,
        d.MandateRef, d.PolicySnapshotId, d.DecidedAt, d.SupersedesId);
}

/// <summary>Cho module khác tham chiếu case như một subject (không có nội dung public để index).</summary>
public sealed class CaseSubjectProvider(DbContext db) : ISubjectSummaryProvider
{
    public string Kind => SubjectKinds.CommercializationCase;

    public async Task<SubjectSummary?> GetAsync(Guid id, CancellationToken ct)
    {
        var c = await db.Set<CommercializationCase>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return c is null ? null : ToSummary(c);
    }

    public async Task<IReadOnlyDictionary<Guid, SubjectSummary>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        if (ids.Count == 0) return new Dictionary<Guid, SubjectSummary>();
        var list = await db.Set<CommercializationCase>().AsNoTracking().Where(c => ids.Contains(c.Id)).ToListAsync(ct);
        return list.ToDictionary(c => c.Id, ToSummary);
    }

    private static SubjectSummary ToSummary(CommercializationCase c)
        => new(SubjectRef.Case(c.Id), c.Title, c.CaseCode, c.ProblemOwnerPersonId, false, []);
}
