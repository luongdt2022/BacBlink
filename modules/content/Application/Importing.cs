using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Content.Application;

public sealed record LegacyStoryImport(
    Guid Id,
    Guid AuthorPersonId,
    string Title,
    string Type,      // success|failure
    string Content,
    string? Lesson,
    string Status,    // draft|published
    bool IsHidden,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    LegacyRef Legacy);

public interface IContentImporter
{
    Task ImportStoryAsync(LegacyStoryImport import, CancellationToken ct);
    Task<int> CountAsync(CancellationToken ct);
}
