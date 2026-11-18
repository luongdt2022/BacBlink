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
    public const string Draft = "DRAFT";
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
    string? ScopeId = null,
    string? DraftToken = null,
    IReadOnlyList<string>? SpecializedKeywords = null,
    string? Phone = null,
    string? Email = null);

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
    DateTimeOffset UpdatedAtUtc,
    IReadOnlyList<string>? SpecializedKeywords = null,
    string? Phone = null,
    string? Email = null);

public sealed record UpdateExpertProfileRequest(
    string? AcademicRank,
    int? AcademicRankYear,
    string Degree,
    int DegreeYear,
    string OrganizationName,
    string? OrganizationAddress,
    string? ResearchTitle,
    string? PositionTitle,
    IReadOnlyList<string>? ExpertiseSectors,
    IReadOnlyList<string>? SpecializedKeywords,
    string? PublicBio,
    bool IsAcceptingConsultation,
    string? TrainingHistoryJson = null,
    string? EmploymentHistoryJson = null,
    string? PublicationsJson = null,
    string? ConsultingSummary = null);

public sealed record ExpertCompletenessDto(
    int Score,
    string Grade,
    IReadOnlyList<string> CompletedCriteria,
    IReadOnlyList<string> MissingCriteria,
    IReadOnlyList<string> Suggestions);

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

public sealed record ExpertDraftDto(Guid Id, string FullName, string? Phone, string? Email, string Degree,
    string Organization, string? SectorCode, IReadOnlyList<string> MasteredTechCodes, string Status,
    string? TrainingHistoryJson, string? EmploymentHistoryJson, string? PublicationsJson, string? SectorName = null, bool? SectorIsActive = null, IReadOnlyList<string>? SpecializedKeywords = null);

public sealed record QuickExpertIntakeResponse(
    bool Success,
    string TrackingId,
    string Status,
    string Message,
    string MagicLinkUrl,
    int EstimatedSeconds);

public sealed record ExpertTimelineDto(string Title, string? Subtitle, string? Period);
public sealed record ExpertAchievementDto(string Type, string Title, string? Meta, string? Description);
public sealed record ExpertLmsCourseDto(
    Guid Id,
    string MaterialCode,
    string Title,
    string LessonType,
    int DurationMinutes,
    string? ClusterName = null,
    string? SectorCode = null);

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
    IReadOnlyList<ExpertAchievementDto> Awards,
    IReadOnlyList<string>? SpecializedKeywords = null,
    string? ConsultingSummary = null,
    string? OrganizationAddress = null,
    IReadOnlyList<ExpertLmsCourseDto>? Courses = null,
    string? PrimarySectorCode = null,
    string? PrimarySectorName = null,
    IReadOnlyList<string>? ExpertiseSectorNames = null);

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

public sealed record ExpertDocumentInfoDto(
    Guid Id,
    string DocumentType,
    string MimeType,
    long SizeBytes,
    string? Sha256 = null,
    string? DownloadName = null);

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
    bool IsAcceptingConsultation,
    IReadOnlyList<string>? SpecializedKeywords = null,
    int ConnectionCount = 0,
    string? ConsultingSummary = null,
    string? OrganizationAddress = null,
    int CourseCount = 0,
    IReadOnlyList<string>? ExpertiseSectorNames = null);

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
    Task<ExpertDraftDto> GetDraftAsync(string token, CancellationToken ct);
    Task<QuickExpertIntakeResponse> SubmitQuickIntakeAsync(QuickExpertIntakeRequest request, CancellationToken ct);
    Task<ExpertPublicDetailDto?> GetPublicDetailAsync(string expertCode, CancellationToken ct);
    Task<ExpertPublicDirectoryDto> GetPublicDirectoryAsync(string? q, IReadOnlyList<string>? degrees, IReadOnlyList<string>? sectorCodes, string? provinceCode, bool? acceptingConsultation, int page, int pageSize, CancellationToken ct);
    Task<ExpertPrivateDetailDto?> GetMyDetailAsync(Guid personId, CancellationToken ct);
    Task<ExpertPrivateDetailDto?> GetAdminDetailAsync(string expertCode, CancellationToken ct);
    Task SetPublicListingAsync(string expertCode, bool isPublic, bool isAcceptingConsultation, string? publicBio, CancellationToken ct);
    Task<ExpertDocumentContent?> OpenMyDocumentAsync(Guid personId, Guid documentId, CancellationToken ct);
    Task<ExpertDocumentContent?> OpenAdminDocumentAsync(string expertCode, Guid documentId, CancellationToken ct);
    Task<IReadOnlyList<ExpertDocumentInfoDto>> GetMyDocumentsAsync(Guid personId, CancellationToken ct);
    Task<IReadOnlyList<ExpertDocumentInfoDto>> GetAdminDocumentsAsync(string expertCode, CancellationToken ct);
    Task<ExpertProfileDto> UpdateMyProfileAsync(Guid personId, UpdateExpertProfileRequest request, CancellationToken ct);
    Task<ExpertCompletenessDto> GetMyCompletenessAsync(Guid personId, CancellationToken ct);
}

