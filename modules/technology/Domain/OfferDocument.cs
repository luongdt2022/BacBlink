using System;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Technology.Domain;

public sealed class OfferDocument : Entity
{
    private OfferDocument() { }

    public OfferDocument(
        Guid offerId,
        string documentType,
        string fileName,
        string fileUrl,
        long fileSizeBytes,
        string accessScope = "AFTER_CONNECTION")
    {
        OfferId = offerId;
        DocumentType = documentType;
        FileName = fileName;
        FileUrl = fileUrl;
        FileSizeBytes = fileSizeBytes;
        AccessScope = accessScope;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public Guid OfferId { get; private set; }
    public string DocumentType { get; private set; } = default!; // CATALOGUE | PATENT_CERT | TRL_EVIDENCE | VIDEO | OTHER
    public string FileName { get; private set; } = default!;
    public string FileUrl { get; private set; } = default!;
    public long FileSizeBytes { get; private set; }
    public string AccessScope { get; private set; } = "AFTER_CONNECTION"; // PUBLIC | AFTER_CONNECTION | ADMIN_ONLY
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    public void UpdateAccessScope(string accessScope)
    {
        AccessScope = accessScope;
    }
}
