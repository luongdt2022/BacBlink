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
/// §26.6.5 — golden set là điều kiện còn thiếu duy nhất của quyết định hội tụ search (ADR-0010, "Câu hỏi còn mở").
/// `search_query_logs` đã ghi truy vấn, bộ lọc, ngưỡng, engine và kết quả từ trước; cái chưa từng có là **nhãn
/// nói kết quả nào đúng**. Bộ này canh ba luật của đường thu nhãn.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class SearchFeedbackTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    /// <summary>
    /// Sidecar giả: bộ này đo **đường thu nhãn**, không đo chất lượng xếp hạng. Dùng mô hình thật ở đây sẽ làm
    /// bài test phụ thuộc một dịch vụ ngoài mà nó không kiểm điều gì về dịch vụ đó.
    /// </summary>
    private static ServiceProvider Provider(PostgresFixture f, TestActor actor)
        => f.BuildProvider(actor, configure: s => s.AddSingleton<IEmbeddingClient, FakeEmbeddingClient>());

    /// <summary>
    /// Từ khoá riêng cho mỗi lần chạy. Chỉ mục tìm kiếm dùng chung cho cả bộ test, nên nội dung của bài này sẽ
    /// cạnh tranh top-K với truy vấn của bài khác nếu nó dùng từ vựng thông thường — đúng cách một bài test làm
    /// bài test khác đỏ vì lý do không liên quan tới thứ nó kiểm. Từ khoá vô nghĩa giữ hai chiều: kết quả của
    /// bài này chắc chắn ở hạng 1, và nội dung của nó không chen vào truy vấn của ai.
    /// </summary>
    private readonly string _marker = "zzqx" + Guid.NewGuid().ToString("N")[..8];

    private async Task<(Guid QueryLogId, SubjectRef Subject)> SearchOnceAsync(
        IServiceProvider provider, Guid owner)
    {
        using var scope = provider.CreateScope();
        var demands = scope.ServiceProvider.GetRequiredService<IDemandService>();
        var matching = scope.ServiceProvider.GetRequiredService<IMatchingService>();

        var brief = await demands.CreateAsync(new CreateDemandCommand(
            Title: _marker,
            ProblemStatement: $"{_marker} {_marker} {_marker}",
            OwnerPersonId: owner, Status: DemandStatuses.Published, SectorIds: [], CategoryId: null,
            AiProcessedContent: null), Ct);

        await matching.ChunkEmbedAndIndexAsync(SubjectRef.Demand(brief.Id), Ct);

        var result = await matching.SearchAsync(new SearchQuery(
            _marker, 10, null, null, 0.0, null, true), owner, Ct);

        result.QueryLogId.ShouldNotBe(Guid.Empty);
        result.Hits.ShouldNotBeEmpty();
        result.Hits[0].Subject.Id.ShouldBe(brief.Id);
        var hit = result.Hits[0].Subject;

        // Gỡ khỏi chỉ mục ngay sau khi đã có log. Phần còn lại của bài chỉ cần `queryLogId`, còn bản chiếu tìm
        // kiếm thì dùng chung cả bộ test: để lại bốn tài liệu mỗi lần chạy sẽ đẩy ứng viên hợp lệ của bài khác
        // ra khỏi top-K. Nhãn phản hồi vẫn trỏ tới subject đã gỡ — đúng như thực tế, nội dung có thể bị xoá sau
        // khi đã được chấm.
        await matching.RemoveSubjectAsync(SubjectRef.Demand(brief.Id), Ct);

        return (result.QueryLogId, hit);
    }

    /// <summary>
    /// Nhãn phải gắn được vào **đúng lần hỏi**, và `Rank` là sự thật của lần trả về đó — máy chủ tra từ log,
    /// không nhận từ client. Grade 0–3 là đầu vào của nDCG.
    /// </summary>
    [Fact]
    public async Task A_judged_result_is_stored_with_the_rank_the_server_observed()
    {
        var owner = Guid.CreateVersion7();
        var actor = new TestActor().AsUser(owner);
        await using var provider = Provider(fixture, actor);

        var (queryLogId, subject) = await SearchOnceAsync(provider, owner);

        using (var scope = provider.CreateScope())
        {
            var matching = scope.ServiceProvider.GetRequiredService<IMatchingService>();
            var feedback = await matching.RecordSearchFeedbackAsync(queryLogId,
                new SearchFeedbackCommand(subject, SearchFeedbackKinds.Judged, 3, "đúng thứ cần tìm"), owner, Ct);

            feedback.Rank.ShouldBe(1);
            feedback.Grade.ShouldBe(3);
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var log = await db.Set<SearchQueryLog>().AsNoTracking().SingleAsync(l => l.Id == queryLogId, Ct);
            log.ResultScores.Length.ShouldBe(log.ResultSubjectIds.Length);
            (await db.Set<SearchFeedback>().CountAsync(f => f.QueryLogId == queryLogId, Ct)).ShouldBe(1);
        }
    }

    /// <summary>Chấm lại là **sửa** nhãn, không cộng thêm một tín hiệu. Một cú double-click không được thành hai lượt.</summary>
    [Fact]
    public async Task Sending_the_same_label_twice_revises_it_instead_of_adding_a_second_signal()
    {
        var owner = Guid.CreateVersion7();
        var actor = new TestActor().AsUser(owner);
        await using var provider = Provider(fixture, actor);

        var (queryLogId, subject) = await SearchOnceAsync(provider, owner);

        using (var scope = provider.CreateScope())
        {
            var matching = scope.ServiceProvider.GetRequiredService<IMatchingService>();
            await matching.RecordSearchFeedbackAsync(queryLogId,
                new SearchFeedbackCommand(subject, SearchFeedbackKinds.Judged, 1, null), owner, Ct);
            await matching.RecordSearchFeedbackAsync(queryLogId,
                new SearchFeedbackCommand(subject, SearchFeedbackKinds.Judged, 3, "đọc kỹ lại thì đúng"), owner, Ct);
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var rows = await db.Set<SearchFeedback>().AsNoTracking()
                .Where(f => f.QueryLogId == queryLogId).ToListAsync(Ct);
            rows.Count.ShouldBe(1);
            rows[0].Grade.ShouldBe(3);
            rows[0].Note.ShouldBe("đọc kỹ lại thì đúng");
        }
    }

    /// <summary>
    /// Nhãn cho một thứ chưa từng hiện ra trong lần hỏi đó không phải dữ liệu đo — nó làm hỏng cả Recall lẫn nDCG,
    /// và làm hỏng lặng lẽ. Chặn ở tầng dịch vụ, không ở giao diện.
    /// </summary>
    [Fact]
    public async Task Labelling_a_subject_that_was_not_in_the_result_set_is_rejected()
    {
        var owner = Guid.CreateVersion7();
        var actor = new TestActor().AsUser(owner);
        await using var provider = Provider(fixture, actor);

        var (queryLogId, _) = await SearchOnceAsync(provider, owner);

        using var scope = provider.CreateScope();
        var matching = scope.ServiceProvider.GetRequiredService<IMatchingService>();

        await Should.ThrowAsync<UnprocessableException>(async () =>
            await matching.RecordSearchFeedbackAsync(queryLogId,
                new SearchFeedbackCommand(SubjectRef.Demand(Guid.CreateVersion7()), SearchFeedbackKinds.Judged, 2, null),
                owner, Ct));

        await Should.ThrowAsync<NotFoundException>(async () =>
            await matching.RecordSearchFeedbackAsync(Guid.CreateVersion7(),
                new SearchFeedbackCommand(SubjectRef.Demand(Guid.CreateVersion7()), SearchFeedbackKinds.Judged, 2, null),
                owner, Ct));
    }

    /// <summary>Grade chỉ có nghĩa với nhãn chấm. Click không phải phán quyết, nên nó không mang điểm.</summary>
    [Fact]
    public async Task Implicit_labels_carry_no_grade_and_judged_labels_require_one()
    {
        var owner = Guid.CreateVersion7();
        var actor = new TestActor().AsUser(owner);
        await using var provider = Provider(fixture, actor);

        var (queryLogId, subject) = await SearchOnceAsync(provider, owner);

        using var scope = provider.CreateScope();
        var matching = scope.ServiceProvider.GetRequiredService<IMatchingService>();

        await Should.ThrowAsync<ValidationException>(async () =>
            await matching.RecordSearchFeedbackAsync(queryLogId,
                new SearchFeedbackCommand(subject, SearchFeedbackKinds.Opened, 2, null), owner, Ct));

        await Should.ThrowAsync<ValidationException>(async () =>
            await matching.RecordSearchFeedbackAsync(queryLogId,
                new SearchFeedbackCommand(subject, SearchFeedbackKinds.Judged, null, null), owner, Ct));

        var opened = await matching.RecordSearchFeedbackAsync(queryLogId,
            new SearchFeedbackCommand(subject, SearchFeedbackKinds.Opened, null, null), owner, Ct);
        opened.Grade.ShouldBeNull();
    }
}
