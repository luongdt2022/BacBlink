using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Demand.Application;

/// <summary>
/// DemandBrief (§11) — ánh xạ từ `intakes(type=challenge)` (§30.1). Nội dung là DemandBriefVersion bất biến;
/// sửa = tạo version mới (§30.3: edit ghi đè trở thành version đầu). Status chỉ DRAFT|PUBLISHED —
/// QUALIFIED thuộc case stage-gate, không tự gắn khi migrate.
/// </summary>
public static class DemandStatuses
{
    public const string Draft = "DRAFT";
    public const string Published = "PUBLISHED";
}

public static class AiStatuses
{
    public const string Processing = "PROCESSING";
    public const string Completed = "COMPLETED";
    public const string Failed = "FAILED";
}

public sealed record DemandBriefDto(
    Guid Id,
    Guid? OwnerPersonId,
    string Status,
    int CurrentVersionNo,
    string Title,
    string? ProblemStatement,
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

public sealed record CreateDemandCommand(
    Guid? OwnerPersonId,
    string Title,
    string? ProblemStatement,
    string? AiProcessedContent,
    string Status,
    IReadOnlyList<Guid>? SectorIds,
    Guid? CategoryId);

/// <summary>Field null = không đổi. SectorIds non-null = thay toàn bộ. CategoryId: dùng `ClearCategory` để bỏ.</summary>
public sealed record UpdateDemandCommand(
    string? Title,
    string? ProblemStatement,
    string? AiProcessedContent,
    string? Status,
    IReadOnlyList<Guid>? SectorIds,
    Guid? CategoryId,
    bool ClearCategory);

public sealed record DemandQuery(
    Guid? OwnerPersonId,
    Guid? ExcludeOwnerPersonId,
    bool PublishedOnly,
    string? Status,
    Guid? SectorId,
    Guid? CategoryId,
    string? Search,
    bool IncludeDeleted,
    PageRequest Page);

public interface IDemandService
{
    Task<DemandBriefDto> CreateAsync(CreateDemandCommand command, CancellationToken ct);
    Task<DemandBriefDto> GetAsync(Guid id, bool includeDeleted, CancellationToken ct);
    Task<DemandBriefDto?> FindAsync(Guid id, bool includeDeleted, CancellationToken ct);
    Task<IReadOnlyDictionary<Guid, DemandBriefDto>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct);
    Task<PagedResult<DemandBriefDto>> ListAsync(DemandQuery query, CancellationToken ct);
    /// <summary>Đếm theo status trên cùng filter (trừ status) — phục vụ `totalByStatus` legacy.</summary>
    Task<(int Draft, int Published)> CountByStatusAsync(DemandQuery query, CancellationToken ct);
    /// <summary>Tạo version mới nếu title/problemStatement đổi; phát SubjectContentChanged khi nội dung public đổi, SubjectPublished khi publish.</summary>
    Task<DemandBriefDto> UpdateAsync(Guid id, UpdateDemandCommand command, CancellationToken ct);
    /// <summary>Soft delete (DeletedAt) + SubjectDeleted. Không xóa vật lý.</summary>
    Task DeleteAsync(Guid id, CancellationToken ct);
    Task SetAiResultAsync(Guid id, string aiTitle, string aiProcessedContent, CancellationToken ct);
    Task SetAiStatusAsync(Guid id, string? processingStatus, string? chunkingStatus, CancellationToken ct);
}
