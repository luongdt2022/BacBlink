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
    public string Source { get; set; } = "DIRECT_B2B";
    public string? AssignedByDepartment { get; set; }
    public Guid? RequesterPersonId { get; set; }
    public string? ExpertCode { get; set; }
    public string? ExpertName { get; set; }
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
    public DateTimeOffset? ScheduledAt { get; set; }
    public string? MeetingDate { get; set; }
    public string? MeetingTime { get; set; }
    public string? MeetingType { get; set; }
    public string? MeetingLink { get; set; }
    public string? MeetingUrl { get; set; }
    public bool CanJoinMeeting { get; set; }
    public string? MeetingCountdownText { get; set; }
    public List<PreReadMaterialDto>? PreReadMaterials { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? MoaDocumentUrl { get; set; }
    public string? MoaDocumentName { get; set; }
    public string? ExpertNote { get; set; }
    public string? RejectionReason { get; set; }
    public string? RejectionNote { get; set; }
    public int? Rating { get; set; }
    public string? ReviewComment { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
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
    public DateTimeOffset? ScheduledAt { get; set; }
    public string? MeetingDate { get; set; }
    public string? MeetingTime { get; set; }
    public string? MeetingType { get; set; }
    public string? MeetingLink { get; set; }
    public string? MeetingUrl { get; set; }
    public string? ExpertNote { get; set; }
    public string? RejectionReasonCategory { get; set; }
    public string? RejectionReason { get; set; }
    public string? RejectionNote { get; set; }
}

public sealed class BuyerConsultationTicketDto
{
    public string Id { get; set; } = string.Empty;
    public string TicketCode { get; set; } = string.Empty;
    public string? ExpertCode { get; set; }
    public string? ExpertName { get; set; }
    public string DemandTitle { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "PENDING";
    public DateTimeOffset? ScheduledAt { get; set; }
    public string? MeetingDate { get; set; }
    public string? MeetingTime { get; set; }
    public string? MeetingType { get; set; }
    public string? MeetingLink { get; set; }
    public string? MeetingUrl { get; set; }
    public string? ExpertNote { get; set; }
    public string? RejectionReason { get; set; }
    public int? Rating { get; set; }
    public string? ReviewComment { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset RequestedAt { get; set; }
}

public sealed class ReviewConsultationRequestDto
{
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? ReviewComment { get; set; }
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
public sealed class ExpertController(
    IExpertService experts,
    IApprovalService approvals,
    IAuditWriter audit,
    ITaxonomyService taxonomy,
    DbContext db,
    INotificationService? notifications = null) : V1ControllerBase
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
    [HttpGet("/api/v1/portal/expert/consultations")]
    [Authorize]
    public async Task<IActionResult> GetMyConsultations([FromQuery] string? status = null, CancellationToken ct = default)
    {
        if (Actor.PlatformRole != PlatformRoles.VerifiedExpert && !string.Equals(Actor.PlatformRole, "EXPERT", StringComparison.OrdinalIgnoreCase))
            throw new ForbiddenException("Verified expert or expert access required");

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        await ConsultationRules.EnsureConsultationsSchemaAsync(conn, ct);

        using var cmd = conn.CreateCommand();
        var sql = @"
            SELECT id, ticket_code, source, assigned_by_department, enterprise_name,
                   demand_title, contact_person, contact_phone, contact_email,
                   enterprise_tni_score, description, location, duration,
                   requested_at, expires_at, sla_deadline_hours, remaining_hours,
                   status, meeting_date, meeting_time, meeting_type, meeting_url,
                   can_join_meeting, meeting_countdown_text, pre_read_materials,
                   completed_at, moa_document_url, moa_document_name,
                   enterprise_rating, enterprise_review, expert_evaluation,
                   advisory_fee_vnd, fee_payer, disbursement_status, disbursement_amount_vnd,
                   requester_person_id, expert_code, expert_name, scheduled_at, meeting_link,
                   rejection_reason, rejection_note, expert_note, rating, review_comment, reviewed_at
            FROM brokerage.expert_consultations
            WHERE person_id = @personId";

        var p = cmd.CreateParameter();
        p.ParameterName = "@personId";
        p.Value = PersonId;
        cmd.Parameters.Add(p);

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            sql += " AND UPPER(status) = @statusFilter";
            var pStatusFilter = cmd.CreateParameter();
            pStatusFilter.ParameterName = "@statusFilter";
            pStatusFilter.Value = status.Trim().ToUpperInvariant();
            cmd.Parameters.Add(pStatusFilter);
        }

        sql += " ORDER BY requested_at DESC;";
        cmd.CommandText = sql;

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
            var rawPhone = reader.IsDBNull(7) ? null : reader.GetString(7);
            var rawEmail = reader.IsDBNull(8) ? null : reader.GetString(8);
            var currentStatus = reader.GetString(17);

            // BR-CON-005: Ngưỡng mở khóa PII theo PDPD (mask khi PENDING/REJECTED, mở khóa khi SCHEDULED/COMPLETED)
            var maskedOrFullPhone = ConsultationRules.MaskPhone(rawPhone, currentStatus);
            var maskedOrFullEmail = ConsultationRules.MaskEmail(rawEmail, currentStatus);

            var legacyMeetingUrl = reader.IsDBNull(21) ? null : reader.GetString(21);
            var meetingLink = reader.IsDBNull(39) ? legacyMeetingUrl : reader.GetString(39);
            var rejectionNote = reader.IsDBNull(41) ? null : reader.GetString(41);
            var rejectionReason = reader.IsDBNull(40) ? rejectionNote : reader.GetString(40);
            var legacyRating = reader.IsDBNull(28) ? (int?)null : reader.GetInt32(28);
            var rating = reader.IsDBNull(43) ? legacyRating : reader.GetInt16(43);
            var legacyReview = reader.IsDBNull(29) ? null : reader.GetString(29);
            var reviewComment = reader.IsDBNull(44) ? legacyReview : reader.GetString(44);

            list.Add(new ConsultationTicketDto
            {
                Id = ticketCode,
                TicketCode = ticketCode,
                Source = reader.GetString(2),
                AssignedByDepartment = reader.IsDBNull(3) ? null : reader.GetString(3),
                EnterpriseName = reader.GetString(4),
                DemandTitle = demandTitle,
                Title = demandTitle,
                ContactPerson = contactPerson,
                ContactPhone = maskedOrFullPhone,
                ContactEmail = maskedOrFullEmail,
                EnterpriseContactName = contactPerson,
                EnterpriseContactPhoneMasked = maskedOrFullPhone,
                EnterpriseTniScore = reader.IsDBNull(9) ? 80m : reader.GetDecimal(9),
                Description = reader.IsDBNull(10) ? null : reader.GetString(10),
                Location = reader.IsDBNull(11) ? null : reader.GetString(11),
                Duration = reader.IsDBNull(12) ? null : reader.GetString(12),
                RequestedAt = reader.IsDBNull(13) ? DateTimeOffset.UtcNow : new DateTimeOffset(reader.GetDateTime(13)),
                CreatedAt = reader.IsDBNull(13) ? null : new DateTimeOffset(reader.GetDateTime(13)),
                ExpiresAt = reader.IsDBNull(14) ? null : new DateTimeOffset(reader.GetDateTime(14)),
                SlaDeadlineHours = reader.IsDBNull(15) ? 48 : reader.GetInt32(15),
                RemainingHours = reader.IsDBNull(16) ? 48 : reader.GetInt32(16),
                Status = currentStatus,
                ScheduledAt = reader.IsDBNull(38) ? null : new DateTimeOffset(reader.GetDateTime(38)),
                MeetingDate = reader.IsDBNull(18) ? null : reader.GetString(18),
                MeetingTime = reader.IsDBNull(19) ? null : reader.GetString(19),
                MeetingType = reader.IsDBNull(20) ? null : reader.GetString(20),
                MeetingLink = meetingLink,
                MeetingUrl = meetingLink,
                CanJoinMeeting = !reader.IsDBNull(22) && reader.GetBoolean(22),
                MeetingCountdownText = reader.IsDBNull(23) ? null : reader.GetString(23),
                PreReadMaterials = materials,
                CompletedAt = reader.IsDBNull(25) ? null : new DateTimeOffset(reader.GetDateTime(25)),
                MoaDocumentUrl = reader.IsDBNull(26) ? null : reader.GetString(26),
                MoaDocumentName = reader.IsDBNull(27) ? null : reader.GetString(27),
                ExpertNote = reader.IsDBNull(42) ? null : reader.GetString(42),
                RejectionReason = rejectionReason,
                RejectionNote = rejectionReason,
                Rating = rating,
                ReviewComment = reviewComment,
                ReviewedAt = reader.IsDBNull(45) ? null : new DateTimeOffset(reader.GetDateTime(45)),
                EnterpriseRating = rating,
                EnterpriseReview = reviewComment,
                ExpertEvaluation = reader.IsDBNull(30) ? null : reader.GetString(30),
                AdvisoryFeeVnd = reader.IsDBNull(31) ? 0m : reader.GetDecimal(31),
                FeePayer = reader.IsDBNull(32) ? null : reader.GetString(32),
                DisbursementStatus = reader.IsDBNull(33) ? "NONE" : reader.GetString(33),
                DisbursementAmountVnd = reader.IsDBNull(34) ? 0m : reader.GetDecimal(34),
                RequesterPersonId = reader.IsDBNull(35) ? null : reader.GetGuid(35),
                ExpertCode = reader.IsDBNull(36) ? null : reader.GetString(36),
                ExpertName = reader.IsDBNull(37) ? null : reader.GetString(37),
            });
        }

        Audit("EXPERT_CONSULTATIONS_READ", PersonId.ToString("N"), "OWNER");
        return Ok(Ok200(list));
    }

    [HttpPost("me/consultations/{id}/respond")]
    [HttpPatch("/api/v1/portal/expert/consultations/{id}")]
    [Authorize]
    public async Task<IActionResult> RespondConsultation(string id, [FromBody] RespondConsultationRequestDto req, CancellationToken ct)
    {
        if (Actor.PlatformRole != PlatformRoles.VerifiedExpert && !string.Equals(Actor.PlatformRole, "EXPERT", StringComparison.OrdinalIgnoreCase))
            throw new ForbiddenException("Verified expert or expert access required");

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        await ConsultationRules.EnsureConsultationsSchemaAsync(conn, ct);

        Guid dbId;
        Guid ownerPersonId;
        Guid? requesterPersonId;
        string foundTicketCode;
        string currentStatus;
        string? expertCode;
        string? expertName;
        string demandTitle;

        using (var cmdFind = conn.CreateCommand())
        {
            cmdFind.CommandText = @"
                SELECT id, person_id, requester_person_id, ticket_code, status, expert_code, expert_name, demand_title
                FROM brokerage.expert_consultations
                WHERE id::text = @id OR ticket_code = @id
                LIMIT 1;";
            var pFindId = cmdFind.CreateParameter();
            pFindId.ParameterName = "@id";
            pFindId.Value = id;
            cmdFind.Parameters.Add(pFindId);

            using var reader = await cmdFind.ExecuteReaderAsync(ct);
            if (!await reader.ReadAsync(ct))
                throw new NotFoundException("Không tìm thấy phiếu yêu cầu tư vấn.", "CONSULTATION_NOT_FOUND");

            dbId = reader.GetGuid(0);
            ownerPersonId = reader.GetGuid(1);
            requesterPersonId = reader.IsDBNull(2) ? null : reader.GetGuid(2);
            foundTicketCode = reader.GetString(3);
            currentStatus = reader.GetString(4);
            expertCode = reader.IsDBNull(5) ? null : reader.GetString(5);
            expertName = reader.IsDBNull(6) ? null : reader.GetString(6);
            demandTitle = reader.GetString(7);
        }

        // BR-CON-004: Kiểm tra ownership chuyên gia
        ConsultationRules.EnsureExpertOwnership(ownerPersonId, PersonId);

        var rejectionReason = !string.IsNullOrWhiteSpace(req.RejectionReason)
            ? req.RejectionReason.Trim()
            : req.RejectionNote?.Trim();
        var meetingLink = !string.IsNullOrWhiteSpace(req.MeetingLink)
            ? req.MeetingLink.Trim()
            : req.MeetingUrl?.Trim();
        var scheduledAt = req.ScheduledAt;
        if (scheduledAt is null && !string.IsNullOrWhiteSpace(req.MeetingDate) && DateTimeOffset.TryParse(req.MeetingDate, out var parsedDate))
        {
            scheduledAt = parsedDate;
        }

        // State Machine + BR-CON-002 (REJECT >= 10 ký tự)
        var targetStatus = ConsultationRules.ResolveTransition(currentStatus, req.Action, rejectionReason);

        using (var cmdUpdate = conn.CreateCommand())
        {
            cmdUpdate.CommandText = @"
                UPDATE brokerage.expert_consultations
                SET status = @status,
                    scheduled_at = COALESCE(@scheduledAt, scheduled_at),
                    meeting_date = COALESCE(@meetingDate, meeting_date),
                    meeting_time = COALESCE(@meetingTime, meeting_time),
                    meeting_type = COALESCE(@meetingType, meeting_type),
                    meeting_link = COALESCE(@meetingLink, meeting_link),
                    meeting_url = COALESCE(@meetingLink, meeting_url),
                    expert_note = COALESCE(@expertNote, expert_note),
                    rejection_reason_category = COALESCE(@rejCategory, rejection_reason_category),
                    rejection_reason = COALESCE(@rejReason, rejection_reason),
                    rejection_note = COALESCE(@rejReason, rejection_note),
                    completed_at = CASE WHEN @status = 'COMPLETED' THEN COALESCE(completed_at, now()) ELSE completed_at END,
                    updated_at = now()
                WHERE id = @dbId AND person_id = @personId;";

            void AddParam(string name, object? val)
            {
                var prm = cmdUpdate.CreateParameter();
                prm.ParameterName = name;
                prm.Value = val ?? DBNull.Value;
                cmdUpdate.Parameters.Add(prm);
            }

            AddParam("@status", targetStatus);
            AddParam("@scheduledAt", scheduledAt?.UtcDateTime);
            AddParam("@meetingDate", req.MeetingDate?.Trim());
            AddParam("@meetingTime", req.MeetingTime?.Trim());
            AddParam("@meetingType", req.MeetingType?.Trim());
            AddParam("@meetingLink", meetingLink);
            AddParam("@expertNote", req.ExpertNote?.Trim());
            AddParam("@rejCategory", req.RejectionReasonCategory?.Trim());
            AddParam("@rejReason", rejectionReason);
            AddParam("@dbId", dbId);
            AddParam("@personId", PersonId);

            await cmdUpdate.ExecuteNonQueryAsync(ct);
        }

        var notifSvc = notifications ?? HttpContext?.RequestServices.GetService<INotificationService>();
        if (notifSvc is not null)
        {
            var notifType = targetStatus == ConsultationRules.Statuses.Completed
                ? NotificationTypes.ExpertConsultationCompleted
                : NotificationTypes.ExpertConsultationResponded;

            var payload = new
            {
                ConsultationId = dbId,
                TicketCode = foundTicketCode,
                Status = targetStatus,
                ExpertCode = expertCode,
                ExpertName = expertName,
                DemandTitle = demandTitle,
                ScheduledAt = scheduledAt,
                MeetingLink = meetingLink,
                RejectionReason = rejectionReason,
                UpdatedAtUtc = DateTimeOffset.UtcNow
            };

            if (requesterPersonId is { } buyerPid && buyerPid != PersonId)
            {
                await notifSvc.CreateAsync(buyerPid, notifType, payload, ct);
            }

            var adminIds = await db.Set<Person>().AsNoTracking()
                .Where(x => x.IsActive && (x.PlatformRole == PlatformRoles.Admin || x.PlatformRole == PlatformRoles.OperatorAdmin || x.PlatformRole == PlatformRoles.SuperAdmin))
                .Select(x => x.Id)
                .ToListAsync(ct);

            foreach (var adminId in adminIds.Distinct().Where(aid => aid != PersonId && aid != requesterPersonId))
            {
                await notifSvc.CreateAsync(adminId, notifType, payload, ct);
            }
        }

        var normalizedAction = req.Action.Trim().ToUpperInvariant();
        Audit("EXPERT_CONSULTATION_RESPOND", foundTicketCode, normalizedAction);

        var responseMessage = targetStatus switch
        {
            ConsultationRules.Statuses.Scheduled => "Đã đồng ý tiếp nhận tư vấn và thiết lập lịch hẹn thành công.",
            ConsultationRules.Statuses.Rejected => "Đã từ chối yêu cầu tư vấn.",
            ConsultationRules.Statuses.Completed => "Đã đánh dấu hoàn thành buổi tư vấn.",
            _ => "Đã cập nhật trạng thái tư vấn."
        };

        return Ok(Ok200(new
        {
            id = foundTicketCode,
            consultationId = dbId.ToString(),
            ticketCode = foundTicketCode,
            status = targetStatus,
            scheduledAt,
            meetingLink,
            rejectionReason,
            message = responseMessage
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

        var expertRow = await db.Set<ExpertProfile>().AsNoTracking()
            .Where(x => x.ExpertCode == expertCode)
            .Select(x => new { x.PersonId, x.ExpertCode, x.FullName })
            .FirstOrDefaultAsync(ct);

        if (expertRow is null || expertRow.PersonId is null)
            return NotFound(new { success = false, message = "Không tìm thấy hồ sơ chuyên gia hoặc chuyên gia chưa liên kết tài khoản." });

        var expertPersonId = expertRow.PersonId.Value;
        var actor = HttpContext?.RequestServices.GetService<ICurrentActor>();
        Guid? requesterPersonId = actor is { IsAuthenticated: true, PersonId: { } pid } ? pid : null;

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        await ConsultationRules.EnsureConsultationsSchemaAsync(conn, ct);

        var trimmedMessage = request.Message.Trim();
        var demandTitle = trimmedMessage.Length > 480 ? $"{trimmedMessage[..477]}..." : trimmedMessage;
        var enterpriseName = string.IsNullOrWhiteSpace(request.OrganizationName)
            ? request.ContactName.Trim()
            : request.OrganizationName.Trim();

        var consultationId = Guid.NewGuid();
        var ticketCode = string.Empty;
        var inserted = false;

        for (var attempt = 0; attempt < 5 && !inserted; attempt++)
        {
            ticketCode = ConsultationRules.GenerateTicketCode();
            try
            {
                using var cmd = conn.CreateCommand();
                cmd.CommandText = @"
                    INSERT INTO brokerage.expert_consultations (
                        id, person_id, requester_person_id, expert_code, expert_name,
                        ticket_code, source, enterprise_name, demand_title, description,
                        contact_person, contact_phone, contact_email,
                        requested_at, sla_deadline_hours, expires_at, remaining_hours,
                        status, created_at, updated_at
                    ) VALUES (
                        @id, @personId, @requesterPersonId, @expertCode, @expertName,
                        @ticketCode, 'DIRECT_B2B', @enterpriseName, @demandTitle, @description,
                        @contactPerson, @contactPhone, @contactEmail,
                        now(), 48, now() + interval '48 hours', 48,
                        'PENDING', now(), now()
                    );";

                void AddParam(string name, object? val)
                {
                    var prm = cmd.CreateParameter();
                    prm.ParameterName = name;
                    prm.Value = val ?? DBNull.Value;
                    cmd.Parameters.Add(prm);
                }

                AddParam("@id", consultationId);
                AddParam("@personId", expertPersonId);
                AddParam("@requesterPersonId", requesterPersonId);
                AddParam("@expertCode", expertRow.ExpertCode);
                AddParam("@expertName", expertRow.FullName);
                AddParam("@ticketCode", ticketCode);
                AddParam("@enterpriseName", enterpriseName);
                AddParam("@demandTitle", demandTitle);
                AddParam("@description", trimmedMessage);
                AddParam("@contactPerson", request.ContactName.Trim());
                AddParam("@contactPhone", request.Phone?.Trim());
                AddParam("@contactEmail", request.Email?.Trim());

                await cmd.ExecuteNonQueryAsync(ct);
                inserted = true;
            }
            catch (DbException ex) when (ex.SqlState == "23505" && attempt < 4)
            {
                // Retry with a newly generated ticket_code if unique index uq_expert_consultations_ticket_code collides
                consultationId = Guid.NewGuid();
            }
        }

        var notifPayload = new
        {
            ConsultationId = consultationId,
            TicketCode = ticketCode,
            Status = ConsultationRules.Statuses.Pending,
            expertRow.ExpertCode,
            ExpertName = expertRow.FullName,
            ContactName = request.ContactName.Trim(),
            request.OrganizationName,
            request.Email,
            request.Phone,
            Message = trimmedMessage,
            RequesterPersonId = requesterPersonId,
            RequestedAtUtc = DateTimeOffset.UtcNow
        };

        await notifications.CreateAsync(expertPersonId, NotificationTypes.ExpertConsultationRequestReceived, notifPayload, ct);

        var adminRecipients = await db.Set<Person>().AsNoTracking()
            .Where(x => x.IsActive && (x.PlatformRole == PlatformRoles.Admin || x.PlatformRole == PlatformRoles.OperatorAdmin || x.PlatformRole == PlatformRoles.SuperAdmin))
            .Select(x => x.Id)
            .ToListAsync(ct);

        foreach (var recipient in adminRecipients.Distinct().Where(id => id != expertPersonId))
        {
            await notifications.CreateAsync(recipient, NotificationTypes.ExpertConsultationRequestReceived, notifPayload, ct);
        }

        return StatusCode(201, new
        {
            success = true,
            ticketCode,
            status = ConsultationRules.Statuses.Pending,
            message = $"Yêu cầu tư vấn đã được ghi nhận với mã phiếu {ticketCode}.",
            data = new
            {
                id = consultationId.ToString(),
                ticketCode,
                status = ConsultationRules.Statuses.Pending,
                expertCode = expertRow.ExpertCode,
                expertName = expertRow.FullName
            }
        });
    }
}

[ApiController]
[Route("api/v1/portal/buyer/consultations")]
[Authorize]
public sealed class PortalBuyerConsultationController(DbContext db, INotificationService? notifications = null) : V1ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> ListMyRequests(CancellationToken ct)
    {
        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        await ConsultationRules.EnsureConsultationsSchemaAsync(conn, ct);

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT id, ticket_code, expert_code, expert_name, demand_title, description,
                   status, scheduled_at, meeting_date, meeting_time, meeting_type,
                   COALESCE(meeting_link, meeting_url) AS meeting_link,
                   expert_note, COALESCE(rejection_reason, rejection_note) AS rejection_reason,
                   COALESCE(rating, enterprise_rating) AS rating,
                   COALESCE(review_comment, enterprise_review) AS review_comment,
                   reviewed_at, completed_at, requested_at
            FROM brokerage.expert_consultations
            WHERE requester_person_id = @personId
            ORDER BY requested_at DESC;";

        var p = cmd.CreateParameter();
        p.ParameterName = "@personId";
        p.Value = PersonId;
        cmd.Parameters.Add(p);

        var list = new List<BuyerConsultationTicketDto>();
        using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            var meetingLink = reader.IsDBNull(11) ? null : reader.GetString(11);
            list.Add(new BuyerConsultationTicketDto
            {
                Id = reader.GetGuid(0).ToString(),
                TicketCode = reader.GetString(1),
                ExpertCode = reader.IsDBNull(2) ? null : reader.GetString(2),
                ExpertName = reader.IsDBNull(3) ? null : reader.GetString(3),
                DemandTitle = reader.GetString(4),
                Description = reader.IsDBNull(5) ? null : reader.GetString(5),
                Status = reader.GetString(6),
                ScheduledAt = reader.IsDBNull(7) ? null : new DateTimeOffset(reader.GetDateTime(7)),
                MeetingDate = reader.IsDBNull(8) ? null : reader.GetString(8),
                MeetingTime = reader.IsDBNull(9) ? null : reader.GetString(9),
                MeetingType = reader.IsDBNull(10) ? null : reader.GetString(10),
                MeetingLink = meetingLink,
                MeetingUrl = meetingLink,
                ExpertNote = reader.IsDBNull(12) ? null : reader.GetString(12),
                RejectionReason = reader.IsDBNull(13) ? null : reader.GetString(13),
                Rating = reader.IsDBNull(14) ? null : Convert.ToInt32(reader.GetValue(14)),
                ReviewComment = reader.IsDBNull(15) ? null : reader.GetString(15),
                ReviewedAt = reader.IsDBNull(16) ? null : new DateTimeOffset(reader.GetDateTime(16)),
                CompletedAt = reader.IsDBNull(17) ? null : new DateTimeOffset(reader.GetDateTime(17)),
                RequestedAt = reader.IsDBNull(18) ? DateTimeOffset.UtcNow : new DateTimeOffset(reader.GetDateTime(18))
            });
        }

        return Ok(Ok200(list));
    }

    [HttpPost("{id}/review")]
    public async Task<IActionResult> ReviewConsultation(string id, [FromBody] ReviewConsultationRequestDto req, CancellationToken ct)
    {
        ConsultationRules.ValidateReviewInput(req.Rating);
        var comment = !string.IsNullOrWhiteSpace(req.Comment) ? req.Comment.Trim() : req.ReviewComment?.Trim();

        var conn = db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

        await ConsultationRules.EnsureConsultationsSchemaAsync(conn, ct);

        Guid? updatedId = null;
        string? ticketCode = null;
        Guid? expertPersonId = null;
        string? expertCode = null;
        string? expertName = null;
        DateTimeOffset? reviewedAt = null;

        using (var cmdUpdate = conn.CreateCommand())
        {
            cmdUpdate.CommandText = @"
                UPDATE brokerage.expert_consultations
                SET rating = @rating,
                    enterprise_rating = @rating,
                    review_comment = @comment,
                    enterprise_review = @comment,
                    reviewed_at = now(),
                    updated_at = now()
                WHERE (id::text = @id OR ticket_code = @id)
                  AND requester_person_id = @personId
                  AND status = 'COMPLETED'
                  AND reviewed_at IS NULL
                RETURNING id, ticket_code, person_id, expert_code, expert_name, reviewed_at;";

            void AddParam(string name, object? val)
            {
                var prm = cmdUpdate.CreateParameter();
                prm.ParameterName = name;
                prm.Value = val ?? DBNull.Value;
                cmdUpdate.Parameters.Add(prm);
            }

            AddParam("@rating", (short)req.Rating);
            AddParam("@comment", comment);
            AddParam("@id", id);
            AddParam("@personId", PersonId);

            using var reader = await cmdUpdate.ExecuteReaderAsync(ct);
            if (await reader.ReadAsync(ct))
            {
                updatedId = reader.GetGuid(0);
                ticketCode = reader.GetString(1);
                expertPersonId = reader.GetGuid(2);
                expertCode = reader.IsDBNull(3) ? null : reader.GetString(3);
                expertName = reader.IsDBNull(4) ? null : reader.GetString(4);
                reviewedAt = reader.IsDBNull(5) ? DateTimeOffset.UtcNow : new DateTimeOffset(reader.GetDateTime(5));
            }
        }

        if (updatedId is null)
        {
            using var cmdCheck = conn.CreateCommand();
            cmdCheck.CommandText = @"
                SELECT requester_person_id, status, reviewed_at
                FROM brokerage.expert_consultations
                WHERE id::text = @id OR ticket_code = @id
                LIMIT 1;";
            var pId = cmdCheck.CreateParameter();
            pId.ParameterName = "@id";
            pId.Value = id;
            cmdCheck.Parameters.Add(pId);

            using var reader = await cmdCheck.ExecuteReaderAsync(ct);
            if (!await reader.ReadAsync(ct))
                throw ConsultationRules.ResolveReviewZeroRowsError(false, null, PersonId, null, null);

            var existingRequester = reader.IsDBNull(0) ? (Guid?)null : reader.GetGuid(0);
            var existingStatus = reader.GetString(1);
            var existingReviewedAt = reader.IsDBNull(2) ? (DateTimeOffset?)null : new DateTimeOffset(reader.GetDateTime(2));
            throw ConsultationRules.ResolveReviewZeroRowsError(true, existingRequester, PersonId, existingStatus, existingReviewedAt);
        }

        var notifSvc = notifications ?? HttpContext?.RequestServices.GetService<INotificationService>();
        if (notifSvc is not null && expertPersonId is { } expPid && expPid != PersonId)
        {
            await notifSvc.CreateAsync(expPid, NotificationTypes.ExpertConsultationReviewed, new
            {
                ConsultationId = updatedId.Value,
                TicketCode = ticketCode,
                ExpertCode = expertCode,
                ExpertName = expertName,
                Rating = req.Rating,
                ReviewComment = comment,
                ReviewedAtUtc = reviewedAt
            }, ct);
        }

        return Ok(Ok200(new
        {
            id = updatedId.Value.ToString(),
            ticketCode,
            rating = req.Rating,
            reviewComment = comment,
            reviewedAt,
            message = "Cảm ơn bạn đã gửi đánh giá buổi tư vấn."
        }));
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
