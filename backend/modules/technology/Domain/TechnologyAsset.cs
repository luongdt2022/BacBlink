using NacenTech.Contracts.Events;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Technology.Application;

namespace NacenTech.Modules.Technology.Domain;

/// <summary>
/// §12: TechnologyAsset không đồng nghĩa TechnologyPackage. Nội dung nằm ở `TechnologyPackageVersion` bất biến.
/// `QualityLevel` khởi tạo UNREVIEWED và không bao giờ tự lên TRANSACTION_READY khi migrate (§30.1) —
/// chỉ rights/quality gate mới nâng, và gate đó chưa thuộc phạm vi Phase 1.
/// </summary>
public sealed class TechnologyAsset : AggregateRoot
{
    private readonly List<TechnologyPackageVersion> _versions = [];

    private TechnologyAsset() { }

    private TechnologyAsset(Guid? ownerPersonId, string publicationStatus, IReadOnlyList<Guid> sectorIds, Guid? categoryId)
    {
        OwnerPersonId = ownerPersonId;
        PublicationStatus = publicationStatus;
        QualityLevel = QualityLevels.Unreviewed;
        SectorIds = sectorIds.ToArray();
        CategoryId = categoryId;
        CurrentVersionNo = 0;
    }

    public Guid? OwnerPersonId { get; private set; }
    public string PublicationStatus { get; private set; } = PublicationStatuses.Draft;
    public string QualityLevel { get; private set; } = QualityLevels.Unreviewed;
    public int CurrentVersionNo { get; private set; }
    public string? AiTitle { get; private set; }
    public string? AiProcessedContent { get; private set; }
    public string? AiProcessingStatus { get; private set; }
    public string? AiChunkingStatus { get; private set; }
    public Guid[] SectorIds { get; private set; } = [];
    public Guid? CategoryId { get; private set; }
    public DateTimeOffset? DeletedAt { get; private set; }

    public IReadOnlyList<TechnologyPackageVersion> Versions => _versions;

    public SubjectRef Subject => SubjectRef.Technology(Id);

    public static TechnologyAsset Create(CreateTechnologyCommand command, Guid? createdBy, DateTimeOffset now)
    {
        var asset = new TechnologyAsset(command.OwnerPersonId, command.PublicationStatus, command.SectorIds ?? [], command.CategoryId);
        asset.AiProcessedContent = command.AiProcessedContent;
        asset.AddVersion(command.Title, command.Description, createdBy, now);
        if (!string.IsNullOrWhiteSpace(command.Description)) asset.StartAiPipeline();
        if (command.PublicationStatus == PublicationStatuses.Published) asset.Raise(new SubjectPublished(asset.Subject, asset.OwnerPersonId));
        return asset;
    }

    private void AddVersion(string title, string? description, Guid? createdBy, DateTimeOffset now)
    {
        CurrentVersionNo++;
        _versions.Add(new TechnologyPackageVersion(Id, CurrentVersionNo, title, description, createdBy, now));
    }

    private void StartAiPipeline()
    {
        AiTitle = null;
        AiProcessedContent = null;
        AiProcessingStatus = AiStatuses.Completed;
        AiChunkingStatus = AiStatuses.Processing;
        Raise(new SubjectContentChanged(Subject, OwnerPersonId));
    }

    public void Update(UpdateTechnologyCommand command, Guid? actorRef, DateTimeOffset now)
    {
        var current = _versions.OrderByDescending(v => v.VersionNo).First();
        var newTitle = command.Title ?? current.Title;
        var newDescription = command.Description ?? current.Description;
        var contentChanged = command.Description is not null && command.Description != current.Description;
        var titleChanged = command.Title is not null && command.Title != current.Title;

        if (titleChanged || contentChanged) AddVersion(newTitle, newDescription, actorRef, now);
        if (command.AiProcessedContent is not null) AiProcessedContent = command.AiProcessedContent;

        if (command.SectorIds is not null) SectorIds = command.SectorIds.ToArray();
        if (command.ClearCategory) CategoryId = null;
        else if (command.CategoryId is { } cid) CategoryId = cid;

        if (command.PublicationStatus is { } status && status != PublicationStatus)
        {
            PublicationStatus = status;
            if (status == PublicationStatuses.Published) Raise(new SubjectPublished(Subject, OwnerPersonId));
            else Raise(new SubjectUnpublished(Subject));
        }

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

    public static TechnologyAsset Import(LegacyTechnologyImport i)
    {
        var asset = new TechnologyAsset(i.OwnerPersonId, i.Status, i.SectorIds, i.CategoryId);
        asset.OverrideId(i.Id);
        asset.ApplyImportFields(i);
        asset.AddVersion(i.Title, i.Content, i.OwnerPersonId, i.CreatedAt);
        asset.ApplyLegacy(i.Legacy, i.CreatedAt, i.UpdatedAt);
        asset.ClearDomainEvents();
        return asset;
    }

    public void ApplyImportFields(LegacyTechnologyImport i)
    {
        OwnerPersonId = i.OwnerPersonId;
        PublicationStatus = i.Status;
        QualityLevel = QualityLevels.Unreviewed;
        AiTitle = i.AiProcessTitle;
        AiProcessedContent = i.AiProcessedContent;
        AiProcessingStatus = i.AiProcessingStatus;
        AiChunkingStatus = i.AiChunkingStatus;
        SectorIds = i.SectorIds.ToArray();
        CategoryId = i.CategoryId;
        DeletedAt = i.DeletedAt;
    }

    public void ReplaceImportedVersion(LegacyTechnologyImport i)
    {
        _versions.Clear();
        CurrentVersionNo = 0;
        AddVersion(i.Title, i.Content, i.OwnerPersonId, i.CreatedAt);
        ClearDomainEvents();
    }
}

public sealed class TechnologyPackageVersion : Entity
{
    private TechnologyPackageVersion() { }

    public TechnologyPackageVersion(Guid technologyAssetId, int versionNo, string title, string? description, Guid? createdByActorRef, DateTimeOffset createdAt)
    {
        TechnologyAssetId = technologyAssetId;
        VersionNo = versionNo;
        Title = title;
        Description = description;
        CreatedByActorRef = createdByActorRef;
        CreatedAt = createdAt;
    }

    public Guid TechnologyAssetId { get; private set; }
    public int VersionNo { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid? CreatedByActorRef { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
}
