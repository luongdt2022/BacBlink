using System.Text.Json;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Communication.Application;
using NacenTech.Modules.Content.Application;
using NacenTech.Modules.DataRoom.Application;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Policy.Application;

namespace NacenTech.Api.V1Compat;

/// <summary>Chuyển DTO V2 → shape JSON legacy. Tên field, enum chữ thường và thứ tự thuộc tính theo NestJS.</summary>
public sealed class V1Mappers(IPersonService persons, ITaxonomyService taxonomy)
{
    public static string RoleV1(string platformRole) => platformRole == PlatformRoles.Admin ? "admin" : "user";

    public static string LowerStatus(string s) => s.ToLowerInvariant();

    public static string? LowerOrNull(string? s) => s?.ToLowerInvariant();

    public static object User(PersonDto p) => new
    {
        id = p.Id,
        email = p.Email,
        firstName = p.FirstName,
        lastName = p.LastName,
        phone = p.Phone,
        organization = p.Organization,
        role = RoleV1(p.PlatformRole),
        platformRole = p.PlatformRole,
        scopeType = p.ScopeType,
        scopeId = p.ScopeId,
        isActive = p.IsActive,
        createdAt = p.CreatedAt,
        updatedAt = p.UpdatedAt,
    };

    public static object UserBrief(PersonBrief p) => new
    {
        id = p.Id,
        email = p.Email,
        firstName = p.FirstName,
        lastName = p.LastName,
        phone = p.Phone,
        organization = p.Organization,
        role = RoleV1(p.PlatformRole),
        isActive = p.IsActive,
        createdAt = p.CreatedAt,
        updatedAt = p.UpdatedAt,
    };

    /// <summary>
    /// Tác giả nhìn từ đường công khai: chỉ định danh, tên và tổ chức. B-19 — `UserBrief` dùng chung giữa đường
    /// quản trị và đường công khai đã đẩy `email`, `phone`, `role`, `isActive` của mọi tác giả ra Internet cho
    /// request không có danh tính nào. Đường công khai phải có hàm ánh xạ riêng, không dùng lại hàm nội bộ.
    /// </summary>
    public static object PublicAuthor(PersonBrief p) => new
    {
        id = p.Id,
        firstName = p.FirstName,
        lastName = p.LastName,
        organization = p.Organization,
    };

    /// <summary>Legacy `sanitizeUser` dùng trong login/register.</summary>
    public static object SanitizedUser(PersonDto p) => new
    {
        id = p.Id,
        email = p.Email,
        firstName = p.FirstName,
        lastName = p.LastName,
        role = RoleV1(p.PlatformRole),
        isActive = p.IsActive,
        createdAt = p.CreatedAt,
    };

    /// <summary>Contract dùng bởi Web Portal mới: giữ nguyên role/scope thực từ JWT, không dùng legacy RoleV1.</summary>
    public static object AuthSessionUser(PersonDto p) => new
    {
        id = p.Id,
        email = p.Email,
        fullName = string.Join(" ", new[] { p.LastName, p.FirstName }.Where(x => !string.IsNullOrWhiteSpace(x))),
        role = p.PlatformRole,
        scopeType = p.ScopeType,
        scopeId = p.ScopeId,
    };

    public static object Settings(PersonPreferencesDto s) => new
    {
        id = s.Id,
        userId = s.PersonId,
        matchingAuto = s.MatchingAuto,
        createdAt = s.CreatedAt,
        updatedAt = s.UpdatedAt,
    };

    public static object Term(TaxonomyTermDto t) => new { id = t.Id, code = t.Code, name = t.Name, isActive = t.IsActive };

    public static object Notification(NotificationDto n) => new
    {
        id = n.Id,
        userId = n.PersonId,
        type = n.Type,
        payload = n.Payload,
        isRead = n.IsRead,
        createdAt = n.CreatedAt,
    };

    public static string InvitationStatusV1(string status) => status switch
    {
        InvitationStatuses.Pending => "pending",
        InvitationStatuses.Accepted => "accepted",
        InvitationStatuses.Declined => "rejected",
        InvitationStatuses.Cancelled => "cancelled",
        _ => status.ToLowerInvariant(),
    };

    public static object Attachment(DocumentDto d, Guid intakeId) => new
    {
        id = d.Id,
        intakeId,
        fileName = d.FileName,
        filePath = d.Url,
        fileType = d.FileType,
        mimeType = d.ContentType,
        fileSize = d.Size?.ToString(),
        confidentialLevel = d.Classification.ToLegacyLevel(),
        createdAt = d.CreatedAt,
    };

    /// <summary>`publicView` bắt buộc phải nêu rõ ở chỗ gọi: nó quyết định tác giả đi ra dưới hình dạng nào (B-19).</summary>
    public static object Story(StoryDto s, PersonBrief? author, bool publicView) => new
    {
        id = s.Id,
        title = s.Title,
        type = s.Type.ToLowerInvariant(),
        content = s.Content,
        lesson = s.Lesson,
        status = s.Status.ToLowerInvariant(),
        isHidden = s.IsHidden,
        authorId = s.AuthorPersonId,
        author = author is null ? null : publicView ? PublicAuthor(author) : UserBrief(author),
        createdAt = s.CreatedAt,
        updatedAt = s.UpdatedAt,
    };

    public async Task<IReadOnlyDictionary<Guid, TaxonomyTermDto>> SectorsAsync(IEnumerable<Guid> ids, CancellationToken ct)
        => await taxonomy.GetManyAsync(ids.Distinct().ToArray(), ct);

    public async Task<IReadOnlyDictionary<Guid, PersonDto>> PersonsAsync(IEnumerable<Guid> ids, CancellationToken ct)
        => await persons.GetManyAsync(ids.Distinct().ToArray(), ct);

    public static IReadOnlyList<Guid> ParseGuidList(JsonElement? el)
    {
        if (el is null || el.Value.ValueKind != JsonValueKind.Array) return [];
        return el.Value.EnumerateArray().Select(e => Guid.Parse(e.GetString()!)).ToList();
    }
}
