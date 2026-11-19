using NacenTech.Kernel.Domain;
using NacenTech.Modules.DataRoom.Application;

namespace NacenTech.Modules.DataRoom.Domain;

/// <summary>
/// §16: Document có classification; nội dung nằm trong `DocumentVersion` (bytes ở object storage, text inline).
/// Legacy `intake_attachments` → FILE/PROFILE_PICTURE; `confidential_level_*_content` → TEXT_SECTION (§30.1).
/// </summary>
public sealed class Document : AggregateRoot
{
    private readonly List<DocumentVersion> _versions = [];

    private Document() { }

    private Document(SubjectRef subject, Guid? ownerPersonId, string kind, string fileType, DataClassification classification, string? sectionCode)
    {
        SubjectKind = subject.Kind;
        SubjectId = subject.Id;
        OwnerPersonId = ownerPersonId;
        Kind = kind;
        FileType = fileType;
        Classification = classification;
        SectionCode = sectionCode;
        CurrentVersionNo = 0;
    }

    public string SubjectKind { get; private set; } = string.Empty;
    public Guid SubjectId { get; private set; }
    public Guid? OwnerPersonId { get; private set; }
    public string Kind { get; private set; } = DocumentKinds.File;
    public string FileType { get; private set; } = FileTypes.Document;
    public DataClassification Classification { get; private set; }
    public string? SectionCode { get; private set; }
    public int CurrentVersionNo { get; private set; }

    public IReadOnlyList<DocumentVersion> Versions => _versions;

    public SubjectRef Subject => new(SubjectKind, SubjectId);

    public DocumentVersion Current => _versions.OrderByDescending(v => v.VersionNo).First();

    public static Document CreateFile(SubjectRef subject, Guid? ownerPersonId, string fileType, DataClassification classification,
        string fileName, string storageKey, string contentType, long size, string sha256, DateTimeOffset now)
    {
        var kind = fileType == FileTypes.ProfilePicture ? DocumentKinds.ProfilePicture : DocumentKinds.File;
        var doc = new Document(subject, ownerPersonId, kind, fileType, classification, null);
        doc.AddVersion(fileName, storageKey, contentType, size, null, sha256, now);
        return doc;
    }

    public static Document CreateTextSection(SubjectRef subject, Guid? ownerPersonId, string sectionCode, string text, string sha256, DateTimeOffset now)
    {
        var doc = new Document(subject, ownerPersonId, DocumentKinds.TextSection, FileTypes.Document, TextSections.ClassificationOf(sectionCode), sectionCode);
        doc.AddVersion(null, null, "text/plain", text.Length, text, sha256, now);
        return doc;
    }

    public DocumentVersion AddVersion(string? fileName, string? storageKey, string? contentType, long? size, string? textContent, string sha256, DateTimeOffset now)
    {
        CurrentVersionNo++;
        var version = new DocumentVersion(Id, CurrentVersionNo, fileName, storageKey, contentType, size, textContent, sha256, now);
        _versions.Add(version);
        Touch();
        return version;
    }

    public void SetOwner(Guid? ownerPersonId)
    {
        OwnerPersonId = ownerPersonId;
        Touch();
    }
}

public sealed class DocumentVersion : Entity
{
    private DocumentVersion() { }

    public DocumentVersion(Guid documentId, int versionNo, string? fileName, string? storageKey, string? contentType, long? size, string? textContent, string sha256, DateTimeOffset createdAt)
    {
        DocumentId = documentId;
        VersionNo = versionNo;
        FileName = fileName;
        StorageKey = storageKey;
        ContentType = contentType;
        Size = size;
        TextContent = textContent;
        Sha256 = sha256;
        CreatedAt = createdAt;
    }

    public Guid DocumentId { get; private set; }
    public int VersionNo { get; private set; }
    public string? FileName { get; private set; }
    public string? StorageKey { get; private set; }
    public string? ContentType { get; private set; }
    public long? Size { get; private set; }
    public string? TextContent { get; private set; }
    public string Sha256 { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
}

/// <summary>
/// Tầng 2 của authorization (§23.2): grant sống trong SQL, KHÔNG nạp vào DecisionTable.
/// `Ceiling` là mức mật cao nhất grant cho phép đọc; purpose thuộc taxonomy đóng.
/// </summary>
public sealed class AccessGrant : AggregateRoot
{
    private AccessGrant() { }

    public AccessGrant(SubjectRef subject, Guid granteePersonId, string purpose, DataClassification ceiling, DateTimeOffset validFrom, DateTimeOffset? validTo, Guid? issuedByActorRef)
    {
        SubjectKind = subject.Kind;
        SubjectId = subject.Id;
        GranteePersonId = granteePersonId;
        Purpose = purpose;
        Ceiling = ceiling;
        ValidFrom = validFrom;
        ValidTo = validTo;
        IssuedByActorRef = issuedByActorRef;
    }

    public string SubjectKind { get; private set; } = string.Empty;
    public Guid SubjectId { get; private set; }
    public Guid GranteePersonId { get; private set; }
    public string Purpose { get; private set; } = string.Empty;
    public DataClassification Ceiling { get; private set; }
    public DateTimeOffset ValidFrom { get; private set; }
    public DateTimeOffset? ValidTo { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }
    public Guid? IssuedByActorRef { get; private set; }

    public SubjectRef Subject => new(SubjectKind, SubjectId);

    public void Revoke(DateTimeOffset now)
    {
        RevokedAt = now;
        Touch();
    }
}
