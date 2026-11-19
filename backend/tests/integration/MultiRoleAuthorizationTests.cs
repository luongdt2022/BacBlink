using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Audit.Domain;
using NacenTech.Modules.Case.Application;
using NacenTech.Persistence;
using NacenTech.PolicyEngine;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// B-42. `RoleOf` trả vai trò **đầu tiên theo thứ tự chèn**. Chủ bài toán được thêm lúc tạo hồ sơ; môi giới
/// chính thêm sau. Người giữ cả hai luôn bị chấm là `PROBLEM_OWNER` — vốn chỉ được `case.read` — và không
/// chuyển được giai đoạn chính hồ sơ mình phụ trách, với dòng kiểm toán ghi **vai trò sai**.
///
/// Kịch bản một người nhiều vai là thật: môi giới kiêm nhà tài trợ, bên đánh giá kiêm đồng môi giới. Và cách
/// hỏng là im lặng, sai chiều: từ chối thứ lẽ ra được phép. Lỗi này đã làm chính lượt đo vòng đời hồ sơ
/// (2026-09-05) sai một vòng — tôi dùng một tài khoản cho cả hai vai và tưởng luật phân quyền hỏng.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class MultiRoleAuthorizationTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    /// <summary>Người vừa là chủ bài toán vừa là môi giới chính phải chuyển được giai đoạn — vai môi giới cho phép.</summary>
    [Fact]
    public async Task A_person_holding_owner_and_lead_broker_can_transition()
    {
        var person = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(person));

        using var scope = provider.CreateScope();
        var cases = scope.ServiceProvider.GetRequiredService<ICaseService>();

        var created = await cases.CreateAsync(new CreateCaseCommand(
            Tracks.ChallengePilot, "Một người hai vai", person, Guid.CreateVersion7(), 1, "CONFIDENTIAL", null,
            FundingInstruments.Private), Ct);
        var assigned = await cases.AssignLeadBrokerAsync(created.Id, person, created.Version, Ct);

        // Trước bản vá: 403 DEFAULT_DENY, vì RoleOf trả PROBLEM_OWNER (chèn trước) và bỏ qua LEAD_BROKER.
        var moved = await cases.TransitionAsync(created.Id, new TransitionCommand(
            Stages.Qualification, Decisions.Approve, ["OK"], "hai vai, vai môi giới cho phép", null, assigned.Version), Ct);

        moved.Stage.ShouldBe(Stages.Qualification);
    }

    /// <summary>
    /// Nới đúng chỗ, không nới rộng: người CHỈ là chủ bài toán vẫn bị từ chối chuyển giai đoạn, và dòng kiểm
    /// toán DENY vẫn được ghi. Thêm "bất kỳ vai trò nào cho phép" không được biến "không vai trò nào cho
    /// phép" thành được phép.
    /// </summary>
    [Fact]
    public async Task A_person_who_is_only_the_owner_is_still_refused_and_the_denial_is_audited()
    {
        var owner = Guid.CreateVersion7();
        var broker = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor().AsUser(owner));

        Guid caseId;
        await using (var admin = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7())))
        using (var scope = admin.CreateScope())
        {
            var cases = scope.ServiceProvider.GetRequiredService<ICaseService>();
            var created = await cases.CreateAsync(new CreateCaseCommand(
                Tracks.ChallengePilot, "Chỉ chủ bài toán", owner, Guid.CreateVersion7(), 1, "CONFIDENTIAL", null,
                FundingInstruments.Private), Ct);
            caseId = created.Id;
            await cases.AssignLeadBrokerAsync(caseId, broker, created.Version, Ct);
        }

        using (var scope = provider.CreateScope())
        {
            var cases = scope.ServiceProvider.GetRequiredService<ICaseService>();
            var current = await cases.GetAsync(caseId, Ct);
            var ex = await Should.ThrowAsync<ForbiddenException>(() => cases.TransitionAsync(caseId, new TransitionCommand(
                Stages.Qualification, Decisions.Approve, ["OK"], "thử", null, current.Version), Ct));
            ex.RuleId.ShouldNotBeNullOrEmpty();
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var deny = await db.Set<AuditEvent>().AsNoTracking()
                .Where(e => e.ObjectId == caseId && e.ActorRef == owner && e.Outcome == AuditOutcomes.Deny)
                .FirstOrDefaultAsync(Ct);
            deny.ShouldNotBeNull("lượt bị từ chối vẫn phải để lại dấu vết sau khi nới luật nhiều vai");
        }
    }
}
