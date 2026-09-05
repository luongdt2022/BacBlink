using NacenTech.Contracts.Events;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Matching.Domain;

/// <summary>
/// §14.2: MatchRound bất biến. Đổi engine/model tạo round mới, không chạy lại round cũ (AC 37);
/// feature value (score, chunk) lưu inline trong candidate để round cũ tái dựng được mà không truy vấn lại index.
/// Mỗi round có đúng một engine authoritative ghi trong `SearchEngineVersion` (D2-26).
/// </summary>
public sealed class MatchRound : AggregateRoot
{
    private readonly List<MatchCandidate> _candidates = [];

    private MatchRound() { }

    private MatchRound(SubjectRef subject, string searchEngineVersion, string embeddingModelVersion, string scoringMode, string? queryText, DateTimeOffset completedAt)
    {
        SubjectKind = subject.Kind;
        SubjectId = subject.Id;
        SearchEngineVersion = searchEngineVersion;
        EmbeddingModelVersion = embeddingModelVersion;
        ScoringMode = scoringMode;
        QueryText = queryText;
        CompletedAt = completedAt;
        IsAuthoritative = true;
    }

    public string SubjectKind { get; private set; } = string.Empty;
    public Guid SubjectId { get; private set; }
    public string SearchEngineVersion { get; private set; } = string.Empty;
    public string EmbeddingModelVersion { get; private set; } = string.Empty;
    public string ScoringMode { get; private set; } = string.Empty;
    public string? QueryText { get; private set; }
    public bool IsAuthoritative { get; private set; }
    public DateTimeOffset CompletedAt { get; private set; }

    public IReadOnlyList<MatchCandidate> Candidates => _candidates;

    public SubjectRef Subject => new(SubjectKind, SubjectId);

    public static MatchRound Complete(
        SubjectRef subject, string searchEngineVersion, string embeddingModelVersion, string scoringMode,
        string? queryText, IEnumerable<(SubjectRef Candidate, double Score, string MatchedChunk, int ChunkIndex, string Reason)> hits,
        DateTimeOffset now)
    {
        var round = new MatchRound(subject, searchEngineVersion, embeddingModelVersion, scoringMode, queryText, now);
        var rank = 0;
        foreach (var hit in hits.OrderByDescending(h => h.Score))
        {
            rank++;
            round._candidates.Add(new MatchCandidate(round.Id, hit.Candidate, hit.Score, hit.MatchedChunk, hit.ChunkIndex, rank, hit.Reason, now));
        }
        round.Raise(new MatchRoundCompleted(subject, round.Id, round._candidates.Count, searchEngineVersion));
        return round;
    }

    /// <summary>ETL `intake_matches`: giữ raw score và nhãn thuật toán, không chuẩn hóa thành phần trăm (§30.3).</summary>
    public static MatchRound Import(
        SubjectRef subject, string embeddingModelVersion, bool isAuthoritative,
        IEnumerable<(Guid Id, SubjectRef Candidate, double Score, string MatchedChunk, int ChunkIndex, DateTimeOffset ComputedAt, DateTimeOffset UpdatedAt)> matches,
        DateTimeOffset now)
    {
        var round = new MatchRound(subject, Application.SearchEngineVersions.LegacyImported, embeddingModelVersion,
            Application.ScoringModes.Legacy, null, now)
        {
            IsAuthoritative = isAuthoritative,
        };
        var rank = 0;
        foreach (var m in matches.OrderByDescending(m => m.Score))
        {
            rank++;
            var candidate = new MatchCandidate(round.Id, m.Candidate, m.Score, m.MatchedChunk, m.ChunkIndex, rank, "legacy_hybrid_knn_bm25", m.ComputedAt);
            candidate.OverrideIdentity(m.Id);
            candidate.SetUpdatedAt(m.UpdatedAt);
            round._candidates.Add(candidate);
        }
        round.ClearDomainEvents();
        return round;
    }

