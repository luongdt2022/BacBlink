using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Modules.Identity.Application;

public sealed class ApprovalService(DbContext db, IUnitOfWork uow, IClock clock, IExpertApprovalSynchronizer expertApproval) : IApprovalService
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
        var actorRole = actor.PlatformRole;
        var normalizedAction = cmd.Action.Trim().ToUpperInvariant();
        if (actor.PlatformRole == PlatformRoles.ClusterAdmin && normalizedAction == "APPROVE")
            throw new ForbiddenException("Chuyên viên sơ kiểm phải trình lãnh đạo ký duyệt.", "ERR_FORBIDDEN_APPROVE");

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
                if (actor.PlatformRole is not PlatformRoles.SuperAdmin and not PlatformRoles.OperatorAdmin)
                {
                    throw new ForbiddenException("Chỉ Quản trị viên Tối cao (SUPER_ADMIN) mới có thẩm quyền can thiệp thu hồi hồ sơ đã duyệt.", "ERR_FORBIDDEN_REVOKE");
                }
                if (string.IsNullOrWhiteSpace(cmd.ReviewNote) || cmd.ReviewNote.Trim().Length < 10)
                {
                    throw new ValidationException("Lý do thu hồi (ReviewNote) là bắt buộc và phải có ít nhất 10 ký tự theo BR-ADM-007.");
                }
                request.Reject(actorId, cmd.ExpectedVersion, $"[THU HỒI TRUNG ƯƠNG]: {cmd.ReviewNote.Trim()}");
                await RevokeApprovalSideEffectsAsync(request, ct);
                break;

            default:
                throw new ValidationException($"Hành động kiểm duyệt '{cmd.Action}' không hợp lệ.");
        }

        if (request.RequestType == ApprovalRequestTypes.Expert && normalizedAction != "FORWARD")
            await expertApproval.ApplyAsync(request.UserId, request.PayloadJson, normalizedAction, cmd.ReviewNote, ct);

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

    private static void RequireReviewer(ICurrentActor actor)
    {
        if (actor.PersonId is null || actor.PlatformRole is not (PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.Admin or PlatformRoles.ProvincialAdmin or PlatformRoles.ClusterAdmin or PlatformRoles.SectorAdmin))
            throw new ForbiddenException("Bạn không có quyền thẩm định hồ sơ.", "ERR_FORBIDDEN_REVIEW");
        if (actor.ScopeType == ScopeTypes.Global)
        {
            if (actor.PlatformRole is not (PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.Admin))
                throw new ForbiddenException("Bạn không có quyền thẩm định toàn quốc.", "ERR_DATA_SCOPE_VIOLATION");
        }
        else if (actor.ScopeType is not (ScopeTypes.Province or ScopeTypes.Sector or ScopeTypes.OrgUnit) || string.IsNullOrWhiteSpace(actor.ScopeId))
            throw new ForbiddenException("Phạm vi thẩm định không hợp lệ.", "ERR_DATA_SCOPE_VIOLATION");
    }

    private static IQueryable<ApprovalRequest> ApplyScopeFilter(IQueryable<ApprovalRequest> query, ICurrentActor actor)
    {
        if (actor.PlatformRole is PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.Admin)
        {
            if (actor.ScopeType == ScopeTypes.Global) return query;
        }

        return actor.ScopeType switch
        {
            ScopeTypes.Province => query.Where(x => x.ScopeType == ScopeTypes.Province && x.ScopeId == actor.ScopeId),
            ScopeTypes.Sector => query.Where(x => x.ScopeType == ScopeTypes.Sector && x.ScopeId == actor.ScopeId),
            ScopeTypes.OrgUnit => query.Where(x => x.ScopeType == ScopeTypes.OrgUnit && x.ScopeId == actor.ScopeId),
            _ => throw new ForbiddenException("Phạm vi thẩm định không hợp lệ.", "ERR_DATA_SCOPE_VIOLATION")
        };
    }

    private static void ValidateActorScopeAccess(ApprovalRequest request, ICurrentActor actor)
    {
        RequireReviewer(actor);
        if (actor.PlatformRole is PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.Admin)
        {
            if (actor.ScopeType == ScopeTypes.Global) return;
        }

        if (actor.ScopeType == ScopeTypes.Province && (request.ScopeType != ScopeTypes.Province || request.ScopeId != actor.ScopeId))
        {
            throw new ForbiddenException("Bạn không có quyền thẩm định hồ sơ thuộc địa bàn tỉnh/thành khác.", "ERR_DATA_SCOPE_VIOLATION");
        }

        if (actor.ScopeType == ScopeTypes.Sector && (request.ScopeType != ScopeTypes.Sector || request.ScopeId != actor.ScopeId))
        {
            throw new ForbiddenException("Bạn không có quyền thẩm định hồ sơ thuộc ngành/lĩnh vực khác.", "ERR_DATA_SCOPE_VIOLATION");
        }

        if (actor.ScopeType == ScopeTypes.OrgUnit && (request.ScopeType != ScopeTypes.OrgUnit || request.ScopeId != actor.ScopeId))
        {
            throw new ForbiddenException("Bạn không có quyền thẩm định hồ sơ thuộc đơn vị khác.", "ERR_DATA_SCOPE_VIOLATION");
        }
    }

    private async Task ApplyApprovalSideEffectsAsync(ApprovalRequest request, CancellationToken ct)
    {
        var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Id == request.UserId, ct);
        if (person is null) return;

        switch (request.RequestType)
        {
            case ApprovalRequestTypes.Expert:
                person.AssignRoleAndScope(PlatformRoles.VerifiedExpert, request.ScopeType, request.ScopeId);
                break;

            case ApprovalRequestTypes.Shop:
                person.AssignRoleAndScope(PlatformRoles.Seller, request.ScopeType, request.ScopeId);
                break;

            case ApprovalRequestTypes.Account:
                person.Activate();
                break;

            case ApprovalRequestTypes.Institution:
                if (Guid.TryParse(request.ScopeId, out var orgId))
                {
                    var org = await db.Set<OrganizationUnit>().FirstOrDefaultAsync(o => o.Id == orgId, ct);
                    org?.Activate();
                }
                break;
        }
    }

    private async Task RevokeApprovalSideEffectsAsync(ApprovalRequest request, CancellationToken ct)
    {
        var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Id == request.UserId, ct);
        if (person is null) return;

        // BR-ADM-007: Khi Super Admin thu hồi quyền chuyên gia, tài khoản bị hạ cấp về PUBLIC_USER
        person.AssignRoleAndScope(PlatformRoles.PublicUser, ScopeTypes.Global, null);
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
