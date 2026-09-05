using System.Text.Json;
using System.Text.Json.Serialization;

namespace NacenTech.PolicyEngine;

/// <summary>Nạp rule set từ JSON versioned trong `config/policies/` (§9.4.3: cấu hình có schema, version, effective date).</summary>
public static class RuleSetLoader
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true,
    };

    public static RuleSet FromJson(string json)
    {
        var dto = JsonSerializer.Deserialize<RuleSetDto>(json, Options)
                  ?? throw new InvalidOperationException("Rule set JSON rỗng");
        if (string.IsNullOrWhiteSpace(dto.Version)) throw new InvalidOperationException("Rule set thiếu version");
        var rules = dto.Rules.Select(r => new AuthorizationRule(
            r.RuleId, r.Priority, r.Action, r.PlatformRole, r.OrganizationRelation, r.CaseRole, r.ProgramRole,
            r.PartnerNodeMandate, r.InterAgencyMandate, r.DocumentClassification, r.Purpose, r.AccessGrantRequired,
            r.ConflictStatus, r.RiskCondition, r.Effect, r.DecisionRecordRef, r.Description)).ToList();
        return new RuleSet(dto.Version, dto.EffectiveFrom, rules);
    }

    public static RuleSet FromFile(string path) => FromJson(File.ReadAllText(path));

    private sealed record RuleSetDto(string Version, DateTimeOffset EffectiveFrom, List<RuleDto> Rules);

    private sealed record RuleDto(
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
        string? DecisionRecordRef,
        string? Description);
}
