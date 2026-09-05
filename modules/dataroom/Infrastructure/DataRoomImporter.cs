using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.DataRoom.Application;
using NacenTech.Modules.DataRoom.Domain;

namespace NacenTech.Modules.DataRoom.Infrastructure;

/// <summary>
/// ETL attachment và confidential text section (§30.1). File đã được copy sang object storage bởi ETL tool;
/// ở đây chỉ ghi metadata + hash. File thiếu hash/classification không được vào data room confidential (§30.3).
/// </summary>
public sealed class DataRoomImporter(DbContext db, IUnitOfWork uow) : IDataRoomImporter
{
    public async Task ImportAttachmentAsync(LegacyAttachmentImport i, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(i.Sha256))
            throw new ValidationException($"Attachment {i.Id} thiếu sourceHash — không được nhập vào data room (§30.3)");

        var existing = await db.Set<Document>().FirstOrDefaultAsync(d => d.Id == i.Id, ct);
        if (existing is not null)
        {
            existing.SetOwner(i.OwnerPersonId);
            existing.ApplyLegacy(i.Legacy, i.CreatedAt, i.CreatedAt);
            await uow.CommitAsync(ct);
            return;
        }

        var doc = Document.CreateFile(i.Subject, i.OwnerPersonId, i.FileType, i.Classification, i.FileName, i.StorageKey,
            i.ContentType ?? "application/octet-stream", i.Size ?? 0, i.Sha256, i.CreatedAt);
        doc.OverrideId(i.Id);
        doc.ApplyLegacy(i.Legacy, i.CreatedAt, i.CreatedAt);
        db.Add(doc);
        await uow.CommitAsync(ct);
    }

    public async Task ImportTextSectionAsync(LegacyTextSectionImport i, CancellationToken ct)
    {
        var hash = Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(i.Text)));
        var existing = await db.Set<Document>().FirstOrDefaultAsync(
            d => d.SubjectKind == i.Subject.Kind && d.SubjectId == i.Subject.Id &&
                 d.Kind == DocumentKinds.TextSection && d.SectionCode == i.SectionCode, ct);

        if (existing is null)
        {
            var doc = Document.CreateTextSection(i.Subject, i.OwnerPersonId, i.SectionCode, i.Text, hash, i.CreatedAt);
            doc.ApplyLegacy(i.Legacy, i.CreatedAt, i.CreatedAt);
            db.Add(doc);
        }
        else if (existing.Current.Sha256 != hash)
        {
            existing.AddVersion(null, null, "text/plain", i.Text.Length, i.Text, hash, i.CreatedAt);
            existing.ApplyLegacy(i.Legacy, existing.CreatedAt, i.CreatedAt);
        }
        await uow.CommitAsync(ct);
    }

    public Task<int> CountDocumentsAsync(string kind, CancellationToken ct)
        => db.Set<Document>().AsNoTracking().CountAsync(d => d.Kind == kind, ct);
}
