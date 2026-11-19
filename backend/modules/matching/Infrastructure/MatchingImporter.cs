using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Matching.Application;
using NacenTech.Modules.Matching.Domain;

namespace NacenTech.Modules.Matching.Infrastructure;

/// <summary>
/// ETL `intake_chunks` (giữ nguyên vector, không embed lại) và `intake_matches` → một MatchRound
/// `nestjs-intake_matches/imported` cho mỗi subject (§30.1). Round import là chỉ đọc; round mới do .NET tạo.
/// </summary>
public sealed class MatchingImporter(DbContext db, IUnitOfWork uow, IClock clock, IJobQueue jobs, IOptions<MatchingOptions> options) : IMatchingImporter
{
    private readonly MatchingOptions _options = options.Value;

    public async Task ImportChunkAsync(LegacyChunkImport chunk, CancellationToken ct)
    {
        var existing = await db.Set<ContentChunk>().FirstOrDefaultAsync(c => c.Id == chunk.Id, ct);
        if (existing is null)
        {
            var created = new ContentChunk(chunk.Subject, chunk.Index, chunk.Text, chunk.Embedding, _options.EmbeddingModelVersion, chunk.CreatedAt);
            created.OverrideIdentity(chunk.Id);
            db.Add(created);
        }
        else
        {
            existing.Update(chunk.Text, chunk.Embedding, _options.EmbeddingModelVersion);
        }
        // ADR-0010: bản chiếu tìm kiếm không tự sinh từ `content_chunks`. Một job dựng lại cho mỗi subject, gộp
        // theo khoá — một subject có hàng chục đoạn nhưng chỉ cần một lần dựng, và không gọi sidecar.
        jobs.Enqueue(new RebuildSearchIndexJob(chunk.Subject.ToString()), dedupKey: $"reindex:{chunk.Subject}");
        await uow.CommitAsync(ct);
    }

    public async Task ImportRoundAsync(SubjectRef subject, IReadOnlyList<LegacyMatchImport> matches, CancellationToken ct)
    {
        var previousImported = await db.Set<MatchRound>()
            .Where(r => r.SubjectKind == subject.Kind && r.SubjectId == subject.Id && r.SearchEngineVersion == SearchEngineVersions.LegacyImported)
            .ToListAsync(ct);
        foreach (var r in previousImported) db.Remove(r);

        if (matches.Count == 0)
        {
            await uow.CommitAsync(ct);
            return;
        }

        var hasOtherRound = await db.Set<MatchRound>().AnyAsync(
            r => r.SubjectKind == subject.Kind && r.SubjectId == subject.Id &&
                 r.SearchEngineVersion != SearchEngineVersions.LegacyImported && r.IsAuthoritative, ct);

        // Legacy lưu một hàng cho cặp (ip, challenge); phía đối diện của round là bên kia của cặp.
        var candidates = matches.Select(m => (
            m.Id,
            Candidate: subject.Kind == SubjectKinds.DemandBrief
                ? SubjectRef.Technology(m.IpIntakeId)
                : SubjectRef.Demand(m.ChallengeIntakeId),
            m.Score,
            m.MatchedChunk,
            m.ChunkIndex,
            m.ComputedAt,
            m.UpdatedAt));

        var round = MatchRound.Import(subject, _options.EmbeddingModelVersion, !hasOtherRound, candidates, clock.UtcNow);
        db.Add(round);
        await uow.CommitAsync(ct);
    }

    public Task<int> CountChunksAsync(CancellationToken ct) => db.Set<ContentChunk>().AsNoTracking().CountAsync(ct);

    public Task<int> CountCandidatesAsync(CancellationToken ct) => db.Set<MatchCandidate>().AsNoTracking().CountAsync(ct);
}
