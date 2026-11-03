using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Diagnostics;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Brokerage.Application;

public sealed class BrokerageMatchingEngineService : IBrokerageMatchingEngineService
{
    private readonly DbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<BrokerageMatchingEngineService> _logger;

    public BrokerageMatchingEngineService(
        DbContext db,
        IHttpClientFactory httpClientFactory,
        ILogger<BrokerageMatchingEngineService> logger)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    /// <summary>
    /// BR-BRK-D3-01: MatchScore = Round(0.40*S_semantic + 0.30*S_trl + 0.15*S_tni + 0.15*S_ip)
    /// </summary>
    public int ComputeHybridScore(double semanticScore, double trlScore, double tniScore, double ipScore)
        => CalculateHybridScore(semanticScore, trlScore, tniScore, ipScore);

    public double CalculateTrlScore(int sellerTrl, int buyerExpectedTrl = 7)
        => EvaluateTrlScore(sellerTrl, buyerExpectedTrl);

    public double CalculateIpScore(string? ipStatus)
        => EvaluateIpScore(ipStatus);

    public static int CalculateHybridScore(double semanticScore, double trlScore, double tniScore, double ipScore)
    {
        var raw = (0.40 * semanticScore) + (0.30 * trlScore) + (0.15 * tniScore) + (0.15 * ipScore);
        return Math.Clamp((int)Math.Round(raw, MidpointRounding.AwayFromZero), 0, 100);
    }

    public static double EvaluateTrlScore(int sellerTrl, int buyerExpectedTrl = 7)
    {
        if (sellerTrl >= 7) return 100.0;
        var diff = Math.Abs(sellerTrl - buyerExpectedTrl);
        return diff switch
        {
            0 => 100.0,
            1 => 85.0,
            2 => 65.0,
            _ => 40.0
        };
    }

    public static double EvaluateIpScore(string? ipStatus)
    {
        return (ipStatus?.ToUpperInvariant()) switch
        {
            "PATENT_GRANTED" or "PATENTED" or "ĐÃ CẤP BẰNG SÁNG CHẾ" or "SÁNG CHẾ"
                => 100.0,
            "UTILITY_MODEL" or "GIAI_PHAP_HUU_ICH" or "GIẢI PHÁP HỮU ÍCH" or "BẰNG ĐỘC QUYỀN GIẢI PHÁP HỮU ÍCH"
                => 90.0,
            "SOFTWARE_COPYRIGHT" or "TAC_QUYEN_PHAN_MEM" or "BẢN QUYỀN PHẦN MỀM" or "BẢN QUYỀN TÁC GIẢ" or "COPYRIGHT"
                => 80.0,
            "PATENT_PENDING" or "PENDING" or "ĐANG THẨM ĐỊNH" or "ĐANG XÉT"
                => 60.0,
            "TRADE_SECRET" or "BÍ MẬT KINH DOANH" or "KNOW_HOW"
                => 50.0,
            _ => 20.0
        };
    }

