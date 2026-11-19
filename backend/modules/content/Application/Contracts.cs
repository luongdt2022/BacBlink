using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Content.Application;

public static class StoryTypes
{
    public const string Success = "SUCCESS";
    public const string Failure = "FAILURE";
}

public static class StoryStatuses
{
    public const string Draft = "DRAFT";
    public const string Published = "PUBLISHED";
}

public sealed record StoryDto(Guid Id, Guid AuthorPersonId, string Title, string Type, string Content, string? Lesson, string Status, bool IsHidden, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt);

public sealed record CreateStoryCommand(string Title, string Type, string Content, string? Lesson, string Status);

public sealed record UpdateStoryCommand(string? Title, string? Type, string? Content, string? Lesson, bool ClearLesson, string? Status);

/// <summary>AuthorRole filter: null = tất cả; "USER" | "ADMIN" cho landing page (legacy `source`).</summary>
public sealed record StoryQuery(Guid? AuthorPersonId, bool PublishedVisibleOnly, string? Type, string? Status, string? AuthorRole, PageRequest Page);

public interface IStoryService
{
    Task<PagedResult<StoryDto>> ListAsync(StoryQuery query, CancellationToken ct);
    Task<StoryDto> GetAsync(Guid id, CancellationToken ct);
    Task<StoryDto> CreateAsync(Guid authorPersonId, CreateStoryCommand command, CancellationToken ct);
    /// <summary>isModerator=true bỏ kiểm quyền tác giả (admin).</summary>
    Task<StoryDto> UpdateAsync(Guid id, Guid requesterPersonId, bool isModerator, UpdateStoryCommand command, CancellationToken ct);
    Task DeleteAsync(Guid id, Guid requesterPersonId, bool isModerator, CancellationToken ct);
    Task<StoryDto> SetHiddenAsync(Guid id, bool isHidden, CancellationToken ct);
}
