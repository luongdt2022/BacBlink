using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// TASK-08 / T065 [CHAOS]: Kiểm thử khả năng chịu lỗi và tự phục hồi (Graceful Degradation)
/// khi Python AI Sidecar (cổng 8003) offline, timeout hoặc connection refused.
/// Hệ thống phải tự động kích hoạt chế độ đối soát dự phòng PostgreSQL FTS (Full-Text Search),
/// trả về HTTP 200 kèm cờ isDegraded = true, semanticEngine = "POSTGRES_FTS_FALLBACK",
/// bảo đảm không bị sập hay ném lỗi HTTP 500 ra ngoài.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class GracefulDegradationTests(PostgresFixture fixture)
{
    private sealed class ChaosFaultyHttpMessageHandler(Exception faultException) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            throw faultException;
        }
    }

    private sealed class ChaosFaultyHttpClientFactory(Exception faultException) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name)
        {
            return new HttpClient(new ChaosFaultyHttpMessageHandler(faultException))
            {
                Timeout = TimeSpan.FromMilliseconds(500)
            };
        }
    }

    private static async Task SeedChaosTestDataAsync(
        NacenTechDbContext db, Guid demandId, Guid offerId, string demandCode, string offerCode)
    {
        // 1. Dọn dẹp match cũ
        await db.Database.ExecuteSqlRawAsync(
            "DELETE FROM brokerage.match_candidates WHERE demand_id = @dId OR offer_id = @oId",
            new Npgsql.NpgsqlParameter("dId", demandId),
            new Npgsql.NpgsqlParameter("oId", offerId));

        // 2. Tạo Seller Offer
        await db.Database.ExecuteSqlRawAsync(@"
            INSERT INTO technology.seller_technology_offers (
                id, offer_code, offer_type, has_tech_transfer, title, summary, problem_solved,
                sector_code, sector_name, pricing_type, currency, status, enterprise_name, created_by,
                successful_connections, rating_score, review_count, legal_consent, version, installation_support, is_deleted,
                trl_level, ip_status, created_at, updated_at
            ) VALUES (
                @id, @offerCode, 'COMMERCIAL_EQUIPMENT', false,
                'Công nghệ máy sấy lạnh đối lưu nhiệt thông minh',
                'Hệ thống sấy lạnh nông sản công nghệ cao bảo tồn hoạt chất',
                'Giải quyết tổn thất sau thu hoạch cho nông dân',
                'LV01', 'Nông nghiệp công nghệ cao', 'FIXED', 'VND', 'APPROVED',
                'Viện Cơ Điện Nông Nghiệp & Công Nghệ Sau Thu Hoạch',
                '01a19a28-9b8b-79a7-8998-9535a4d22277', 0, 5.0, 0, true, 1, true, false,
                7, 'PATENT_GRANTED', now(), now()
            ) ON CONFLICT (id) DO UPDATE SET status = 'APPROVED', is_deleted = false, trl_level = 7, ip_status = 'PATENT_GRANTED';
        ", new Npgsql.NpgsqlParameter("id", offerId), new Npgsql.NpgsqlParameter("offerCode", offerCode));

        // 3. Tạo Demand Item
        await db.Database.ExecuteSqlRawAsync(@"
            INSERT INTO demand.demand_items (
                id, item_code, stage_name, expected_goal, technical_problem, need_consulting,
                sector_code, tech_group_code, demand_type_code, budget_range,
                urgency_score, impact_score, investment_capacity, adoption_readiness,
                tni_score, tni_classification, status, is_public_listed, created_at, updated_at
            ) VALUES (
                @id, @demandCode, 'Hệ thống sấy nông sản lạnh quy mô hợp tác xã',
                'Cần giải pháp sấy trái cây nhiệt độ thấp', 'Bài toán tối ưu dây chuyền sản xuất tự động', false,
                'LV01', 'TECH01', 'COMMERCIAL', '100M-500M',
                4, 5, 4, 5,
                85, 'HIGH', 'PUBLISHED', true, now(), now()
            ) ON CONFLICT (id) DO UPDATE SET status = 'PUBLISHED', sector_code = 'LV01', tni_score = 85;
        ", new Npgsql.NpgsqlParameter("id", demandId), new Npgsql.NpgsqlParameter("demandCode", demandCode));
    }

    [Fact]
    public async Task When_ai_sidecar_connection_refused_system_gracefully_falls_back_to_postgres_fts()
    {
        var actor = new TestActor
        {
            PersonId = Guid.NewGuid(),
            PlatformRole = PlatformRoles.Admin,
            ScopeType = ScopeTypes.Global
        };
        await using var provider = fixture.BuildProvider(actor);
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

        var demandId = Guid.NewGuid();
        var offerId = Guid.NewGuid();
        var demandCode = $"DMD-CHAOS-{Guid.NewGuid():N}";
        var offerCode = $"OFF-CHAOS-{Guid.NewGuid():N}";
        await SeedChaosTestDataAsync(db, demandId, offerId, demandCode, offerCode);

        // Giả lập lỗi Connection Refused trên cổng 8003
        var connectionRefusedException = new HttpRequestException("Connection refused (os error 111): http://localhost:8003/v1/rerank");
        var faultyFactory = new ChaosFaultyHttpClientFactory(connectionRefusedException);
        var logger = NullLogger<BrokerageMatchingEngineService>.Instance;

        var engine = new BrokerageMatchingEngineService(db, faultyFactory, logger);

        // Act: Kích hoạt đối soát Radar trong tình trạng Sidecar offline
        var recomputeResult = await engine.RecomputeRadarForDemandAsync(demandCode, null, CancellationToken.None);

        // Assert: Không bị crash, tự động fallback FTS
        recomputeResult.ShouldNotBeNull();
        recomputeResult.IsDegraded.ShouldBeTrue();
        recomputeResult.EngineVersion.ShouldBe("POSTGRES_FTS_FALLBACK");
        recomputeResult.ComputedMatchesCount.ShouldBeGreaterThan(0);

        // Lấy danh sách Radar Candidates
        var candidates = await engine.GetRadarCandidatesAsync("LV01", null, "máy sấy", null, CancellationToken.None);
        candidates.Count.ShouldBeGreaterThan(0);

        var match = candidates[0];
        match.IsDegraded.ShouldBeTrue();
        match.XaiBreakdown.ShouldNotBeNull();
        match.XaiBreakdown.SemanticEngine.ShouldBe("POSTGRES_FTS_FALLBACK");
        match.XaiBreakdown.SemanticScore.ShouldBeGreaterThan(0);
        match.OverallMatchScore.ShouldBeGreaterThan(50);
    }

    [Fact]
    public async Task When_ai_sidecar_times_out_system_recovers_without_throwing_http_500()
    {
        var actor = new TestActor
        {
            PersonId = Guid.NewGuid(),
            PlatformRole = PlatformRoles.Admin,
            ScopeType = ScopeTypes.Global
        };
        await using var provider = fixture.BuildProvider(actor);
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

        var demandId = Guid.NewGuid();
        var offerId = Guid.NewGuid();
        var demandCode = $"DMD-CHAOS-{Guid.NewGuid():N}";
        var offerCode = $"OFF-CHAOS-{Guid.NewGuid():N}";
        await SeedChaosTestDataAsync(db, demandId, offerId, demandCode, offerCode);

        // Giả lập lỗi Timeout > 1500ms
        var timeoutException = new TaskCanceledException("The operation was canceled due to timeout (exceeded 1500ms SLA).");
        var faultyFactory = new ChaosFaultyHttpClientFactory(timeoutException);
        var logger = NullLogger<BrokerageMatchingEngineService>.Instance;

        var engine = new BrokerageMatchingEngineService(db, faultyFactory, logger);

        // Act
        var recomputeResult = await engine.RecomputeRadarForDemandAsync(demandCode, null, CancellationToken.None);

        // Assert
        recomputeResult.ShouldNotBeNull();
        recomputeResult.IsDegraded.ShouldBeTrue();
        recomputeResult.EngineVersion.ShouldBe("POSTGRES_FTS_FALLBACK");
    }
}