    public void Supersede()
    {
        IsAuthoritative = false;
        Touch();
    }
}

public sealed class MatchCandidate : Entity
{
    private MatchCandidate() { }

    public MatchCandidate(Guid roundId, SubjectRef candidate, double rawScore, string matchedChunk, int chunkIndex, int rank, string reason, DateTimeOffset computedAt)
    {
        RoundId = roundId;
        CandidateKind = candidate.Kind;
        CandidateId = candidate.Id;
        RawScore = rawScore;
        MatchedChunk = matchedChunk;
        ChunkIndex = chunkIndex;
        Rank = rank;
        Reason = reason;
        ComputedAt = computedAt;
        UpdatedAt = computedAt;
    }

    public Guid RoundId { get; private set; }
    public string CandidateKind { get; private set; } = string.Empty;
    public Guid CandidateId { get; private set; }
    public double RawScore { get; private set; }
    public string MatchedChunk { get; private set; } = string.Empty;
    public int ChunkIndex { get; private set; }
    public int Rank { get; private set; }
    public string? Reason { get; private set; }
    public DateTimeOffset ComputedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public SubjectRef Candidate => new(CandidateKind, CandidateId);

    internal void OverrideIdentity(Guid id) => Id = id;

    internal void SetUpdatedAt(DateTimeOffset value) => UpdatedAt = value;
}

/// <summary>Chunk + embedding của nội dung public. Không chứa nội dung mật (D2-143).</summary>
public sealed class ContentChunk : Entity
{
    private ContentChunk() { }

    public ContentChunk(SubjectRef subject, int index, string text, float[] embedding, string embeddingModelVersion, DateTimeOffset createdAt)
    {
        SubjectKind = subject.Kind;
        SubjectId = subject.Id;
        Index = index;
        Text = text;
        Embedding = embedding;
        EmbeddingModelVersion = embeddingModelVersion;
        CreatedAt = createdAt;
    }

    public string SubjectKind { get; private set; } = string.Empty;
    public Guid SubjectId { get; private set; }
    public int Index { get; private set; }
    public string Text { get; private set; } = string.Empty;
    public float[] Embedding { get; private set; } = [];
    public string EmbeddingModelVersion { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }

    public SubjectRef Subject => new(SubjectKind, SubjectId);

    internal void OverrideIdentity(Guid id) => Id = id;

    public void Update(string text, float[] embedding, string embeddingModelVersion)
    {
        Text = text;
        Embedding = embedding;
        EmbeddingModelVersion = embeddingModelVersion;
    }
}

/// <summary>
/// §26.6.4: đường găng của quyết định hội tụ search. Phải ghi truy vấn, kết quả trả về và ngưỡng
/// để dựng golden set — log dạng text của NestJS không dùng lại được.
/// </summary>
public sealed class SearchQueryLog : Entity
{
    private SearchQueryLog() { }

    public SearchQueryLog(Guid? actorRef, string queryText, string? targetKind, Guid[] sectorIds, double minScore, int limit,
        string scoringMode, string engineVersion, Guid[] resultSubjectIds, long tookMs, DateTimeOffset createdAt)
    {
        ActorRef = actorRef;
        QueryText = queryText;
        TargetKind = targetKind;
        SectorIds = sectorIds;
        MinScore = minScore;
        Limit = limit;
        ScoringMode = scoringMode;
        EngineVersion = engineVersion;
        ResultSubjectIds = resultSubjectIds;
        TookMs = tookMs;
        CreatedAt = createdAt;
    }

    public Guid? ActorRef { get; private set; }
    public string QueryText { get; private set; } = string.Empty;
    public string? TargetKind { get; private set; }
    public Guid[] SectorIds { get; private set; } = [];
    public double MinScore { get; private set; }
    public int Limit { get; private set; }
    public string ScoringMode { get; private set; } = string.Empty;
    public string EngineVersion { get; private set; } = string.Empty;
    public Guid[] ResultSubjectIds { get; private set; } = [];
    public long TookMs { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
}
