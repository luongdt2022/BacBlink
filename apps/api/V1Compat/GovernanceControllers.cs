using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using NacenTech.Modules.Policy.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
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
        var targetUserId = dto.UserId ?? PersonId;
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
}

[Route("api/v1/governance/org-units")]
[Authorize]
public sealed class OrganizationUnitController(IOrganizationTreeService orgService) : V1ControllerBase
{
    private static readonly List<object> KeyProvinces34 = new()
    {
        // 12 Tỉnh Miền Bắc
        new { Code = "HN", Name = "Sở KH&CN TP. Hà Nội", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.hanoi@nacentech.local", Institutions = 14, Experts = 68, Shops = 42, Demands = 19 },
        new { Code = "HP", Name = "Sở KH&CN TP. Hải Phòng", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.haiphong@nacentech.local", Institutions = 8, Experts = 24, Shops = 18, Demands = 7 },
        new { Code = "QN", Name = "Sở KH&CN Tỉnh Quảng Ninh", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.quangninh@nacentech.local", Institutions = 5, Experts = 16, Shops = 12, Demands = 6 },
        new { Code = "BN", Name = "Sở KH&CN Tỉnh Bắc Ninh", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.bacninh@nacentech.local", Institutions = 6, Experts = 22, Shops = 28, Demands = 11 },
        new { Code = "VP", Name = "Sở KH&CN Tỉnh Vĩnh Phúc", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.vinhphuc@nacentech.local", Institutions = 4, Experts = 14, Shops = 15, Demands = 5 },
        new { Code = "TN", Name = "Sở KH&CN Tỉnh Thái Nguyên", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.thainguyen@nacentech.local", Institutions = 7, Experts = 30, Shops = 14, Demands = 8 },
        new { Code = "HD", Name = "Sở KH&CN Tỉnh Hải Dương", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.haiduong@nacentech.local", Institutions = 3, Experts = 11, Shops = 13, Demands = 4 },
        new { Code = "HY", Name = "Sở KH&CN Tỉnh Hưng Yên", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.hungyen@nacentech.local", Institutions = 4, Experts = 15, Shops = 16, Demands = 6 },
        new { Code = "ND", Name = "Sở KH&CN Tỉnh Nam Định", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.namdinh@nacentech.local", Institutions = 3, Experts = 10, Shops = 9, Demands = 3 },
        new { Code = "PT", Name = "Sở KH&CN Tỉnh Phú Thọ", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.phutho@nacentech.local", Institutions = 4, Experts = 12, Shops = 10, Demands = 4 },
        new { Code = "NB", Name = "Sở KH&CN Tỉnh Ninh Bình", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.ninhbinh@nacentech.local", Institutions = 3, Experts = 9, Shops = 8, Demands = 3 },
        new { Code = "BG", Name = "Sở KH&CN Tỉnh Bắc Giang", Region = "Miền Bắc", RegionCode = "NORTH", Leader = "so.bacgiang@nacentech.local", Institutions = 5, Experts = 18, Shops = 20, Demands = 7 },

        // 10 Tỉnh Miền Trung & Tây Nguyên
        new { Code = "DN", Name = "Sở KH&CN TP. Đà Nẵng", Region = "Miền Trung & Tây Nguyên", RegionCode = "CENTRAL", Leader = "so.danang@nacentech.local", Institutions = 11, Experts = 45, Shops = 32, Demands = 14 },
        new { Code = "TH", Name = "Sở KH&CN Tỉnh Thanh Hóa", Region = "Miền Trung & Tây Nguyên", RegionCode = "CENTRAL", Leader = "so.thanhhoa@nacentech.local", Institutions = 6, Experts = 20, Shops = 15, Demands = 6 },
        new { Code = "NA", Name = "Sở KH&CN Tỉnh Nghệ An", Region = "Miền Trung & Tây Nguyên", RegionCode = "CENTRAL", Leader = "so.nghean@nacentech.local", Institutions = 7, Experts = 24, Shops = 17, Demands = 8 },
        new { Code = "TTH", Name = "Sở KH&CN Tỉnh Thừa Thiên Huế", Region = "Miền Trung & Tây Nguyên", RegionCode = "CENTRAL", Leader = "so.hue@nacentech.local", Institutions = 9, Experts = 38, Shops = 14, Demands = 7 },
        new { Code = "QNA", Name = "Sở KH&CN Tỉnh Quảng Nam", Region = "Miền Trung & Tây Nguyên", RegionCode = "CENTRAL", Leader = "so.quangnam@nacentech.local", Institutions = 4, Experts = 12, Shops = 11, Demands = 5 },
        new { Code = "QNG", Name = "Sở KH&CN Tỉnh Quảng Ngãi", Region = "Miền Trung & Tây Nguyên", RegionCode = "CENTRAL", Leader = "so.quangngai@nacentech.local", Institutions = 4, Experts = 11, Shops = 10, Demands = 4 },
        new { Code = "BD", Name = "Sở KH&CN Tỉnh Bình Định", Region = "Miền Trung & Tây Nguyên", RegionCode = "CENTRAL", Leader = "so.binhdinh@nacentech.local", Institutions = 5, Experts = 16, Shops = 12, Demands = 5 },
        new { Code = "KH", Name = "Sở KH&CN Tỉnh Khánh Hòa", Region = "Miền Trung & Tây Nguyên", RegionCode = "CENTRAL", Leader = "so.khanhhoa@nacentech.local", Institutions = 6, Experts = 22, Shops = 16, Demands = 6 },
        new { Code = "DL", Name = "Sở KH&CN Tỉnh Đắk Lắk", Region = "Miền Trung & Tây Nguyên", RegionCode = "CENTRAL", Leader = "so.daklak@nacentech.local", Institutions = 5, Experts = 18, Shops = 14, Demands = 7 },
        new { Code = "LD", Name = "Sở KH&CN Tỉnh Lâm Đồng", Region = "Miền Trung & Tây Nguyên", RegionCode = "CENTRAL", Leader = "so.lamdong@nacentech.local", Institutions = 6, Experts = 25, Shops = 19, Demands = 8 },

        // 12 Tỉnh Miền Nam
        new { Code = "SG", Name = "Sở KH&CN TP. Hồ Chí Minh", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.hcm@nacentech.local", Institutions = 18, Experts = 82, Shops = 58, Demands = 24 },
        new { Code = "BDG", Name = "Sở KH&CN Tỉnh Bình Dương", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.binhduong@nacentech.local", Institutions = 8, Experts = 34, Shops = 45, Demands = 18 },
        new { Code = "DNA", Name = "Sở KH&CN Tỉnh Đồng Nai", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.dongnai@nacentech.local", Institutions = 7, Experts = 28, Shops = 38, Demands = 15 },
        new { Code = "BRVT", Name = "Sở KH&CN Tỉnh Bà Rịa - Vũng Tàu", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.brvt@nacentech.local", Institutions = 5, Experts = 19, Shops = 21, Demands = 9 },
        new { Code = "CT", Name = "Sở KH&CN TP. Cần Thơ", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.cantho@nacentech.local", Institutions = 8, Experts = 35, Shops = 24, Demands = 11 },
        new { Code = "LA", Name = "Sở KH&CN Tỉnh Long An", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.longan@nacentech.local", Institutions = 5, Experts = 17, Shops = 22, Demands = 8 },
        new { Code = "TG", Name = "Sở KH&CN Tỉnh Tiền Giang", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.tiengiang@nacentech.local", Institutions = 4, Experts = 14, Shops = 15, Demands = 6 },
        new { Code = "AG", Name = "Sở KH&CN Tỉnh An Giang", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.angiang@nacentech.local", Institutions = 4, Experts = 15, Shops = 14, Demands = 5 },
        new { Code = "DT", Name = "Sở KH&CN Tỉnh Đồng Tháp", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.dongthap@nacentech.local", Institutions = 4, Experts = 13, Shops = 12, Demands = 6 },
        new { Code = "KG", Name = "Sở KH&CN Tỉnh Kiên Giang", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.kiengiang@nacentech.local", Institutions = 4, Experts = 12, Shops = 11, Demands = 4 },
        new { Code = "TNH", Name = "Sở KH&CN Tỉnh Tây Ninh", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.tayninh@nacentech.local", Institutions = 3, Experts = 11, Shops = 13, Demands = 5 },
        new { Code = "CM", Name = "Sở KH&CN Tỉnh Cà Mau", Region = "Miền Nam", RegionCode = "SOUTH", Leader = "so.camau@nacentech.local", Institutions = 3, Experts = 10, Shops = 9, Demands = 4 }
    };

    [HttpGet]
    [HttpGet("tree")]
    public async Task<IActionResult> GetTree(CancellationToken ct)
    {
        var units = await orgService.GetOrgTreeAsync(ct);
        return Ok(Ok200(units));
    }

    [HttpGet("34-provinces")]
    public IActionResult Get34ProvincesTree()
    {
        return Ok(new
        {
            success = true,
            total = KeyProvinces34.Count,
            regions = new[]
            {
                new { code = "NORTH", name = "Khu Vực Miền Bắc", count = 12 },
                new { code = "CENTRAL", name = "Khu Vực Miền Trung & Tây Nguyên", count = 10 },
                new { code = "SOUTH", name = "Khu Vực Miền Nam", count = 12 }
            },
            provinces = KeyProvinces34
        });
    }

    [HttpGet("public-provinces")]
    [AllowAnonymous]
    public IActionResult GetPublicProvinces()
    {
        var provinces = KeyProvinces34
            .Select(x => (dynamic)x)
            .Select(x => new { code = (string)x.Code, name = (string)x.Name, regionCode = (string)x.RegionCode })
            .ToList();
        return Ok(new { success = true, data = provinces });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrganizationUnitCommand cmd, CancellationToken ct)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var unit = await orgService.CreateUnitAsync(cmd, Actor, ip, ct);
        return Ok(Ok200(unit));
    }

    [HttpPost("provision-leader")]
    public async Task<IActionResult> ProvisionLeader([FromBody] ProvisionProvinceAdminCommand cmd, CancellationToken ct)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var person = await orgService.ProvisionProvinceLeaderAsync(cmd, Actor, ip, ct);
        return Ok(Ok200(person));
    }
}

public sealed class AssignRoleDto
{
    [Required] public string Email { get; set; } = string.Empty;
    [Required] public string Role { get; set; } = string.Empty;
    public string? ScopeType { get; set; }
    public string? ScopeId { get; set; }
}

[Route("api/v1/governance/roles")]
[Authorize]
public sealed class RoleController(Microsoft.EntityFrameworkCore.DbContext db, IUnitOfWork uow, ITaxonomyService taxonomy) : V1ControllerBase
{
    private static readonly List<object> Roles10 = new()
    {
        new { code = PlatformRoles.SuperAdmin, name = "Quản trị Hệ thống Cấp cao (NacenTech)", tier = 1, scope = "GLOBAL", description = "Toàn quyền cấu hình, khởi tạo Cây tổ chức 34 tỉnh, can thiệp tối cao" },
        new { code = PlatformRoles.OperatorAdmin, name = "Quản trị Vận hành Sàn Giao dịch", tier = 1, scope = "GLOBAL", description = "Duyệt chéo toàn quốc, hòa giải khiếu nại, giám sát chất lượng và matching" },
        new { code = PlatformRoles.ProvincialAdmin, name = "Lãnh đạo Sở KH&CN Tỉnh/Thành", tier = 2, scope = "PROVINCE", description = "Ký duyệt cấp 2 hồ sơ doanh nghiệp & shop trên địa bàn tỉnh" },
        new { code = PlatformRoles.ClusterAdmin, name = "Chuyên viên Thẩm định Sở Tỉnh", tier = 2, scope = "ORG_UNIT", description = "Tiếp nhận, sơ kiểm hồ sơ pháp lý, ĐKKD, đề xuất duyệt/từ chối cấp 1" },
        new { code = PlatformRoles.SectorAdmin, name = "Trưởng Ban Quản lý Ngành TT17", tier = 3, scope = "SECTOR", description = "Phê duyệt bài toán công nghệ, thẩm định phân loại công nghệ theo ngành" },
        new { code = PlatformRoles.InnovationEntity, name = "Đại diện Viện, Trường, Hiệp hội", tier = 4, scope = "ORG_UNIT", description = "Quản lý cơ sở liên kết, chuyên gia và công nghệ trực thuộc" },
        new { code = PlatformRoles.VerifiedExpert, name = "Chuyên gia Khoa học & Công nghệ", tier = 4, scope = "PERSONAL", description = "Đã thẩm định LLKH, nhận tư vấn công nghệ, đánh giá bài toán" },
        new { code = PlatformRoles.Seller, name = "Nhà Cung Ứng Công Nghệ (Shop)", tier = 4, scope = "PERSONAL", description = "Gian hàng công nghệ chào bán, quản lý bài đăng và chuyển giao" },
        new { code = PlatformRoles.Buyer, name = "Bên Mua Công Nghệ / Doanh Nghiệp", tier = 4, scope = "PERSONAL", description = "Đăng bài toán tìm kiếm công nghệ, khảo sát nhu cầu đổi mới sáng tạo" },
        new { code = PlatformRoles.PublicUser, name = "Người Dùng Thành Viên Tự Do", tier = 4, scope = "PERSONAL", description = "Tra cứu thông tin, gửi yêu cầu liên hệ, đăng ký tham quan triển lãm" }
    };

    [HttpGet]
    public IActionResult GetRoles()
    {
        return Ok(new { success = true, total = Roles10.Count, data = Roles10 });
    }

    [HttpGet("matrix")]
    public IActionResult GetPermissionsMatrix()
    {
        var matrix = new[]
        {
            new { role = PlatformRoles.SuperAdmin, tier = "Tầng 1 (Trung Ương)", scope = "GLOBAL", canReview = true, canApproveFinal = true, canManageOrg = true, canManageSectors = true, canConfigureSystem = true },
            new { role = PlatformRoles.OperatorAdmin, tier = "Tầng 1 (Trung Ương)", scope = "GLOBAL", canReview = true, canApproveFinal = true, canManageOrg = false, canManageSectors = true, canConfigureSystem = false },
            new { role = PlatformRoles.ProvincialAdmin, tier = "Tầng 2 (Sở Tỉnh)", scope = "PROVINCE", canReview = true, canApproveFinal = true, canManageOrg = true, canManageSectors = false, canConfigureSystem = false },
            new { role = PlatformRoles.ClusterAdmin, tier = "Tầng 2 (Sở Tỉnh)", scope = "ORG_UNIT", canReview = true, canApproveFinal = false, canManageOrg = false, canManageSectors = false, canConfigureSystem = false },
            new { role = PlatformRoles.SectorAdmin, tier = "Tầng 3 (Chuyên Ngành)", scope = "SECTOR", canReview = true, canApproveFinal = true, canManageOrg = false, canManageSectors = true, canConfigureSystem = false },
            new { role = PlatformRoles.InnovationEntity, tier = "Tầng 4 (Cơ Sở)", scope = "ORG_UNIT", canReview = false, canApproveFinal = false, canManageOrg = false, canManageSectors = false, canConfigureSystem = false },
            new { role = PlatformRoles.VerifiedExpert, tier = "Tầng 4 (Cơ Sở)", scope = "PERSONAL", canReview = false, canApproveFinal = false, canManageOrg = false, canManageSectors = false, canConfigureSystem = false },
            new { role = PlatformRoles.Seller, tier = "Tầng 4 (Cơ Sở)", scope = "PERSONAL", canReview = false, canApproveFinal = false, canManageOrg = false, canManageSectors = false, canConfigureSystem = false },
            new { role = PlatformRoles.Buyer, tier = "Tầng 4 (Cơ Sở)", scope = "PERSONAL", canReview = false, canApproveFinal = false, canManageOrg = false, canManageSectors = false, canConfigureSystem = false },
            new { role = PlatformRoles.PublicUser, tier = "Tầng 4 (Cơ Sở)", scope = "PERSONAL", canReview = false, canApproveFinal = false, canManageOrg = false, canManageSectors = false, canConfigureSystem = false }
        };
        return Ok(new { success = true, data = matrix });
    }

    [HttpGet("officers")]
    public async Task<IActionResult> GetOfficers(CancellationToken ct)
    {
        if (Actor.PlatformRole is not (PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.Admin)
            || Actor.ScopeType != ScopeTypes.Global || !string.IsNullOrWhiteSpace(Actor.ScopeId))
            return Forbid();

        var adminRoles = new[] { PlatformRoles.SuperAdmin, PlatformRoles.OperatorAdmin, PlatformRoles.Admin,
            PlatformRoles.ProvincialAdmin, PlatformRoles.ClusterAdmin, PlatformRoles.SectorAdmin };
        var people = await db.Set<Person>().AsNoTracking().Where(person => adminRoles.Contains(person.PlatformRole))
            .OrderBy(person => person.Email)
            .Select(person => new { person.Id, person.FirstName, person.LastName, person.Email,
                person.PlatformRole, person.ScopeType, person.ScopeId }).ToListAsync(ct);
        var ids = people.Select(person => person.Id.ToString()).ToArray();
        var audits = await db.Set<ApprovalAuditLog>().AsNoTracking()
            .Where(audit => audit.Action == "ASSIGN_ROLE" && ids.Contains(audit.TargetId))
            .Select(audit => new { audit.TargetId, audit.CreatedAtUtc }).ToListAsync(ct);
        var assignedDates = audits.GroupBy(audit => audit.TargetId)
            .ToDictionary(group => group.Key, group => group.Max(audit => audit.CreatedAtUtc));
        return Ok(new { success = true, data = people.Select(person => new {
            id = person.Id, name = string.Join(" ", new[] { person.FirstName, person.LastName }.Where(value => !string.IsNullOrWhiteSpace(value))),
            email = person.Email, role = person.PlatformRole, scopeType = person.ScopeType, scopeId = person.ScopeId,
            assignedAt = assignedDates.TryGetValue(person.Id.ToString(), out var assignedAt) ? (DateTimeOffset?)assignedAt : null
        }) });
    }

    [HttpPost("assign")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto dto, CancellationToken ct)
    {
        if (Actor.PlatformRole is not (PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.Admin)
            || Actor.ScopeType != ScopeTypes.Global || !string.IsNullOrWhiteSpace(Actor.ScopeId))
        {
            return Forbid();
        }

        var normalizedEmail = Person.Normalize(dto.Email);
        var person = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
            db.Set<Person>(), x => x.Email == normalizedEmail, ct);

        if (person == null)
        {
            return NotFound(new { success = false, error = $"Không tìm thấy tài khoản với email '{dto.Email}'." });
        }

        var oldRole = person.PlatformRole;
        var scopeType = string.IsNullOrWhiteSpace(dto.ScopeType) ? ScopeTypes.Global : dto.ScopeType.Trim().ToUpperInvariant();
        var scopeId = string.IsNullOrWhiteSpace(dto.ScopeId) ? null : dto.ScopeId.Trim().ToUpperInvariant();

        if (scopeType == ScopeTypes.Global) scopeId = null;
        if (!ScopeTypes.IsValidForRole(dto.Role, scopeType, scopeId))
            return BadRequest(new { success = false, error = "Vai trò và phạm vi phân quyền không hợp lệ." });
        if (scopeType == ScopeTypes.Sector)
        {
            var activeSectors = await taxonomy.ListAsync("SECTOR", true, ct);
            if (!activeSectors.Any(sector => string.Equals(sector.Code, scopeId, StringComparison.Ordinal)))
                return BadRequest(new { success = false, error = "Ngành không tồn tại hoặc đã ngừng hoạt động." });
        }
        person.AssignRoleAndScope(dto.Role, scopeType, scopeId);

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var audit = new ApprovalAuditLog(
            Actor.PersonId ?? Guid.Empty,
            Actor.PlatformRole,
            "ASSIGN_ROLE",
            "persons",
            person.Id.ToString(),
            ip,
            $"{{\"email\":\"{normalizedEmail}\",\"oldRole\":\"{oldRole}\",\"newRole\":\"{dto.Role}\",\"scopeType\":\"{scopeType}\",\"scopeId\":\"{scopeId}\"}}");

        db.Set<ApprovalAuditLog>().Add(audit);
        await uow.CommitAsync(ct);

        return Ok(new
        {
            success = true,
            message = $"Đã gán vai trò '{dto.Role}' cho tài khoản '{dto.Email}' thành công.",
            personId = person.Id,
            role = person.PlatformRole,
            scopeType = person.ScopeType,
            scopeId = person.ScopeId
        });
    }
}
