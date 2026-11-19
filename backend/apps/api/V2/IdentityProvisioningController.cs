using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Modules.Identity.Application;

namespace NacenTech.Api.V2;

/// <summary>
/// Bề mặt quản trị duy nhất để cấp hay thay đổi role/scope hạt nhân. Public registration cố ý không nhận
/// các trường này; quyền được kiểm tra lại trong application service và mọi thay đổi thành công có audit.
/// </summary>
[Route("api/v2/identity")]
public sealed class IdentityProvisioningController(IPersonService persons) : V2ControllerBase
{
    [HttpPost("provisioned-accounts")]
    [ProducesResponseType(typeof(PersonDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Provision([FromBody] ProvisionAccountRequest request, CancellationToken ct)
    {
        var person = await persons.ProvisionAsync(new ProvisionPersonCommand(
            request.Email.Trim(), request.Password, request.FirstName.Trim(), request.LastName, request.Phone,
            request.Organization, request.PlatformRole.Trim().ToUpperInvariant(), request.ScopeType.Trim().ToUpperInvariant(),
            request.ScopeId, request.IsActive), ct);
        return Created($"/api/v2/identity/persons/{person.Id}", person);
    }

    [HttpPut("persons/{id:guid}/role-scope")]
    [ProducesResponseType(typeof(PersonDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<PersonDto>> AssignRoleScope(Guid id, [FromBody] AssignRoleScopeRequest request, CancellationToken ct)
        => Ok(await persons.AssignRoleAndScopeAsync(id, new AssignRoleScopeCommand(
            request.PlatformRole.Trim().ToUpperInvariant(), request.ScopeType.Trim().ToUpperInvariant(), request.ScopeId), ct));
}

public sealed class ProvisionAccountRequest
{
    [Required, EmailAddress] public string Email { get; init; } = string.Empty;
    [Required, MinLength(8)] public string Password { get; init; } = string.Empty;
    [Required, MaxLength(100)] public string FirstName { get; init; } = string.Empty;
    [MaxLength(100)] public string? LastName { get; init; }
    [MaxLength(20)] public string? Phone { get; init; }
    [MaxLength(255)] public string? Organization { get; init; }
    [Required] public string PlatformRole { get; init; } = string.Empty;
    [Required] public string ScopeType { get; init; } = string.Empty;
    [MaxLength(50)] public string? ScopeId { get; init; }
    public bool IsActive { get; init; } = true;
}

public sealed class AssignRoleScopeRequest
{
    [Required] public string PlatformRole { get; init; } = string.Empty;
    [Required] public string ScopeType { get; init; } = string.Empty;
    [MaxLength(50)] public string? ScopeId { get; init; }
}
