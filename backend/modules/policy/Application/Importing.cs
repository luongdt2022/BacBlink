using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Policy.Application;

public sealed record LegacyTaxonomyImport(Guid Id, string Kind, string Name, bool IsActive, LegacyRef Legacy);

public interface ITaxonomyImporter
{
    Task ImportTermAsync(LegacyTaxonomyImport term, CancellationToken ct);
    Task<int> CountAsync(string kind, CancellationToken ct);
}
