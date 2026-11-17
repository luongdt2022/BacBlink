using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Identity.Domain;

public static class ApprovalRequestTypes
{
    public const string Account = "ACCOUNT";
    public const string Shop = "SHOP";
    public const string Expert = "EXPERT";
    public const string Demand = "DEMAND";
    public const string Institution = "INSTITUTION";
    public const string TechnologyOffer = "TECHNOLOGY_OFFER";
    public const string TechSupply = "TECH_SUPPLY";

    public static readonly HashSet<string> All = [Account, Shop, Expert, Demand, Institution, TechnologyOffer, TechSupply];
}

public static class ApprovalStatuses
{
    public const string PendingReview = "PENDING_REVIEW";
    public const string PendingApproval = "PENDING_APPROVAL";
    public const string Approved = "APPROVED";
    public const string Rejected = "REJECTED";
    public const string ChangesRequested = "CHANGES_REQUESTED";

    public static readonly HashSet<string> All = [PendingReview, PendingApproval, Approved, Rejected, ChangesRequested];
}

/// <summary>
/// TASK-07: Hồ sơ trong hàng đợi thẩm định và phê duyệt phân cấp (3D Scoped RBAC & Optimistic Concurrency).
/// </summary>
public sealed class ApprovalRequest : AggregateRoot
{
    private ApprovalRequest() { }

    public ApprovalRequest(
        Guid userId,
        string requestType,
        string scopeType,
        string? scopeId,
        string payloadJson,
        DateTimeOffset slaDeadlineUtc)
    {
        if (userId == Guid.Empty) throw new ValidationException("UserId không được rỗng.");
        if (!ApprovalRequestTypes.All.Contains(requestType)) throw new ValidationException($"Loại hồ sơ '{requestType}' không hợp lệ.");
        if (string.IsNullOrWhiteSpace(payloadJson)) throw new ValidationException("Dữ liệu hồ sơ (PayloadJson) không được để trống.");

        UserId = userId;
        RequestType = requestType;
        ScopeType = string.IsNullOrWhiteSpace(scopeType) ? ScopeTypes.Global : scopeType;
        ScopeId = scopeId;
        PayloadJson = payloadJson;
        Status = ApprovalStatuses.PendingReview;
        SlaDeadlineUtc = slaDeadlineUtc;
        Version = 1;
    }

    public Guid UserId { get; private set; }
    public string RequestType { get; private set; } = string.Empty;
    public string ScopeType { get; private set; } = ScopeTypes.Global;
    public string? ScopeId { get; private set; }
    public string PayloadJson { get; private set; } = "{}";
    public string Status { get; private set; } = ApprovalStatuses.PendingReview;
    public Guid? AssignedOfficerId { get; private set; }
    public Guid? ReviewedById { get; private set; }
    public string? ReviewNote { get; private set; }
    public DateTimeOffset SlaDeadlineUtc { get; private set; }
    public bool IsOverride { get; private set; } = false;
    public string? OverrideReason { get; private set; }
    public Guid? OverriddenByUserId { get; private set; }
    public DateTimeOffset? OverriddenAtUtc { get; private set; }
    public bool IsSlaBreached { get; private set; } = false;
    public double SlaOverdueHours { get; private set; } = 0;
    public bool IsNationalPriority { get; private set; } = false;
    public uint RowVersion { get; private set; }

    public void AssignOfficer(Guid officerId)
    {
        if (officerId == Guid.Empty) throw new ValidationException("OfficerId không hợp lệ.");
        AssignedOfficerId = officerId;
        Version++;
        Touch();
    }

    public void Approve(Guid reviewerId, int expectedVersion, string? note = null)
    {
        ValidateVersion(expectedVersion);
        if (Status == ApprovalStatuses.Approved) throw new ValidationException("Hồ sơ đã được phê duyệt trước đó.");

        ReviewedById = reviewerId;
        ReviewNote = note;
        Status = ApprovalStatuses.Approved;
        Version++;
        Touch();
    }

    public void ForwardToApproval(Guid officerId, int expectedVersion, string? note = null)
    {
        ValidateVersion(expectedVersion);
        ReviewedById = officerId;
        ReviewNote = note;
        Status = ApprovalStatuses.PendingApproval;
        Version++;
        Touch();
    }

