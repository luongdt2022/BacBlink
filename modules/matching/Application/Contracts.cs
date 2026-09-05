using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Matching.Application;

/// <summary>
/// Matching §14 + §26.6. Chỉ mục tìm kiếm nằm trong PostgreSQL — pgvector + FTS có unaccent (ADR-0010, đóng D2-26;
/// Elasticsearch đã gỡ 2026-09-05). Hai chế độ scoring sau flag (§26.6.7 bước 2–3):
/// LEGACY_SCORING tái tạo hành vi NestJS (knn + BM25 cộng điểm, hard filter sau top-K) để đo baseline;
/// CORRECTED_SCORING: hard filter trước, hai kênh recall riêng, hợp nhất RRF.
/// </summary>
public sealed class MatchingOptions
{
    public const string Section = "Matching";
    public string ScoringMode { get; set; } = ScoringModes.Legacy;
    public string EmbeddingBaseUrl { get; set; } = "http://localhost:8003";
    public string EmbeddingModelVersion { get; set; } = "bge-m3";
    public int ChunkSize { get; set; } = 1500;
    public int ChunkOverlap { get; set; } = 150;
    public int MatchLimit { get; set; } = 10;
    /// <summary>Ngưỡng điểm cho chế độ CŨ (cosine + điểm từ khoá, thang 1–10). Không có nghĩa với điểm RRF.</summary>
    public double MatchMinScore { get; set; } = 1.0;
    /// <summary>
    /// B-45: ngưỡng cho chế độ ĐÃ SỬA. Điểm RRF là tổng các `1/(60+hạng)` — tối đa ≈ 0,05 với ba kênh — nên
    /// ngưỡng 1.0 của chế độ cũ loại mọi kết quả. Mặc định 0: RRF không có thang tuyệt đối, giới hạn bằng số
    /// kết quả (`MatchLimit`), không bằng điểm.
    /// </summary>
    public double MatchMinScoreCorrected { get; set; } = 0;
    /// <summary>
    /// Bật kênh sparse (§26.6.7 bước 4): client xin `return_sparse` từ sidecar, chỉ mục giữ `sparsevec`, chế độ
    /// đã sửa hợp nhất BA kênh. Cờ vận hành; đổi cờ đổi nhãn engine của vòng tính sau đó (D2-26).
    /// </summary>
    public bool UseSparse { get; set; } = false;
    /// <summary>
    /// Bật cross-encoder rerank (§26.6.3) trên N ứng viên đầu sau RRF ở chế độ đã sửa. Cờ vận hành; đổi cờ đổi
    /// nhãn engine (hậu tố `-rerank`). Điểm cuối là điểm reranker (0–1), không còn là điểm RRF.
    /// </summary>
    public bool UseRerank { get; set; } = false;
    /// <summary>Số ứng viên đầu đưa vào reranker. Cross-encoder đắt tuyến tính theo N; 30 là đủ cho `MatchLimit` 10.</summary>
    public int RerankTopN { get; set; } = 30;
    /// <summary>Kích thước từ vựng BGE-M3 (XLM-R). Cố định theo mô hình; đổi mô hình là đổi migration.</summary>
    public const int SparseDims = 250002;
    public int QueryContentChars { get; set; } = 1500;
}

public static class ScoringModes
{
    public const string Legacy = "LEGACY_SCORING";
    public const string Corrected = "CORRECTED_SCORING";
}

