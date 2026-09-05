using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.DataRoom.Application;

/// <summary>
/// Data room §16: Document/DocumentVersion có classification, AccessGrant tầng 2 kiểm ở SQL (§23.2).
/// Ánh xạ legacy (§30.1): attachment → FILE/PROFILE_PICTURE; confidential_level_2/3_content và bản AI → TEXT_SECTION.
/// </summary>
public static class DocumentKinds
{
    public const string File = "FILE";
    public const string ProfilePicture = "PROFILE_PICTURE";
    public const string TextSection = "TEXT_SECTION";
}

/// <summary>Legacy `file_type`: image | video | document | profile_picture.</summary>
public static class FileTypes
{
    public const string Image = "image";
    public const string Video = "video";
    public const string Document = "document";
    public const string ProfilePicture = "profile_picture";
}

/// <summary>Section code cho TEXT_SECTION — tên legacy để facade map 1:1.</summary>
public static class TextSections
{
    public const string Level2Content = "confidentialLevel2Content";
    public const string Level2AiProcessedContent = "confidentialLevel2AiProcessedContent";
    public const string Level3Content = "confidentialLevel3Content";
    public const string Level3AiProcessedContent = "confidentialLevel3AiProcessedContent";

    public static DataClassification ClassificationOf(string sectionCode) => sectionCode switch
    {
        Level2Content or Level2AiProcessedContent => DataClassification.Confidential,
        Level3Content or Level3AiProcessedContent => DataClassification.HighlyConfidential,
        _ => DataClassification.Public,
    };
}

public sealed record DocumentDto(
    Guid Id,
    SubjectRef Subject,
    Guid? OwnerPersonId,
    string Kind,
    string FileType,
    DataClassification Classification,
    string? SectionCode,
    string? FileName,
    string? StorageKey,
    string? Url,
    string? ContentType,
    long? Size,
    string? TextContent,
    string Sha256,
    int VersionNo,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record AccessGrantDto(Guid Id, SubjectRef Subject, Guid GranteePersonId, string Purpose, DataClassification Ceiling, DateTimeOffset ValidFrom, DateTimeOffset? ValidTo, DateTimeOffset? RevokedAt);

public interface IDataRoomService
{
    Task<DocumentDto> AddFileAsync(SubjectRef subject, Guid? ownerPersonId, Stream content, string fileName, string contentType, string fileType, DataClassification classification, CancellationToken ct);

    /// <summary>Thay ảnh đại diện (xóa bản cũ như legacy).</summary>
    Task<DocumentDto> SetProfilePictureAsync(SubjectRef subject, Guid? ownerPersonId, Stream content, string fileName, string contentType, CancellationToken ct);

    /// <summary>Text null/rỗng = gỡ section (soft: version mới rỗng). Classification suy từ sectionCode.</summary>
    Task<DocumentDto?> UpsertTextSectionAsync(SubjectRef subject, Guid? ownerPersonId, string sectionCode, string? text, CancellationToken ct);

    Task<IReadOnlyList<DocumentDto>> ListForSubjectAsync(SubjectRef subject, CancellationToken ct);
    Task<IReadOnlyDictionary<SubjectRef, IReadOnlyList<DocumentDto>>> ListForSubjectsAsync(IReadOnlyCollection<SubjectRef> subjects, CancellationToken ct);

    /// <summary>Chỉ trả document viewer được đọc: PUBLIC cho mọi người; confidential cho owner hoặc grant hiệu lực. Qua IAuthorizationGate, DENY được audit.</summary>
    Task<IReadOnlyList<DocumentDto>> ListReadableAsync(SubjectRef subject, Guid? viewerPersonId, CancellationToken ct);

    Task<DocumentDto> GetAsync(Guid documentId, CancellationToken ct);
    Task<DocumentDto?> FindByStorageKeyAsync(string storageKey, CancellationToken ct);
    Task DeleteAsync(Guid documentId, CancellationToken ct);
    Task DeleteAllForSubjectAsync(SubjectRef subject, CancellationToken ct);

    /// <summary>Mở nội dung file có kiểm quyền. Trả null nếu không tồn tại; ném Forbidden nếu không có quyền.</summary>
    Task<(Stream Content, DocumentDto Document)?> OpenAsync(Guid documentId, Guid? viewerPersonId, CancellationToken ct);

    Task<bool> HasActiveGrantAsync(SubjectRef subject, Guid personId, DataClassification classification, CancellationToken ct);
    Task<AccessGrantDto> IssueGrantAsync(SubjectRef subject, Guid granteePersonId, string purpose, DataClassification ceiling, DateTimeOffset? validTo, CancellationToken ct);
    Task RevokeGrantAsync(Guid grantId, CancellationToken ct);
}
