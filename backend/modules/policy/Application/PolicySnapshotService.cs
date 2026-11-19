using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NacenTech.Contracts.Canonical;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Policy.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Policy.Application;

/// <summary>
/// §9.3: snapshot chứa các rule case này thực sự chạm tới, lưu inline JSONB bất biến + hash JCS (D2-23).
/// Gate evaluation đọc từ snapshot, không đọc bảng policy hiện hành.
/// </summary>
public sealed class PolicySnapshotService(DbContext db, IUnitOfWork uow, IClock clock, FundingPolicySet funding)
    : IPolicySnapshotService, IPolicySnapshotResolver
{
    public const string PlatformPolicyVersion = "platform-v1";

    public async Task<PolicySnapshotDto> ResolveForCaseAsync(Guid caseId, string track, string fundingInstrument, CancellationToken ct)
    {
        var existing = await db.Set<PolicySnapshot>().AsNoTracking().FirstOrDefaultAsync(s => s.CaseId == caseId && s.IsCurrent, ct);
        if (existing is not null) return ToDto(existing);

        var resolvedAt = clock.UtcNow;
        var document = BuildDocument(track, fundingInstrument, resolvedAt);
        var canonical = CanonicalJson.Canonicalize(document);
        var hash = CanonicalJson.Sha256Hex(canonical);
        var snapshot = new PolicySnapshot(caseId, resolvedAt, PlatformPolicyVersion, $"{track.ToLowerInvariant()}-v1", canonical, hash);
        db.Add(snapshot);
        await uow.CommitAsync(ct);
        return ToDto(snapshot);
    }

    async Task<FundingPathResolution> IPolicySnapshotResolver.ResolveForCaseAsync(
        Guid caseId, string track, string fundingInstrument, CancellationToken ct)
    {
        var dto = await ResolveForCaseAsync(caseId, track, fundingInstrument, ct);
        return new FundingPathResolution(dto.Id, ReadExecutionPermitted(dto.DocumentJson));
    }

    public async Task<PolicySnapshotDto?> FindAsync(Guid snapshotId, CancellationToken ct)
    {
        var s = await db.Set<PolicySnapshot>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == snapshotId, ct);
        return s is null ? null : ToDto(s);
    }

    private static PolicySnapshotDto ToDto(PolicySnapshot s)
        => new(s.Id, s.CaseId, s.ResolvedAt, s.PlatformPolicyVersion, s.TrackPolicyVersion, s.DocumentJson, s.DocumentHash, s.SupersedesId);

    /// <summary>
    /// ADR-0014: kết luận đọc **từ ảnh chụp**, không tra lại tập luật hiện hành. Đó là toàn bộ nghĩa của việc
    /// đóng băng: một hồ sơ đang chạy phải giữ luật tại thời điểm chốt kể cả khi cấu hình đổi sau đó.
    ///
    /// Ảnh chụp cũ (chốt trước ADR-0014) không có khối `fundingPath` — trả `false`, theo default DENY. Một hồ sơ
    /// chốt trước khi luật tồn tại thì chưa có ai kết luận gì cho nó, và "chưa ai kết luận" không phải "được phép".
    /// </summary>
    private static bool ReadExecutionPermitted(string documentJson)
    {
        using var doc = JsonDocument.Parse(documentJson);
        return doc.RootElement.TryGetProperty("fundingPath", out var path)
               && path.TryGetProperty("executionInPlatformPermitted", out var permitted)
               && permitted.ValueKind == JsonValueKind.True;
    }

    /// <summary>Rule đã resolve cho case: gate từng stage, quy tắc COI, retention class (§9.3).</summary>
    private object BuildDocument(string track, string fundingInstrument, DateTimeOffset resolvedAt)
    {
        var rule = funding.Find(fundingInstrument);
        return new
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
                ["EXECUTION"] = ["AGREEMENT_EFFECTIVE", "EXECUTION_PLAN_FROZEN", "LAWFUL_EXECUTION_PATH"],
                ["OUTCOME_VERIFICATION"] = ["INDEPENDENT_VERIFIER"],
                ["CLOSED"] = ["NO_OPEN_OBLIGATION"],
            },
            // ADR-0014. Ghi cả **căn cứ** chứ không chỉ kết quả: một ảnh chụp nói "không được thực thi" mà không
            // nói theo văn bản nào thì tới lúc kiểm toán không ai dựng lại được vì sao.
            fundingPath = new
            {
                instrument = fundingInstrument,
                executionInPlatformPermitted = rule?.ExecutionInPlatformPermitted ?? false,
                legalBasisRef = rule?.LegalBasisRef,
                fundingPolicyVersion = funding.Version,
                ruleFound = rule is not null,
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
}
