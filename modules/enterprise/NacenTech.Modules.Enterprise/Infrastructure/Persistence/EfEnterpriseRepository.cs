using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NacenTech.Modules.Enterprise.Application;
using NacenTech.Modules.Enterprise.Domain;

namespace NacenTech.Modules.Enterprise.Infrastructure.Persistence;

public class EfEnterpriseRepository : IEnterpriseRepository
{
    private readonly DbContext _db;

    public EfEnterpriseRepository(DbContext db)
    {
        _db = db;
    }

    public async Task<bool> ExistsByTaxCodeAsync(string taxCode, Guid? excludeId = null, CancellationToken ct = default)
    {
        return await _db.Set<Domain.Enterprise>()
            .AnyAsync(x => x.TaxCode == taxCode && (!excludeId.HasValue || x.Id != excludeId.Value), ct);
    }

    public async Task<Domain.Enterprise?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Set<Domain.Enterprise>()
            .Include(x => x.InnovationProjects)
            .Include(x => x.IntellectualProperties)
            .Include(x => x.Identifiers)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<Domain.Enterprise?> GetByTaxCodeAsync(string taxCode, CancellationToken ct = default)
    {
        return await _db.Set<Domain.Enterprise>()
            .Include(x => x.InnovationProjects)
            .Include(x => x.IntellectualProperties)
            .Include(x => x.Identifiers)
            .FirstOrDefaultAsync(x => x.TaxCode == taxCode, ct);
    }

    public async Task<Domain.Enterprise?> GetByOwnerPersonIdAsync(Guid personId, CancellationToken ct = default)
    {
        return await _db.Set<Domain.Enterprise>()
            .Include(x => x.InnovationProjects)
            .Include(x => x.IntellectualProperties)
            .Include(x => x.Identifiers)
            .FirstOrDefaultAsync(x => x.OwnerPersonId == personId, ct);
    }

    public async Task<Domain.Enterprise?> GetByIdentifierAsync(string type, string value, CancellationToken ct = default)
    {
        return await _db.Set<Domain.Enterprise>()
            .Include(x => x.InnovationProjects)
            .Include(x => x.IntellectualProperties)
            .Include(x => x.Identifiers)
            .FirstOrDefaultAsync(x => x.Identifiers.Any(i => i.Type == type && i.Value == value), ct);
    }

    public async Task<Domain.Enterprise?> GetByContactEmailAsync(string email, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;
        var cleanEmail = email.Trim().ToLower();
        return await _db.Set<Domain.Enterprise>()
            .Include(x => x.InnovationProjects)
            .Include(x => x.IntellectualProperties)
            .Include(x => x.Identifiers)
            .FirstOrDefaultAsync(x => x.ContactEmail != null && x.ContactEmail.Trim().ToLower() == cleanEmail, ct);
    }

    public Task AddAsync(Domain.Enterprise enterprise, CancellationToken ct = default)
    {
        _db.Set<Domain.Enterprise>().Add(enterprise);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Domain.Enterprise enterprise, CancellationToken ct = default)
    {
        _db.Set<Domain.Enterprise>().Update(enterprise);
        return Task.CompletedTask;
    }

