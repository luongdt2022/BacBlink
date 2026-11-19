using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.DataRoom.Application;

/// <summary>ETL `intake_attachments` → Document FILE/PROFILE_PICTURE; confidential text field → TEXT_SECTION.</summary>
public sealed record LegacyAttachmentImport(
    Guid Id,
    SubjectRef Subject,
    Guid? OwnerPersonId,
    string FileName,
    string StorageKey,          // key đã copy sang object storage
    string? ContentType,
    long? Size,
    string Sha256,
    string FileType,            // image|video|document|profile_picture
    DataClassification Classification,
    DateTimeOffset CreatedAt,
    LegacyRef Legacy);

public sealed record LegacyTextSectionImport(
    SubjectRef Subject,
    Guid? OwnerPersonId,
    string SectionCode,
    string Text,
    DateTimeOffset CreatedAt,
    LegacyRef Legacy);

public interface IDataRoomImporter
{
    Task ImportAttachmentAsync(LegacyAttachmentImport import, CancellationToken ct);
    Task ImportTextSectionAsync(LegacyTextSectionImport import, CancellationToken ct);
    Task<int> CountDocumentsAsync(string kind, CancellationToken ct);
}
