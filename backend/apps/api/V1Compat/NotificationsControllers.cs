using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Communication.Application;

namespace NacenTech.Api.V1Compat;

[Route("api/v1/my/notifications")]
[Authorize]
public sealed class UserNotificationsController(INotificationService notifications) : V1ControllerBase
{
    private static readonly HashSet<string> Types = [NotificationTypes.MatchFound, NotificationTypes.CollaborationRequestReceived, NotificationTypes.CollaborationRequestAccepted, NotificationTypes.CollaborationRequestRejected];

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? page, [FromQuery] int? limit, [FromQuery] string? isRead, [FromQuery] string? type, CancellationToken ct)
    {
        bool? read = isRead switch { "true" => true, "false" => false, null or "" => null, _ => throw new ValidationException("isRead must be a boolean value") };
        if (type is not null && !Types.Contains(type)) throw new ValidationException("type must be one of the following values: match_found, collaboration_request_received, collaboration_request_accepted, collaboration_request_rejected");
        var result = await notifications.ListAsync(PersonId, read, type, PageRequest.Of(page, limit, 10, 1000), ct);
        var unread = await notifications.UnreadCountAsync(PersonId, ct);
        return Ok(Ok200(new
        {
            data = result.Data.Select(V1Mappers.Notification).ToList(),
            total = result.Total,
            page = result.Page,
            limit = result.Limit,
            totalPages = result.TotalPages,
            unreadCount = unread,
        }));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> Unread(CancellationToken ct) => Ok(Ok200(new { count = await notifications.UnreadCountAsync(PersonId, ct) }));

    [HttpPatch("read-all")]
    public async Task<IActionResult> ReadAll(CancellationToken ct)
    {
        await notifications.MarkAllReadAsync(PersonId, ct);
        return Ok(Ok200(new { message = "All notifications marked as read" }));
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> ReadOne(Guid id, CancellationToken ct) => Ok(Ok200(V1Mappers.Notification(await notifications.MarkReadAsync(id, PersonId, ct))));

    [HttpDelete("all")]
    public async Task<IActionResult> DeleteAll(CancellationToken ct)
    {
        await notifications.DeleteAllAsync(PersonId, ct);
        return Ok(Ok200(new { message = "All notifications deleted" }));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteOne(Guid id, CancellationToken ct)
    {
        await notifications.DeleteAsync(id, PersonId, ct);
        return Ok(Ok200(new { message = "Notification deleted" }));
    }
}

[Route("api/v1/admin/notifications")]
[Authorize]
public sealed class AdminNotificationsController(INotificationService notifications) : V1ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? page, [FromQuery] int? limit, [FromQuery] string? isRead, [FromQuery] string? type, [FromQuery] Guid? userId, CancellationToken ct)
    {
        RequireAdmin();
        bool? read = isRead switch { "true" => true, "false" => false, _ => null };
        var result = await notifications.ListAsync(userId, read, type, PageRequest.Of(page, limit, 10, 1000), ct);
        return Ok(Ok200(new
        {
            data = result.Data.Select(V1Mappers.Notification).ToList(),
            total = result.Total,
            page = result.Page,
            limit = result.Limit,
            totalPages = result.TotalPages,
            unreadCount = (int?)null,
        }));
    }
}
