using System;
using System.Collections.Generic;

namespace NacenTech.Modules.Enterprise.Application;

public sealed record EnterprisePublicDirectoryItemDto(
    Guid Id,
    string Name,
    string? TaxCode,
    string SubjectType,
    string ProvinceCity,
    string MainSectorName,
    string? SectorCode,
    string? WorkforceScale,
    bool IsVerified,
    decimal? TniScore,
    string? TniClassification,
    int IpCount,
    string Status,
    string? OwnershipType = null,
    string? OperatingZone = null,
    bool HasRdUnit = false,
    bool IsExporting = false,
    bool InValueChain = false,
    IReadOnlyList<string>? TopBottlenecks = null,
    IReadOnlyList<string>? SupportNeeds = null,
    decimal? InnovationScore = null,
    string? InnovationTier = null,
    string? InnovationBadge = null,
    string? Website = null,
    decimal? Tt17Score = null,
    string? Tt17Classification = null,
    decimal? Tt17SyncCoefficient = null
);

public sealed record InnovationCriteriaDetailDto(
    string CriteriaCode,
    string CriteriaName,
    decimal MaxScore,
    decimal Score,
    string? SourceQuestion,
    string? ReviewerComment = null
);

public sealed record InnovationGroupScoreDto(
    string GroupCode,
    string GroupName,
    decimal MaxScore,
    decimal Score,
    decimal Percentage,
    IReadOnlyList<InnovationCriteriaDetailDto>? CriteriaList = null
);

public sealed record RadarAxisDto(
    string Axis,
    decimal Value,
    decimal MaxValue,
    int FullMark = 100
);

public sealed record InnovationEvaluationDto(
    Guid Id,
    Guid EnterpriseId,
    string TaxCode,
    int EvaluationYear,
    string CriteriaVersion,
    decimal TotalScore,
    string Classification,          // "LEADING", "DEVELOPING", "POTENTIAL", "UNRATED"
    string ClassificationLabel,     // "Dẫn đầu", "Đang phát triển", "Tiềm năng", "Chưa đánh giá"
    string BadgeName,               // "Hội viên Tiêu biểu BACLINK", "Hội viên Nòng cốt BACLINK", "Hội viên Chính thức BACLINK", "Chưa xếp hạng"
    string Status,                  // "DRAFT_CALCULATED", "SUBMITTED", "APPROVED", "REJECTED"
    string? ReviewedBy,
    DateTimeOffset? ReviewedAt,
    IReadOnlyList<InnovationGroupScoreDto> GroupScores,
    IReadOnlyList<RadarAxisDto> RadarChartData,
    IReadOnlyList<InnovationCriteriaDetailDto>? CriteriaDetails = null // PDPD BR-02-011 masking
);

