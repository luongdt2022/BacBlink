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
    Task<EnterpriseInnovationEvaluation?> GetInnovationEvaluationAsync(string taxCode, int? evaluationYear = null, CancellationToken ct = default);
    Task AddInnovationEvaluationAsync(EnterpriseInnovationEvaluation evaluation, CancellationToken ct = default);
    Task UpdateInnovationEvaluationAsync(EnterpriseInnovationEvaluation evaluation, CancellationToken ct = default);
    Task<(string? SurveyAnswersJson, bool HasMachineryUpgrade, bool HasTechTraining)> GetSurveyAnswersAsync(Guid enterpriseId, string taxCode, CancellationToken ct = default);
    Task<IReadOnlyList<Domain.Enterprise>> GetAllEnterprisesForRatingAsync(CancellationToken ct = default);
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
    Task<InnovationEvaluationDto?> GetInnovationRatingAsync(string taxCode, bool isPrivileged = false, CancellationToken ct = default);
    Task<int> RecalculateAllInnovationRatingsAsync(CancellationToken ct = default);
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
                SupportNeeds: SafeParseStringList(x.SupportNeedsJson),
                InnovationScore: x.LatestInnovationScore,
                InnovationTier: x.LatestInnovationTier,
                InnovationBadge: GetInnovationBadgeName(x.LatestInnovationTier)
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
        var isNew = ent is null;
        if (isNew)
        {
            ent = new Domain.Enterprise(enterpriseId);
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            ent!.Name = request.Name;
            ent.LegalName = request.Name;
        }

        if (!string.IsNullOrWhiteSpace(request.SubjectType)) ent!.SubjectType = request.SubjectType;
        if (!string.IsNullOrWhiteSpace(request.EstablishedDate)) ent!.EstablishedDate = request.EstablishedDate;
        if (!string.IsNullOrWhiteSpace(request.ProvinceCity)) ent!.ProvinceCity = request.ProvinceCity;
        if (!string.IsNullOrWhiteSpace(request.AddressDetail)) ent!.AddressDetail = request.AddressDetail;
        if (!string.IsNullOrWhiteSpace(request.Website)) ent!.Website = request.Website;
        if (!string.IsNullOrWhiteSpace(request.Description)) ent!.Description = request.Description;

        ent!.ContactPerson = request.ContactPerson;
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
        if (isNew)
        {
            await _repository.AddAsync(ent, ct);
        }
        else
        {
            await _repository.UpdateAsync(ent, ct);
        }

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

    public async Task<InnovationEvaluationDto?> GetInnovationRatingAsync(string taxCode, bool isPrivileged = false, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(taxCode)) return null;

        var ent = await _repository.GetByTaxCodeAsync(taxCode.Trim(), ct);
        if (ent is null) return null;

        var eval = await _repository.GetInnovationEvaluationAsync(ent.TaxCode, 2024, ct);
        if (eval is null)
        {
            // Tự động tính toán sơ bộ từ dữ liệu khảo sát 304 DN nếu chưa có bản ghi đánh giá
            var (surveyJson, hasMachinery, hasTraining) = await _repository.GetSurveyAnswersAsync(ent.Id, ent.TaxCode, ct);
            var calc = InnovationRatingEngine.Calculate(ent, surveyJson, hasMachinery, hasTraining);

            eval = new EnterpriseInnovationEvaluation(Guid.NewGuid())
            {
                EnterpriseId = ent.Id,
                TaxCode = ent.TaxCode,
                EvaluationYear = 2024,
                CriteriaVersion = "v1.0",
                TotalScore = calc.TotalScore,
                Classification = calc.Classification,
                GroupScoresJson = JsonSerializer.Serialize(calc.GroupScores),
                CriteriaDetailsJson = JsonSerializer.Serialize(calc.CriteriaDetails),
                Status = calc.Classification == "UNRATED" ? "DRAFT_CALCULATED" : "APPROVED",
                ReviewedBy = calc.Classification == "UNRATED" ? null : "Hệ thống ĐMST Quốc gia (Sơ bộ)",
                ReviewedAt = calc.Classification == "UNRATED" ? null : DateTimeOffset.UtcNow,
                Notes = "Tính toán sơ bộ từ CSDL Khảo sát thực nghiệm 304 DN"
            };

            await _repository.AddInnovationEvaluationAsync(eval, ct);

            // Cập nhật điểm và phân tầng mới nhất trên entity Enterprise
            ent.LatestInnovationScore = calc.TotalScore;
            ent.LatestInnovationTier = calc.Classification;
            await _repository.UpdateAsync(ent, ct);
        }

        // Parse GroupScores & CriteriaDetails
        var groups = SafeParseGroupScores(eval.GroupScoresJson);
        var criteria = SafeParseCriteriaDetails(eval.CriteriaDetailsJson);

        // Tạo RadarChartData từ GroupScores
        var radarData = groups.Select(g => new RadarAxisDto(
            Axis: g.GroupName switch
            {
                "Quản trị" => "Quản trị",
                "R&D và Công nghệ" => "R&D & CN",
                "Sản phẩm / Quy trình" => "SP / Quy trình",
                "Sở hữu trí tuệ" => "Sở hữu trí tuệ",
                "Chuyển đổi số" => "Chuyển đổi số",
                "Thị trường" => "Thị trường",
                "Nhân lực" => "Nhân lực",
                "Liên kết" => "Liên kết",
                _ => g.GroupName
            },
            Value: g.Score,
            MaxValue: g.MaxScore,
            FullMark: 100
        )).ToList();

        string classificationLabel = eval.Classification switch
        {
            "LEADING" => "Dẫn đầu",
            "DEVELOPING" => "Đang phát triển",
            "POTENTIAL" => "Tiềm năng",
            _ => "Chưa đánh giá"
        };

        string badgeName = eval.Classification switch
        {
            "LEADING" => "Huy hiệu Vàng ĐMST",
            "DEVELOPING" => "Huy hiệu Bạc ĐMST",
            "POTENTIAL" => "Huy hiệu Đồng ĐMST",
            _ => "Chưa xếp hạng"
        };

        // PDPD Masking (BR-02-011): Khách công chúng không được xem chi tiết 37 tiêu chí (ẩn doanh thu C33 và R&D C15)
        IReadOnlyList<InnovationCriteriaDetailDto>? publicCriteria = null;
        IReadOnlyList<InnovationGroupScoreDto> resultGroups;

        if (isPrivileged)
        {
            publicCriteria = criteria;
            resultGroups = groups;
        }
        else
        {
            publicCriteria = null;
            resultGroups = groups.Select(g => new InnovationGroupScoreDto(
                g.GroupCode,
                g.GroupName,
                g.MaxScore,
                g.Score,
                g.Percentage,
                null
            )).ToList();
        }

        return new InnovationEvaluationDto(
            Id: eval.Id,
            EnterpriseId: eval.EnterpriseId,
            TaxCode: eval.TaxCode,
            EvaluationYear: eval.EvaluationYear,
            CriteriaVersion: eval.CriteriaVersion,
            TotalScore: eval.TotalScore,
            Classification: eval.Classification,
            ClassificationLabel: classificationLabel,
            BadgeName: badgeName,
            Status: eval.Status,
            ReviewedBy: eval.ReviewedBy,
            ReviewedAt: eval.ReviewedAt,
            GroupScores: resultGroups,
            RadarChartData: radarData,
            CriteriaDetails: publicCriteria
        );
    }

    public async Task<int> RecalculateAllInnovationRatingsAsync(CancellationToken ct = default)
    {
        var allEnterprises = await _repository.GetAllEnterprisesForRatingAsync(ct);
        int count = 0;
        foreach (var ent in allEnterprises)
        {
            var (surveyJson, hasMachinery, hasTraining) = await _repository.GetSurveyAnswersAsync(ent.Id, ent.TaxCode, ct);
            var calc = InnovationRatingEngine.Calculate(ent, surveyJson, hasMachinery, hasTraining);

            var existing = await _repository.GetInnovationEvaluationAsync(ent.TaxCode, 2024, ct);
            if (existing is null)
            {
                var eval = new EnterpriseInnovationEvaluation(Guid.NewGuid())
                {
                    EnterpriseId = ent.Id,
                    TaxCode = ent.TaxCode,
                    EvaluationYear = 2024,
                    CriteriaVersion = "v1.0",
                    TotalScore = calc.TotalScore,
                    Classification = calc.Classification,
                    GroupScoresJson = JsonSerializer.Serialize(calc.GroupScores),
                    CriteriaDetailsJson = JsonSerializer.Serialize(calc.CriteriaDetails),
                    Status = calc.Classification == "UNRATED" ? "DRAFT_CALCULATED" : "APPROVED",
                    ReviewedBy = calc.Classification == "UNRATED" ? null : "Hệ thống ĐMST Quốc gia (Sơ bộ)",
                    ReviewedAt = calc.Classification == "UNRATED" ? null : DateTimeOffset.UtcNow,
                    Notes = "Tính toán sơ bộ từ CSDL Khảo sát thực nghiệm 304 DN"
                };
                await _repository.AddInnovationEvaluationAsync(eval, ct);
            }
            else
            {
                existing.TotalScore = calc.TotalScore;
                existing.Classification = calc.Classification;
                existing.GroupScoresJson = JsonSerializer.Serialize(calc.GroupScores);
                existing.CriteriaDetailsJson = JsonSerializer.Serialize(calc.CriteriaDetails);
                existing.TouchEvaluation();
                await _repository.UpdateInnovationEvaluationAsync(existing, ct);
            }

            ent.LatestInnovationScore = calc.TotalScore;
            ent.LatestInnovationTier = calc.Classification;
            await _repository.UpdateAsync(ent, ct);
            count++;
        }
        return count;
    }

    private static string? GetInnovationBadgeName(string? tier) => tier switch
    {
        "LEADING" => "Huy hiệu Vàng ĐMST",
        "DEVELOPING" => "Huy hiệu Bạc ĐMST",
        "POTENTIAL" => "Huy hiệu Đồng ĐMST",
        "UNRATED" => "Chưa xếp hạng",
        _ => null
    };

    private static List<InnovationGroupScoreDto> SafeParseGroupScores(string? json)
    {
        if (string.IsNullOrWhiteSpace(json) || json == "[]" || json == "{}") return [];
        try
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<List<InnovationGroupScoreDto>>(json, options) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private static List<InnovationCriteriaDetailDto> SafeParseCriteriaDetails(string? json)
    {
        if (string.IsNullOrWhiteSpace(json) || json == "[]") return [];
        try
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<List<InnovationCriteriaDetailDto>>(json, options) ?? [];
        }
        catch
        {
            return [];
        }
    }
}
