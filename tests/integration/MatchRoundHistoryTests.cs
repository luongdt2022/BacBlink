using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Matching.Application;
using NacenTech.Modules.Matching.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// Lịch sử vòng ghép cặp (§14.2): mục đích chính của việc giữ vòng cũ là **so được hai vòng**, và cho tới
/// 2026-09-05 tầng dịch vụ chỉ có đường lấy vòng mới nhất. Ba phương thức mới: liệt kê (mới nhất trước, lọc
/// theo chế độ và công cụ), đọc một vòng, và ứng viên của **một vòng cụ thể** theo hạng — chứ không phải của
/// vòng đang dùng.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class MatchRoundHistoryTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    private static MatchRound Round(SubjectRef subject, string engine, string mode, DateTimeOffset at, params (Guid Id, double Score)[] hits)
        => MatchRound.Complete(subject, engine, "bge-m3", mode, "câu hỏi thử",
            hits.Select(h => (new SubjectRef(SubjectKinds.TechnologyAsset, h.Id), h.Score, $"đoạn {h.Id:N}"[..12], 0, "test",
                (IReadOnlyList<string>)[MatchReasonCodes.SemanticMatch])),
            [], at);

    [Fact]
    public async Task Lists_rounds_newest_first_and_filters_by_mode_and_engine()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()));
        var subject = new SubjectRef(SubjectKinds.DemandBrief, Guid.CreateVersion7());
        var t0 = new DateTimeOffset(2026, 9, 1, 0, 0, 0, TimeSpan.Zero);
        var c1 = Guid.CreateVersion7();
        var c2 = Guid.CreateVersion7();

        Guid oldId, newId;
        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var old = Round(subject, SearchEngineVersions.PostgresLegacy, ScoringModes.Legacy, t0, (c1, 9.5), (c2, 3.1));
            var @new = Round(subject, SearchEngineVersions.PostgresCorrected, ScoringModes.Corrected, t0.AddDays(1), (c2, 0.032), (c1, 0.016));
            db.AddRange(old, @new);
            await db.SaveChangesAsync(Ct);
            (oldId, newId) = (old.Id, @new.Id);
        }

        using var scope2 = provider.CreateScope();
        var matching = scope2.ServiceProvider.GetRequiredService<IMatchingService>();

        var all = await matching.ListRoundsAsync(subject, new MatchRoundFilter(null, null), PageRequest.Of(1, 20), Ct);
        all.Total.ShouldBe(2);
        all.Data.Select(r => r.Id).ShouldBe([newId, oldId], "mới nhất trước — thứ tự chèn không phải thứ tự hiển thị");
        all.Data.All(r => r.CandidateCount == 2).ShouldBeTrue("số ứng viên đếm riêng, không cần tải danh sách");
        all.Data[0].QueryText.ShouldBe("câu hỏi thử");

        var legacyOnly = await matching.ListRoundsAsync(subject, new MatchRoundFilter(ScoringModes.Legacy, null), PageRequest.Of(1, 20), Ct);
        legacyOnly.Data.Select(r => r.Id).ShouldBe([oldId]);

        var correctedEngine = await matching.ListRoundsAsync(subject, new MatchRoundFilter(null, SearchEngineVersions.PostgresCorrected), PageRequest.Of(1, 20), Ct);
        correctedEngine.Data.Select(r => r.Id).ShouldBe([newId]);

        // Ứng viên của MỘT vòng cụ thể, theo hạng — vòng cũ xếp c1 trước, vòng mới xếp c2 trước; cùng hai bản ghi, hai thứ hạng.
        var oldCandidates = await matching.ListRoundCandidatesAsync(oldId, PageRequest.Of(1, 20), Ct);
        oldCandidates.Data.Select(c => c.Candidate.Id).ShouldBe([c1, c2]);
        oldCandidates.Data.Select(c => c.Rank).ShouldBe([1, 2]);
        var newCandidates = await matching.ListRoundCandidatesAsync(newId, PageRequest.Of(1, 20), Ct);
        newCandidates.Data.Select(c => c.Candidate.Id).ShouldBe([c2, c1]);

        (await matching.GetRoundAsync(oldId, Ct))!.ScoringMode.ShouldBe(ScoringModes.Legacy);
        // B-46: vòng mới nhất từng báo 0 ứng viên vì đếm trên navigation chưa Include — số phải đếm bằng truy vấn.
        (await matching.GetLatestRoundAsync(subject, Ct))!.CandidateCount.ShouldBe(2);
        (await matching.GetRoundAsync(Guid.CreateVersion7(), Ct)).ShouldBeNull();
        await Should.ThrowAsync<NotFoundException>(() => matching.ListRoundCandidatesAsync(Guid.CreateVersion7(), PageRequest.Of(1, 20), Ct));
    }
}
