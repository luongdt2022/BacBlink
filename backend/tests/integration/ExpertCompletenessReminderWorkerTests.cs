using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Communication.Application;
using NacenTech.Modules.Communication.Domain;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.Persistence.Workers;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// TASK-05 Delta v15 [CR-2026-008]: Trọn bộ kiểm thử cho ExpertCompletenessReminderWorker
/// Kiểm chứng BR-EXP-044 (chỉ hồ sơ APPROVED có PersonId),
/// BR-EXP-045 (điểm &lt; 70% hoặc stale &gt; 30 ngày),
/// và BR-EXP-046 (chống spam tối đa 1 thông báo/chuyên gia/7 ngày).
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class ExpertCompletenessReminderWorkerTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    [Fact]
    public async Task Worker_sends_reminder_for_approved_profile_with_low_completeness()
    {
        var clock = new TestClock(new DateTimeOffset(2026, 10, 1, 0, 0, 0, TimeSpan.Zero));
        var personId = Guid.CreateVersion7();

        await using var provider = fixture.BuildProvider(
            clock: clock,
            configure: services => services.AddNacenTechWorkers());

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var profile = ExpertProfile.CreateQuickIntake(
                "TS. Lê Hoài An",
                "0912345678",
                $"expert-{personId:N}@test.local",
                "DOCTOR",
                "Viện Công nghệ",
                "CN_THONG_TIN",
                ["AI"],
                null,
                clock.UtcNow);
            profile.LinkToPerson(personId);
            profile.Approve("Đạt hồ sơ sơ bộ");

            db.Add(profile);
            await db.SaveChangesAsync(Ct);
        }

        // Thực thi worker quét lần đầu
        var worker = new ExpertCompletenessReminderWorker(
            provider.GetRequiredService<IServiceScopeFactory>(),
            NullLogger<ExpertCompletenessReminderWorker>.Instance);

        var sentCount = await worker.RunOnceAsync(personId, Ct);
        sentCount.ShouldBe(1, "Hồ sơ approved có điểm completeness < 70% phải được gửi nhắc nhở.");

        // Kiểm tra thông báo lưu trong CSDL
        using (var verifyScope = provider.CreateScope())
        {
            var db = verifyScope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var notifications = await db.Set<Notification>().AsNoTracking()
                .Where(n => n.PersonId == personId && n.Type == NotificationTypes.ExpertCompletenessReminder)
                .ToListAsync(Ct);

            notifications.Count.ShouldBe(1);
            var notif = notifications[0];
            notif.IsRead.ShouldBeFalse();

            using var doc = JsonDocument.Parse(notif.Payload);
            var root = doc.RootElement;
            root.GetProperty("navigationPath").GetString().ShouldBe("/portal/expert/profile/edit");
            root.GetProperty("completenessScore").GetInt32().ShouldBeLessThan(70);
            root.GetProperty("isStale").GetBoolean().ShouldBeFalse();
            root.GetProperty("missingItems").GetArrayLength().ShouldBeGreaterThan(0);
        }
    }

    [Fact]
    public async Task Worker_ignores_pending_review_and_unlinked_profiles()
    {
        var clock = new TestClock(new DateTimeOffset(2026, 10, 1, 0, 0, 0, TimeSpan.Zero));
        var personPending = Guid.CreateVersion7();

        await using var provider = fixture.BuildProvider(
            clock: clock,
            configure: services => services.AddNacenTechWorkers());

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

            // 1. Hồ sơ PENDING_REVIEW (chưa approved)
            var pendingProfile = ExpertProfile.CreateQuickIntake(
                "Đang chờ duyệt",
                "0911111111",
                $"pending-{personPending:N}@test.local",
                "DOCTOR",
                "Viện Kiểm Định",
                "CN_THONG_TIN",
                ["AI"],
                null,
                clock.UtcNow);
            pendingProfile.LinkToPerson(personPending);

            // 2. Hồ sơ APPROVED nhưng chưa liên kết tài khoản PersonId
            var unlinkedProfile = ExpertProfile.CreateQuickIntake(
                "Chưa liên kết",
                "0922222222",
                "unlinked@test.local",
                "DOCTOR",
                "Viện Kiểm Định",
                "CN_THONG_TIN",
                ["AI"],
                null,
                clock.UtcNow);
            unlinkedProfile.Approve("Đạt");

            db.AddRange(pendingProfile, unlinkedProfile);
            await db.SaveChangesAsync(Ct);
        }

        var worker = new ExpertCompletenessReminderWorker(
            provider.GetRequiredService<IServiceScopeFactory>(),
            NullLogger<ExpertCompletenessReminderWorker>.Instance);

        var sentCount = await worker.RunOnceAsync(Ct);
        sentCount.ShouldBe(0, "Hồ sơ chưa duyệt hoặc không có PersonId không được gửi nhắc nhở.");
    }

    [Fact]
    public async Task Worker_enforces_antispam_idempotency_within_7_days()
    {
        var clock = new TestClock(new DateTimeOffset(2026, 10, 1, 0, 0, 0, TimeSpan.Zero));
        var personId = Guid.CreateVersion7();

        await using var provider = fixture.BuildProvider(
            clock: clock,
            configure: services => services.AddNacenTechWorkers());

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var profile = ExpertProfile.CreateQuickIntake(
                "TS. Hoàng Vũ",
                "0933333333",
                $"antispam-{personId:N}@test.local",
                "DOCTOR",
                "Viện Toán học",
                "CN_THONG_TIN",
                ["MATH"],
                null,
                clock.UtcNow);
            profile.LinkToPerson(personId);
            profile.Approve("Đạt");

            db.Add(profile);
            await db.SaveChangesAsync(Ct);
        }

        var worker = new ExpertCompletenessReminderWorker(
            provider.GetRequiredService<IServiceScopeFactory>(),
            NullLogger<ExpertCompletenessReminderWorker>.Instance);

        // Lần chạy 1: Gửi thành công 1 thông báo
        var firstRun = await worker.RunOnceAsync(personId, Ct);
        firstRun.ShouldBe(1);

        // Lần chạy 2 (cùng ngày / trong vòng 7 ngày): Bị chặn bởi rate limit
        var secondRun = await worker.RunOnceAsync(personId, Ct);
        secondRun.ShouldBe(0, "Không được gửi lặp lại trong vòng 7 ngày.");

        // Chạy lại sau 3 ngày: Vẫn bị chặn
        clock.Advance(TimeSpan.FromDays(3));
        var thirdRun = await worker.RunOnceAsync(personId, Ct);
        thirdRun.ShouldBe(0, "Sau 3 ngày vẫn trong ngưỡng 7 ngày, tiếp tục bị chặn.");

        // Tua đồng hồ sang ngày thứ 8 (quá 7 ngày): Cho phép gửi thông báo kế tiếp
        clock.Advance(TimeSpan.FromDays(5)); // tổng cộng đã qua 8 ngày
        var fourthRun = await worker.RunOnceAsync(personId, Ct);
        fourthRun.ShouldBe(1, "Sau 8 ngày (vượt mốc 7 ngày) được phép gửi nhắc nhở chu kỳ mới.");

        // Tổng số thông báo lưu trong CSDL là 2
        using (var verifyScope = provider.CreateScope())
        {
            var db = verifyScope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var count = await db.Set<Notification>().CountAsync(
                n => n.PersonId == personId && n.Type == NotificationTypes.ExpertCompletenessReminder, Ct);
            count.ShouldBe(2);
        }
    }

    [Fact]
    public async Task Worker_sends_reminder_for_stale_profile_over_30_days_even_if_high_score()
    {
        var clock = new TestClock(new DateTimeOffset(2026, 10, 1, 0, 0, 0, TimeSpan.Zero));
        var personId = Guid.CreateVersion7();

        await using var provider = fixture.BuildProvider(
            clock: clock,
            configure: services => services.AddNacenTechWorkers());

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

            // Tạo hồ sơ đầy đủ thông tin (Score = 100%)
            var profile = new ExpertProfile(
                personId,
                "GS.TS. Phạm Hải",
                1970,
                "male",
                null,
                null,
                "PROFESSOR",
                2015,
                "DOCTOR",
                2000,
                "Đại học Quốc gia",
                "Hà Nội",
                "Viện trưởng",
                "Chuyên gia cấp cao",
                ["CN_THONG_TIN"],
                "[{\"school\":\"VNU\"}]",
                "[{\"company\":\"VNU\"}]",
                "[{\"title\":\"AI Research Paper\"}]",
                "Tư vấn chính sách chuyển đổi số",
                true,
                true,
                clock.UtcNow,
                true,
                ["AI", "TRANSFORMATION"]);

            profile.LinkToPerson(personId);
            profile.Approve("Đạt");
            profile.SetPublicListing(true, true, "Tiểu sử nghiên cứu khoa học chuyên sâu");

            // Giả lập hồ sơ cũ 35 ngày trước (Stale > 30 ngày)
            profile.ApplyLegacy(TestLegacy("1"), clock.UtcNow.AddDays(-35), clock.UtcNow.AddDays(-35));

            db.Add(profile);
            await db.SaveChangesAsync(Ct);
        }

        var worker = new ExpertCompletenessReminderWorker(
            provider.GetRequiredService<IServiceScopeFactory>(),
            NullLogger<ExpertCompletenessReminderWorker>.Instance);

        var sentCount = await worker.RunOnceAsync(personId, Ct);
        sentCount.ShouldBe(1, "Hồ sơ stale > 30 ngày phải được nhắc nhở rà soát cập nhật.");

        using (var verifyScope = provider.CreateScope())
        {
            var db = verifyScope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var notif = await db.Set<Notification>().SingleAsync(
                n => n.PersonId == personId && n.Type == NotificationTypes.ExpertCompletenessReminder, Ct);

            using var doc = JsonDocument.Parse(notif.Payload);
            var root = doc.RootElement;
            root.GetProperty("isStale").GetBoolean().ShouldBeTrue();
            root.GetProperty("completenessScore").GetInt32().ShouldBe(100);
            root.GetProperty("message").GetString().ShouldNotBeNull().ShouldContain("hơn 30 ngày qua");
        }
    }

    [Fact]
    public async Task Worker_skips_profile_that_is_complete_and_recently_updated()
    {
        var clock = new TestClock(new DateTimeOffset(2026, 10, 1, 0, 0, 0, TimeSpan.Zero));
        var personId = Guid.CreateVersion7();

        await using var provider = fixture.BuildProvider(
            clock: clock,
            configure: services => services.AddNacenTechWorkers());

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

            // Tạo hồ sơ đầy đủ thông tin (Score = 100%) và vừa mới cập nhật 2 ngày trước
            var profile = new ExpertProfile(
                personId,
                "GS.TS. Đỗ Quyết",
                1972,
                "male",
                null,
                null,
                "PROFESSOR",
                2016,
                "DOCTOR",
                2001,
                "Học viện Quân Y",
                "Hà Nội",
                "Giám đốc viện",
                "Chuyên gia KHCN",
                ["Y_DUOC"],
                "[{\"school\":\"HVQY\"}]",
                "[{\"company\":\"HVQY\"}]",
                "[{\"title\":\"Y học thực nghiệm\"}]",
                "Tư vấn y sinh học",
                true,
                true,
                clock.UtcNow,
                true,
                ["Y_TE"]);

            profile.LinkToPerson(personId);
            profile.Approve("Đạt");
            profile.SetPublicListing(true, true, "Tiểu sử y học thực chứng");

            // Mới cập nhật 2 ngày trước
            profile.ApplyLegacy(TestLegacy("2"), clock.UtcNow.AddDays(-2), clock.UtcNow.AddDays(-2));

            db.Add(profile);
            await db.SaveChangesAsync(Ct);
        }

        var worker = new ExpertCompletenessReminderWorker(
            provider.GetRequiredService<IServiceScopeFactory>(),
            NullLogger<ExpertCompletenessReminderWorker>.Instance);

        var sentCount = await worker.RunOnceAsync(personId, Ct);
        sentCount.ShouldBe(0, "Hồ sơ đạt 100% độ hoàn thiện và cập nhật gần đây không cần gửi thông báo.");
    }

    private static LegacyRef TestLegacy(string id) =>
        new(LegacyRef.NacenTwin, "experts", id, "hash", DateTimeOffset.UtcNow, "v1", Guid.CreateVersion7());
}
