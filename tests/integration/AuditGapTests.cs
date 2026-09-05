using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Audit.Application;
using NacenTech.Modules.Audit.Domain;
using NacenTech.Modules.DataRoom.Application;
using NacenTech.Persistence;
using NacenTech.Persistence.Platform;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// Hai khoảng trống của nhật ký kiểm toán, và cả hai phải lấp **trước** khi có màn hình nhật ký — một màn hình
/// dựng trên nhật ký có lỗ tạo cảm giác an toàn sai, và đó là loại sai tệ nhất mà một công cụ kiểm toán có thể
/// gây ra.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class AuditGapTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    /// <summary>
    /// B-29. Đường **mở** một tài liệu đi qua cửa ghi nên nó để lại dấu vết; đường **liệt kê** chỉ hỏi bảng
    /// quyết định, nên cách phổ biến nhất mà một người chạm vào tài liệu mật họ không được đọc lại là cách duy
    /// nhất không để lại vết.
    /// </summary>
    [Fact]
    public async Task Documents_filtered_out_of_a_listing_leave_a_denial_row()
    {
        var owner = Guid.CreateVersion7();
        var intruder = Guid.CreateVersion7();
        var subject = SubjectRef.Technology(Guid.CreateVersion7());

        await using var ownerProvider = fixture.BuildProvider(new TestActor().AsUser(owner));
        using (var scope = ownerProvider.CreateScope())
        {
            var dataRoom = scope.ServiceProvider.GetRequiredService<IDataRoomService>();
            using var secret = new MemoryStream("cong thuc mat"u8.ToArray());
            await dataRoom.AddFileAsync(subject, owner, secret, "mat.txt", "text/plain",
                FileTypes.Document, DataClassification.HighlyConfidential, Ct);
            using var open = new MemoryStream("ai cung doc duoc"u8.ToArray());
            await dataRoom.AddFileAsync(subject, owner, open, "cong-khai.txt", "text/plain",
                FileTypes.Document, DataClassification.Public, Ct);
        }

        await using var intruderProvider = fixture.BuildProvider(new TestActor().AsUser(intruder));
        using (var scope = intruderProvider.CreateScope())
        {
            var dataRoom = scope.ServiceProvider.GetRequiredService<IDataRoomService>();
            var visible = await dataRoom.ListReadableAsync(subject, intruder, Ct);

            // Lọc vẫn phải đúng: tài liệu mật không được lọt ra.
            visible.Count.ShouldBe(1);
            visible[0].Classification.ShouldBe(DataClassification.Public);
        }

        using (var scope = ownerProvider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var denial = await db.Set<AuditEvent>().AsNoTracking()
                .Where(e => e.ObjectId == subject.Id && e.ObjectKind == "DocumentList" && e.Outcome == "DENY")
                .OrderByDescending(e => e.OccurredAt)
                .FirstOrDefaultAsync(Ct);

            denial.ShouldNotBeNull("lượt bị loại khỏi danh sách phải để lại dấu vết");
            denial.ActorRef.ShouldBe(intruder);
            denial.Action.ShouldBe("document.read");
            // Một dòng TỔNG HỢP, không phải một dòng cho mỗi tài liệu: một bản ghi 40 tài liệu mật không được
            // đẻ 40 dòng mỗi lần ai đó mở trang.
            denial.Details.ShouldNotBeNull();
            denial.Details!.ShouldContain("excludedCount=1");
            denial.Details!.ShouldContain("HIGHLY_CONFIDENTIAL=1");
        }
    }

    /// <summary>Chủ sở hữu đọc được mọi thứ của mình, nên không có gì bị loại và **không dòng nào** được sinh.</summary>
    [Fact]
    public async Task A_listing_with_nothing_filtered_out_writes_no_denial_row()
    {
        var owner = Guid.CreateVersion7();
        var subject = SubjectRef.Technology(Guid.CreateVersion7());

        await using var provider = fixture.BuildProvider(new TestActor().AsUser(owner));
        using (var scope = provider.CreateScope())
        {
            var dataRoom = scope.ServiceProvider.GetRequiredService<IDataRoomService>();
            using var secret = new MemoryStream("cong thuc mat"u8.ToArray());
            await dataRoom.AddFileAsync(subject, owner, secret, "mat.txt", "text/plain",
                FileTypes.Document, DataClassification.HighlyConfidential, Ct);
        }

        using (var scope = provider.CreateScope())
        {
            var dataRoom = scope.ServiceProvider.GetRequiredService<IDataRoomService>();
            (await dataRoom.ListReadableAsync(subject, owner, Ct)).Count.ShouldBe(1);
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var rows = await db.Set<AuditEvent>().AsNoTracking()
                .CountAsync(e => e.ObjectId == subject.Id && e.ObjectKind == "DocumentList", Ct);
            rows.ShouldBe(0, "không có gì bị loại thì không có gì để ghi — nhật ký không được tự làm dày mình");
        }
    }

    /// <summary>
    /// B-30. Ba mảnh phải đủ: bộ chạy nền quét mục quá hạn, một xử lý đăng ký cho loại nghĩa vụ, và một thứ
    /// tạo ra mục lịch đầu tiên. Trước sprint 4 chỉ có mảnh thứ nhất, nên việc cắt dấu vết thiết bị **chưa bao
    /// giờ chạy** và IP với trình duyệt được giữ vô thời hạn.
    /// </summary>
    [Fact]
    public async Task Expired_device_traces_are_cut_while_the_audit_row_stays_intact()
    {
        var actor = Guid.CreateVersion7();
        var subject = SubjectRef.Technology(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(new TestActor().AsUser(actor));

        Guid oldRowId;
        Guid freshRowId;
        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var old = new AuditEvent(actor, PlatformRoles.User, "document.read", "Document", subject.Id, null,
                null, "DENY", "R1", "corr-old", "10.0.0.1", "Mozilla/5.0", null,
                DateTimeOffset.UtcNow.AddDays(-400));
            var fresh = new AuditEvent(actor, PlatformRoles.User, "document.read", "Document", subject.Id, null,
                null, "DENY", "R1", "corr-fresh", "10.0.0.2", "curl/8", null,
                DateTimeOffset.UtcNow);
            db.Add(old);
            db.Add(fresh);
            await db.SaveChangesAsync(Ct);
            oldRowId = old.Id;
            freshRowId = fresh.Id;
        }

        using (var scope = provider.CreateScope())
        {
            var audit = scope.ServiceProvider.GetRequiredService<IAuditQuery>();
            await audit.PurgeDeviceDataAsync(DateTimeOffset.UtcNow.AddDays(-90), Ct);
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var old = await db.Set<AuditEvent>().AsNoTracking().FirstAsync(e => e.Id == oldRowId, Ct);
            var fresh = await db.Set<AuditEvent>().AsNoTracking().FirstAsync(e => e.Id == freshRowId, Ct);

            old.IpAddress.ShouldBeNull();
            old.UserAgent.ShouldBeNull();
            // Dòng ở lại NGUYÊN VẸN: ai làm gì, khi nào, có được phép không — tất cả vẫn còn.
            old.Action.ShouldBe("document.read");
            old.Outcome.ShouldBe("DENY");
            old.RuleId.ShouldBe("R1");
            old.CorrelationId.ShouldBe("corr-old");

            fresh.IpAddress.ShouldBe("10.0.0.2", "dòng còn trong hạn lưu không được đụng tới");
        }
    }

    /// <summary>
    /// Mảnh thứ ba: có ai xếp nghĩa vụ vào lịch không. Không có nó thì dù xử lý đã đăng ký, bảng lịch vẫn rỗng
    /// và không gì được gọi — đúng tình trạng trước sprint 4.
    /// </summary>
    [Fact]
    public async Task The_retention_review_obligation_gets_scheduled_and_is_not_duplicated()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsSystem());
        var scheduler = provider.GetRequiredService<IObligationScheduler>();
        var kind = $"TEST_{Guid.CreateVersion7():N}";

        (await scheduler.EnsureScheduledAsync(kind, DateTimeOffset.UtcNow, Ct)).ShouldBeTrue();
        (await scheduler.EnsureScheduledAsync(kind, DateTimeOffset.UtcNow, Ct))
            .ShouldBeFalse("đã có mục đang chờ thì không xếp thêm — nếu không, mỗi lần khởi động lại đẻ một mục");

        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var count = await db.ScheduledObligations.AsNoTracking()
            .CountAsync(o => o.Kind == kind && o.State == ScheduledObligationStates.Scheduled, Ct);
        count.ShouldBe(1);
    }

    /// <summary>
    /// Việc định kỳ phải **tự nối lượt kế tiếp**, và đây là chỗ nó suýt không nối.
    ///
    /// Bộ chạy nền chỉ đánh dấu mục lịch là `FIRED` **sau khi** xử lý trả về, nên trong lúc xử lý chạy, mục của
    /// chính nó vẫn đang ở trạng thái chờ. Phép chống trùng khi đó thấy chính nó và bỏ qua — lượt kế tiếp không
    /// bao giờ được xếp, và việc rà chạy đúng một lần mỗi lần khởi động rồi im lặng dừng.
    ///
    /// Không test đơn vị nào bắt được nó: từng mảnh đều đúng, chỉ thứ tự giữa chúng là sai. Nó lộ ra khi quan
    /// sát cả vòng trên máy chủ thật, và bài này giữ lại phép quan sát đó.
    /// </summary>
    [Fact]
    public async Task A_recurring_obligation_schedules_its_next_run_without_seeing_itself()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsSystem());
        var scheduler = provider.GetRequiredService<IObligationScheduler>();
        var kind = $"TEST_RECUR_{Guid.CreateVersion7():N}";

        await scheduler.EnsureScheduledAsync(kind, DateTimeOffset.UtcNow, Ct);

        Guid running;
        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            running = await db.ScheduledObligations.AsNoTracking()
                .Where(o => o.Kind == kind).Select(o => o.Id).FirstAsync(Ct);
        }

        // Đúng tình huống của xử lý đang chạy: mục của chính nó vẫn `SCHEDULED`.
        var chained = await scheduler.EnsureScheduledAsync(
            kind, DateTimeOffset.UtcNow.AddHours(24), Ct, excludeObligationId: running);

        chained.ShouldBeTrue("xử lý phải xếp được lượt kế tiếp dù mục của chính nó chưa được đánh dấu FIRED");

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var pending = await db.ScheduledObligations.AsNoTracking()
                .CountAsync(o => o.Kind == kind && o.State == ScheduledObligationStates.Scheduled, Ct);
            pending.ShouldBe(2, "một mục đang chạy và một mục cho lượt kế tiếp");
        }
    }

    /// <summary>Loại nghĩa vụ `RETENTION_REVIEW` phải có xử lý đăng ký — trước đây không loại nào có.</summary>
    [Fact]
    public void A_handler_is_registered_for_the_retention_review_obligation()
    {
        using var provider = fixture.BuildProvider(new TestActor().AsSystem());
        using var scope = provider.CreateScope();

        var kinds = scope.ServiceProvider.GetServices<IScheduledObligationHandler>().Select(h => h.Kind).ToList();
        kinds.ShouldContain(ObligationKinds.RetentionReview);
    }
}
