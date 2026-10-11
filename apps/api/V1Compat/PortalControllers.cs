using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Content.Application;

namespace NacenTech.Api.V1Compat;

[ApiController]
[Route("api/v1/portal")]
public sealed class PortalController(IPortalOverviewService portalService) : V1ControllerBase
{
    /// <summary>
    /// REQ-HOME-002: Thống kê chỉ số thực tế trên sàn giao dịch công nghệ (Public / Zero-Mock)
    /// </summary>
    [HttpGet("stats")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStats(CancellationToken ct = default)
    {
        var stats = await portalService.GetStatsAsync(ct);
        return Ok(Ok200(stats));
    }
}

[ApiController]
[Route("api/v1/events")]
public sealed class EventsController(ITechmartEventService eventService) : V1ControllerBase
{
    /// <summary>
    /// REQ-HOME-004: Danh sách sự kiện & phiên chào giá công nghệ Techmart
    /// </summary>
    [HttpGet("techmart")]
    [AllowAnonymous]
    public async Task<IActionResult> ListEvents(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var pageReq = new PageRequest(page <= 0 ? 1 : page, pageSize <= 0 ? 10 : pageSize);
        var result = await eventService.ListEventsAsync(status, pageReq, ct);
        return Ok(Ok200(result));
    }

    /// <summary>
    /// REQ-HOME-004: Chi tiết phiên chào giá Techmart theo Id
    /// </summary>
    [HttpGet("techmart/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetEvent(Guid id, CancellationToken ct = default)
    {
        var ev = await eventService.GetEventByIdAsync(id, ct);
        if (ev is null)
        {
            return NotFound(new { success = false, errorCode = PortalErrorCodes.EventNotFound, message = "Không tìm thấy thông tin sự kiện Techmart." });
        }
        return Ok(Ok200(ev));
    }

    /// <summary>
    /// REQ-HOME-005: Đăng ký tham gia phiên chào giá hoặc đăng ký gian hàng Techmart
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] EventRegistrationRequestDto request, CancellationToken ct = default)
    {
        var result = await eventService.RegisterAsync(request, ct);
        return Ok(Ok200(result));
    }
}

[ApiController]
[Route("api/v1/ai")]
public sealed class AiAssistantController(IAiAssistantService aiService) : V1ControllerBase
{
    /// <summary>
    /// REQ-HOME-006: Trợ lý ảo AI Nacentwin định hướng TRL, gợi ý giá mua/bán và kết nối chuyên gia
    /// </summary>
    [HttpPost("quick-assist")]
    [AllowAnonymous]
    public async Task<IActionResult> QuickAssist([FromBody] AiQuickAssistRequestDto request, CancellationToken ct = default)
    {
        var result = await aiService.QuickAssistAsync(request, ct);
        return Ok(Ok200(result));
    }
}
