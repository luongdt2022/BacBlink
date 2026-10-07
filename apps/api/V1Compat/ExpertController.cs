using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Communication.Application;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Policy.Application;

namespace NacenTech.Api.V1Compat;

public sealed class AiScanRequestDto
{
    public string FileName { get; set; } = "LLKH_Sample.pdf";
}

public sealed class QuickExpertIntakeFormDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string HighestDegree { get; set; } = string.Empty;
    public string Organization { get; set; } = string.Empty;
    public string SectorCode { get; set; } = string.Empty;
    public string? MasteredTechCodesJson { get; set; }
    public List<string>? MasteredTechCodes { get; set; }
    public bool PdpdConsent { get; set; }
    public IFormFile? CvFile { get; set; }
}

[Route("api/v1/experts")]
public sealed class ExpertController(IExpertService experts, IApprovalService approvals, IAuditWriter audit, ITaxonomyService taxonomy) : V1ControllerBase
{
    [HttpPost("upgrade-request")]
    [Authorize]
    public async Task<IActionResult> SubmitUpgrade([FromBody] SubmitExpertUpgradeRequest request, CancellationToken ct)
    {
        await ValidateSectorsAsync(request.ExpertiseSectors ?? [], ct);
        var result = await experts.SubmitUpgradeAsync(PersonId, request, ct);

        // Phân cấp Cấp 2: Tự động đưa hồ sơ vào hàng đợi thẩm định phân cấp của Sở/TW (Basic Design v2.6 & FR-ADM-007)
        var scopeType = string.IsNullOrWhiteSpace(request.ScopeType) ? ScopeTypes.Province : request.ScopeType.Trim().ToUpperInvariant();
        var scopeId = string.IsNullOrWhiteSpace(request.ScopeId) ? "HP" : request.ScopeId.Trim();
        await approvals.SubmitRequestAsync(
            new SubmitApprovalRequestCommand(
                PersonId,
                ApprovalRequestTypes.Expert,
                scopeType,
                scopeId,
                System.Text.Json.JsonSerializer.Serialize(result)),
            ct);

        return StatusCode(201, Ok200(result));
    }

    [HttpGet("my-profile")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct)
    {
        var result = await experts.GetMyProfileAsync(PersonId, ct);
        return result is null ? NotFound() : Ok(Ok200(result));
    }

    [HttpGet("me/detail")]
    [Authorize]
    public async Task<IActionResult> GetMyDetail(CancellationToken ct)
    {
        if (Actor.PlatformRole != PlatformRoles.VerifiedExpert)
            throw new ForbiddenException("Verified expert access required");
        var result = await experts.GetMyDetailAsync(PersonId, ct);
        if (result is null) return NotFound();
        Audit("EXPERT_PRIVATE_PROFILE_READ", result.PublicProfile.ExpertCode, "OWNER");
        return Ok(Ok200(result));
    }

    [HttpGet("me/documents/{documentId:guid}/download")]
    [Authorize]
    public async Task<IActionResult> DownloadMyDocument(Guid documentId, CancellationToken ct)
    {
        var result = await experts.OpenMyDocumentAsync(PersonId, documentId, ct);
        if (result is null) return NotFound();
        Audit("EXPERT_DOCUMENT_DOWNLOAD", documentId.ToString("N"), "OWNER");
        return File(result.Content, result.ContentType, result.DownloadName);
    }

    [HttpGet("/api/v1/admin/experts/{expertCode}/detail")]
    [Authorize]
    public async Task<IActionResult> GetAdminDetail(string expertCode, CancellationToken ct)
    {
        RequireAdmin();
        var result = await experts.GetAdminDetailAsync(expertCode, ct);
        if (result is null) return NotFound();
        Audit("EXPERT_PRIVATE_PROFILE_READ", expertCode, "ADMIN_REVIEW");
        return Ok(Ok200(result));
    }

    [HttpPut("/api/v1/admin/experts/{expertCode}/listing")]
    [Authorize]
    public async Task<IActionResult> SetListing(string expertCode, [FromBody] ExpertListingRequest request, CancellationToken ct)
    {
        RequireAdmin();
        await experts.SetPublicListingAsync(expertCode, request.IsPublic, request.IsAcceptingConsultation, request.PublicBio, ct);
        Audit("EXPERT_PUBLIC_LISTING_UPDATE", expertCode, "ADMIN_REVIEW");
        return NoContent();
    }

    [HttpGet("/api/v1/admin/experts/{expertCode}/documents/{documentId:guid}/download")]
    [Authorize]
    public async Task<IActionResult> DownloadAdminDocument(string expertCode, Guid documentId, CancellationToken ct)
    {
        RequireAdmin();
        var result = await experts.OpenAdminDocumentAsync(expertCode, documentId, ct);
        if (result is null) return NotFound();
        Audit("EXPERT_DOCUMENT_DOWNLOAD", documentId.ToString("N"), "ADMIN_REVIEW");
        return File(result.Content, result.ContentType, result.DownloadName);
    }