public sealed record EnterprisePublicDirectoryDto(
    IReadOnlyList<EnterprisePublicDirectoryItemDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public sealed record EnterpriseProjectDto(
    Guid Id,
    string Title,
    string Description,
    string? Status,
    string? Partners
);

public sealed record EnterpriseIpDto(
    Guid Id,
    string Type,
    string Title,
    string? RegistrationNumber
);

public sealed record EnterprisePublicDetailDto(
    Guid Id,
    string Name,
    string? TaxCode,
    string SubjectType,
    string? EstablishedDate,
    string ProvinceCity,
    string? AddressDetail,
    string? Website,
    bool IsVerified,
    string? MainSectorName,
    string? SectorCode,
    string? OwnershipType,
    string? WorkforceScale,
    string? RevenueRange, // Masked "[BẢO MẬT]" unless authorized
    string? OperatingZone,
    string? HighQualificationRatio,
    decimal? TniScore,
    string? TniClassification,
    bool HasRdUnit,
    bool HasRdBudget,
    bool IsExporting,
    bool InValueChain,
    IReadOnlyList<string> TopBottlenecks,
    IReadOnlyList<string> SupportNeeds,
    IReadOnlyList<EnterpriseProjectDto> Projects,
    IReadOnlyList<EnterpriseIpDto> IntellectualProperties
);

public sealed record EnterpriseProfileFullDto(
    Guid Id,
    string Name,
    string? TaxCode,
    string SubjectType,
    string? EstablishedDate,
    string ProvinceCity,
    string? AddressDetail,
    string? Website,
    string? Description,
    bool IsVerified,
    string VerificationStatus,
    string? ContactPerson,
    string? ContactPhone,
    string? ContactEmail,
    bool IsContactPublic,
    string? MainSectorName,
    string? SectorCode,
    string? OwnershipType,
    string? WorkforceScale,
    string? RevenueRange, // Unmasked for Owner
    string? OperatingZone,
    string? HighQualificationRatio,
    decimal? TniScore,
    string? TniClassification,
    bool HasRdUnit,
    bool HasRdBudget,
    decimal? RdBudgetAmount,
    int? RdPersonnelCount,
    bool IsExporting,
    bool InValueChain,
    IReadOnlyList<string> TopBottlenecks,
    IReadOnlyList<string> SupportNeeds,
    IReadOnlyList<EnterpriseProjectDto> Projects,
    IReadOnlyList<EnterpriseIpDto> IntellectualProperties,
    string ProfileDetailsJson,
    string CapabilityTier = "BASIC",
    bool IsBuyer = false,
    bool IsSeller = false,
    string ActiveRole = "BUYER",
    Guid? OwnerPersonId = null
);

public sealed record ProvinceCountDto(string Province, int Count);
public sealed record SectorCountDto(string Sector, int Count);
public sealed record TniClassificationCountDto(string Classification, int Count);
public sealed record BottleneckCountDto(string Name, int Count);

public sealed record EnterpriseDashboardStatsDto(
    int TotalEnterprises,
    int VerifiedCount,
    IReadOnlyList<ProvinceCountDto> ByProvince,
    IReadOnlyList<SectorCountDto> BySector,
    IReadOnlyList<TniClassificationCountDto> ByTniClassification,
    IReadOnlyList<BottleneckCountDto> TopBottlenecks
);

public sealed class EnterpriseSearchQuery
{
    public string? Q { get; set; }
    public string? Province { get; set; }
    public string? SectorCode { get; set; }
    public string? SubjectType { get; set; }
    public string? TniClassification { get; set; }
    public string? InnovationTier { get; set; }
    public string? Tt17Classification { get; set; }
    public string? SortBy { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 9;
}

public sealed class UpsertEnterpriseProfileRequest
{
    public string? Name { get; set; }
    public string? LegalName { get; set; }
    public string? TaxCode { get; set; }
    public string? SubjectType { get; set; }
    public string? EstablishedDate { get; set; }
    public string? ProvinceCity { get; set; }
    public string? AddressDetail { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public bool IsContactPublic { get; set; }
    public string? MainSectorName { get; set; }
    public string? SectorCode { get; set; }
    public string? OwnershipType { get; set; }
    public string? WorkforceScale { get; set; }
    public string? RevenueRange { get; set; }
    public string? OperatingZone { get; set; }
    public string? HighQualificationRatio { get; set; }
    public bool HasRdUnit { get; set; }
    public bool HasRdBudget { get; set; }
    public decimal? RdBudgetAmount { get; set; }
    public int? RdPersonnelCount { get; set; }
    public bool IsExporting { get; set; }
    public bool InValueChain { get; set; }
    public List<string>? TopBottlenecks { get; set; }
    public List<string>? SupportNeeds { get; set; }
    public string? ProfileDetailsJson { get; set; }
    public string? CapabilityTier { get; set; }
    public bool? IsBuyer { get; set; }
    public bool? IsSeller { get; set; }
    public string? ActiveRole { get; set; }
    public Guid? OwnerPersonId { get; set; }
}

public sealed class ApproveEnterpriseRequest
{
    public string? Notes { get; set; }
}

public sealed record ActivateCapabilityRequest(string Capability);
public sealed record SwitchRoleRequest(string TargetRole);

public class DuplicateTaxCodeException(string message) : Exception(message);
