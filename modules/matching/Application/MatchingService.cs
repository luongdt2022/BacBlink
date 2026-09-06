using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NacenTech.Contracts.Ai;
using NacenTech.Contracts.Events;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Matching.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Matching.Application;

public sealed class MatchingService(
    DbContext db,
    IUnitOfWork uow,
    ICurrentActor actor,
    IAuthorizationGate gate,
    IClock clock,
    IJobQueue jobs,
    IOutbox outbox,
    IEmbeddingClient embeddings,
    IReranker reranker,
    ISearchIndex index,
    ITextChunker chunker,
    ISubjectResolver subjects,
    ITaxonomyNameResolver taxonomy,
    IMatchingPreferenceProvider preferences,
    IDeliveryTrackRecordProvider trackRecords,
    IOptions<MatchingOptions> options,
    ILogger<MatchingService> log) : IMatchingService
{
    private readonly MatchingOptions _options = options.Value;

    private string EngineVersion => _options.ScoringMode == ScoringModes.Corrected
        ? (_options.UseSparse ? SearchEngineVersions.PostgresCorrectedSparse : SearchEngineVersions.PostgresCorrected)
          + (_options.UseRerank ? SearchEngineVersions.RerankSuffix : string.Empty)
        : SearchEngineVersions.PostgresLegacy;

    /// <summary>
    /// B-45: ngưỡng điểm theo chế độ. Người gọi (v1 `search`, `find-challenges`, job tính vòng) đều gửi một số
    /// theo thang cũ (1.0–2.0); ở chế độ đã sửa điểm RRF tối đa ≈ 0,05 nên số đó loại mọi kết quả. Chế độ đã sửa
    /// dùng `MatchMinScoreCorrected` (mặc định 0) bất kể người gọi gửi gì — hai thang không quy đổi được cho
    /// nhau, và giả vờ quy đổi còn tệ hơn bỏ qua.
    /// </summary>
    private double EffectiveMinScore(double requested)
        => _options.ScoringMode == ScoringModes.Corrected ? _options.MatchMinScoreCorrected : requested;

    // ─── Truy vấn ───────────────────────────────────────────────────────────────────────────

    public async Task<MatchRoundDto?> GetLatestRoundAsync(SubjectRef subject, CancellationToken ct)
    {
        var round = await LatestRoundQuery(subject).AsNoTracking().FirstOrDefaultAsync(ct);
        if (round is null) return null;
        // Đếm bằng truy vấn, không đọc `round.Candidates.Count`: navigation không Include thì luôn rỗng, và vòng
        // thật đầu tiên đo được (2026-09-05) hiện "0 ứng viên" trên màn hình trong khi có 10 — B-46.
        var count = await db.Set<MatchCandidate>().AsNoTracking().CountAsync(c => c.RoundId == round.Id, ct);
        return ToDto(round, count);
    }

    public async Task<PagedResult<MatchCandidateDto>> ListCandidatesAsync(SubjectRef subject, PageRequest page, CancellationToken ct)
    {
        var round = await LatestRoundQuery(subject).AsNoTracking().FirstOrDefaultAsync(ct);
        if (round is null) return new PagedResult<MatchCandidateDto>([], 0, page.Page, page.Limit);

        var q = db.Set<MatchCandidate>().AsNoTracking().Where(c => c.RoundId == round.Id);
        var total = await q.CountAsync(ct);
        var data = await q.OrderByDescending(c => c.RawScore).Skip(page.Skip).Take(page.Limit).ToListAsync(ct);
        return new PagedResult<MatchCandidateDto>(data.Select(c => ToDto(c, subject)).ToList(), total, page.Page, page.Limit);
    }

    public async Task<IReadOnlyList<MatchCandidateDto>> TopCandidatesAsync(SubjectRef subject, int take, CancellationToken ct)
    {
        var round = await LatestRoundQuery(subject).AsNoTracking().FirstOrDefaultAsync(ct);
        if (round is null) return [];
        var data = await db.Set<MatchCandidate>().AsNoTracking()
            .Where(c => c.RoundId == round.Id).OrderByDescending(c => c.RawScore).Take(take).ToListAsync(ct);
        return data.Select(c => ToDto(c, subject)).ToList();
    }

    public async Task<PagedResult<MatchRoundDto>> ListRoundsAsync(SubjectRef subject, MatchRoundFilter filter, PageRequest page, CancellationToken ct)
    {
        var q = db.Set<MatchRound>().AsNoTracking().Where(r => r.SubjectKind == subject.Kind && r.SubjectId == subject.Id);
        if (!string.IsNullOrWhiteSpace(filter.ScoringMode)) q = q.Where(r => r.ScoringMode == filter.ScoringMode);
        if (!string.IsNullOrWhiteSpace(filter.SearchEngineVersion)) q = q.Where(r => r.SearchEngineVersion == filter.SearchEngineVersion);

        var total = await q.CountAsync(ct);
        var rounds = await q.OrderByDescending(r => r.CreatedAt).Skip(page.Skip).Take(page.Limit).ToListAsync(ct);
        // Số ứng viên đếm riêng thay vì Include cả danh sách: một vòng có thể mang hàng chục ứng viên kèm đoạn
        // văn bản, và danh sách vòng chỉ cần con số.
        var ids = rounds.Select(r => r.Id).ToList();
        var counts = await db.Set<MatchCandidate>().AsNoTracking()
            .Where(c => ids.Contains(c.RoundId))
            .GroupBy(c => c.RoundId)
            .Select(g => new { RoundId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.RoundId, x => x.Count, ct);
        return new PagedResult<MatchRoundDto>(
            rounds.Select(r => ToDto(r, counts.GetValueOrDefault(r.Id))).ToList(), total, page.Page, page.Limit);
    }

    public async Task<MatchRoundDto?> GetRoundAsync(Guid roundId, CancellationToken ct)
    {
        var round = await db.Set<MatchRound>().AsNoTracking().FirstOrDefaultAsync(r => r.Id == roundId, ct);
        if (round is null) return null;
        var count = await db.Set<MatchCandidate>().AsNoTracking().CountAsync(c => c.RoundId == roundId, ct);
        return ToDto(round, count);
    }

    public async Task<PagedResult<MatchCandidateDto>> ListRoundCandidatesAsync(Guid roundId, PageRequest page, CancellationToken ct)
    {
        var round = await db.Set<MatchRound>().AsNoTracking().FirstOrDefaultAsync(r => r.Id == roundId, ct)
                    ?? throw new NotFoundException($"Match round {roundId} not found");
        var q = db.Set<MatchCandidate>().AsNoTracking().Where(c => c.RoundId == roundId);
        var total = await q.CountAsync(ct);
        var data = await q.OrderBy(c => c.Rank).Skip(page.Skip).Take(page.Limit).ToListAsync(ct);
        return new PagedResult<MatchCandidateDto>(data.Select(c => ToDto(c, round.Subject)).ToList(), total, page.Page, page.Limit);
    }

    private IQueryable<MatchRound> LatestRoundQuery(SubjectRef subject)
        => db.Set<MatchRound>().Where(r => r.SubjectKind == subject.Kind && r.SubjectId == subject.Id)
            .OrderByDescending(r => r.IsAuthoritative).ThenByDescending(r => r.CreatedAt);

    // ─── Tìm kiếm ───────────────────────────────────────────────────────────────────────────

    public async Task<SearchResultDto> SearchAsync(SearchQuery query, Guid? actorPersonId, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.SearchQuery, actor.PlatformRole), "Search", null);
        var execution = await ExecuteSearchAsync(query, actorPersonId, ct);
        await uow.CommitAsync(ct); // ghi search_query_log (§26.6.4)
        return execution.Result;
    }

    /// <summary>
    /// Ứng viên bị loại trong một lần thu hồi. Đường tìm kiếm tương tác không cần đến nó — người dùng gõ lại là
    /// xong; vòng ghép cặp thì cần, vì nó là bản ghi bất biến mà broker phải giải trình được (nguyên tắc 11).
    /// </summary>
    private sealed record ExcludedCandidate(SubjectRef Subject, double? Score, string ReasonCode, string? Detail);

    private sealed record SearchExecution(SearchResultDto Result, IReadOnlyList<ExcludedCandidate> Exclusions);

    private async Task<SearchExecution> ExecuteSearchAsync(SearchQuery query, Guid? actorPersonId, CancellationToken ct)
    {
        var embedding = await embeddings.EmbedAsync([query.Query], ct);
        var vector = embedding.Embeddings.Count > 0 ? embedding.Embeddings[0] : [];
        var sparse = _options.UseSparse && embedding.Sparse is { Count: > 0 } ? embedding.Sparse[0] : null;
        var minScore = EffectiveMinScore(query.MinScore);

        await index.EnsureIndexAsync(ct);
        var raw = await index.SearchAsync(new RawSearchRequest(
            query.Query, vector, query.Limit, _options.ScoringMode, query.TargetKind,
            query.SectorIds, query.ExcludeOwnerPersonId, query.PublishedOnly, sparse), ct);

        // Dedupe: giữ chunk điểm cao nhất mỗi subject (parity legacy).
        var best = new Dictionary<SubjectRef, SearchHitDto>();
        foreach (var hit in raw.Hits)
        {
            if (best.TryGetValue(hit.Subject, out var existing) && existing.Score >= hit.Score) continue;
            best[hit.Subject] = new SearchHitDto(hit.Subject, hit.Title, hit.AiTitle, hit.Text, hit.ChunkIndex, hit.Score, hit.SectorIds, hit.SectorNames);
        }

        var candidates = best.Values.AsEnumerable();
        var excluded = new List<ExcludedCandidate>();

        // §26.6.3: cross-encoder xếp lại N ứng viên đầu sau RRF. Chỉ ở chế độ đã sửa — chế độ cũ là baseline để đo,
        // không được "tiện tay" tốt lên. Điểm cuối là điểm reranker (0–1); thứ hạng RRF chỉ quyết định ai được vào N.
        var reranked = new HashSet<SubjectRef>();
        if (_options.ScoringMode == ScoringModes.Corrected && _options.UseRerank && best.Count > 0)
        {
            var top = best.Values.OrderByDescending(h => h.Score).Take(Math.Max(query.Limit, _options.RerankTopN)).ToList();
            var passages = top.Select(h => string.IsNullOrWhiteSpace(h.Title) ? h.MatchedChunk : $"{h.Title}\n{h.MatchedChunk}").ToList();
            var scores = await reranker.ScoreAsync(query.Query, passages, ct);
            candidates = top.Select((h, i) => h with { Score = scores[i] }).ToList();
            foreach (var h in top) reranked.Add(h.Subject);
        }

        // LEGACY: published/owner lọc SAU dedupe (đúng như `computeMatches` của NestJS).
        if (_options.ScoringMode != ScoringModes.Corrected && (query.PublishedOnly || query.ExcludeOwnerPersonId is not null))
        {
            var summaries = await subjects.SummariesAsync(best.Keys, ct);
            candidates = candidates.Where(h =>
            {
                if (!summaries.TryGetValue(h.Subject, out var s))
                {
                    excluded.Add(new ExcludedCandidate(h.Subject, h.Score, MatchExclusionCodes.Unresolvable, null));
                    return false;
                }
                if (query.PublishedOnly && !s.IsPublished)
                {
                    excluded.Add(new ExcludedCandidate(h.Subject, h.Score, MatchExclusionCodes.NotPublished, null));
                    return false;
                }
                if (query.ExcludeOwnerPersonId is { } owner && s.OwnerPersonId == owner)
                {
                    excluded.Add(new ExcludedCandidate(h.Subject, h.Score, MatchExclusionCodes.OwnerExcluded, null));
                    return false;
                }
                return true;
            }).ToList(); // materialize: nếu để lười thì `excluded` chỉ được ghi khi có ai đó duyệt qua chuỗi.
        }

        var ranked = candidates.OrderByDescending(h => h.Score).ToList();

        foreach (var h in ranked.Where(h => h.Score < minScore))
        {
            excluded.Add(new ExcludedCandidate(h.Subject, h.Score, MatchExclusionCodes.BelowThreshold,
                $"score {h.Score:0.####} < {minScore:0.####}"));
        }

        var passing = ranked.Where(h => h.Score >= minScore).ToList();
        var hits = passing.Take(query.Limit).ToList();

        foreach (var h in passing.Skip(query.Limit))
        {
            excluded.Add(new ExcludedCandidate(h.Subject, h.Score, MatchExclusionCodes.BeyondLimit, $"limit {query.Limit}"));
        }

        var log = new SearchQueryLog(actorPersonId, query.Query, query.TargetKind,
            (query.SectorIds ?? []).ToArray(), minScore, query.Limit, _options.ScoringMode, EngineVersion,
            hits.Select(h => h.Subject.Id).ToArray(), hits.Select(h => h.Score).ToArray(), raw.TookMs, clock.UtcNow);
        db.Add(log);

        _lastReranked = reranked;
        return new SearchExecution(new SearchResultDto(hits, hits.Count, raw.TookMs, log.Id), excluded);
    }

    /// <summary>
    /// Ứng viên đã đi qua bước xếp lại của lần thu hồi gần nhất trong cùng scope. Dùng để gắn
    /// <see cref="MatchReasonCodes.RerankedTop"/>; scope của service là scope của một request/job nên không có
    /// tranh chấp giữa hai lần chạy.
    /// </summary>
    private HashSet<SubjectRef> _lastReranked = [];

    /// <summary>
    /// §26.6.5. Ba luật ở đây có lý do:
    /// 1. `Rank` tra từ log, không nhận từ client — vị trí là sự thật của lần trả về đó.
    /// 2. Subject phải nằm trong `ResultSubjectIds` — nhãn cho thứ chưa từng hiện ra làm hỏng cả Recall lẫn nDCG.
    /// 3. Gửi lại cùng (log, subject, kind, người) là **sửa** nhãn cũ, không tạo nhãn thứ hai.
    /// </summary>
    public async Task<SearchFeedbackDto> RecordSearchFeedbackAsync(Guid queryLogId, SearchFeedbackCommand command, Guid? actorPersonId, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.SearchFeedback, actor.PlatformRole), "SearchFeedback", queryLogId);

        if (!SearchFeedbackKinds.IsKnown(command.Kind))
            throw new ValidationException($"Loại nhãn không hợp lệ: {command.Kind}");

        var judged = command.Kind == SearchFeedbackKinds.Judged;
        if (judged && command.Grade is not (>= 0 and <= 3))
            throw new ValidationException("Nhãn JUDGED phải có grade trong khoảng 0–3");
        if (!judged && command.Grade is not null)
            throw new ValidationException("Chỉ nhãn JUDGED mới mang grade; nhãn ngầm không phải phán quyết");

        var log = await db.Set<SearchQueryLog>().AsNoTracking().FirstOrDefaultAsync(l => l.Id == queryLogId, ct)
                  ?? throw new NotFoundException($"Search query log {queryLogId} not found");

        var rank = Array.IndexOf(log.ResultSubjectIds, command.Subject.Id);
        if (rank < 0)
            throw new UnprocessableException($"Subject {command.Subject} không nằm trong kết quả của lần tìm kiếm {queryLogId}");

        var existing = await db.Set<SearchFeedback>().FirstOrDefaultAsync(
            f => f.QueryLogId == queryLogId && f.SubjectKind == command.Subject.Kind && f.SubjectId == command.Subject.Id
                 && f.Kind == command.Kind && f.ActorRef == actorPersonId, ct);

        SearchFeedback feedback;
        if (existing is null)
        {
            feedback = new SearchFeedback(queryLogId, command.Subject, rank + 1, command.Kind, command.Grade,
                actorPersonId, command.Note, clock.UtcNow);
            db.Add(feedback);
        }
        else
        {
            existing.Revise(command.Grade, command.Note, actorPersonId, clock.UtcNow);
            feedback = existing;
        }

        await uow.CommitAsync(ct);
        return new SearchFeedbackDto(feedback.Id, feedback.QueryLogId, feedback.Subject, feedback.Rank,
            feedback.Kind, feedback.Grade, feedback.Note, feedback.CreatedAt);
    }

    // ─── Yêu cầu xử lý nền ──────────────────────────────────────────────────────────────────

    public async Task RequestChunkEmbedAsync(SubjectRef subject, CancellationToken ct)
    {
        EnqueueChunkEmbed(subject);
        await uow.CommitAsync(ct);
    }

    public async Task RequestComputeMatchesAsync(SubjectRef subject, CancellationToken ct)
    {
        EnqueueComputeMatches(subject);
        await uow.CommitAsync(ct);
    }

    /// <summary>Dùng trong event handler: enqueue mà không commit (dispatcher commit).</summary>
    internal void EnqueueChunkEmbed(SubjectRef subject)
        => jobs.Enqueue(new ChunkEmbedJob(subject.ToString()), dedupKey: $"chunk-embed:{subject}");

    internal void EnqueueComputeMatches(SubjectRef subject)
        => jobs.Enqueue(new ComputeMatchesJob(subject.ToString()), dedupKey: $"compute-matches:{subject}");

    // ─── Pipeline ───────────────────────────────────────────────────────────────────────────

    public async Task ChunkEmbedAndIndexAsync(SubjectRef subject, CancellationToken ct)
    {
        var content = await subjects.ContentAsync(subject, ct);
        var summary = await subjects.SummaryAsync(subject, ct);
        if (content is null || summary is null)
        {
            log.LogWarning("Bỏ qua chunk-embed: không phân giải được subject {Subject}", subject);
            return;
        }

        try
        {
            var plain = B2bPrompts.StripHtml(content.Body ?? string.Empty);
            var chunks = string.IsNullOrWhiteSpace(plain) ? [] : chunker.Chunk(plain, _options.ChunkSize, _options.ChunkOverlap);

            var existing = await db.Set<ContentChunk>()
                .Where(c => c.SubjectKind == subject.Kind && c.SubjectId == subject.Id).ToListAsync(ct);
            foreach (var e in existing) db.Remove(e);

            var vectors = chunks.Count == 0
                ? new EmbeddingResult([], _options.EmbeddingModelVersion, "bge-m3")
                : await embeddings.EmbedAsync(chunks, ct);

            var now = clock.UtcNow;
            for (var i = 0; i < chunks.Count; i++)
            {
                db.Add(new ContentChunk(subject, i, chunks[i], vectors.Embeddings[i], _options.EmbeddingModelVersion, now));
            }

            await index.EnsureIndexAsync(ct);
            await index.DeleteSubjectAsync(subject, ct);
            if (chunks.Count > 0)
            {
                var names = await taxonomy.NamesAsync(summary.SectorIds, ct);
                var indexed = chunks.Select((text, i) => new IndexedChunk(
                    subject, i, text, vectors.Embeddings[i], summary.Title, summary.DisplayTitle, subject.Kind,
                    summary.SectorIds, summary.SectorIds.Select(s => names.GetValueOrDefault(s, string.Empty)).Where(n => n.Length > 0).ToList(),
                    summary.OwnerPersonId, summary.IsPublished,
                    _options.UseSparse && vectors.Sparse is { } sp && sp.Count > i ? sp[i] : null)).ToList();
                await index.IndexChunksAsync(indexed, ct);
            }

            outbox.Enqueue(new SubjectChunkingCompleted(subject, true, null));

            // Auto-matching theo preference của chủ sở hữu; subject không có chủ (seed/admin) thì luôn chạy.
            var auto = summary.OwnerPersonId is null || await preferences.AutoMatchingEnabledAsync(summary.OwnerPersonId.Value, ct);
            if (auto && chunks.Count > 0) EnqueueComputeMatches(subject);

            await uow.CommitAsync(ct);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "chunk-embed thất bại cho {Subject}", subject);
            db.ChangeTracker.Clear();
            outbox.Enqueue(new SubjectChunkingCompleted(subject, false, ex.Message));
            await uow.CommitAsync(ct);
            throw;
        }
    }

    public async Task<int> ComputeMatchesAsync(SubjectRef subject, CancellationToken ct)
    {
        var content = await subjects.ContentAsync(subject, ct);
        var summary = await subjects.SummaryAsync(subject, ct);
        if (content is null || summary is null || string.IsNullOrWhiteSpace(content.Body)) return 0;

        var body = content.Body!;
        var queryText = string.Join('\n', new[]
        {
            content.Title,
            body.Length > _options.QueryContentChars ? body[.._options.QueryContentChars] : body,
        }.Where(s => !string.IsNullOrWhiteSpace(s)));

        var targetKind = subject.Kind == SubjectKinds.DemandBrief ? SubjectKinds.TechnologyAsset : SubjectKinds.DemandBrief;
        var execution = await ExecuteSearchAsync(new SearchQuery(
            queryText, _options.MatchLimit, targetKind,
            summary.SectorIds.Count > 0 ? summary.SectorIds : null,
            _options.MatchMinScore, summary.OwnerPersonId, PublishedOnly: true), null, ct);
        var result = execution.Result;

        // Không thu hồi được gì thì không có gì để giải thích — im lặng ở đây là đúng.
        // Nhưng **thu hồi được rồi loại sạch** thì im lặng là sai: broker nhìn thấy "không có kết quả" trong khi
        // hệ thống vừa xem qua một loạt ứng viên và bỏ hết. Vòng rỗng kèm danh sách loại nói đúng chuyện đã xảy ra.
        if (result.Hits.Count == 0 && execution.Exclusions.Count == 0)
        {
            await uow.CommitAsync(ct);
            return 0;
        }

        var previous = await db.Set<MatchRound>()
            .Where(r => r.SubjectKind == subject.Kind && r.SubjectId == subject.Id && r.IsAuthoritative).ToListAsync(ct);
        foreach (var r in previous) r.Supersede();

        var reason = _options.ScoringMode == ScoringModes.Corrected
            ? (_options.UseSparse ? "rrf_dense_lexical_exact_sparse" : "rrf_dense_lexical_exact") + (_options.UseRerank ? "_rerank" : string.Empty)
            : "hybrid_knn_bm25";

        var reasonCodes = await ReasonCodesAsync(result.Hits, summary.SectorIds, ct);

        var round = MatchRound.Complete(subject, EngineVersion, _options.EmbeddingModelVersion, _options.ScoringMode, queryText,
            result.Hits.Select(h => (h.Subject, h.Score, h.MatchedChunk, h.ChunkIndex, reason,
                (IReadOnlyList<string>)reasonCodes.GetValueOrDefault(h.Subject, []))),
            execution.Exclusions.Select(x => (x.Subject, x.Score, x.ReasonCode, x.Detail)),
            clock.UtcNow);
        db.Add(round);
        await uow.CommitAsync(ct);

        log.LogInformation("MatchRound {RoundId} cho {Subject}: {Count} candidate ({Engine})", round.Id, subject, round.Candidates.Count, EngineVersion);
        return round.Candidates.Count;
    }

    /// <summary>
    /// Vì sao **ứng viên này** vào danh sách — nguyên tắc 11. Trước đây mọi ứng viên mang chung một nhãn thuật
    /// toán, tức là không có lý do nào cả: một chuỗi giống hệt nhau ở mọi dòng không giải thích được gì.
    ///
    /// Dữ kiện lấy từ thứ đã quan sát được, không suy diễn: kênh nào khớp, có trùng lĩnh vực không, có qua bước
    /// xếp lại không, và chủ sở hữu đã từng đưa hồ sơ vụ việc tới đâu. Thành tích giao hàng vào **phần giải thích**
    /// chứ không vào hàm xếp hạng — nếu vào hàm xếp hạng thì bên đã có lịch sử luôn đứng trên bên mới và
    /// shortlist thành vòng lặp tự củng cố.
    /// </summary>
    private async Task<Dictionary<SubjectRef, string[]>> ReasonCodesAsync(
        IReadOnlyList<SearchHitDto> hits, IReadOnlyList<Guid> subjectSectorIds, CancellationToken ct)
    {
        var subjectSectors = subjectSectorIds.ToHashSet();
        var summaries = await subjects.SummariesAsync(hits.Select(h => h.Subject).ToList(), ct);

        var ownerIds = summaries.Values.Select(s => s.OwnerPersonId).OfType<Guid>().Distinct().ToList();
        var records = ownerIds.Count == 0
            ? new Dictionary<Guid, DeliveryTrackRecord>()
            : await trackRecords.ForOwnersAsync(ownerIds, ct);

        var result = new Dictionary<SubjectRef, string[]>();
        foreach (var hit in hits)
        {
            var codes = new List<string> { MatchReasonCodes.SemanticMatch };

            if (subjectSectors.Count > 0 && hit.SectorIds.Any(subjectSectors.Contains))
                codes.Add(MatchReasonCodes.SectorOverlap);

            if (_lastReranked.Contains(hit.Subject))
                codes.Add(MatchReasonCodes.RerankedTop);

            var owner = summaries.GetValueOrDefault(hit.Subject)?.OwnerPersonId;
            var record = owner is { } o ? records.GetValueOrDefault(o, DeliveryTrackRecord.Empty) : DeliveryTrackRecord.Empty;

            if (record.CasesWithVerifiedOutcome > 0) codes.Add(MatchReasonCodes.VerifiedOutcome);
            if (record.HasDelivered) codes.Add(MatchReasonCodes.ProvenDelivery);
            else codes.Add(MatchReasonCodes.NoDeliveryHistory);

            result[hit.Subject] = [.. codes];
        }
        return result;
    }

    public async Task<bool> RebuildSearchIndexAsync(SubjectRef subject, CancellationToken ct)
    {
        var chunks = await db.Set<ContentChunk>().AsNoTracking()
            .Where(c => c.SubjectKind == subject.Kind && c.SubjectId == subject.Id)
            .OrderBy(c => c.Index).ToListAsync(ct);
        var summary = await subjects.SummaryAsync(subject, ct);

        await index.DeleteSubjectAsync(subject, ct);
        if (chunks.Count == 0 || summary is null)
        {
            log.LogWarning("Dựng lại chỉ mục cho {Subject}: {Chunks} đoạn, summary {Summary} — chỉ xoá bản chiếu", subject, chunks.Count, summary is null ? "không có" : "có");
            await uow.CommitAsync(ct);
            return false;
        }

        // Dữ liệu di trú chỉ có vector dense; kênh sparse (nếu bật) sẽ có ở lần chunk-embed kế tiếp.
        var names = await taxonomy.NamesAsync(summary.SectorIds, ct);
        var sectorNames = summary.SectorIds.Select(s => names.GetValueOrDefault(s, string.Empty)).Where(n => n.Length > 0).ToList();
        await index.IndexChunksAsync(chunks.Select(c => new IndexedChunk(
            subject, c.Index, c.Text, c.Embedding, summary.Title, summary.DisplayTitle, subject.Kind,
            summary.SectorIds, sectorNames, summary.OwnerPersonId, summary.IsPublished)).ToList(), ct);
        await uow.CommitAsync(ct);
        return true;
    }

    public async Task RemoveSubjectAsync(SubjectRef subject, CancellationToken ct)
    {
        var chunks = await db.Set<ContentChunk>().Where(c => c.SubjectKind == subject.Kind && c.SubjectId == subject.Id).ToListAsync(ct);
        foreach (var c in chunks) db.Remove(c);
        await index.DeleteSubjectAsync(subject, ct);
        await uow.CommitAsync(ct);
    }

    // ─── Mapping ────────────────────────────────────────────────────────────────────────────

    private static MatchRoundDto ToDto(MatchRound r)
        => ToDto(r, r.Candidates.Count);

    private static MatchRoundDto ToDto(MatchRound r, int candidateCount)
        => new(r.Id, r.Subject, r.SearchEngineVersion, r.EmbeddingModelVersion, r.ScoringMode, candidateCount, r.CreatedAt, r.QueryText, r.IsAuthoritative);

    private static MatchCandidateDto ToDto(MatchCandidate c, SubjectRef subject)
        => new(c.Id, c.RoundId, subject, c.Candidate, c.RawScore, c.MatchedChunk, c.ChunkIndex, c.Rank, c.Reason, c.ReasonCodes, c.ComputedAt, c.UpdatedAt);

    public async Task<PagedResult<MatchExclusionDto>> ListRoundExclusionsAsync(Guid roundId, PageRequest page, CancellationToken ct)
    {
        var q = db.Set<MatchExclusion>().AsNoTracking().Where(x => x.RoundId == roundId);
        var total = await q.CountAsync(ct);
        // Điểm giảm dần: ứng viên trượt sát ngưỡng nhất nằm trên đầu, vì đó là những cái broker cần xem lại trước.
        var data = await q.OrderByDescending(x => x.RawScore).ThenBy(x => x.CandidateId)
            .Skip(page.Skip).Take(page.Limit).ToListAsync(ct);
        return new PagedResult<MatchExclusionDto>(
            data.Select(x => new MatchExclusionDto(x.Id, x.RoundId, x.Candidate, x.RawScore, x.ReasonCode, x.Detail, x.ComputedAt)).ToList(),
            total, page.Page, page.Limit);
    }
}