/// <summary>
/// Nhãn công cụ trên từng vòng — bất biến D2-26: mỗi vòng đúng một engine authoritative. Hai nhãn Elasticsearch
/// giữ lại làm **nhãn lịch sử** (vòng nào từng tính bằng chúng vẫn đọc được), không còn mã nào tạo vòng mới với
/// chúng từ 2026-09-05 (ADR-0010).
/// </summary>
public static class SearchEngineVersions
{
    public const string PostgresLegacy = "postgres-16/pgvector-legacy";
    public const string PostgresCorrected = "postgres-16/pgvector-rrf";
    /// <summary>Chế độ đã sửa với kênh sparse thứ ba. Nhãn riêng vì thêm một kênh là đổi thuật toán (D2-26).</summary>
    public const string PostgresCorrectedSparse = "postgres-16/pgvector-rrf3";
    /// <summary>Hậu tố khi bật cross-encoder rerank: điểm cuối không còn là RRF, nên là một engine khác (D2-26).</summary>
    public const string RerankSuffix = "-rerank";
    public const string ElasticsearchLegacy = "elasticsearch-8.17/legacy-scoring";
    public const string ElasticsearchCorrected = "elasticsearch-8.17/corrected-rrf";
    /// <summary>Round được ETL từ bảng intake_matches của NestJS.</summary>
    public const string LegacyImported = "nestjs-intake_matches/imported";
}

public sealed record SearchQuery(
    string Query,
    int Limit,
    string? TargetKind,
    IReadOnlyList<Guid>? SectorIds,
    double MinScore,
    Guid? ExcludeOwnerPersonId,
    bool PublishedOnly);

public sealed record SearchHitDto(
    SubjectRef Subject,
    string Title,
    string? AiTitle,
    string MatchedChunk,
    int ChunkIndex,
    double Score,
    IReadOnlyList<Guid> SectorIds,
    IReadOnlyList<string> SectorNames);

public sealed record SearchResultDto(IReadOnlyList<SearchHitDto> Hits, int Total, long TookMs);

/// <summary>
/// Bốn thông tin phải lộ ra (công cụ, mô hình nhúng, chế độ chấm điểm, số ứng viên) cộng hai thứ trang so sánh
/// cần: `QueryText` — vòng nhập từ hệ cũ **không có** (`null`), nên không dựng lại được nó đã hỏi gì — và
/// `IsAuthoritative`, cờ nói vòng này có phải vòng đang dùng cho subject hay không.
/// </summary>
public sealed record MatchRoundDto(Guid Id, SubjectRef Subject, string SearchEngineVersion, string EmbeddingModelVersion, string ScoringMode, int CandidateCount, DateTimeOffset CreatedAt, string? QueryText, bool IsAuthoritative);

/// <summary>Bộ lọc danh sách vòng. Không lọc theo điểm — điểm của hai chế độ không cùng đơn vị.</summary>
public sealed record MatchRoundFilter(string? ScoringMode, string? SearchEngineVersion);

public sealed record MatchCandidateDto(
    Guid Id,
    Guid RoundId,
    SubjectRef Subject,
    SubjectRef Candidate,
    double RawScore,
    string MatchedChunk,
    int ChunkIndex,
    int Rank,
    string? Reason,
    DateTimeOffset ComputedAt,
    DateTimeOffset UpdatedAt);

public interface IMatchingService
{
    Task<MatchRoundDto?> GetLatestRoundAsync(SubjectRef subject, CancellationToken ct);
    Task<PagedResult<MatchCandidateDto>> ListCandidatesAsync(SubjectRef subject, PageRequest page, CancellationToken ct);
    Task<IReadOnlyList<MatchCandidateDto>> TopCandidatesAsync(SubjectRef subject, int take, CancellationToken ct);

    /// <summary>
    /// Mọi vòng đã tính cho một subject, mới nhất trước — mục đích chính của việc giữ vòng cũ là so được hai
    /// vòng (§14.2). Trước 2026-09-05 chỉ có đường lấy vòng mới nhất, nên trang so sánh không dựng được.
    /// </summary>
    Task<PagedResult<MatchRoundDto>> ListRoundsAsync(SubjectRef subject, MatchRoundFilter filter, PageRequest page, CancellationToken ct);

    /// <summary>Một vòng theo định danh; `null` khi không có. Không gate — cửa HTTP hỏi subject của vòng có đọc được không.</summary>
    Task<MatchRoundDto?> GetRoundAsync(Guid roundId, CancellationToken ct);

