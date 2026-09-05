using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Content.Application;
using ValidationException = NacenTech.Kernel.Domain.ValidationException;

namespace NacenTech.Api.V1Compat;

public sealed class CreateStoryDto
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required, RegularExpression("^(success|failure)$", ErrorMessage = "type must be one of the following values: success, failure")]
    public string Type { get; set; } = string.Empty;
    [Required] public string Content { get; set; } = string.Empty;
    public string? Lesson { get; set; }
    [RegularExpression("^(draft|published)$", ErrorMessage = "status must be one of the following values: draft, published")]
    public string? Status { get; set; }
}

public sealed class UpdateStoryDto
{
    public string? Title { get; set; }
    [RegularExpression("^(success|failure)$", ErrorMessage = "type must be one of the following values: success, failure")]
    public string? Type { get; set; }
    public string? Content { get; set; }
    public string? Lesson { get; set; }
    [RegularExpression("^(draft|published)$", ErrorMessage = "status must be one of the following values: draft, published")]
    public string? Status { get; set; }
}

public sealed class ToggleVisibilityDto
{
    [Required] public bool? IsHidden { get; set; }
}

public abstract class StoriesControllerBase(IStoryService stories, IPersonDirectory directory) : V1ControllerBase
{
    /// <summary>Đúng ở đường công khai và chỉ ở đó: tác giả ra ngoài dưới dạng rút gọn, không kèm PII (B-19).</summary>
    protected virtual bool PublicView => false;

    protected async Task<object> ListShape(PagedResult<StoryDto> page, CancellationToken ct)
    {
        var authors = await directory.GetManyAsync(page.Data.Select(s => s.AuthorPersonId).Distinct().ToArray(), ct);
        return new
        {
            data = page.Data.Select(s => V1Mappers.Story(s, authors.GetValueOrDefault(s.AuthorPersonId), PublicView)).ToList(),
            total = page.Total,
            page = page.Page,
            limit = page.Limit,
        };
    }

    protected async Task<object> One(StoryDto s, CancellationToken ct)
        => V1Mappers.Story(s, await directory.GetAsync(s.AuthorPersonId, ct), PublicView);

    protected static UpdateStoryCommand ToUpdate(UpdateStoryDto dto) => new(
        dto.Title,
        dto.Type?.ToUpperInvariant(),
        dto.Content,
        dto.Lesson,
        ClearLesson: false,
        dto.Status?.ToUpperInvariant());

    protected static CreateStoryCommand ToCreate(CreateStoryDto dto)
        => new(dto.Title, dto.Type.ToUpperInvariant(), dto.Content, dto.Lesson, (dto.Status ?? "draft").ToUpperInvariant());

    protected IStoryService Stories => stories;
}

[Route("api/v1/stories")]
[Authorize]
public sealed class UserStoriesController(IStoryService stories, IPersonDirectory directory) : StoriesControllerBase(stories, directory)
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? type, [FromQuery] string? status, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
        => Ok(await ListShape(await Stories.ListAsync(new StoryQuery(null, true, type?.ToUpperInvariant(), null, null, PageRequest.Of(page, limit, 20, 100)), ct), ct));

    [HttpGet("my")]
    public async Task<IActionResult> Mine([FromQuery] string? type, [FromQuery] string? status, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
        => Ok(await ListShape(await Stories.ListAsync(new StoryQuery(PersonId, false, type?.ToUpperInvariant(), status?.ToUpperInvariant(), null, PageRequest.Of(page, limit, 20, 100)), ct), ct));

    /// <summary>
    /// B-20: đường này từng trả mọi câu chuyện cho bất kỳ tài khoản nào — bản nháp của người khác và câu chuyện
    /// đã bị quản trị viên ẩn đều đọc được chỉ cần biết định danh. Đọc được khi: người gọi là tác giả, hoặc là
    /// quản trị viên, hoặc câu chuyện đã xuất bản và không bị ẩn. Ngoài ra là 404 — không phải 403, để không xác
    /// nhận rằng định danh đó tồn tại.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var story = await Stories.GetAsync(id, ct);
        var isAuthor = story.AuthorPersonId == PersonId;
        var isAdmin = Actor.PlatformRole == PlatformRoles.Admin;
        var isPubliclyVisible = story.Status == StoryStatuses.Published && !story.IsHidden;
        if (!isAuthor && !isAdmin && !isPubliclyVisible) throw new NotFoundException($"Story with ID {id} not found");
        return Ok(await One(story, ct));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStoryDto dto, CancellationToken ct)
        => StatusCode(201, await One(await Stories.CreateAsync(PersonId, ToCreate(dto), ct), ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStoryDto dto, CancellationToken ct)
        => Ok(await One(await Stories.UpdateAsync(id, PersonId, false, ToUpdate(dto), ct), ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await Stories.DeleteAsync(id, PersonId, false, ct);
        return Ok();
    }
}

[Route("api/v1/admin/stories")]
[Authorize]
public sealed class AdminStoriesController(IStoryService stories, IPersonDirectory directory) : StoriesControllerBase(stories, directory)
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? type, [FromQuery] string? status, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(await ListShape(await Stories.ListAsync(new StoryQuery(null, false, type?.ToUpperInvariant(), status?.ToUpperInvariant(), null, PageRequest.Of(page, limit, 20, 100)), ct), ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(await One(await Stories.GetAsync(id, ct), ct));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStoryDto dto, CancellationToken ct)
    {
        RequireAdmin();
        return StatusCode(201, await One(await Stories.CreateAsync(PersonId, ToCreate(dto), ct), ct));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStoryDto dto, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(await One(await Stories.UpdateAsync(id, PersonId, true, ToUpdate(dto), ct), ct));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        await Stories.DeleteAsync(id, PersonId, true, ct);
        return Ok();
    }

    [HttpPatch("{id:guid}/visibility")]
    public async Task<IActionResult> Visibility(Guid id, [FromBody] ToggleVisibilityDto dto, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(await One(await Stories.SetHiddenAsync(id, dto.IsHidden ?? false, ct), ct));
    }
}

[Route("api/v1/public/stories")]
public sealed class PublicStoriesController(IStoryService stories, IPersonDirectory directory) : StoriesControllerBase(stories, directory)
{
    protected override bool PublicView => true;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? source, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        var role = (source ?? "all").ToLowerInvariant() switch
        {
            "user" => PlatformRoles.User,
            "admin" => PlatformRoles.Admin,
            "all" => null,
            _ => throw new ValidationException("source must be one of the following values: user, admin, all"),
        };
        return Ok(await ListShape(await Stories.ListAsync(new StoryQuery(null, true, null, null, role, PageRequest.Of(page, limit, 10, 50)), ct), ct));
    }
}
