using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Entitlement.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Entitlement.Application;

public sealed class EntitlementOptions
{
    public const string Section = "Entitlement";

    /// <summary>
    /// `MeterOnly` (mặc định) hay `Enforce`. Mặc định là chỉ đo, và đó là chủ ý theo nguyên tắc 14 *manual-first*:
    /// bật cưỡng chế trước khi biết mức dùng thật sẽ chặn đúng những người đang làm việc. Chuyển sang `Enforce`
    /// là quyết định có dữ liệu — dữ liệu đó là `usage_records` với outcome `WOULD_DENY`.
    /// </summary>
    public string Mode { get; set; } = EntitlementModes.MeterOnly;
}

public static class EntitlementModes
{
    public const string MeterOnly = "MeterOnly";
    public const string Enforce = "Enforce";
}

public sealed record AgreementDto(Guid Id, PayerRef Payer, string ServiceLine, string Reference,
    DateTimeOffset PeriodStart, DateTimeOffset PeriodEnd, string? InvoiceReference, string Status,
    IReadOnlyList<EntitlementDto> Entitlements, int Version);

public sealed record EntitlementDto(string CapabilityCode, int? QuotaLimit, int Consumed, int? Remaining);

public sealed record CreateAgreementCommand(PayerRef Payer, string ServiceLine, string Reference,
    DateTimeOffset PeriodStart, DateTimeOffset PeriodEnd, string? InvoiceReference,
    IReadOnlyList<CreateEntitlementCommand> Entitlements);

public sealed record CreateEntitlementCommand(string CapabilityCode, int? QuotaLimit);

// `IEntitlementGate` và `EntitlementDecision` nằm ở Kernel: module tiêu thụ (`case`, …) cần gọi nó mà không được
// tham chiếu assembly của module này (MOD-02).

public interface IAgreementService
{
    Task<AgreementDto> CreateAsync(CreateAgreementCommand command, CancellationToken ct);
    Task<AgreementDto> ActivateAsync(Guid id, int? expectedVersion, CancellationToken ct);
    Task<AgreementDto> GetAsync(Guid id, CancellationToken ct);
    Task<PagedResult<AgreementDto>> ListAsync(PayerRef? payer, PageRequest page, CancellationToken ct);
}

public sealed class EntitlementGate(
    DbContext db, ICurrentActor actor, IClock clock, IOptions<EntitlementOptions> options) : IEntitlementGate
{
    private readonly EntitlementOptions _options = options.Value;

    public async Task<EntitlementDecision> CheckAndMeterAsync(PayerRef payer, string capabilityCode, int amount, CancellationToken ct)
    {
        if (!PlatformCapabilities.IsKnown(capabilityCode))
            throw new ValidationException($"Capability không có trong danh mục: {capabilityCode}");
        if (amount <= 0) throw new ValidationException("Lượng tiêu thụ phải dương");

        var now = clock.UtcNow;
        var enforcing = _options.Mode == EntitlementModes.Enforce;

        var agreement = await db.Set<ManagedServiceAgreement>()
            .Include(a => a.Entitlements)
            .Where(a => a.PayerKind == payer.Kind && a.PayerId == payer.Id && a.Status == AgreementStatuses.Active
                        && a.PeriodStart <= now && a.PeriodEnd > now)
            .OrderBy(a => a.PeriodEnd)
            .FirstOrDefaultAsync(ct);

        var entitlement = agreement?.Entitlements.FirstOrDefault(e => e.CapabilityCode == capabilityCode);

        string reason;
        bool wouldDeny;
        if (agreement is null) { reason = "Không có hợp đồng còn hiệu lực"; wouldDeny = true; }
        else if (entitlement is null) { reason = $"Hợp đồng không bao gồm {capabilityCode}"; wouldDeny = true; }
        else if (!entitlement.HasRemaining) { reason = "Hết quota"; wouldDeny = true; }
        else { reason = "OK"; wouldDeny = false; }

        var allowed = !enforcing || !wouldDeny;

        // Trừ quota chỉ khi thật sự có quyền lợi và thao tác được phép chạy. Ở chế độ chỉ đo mà không có hợp đồng
        // thì không có gì để trừ — nhưng vẫn ghi `WOULD_DENY`, vì đó chính là con số cần trước khi bật cưỡng chế.
        if (allowed && entitlement is not null && !wouldDeny) entitlement.Consume(amount, now);

        var outcome = allowed ? (wouldDeny ? UsageOutcomes.WouldDeny : UsageOutcomes.Allowed) : UsageOutcomes.Denied;
        db.Add(new UsageRecord(payer, capabilityCode, agreement?.Id, amount, outcome, actor.PersonId, now));

        return new EntitlementDecision(allowed, wouldDeny, reason, entitlement?.Remaining);
    }
}

