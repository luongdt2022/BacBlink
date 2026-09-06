using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Case.Application;
using NacenTech.Modules.Policy.Application;
using NacenTech.PolicyEngine;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// Cổng done của ADR-0014, phần chỉ đo được khi có cơ sở dữ liệu thật: kết luận đường thực thi **đóng băng vào
/// ảnh chụp chính sách**, và đọc lại từ ảnh chụp chứ không tra lại tập luật hiện hành.
///
/// Bài quan trọng nhất ở đây là <see cref="A_frozen_funding_path_survives_a_config_change"/>. Không có nó, cả
/// thiết kế vẫn "chạy đúng" trong mọi bài khác — vì mọi bài khác chạy trên một cấu hình không đổi.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class FundingPathSnapshotTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    /// <summary>Ghi một tập luật tạm ra đĩa và trả về đường dẫn — `Funding:PolicySetPath` nhận đường dẫn tuyệt đối.</summary>
    private static string WriteRuleSet(params (string Instrument, bool Permitted)[] rules)
    {
        var body = string.Join(",\n", rules.Select(r =>
            $$"""{ "instrument": "{{r.Instrument}}", "executionInPlatformPermitted": {{(r.Permitted ? "true" : "false")}}, "legalBasisRef": "TEST/{{r.Instrument}}" }"""));

        var path = Path.Combine(Path.GetTempPath(), $"funding-{Guid.NewGuid():N}.json");
        File.WriteAllText(path, $$"""
        { "version": "test-v1", "effectiveFrom": "2026-09-06T00:00:00Z", "rules": [ {{body}} ] }
        """);
        return path;
    }

    /// <summary>
    /// `case.transition` chấm theo **vai trò trong hồ sơ**, không theo vai nền tảng — nên người thao tác phải là
    /// một bên của hồ sơ. Ở đây họ là môi giới chính, vai được phép chuyển giai đoạn.
    /// </summary>
    private static async Task<CaseDto> QualifiedCaseAsync(ServiceProvider provider, Guid actorPerson, string instrument)
    {
        using var scope = provider.CreateScope();
        var cases = scope.ServiceProvider.GetRequiredService<ICaseService>();

        var created = await cases.CreateAsync(new CreateCaseCommand(
            Tracks.ChallengePilot, "Hồ sơ đo đường tài chính", Guid.CreateVersion7(), Guid.CreateVersion7(), 1,
            "CONFIDENTIAL", actorPerson, instrument,
            instrument == FundingInstruments.Private ? null : $"VB/{instrument}"), Ct);

        return await cases.TransitionAsync(created.Id, new TransitionCommand(
            Stages.Qualification, Decisions.Approve, ["OK"], "đủ điều kiện", null, created.Version), Ct);
    }

    /// <summary>
    /// Đóng băng nghĩa là đóng băng. Hồ sơ chốt lúc `RND_TASK` còn được phép vẫn giữ kết luận đó sau khi cấu
    /// hình đóng công cụ ấy lại — nếu không, mọi hồ sơ đang chạy sẽ đổi luật giữa chừng mỗi lần đội sửa một
    /// tệp cấu hình, và ảnh chụp có hash trở thành đồ trang trí.
    /// </summary>
    [Fact]
    public async Task A_frozen_funding_path_survives_a_config_change()
    {
        var actorPerson = Guid.CreateVersion7();
        var permissive = WriteRuleSet((FundingInstruments.RndTask, true));
        var restrictive = WriteRuleSet((FundingInstruments.RndTask, false));

        Guid caseId;
        await using (var provider = fixture.BuildProvider(new TestActor().AsAdmin(actorPerson),
                         settings: new Dictionary<string, string?> { ["Funding:PolicySetPath"] = permissive }))
        {
            var qualified = await QualifiedCaseAsync(provider, actorPerson, FundingInstruments.RndTask);
            qualified.ExecutionInPlatformPermitted.ShouldBe(true);
            caseId = qualified.Id;
        }

        // Cùng hồ sơ đó, máy chủ khởi động lại với cấu hình đã siết.
        await using var after = fixture.BuildProvider(new TestActor().AsAdmin(actorPerson),
            settings: new Dictionary<string, string?> { ["Funding:PolicySetPath"] = restrictive });
        using var scope = after.CreateScope();

        var reread = await scope.ServiceProvider.GetRequiredService<ICaseService>().GetAsync(caseId, Ct);
        reread.ExecutionInPlatformPermitted.ShouldBe(true, "kết luận đã đóng băng, không tra lại tập luật hiện hành");

        var snapshot = await scope.ServiceProvider.GetRequiredService<IPolicySnapshotService>()
            .FindAsync(reread.PolicySnapshotId!.Value, Ct);
        using var doc = JsonDocument.Parse(snapshot!.DocumentJson);
        var fundingPath = doc.RootElement.GetProperty("fundingPath");
        fundingPath.GetProperty("instrument").GetString().ShouldBe(FundingInstruments.RndTask);
        fundingPath.GetProperty("executionInPlatformPermitted").GetBoolean().ShouldBeTrue();
        // Căn cứ đi cùng kết luận: một ảnh chụp nói "được phép" mà không nói theo văn bản nào thì tới lúc kiểm
        // toán không ai dựng lại được vì sao.
        fundingPath.GetProperty("legalBasisRef").GetString().ShouldBe($"TEST/{FundingInstruments.RndTask}");
    }

    /// <summary>
    /// Đường đầy đủ qua tầng dịch vụ: hồ sơ mua sắm công không vào được `EXECUTION`, và thông điệp nói tên lối
    /// ra đúng. Bài ở tầng bất biến đo cùng luật trên aggregate; bài này đo rằng tầng dịch vụ **truyền đúng công
    /// cụ** vào lệnh chốt — chỗ dễ hỏng nhất và là chỗ một bài chạy thẳng trên aggregate không chạm tới.
    /// </summary>
    [Fact]
    public async Task Procurement_is_blocked_at_execution_through_the_service()
    {
        var actorPerson = Guid.CreateVersion7();
        var path = WriteRuleSet((FundingInstruments.Private, true), (FundingInstruments.PublicProcurement, false));
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(actorPerson),
            settings: new Dictionary<string, string?> { ["Funding:PolicySetPath"] = path });

        var qualified = await QualifiedCaseAsync(provider, actorPerson, FundingInstruments.PublicProcurement);
        qualified.ExecutionInPlatformPermitted.ShouldBe(false);

        using var scope = provider.CreateScope();
        var cases = scope.ServiceProvider.GetRequiredService<ICaseService>();

        var version = qualified.Version;
        foreach (var stage in new[] { Stages.Matching, Stages.DueDiligence, Stages.DealDesign })
        {
            var moved = await cases.TransitionAsync(qualified.Id, new TransitionCommand(
                stage, Decisions.Approve, ["OK"], "đi tiếp", null, version), Ct);
            version = moved.Version;
        }

        var ex = await Should.ThrowAsync<UnprocessableException>(() => cases.TransitionAsync(qualified.Id,
            new TransitionCommand(Stages.Execution, Decisions.Approve, [], "thi công", null, version), Ct));
        ex.Code.ShouldBe("EXECUTION_PATH_NOT_LAWFUL");
        ex.Message.ShouldContain(Stages.HandedOver);
    }

    /// <summary>
    /// Hồ sơ chưa khai công cụ bị chặn ở `QUALIFICATION`, và — quan trọng hơn — **không để lại ảnh chụp mồ côi**.
    /// Lệnh chốt ảnh chụp tự commit, nên nếu `Transition` là chỗ đầu tiên hỏi thì mỗi lần trượt cổng sẽ sinh một
    /// ảnh chụp đã chốt cho một giai đoạn chưa bao giờ tới. Đây là câu hỏi mà ADR để ngỏ, và đây là câu trả lời.
    /// </summary>
    [Fact]
    public async Task An_undeclared_case_is_blocked_without_leaving_an_orphan_snapshot()
    {
        var actorPerson = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(actorPerson));
        using var scope = provider.CreateScope();
        var cases = scope.ServiceProvider.GetRequiredService<ICaseService>();

        var created = await cases.CreateAsync(new CreateCaseCommand(
            Tracks.ChallengePilot, "Chưa khai công cụ", Guid.CreateVersion7(), Guid.CreateVersion7(), 1,
            "CONFIDENTIAL", actorPerson), Ct);

        var ex = await Should.ThrowAsync<UnprocessableException>(() => cases.TransitionAsync(created.Id,
            new TransitionCommand(Stages.Qualification, Decisions.Approve, [], "đủ điều kiện", null, created.Version), Ct));
        ex.Code.ShouldBe("FUNDING_INSTRUMENT_REQUIRED");

        var stuck = await cases.GetAsync(created.Id, Ct);
        stuck.Stage.ShouldBe(Stages.Discovery);
        stuck.PolicySnapshotId.ShouldBeNull("trượt cổng thì không được để lại ảnh chụp đã chốt");
        stuck.ExecutionInPlatformPermitted.ShouldBeNull();

        // Khai rồi thì đi được — và đây là đường cứu hồ sơ tạo trước ADR-0014.
        var declared = await cases.DeclareFundingPathAsync(created.Id, FundingInstruments.Grant, "QD-99/QD-UBND", stuck.Version, Ct);
        var qualified = await cases.TransitionAsync(created.Id, new TransitionCommand(
            Stages.Qualification, Decisions.Approve, [], "đủ điều kiện", null, declared.Version), Ct);

        qualified.Stage.ShouldBe(Stages.Qualification);
        qualified.PolicySnapshotId.ShouldNotBeNull();
        // `GRANT` chưa có dòng trong tập luật đang phát hành → default DENY, và đó là câu trả lời chứ không phải lỗi.
        qualified.ExecutionInPlatformPermitted.ShouldBe(false);
    }
}
