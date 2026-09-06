using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Case.Application;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Matching.Application;
using NacenTech.Modules.Matching.Domain;
using NacenTech.Modules.Technology.Application;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// Nguyên tắc 11: *mọi shortlist phải có reason **và** exclusion reason*. Trước bộ này, vế đầu là một nhãn thuật
/// toán giống hệt nhau ở mọi dòng — tức không giải thích gì — và vế sau không tồn tại: ứng viên bị loại biến mất
/// im lặng, nên rà lại một shortlist là dựng lại bằng tay.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class MatchExplainabilityTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    /// <summary>Từ khoá riêng cho mỗi lần chạy — chỉ mục dùng chung cả bộ test (B-47).</summary>
    private readonly string _marker = "qqzt" + Guid.NewGuid().ToString("N")[..8];

    private static ServiceProvider Provider(PostgresFixture f, TestActor actor, IDictionary<string, string?>? settings = null)
        => f.BuildProvider(actor, settings: settings, configure: s => s.AddSingleton<IEmbeddingClient, FakeEmbeddingClient>());

    private async Task<Guid> PublishTechnologyAsync(IServiceProvider provider, Guid owner, string body)
    {
        using var scope = provider.CreateScope();
        var tech = scope.ServiceProvider.GetRequiredService<ITechnologyService>();
        var matching = scope.ServiceProvider.GetRequiredService<IMatchingService>();
        var asset = await tech.CreateAsync(new CreateTechnologyCommand(
            OwnerPersonId: owner, Title: $"{_marker} công nghệ", Description: body, AiProcessedContent: null,
            PublicationStatus: PublicationStatuses.Published, SectorIds: [], CategoryId: null), Ct);
        await matching.ChunkEmbedAndIndexAsync(SubjectRef.Technology(asset.Id), Ct);
        return asset.Id;
    }

    private async Task<Guid> PublishDemandAsync(IServiceProvider provider, Guid owner, string body)
    {
        using var scope = provider.CreateScope();
        var demands = scope.ServiceProvider.GetRequiredService<IDemandService>();
        var brief = await demands.CreateAsync(new CreateDemandCommand(
            Title: $"{_marker} nhu cầu", ProblemStatement: body, OwnerPersonId: owner,
            Status: DemandStatuses.Published, SectorIds: [], CategoryId: null, AiProcessedContent: null), Ct);
        return brief.Id;
    }

    /// <summary>
    /// Loại **sạch** là trường hợp dễ mất dấu nhất: hệ thống thu hồi được ứng viên rồi bỏ hết, và broker chỉ thấy
    /// "không có kết quả". Vòng rỗng kèm danh sách loại là thứ duy nhất phân biệt được *không tìm thấy gì* với
    /// *tìm thấy nhưng loại hết vì ngưỡng*.
    /// </summary>
    [Fact]
    public async Task When_every_candidate_is_excluded_the_round_still_records_why()
    {
        var owner = Guid.CreateVersion7();
        var seeker = Guid.CreateVersion7();
        var actor = new TestActor().AsAdmin(seeker);
        await using var provider = Provider(fixture, actor,
            settings: new Dictionary<string, string?> { ["Matching:MatchMinScore"] = "999" });

        await PublishTechnologyAsync(provider, owner, $"{_marker} {_marker} màng lọc sinh học");
        var briefId = await PublishDemandAsync(provider, seeker, $"{_marker} {_marker} màng lọc sinh học");

        using (var scope = provider.CreateScope())
        {
            var matching = scope.ServiceProvider.GetRequiredService<IMatchingService>();
            await matching.ChunkEmbedAndIndexAsync(SubjectRef.Demand(briefId), Ct);
            (await matching.ComputeMatchesAsync(SubjectRef.Demand(briefId), Ct)).ShouldBe(0);
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var round = await db.Set<MatchRound>().AsNoTracking()
                .Include(r => r.Candidates).Include(r => r.Exclusions)
                .SingleAsync(r => r.SubjectId == briefId, Ct);

            round.Candidates.ShouldBeEmpty();
            round.Exclusions.ShouldNotBeEmpty();
            round.Exclusions.ShouldAllBe(x => x.ReasonCode == MatchExclusionCodes.BelowThreshold);
            round.Exclusions[0].Detail.ShouldNotBeNull();
            round.Exclusions[0].RawScore.ShouldNotBeNull();
        }
    }

    /// <summary>
    /// Đường chính: có ứng viên qua ngưỡng và có ứng viên trượt trong **cùng một vòng**. Vòng phải mang cả hai
    /// vế — danh sách chọn có mã lý do riêng từng dòng, và danh sách loại có mã lý do kèm điểm.
    /// </summary>
    [Fact]
    public async Task A_round_carries_both_per_candidate_reasons_and_exclusions()
    {
        var supplier = Guid.CreateVersion7();
        var seeker = Guid.CreateVersion7();
        var actor = new TestActor().AsAdmin(seeker);
        await using var provider = Provider(fixture, actor,
            settings: new Dictionary<string, string?> { ["Matching:MatchLimit"] = "1", ["Matching:MatchMinScore"] = "0" });

        // Hai công nghệ cùng chủ đề: cả hai qua ngưỡng, nhưng MatchLimit = 1 nên đúng một cái bị loại vì vượt
        // giới hạn — cách tạo ra `BEYOND_LIMIT` mà không phụ thuộc điểm số của mô hình giả.
        await PublishTechnologyAsync(provider, supplier, $"{_marker} {_marker} màng lọc sinh học");
        await PublishTechnologyAsync(provider, supplier, $"{_marker} {_marker} màng lọc sinh học biến thể");
        var briefId = await PublishDemandAsync(provider, seeker, $"{_marker} {_marker} màng lọc sinh học");

        using (var scope = provider.CreateScope())
        {
            var matching = scope.ServiceProvider.GetRequiredService<IMatchingService>();
            await matching.ChunkEmbedAndIndexAsync(SubjectRef.Demand(briefId), Ct);
            (await matching.ComputeMatchesAsync(SubjectRef.Demand(briefId), Ct)).ShouldBe(1);
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var round = await db.Set<MatchRound>().AsNoTracking()
                .Include(r => r.Candidates).Include(r => r.Exclusions)
                .SingleAsync(r => r.SubjectId == briefId, Ct);

            round.Candidates.Count.ShouldBe(1);
            var chosen = round.Candidates[0];
            chosen.ReasonCodes.ShouldContain(MatchReasonCodes.SemanticMatch);
            // Bên cung ứng chưa có hồ sơ vụ việc nào — phải nói ra, và nói ra là dữ kiện chứ không phải điểm trừ.
            chosen.ReasonCodes.ShouldContain(MatchReasonCodes.NoDeliveryHistory);
            chosen.ReasonCodes.ShouldNotContain(MatchReasonCodes.ProvenDelivery);

            round.Exclusions.Count.ShouldBe(1);
            var dropped = round.Exclusions[0];
            dropped.ReasonCode.ShouldBe(MatchExclusionCodes.BeyondLimit);
            dropped.RawScore.ShouldNotBeNull();
            dropped.Candidate.Id.ShouldNotBe(chosen.Candidate.Id);
        }
    }

    /// <summary>
    /// Thành tích giao hàng dựng từ hồ sơ vụ việc, không từ hồ sơ tự khai. Bên cung ứng đã đưa một hồ sơ tới
    /// `EXECUTION` phải mang `PROVEN_DELIVERY`; cùng dữ liệu đó khi chưa tới `EXECUTION` thì không.
    /// </summary>
    [Fact]
    public async Task Delivery_track_record_comes_from_case_history_not_self_declaration()
    {
        var supplier = Guid.CreateVersion7();
        var admin = new TestActor().AsAdmin(Guid.CreateVersion7());
        await using var provider = Provider(fixture, admin);

        using (var scope = provider.CreateScope())
        {
            var records = scope.ServiceProvider.GetRequiredService<IDeliveryTrackRecordProvider>();
            var before = await records.ForOwnersAsync([supplier], Ct);
            before.GetValueOrDefault(supplier, DeliveryTrackRecord.Empty).HasDelivered.ShouldBeFalse();
        }

        // Dựng một `CommercializationCase` đi tới `EXECUTION` cần qua ma trận §7.4 với `DecisionRecord` ở từng
        // chặng và một `PolicySnapshot` — đó là bài test của module case. Ở đây kiểm hợp đồng mà module matching
        // dựa vào: danh sách rỗng trả về rỗng, người không có lịch sử trả bản ghi rỗng, và **bản ghi rỗng không
        // bao giờ được hiểu thành đã giao hàng**. Đó là chỗ một lỗi sẽ biến "chưa có hồ sơ" thành "đã giao".
        using (var scope = provider.CreateScope())
        {
            var records = scope.ServiceProvider.GetRequiredService<IDeliveryTrackRecordProvider>();

            (await records.ForOwnersAsync([], Ct)).ShouldBeEmpty();

            var unknown = Guid.CreateVersion7();
            var result = await records.ForOwnersAsync([unknown], Ct);
            var record = result.GetValueOrDefault(unknown, DeliveryTrackRecord.Empty);
            record.CasesAsProvider.ShouldBe(0);
            record.CasesReachedExecution.ShouldBe(0);
            record.HasDelivered.ShouldBeFalse();
            record.LastDeliveryAt.ShouldBeNull();
        }
    }
}
