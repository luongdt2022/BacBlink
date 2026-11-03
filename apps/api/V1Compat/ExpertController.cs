using System.Data;
using System.Data.Common;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Communication.Application;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Brokerage.Domain;
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

public sealed class PreReadMaterialDto
{
    public string Name { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

public sealed class ConsultationTicketDto
{
    public string Id { get; set; } = string.Empty;
    public string TicketCode { get; set; } = string.Empty;
    public string Source { get; set; } = "DEPT_ASSIGNED";
    public string? AssignedByDepartment { get; set; }
    public string EnterpriseName { get; set; } = string.Empty;
    public string DemandTitle { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? EnterpriseContactName { get; set; }
    public string? EnterpriseContactPhoneMasked { get; set; }
    public decimal EnterpriseTniScore { get; set; } = 80;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? Duration { get; set; }
    public DateTimeOffset RequestedAt { get; set; }
    public DateTimeOffset? CreatedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public int SlaDeadlineHours { get; set; }
    public int RemainingHours { get; set; }
    public string Status { get; set; } = "PENDING";
    public string? MeetingDate { get; set; }
    public string? MeetingTime { get; set; }
    public string? MeetingType { get; set; }
    public string? MeetingUrl { get; set; }
    public bool CanJoinMeeting { get; set; }
    public string? MeetingCountdownText { get; set; }
    public List<PreReadMaterialDto>? PreReadMaterials { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? MoaDocumentUrl { get; set; }
    public string? MoaDocumentName { get; set; }
    public int? EnterpriseRating { get; set; }
    public string? EnterpriseReview { get; set; }
    public string? ExpertEvaluation { get; set; }
    public decimal AdvisoryFeeVnd { get; set; }
    public string? FeePayer { get; set; }
    public string DisbursementStatus { get; set; } = "NONE";
    public decimal DisbursementAmountVnd { get; set; }
}

public sealed class RespondConsultationRequestDto
{
    public string Action { get; set; } = "ACCEPT";
    public string? MeetingDate { get; set; }
    public string? MeetingTime { get; set; }
    public string? MeetingType { get; set; }
    public string? MeetingUrl { get; set; }
    public string? ExpertNote { get; set; }
    public string? RejectionReasonCategory { get; set; }
    public string? RejectionNote { get; set; }
}

public sealed class ExpertProjectDto
{
    public string Id { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Stage { get; set; } = "INTAKE_NDA";
    public string SecurityStatus { get; set; } = "CHỜ KÝ NDA";
    public string PartnerOrgName { get; set; } = string.Empty;
    public string SectorCode { get; set; } = string.Empty;
    public string SectorName { get; set; } = string.Empty;
    public int CurrentTrl { get; set; } = 1;
    public string CurrentTrlLabel { get; set; } = string.Empty;
    public int TargetTrl { get; set; } = 5;
    public string TargetTrlLabel { get; set; } = string.Empty;
    public decimal EstimatedValueVnd { get; set; }
    public string DeadlineSlaText { get; set; } = string.Empty;
    public string DealRoomUrl { get; set; } = string.Empty;
}

[Route("api/v1/experts")]
public sealed class ExpertController(IExpertService experts, IApprovalService approvals, IAuditWriter audit, ITaxonomyService taxonomy, DbContext db) : V1ControllerBase
{
    [HttpPost("upgrade-request")]
    [Authorize]
    public async Task<IActionResult> SubmitUpgrade([FromBody] SubmitExpertUpgradeRequest request, CancellationToken ct)
    {
        await ValidateSectorsAsync(request.ExpertiseSectors ?? [], ct);
        var strategy = db.Database.CreateExecutionStrategy();
        var result = await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await db.Database.BeginTransactionAsync(ct);
            var res = await experts.SubmitUpgradeAsync(PersonId, request, ct);

            // Phân cấp Cấp 2: Tự động đưa hồ sơ vào hàng đợi thẩm định phân cấp của Sở/TW (Basic Design v2.6 & FR-ADM-007)
            var scopeType = string.IsNullOrWhiteSpace(request.ScopeType) ? ScopeTypes.Province : request.ScopeType.Trim().ToUpperInvariant();
            var scopeId = string.IsNullOrWhiteSpace(request.ScopeId) ? "HP" : request.ScopeId.Trim();
            await approvals.SubmitRequestAsync(
                new SubmitApprovalRequestCommand(
                    PersonId,
                    ApprovalRequestTypes.Expert,
                    scopeType,
                    scopeId,
                    System.Text.Json.JsonSerializer.Serialize(res)),
                ct);

            await transaction.CommitAsync(ct);
            return res;
        });

        return StatusCode(201, Ok200(result));
    }

    [HttpGet("draft")]
    [AllowAnonymous]
    [EnableRateLimiting("expert-draft")]
    public async Task<IActionResult> GetDraft([FromQuery] string? token, CancellationToken ct)
    {
        Response.Headers.CacheControl = "no-store";
        Response.Headers.Pragma = "no-cache";
        Response.Headers["Referrer-Policy"] = "no-referrer";
        var draft = await experts.GetDraftAsync(token ?? string.Empty, ct);
        var sector = (await taxonomy.ListAsync(TaxonomyKinds.Sector, false, ct)).FirstOrDefault(item => item.Code == draft.SectorCode);
        return Ok(Ok200(draft with { SectorName = sector?.Name, SectorIsActive = sector?.IsActive }));
    }

    [HttpGet("my-profile")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct)
    {
        var result = await experts.GetMyProfileAsync(PersonId, ct);
        return result is null ? NotFound() : Ok(Ok200(result));
    }

    [HttpPut("my-profile")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateExpertProfileRequest request, CancellationToken ct)
    {
        if (Actor.PlatformRole != PlatformRoles.VerifiedExpert)
            throw new ForbiddenException("Verified expert access required");

        if (request.ExpertiseSectors is { Count: > 0 } sectors)
            await ValidateSectorsAsync(sectors, ct);

        var result = await experts.UpdateMyProfileAsync(PersonId, request, ct);
        Audit("EXPERT_PROFILE_UPDATE", result.Id.ToString("N"), "OWNER");
        return Ok(Ok200(result));
    }

    [HttpGet("me/completeness")]
    [Authorize]
    public async Task<IActionResult> GetMyCompleteness(CancellationToken ct)
    {
        if (Actor.PlatformRole != PlatformRoles.VerifiedExpert)
            throw new ForbiddenException("Verified expert access required");

        var result = await experts.GetMyCompletenessAsync(PersonId, ct);
        return Ok(Ok200(result));
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

    [HttpGet("me/documents")]
    [Authorize]
    public async Task<IActionResult> GetMyDocuments(CancellationToken ct)
    {
        var result = await experts.GetMyDocumentsAsync(PersonId, ct);
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

    [HttpGet("me/consultations")]
    [Authorize]
    public async Task<IActionResult> GetMyConsultations(CancellationToken ct)
    {
        if (Actor.PlatformRole != PlatformRoles.VerifiedExpert && !string.Equals(Actor.PlatformRole, "EXPERT", StringComparison.OrdinalIgnoreCase))
            throw new ForbiddenException("Verified expert or expert access required");

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        await EnsureConsultationsTableAndSeedAsync(conn, PersonId, ct);

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, ticket_code, source, assigned_by_department, enterprise_name,
                   demand_title, contact_person, contact_phone, contact_email,
                   enterprise_tni_score, description, location, duration,
                   requested_at, expires_at, sla_deadline_hours, remaining_hours,
                   status, meeting_date, meeting_time, meeting_type, meeting_url,
                   can_join_meeting, meeting_countdown_text, pre_read_materials,
                   completed_at, moa_document_url, moa_document_name,
                   enterprise_rating, enterprise_review, expert_evaluation,
                   advisory_fee_vnd, fee_payer, disbursement_status, disbursement_amount_vnd
            FROM brokerage.expert_consultations
            WHERE person_id = @personId
            ORDER BY requested_at DESC;";

        var p = cmd.CreateParameter();
        p.ParameterName = "@personId";
        p.Value = PersonId;
        cmd.Parameters.Add(p);

        var list = new List<ConsultationTicketDto>();
        using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            var rawMaterials = reader.IsDBNull(24) ? null : reader.GetString(24);
            List<PreReadMaterialDto>? materials = null;
            if (!string.IsNullOrWhiteSpace(rawMaterials))
            {
                try { materials = JsonSerializer.Deserialize<List<PreReadMaterialDto>>(rawMaterials); } catch { }
            }

            var ticketCode = reader.GetString(1);
            var demandTitle = reader.GetString(5);
            var contactPerson = reader.IsDBNull(6) ? null : reader.GetString(6);
            var contactPhone = reader.IsDBNull(7) ? null : reader.GetString(7);

            list.Add(new ConsultationTicketDto
            {
                Id = ticketCode, // Map directly to ticket code so frontend identifies REQ-CON-XXXX
                TicketCode = ticketCode,
                Source = reader.GetString(2),
                AssignedByDepartment = reader.IsDBNull(3) ? null : reader.GetString(3),
                EnterpriseName = reader.GetString(4),
                DemandTitle = demandTitle,
                Title = demandTitle,
                ContactPerson = contactPerson,
                ContactPhone = contactPhone,
                ContactEmail = reader.IsDBNull(8) ? null : reader.GetString(8),
                EnterpriseContactName = contactPerson,
                EnterpriseContactPhoneMasked = contactPhone,
                EnterpriseTniScore = reader.IsDBNull(9) ? 80m : reader.GetDecimal(9),
                Description = reader.IsDBNull(10) ? null : reader.GetString(10),
                Location = reader.IsDBNull(11) ? null : reader.GetString(11),
                Duration = reader.IsDBNull(12) ? null : reader.GetString(12),
                RequestedAt = reader.IsDBNull(13) ? DateTimeOffset.UtcNow : new DateTimeOffset(reader.GetDateTime(13)),
                CreatedAt = reader.IsDBNull(13) ? null : new DateTimeOffset(reader.GetDateTime(13)),
                ExpiresAt = reader.IsDBNull(14) ? null : new DateTimeOffset(reader.GetDateTime(14)),
                SlaDeadlineHours = reader.IsDBNull(15) ? 48 : reader.GetInt32(15),
                RemainingHours = reader.IsDBNull(16) ? 48 : reader.GetInt32(16),
                Status = reader.GetString(17),
                MeetingDate = reader.IsDBNull(18) ? null : reader.GetString(18),
                MeetingTime = reader.IsDBNull(19) ? null : reader.GetString(19),
                MeetingType = reader.IsDBNull(20) ? null : reader.GetString(20),
                MeetingUrl = reader.IsDBNull(21) ? null : reader.GetString(21),
                CanJoinMeeting = !reader.IsDBNull(22) && reader.GetBoolean(22),
                MeetingCountdownText = reader.IsDBNull(23) ? null : reader.GetString(23),
                PreReadMaterials = materials,
                CompletedAt = reader.IsDBNull(25) ? null : new DateTimeOffset(reader.GetDateTime(25)),
                MoaDocumentUrl = reader.IsDBNull(26) ? null : reader.GetString(26),
                MoaDocumentName = reader.IsDBNull(27) ? null : reader.GetString(27),
                EnterpriseRating = reader.IsDBNull(28) ? null : reader.GetInt32(28),
                EnterpriseReview = reader.IsDBNull(29) ? null : reader.GetString(29),
                ExpertEvaluation = reader.IsDBNull(30) ? null : reader.GetString(30),
                AdvisoryFeeVnd = reader.IsDBNull(31) ? 0m : reader.GetDecimal(31),
                FeePayer = reader.IsDBNull(32) ? null : reader.GetString(32),
                DisbursementStatus = reader.IsDBNull(33) ? "NONE" : reader.GetString(33),
                DisbursementAmountVnd = reader.IsDBNull(34) ? 0m : reader.GetDecimal(34),
            });
        }

        Audit("EXPERT_CONSULTATIONS_READ", PersonId.ToString("N"), "OWNER");
        return Ok(Ok200(list));
    }

    [HttpPost("me/consultations/{id}/respond")]
    [Authorize]
    public async Task<IActionResult> RespondConsultation(string id, [FromBody] RespondConsultationRequestDto req, CancellationToken ct)
    {
        if (Actor.PlatformRole != PlatformRoles.VerifiedExpert && !string.Equals(Actor.PlatformRole, "EXPERT", StringComparison.OrdinalIgnoreCase))
            throw new ForbiddenException("Verified expert or expert access required");

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        await EnsureConsultationsTableAndSeedAsync(conn, PersonId, ct);

        var isAccept = req.Action.Equals("ACCEPT", StringComparison.OrdinalIgnoreCase);
        var targetStatus = isAccept ? "SCHEDULED" : "REJECTED";

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            UPDATE brokerage.expert_consultations
            SET status = @status,
                meeting_date = COALESCE(@meetingDate, meeting_date),
                meeting_time = COALESCE(@meetingTime, meeting_time),
                meeting_type = COALESCE(@meetingType, meeting_type),
                meeting_url = COALESCE(@meetingUrl, meeting_url),
                expert_note = COALESCE(@expertNote, expert_note),
                rejection_reason_category = COALESCE(@rejCategory, rejection_reason_category),
                rejection_note = COALESCE(@rejNote, rejection_note),
                updated_at = now()
            WHERE (id::text = @id OR ticket_code = @id) AND person_id = @personId
            RETURNING id, ticket_code, status;";

        var pStatus = cmd.CreateParameter();
        pStatus.ParameterName = "@status";
        pStatus.Value = targetStatus;
        cmd.Parameters.Add(pStatus);

        var pDate = cmd.CreateParameter();
        pDate.ParameterName = "@meetingDate";
        pDate.Value = (object?)req.MeetingDate ?? DBNull.Value;
        cmd.Parameters.Add(pDate);

        var pTime = cmd.CreateParameter();
        pTime.ParameterName = "@meetingTime";
        pTime.Value = (object?)req.MeetingTime ?? DBNull.Value;
        cmd.Parameters.Add(pTime);

        var pType = cmd.CreateParameter();
        pType.ParameterName = "@meetingType";
        pType.Value = (object?)req.MeetingType ?? DBNull.Value;
        cmd.Parameters.Add(pType);

        var pUrl = cmd.CreateParameter();
        pUrl.ParameterName = "@meetingUrl";
        pUrl.Value = (object?)req.MeetingUrl ?? DBNull.Value;
        cmd.Parameters.Add(pUrl);

        var pNote = cmd.CreateParameter();
        pNote.ParameterName = "@expertNote";
        pNote.Value = (object?)req.ExpertNote ?? DBNull.Value;
        cmd.Parameters.Add(pNote);

        var pRejCat = cmd.CreateParameter();
        pRejCat.ParameterName = "@rejCategory";
        pRejCat.Value = (object?)req.RejectionReasonCategory ?? DBNull.Value;
        cmd.Parameters.Add(pRejCat);

        var pRejNote = cmd.CreateParameter();
        pRejNote.ParameterName = "@rejNote";
        pRejNote.Value = (object?)req.RejectionNote ?? DBNull.Value;
        cmd.Parameters.Add(pRejNote);

        var pId = cmd.CreateParameter();
        pId.ParameterName = "@id";
        pId.Value = id;
        cmd.Parameters.Add(pId);

        var pPerson = cmd.CreateParameter();
        pPerson.ParameterName = "@personId";
        pPerson.Value = PersonId;
        cmd.Parameters.Add(pPerson);

        string? foundTicketCode = null;
        using (var reader = await cmd.ExecuteReaderAsync(ct))
        {
            if (await reader.ReadAsync(ct))
            {
                foundTicketCode = reader.GetString(1);
            }
        }

        Audit("EXPERT_CONSULTATION_RESPOND", id, isAccept ? "ACCEPT" : "REJECT");

        return Ok(Ok200(new
        {
            id,
            status = targetStatus,
            message = isAccept ? "Đã đồng ý tiếp nhận tư vấn và thiết lập lịch hẹn thành công." : "Đã từ chối lời mời tư vấn."
        }));
    }

    [HttpGet("me/projects")]
    [Authorize]
    public async Task<IActionResult> GetMyProjects([FromQuery] string? sector, [FromQuery] string? search, CancellationToken ct)
    {
        if (Actor.PlatformRole != PlatformRoles.VerifiedExpert && !string.Equals(Actor.PlatformRole, "EXPERT", StringComparison.OrdinalIgnoreCase))
            throw new ForbiddenException("Verified expert or expert access required");

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        await EnsureProjectsTableAndSeedAsync(conn, PersonId, ct);

        using var cmd = conn.CreateCommand();
        var sql = @"
            SELECT id, project_code, title, stage, security_status, partner_org_name,
                   sector_code, sector_name, current_trl, current_trl_label, target_trl,
                   target_trl_label, estimated_value_vnd, deadline_sla_text, deal_room_url
            FROM brokerage.expert_projects
            WHERE person_id = @personId";

        var pPerson = cmd.CreateParameter();
        pPerson.ParameterName = "@personId";
        pPerson.Value = PersonId;
        cmd.Parameters.Add(pPerson);

        if (!string.IsNullOrWhiteSpace(sector) && !sector.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            sql += " AND sector_code = @sector";
            var pSector = cmd.CreateParameter();
            pSector.ParameterName = "@sector";
            pSector.Value = sector;
            cmd.Parameters.Add(pSector);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND (LOWER(title) LIKE @search OR LOWER(project_code) LIKE @search OR LOWER(partner_org_name) LIKE @search)";
            var pSearch = cmd.CreateParameter();
            pSearch.ParameterName = "@search";
            pSearch.Value = $"%{search.Trim().ToLowerInvariant()}%";
            cmd.Parameters.Add(pSearch);
        }

        sql += " ORDER BY created_at ASC;";
        cmd.CommandText = sql;

        var list = new List<ExpertProjectDto>();
        using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            list.Add(new ExpertProjectDto
            {
                Id = reader.GetGuid(0).ToString(),
                ProjectCode = reader.GetString(1),
                Title = reader.GetString(2),
                Stage = reader.GetString(3),
                SecurityStatus = reader.GetString(4),
                PartnerOrgName = reader.GetString(5),
                SectorCode = reader.GetString(6),
                SectorName = reader.GetString(7),
                CurrentTrl = reader.GetInt32(8),
                CurrentTrlLabel = reader.IsDBNull(9) ? "" : reader.GetString(9),
                TargetTrl = reader.GetInt32(10),
                TargetTrlLabel = reader.IsDBNull(11) ? "" : reader.GetString(11),
                EstimatedValueVnd = reader.GetDecimal(12),
                DeadlineSlaText = reader.IsDBNull(13) ? "" : reader.GetString(13),
                DealRoomUrl = reader.IsDBNull(14) ? "" : reader.GetString(14)
            });
        }

        Audit("EXPERT_PROJECTS_READ", PersonId.ToString("N"), "OWNER");
        return Ok(Ok200(list));
    }

    private static async Task EnsureConsultationsTableAndSeedAsync(DbConnection conn, Guid personId, CancellationToken ct)
    {
        using var cmdCreate = conn.CreateCommand();
        cmdCreate.CommandText = @"
            CREATE SCHEMA IF NOT EXISTS brokerage;
            CREATE TABLE IF NOT EXISTS brokerage.expert_consultations (
                id UUID PRIMARY KEY,
                person_id UUID NOT NULL,
                ticket_code VARCHAR(100) NOT NULL,
                source VARCHAR(50) NOT NULL,
                assigned_by_department VARCHAR(255),
                enterprise_name VARCHAR(255) NOT NULL,
                demand_title VARCHAR(500) NOT NULL,
                contact_person VARCHAR(255),
                contact_phone VARCHAR(50),
                contact_email VARCHAR(255),
                requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                sla_deadline_hours INT NOT NULL DEFAULT 48,
                status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                meeting_date VARCHAR(50),
                meeting_time VARCHAR(100),
                meeting_type VARCHAR(100),
                meeting_url VARCHAR(500),
                advisory_fee_vnd NUMERIC(18, 2) DEFAULT 0,
                fee_payer VARCHAR(255),
                disbursement_status VARCHAR(50) DEFAULT 'NONE',
                disbursement_amount_vnd NUMERIC(18, 2) DEFAULT 0,
                enterprise_tni_score NUMERIC(5, 2) DEFAULT 80,
                description TEXT,
                location VARCHAR(255),
                duration VARCHAR(100),
                expires_at TIMESTAMPTZ,
                remaining_hours INT DEFAULT 48,
                can_join_meeting BOOLEAN DEFAULT false,
                meeting_countdown_text VARCHAR(255),
                pre_read_materials TEXT,
                completed_at TIMESTAMPTZ,
                moa_document_url VARCHAR(500),
                moa_document_name VARCHAR(255),
                enterprise_rating INT,
                enterprise_review TEXT,
                expert_evaluation TEXT,
                expert_note TEXT,
                rejection_reason_category VARCHAR(255),
                rejection_note TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );";
        await cmdCreate.ExecuteNonQueryAsync(ct);

        using var cmdCount = conn.CreateCommand();
        cmdCount.CommandText = "SELECT COUNT(*) FROM brokerage.expert_consultations WHERE person_id = @personId;";
        var p = cmdCount.CreateParameter();
        p.ParameterName = "@personId";
        p.Value = personId;
        cmdCount.Parameters.Add(p);
        var count = Convert.ToInt64(await cmdCount.ExecuteScalarAsync(ct));

        if (count == 0)
        {
            using var cmdSeed = conn.CreateCommand();
            cmdSeed.CommandText = @"
                INSERT INTO brokerage.expert_consultations (
                    id, person_id, ticket_code, source, assigned_by_department, enterprise_name,
                    demand_title, contact_person, contact_phone, contact_email, requested_at,
                    sla_deadline_hours, status, meeting_date, meeting_time, meeting_type, meeting_url,
                    advisory_fee_vnd, fee_payer, disbursement_status, disbursement_amount_vnd,
                    enterprise_tni_score, description, location, duration, expires_at, remaining_hours,
                    can_join_meeting, meeting_countdown_text, pre_read_materials, completed_at,
                    moa_document_url, moa_document_name, enterprise_rating, enterprise_review,
                    expert_evaluation, created_at, updated_at
                ) VALUES 
                (
                    'b0000000-0000-0000-0000-000000000081', @personId, 'REQ-CON-2026-081', 'DEPT_ASSIGNED', 'Sở KH&CN Hà Nội', 'Công ty CP Dược Phẩm Trung Ương MediTech',
                    'Tư Vấn Thẩm Định Công Nghệ Nâng Cấp Dây Chuyền Chiết Rót Tự Động Hóa Chuẩn GMP', 'Trần Anh Tuấn (GĐ Kỹ thuật)', '0912****89 (Đã bảo vệ PDPD)', 'tuan.ta@meditech.vn', now() - interval '30 hours',
                    18, 'PENDING', NULL, NULL, NULL, NULL,
                    15000000, 'Quỹ ĐMST Hà Nội chi trả', 'NONE', 0,
                    86.4, 'Doanh nghiệp đang chuẩn bị đấu thầu gói mua sắm dây chuyền chiết rót 4.000 chai/h, cần chuyên gia tư vấn độc lập đánh giá thông số kỹ thuật của 03 nhà thầu, kiểm tra sự tương thích với hệ thống bồn chứa hiện hữu và lập báo cáo thẩm định kỹ thuật.', 'Khảo sát tại Nhà máy Hòa Lạc, Hà Nội', '02 buổi làm việc', now() + interval '18 hours', 18,
                    false, NULL, NULL, NULL,
                    NULL, NULL, NULL, NULL,
                    NULL, now() - interval '30 hours', now() - interval '30 hours'
                ),
                (
                    'b0000000-0000-0000-0000-000000000079', @personId, 'REQ-CON-2026-079', 'DIRECT_B2B', NULL, 'HTX Nông Nghiệp Công Nghệ Cao An Phú (Lâm Đồng)',
                    'Tư Vấn Thiết Kế Hệ Thống Cánh Tay Robot Phân Loại Nông Sản Cho HTX Nông Nghiệp', 'Lê Văn Hùng (Chủ tịch HTX)', '0983****12 (Đã bảo vệ PDPD)', 'hung.lv@anphu.vn', now() - interval '12 hours',
                    36, 'PENDING', NULL, NULL, NULL, NULL,
                    5000000, 'Doanh nghiệp tự chi trả', 'NONE', 0,
                    72.8, 'HTX cần chuyên gia xem xét bản vẽ mặt bằng nhà xưởng sơ bộ và tư vấn có nên đầu tư robot Delta phân loại nấm hay dùng băng chuyền cơ học thông thường.', 'Trực tuyến qua Zoom', '01 buổi làm việc (2 giờ)', now() + interval '36 hours', 36,
                    false, NULL, NULL, NULL,
                    NULL, NULL, NULL, NULL,
                    NULL, now() - interval '12 hours', now() - interval '12 hours'
                ),
                (
                    'b0000000-0000-0000-0000-000000000075', @personId, 'REQ-CON-2026-075', 'DEPT_ASSIGNED', 'Sở KH&CN TP. Hồ Chí Minh', 'Công ty TNHH Nhựa Sinh Học GreenPack',
                    'Tư Vấn Kiểm Nghiệm Độ Phân Hủy Sinh Học Bao Bì Nông Nghiệp TRL 5', 'Nguyễn Thị Mai (TP R&D)', '0903****65 (Đã bảo vệ PDPD)', 'mai.nt@greenpack.vn', now() - interval '4 hours',
                    44, 'PENDING', NULL, NULL, NULL, NULL,
                    12000000, 'Quỹ ĐMST TP.HCM chi trả', 'NONE', 0,
                    81.2, 'Tư vấn giải pháp thử nghiệm gia tốc môi trường đất cho màng phủ sinh học sản xuất từ tinh bột sắn biến tính.', 'Trực tiếp tại Lab', '01 ngày làm việc', now() + interval '44 hours', 44,
                    false, NULL, NULL, NULL,
                    NULL, NULL, NULL, NULL,
                    NULL, now() - interval '4 hours', now() - interval '4 hours'
                ),
                (
                    'b0000000-0000-0000-0000-000000000068', @personId, 'REQ-CON-2026-068', 'DEPT_ASSIGNED', 'Sở KH&CN Hải Phòng', 'Công ty CP Robot Rạng Đông',
                    'Họp Thẩm Định Sơ Bộ Với Công Ty CP Robot Rạng Đông', 'Phạm Văn Đông', '0977****33', 'dong.pv@rangdong.vn', now() - interval '3 days',
                    0, 'SCHEDULED', '2026-10-18', '09:00 - 11:30', 'Trực tuyến qua Zoom', 'https://zoom.us/j/883492019',
                    20000000, 'Quỹ ĐMST Hải Phòng chi trả', 'AUDITING', 0,
                    88.0, 'Đánh giá tính khả thi ứng dụng thị giác máy tính vào dây chuyền đóng gói linh kiện điện tử.', 'Trực tuyến qua Zoom', '2.5 giờ', now() + interval '2 days', 0,
                    false, 'Sẽ mở trước giờ họp 15 phút', '[{""name"":""Ban_ve_mat_bang_nha_xuong_kho_van.pdf"",""size"":""4.2 MB"",""url"":""#""}]', NULL,
                    NULL, NULL, NULL, NULL,
                    NULL, now() - interval '3 days', now() - interval '1 day'
                ),
                (
                    'b0000000-0000-0000-0000-000000000051', @personId, 'REQ-CON-2026-051', 'DEPT_ASSIGNED', 'Sở KH&CN Hà Nội', 'Công ty CP Công Nghệ Sinh Học BioTech HN',
                    'Tư Vấn Thẩm Định Dây Chuyền Lên Men Vi Sinh TRL 7', 'Hoàng Văn Nam', '0911****88', 'nam.hv@biotech.vn', now() - interval '10 days',
                    0, 'COMPLETED', '2026-10-10', '14:00 - 16:30', 'Trực tiếp tại Nhà máy', NULL,
                    18000000, 'Quỹ ĐMST Hà Nội chi trả', 'DISBURSED', 18000000,
                    90.5, 'Tư vấn tối ưu hóa điều kiện lên men và kiểm soát nồng độ oxy hòa tan cho hệ thống bioreactor 500L.', 'Nhà máy BioTech HN', '01 buổi làm việc', now() - interval '5 days', 0,
                    false, NULL, NULL, now() - interval '5 days',
                    '/documents/moa-2026-051.pdf', 'Bien_ban_nghiem_thu_tu_van_MoA_BioTech.pdf', 5, 'Chuyên gia tư vấn rất sâu sắc, giải quyết triệt để vấn đề nhiễm khuẩn chéo.',
                    'Doanh nghiệp có cơ sở vật chất tốt, đội ngũ kỹ sư tiếp thu nhanh.', now() - interval '10 days', now() - interval '5 days'
                );";
            var pSeed = cmdSeed.CreateParameter();
            pSeed.ParameterName = "@personId";
            pSeed.Value = personId;
            cmdSeed.Parameters.Add(pSeed);
            await cmdSeed.ExecuteNonQueryAsync(ct);
        }
    }

    private static async Task EnsureProjectsTableAndSeedAsync(DbConnection conn, Guid personId, CancellationToken ct)
    {
        using var cmdCreate = conn.CreateCommand();
        cmdCreate.CommandText = @"
            CREATE SCHEMA IF NOT EXISTS brokerage;
            CREATE TABLE IF NOT EXISTS brokerage.expert_projects (
                id UUID PRIMARY KEY,
                person_id UUID NOT NULL,
                project_code VARCHAR(100) NOT NULL,
                title VARCHAR(500) NOT NULL,
                stage VARCHAR(50) NOT NULL,
                security_status VARCHAR(50) NOT NULL,
                partner_org_name VARCHAR(255) NOT NULL,
                sector_code VARCHAR(50) NOT NULL,
                sector_name VARCHAR(255) NOT NULL,
                current_trl INT NOT NULL DEFAULT 1,
                current_trl_label VARCHAR(100),
                target_trl INT NOT NULL DEFAULT 5,
                target_trl_label VARCHAR(100),
                estimated_value_vnd NUMERIC(18, 2) NOT NULL DEFAULT 0,
                deadline_sla_text VARCHAR(100),
                deal_room_url VARCHAR(500),
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );";
        await cmdCreate.ExecuteNonQueryAsync(ct);

        using var cmdCount = conn.CreateCommand();
        cmdCount.CommandText = "SELECT COUNT(*) FROM brokerage.expert_projects WHERE person_id = @personId;";
        var p = cmdCount.CreateParameter();
        p.ParameterName = "@personId";
        p.Value = personId;
        cmdCount.Parameters.Add(p);
        var count = Convert.ToInt64(await cmdCount.ExecuteScalarAsync(ct));

        if (count == 0)
        {
            using var cmdSeed = conn.CreateCommand();
            cmdSeed.CommandText = @"
                INSERT INTO brokerage.expert_projects (
                    id, person_id, project_code, title, stage, security_status, partner_org_name,
                    sector_code, sector_name, current_trl, current_trl_label, target_trl, target_trl_label,
                    estimated_value_vnd, deadline_sla_text, deal_room_url, created_at, updated_at
                ) VALUES 
                (
                    'c0000000-0000-0000-0000-000000000001', @personId, 'PRJ-EXP-2026-042', 'Chuyển Giao Thuật Toán AI Giám Sát Mòn Dao Phay CNC Thời Gian Thực', 'DEAL_ROOM', 'NDA ĐÃ KÝ', 'Công ty TNHH Cơ Khí Chính Xác Hà Nội Precision',
                    '03', 'Cơ khí - Tự động hóa', 4, 'Lab Prototype', 6, 'Thử Nghiệm Xưởng',
                    450000000, 'Còn 03 ngày (17/10/2026)', '/portal/opportunities/proj-001/deal-room', now() - interval '5 days', now()
                ),
                (
                    'c0000000-0000-0000-0000-000000000002', @personId, 'PRJ-EXP-2026-049', 'Nâng Cấp Hệ Thống Robot Delta Phân Loại Nông Sản Tốc Độ Cao', 'INTAKE_NDA', 'CHỜ KÝ NDA', 'HTX Nông Nghiệp Công Nghệ Cao An Phú',
                    '01', 'Nông nghiệp công nghệ cao', 3, 'Proof-of-Concept', 5, 'Thực Nghiệm Thực Địa',
                    280000000, 'Còn 07 ngày (21/10/2026)', '/portal/opportunities/proj-002/deal-room', now() - interval '2 days', now()
                ),
                (
                    'c0000000-0000-0000-0000-000000000003', @personId, 'PRJ-EXP-2026-035', 'Quy Trình Tinh Chế Nano Curcumin Độ Tinh Khiết Cao 98%', 'TRL_ASSESSMENT', 'NDA ĐÃ KÝ', 'Công ty CP Dược Liệu Xanh Việt Nam',
                    '07', 'Y - Dược học', 5, 'Mô Hình Thử Nghiệm', 7, 'Thử Nghiệm Lâm Sàng',
                    850000000, 'Còn 14 ngày (28/10/2026)', '/portal/opportunities/proj-003/deal-room', now() - interval '10 days', now()
                ),
                (
                    'c0000000-0000-0000-0000-000000000004', @personId, 'PRJ-EXP-2026-028', 'Hệ Thống Quan Trắc Tự Động Độ Mặn Nguồn Nước Nuôi Tôm IoT', 'MOU_SIGNED', 'DỰ THẢO MOU', 'Hợp Tác Xã Thủy Sản Bạc Liêu EcoShrimp',
                    '05', 'Công nghệ thông tin', 6, 'Thử Nghiệm Xưởng', 8, 'Triển Khai Đại Trà',
                    620000000, 'MOU đã ký (Đang lập kế hoạch)', '/portal/opportunities/proj-004/deal-room', now() - interval '15 days', now()
                ),
                (
                    'c0000000-0000-0000-0000-000000000005', @personId, 'PRJ-EXP-2026-015', 'Dây Chuyền Đúc Áp Lực Hợp Kim Nhôm Cường Độ Cao Cho Xe Điện', 'TRANSFER_COMPLETED', 'ĐANG NGHIỆM THU', 'Tập Đoàn Công Nghiệp Phụ Trợ VinFast E-Mobility',
                    '03', 'Cơ khí - Tự động hóa', 8, 'Triển Khai Đại Trà', 9, 'Vận Hành Thương Mại',
                    1200000000, 'Hoàn tất nghiệm thu mốc TRL 9', '/portal/opportunities/proj-005/deal-room', now() - interval '30 days', now()
                );";
            var pSeed = cmdSeed.CreateParameter();
            pSeed.ParameterName = "@personId";
            pSeed.Value = personId;
            cmdSeed.Parameters.Add(pSeed);
            await cmdSeed.ExecuteNonQueryAsync(ct);
        }
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

    private async Task EnsureCanAccessExpertAsync(string expertCode, CancellationToken ct)
    {
        var isGlobalAdmin = Actor.PlatformRole is PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.Admin
            && Actor.ScopeType == ScopeTypes.Global && string.IsNullOrWhiteSpace(Actor.ScopeId);

        if (isGlobalAdmin) return;

        if (Actor.PlatformRole == PlatformRoles.ProvincialAdmin && Actor.ScopeType == ScopeTypes.Province && !string.IsNullOrWhiteSpace(Actor.ScopeId))
        {
            var expert = await db.Set<ExpertProfile>().AsNoTracking()
                .FirstOrDefaultAsync(x => x.ExpertCode == expertCode, ct);
            if (expert is null) throw new NotFoundException("Không tìm thấy hồ sơ chuyên gia.");

            string? expertProvince = null;
            if (expert.PersonId.HasValue)
            {
                expertProvince = await db.Set<Person>().AsNoTracking()
                    .Where(p => p.Id == expert.PersonId.Value)
                    .Select(p => p.ScopeId)
                    .FirstOrDefaultAsync(ct);
            }
            if (string.IsNullOrWhiteSpace(expertProvince))
            {
                expertProvince = await db.Set<ApprovalRequest>().AsNoTracking()
                    .Where(r => r.UserId == expert.PersonId && r.ScopeType == ScopeTypes.Province)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => r.ScopeId)
                    .FirstOrDefaultAsync(ct);
            }

            if (!string.Equals(Actor.ScopeId, expertProvince, StringComparison.OrdinalIgnoreCase))
            {
                throw new ForbiddenException("Cán bộ Sở không có quyền truy cập hồ sơ chuyên gia ngoài phạm vi quản lý địa bàn.");
            }
            return;
        }

        throw new ForbiddenException("Admin access required");
    }

    [HttpGet("/api/v1/admin/experts/{expertCode}/documents")]
    [Authorize]
    public async Task<IActionResult> GetAdminDocuments(string expertCode, CancellationToken ct)
    {
        await EnsureCanAccessExpertAsync(expertCode, ct);
        var result = await experts.GetAdminDocumentsAsync(expertCode, ct);
        return Ok(Ok200(result));
    }

    [HttpGet("/api/v1/admin/experts/{expertCode}/documents/{documentId:guid}/download")]
    [Authorize]
    public async Task<IActionResult> DownloadAdminDocument(string expertCode, Guid documentId, CancellationToken ct)
    {
        await EnsureCanAccessExpertAsync(expertCode, ct);
        var result = await experts.OpenAdminDocumentAsync(expertCode, documentId, ct);
        if (result is null) return NotFound();
        Audit("EXPERT_DOCUMENT_DOWNLOAD", documentId.ToString("N"), "ADMIN_REVIEW");
        return File(result.Content, result.ContentType, result.DownloadName);
    }

    [HttpPost("ai-cv-scan")]
    [Authorize]
    public IActionResult SimulateAiScan([FromBody] AiScanRequestDto dto)
        => StatusCode(501, new { success = false, code = "AI_CV_SCAN_UNAVAILABLE",
            message = "Cần nội dung tệp CV để phân tích. Dịch vụ này chưa hỗ trợ phân tích từ tên tệp." });

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
        [FromQuery(Name = "degrees")] string[]? degrees,
        [FromQuery] string? sectorCode,
        [FromQuery(Name = "sectorCodes")] string[]? sectorCodes,
        [FromQuery] string? provinceCode,
        [FromQuery(Name = "provinceCodes")] string[]? provinceCodes,
        [FromQuery] bool? acceptingConsultation,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 9,
        CancellationToken ct = default)
    {
        var searchTerm = string.IsNullOrWhiteSpace(q) ? query : q;
        var degreeList = ParseMultiValues(degrees, degree);
        var sectorList = ParseMultiValues(sectorCodes, sectorCode);
        var provinceList = ParseMultiValues(provinceCodes, provinceCode);

        var result = await experts.GetPublicDirectoryAsync(
            searchTerm,
            degreeList.Count > 0 ? degreeList : null,
            sectorList.Count > 0 ? sectorList : null,
            provinceList.Count > 0 ? string.Join(",", provinceList) : null,
            acceptingConsultation,
            page,
            pageSize,
            ct);

        return Ok(new { success = true, data = result });
    }

    private static List<string> ParseMultiValues(string[]? arrayParams, string? singleCsvParam)
    {
        var results = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (arrayParams != null)
        {
            foreach (var item in arrayParams)
            {
                if (string.IsNullOrWhiteSpace(item)) continue;
                foreach (var split in item.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                {
                    results.Add(split);
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(singleCsvParam))
        {
            foreach (var split in singleCsvParam.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                results.Add(split);
            }
        }

        return results.ToList();
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
