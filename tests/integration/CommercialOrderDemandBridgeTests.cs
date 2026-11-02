using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Api.V1Compat;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Demand.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Technology.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// TASK-08 / T046: Bộ kiểm thử tích hợp đối soát CSDL thật (Deep DB Verification)
/// cho luồng Đặt mua sản phẩm thương mại kết nối Cung - Cầu:
/// POST /api/v1/demands/items kèm OfferId.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class CommercialOrderDemandBridgeTests(PostgresFixture fixture)
{
    private static readonly Guid CfocOfferId = Guid.Parse("07a6560f-c928-51b4-8631-fd7966d3a457");
    private static readonly Guid BuyerUserId = Guid.Parse("01a19a28-9b8b-79a7-8998-9535a4d22266");

    private static async Task EnsureSellerOfferExistsAsync(NacenTechDbContext db)
    {
        await db.Database.ExecuteSqlRawAsync(@"
            INSERT INTO technology.seller_technology_offers (
                id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
                sector_code, sector_name, pricing_type, currency, status, enterprise_name, created_by,
                successful_connections, rating_score, review_count, legal_consent, version, installation_support, is_deleted,
                created_at, updated_at
            ) VALUES (
                '07a6560f-c928-51b4-8631-fd7966d3a457',
                'OFF-CFOC-001',
                'COMMERCIAL_EQUIPMENT',
                false,
                'Máy quét 3D quang học độ chính xác cao Made in Vietnam',
                'Máy quét 3D quang học cao cấp phục vụ kiểm định cơ khí chính xác',
                'Giải quyết bài toán đo kiểm 3D không tiếp xúc',
                'LV01',
                'Cơ khí & Chế tạo máy',
                'FIXED',
                'VND',
                'APPROVED',
                'Trung tâm Quang điện tử (CFOC) - Viện Ứng dụng Công nghệ',
                '01a19a28-9b8b-79a7-8998-9535a4d22277',
                0, 5.0, 0, true, 1, true, false,
                now(), now()
            ) ON CONFLICT (id) DO UPDATE SET status = 'APPROVED', is_deleted = false;
        ");
    }

    [Fact]
    public async Task Commercial_order_with_valid_offer_persists_both_demand_item_and_connection_request_in_real_postgres()
    {
        var actor = new TestActor
        {
            PersonId = BuyerUserId,
            Email = "public1@gmail.com",
            PlatformRole = PlatformRoles.PublicUser,
            ScopeType = ScopeTypes.Global
        };

        await using var provider = fixture.BuildProvider(actor);
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        await EnsureSellerOfferExistsAsync(db);

        var controller = new DemandController(
            db,
            scope.ServiceProvider.GetRequiredService<IUnitOfWork>(),
            scope.ServiceProvider.GetRequiredService<IPersonService>()
        )
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext
                {
                    RequestServices = scope.ServiceProvider
                }
            }
        };

        var uniquePrefix = Guid.NewGuid().ToString("N")[..8];
        var req = new CreateQuickDemandItemRequest(
            StageName: "Sản xuất",
            TechnicalProblem: $"QC Test: Đo kiểm linh kiện tự động {uniquePrefix}",
            DesiredSolution: $"[Đơn hàng thương mại] Đặt mua thiết bị máy quét 3D {uniquePrefix}",
            NeedConsulting: false,
            ExpectedGoal: "Đạt độ chính xác cao xuất khẩu G7",
            ApplicationScale: "Công ty Cơ Khí Chính Xác LuongTech",
            SectorCode: "LV01",
            TechGroupCode: "CN01",
            DemandTypeCode: "NC01",
            BudgetRange: "500 triệu – 1 tỷ VNĐ",
            UrgencyScore: 5,
            ImpactScore: 4,
            InvestmentCapacity: 4,
            AdoptionReadiness: 4,
            OfferId: CfocOfferId,
            OfferCode: "OFF-CFOC-001",
            OfferTitle: "Máy quét 3D quang học độ chính xác cao Made in Vietnam"
        );

        var actionResult = await controller.CreateQuickDemandItem(req, CancellationToken.None);
        if (actionResult is ObjectResult objRes && objRes.StatusCode != 200)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(objRes.Value);
            throw new Exception($"ACTION RESULT FAILED with status {objRes.StatusCode}: {json}");
        }

        var okResult = actionResult.ShouldBeOfType<OkObjectResult>();
        okResult.Value.ShouldNotBeNull();

        // Đọc itemId và connectionRequestId từ kết quả trả về
        var resDict = okResult.Value.GetType().GetProperties()
            .ToDictionary(p => p.Name, p => p.GetValue(okResult.Value));

        var itemId = (Guid)resDict["itemId"]!;
        var connectionRequestId = (Guid)resDict["connectionRequestId"]!;

        // Đối soát trực tiếp trong CSDL PostgreSQL thật
        var demandItem = await db.Set<DemandItem>().AsNoTracking().FirstOrDefaultAsync(d => d.Id == itemId);
        demandItem.ShouldNotBeNull();
        demandItem.CreatedBy.ShouldBe(BuyerUserId);
        demandItem.TechnicalProblem.ShouldContain(uniquePrefix);

        // Kiểm tra connection_request bằng raw SQL
        var connReq = await db.Database.SqlQuery<ConnectionRequestRow>($@"
            SELECT id, request_code, sender_user_id, receiver_org_name, demand_id, target_offer_id, status, message
            FROM brokerage.connection_requests
            WHERE id = {connectionRequestId}
        ").FirstOrDefaultAsync();

        connReq.ShouldNotBeNull();
        connReq.demand_id.ShouldBe(itemId);
        connReq.target_offer_id.ShouldBe(CfocOfferId);
        connReq.status.ShouldBe("PENDING");
        connReq.receiver_org_name.ShouldBe("Trung tâm Quang điện tử (CFOC) - Viện Ứng dụng Công nghệ");
        connReq.sender_user_id.ShouldBe(BuyerUserId);
    }

    [Fact]
    public async Task Commercial_order_with_non_existent_offer_returns_not_found_and_rolls_back()
    {
        var actor = new TestActor
        {
            PersonId = BuyerUserId,
            Email = "public1@gmail.com",
            PlatformRole = PlatformRoles.PublicUser,
            ScopeType = ScopeTypes.Global
        };

        await using var provider = fixture.BuildProvider(actor);
        using var scope = provider.CreateScope();

        var controller = new DemandController(
            scope.ServiceProvider.GetRequiredService<NacenTechDbContext>(),
            scope.ServiceProvider.GetRequiredService<IUnitOfWork>(),
            scope.ServiceProvider.GetRequiredService<IPersonService>()
        )
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext
                {
                    RequestServices = scope.ServiceProvider
                }
            }
        };

        var fakeOfferId = Guid.NewGuid();
        var uniqueMarker = $"GHOST_{Guid.NewGuid():N}";
        var req = new CreateQuickDemandItemRequest(
            StageName: "Nghiên cứu",
            TechnicalProblem: $"QC Phá hoại: {uniqueMarker}",
            DesiredSolution: "Giải pháp cho offer không tồn tại",
            NeedConsulting: true,
            ExpectedGoal: "Kiểm tra rollback sạch",
            ApplicationScale: "Doanh nghiệp ảo",
            SectorCode: "LV01",
            TechGroupCode: "CN01",
            DemandTypeCode: "NC01",
            BudgetRange: "Thỏa thuận",
            UrgencyScore: 3,
            ImpactScore: 3,
            InvestmentCapacity: 3,
            AdoptionReadiness: 3,
            OfferId: fakeOfferId
        );

        var actionResult = await controller.CreateQuickDemandItem(req, CancellationToken.None);
        var notFound = actionResult.ShouldBeOfType<NotFoundObjectResult>();
        notFound.StatusCode.ShouldBe(404);

        // Đối soát CSDL thật: Tuyệt đối không sinh bất kỳ bản ghi nào
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var leakedDemand = await db.Set<DemandItem>().AsNoTracking()
            .AnyAsync(d => d.TechnicalProblem.Contains(uniqueMarker));
        leakedDemand.ShouldBeFalse();

        var leakedConnReq = await db.Database.SqlQuery<int>($@"
            SELECT COUNT(*)::int AS ""Value""
            FROM brokerage.connection_requests
            WHERE target_offer_id = {fakeOfferId}
        ").FirstOrDefaultAsync();
        leakedConnReq.ShouldBe(0);
    }

    [Fact]
    public async Task Commercial_order_with_unapproved_offer_returns_bad_request()
    {
        var actor = new TestActor
        {
            PersonId = BuyerUserId,
            Email = "public1@gmail.com",
            PlatformRole = PlatformRoles.PublicUser,
            ScopeType = ScopeTypes.Global
        };

        await using var provider = fixture.BuildProvider(actor);
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

        // Tạo một offer ở trạng thái DRAFT trong database thật
        var draftOfferId = Guid.NewGuid();
        await db.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT INTO technology.seller_technology_offers (
                id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
                sector_code, sector_name, pricing_type, currency, status, successful_connections,
                rating_score, review_count, legal_consent, version, created_at, updated_at,
                installation_support, is_deleted
            ) VALUES (
                {draftOfferId}, {"OFF-DRAFT-" + draftOfferId.ToString("N")[..6]}, {"EQUIPMENT"}, false,
                {"Sản phẩm thử nghiệm DRAFT chưa duyệt"}, {"Tóm tắt"}, {"Vấn đề"},
                {"LV01"}, {"Công nghệ thông tin"}, {"FIXED_PRICE"}, {"VND"}, {"DRAFT"}, 0,
                5.0, 0, true, 1, {DateTime.UtcNow}, {DateTime.UtcNow},
                true, false
            );
        ");

        var controller = new DemandController(
            db,
            scope.ServiceProvider.GetRequiredService<IUnitOfWork>(),
            scope.ServiceProvider.GetRequiredService<IPersonService>()
        )
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext
                {
                    RequestServices = scope.ServiceProvider
                }
            }
        };

        var req = new CreateQuickDemandItemRequest(
            StageName: "Sản xuất",
            TechnicalProblem: "Cố tình mua sản phẩm DRAFT",
            DesiredSolution: "Yêu cầu phải bị từ chối",
            NeedConsulting: false,
            ExpectedGoal: "Hệ thống từ chối bán hàng chưa kiểm định",
            ApplicationScale: "Test Lab",
            SectorCode: "LV01",
            TechGroupCode: "CN01",
            DemandTypeCode: "NC01",
            BudgetRange: "100 triệu",
            UrgencyScore: 3,
            ImpactScore: 3,
            InvestmentCapacity: 3,
            AdoptionReadiness: 3,
            OfferId: draftOfferId
        );

        var actionResult = await controller.CreateQuickDemandItem(req, CancellationToken.None);
        var badReq = actionResult.ShouldBeOfType<BadRequestObjectResult>();
        badReq.StatusCode.ShouldBe(400);

        // Dọn dẹp offer draft test
        await db.Database.ExecuteSqlInterpolatedAsync($@"
            DELETE FROM technology.seller_technology_offers WHERE id = {draftOfferId};
        ");
    }

    public sealed record ConnectionRequestRow(
        Guid id,
        string request_code,
        Guid sender_user_id,
        string receiver_org_name,
        Guid? demand_id,
        Guid? target_offer_id,
        string status,
        string message
    );
}
