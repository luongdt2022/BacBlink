using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Lms.Application;
using NacenTech.Modules.Lms.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Lms.Api;

[ApiController]
[Produces("application/json")]
public sealed class LmsController(
    ILmsCatalogService catalogService,
    ILmsManagementService managementService,
    ILmsMediaService mediaService,
    IAuthorizationGate authGate,
    ICurrentActor actor,
    DbContext db) : ControllerBase
{
    private bool IsAdmin =>
        actor.PlatformRole is PlatformRoles.Admin or PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin;

    // ─── CỔNG HỌC LIỆU CÔNG KHAI (PUBLIC CATALOG) ────────────────────────────────

    [HttpGet("api/v1/lms/catalog")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCatalog([FromQuery] LmsMaterialFilterRequest filter, CancellationToken ct)
    {
        var result = await catalogService.GetCatalogAsync(filter, ct);
        return Ok(new
        {
            success = true,
            data = result.Materials.Items,
            total = result.Materials.Total,
            page = result.Materials.Page,
            pageSize = result.Materials.PageSize,
            totalPages = result.Materials.TotalPages,
            kpis = result.Kpis
        });
    }

    [HttpGet("api/v1/lms/catalog/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCatalogDetail(Guid id, CancellationToken ct)
    {
        var currentUserId = actor.IsAuthenticated ? actor.PersonId : null;
        var isStaffOrAuthor = IsAdmin;

        var detail = await catalogService.GetCatalogDetailAsync(id, currentUserId, isStaffOrAuthor, ct);
        LearnerProgress? progress = null;

        if (currentUserId.HasValue)
        {
            progress = await catalogService.GetLearnerProgressAsync(id, currentUserId.Value, ct);
        }

        return Ok(new
        {
            success = true,
            data = detail,
            progress = progress is null ? null : new
            {
                progress.WatchedSeconds,
                progress.ProgressPercent,
                progress.BestQuizScore,
                progress.QuizAttemptsCount,
                progress.IsCompleted,
                progress.CompletedAt
            }
        });
    }

    public sealed class ProgressReportDto
    {
        public int WatchedSeconds { get; set; }
    }

    [HttpPost("api/v1/lms/catalog/{id:guid}/progress")]
    [Authorize]
    public async Task<IActionResult> RecordProgress(Guid id, [FromBody] ProgressReportDto dto, CancellationToken ct)
    {
        var personId = actor.RequirePersonId();
        await catalogService.RecordProgressAsync(id, personId, dto.WatchedSeconds, ct);
        return Ok(new { success = true });
    }

    [HttpPost("api/v1/lms/catalog/{id:guid}/quiz-attempts")]
    [Authorize]
    public async Task<IActionResult> SubmitQuizAttempt(Guid id, [FromBody] SubmitQuizAttemptRequest request, CancellationToken ct)
    {
        var personId = actor.RequirePersonId();

        // Kiểm tra quyền submit quiz
        authGate.Require(new AuthorizationRequest(
            Action: Actions.LmsSubmitQuiz,
            PlatformRole: actor.PlatformRole),
            objectKind: LearningMaterial.SubjectKind,
            objectId: id);

        var result = await catalogService.SubmitQuizAttemptAsync(id, personId, request, ct);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("api/v1/lms/catalog/{id:guid}/practice-evaluations")]
    [Authorize]
    public async Task<IActionResult> SubmitPracticeEvaluation(
        Guid id,
        [FromBody] SubmitPracticeEvaluationRequest request,
        CancellationToken ct)
    {
        var personId = actor.RequirePersonId();

        // Kiểm tra quyền submit bài thực hành
        authGate.Require(new AuthorizationRequest(
            Action: Actions.LmsSubmitQuiz,
            PlatformRole: actor.PlatformRole),
            objectKind: LearningMaterial.SubjectKind,
            objectId: id);

        var result = await catalogService.SubmitPracticeEvaluationAsync(id, personId, request, ct);
        return Ok(new { success = true, data = result });
    }

    // ─── BÀN LÀM VIỆC QUẢN TRỊ (MANAGEMENT WORKSPACE) ──────────────────────────

    [HttpGet("api/v1/lms/materials")]
    [Authorize]
    public async Task<IActionResult> GetManagementList([FromQuery] LmsMaterialFilterRequest filter, CancellationToken ct)
    {
        var personId = actor.RequirePersonId();

        // RBAC: Đọc bảng quản trị
        authGate.Require(new AuthorizationRequest(
            Action: Actions.LmsReadManagement,
            PlatformRole: actor.PlatformRole,
            OrganizationRelation: IsAdmin ? "NONE" : "OWNER"),
            objectKind: LearningMaterial.SubjectKind,
            objectId: null);

        var result = await managementService.GetManagementListAsync(filter, personId, IsAdmin, ct);
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

    [HttpGet("api/v1/lms/materials/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetManagementDetail(Guid id, CancellationToken ct)
    {
        var personId = actor.RequirePersonId();

        var detail = await managementService.GetManagementDetailAsync(id, personId, IsAdmin, ct);

        // RBAC Check
        var isOwner = detail.CreatedBy == personId;
        authGate.Require(new AuthorizationRequest(
            Action: Actions.LmsReadManagement,
            PlatformRole: actor.PlatformRole,
            OrganizationRelation: isOwner ? "OWNER" : "NONE"),
            objectKind: LearningMaterial.SubjectKind,
            objectId: id);

        return Ok(new { success = true, data = detail });
    }

    [HttpPost("api/v1/lms/materials")]
    [Authorize]
    public async Task<IActionResult> CreateMaterial([FromBody] CreateLearningMaterialRequest request, CancellationToken ct)
    {
        var personId = actor.RequirePersonId();
        var personName = actor.Email ?? "Chuyên gia NacenTech";

        // RBAC: Tạo mới học liệu
        authGate.Require(new AuthorizationRequest(
            Action: Actions.LmsCreate,
            PlatformRole: actor.PlatformRole),
            objectKind: LearningMaterial.SubjectKind,
            objectId: null);

        var created = await managementService.CreateMaterialAsync(request, personId, personName, ct);
        return StatusCode(StatusCodes.Status201Created, new { success = true, data = created });
    }

    [HttpPut("api/v1/lms/materials/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateMaterial(Guid id, [FromBody] UpdateLearningMaterialRequest request, CancellationToken ct)
    {
        var personId = actor.RequirePersonId();
        var personName = actor.Email ?? "Chuyên gia NacenTech";

        // Đọc trước để kiểm tra quyền chính chủ (chống IDOR)
        var existing = await db.Set<LearningMaterial>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, ct);
        if (existing is null) return NotFound(new { success = false, message = "Không tìm thấy học liệu" });

        var isOwner = existing.CreatedBy == personId;
        authGate.Require(new AuthorizationRequest(
            Action: Actions.LmsUpdate,
            PlatformRole: actor.PlatformRole,
            OrganizationRelation: isOwner ? "OWNER" : "NONE"),
            objectKind: LearningMaterial.SubjectKind,
            objectId: id);

        try
        {
            var updated = await managementService.UpdateMaterialAsync(id, request, personId, personName, IsAdmin, ct);
            return Ok(new { success = true, data = updated });
        }
        catch (RecordAlreadyModifiedException ex)
        {
            return StatusCode(StatusCodes.Status409Conflict, new { success = false, message = ex.Message });
        }
    }

    [HttpPost("api/v1/lms/materials/{id:guid}/unpublish")]
    [Authorize]
    public async Task<IActionResult> UnpublishMaterial(Guid id, [FromBody] UnpublishMaterialRequest request, CancellationToken ct)
    {
        var personId = actor.RequirePersonId();
        var personName = actor.Email ?? "Chuyên gia NacenTech";

        var existing = await db.Set<LearningMaterial>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, ct);
        if (existing is null) return NotFound(new { success = false, message = "Không tìm thấy học liệu" });

        var isOwner = existing.CreatedBy == personId;
        authGate.Require(new AuthorizationRequest(
            Action: Actions.LmsUnpublish,
            PlatformRole: actor.PlatformRole,
            OrganizationRelation: isOwner ? "OWNER" : "NONE"),
            objectKind: LearningMaterial.SubjectKind,
            objectId: id);

        await managementService.UnpublishMaterialAsync(id, request, personId, personName, IsAdmin, ct);
        return Ok(new { success = true, message = "Đã gỡ bài học khỏi Cổng công khai thành công" });
    }

    [HttpDelete("api/v1/lms/materials/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteMaterial(Guid id, CancellationToken ct)
    {
        var personId = actor.RequirePersonId();
        var personName = actor.Email ?? "Chuyên gia NacenTech";

        var existing = await db.Set<LearningMaterial>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, ct);
        if (existing is null) return NotFound(new { success = false, message = "Không tìm thấy học liệu" });

        var isOwner = existing.CreatedBy == personId;
        authGate.Require(new AuthorizationRequest(
            Action: Actions.LmsDelete,
            PlatformRole: actor.PlatformRole,
            OrganizationRelation: isOwner ? "OWNER" : "NONE"),
            objectKind: LearningMaterial.SubjectKind,
            objectId: id);

        await managementService.DeleteMaterialAsync(id, personId, personName, IsAdmin, ct);
        return Ok(new { success = true, message = "Đã xóa mềm học liệu thành công" });
    }

    // ─── MEDIA UPLOAD SERVICE (1GB LIMIT & MIME VALIDATION) ───────────────────────

    [HttpPost("api/v1/lms/media/upload")]
    [Authorize]
    [RequestSizeLimit(1_073_741_824)] // 1GB
    [RequestFormLimits(MultipartBodyLengthLimit = 1_073_741_824)]
    public async Task<IActionResult> UploadMedia(
        [FromForm] IFormFile file,
        [FromForm] string? category,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { success = false, message = "Tệp không được để trống" });

        var isVideo = string.Equals(category, "VIDEO", StringComparison.OrdinalIgnoreCase) ||
                      Path.GetExtension(file.FileName).Equals(".mp4", StringComparison.OrdinalIgnoreCase);

        var result = isVideo
            ? await mediaService.UploadVideoAsync(file, ct)
            : await mediaService.UploadAttachmentAsync(file, category ?? LmsAttachmentCategories.PracticeTool, ct);

        return Ok(new { success = true, data = result });
    }

    // ─── TRA CỨU CHUYÊN GIA (EXPERT LOOKUP - APPROVED & PUBLIC ONLY) ─────────────

    public sealed record InstructorLookupItemDto(
        Guid ExpertProfileId,
        string FullName,
        string TitleDegree,
        string OrganizationName,
        string? AvatarUrl,
        string ExpertCode);

    [HttpGet("api/v1/lms/instructors/lookup")]
    [Authorize]
    public async Task<IActionResult> LookupInstructors([FromQuery] string? q, CancellationToken ct)
    {
        // SQL thuần truy vấn bảng brokerage.expert_profiles với bộ lọc bảo vệ PDPD bắt buộc
        var sql = """
            SELECT
                id AS "ExpertProfileId",
                full_name AS "FullName",
                COALESCE(academic_rank, degree, 'Chuyên gia') AS "TitleDegree",
                organization_name AS "OrganizationName",
                public_avatar_url AS "AvatarUrl",
                expert_code AS "ExpertCode"
            FROM brokerage.expert_profiles
            WHERE status = 'APPROVED'
              AND visibility_status = 'PUBLIC'
              AND is_deleted = false
            """;

        var experts = await db.Database.SqlQueryRaw<InstructorLookupItemDto>(sql).ToListAsync(ct);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var search = q.Trim().ToLower();
            experts = experts.Where(e =>
                e.FullName.ToLower().Contains(search) ||
                e.ExpertCode.ToLower().Contains(search) ||
                e.OrganizationName.ToLower().Contains(search)).ToList();
        }

        return Ok(new
        {
            success = true,
            data = experts.Take(20).ToList()
        });
    }
}
