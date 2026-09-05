using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Communication.Application;

namespace NacenTech.Api.V1Compat;

public sealed class CreateCollaborationRequestDto
{
    [Required] public Guid? RequesterIntakeId { get; set; }
    [Required] public Guid? TargetIntakeId { get; set; }
    [MaxLength(1000)] public string? Message { get; set; }
}

/// <summary>
/// collaboration_requests → CaseInvitation. KEEP_WITH_CHANGE: accept không auto-reject request khác (AC 24).
/// Legacy `@Post` trả 201 kể cả accept/reject.
/// </summary>
[Route("api/v1/my/collaboration-requests")]
[Authorize]
public sealed class MyCollaborationRequestsController(IInvitationService invitations, IntakeFacade intakes, IPersonDirectory directory) : V1ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCollaborationRequestDto dto, CancellationToken ct)
    {
        var requester = await intakes.ResolveSubjectAsync(dto.RequesterIntakeId!.Value, ct) ?? throw new NotFoundException($"Intake {dto.RequesterIntakeId} not found");
        var target = await intakes.ResolveSubjectAsync(dto.TargetIntakeId!.Value, ct) ?? throw new NotFoundException($"Intake {dto.TargetIntakeId} not found");
        var inv = await invitations.CreateAsync(PersonId, requester, target, dto.Message, ct);
        return StatusCode(201, Ok200(Shape(inv, null, null, null, null)));
    }

    [HttpGet("sent")]
    public async Task<IActionResult> Sent([FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        var result = await invitations.ListSentAsync(PersonId, PageRequest.Of(page, limit, 20, 1000), ct);
        return Ok(Paged(result, await WithRelations(result.Data, includeRequesterUser: false, includeTargetUser: true, ct)));
    }

    [HttpGet("received")]
    public async Task<IActionResult> Received([FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        var result = await invitations.ListReceivedAsync(PersonId, PageRequest.Of(page, limit, 20, 1000), ct);
        return Ok(Paged(result, await WithRelations(result.Data, includeRequesterUser: true, includeTargetUser: false, ct)));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var inv = await invitations.GetForParticipantAsync(id, PersonId, ct);
        return Ok(Ok200((await WithRelations([inv], true, true, ct))[0]));
    }

    [HttpPost("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id, CancellationToken ct)
    {
        var inv = await invitations.AcceptAsync(id, PersonId, ct);
        return StatusCode(201, Ok200((await WithRelations([inv], true, true, ct))[0]));
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, CancellationToken ct)
    {
        var inv = await invitations.DeclineAsync(id, PersonId, ct);
        return StatusCode(201, Ok200(Shape(inv, null, null, null, null)));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await invitations.CancelAsync(id, PersonId, ct);
        return Ok(Ok200(new { message = "Collaboration request cancelled" }));
    }

    private async Task<IReadOnlyList<object>> WithRelations(IReadOnlyList<InvitationDto> items, bool includeRequesterUser, bool includeTargetUser, CancellationToken ct)
    {
        var subjects = items.SelectMany(i => new[] { i.RequesterSubject, i.TargetSubject }).Distinct().ToList();
        var intakeViews = await intakes.GetViewsAsync(subjects, ct);
        var personIds = items.SelectMany(i => new[] { i.RequesterPersonId, i.TargetPersonId }).Distinct().ToArray();
        var people = await directory.GetManyAsync(personIds, ct);
        return items.Select(i => Shape(i,
            intakeViews.GetValueOrDefault(i.RequesterSubject),
            intakeViews.GetValueOrDefault(i.TargetSubject),
            includeRequesterUser ? people.GetValueOrDefault(i.RequesterPersonId) : null,
            includeTargetUser ? people.GetValueOrDefault(i.TargetPersonId) : null)).ToList();
    }

    internal static object Shape(InvitationDto i, object? requesterIntake, object? targetIntake, PersonBrief? requesterUser, PersonBrief? targetUser)
    {
        var d = new Dictionary<string, object?>
        {
            ["id"] = i.Id,
            ["requesterIntakeId"] = i.RequesterSubject.Id,
            ["targetIntakeId"] = i.TargetSubject.Id,
            ["requesterUserId"] = i.RequesterPersonId,
            ["targetUserId"] = i.TargetPersonId,
            ["status"] = V1Mappers.InvitationStatusV1(i.Status),
            ["message"] = i.Message,
            ["createdAt"] = i.CreatedAt,
            ["updatedAt"] = i.UpdatedAt,
        };
        if (requesterIntake is not null) d["requesterIntake"] = requesterIntake;
        if (targetIntake is not null) d["targetIntake"] = targetIntake;
        if (requesterUser is not null) d["requesterUser"] = V1Mappers.UserBrief(requesterUser);
        if (targetUser is not null) d["targetUser"] = V1Mappers.UserBrief(targetUser);
        return d;
    }
}

[Route("api/v1/admin/collaboration-requests")]
[Authorize]
public sealed class AdminCollaborationRequestsController(IInvitationService invitations, IntakeFacade intakes, IPersonDirectory directory) : V1ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        RequireAdmin();
        var result = await invitations.ListAllAsync(PageRequest.Of(page, limit, 20, 1000), ct);
        var subjects = result.Data.SelectMany(i => new[] { i.RequesterSubject, i.TargetSubject }).Distinct().ToList();
        var views = await intakes.GetViewsAsync(subjects, ct);
        var people = await directory.GetManyAsync(result.Data.SelectMany(i => new[] { i.RequesterPersonId, i.TargetPersonId }).Distinct().ToArray(), ct);
        var data = result.Data.Select(i => MyCollaborationRequestsController.Shape(i, views.GetValueOrDefault(i.RequesterSubject), views.GetValueOrDefault(i.TargetSubject),
            people.GetValueOrDefault(i.RequesterPersonId), people.GetValueOrDefault(i.TargetPersonId))).ToList();
        return Ok(Paged(result, data));
    }
}