    /// <summary>Ứng viên của **một vòng cụ thể**, theo hạng tăng dần — không phải của vòng đang dùng.</summary>
    Task<PagedResult<MatchCandidateDto>> ListRoundCandidatesAsync(Guid roundId, PageRequest page, CancellationToken ct);

    /// <summary>Hybrid search; ghi `search_query_log` (§26.6.4).</summary>
    Task<SearchResultDto> SearchAsync(SearchQuery query, Guid? actorPersonId, CancellationToken ct);

    Task RequestChunkEmbedAsync(SubjectRef subject, CancellationToken ct);
    Task RequestComputeMatchesAsync(SubjectRef subject, CancellationToken ct);

    /// <summary>Chạy trong job: tạo MatchRound mới (round cũ chỉ đọc, §14.2), phát MatchRoundCompleted. Trả số candidate.</summary>
    Task<int> ComputeMatchesAsync(SubjectRef subject, CancellationToken ct);

    Task ChunkEmbedAndIndexAsync(SubjectRef subject, CancellationToken ct);
    Task RemoveSubjectAsync(SubjectRef subject, CancellationToken ct);

    /// <summary>
    /// Dựng lại bản chiếu tìm kiếm của một subject từ `content_chunks` đã có — **không gọi sidecar**. Dành cho
    /// dữ liệu di trú từ NestJS (vector đã có, chỉ mục chưa có) và cho mọi lần đổi hình dạng bảng chiếu.
    /// Trả `false` khi subject không có đoạn nào hoặc không phân giải được (bản chiếu bị xoá).
    /// </summary>
    Task<bool> RebuildSearchIndexAsync(SubjectRef subject, CancellationToken ct);
}

/// <summary>Chỉ mục tìm kiếm (PostgreSQL: pgvector + FTS, ADR-0010). Không giữ nội dung mật (D2-143).</summary>
public interface ISearchIndex
{
    Task EnsureIndexAsync(CancellationToken ct);
    Task IndexChunksAsync(IReadOnlyList<IndexedChunk> chunks, CancellationToken ct);
    Task DeleteSubjectAsync(SubjectRef subject, CancellationToken ct);
    Task<RawSearchResult> SearchAsync(RawSearchRequest request, CancellationToken ct);
}

public sealed record IndexedChunk(SubjectRef Subject, int ChunkIndex, string Text, float[] Embedding, string Title, string? AiTitle, string SubjectKind, IReadOnlyList<Guid> SectorIds, IReadOnlyList<string> SectorNames, Guid? OwnerPersonId, bool IsPublished, IReadOnlyDictionary<int, float>? Sparse = null);

public sealed record RawSearchRequest(string QueryText, float[] QueryVector, int Size, string ScoringMode, string? SubjectKind, IReadOnlyList<Guid>? SectorIds, Guid? ExcludeOwnerPersonId, bool PublishedOnly, IReadOnlyDictionary<int, float>? QuerySparse = null);

public sealed record RawSearchHit(SubjectRef Subject, int ChunkIndex, string Text, double Score, string Title, string? AiTitle, IReadOnlyList<Guid> SectorIds, IReadOnlyList<string> SectorNames);

public sealed record RawSearchResult(IReadOnlyList<RawSearchHit> Hits, long TookMs);

public interface ITextChunker
{
    IReadOnlyList<string> Chunk(string text, int chunkSize, int chunkOverlap);
}

public sealed record ChunkEmbedJob(string Subject) : IJob;

public sealed record ComputeMatchesJob(string Subject) : IJob;

/// <summary>Dựng lại bản chiếu tìm kiếm từ `content_chunks` (không nhúng lại). Enqueue sau ETL và khi đổi hình dạng bảng chiếu.</summary>
public sealed record RebuildSearchIndexJob(string Subject) : IJob;
