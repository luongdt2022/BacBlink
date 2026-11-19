namespace NacenTech.PolicyEngine;

/// <summary>
/// Bảng quyết định có version: deterministic, default DENY, trả ruleId (§23.2).
/// Cùng RuleSet + cùng request luôn cho cùng ruleId — điều kiện tái dựng quyết định sau nhiều năm.
/// </summary>
public sealed class DecisionTable
{
    public const string DefaultDenyRuleId = "DEFAULT_DENY";

    private readonly AuthorizationRule[] _ordered;

    public DecisionTable(RuleSet ruleSet)
    {
        RuleSet = ruleSet;
        _ordered = ruleSet.Rules.OrderBy(r => r.Priority).ThenBy(r => r.RuleId, StringComparer.Ordinal).ToArray();
        var dup = _ordered.GroupBy(r => r.RuleId).FirstOrDefault(g => g.Count() > 1);
        if (dup is not null) throw new InvalidOperationException($"RuleId trùng trong rule set {ruleSet.Version}: {dup.Key}");
    }

    public RuleSet RuleSet { get; }

    public AuthorizationDecision Evaluate(AuthorizationRequest request)
    {
        foreach (var rule in _ordered)
        {
            if (Matches(rule, request))
                return new AuthorizationDecision(rule.Effect, rule.RuleId, RuleSet.Version);
        }
        return new AuthorizationDecision(Effect.Deny, DefaultDenyRuleId, RuleSet.Version);
    }

    private static bool Matches(AuthorizationRule rule, AuthorizationRequest r)
    {
        if (!Eq(rule.Action, r.Action, allowWildcard: true)) return false;
        if (!Any(rule.PlatformRole, r.PlatformRole)) return false;
        if (!Any(rule.OrganizationRelation, r.OrganizationRelation)) return false;
        if (!Any(rule.CaseRole, r.CaseRole)) return false;
        if (!Any(rule.ProgramRole, r.ProgramRole)) return false;
        if (!Any(rule.PartnerNodeMandate, r.PartnerNodeMandate)) return false;
        if (!Any(rule.InterAgencyMandate, r.InterAgencyMandate)) return false;
        if (!Any(rule.DocumentClassification, r.DocumentClassification)) return false;
        if (!Any(rule.Purpose, r.Purpose)) return false;
        // true = chỉ khớp khi grant đã kiểm; false = chỉ khớp khi CHƯA có grant; null = bất kỳ.
        if (rule.AccessGrantRequired is true && !r.AccessGrantVerified) return false;
        if (rule.AccessGrantRequired is false && r.AccessGrantVerified) return false;
        if (!Any(rule.ConflictStatus, r.ConflictStatus)) return false;
        if (!Any(rule.RiskCondition, r.RiskCondition)) return false;
        return true;
    }

    // null trong rule = bất kỳ. Giá trị có thể là danh sách "A|B".
    private static bool Any(string? ruleValue, string? requestValue)
    {
        if (ruleValue is null) return true;
        if (requestValue is null) return false;
        foreach (var part in ruleValue.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (string.Equals(part, requestValue, StringComparison.Ordinal)) return true;
        }
        return false;
    }

    private static bool Eq(string ruleValue, string requestValue, bool allowWildcard)
    {
        if (allowWildcard && ruleValue == "*") return true;
        if (allowWildcard && ruleValue.EndsWith(".*", StringComparison.Ordinal))
            return requestValue.StartsWith(ruleValue[..^1], StringComparison.Ordinal);
        return Any(ruleValue, requestValue);
    }
}
