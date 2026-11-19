using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Matching.Application;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// ADR-0010: chỉ mục tìm kiếm trong PostgreSQL thay Elasticsearch. Ba điều phải đúng và trước đây không đo
/// được vì Elasticsearch chưa từng dựng ở máy này: (1) chế độ đã sửa lọc cứng **trước** thu hồi — bản nháp và
/// bản của chính chủ sở hữu không bao giờ xuất hiện; (2) chế độ cũ **không** lọc — tái tạo hình dạng hành vi
/// NestJS để tầng dịch vụ lọc sau top-K; (3) tiếng Việt **không dấu khớp có dấu** — ca §26.6.1 mà baseline
/// Elasticsearch trượt vì không có ascii-folding.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class PostgresSearchIndexTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;
    private const int Dims = 1024;

    /// <summary>Vector đơn vị có một chiều "nóng" — cosine giữa hai vector cùng chiều nóng là 1, khác chiều là 0.</summary>
    private static float[] Vec(int hot, float noise = 0f)
    {
        var v = new float[Dims];
        v[hot] = 1f;
        if (noise > 0) v[(hot + 1) % Dims] = noise;
        return v;
    }

    private static IndexedChunk Chunk(SubjectRef subject, string text, float[] vec, Guid? owner, bool published, string title = "Tiêu đề", Guid? sector = null)
        => new(subject, 0, text, vec, title, null, subject.Kind, sector is { } s ? [s] : [], [], owner, published);

    [Fact]
    public async Task Corrected_mode_hard_filters_before_recall_and_legacy_mode_does_not()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()));
        using var scope = provider.CreateScope();
        var index = scope.ServiceProvider.GetRequiredService<ISearchIndex>();

        var me = Guid.CreateVersion7();
        var other = Guid.CreateVersion7();
        var published = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        var draft = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        var mine = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());

        await index.IndexChunksAsync(
        [
            Chunk(published, "công nghệ sinh học xử lý nước thải", Vec(1), other, published: true),
            Chunk(draft, "công nghệ sinh học xử lý nước thải bản nháp", Vec(1, 0.1f), other, published: false),
            Chunk(mine, "công nghệ sinh học của chính tôi", Vec(1, 0.2f), me, published: true),
        ], Ct);

        var corrected = await index.SearchAsync(new RawSearchRequest(
            "công nghệ sinh học", Vec(1), 10, ScoringModes.Corrected, SubjectKinds.TechnologyAsset, null, me, PublishedOnly: true), Ct);
        // Kênh dense trả k láng giềng gần nhất kể cả cosine 0 (đúng như knn của index cũ), và bảng là chung cho
        // mọi test trong collection — nên khẳng định là "đứng đầu" và "không có mặt", không phải "chỉ có một".
        corrected.Hits[0].Subject.Id.ShouldBe(published.Id, "chế độ đã sửa: bản đã xuất bản của người khác đứng đầu");
        corrected.Hits.Select(h => h.Subject.Id).ShouldNotContain(draft.Id, "bản nháp bị lọc TRƯỚC khi thu hồi");
        corrected.Hits.Select(h => h.Subject.Id).ShouldNotContain(mine.Id, "bản của chính mình bị lọc TRƯỚC khi thu hồi");

        var legacy = await index.SearchAsync(new RawSearchRequest(
            "công nghệ sinh học", Vec(1), 10, ScoringModes.Legacy, SubjectKinds.TechnologyAsset, null, me, PublishedOnly: true), Ct);
        var legacyIds = legacy.Hits.Select(h => h.Subject.Id).ToList();
        legacyIds.ShouldContain(draft.Id, "chế độ cũ: không lọc ở chỉ mục — tầng dịch vụ lọc SAU top-K, đúng hình dạng NestJS");
        legacyIds.ShouldContain(mine.Id);
        legacyIds.ShouldContain(published.Id);
        // Bản khớp vector hoàn toàn (cosine = 1) VÀ khớp từ khoá: điểm > 1 chỉ có thể là hai đơn vị cộng lại, không trần.
        legacy.Hits.First(h => h.Subject.Id == published.Id).Score.ShouldBeGreaterThan(1.0, "điểm cũ = cosine + ts_rank");

        await index.DeleteSubjectAsync(published, Ct);
        var after = await index.SearchAsync(new RawSearchRequest(
            "công nghệ sinh học", Vec(1), 10, ScoringModes.Corrected, SubjectKinds.TechnologyAsset, null, null, PublishedOnly: true), Ct);
        after.Hits.Select(h => h.Subject.Id).ShouldNotContain(published.Id, "xoá subject là xoá khỏi chỉ mục ngay, cùng giao dịch");
        after.Hits[0].Subject.Id.ShouldBe(mine.Id);
    }

    [Fact]
    public async Task Vietnamese_without_diacritics_matches_text_with_diacritics()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()));
        using var scope = provider.CreateScope();
        var index = scope.ServiceProvider.GetRequiredService<ISearchIndex>();

        var subject = new SubjectRef(SubjectKinds.DemandBrief, Guid.CreateVersion7());
        var unrelated = new SubjectRef(SubjectKinds.DemandBrief, Guid.CreateVersion7());
        await index.IndexChunksAsync(
        [
            Chunk(subject, "Cần công nghệ sinh học cho nông nghiệp", Vec(7), null, published: true, title: "Sinh học"),
            Chunk(unrelated, "Cần vật liệu xây dựng nhẹ", Vec(8), null, published: true, title: "Vật liệu"),
        ], Ct);

        // Không gửi vector: chỉ kênh từ khoá — đúng thứ §26.6.1 nói Elasticsearch trượt.
        var result = await index.SearchAsync(new RawSearchRequest(
            "cong nghe sinh hoc", [], 10, ScoringModes.Corrected, SubjectKinds.DemandBrief, null, null, PublishedOnly: true), Ct);

        result.Hits.Select(h => h.Subject.Id).ShouldContain(subject.Id);
        result.Hits.Select(h => h.Subject.Id).ShouldNotContain(unrelated.Id, "kênh từ khoá chỉ trả bản khớp");
        result.Hits[0].Text.ShouldContain("công nghệ sinh học");
    }

    [Fact]
    public async Task Sector_filter_and_upsert_by_chunk_key()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()));
        using var scope = provider.CreateScope();
        var index = scope.ServiceProvider.GetRequiredService<ISearchIndex>();

        var sector = Guid.CreateVersion7();
        var inSector = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        var outSector = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        await index.IndexChunksAsync(
        [
            Chunk(inSector, "pin lithium thể rắn", Vec(3), null, true, sector: sector),
            Chunk(outSector, "pin lithium thể rắn", Vec(3), null, true, sector: Guid.CreateVersion7()),
        ], Ct);
        // Ghi lại cùng khoá (subject, chunk) phải cập nhật, không nhân đôi.
        await index.IndexChunksAsync([Chunk(inSector, "pin lithium thể rắn đã cập nhật", Vec(3), null, true, sector: sector)], Ct);

        var result = await index.SearchAsync(new RawSearchRequest(
            "pin lithium", Vec(3), 10, ScoringModes.Corrected, SubjectKinds.TechnologyAsset, [sector], null, PublishedOnly: true), Ct);

        result.Hits.Select(h => h.Subject.Id).ShouldNotContain(outSector.Id, "lọc lĩnh vực chạy trước thu hồi");
        result.Hits.Count(h => h.Subject.Id == inSector.Id).ShouldBe(1, "ghi đè theo khoá, không nhân đôi");
        result.Hits.First(h => h.Subject.Id == inSector.Id).Text.ShouldBe("pin lithium thể rắn đã cập nhật");
    }
}
