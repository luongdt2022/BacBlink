using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Brokerage.Application;

/// <summary>Brokerage §13.1–13.4: BrokerProfile + Assignment. AC 84: từ chối giao case vượt capacity.</summary>
public static class BrokerStatuses
{
    public const string Active = "ACTIVE";
    public const string Suspended = "SUSPENDED";
}

public static class AssignmentRoles
{
    public const string Lead = "LEAD";
    public const string Co = "CO";
}

public static class AssignmentStatuses
{
    public const string Active = "ACTIVE";
    public const string Ended = "ENDED";
}

public sealed record BrokerProfileDto(Guid Id, Guid PersonId, string Status, int Capacity, int ActiveAssignments, IReadOnlyList<Guid> SectorIds, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt, int Version);

public sealed record AssignmentDto(Guid Id, Guid CaseId, Guid BrokerPersonId, string Role, string Status, DateTimeOffset AssignedAt, DateTimeOffset? SlaDueAt, DateTimeOffset? EndedAt);

public interface IBrokerService
{
    Task<BrokerProfileDto> RegisterAsync(Guid personId, int capacity, IReadOnlyList<Guid> sectorIds, CancellationToken ct);
    Task<BrokerProfileDto?> FindByPersonAsync(Guid personId, CancellationToken ct);
    Task<PagedResult<BrokerProfileDto>> ListAsync(PageRequest page, CancellationToken ct);
    /// <summary>Ném UnprocessableException(CAPACITY_EXCEEDED) khi vượt capacity — không rơi case âm thầm (AC 84).</summary>
    Task<AssignmentDto> AssignAsync(Guid caseId, Guid brokerPersonId, string role, DateTimeOffset? slaDueAt, CancellationToken ct);
    Task EndAssignmentAsync(Guid assignmentId, CancellationToken ct);
    Task<IReadOnlyList<AssignmentDto>> ListForCaseAsync(Guid caseId, CancellationToken ct);
}

public static class ExpertStatuses
{
    public const string PendingReview = "PENDING_REVIEW";
    public const string Approved = "APPROVED";
    public const string ChangesRequested = "CHANGES_REQUESTED";
    public const string Rejected = "REJECTED";
}

public static class ExpertVisibilityStatuses
{
    public const string Private = "PRIVATE";
    public const string Public = "PUBLIC";
}

public static class ExpertErrorCodes
{
    public const string DegreeRequired = "ERR_DEGREE_REQUIRED";
    public const string PdpdConsentRequired = "ERR_PDPD_CONSENT_REQUIRED";
    public const string PendingRequestExists = "ERR_PENDING_REQUEST_EXISTS";
    public const string ProfileLocked = "ERR_PROFILE_LOCKED_FOR_REVIEW";
}

public sealed record SubmitExpertUpgradeRequest(
    string FullName,
    int BirthYear,
    string Gender,
    string? AcademicRank,
    int? AcademicRankYear,
    string Degree,
    int DegreeYear,
    string OrganizationName,
    string? OrganizationAddress,
    string? ResearchTitle,
    string? PositionTitle,
    IReadOnlyList<string>? ExpertiseSectors,
    string? TrainingHistoryJson,
    string? EmploymentHistoryJson,
    string? PublicationsJson,
    string? ConsultingSummary,
    bool IsProjectLeader,
    bool IsMainContributor,
    bool PdpdConsent,
    bool LegalOath = false,
    string? ScopeType = null,
    string? ScopeId = null);

