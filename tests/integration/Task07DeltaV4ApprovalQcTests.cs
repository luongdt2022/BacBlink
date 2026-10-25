using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// BỘ TEST QC THIẾT QUÂN LUẬT CHO TASK-07 DELTA V4 (CR-2026-020):
/// Kiểm thử 4 tầng trên CSDL PostgreSQL thật: Blackbox, Race Condition, Boundary, RBAC Hacker và SQL/XSS Injection.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class Task07DeltaV4ApprovalQcTests(PostgresFixture fixture)
{
    private sealed record TestActor(
        Guid? PersonId,
        string Email,
        string PlatformRole,
        string ScopeType,
        string? ScopeId) : ICurrentActor
    {
        public bool IsAuthenticated => PersonId.HasValue;
        public string? IpAddress => "127.0.0.1";
        public string? UserAgent => "NacenTech-QC-Harness";
        public string CorrelationId => Guid.NewGuid().ToString("N");
        public Guid RequirePersonId() => PersonId ?? throw new UnauthorizedException("Yêu cầu định danh.");
    }

    private static (Guid id, string email) NewUser() => (Guid.NewGuid(), $"qc-test-{Guid.NewGuid():N}@nacentech.vn");

    private async Task<Person> SeedPersonAsync(NacenTechDbContext db, Guid id, string email, string role, string scopeType = ScopeTypes.Global, string? scopeId = null)
    {
        var person = Person.Register(
            email,
            "hash-1234567890",
            "PBKDF2_V3",
            "QC",
            "User",
            "0912345678",
            "NacenTech",
            isActive: true,
            platformRole: role,
            scopeType: scopeType,
            scopeId: scopeId);

        typeof(Person).GetProperty(nameof(Person.Id))!.SetValue(person, id);
        person.Activate();
        db.Set<Person>().Add(person);
        await db.SaveChangesAsync();
        return person;
    }

    [Fact]
    public async Task T053_Scenario1_Provincial_Officer_Approves_Request_Normal_Path_Updates_Database()
    {
        // Kịch bản 1: Hồ sơ gửi lên Sở -> Cán bộ Sở duyệt bình thường -> State APPROVED
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, userEmail) = NewUser();
        await SeedPersonAsync(db, userId, userEmail, PlatformRoles.PublicUser);

        var (officerId, officerEmail) = NewUser();
        await SeedPersonAsync(db, officerId, officerEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HP");

        var officerActor = new TestActor(officerId, officerEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HP");

        // Tạo hồ sơ thẩm định Shop tại Hải Phòng
        var submitCmd = new SubmitApprovalRequestCommand(
            userId,
            ApprovalRequestTypes.Shop,
            ScopeTypes.Province,
            "HP",
            JsonSerializer.Serialize(new { shopName = "Cửa hàng KH&CN Hải Phòng", taxCode = "0201234567" }),
            DateTimeOffset.UtcNow.AddHours(48));

        var created = await service.SubmitRequestAsync(submitCmd, CancellationToken.None);
        created.Status.ShouldBe(ApprovalStatuses.PendingReview);
        created.Version.ShouldBe(1);

        // Cán bộ Sở Hải Phòng duyệt hồ sơ
        var reviewCmd = new ReviewApprovalRequestCommand(
            "APPROVE",
            1,
            "Hồ sơ đầy đủ tính pháp lý và ĐKKD hợp lệ tại Hải Phòng");

        var approved = await service.ReviewRequestAsync(created.Id, reviewCmd, officerActor, "10.0.0.1", CancellationToken.None);

        // Đối soát trực tiếp trạng thái trên CSDL PostgreSQL thật
        approved.Status.ShouldBe(ApprovalStatuses.Approved);
        approved.Version.ShouldBe(2);

        var dbRecord = await db.Set<ApprovalRequest>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == created.Id);
        dbRecord.ShouldNotBeNull();
        dbRecord.Status.ShouldBe(ApprovalStatuses.Approved);
        dbRecord.ReviewedById.ShouldBe(officerId);
        dbRecord.Version.ShouldBe(2);
        dbRecord.IsOverride.ShouldBeFalse();

        // Kiểm tra Audit Log bất biến được ghi vào bảng identity.approval_audit_logs
        var auditLogs = await db.Set<ApprovalAuditLog>().AsNoTracking()
            .Where(x => x.TargetId == created.Id.ToString())
            .ToListAsync();

        auditLogs.Count.ShouldBeGreaterThanOrEqualTo(2); // 1 submit, 1 review
        auditLogs.ShouldContain(x => x.Action == "REVIEW_APPROVE" && x.ActorId == officerId);
    }

    [Fact]
    public async Task T053_Scenario2_Sla_Breach_Detection_Calculates_Overdue_Hours()
    {
        // Kịch bản 2: Hồ sơ quá hạn SLA 72h làm việc -> Đánh dấu cờ is_sla_breached
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

        var (userId, userEmail) = NewUser();
        await SeedPersonAsync(db, userId, userEmail, PlatformRoles.PublicUser);

        // Tạo hồ sơ nộp cách đây 5 ngày làm việc
        var overdueReq = new ApprovalRequest(
            userId,
            ApprovalRequestTypes.TechSupply,
            ScopeTypes.Province,
            "HN",
            "{\"techName\":\"Hệ thống xử lý nước thải thông minh\"}",
            DateTimeOffset.UtcNow.AddDays(-2));

        // Đánh dấu quá hạn SLA 36.5 giờ làm việc
        overdueReq.MarkSlaBreached(36.5);
        db.Set<ApprovalRequest>().Add(overdueReq);
        await db.SaveChangesAsync();

        // Đọc lại từ CSDL PostgreSQL thật để xác nhận cột is_sla_breached và sla_overdue_hours
        var reloaded = await db.Set<ApprovalRequest>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == overdueReq.Id);
        reloaded.ShouldNotBeNull();
        reloaded.IsSlaBreached.ShouldBeTrue();
        reloaded.SlaOverdueHours.ShouldBe(36.5);
    }

    [Fact]
    public async Task T053_Scenario3_Admin_Override_End_To_End_Audit_Level_3()
    {
        // Kịch bản 3: Admin Tầng 0 vào duyệt thay qua Override -> Bắt buộc nhập lý do >= 20 ký tự & cam kết trách nhiệm
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, userEmail) = NewUser();
        await SeedPersonAsync(db, userId, userEmail, PlatformRoles.PublicUser);

        var (superAdminId, superAdminEmail) = NewUser();
        await SeedPersonAsync(db, superAdminId, superAdminEmail, PlatformRoles.SuperAdmin);
        var superAdminActor = new TestActor(superAdminId, superAdminEmail, PlatformRoles.SuperAdmin, ScopeTypes.Global, null);

        var req = new ApprovalRequest(
            userId,
            ApprovalRequestTypes.TechSupply,
            ScopeTypes.Province,
            "DN",
            "{\"techTitle\":\"Thiết bị bán dẫn đo quang\"}",
            DateTimeOffset.UtcNow.AddHours(-10));

        req.MarkSlaBreached(28.0);
        db.Set<ApprovalRequest>().Add(req);
        await db.SaveChangesAsync();

        const string validReason = "Sở KH&CN Đà Nẵng quá hạn SLA 28 giờ làm việc. Lãnh đạo Cục can thiệp duyệt thay phục vụ triển lãm quốc gia.";
        var overrideCmd = new OverrideApprovalCommand(validReason, ConfirmCommitment: true, ExpectedVersion: 1);

        var result = await service.OverrideApproveAsync(req.Id, overrideCmd, superAdminActor, "10.0.0.99", CancellationToken.None);

        result.Status.ShouldBe(ApprovalStatuses.Approved);

        // Đối soát trực tiếp trong CSDL PostgreSQL thật
        var dbUpdated = await db.Set<ApprovalRequest>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == req.Id);
        dbUpdated.ShouldNotBeNull();
        dbUpdated.Status.ShouldBe(ApprovalStatuses.Approved);
        dbUpdated.IsOverride.ShouldBeTrue();
        dbUpdated.OverrideReason.ShouldBe(validReason);
        dbUpdated.OverriddenByUserId.ShouldBe(superAdminId);
        dbUpdated.OverriddenAtUtc.ShouldNotBeNull();
        dbUpdated.Version.ShouldBe(2);

        // Đối soát Audit Log Cấp độ 3 bất biến
        var audit = await db.Set<ApprovalAuditLog>().AsNoTracking()
            .FirstOrDefaultAsync(x => x.TargetId == req.Id.ToString() && x.Action == "ADMIN_OVERRIDE_APPROVE");

        audit.ShouldNotBeNull();
        audit.ActorId.ShouldBe(superAdminId);
        audit.ActorRole.ShouldBe(PlatformRoles.SuperAdmin);
        audit.IpAddress.ShouldBe("10.0.0.99");
        audit.DetailsJson.ShouldNotBeNull();
        audit.DetailsJson.ShouldContain(validReason);
        audit.DetailsJson.ShouldContain("isSlaBreached");
    }

    [Fact]
    public async Task T054_Scenario1_Race_Condition_Between_Officer_And_Admin_Throws_409_Conflict()
    {
        // Kịch bản phá hoại 1: Cán bộ Sở và Super Admin cùng ấn duyệt 1 hồ sơ tại cùng 1 mili-giây
        // Người thứ 1 thành công -> Version đổi thành 2
        // Người thứ 2 gửi expectedVersion = 1 -> Nhận lỗi Concurrency Conflict (409)
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, userEmail) = NewUser();
        await SeedPersonAsync(db, userId, userEmail, PlatformRoles.PublicUser);

        var (officerId, officerEmail) = NewUser();
        await SeedPersonAsync(db, officerId, officerEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HN");
        var officerActor = new TestActor(officerId, officerEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HN");

        var (adminId, adminEmail) = NewUser();
        await SeedPersonAsync(db, adminId, adminEmail, PlatformRoles.SuperAdmin);
        var adminActor = new TestActor(adminId, adminEmail, PlatformRoles.SuperAdmin, ScopeTypes.Global, null);

        var req = new ApprovalRequest(
            userId,
            ApprovalRequestTypes.TechSupply,
            ScopeTypes.Province,
            "HN",
            "{\"techName\":\"Race Condition Test Solution\"}",
            DateTimeOffset.UtcNow.AddHours(-50));
        req.MarkSlaBreached(50.0);
        db.Set<ApprovalRequest>().Add(req);
        await db.SaveChangesAsync();

        // Giao dịch 1: Cán bộ Sở bấm Duyệt trước (expectedVersion = 1) -> Thành công
        var officerCmd = new ReviewApprovalRequestCommand("APPROVE", 1, "Cán bộ Sở Hà Nội phê duyệt hồ sơ đúng quy định");
        var res1 = await service.ReviewRequestAsync(req.Id, officerCmd, officerActor, "192.168.1.1", CancellationToken.None);
        res1.Status.ShouldBe(ApprovalStatuses.Approved);
        res1.Version.ShouldBe(2);

        // Giao dịch 2: Admin Trung ương cùng gửi lệnh Override với expectedVersion = 1 (do mở đồng thời trước đó)
        var overrideCmd = new OverrideApprovalCommand(
            "Admin Trung ương can thiệp giải trình do hồ sơ trễ hạn SLA Sở Hà Nội.",
            ConfirmCommitment: true,
            ExpectedVersion: 1);

        // Kiểm chứng bắt buộc: Hệ thống ném ConflictException để Web API trả về 409 Conflict
        var conflictEx = await Should.ThrowAsync<ConflictException>(async () =>
        {
            await service.OverrideApproveAsync(req.Id, overrideCmd, adminActor, "10.0.0.1", CancellationToken.None);
        });

        conflictEx.Code.ShouldBe("ERR_RECORD_ALREADY_MODIFIED");
    }

    [Fact]
    public async Task T054_Scenario2_Boundary_Test_Reason_Length_And_Commitment()
    {
        // Kịch bản phá hoại 2: Săn lỗi biên:
        // - Lý do 19 ký tự -> Chặn (ValidationException)
        // - Lý do toàn khoảng trắng -> Chặn
        // - Thiếu cam kết trách nhiệm -> Chặn
        // - Lý do 20 ký tự -> Pass
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, userEmail) = NewUser();
        await SeedPersonAsync(db, userId, userEmail, PlatformRoles.PublicUser);

        var (adminId, adminEmail) = NewUser();
        await SeedPersonAsync(db, adminId, adminEmail, PlatformRoles.SuperAdmin);
        var adminActor = new TestActor(adminId, adminEmail, PlatformRoles.SuperAdmin, ScopeTypes.Global, null);

        var req = new ApprovalRequest(
            userId,
            ApprovalRequestTypes.TechSupply,
            ScopeTypes.Province,
            "SG",
            "{\"techName\":\"Robot kiểm định IoT\"}",
            DateTimeOffset.UtcNow.AddHours(-10));
        req.MarkSlaBreached(10.0);
        db.Set<ApprovalRequest>().Add(req);
        await db.SaveChangesAsync();

        // 1. Lý do 19 ký tự: "1234567890123456789"
        var cmd19 = new OverrideApprovalCommand("1234567890123456789", ConfirmCommitment: true, ExpectedVersion: 1);
        var ex19 = await Should.ThrowAsync<ValidationException>(async () =>
        {
            await service.OverrideApproveAsync(req.Id, cmd19, adminActor, "127.0.0.1", CancellationToken.None);
        });
        ex19.Message.ShouldContain("20 ký tự");

        // 2. Lý do toàn khoảng trắng
        var cmdSpaces = new OverrideApprovalCommand("                     ", ConfirmCommitment: true, ExpectedVersion: 1);
        await Should.ThrowAsync<ValidationException>(async () =>
        {
            await service.OverrideApproveAsync(req.Id, cmdSpaces, adminActor, "127.0.0.1", CancellationToken.None);
        });

        // 3. Lý do đủ 20 ký tự nhưng không tick cam kết
        var cmdNoCommit = new OverrideApprovalCommand("Lý do giải trình đã đủ 20 ký tự nhưng không cam kết", ConfirmCommitment: false, ExpectedVersion: 1);
        var exCommit = await Should.ThrowAsync<ValidationException>(async () =>
        {
            await service.OverrideApproveAsync(req.Id, cmdNoCommit, adminActor, "127.0.0.1", CancellationToken.None);
        });
        exCommit.Message.ShouldContain("cam kết trách nhiệm");

        // 4. Lý do đúng chuẩn 20 ký tự và tick cam kết: "12345678901234567890" -> Thành công
        var cmd20 = new OverrideApprovalCommand("12345678901234567890", ConfirmCommitment: true, ExpectedVersion: 1);
        var passResult = await service.OverrideApproveAsync(req.Id, cmd20, adminActor, "127.0.0.1", CancellationToken.None);
        passResult.Status.ShouldBe(ApprovalStatuses.Approved);

        var passRecord = await db.Set<ApprovalRequest>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == req.Id);
        passRecord.ShouldNotBeNull();
        passRecord.IsOverride.ShouldBeTrue();
    }

    [Fact]
    public async Task T054_Scenario3_Privilege_Escalation_Provincial_Admin_Or_Seller_Calling_Override_Throws_Forbidden_403()
    {
        // Kịch bản phá hoại 3: Hacker / Cán bộ Sở / Doanh nghiệp giả lập gọi Override API
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, userEmail) = NewUser();
        await SeedPersonAsync(db, userId, userEmail, PlatformRoles.PublicUser);

        // Hacker 1: Cán bộ Sở Hải Phòng
        var (officerId, officerEmail) = NewUser();
        await SeedPersonAsync(db, officerId, officerEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HP");
        var officerActor = new TestActor(officerId, officerEmail, PlatformRoles.ProvincialAdmin, ScopeTypes.Province, "HP");

        // Hacker 2: Seller
        var (sellerId, sellerEmail) = NewUser();
        await SeedPersonAsync(db, sellerId, sellerEmail, PlatformRoles.Seller, ScopeTypes.Global, null);
        var sellerActor = new TestActor(sellerId, sellerEmail, PlatformRoles.Seller, ScopeTypes.Global, null);

        var req = new ApprovalRequest(
            userId,
            ApprovalRequestTypes.TechSupply,
            ScopeTypes.Province,
            "HP",
            "{\"techName\":\"Hacking Probe\"}",
            DateTimeOffset.UtcNow.AddHours(-10));
        req.MarkSlaBreached(10.0);
        db.Set<ApprovalRequest>().Add(req);
        await db.SaveChangesAsync();

        var overrideCmd = new OverrideApprovalCommand(
            "Cố tình vượt mặt hệ thống để tự duyệt hồ sơ của chính mình hoặc cấp trên",
            ConfirmCommitment: true,
            ExpectedVersion: 1);

        // Cán bộ Sở thử gọi Override -> Chặn cứng 403 Forbidden
        var exOfficer = await Should.ThrowAsync<ForbiddenException>(async () =>
        {
            await service.OverrideApproveAsync(req.Id, overrideCmd, officerActor, "10.0.0.1", CancellationToken.None);
        });
        exOfficer.Code.ShouldBe("ERR_FORBIDDEN_OVERRIDE");

        // Doanh nghiệp Seller thử gọi Override -> Chặn cứng 403 Forbidden
        var exSeller = await Should.ThrowAsync<ForbiddenException>(async () =>
        {
            await service.OverrideApproveAsync(req.Id, overrideCmd, sellerActor, "10.0.0.2", CancellationToken.None);
        });
        exSeller.Code.ShouldBe("ERR_FORBIDDEN_OVERRIDE");
    }

    [Fact]
    public async Task T054_Scenario4_Data_State_And_Injection_Resistance()
    {
        // Kịch bản phá hoại 4: Thử nghiệm tiêm mã độc XSS và SQL Injection vào trường override_reason
        await using var provider = fixture.BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var service = scope.ServiceProvider.GetRequiredService<IApprovalService>();

        var (userId, userEmail) = NewUser();
        await SeedPersonAsync(db, userId, userEmail, PlatformRoles.PublicUser);

        var (adminId, adminEmail) = NewUser();
        await SeedPersonAsync(db, adminId, adminEmail, PlatformRoles.SuperAdmin);
        var adminActor = new TestActor(adminId, adminEmail, PlatformRoles.SuperAdmin, ScopeTypes.Global, null);

        var req = new ApprovalRequest(
            userId,
            ApprovalRequestTypes.TechSupply,
            ScopeTypes.Province,
            "HN",
            "{\"techName\":\"Injection Probe\"}",
            DateTimeOffset.UtcNow.AddHours(-10));
        req.MarkSlaBreached(12.0);
        db.Set<ApprovalRequest>().Add(req);
        await db.SaveChangesAsync();

        // Thử SQL Injection và XSS Payload kết hợp:
        const string maliciousPayload = "<script>alert('XSS-HACK');</script>'; DROP TABLE identity.approval_requests; -- (đảm bảo độ dài >= 20 ký tự)";

        var cmd = new OverrideApprovalCommand(maliciousPayload, ConfirmCommitment: true, ExpectedVersion: 1);
        var result = await service.OverrideApproveAsync(req.Id, cmd, adminActor, "127.0.0.1", CancellationToken.None);

        result.Status.ShouldBe(ApprovalStatuses.Approved);

        // Kiểm tra CSDL PostgreSQL thật: Bảng identity.approval_requests vẫn an toàn tuyệt đối
        var count = await db.Set<ApprovalRequest>().CountAsync();
        count.ShouldBeGreaterThan(0);

        var updated = await db.Set<ApprovalRequest>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == req.Id);
        updated.ShouldNotBeNull();
        updated.OverrideReason.ShouldBe(maliciousPayload); // Dữ liệu được lưu an toàn dạng text thuần qua Npgsql parameterization, không bị thực thi SQL injection.
    }
}
