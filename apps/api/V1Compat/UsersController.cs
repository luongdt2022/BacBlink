using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Communication.Application;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Policy.Application;
using NacenTech.Modules.Technology.Application;

namespace NacenTech.Api.V1Compat;

public class UpdateProfileDto
{
    [MaxLength(100)] public string? FirstName { get; set; }
    [MaxLength(100)] public string? LastName { get; set; }
    [MaxLength(20)] public string? Phone { get; set; }
    [MaxLength(255)] public string? Organization { get; set; }
}

public sealed class UpdateSettingsDto
{
    public bool? MatchingAuto { get; set; }
}

public sealed class AdminCreateUserDto
{
    [Required, EmailAddress(ErrorMessage = "email must be an email")] public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    [MaxLength(100)] public string? FirstName { get; set; }
    [MaxLength(100)] public string? LastName { get; set; }
    [MaxLength(20)] public string? Phone { get; set; }
    [MaxLength(255)] public string? Organization { get; set; }
    public bool? IsActive { get; set; }
}

public sealed class AdminUpdateUserDto : UpdateProfileDto
{
    public bool? IsActive { get; set; }
}

public sealed class AdminResetPasswordDto
{
    [Required] public string NewPassword { get; set; } = string.Empty;
}

[Route("api/v1/users")]
[Authorize]
public sealed class UsersController(IPersonService persons) : V1ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct) => Ok(V1Mappers.User(await persons.GetAsync(PersonId, ct)));

    [HttpPatch("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileDto dto, CancellationToken ct)
        => Ok(V1Mappers.User(await persons.UpdateProfileAsync(PersonId, new UpdateProfileCommand(dto.FirstName, dto.LastName, dto.Phone, dto.Organization), ct)));
}

[Route("api/v1/my/settings")]
[Authorize]
public sealed class UserSettingsController(IPersonService persons) : V1ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) => Ok(V1Mappers.Settings(await persons.GetPreferencesAsync(PersonId, ct)));

    [HttpPatch]
    public async Task<IActionResult> Update([FromBody] UpdateSettingsDto dto, CancellationToken ct)
        => Ok(V1Mappers.Settings(await persons.UpdatePreferencesAsync(PersonId, dto.MatchingAuto, ct)));
}

[Route("api/v1/admin/users")]
[Authorize]
public sealed class AdminUsersController(
    IPersonService persons,
    IInvitationService invitations,
    IDemandService demands,
    ITechnologyService technologies,
    ITaxonomyService taxonomy,
    ISubjectResolver subjects,
    IPersonDirectory directory) : V1ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AdminCreateUserDto dto, CancellationToken ct)
    {
        RequireAdmin();
        var p = await persons.AdminCreateAsync(new AdminCreatePersonCommand(dto.Email.Trim().ToLowerInvariant(), dto.Password, dto.FirstName, dto.LastName, dto.Phone, dto.Organization, dto.IsActive), ct);
        return StatusCode(201, V1Mappers.User(p));
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? page, [FromQuery] int? limit, [FromQuery] string? search, [FromQuery] string? status, CancellationToken ct)
    {
        RequireAdmin();
        var pr = PageRequest.Of(page, limit, defaultLimit: 10, maxLimit: 1000);
        var result = await persons.AdminListAsync(pr, search, status ?? "all", ct);
        return Ok(new
        {
            data = result.Data.Select(V1Mappers.User).ToList(),
            meta = new { total = result.Total, page = result.Page, limit = result.Limit, totalPages = result.TotalPages },
        });
    }

    [HttpGet("{id:guid}/profile")]
    public async Task<IActionResult> Profile(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        var user = await persons.GetAsync(id, ct);
        var all = PageRequest.Of(1, 1000, 1000, 1000);
        var challenges = await demands.ListAsync(new DemandQuery(id, null, false, null, null, null, null, false, all), ct);
        var ips = await technologies.ListAsync(new TechnologyQuery(id, null, false, null, null, null, null, false, all), ct);
        var categoryIds = challenges.Data.Select(c => c.CategoryId).Concat(ips.Data.Select(i => i.CategoryId)).Where(c => c.HasValue).Select(c => c!.Value).Distinct().ToArray();
        var categories = await taxonomy.GetManyAsync(categoryIds, ct);
        object Map(Guid iid, string title, string status, Guid? categoryId, DateTimeOffset createdAt) => new
        {
            id = iid,
            title,
            status = V1Mappers.LowerStatus(status),
            category = categoryId is { } cid && categories.TryGetValue(cid, out var c) ? c.Name : null,
            createdAt,
        };
        return Ok(new
        {
            user = V1Mappers.User(user),
            ipIntakes = ips.Data.Select(i => Map(i.Id, i.Title, i.PublicationStatus, i.CategoryId, i.CreatedAt)).ToList(),
            challengeIntakes = challenges.Data.Select(c => Map(c.Id, c.Title, c.Status, c.CategoryId, c.CreatedAt)).ToList(),
        });
    }

    [HttpGet("{id:guid}/collaboration-history")]
    public async Task<IActionResult> CollaborationHistory(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        var items = await invitations.ListForPersonAsync(id, ct);
        var counterpartIds = items.Select(i => i.RequesterPersonId == id ? i.TargetPersonId : i.RequesterPersonId).Distinct().ToArray();
        var people = await directory.GetManyAsync(counterpartIds, ct);
        var subjectRefs = items.Select(i => i.RequesterPersonId == id ? i.TargetSubject : i.RequesterSubject);
        var summaries = await subjects.SummariesAsync(subjectRefs, ct);
        var data = items.Select(r =>
        {
            var isSender = r.RequesterPersonId == id;
            var cp = people.GetValueOrDefault(isSender ? r.TargetPersonId : r.RequesterPersonId);
            var related = summaries.GetValueOrDefault(isSender ? r.TargetSubject : r.RequesterSubject);
            var name = cp is null ? "—" : string.Join(' ', new[] { cp.FirstName, cp.LastName }.Where(s => !string.IsNullOrEmpty(s)));
            return new
            {
                id = r.Id,
                direction = isSender ? "sent" : "received",
                status = V1Mappers.InvitationStatusV1(r.Status),
                counterpartName = string.IsNullOrEmpty(name) ? (cp?.Email ?? "—") : name,
                counterpartEmail = cp?.Email ?? "—",
                intakeTitle = related?.DisplayTitle ?? related?.Title ?? "—",
                intakeType = (isSender ? r.TargetSubject : r.RequesterSubject).Kind == Kernel.Domain.SubjectKinds.DemandBrief ? "challenge" : "ip",
                createdAt = r.CreatedAt,
                updatedAt = r.UpdatedAt,
            };
        }).ToList();
        return Ok(new { data, total = data.Count });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id, CancellationToken ct)
    {
        RequireAdmin();
        if (!Guid.TryParse(id, out var gid)) throw new Kernel.Domain.NotFoundException("User not found");
        return Ok(V1Mappers.User(await persons.GetAsync(gid, ct)));
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AdminUpdateUserDto dto, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(V1Mappers.User(await persons.AdminUpdateAsync(id, new AdminUpdatePersonCommand(dto.FirstName, dto.LastName, dto.Phone, dto.Organization, dto.IsActive), ct)));
    }

    [HttpPost("{id:guid}/reset-password")]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] AdminResetPasswordDto dto, CancellationToken ct)
    {
        RequireAdmin();
        await persons.AdminResetPasswordAsync(id, dto.NewPassword, ct);
        return Ok(new { message = "Password reset successfully" });
    }
}