    public void Reject(Guid reviewerId, int expectedVersion, string note)
    {
        ValidateVersion(expectedVersion);
        if (string.IsNullOrWhiteSpace(note) || note.Trim().Length < 10)
        {
            throw new ValidationException("Lý do từ chối (ReviewNote) bắt buộc phải có ít nhất 10 ký tự.");
        }

        ReviewedById = reviewerId;
        ReviewNote = note.Trim();
        Status = ApprovalStatuses.Rejected;
        Version++;
        Touch();
    }

    public void RequestChanges(Guid reviewerId, int expectedVersion, string note)
    {
        ValidateVersion(expectedVersion);
        if (string.IsNullOrWhiteSpace(note) || note.Trim().Length < 10)
        {
            throw new ValidationException("Lý do yêu cầu bổ sung bắt buộc phải có ít nhất 10 ký tự.");
        }

        ReviewedById = reviewerId;
        ReviewNote = note.Trim();
        Status = ApprovalStatuses.ChangesRequested;
        Version++;
        Touch();
    }

    public void ExecuteAdminOverride(Guid adminId, string reason, bool confirmCommitment, IReadOnlyCollection<string> adminRoles)
    {
        var hasValidRole = adminRoles != null && adminRoles.Any(r => PlatformRoles.IsAdministrative(r?.Trim().ToUpperInvariant()));

        if (!hasValidRole)
        {
            throw new UnauthorizedAccessException("Chỉ Quản trị viên (ADMIN) mới có quyền phê duyệt vượt cấp.");
        }

        var primaryRole = adminRoles!.First(r => PlatformRoles.IsAdministrative(r?.Trim().ToUpperInvariant()));

        ExecuteAdminOverrideInternal(adminId, primaryRole, reason, confirmCommitment);
    }

    public void ExecuteAdminOverride(Guid adminId, string adminRole, string reason, bool confirmCommitment)
    {
        if (!PlatformRoles.IsAdministrative(adminRole?.Trim().ToUpperInvariant()))
        {
            throw new UnauthorizedAccessException("Chỉ Quản trị viên (ADMIN) mới có quyền phê duyệt vượt cấp.");
        }

        ExecuteAdminOverrideInternal(adminId, adminRole!, reason, confirmCommitment);
    }

    private void ExecuteAdminOverrideInternal(Guid adminId, string adminRole, string reason, bool confirmCommitment)
    {
        if (adminId == Guid.Empty) throw new ValidationException("AdminId không được rỗng.");

        if (Status != ApprovalStatuses.PendingReview && Status != ApprovalStatuses.PendingApproval)
        {
            throw new InvalidOperationException($"Không thể can thiệp hồ sơ ở trạng thái {Status}.");
        }

        if (!IsSlaBreached && !IsNationalPriority)
        {
            throw new InvalidOperationException("Chỉ được duyệt vượt cấp khi hồ sơ đã quá hạn SLA cấp Sở (>72h làm việc) hoặc có cờ trọng điểm Quốc gia.");
        }

        if (string.IsNullOrWhiteSpace(reason) || reason.Trim().Length < 20)
        {
            throw new ValidationException("Lý do can thiệp giải trình bắt buộc phải có độ dài tối thiểu 20 ký tự.");
        }

        if (!confirmCommitment)
        {
            throw new ValidationException("Bắt buộc phải tích chọn cam kết trách nhiệm giải trình trước Bộ KH&CN.");
        }

        var now = DateTimeOffset.UtcNow;
        IsOverride = true;
        OverrideReason = reason.Trim();
        OverriddenByUserId = adminId;
        OverriddenAtUtc = now;
        ReviewedById = adminId;
        ReviewNote = $"[ADMIN_OVERRIDE]: {reason.Trim()}";
        Status = ApprovalStatuses.Approved;
        Version++;
        Touch();

        Raise(new ApprovalOverriddenDomainEvent(
            Id,
            adminId,
            adminRole,
            ScopeType,
            ScopeId,
            OverrideReason,
            now));
    }

    public void MarkSlaBreached(double overdueHours)
    {
        if (!IsSlaBreached)
        {
            IsSlaBreached = true;
            SlaOverdueHours = Math.Max(0, overdueHours);
            Touch();
        }
    }

    public void SetNationalPriority(bool isPriority)
    {
        IsNationalPriority = isPriority;
        Touch();
    }

    private void ValidateVersion(int expectedVersion)
    {
        if (Version != expectedVersion)
        {
            throw new RecordAlreadyModifiedException();
        }
    }
}
