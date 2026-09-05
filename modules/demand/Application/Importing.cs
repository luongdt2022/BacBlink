using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Demand.Application;

/// <summary>ETL `intakes(type=challenge)` → DemandBrief + version 1 (§30.1). Không tự QUALIFIED.</summary>
public sealed record LegacyDemandImport(
    Guid Id,
    Guid? OwnerPersonId,
    string Title,
    string? Content,
    string? AiProcessTitle,
    string? AiProcessedContent,
    string? AiProcessingStatus,   // processing|completed|failed|null
    string? AiChunkingStatus,
    string Status,                // draft|published
    IReadOnlyList<Guid> SectorIds,
    Guid? CategoryId,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? DeletedAt,
    LegacyRef Legacy);

public interface IDemandImporter
{
    Task ImportAsync(LegacyDemandImport import, CancellationToken ct);
    Task<int> CountAsync(CancellationToken ct);
}