public sealed record ExpertProfileDto(
    Guid Id,
    Guid PersonId,
    string FullName,
    int BirthYear,
    string Gender,
    string AcademicRank,
    int? AcademicRankYear,
    string Degree,
    int DegreeYear,
    string OrganizationName,
    string? OrganizationAddress,
    string? ResearchTitle,
    string? PositionTitle,
    IReadOnlyList<string> ExpertiseSectors,
    string? TrainingHistoryJson,
    string? EmploymentHistoryJson,
    string? PublicationsJson,
    string? ConsultingSummary,
    bool IsProjectLeader,
    bool IsMainContributor,
    string Status,
    string? ReviewerNote,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed record AiCvScanResultDto(
    string ExtractedFullName,
    string ExtractedDegree,
    string ExtractedOrg,
    IReadOnlyList<string> ExtractedSectors,
    string TrainingSummary,
    string WorkSummary);

public sealed record QuickExpertIntakeRequest(
    string FullName,
    string Phone,
    string Email,
    string HighestDegree,
    string Organization,
    string SectorCode,
    IReadOnlyList<string>? MasteredTechCodes,
    string? CvFileName,
    bool PdpdConsent);

public sealed record QuickExpertIntakeResponse(
    bool Success,
    string TrackingId,
    string Status,
    string Message,
    string MagicLinkUrl,
    int EstimatedSeconds);

public sealed record ExpertTimelineDto(string Title, string? Subtitle, string? Period);
public sealed record ExpertAchievementDto(string Type, string Title, string? Meta, string? Description);
public sealed record ExpertPublicDetailDto(
    string ExpertCode,
    string FullName,
    string AcademicRank,
    string Degree,
    int BirthYear,
    string Gender,
    string OrganizationName,
    string? PositionTitle,
    string? PublicBio,
    IReadOnlyList<string> ExpertiseSectors,
    IReadOnlyList<string> MasteredTechCodes,
    bool IsVerified,
    bool IsAcceptingConsultation,
    IReadOnlyList<ExpertTimelineDto> Training,
    IReadOnlyList<ExpertTimelineDto> Employment,
    IReadOnlyList<ExpertAchievementDto> Patents,
    IReadOnlyList<ExpertAchievementDto> ResearchProjects,
    IReadOnlyList<ExpertAchievementDto> Publications,
    IReadOnlyList<ExpertAchievementDto> PracticalProjects,
    IReadOnlyList<ExpertAchievementDto> Awards);

public sealed record ExpertPrivateDetailDto(
    ExpertPublicDetailDto PublicProfile,
    string? Phone,
    string? Email,
    string? OrganizationAddress,
    bool PdpdConsent,
    bool LegalOath,
    string Status,
    IReadOnlyList<string> ActiveDocumentTypes);

public sealed record ExpertDocumentContent(Stream Content, string ContentType, string DownloadName);

public sealed record ExpertPublicCardDto(
    string ExpertCode,
    string FullName,
    string AcademicRank,
    string Degree,
    string OrganizationName,
    string? PositionTitle,
    string? PrimarySectorCode,
    string? PrimarySectorName,
    IReadOnlyList<string> ExpertiseSectors,
    IReadOnlyList<string> MasteredTechCodes,
    string? ProvinceCode,
    string? ProvinceName,
    int PublicationCount,
    int PatentCount,
    int ProjectCount,
    bool IsVerified,
    bool IsAcceptingConsultation);

public sealed record ExpertPublicDirectoryDto(
    IReadOnlyList<ExpertPublicCardDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);

public interface IExpertService
{
    Task<ExpertProfileDto> SubmitUpgradeAsync(Guid personId, SubmitExpertUpgradeRequest request, CancellationToken ct);
    Task<ExpertProfileDto?> GetMyProfileAsync(Guid personId, CancellationToken ct);
    Task<AiCvScanResultDto> SimulateAiCvScanAsync(string fileName, CancellationToken ct);
    Task<QuickExpertIntakeResponse> SubmitQuickIntakeAsync(QuickExpertIntakeRequest request, CancellationToken ct);
    Task<ExpertPublicDetailDto?> GetPublicDetailAsync(string expertCode, CancellationToken ct);
    Task<ExpertPublicDirectoryDto> GetPublicDirectoryAsync(string? q, string? degree, string? sectorCode, string? provinceCode, bool? acceptingConsultation, int page, int pageSize, CancellationToken ct);
    Task<ExpertPrivateDetailDto?> GetMyDetailAsync(Guid personId, CancellationToken ct);
    Task<ExpertPrivateDetailDto?> GetAdminDetailAsync(string expertCode, CancellationToken ct);
    Task SetPublicListingAsync(string expertCode, bool isPublic, bool isAcceptingConsultation, string? publicBio, CancellationToken ct);
    Task<ExpertDocumentContent?> OpenMyDocumentAsync(Guid personId, Guid documentId, CancellationToken ct);
    Task<ExpertDocumentContent?> OpenAdminDocumentAsync(string expertCode, Guid documentId, CancellationToken ct);
}

/// <summary>Cross-module lookup for authoritative province scopes; keeps Identity entities out of Brokerage.</summary>
public interface IExpertProvinceScopeLookup
{
    Task<IReadOnlyCollection<Guid>> GetPersonIdsInProvinceAsync(string provinceCode, CancellationToken ct);
    Task<IReadOnlyDictionary<Guid, string>> GetProvinceScopesAsync(IReadOnlyCollection<Guid> personIds, CancellationToken ct);
}
