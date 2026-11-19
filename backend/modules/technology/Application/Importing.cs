using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Technology.Application;

/// <summary>ETL `intakes(type=ip)` → TechnologyAsset + package version 1 (§30.1). QualityLevel = UNREVIEWED.</summary>
public sealed record LegacyTechnologyImport(
    Guid Id,
    Guid? OwnerPersonId,
    string Title,
    string? Content,
    string? AiProcessTitle,
    string? AiProcessedContent,
    string? AiProcessingStatus,
    string? AiChunkingStatus,
    string Status,                // draft|published
    IReadOnlyList<Guid> SectorIds,
    Guid? CategoryId,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? DeletedAt,
    LegacyRef Legacy);

public interface ITechnologyImporter
{
    Task ImportAsync(LegacyTechnologyImport import, CancellationToken ct);
    Task<int> CountAsync(CancellationToken ct);
}
