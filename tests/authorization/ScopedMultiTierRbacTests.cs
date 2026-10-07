using NacenTech.Kernel.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.PolicyEngine;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Authorization;

/// <summary>
/// Kiểm thử hệ thống Phân Quyền Đa Tầng 3 Chiều (3D Scoped RBAC) & 10 Vai Trò Hạt Nhân.
/// Đảm bảo tính tương thích ngược và không vi phạm các nguyên tắc Default Deny.
/// </summary>
public sealed class ScopedMultiTierRbacTests
{
    private static readonly DecisionTable Table = new(RuleSetLoader.FromFile(
        PersistenceServiceCollectionExtensions.ResolvePath("config/policies/authorization-rules.v1.json")));

    [Fact]
    public void All_ten_platform_roles_are_correctly_defined()
    {
        PlatformRoles.SuperAdmin.ShouldBe("SUPER_ADMIN");
        PlatformRoles.OperatorAdmin.ShouldBe("OPERATOR_ADMIN");
        PlatformRoles.ProvincialAdmin.ShouldBe("PROVINCIAL_ADMIN");
        PlatformRoles.SectorAdmin.ShouldBe("SECTOR_ADMIN");
        PlatformRoles.ClusterAdmin.ShouldBe("CLUSTER_ADMIN");
        PlatformRoles.Seller.ShouldBe("SELLER");
        PlatformRoles.Buyer.ShouldBe("BUYER");
        PlatformRoles.InnovationEntity.ShouldBe("INNOVATION_ENTITY");
        PlatformRoles.VerifiedExpert.ShouldBe("VERIFIED_EXPERT");
        PlatformRoles.PublicUser.ShouldBe("PUBLIC_USER");
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
    [InlineData(PlatformRoles.SuperAdmin)]
    [InlineData(PlatformRoles.OperatorAdmin)]
    public void Senior_administrators_have_admin_manage_permission(string adminRole)
    {
        var decision = Table.Evaluate(new AuthorizationRequest("person.admin_manage", adminRole));
        decision.IsPermitted.ShouldBeTrue($"Role {adminRole} phải có quyền person.admin_manage");
        decision.RuleId.ShouldBe("ADMIN_MANAGE");
    }

    [Theory]
    [InlineData(PlatformRoles.Admin, true)]
    [InlineData(PlatformRoles.SuperAdmin, true)]
    [InlineData(PlatformRoles.OperatorAdmin, true)]
    [InlineData(PlatformRoles.ProvincialAdmin, false)]
    [InlineData(PlatformRoles.PublicUser, false)]
    public void Only_elevated_actors_can_provision_canonical_roles(string role, bool expected)
        => Table.Evaluate(new AuthorizationRequest("person.provision_role", role)).IsPermitted.ShouldBe(expected);

    [Theory]
    [InlineData(PlatformRoles.ProvincialAdmin)]
    [InlineData(PlatformRoles.SectorAdmin)]
    [InlineData(PlatformRoles.ClusterAdmin)]
    [InlineData(PlatformRoles.Seller)]
    [InlineData(PlatformRoles.Buyer)]
    [InlineData(PlatformRoles.VerifiedExpert)]
    [InlineData(PlatformRoles.InnovationEntity)]
    [InlineData(PlatformRoles.PublicUser)]
    public void Sub_entities_cannot_execute_admin_manage_actions(string subRole)
    {
        var decision = Table.Evaluate(new AuthorizationRequest("person.admin_manage", subRole));
        decision.IsPermitted.ShouldBeFalse($"Role {subRole} không được phép thực hiện person.admin_manage");
        decision.RuleId.ShouldBe("DEFAULT_DENY");
    }

    [Theory]
    [InlineData(PlatformRoles.Seller)]
    [InlineData(PlatformRoles.Buyer)]
    [InlineData(PlatformRoles.VerifiedExpert)]
    [InlineData(PlatformRoles.ProvincialAdmin)]
    public void Authenticated_sub_entities_can_manage_own_profile_and_search(string role)
    {
        var selfDecision = Table.Evaluate(new AuthorizationRequest("person.read_self", role));
        selfDecision.IsPermitted.ShouldBeTrue($"Role {role} phải đọc được profile của chính mình");
        selfDecision.RuleId.ShouldBe("USER_SELF");

        var searchDecision = Table.Evaluate(new AuthorizationRequest("search.query", role));
        searchDecision.IsPermitted.ShouldBeTrue($"Role {role} phải thực hiện được tìm kiếm");
        searchDecision.RuleId.ShouldBe("USER_SEARCH");
    }

    [Fact]
    public void Person_entity_defaults_to_global_scope_and_allows_custom_scope()
    {
        var defaultPerson = Person.Register("test@nacentech.vn", "hash", "algo", "Van A", "Nguyen", null, null, true);
        defaultPerson.ScopeType.ShouldBe(ScopeTypes.Global);
        defaultPerson.ScopeId.ShouldBeNull();
        defaultPerson.PlatformRole.ShouldBe(PlatformRoles.PublicUser);

        var provincialAdmin = Person.Register(
            "so_khcn_hn@hanoi.gov.vn", "hash", "algo", "Lan", "Tran", null, "Sở KH&CN Hà Nội", true,
            PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HN");
        
        provincialAdmin.PlatformRole.ShouldBe(PlatformRoles.ProvincialAdmin);
        provincialAdmin.ScopeType.ShouldBe(ScopeTypes.Province);
        provincialAdmin.ScopeId.ShouldBe("HN");

        provincialAdmin.AssignRoleAndScope(PlatformRoles.ClusterAdmin, ScopeTypes.OrgUnit, "DH_QGHN");
        provincialAdmin.PlatformRole.ShouldBe(PlatformRoles.ClusterAdmin);
        provincialAdmin.ScopeType.ShouldBe(ScopeTypes.OrgUnit);
        provincialAdmin.ScopeId.ShouldBe("DH_QGHN");
    }

    [Theory]
    [InlineData(PlatformRoles.SuperAdmin, ScopeTypes.Global, null, true)]
    [InlineData(PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HN", true)]
    [InlineData(PlatformRoles.SectorAdmin, ScopeTypes.Sector, "CN_THONG_TIN", true)]
    [InlineData(PlatformRoles.ClusterAdmin, ScopeTypes.OrgUnit, "DH_QGHN", true)]
    [InlineData(PlatformRoles.PublicUser, ScopeTypes.Global, null, true)]
    [InlineData(PlatformRoles.PublicUser, ScopeTypes.Province, "HN", false)]
    [InlineData(PlatformRoles.ProvincialAdmin, ScopeTypes.Global, null, false)]
    [InlineData(PlatformRoles.User, ScopeTypes.Global, null, false)]
    public void Canonical_role_scope_pairs_are_validated(string role, string scopeType, string? scopeId, bool expected)
        => ScopeTypes.IsValidForRole(role, scopeType, scopeId).ShouldBe(expected);
}