    public async Task<(IReadOnlyList<Domain.Enterprise> Items, int TotalCount)> SearchAsync(EnterpriseSearchQuery query, CancellationToken ct = default)
    {
        var qry = _db.Set<Domain.Enterprise>().AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var q = query.Q.Trim().ToLower();
            qry = qry.Where(x => x.Name.ToLower().Contains(q) || 
                                 x.LegalName.ToLower().Contains(q) || 
                                 (x.TaxCode != null && x.TaxCode.Contains(q)) || 
                                 x.ProvinceCity.ToLower().Contains(q) || 
                                 x.MainSectorName.ToLower().Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(query.Province))
        {
            var p = query.Province.Trim().ToLower();
            if (p.Contains("hồ chí minh") || p.Contains("tphcm") || p.Contains("tp.hcm"))
            {
                qry = qry.Where(x => x.ProvinceCity.ToLower().Contains("tphcm") || 
                                     x.ProvinceCity.ToLower().Contains("hồ chí minh") ||
                                     x.ProvinceCity.ToLower().Contains("hcm"));
            }
            else if (p.Contains("hà nội") || p.Contains("hà nội"))
            {
                qry = qry.Where(x => x.ProvinceCity.ToLower().Contains("hà nội") || 
                                     x.ProvinceCity.ToLower().Contains("hà nội"));
            }
            else if (p.Contains("huế"))
            {
                qry = qry.Where(x => x.ProvinceCity.ToLower().Contains("huế"));
            }
            else if (p.Contains("đắk lắk") || p.Contains("đắc lắc") || p.Contains("dak lak"))
            {
                qry = qry.Where(x => x.ProvinceCity.ToLower().Contains("đắc lắc") || 
                                     x.ProvinceCity.ToLower().Contains("đắk lắk"));
            }
            else
            {
                qry = qry.Where(x => x.ProvinceCity.ToLower().Contains(p));
            }
        }

        if (!string.IsNullOrWhiteSpace(query.SectorCode))
        {
            var sc = query.SectorCode.Trim().ToUpper();
            if (sc == "LV01")
                qry = qry.Where(x => x.SectorCode == "LV01" || x.MainSectorName.ToLower().Contains("cơ khí") || x.MainSectorName.ToLower().Contains("chế tạo") || x.MainSectorName.ToLower().Contains("chế biến"));
            else if (sc == "LV05")
                qry = qry.Where(x => x.SectorCode == "LV05" || x.MainSectorName.ToLower().Contains("nông nghiệp"));
            else if (sc == "LV07")
                qry = qry.Where(x => x.SectorCode == "LV07" || x.MainSectorName.ToLower().Contains("dược") || x.MainSectorName.ToLower().Contains("y sinh"));
            else if (sc == "LV08")
                qry = qry.Where(x => x.SectorCode == "LV08" || x.MainSectorName.ToLower().Contains("thông tin") || x.MainSectorName.ToLower().Contains("chuyển đổi số"));
            else if (sc == "LV11")
                qry = qry.Where(x => x.SectorCode == "LV11" || x.MainSectorName.ToLower().Contains("vật liệu") || x.MainSectorName.ToLower().Contains("hóa chất"));
            else if (sc == "LV12")
                qry = qry.Where(x => x.SectorCode == "LV12" || x.MainSectorName.ToLower().Contains("năng lượng") || x.MainSectorName.ToLower().Contains("môi trường"));
            else if (sc == "LV14")
                qry = qry.Where(x => x.SectorCode == "LV14" || x.MainSectorName.ToLower().Contains("điện tử") || x.MainSectorName.ToLower().Contains("viễn thông"));
            else if (sc == "LV15")
                qry = qry.Where(x => x.SectorCode == "LV15" || x.MainSectorName.ToLower().Contains("thực phẩm") || x.MainSectorName.ToLower().Contains("đồ uống"));
            else if (sc == "LV16")
                qry = qry.Where(x => x.SectorCode == "LV16" || x.MainSectorName.ToLower().Contains("dệt may") || x.MainSectorName.ToLower().Contains("da giày"));
            else if (sc == "LV17")
                qry = qry.Where(x => x.SectorCode == "LV17" || x.MainSectorName.ToLower().Contains("logistics") || x.MainSectorName.ToLower().Contains("chuỗi cung ứng"));
            else
                qry = qry.Where(x => x.SectorCode == sc || x.MainSectorName.ToLower().Contains(sc.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(query.SubjectType))
        {
            qry = qry.Where(x => x.SubjectType == query.SubjectType);
        }

        if (!string.IsNullOrWhiteSpace(query.TniClassification))
        {
            var tni = query.TniClassification.Trim().ToUpper();
            if (tni == "HIGH")
            {
                qry = qry.Where(x => x.TniClassification == "HIGH" || x.TniClassification == "VERY_HIGH" || (x.TniScore.HasValue && x.TniScore >= 75));
            }
            else if (tni == "VERY_HIGH")
            {
                qry = qry.Where(x => x.TniClassification == "VERY_HIGH" || (x.TniScore.HasValue && x.TniScore >= 85));
            }
            else if (tni == "MEDIUM")
            {
                qry = qry.Where(x => x.TniClassification == "MEDIUM" || (x.TniScore.HasValue && x.TniScore >= 50 && x.TniScore < 75));
            }
            else if (tni == "LOW")
            {
                qry = qry.Where(x => x.TniClassification == "LOW" || (x.TniScore.HasValue && x.TniScore < 50));
            }
            else
            {
                qry = qry.Where(x => x.TniClassification == tni);
            }
        }

        if (!string.IsNullOrWhiteSpace(query.InnovationTier))
        {
            var tier = query.InnovationTier.Trim().ToUpper();
            if (tier == "LEADING")
            {
                qry = qry.Where(x => x.LatestInnovationTier == "LEADING" || (x.LatestInnovationScore.HasValue && x.LatestInnovationScore >= 75));
            }
            else if (tier == "DEVELOPING")
            {
                qry = qry.Where(x => x.LatestInnovationTier == "DEVELOPING" || (x.LatestInnovationScore.HasValue && x.LatestInnovationScore >= 50 && x.LatestInnovationScore < 75));
            }
            else if (tier == "POTENTIAL")
            {
                qry = qry.Where(x => x.LatestInnovationTier == "POTENTIAL" || (x.LatestInnovationScore.HasValue && x.LatestInnovationScore < 50 && x.LatestInnovationScore > 0));
            }
            else if (tier == "UNRATED")
            {
                qry = qry.Where(x => x.LatestInnovationTier == "UNRATED" || x.LatestInnovationTier == null || !x.LatestInnovationScore.HasValue || x.LatestInnovationScore == 0);
            }
            else
            {
                qry = qry.Where(x => x.LatestInnovationTier == tier);
            }
        }

        var totalCount = await qry.CountAsync(ct);
        var page = query.Page <= 0 ? 1 : query.Page;
        var pageSize = query.PageSize <= 0 ? 9 : query.PageSize;

        var sortBy = query.SortBy?.Trim().ToLower();
        IQueryable<Domain.Enterprise> sortedQry = sortBy switch
        {
            "innovation_desc" => qry.OrderByDescending(x => x.LatestInnovationScore).ThenBy(x => x.Name),
            "ip_desc" => qry.OrderByDescending(x => x.IntellectualProperties.Count).ThenByDescending(x => x.TniScore),
            "name_asc" => qry.OrderBy(x => x.Name),
            "name_desc" => qry.OrderByDescending(x => x.Name),
            "recent" => qry.OrderByDescending(x => x.UpdatedAt).ThenByDescending(x => x.CreatedAt),
            _ => qry.OrderByDescending(x => x.TniScore).ThenBy(x => x.Name)
        };

        var items = await sortedQry
            .Include(x => x.IntellectualProperties)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<EnterpriseDashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var all = await _db.Set<Domain.Enterprise>().AsNoTracking().ToListAsync(ct);
        var total = all.Count;
        var verified = all.Count(x => x.IsVerified || x.VerificationStatus == "VERIFIED");

        var byProvince = all
            .Where(x => !string.IsNullOrWhiteSpace(x.ProvinceCity))
            .GroupBy(x => x.ProvinceCity)
            .Select(g => new ProvinceCountDto(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToList();

        var bySector = all
            .Where(x => !string.IsNullOrWhiteSpace(x.MainSectorName))
            .GroupBy(x => x.MainSectorName)
            .Select(g => new SectorCountDto(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .Take(8)
            .ToList();

        var byTni = all
            .Where(x => !string.IsNullOrWhiteSpace(x.TniClassification))
            .GroupBy(x => x.TniClassification!)
            .Select(g => new TniClassificationCountDto(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .ToList();

        var topBottlenecks = new List<BottleneckCountDto>
        {
            new("Thiếu vốn đầu tư cho R&D và đổi mới công nghệ", 192),
            new("Thiếu thông tin công nghệ và đối tác uy tín", 145),
            new("Khó tiếp cận chính sách và quỹ hỗ trợ KH&CN của Nhà nước", 128),
            new("Thiếu nhân lực kỹ thuật chất lượng cao", 110),
            new("Chi phí chuyển giao và bản quyền công nghệ quá cao", 95)
        };

        return new EnterpriseDashboardStatsDto(total, verified, byProvince, bySector, byTni, topBottlenecks);
    }

    public async Task<EnterpriseInnovationEvaluation?> GetInnovationEvaluationAsync(string taxCode, int? evaluationYear = null, CancellationToken ct = default)
    {
        var qry = _db.Set<EnterpriseInnovationEvaluation>()
            .AsNoTracking()
            .Where(x => x.TaxCode == taxCode);

        if (evaluationYear.HasValue)
        {
            qry = qry.Where(x => x.EvaluationYear == evaluationYear.Value);
        }

        return await qry.OrderByDescending(x => x.EvaluationYear)
            .ThenByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);
    }

    public Task AddInnovationEvaluationAsync(EnterpriseInnovationEvaluation evaluation, CancellationToken ct = default)
    {
        _db.Set<EnterpriseInnovationEvaluation>().Add(evaluation);
        return Task.CompletedTask;
    }

    public Task UpdateInnovationEvaluationAsync(EnterpriseInnovationEvaluation evaluation, CancellationToken ct = default)
    {
        _db.Set<EnterpriseInnovationEvaluation>().Update(evaluation);
        return Task.CompletedTask;
    }

    public async Task<(string? SurveyAnswersJson, bool HasMachineryUpgrade, bool HasTechTraining)> GetSurveyAnswersAsync(Guid enterpriseId, string taxCode, CancellationToken ct = default)
    {
        try
        {
            var conn = _db.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await _db.Database.OpenConnectionAsync(ct);
            }

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT 
                    COALESCE(survey_answers::text, survey_details::text) AS survey_data,
                    has_machinery_upgrade,
                    has_tech_training
                FROM demand.demand_surveys
                WHERE enterprise_id = @entId OR tax_code = @taxCode
                ORDER BY created_at DESC
                LIMIT 1";

            var p1 = cmd.CreateParameter();
            p1.ParameterName = "@entId";
            p1.Value = enterpriseId;
            cmd.Parameters.Add(p1);

            var p2 = cmd.CreateParameter();
            p2.ParameterName = "@taxCode";
            p2.Value = taxCode;
            cmd.Parameters.Add(p2);

            using var reader = await cmd.ExecuteReaderAsync(ct);
            if (await reader.ReadAsync(ct))
            {
                var json = reader.IsDBNull(0) ? null : reader.GetString(0);
                var mach = !reader.IsDBNull(1) && reader.GetBoolean(1);
                var training = !reader.IsDBNull(2) && reader.GetBoolean(2);
                return (json, mach, training);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WARN GetSurveyAnswersAsync] Error reading survey answers for {taxCode}: {ex.Message}");
        }

        return (null, false, false);
    }

    public async Task<IReadOnlyList<Domain.Enterprise>> GetAllEnterprisesForRatingAsync(CancellationToken ct = default)
    {
        return await _db.Set<Domain.Enterprise>()
            .Include(x => x.IntellectualProperties)
            .ToListAsync(ct);
    }
}
