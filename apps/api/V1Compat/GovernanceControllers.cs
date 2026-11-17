using System.ComponentModel.DataAnnotations;
using NacenTech.Modules.Policy.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Api.V1Compat;

public sealed class SubmitApprovalDto
{
    public Guid? UserId { get; set; }
    [Required] public string RequestType { get; set; } = string.Empty;
    public string? ScopeType { get; set; }
    public string? ScopeId { get; set; }
    [Required] public string PayloadJson { get; set; } = "{}";
}

public sealed class ReviewApprovalDto
{
    [Required] public string Action { get; set; } = string.Empty;
    public int ExpectedVersion { get; set; }
    public string? ReviewNote { get; set; }
}

public sealed class OverrideApprovalDto
{
    [Required, MinLength(20, ErrorMessage = "Lý do can thiệp giải trình phải từ 20 ký tự trở lên")]
    public string OverrideReason { get; set; } = string.Empty;

    [Required]
    public bool ConfirmCommitment { get; set; }

    public int ExpectedVersion { get; set; }
}

[Route("api/v1/governance/approvals")]
[Authorize]
public sealed class ApprovalController(IApprovalService approvals) : V1ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? requestType,
        [FromQuery] string? status,
        [FromQuery] string? scopeType,
        [FromQuery] string? scopeId,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        CancellationToken ct = default)
    {
        var result = await approvals.GetApprovalsAsync(
            new ApprovalListFilter(requestType, status, scopeType, scopeId, page, limit),
            Actor,
            ct);

        return Ok(new
        {
            success = true,
            data = result.Data,
            total = result.Total,
            page = result.Page,
            limit = result.Limit,
            totalPages = result.TotalPages
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await approvals.GetByIdAsync(id, Actor, ct);
        return Ok(Ok200(result));
    }

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitApprovalDto dto, CancellationToken ct)
    {
        var isAdministrative = Actor.PlatformRole is PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.Admin;
        var targetUserId = (isAdministrative && dto.UserId.HasValue) ? dto.UserId.Value : PersonId;
        var result = await approvals.SubmitRequestAsync(
            new SubmitApprovalRequestCommand(
                targetUserId,
                dto.RequestType,
                dto.ScopeType ?? ScopeTypes.Global,
                dto.ScopeId,
                dto.PayloadJson),
            ct);

        return Ok(Ok200(result));
    }

    [HttpPut("{id:guid}/review")]
    public async Task<IActionResult> Review(Guid id, [FromBody] ReviewApprovalDto dto, CancellationToken ct)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var result = await approvals.ReviewRequestAsync(
            id,
            new ReviewApprovalRequestCommand(dto.Action, dto.ExpectedVersion, dto.ReviewNote),
            Actor,
            ip,
            ct);

        return Ok(Ok200(result));
    }

    [HttpGet("{id:guid}/audit")]
    public async Task<IActionResult> GetAuditLogs(Guid id, CancellationToken ct)
    {
        await approvals.GetByIdAsync(id, Actor, ct);
        var logs = await approvals.GetAuditLogsAsync("approval_requests", id.ToString(), ct);
        return Ok(Ok200(logs));
    }

    [HttpGet("/api/v1/governance/audit-logs")]
    public async Task<IActionResult> GetGlobalAuditLogs([FromQuery] int limit = 100, CancellationToken ct = default)
    {
        RequireGlobalAdmin();
        var logs = await approvals.GetGlobalAuditLogsAsync(limit, ct);
        return Ok(Ok200(logs));
    }

    [HttpGet("/api/v1/admin/approvals/central-queue")]
    [HttpGet("central-queue")]
    public async Task<IActionResult> CentralQueue(
        [FromQuery] string? provinceId,
        [FromQuery] string? requestType,
        [FromQuery] string? slaStatus,
        [FromQuery] string? searchTerm,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        CancellationToken ct = default)
    {
        RequireGlobalAdmin();

        var result = await approvals.GetCentralApprovalQueueAsync(
            new ApprovalQueueQueryFilter(provinceId, requestType, slaStatus, searchTerm, page, limit),
            Actor,
            ct);

        return Ok(new
        {
            success = true,
            data = result.Data,
            total = result.Total,
            page = result.Page,
            limit = result.Limit,
            totalPages = result.TotalPages
        });
    }

    [HttpPost("/api/v1/admin/approvals/{id:guid}/override")]
    [HttpPost("{id:guid}/override")]
    public async Task<IActionResult> OverrideApprove(Guid id, [FromBody] OverrideApprovalDto dto, CancellationToken ct)
    {
        RequireGlobalAdmin();

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var result = await approvals.OverrideApproveAsync(
            id,
            new OverrideApprovalCommand(dto.OverrideReason, dto.ConfirmCommitment, dto.ExpectedVersion),
            Actor,
            ip,
            ct);

        return Ok(Ok200(result));
    }

    private void RequireGlobalAdmin()
    {
        if (Actor.PersonId is null || !PlatformRoles.IsAdministrative(Actor.PlatformRole))
        {
            throw new ForbiddenException("Chỉ Quản trị viên (ADMIN) mới có thẩm quyền thực hiện thao tác này.", "ERR_FORBIDDEN_GLOBAL_ADMIN");
        }
    }
}

