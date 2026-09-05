using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Matching.Application;
using NacenTech.Modules.Matching.Infrastructure;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// §26.6.6 — ca đúng/sai, không tính điểm. Đây là **ngưỡng tuyệt đối** của quyết định hội tụ search: một engine
/// có thể "không tệ hơn baseline" mà vẫn sai, nên các ca này đánh giá độc lập với mọi chỉ số chất lượng. Chạy
/// với sidecar giả để cô lập từng kênh (không vector → chỉ kênh từ khoá và kênh exact nói); bản chạy với mô
/// hình thật ở `docs-v2/verification/anh-chup/verify-search-cases.sh`.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class SearchPassFailCasesTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    private static IndexedChunk Chunk(SubjectRef subject, string text, string title = "Tiêu đề", bool published = true, float[]? vec = null)
        => new(subject, 0, text, vec ?? FakeEmbeddingClient.Dense(text), title, null, subject.Kind, [], [], null, published);

    private static RawSearchRequest Lexical(string q, string kind = SubjectKinds.TechnologyAsset)
        => new(q, [], 10, ScoringModes.Corrected, kind, null, null, PublishedOnly: true);

    private static async Task<ISearchIndex> IndexAsync(PostgresFixture f, IServiceScope scope) => scope.ServiceProvider.GetRequiredService<ISearchIndex>();

    [Fact]
    public async Task Multi_syllable_term_does_not_match_syllables_scattered_apart()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()));
        using var scope = provider.CreateScope();
        var index = await IndexAsync(fixture, scope);
        var together = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        var apart = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        await index.IndexChunksAsync(
        [
            Chunk(together, "ứng dụng công nghệ sinh học trong xử lý rác"),
            Chunk(apart, "công nghệ mới giúp học sinh nông thôn tiếp cận thư viện"),
        ], Ct);

        var hits = await index.SearchAsync(Lexical("công nghệ sinh học"), Ct);
        hits.Hits.Select(h => h.Subject.Id).ShouldContain(together.Id);
        hits.Hits.Select(h => h.Subject.Id).ShouldNotContain(apart.Id, "\"công nghệ\" và \"học\" rời nhau không phải \"công nghệ sinh học\" — cụm âm tiết có thứ tự");
    }

    [Fact]
    public async Task Unaccented_query_matches_accented_text()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()));
        using var scope = provider.CreateScope();
        var index = await IndexAsync(fixture, scope);
        var subject = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        await index.IndexChunksAsync([Chunk(subject, "dây chuyền công nghệ sinh học lên men")], Ct);

        (await index.SearchAsync(Lexical("cong nghe sinh hoc"), Ct)).Hits.Select(h => h.Subject.Id).ShouldContain(subject.Id);
    }

    [Fact]
    public async Task Accented_query_keeps_its_meaning_and_does_not_collapse_onto_unaccented_lookalikes()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()));
        using var scope = provider.CreateScope();
        var index = await IndexAsync(fixture, scope);
        var dissolve = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        var flower = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        await index.IndexChunksAsync(
        [
            Chunk(dissolve, "chất hòa tan nhanh trong nước lạnh"),
            Chunk(flower, "giống hoa tan mùa cho vùng cao"),
        ], Ct);

        // "hòa" gõ đủ dấu: tra trường có dấu — "hoa" không được kéo vào chỉ vì unaccent làm chúng giống nhau.
        var hits = await index.SearchAsync(Lexical("hòa tan"), Ct);
        hits.Hits.Select(h => h.Subject.Id).ShouldContain(dissolve.Id);
        hits.Hits.Select(h => h.Subject.Id).ShouldNotContain(flower.Id, "chiến lược hai trường: có dấu tra trường có dấu");

        // Không dấu thì cả hai đều hợp lệ — người gõ không dấu không nói được mình muốn gì.
        var loose = await index.SearchAsync(Lexical("hoa tan"), Ct);
        loose.Hits.Select(h => h.Subject.Id).ShouldContain(dissolve.Id);
        loose.Hits.Select(h => h.Subject.Id).ShouldContain(flower.Id);
    }

    [Fact]
    public async Task Nfd_and_both_tone_placements_give_the_same_result()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()));
        using var scope = provider.CreateScope();
        var index = await IndexAsync(fixture, scope);
        var subject = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        // Chỉ mục nhận kiểu CŨ ("hòa"), NFC.
        await index.IndexChunksAsync([Chunk(subject, "hệ thống điều hòa không khí tiết kiệm điện")], Ct);

        var newStyle = await index.SearchAsync(Lexical("điều hoà không khí"), Ct);            // kiểu mới
        var nfd = await index.SearchAsync(Lexical("điều hòa không khí".Normalize(System.Text.NormalizationForm.FormD)), Ct); // NFD
        newStyle.Hits.Select(h => h.Subject.Id).ShouldContain(subject.Id, "\"hoà\" và \"hòa\" là một");
        nfd.Hits.Select(h => h.Subject.Id).ShouldContain(subject.Id, "NFD và NFC là một");
    }

    [Fact]
    public async Task English_keyword_inside_vietnamese_sentence_is_found()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()));
        using var scope = provider.CreateScope();
        var index = await IndexAsync(fixture, scope);
        var subject = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        await index.IndexChunksAsync([Chunk(subject, "cảm biến IoT giám sát độ ẩm đất cho nông trại")], Ct);

        (await index.SearchAsync(Lexical("cảm biến IoT"), Ct)).Hits.Select(h => h.Subject.Id).ShouldContain(subject.Id);
        (await index.SearchAsync(Lexical("iot"), Ct)).Hits.Select(h => h.Subject.Id).ShouldContain(subject.Id, "từ tiếng Anh, không phân biệt hoa thường");
    }

    [Fact]
    public async Task Patent_numbers_and_codes_match_exactly_through_the_trigram_channel()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()));
        using var scope = provider.CreateScope();
        var index = await IndexAsync(fixture, scope);
        var subject = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        var other = new SubjectRef(SubjectKinds.TechnologyAsset, Guid.CreateVersion7());
        await index.IndexChunksAsync(
        [
            Chunk(subject, "Bằng sáng chế số VN1-0012345 do Viện Hàn lâm KHCN cấp", title: "Máy sấy VN1-0012345"),
            Chunk(other, "Bằng sáng chế số VN1-0098765", title: "Máy khác"),
        ], Ct);

        // Chuỗi con của mã: kênh từ khoá không tách được (một token), kênh exact/trigram thì có.
        var hits = await index.SearchAsync(Lexical("0012345"), Ct);
        hits.Hits.Select(h => h.Subject.Id).ShouldContain(subject.Id);
        hits.Hits.Select(h => h.Subject.Id).ShouldNotContain(other.Id);

        // Tên tổ chức nguyên văn.
        (await index.SearchAsync(Lexical("Viện Hàn lâm KHCN"), Ct)).Hits.Select(h => h.Subject.Id).ShouldContain(subject.Id);
    }

    [Fact]
    public async Task Valid_but_semantically_far_candidate_survives_because_hard_filter_runs_before_top_k()
    {
        await using var provider = fixture.BuildProvider(new TestActor().AsAdmin(Guid.CreateVersion7()));
        using var scope = provider.CreateScope();
        var index = await IndexAsync(fixture, scope);
        var kind = SubjectKinds.DemandBrief; // nhóm riêng để 30 bản nháp không dây sang test khác
        var query = FakeEmbeddingClient.Dense("pin lithium thể rắn");
        var chunks = new List<IndexedChunk>();
        // 30 bản nháp bám sát truy vấn (chiếm hết top-K nếu lọc SAU) …
        for (var i = 0; i < 30; i++)
            chunks.Add(Chunk(new SubjectRef(kind, Guid.CreateVersion7()), "pin lithium thể rắn", published: false, vec: query));
        // … và MỘT bản đã xuất bản, ngữ nghĩa xa (vector khác hẳn, không chung từ).
        var published = new SubjectRef(kind, Guid.CreateVersion7());
        chunks.Add(Chunk(published, "màng lọc gốm cho nước ngầm", published: true, vec: FakeEmbeddingClient.Dense("màng lọc gốm cho nước ngầm")));
        await index.IndexChunksAsync(chunks, Ct);

        var hits = await index.SearchAsync(new RawSearchRequest("pin lithium thể rắn", query, 5, ScoringModes.Corrected, kind, null, null, PublishedOnly: true), Ct);
        hits.Hits.Select(h => h.Subject.Id).ShouldContain(published.Id, "lọc cứng chạy TRƯỚC top-K: ứng viên hợp lệ không bị 30 bản nháp chiếm chỗ");
    }
}

