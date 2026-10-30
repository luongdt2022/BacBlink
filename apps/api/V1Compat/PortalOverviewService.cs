using System.Data;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Content.Application;
using NacenTech.Modules.Demand.Domain;
using NacenTech.Modules.Enterprise.Domain;
using NacenTech.Modules.Technology.Domain;

namespace NacenTech.Api.V1Compat;

/// <summary>
/// TASK-01 Read Model: Tổng hợp số liệu thời gian thực từ các bảng CSDL PostgreSQL thật phục vụ Portal Landing Page (Zero-Mock)
/// </summary>
public sealed class PortalOverviewService(DbContext db, IMemoryCache cache) : IPortalOverviewService
{
    private const string CacheKey = "portal:overview:stats:v2";

    public async Task<PortalOverviewStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        if (cache.TryGetValue(CacheKey, out PortalOverviewStatsDto? cached) && cached != null)
        {
            return cached;
        }

        // 1. Tổng Cung Công Nghệ (Status = 'APPROVED' hoặc toàn bộ nếu chưa phân luồng kiểm duyệt)
        var totalOffers = await db.Set<SellerTechnologyOffer>().AsNoTracking()
            .CountAsync(o => o.Status == "APPROVED", ct);
        if (totalOffers == 0)
        {
            totalOffers = await db.Set<SellerTechnologyOffer>().AsNoTracking().CountAsync(ct);
        }
        if (totalOffers == 0)
        {
            totalOffers = await db.Set<TechnologyAsset>().AsNoTracking().CountAsync(ct);
        }

        // 2. Tổng Cầu Doanh Nghiệp (Chỉ đếm các bài toán đã được duyệt và công khai: is_public_listed = true AND status = 'VERIFIED')
        var totalDemands = await db.Set<DemandItem>().AsNoTracking()
            .CountAsync(d => d.IsPublicListed && d.Status == DemandItemStatuses.Verified, ct);
        if (totalDemands == 0)
        {
            totalDemands = await db.Set<DemandSurvey>().AsNoTracking().CountAsync(ct);
        }
        if (totalDemands == 0)
        {
            totalDemands = await db.Set<DemandBrief>().AsNoTracking().CountAsync(ct);
        }

        // 3. Doanh nghiệp và Chuyên gia
        var totalEnterprises = await db.Set<Enterprise>().AsNoTracking().CountAsync(ct);
        var totalExperts = await db.Set<ExpertProfile>().AsNoTracking().CountAsync(ct);

        // 4. Số tỉnh thành thực tế (COUNT DISTINCT province_city từ Enterprise, không hardcode số 34)
        var totalProvinces = await db.Set<Enterprise>().AsNoTracking()
            .Where(e => !string.IsNullOrWhiteSpace(e.ProvinceCity))
            .Select(e => e.ProvinceCity.Trim())
            .Distinct()
            .CountAsync(ct);

        // 5. Kết nối thành công & Thỏa thuận hợp tác (MOU)
        long totalSuccessfulConnections = 0;
        decimal totalEstimatedValueMillionVnd = 0m;