    [HttpPost("ai-cv-scan")]
    [Authorize]
    public async Task<IActionResult> SimulateAiScan([FromBody] AiScanRequestDto dto, CancellationToken ct)
    {
        var result = await experts.SimulateAiCvScanAsync(dto.FileName, ct);
        return Ok(Ok200(result));
    }

    [HttpPost("/api/v1/public/experts/quick-intake")]
    [AllowAnonymous]
    public async Task<IActionResult> QuickIntake([FromForm] QuickExpertIntakeFormDto form, CancellationToken ct)
    {
        await ValidateSectorsAsync([form.SectorCode], ct);
        var techCodes = form.MasteredTechCodes ?? [];
        if (techCodes.Count == 0 && !string.IsNullOrWhiteSpace(form.MasteredTechCodesJson))
        {
            try
            {
                techCodes = System.Text.Json.JsonSerializer.Deserialize<List<string>>(form.MasteredTechCodesJson) ?? [];
            }
            catch { }
        }

        var request = new QuickExpertIntakeRequest(
            FullName: form.FullName,
            Phone: form.Phone,
            Email: form.Email,
            HighestDegree: form.HighestDegree,
            Organization: form.Organization,
            SectorCode: form.SectorCode,
            MasteredTechCodes: techCodes,
            CvFileName: form.CvFile?.FileName,
            PdpdConsent: form.PdpdConsent);

        var result = await experts.SubmitQuickIntakeAsync(request, ct);
        return Ok(Ok200(result));
    }

    private void Audit(string action, string expertCode, string purpose)
        => audit.Append(new AuditEntry(Actor.PersonId, Actor.PlatformRole, action, "ExpertProfile", null, null, purpose,
            AuditOutcomes.Success, null, Actor.CorrelationId, Actor.IpAddress, Actor.UserAgent, expertCode));
    private async Task ValidateSectorsAsync(IReadOnlyList<string> codes, CancellationToken ct)
    {
        var active = (await taxonomy.ListAsync(TaxonomyKinds.Sector, true, ct))
            .Where(term => !string.IsNullOrWhiteSpace(term.Code)).Select(term => term.Code!).ToHashSet(StringComparer.Ordinal);
        if (codes.Count == 0 || codes.Any(code => !active.Contains(code)))
            throw new ValidationException("Lĩnh vực phải thuộc danh mục đang hoạt động.");
    }

}

public sealed class ExpertListingRequest
{
    public bool IsPublic { get; set; }
    public bool IsAcceptingConsultation { get; set; }
    public string? PublicBio { get; set; }
}

[ApiController]
[Route("api/v1/public/experts")]
public sealed class PublicExpertController(IExpertService experts, DbContext db, INotificationService notifications) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetDirectory(
        [FromQuery] string? q,
        [FromQuery(Name = "query")] string? query,
        [FromQuery] string? degree,
        [FromQuery] string? sectorCode,
        [FromQuery] string? provinceCode,
        [FromQuery] bool? acceptingConsultation,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 9,
        CancellationToken ct = default)
    {
        var searchTerm = string.IsNullOrWhiteSpace(q) ? query : q;
        var result = await experts.GetPublicDirectoryAsync(searchTerm, degree, sectorCode, provinceCode, acceptingConsultation, page, pageSize, ct);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{expertCode}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDetail(string expertCode, CancellationToken ct)
    {
        var result = await experts.GetPublicDetailAsync(expertCode, ct);
        return result is null ? NotFound() : Ok(new { success = true, data = result });
    }

    [HttpPost("{expertCode}/consultation-requests")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestConsultation(string expertCode, [FromBody] ExpertConsultationRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.ContactName) || string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { success = false, message = "Họ tên liên hệ và nội dung yêu cầu là bắt buộc." });

        var profile = await experts.GetPublicDetailAsync(expertCode, ct);
        if (profile is null) return NotFound();

        var recipients = await db.Set<Person>().AsNoTracking()
            .Where(x => x.IsActive && (x.PlatformRole == PlatformRoles.Admin || x.PlatformRole == PlatformRoles.OperatorAdmin || x.PlatformRole == PlatformRoles.SuperAdmin))
            .Select(x => x.Id).ToListAsync(ct);
        if (recipients.Count == 0)
            return StatusCode(503, new { success = false, message = "Chưa cấu hình người nhận thông báo NacenTech." });

        foreach (var recipient in recipients)
        {
            await notifications.CreateAsync(recipient, NotificationTypes.ExpertConsultationRequestReceived, new
            {
                profile.ExpertCode,
                ExpertName = profile.FullName,
                request.ContactName,
                request.OrganizationName,
                request.Email,
                request.Phone,
                request.Message,
                RequestedAtUtc = DateTimeOffset.UtcNow
            }, ct);
        }
        return Accepted(new { success = true, message = "Yêu cầu đã được chuyển tới NacenTech." });
    }
}

public sealed class ExpertConsultationRequest
{
    public string ContactName { get; set; } = string.Empty;
    public string? OrganizationName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Message { get; set; } = string.Empty;


}
