using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.DataRoom.Application;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Matching.Application;
using NacenTech.Modules.Policy.Application;
using NacenTech.Modules.Technology.Application;

namespace NacenTech.Api.V1Compat;

/// <summary>
/// `intakes` của NacenTwin là một bảng dùng chung phân biệt bằng `type`. V2 tách thành hai aggregate
/// (`DemandBrief` cho challenge, `TechnologyAsset` cho ip) — facade này ghép lại đúng shape cũ để portal
/// hiện có không phải sửa, và biến mất cùng facade tại sunset D2-148.
/// </summary>
public sealed class IntakeFacade(
    IDemandService demands,
    ITechnologyService technologies,
    IDataRoomService dataRoom,
    IMatchingService matching,
    ITaxonomyService taxonomy,
    IPersonDirectory directory,
    ICurrentActor actor)
{
    public const string TypeIp = "ip";
    public const string TypeChallenge = "challenge";

    public static string KindOf(string? type) => type switch
    {
        TypeChallenge => SubjectKinds.DemandBrief,
        TypeIp => SubjectKinds.TechnologyAsset,
        _ => throw new ValidationException("type must be one of the following values: ip, challenge"),
    };

    public static string TypeOf(SubjectRef subject) => subject.Kind == SubjectKinds.DemandBrief ? TypeChallenge : TypeIp;

    /// <summary>Tìm subject theo id không biết trước loại (legacy chỉ truyền intakeId).</summary>
    public async Task<SubjectRef?> ResolveSubjectAsync(Guid id, CancellationToken ct)
    {
        if (await demands.FindAsync(id, true, ct) is not null) return SubjectRef.Demand(id);
        if (await technologies.FindAsync(id, true, ct) is not null) return SubjectRef.Technology(id);
        return null;
    }

    // ─── View model dạng `intake` của legacy ───────────────────────────────────────────────

    public sealed record IntakeView(
        Guid Id,
        SubjectRef Subject,
        string Type,
        string Title,
        string? AiProcessTitle,
        string? Content,
        string? AiProcessedContent,
        string Status,
        string? AiProcessingStatus,
        string? AiChunkingStatus,
        IReadOnlyList<Guid> SectorIds,
        Guid? CategoryId,
        Guid? OwnerPersonId,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        DateTimeOffset? DeletedAt);

    public static IntakeView From(DemandBriefDto d) => new(
        d.Id, SubjectRef.Demand(d.Id), TypeChallenge, d.Title, d.AiTitle, d.ProblemStatement, d.AiProcessedContent,
        d.Status, d.AiProcessingStatus, d.AiChunkingStatus, d.SectorIds, d.CategoryId, d.OwnerPersonId,
        d.CreatedAt, d.UpdatedAt, d.DeletedAt);

    public static IntakeView From(TechnologyAssetDto t) => new(
        t.Id, SubjectRef.Technology(t.Id), TypeIp, t.Title, t.AiTitle, t.Description, t.AiProcessedContent,
        t.PublicationStatus, t.AiProcessingStatus, t.AiChunkingStatus, t.SectorIds, t.CategoryId, t.OwnerPersonId,
        t.CreatedAt, t.UpdatedAt, t.DeletedAt);

    public async Task<IntakeView?> FindViewAsync(Guid id, bool includeDeleted, CancellationToken ct)
    {
        if (await demands.FindAsync(id, includeDeleted, ct) is { } d) return From(d);
        if (await technologies.FindAsync(id, includeDeleted, ct) is { } t) return From(t);
        return null;
    }

    /// <summary>Trả về object shape legacy cho nhiều subject cùng lúc (dùng trong collaboration list).</summary>
    public async Task<IReadOnlyDictionary<SubjectRef, object>> GetViewsAsync(IReadOnlyCollection<SubjectRef> subjects, CancellationToken ct)
    {
        var result = new Dictionary<SubjectRef, object>();
        if (subjects.Count == 0) return result;

        var demandIds = subjects.Where(s => s.Kind == SubjectKinds.DemandBrief).Select(s => s.Id).ToArray();
        var techIds = subjects.Where(s => s.Kind == SubjectKinds.TechnologyAsset).Select(s => s.Id).ToArray();
        var demandMap = await demands.GetManyAsync(demandIds, ct);
        var techMap = await technologies.GetManyAsync(techIds, ct);

        var views = demandMap.Values.Select(From).Concat(techMap.Values.Select(From)).ToList();
        var sectorNames = await taxonomy.GetManyAsync(views.SelectMany(v => v.SectorIds).Distinct().ToArray(), ct);
        var documents = await dataRoom.ListForSubjectsAsync(views.Select(v => v.Subject).ToArray(), ct);

        foreach (var view in views)
        {
            result[view.Subject] = Shape(view, documents.GetValueOrDefault(view.Subject, []), sectorNames, includeConfidential: false, includeUser: false, null);
        }
        return result;
    }

    /// <summary>
    /// Dựng object `intake` legacy. Nội dung mật chỉ xuất hiện khi `includeConfidential` (chủ sở hữu/admin);
    /// attachment luôn đi qua `ListReadableAsync` để không lộ tài liệu mật (AC 5).
    /// </summary>
    public object Shape(
        IntakeView view,
        IReadOnlyList<DocumentDto> documents,
        IReadOnlyDictionary<Guid, TaxonomyTermDto> sectorNames,
        bool includeConfidential,
        bool includeUser,
        PersonBrief? user,
        IReadOnlyList<object>? matches = null)
    {
        var attachments = documents.Where(d => d.Kind is DocumentKinds.File or DocumentKinds.ProfilePicture).ToList();
        var profilePic = attachments.FirstOrDefault(a => a.FileType == FileTypes.ProfilePicture);
        var sections = documents.Where(d => d.Kind == DocumentKinds.TextSection)
            .ToDictionary(d => d.SectionCode!, d => d.TextContent);

        var payload = new Dictionary<string, object?>
        {
            ["id"] = view.Id,
            ["title"] = view.Title,
            ["aiProcessTitle"] = view.AiProcessTitle,
            ["content"] = view.Content,
            ["aiProcessedContent"] = view.AiProcessedContent,
            ["status"] = view.Status.ToLowerInvariant(),
            ["aiProcessingStatus"] = view.AiProcessingStatus?.ToLowerInvariant(),
            ["aiChunkingStatus"] = view.AiChunkingStatus?.ToLowerInvariant(),
            ["type"] = view.Type,
            ["createdAt"] = view.CreatedAt,
            ["updatedAt"] = view.UpdatedAt,
            ["deletedAt"] = view.DeletedAt,
            ["userId"] = view.OwnerPersonId,
            ["profilePicUrl"] = profilePic?.Url,
            ["attachments"] = attachments.Select(a => V1Mappers.Attachment(a, view.Id)).ToList(),
            ["intakeSectors"] = view.SectorIds.Select(sid => new
            {
                intakeId = view.Id,
                sectorId = sid,
                sector = sectorNames.TryGetValue(sid, out var term) ? V1Mappers.Term(term) : null,
            }).ToList(),
            ["category"] = view.CategoryId is { } cid && sectorNames.TryGetValue(cid, out var cat) ? V1Mappers.Term(cat) : null,
        };

        if (includeConfidential)
        {
            payload["confidentialLevel2Content"] = sections.GetValueOrDefault(TextSections.Level2Content);
            payload["confidentialLevel2AiProcessedContent"] = sections.GetValueOrDefault(TextSections.Level2AiProcessedContent);
            payload["confidentialLevel3Content"] = sections.GetValueOrDefault(TextSections.Level3Content);
            payload["confidentialLevel3AiProcessedContent"] = sections.GetValueOrDefault(TextSections.Level3AiProcessedContent);
        }
        else
        {
            payload["confidentialLevel2Content"] = null;
            payload["confidentialLevel2AiProcessedContent"] = null;
            payload["confidentialLevel3Content"] = null;
            payload["confidentialLevel3AiProcessedContent"] = null;
        }

        if (includeUser) payload["user"] = user is null ? null : V1Mappers.UserBrief(user);
        if (matches is not null) payload["matches"] = matches;
        return payload;
    }

    /// <summary>Bọc một view thành response chi tiết, kèm attachment đã lọc quyền và matches nếu cần.</summary>
    public async Task<object> DetailAsync(IntakeView view, bool includeConfidential, bool includeUser, bool includeMatches, CancellationToken ct)
    {
        var documents = await dataRoom.ListReadableAsync(view.Subject, actor.PersonId, ct);
        var sectorIds = view.SectorIds.Concat(view.CategoryId is { } c ? [c] : Array.Empty<Guid>()).Distinct().ToArray();
        var terms = await taxonomy.GetManyAsync(sectorIds, ct);
        var user = includeUser && view.OwnerPersonId is { } owner ? await directory.GetAsync(owner, ct) : null;

        IReadOnlyList<object>? matches = null;
        if (includeMatches)
        {
            var top = await matching.TopCandidatesAsync(view.Subject, 5, ct);
            matches = await MatchesAsync(top, view, ct);
        }
        return Shape(view, documents, terms, includeConfidential, includeUser, user, matches);
    }

    /// <summary>Shape `intake_matches` legacy: mỗi match kèm intake đối diện.</summary>
    public async Task<IReadOnlyList<object>> MatchesAsync(IReadOnlyList<MatchCandidateDto> candidates, IntakeView view, CancellationToken ct)
    {
        if (candidates.Count == 0) return [];
        var counterparts = await GetViewsAsync(candidates.Select(c => c.Candidate).Distinct().ToArray(), ct);
        var isIp = view.Type == TypeIp;
        return candidates.Select(c =>
        {
            var counterpart = counterparts.GetValueOrDefault(c.Candidate);
            var d = new Dictionary<string, object?>
            {
                ["id"] = c.Id,
                ["ipIntakeId"] = isIp ? view.Id : c.Candidate.Id,
                ["challengeIntakeId"] = isIp ? c.Candidate.Id : view.Id,
                ["score"] = c.RawScore,
                ["matchedChunk"] = c.MatchedChunk,
                ["chunkIndex"] = c.ChunkIndex,
                ["computedAt"] = c.ComputedAt,
                ["updatedAt"] = c.UpdatedAt,
            };
            if (counterpart is not null) d[isIp ? "challengeIntake" : "ipIntake"] = counterpart;
            return (object)d;
        }).ToList();
    }

    /// <summary>
    /// Áp dụng nội dung mật vào data room dưới dạng TEXT_SECTION (§30.1).
    ///
    /// B-31: `UpsertTextSectionAsync` hiểu chuỗi rỗng/null là **gỡ đoạn**. Model binding của multipart cho ra
    /// đúng `null` cho cả trường vắng mặt lẫn trường gửi rỗng, nên nếu ghi cả bốn đoạn ở mọi lần cập nhật thì
    /// một biểu mẫu chỉ gửi `title` sẽ xoá sạch nội dung mật mức 2 và mức 3. Chỉ đoạn nào người gọi **thực sự
    /// gửi lên** mới được chạm tới — xem <see cref="IntakeWriteDto.WasProvided"/>.
    /// </summary>
    public async Task ApplyConfidentialSectionsAsync(SubjectRef subject, Guid? ownerPersonId, IntakeWriteDto dto, CancellationToken ct)
    {
        await ApplyAsync(nameof(IntakeWriteDto.ConfidentialLevel2Content), TextSections.Level2Content, dto.ConfidentialLevel2Content);
        await ApplyAsync(nameof(IntakeWriteDto.ConfidentialLevel2AiProcessedContent), TextSections.Level2AiProcessedContent, dto.ConfidentialLevel2AiProcessedContent);
        await ApplyAsync(nameof(IntakeWriteDto.ConfidentialLevel3Content), TextSections.Level3Content, dto.ConfidentialLevel3Content);
        await ApplyAsync(nameof(IntakeWriteDto.ConfidentialLevel3AiProcessedContent), TextSections.Level3AiProcessedContent, dto.ConfidentialLevel3AiProcessedContent);

        async Task ApplyAsync(string fieldName, string sectionCode, string? text)
        {
            if (!dto.WasProvided(fieldName)) return;
            await dataRoom.UpsertTextSectionAsync(subject, ownerPersonId, sectionCode, text, ct);
        }
    }
}

