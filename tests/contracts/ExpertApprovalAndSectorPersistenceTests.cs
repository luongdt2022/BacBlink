using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Api.V1Compat;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
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
    public async Task Assign_persists_runtime_sector_and_rejects_deactivated_sector_without_mutating_role()
    {
        var actor = new TestActor().AsAdmin(Guid.NewGuid());
        await using var provider = fixture.BuildProvider(actor);
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<DbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var sectorCode = "LV" + Guid.NewGuid().ToString("N")[..12].ToUpperInvariant();
        var sector = new TaxonomyTerm("SECTOR", "Ngành runtime kiểm định", sectorCode);
        var person = Person.Register($"officer-{Guid.NewGuid():N}@example.test", "test-hash", PasswordHashAlgorithms.Pbkdf2V3, "Cán bộ", "Kiểm định", null, null, true);
        db.Set<TaxonomyTerm>().Add(sector); db.Set<Person>().Add(person);
        await uow.CommitAsync(Ct);
        var controller = new RoleController(db, uow, scope.ServiceProvider.GetRequiredService<ITaxonomyService>()) {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { RequestServices = scope.ServiceProvider } }
        };
        (await controller.AssignRole(new AssignRoleDto { Email = person.Email, Role = PlatformRoles.SectorAdmin, ScopeType = ScopeTypes.Sector, ScopeId = sectorCode }, Ct)).ShouldBeOfType<OkObjectResult>();
        db.ChangeTracker.Clear();
        var persisted = await db.Set<Person>().SingleAsync(x => x.Id == person.Id);
        persisted.ScopeId.ShouldBe(sectorCode); persisted.PlatformRole.ShouldBe(PlatformRoles.SectorAdmin);
        var active = await db.Set<TaxonomyTerm>().SingleAsync(x => x.Id == sector.Id);
        active.Deactivate(); await uow.CommitAsync(Ct);
        (await controller.AssignRole(new AssignRoleDto { Email = person.Email, Role = PlatformRoles.SectorAdmin, ScopeType = ScopeTypes.Sector, ScopeId = sectorCode }, Ct)).ShouldBeOfType<BadRequestObjectResult>();
        db.ChangeTracker.Clear();
        (await db.Set<Person>().SingleAsync(x => x.Id == person.Id)).ScopeId.ShouldBe(sectorCode);
        (await db.Set<ApprovalAuditLog>().CountAsync(x => x.TargetId == person.Id.ToString() && x.Action == "ASSIGN_ROLE")).ShouldBe(1);
    }
}
