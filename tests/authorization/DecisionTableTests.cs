using NacenTech.Kernel.Application;
using NacenTech.Persistence;
using NacenTech.PolicyEngine;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Authorization;

/// <summary>
/// §23.2 + AC 5/17/28. Kiểm thử ví dụ là không đủ với mười chiều quyết định, nên bài quan trọng nhất
/// là bài vét cạn: KHÔNG tổ hợp nào đọc được tài liệu mật khi thiếu AccessGrant hiệu lực.
/// </summary>
public sealed class DecisionTableTests
{
    private static readonly DecisionTable Table = new(RuleSetLoader.FromFile(
        PersistenceServiceCollectionExtensions.ResolvePath("config/policies/authorization-rules.v1.json")));

    private static readonly string[] Roles = [PlatformRoles.Anonymous, PlatformRoles.User, PlatformRoles.Admin, PlatformRoles.System];
    private static readonly string?[] Relations = [null, OrganizationRelations.Owner, OrganizationRelations.SameOrganization, OrganizationRelations.None];
    private static readonly string?[] CaseRoles = [null, "PROBLEM_OWNER", "LEAD_BROKER", "CO_BROKER", "PROVIDER", "EVALUATOR", "VERIFIER", "SPONSOR"];
    private static readonly string[] Confidential = ["CONFIDENTIAL", "HIGHLY_CONFIDENTIAL"];

    /// <summary>
    /// Bất biến tuyệt đối: không có grant đã kiểm và không phải chủ sở hữu thì không đọc được tài liệu mật,
    /// kể cả admin, kể cả mọi case role, mọi purpose.
    /// </summary>
    [Fact]
    public void No_combination_reads_confidential_without_grant()
    {
        var permitted = new List<string>();

        foreach (var role in Roles)
        {
            if (role == PlatformRoles.System) continue; // worker nội bộ, không phải người dùng
            foreach (var relation in Relations)
            {
                if (relation == OrganizationRelations.Owner) continue; // chủ sở hữu được phép, đã có rule riêng
                foreach (var caseRole in CaseRoles)
                {
                    foreach (var classification in Confidential)
                    {
                        foreach (var purpose in Purposes.All.Append(null))
                        {
                            var request = new AuthorizationRequest(
                                Actions.DocumentRead, role,
                                OrganizationRelation: relation,
                                CaseRole: caseRole,
                                DocumentClassification: classification,
                                Purpose: purpose,
                                AccessGrantVerified: false);
                            var decision = Table.Evaluate(request);
                            if (decision.IsPermitted)
                                permitted.Add($"{role}/{relation}/{caseRole}/{classification}/{purpose} → {decision.RuleId}");
                        }
                    }
                }
            }
        }

        permitted.ShouldBeEmpty($"Đọc được tài liệu mật khi thiếu grant: {string.Join(" | ", permitted.Take(10))}");
    }

    [Fact]
    public void Grant_holder_can_read_confidential()
    {
        var decision = Table.Evaluate(new AuthorizationRequest(
            Actions.DocumentRead, PlatformRoles.User,
            OrganizationRelation: OrganizationRelations.None,
            DocumentClassification: "CONFIDENTIAL",
            Purpose: Purposes.DueDiligence,
            AccessGrantVerified: true));

        decision.IsPermitted.ShouldBeTrue();
        decision.RuleId.ShouldBe("GRANT_DOCUMENT_READ");
    }

    [Fact]
    public void Owner_can_read_own_confidential_document()
    {
        var decision = Table.Evaluate(new AuthorizationRequest(
            Actions.DocumentRead, PlatformRoles.User,
            OrganizationRelation: OrganizationRelations.Owner,
            DocumentClassification: "HIGHLY_CONFIDENTIAL"));

        decision.IsPermitted.ShouldBeTrue();
        decision.RuleId.ShouldBe("OWNER_DOCUMENT_READ");
    }

    [Fact]
    public void Public_document_is_readable_by_anonymous()
    {
        Table.Evaluate(new AuthorizationRequest(Actions.DocumentRead, PlatformRoles.Anonymous, DocumentClassification: "PUBLIC"))
            .IsPermitted.ShouldBeTrue();
    }

    [Fact]
    public void Blocked_conflict_denies_everything()
    {
        var decision = Table.Evaluate(new AuthorizationRequest(
            Actions.DocumentRead, PlatformRoles.Admin,
            OrganizationRelation: OrganizationRelations.Owner,
            DocumentClassification: "PUBLIC",
            ConflictStatus: ConflictStatuses.Blocked));

        decision.IsPermitted.ShouldBeFalse();
        decision.RuleId.ShouldBe("DENY_CONFLICT_BLOCKED");
    }

    [Fact]
    public void Anonymous_cannot_create_subject()
        => Table.Evaluate(new AuthorizationRequest(Actions.SubjectCreate, PlatformRoles.Anonymous)).IsPermitted.ShouldBeFalse();

    [Fact]
    public void Unknown_action_defaults_to_deny()
    {
        var decision = Table.Evaluate(new AuthorizationRequest("some.unmapped.action", PlatformRoles.User));
        decision.IsPermitted.ShouldBeFalse();
        decision.RuleId.ShouldBe(DecisionTable.DefaultDenyRuleId);
    }

    /// <summary>Deterministic: cùng request luôn trả cùng ruleId — điều kiện tái dựng quyết định sau nhiều năm.</summary>
    [Fact]
    public void Evaluation_is_deterministic()
    {
        var request = new AuthorizationRequest(Actions.SubjectUpdate, PlatformRoles.User, OrganizationRelation: OrganizationRelations.Owner);
        var first = Table.Evaluate(request);
        for (var i = 0; i < 50; i++)
        {
            var next = Table.Evaluate(request);
            next.RuleId.ShouldBe(first.RuleId);
            next.Effect.ShouldBe(first.Effect);
        }
    }

    [Fact]
    public void Admin_cannot_read_other_users_confidential_document()
    {
        var decision = Table.Evaluate(new AuthorizationRequest(
            Actions.DocumentRead, PlatformRoles.Admin,
            OrganizationRelation: OrganizationRelations.None,
            DocumentClassification: "CONFIDENTIAL",
            AccessGrantVerified: false));

        decision.IsPermitted.ShouldBeFalse();
        decision.RuleId.ShouldBe("DENY_CONFIDENTIAL_WITHOUT_GRANT");
    }

    [Fact]
    public void Rule_ids_are_unique_and_ruleset_is_versioned()
    {
        Table.RuleSet.Version.ShouldNotBeNullOrWhiteSpace();
        Table.RuleSet.Rules.Select(r => r.RuleId).Distinct().Count().ShouldBe(Table.RuleSet.Rules.Count);
    }
}
