using System;
using System.Net.Http;
using System.Text.Json;
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
public sealed class EnterpriseController(IEnterpriseService enterpriseService, IUnitOfWork uow, IAuditWriter audit) : V1ControllerBase
{
    private static readonly string[] KnownProvinces =
    [
        "Hà Nội", "Hồ Chí Minh", "TP. Hồ Chí Minh", "TP Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
        "Bắc Ninh", "Bình Dương", "Đồng Nai", "Bà Rịa - Vũng Tàu", "Vĩnh Phúc", "Hưng Yên", "Hải Dương",
        "Quảng Ninh", "Thái Nguyên", "Bắc Giang", "Long An", "Tiền Giang", "Khánh Hòa", "Lâm Đồng",
        "Bình Định", "Nghệ An", "Thanh Hóa", "Thừa Thiên Huế", "Quảng Nam", "Quảng Ngãi", "Bình Phước",
        "Tây Ninh", "Bến Tre", "Đồng Tháp", "An Giang", "Kiên Giang", "Cà Mau", "Sóc Trăng", "Trà Vinh",
        "Vĩnh Long", "Hậu Giang", "Bạc Liêu", "Ninh Thuận", "Bình Thuận", "Kon Tum", "Gia Lai", "Đắk Lắk",
        "Đắk Nông", "Phú Yên", "Hà Tĩnh", "Quảng Bình", "Quảng Trị", "Ninh Bình", "Nam Định", "Hà Nam",
        "Thái Bình", "Phú Thọ", "Lào Cai", "Yên Bái", "Tuyên Quang", "Hà Giang", "Cao Bằng", "Bắc Kạn",
        "Lạng Sơn", "Sơn La", "Hòa Bình", "Điện Biên", "Lai Châu"
    ];

    private static string? ExtractProvinceFromAddress(string? address)
    {
        if (string.IsNullOrWhiteSpace(address)) return null;
        foreach (var prov in KnownProvinces)
        {
            if (address.Contains(prov, StringComparison.OrdinalIgnoreCase))
            {
                if (prov.Contains("Hồ Chí Minh", StringComparison.OrdinalIgnoreCase))
                    return "TP. Hồ Chí Minh";
                return prov;
            }
        }
        return null;
    }

    [HttpGet("lookup-tax/{taxCode}")]
    [AllowAnonymous]
    public async Task<IActionResult> LookupTax(string taxCode, [FromServices] IHttpClientFactory httpClientFactory, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(taxCode))
            return BadRequest(new { message = "Mã số thuế không được để trống." });

        var cleanTaxCode = taxCode.Trim();

        // 1. Kiểm tra CSDL nội bộ trước (Ưu tiên nội bộ 304 DN)
        var internalDetail = await enterpriseService.GetPublicDetailAsync(cleanTaxCode, isPrivileged: false, ct);
        if (internalDetail != null)
        {
            return Ok(Ok200(new
            {
                found = true,
                source = "INTERNAL",
                taxCode = internalDetail.TaxCode,
                name = internalDetail.Name,
                province = internalDetail.ProvinceCity,
                address = internalDetail.AddressDetail,
                sectorName = internalDetail.MainSectorName
            }));
        }

