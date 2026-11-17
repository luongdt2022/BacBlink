using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Api.V1Compat;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Audit.Domain;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Policy.Application;
using NacenTech.Modules.Policy.Domain;
using Shouldly;
using NacenTech.TestKit;
using Xunit;

namespace NacenTech.Tests.Contracts;

/// Developer regression using isolated PostgreSQL; not the black-box QC sign-off.
[Collection(PostgresCollection.Name)]
public sealed class ExpertApprovalAndSectorPersistenceTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    [Theory]
    [InlineData("REQUEST_CHANGES", "CHANGES_REQUESTED")]
    [InlineData("REJECT", "REJECTED")]
    [InlineData("REVOKE", "REJECTED")]
    public async Task Approval_then_nonapproval_persists_status_and_removes_public_listing(string action, string status)
    {
        var personId = Guid.NewGuid();
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.NewGuid()));
        Guid profileId;
        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<DbContext>();
            var profile = ExpertProfile.CreateQuickIntake("Chuyên gia kiểm định", "0900000000", $"expert-{personId:N}@example.test", "Tiến sĩ", "Viện kiểm định", "LVTEST", [], null, DateTimeOffset.UtcNow);
            profile.LinkToPerson(personId);
            db.Set<ExpertProfile>().Add(profile);
            await scope.ServiceProvider.GetRequiredService<IUnitOfWork>().CommitAsync(Ct);
            profileId = profile.Id;
            var synchronize = scope.ServiceProvider.GetRequiredService<IExpertApprovalSynchronizer>();
            await synchronize.ApplyAsync(personId, JsonSerializer.Serialize(new { id = profileId }), "APPROVE", "Đạt", Ct);
            profile.SetPublicListing(true, true, "Nội dung công khai");
            await scope.ServiceProvider.GetRequiredService<IUnitOfWork>().CommitAsync(Ct);
            await synchronize.ApplyAsync(personId, JsonSerializer.Serialize(new { Id = profileId }), action, "Cần rà soát", Ct);
            await scope.ServiceProvider.GetRequiredService<IUnitOfWork>().CommitAsync(Ct);
        }
        using var verify = provider.CreateScope();
        var persisted = await verify.ServiceProvider.GetRequiredService<DbContext>().Set<ExpertProfile>().AsNoTracking().SingleAsync(x => x.Id == profileId);
        persisted.Status.ShouldBe(status);
        persisted.VisibilityStatus.ShouldBe("PRIVATE");
        persisted.IsAcceptingConsultation.ShouldBeFalse();
    }

    [Fact]
    public async Task Foreign_owner_cannot_synchronize_another_expert_profile()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var profile = ExpertProfile.CreateQuickIntake("Chuyên gia", "0900000000", $"expert-{Guid.NewGuid():N}@example.test", "Tiến sĩ", "Viện", "LVTEST", [], null, DateTimeOffset.UtcNow);
        profile.LinkToPerson(Guid.NewGuid());
        var db = scope.ServiceProvider.GetRequiredService<DbContext>();
        db.Set<ExpertProfile>().Add(profile);
        await scope.ServiceProvider.GetRequiredService<IUnitOfWork>().CommitAsync(Ct);
        await Should.ThrowAsync<NotFoundException>(() => scope.ServiceProvider.GetRequiredService<IExpertApprovalSynchronizer>()
            .ApplyAsync(Guid.NewGuid(), JsonSerializer.Serialize(new { id = profile.Id }), "APPROVE", "Đạt", Ct));
        db.ChangeTracker.Clear();
        (await db.Set<ExpertProfile>().SingleAsync(x => x.Id == profile.Id)).Status.ShouldBe("DRAFT");
    }

    [Fact]
    public async Task Assign_persists_3tier_global_role_and_rejects_legacy_sector_role_without_mutating_role()
    {
        var actor = new TestActor().AsAdmin(Guid.NewGuid());
        await using var provider = fixture.BuildProvider(actor);
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<DbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var person = Person.Register($"member-{Guid.NewGuid():N}@example.test", "test-hash", PasswordHashAlgorithms.Pbkdf2V3, "Hội viên", "Kiểm định", null, null, true);
        db.Set<Person>().Add(person);
        await uow.CommitAsync(Ct);

        var controller = new RoleController(scope.ServiceProvider.GetRequiredService<IPersonService>())
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { RequestServices = scope.ServiceProvider } }
        };

        // 1. GetRoles & GetPermissionsMatrix chỉ trả về 3 cấp BACLINK (ADMIN, ENTERPRISE, PUBLIC_USER)
        var rolesOk = controller.GetRoles().ShouldBeOfType<OkObjectResult>();
        var rolesJson = JsonSerializer.Serialize(rolesOk.Value);
        rolesJson.ShouldContain(PlatformRoles.Admin);
        rolesJson.ShouldContain(PlatformRoles.Enterprise);
        rolesJson.ShouldContain(PlatformRoles.PublicUser);
        rolesJson.ShouldNotContain("PROVINCIAL_ADMIN");
        rolesJson.ShouldNotContain("SECTOR_ADMIN");

        // 2. Gán vai trò chuẩn 3 cấp ENTERPRISE với ScopeTypes.Global -> Thành công và ghi AuditEvent
        (await controller.AssignRole(new AssignRoleDto { Email = person.Email, Role = PlatformRoles.Enterprise, ScopeType = ScopeTypes.Global, ScopeId = null }, Ct)).ShouldBeOfType<OkObjectResult>();
        db.ChangeTracker.Clear();
        var persisted = await db.Set<Person>().SingleAsync(x => x.Id == person.Id);
        persisted.PlatformRole.ShouldBe(PlatformRoles.Enterprise);
        persisted.ScopeType.ShouldBe(ScopeTypes.Global);
        persisted.ScopeId.ShouldBeNull();

        // 3. Từ chối vai trò/phạm vi phân tầng cũ (SECTOR_ADMIN / ScopeTypes.Sector) mà không làm biến đổi role/scope hiện có
        (await controller.AssignRole(new AssignRoleDto { Email = person.Email, Role = "SECTOR_ADMIN", ScopeType = ScopeTypes.Sector, ScopeId = "IND_ELEC" }, Ct)).ShouldBeOfType<BadRequestObjectResult>();
        (await controller.AssignRole(new AssignRoleDto { Email = person.Email, Role = PlatformRoles.PublicUser, ScopeType = ScopeTypes.Province, ScopeId = "BN" }, Ct)).ShouldBeOfType<BadRequestObjectResult>();
        db.ChangeTracker.Clear();
        var unchanged = await db.Set<Person>().SingleAsync(x => x.Id == person.Id);
        unchanged.PlatformRole.ShouldBe(PlatformRoles.Enterprise);
        unchanged.ScopeType.ShouldBe(ScopeTypes.Global);
        unchanged.ScopeId.ShouldBeNull();
        (await db.Set<AuditEvent>().CountAsync(x => x.ObjectId == person.Id && x.Action == "person.provision_role" && x.Outcome == AuditOutcomes.Success)).ShouldBe(1);

        // 4. Non-admin (kể cả legacy PROVINCIAL_ADMIN) bị chặn Forbid khi gọi GetOfficers / AssignRole
        await using var nonAdminProvider = fixture.BuildProvider(new TestActor { PersonId = Guid.NewGuid(), PlatformRole = "PROVINCIAL_ADMIN", ScopeType = ScopeTypes.Province, ScopeId = "BN" });
        using var nonAdminScope = nonAdminProvider.CreateScope();
        var nonAdminController = new RoleController(nonAdminScope.ServiceProvider.GetRequiredService<IPersonService>())
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { RequestServices = nonAdminScope.ServiceProvider } }
        };
        (await nonAdminController.GetOfficers(Ct)).ShouldBeOfType<ForbidResult>();
        (await nonAdminController.AssignRole(new AssignRoleDto { Email = person.Email, Role = PlatformRoles.Admin, ScopeType = ScopeTypes.Global }, Ct)).ShouldBeOfType<ForbidResult>();
    }
}
