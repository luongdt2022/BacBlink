using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Audit.Domain;
using NacenTech.Modules.DataRoom.Application;
using NacenTech.Persistence;
using NacenTech.Persistence.Platform;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// Hai bài này giữ lại hai lỗi đã tìm ra khi chạy thật; cả hai đều im lặng nên chỉ test tích hợp mới bắt được.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class AuditAndQueueRegressionTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    /// <summary>
    /// §23.2: từ chối đọc tài liệu mật PHẢI để lại audit. Từ chối luôn ném exception, nên nếu bản ghi audit
    /// nằm trong transaction của command thì nó bị rollback cùng — hệ thống im lặng đúng lúc cần dấu vết nhất.
    /// </summary>
    [Fact]
    public async Task Denied_confidential_read_is_audited_even_though_request_fails()
    {
        var owner = Guid.CreateVersion7();
        var intruder = Guid.CreateVersion7();
        var subject = SubjectRef.Technology(Guid.CreateVersion7());

        var ownerActor = new TestActor().AsUser(owner);
        await using var ownerProvider = fixture.BuildProvider(ownerActor);
        Guid documentId;
        using (var scope = ownerProvider.CreateScope())
        {
            var dataRoom = scope.ServiceProvider.GetRequiredService<IDataRoomService>();
            using var content = new MemoryStream("secret blueprint"u8.ToArray());
            var doc = await dataRoom.AddFileAsync(subject, owner, content, "secret.txt", "text/plain",
                FileTypes.Document, DataClassification.HighlyConfidential, Ct);
            documentId = doc.Id;
        }

        var intruderActor = new TestActor().AsUser(intruder);
        await using var intruderProvider = fixture.BuildProvider(intruderActor);
        using (var scope = intruderProvider.CreateScope())
        {
            var dataRoom = scope.ServiceProvider.GetRequiredService<IDataRoomService>();
            await Should.ThrowAsync<ForbiddenException>(async () =>
                await dataRoom.OpenAsync(documentId, intruder, Ct));
        }

        using (var scope = ownerProvider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var denial = await db.Set<AuditEvent>().AsNoTracking()
                .Where(e => e.ObjectId == documentId && e.Outcome == "DENY")
                .OrderByDescending(e => e.OccurredAt)
                .FirstOrDefaultAsync(Ct);

            denial.ShouldNotBeNull("DENY trên tài liệu mật phải được ghi audit dù request thất bại");
            denial.Action.ShouldBe("document.read");
            denial.ActorRef.ShouldBe(intruder);
            denial.RuleId.ShouldNotBeNullOrWhiteSpace();
            denial.RuleId!.ShouldContain("DENY_CONFIDENTIAL_WITHOUT_GRANT");
        }
    }

    /// <summary>
    /// Hai sự kiện cùng yêu cầu một việc (nội dung đổi + được publish) là bình thường. Trùng `dedupKey`
    /// phải bị bỏ qua im lặng; nếu nó ném lỗi thì cả transaction hỏng và outbox kẹt vĩnh viễn.
    /// </summary>
    [Fact]
    public async Task Duplicate_job_dedup_key_does_not_break_the_transaction()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsSystem());
        var dedupKey = $"chunk-embed:test:{Guid.CreateVersion7()}";

        using (var scope = provider.CreateScope())
        {
            var jobs = scope.ServiceProvider.GetRequiredService<IJobQueue>();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            jobs.Enqueue(new SampleJob("first"), dedupKey: dedupKey);
            jobs.Enqueue(new SampleJob("second"), dedupKey: dedupKey);
            await uow.CommitAsync(Ct);
        }

        // Transaction thứ hai với cùng key: không được ném, và không được tạo thêm hàng.
        using (var scope = provider.CreateScope())
        {
            var jobs = scope.ServiceProvider.GetRequiredService<IJobQueue>();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            jobs.Enqueue(new SampleJob("third"), dedupKey: dedupKey);
            await Should.NotThrowAsync(async () => await uow.CommitAsync(Ct));
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var count = await db.JobQueue.AsNoTracking().CountAsync(j => j.DedupKey == dedupKey, Ct);
            count.ShouldBe(1);
        }
    }

    /// <summary>Job không có dedupKey thì được phép trùng lặp — dedup là tùy chọn, không phải mặc định.</summary>
    [Fact]
    public async Task Jobs_without_dedup_key_are_all_enqueued()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsSystem());
        var kind = typeof(SampleJob).FullName!;
        var before = await CountJobsAsync(provider, kind, Ct);

        using (var scope = provider.CreateScope())
        {
            var jobs = scope.ServiceProvider.GetRequiredService<IJobQueue>();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            jobs.Enqueue(new SampleJob("a"));
            jobs.Enqueue(new SampleJob("b"));
            await uow.CommitAsync(Ct);
        }

        var after = await CountJobsAsync(provider, kind, Ct);
        after.ShouldBe(before + 2);
    }

    private static async Task<int> CountJobsAsync(ServiceProvider provider, string kind, CancellationToken ct)
    {
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        return await db.JobQueue.AsNoTracking().CountAsync(j => j.Kind == kind && j.DedupKey == null, ct);
    }

    /// <summary>Outbox nhận domain event trong cùng transaction của command (§21.2, MOD-03).</summary>
    [Fact]
    public async Task Domain_events_land_in_outbox_within_the_same_transaction()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsSystem());
        var before = await CountOutboxAsync(provider, Ct);

        using (var scope = provider.CreateScope())
        {
            var outbox = scope.ServiceProvider.GetRequiredService<IOutbox>();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            outbox.Enqueue(new Contracts.Events.SubjectPublished(SubjectRef.Demand(Guid.CreateVersion7()), null));
            await uow.CommitAsync(Ct);
        }

        var after = await CountOutboxAsync(provider, Ct);
        after.ShouldBe(before + 1);
    }

    private static async Task<int> CountOutboxAsync(ServiceProvider provider, CancellationToken ct)
    {
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        return await db.OutboxMessages.AsNoTracking().CountAsync(ct);
    }

    private sealed record SampleJob(string Marker) : IJob;
}
