using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Blockchain.Application.Services;

namespace NacenTech.Modules.Blockchain.Api;

[ApiController]
[Produces("application/json")]
public sealed class BlockchainAdminController(
    IBlockchainAdminService adminService,
    ICurrentActor actor) : ControllerBase
{
    private bool IsAuthorizedAdmin =>
        PlatformRoles.NormalizeTier(actor.PlatformRole) == PlatformRoles.Admin;

    [HttpGet("api/v1/admin/blockchain/policies")]
    public async Task<IActionResult> GetPolicies(CancellationToken ct)
    {
        if (!IsAuthorizedAdmin) return Forbid();

        var policies = await adminService.GetPoliciesAsync(ct);
        return Ok(new { success = true, data = policies });
    }

    [HttpPut("api/v1/admin/blockchain/policies/{id:guid}")]
    public async Task<IActionResult> UpdatePolicy(Guid id, [FromBody] UpdateAnchorPolicyRequest request, CancellationToken ct)
    {
        if (!IsAuthorizedAdmin) return Forbid();

        var updated = await adminService.UpdatePolicyAsync(id, request, ct);
        return Ok(new { success = true, data = updated });
    }

    [HttpGet("api/v1/admin/blockchain/blocks")]
    public async Task<IActionResult> GetBlocks([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        if (!IsAuthorizedAdmin) return Forbid();

        var result = await adminService.GetBlocksAsync(page, pageSize, ct);
        return Ok(new
        {
            success = true,
            data = result.Items,
            total = result.Total,
            page = result.Page,
            pageSize = result.PageSize,
            totalPages = result.TotalPages
        });
    }

    [HttpGet("api/v1/admin/blockchain/blocks/{blockNumber:long}")]
    public async Task<IActionResult> GetBlockDetail(long blockNumber, CancellationToken ct)
    {
        if (!IsAuthorizedAdmin) return Forbid();

        var block = await adminService.GetBlockDetailAsync(blockNumber, ct);
        if (block is null) return NotFound(new { success = false, message = $"Không tìm thấy Khối #{blockNumber}." });

        return Ok(new { success = true, data = block });
    }

    [HttpPost("api/v1/admin/blockchain/blocks/flush")]
    public async Task<IActionResult> FlushBlock(CancellationToken ct)
    {
        if (!IsAuthorizedAdmin) return Forbid();

        var block = await adminService.FlushBlockAsync(ct);
        if (block is null)
        {
            return Ok(new { success = true, message = "Không có bản ghi PENDING nào để đóng khối.", data = (object?)null });
        }

        return Ok(new { success = true, message = $"Đóng Khối #{block.BlockNumber} thành công.", data = block });
    }

    [HttpGet("api/v1/admin/blockchain/records")]
    public async Task<IActionResult> GetRecords(
        [FromQuery] string? entityType = null,
        [FromQuery] string? status = null,
        [FromQuery] string? keyword = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        if (!IsAuthorizedAdmin) return Forbid();

        var result = await adminService.GetRecordsAsync(entityType, status, keyword, page, pageSize, ct);
        return Ok(new
        {
            success = true,
            data = result.Items,
            total = result.Total,
            page = result.Page,
            pageSize = result.PageSize,
            totalPages = result.TotalPages
        });
    }

    [HttpGet("api/v1/admin/blockchain/bridge/status")]
    public async Task<IActionResult> GetBridgeStatus(CancellationToken ct)
    {
        if (!IsAuthorizedAdmin) return Forbid();

        var status = await adminService.GetBridgeStatusAsync(ct);
        return Ok(new { success = true, data = status });
    }

    [HttpPost("api/v1/admin/blockchain/bridge/trigger-sync")]
    public async Task<IActionResult> TriggerBridgeSync(CancellationToken ct)
    {
        if (!IsAuthorizedAdmin) return Forbid();

        var syncResult = await adminService.TriggerBridgeSyncAsync(ct);
        return Ok(new { success = true, data = syncResult });
    }
}
