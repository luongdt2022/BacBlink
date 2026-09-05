using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Audit.Application;
using NacenTech.Modules.Audit.Domain;
using NacenTech.Modules.Case.Application;
using NacenTech.Modules.DataRoom.Application;
using NacenTech.Persistence;
using NacenTech.PolicyEngine;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// Cổng done của ADR-0006.
///
/// Trước bản vá, nhật ký chỉ trả lời "ai đã bị từ chối" — mọi hành động ghi thành công đều không để lại dòng
/// nào, kể cả cấp và thu hồi quyền đọc dữ liệu mật. Khoảng trống này không lấp ngược được: dòng của hôm qua đã
/// không tồn tại. Bốn bài dưới đây giữ ba câu trả lời của ADR — ghi `SUCCESS` sau commit, "được phép" khác
/// "đã xảy ra", và cửa phân quyền nói `ALLOW` chứ không phải `PERMIT`.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class AuditSuccessPathTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    // Phải `await` BÊN TRONG scope: trả `Task` ra ngoài rồi huỷ scope là huỷ DbContext trong lúc truy vấn còn
    // chạy — lỗi nổi lên dưới dạng "BindComplete while expecting ReadyForQuery" của Npgsql, trông như lỗi driver.
    private static async Task<List<AuditEvent>> RowsAsync(ServiceProvider provider, Guid objectId, string outcome)
    {
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        return await db.Set<AuditEvent>().AsNoTracking()
            .Where(e => e.ObjectId == objectId && e.Outcome == outcome)
            .OrderBy(e => e.OccurredAt).ToListAsync(Ct);
    }

    /// <summary>Câu 1: tạo, gán môi giới, chuyển giai đoạn — mỗi việc xong để lại đúng một dòng `SUCCESS`.</summary>
    [Fact]
    public async Task Each_successful_case_command_leaves_exactly_one_success_row()
    {
        var owner = Guid.CreateVersion7();
        var broker = Guid.CreateVersion7();

        await using var adminProvider = fixture.BuildProvider(new TestActor().AsAdmin(owner));
        Guid caseId;
        using (var scope = adminProvider.CreateScope())
        {
            var cases = scope.ServiceProvider.GetRequiredService<ICaseService>();
            var created = await cases.CreateAsync(new CreateCaseCommand(
                Tracks.ChallengePilot, "Hồ sơ đo kiểm toán", owner, Guid.CreateVersion7(), 1, "CONFIDENTIAL", null), Ct);
            caseId = created.Id;
            await cases.AssignLeadBrokerAsync(caseId, broker, created.Version, Ct);
        }

        // Chuyển giai đoạn phải do môi giới chính làm — quyền theo vai trò trong hồ sơ (và B-42: người giữ
        // hai vai bị chấm theo vai đầu tiên, nên dùng hai người riêng biệt).
        await using var brokerProvider = fixture.BuildProvider(new TestActor().AsUser(broker));
        using (var scope = brokerProvider.CreateScope())
        {
            var cases = scope.ServiceProvider.GetRequiredService<ICaseService>();
            var current = await cases.GetAsync(caseId, Ct);
            await cases.TransitionAsync(caseId, new TransitionCommand(
                Stages.Qualification, Decisions.Approve, ["DU_DIEU_KIEN"], "đủ điều kiện", null, current.Version), Ct);
        }

        var success = await RowsAsync(adminProvider, caseId, AuditOutcomes.Success);
        success.Select(r => r.Action).ShouldBe([Actions.CaseCreate, Actions.CaseAssignBroker, Actions.CaseTransition]);
        success.ShouldAllBe(r => r.ObjectKind == "CommercializationCase");
        success.ShouldAllBe(r => !string.IsNullOrEmpty(r.CorrelationId));
        success[2].Details.ShouldNotBeNull();
        success[2].Details!.ShouldContain("DISCOVERY->QUALIFICATION");
        // Số phiên bản của hồ sơ SAU lệnh: đây là cột trống ở mọi dòng do cửa phân quyền ghi, và có giá trị ở
        // mọi dòng do tầng lệnh ghi — chính là cách phân biệt hai nguồn.
        success.ShouldAllBe(r => r.ObjectVersion != null);
    }

    /// <summary>
    /// Câu 1, ranh giới quan trọng nhất: "được phép" ≠ "đã xảy ra". Một lệnh qua được cửa phân quyền nhưng
    /// hỏng ở luật nghiệp vụ không được để lại dòng `SUCCESS` nào.
    /// </summary>
    [Fact]
    public async Task A_permitted_but_failed_command_leaves_no_success_row()
    {
        var owner = Guid.CreateVersion7();
        var broker = Guid.CreateVersion7();

        await using var adminProvider = fixture.BuildProvider(new TestActor().AsAdmin(owner));
        Guid caseId;
        using (var scope = adminProvider.CreateScope())
        {
            var cases = scope.ServiceProvider.GetRequiredService<ICaseService>();
            var created = await cases.CreateAsync(new CreateCaseCommand(
                Tracks.ChallengePilot, "Hồ sơ lệnh hỏng", owner, Guid.CreateVersion7(), 1, "CONFIDENTIAL", null), Ct);
            caseId = created.Id;
            await cases.AssignLeadBrokerAsync(caseId, broker, created.Version, Ct);
        }
        var before = (await RowsAsync(adminProvider, caseId, AuditOutcomes.Success)).Count;

        await using var brokerProvider = fixture.BuildProvider(new TestActor().AsUser(broker));
        using (var scope = brokerProvider.CreateScope())
        {
            var cases = scope.ServiceProvider.GetRequiredService<ICaseService>();
            var current = await cases.GetAsync(caseId, Ct);
            // Được phép (môi giới chính), nhưng sai loại quyết định cho WITHDRAWN (ADR-0008) → 422.
            await Should.ThrowAsync<UnprocessableException>(() => cases.TransitionAsync(caseId, new TransitionCommand(
                Stages.Withdrawn, Decisions.Approve, ["X"], "thử", null, current.Version), Ct));
        }

        var after = (await RowsAsync(adminProvider, caseId, AuditOutcomes.Success)).Count;
        after.ShouldBe(before, "lệnh không xong thì không có dòng 'đã xảy ra'");
    }

    /// <summary>Cấp và thu hồi quyền đọc dữ liệu mật — hai việc ADR-0006 gọi tên đích danh.</summary>
    [Fact]
    public async Task Issuing_and_revoking_a_grant_are_both_recorded()
    {
        var admin = Guid.CreateVersion7();
        var subject = SubjectRef.Technology(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(admin));

        Guid grantId;
        using (var scope = provider.CreateScope())
        {
            var dataRoom = scope.ServiceProvider.GetRequiredService<IDataRoomService>();
            var grant = await dataRoom.IssueGrantAsync(subject, Guid.CreateVersion7(), Purposes.All.First(),
                DataClassification.Confidential, null, Ct);
            grantId = grant.Id;
            await dataRoom.RevokeGrantAsync(grantId, Ct);
        }

        var rows = await RowsAsync(provider, grantId, AuditOutcomes.Success);
        rows.Select(r => r.Action).ShouldBe([Actions.AccessGrantIssue, Actions.AccessGrantRevoke]);
        rows.ShouldAllBe(r => r.ObjectKind == "AccessGrant");
        rows[0].Purpose.ShouldNotBeNullOrEmpty("dòng cấp quyền phải mang mục đích — đó là lý do mục đích tồn tại");
    }

    /// <summary>
    /// Câu 5: cửa phân quyền nói `ALLOW`, không phải `PERMIT`. Ba tầng từng dùng ba từ mà không test nào so.
    /// Chủ sở hữu mở tài liệu mật của mình → được phép, và vì là tài liệu mật nên được ghi.
    /// </summary>
    [Fact]
    public async Task The_gate_writes_allow_not_permit_for_a_confidential_read()
    {
        var owner = Guid.CreateVersion7();
        var subject = SubjectRef.Technology(Guid.CreateVersion7());
        await using var provider = fixture.BuildProvider(new TestActor().AsUser(owner));

        Guid documentId;
        using (var scope = provider.CreateScope())
        {
            var dataRoom = scope.ServiceProvider.GetRequiredService<IDataRoomService>();
            using var content = new MemoryStream("mat"u8.ToArray());
            var doc = await dataRoom.AddFileAsync(subject, owner, content, "mat.txt", "text/plain",
                FileTypes.Document, DataClassification.HighlyConfidential, Ct);
            documentId = doc.Id;
            var opened = await dataRoom.OpenAsync(documentId, owner, Ct);
            opened.ShouldNotBeNull();
            await opened.Value.Content.DisposeAsync();
        }

        var allow = await RowsAsync(provider, documentId, AuditOutcomes.Allow);
        allow.ShouldNotBeEmpty("đọc tài liệu mật được phép phải để lại dòng ALLOW");
        (await RowsAsync(provider, documentId, "PERMIT")).ShouldBeEmpty("từ vựng cũ PERMIT không được xuất hiện nữa");
    }

    /// <summary>Câu 4: lượt tra nhật ký tự ghi vào nhật ký. Ai canh người canh gác — câu trả lời ở đúng chỗ.</summary>
    [Fact]
    public async Task Reading_the_audit_log_is_itself_recorded()
    {
        var admin = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(admin));

        using (var scope = provider.CreateScope())
        {
            var audit = scope.ServiceProvider.GetRequiredService<IAuditQuery>();
            await audit.ListAsync(new AuditQueryFilter(Outcome: AuditOutcomes.Deny), PageRequest.Of(1, 5), Ct);
        }

        using var check = provider.CreateScope();
        var db = check.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        var view = await db.Set<AuditEvent>().AsNoTracking()
            .Where(e => e.ActorRef == admin && e.Action == Actions.StatsRead && e.Outcome == AuditOutcomes.Success)
            .OrderByDescending(e => e.OccurredAt).FirstOrDefaultAsync(Ct);

        view.ShouldNotBeNull();
        view.ObjectKind.ShouldBe("AuditEvent");
        view.Details.ShouldNotBeNull();
        view.Details!.ShouldContain("outcome=DENY", customMessage: "bộ lọc đã dùng phải nằm trong dòng ghi");
    }
}