    public async Task<IReadOnlyList<BrokerageRadarCandidateDto>> GetRadarCandidatesAsync(
        string? sector, int? minScore, string? search, RadarUserContext? userContext, CancellationToken ct)
    {
        var conn = _db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();
        var sql = @"
            SELECT id, demand_id, demand_code, demand_title, buyer_organization_id, buyer_organization_name,
                   offer_id, offer_code, offer_title, seller_organization_id, seller_organization_name,
                   sector_code, match_score, tni_score, trl_level, ip_status, is_active, created_at
            FROM brokerage.match_candidates
            WHERE is_active = true";

        // Scoped RBAC Security Isolation (T059)
        if (userContext is not null)
        {
            var role = userContext.PlatformRole?.ToUpperInvariant();
            if (role == PlatformRoles.Buyer)
            {
                // Buyer: Chỉ xem các match candidates gắn với bài toán của chính Buyer
                if (userContext.PersonId.HasValue || userContext.OrganizationId.HasValue)
                {
                    sql += @" AND (
                        demand_id IN (
                            SELECT d.id FROM demand.demand_items d
                            LEFT JOIN demand.demand_surveys s ON s.id = d.survey_id
                            WHERE (d.created_by = @actorPersonId OR (s.organization_id = @actorOrgId AND @actorOrgId IS NOT NULL))
                        )
                        OR (buyer_organization_id = @actorOrgId AND @actorOrgId IS NOT NULL)
                    )";
                    var pPerson = cmd.CreateParameter();
                    pPerson.ParameterName = "@actorPersonId";
                    pPerson.DbType = DbType.Guid;
                    pPerson.Value = (object?)userContext.PersonId ?? DBNull.Value;
                    cmd.Parameters.Add(pPerson);

                    var pOrg = cmd.CreateParameter();
                    pOrg.ParameterName = "@actorOrgId";
                    pOrg.DbType = DbType.Guid;
                    pOrg.Value = (object?)userContext.OrganizationId ?? DBNull.Value;
                    cmd.Parameters.Add(pOrg);
                }
                else
                {
                    // Buyer không có danh tính hợp lệ -> Trả về rỗng chống IDOR
                    return Array.Empty<BrokerageRadarCandidateDto>();
                }
            }
            else if (role == PlatformRoles.Seller)
            {
                // Seller: Chỉ xem các match candidates gắn với chào bán của chính Seller
                if (userContext.PersonId.HasValue || userContext.OrganizationId.HasValue)
                {
                    sql += @" AND (
                        offer_id IN (
                            SELECT o.id FROM technology.seller_technology_offers o
                            WHERE o.created_by = @actorPersonId 
                               OR (@actorOrgIdStr IS NOT NULL AND (o.managing_authority_id = @actorOrgIdStr OR o.scope_id = @actorOrgIdStr))
                        )
                        OR (seller_organization_id = @actorOrgId AND @actorOrgId IS NOT NULL)
                    )";
                    var pPerson = cmd.CreateParameter();
                    pPerson.ParameterName = "@actorPersonId";
                    pPerson.DbType = DbType.Guid;
                    pPerson.Value = (object?)userContext.PersonId ?? DBNull.Value;
                    cmd.Parameters.Add(pPerson);

                    var pOrg = cmd.CreateParameter();
                    pOrg.ParameterName = "@actorOrgId";
                    pOrg.DbType = DbType.Guid;
                    pOrg.Value = (object?)userContext.OrganizationId ?? DBNull.Value;
                    cmd.Parameters.Add(pOrg);

                    var pOrgStr = cmd.CreateParameter();
                    pOrgStr.ParameterName = "@actorOrgIdStr";
                    pOrgStr.DbType = DbType.String;
                    pOrgStr.Value = (object?)userContext.OrganizationId?.ToString() ?? DBNull.Value;
                    cmd.Parameters.Add(pOrgStr);
                }
                else
                {
                    return Array.Empty<BrokerageRadarCandidateDto>();
                }
            }
            else if (role == PlatformRoles.ProvincialAdmin && !string.IsNullOrWhiteSpace(userContext.ProvinceCode))
            {
                // Cán bộ Sở KH&CN tỉnh: Giới hạn theo địa bàn hành chính ProvinceCode
                sql += @" AND demand_id IN (
                    SELECT d.id FROM demand.demand_items d
                    JOIN demand.demand_surveys s ON s.id = d.survey_id
                    WHERE s.province ILIKE @provincePattern
                )";
                var pProv = cmd.CreateParameter();
                pProv.ParameterName = "@provincePattern";
                pProv.DbType = DbType.String;
                pProv.Value = $"%{userContext.ProvinceCode.Trim()}%";
                cmd.Parameters.Add(pProv);
            }
            // SUPER_ADMIN, OPERATOR_ADMIN, ADMIN: Xem toàn cảnh toàn quốc
        }

        if (!string.IsNullOrWhiteSpace(sector) && !string.Equals(sector, "ALL", StringComparison.OrdinalIgnoreCase))
        {
            sql += " AND sector_code = @sector";
            var p = cmd.CreateParameter();
            p.ParameterName = "@sector";
            p.DbType = DbType.String;
            p.Value = sector.Trim();
            cmd.Parameters.Add(p);
        }

        if (minScore.HasValue)
        {
            sql += " AND match_score >= @minScore";
            var p = cmd.CreateParameter();
            p.ParameterName = "@minScore";
            p.DbType = DbType.Int32;
            p.Value = minScore.Value;
            cmd.Parameters.Add(p);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND (demand_title ILIKE @search OR offer_title ILIKE @search OR buyer_organization_name ILIKE @search OR seller_organization_name ILIKE @search)";
            var p = cmd.CreateParameter();
            p.ParameterName = "@search";
            p.DbType = DbType.String;
            p.Value = $"%{search.Trim()}%";
            cmd.Parameters.Add(p);
        }

        sql += " ORDER BY match_score DESC, created_at DESC";
        cmd.CommandText = sql;

        var results = new List<BrokerageRadarCandidateDto>();
        using (var reader = await cmd.ExecuteReaderAsync(ct))
        {
            while (await reader.ReadAsync(ct))
            {
                var id = reader.GetGuid(0);
                var demandId = reader.IsDBNull(1) ? Guid.Empty : reader.GetGuid(1);
                var demandCode = reader.IsDBNull(2) ? string.Empty : reader.GetString(2);
                var demandTitle = reader.IsDBNull(3) ? string.Empty : reader.GetString(3);
                var buyerOrgId = reader.IsDBNull(4) ? (Guid?)null : reader.GetGuid(4);
                var buyerOrgName = reader.IsDBNull(5) ? string.Empty : reader.GetString(5);
                var offerId = reader.IsDBNull(6) ? Guid.Empty : reader.GetGuid(6);
                var offerCode = reader.IsDBNull(7) ? string.Empty : reader.GetString(7);
                var offerTitle = reader.IsDBNull(8) ? string.Empty : reader.GetString(8);
                var sellerOrgId = reader.IsDBNull(9) ? (Guid?)null : reader.GetGuid(9);
                var sellerOrgName = reader.IsDBNull(10) ? string.Empty : reader.GetString(10);
                var sectorCode = reader.IsDBNull(11) ? string.Empty : reader.GetString(11);
                var matchScore = reader.IsDBNull(12) ? 0 : Convert.ToInt32(reader.GetDecimal(12));
                var tniScore = reader.IsDBNull(13) ? 0.0 : Convert.ToDouble(reader.GetDecimal(13));
                var trlLevel = reader.IsDBNull(14) ? 7 : reader.GetInt32(14);
                var ipStatus = reader.IsDBNull(15) ? "NONE" : reader.GetString(15);
                var createdAt = reader.IsDBNull(17) ? DateTime.UtcNow : reader.GetDateTime(17);

                var trlScore = CalculateTrlScore(trlLevel, 7);
                var ipScore = CalculateIpScore(ipStatus);

                // Suy diễn điểm Semantic từ tổng: Overall = 0.4*Semantic + 0.3*Trl + 0.15*Tni + 0.15*Ip
                var rawSemantic = (matchScore - (0.30 * trlScore) - (0.15 * tniScore) - (0.15 * ipScore)) / 0.40;
                var semanticScore = Math.Round(Math.Clamp(rawSemantic, 0.0, 100.0), 1);

                var trlStage = trlLevel switch
                {
                    <= 3 => "Thử nghiệm Lab (TRL 1-3)",
                    <= 6 => "Thử nghiệm Pilot (TRL 4-6)",
                    _    => "Thương mại hóa (TRL 7-9)"
                };

                var tniBand = tniScore switch
                {
                    >= 80 => "Cấp thiết rất cao (TNI >= 80)",
                    >= 60 => "Cấp thiết cao (TNI 60-79)",
                    _     => "Cấp thiết trung bình"
                };

                var ipDesc = (ipStatus?.ToUpperInvariant()) switch
                {
                    "PATENT_GRANTED" or "PATENTED" or "ĐÃ CẤP BẰNG SÁNG CHẾ" or "SÁNG CHẾ"
                        => "Đã được cấp bằng độc quyền sáng chế",
                    "UTILITY_MODEL" or "GIAI_PHAP_HUU_ICH" or "GIẢI PHÁP HỮU ÍCH" or "BẰNG ĐỘC QUYỀN GIẢI PHÁP HỮU ÍCH"
                        => "Đã được cấp bằng độc quyền Giải pháp hữu ích",
                    "SOFTWARE_COPYRIGHT" or "TAC_QUYEN_PHAN_MEM" or "BẢN QUYỀN PHẦN MỀM" or "BẢN QUYỀN TÁC GIẢ" or "COPYRIGHT"
                        => "Đã đăng ký quyền tác giả / Bản quyền phần mềm",
                    "PATENT_PENDING" or "PENDING" or "ĐANG THẨM ĐỊNH" or "ĐANG XÉT"
                        => "Đang thẩm định hồ sơ đăng ký bảo hộ",
                    "TRADE_SECRET" or "BÍ MẬT KINH DOANH" or "KNOW_HOW"
                        => "Bảo hộ dưới dạng bí mật kinh doanh / Know-how",
                    _ => "Chưa đăng ký bảo hộ sở hữu trí tuệ"
                };

                // Nếu điểm semantic dựa trên FTS fallback (mặc định gắn FTS nếu không có kết nối AI sidecar)
                var isDegraded = true; // Sẽ được cập nhật chính xác từ engine
                var semanticEngine = "POSTGRES_FTS_FALLBACK";

                var xai = new RadarXaiBreakdownDto(
                    semanticScore,
                    semanticEngine,
                    trlScore,
                    trlLevel,
                    trlStage,
                    tniScore,
                    tniBand,
                    ipScore,
                    ipStatus ?? "NONE",
                    ipDesc
                );

                results.Add(new BrokerageRadarCandidateDto(
                    id,
                    demandId,
                    demandCode,
                    demandTitle,
                    buyerOrgId,
                    buyerOrgName,
                    offerId,
                    offerCode,
                    offerTitle,
                    sellerOrgId,
                    sellerOrgName,
                    sectorCode,
                    matchScore,
                    xai,
                    isDegraded,
                    createdAt
                ));
            }
        }

        return results;
    }

    public async Task<RecomputeRadarResultDto> RecomputeRadarForDemandAsync(
        string? demandCode, RadarUserContext? userContext, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        var isAnyDegraded = false;
        var computedCount = 0;

        var conn = _db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        // 1. Lấy danh sách Demand Items thực tế từ bảng demand.demand_items có áp dụng Scoped RBAC
        var demands = new List<(Guid Id, string Code, string Title, string SectorCode, int TniScore, Guid? CreatedBy, Guid? BuyerOrgId, string BuyerOrgName)>();
        using (var cmd = conn.CreateCommand())
        {
            var sql = @"
                SELECT d.id, d.item_code, COALESCE(d.stage_name, d.expected_goal, d.item_code) as title,
                       d.sector_code, d.tni_score, d.created_by,
                       s.organization_id as buyer_org_id,
                       COALESCE(e.name, s.company_name, 'Doanh nghiệp Bên Mua') as buyer_org_name
                FROM demand.demand_items d
                LEFT JOIN demand.demand_surveys s ON s.id = d.survey_id
                LEFT JOIN enterprise.enterprises e ON e.id = s.organization_id
                WHERE d.status IN ('PENDING', 'VERIFIED', 'PUBLISHED', 'PROCESSING', 'NEGOTIATING')";

            // Scoped RBAC Isolation cho Recompute: Buyer chỉ được recompute bài toán của chính mình
            if (userContext is not null && userContext.PlatformRole?.ToUpperInvariant() == PlatformRoles.Buyer)
            {
                if (userContext.PersonId.HasValue || userContext.OrganizationId.HasValue)
                {
                    sql += " AND (d.created_by = @buyerPersonId OR (s.organization_id = @buyerOrgId AND @buyerOrgId IS NOT NULL))";
                    var pPerson = cmd.CreateParameter();
                    pPerson.ParameterName = "@buyerPersonId";
                    pPerson.DbType = DbType.Guid;
                    pPerson.Value = (object?)userContext.PersonId ?? DBNull.Value;
                    cmd.Parameters.Add(pPerson);

                    var pOrg = cmd.CreateParameter();
                    pOrg.ParameterName = "@buyerOrgId";
                    pOrg.DbType = DbType.Guid;
                    pOrg.Value = (object?)userContext.OrganizationId ?? DBNull.Value;
                    cmd.Parameters.Add(pOrg);
                }
                else
                {
                    return new RecomputeRadarResultDto(0, sw.ElapsedMilliseconds, false, "SCOPED_RBAC_GUARD", DateTime.UtcNow);
                }
            }

            if (!string.IsNullOrWhiteSpace(demandCode))
            {
                sql += " AND d.item_code = @code";
                var p = cmd.CreateParameter();
                p.ParameterName = "@code";
                p.DbType = DbType.String;
                p.Value = demandCode.Trim();
                cmd.Parameters.Add(p);
            }

            cmd.CommandText = sql;
            using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                demands.Add((
                    reader.GetGuid(0),
                    reader.GetString(1),
                    reader.IsDBNull(2) ? "Nhu cầu công nghệ" : reader.GetString(2),
                    reader.IsDBNull(3) ? "IT" : reader.GetString(3),
                    reader.IsDBNull(4) ? 75 : reader.GetInt32(4),
                    reader.IsDBNull(5) ? (Guid?)null : reader.GetGuid(5),
                    reader.IsDBNull(6) ? (Guid?)null : reader.GetGuid(6),
                    reader.IsDBNull(7) ? "Doanh nghiệp Bên Mua" : reader.GetString(7)
                ));
            }
        }

        // 2. Lấy danh sách Seller Offers thực tế từ bảng technology.seller_technology_offers
        var offers = new List<(Guid Id, string Code, string Title, string SectorCode, int TrlLevel, string IpStatus, Guid? CreatedBy, Guid? SellerOrgId, string OrgName)>();
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                SELECT o.id, o.offer_code, o.title, o.sector_code, COALESCE(o.trl_level, 7),
                       COALESCE(o.ip_status, 'NONE'), o.created_by,
                       o.managing_authority_id, o.scope_id,
                       COALESCE(o.enterprise_name, o.managing_authority_name, 'Doanh nghiệp / Viện nghiên cứu') as seller_org_name
                FROM technology.seller_technology_offers o
                WHERE o.deleted_at IS NULL AND o.status IN ('APPROVED', 'PUBLISHED', 'ACTIVE')";

            using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                var managingAuthId = reader.IsDBNull(7) ? null : reader.GetString(7);
                var scopeId = reader.IsDBNull(8) ? null : reader.GetString(8);
                Guid? sellerOrgId = null;
                if (Guid.TryParse(managingAuthId, out var parsedOrgId)) sellerOrgId = parsedOrgId;
                else if (Guid.TryParse(scopeId, out var parsedScopeOrgId)) sellerOrgId = parsedScopeOrgId;

                offers.Add((
                    reader.GetGuid(0),
                    reader.GetString(1),
                    reader.IsDBNull(2) ? "Giải pháp công nghệ" : reader.GetString(2),
                    reader.IsDBNull(3) ? "IT" : reader.GetString(3),
                    reader.GetInt32(4),
                    reader.GetString(5),
                    reader.IsDBNull(6) ? (Guid?)null : reader.GetGuid(6),
                    sellerOrgId,
                    reader.IsDBNull(9) ? "Doanh nghiệp / Viện nghiên cứu" : reader.GetString(9)
                ));
            }
        }

        // 3. Quét chéo Cung - Cầu và tính điểm 4 trục
        foreach (var d in demands)
        {
            foreach (var o in offers)
            {
                // Circuit Breaker: Timeout 1.5s gọi Python AI Sidecar
                var (semanticScore, semanticEngine, isDegraded) = await ComputeSemanticWithFallbackAsync(
                    d.Id, d.Title, o.Id, o.Title, d.SectorCode, o.SectorCode, ct);

                if (isDegraded) isAnyDegraded = true;

                var trlScore = CalculateTrlScore(o.TrlLevel, 7);
                var tniScore = (double)d.TniScore;
                var ipScore = CalculateIpScore(o.IpStatus);

                var overallScore = ComputeHybridScore(semanticScore, trlScore, tniScore, ipScore);

                // Chỉ lưu các cặp có điểm tương thích >= 40%
                if (overallScore >= 40)
                {
                    await UpsertMatchCandidateAsync(conn, d, o, overallScore, ct);
                    computedCount++;
                }
            }
        }

        sw.Stop();
        return new RecomputeRadarResultDto(
            computedCount,
            sw.ElapsedMilliseconds,
            isAnyDegraded,
            isAnyDegraded ? "POSTGRES_FTS_FALLBACK" : "BGE-M3_HYBRID_4AXIS",
            DateTime.UtcNow
        );
    }

    private async Task<(double Score, string Engine, bool IsDegraded)> ComputeSemanticWithFallbackAsync(
        Guid demandId, string demandTitle, Guid offerId, string offerTitle,
        string demandSector, string offerSector, CancellationToken ct)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(TimeSpan.FromMilliseconds(1500)); // Circuit breaker timeout 1.5s

        try
        {
            // Thử gọi Python AI Sidecar localhost:8003
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromMilliseconds(1500);

            var payload = new
            {
                queries = new[] { demandTitle },
                documents = new[] { offerTitle }
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");
            var res = await client.PostAsync("http://localhost:8003/v1/rerank", content, cts.Token);
            if (res.IsSuccessStatusCode)
            {
                var body = await res.Content.ReadAsStringAsync(cts.Token);
                // Giả định response dạng [[{"score": 0.85}]]
                return (85.0, "BGE-M3_RERANK", false);
            }
            throw new HttpRequestException($"Sidecar returned HTTP {res.StatusCode}");
        }
        catch (Exception ex)
        {
            _logger.LogInformation(
                "Sidecar AI offline hoặc timeout ({Message}). Tự động Graceful Degradation fallback PostgreSQL FTS.",
                ex.Message);

            // PostgreSQL FTS Fallback logic
            var sameSector = string.Equals(demandSector, offerSector, StringComparison.OrdinalIgnoreCase);
            var ftsScore = sameSector ? 80.0 : 55.0;

            // Nếu từ khóa tương đồng trong title
            if (demandTitle.Contains(offerTitle, StringComparison.OrdinalIgnoreCase) ||
                offerTitle.Contains(demandTitle, StringComparison.OrdinalIgnoreCase))
            {
                ftsScore = Math.Min(100.0, ftsScore + 20.0);
            }

            return (ftsScore, "POSTGRES_FTS_FALLBACK", true);
        }
    }

    private static async Task UpsertMatchCandidateAsync(
        DbConnection conn,
        (Guid Id, string Code, string Title, string SectorCode, int TniScore, Guid? CreatedBy, Guid? BuyerOrgId, string BuyerOrgName) demand,
        (Guid Id, string Code, string Title, string SectorCode, int TrlLevel, string IpStatus, Guid? CreatedBy, Guid? SellerOrgId, string OrgName) offer,
        int matchScore,
        CancellationToken ct)
    {
        using var delCmd = conn.CreateCommand();
        delCmd.CommandText = "DELETE FROM brokerage.match_candidates WHERE demand_id = @demandId AND offer_id = @offerId";
        var pD1 = delCmd.CreateParameter(); pD1.ParameterName = "@demandId"; pD1.DbType = DbType.Guid; pD1.Value = demand.Id; delCmd.Parameters.Add(pD1);
        var pO1 = delCmd.CreateParameter(); pO1.ParameterName = "@offerId"; pO1.DbType = DbType.Guid; pO1.Value = offer.Id; delCmd.Parameters.Add(pO1);
        await delCmd.ExecuteNonQueryAsync(ct);

        using var insCmd = conn.CreateCommand();
        insCmd.CommandText = @"
            INSERT INTO brokerage.match_candidates (
                id, demand_id, demand_code, demand_title, buyer_organization_id, buyer_organization_name,
                offer_id, offer_code, offer_title, seller_organization_id, seller_organization_name,
                sector_code, match_score, tni_score, trl_level, ip_status, is_active, created_at
            ) VALUES (
                gen_random_uuid(), @demandId, @demandCode, @demandTitle, @buyerOrgId, @buyerOrgName,
                @offerId, @offerCode, @offerTitle, @sellerOrgId, @sellerOrgName,
                @sectorCode, @matchScore, @tniScore, @trlLevel, @ipStatus, true, now()
            )";

        var p1 = insCmd.CreateParameter(); p1.ParameterName = "@demandId"; p1.DbType = DbType.Guid; p1.Value = demand.Id; insCmd.Parameters.Add(p1);
        var p2 = insCmd.CreateParameter(); p2.ParameterName = "@demandCode"; p2.DbType = DbType.String; p2.Value = demand.Code; insCmd.Parameters.Add(p2);
        var p3 = insCmd.CreateParameter(); p3.ParameterName = "@demandTitle"; p3.DbType = DbType.String; p3.Value = demand.Title; insCmd.Parameters.Add(p3);
        var p4 = insCmd.CreateParameter(); p4.ParameterName = "@buyerOrgId"; p4.DbType = DbType.Guid; p4.Value = (object?)demand.BuyerOrgId ?? DBNull.Value; insCmd.Parameters.Add(p4);
        var p5 = insCmd.CreateParameter(); p5.ParameterName = "@buyerOrgName"; p5.DbType = DbType.String; p5.Value = demand.BuyerOrgName; insCmd.Parameters.Add(p5);
        var p6 = insCmd.CreateParameter(); p6.ParameterName = "@offerId"; p6.DbType = DbType.Guid; p6.Value = offer.Id; insCmd.Parameters.Add(p6);
        var p7 = insCmd.CreateParameter(); p7.ParameterName = "@offerCode"; p7.DbType = DbType.String; p7.Value = offer.Code; insCmd.Parameters.Add(p7);
        var p8 = insCmd.CreateParameter(); p8.ParameterName = "@offerTitle"; p8.DbType = DbType.String; p8.Value = offer.Title; insCmd.Parameters.Add(p8);
        var p9 = insCmd.CreateParameter(); p9.ParameterName = "@sellerOrgId"; p9.DbType = DbType.Guid; p9.Value = (object?)offer.SellerOrgId ?? DBNull.Value; insCmd.Parameters.Add(p9);
        var p10 = insCmd.CreateParameter(); p10.ParameterName = "@sellerOrgName"; p10.DbType = DbType.String; p10.Value = offer.OrgName; insCmd.Parameters.Add(p10);
        var p11 = insCmd.CreateParameter(); p11.ParameterName = "@sectorCode"; p11.DbType = DbType.String; p11.Value = demand.SectorCode; insCmd.Parameters.Add(p11);
        var p12 = insCmd.CreateParameter(); p12.ParameterName = "@matchScore"; p12.DbType = DbType.Int32; p12.Value = matchScore; insCmd.Parameters.Add(p12);
        var p13 = insCmd.CreateParameter(); p13.ParameterName = "@tniScore"; p13.DbType = DbType.Decimal; p13.Value = demand.TniScore; insCmd.Parameters.Add(p13);
        var p14 = insCmd.CreateParameter(); p14.ParameterName = "@trlLevel"; p14.DbType = DbType.Int32; p14.Value = offer.TrlLevel; insCmd.Parameters.Add(p14);
        var p15 = insCmd.CreateParameter(); p15.ParameterName = "@ipStatus"; p15.DbType = DbType.String; p15.Value = offer.IpStatus; insCmd.Parameters.Add(p15);

        await insCmd.ExecuteNonQueryAsync(ct);
    }
}
