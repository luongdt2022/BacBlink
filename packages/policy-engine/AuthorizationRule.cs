namespace NacenTech.PolicyEngine;

/// <summary>
/// Một hàng của DecisionTable (§23.2, D2-21). Chiều điều kiện null = "bất kỳ".
/// First-match theo Priority tăng dần; ô không phủ = DENY.
/// AccessGrant/purpose/COI KHÔNG nạp vào đây (tầng 2 ở SQL); chỉ cờ `AccessGrantRequired` cho biết
/// rule này yêu cầu caller đã kiểm grant ở tầng 2 (request.AccessGrantVerified == true).
/// </summary>
public sealed record AuthorizationRule(
    string RuleId,
    int Priority,
    string Action,
    string? PlatformRole,
    string? OrganizationRelation,
    string? CaseRole,
    string? ProgramRole,
    string? PartnerNodeMandate,
    string? InterAgencyMandate,
    string? DocumentClassification,
    string? Purpose,
    bool? AccessGrantRequired,
    string? ConflictStatus,
    string? RiskCondition,
    Effect Effect,
    string? DecisionRecordRef = null,
    string? Description = null);

public enum Effect
{
    Permit,
    Deny,
}

public sealed record RuleSet(string Version, DateTimeOffset EffectiveFrom, IReadOnlyList<AuthorizationRule> Rules);

/// <summary>Chiều đầu vào của một lần đánh giá. Chuỗi rỗng/null = không có.</summary>
public sealed record AuthorizationRequest(
    string Action,
    string PlatformRole,
    string? OrganizationRelation = null,
    string? CaseRole = null,
    string? ProgramRole = null,
    string? PartnerNodeMandate = null,
    string? InterAgencyMandate = null,
    string? DocumentClassification = null,
    string? Purpose = null,
    bool AccessGrantVerified = false,
    string? ConflictStatus = null,
    string? RiskCondition = null);

public sealed record AuthorizationDecision(Effect Effect, string RuleId, string RuleSetVersion)
{
    public bool IsPermitted => Effect == Effect.Permit;
}

/// <summary>Quan hệ actor ↔ tổ chức/subject. OWNER = actor là chủ sở hữu record.</summary>
public static class OrganizationRelations
{
    public const string Owner = "OWNER";
    public const string SameOrganization = "SAME_ORGANIZATION";
    public const string None = "NONE";
}

/// <summary>Trạng thái xung đột lợi ích đã kiểm (§4.4).</summary>
public static class ConflictStatuses
{
    public const string Clear = "CLEAR";
    public const string Declared = "DECLARED";
    public const string Blocked = "BLOCKED";
    public const string Unknown = "UNKNOWN";
}
