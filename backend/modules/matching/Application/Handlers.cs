using NacenTech.Contracts.Events;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Matching.Application;

/// <summary>
/// Thay `void this.applyChunkEmbedding(...)` fire-and-forget của NestJS: nội dung đổi → event → job.
/// Handler chỉ enqueue, không commit (dispatcher commit); job mới thực sự gọi model và index.
/// </summary>
public sealed class SubjectEventsHandler(IMatchingService matching)
    : IIntegrationEventHandler<SubjectContentChanged>,
      IIntegrationEventHandler<SubjectPublished>,
      IIntegrationEventHandler<SubjectUnpublished>,
      IIntegrationEventHandler<SubjectDeleted>
{
    private readonly MatchingService _service = (MatchingService)matching;

    public Task HandleAsync(SubjectContentChanged e, CancellationToken ct)
    {
        _service.EnqueueChunkEmbed(e.Subject);
        return Task.CompletedTask;
    }

    // Publish/unpublish đổi metadata `is_published` trong index → re-index qua cùng job.
    public Task HandleAsync(SubjectPublished e, CancellationToken ct)
    {
        _service.EnqueueChunkEmbed(e.Subject);
        return Task.CompletedTask;
    }

    public Task HandleAsync(SubjectUnpublished e, CancellationToken ct)
    {
        _service.EnqueueChunkEmbed(e.Subject);
        return Task.CompletedTask;
    }

    public Task HandleAsync(SubjectDeleted e, CancellationToken ct) => matching.RemoveSubjectAsync(e.Subject, ct);
}

public sealed class ChunkEmbedJobHandler(IMatchingService matching) : IJobHandler<ChunkEmbedJob>
{
    public Task HandleAsync(ChunkEmbedJob job, CancellationToken ct)
        => matching.ChunkEmbedAndIndexAsync(SubjectRef.Parse(job.Subject), ct);
}

public sealed class ComputeMatchesJobHandler(IMatchingService matching) : IJobHandler<ComputeMatchesJob>
{
    public Task HandleAsync(ComputeMatchesJob job, CancellationToken ct)
        => matching.ComputeMatchesAsync(SubjectRef.Parse(job.Subject), ct);
}

public sealed class RebuildSearchIndexJobHandler(IMatchingService matching) : IJobHandler<RebuildSearchIndexJob>
{
    public Task HandleAsync(RebuildSearchIndexJob job, CancellationToken ct)
        => matching.RebuildSearchIndexAsync(SubjectRef.Parse(job.Subject), ct);
}
