using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Modules.Blockchain.Application.Services;

namespace NacenTech.Modules.Blockchain.Api;

public sealed record LiveVerificationApiRequest(
    string EntityType,
    Guid EntityId,
    string? CustomPayloadJson = null
);

[ApiController]
[Produces("application/json")]
[AllowAnonymous]
public sealed class BlockchainPublicController(
    IBlockchainVerificationService verificationService) : ControllerBase
{
    [HttpGet("api/v1/public/blockchain/verify/{entityType}/{entityId:guid}")]
    public async Task<IActionResult> GetEntityAnchorStatus(string entityType, Guid entityId, CancellationToken ct)
    {
        var result = await verificationService.GetEntityAnchorStatusAsync(entityType, entityId, ct);
        return Ok(new { success = result.IsSuccess, data = result });
    }

    [HttpPost("api/v1/public/blockchain/verify/live")]
    public async Task<IActionResult> VerifyLive([FromBody] LiveVerificationApiRequest request, CancellationToken ct)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.EntityType) || request.EntityId == Guid.Empty)
        {
            return BadRequest(new { success = false, message = "Dữ liệu yêu cầu không hợp lệ. Cần có entityType và entityId." });
        }

        var verdict = await verificationService.VerifyEntityAsync(
            request.EntityType,
            request.EntityId,
            request.CustomPayloadJson,
            ct
        );

        return Ok(new { success = verdict.IsSuccess, data = verdict });
    }
}
