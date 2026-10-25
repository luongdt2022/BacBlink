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
    public void Organization_unit_update_modifies_name_and_province()
    {
        var unit = new OrganizationUnit(
            "so-khcn-hp",
            "Sở Khoa học và Công nghệ Hải Phòng",
            OrganizationUnitTypes.Provincial,
            parentId: null,
            provinceId: "HP");

        unit.Update("Sở KH&CN TP. Hải Phòng (Cập nhật)", "HP");
        unit.Name.ShouldBe("Sở KH&CN TP. Hải Phòng (Cập nhật)");
        unit.ProvinceId.ShouldBe("HP");

        Should.Throw<ValidationException>(() =>
        {
            unit.Update("   ", "HP");
        });
    }

    [Fact]
    public void Organization_unit_creation_requires_valid_code_name_and_type()
    {
        Should.Throw<ValidationException>(() =>
        {
            new OrganizationUnit("", "Tên hợp lệ", OrganizationUnitTypes.National);
        });

        Should.Throw<ValidationException>(() =>
        {
            new OrganizationUnit("CODE", "", OrganizationUnitTypes.National);
        });

        Should.Throw<ValidationException>(() =>
        {
            new OrganizationUnit("CODE", "Tên", "INVALID_TYPE");
        });
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

    [Fact]
    public void Admin_override_succeeds_when_sla_breached_and_role_is_super_admin()
    {
        var req = new ApprovalRequest(
            Guid.NewGuid(),
            ApprovalRequestTypes.TechSupply,
            ScopeTypes.Province,
            "HN",
            "{\"techName\":\"AI Camera Solution\"}",
            DateTimeOffset.UtcNow.AddHours(-10));

        var adminId = Guid.NewGuid();
        req.MarkSlaBreached(24.5);
        req.IsSlaBreached.ShouldBeTrue();
        req.SlaOverdueHours.ShouldBe(24.5);

        const string reason = "Hồ sơ quá hạn SLA Sở Hà Nội quá 24h làm việc. Trung ương can thiệp duyệt thay.";
        req.ExecuteAdminOverride(adminId, PlatformRoles.SuperAdmin, reason, confirmCommitment: true);

        req.Status.ShouldBe(ApprovalStatuses.Approved);
        req.IsOverride.ShouldBeTrue();
        req.OverrideReason.ShouldBe(reason);
        req.OverriddenByUserId.ShouldBe(adminId);
        req.OverriddenAtUtc.ShouldNotBeNull();
        req.ReviewedById.ShouldBe(adminId);
        req.DomainEvents.ShouldContain(e => e is ApprovalOverriddenDomainEvent);
    }

    [Fact]
    public void Admin_override_succeeds_when_national_priority_flag_is_set()
    {
        var req = new ApprovalRequest(
            Guid.NewGuid(),
            ApprovalRequestTypes.Demand,
            ScopeTypes.Province,
            "HCM",
            "{\"demandName\":\"Semiconductor Clean Room\"}",
            DateTimeOffset.UtcNow.AddHours(48));

        req.SetNationalPriority(true);
        req.IsNationalPriority.ShouldBeTrue();

        var operatorAdminId = Guid.NewGuid();
        const string reason = "Đề tài trọng điểm Quốc gia lĩnh vực bán dẫn cần phê duyệt khẩn cấp theo Quyết định của Bộ.";
        req.ExecuteAdminOverride(operatorAdminId, PlatformRoles.OperatorAdmin, reason, confirmCommitment: true);

        req.Status.ShouldBe(ApprovalStatuses.Approved);
        req.IsOverride.ShouldBeTrue();
    }

    [Fact]
    public void Admin_override_throws_when_reason_is_less_than_20_characters()
    {
        var req = new ApprovalRequest(
            Guid.NewGuid(),
            ApprovalRequestTypes.Expert,
            ScopeTypes.Province,
            "HP",
            "{\"name\":\"TS B\"}",
            DateTimeOffset.UtcNow);

        req.MarkSlaBreached(10);
        var adminId = Guid.NewGuid();

        var ex = Should.Throw<ValidationException>(() =>
        {
            req.ExecuteAdminOverride(adminId, PlatformRoles.SuperAdmin, "Lý do quá ngắn", confirmCommitment: true);
        });
        ex.Message.ShouldContain("20 ký tự");
    }

    [Fact]
    public void Admin_override_throws_when_commitment_not_confirmed()
    {
        var req = new ApprovalRequest(
            Guid.NewGuid(),
            ApprovalRequestTypes.Expert,
            ScopeTypes.Province,
            "HP",
            "{\"name\":\"TS B\"}",
            DateTimeOffset.UtcNow);

        req.MarkSlaBreached(10);
        var adminId = Guid.NewGuid();

        var ex = Should.Throw<ValidationException>(() =>
        {
            req.ExecuteAdminOverride(adminId, PlatformRoles.SuperAdmin, "Lý do can thiệp giải trình hợp lệ dài hơn 20 ký tự.", confirmCommitment: false);
        });
        ex.Message.ShouldContain("cam kết trách nhiệm");
    }

    [Fact]
    public void Admin_override_throws_when_role_is_not_tier_0()
    {
        var req = new ApprovalRequest(
            Guid.NewGuid(),
            ApprovalRequestTypes.Expert,
            ScopeTypes.Province,
            "HP",
            "{\"name\":\"TS B\"}",
            DateTimeOffset.UtcNow);

        req.MarkSlaBreached(10);
        var officerId = Guid.NewGuid();

        Should.Throw<UnauthorizedAccessException>(() =>
        {
            req.ExecuteAdminOverride(officerId, PlatformRoles.ProvincialAdmin, "Lý do can thiệp giải trình hợp lệ dài hơn 20 ký tự.", confirmCommitment: true);
        });
    }

    [Fact]
    public void Admin_override_throws_when_neither_sla_breached_nor_national_priority()
    {
        var req = new ApprovalRequest(
            Guid.NewGuid(),
            ApprovalRequestTypes.Expert,
            ScopeTypes.Province,
            "HP",
            "{\"name\":\"TS B\"}",
            DateTimeOffset.UtcNow.AddHours(48));

        var adminId = Guid.NewGuid();

        var ex = Should.Throw<InvalidOperationException>(() =>
        {
            req.ExecuteAdminOverride(adminId, PlatformRoles.SuperAdmin, "Lý do can thiệp giải trình hợp lệ dài hơn 20 ký tự.", confirmCommitment: true);
        });
        ex.Message.ShouldContain("SLA");
    }

    [Fact]
    public void Working_hours_calculation_excludes_weekends_and_lunch_break()
    {
        var vnOffset = TimeSpan.FromHours(7);
        // Thứ Sáu: 2026-10-23 15:00:00 (GMT+7)
        var friday3Pm = new DateTimeOffset(2026, 10, 23, 15, 0, 0, vnOffset);
        // Thứ Hai tuần sau: 2026-10-26 10:00:00 (GMT+7)
        var monday10Am = new DateTimeOffset(2026, 10, 26, 10, 0, 0, vnOffset);

        // Thứ 6 từ 15h đến 17h = 2h.
        // T7 và CN = 0h.
        // Thứ 2 từ 8h đến 10h = 2h.
        // Tổng cộng: 4.0h
        var hours = NacenTech.Persistence.Workers.ApprovalSlaMonitorWorker.CalculateWorkingHours(friday3Pm, monday10Am);
        hours.ShouldBe(4.0);

        // Cùng ngày bao gồm giờ ăn trưa: Thứ Hai 10h đến 14h (10h-12h: 2h; 12h-13h: 0h; 13h-14h: 1h -> Tổng 3h)
        var monday10AmSameDay = new DateTimeOffset(2026, 10, 26, 10, 0, 0, vnOffset);
        var monday2PmSameDay = new DateTimeOffset(2026, 10, 26, 14, 0, 0, vnOffset);

        var sameDayHours = NacenTech.Persistence.Workers.ApprovalSlaMonitorWorker.CalculateWorkingHours(monday10AmSameDay, monday2PmSameDay);
        sameDayHours.ShouldBe(3.0);
    }
}