/// <summary>Phần chung của body create/update intake (multipart form).</summary>
public class IntakeWriteDto
{
    private HashSet<string>? _providedFields;

    /// <summary>
    /// Ghi lại tên các trường **có mặt** trong request. Bắt buộc gọi ở mọi đường ghi: một trường vắng mặt và một
    /// trường gửi rỗng đều bind thành `null`, mà hai chuyện đó có nghĩa khác nhau với nội dung mật (B-31).
    /// </summary>
    public void MarkProvidedFields(IEnumerable<string> fieldNames)
        => _providedFields = new HashSet<string>(fieldNames, StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// Người gọi có thực sự gửi trường này lên không. Khi chưa ai gọi <see cref="MarkProvidedFields"/> thì trả
    /// `false`: không biết chắc thì không đụng vào dữ liệu, vì hướng sai của phép đoán này là mất dữ liệu.
    /// </summary>
    public bool WasProvided(string fieldName) => _providedFields?.Contains(fieldName) ?? false;

    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? AiProcessedContent { get; set; }
    public string? Type { get; set; }
    public string? Status { get; set; }
    public List<Guid>? SectorIds { get; set; }
    public Guid? CategoryId { get; set; }
    public string? ConfidentialLevel2Content { get; set; }
    public string? ConfidentialLevel2AiProcessedContent { get; set; }
    public string? ConfidentialLevel3Content { get; set; }
    public string? ConfidentialLevel3AiProcessedContent { get; set; }
}
