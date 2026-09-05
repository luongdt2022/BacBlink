using Microsoft.EntityFrameworkCore;
using NacenTech.Contracts.Canonical;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Policy.Domain;

namespace NacenTech.Modules.Policy.Application;

/// <summary>
/// §9.3: snapshot chứa các rule case này thực sự chạm tới, lưu inline JSONB bất biến + hash JCS (D2-23).
/// Gate evaluation đọc từ snapshot, không đọc bảng policy hiện hành.
/// </summary>
public sealed class PolicySnapshotService(DbContext db, IUnitOfWork uow, IClock clock) : IPolicySnapshotService, IPolicySnapshotResolver
{
    public const string PlatformPolicyVersion = "platform-v1";

    public async Task<PolicySnapshotDto> ResolveForCaseAsync(Guid caseId, string track, CancellationToken ct)
    {
        var existing = await db.Set<PolicySnapshot>().AsNoTracking().FirstOrDefaultAsync(s => s.CaseId == caseId && s.IsCurrent, ct);
        if (existing is not null) return ToDto(existing);

        var resolvedAt = clock.UtcNow;
        var document = BuildDocument(track, resolvedAt);
        var canonical = CanonicalJson.Canonicalize(document);
        var hash = CanonicalJson.Sha256Hex(canonical);
        var snapshot = new PolicySnapshot(caseId, resolvedAt, PlatformPolicyVersion, $"{track.ToLowerInvariant()}-v1", canonical, hash);
        db.Add(snapshot);
        await uow.CommitAsync(ct);
        return ToDto(snapshot);
    }

    async Task<Guid> IPolicySnapshotResolver.ResolveForCaseAsync(Guid caseId, string track, CancellationToken ct)
        => (await ResolveForCaseAsync(caseId, track, ct)).Id;

    public async Task<PolicySnapshotDto?> FindAsync(Guid snapshotId, CancellationToken ct)
    {
        var s = await db.Set<PolicySnapshot>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == snapshotId, ct);
        return s is null ? null : ToDto(s);
    }

    private static PolicySnapshotDto ToDto(PolicySnapshot s)
        => new(s.Id, s.CaseId, s.ResolvedAt, s.PlatformPolicyVersion, s.TrackPolicyVersion, s.DocumentJson, s.DocumentHash, s.SupersedesId);

    /// <summary>Rule đã resolve cho case: gate từng stage, quy tắc COI, retention class (§9.3).</summary>
    private static object BuildDocument(string track, DateTimeOffset resolvedAt) => new
    {
        track,
        platformPolicyVersion = PlatformPolicyVersion,
        trackPolicyVersion = $"{track.ToLowerInvariant()}-v1",
        resolvedAt = resolvedAt.ToUniversalTime().ToString("O"),
        gates = new Dictionary<string, string[]>
        {
            ["QUALIFICATION"] = ["PROBLEM_OWNER", "LEAD_BROKER", "ACTIVE_DEMAND_VERSION", "BUDGET_PATH"],
            ["MATCHING"] = ["HARD_FILTER", "REASON_PER_CANDIDATE"],
            ["DUE_DILIGENCE"] = ["MANDATORY_EVALUATION"],
            ["DEAL_DESIGN"] = ["TERMS_FROZEN", "OUTCOME_DEFINITION_FROZEN", "FEE_AGREEMENT_FROZEN"],
            ["EXECUTION"] = ["AGREEMENT_EFFECTIVE", "EXECUTION_PLAN_FROZEN"],
            ["OUTCOME_VERIFICATION"] = ["INDEPENDENT_VERIFIER"],
            ["CLOSED"] = ["NO_OPEN_OBLIGATION"],
        },
        conflictOfInterest = new
        {
            verifierCannotBeProvider = true,
            verifierCannotBeLeadBroker = true,
            verifierCannotBeBeneficiary = true,
        },
        retentionClass = "CASE_STANDARD",
        canonicalizationVersion = CanonicalJson.Version,
    };
}