[Route("api/v1/governance/org-units")]
[Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
public sealed class OrganizationUnitController : V1ControllerBase
{
    private IActionResult GoneOrgUnits()
        => StatusCode(StatusCodes.Status410Gone, new
        {
            success = false,
            code = "ERR_ORG_UNIT_DEPRECATED",
            message = "Hệ thống BACLINK đã hợp nhất quản trị 1 cấp ADMIN, bãi bỏ cây tổ chức 34 Sở KH&CN."
        });

    [HttpGet]
    [HttpGet("tree")]
    public IActionResult GetTree() => GoneOrgUnits();

    [HttpGet("34-provinces")]
    public IActionResult Get34ProvincesTree() => GoneOrgUnits();

    [HttpGet("public-provinces")]
    public IActionResult GetPublicProvinces() => GoneOrgUnits();

    [HttpPost]
    public IActionResult Create([FromBody] CreateOrganizationUnitCommand? cmd) => GoneOrgUnits();

    [HttpPut("{id:guid}")]
    public IActionResult Update([FromRoute] Guid id, [FromBody] UpdateOrganizationUnitCommand? cmd) => GoneOrgUnits();

    [HttpDelete("{id:guid}")]
    public IActionResult Deactivate([FromRoute] Guid id) => GoneOrgUnits();

    [HttpPost("provision-leader")]
    public IActionResult ProvisionLeader([FromBody] ProvisionProvinceAdminCommand? cmd) => GoneOrgUnits();
}


public sealed class AssignRoleDto
{
    [Required] public string Email { get; set; } = string.Empty;
    [Required] public string Role { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Department { get; set; }
    public string? ScopeType { get; set; }
    public string? ScopeId { get; set; }
}

[Route("api/v1/governance/roles")]
[Authorize]
public sealed class RoleController(IPersonService persons) : V1ControllerBase
{
    private static readonly List<object> Roles3 =
    [
        new { code = PlatformRoles.Admin, name = "Ban Quản Trị Hiệp Hội BACLINK", tier = 1, scope = ScopeTypes.Global, description = "Phê duyệt tập trung 1 cấp hồ sơ Hội viên, Sản phẩm, Nhu cầu, Ban Cố vấn & cấu hình hệ thống" },
        new { code = PlatformRoles.Enterprise, name = "Doanh Nghiệp Hội Viên BACLINK (Dual-Mode)", tier = 2, scope = ScopeTypes.Global, description = "Hội viên sở hữu năng lực kép Bên Mua ↔ Bên Bán (BUYER/SELLER) với bảo vệ IDOR theo tổ chức/cá nhân" },
        new { code = PlatformRoles.PublicUser, name = "Thành Viên / Khách Đã Đăng Nhập", tier = 3, scope = ScopeTypes.Global, description = "Tra cứu danh bạ công nghiệp, đăng ký tham gia sự kiện, đào tạo và nộp hồ sơ nâng hạng Hội viên" }
    ];

    private bool IsGlobalAdmin()
        => Actor.PersonId is not null
           && PlatformRoles.IsAdministrative(Actor.PlatformRole)
           && Actor.ScopeType == ScopeTypes.Global
           && string.IsNullOrWhiteSpace(Actor.ScopeId);

    [HttpGet]
    public IActionResult GetRoles()
    {
        return Ok(new { success = true, total = Roles3.Count, data = Roles3 });
    }

    [HttpGet("matrix")]
    public IActionResult GetPermissionsMatrix()
    {
        var matrix = new[]
        {
            new { role = PlatformRoles.Admin, tier = "Cấp 1 (Quản trị Tập trung BACLINK)", scope = ScopeTypes.Global, canReview = true, canApproveFinal = true, canManageUsers = true, canManageSectors = true, canConfigureSystem = true },
            new { role = PlatformRoles.Enterprise, tier = "Cấp 2 (Doanh nghiệp Hội viên Dual-Mode)", scope = ScopeTypes.Global, canReview = false, canApproveFinal = false, canManageUsers = false, canManageSectors = false, canConfigureSystem = false },
            new { role = PlatformRoles.PublicUser, tier = "Cấp 3 (Thành viên / Khách)", scope = ScopeTypes.Global, canReview = false, canApproveFinal = false, canManageUsers = false, canManageSectors = false, canConfigureSystem = false }
        };
        return Ok(new { success = true, data = matrix });
    }

    [HttpGet("officers")]
    public async Task<IActionResult> GetOfficers(CancellationToken ct)
    {
        if (!IsGlobalAdmin())
            return Forbid();

        var page = await persons.AdminListAsync(PageRequest.Of(1, 1000, 10, 1000), null, "all", ct);
        var ordered = page.Data.OrderBy(person => person.Email, StringComparer.OrdinalIgnoreCase).ToList();

        return Ok(new
        {
            success = true,
            data = ordered.Select(person => new
            {
                id = person.Id,
                name = string.Join(" ", new[] { person.FirstName, person.LastName }.Where(value => !string.IsNullOrWhiteSpace(value))),
                email = person.Email,
                role = PlatformRoles.NormalizeTier(person.PlatformRole),
                scopeType = person.ScopeType,
                scopeId = person.ScopeId,
                department = person.Organization,
                status = person.IsActive ? "ACTIVE" : "INACTIVE",
                assignedAt = person.UpdatedAt > person.CreatedAt ? (DateTimeOffset?)person.UpdatedAt : null
            })
        });
    }

    [HttpPost("assign")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto dto, CancellationToken ct)
    {
        if (!IsGlobalAdmin())
            return Forbid();

        var normalizedRole = (dto.Role ?? string.Empty).Trim().ToUpperInvariant();
        var scopeType = string.IsNullOrWhiteSpace(dto.ScopeType) ? ScopeTypes.Global : dto.ScopeType.Trim().ToUpperInvariant();
        var scopeId = string.IsNullOrWhiteSpace(dto.ScopeId) ? null : dto.ScopeId.Trim().ToUpperInvariant();

        if (!ScopeTypes.IsValidForRole(normalizedRole, scopeType, scopeId))
        {
            return BadRequest(new
            {
                success = false,
                error = "Vai trò hoặc phạm vi phân quyền không hợp lệ. Hệ thống BACLINK chỉ hỗ trợ 3 cấp (ADMIN, ENTERPRISE, PUBLIC_USER) với phạm vi GLOBAL."
            });
        }

        var normalizedEmail = Person.Normalize(dto.Email);
        var existing = await persons.FindByEmailAsync(normalizedEmail, ct);
        PersonDto updated;

        if (existing is null)
        {
            var fullName = dto.FullName?.Trim();
            string firstName = string.IsNullOrWhiteSpace(fullName) ? normalizedEmail : fullName;
            string? lastName = null;
            if (!string.IsNullOrWhiteSpace(fullName))
            {
                var parts = fullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 2)
                {
                    firstName = parts[0];
                    lastName = parts[1];
                }
            }

            updated = await persons.ProvisionAsync(
                new ProvisionPersonCommand(
                    normalizedEmail,
                    $"{Guid.NewGuid():N}!Aa1",
                    firstName,
                    lastName,
                    null,
                    dto.Department,
                    normalizedRole,
                    ScopeTypes.Global,
                    null,
                    true),
                ct);
        }
        else
        {
            updated = await persons.AssignRoleAndScopeAsync(
                existing.Id,
                new AssignRoleScopeCommand(normalizedRole, ScopeTypes.Global, null),
                ct);

            if (!string.IsNullOrWhiteSpace(dto.Department))
            {
                updated = await persons.AdminUpdateAsync(
                    existing.Id,
                    new AdminUpdatePersonCommand(updated.FirstName, updated.LastName, updated.Phone, dto.Department, null),
                    ct);
            }
        }

        return Ok(new
        {
            success = true,
            message = $"Đã gán vai trò '{updated.PlatformRole}' cho tài khoản '{dto.Email}' thành công.",
            personId = updated.Id,
            role = updated.PlatformRole,
            scopeType = updated.ScopeType,
            scopeId = updated.ScopeId
        });
    }

    [HttpPost("officers/{id:guid}/toggle-status")]
    public async Task<IActionResult> ToggleOfficerStatus(Guid id, CancellationToken ct)
    {
        if (!IsGlobalAdmin())
            return Forbid();

        var existing = await persons.FindAsync(id, ct);
        if (existing is null) return NotFound();

        var updated = await persons.AdminUpdateAsync(
            id,
            new AdminUpdatePersonCommand(existing.FirstName, existing.LastName, existing.Phone, existing.Organization, !existing.IsActive),
            ct);

        return Ok(new { success = true, isActive = updated.IsActive });
    }
}
