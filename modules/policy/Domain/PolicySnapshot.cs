using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Policy.Domain;

/// <summary>§9.3: JSONB bất biến; đổi phải tạo snapshot mới với SupersedesId + DecisionRecord riêng (CASE-14).</summary>
public sealed class PolicySnapshot : AggregateRoot
{
    private PolicySnapshot() { }

    public PolicySnapshot(Guid caseId, DateTimeOffset resolvedAt, string platformPolicyVersion, string trackPolicyVersion, string documentJson, string documentHash, Guid? supersedesId = null)
    {
        CaseId = caseId;
        ResolvedAt = resolvedAt;
        PlatformPolicyVersion = platformPolicyVersion;
        TrackPolicyVersion = trackPolicyVersion;
        DocumentJson = documentJson;
        DocumentHash = documentHash;
        SupersedesId = supersedesId;
    }

    public Guid CaseId { get; private set; }
    public DateTimeOffset ResolvedAt { get; private set; }
    public string PlatformPolicyVersion { get; private set; } = string.Empty;
    public string TrackPolicyVersion { get; private set; } = string.Empty;
    public string DocumentJson { get; private set; } = string.Empty;
    public string DocumentHash { get; private set; } = string.Empty;
    public string CanonicalizationVersion { get; private set; } = Contracts.Canonical.CanonicalJson.Version;
    public Guid? SupersedesId { get; private set; }
    public Guid? SupersedeDecisionRecordId { get; private set; }
    /// <summary>false khi đã bị snapshot mới supersede.</summary>
    public bool IsCurrent { get; private set; } = true;

    public void Supersede(Guid decisionRecordId)
    {
        IsCurrent = false;
        SupersedeDecisionRecordId = decisionRecordId;
        Touch();
    }
}
