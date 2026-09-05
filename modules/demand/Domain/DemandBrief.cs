using NacenTech.Contracts.Events;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Demand.Application;

namespace NacenTech.Modules.Demand.Domain;

/// <summary>
/// §11: nhu cầu là aggregate có version bất biến. Sửa nội dung = tạo `DemandBriefVersion` mới
/// (§30.3: edit ghi đè của NacenTwin trở thành version đầu, không tạo lịch sử giả).
/// Trạng thái chỉ DRAFT|PUBLISHED — QUALIFIED thuộc case stage-gate, không gắn tại đây.
/// </summary>
public sealed class DemandBrief : AggregateRoot
{
    private readonly List<DemandBriefVersion> _versions = [];

    private DemandBrief() { }

    private DemandBrief(Guid? ownerPersonId, string status, IReadOnlyList<Guid> sectorIds, Guid? categoryId)
    {
        OwnerPersonId = ownerPersonId;
        Status = status;
        SectorIds = sectorIds.ToArray();
        CategoryId = categoryId;
        CurrentVersionNo = 0;
    }

    public Guid? OwnerPersonId { get; private set; }
    public string Status { get; private set; } = DemandStatuses.Draft;
    public int CurrentVersionNo { get; private set; }
    public string? AiTitle { get; private set; }
    public string? AiProcessedContent { get; private set; }
    public string? AiProcessingStatus { get; private set; }
    public string? AiChunkingStatus { get; private set; }
    public Guid[] SectorIds { get; private set; } = [];
    public Guid? CategoryId { get; private set; }
    public DateTimeOffset? DeletedAt { get; private set; }

    public IReadOnlyList<DemandBriefVersion> Versions => _versions;

    public DemandBriefVersion Current => _versions.OrderByDescending(v => v.VersionNo).First();

    public static DemandBrief Create(CreateDemandCommand command, Guid? createdBy, DateTimeOffset now)
    {
        var brief = new DemandBrief(command.OwnerPersonId, command.Status, command.SectorIds ?? [], command.CategoryId);
        brief.AiProcessedContent = command.AiProcessedContent;
        brief.AddVersion(command.Title, command.ProblemStatement, createdBy, now);
        if (!string.IsNullOrWhiteSpace(command.ProblemStatement)) brief.StartAiPipeline();
        if (command.Status == DemandStatuses.Published) brief.Raise(new SubjectPublished(brief.Subject, brief.OwnerPersonId));
        return brief;
    }

    public SubjectRef Subject => SubjectRef.Demand(Id);

    private void AddVersion(string title, string? problemStatement, Guid? createdBy, DateTimeOffset now)
    {
        CurrentVersionNo++;
        _versions.Add(new DemandBriefVersion(Id, CurrentVersionNo, title, problemStatement, createdBy, now));
    }

    /// <summary>
    /// Legacy bỏ bước LLM rewrite: đánh dấu processing COMPLETED rồi đi thẳng sang chunk/embed.
    /// Event SubjectContentChanged để matching re-chunk (thay `void applyChunkEmbedding` fire-and-forget).
    /// </summary>
    private void StartAiPipeline()
    {
        AiTitle = null;
        AiProcessedContent = null;
        AiProcessingStatus = AiStatuses.Completed;
        AiChunkingStatus = AiStatuses.Processing;
        Raise(new SubjectContentChanged(Subject, OwnerPersonId));
    }

    public void Update(UpdateDemandCommand command, Guid? actorRef, DateTimeOffset now)
    {
        var current = Current;
        var newTitle = command.Title ?? current.Title;
        var newProblem = command.ProblemStatement ?? current.ProblemStatement;
        var contentChanged = command.ProblemStatement is not null && command.ProblemStatement != current.ProblemStatement;
        var titleChanged = command.Title is not null && command.Title != current.Title;

        if (titleChanged || contentChanged) AddVersion(newTitle, newProblem, actorRef, now);
        if (command.AiProcessedContent is not null) AiProcessedContent = command.AiProcessedContent;

        if (command.SectorIds is not null) SectorIds = command.SectorIds.ToArray();
        if (command.ClearCategory) CategoryId = null;
        else if (command.CategoryId is { } cid) CategoryId = cid;

        if (command.Status is { } status && status != Status)
        {
            Status = status;
            if (status == DemandStatuses.Published) Raise(new SubjectPublished(Subject, OwnerPersonId));
            else Raise(new SubjectUnpublished(Subject));
        }

        // Chỉ chạy lại pipeline khi nội dung đổi và caller không tự cung cấp bản AI (parity legacy).
        if (contentChanged && command.AiProcessedContent is null) StartAiPipeline();

        Touch();
    }

    public void SetAiResult(string aiTitle, string aiProcessedContent)
    {
        AiTitle = aiTitle;
        AiProcessedContent = aiProcessedContent;
        AiProcessingStatus = AiStatuses.Completed;
        Touch();
    }

    public void SetAiStatus(string? processingStatus, string? chunkingStatus)
    {
        if (processingStatus is not null) AiProcessingStatus = processingStatus;
        if (chunkingStatus is not null) AiChunkingStatus = chunkingStatus;
        Touch();
    }

    public void SoftDelete(DateTimeOffset now)
    {
        if (DeletedAt is not null) return;
        DeletedAt = now;
        Touch();
        Raise(new SubjectDeleted(Subject));
    }

    // ─── ETL (§30.1): không phát event, giữ nguyên id/timestamps ───────────────────────────────
    public static DemandBrief Import(LegacyDemandImport i)
    {
        var brief = new DemandBrief(i.OwnerPersonId, i.Status, i.SectorIds, i.CategoryId);
        brief.OverrideId(i.Id);
        brief.ApplyImportFields(i);
        brief.AddVersion(i.Title, i.Content, i.OwnerPersonId, i.CreatedAt);
        brief.ApplyLegacy(i.Legacy, i.CreatedAt, i.UpdatedAt);
        brief.ClearDomainEvents();
        return brief;
    }

    public void ApplyImportFields(LegacyDemandImport i)
    {
        OwnerPersonId = i.OwnerPersonId;
        Status = i.Status;
        AiTitle = i.AiProcessTitle;
        AiProcessedContent = i.AiProcessedContent;
        AiProcessingStatus = i.AiProcessingStatus;
        AiChunkingStatus = i.AiChunkingStatus;
        SectorIds = i.SectorIds.ToArray();
        CategoryId = i.CategoryId;
        DeletedAt = i.DeletedAt;
    }

    public void ReplaceImportedVersion(LegacyDemandImport i)
    {
        _versions.Clear();
        CurrentVersionNo = 0;
        AddVersion(i.Title, i.Content, i.OwnerPersonId, i.CreatedAt);
        ClearDomainEvents();
    }
}

public sealed class DemandBriefVersion : Entity
{
    private DemandBriefVersion() { }

    public DemandBriefVersion(Guid demandBriefId, int versionNo, string title, string? problemStatement, Guid? createdByActorRef, DateTimeOffset createdAt)
    {
        DemandBriefId = demandBriefId;
        VersionNo = versionNo;
        Title = title;
        ProblemStatement = problemStatement;
        CreatedByActorRef = createdByActorRef;
        CreatedAt = createdAt;
    }

    public Guid DemandBriefId { get; private set; }
    public int VersionNo { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? ProblemStatement { get; private set; }
    public Guid? CreatedByActorRef { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
}
