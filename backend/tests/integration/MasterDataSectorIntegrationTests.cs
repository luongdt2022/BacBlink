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
    public async Task Database_Contains_8_Baclink_Sectors_And_Deactivated_Legacy_LV_Sectors()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

        var activeBaclinkSectors = await db.Set<TaxonomyTerm>()
            .Where(t => t.Kind == TaxonomyKinds.Sector && t.IsActive && t.Code != null && t.Code.StartsWith("IND_"))
            .ToListAsync();

        var expectedBaclinkCodes = new[]
        {
            "IND_ELEC", "IND_MECH", "IND_AUTO", "IND_PLAS", "IND_MAT", "IND_IT", "IND_GREEN", "IND_LOG"
        };
        foreach (var code in expectedBaclinkCodes)
        {
            activeBaclinkSectors.ShouldContain(s => s.Code == code, $"Database must contain active BACLINK sector {code}");
        }

        // BR-BACLINK-TAX-001: LV* phai con trong DB voi is_active = false (khong bi DELETE)
        var legacyLvSectors = await db.Set<TaxonomyTerm>()
            .Where(t => t.Kind == TaxonomyKinds.Sector && t.Code != null && t.Code.StartsWith("LV"))
            .ToListAsync();

        legacyLvSectors.Count.ShouldBeGreaterThanOrEqualTo(10);
        legacyLvSectors.ShouldAllBe(s => !s.IsActive);

        // REQ-BACLINK-TAX-002: LOCATION (AREA & KCN) phai ton tai va active
        var activeLocations = await db.Set<TaxonomyTerm>()
            .Where(t => t.Kind == TaxonomyKinds.Location && t.IsActive)
            .ToListAsync();

        activeLocations.Count.ShouldBeGreaterThanOrEqualTo(22);
        activeLocations.ShouldContain(l => l.Code == "TP_BN");
        activeLocations.ShouldContain(l => l.Code == "KCN_YEN_PHONG_1");
    }

    [Fact]
    public async Task Unique_Constraint_On_Kind_And_Code_Prevents_Duplicate_Codes()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

        var duplicateTerm = new TaxonomyTerm(TaxonomyKinds.Sector, "Điện tử trùng", "IND_ELEC", "{}");
        db.Set<TaxonomyTerm>().Add(duplicateTerm);

        await Should.ThrowAsync<DbUpdateException>(async () =>
        {
            await db.SaveChangesAsync();
        });
    }

    [Fact]
    public async Task GetSectors_Endpoint_Returns_Active_Baclink_Sectors_From_Database()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var taxonomyService = scope.ServiceProvider.GetRequiredService<ITaxonomyService>();

        var controller = new MasterDataControllers(taxonomyService);
        var defaultResult = await controller.GetSectors();
        var defaultOk = defaultResult.ShouldBeOfType<OkObjectResult>();
        defaultOk.Value.ShouldNotBeNull();
        var dataProp = defaultOk.Value!.GetType().GetProperty("data")!;
        var defaultList = ((IEnumerable<SectorItemDto>)dataProp.GetValue(defaultOk.Value)!).ToList();
        defaultList.Count.ShouldBeGreaterThanOrEqualTo(8);
        defaultList.ShouldAllBe(s => s.IsActive && !s.Code.StartsWith("LV"));

        var includeInactiveResult = await controller.GetSectors(includeInactive: true);
        var includeInactiveOk = includeInactiveResult.ShouldBeOfType<OkObjectResult>();
        var allList = ((IEnumerable<SectorItemDto>)dataProp.GetValue(includeInactiveOk.Value)!).ToList();
        allList.Count.ShouldBeGreaterThanOrEqualTo(18);
        allList.ShouldContain(s => !s.IsActive && s.Code.StartsWith("LV"));

        var actionResult = await controller.GetSectors(activeOnly: true);
        var okResult = actionResult.ShouldBeOfType<OkObjectResult>();
        okResult.Value.ShouldNotBeNull();

        var sectorsController = new SectorsController(taxonomyService);
        var v1Result = await sectorsController.List(CancellationToken.None);
        v1Result.ShouldBeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetLocations_Endpoint_Returns_BacNinh_Areas_And_Kcns()
    {
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var taxonomyService = scope.ServiceProvider.GetRequiredService<ITaxonomyService>();

        var controller = new MasterDataControllers(taxonomyService);

        var allResult = await controller.GetLocations(null, CancellationToken.None);
        allResult.ShouldBeOfType<OkObjectResult>();

        var areaResult = await controller.GetLocations("AREA", CancellationToken.None);
        var areaOk = areaResult.ShouldBeOfType<OkObjectResult>();
        var totalProp = areaOk.Value!.GetType().GetProperty("total");
        totalProp.ShouldNotBeNull();
        ((int)totalProp.GetValue(areaOk.Value)!).ShouldBe(9);

        var kcnResult = await controller.GetLocations("KCN", CancellationToken.None);
        var kcnOk = kcnResult.ShouldBeOfType<OkObjectResult>();
        ((int)totalProp.GetValue(kcnOk.Value)!).ShouldBe(13);
    }

    [Theory]
    [InlineData("SEC-01", "Ngành cũ")]
    [InlineData("LV01", "Ngành LV cũ")]
    [InlineData("IND_", "Thiếu hậu tố")]
    [InlineData("INVALID-CODE", "Mã không hợp lệ")]
    public async Task CreateSector_Endpoint_Rejects_Non_IND_Prefix_With_400(string invalidCode, string name)
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
            Tt17Code = "C.26",
            Description = "Test invalid prefix"
        };

        var result = await controller.CreateSector(dto);
        var badRequest = result.ShouldBeOfType<BadRequestObjectResult>();
        badRequest.StatusCode.ShouldBe(400);
    }

    [Fact]
    public async Task UpdateMatrixPair_Endpoint_Accepts_IND_Sector_Code_For_Admin()
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

        var result = controller.UpdateMatrixPair(new UpdateMatrixPairDto
        {
            FieldCode = "IND_ELEC",
            TechCode = "CN04",
            RatingStars = 5,
            Weight = 1.0
        });

        var ok = result.ShouldBeOfType<OkObjectResult>();
        ok.StatusCode.ShouldBe(200);
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
            Code = "IND_NEW_TEST",
            Name = "Ngành mới",
            Tt17Code = "C.28"
        };

        await Should.ThrowAsync<NacenTech.Kernel.Domain.ForbiddenException>(async () =>
        {
            await controller.CreateSector(dto);
        });
    }
}