        // 2. Fallback sang Open VietQR Business API
        try
        {
            var client = httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(5);
            var url = $"https://api.vietqr.io/v2/business/{cleanTaxCode}";
            using var response = await client.GetAsync(url, ct);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync(ct);
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                if (root.TryGetProperty("code", out var codeProp) && codeProp.GetString() == "00" &&
                    root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind == JsonValueKind.Object)
                {
                    var name = dataProp.TryGetProperty("name", out var n) ? n.GetString() : null;
                    var address = dataProp.TryGetProperty("address", out var a) ? a.GetString() : null;
                    var id = dataProp.TryGetProperty("id", out var i) ? i.GetString() : cleanTaxCode;

                    string? extractedProvince = ExtractProvinceFromAddress(address);

                    return Ok(Ok200(new
                    {
                        found = true,
                        source = "VIETQR",
                        taxCode = id,
                        name = name,
                        province = extractedProvince,
                        address = address,
                        sectorName = (string?)null
                    }));
                }
            }
        }
        catch
        {
            // Graceful degradation khi mất kết nối mạng ngoài
        }

        return Ok(Ok200(new
        {
            found = false,
            message = $"Không tìm thấy thông tin doanh nghiệp với mã số thuế {cleanTaxCode}."
        }));
    }
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetDirectory(
        [FromQuery] string? q,
        [FromQuery] string? province,
        [FromQuery] string? sectorCode,
        [FromQuery] string? subjectType,
        [FromQuery] string? tniClassification,
        [FromQuery] string? innovationTier,
        [FromQuery] string? tt17Classification,
        [FromQuery] string? sortBy,
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
            InnovationTier = innovationTier,
            Tt17Classification = tt17Classification,
            SortBy = sortBy,
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

    [HttpGet("{taxCode}/innovation-rating")]
    [AllowAnonymous]
    public async Task<IActionResult> GetInnovationRating(string taxCode, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(taxCode))
            return BadRequest(new { message = "Mã số thuế không được để trống." });

        bool isPrivileged = false;
        try
        {
            if (Actor.IsAuthenticated)
            {
                isPrivileged = Actor.PlatformRole is PlatformRoles.Admin 
                    or PlatformRoles.SuperAdmin 
                    or PlatformRoles.OperatorAdmin 
                    or PlatformRoles.ProvincialAdmin;
            }
        }
        catch { }

        var result = await enterpriseService.GetInnovationRatingAsync(taxCode.Trim(), isPrivileged, ct);
        if (result is null)
            return NotFound(new { message = $"Không tìm thấy dữ liệu đánh giá ĐMST cho mã số thuế {taxCode}" });

        // BR-02-011: Nếu là Owner của chính doanh nghiệp thì cấp quyền xem đầy đủ chi tiết
        if (!isPrivileged && Actor.IsAuthenticated && PersonId == result.EnterpriseId)
        {
            var privilegedResult = await enterpriseService.GetInnovationRatingAsync(taxCode.Trim(), isPrivileged: true, ct);
            if (privilegedResult is not null)
            {
                result = privilegedResult;
            }
        }

        await uow.CommitAsync(ct);
        return Ok(Ok200(result!));
    }

    [HttpPost("recalculate-innovation-ratings")]
    [Authorize]
    public async Task<IActionResult> RecalculateInnovationRatings(CancellationToken ct = default)
    {
        var count = await enterpriseService.RecalculateAllInnovationRatingsAsync(ct);
        await uow.CommitAsync(ct);
        return Ok(Ok200(new { message = $"Đã tính toán và cập nhật điểm ĐMST thành công cho {count} doanh nghiệp." }));
    }

    [HttpGet("/api/v1/portal/enterprise/profile")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct = default)
    {
        var result = await enterpriseService.GetOwnerProfileAsync(PersonId, Actor.Email, ct);
        if (result is null)
        {
            try
            {
                // Tự khởi tạo hồ sơ rỗng cho tài khoản
                var empty = await enterpriseService.UpsertProfileAsync(PersonId, new UpsertEnterpriseProfileRequest
                {
                    Name = Actor.Email ?? "Doanh nghiệp mới",
                    ContactEmail = Actor.Email,
                    TaxCode = null
                }, ct);
                await uow.CommitAsync(ct);
                return Ok(Ok200(empty));
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                // Xử lý race condition khi có 2 requests đồng thời khởi tạo hồ sơ
                var existing = await enterpriseService.GetOwnerProfileAsync(PersonId, Actor.Email, ct);
                if (existing != null) return Ok(Ok200(existing));
                throw;
            }
        }

        return Ok(Ok200(result));
    }

    [HttpPut("/api/v1/portal/enterprise/profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpsertEnterpriseProfileRequest request, CancellationToken ct = default)
    {
        try
        {
            var updated = await enterpriseService.UpsertProfileAsync(PersonId, request, ct);
            await uow.CommitAsync(ct);
            audit.Append(new AuditEntry(
                PersonId, Actor.PlatformRole, "ENTERPRISE_PROFILE_UPDATE", "Enterprise", PersonId,
                null, "Owner update 10 groups", AuditOutcomes.Success, null, Actor.CorrelationId, Actor.IpAddress, Actor.UserAgent, updated.TaxCode
            ));

            return Ok(Ok200(updated));
        }
        catch (DuplicateTaxCodeException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("/api/v1/portal/enterprise/capabilities/activate")]
    [Authorize]
    public async Task<IActionResult> ActivateCapability([FromBody] ActivateCapabilityRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request?.Capability))
            return BadRequest(new { message = "Năng lực cần kích hoạt không được để trống." });

        try
        {
            var updated = await enterpriseService.ActivateCapabilityAsync(PersonId, request.Capability, ct);
            await uow.CommitAsync(ct);

            audit.Append(new AuditEntry(
                PersonId, Actor.PlatformRole, "ENTERPRISE_CAPABILITY_ACTIVATE", "Enterprise", updated.Id,
                null, $"Activate capability: {request.Capability}", AuditOutcomes.Success, null, Actor.CorrelationId, Actor.IpAddress, Actor.UserAgent, updated.TaxCode
            ));

            return Ok(Ok200(updated));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("/api/v1/portal/enterprise/capabilities/switch-role")]
    [Authorize]
    public async Task<IActionResult> SwitchActiveRole([FromBody] SwitchRoleRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request?.TargetRole))
            return BadRequest(new { message = "Vai trò mục tiêu không được để trống." });

        try
        {
            var updated = await enterpriseService.SwitchActiveRoleAsync(PersonId, request.TargetRole, ct);
            await uow.CommitAsync(ct);

            audit.Append(new AuditEntry(
                PersonId, Actor.PlatformRole, "ENTERPRISE_ROLE_SWITCH", "Enterprise", updated.Id,
                null, $"Switch active role to: {request.TargetRole}", AuditOutcomes.Success, null, Actor.CorrelationId, Actor.IpAddress, Actor.UserAgent, updated.TaxCode
            ));

            return Ok(Ok200(updated));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("/api/v1/portal/enterprise/submit-verification")]
    [Authorize]
    public async Task<IActionResult> SubmitVerification(CancellationToken ct = default)
    {
        await enterpriseService.SubmitVerificationAsync(PersonId, ct);
        await uow.CommitAsync(ct);
        audit.Append(new AuditEntry(
            PersonId, Actor.PlatformRole, "ENTERPRISE_SUBMIT_VERIFICATION", "Enterprise", PersonId,
            null, "Submit verification to Provincial Gov", AuditOutcomes.Success, null, Actor.CorrelationId, Actor.IpAddress, Actor.UserAgent, null
        ));

        return Ok(Ok200(new { message = "Hồ sơ đã được gửi thẩm định thành công tới Ban Thẩm định BACLINK." }));
    }

    [HttpGet("/api/v1/admin/enterprises/dashboard")]
    [AllowAnonymous] // Cho phép tra cứu phân tích thống kê 304 DN phục vụ báo cáo
    public async Task<IActionResult> GetDashboardStats(CancellationToken ct = default)
    {
        var stats = await enterpriseService.GetDashboardStatsAsync(ct);
        return Ok(Ok200(stats));
    }

    [HttpPost("/api/v1/gov/enterprises/{id:guid}/approve")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    public IActionResult ApproveEnterpriseGovDeprecated(Guid id)
        => StatusCode(410, new
        {
            success = false,
            code = "ERR_GOV_ROUTE_GONE",
            message = "Endpoint /api/v1/gov/enterprises/{id}/approve đã ngừng hoạt động. Vui lòng sử dụng /api/v1/admin/enterprises/{id}/approve."
        });

    [HttpPost("/api/v1/gov/enterprises/{id:guid}/reject")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    public IActionResult RejectEnterpriseGovDeprecated(Guid id)
        => StatusCode(410, new
        {
            success = false,
            code = "ERR_GOV_ROUTE_GONE",
            message = "Endpoint /api/v1/gov/enterprises/{id}/reject đã ngừng hoạt động. Vui lòng sử dụng /api/v1/admin/enterprises/{id}/reject."
        });

    [HttpPost("/api/v1/admin/enterprises/{id:guid}/approve")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    public async Task<IActionResult> ApproveEnterprise(Guid id, [FromBody] ApproveEnterpriseRequest? req, CancellationToken ct = default)
    {
        await enterpriseService.ApproveEnterpriseAsync(id, Actor.Email ?? "Quản trị viên BACLINK", null, ct);
        await uow.CommitAsync(ct);

        audit.Append(new AuditEntry(
            PersonId, Actor.PlatformRole, "ENTERPRISE_APPROVE", "Enterprise", id,
            null, req?.Notes ?? "Duyệt cấp Verified Badge & DUAL capability", AuditOutcomes.Success, null, Actor.CorrelationId, Actor.IpAddress, Actor.UserAgent, null
        ));

        return Ok(Ok200(new { message = "Hồ sơ doanh nghiệp đã được phê duyệt, cấp Verified Badge và năng lực DUAL thành công." }));
    }

    [HttpPost("/api/v1/admin/enterprises/{id:guid}/reject")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    public async Task<IActionResult> RejectEnterprise(Guid id, [FromBody] ApproveEnterpriseRequest req, CancellationToken ct = default)
    {
        await enterpriseService.RejectEnterpriseAsync(id, req.Notes ?? "Yêu cầu bổ sung thông tin hồ sơ", null, ct);
        await uow.CommitAsync(ct);

        audit.Append(new AuditEntry(
            PersonId, Actor.PlatformRole, "ENTERPRISE_REJECT", "Enterprise", id,
            null, req.Notes ?? "Từ chối/Yêu cầu bổ sung", AuditOutcomes.Success, null, Actor.CorrelationId, Actor.IpAddress, Actor.UserAgent, null
        ));

        return Ok(Ok200(new { message = "Đã cập nhật trạng thái yêu cầu bổ sung hồ sơ." }));
    }
}
