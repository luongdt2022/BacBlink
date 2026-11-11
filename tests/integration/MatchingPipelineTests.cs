using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Matching.Application;
using NacenTech.Modules.Matching.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// Đường ghép cặp qua tầng dịch vụ với sidecar giả (`FakeEmbeddingClient`) — thứ chưa bao giờ đo được vì
/// không có engine nào chạy. Ba việc: B-45 (ngưỡng theo chế độ), B-27 ở tầng dịch vụ (tìm kiếm không trả bản
/// nháp), dựng lại chỉ mục từ `content_chunks` cho dữ liệu di trú, và kênh sparse thứ ba.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class MatchingPipelineTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    private static ServiceProvider Provider(PostgresFixture f, string mode, bool sparse = false, FakeReranker? reranker = null)
        => f.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()),
            settings: new Dictionary<string, string?>
            {
                ["Matching:ScoringMode"] = mode,
                ["Matching:MatchMinScoreCorrected"] = "0",
                ["Matching:UseSparse"] = sparse ? "true" : "false",
                ["Matching:UseRerank"] = reranker is null ? "false" : "true",
            },
            configure: s =>
            {
                s.AddSingleton<IEmbeddingClient, FakeEmbeddingClient>();
                if (reranker is not null) s.AddSingleton<IReranker>(reranker);
            });

    /// <summary>
    /// §26.6.3: cross-encoder xếp lại N đầu sau RRF, ở chế độ đã sửa. Hai đoạn gần như giống nhau theo mọi kênh thu
    /// hồi; reranker giả chấm đoạn có dấu ★ là 1 — nó phải lên đầu, và điểm cuối là điểm reranker, nhãn engine
    /// mang hậu tố `-rerank`.
    /// </summary>
    [Fact]
    public async Task Rerank_reorders_top_candidates_and_changes_the_engine_label()
    {
        var fake = new FakeReranker();
        await using var provider = Provider(fixture, ScoringModes.Corrected, reranker: fake);
        using var scope = provider.CreateScope();
        var index = scope.ServiceProvider.GetRequiredService<ISearchIndex>();
        var plain = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        var starred = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        const string text = "lò đốt rác thải y tế nhiệt độ cao";
        await index.IndexChunksAsync([Chunk(plain, text, null, true), Chunk(starred, text + " ★", null, true)], Ct);

        var matching = scope.ServiceProvider.GetRequiredService<IMatchingService>();
        var result = await matching.SearchAsync(new SearchQuery("lò đốt rác thải y tế", 5, SubjectKinds.TechnologyAsset, null, 0, null, true), null, Ct);

        fake.Calls.Count.ShouldBe(1, "reranker được gọi đúng một lần cho một truy vấn");
        result.Hits[0].Subject.Id.ShouldBe(starred.Id, "reranker quyết định thứ hạng cuối");
        result.Hits[0].Score.ShouldBe(1.0, "điểm cuối là điểm reranker, không còn là RRF");
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        (await db.Set<SearchQueryLog>().AsNoTracking().OrderByDescending(l => l.CreatedAt).FirstAsync(Ct))
            .EngineVersion.ShouldBe(SearchEngineVersions.PostgresCorrected + SearchEngineVersions.RerankSuffix);
    }

    private static IndexedChunk Chunk(SubjectRef subject, string text, Guid? owner, bool published, bool sparse = false)
        => new(subject, 0, text, FakeEmbeddingClient.Dense(text), "Tiêu đề", null, subject.Kind, [], [], owner, published,
            sparse ? FakeEmbeddingClient.Sparse(text) : null);

    /// <summary>
    /// B-45: cùng một truy vấn, cùng ngưỡng 2.0 mà mọi người gọi v1 đang gửi. Chế độ cũ: điểm ≤ ~1,1 nên rỗng —
    /// đúng luật của thang cũ. Chế độ đã sửa: ngưỡng cũ bị thay bằng `MatchMinScoreCorrected` (0) nên có kết
    /// quả — trước bản vá, RRF ≤ 0,05 so với 2.0 là **luôn rỗng, im lặng**. Đồng thời là B-27 ở tầng dịch vụ.
    /// </summary>
    [Fact]
    public async Task Corrected_mode_ignores_legacy_scale_threshold_and_never_returns_drafts()
    {
        var other = Guid.CreateVersion7();
        var published = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        var draft = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        const string text = "màng lọc sinh học xử lý nước thải dệt nhuộm";

        await using (var seed = Provider(fixture, ScoringModes.Corrected))
        using (var scope = seed.CreateScope())
        {
            var index = scope.ServiceProvider.GetRequiredService<ISearchIndex>();
            await index.IndexChunksAsync([Chunk(published, text, other, true), Chunk(draft, text + " bản nháp", other, false)], Ct);
        }

        var query = new SearchQuery("màng lọc sinh học nước thải", 10, SubjectKinds.TechnologyAsset, null, MinScore: 2.0, null, PublishedOnly: true);

        await using (var corrected = Provider(fixture, ScoringModes.Corrected))
        using (var scope = corrected.CreateScope())
        {
            var result = await scope.ServiceProvider.GetRequiredService<IMatchingService>().SearchAsync(query, null, Ct);
            result.Hits.ShouldNotBeEmpty("chế độ đã sửa: ngưỡng thang cũ không áp lên điểm RRF (B-45)");
            result.Hits.Select(h => h.Subject.Id).ShouldContain(published.Id);
            result.Hits.Select(h => h.Subject.Id).ShouldNotContain(draft.Id, "B-27: bản nháp bị lọc trước thu hồi");
            result.Hits[0].Score.ShouldBeLessThan(0.1, "điểm RRF — chứng minh ngưỡng 2.0 mà áp thì rỗng");

            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var logged = await db.Set<SearchQueryLog>().AsNoTracking().OrderByDescending(l => l.CreatedAt).FirstAsync(Ct);
            logged.MinScore.ShouldBe(0, "nhật ký ghi ngưỡng THẬT đã áp, không ghi số người gọi gửi");
            logged.EngineVersion.ShouldBe(SearchEngineVersions.PostgresCorrected);
        }

        await using (var legacy = Provider(fixture, ScoringModes.Legacy))
        using (var scope = legacy.CreateScope())
        {
            var result = await scope.ServiceProvider.GetRequiredService<IMatchingService>().SearchAsync(query, null, Ct);
            result.Hits.ShouldBeEmpty("chế độ cũ: ngưỡng 2.0 là luật của thang cũ và vẫn được tôn trọng");
        }
    }

    /// <summary>Dữ liệu di trú: vector đã có trong `content_chunks`, bản chiếu chưa có. Dựng lại không gọi sidecar.</summary>
    [Fact]
    public async Task Rebuilds_projection_from_migrated_chunks_without_embedding()
    {
        var owner = Guid.CreateVersion7();
        await using var provider = Provider(fixture, ScoringModes.Corrected);

        Guid briefId;
        using (var scope = provider.CreateScope())
        {
            var demands = scope.ServiceProvider.GetRequiredService<IDemandService>();
            var brief = await demands.CreateAsync(new CreateDemandCommand(owner, "Cần vật liệu cách nhiệt cho kho lạnh", "mô tả",
                null, DemandStatuses.Published, null, null), Ct);
            briefId = brief.Id;

            // Như ETL: đoạn + vector chép nguyên, không qua chunk-embed, không có sparse.
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            const string text = "vật liệu cách nhiệt aerogel cho kho lạnh";
            db.Add(new ContentChunk(SubjectRef.Demand(briefId), 0, text, FakeEmbeddingClient.Dense(text), "bge-m3", DateTimeOffset.UtcNow));
            await db.SaveChangesAsync(Ct);
        }

        var subject = SubjectRef.Demand(briefId);
        using (var scope = provider.CreateScope())
        {
            var matching = scope.ServiceProvider.GetRequiredService<IMatchingService>();
            (await matching.RebuildSearchIndexAsync(subject, Ct)).ShouldBeTrue();

            var index = scope.ServiceProvider.GetRequiredService<ISearchIndex>();
            var hits = await index.SearchAsync(new RawSearchRequest("aerogel kho lạnh", FakeEmbeddingClient.Dense("aerogel kho lạnh"), 10,
                ScoringModes.Corrected, SubjectKinds.DemandBrief, null, null, PublishedOnly: true), Ct);
            hits.Hits.Select(h => h.Subject.Id).ShouldContain(briefId);
            hits.Hits.First(h => h.Subject.Id == briefId).Title.ShouldBe("Cần vật liệu cách nhiệt cho kho lạnh", "tiêu đề lấy từ summary, không từ đoạn");

            (await matching.RebuildSearchIndexAsync(new SubjectRef(SubjectKinds.DemandBrief, Guid.CreateVersion7()), Ct))
                .ShouldBeFalse("subject không có đoạn nào → chỉ xoá bản chiếu, không lỗi");
        }
    }

    /// <summary>Kênh sparse: một đoạn chỉ tìm được qua từ vựng đã học — không có vector dense khớp, không khớp từ khoá thô.</summary>
    [Fact]
    public async Task Sparse_channel_finds_chunks_by_learned_vocabulary()
    {
        await using var provider = Provider(fixture, ScoringModes.Corrected, sparse: true);
        using var scope = provider.CreateScope();
        var index = scope.ServiceProvider.GetRequiredService<ISearchIndex>();

        var subject = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        const string text = "cảm biến khí độc cho hầm mỏ";
        await index.IndexChunksAsync([Chunk(subject, text, null, true, sparse: true)], Ct);

        // Không dense, câu chữ không trùng từ nào với đoạn → hai kênh kia câm; chỉ sparse (đã học) nói.
        var result = await index.SearchAsync(new RawSearchRequest("zzz-khong-trung-tu-nao", [], 10, ScoringModes.Corrected,
            SubjectKinds.TechnologyAsset, null, null, PublishedOnly: true, QuerySparse: FakeEmbeddingClient.Sparse(text)), Ct);

        result.Hits.Select(h => h.Subject.Id).ShouldContain(subject.Id);

        // Và vòng tính bằng chế độ này mang nhãn engine riêng (D2-26: thêm kênh là đổi thuật toán).
        var matching = scope.ServiceProvider.GetRequiredService<IMatchingService>();
        await matching.SearchAsync(new SearchQuery(text, 5, SubjectKinds.TechnologyAsset, null, 0, null, true), null, Ct);
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        (await db.Set<SearchQueryLog>().AsNoTracking().OrderByDescending(l => l.CreatedAt).FirstAsync(Ct))
            .EngineVersion.ShouldBe(SearchEngineVersions.PostgresCorrectedSparse);
    }
}
