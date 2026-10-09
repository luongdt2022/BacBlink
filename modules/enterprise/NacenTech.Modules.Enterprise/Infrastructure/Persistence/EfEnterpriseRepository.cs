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

    public async Task AddAsync(Domain.Enterprise enterprise, CancellationToken ct = default)
    {
        _db.Set<Domain.Enterprise>().Add(enterprise);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Domain.Enterprise enterprise, CancellationToken ct = default)
    {
        _db.Set<Domain.Enterprise>().Update(enterprise);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<(IReadOnlyList<Domain.Enterprise> Items, int TotalCount)> SearchAsync(EnterpriseSearchQuery query, CancellationToken ct = default)
    {
        var qry = _db.Set<Domain.Enterprise>().AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var q = query.Q.Trim().ToLower();
            qry = qry.Where(x => x.Name.ToLower().Contains(q) || 
                                 x.LegalName.ToLower().Contains(q) || 
                                 x.TaxCode.Contains(q) || 
                                 x.ProvinceCity.ToLower().Contains(q) || 
                                 x.MainSectorName.ToLower().Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(query.Province))
        {
            var p = query.Province.Trim().ToLower();
            qry = qry.Where(x => x.ProvinceCity.ToLower().Contains(p));
        }

        if (!string.IsNullOrWhiteSpace(query.SectorCode))
        {
            qry = qry.Where(x => x.SectorCode == query.SectorCode);
        }

        if (!string.IsNullOrWhiteSpace(query.SubjectType))
        {
            qry = qry.Where(x => x.SubjectType == query.SubjectType);
        }

        if (!string.IsNullOrWhiteSpace(query.TniClassification))
        {
            qry = qry.Where(x => x.TniClassification == query.TniClassification);
        }

        var totalCount = await qry.CountAsync(ct);
        var page = query.Page <= 0 ? 1 : query.Page;
        var pageSize = query.PageSize <= 0 ? 9 : query.PageSize;

        var items = await qry
            .Include(x => x.IntellectualProperties)
            .OrderByDescending(x => x.TniScore)
            .ThenBy(x => x.Name)
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
}
