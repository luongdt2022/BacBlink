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
    private readonly List<MatchExclusion> _exclusions = [];

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

    public IReadOnlyList<MatchExclusion> Exclusions => _exclusions;

    public static MatchRound Complete(
        SubjectRef subject, string searchEngineVersion, string embeddingModelVersion, string scoringMode,
        string? queryText, IEnumerable<(SubjectRef Candidate, double Score, string MatchedChunk, int ChunkIndex, string Reason, IReadOnlyList<string> ReasonCodes)> hits,
        IEnumerable<(SubjectRef Candidate, double? Score, string ReasonCode, string? Detail)> exclusions,
        DateTimeOffset now)
    {
        var round = new MatchRound(subject, searchEngineVersion, embeddingModelVersion, scoringMode, queryText, now);
        var rank = 0;
        foreach (var hit in hits.OrderByDescending(h => h.Score))
        {
            rank++;
            round._candidates.Add(new MatchCandidate(round.Id, hit.Candidate, hit.Score, hit.MatchedChunk, hit.ChunkIndex, rank, hit.Reason, hit.ReasonCodes, now));
        }
        foreach (var x in exclusions)
        {
            round._exclusions.Add(new MatchExclusion(round.Id, x.Candidate, x.Score, x.ReasonCode, x.Detail, now));
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
            // Dữ liệu nhập từ hệ cũ không có mã lý do và **không được bịa ra**: hệ cũ không ghi lại vì sao một
            // ứng viên vào danh sách. Mảng rỗng nói đúng điều đó; một mã đoán ra sẽ trông y hệt một mã đã đo.
            var candidate = new MatchCandidate(round.Id, m.Candidate, m.Score, m.MatchedChunk, m.ChunkIndex, rank, "legacy_hybrid_knn_bm25", [], m.ComputedAt);
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

    public MatchCandidate(Guid roundId, SubjectRef candidate, double rawScore, string matchedChunk, int chunkIndex, int rank, string reason,
        IReadOnlyList<string> reasonCodes, DateTimeOffset computedAt)
    {
        RoundId = roundId;
        CandidateKind = candidate.Kind;
        CandidateId = candidate.Id;
        RawScore = rawScore;
        MatchedChunk = matchedChunk;
        ChunkIndex = chunkIndex;
        Rank = rank;
        Reason = reason;
        ReasonCodes = reasonCodes.ToArray();
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

    /// <summary>Nhãn thuật toán đã tạo ra ứng viên này — giống nhau cho cả vòng. Giữ nguyên cho tương thích v1.</summary>
    public string? Reason { get; private set; }

    /// <summary>
    /// Vì sao **ứng viên này** vào danh sách — xem <see cref="MatchReasonCodes"/>. Khác `Reason` ở chỗ nó khác nhau
    /// giữa các ứng viên; nhãn thuật toán thì không, nên nó chưa bao giờ là một lý do theo nghĩa nguyên tắc 11.
    /// </summary>
    public string[] ReasonCodes { get; private set; } = [];

    public DateTimeOffset ComputedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public SubjectRef Candidate => new(CandidateKind, CandidateId);

    internal void OverrideIdentity(Guid id) => Id = id;

    internal void SetUpdatedAt(DateTimeOffset value) => UpdatedAt = value;
}

/// <summary>
/// Nguyên tắc 11: *mọi shortlist phải có reason **và exclusion reason***. Vế thứ hai chưa từng được cài đặt —
/// ứng viên bị loại biến mất im lặng, nên broker phải tự dựng lại bằng tay xem hệ thống đã bỏ qua ai và vì sao.
/// Bản ghi này là vế đó. Nó thuộc vòng ghép cặp và bất biến cùng vòng (§14.2).
/// </summary>
public sealed class MatchExclusion : Entity
{
    private MatchExclusion() { }

    public MatchExclusion(Guid roundId, SubjectRef candidate, double? rawScore, string reasonCode, string? detail, DateTimeOffset computedAt)
    {
        RoundId = roundId;
        CandidateKind = candidate.Kind;
        CandidateId = candidate.Id;
        RawScore = rawScore;
        ReasonCode = reasonCode;
        Detail = detail;
        ComputedAt = computedAt;
    }

    public Guid RoundId { get; private set; }
    public string CandidateKind { get; private set; } = string.Empty;
    public Guid CandidateId { get; private set; }

    /// <summary>Điểm tại thời điểm bị loại, khi có. `null` khi ứng viên bị loại trước bước chấm điểm.</summary>
    public double? RawScore { get; private set; }

    public string ReasonCode { get; private set; } = string.Empty;
    public string? Detail { get; private set; }
    public DateTimeOffset ComputedAt { get; private set; }

    public SubjectRef Candidate => new(CandidateKind, CandidateId);
}

/// <summary>
/// Vì sao một ứng viên vào danh sách. Danh sách đóng: mã không có ở đây thì không ghi được, vì một mã tự do sẽ
/// biến phần giải thích thành trường ghi chú và không ai lọc được theo nó nữa.
/// </summary>
public static class MatchReasonCodes
{
    /// <summary>Khớp ở kênh ngữ nghĩa (vector).</summary>
    public const string SemanticMatch = "SEMANTIC_MATCH";

    /// <summary>Trùng ít nhất một lĩnh vực với chủ thể.</summary>
    public const string SectorOverlap = "SECTOR_OVERLAP";

    /// <summary>Được cross-encoder xếp lại và trụ trong nhóm đầu (§26.6.3).</summary>
    public const string RerankedTop = "RERANKED_TOP";

    /// <summary>Chủ sở hữu đã đưa ít nhất một hồ sơ vụ việc tới giai đoạn thực thi.</summary>
    public const string ProvenDelivery = "PROVEN_DELIVERY";

    /// <summary>Chủ sở hữu có hồ sơ vụ việc với outcome đã được xác minh.</summary>
    public const string VerifiedOutcome = "VERIFIED_OUTCOME";

    /// <summary>
    /// Chủ sở hữu chưa có lịch sử giao hàng nào. **Không phải điểm trừ** — bên mới luôn bắt đầu ở đây, và
    /// nguyên tắc 5 cấm biến việc thiếu bằng chứng thành tín hiệu tiêu cực. Ghi ra để broker biết mình đang
    /// nhìn một bên chưa có hồ sơ, chứ không phải để hệ thống hạ thứ hạng của họ.
    /// </summary>
    public const string NoDeliveryHistory = "NO_DELIVERY_HISTORY";
}

/// <summary>Vì sao một ứng viên bị loại. Danh sách đóng, cùng lý do với <see cref="MatchReasonCodes"/>.</summary>
public static class MatchExclusionCodes
{
    /// <summary>Điểm dưới ngưỡng hiệu lực của vòng.</summary>
    public const string BelowThreshold = "BELOW_THRESHOLD";

    /// <summary>Nằm ngoài số lượng tối đa của vòng dù đã qua ngưỡng.</summary>
    public const string BeyondLimit = "BEYOND_LIMIT";

    /// <summary>Cùng chủ sở hữu với chủ thể — không tự ghép cặp với chính mình.</summary>
    public const string OwnerExcluded = "OWNER_EXCLUDED";

    /// <summary>Chưa xuất bản.</summary>
    public const string NotPublished = "NOT_PUBLISHED";

    /// <summary>Không phân giải được nội dung của ứng viên.</summary>
    public const string Unresolvable = "UNRESOLVABLE";
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
        string scoringMode, string engineVersion, Guid[] resultSubjectIds, double[] resultScores, long tookMs, DateTimeOffset createdAt)
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
        ResultScores = resultScores;
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

    /// <summary>
    /// Điểm của từng kết quả, cùng thứ tự với <see cref="ResultSubjectIds"/>. Thứ tự đủ để tính nDCG, nhưng điểm
    /// là thứ duy nhất nói được ngưỡng `MinScore` đã cắt sát đến đâu — không có nó thì không hiệu chỉnh được ngưỡng
    /// mà không chạy lại toàn bộ truy vấn trên một engine có thể đã đổi.
    /// </summary>
    public double[] ResultScores { get; private set; } = [];

    public long TookMs { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
}

/// <summary>Loại nhãn gắn cho một kết quả tìm kiếm. Chuỗi, không enum — giá trị đi vào dữ liệu phân tích.</summary>
public static class SearchFeedbackKinds
{
    /// <summary>Ngầm: người dùng mở kết quả. Tín hiệu yếu, có bias theo vị trí.</summary>
    public const string Opened = "OPENED";

    /// <summary>Ngầm: kết quả được đưa vào shortlist/vòng ghép cặp. Tín hiệu mạnh nhất trong nhóm ngầm.</summary>
    public const string Shortlisted = "SHORTLISTED";

    /// <summary>Ngầm: người dùng loại kết quả khỏi danh sách đang xem.</summary>
    public const string Dismissed = "DISMISSED";

    /// <summary>Tường minh: người có nghiệp vụ chấm mức liên quan 0–3. Đây là nhãn dùng cho golden set (§26.6.5).</summary>
    public const string Judged = "JUDGED";

    public static bool IsKnown(string kind) => kind is Opened or Shortlisted or Dismissed or Judged;
}

/// <summary>
/// §26.6.5: golden set cần **truy vấn thật có người chấm**, không dựng lại được từ log chỉ có truy vấn và kết quả.
/// Mỗi bản ghi gắn một nhãn cho một kết quả của một lần tìm kiếm cụ thể — không gắn cho "subject nói chung", vì
/// mức liên quan chỉ có nghĩa trong ngữ cảnh của truy vấn đã hỏi.
///
/// `Grade` chỉ có ở nhãn <see cref="SearchFeedbackKinds.Judged"/>: 0 không liên quan, 1 liên quan yếu, 2 liên quan,
/// 3 đúng thứ cần tìm. Thang bốn mức là đầu vào của nDCG; nhãn ngầm không có grade vì click không phải phán quyết.
/// </summary>
public sealed class SearchFeedback : Entity
{
    private SearchFeedback() { }

    public SearchFeedback(Guid queryLogId, SubjectRef subject, int rank, string kind, int? grade,
        Guid? actorRef, string? note, DateTimeOffset createdAt)
    {
        QueryLogId = queryLogId;
        SubjectKind = subject.Kind;
        SubjectId = subject.Id;
        Rank = rank;
        Kind = kind;
        Grade = grade;
        ActorRef = actorRef;
        Note = note;
        CreatedAt = createdAt;
        UpdatedAt = createdAt;
    }

    public Guid QueryLogId { get; private set; }
    public string SubjectKind { get; private set; } = string.Empty;
    public Guid SubjectId { get; private set; }

    /// <summary>Vị trí kết quả trong lần trả về đó, bắt đầu từ 1. Không suy lại được về sau vì engine có thể đã đổi.</summary>
    public int Rank { get; private set; }

    public string Kind { get; private set; } = string.Empty;
    public int? Grade { get; private set; }
    public Guid? ActorRef { get; private set; }
    public string? Note { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public SubjectRef Subject => new(SubjectKind, SubjectId);

    /// <summary>
    /// Chấm lại cùng một kết quả là chuyện bình thường — người chấm đổi ý sau khi đọc kỹ. Ghi đè grade và note,
    /// giữ `CreatedAt` để biết nhãn có từ bao giờ.
    /// </summary>
    public void Revise(int? grade, string? note, Guid? actorRef, DateTimeOffset now)
    {
        Grade = grade;
        Note = note;
        ActorRef = actorRef;
        UpdatedAt = now;
    }
}
