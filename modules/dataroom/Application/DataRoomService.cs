using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.DataRoom.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.DataRoom.Application;

public sealed class DataRoomService(
    DbContext db,
    IUnitOfWork uow,
    ICurrentActor actor,
    IAuthorizationGate gate,
    IObjectStorage storage,
    IAuditWriter audit,
    IClock clock) : IDataRoomService
{
    // Allowlist theo `file-upload.service.ts` — giữ nguyên để không thay đổi hành vi upload của portal.
    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff", "image/x-icon",
        "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain", "application/zip", "application/x-rar-compressed",
    };

    private static readonly HashSet<string> BlockedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".php", ".exe", ".bat", ".cmd", ".sh", ".js", ".mjs", ".ts", ".py", ".rb", ".pl",
        ".c", ".cpp", ".java", ".jar", ".go", ".rs", ".html", ".htm",
    };

    public async Task<DocumentDto> AddFileAsync(SubjectRef subject, Guid? ownerPersonId, Stream content, string fileName, string contentType, string fileType, DataClassification classification, CancellationToken ct)
    {
        Validate(fileName, contentType);
        RequireWrite(ownerPersonId, subject, null);

        var stored = await storage.PutAsync(content, "intakes", fileName, contentType, ct);
        var doc = Document.CreateFile(subject, ownerPersonId, fileType, classification, stored.FileName, stored.Key, stored.ContentType, stored.Size, stored.Sha256, clock.UtcNow);
        db.Add(doc);
        await uow.CommitAsync(ct);
        return ToDto(doc);
    }

    public async Task<DocumentDto> SetProfilePictureAsync(SubjectRef subject, Guid? ownerPersonId, Stream content, string fileName, string contentType, CancellationToken ct)
    {
        Validate(fileName, contentType);
        RequireWrite(ownerPersonId, subject, null);

        var existing = await db.Set<Document>()
            .Where(d => d.SubjectKind == subject.Kind && d.SubjectId == subject.Id && d.Kind == DocumentKinds.ProfilePicture)
            .ToListAsync(ct);
        foreach (var e in existing) db.Remove(e);

        var stored = await storage.PutAsync(content, "intakes", fileName, contentType, ct);
        var doc = Document.CreateFile(subject, ownerPersonId, FileTypes.ProfilePicture, DataClassification.Public, stored.FileName, stored.Key, stored.ContentType, stored.Size, stored.Sha256, clock.UtcNow);
        db.Add(doc);
        await uow.CommitAsync(ct);
        return ToDto(doc);
    }

    public async Task<DocumentDto?> UpsertTextSectionAsync(SubjectRef subject, Guid? ownerPersonId, string sectionCode, string? text, CancellationToken ct)
    {
        RequireWrite(ownerPersonId, subject, null);

        var doc = await db.Set<Document>().FirstOrDefaultAsync(
            d => d.SubjectKind == subject.Kind && d.SubjectId == subject.Id && d.Kind == DocumentKinds.TextSection && d.SectionCode == sectionCode, ct);

        if (string.IsNullOrEmpty(text))
        {
            if (doc is null) return null;
            doc.AddVersion(null, null, "text/plain", 0, null, Sha256Of(string.Empty), clock.UtcNow);
            await uow.CommitAsync(ct);
            return ToDto(doc);
        }

        var hash = Sha256Of(text);
        if (doc is null)
        {
            doc = Document.CreateTextSection(subject, ownerPersonId, sectionCode, text, hash, clock.UtcNow);
            db.Add(doc);
        }
        else if (doc.Current.TextContent != text)
        {
            doc.AddVersion(null, null, "text/plain", text.Length, text, hash, clock.UtcNow);
        }
        await uow.CommitAsync(ct);
        return ToDto(doc);
    }

    /// <summary>Không gate — caller lọc; dùng cho projection nội bộ.</summary>
    public async Task<IReadOnlyList<DocumentDto>> ListForSubjectAsync(SubjectRef subject, CancellationToken ct)
    {
        var docs = await db.Set<Document>().AsNoTracking()
            .Where(d => d.SubjectKind == subject.Kind && d.SubjectId == subject.Id).ToListAsync(ct);
        return docs.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyDictionary<SubjectRef, IReadOnlyList<DocumentDto>>> ListForSubjectsAsync(IReadOnlyCollection<SubjectRef> subjects, CancellationToken ct)
    {
        var result = new Dictionary<SubjectRef, IReadOnlyList<DocumentDto>>();
        if (subjects.Count == 0) return result;

        foreach (var group in subjects.Distinct().GroupBy(s => s.Kind))
        {
            var ids = group.Select(g => g.Id).ToArray();
            var docs = await db.Set<Document>().AsNoTracking()
                .Where(d => d.SubjectKind == group.Key && ids.Contains(d.SubjectId)).ToListAsync(ct);
            foreach (var subjectGroup in docs.GroupBy(d => d.SubjectId))
            {
                result[new SubjectRef(group.Key, subjectGroup.Key)] = subjectGroup.Select(ToDto).ToList();
            }
        }
        foreach (var s in subjects.Distinct()) result.TryAdd(s, []);
        return result;
    }

    /// <summary>
    /// AC 5/17/28: chỉ trả tài liệu viewer thực sự được đọc. PUBLIC cho mọi người; mật chỉ cho owner
    /// hoặc người có AccessGrant hiệu lực (tầng 2) và rule cho phép (tầng 1).
    /// </summary>
    public async Task<IReadOnlyList<DocumentDto>> ListReadableAsync(SubjectRef subject, Guid? viewerPersonId, CancellationToken ct)
    {
        var docs = await db.Set<Document>().AsNoTracking()
            .Where(d => d.SubjectKind == subject.Kind && d.SubjectId == subject.Id).ToListAsync(ct);

        var readable = new List<DocumentDto>();
        var excluded = new List<Document>();
        string? lastRuleId = null;

        foreach (var doc in docs)
        {
            if (!doc.Classification.IsConfidential()) { readable.Add(ToDto(doc)); continue; }
            if (viewerPersonId is not null && doc.OwnerPersonId == viewerPersonId) { readable.Add(ToDto(doc)); continue; }
            if (viewerPersonId is null) { excluded.Add(doc); continue; }

            var hasGrant = await HasActiveGrantAsync(subject, viewerPersonId.Value, doc.Classification, ct);
            if (!hasGrant) { excluded.Add(doc); continue; }

            var decision = gate.Evaluate(new AuthorizationRequest(
                Actions.DocumentRead, actor.PlatformRole,
                OrganizationRelation: OrganizationRelations.None,
                DocumentClassification: ClassificationCode(doc.Classification),
                AccessGrantVerified: true));

            if (decision.IsPermitted) readable.Add(ToDto(doc));
            else { excluded.Add(doc); lastRuleId = decision.RuleId; }
        }

        AuditExclusions(subject, excluded, lastRuleId);
        return readable;
    }

    /// <summary>
    /// B-29: lượt bị loại khỏi danh sách phải để lại dấu vết.
    ///
    /// Đường **mở** một tài liệu đi qua `gate.Require` nên nó ghi audit; đường **liệt kê** chỉ hỏi
    /// `gate.Evaluate`, vốn không ghi gì. Nghĩa là cách phổ biến nhất mà một người chạm vào tài liệu mật họ
    /// không được đọc — mở danh sách và thấy nó bị lọc đi — lại là cách duy nhất không để lại vết.
    ///
    /// Không dùng `Require` cho từng tài liệu, vì hai lý do: nó **ném exception** nên không lọc được, và nó
    /// sẽ sinh một dòng cho mỗi tài liệu bị loại — một bản ghi có 40 tài liệu mật sẽ đẻ 40 dòng mỗi lần ai đó
    /// mở trang. Một **dòng tổng hợp cho mỗi lượt liệt kê**, mang số tài liệu bị loại và phân bố theo mức mật,
    /// trả lời đúng câu mà người đọc nhật ký cần: ai đã chạm vào tài liệu mật của bản ghi này, và bị chặn.
    ///
    /// Ghi qua `IAuditWriter` nên nó dùng kết nối riêng và không phụ thuộc việc đường đọc có commit hay không.
    /// </summary>
    private void AuditExclusions(SubjectRef subject, IReadOnlyList<Document> excluded, string? ruleId)
    {
        if (excluded.Count == 0) return;

        var byClassification = excluded
            .GroupBy(d => ClassificationCode(d.Classification))
            .OrderBy(g => g.Key)
            .Select(g => $"{g.Key}={g.Count()}");

        var details = $"excludedCount={excluded.Count}; byClassification={string.Join(",", byClassification)}";

        audit.Append(new AuditEntry(
            actor.PersonId, actor.PlatformRole, Actions.DocumentRead, "DocumentList", subject.Id, null,
            null, "DENY", ruleId, actor.CorrelationId, actor.IpAddress, actor.UserAgent, details));
    }

    public async Task<DocumentDto> GetAsync(Guid documentId, CancellationToken ct) => ToDto(await LoadAsync(documentId, ct));

    public async Task<DocumentDto?> FindByStorageKeyAsync(string storageKey, CancellationToken ct)
    {
        var doc = await db.Set<Document>().AsNoTracking()
            .FirstOrDefaultAsync(d => d.Versions.Any(v => v.StorageKey == storageKey), ct);
        return doc is null ? null : ToDto(doc);
    }

    public async Task DeleteAsync(Guid documentId, CancellationToken ct)
    {
        var doc = await LoadAsync(documentId, ct);
        RequireWrite(doc.OwnerPersonId, doc.Subject, documentId, Actions.DocumentDelete);
        db.Remove(doc);
        await uow.CommitAsync(ct);
    }

    /// <summary>Không gate — dùng khi subject bị xóa (cascade nội bộ).</summary>
    public async Task DeleteAllForSubjectAsync(SubjectRef subject, CancellationToken ct)
    {
        var docs = await db.Set<Document>().Where(d => d.SubjectKind == subject.Kind && d.SubjectId == subject.Id).ToListAsync(ct);
        foreach (var d in docs) db.Remove(d);
        await uow.CommitAsync(ct);
    }

    public async Task<(Stream Content, DocumentDto Document)?> OpenAsync(Guid documentId, Guid? viewerPersonId, CancellationToken ct)
    {
        var doc = await db.Set<Document>().AsNoTracking().FirstOrDefaultAsync(d => d.Id == documentId, ct);
        if (doc is null) return null;

        var isOwner = viewerPersonId is not null && doc.OwnerPersonId == viewerPersonId;
        var hasGrant = !isOwner && viewerPersonId is not null && doc.Classification.IsConfidential()
            && await HasActiveGrantAsync(doc.Subject, viewerPersonId.Value, doc.Classification, ct);

        gate.Require(new AuthorizationRequest(
            Actions.DocumentRead, actor.PlatformRole,
            OrganizationRelation: isOwner ? OrganizationRelations.Owner : OrganizationRelations.None,
            DocumentClassification: ClassificationCode(doc.Classification),
            AccessGrantVerified: hasGrant), "Document", documentId);

        var key = doc.Current.StorageKey;
        if (key is null) return null;
        var stream = await storage.OpenReadAsync(key, ct);
        return stream is null ? null : (stream, ToDto(doc));
    }

    public async Task<bool> HasActiveGrantAsync(SubjectRef subject, Guid personId, DataClassification classification, CancellationToken ct)
    {
        var now = clock.UtcNow;
        return await db.Set<AccessGrant>().AsNoTracking().AnyAsync(g =>
            g.SubjectKind == subject.Kind && g.SubjectId == subject.Id &&
            g.GranteePersonId == personId && g.RevokedAt == null &&
            g.ValidFrom <= now && (g.ValidTo == null || g.ValidTo > now) &&
            g.Ceiling >= classification, ct);
    }

    public async Task<AccessGrantDto> IssueGrantAsync(SubjectRef subject, Guid granteePersonId, string purpose, DataClassification ceiling, DateTimeOffset? validTo, CancellationToken ct)
    {
        if (!Purposes.All.Contains(purpose)) throw new ValidationException($"purpose không thuộc taxonomy đóng: {purpose}");
        gate.Require(new AuthorizationRequest(Actions.AccessGrantIssue, actor.PlatformRole, Purpose: purpose), "AccessGrant", null);

        var grant = new AccessGrant(subject, granteePersonId, purpose, ceiling, clock.UtcNow, validTo, actor.PersonId);
        db.Add(grant);
        await uow.CommitAsync(ct);
        // ADR-0006: cấp quyền đọc dữ liệu mật là việc mà nhật ký PHẢI trả lời "ai đã làm" — ghi sau commit.
        audit.Append(new AuditEntry(actor.PersonId, actor.PlatformRole, Actions.AccessGrantIssue, "AccessGrant", grant.Id, null,
            purpose, AuditOutcomes.Success, null, actor.CorrelationId, actor.IpAddress, actor.UserAgent,
            $"subject={subject}; grantee={granteePersonId}; ceiling={ceiling.ToCode()}; validTo={validTo?.ToString("O") ?? "-"}"));
        return ToDto(grant);
    }

    public async Task RevokeGrantAsync(Guid grantId, CancellationToken ct)
    {
        var grant = await db.Set<AccessGrant>().FirstOrDefaultAsync(g => g.Id == grantId, ct)
                    ?? throw new NotFoundException($"Access grant {grantId} not found");
        gate.Require(new AuthorizationRequest(Actions.AccessGrantIssue, actor.PlatformRole, Purpose: grant.Purpose), "AccessGrant", grantId);
        grant.Revoke(clock.UtcNow);
        await uow.CommitAsync(ct);
        audit.Append(new AuditEntry(actor.PersonId, actor.PlatformRole, Actions.AccessGrantRevoke, "AccessGrant", grant.Id, null,
            grant.Purpose, AuditOutcomes.Success, null, actor.CorrelationId, actor.IpAddress, actor.UserAgent,
            $"subject={grant.Subject}; grantee={grant.GranteePersonId}"));
    }

    private void RequireWrite(Guid? ownerPersonId, SubjectRef subject, Guid? documentId, string action = Actions.DocumentWrite)
    {
        var isOwner = ownerPersonId is not null && ownerPersonId == actor.PersonId;
        gate.Require(new AuthorizationRequest(action, actor.PlatformRole,
            OrganizationRelation: isOwner ? OrganizationRelations.Owner : OrganizationRelations.None), "Document", documentId);
    }

    private async Task<Document> LoadAsync(Guid id, CancellationToken ct)
        => await db.Set<Document>().FirstOrDefaultAsync(d => d.Id == id, ct)
           ?? throw new NotFoundException($"Attachment with ID {id} not found");

    private static void Validate(string fileName, string contentType)
    {
        if (!AllowedMimeTypes.Contains(contentType))
            throw new ValidationException($"File type '{contentType}' is not allowed. Allowed types: images (JPEG, PNG, WebP, GIF, BMP, TIFF), documents (PDF, Word, Excel, TXT), and archives (ZIP).");
        var ext = Path.GetExtension(fileName);
        if (!string.IsNullOrEmpty(ext) && BlockedExtensions.Contains(ext))
            throw new ValidationException($"Files with extension '{ext.ToLowerInvariant()}' are not allowed for security reasons.");
    }

    // Ánh xạ đã dời về kernel (ADR-0007) để có một chỗ duy nhất và kiểm được từ bộ test bảng quyết định.
    // Bản cũ ở đây có nhánh mặc định `_ => "PUBLIC"` — tức một mức mật chưa ánh xạ sẽ âm thầm thành công khai.
    internal static string ClassificationCode(DataClassification c) => c.ToCode();

    private static string Sha256Of(string text) => Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(text)));

    private DocumentDto ToDto(Document d)
    {
        var v = d.Versions.OrderByDescending(x => x.VersionNo).First();
        return new DocumentDto(d.Id, d.Subject, d.OwnerPersonId, d.Kind, d.FileType, d.Classification, d.SectionCode,
            v.FileName, v.StorageKey, v.StorageKey is null ? null : storage.PublicUrl(v.StorageKey), v.ContentType, v.Size,
            v.TextContent, v.Sha256, v.VersionNo, d.CreatedAt, d.UpdatedAt);
    }

    private static AccessGrantDto ToDto(AccessGrant g)
        => new(g.Id, g.Subject, g.GranteePersonId, g.Purpose, g.Ceiling, g.ValidFrom, g.ValidTo, g.RevokedAt);
}
