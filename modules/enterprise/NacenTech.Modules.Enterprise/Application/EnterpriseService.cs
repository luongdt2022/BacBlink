using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using NacenTech.Modules.Enterprise.Domain;

namespace NacenTech.Modules.Enterprise.Application;

public interface IEnterpriseRepository
{
    Task<bool> ExistsByTaxCodeAsync(string taxCode, Guid? excludeId = null, CancellationToken ct = default);
    Task<Domain.Enterprise?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Domain.Enterprise?> GetByTaxCodeAsync(string taxCode, CancellationToken ct = default);
    Task AddAsync(Domain.Enterprise enterprise, CancellationToken ct = default);
    Task UpdateAsync(Domain.Enterprise enterprise, CancellationToken ct = default);
    Task<(IReadOnlyList<Domain.Enterprise> Items, int TotalCount)> SearchAsync(EnterpriseSearchQuery query, CancellationToken ct = default);
    Task<EnterpriseDashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default);
}

public interface IEnterpriseService
{
    Task<EnterprisePublicDirectoryDto> GetPublicDirectoryAsync(EnterpriseSearchQuery query, CancellationToken ct = default);
    Task<EnterprisePublicDetailDto?> GetPublicDetailAsync(string taxCode, bool isPrivileged = false, CancellationToken ct = default);
    Task<EnterpriseProfileFullDto?> GetOwnerProfileAsync(Guid enterpriseId, CancellationToken ct = default);
    Task<EnterpriseProfileFullDto> UpsertProfileAsync(Guid enterpriseId, UpsertEnterpriseProfileRequest request, CancellationToken ct = default);
    Task SubmitVerificationAsync(Guid enterpriseId, CancellationToken ct = default);
    Task ApproveEnterpriseAsync(Guid enterpriseId, string approvedBy, string? adminScopeId = null, CancellationToken ct = default);
    Task RejectEnterpriseAsync(Guid enterpriseId, string reason, string? adminScopeId = null, CancellationToken ct = default);
    Task<EnterpriseDashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default);
    bool CanViewRevenueAndFunding(string actorRole, bool isOwner);
}

public class EnterpriseService : IEnterpriseService
{
    private readonly IEnterpriseRepository _repository;

    public EnterpriseService(IEnterpriseRepository repository)
    {
        _repository = repository;
    }

