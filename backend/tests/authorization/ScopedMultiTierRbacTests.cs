using NacenTech.Kernel.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.PolicyEngine;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Authorization;

/// <summary>
/// Kiểm thử hệ thống RBAC 3 cấp BACLINK (CR-BACLINK-001: ADMIN, ENTERPRISE, PUBLIC_USER)
/// với ScopeTypes.Global mặc định và tương thích ngược NormalizeTier.
/// </summary>
public sealed class ScopedMultiTierRbacTests
{
    private static readonly DecisionTable Table = new(RuleSetLoader.FromFile(
        PersistenceServiceCollectionExtensions.ResolvePath("config/policies/authorization-rules.v1.json")));

    [Fact]
    public void Three_canonical_platform_roles_and_normalize_tier_are_correctly_defined()
    {
        PlatformRoles.Admin.ShouldBe("ADMIN");
        PlatformRoles.Enterprise.ShouldBe("ENTERPRISE");
        PlatformRoles.PublicUser.ShouldBe("PUBLIC_USER");
        PlatformRoles.Core.Count.ShouldBe(3);

        PlatformRoles.NormalizeTier("ADMIN").ShouldBe(PlatformRoles.Admin);
        PlatformRoles.NormalizeTier("SUPER_ADMIN").ShouldBe(PlatformRoles.Admin);
        PlatformRoles.NormalizeTier("OPERATOR_ADMIN").ShouldBe(PlatformRoles.Admin);

        PlatformRoles.NormalizeTier("ENTERPRISE").ShouldBe(PlatformRoles.Enterprise);
        PlatformRoles.NormalizeTier("SELLER").ShouldBe(PlatformRoles.Enterprise);
        PlatformRoles.NormalizeTier("BUYER").ShouldBe(PlatformRoles.Enterprise);
        PlatformRoles.NormalizeTier("INNOVATION_ENTITY").ShouldBe(PlatformRoles.Enterprise);
        PlatformRoles.NormalizeTier("VERIFIED_EXPERT").ShouldBe(PlatformRoles.Enterprise);

        PlatformRoles.NormalizeTier("PUBLIC_USER").ShouldBe(PlatformRoles.PublicUser);
        PlatformRoles.NormalizeTier("PROVINCIAL_ADMIN").ShouldBe(PlatformRoles.PublicUser);
        PlatformRoles.NormalizeTier("SECTOR_ADMIN").ShouldBe(PlatformRoles.PublicUser);
        PlatformRoles.NormalizeTier("CLUSTER_ADMIN").ShouldBe(PlatformRoles.PublicUser);
        PlatformRoles.NormalizeTier(null).ShouldBe(PlatformRoles.PublicUser);
        PlatformRoles.NormalizeTier("UNKNOWN").ShouldBe(PlatformRoles.PublicUser);
    }

    [Fact]
    public void All_scope_types_are_correctly_defined()
    {
        ScopeTypes.Global.ShouldBe("GLOBAL");
        ScopeTypes.Province.ShouldBe("PROVINCE");
        ScopeTypes.Sector.ShouldBe("SECTOR");
        ScopeTypes.OrgUnit.ShouldBe("ORG_UNIT");
    }

    [Theory]
    [InlineData(PlatformRoles.Admin)]
    [InlineData("SUPER_ADMIN")]
    [InlineData("OPERATOR_ADMIN")]
    public void Senior_administrators_have_admin_manage_and_governance_review_permission(string adminRole)
    {
        var decision = Table.Evaluate(new AuthorizationRequest("person.admin_manage", adminRole));
        decision.IsPermitted.ShouldBeTrue($"Role {adminRole} phải có quyền person.admin_manage");
        decision.RuleId.ShouldBe("ADMIN_MANAGE");

        var govDecision = Table.Evaluate(new AuthorizationRequest("governance.review", adminRole));
        govDecision.IsPermitted.ShouldBeTrue($"Role {adminRole} phải có quyền governance.review");
        govDecision.RuleId.ShouldBe("GOVERNANCE_REVIEW");
    }

    [Theory]
    [InlineData(PlatformRoles.Admin, true)]
    [InlineData("SUPER_ADMIN", true)]
    [InlineData("OPERATOR_ADMIN", true)]
    [InlineData(PlatformRoles.Enterprise, false)]
    [InlineData("PROVINCIAL_ADMIN", false)]
    [InlineData(PlatformRoles.PublicUser, false)]
    public void Only_elevated_actors_can_provision_canonical_roles(string role, bool expected)
        => Table.Evaluate(new AuthorizationRequest("person.provision_role", role)).IsPermitted.ShouldBe(expected);

