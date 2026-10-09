using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Enterprise.Application;

namespace NacenTech.Api.V1Compat;

[ApiController]
[Route("api/v1/enterprises")]
public sealed class EnterpriseController(IEnterpriseService enterpriseService, IAuditWriter audit) : V1ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetDirectory(
        [FromQuery] string? q,
        [FromQuery] string? province,
        [FromQuery] string? sectorCode,
        [FromQuery] string? subjectType,
        [FromQuery] string? tniClassification,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 9,
        CancellationToken ct = default)
    {
        var query = new EnterpriseSearchQuery
        {
            Q = q,
            Province = province,
            SectorCode = sectorCode,
            SubjectType = subjectType,
            TniClassification = tniClassification,
            Page = page <= 0 ? 1 : page,
            PageSize = pageSize <= 0 ? 9 : pageSize
        };

        var result = await enterpriseService.GetPublicDirectoryAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("{taxCode}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDetail(string taxCode, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(taxCode)) return BadRequest(new { message = "Mã số thuế không được để trống." });

        bool isPrivileged = false;
        try
        {
            if (Actor.IsAuthenticated)
            {
                isPrivileged = Actor.PlatformRole is PlatformRoles.Admin or PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.ProvincialAdmin;
            }
        }
        catch { }

        var result = await enterpriseService.GetPublicDetailAsync(taxCode.Trim(), isPrivileged, ct);
        if (result is null) return NotFound(new { message = $"Không tìm thấy doanh nghiệp có mã số thuế {taxCode}" });

        return Ok(Ok200(result));
    }

    [HttpGet("/api/v1/portal/enterprise/profile")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct = default)
    {
        var result = await enterpriseService.GetOwnerProfileAsync(PersonId, ct);
        if (result is null)
        {
            // Tự khởi tạo hồ sơ rỗng cho tài khoản
            var empty = await enterpriseService.UpsertProfileAsync(PersonId, new UpsertEnterpriseProfileRequest
            {
                Name = Actor.Email ?? "Doanh nghiệp mới",
                ContactEmail = Actor.Email
            }, ct);
            return Ok(Ok200(empty));
        }

        return Ok(Ok200(result));
    }

    [HttpPut("/api/v1/portal/enterprise/profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpsertEnterpriseProfileRequest request, CancellationToken ct = default)
    {
        var updated = await enterpriseService.UpsertProfileAsync(PersonId, request, ct);
        audit.Append(new AuditEntry(
            PersonId, Actor.PlatformRole, "ENTERPRISE_PROFILE_UPDATE", "Enterprise", PersonId,
            null, "Owner update 10 groups", AuditOutcomes.Success, null, Actor.CorrelationId, Actor.IpAddress, Actor.UserAgent, updated.TaxCode
        ));

        return Ok(Ok200(updated));
    }

    [HttpPost("/api/v1/portal/enterprise/submit-verification")]
    [Authorize]
    public async Task<IActionResult> SubmitVerification(CancellationToken ct = default)
    {
        await enterpriseService.SubmitVerificationAsync(PersonId, ct);
        audit.Append(new AuditEntry(
            PersonId, Actor.PlatformRole, "ENTERPRISE_SUBMIT_VERIFICATION", "Enterprise", PersonId,
            null, "Submit verification to Provincial Gov", AuditOutcomes.Success, null, Actor.CorrelationId, Actor.IpAddress, Actor.UserAgent, null
        ));

        return Ok(Ok200(new { message = "Hồ sơ đã được gửi thẩm định thành công tới Sở KH&CN địa phương." }));
    }

    [HttpGet("/api/v1/admin/enterprises/dashboard")]
    [AllowAnonymous] // Cho phép tra cứu phân tích thống kê 304 DN phục vụ báo cáo
    public async Task<IActionResult> GetDashboardStats(CancellationToken ct = default)
    {
        var stats = await enterpriseService.GetDashboardStatsAsync(ct);
        return Ok(Ok200(stats));
    }

    [HttpPost("/api/v1/gov/enterprises/{id:guid}/approve")]
    [Authorize]
    public async Task<IActionResult> ApproveEnterprise(Guid id, [FromBody] ApproveEnterpriseRequest? req, CancellationToken ct = default)
    {
        var scopeId = Actor.ScopeType == ScopeTypes.Province ? Actor.ScopeId : null;
        await enterpriseService.ApproveEnterpriseAsync(id, Actor.Email ?? "Cán bộ thẩm định", scopeId, ct);

        audit.Append(new AuditEntry(
            PersonId, Actor.PlatformRole, "ENTERPRISE_APPROVE", "Enterprise", id,
            null, req?.Notes ?? "Duyệt cấp Verified Badge", AuditOutcomes.Success, null, Actor.CorrelationId, Actor.IpAddress, Actor.UserAgent, null
        ));

        return Ok(Ok200(new { message = "Hồ sơ doanh nghiệp đã được phê duyệt và cấp Verified Badge thành công." }));
    }

    [HttpPost("/api/v1/gov/enterprises/{id:guid}/reject")]
    [Authorize]
    public async Task<IActionResult> RejectEnterprise(Guid id, [FromBody] ApproveEnterpriseRequest req, CancellationToken ct = default)
    {
        var scopeId = Actor.ScopeType == ScopeTypes.Province ? Actor.ScopeId : null;
        await enterpriseService.RejectEnterpriseAsync(id, req.Notes ?? "Yêu cầu bổ sung thông tin hồ sơ", scopeId, ct);

        audit.Append(new AuditEntry(
            PersonId, Actor.PlatformRole, "ENTERPRISE_REJECT", "Enterprise", id,
            null, req.Notes ?? "Từ chối/Yêu cầu bổ sung", AuditOutcomes.Success, null, Actor.CorrelationId, Actor.IpAddress, Actor.UserAgent, null
        ));

        return Ok(Ok200(new { message = "Đã cập nhật trạng thái yêu cầu bổ sung hồ sơ." }));
    }
}
