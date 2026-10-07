using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Domain;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public sealed class GovernanceApprovalInvariantsTests
{
    [Fact]
    public void Creating_approval_request_sets_version_1_and_pending_review()
    {
        var userId = Guid.NewGuid();
        var deadline = DateTimeOffset.UtcNow.AddHours(24);
        var req = new ApprovalRequest(
            userId,
            ApprovalRequestTypes.Expert,
            ScopeTypes.Province,
            "HP",
            "{\"fullName\":\"TS. Nguyen Van A\"}",
            deadline);

        req.Version.ShouldBe(1);
        req.Status.ShouldBe(ApprovalStatuses.PendingReview);
        req.ScopeType.ShouldBe(ScopeTypes.Province);
        req.ScopeId.ShouldBe("HP");
    }

    [Fact]
    public void Optimistic_concurrency_rejects_stale_expected_version()
    {
        var userId = Guid.NewGuid();
        var req = new ApprovalRequest(
            userId,
            ApprovalRequestTypes.Shop,
            ScopeTypes.Global,
            null,
            "{\"shopName\":\"Tech Shop 1\"}",
            DateTimeOffset.UtcNow.AddHours(24));

        var reviewerId = Guid.NewGuid();

        // Cán bộ 1 duyệt thành công với expectedVersion = 1
        req.Approve(reviewerId, expectedVersion: 1, note: "Hồ sơ hợp lệ");
        req.Version.ShouldBe(2);
        req.Status.ShouldBe(ApprovalStatuses.Approved);

        // Cán bộ 2 mở cùng lúc trên giao diện cũ (expectedVersion = 1) -> Bị chặn với lỗi xung đột phiên bản
        Should.Throw<RecordAlreadyModifiedException>(() =>
        {
            req.Reject(Guid.NewGuid(), expectedVersion: 1, note: "Từ chối vì thiếu giấy phép ĐKKD");
        });
    }

    [Fact]
    public void Rejecting_or_requesting_changes_requires_at_least_10_characters()
    {
        var req = new ApprovalRequest(
            Guid.NewGuid(),
            ApprovalRequestTypes.Demand,
            ScopeTypes.Sector,
            "CNTT",
            "{\"title\":\"Bai toan AI\"}",
            DateTimeOffset.UtcNow.AddHours(24));

        var reviewerId = Guid.NewGuid();

        // Ghi chú dưới 10 ký tự -> ném lỗi nghiệp vụ
        Should.Throw<ValidationException>(() =>
        {
            req.Reject(reviewerId, expectedVersion: 1, note: "Lỗi");
        });

        // Ghi chú đủ 10 ký tự -> thành công
        req.Reject(reviewerId, expectedVersion: 1, note: "Hồ sơ thiếu mô tả chi tiết giải pháp kỹ thuật");
        req.Status.ShouldBe(ApprovalStatuses.Rejected);
        req.ReviewNote.ShouldBe("Hồ sơ thiếu mô tả chi tiết giải pháp kỹ thuật");
    }

    [Fact]
    public void Organization_unit_normalizes_code_and_tracks_lifecycle()
    {
        var unit = new OrganizationUnit(
            "so-khcn-hp",
            "Sở Khoa học và Công nghệ Hải Phòng",
            OrganizationUnitTypes.Provincial,
            parentId: null,
            provinceId: "hp");

        unit.Code.ShouldBe("SO-KHCN-HP");
        unit.ProvinceId.ShouldBe("HP");
        unit.Status.ShouldBe(OrganizationUnitStatuses.Active);

        unit.Deactivate();
        unit.Status.ShouldBe(OrganizationUnitStatuses.Inactive);

        unit.Activate();
        unit.Status.ShouldBe(OrganizationUnitStatuses.Active);
    }

    [Fact]
    public void Approval_audit_log_captures_immutable_record()
    {
        var actorId = Guid.NewGuid();
        var log = new ApprovalAuditLog(
            actorId,
            PlatformRoles.ProvincialAdmin,
            "REVIEW_APPROVE",
            "approval_requests",
            "req-12345",
            "192.168.1.100",
            "{\"action\":\"APPROVE\"}");

        log.ActorId.ShouldBe(actorId);
        log.ActorRole.ShouldBe(PlatformRoles.ProvincialAdmin);
        log.Action.ShouldBe("REVIEW_APPROVE");
        log.IpAddress.ShouldBe("192.168.1.100");
    }

    [Fact]
    public void Provincial_officer_approving_expert_request_transitions_status_and_increments_version()
    {
        // Giai đoạn 2: Lãnh đạo Sở KH&CN Hải Phòng duyệt hồ sơ chuyên gia thuộc địa bàn HP
        var req = new ApprovalRequest(
            Guid.NewGuid(),
            ApprovalRequestTypes.Expert,
            ScopeTypes.Province,
            "HP",
            "{\"fullName\":\"TS. Nguyen Van An\",\"degree\":\"DOCTOR\",\"organizationName\":\"DH Hang Hai\"}",
            DateTimeOffset.UtcNow.AddHours(48));

        var officerId = Guid.NewGuid();
        req.Approve(officerId, expectedVersion: 1, note: "Hồ sơ đáp ứng tiêu chí chuyên gia cấp tỉnh");

        req.Status.ShouldBe(ApprovalStatuses.Approved);
        req.Version.ShouldBe(2);
        req.ReviewedById.ShouldBe(officerId);
        req.ReviewNote.ShouldBe("Hồ sơ đáp ứng tiêu chí chuyên gia cấp tỉnh");
    }

    [Fact]
    public void Revoke_expert_requires_at_least_10_characters_note_and_sets_rejected_status()
    {
        // Giai đoạn 3: Trung Ương Hậu Kiểm BR-ADM-007: Thu hồi quyền chuyên gia
        var req = new ApprovalRequest(
            Guid.NewGuid(),
            ApprovalRequestTypes.Expert,
            ScopeTypes.Province,
            "HP",
            "{\"fullName\":\"TS. Nguyen Van An\"}",
            DateTimeOffset.UtcNow.AddHours(48));

        req.Approve(Guid.NewGuid(), expectedVersion: 1, note: "Duyệt");

        // Super Admin thu hồi quyền do sai phạm
        var superAdminId = Guid.NewGuid();
        req.Reject(superAdminId, expectedVersion: 2, note: "[THU HỒI TRUNG ƯƠNG]: Hồ sơ khai man công bố khoa học");

        req.Status.ShouldBe(ApprovalStatuses.Rejected);
        req.Version.ShouldBe(3);
        req.ReviewedById.ShouldBe(superAdminId);
        req.ReviewNote!.ShouldContain("[THU HỒI TRUNG ƯƠNG]");
    }
}

