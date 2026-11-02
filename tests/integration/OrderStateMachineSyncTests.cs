using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Api.V1Compat;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Demand.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// TASK-08 / T051: Bộ kiểm thử tích hợp máy trạng thái 2 chiều (Bi-directional Order State Machine Sync)
/// Kiểm thử đối soát CSDL PostgreSQL container thật (nacentech-postgres-1, port 55440).
/// Tuyệt đối cấm mock và hardcode.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class OrderStateMachineSyncTests(PostgresFixture fixture)
{
    private static readonly Guid CfocOfferId = Guid.Parse("07a6560f-c928-51b4-8631-fd7966d3a457");
    private static readonly Guid BuyerUserId = Guid.Parse("01a19a28-9b8b-79a7-8998-9535a4d22266");

    private (DemandController demandCtrl, BrokerageControllers brokCtrl, NacenTechDbContext db, ServiceProvider provider)
        CreateTestContext(Guid actorId, string role)
    {
        var actor = new TestActor
        {
            PersonId = actorId,
            Email = "tester@nacentech.vn",
            PlatformRole = role,
            ScopeType = ScopeTypes.Global
        };

        var provider = fixture.BuildProvider(actor);
        var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var personSvc = scope.ServiceProvider.GetRequiredService<IPersonService>();

        var httpContext = new DefaultHttpContext { RequestServices = scope.ServiceProvider };

        var demandCtrl = new DemandController(db, uow, personSvc)
        {
            ControllerContext = new ControllerContext { HttpContext = httpContext }
        };

        var brokCtrl = new BrokerageControllers(db)
        {
            ControllerContext = new ControllerContext { HttpContext = httpContext }
        };

        return (demandCtrl, brokCtrl, db, provider);
    }

    private async Task EnsureSellerOfferExistsAsync(NacenTechDbContext db)
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
                'Viện Điện Quang Viện Đổi Mới Sáng Tạo',
                '01a19a28-9b8b-79a7-8998-9535a4d22277',
                0, 5.0, 0, true, 1, true, false,
                now(), now()
            ) ON CONFLICT (id) DO UPDATE SET status = 'APPROVED', is_deleted = false;
        ");
    }

    private async Task<(Guid demandId, Guid connectionRequestId)> CreateCommercialOrderAsync(
        DemandController demandCtrl,
        NacenTechDbContext db,
        string suffix)
    {
        await EnsureSellerOfferExistsAsync(db);

        var req = new CreateQuickDemandItemRequest(
            StageName: "Sản xuất",
            TechnicalProblem: $"QC Test FSM Sync: Đo kiểm quang học tự động {suffix}",
            DesiredSolution: $"[Đơn hàng thương mại] Đặt mua máy quét 3D quang học {suffix}",
            NeedConsulting: false,
            ExpectedGoal: "Đạt chuẩn ISO/IEC 17025",
            ApplicationScale: "Viện Đo Lường Tiêu Chuẩn",
            SectorCode: "LV01",
            TechGroupCode: "CN01",
            DemandTypeCode: "NC01",
            BudgetRange: "800 triệu VNĐ",
            UrgencyScore: 4,
            ImpactScore: 5,
            InvestmentCapacity: 4,
            AdoptionReadiness: 4,
            OfferId: CfocOfferId,
            OfferCode: "OFF-CFOC-001",
            OfferTitle: "Máy quét 3D quang học độ chính xác cao Made in Vietnam"
        );

        var actionResult = await demandCtrl.CreateQuickDemandItem(req, CancellationToken.None);
        var okResult = actionResult.ShouldBeOfType<OkObjectResult>();
        okResult.Value.ShouldNotBeNull();

        var resDict = okResult.Value.GetType().GetProperties()
            .ToDictionary(p => p.Name, p => p.GetValue(okResult.Value));

        var demandId = (Guid)resDict["itemId"]!;
        var connReqId = (Guid)resDict["connectionRequestId"]!;

        return (demandId, connReqId);
    }

    /// <summary>
    /// TEST CASE 1 (Bước 1 -> Bước 2):
    /// Tạo đơn hàng thương mại (status: PENDING, connection_requests: PENDING).
    /// Bên Bán gọi API respond với action = "ACCEPT".
    /// Đối soát PostgreSQL: demand_items chuyển thành 'PROCESSING', connection_requests chuyển thành 'ACCEPTED',
    /// và tự động sinh bản ghi brokerage.opportunities với stage = 'INITIATED'.
    /// </summary>
    [Fact]
    public async Task TestCase1_Respond_Accept_Syncs_Demand_To_PROCESSING_And_Creates_Opportunity()
    {
        var (demandCtrl, brokCtrl, db, provider) = CreateTestContext(BuyerUserId, PlatformRoles.PublicUser);
        await using var _ = provider;

        var suffix = Guid.NewGuid().ToString("N")[..8];
        var (demandId, connReqId) = await CreateCommercialOrderAsync(demandCtrl, db, suffix);

        // Kiểm tra trạng thái sơ khởi trong PostgreSQL
        var initialDemandStatus = await db.Database.SqlQuery<string>($@"
            SELECT status AS ""Value"" FROM demand.demand_items WHERE id = {demandId}
        ").FirstOrDefaultAsync();
        initialDemandStatus.ShouldBe("PENDING");

        var initialReqStatus = await db.Database.SqlQuery<string>($@"
            SELECT status AS ""Value"" FROM brokerage.connection_requests WHERE id = {connReqId}
        ").FirstOrDefaultAsync();
        initialReqStatus.ShouldBe("PENDING");

        // Gọi API PUT /api/v1/brokerage/requests/{id}/respond với ACCEPT
        var respondReq = new RespondConnectionRequest(
            Action: "ACCEPT",
            Note: "Bên Bán CFOC xác nhận tiếp nhận đơn hàng và kích hoạt Deal Room."
        );

        var respondResult = await brokCtrl.RespondConnectionRequest(connReqId, respondReq, CancellationToken.None);
        var okRespond = respondResult.ShouldBeOfType<OkObjectResult>();
        okRespond.Value.ShouldNotBeNull();

        // Đối soát trực tiếp trong CSDL PostgreSQL thật (nacentech-postgres-1)
        var updatedDemandStatus = await db.Database.SqlQuery<string>($@"
            SELECT status AS ""Value"" FROM demand.demand_items WHERE id = {demandId}
        ").FirstOrDefaultAsync();
        updatedDemandStatus.ShouldBe("PROCESSING");

        var updatedReq = await db.Database.SqlQuery<ConnectionReqRecord>($@"
            SELECT id, status, response_note FROM brokerage.connection_requests WHERE id = {connReqId}
        ").FirstOrDefaultAsync();
        updatedReq.ShouldNotBeNull();
        updatedReq.status.ShouldBe("ACCEPTED");
        updatedReq.response_note.ShouldNotBeNull();
        updatedReq.response_note.ShouldContain("CFOC xác nhận tiếp nhận");

        // Kiểm tra cơ hội thương mại (Deal Opportunity) được sinh tự động
        var opportunity = await db.Database.SqlQuery<OpportunityRecord>($@"
            SELECT id, opportunity_code, connection_request_id, stage, buyer_org_name, seller_org_name
            FROM brokerage.opportunities
            WHERE connection_request_id = {connReqId}
        ").FirstOrDefaultAsync();

        opportunity.ShouldNotBeNull();
        opportunity.stage.ShouldBe("INITIATED");
        opportunity.connection_request_id.ShouldBe(connReqId);
        opportunity.opportunity_code.ShouldStartWith("DEAL-");
    }

    /// <summary>
    /// TEST CASE 2 (Bước 2 -> Bước 3):
    /// Cơ hội ở stage INITIATED -> Gọi API chuyển stage thành "NEGOTIATING".
    /// Đối soát PostgreSQL: demand.demand_items.status chuyển thành 'NEGOTIATING'.
    /// </summary>
    [Fact]
    public async Task TestCase2_Stage_Transition_To_NEGOTIATING_Syncs_Demand_To_NEGOTIATING()
    {
        var (demandCtrl, brokCtrl, db, provider) = CreateTestContext(BuyerUserId, PlatformRoles.PublicUser);
        await using var _ = provider;

        var suffix = Guid.NewGuid().ToString("N")[..8];
        var (demandId, connReqId) = await CreateCommercialOrderAsync(demandCtrl, db, suffix);

        // Bên Bán tiếp nhận đơn
        await brokCtrl.RespondConnectionRequest(connReqId, new RespondConnectionRequest("ACCEPT"), CancellationToken.None);

        var oppId = await db.Database.SqlQuery<Guid>($@"
            SELECT id AS ""Value"" FROM brokerage.opportunities WHERE connection_request_id = {connReqId}
        ").FirstOrDefaultAsync();
        oppId.ShouldNotBe(Guid.Empty);

        // Gọi API PUT /api/v1/brokerage/opportunities/{id}/stage với stage: "NEGOTIATING"
        var stageReq = new UpdateOpportunityStageRequest("NEGOTIATING");
        var stageResult = await brokCtrl.UpdateOpportunityStage(oppId, stageReq, CancellationToken.None);
        var okStage = stageResult.ShouldBeOfType<OkObjectResult>();
        okStage.Value.ShouldNotBeNull();

        // Đối soát trực tiếp trong CSDL PostgreSQL thật
        var currentDemandStatus = await db.Database.SqlQuery<string>($@"
            SELECT status AS ""Value"" FROM demand.demand_items WHERE id = {demandId}
        ").FirstOrDefaultAsync();
        currentDemandStatus.ShouldBe("NEGOTIATING");

        var currentOppStage = await db.Database.SqlQuery<string>($@"
            SELECT stage AS ""Value"" FROM brokerage.opportunities WHERE id = {oppId}
        ").FirstOrDefaultAsync();
        currentOppStage.ShouldBe("NEGOTIATING");
    }

    /// <summary>
    /// TEST CASE 3 (Bước 3 -> Bước 4):
    /// Chuỗi chuyển tiếp chuẩn FSM: INITIATED -> NEGOTIATING -> MOU_SIGNED -> COMPLETED.
    /// Đối soát PostgreSQL: demand.demand_items.status chuyển thành 'COMPLETED'.
    /// </summary>
    [Fact]
    public async Task TestCase3_Stage_Transition_To_COMPLETED_Syncs_Demand_To_COMPLETED()
    {
        var (demandCtrl, brokCtrl, db, provider) = CreateTestContext(BuyerUserId, PlatformRoles.PublicUser);
        await using var _ = provider;

        var suffix = Guid.NewGuid().ToString("N")[..8];
        var (demandId, connReqId) = await CreateCommercialOrderAsync(demandCtrl, db, suffix);

        // ACCEPT -> INITIATED
        await brokCtrl.RespondConnectionRequest(connReqId, new RespondConnectionRequest("ACCEPT"), CancellationToken.None);
        var oppId = await db.Database.SqlQuery<Guid>($@"
            SELECT id AS ""Value"" FROM brokerage.opportunities WHERE connection_request_id = {connReqId}
        ").FirstOrDefaultAsync();

        // INITIATED -> NEGOTIATING
        await brokCtrl.UpdateOpportunityStage(oppId, new UpdateOpportunityStageRequest("NEGOTIATING"), CancellationToken.None);

        // NEGOTIATING -> MOU_SIGNED
        await brokCtrl.UpdateOpportunityStage(oppId, new UpdateOpportunityStageRequest("MOU_SIGNED"), CancellationToken.None);

        // MOU_SIGNED -> COMPLETED
        var completedResult = await brokCtrl.UpdateOpportunityStage(oppId, new UpdateOpportunityStageRequest("COMPLETED"), CancellationToken.None);
        var okCompleted = completedResult.ShouldBeOfType<OkObjectResult>();
        okCompleted.Value.ShouldNotBeNull();

        // Đối soát trực tiếp trong CSDL PostgreSQL thật
        var finalDemandStatus = await db.Database.SqlQuery<string>($@"
            SELECT status AS ""Value"" FROM demand.demand_items WHERE id = {demandId}
        ").FirstOrDefaultAsync();
        finalDemandStatus.ShouldBe("COMPLETED");

        var finalOppStage = await db.Database.SqlQuery<string>($@"
            SELECT stage AS ""Value"" FROM brokerage.opportunities WHERE id = {oppId}
        ").FirstOrDefaultAsync();
        finalOppStage.ShouldBe("COMPLETED");
    }

    /// <summary>
    /// TEST CASE 4 (Ngoại lệ Từ chối):
    /// Gọi API respond với action: "REJECT" kèm lý do hợp lệ (>= 10 ký tự).
    /// Đối soát PostgreSQL: demand_items chuyển thành 'REJECTED', connection_requests chuyển thành 'REJECTED',
    /// và KHÔNG sinh bất kỳ cơ hội thương mại nào.
    /// </summary>
    [Fact]
    public async Task TestCase4_Respond_Reject_Syncs_Demand_To_REJECTED_And_Creates_No_Opportunity()
    {
        var (demandCtrl, brokCtrl, db, provider) = CreateTestContext(BuyerUserId, PlatformRoles.PublicUser);
        await using var _ = provider;

        var suffix = Guid.NewGuid().ToString("N")[..8];
        var (demandId, connReqId) = await CreateCommercialOrderAsync(demandCtrl, db, suffix);

        var rejectReq = new RespondConnectionRequest(
            Action: "REJECT",
            RejectionReason: "Sản phẩm tạm thời hết linh kiện chính hãng, hẹn quý khách quý sau."
        );

        var actionResult = await brokCtrl.RespondConnectionRequest(connReqId, rejectReq, CancellationToken.None);
        var okReject = actionResult.ShouldBeOfType<OkObjectResult>();
        okReject.Value.ShouldNotBeNull();

        // Đối soát PostgreSQL thật
        var rejectedDemandStatus = await db.Database.SqlQuery<string>($@"
            SELECT status AS ""Value"" FROM demand.demand_items WHERE id = {demandId}
        ").FirstOrDefaultAsync();
        rejectedDemandStatus.ShouldBe("REJECTED");

        var rejectedReq = await db.Database.SqlQuery<ConnectionReqRecord>($@"
            SELECT id, status, response_note FROM brokerage.connection_requests WHERE id = {connReqId}
        ").FirstOrDefaultAsync();
        rejectedReq.ShouldNotBeNull();
        rejectedReq.status.ShouldBe("REJECTED");

        // Kiểm tra chắc chắn không có opportunity nào bị sinh rác
        var oppCount = await db.Database.SqlQuery<int>($@"
            SELECT COUNT(*)::int AS ""Value"" FROM brokerage.opportunities WHERE connection_request_id = {connReqId}
        ").FirstOrDefaultAsync();
        oppCount.ShouldBe(0);
    }

    /// <summary>
    /// TEST PHÁ HOẠI 1 (BR-BRK-06 FSM Violation / Chống nhảy cóc):
    /// Cố tình chuyển trạng thái từ INITIATED thẳng sang COMPLETED.
    /// Hệ thống phải chặn với 400 Bad Request ERR_INVALID_STATE_TRANSITION.
    /// Dữ liệu trong PostgreSQL phải được giữ nguyên vẹn không bị sửa đổi.
    /// </summary>
    [Fact]
    public async Task DestructiveTest1_Illegal_Stage_Skipping_Is_Blocked_And_DB_Preserved()
    {
        var (demandCtrl, brokCtrl, db, provider) = CreateTestContext(BuyerUserId, PlatformRoles.PublicUser);
        await using var _ = provider;

        var suffix = Guid.NewGuid().ToString("N")[..8];
        var (demandId, connReqId) = await CreateCommercialOrderAsync(demandCtrl, db, suffix);

        await brokCtrl.RespondConnectionRequest(connReqId, new RespondConnectionRequest("ACCEPT"), CancellationToken.None);
        var oppId = await db.Database.SqlQuery<Guid>($@"
            SELECT id AS ""Value"" FROM brokerage.opportunities WHERE connection_request_id = {connReqId}
        ").FirstOrDefaultAsync();

        // Thử nhảy cóc: INITIATED -> COMPLETED
        var illegalReq = new UpdateOpportunityStageRequest("COMPLETED");
        var result = await brokCtrl.UpdateOpportunityStage(oppId, illegalReq, CancellationToken.None);

        var badRequest = result.ShouldBeOfType<BadRequestObjectResult>();
        badRequest.StatusCode.ShouldBe(400);

        // Kiểm chứng CSDL PostgreSQL thật: Trạng thái không bị nhảy cóc
        var unchangedDemand = await db.Database.SqlQuery<string>($@"
            SELECT status AS ""Value"" FROM demand.demand_items WHERE id = {demandId}
        ").FirstOrDefaultAsync();
        unchangedDemand.ShouldBe("PROCESSING");

        var unchangedOpp = await db.Database.SqlQuery<string>($@"
            SELECT stage AS ""Value"" FROM brokerage.opportunities WHERE id = {oppId}
        ").FirstOrDefaultAsync();
        unchangedOpp.ShouldBe("INITIATED");
    }

    /// <summary>
    /// TEST PHÁ HOẠI 2 (Kiểm soát tính hợp lệ & Rollback):
    /// Từ chối với lý do quá ngắn (< 10 ký tự).
    /// Hệ thống phải chặn ngay, toàn bộ dữ liệu giữ nguyên không đổi.
    /// </summary>
    [Fact]
    public async Task DestructiveTest2_Reject_With_Short_Reason_Returns_400_And_RollsBack()
    {
        var (demandCtrl, brokCtrl, db, provider) = CreateTestContext(BuyerUserId, PlatformRoles.PublicUser);
        await using var _ = provider;

        var suffix = Guid.NewGuid().ToString("N")[..8];
        var (demandId, connReqId) = await CreateCommercialOrderAsync(demandCtrl, db, suffix);

        // Gửi lý do chỉ có 4 ký tự
        var badRejectReq = new RespondConnectionRequest(
            Action: "REJECT",
            RejectionReason: "ko dc"
        );

        var result = await brokCtrl.RespondConnectionRequest(connReqId, badRejectReq, CancellationToken.None);
        var badRequest = result.ShouldBeOfType<BadRequestObjectResult>();
        badRequest.StatusCode.ShouldBe(400);

        // Đối soát PostgreSQL: demand_items vẫn PENDING, connection_requests vẫn PENDING
        var unchangedDemand = await db.Database.SqlQuery<string>($@"
            SELECT status AS ""Value"" FROM demand.demand_items WHERE id = {demandId}
        ").FirstOrDefaultAsync();
        unchangedDemand.ShouldBe("PENDING");

        var unchangedReq = await db.Database.SqlQuery<string>($@"
            SELECT status AS ""Value"" FROM brokerage.connection_requests WHERE id = {connReqId}
        ").FirstOrDefaultAsync();
        unchangedReq.ShouldBe("PENDING");
    }

    public sealed record ConnectionReqRecord(Guid id, string status, string? response_note);
    public sealed record OpportunityRecord(
        Guid id,
        string opportunity_code,
        Guid connection_request_id,
        string stage,
        string buyer_org_name,
        string seller_org_name
    );
}
