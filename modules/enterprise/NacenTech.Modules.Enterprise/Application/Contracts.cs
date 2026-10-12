using System;
using System.Collections.Generic;

namespace NacenTech.Modules.Enterprise.Application;

public sealed record EnterprisePublicDirectoryItemDto(
    Guid Id,
    string Name,
    string TaxCode,
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
    IReadOnlyList<string>? SupportNeeds = null
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
    string TaxCode,
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
    string TaxCode,
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
    string ProfileDetailsJson
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
    public string? SortBy { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 9;
}

public sealed class UpsertEnterpriseProfileRequest
{
    public string? Name { get; set; }
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
}

public sealed class ApproveEnterpriseRequest
{
    public string? Notes { get; set; }
}
