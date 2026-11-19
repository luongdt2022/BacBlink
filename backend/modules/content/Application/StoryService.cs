using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Content.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Content.Application;

public sealed class StoryService(DbContext db, IUnitOfWork uow, ICurrentActor actor, IAuthorizationGate gate, IPersonDirectory directory) : IStoryService
{
    public async Task<PagedResult<StoryDto>> ListAsync(StoryQuery query, CancellationToken ct)
    {
        var q = db.Set<Story>().AsNoTracking().AsQueryable();
        if (query.AuthorPersonId is { } author) q = q.Where(s => s.AuthorPersonId == author);
        if (query.PublishedVisibleOnly) q = q.Where(s => s.Status == StoryStatuses.Published && !s.IsHidden);
        if (!string.IsNullOrEmpty(query.Type)) q = q.Where(s => s.Type == query.Type);
        if (!string.IsNullOrEmpty(query.Status)) q = q.Where(s => s.Status == query.Status);

        if (!string.IsNullOrEmpty(query.AuthorRole))
        {
            // Lọc theo vai trò tác giả (legacy `source=user|admin`): resolve qua identity rồi lọc theo id
            // để không join xuyên schema trong write path (§9.1).
            var authorIds = await q.Select(s => s.AuthorPersonId).Distinct().ToListAsync(ct);
            var people = await directory.GetManyAsync(authorIds, ct);
            var allowed = people.Values.Where(p => p.PlatformRole == query.AuthorRole).Select(p => p.Id).ToList();
            q = q.Where(s => allowed.Contains(s.AuthorPersonId));
        }

        var total = await q.CountAsync(ct);
        var data = await q.OrderByDescending(s => s.CreatedAt).Skip(query.Page.Skip).Take(query.Page.Limit).ToListAsync(ct);
        return new PagedResult<StoryDto>(data.Select(ToDto).ToList(), total, query.Page.Page, query.Page.Limit);
    }

    public async Task<StoryDto> GetAsync(Guid id, CancellationToken ct) => ToDto(await LoadAsync(id, ct));

    public async Task<StoryDto> CreateAsync(Guid authorPersonId, CreateStoryCommand command, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.StoryCreate, actor.PlatformRole), "Story", null);
        Validate(command.Type, command.Status);
        var story = new Story(authorPersonId, command.Title, command.Type, command.Content, command.Lesson, command.Status);
        db.Add(story);
        await uow.CommitAsync(ct);
        return ToDto(story);
    }

    public async Task<StoryDto> UpdateAsync(Guid id, Guid requesterPersonId, bool isModerator, UpdateStoryCommand command, CancellationToken ct)
    {
        var story = await LoadAsync(id, ct);
        RequireWrite(story, requesterPersonId, isModerator, id);
        if (command.Type is not null || command.Status is not null) Validate(command.Type, command.Status);
        story.Update(command.Title, command.Type, command.Content, command.Lesson, command.ClearLesson, command.Status);
        await uow.CommitAsync(ct);
        return ToDto(story);
    }

    public async Task DeleteAsync(Guid id, Guid requesterPersonId, bool isModerator, CancellationToken ct)
    {
        var story = await LoadAsync(id, ct);
        RequireWrite(story, requesterPersonId, isModerator, id);
        db.Remove(story);
        await uow.CommitAsync(ct);
    }

    public async Task<StoryDto> SetHiddenAsync(Guid id, bool isHidden, CancellationToken ct)
    {
        var story = await LoadAsync(id, ct);
        gate.Require(new AuthorizationRequest(Actions.StoryModerate, actor.PlatformRole), "Story", id);
        story.SetHidden(isHidden);
        await uow.CommitAsync(ct);
        return ToDto(story);
    }

    private void RequireWrite(Story story, Guid requesterPersonId, bool isModerator, Guid id)
    {
        if (isModerator)
        {
            gate.Require(new AuthorizationRequest(Actions.StoryModerate, actor.PlatformRole), "Story", id);
            return;
        }
        var relation = story.AuthorPersonId == requesterPersonId ? OrganizationRelations.Owner : OrganizationRelations.None;
        if (relation != OrganizationRelations.Owner)
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa câu chuyện này");
        gate.Require(new AuthorizationRequest(Actions.StoryUpdateOwn, actor.PlatformRole, OrganizationRelation: relation), "Story", id);
    }

    private async Task<Story> LoadAsync(Guid id, CancellationToken ct)
        => await db.Set<Story>().FirstOrDefaultAsync(s => s.Id == id, ct) ?? throw new NotFoundException("Câu chuyện không tồn tại");

    private static void Validate(string? type, string? status)
    {
        if (type is not null && type != StoryTypes.Success && type != StoryTypes.Failure)
            throw new ValidationException("type must be one of the following values: success, failure");
        if (status is not null && status != StoryStatuses.Draft && status != StoryStatuses.Published)
            throw new ValidationException("status must be one of the following values: draft, published");
    }

    internal static StoryDto ToDto(Story s)
        => new(s.Id, s.AuthorPersonId, s.Title, s.Type, s.Content, s.Lesson, s.Status, s.IsHidden, s.CreatedAt, s.UpdatedAt);
}