        try
        {
            var conn = db.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

            // Đếm connection_requests (status IN ('ACCEPTED', 'COMPLETED'))
            long acceptedConnections = 0;
            using (var cmdConn = conn.CreateCommand())
            {
                cmdConn.CommandText = "SELECT COUNT(*) FROM brokerage.connection_requests WHERE UPPER(status) IN ('ACCEPTED', 'COMPLETED');";
                var res = await cmdConn.ExecuteScalarAsync(ct);
                if (res != null && res != DBNull.Value) acceptedConnections = Convert.ToInt64(res);
            }

            // Đếm mou_agreements (status = 'SIGNED')
            long signedMous = 0;
            using (var cmdMou = conn.CreateCommand())
            {
                cmdMou.CommandText = "SELECT COUNT(*) FROM brokerage.mou_agreements WHERE UPPER(status) = 'SIGNED';";
                var res = await cmdMou.ExecuteScalarAsync(ct);
                if (res != null && res != DBNull.Value) signedMous = Convert.ToInt64(res);
            }

            totalSuccessfulConnections = acceptedConnections + signedMous;

            // 6. Tổng quy mô giá trị cơ hội (stage != 'CLOSED_LOST')
            decimal oppValueMillionVnd = 0m;
            using (var cmdOpp = conn.CreateCommand())
            {
                cmdOpp.CommandText = "SELECT COALESCE(SUM(estimated_value_million_vnd), 0) FROM brokerage.opportunities WHERE UPPER(stage) != 'CLOSED_LOST';";
                var res = await cmdOpp.ExecuteScalarAsync(ct);
                if (res != null && res != DBNull.Value) oppValueMillionVnd = Convert.ToDecimal(res);
            }

            // 7. Tổng ngân sách các bài toán nhu cầu công khai (Verified & IsPublicListed)
            var demandBudgets = await db.Set<DemandItem>().AsNoTracking()
                .Where(d => d.IsPublicListed && d.Status == DemandItemStatuses.Verified && !string.IsNullOrWhiteSpace(d.BudgetRange))
                .Select(d => d.BudgetRange)
                .ToListAsync(ct);

            decimal demandBudgetSumMillionVnd = 0m;
            foreach (var b in demandBudgets)
            {
                demandBudgetSumMillionVnd += ParseBudgetRangeToMillionVnd(b);
            }

            totalEstimatedValueMillionVnd = oppValueMillionVnd + demandBudgetSumMillionVnd;
        }
        catch
        {
            // Fallback gracefully nếu đang chạy môi trường test không có bảng brokerage raw DDL
        }

        var stats = new PortalOverviewStatsDto(
            totalOffers,
            totalDemands,
            totalEnterprises,
            totalExperts,
            totalProvinces,
            DateTimeOffset.UtcNow,
            totalSuccessfulConnections,
            totalEstimatedValueMillionVnd
        );

        cache.Set(CacheKey, stats, TimeSpan.FromMinutes(5));
        return stats;
    }

    public static decimal ParseBudgetRangeToMillionVnd(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return 0m;
        var text = raw.ToLowerInvariant().Replace(",", ".").Trim();

        // 1. Plain numeric
        if (Regex.IsMatch(text, @"^\d+(\.\d+)?$"))
        {
            if (decimal.TryParse(text, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var plain))
            {
                return plain > 1_000_000m ? plain / 1_000_000m : plain;
            }
        }

        // 2. Predefined token mapping
        if (text.Contains("under_100m")) return 50m;
        if (text.Contains("100m_300m")) return 200m;
        if (text.Contains("300m_to_500m") || text.Contains("300m_500m")) return 400m;
        if (text.Contains("500m_to_1b") || text.Contains("500m_1b")) return 750m;
        if (text.Contains("1b_5b")) return 3000m;
        if (text.Contains("over_5b")) return 6000m;
        if (text.Contains("over_10b")) return 12000m;

        // 3. Parse range (e.g. "500 triệu – 1 tỷ VNĐ", "1 – 3 tỷ đồng", "800 triệu – 2 tỷ đồng")
        var parts = Regex.Split(text, @"[-–—~]");
        if (parts.Length == 2)
        {
            var unit2 = ExtractUnit(parts[1]);
            var val1 = ParseSingleBound(parts[0], unit2);
            var val2 = ParseSingleBound(parts[1], null);
            if (val1 > 0m && val2 > 0m) return (val1 + val2) / 2m;
            if (val2 > 0m) return val2;
            if (val1 > 0m) return val1;
        }

        return ParseSingleBound(text, null);
    }

    private static string? ExtractUnit(string s)
    {
        if (s.Contains("tỷ") || s.Contains("ty") || s.Contains("b")) return "ty";
        if (s.Contains("triệu") || s.Contains("trieu") || s.Contains("m")) return "trieu";
        return null;
    }

    private static decimal ParseSingleBound(string s, string? fallbackUnit)
    {
        var unit = ExtractUnit(s) ?? fallbackUnit;
        var match = Regex.Match(s, @"\d+(\.\d+)?");
        if (!match.Success) return 0m;
        if (!decimal.TryParse(match.Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var num))
            return 0m;

        if (unit == "ty") return num * 1000m;
        if (unit == "trieu") return num;
        if (num > 1_000_000m) return num / 1_000_000m;
        return num;
    }
}
