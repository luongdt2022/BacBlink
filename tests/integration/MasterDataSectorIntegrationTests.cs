using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Api.V1Compat;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Policy.Application;
using NacenTech.Modules.Policy.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

[Collection(PostgresCollection.Name)]
public sealed class MasterDataSectorIntegrationTests(PostgresFixture fixture)
{
    [Fact]
    public async Task Database_Contains_10_Core_Sectors_From_Excel_Seed()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

        var sectors = await db.Set<TaxonomyTerm>()
            .Where(t => t.Kind == TaxonomyKinds.Sector && t.Code != null && t.Code.StartsWith("LV"))
            .ToListAsync();

        sectors.Count.ShouldBeGreaterThanOrEqualTo(10);

        var expectedCodes = new[] { "LV01", "LV05", "LV07", "LV08", "LV11", "LV12", "LV14", "LV15", "LV16", "LV17" };
        foreach (var code in expectedCodes)
        {
            sectors.ShouldContain(s => s.Code == code, $"Database must contain core sector {code}");
        }
    }

    [Fact]
    public async Task Unique_Constraint_On_Kind_And_Code_Prevents_Duplicate_Codes()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

        var duplicateTerm = new TaxonomyTerm(TaxonomyKinds.Sector, "Nông nghiệp trùng", "LV01", "{}");
        db.Set<TaxonomyTerm>().Add(duplicateTerm);

        await Should.ThrowAsync<DbUpdateException>(async () =>
        {
            await db.SaveChangesAsync();
        });
    }

    [Fact]
    public async Task GetSectors_Endpoint_Returns_Sectors_From_Database()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var taxonomyService = scope.ServiceProvider.GetRequiredService<ITaxonomyService>();

        var controller = new MasterDataControllers(taxonomyService);
        var actionResult = await controller.GetSectors(activeOnly: true);

        actionResult.ShouldBeOfType<OkObjectResult>();
        var okResult = (OkObjectResult)actionResult;
        okResult.Value.ShouldNotBeNull();
    }

    [Theory]
    [InlineData("SEC-01", "Ngành cũ")]
    [InlineData("SEC-AGRI", "Nông nghiệp mã cũ")]
    [InlineData("INVALID-CODE", "Mã không hợp lệ")]
    public async Task CreateSector_Endpoint_Rejects_Non_LV_Prefix_With_400(string invalidCode, string name)
    {
        var adminId = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor
        {
            PersonId = adminId,
            PlatformRole = PlatformRoles.Admin,
            ScopeType = ScopeTypes.Global
        });
        using var scope = provider.CreateScope();
        var taxonomyService = scope.ServiceProvider.GetRequiredService<ITaxonomyService>();

        var controller = new MasterDataControllers(taxonomyService);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext
            {
                RequestServices = scope.ServiceProvider
            }
        };

        var dto = new CreateSectorDto
        {
            Code = invalidCode,
            Name = name,
            Tt17Code = "C.10",
            Description = "Test invalid prefix"
        };

        var result = await controller.CreateSector(dto);
        result.ShouldBeOfType<BadRequestObjectResult>();
        var badRequest = (BadRequestObjectResult)result;
        badRequest.StatusCode.ShouldBe(400);
    }

    [Fact]
    public async Task CreateSector_Endpoint_Forbidden_For_Unauthorized_User()
    {
        var publicUserId = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor
        {
            PersonId = publicUserId,
            PlatformRole = PlatformRoles.PublicUser,
            ScopeType = ScopeTypes.Global
        });
        using var scope = provider.CreateScope();
        var taxonomyService = scope.ServiceProvider.GetRequiredService<ITaxonomyService>();

        var controller = new MasterDataControllers(taxonomyService);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext
            {
                RequestServices = scope.ServiceProvider
            }
        };

        var dto = new CreateSectorDto
        {
            Code = "LV99",
            Name = "Ngành mới",
            Tt17Code = "C.99"
        };

        // RequireAdmin throws NacenTech.Kernel.Domain.ForbiddenException
        await Should.ThrowAsync<NacenTech.Kernel.Domain.ForbiddenException>(async () =>
        {
            await controller.CreateSector(dto);
        });
    }
}
