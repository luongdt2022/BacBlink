using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Matching.Application;

/// <summary>ETL `intake_chunks` (giữ embedding) và `intake_matches` → một MatchRound imported per subject (§30.1, §14.2).</summary>
public sealed record LegacyChunkImport(Guid Id, SubjectRef Subject, int Index, string Text, float[] Embedding, DateTimeOffset CreatedAt, LegacyRef Legacy);

public sealed record LegacyMatchImport(
    Guid Id,
    Guid IpIntakeId,
    Guid ChallengeIntakeId,
    double Score,
    string MatchedChunk,
    int ChunkIndex,
    DateTimeOffset ComputedAt,
    DateTimeOffset UpdatedAt,
    LegacyRef Legacy);

public interface IMatchingImporter
{
    Task ImportChunkAsync(LegacyChunkImport chunk, CancellationToken ct);

    /// <summary>
    /// Gom toàn bộ match legacy của một subject thành một MatchRound `SearchEngineVersions.LegacyImported`.
    /// Candidate giữ raw score và algorithm label; không chuẩn hóa thành phần trăm (§30.3).
    /// Legacy lưu một hàng cho cặp (ip, challenge) — cùng hàng xuất hiện ở round của cả hai phía.
    /// </summary>
    Task ImportRoundAsync(SubjectRef subject, IReadOnlyList<LegacyMatchImport> matches, CancellationToken ct);

    Task<int> CountChunksAsync(CancellationToken ct);
    Task<int> CountCandidatesAsync(CancellationToken ct);
}
