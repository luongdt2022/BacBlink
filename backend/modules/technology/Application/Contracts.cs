using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Technology.Application;

/// <summary>
/// TechnologyAsset + TechnologyPackageVersion (§12) — ánh xạ từ `intakes(type=ip)` (§30.1).
/// Không tự gắn TRANSACTION_READY: QualityLevel mặc định UNREVIEWED, chỉ đổi qua rights/quality gate.
/// </summary>
public static class PublicationStatuses
{
    public const string Draft = "DRAFT";
    public const string Published = "PUBLISHED";
}

/// <summary>Trạng thái pipeline AI (giữ tên legacy processing/completed/failed viết hoa).</summary>
public static class AiStatuses
{
    public const string Processing = "PROCESSING";
    public const string Completed = "COMPLETED";
    public const string Failed = "FAILED";
}

public static class QualityLevels
{
    public const string Unreviewed = "UNREVIEWED";
    public const string SelfDeclared = "SELF_DECLARED";
    public const string Reviewed = "REVIEWED";
    public const string TransactionReady = "TRANSACTION_READY";
}

public sealed record TechnologyAssetDto(
    Guid Id,
    Guid? OwnerPersonId,
    string PublicationStatus,
    string QualityLevel,
    int CurrentVersionNo,
    string Title,
    string? Description,
    string? AiTitle,
    string? AiProcessedContent,
    string? AiProcessingStatus,
    string? AiChunkingStatus,
    IReadOnlyList<Guid> SectorIds,
    Guid? CategoryId,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? DeletedAt,
    int Version);

public sealed record CreateTechnologyCommand(
    Guid? OwnerPersonId,
    string Title,
    string? Description,
    string? AiProcessedContent,
    string PublicationStatus,
    IReadOnlyList<Guid>? SectorIds,
    Guid? CategoryId);

public sealed record UpdateTechnologyCommand(
    string? Title,
    string? Description,
    string? AiProcessedContent,
    string? PublicationStatus,
    IReadOnlyList<Guid>? SectorIds,
    Guid? CategoryId,
    bool ClearCategory);

public sealed record TechnologyQuery(
    Guid? OwnerPersonId,
    Guid? ExcludeOwnerPersonId,
    bool PublishedOnly,
    string? PublicationStatus,
    Guid? SectorId,
    Guid? CategoryId,
    string? Search,
    bool IncludeDeleted,
    PageRequest Page);

public interface ITechnologyService
{
    Task<TechnologyAssetDto> CreateAsync(CreateTechnologyCommand command, CancellationToken ct);
    Task<TechnologyAssetDto> GetAsync(Guid id, bool includeDeleted, CancellationToken ct);
    Task<TechnologyAssetDto?> FindAsync(Guid id, bool includeDeleted, CancellationToken ct);
    Task<IReadOnlyDictionary<Guid, TechnologyAssetDto>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct);
    Task<PagedResult<TechnologyAssetDto>> ListAsync(TechnologyQuery query, CancellationToken ct);
    Task<(int Draft, int Published)> CountByStatusAsync(TechnologyQuery query, CancellationToken ct);
    Task<TechnologyAssetDto> UpdateAsync(Guid id, UpdateTechnologyCommand command, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
    Task SetAiResultAsync(Guid id, string aiTitle, string aiProcessedContent, CancellationToken ct);
    Task SetAiStatusAsync(Guid id, string? processingStatus, string? chunkingStatus, CancellationToken ct);
}
