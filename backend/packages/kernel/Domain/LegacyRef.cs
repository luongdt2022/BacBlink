namespace NacenTech.Kernel.Domain;

/// <summary>
/// Dấu vết ETL theo §30.3: legacyId, sourceSystem, sourceHash, migratedAt, mapping version, batch id.
/// Owned value object, cột nullable trên mọi aggregate.
/// </summary>
public sealed record LegacyRef(
    string SourceSystem,
    string SourceTable,
    string LegacyId,
    string SourceHash,
    DateTimeOffset MigratedAt,
    string MappingVersion,
    Guid BatchId)
{
    public const string NacenTwin = "nacentwin-nestjs";
}