    [Theory]
    [InlineData(PlatformRoles.Enterprise)]
    [InlineData(PlatformRoles.PublicUser)]
    [InlineData("PROVINCIAL_ADMIN")]
    [InlineData("SECTOR_ADMIN")]
    [InlineData("CLUSTER_ADMIN")]
    [InlineData("SELLER")]
    [InlineData("BUYER")]
    [InlineData("VERIFIED_EXPERT")]
    [InlineData("INNOVATION_ENTITY")]
    public void Non_admin_roles_cannot_execute_admin_or_governance_review_actions(string subRole)
    {
        var adminDecision = Table.Evaluate(new AuthorizationRequest("person.admin_manage", subRole));
        adminDecision.IsPermitted.ShouldBeFalse($"Role {subRole} không được phép thực hiện person.admin_manage");
        adminDecision.RuleId.ShouldBe("DEFAULT_DENY");

        var govDecision = Table.Evaluate(new AuthorizationRequest("governance.review", subRole));
        govDecision.IsPermitted.ShouldBeFalse($"Role {subRole} không được phép thực hiện governance.review");
        govDecision.RuleId.ShouldBe("DEFAULT_DENY");
    }

    [Theory]
    [InlineData(PlatformRoles.Enterprise)]
    [InlineData(PlatformRoles.PublicUser)]
    [InlineData("SELLER")]
    [InlineData("BUYER")]
    public void Authenticated_users_can_manage_own_profile_and_search(string role)
    {
        var selfDecision = Table.Evaluate(new AuthorizationRequest("person.read_self", role));
        selfDecision.IsPermitted.ShouldBeTrue($"Role {role} phải đọc được profile của chính mình");
        selfDecision.RuleId.ShouldBe("USER_SELF");

        var searchDecision = Table.Evaluate(new AuthorizationRequest("search.query", role));
        searchDecision.IsPermitted.ShouldBeTrue($"Role {role} phải thực hiện được tìm kiếm");
        searchDecision.RuleId.ShouldBe("USER_SEARCH");
    }

    [Fact]
    public void Enterprise_role_can_create_and_manage_own_lms_while_public_user_cannot()
    {
        Table.Evaluate(new AuthorizationRequest("lms.create", PlatformRoles.Enterprise)).IsPermitted.ShouldBeTrue();
        Table.Evaluate(new AuthorizationRequest("lms.create", PlatformRoles.PublicUser)).IsPermitted.ShouldBeFalse();
    }

    [Fact]
    public void Person_entity_defaults_to_global_scope_and_upgrades_to_enterprise_global()
    {
        var defaultPerson = Person.Register("test@baclink.vn", "hash", "algo", "Van A", "Nguyen", null, null, true);
        defaultPerson.ScopeType.ShouldBe(ScopeTypes.Global);
        defaultPerson.ScopeId.ShouldBeNull();
        defaultPerson.PlatformRole.ShouldBe(PlatformRoles.PublicUser);

        defaultPerson.AssignRoleAndScope(PlatformRoles.Enterprise, ScopeTypes.Global, null);
        defaultPerson.PlatformRole.ShouldBe(PlatformRoles.Enterprise);
        defaultPerson.ScopeType.ShouldBe(ScopeTypes.Global);
        defaultPerson.ScopeId.ShouldBeNull();
    }

    [Theory]
    [InlineData(PlatformRoles.Admin, ScopeTypes.Global, null, true)]
    [InlineData(PlatformRoles.Enterprise, ScopeTypes.Global, null, true)]
    [InlineData(PlatformRoles.PublicUser, ScopeTypes.Global, null, true)]
    [InlineData(PlatformRoles.Admin, ScopeTypes.Province, "BN", false)]
    [InlineData(PlatformRoles.Enterprise, ScopeTypes.Province, "BN", false)]
    [InlineData(PlatformRoles.PublicUser, ScopeTypes.Province, "HN", false)]
    [InlineData(PlatformRoles.Enterprise, ScopeTypes.Global, "BN", false)]
    [InlineData("PROVINCIAL_ADMIN", ScopeTypes.Province, "HN", false)]
    [InlineData(PlatformRoles.User, ScopeTypes.Global, null, false)]
    public void Canonical_role_scope_pairs_are_validated(string role, string scopeType, string? scopeId, bool expected)
        => ScopeTypes.IsValidForRole(role, scopeType, scopeId).ShouldBe(expected);
}