public sealed class AgreementService(
    DbContext db, IUnitOfWork uow, ICurrentActor actor, IAuthorizationGate gate, IClock clock) : IAgreementService
{
    public async Task<AgreementDto> CreateAsync(CreateAgreementCommand c, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.AgreementManage, actor.PlatformRole), "ManagedServiceAgreement", null);

        if (string.IsNullOrWhiteSpace(c.Reference))
            throw new ValidationException("Hợp đồng phải có số hiệu bên ngoài — platform không sinh số hợp đồng");

        var now = clock.UtcNow;
        var agreement = new ManagedServiceAgreement(c.Payer, c.ServiceLine, c.Reference,
            c.PeriodStart, c.PeriodEnd, c.InvoiceReference, now);

        foreach (var e in c.Entitlements ?? [])
        {
            if (!PlatformCapabilities.IsKnown(e.CapabilityCode))
                throw new ValidationException($"Capability không có trong danh mục: {e.CapabilityCode}");
            if (e.QuotaLimit is <= 0)
                throw new ValidationException("Quota phải dương, hoặc null nếu không giới hạn");
            agreement.AddEntitlement(e.CapabilityCode, e.QuotaLimit, now);
        }

        db.Add(agreement);
        await uow.CommitAsync(ct);
        return ToDto(agreement);
    }

    public async Task<AgreementDto> ActivateAsync(Guid id, int? expectedVersion, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.AgreementManage, actor.PlatformRole), "ManagedServiceAgreement", id);
        var agreement = await Load(id, expectedVersion, ct);
        agreement.Activate(clock.UtcNow);
        await uow.CommitAsync(ct);
        return ToDto(agreement);
    }

    public async Task<AgreementDto> GetAsync(Guid id, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.AgreementRead, actor.PlatformRole), "ManagedServiceAgreement", id);
        return ToDto(await Load(id, null, ct));
    }

    public async Task<PagedResult<AgreementDto>> ListAsync(PayerRef? payer, PageRequest page, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.AgreementRead, actor.PlatformRole), "ManagedServiceAgreement", null);
        var q = db.Set<ManagedServiceAgreement>().AsNoTracking().Include(a => a.Entitlements).AsQueryable();
        if (payer is { } p) q = q.Where(a => a.PayerKind == p.Kind && a.PayerId == p.Id);
        var total = await q.CountAsync(ct);
        var rows = await q.OrderByDescending(a => a.CreatedAt).Skip(page.Skip).Take(page.Limit).ToListAsync(ct);
        return new PagedResult<AgreementDto>(rows.Select(ToDto).ToList(), total, page.Page, page.Limit);
    }

    private async Task<ManagedServiceAgreement> Load(Guid id, int? expectedVersion, CancellationToken ct)
    {
        var agreement = await db.Set<ManagedServiceAgreement>().Include(a => a.Entitlements)
            .FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new NotFoundException($"Managed service agreement {id} not found");
        if (expectedVersion is { } v && agreement.Version != v)
            throw new ConcurrencyException($"Managed service agreement {id} đã đổi", agreement.Version);
        return agreement;
    }

    private static AgreementDto ToDto(ManagedServiceAgreement a) => new(
        a.Id, a.Payer, a.ServiceLine, a.Reference, a.PeriodStart, a.PeriodEnd,
        a.InvoiceReference, a.Status,
        a.Entitlements.Select(e => new EntitlementDto(e.CapabilityCode, e.QuotaLimit, e.Consumed, e.Remaining)).ToList(),
        a.Version);
}