/// <summary>Chuẩn hoá tiếng Việt thuần — hai ca NFC/NFD và hai kiểu đặt dấu.</summary>
public sealed class VietnameseTextTests
{
    [Theory]
    [InlineData("hòa", "hoà")]
    [InlineData("thúy", "thuý")]
    [InlineData("khỏe", "khoẻ")]
    [InlineData("Hòa Bình", "Hoà Bình")]
    public void Old_and_new_tone_placement_are_one(string oldStyle, string newStyle)
        => VietnameseText.Canonical(oldStyle).ShouldBe(VietnameseText.Canonical(newStyle));

    [Fact]
    public void Nfd_equals_nfc()
        => VietnameseText.Canonical("công nghệ sinh học".Normalize(System.Text.NormalizationForm.FormD)).ShouldBe(VietnameseText.Canonical("công nghệ sinh học"));

    [Theory]
    [InlineData("ô tô", "ô tô")] // nguyên âm 1 có dấu mũ: không phải cặp oa/oe/uy trần, giữ nguyên
    [InlineData("quốc", "quốc")]
    [InlineData("hoa", "hoa")]
    public void Untouched_when_rule_does_not_apply(string input, string expected)
        => VietnameseText.Canonical(input).ShouldBe(expected.Normalize(System.Text.NormalizationForm.FormC));

    [Theory]
    [InlineData("cong nghe", false)]
    [InlineData("công nghệ", true)]
    [InlineData("đèn", true)]
    [InlineData("IoT sensor", false)]
    public void Detects_diacritics(string input, bool expected) => VietnameseText.HasDiacritics(input).ShouldBe(expected);
}
