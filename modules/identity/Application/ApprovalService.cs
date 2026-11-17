using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Modules.Identity.Application;

public sealed class ApprovalService(
    DbContext db,
    IUnitOfWork uow,
    IClock clock,
    IExpertApprovalSynchronizer expertApproval,
    IEnterpriseApprovalSynchronizer enterpriseApproval) : IApprovalService
{
    public async Task<PagedResult<ApprovalRequestDto>> GetApprovalsAsync(ApprovalListFilter filter, ICurrentActor actor, CancellationToken ct)
    {
        RequireReviewer(actor);
        var query = db.Set<ApprovalRequest>().AsNoTracking();

        // BR-ADM-001: 3D Scoped Row-Level Security
        query = ApplyScopeFilter(query, actor);

        if (!string.IsNullOrWhiteSpace(filter.RequestType))
        {
            var reqType = filter.RequestType.Trim().ToUpperInvariant();
            query = query.Where(x => x.RequestType == reqType);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim().ToUpperInvariant();
            query = query.Where(x => x.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.ScopeType))
        {
            var st = filter.ScopeType.Trim().ToUpperInvariant();
            query = query.Where(x => x.ScopeType == st);
        }

        if (!string.IsNullOrWhiteSpace(filter.ScopeId))
        {
            var sid = filter.ScopeId.Trim();
            query = query.Where(x => x.ScopeId == sid);
        }

        var total = await query.CountAsync(ct);
        var page = filter.Page > 0 ? filter.Page : 1;
        var limit = filter.PageSize > 0 ? Math.Min(filter.PageSize, 100) : 20;

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync(ct);

        var userIds = items.Select(x => x.UserId).Distinct().ToList();
        var users = await db.Set<Person>().AsNoTracking()
            .Where(p => userIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, PersonMapper.ToDto, ct);

        var dtos = items.Select(x => ToDto(x, users.GetValueOrDefault(x.UserId))).ToList();
        return new PagedResult<ApprovalRequestDto>(dtos, total, page, limit);
    }

    public async Task<ApprovalRequestDto> GetByIdAsync(Guid id, ICurrentActor actor, CancellationToken ct)
    {
        var req = await db.Set<ApprovalRequest>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException($"Không tìm thấy hồ sơ thẩm định ID '{id}'.");

        ValidateActorScopeAccess(req, actor);

        var user = await db.Set<Person>().AsNoTracking().FirstOrDefaultAsync(p => p.Id == req.UserId, ct);
        return ToDto(req, user is null ? null : PersonMapper.ToDto(user));
    }

    public async Task<ApprovalRequestDto> SubmitRequestAsync(SubmitApprovalRequestCommand cmd, CancellationToken ct)
    {
        if (cmd.RequestType == ApprovalRequestTypes.Shop)
        {
            ValidateShopApprovalPayload(cmd.PayloadJson);
        }

        var slaDeadline = cmd.SlaDeadlineUtc ?? cmd.RequestType switch
        {
            ApprovalRequestTypes.Account => clock.UtcNow.AddHours(4),
            ApprovalRequestTypes.Shop => clock.UtcNow.AddHours(24),
            ApprovalRequestTypes.Demand => clock.UtcNow.AddHours(24),
            ApprovalRequestTypes.Expert => clock.UtcNow.AddHours(48),
            _ => clock.UtcNow.AddHours(48)
        };

        var request = new ApprovalRequest(
            cmd.UserId,
            cmd.RequestType,
            cmd.ScopeType,
            cmd.ScopeId,
            cmd.PayloadJson,
            slaDeadline);

        db.Set<ApprovalRequest>().Add(request);

        var auditLog = new ApprovalAuditLog(
            cmd.UserId,
            PlatformRoles.PublicUser,
            "SUBMIT_APPROVAL_REQUEST",
            "approval_requests",
            request.Id.ToString(),
            "127.0.0.1",
            $"{{\"requestType\":\"{cmd.RequestType}\",\"scopeType\":\"{cmd.ScopeType}\",\"scopeId\":\"{cmd.ScopeId}\"}}");

        db.Set<ApprovalAuditLog>().Add(auditLog);

        await uow.CommitAsync(ct);
        return ToDto(request, null);
    }

    public async Task<ApprovalRequestDto> ReviewRequestAsync(
        Guid id,
        ReviewApprovalRequestCommand cmd,
        ICurrentActor actor,
        string ipAddress,
        CancellationToken ct)
    {
        var request = await db.Set<ApprovalRequest>().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException($"Không tìm thấy hồ sơ thẩm định ID '{id}'.");

        // BR-ADM-001: 3D Scoped Row-Level Security
        ValidateActorScopeAccess(request, actor);

        var actorId = actor.PersonId ?? Guid.Empty;
        var actorRole = PlatformRoles.NormalizeTier(actor.PlatformRole);
        var normalizedAction = cmd.Action.Trim().ToUpperInvariant();

        switch (normalizedAction)
        {
            case "APPROVE":
                request.Approve(actorId, cmd.ExpectedVersion, cmd.ReviewNote);
                await ApplyApprovalSideEffectsAsync(request, ct);
                break;

            case "REJECT":
                if (string.IsNullOrWhiteSpace(cmd.ReviewNote))
                    throw new ValidationException("Lý do từ chối (ReviewNote) là bắt buộc.");
                request.Reject(actorId, cmd.ExpectedVersion, cmd.ReviewNote);
                break;

            case "REQUEST_CHANGES":
                if (string.IsNullOrWhiteSpace(cmd.ReviewNote))
                    throw new ValidationException("Lý do yêu cầu bổ sung là bắt buộc.");
                request.RequestChanges(actorId, cmd.ExpectedVersion, cmd.ReviewNote);
                break;

            case "FORWARD":
                request.ForwardToApproval(actorId, cmd.ExpectedVersion, cmd.ReviewNote);
                break;

            case "REVOKE":
            case "REVOKE_EXPERT":
                if (!PlatformRoles.IsAdministrative(actor.PlatformRole))
                {
                    throw new ForbiddenException("Chỉ Quản trị viên (ADMIN) mới có thẩm quyền thu hồi hồ sơ đã duyệt.", "ERR_FORBIDDEN_REVOKE");
                }
                if (string.IsNullOrWhiteSpace(cmd.ReviewNote) || cmd.ReviewNote.Trim().Length < 10)
                {
                    throw new ValidationException("Lý do thu hồi (ReviewNote) là bắt buộc và phải có ít nhất 10 ký tự theo BR-ADM-007.");
                }
                request.Reject(actorId, cmd.ExpectedVersion, $"[THU HỒI QUẢN TRỊ]: {cmd.ReviewNote.Trim()}");
                await RevokeApprovalSideEffectsAsync(request, ct);
                break;

            default:
                throw new ValidationException($"Hành động kiểm duyệt '{cmd.Action}' không hợp lệ.");
        }

        if (request.RequestType == ApprovalRequestTypes.Expert && normalizedAction != "FORWARD")
            await expertApproval.ApplyAsync(request.UserId, request.PayloadJson, normalizedAction, cmd.ReviewNote, ct);

        if (request.RequestType is ApprovalRequestTypes.Institution or ApprovalRequestTypes.Shop && normalizedAction != "FORWARD")
            await enterpriseApproval.ApplyAsync(request.UserId, request.ScopeId, request.PayloadJson, normalizedAction, cmd.ReviewNote, ct);

        // BR-ADM-003: Immutable Audit Trail
        var audit = new ApprovalAuditLog(
            actorId,
            actorRole,
            $"REVIEW_{normalizedAction}",
            "approval_requests",
            request.Id.ToString(),
            ipAddress,
            System.Text.Json.JsonSerializer.Serialize(new { action = normalizedAction, note = cmd.ReviewNote, version = request.Version }));

        db.Set<ApprovalAuditLog>().Add(audit);

        await uow.CommitAsync(ct);

        var user = await db.Set<Person>().AsNoTracking().FirstOrDefaultAsync(p => p.Id == request.UserId, ct);
        return ToDto(request, user is null ? null : PersonMapper.ToDto(user));
    }

    public async Task<IReadOnlyList<ApprovalAuditLogDto>> GetAuditLogsAsync(string targetEntity, string targetId, CancellationToken ct)
    {
        var logs = await db.Set<ApprovalAuditLog>().AsNoTracking()
            .Where(x => x.TargetEntity == targetEntity && x.TargetId == targetId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(ct);

        return logs.Select(x => new ApprovalAuditLogDto(
            x.Id,
            x.ActorId,
            x.ActorRole,
            x.Action,
            x.TargetEntity,
            x.TargetId,
            x.IpAddress,
            x.DetailsJson,
            x.CreatedAtUtc)).ToList();
    }

    public async Task<IReadOnlyList<GlobalAuditLogItemDto>> GetGlobalAuditLogsAsync(int limit, CancellationToken ct)
    {
        var safeLimit = Math.Clamp(limit, 1, 500);
        var logs = await db.Set<ApprovalAuditLog>().AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(safeLimit)
            .ToListAsync(ct);

        if (logs.Count == 0)
        {
            return Array.Empty<GlobalAuditLogItemDto>();
        }

        var actorIds = logs.Select(x => x.ActorId).Distinct().ToArray();
        var actors = await db.Set<Person>().AsNoTracking()
            .Where(p => actorIds.Contains(p.Id))
            .Select(p => new { p.Id, p.FirstName, p.LastName, p.Email, p.ScopeId })
            .ToDictionaryAsync(p => p.Id, ct);

        return logs.Select(x =>
        {
            actors.TryGetValue(x.ActorId, out var actor);
            var fullName = actor is null
                ? "Hệ thống"
                : string.Join(" ", new[] { actor.FirstName, actor.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
            if (string.IsNullOrWhiteSpace(fullName))
            {
                fullName = actor?.Email ?? "Quản trị viên";
            }

            var reason = string.Empty;
            var targetTitle = $"{x.TargetEntity} ({x.TargetId})";
            if (!string.IsNullOrWhiteSpace(x.DetailsJson))
            {
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(x.DetailsJson);
                    var root = doc.RootElement;
                    if (root.TryGetProperty("overrideReason", out var r1) && r1.ValueKind == System.Text.Json.JsonValueKind.String)
                        reason = r1.GetString() ?? "";
                    else if (root.TryGetProperty("reviewNote", out var r2) && r2.ValueKind == System.Text.Json.JsonValueKind.String)
                        reason = r2.GetString() ?? "";
                    else if (root.TryGetProperty("note", out var r3) && r3.ValueKind == System.Text.Json.JsonValueKind.String)
                        reason = r3.GetString() ?? "";

                    if (root.TryGetProperty("title", out var t1) && t1.ValueKind == System.Text.Json.JsonValueKind.String)
                        targetTitle = t1.GetString() ?? targetTitle;
                    else if (root.TryGetProperty("email", out var t2) && t2.ValueKind == System.Text.Json.JsonValueKind.String)
                        targetTitle = t2.GetString() ?? targetTitle;
                }
                catch
                {
                    // Ignore non-JSON details
                }
            }

            return new GlobalAuditLogItemDto(
                x.Id,
                x.CreatedAtUtc,
                fullName,
                x.ActorRole,
                actor?.ScopeId ?? "GLOBAL",
                x.Action,
                targetTitle,
                x.TargetEntity,
                string.IsNullOrWhiteSpace(reason) ? "Thao tác quản trị hệ thống" : reason,
                x.IpAddress);
        }).ToList();
    }

    public async Task<PagedResult<CentralApprovalItemDto>> GetCentralApprovalQueueAsync(ApprovalQueueQueryFilter filter, ICurrentActor actor, CancellationToken ct)
    {
        if (actor.PersonId is null || !PlatformRoles.IsAdministrative(actor.PlatformRole))
        {
            throw new ForbiddenException("Chỉ Quản trị viên (ADMIN) mới có quyền truy cập Hàng đợi Phê duyệt.", "ERR_FORBIDDEN_GLOBAL_ACCESS");
        }

        var query = db.Set<ApprovalRequest>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.ProvinceId) && filter.ProvinceId != "ALL")
        {
            var prov = filter.ProvinceId.Trim().ToUpperInvariant();
            query = query.Where(x => x.ScopeId == prov);
        }

        if (!string.IsNullOrWhiteSpace(filter.RequestType) && filter.RequestType != "ALL")
        {
            var reqType = filter.RequestType.Trim().ToUpperInvariant();
            query = query.Where(x => x.RequestType == reqType);
        }

        if (!string.IsNullOrWhiteSpace(filter.SlaStatus) && filter.SlaStatus != "ALL")
        {
            var sla = filter.SlaStatus.Trim().ToUpperInvariant();
            var now = clock.UtcNow;
            query = sla switch
            {
                "BREACHED" => query.Where(x => x.IsSlaBreached),
                "WARNING" => query.Where(x => !x.IsSlaBreached && x.SlaDeadlineUtc <= now.AddHours(12)),
                "NORMAL" => query.Where(x => !x.IsSlaBreached && x.SlaDeadlineUtc > now.AddHours(12)),
                _ => query
            };
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim();
            query = query.Where(x => x.PayloadJson.Contains(term) || (x.ScopeId != null && x.ScopeId.Contains(term)));
        }

        var total = await query.CountAsync(ct);
        var page = filter.Page > 0 ? filter.Page : 1;
        var limit = filter.PageSize > 0 ? Math.Min(filter.PageSize, 100) : 20;

        var items = await query
            .OrderByDescending(x => x.IsSlaBreached)
            .ThenByDescending(x => x.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync(ct);

        var userIds = items.Select(x => x.UserId).Distinct().ToList();
        var users = await db.Set<Person>().AsNoTracking()
            .Where(p => userIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => $"{p.FirstName} {p.LastName}".Trim(), ct);

        var dtos = items.Select(x => new CentralApprovalItemDto(
            x.Id,
            x.UserId,
            users.TryGetValue(x.UserId, out var name) && !string.IsNullOrWhiteSpace(name) ? name : "N/A",
            x.RequestType,
            x.ScopeType,
            x.ScopeId,
            ResolveProvinceName(x.ScopeId),
            x.Status,
            x.Version,
            x.IsSlaBreached,
            x.SlaOverdueHours,
            x.IsOverride,
            x.OverrideReason,
            x.SlaDeadlineUtc,
            x.CreatedAt)).ToList();

        return new PagedResult<CentralApprovalItemDto>(dtos, total, page, limit);
    }

    public async Task<ApprovalRequestDto> OverrideApproveAsync(
        Guid id,
        OverrideApprovalCommand cmd,
        ICurrentActor actor,
        string ipAddress,
        CancellationToken ct)
    {
        if (actor.PersonId is null || !PlatformRoles.IsAdministrative(actor.PlatformRole))
        {
            throw new ForbiddenException("Chỉ Quản trị viên (ADMIN) mới có thẩm quyền can thiệp phê duyệt vượt cấp.", "ERR_FORBIDDEN_OVERRIDE");
        }

        if (string.IsNullOrWhiteSpace(cmd.OverrideReason) || cmd.OverrideReason.Trim().Length < 20)
        {
            throw new ValidationException("Lý do can thiệp giải trình bắt buộc phải có độ dài tối thiểu 20 ký tự theo BR-ADMIN-OVERRIDE.");
        }

        if (!cmd.ConfirmCommitment)
        {
            throw new ValidationException("Bắt buộc phải tích chọn cam kết trách nhiệm giải trình trước Bộ KH&CN.");
        }

        var request = await db.Set<ApprovalRequest>().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException($"Không tìm thấy hồ sơ thẩm định ID '{id}'.");

        if (request.Version != cmd.ExpectedVersion)
        {
            throw new ConflictException("Hồ sơ này vừa được Cán bộ Sở/Admin khác xử lý. Vui lòng tải lại dữ liệu mới nhất.", "ERR_RECORD_ALREADY_MODIFIED");
        }

        var actorId = actor.PersonId.Value;
        request.ExecuteAdminOverride(actorId, actor.PlatformRole, cmd.OverrideReason, cmd.ConfirmCommitment);

        await ApplyApprovalSideEffectsAsync(request, ct);

        if (request.RequestType == ApprovalRequestTypes.Expert)
        {
            await expertApproval.ApplyAsync(request.UserId, request.PayloadJson, "APPROVE", $"[ADMIN_OVERRIDE]: {cmd.OverrideReason.Trim()}", ct);
        }

        if (request.RequestType == ApprovalRequestTypes.Institution)
        {
            await enterpriseApproval.ApplyAsync(request.UserId, request.ScopeId, request.PayloadJson, "APPROVE", $"[ADMIN_OVERRIDE]: {cmd.OverrideReason.Trim()}", ct);
        }

        var audit = new ApprovalAuditLog(
            actorId,
            actor.PlatformRole,
            "ADMIN_OVERRIDE_APPROVE",
            "approval_requests",
            request.Id.ToString(),
            ipAddress,
            System.Text.Json.JsonSerializer.Serialize(new
            {
                action = "ADMIN_OVERRIDE_APPROVE",
                reason = cmd.OverrideReason.Trim(),
                version = request.Version,
                scopeId = request.ScopeId,
                isSlaBreached = request.IsSlaBreached,
                isNationalPriority = request.IsNationalPriority
            }));

        db.Set<ApprovalAuditLog>().Add(audit);

        try
        {
            await uow.CommitAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("Hồ sơ này vừa được Cán bộ Sở/Admin khác xử lý. Vui lòng tải lại dữ liệu mới nhất.", "ERR_RECORD_ALREADY_MODIFIED");
        }

        var user = await db.Set<Person>().AsNoTracking().FirstOrDefaultAsync(p => p.Id == request.UserId, ct);
        return ToDto(request, user is null ? null : PersonMapper.ToDto(user));
    }

    private static string? ResolveProvinceName(string? provinceId)
    {
        if (string.IsNullOrWhiteSpace(provinceId)) return null;
        return provinceId.ToUpperInvariant() switch
        {
            "HN" => "Sở KH&CN Hà Nội",
            "HCM" => "Sở KH&CN TP. Hồ Chí Minh",
            "HP" => "Sở KH&CN Hải Phòng",
            "DN" => "Sở KH&CN Đà Nẵng",
            "CT" => "Sở KH&CN Cần Thơ",
            "BD" => "Sở KH&CN Bình Dương",
            "DNA" => "Sở KH&CN Đồng Nai",
            _ => $"Sở KH&CN {provinceId}"
        };
    }

    private static void RequireReviewer(ICurrentActor actor)
    {
        if (actor.PersonId is null || !PlatformRoles.IsAdministrative(actor.PlatformRole))
            throw new ForbiddenException("Bạn không có quyền thẩm định hồ sơ.", "ERR_FORBIDDEN_REVIEW");
    }

    private static IQueryable<ApprovalRequest> ApplyScopeFilter(IQueryable<ApprovalRequest> query, ICurrentActor actor)
    {
        RequireReviewer(actor);
        return query;
    }

    private static void ValidateActorScopeAccess(ApprovalRequest request, ICurrentActor actor)
    {
        RequireReviewer(actor);
    }

    private async Task ApplyApprovalSideEffectsAsync(ApprovalRequest request, CancellationToken ct)
    {
        var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Id == request.UserId, ct);
        if (person is null) return;

        switch (request.RequestType)
        {
            case ApprovalRequestTypes.Expert:
                // Q1 (CR-BACLINK-006 / BR-05-BL-01): Giữ nguyên vai trò 3 cấp (PUBLIC_USER hoặc ENTERPRISE) với ScopeTypes.Global,
                // không tạo role thứ 4 (VERIFIED_EXPERT) hay tự nâng PUBLIC_USER thành ENTERPRISE; ExpertProfile.Status = APPROVED
                // được đồng bộ qua IExpertApprovalSynchronizer.
                if (!PlatformRoles.IsCore(person.PlatformRole) || person.ScopeType != ScopeTypes.Global || person.ScopeId is not null)
                {
                    person.AssignRoleAndScope(PlatformRoles.NormalizeTier(person.PlatformRole), ScopeTypes.Global, null);
                }
                break;

            case ApprovalRequestTypes.Shop:
            case ApprovalRequestTypes.Institution:
                // CR-BACLINK-001: ADMIN duyệt nâng hạng tự động cấp ENTERPRISE với ScopeTypes.Global
                person.AssignRoleAndScope(PlatformRoles.Enterprise, ScopeTypes.Global, null);
                if (request.RequestType == ApprovalRequestTypes.Institution && Guid.TryParse(request.ScopeId, out var orgId))
                {
                    var org = await db.Set<OrganizationUnit>().FirstOrDefaultAsync(o => o.Id == orgId, ct);
                    org?.Activate();
                }
                break;

            case ApprovalRequestTypes.Account:
                person.Activate();
                break;
        }
    }

    private async Task RevokeApprovalSideEffectsAsync(ApprovalRequest request, CancellationToken ct)
    {
        var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Id == request.UserId, ct);
        if (person is null) return;

        if (request.RequestType == ApprovalRequestTypes.Expert)
        {
            // Q1: Thu hồi tư cách cố vấn qua IExpertApprovalSynchronizer (ExpertProfile -> REJECTED/PRIVATE),
            // bảo toàn vai trò 3 cấp hiện tại của tài khoản (PUBLIC_USER hoặc ENTERPRISE).
            return;
        }

        // BR-ADM-007: Khi Admin thu hồi quyền, tài khoản bị hạ cấp về PUBLIC_USER
        person.AssignRoleAndScope(PlatformRoles.PublicUser, ScopeTypes.Global, null);

        if (request.RequestType is ApprovalRequestTypes.Institution or ApprovalRequestTypes.Shop)
        {
            await enterpriseApproval.ApplyAsync(request.UserId, request.ScopeId, request.PayloadJson, "REVOKE", null, ct);
        }
    }

    private static void ValidateShopApprovalPayload(string payloadJson)
    {
        if (string.IsNullOrWhiteSpace(payloadJson))
            throw new ValidationException("Dữ liệu hồ sơ (PayloadJson) không được để trống.");

        SubmitShopApprovalPayload? payload;
        try
        {
            payload = System.Text.Json.JsonSerializer.Deserialize<SubmitShopApprovalPayload>(
                payloadJson,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (System.Text.Json.JsonException)
        {
            throw new ValidationException("Dữ liệu hồ sơ (PayloadJson) không đúng định dạng JSON.");
        }

        if (payload is null)
            throw new ValidationException("Dữ liệu hồ sơ (PayloadJson) không được để trống.");

        if (string.IsNullOrWhiteSpace(payload.EntityType) ||
            (payload.EntityType != "ENTERPRISE" && payload.EntityType != "INSTITUTION_RND"))
        {
            throw new ValidationException("Loại hình pháp nhân không hợp lệ. Bắt buộc là 'ENTERPRISE' hoặc 'INSTITUTION_RND'.");
        }

        if (string.IsNullOrWhiteSpace(payload.OrgName) || payload.OrgName.Trim().Length < 5)
        {
            throw new ValidationException("Tên đơn vị bắt buộc và phải có ít nhất 5 ký tự.");
        }

        if (payload.EntityType == "ENTERPRISE")
        {
            if (string.IsNullOrWhiteSpace(payload.TaxCode) ||
                !System.Text.RegularExpressions.Regex.IsMatch(payload.TaxCode.Trim(), @"^\d{10}(\d{3})?$"))
            {
                throw new ValidationException("Mã số thuế doanh nghiệp không được để trống và phải gồm 10 hoặc 13 chữ số.");
            }
        }
        else if (payload.EntityType == "INSTITUTION_RND")
        {
            if (string.IsNullOrWhiteSpace(payload.EstablishmentDecisionNo) || payload.EstablishmentDecisionNo.Trim().Length < 5)
            {
                throw new ValidationException("Số Quyết định thành lập / Giấy phép KH&CN không được để trống và phải từ 5 ký tự trở lên.");
            }
        }

        if (string.IsNullOrWhiteSpace(payload.LegalDocUrl) ||
            !payload.LegalDocUrl.Trim().EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException("Tệp văn bản pháp lý minh chứng bắt buộc phải là định dạng PDF.");
        }

        if (string.IsNullOrWhiteSpace(payload.MainSector))
        {
            throw new ValidationException("Lĩnh vực công nghệ TT17 không được để trống.");
        }

        if (string.IsNullOrWhiteSpace(payload.Province))
        {
            throw new ValidationException("Sở KH&CN tiếp nhận thẩm định không được để trống.");
        }

        if (string.IsNullOrWhiteSpace(payload.Description) || payload.Description.Trim().Length < 10)
        {
            throw new ValidationException("Mô tả năng lực cung ứng phải từ 10 ký tự trở lên.");
        }

        if (!payload.PledgeAgreed)
        {
            throw new ValidationException("Đơn vị bắt buộc phải cam kết tuân thủ quy chế và quyền SHTT.");
        }
    }

    private static ApprovalRequestDto ToDto(ApprovalRequest x, PersonDto? user) => new(
        x.Id,
        x.UserId,
        x.RequestType,
        x.ScopeType,
        x.ScopeId,
        x.PayloadJson,
        x.Status,
        x.Version,
        x.AssignedOfficerId,
        x.ReviewedById,
        x.ReviewNote,
        x.SlaDeadlineUtc,
        x.CreatedAt,
        x.UpdatedAt,
        user);
}