// =========================================================================
// RADAR EXPLAINABLE AI (XAI) & MATCHING ENGINE CONTRACTS (CR-TASK-08-DELTA-03)
// =========================================================================

public sealed record RadarXaiBreakdownDto(
    double SemanticScore,
    string SemanticEngine,     // BGE-M3_RERANK | POSTGRES_FTS_FALLBACK
    double TrlScore,
    int TrlLevel,
    string TrlStage,           // Thử nghiệm Lab (TRL 1-3) | Thử nghiệm Pilot (TRL 4-6) | Thương mại hóa (TRL 7-9)
    double TniScore,
    string TniBand,            // Rất cao (TNI >= 80) | Cao (60-79) | Trung bình (< 60)
    double IpScore,
    string IpStatus,           // PATENT_GRANTED | PATENT_PENDING | TRADE_SECRET | NONE
    string IpDescription
);

public sealed record BrokerageRadarCandidateDto(
    Guid Id,
    Guid DemandId,
    string DemandCode,
    string DemandTitle,
    Guid? BuyerOrganizationId,
    string BuyerOrganizationName,
    Guid OfferId,
    string OfferCode,
    string OfferTitle,
    Guid? SellerOrganizationId,
    string SellerOrganizationName,
    string SectorCode,
    int OverallMatchScore,
    RadarXaiBreakdownDto XaiBreakdown,
    bool IsDegraded,
    DateTime ComputedAt
);

public sealed record RecomputeRadarResultDto(
    int ComputedMatchesCount,
    long TookMs,
    bool IsDegraded,
    string EngineVersion,
    DateTime Timestamp
);

public sealed record RadarUserContext(
    Guid? PersonId,
    Guid? OrganizationId,
    string PlatformRole,
    string? ProvinceCode = null,
    string? ActiveMode = null
);

public interface IBrokerageMatchingEngineService
{
    int ComputeHybridScore(double semanticScore, double trlScore, double tniScore, double ipScore);
    double CalculateTrlScore(int sellerTrl, int buyerExpectedTrl = 7);
    double CalculateIpScore(string? ipStatus);
    Task<IReadOnlyList<BrokerageRadarCandidateDto>> GetRadarCandidatesAsync(
        string? sector, int? minScore, string? search, RadarUserContext? userContext, CancellationToken ct);
    Task<(IReadOnlyList<BrokerageRadarCandidateDto> Items, int TotalCount)> GetRadarCandidatesPagedAsync(
        string? sector, int? minScore, string? search, RadarUserContext? userContext, int page, int pageSize, CancellationToken ct);
    Task<int> GetRadarSummaryAsync(RadarUserContext? userContext, CancellationToken ct);
    Task<RecomputeRadarResultDto> RecomputeRadarForDemandAsync(
        string? demandCode, RadarUserContext? userContext, CancellationToken ct);
}