    public async Task<EnterprisePublicDirectoryDto> GetPublicDirectoryAsync(EnterpriseSearchQuery query, CancellationToken ct = default)
    {
        try
        {
            var (items, totalCount) = await _repository.SearchAsync(query, ct);
            var pageSize = query.PageSize <= 0 ? 9 : query.PageSize;
            var totalPages = (totalCount + pageSize - 1) / pageSize;

            var dtoItems = items.Select(x => new EnterprisePublicDirectoryItemDto(
                Id: x.Id,
                Name: string.IsNullOrWhiteSpace(x.Name) ? x.LegalName : x.Name,
                TaxCode: x.TaxCode,
                SubjectType: x.SubjectType,
                ProvinceCity: x.ProvinceCity,
                MainSectorName: x.MainSectorName,
                SectorCode: x.SectorCode,
                WorkforceScale: x.WorkforceScale,
                IsVerified: x.IsVerified,
                TniScore: x.TniScore,
                TniClassification: x.TniClassification,
                IpCount: x.IntellectualProperties?.Count ?? 0,
                Status: x.Status,
                OwnershipType: x.OwnershipType,
                OperatingZone: x.OperatingZone,
                HasRdUnit: x.HasRdUnit,
                IsExporting: x.IsExporting,
                InValueChain: x.InValueChain,
                TopBottlenecks: SafeParseStringList(x.TopBottlenecksJson),
                SupportNeeds: SafeParseStringList(x.SupportNeedsJson)
            )).ToList();

            return new EnterprisePublicDirectoryDto(dtoItems, totalCount, query.Page, pageSize, totalPages);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR GetPublicDirectoryAsync] {ex}");
            var pageSize = query.PageSize <= 0 ? 9 : query.PageSize;
            return new EnterprisePublicDirectoryDto([], 0, query.Page, pageSize, 0);
        }
    }

    public async Task<EnterprisePublicDetailDto?> GetPublicDetailAsync(string taxCode, bool isPrivileged = false, CancellationToken ct = default)
    {
        var ent = await _repository.GetByTaxCodeAsync(taxCode, ct);
        if (ent is null) return null;

        // BR-02-002: Bảo vệ dữ liệu nhạy cảm PII và Doanh thu
        var revenueDisplay = isPrivileged
            ? (string.IsNullOrWhiteSpace(ent.RevenueRange) ? "Chưa công bố" : ent.RevenueRange)
            : "[BẢO MẬT]";

        var bottlenecks = SafeParseStringList(ent.TopBottlenecksJson);
        var supportNeeds = SafeParseStringList(ent.SupportNeedsJson);

        var projects = (ent.InnovationProjects ?? [])
            .Select(p => new EnterpriseProjectDto(p.Id, p.Title, p.Description, p.Status, p.Partners))
            .ToList();

        var ips = (ent.IntellectualProperties ?? [])
            .Select(ip => new EnterpriseIpDto(ip.Id, ip.Type, ip.Title, ip.RegistrationNumber))
            .ToList();

        return new EnterprisePublicDetailDto(
            Id: ent.Id,
            Name: string.IsNullOrWhiteSpace(ent.Name) ? ent.LegalName : ent.Name,
            TaxCode: ent.TaxCode,
            SubjectType: ent.SubjectType,
            EstablishedDate: ent.EstablishedDate,
            ProvinceCity: ent.ProvinceCity,
            AddressDetail: ent.AddressDetail,
            Website: ent.Website,
            IsVerified: ent.IsVerified,
            MainSectorName: ent.MainSectorName,
            SectorCode: ent.SectorCode,
            OwnershipType: ent.OwnershipType,
            WorkforceScale: ent.WorkforceScale,
            RevenueRange: revenueDisplay,
            OperatingZone: ent.OperatingZone,
            HighQualificationRatio: ent.HighQualificationRatio,
            TniScore: ent.TniScore,
            TniClassification: ent.TniClassification,
            HasRdUnit: ent.HasRdUnit,
            HasRdBudget: ent.HasRdBudget,
            IsExporting: ent.IsExporting,
            InValueChain: ent.InValueChain,
            TopBottlenecks: bottlenecks,
            SupportNeeds: supportNeeds,
            Projects: projects,
            IntellectualProperties: ips
        );
    }

    public async Task<EnterpriseProfileFullDto?> GetOwnerProfileAsync(Guid enterpriseId, CancellationToken ct = default)
    {
        var ent = await _repository.GetByIdAsync(enterpriseId, ct);
        if (ent is null) return null;

        var bottlenecks = SafeParseStringList(ent.TopBottlenecksJson);
        var supportNeeds = SafeParseStringList(ent.SupportNeedsJson);

        var projects = (ent.InnovationProjects ?? [])
            .Select(p => new EnterpriseProjectDto(p.Id, p.Title, p.Description, p.Status, p.Partners))
            .ToList();

        var ips = (ent.IntellectualProperties ?? [])
            .Select(ip => new EnterpriseIpDto(ip.Id, ip.Type, ip.Title, ip.RegistrationNumber))
            .ToList();

        return new EnterpriseProfileFullDto(
            Id: ent.Id,
            Name: string.IsNullOrWhiteSpace(ent.Name) ? ent.LegalName : ent.Name,
            TaxCode: ent.TaxCode,
            SubjectType: ent.SubjectType,
            EstablishedDate: ent.EstablishedDate,
            ProvinceCity: ent.ProvinceCity,
            AddressDetail: ent.AddressDetail,
            Website: ent.Website,
            Description: ent.Description,
            IsVerified: ent.IsVerified,
            VerificationStatus: ent.VerificationStatus,
            ContactPerson: ent.ContactPerson,
            ContactPhone: ent.ContactPhone,
            ContactEmail: ent.ContactEmail,
            IsContactPublic: ent.IsContactPublic,
            MainSectorName: ent.MainSectorName,
            SectorCode: ent.SectorCode,
            OwnershipType: ent.OwnershipType,
            WorkforceScale: ent.WorkforceScale,
            RevenueRange: ent.RevenueRange,
            OperatingZone: ent.OperatingZone,
            HighQualificationRatio: ent.HighQualificationRatio,
            TniScore: ent.TniScore,
            TniClassification: ent.TniClassification,
            HasRdUnit: ent.HasRdUnit,
            HasRdBudget: ent.HasRdBudget,
            RdBudgetAmount: ent.RdBudgetAmount,
            RdPersonnelCount: ent.RdPersonnelCount,
            IsExporting: ent.IsExporting,
            InValueChain: ent.InValueChain,
            TopBottlenecks: bottlenecks,
            SupportNeeds: supportNeeds,
            Projects: projects,
            IntellectualProperties: ips,
            ProfileDetailsJson: ent.ProfileDetailsJson
        );
    }

    public async Task<EnterpriseProfileFullDto> UpsertProfileAsync(Guid enterpriseId, UpsertEnterpriseProfileRequest request, CancellationToken ct = default)
    {
        var ent = await _repository.GetByIdAsync(enterpriseId, ct);
        if (ent is null)
        {
            ent = new Domain.Enterprise();
            await _repository.AddAsync(ent, ct);
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            ent.Name = request.Name;
            ent.LegalName = request.Name;
        }

        if (!string.IsNullOrWhiteSpace(request.SubjectType)) ent.SubjectType = request.SubjectType;
        if (!string.IsNullOrWhiteSpace(request.EstablishedDate)) ent.EstablishedDate = request.EstablishedDate;
        if (!string.IsNullOrWhiteSpace(request.ProvinceCity)) ent.ProvinceCity = request.ProvinceCity;
        if (!string.IsNullOrWhiteSpace(request.AddressDetail)) ent.AddressDetail = request.AddressDetail;
        if (!string.IsNullOrWhiteSpace(request.Website)) ent.Website = request.Website;
        if (!string.IsNullOrWhiteSpace(request.Description)) ent.Description = request.Description;

        ent.ContactPerson = request.ContactPerson;
        ent.ContactPhone = request.ContactPhone;
        ent.ContactEmail = request.ContactEmail;
        ent.IsContactPublic = request.IsContactPublic;

        if (!string.IsNullOrWhiteSpace(request.MainSectorName)) ent.MainSectorName = request.MainSectorName;
        if (!string.IsNullOrWhiteSpace(request.SectorCode)) ent.SectorCode = request.SectorCode;
        if (!string.IsNullOrWhiteSpace(request.OwnershipType)) ent.OwnershipType = request.OwnershipType;
        if (!string.IsNullOrWhiteSpace(request.WorkforceScale)) ent.WorkforceScale = request.WorkforceScale;
        if (!string.IsNullOrWhiteSpace(request.RevenueRange)) ent.RevenueRange = request.RevenueRange;
        if (!string.IsNullOrWhiteSpace(request.OperatingZone)) ent.OperatingZone = request.OperatingZone;
        if (!string.IsNullOrWhiteSpace(request.HighQualificationRatio)) ent.HighQualificationRatio = request.HighQualificationRatio;

        ent.HasRdUnit = request.HasRdUnit;
        ent.HasRdBudget = request.HasRdBudget;
        ent.RdBudgetAmount = request.RdBudgetAmount;
        ent.RdPersonnelCount = request.RdPersonnelCount;
        ent.IsExporting = request.IsExporting;
        ent.InValueChain = request.InValueChain;

        if (request.TopBottlenecks is not null)
            ent.TopBottlenecksJson = JsonSerializer.Serialize(request.TopBottlenecks);
        if (request.SupportNeeds is not null)
            ent.SupportNeedsJson = JsonSerializer.Serialize(request.SupportNeeds);
        if (!string.IsNullOrWhiteSpace(request.ProfileDetailsJson))
            ent.ProfileDetailsJson = request.ProfileDetailsJson;

        ent.TouchEntity();
        await _repository.UpdateAsync(ent, ct);

        return (await GetOwnerProfileAsync(ent.Id, ct))!;
    }

    public async Task SubmitVerificationAsync(Guid enterpriseId, CancellationToken ct = default)
    {
        var ent = await _repository.GetByIdAsync(enterpriseId, ct);
        if (ent is null)
            throw new KeyNotFoundException($"ENT-404: Không tìm thấy doanh nghiệp có ID {enterpriseId}");

        // BR-02-003: Kiểm tra thông tin tối thiểu
        ent.SubmitVerification();
        await _repository.UpdateAsync(ent, ct);
    }

    public async Task ApproveEnterpriseAsync(Guid enterpriseId, string approvedBy, string? adminScopeId = null, CancellationToken ct = default)
    {
        var ent = await _repository.GetByIdAsync(enterpriseId, ct);
        if (ent is null)
            throw new KeyNotFoundException($"ENT-404: Không tìm thấy doanh nghiệp có ID {enterpriseId}");

        // BR-02-005: Kiểm tra thẩm quyền địa bàn nếu cán bộ là PROVINCIAL_ADMIN
        if (!string.IsNullOrWhiteSpace(adminScopeId) && 
            !adminScopeId.Equals("GLOBAL", StringComparison.OrdinalIgnoreCase) && 
            !adminScopeId.Equals("TW", StringComparison.OrdinalIgnoreCase))
        {
            var isMatchingProvince = MatchProvinceScope(ent.ProvinceCity, adminScopeId);
            if (!isMatchingProvince)
            {
                throw new InvalidOperationException($"BR-02-005: Cán bộ chỉ có quyền thẩm định doanh nghiệp thuộc địa bàn quản lý ({adminScopeId}).");
            }
        }

        ent.Approve(approvedBy);
        await _repository.UpdateAsync(ent, ct);
    }

    public async Task RejectEnterpriseAsync(Guid enterpriseId, string reason, string? adminScopeId = null, CancellationToken ct = default)
    {
        var ent = await _repository.GetByIdAsync(enterpriseId, ct);
        if (ent is null)
            throw new KeyNotFoundException($"ENT-404: Không tìm thấy doanh nghiệp có ID {enterpriseId}");

        if (!string.IsNullOrWhiteSpace(adminScopeId) && 
            !adminScopeId.Equals("GLOBAL", StringComparison.OrdinalIgnoreCase) && 
            !adminScopeId.Equals("TW", StringComparison.OrdinalIgnoreCase))
        {
            if (!MatchProvinceScope(ent.ProvinceCity, adminScopeId))
            {
                throw new InvalidOperationException($"BR-02-005: Cán bộ chỉ có quyền xử lý doanh nghiệp thuộc địa bàn quản lý ({adminScopeId}).");
            }
        }

        ent.Reject(reason);
        await _repository.UpdateAsync(ent, ct);
    }

    public Task<EnterpriseDashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        return _repository.GetDashboardStatsAsync(ct);
    }

    public bool CanViewRevenueAndFunding(string actorRole, bool isOwner)
    {
        if (isOwner) return true;
        if (actorRole == "ADMIN" || actorRole == "SUPER_ADMIN" || actorRole == "OPERATOR_ADMIN" || actorRole == "PROVINCIAL_ADMIN")
            return true;
        return false;
    }

    private static bool MatchProvinceScope(string provinceName, string scopeId)
    {
        if (string.IsNullOrWhiteSpace(provinceName)) return false;
        var p = provinceName.Trim().ToLowerInvariant();
        var s = scopeId.Trim().ToLowerInvariant();

        if (s == "hn" && (p.Contains("hà nội") || p.Contains("ha noi"))) return true;
        if (s == "hcm" && (p.Contains("hồ chí minh") || p.Contains("tp.hcm") || p.Contains("ho chi minh"))) return true;
        if (s == "hp" && (p.Contains("hải phòng") || p.Contains("hai phong"))) return true;
        if (s == "dn" && (p.Contains("đà nẵng") || p.Contains("da nang"))) return true;
        if (s == "ct" && (p.Contains("cần thơ") || p.Contains("can tho"))) return true;
        if (s == "ls" && (p.Contains("lạng sơn") || p.Contains("lang son"))) return true;

        return p.Contains(s);
    }

    private static IReadOnlyList<string> SafeParseStringList(string? json)
    {
        if (string.IsNullOrWhiteSpace(json) || json == "[]") return [];
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? [];
        }
        catch
        {
            return [];
        }
    }
}
