using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.DataRoom.Application;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Matching.Application;
using NacenTech.Modules.Policy.Application;
using NacenTech.Modules.Technology.Application;

namespace NacenTech.Api.V1Compat;

/// <summary>Body create/update intake ở dạng multipart form; file đi kèm trong cùng request như legacy.</summary>
public sealed class IntakeFormDto : IntakeWriteDto
{
    public IFormFile? ProfilePicture { get; set; }
    public List<IFormFile>? Attachments { get; set; }
    public List<IFormFile>? ConfidentialLevel2Attachments { get; set; }
    public List<IFormFile>? ConfidentialLevel3Attachments { get; set; }
}

public abstract class IntakesControllerBase(
    IDemandService demands,
    ITechnologyService technologies,
    IDataRoomService dataRoom,
    IMatchingService matching,
    ITaxonomyService taxonomy,
    IntakeFacade facade) : V1ControllerBase
{
    protected IntakeFacade Facade => facade;
    protected IDemandService Demands => demands;
    protected ITechnologyService Technologies => technologies;
    protected IMatchingService Matching => matching;

    /// <summary>
    /// Đọc tên trường thực sự có trong multipart form. Phải kiểm **tên trường trong form**, không đọc giá trị đã
    /// bind — giá trị đã bind không phân biệt được "không gửi" với "gửi rỗng" (B-31).
    /// </summary>
    private void MarkProvidedFields(IntakeWriteDto dto)
        => dto.MarkProvidedFields(Request.HasFormContentType ? Request.Form.Keys : []);

    protected async Task<IntakeFacade.IntakeView> CreateIntakeAsync(IntakeFormDto dto, Guid? ownerPersonId, CancellationToken ct)
    {
        MarkProvidedFields(dto);
        if (string.IsNullOrWhiteSpace(dto.Title)) throw new ValidationException("title should not be empty");
        var type = dto.Type ?? IntakeFacade.TypeIp;
        var status = NormalizeStatus(dto.Status);

        IntakeFacade.IntakeView view;
        if (type == IntakeFacade.TypeChallenge)
        {
            var created = await demands.CreateAsync(new CreateDemandCommand(ownerPersonId, dto.Title, dto.Content,
                dto.AiProcessedContent, status, dto.SectorIds, dto.CategoryId), ct);
            view = IntakeFacade.From(created);
        }
        else if (type == IntakeFacade.TypeIp)
        {
            var created = await technologies.CreateAsync(new CreateTechnologyCommand(ownerPersonId, dto.Title, dto.Content,
                dto.AiProcessedContent, status, dto.SectorIds, dto.CategoryId), ct);
            view = IntakeFacade.From(created);
        }
        else
        {
            throw new ValidationException("type must be one of the following values: ip, challenge");
        }

        await SaveFilesAsync(view.Subject, ownerPersonId, dto, ct);
        await facade.ApplyConfidentialSectionsAsync(view.Subject, ownerPersonId, dto, ct);
        return view;
    }

    protected async Task<IntakeFacade.IntakeView> UpdateIntakeAsync(Guid id, IntakeFormDto dto, CancellationToken ct)
    {
        MarkProvidedFields(dto);
        var existing = await facade.FindViewAsync(id, false, ct) ?? throw new NotFoundException($"Intake with ID {id} not found");
        var status = dto.Status is null ? null : NormalizeStatus(dto.Status);

        IntakeFacade.IntakeView view;
        if (existing.Type == IntakeFacade.TypeChallenge)
        {
            var updated = await demands.UpdateAsync(id, new UpdateDemandCommand(dto.Title, dto.Content, dto.AiProcessedContent,
                status, dto.SectorIds, dto.CategoryId, ClearCategory: false), ct);
            view = IntakeFacade.From(updated);
        }
        else
        {
            var updated = await technologies.UpdateAsync(id, new UpdateTechnologyCommand(dto.Title, dto.Content, dto.AiProcessedContent,
                status, dto.SectorIds, dto.CategoryId, ClearCategory: false), ct);
            view = IntakeFacade.From(updated);
        }

        await SaveFilesAsync(view.Subject, view.OwnerPersonId, dto, ct);
        await facade.ApplyConfidentialSectionsAsync(view.Subject, view.OwnerPersonId, dto, ct);
        return view;
    }

    private async Task SaveFilesAsync(SubjectRef subject, Guid? ownerPersonId, IntakeFormDto dto, CancellationToken ct)
    {
        if (dto.ProfilePicture is { } pic)
        {
            await using var stream = pic.OpenReadStream();
            await dataRoom.SetProfilePictureAsync(subject, ownerPersonId, stream, pic.FileName, pic.ContentType, ct);
        }
        await AddAsync(dto.Attachments, DataClassification.Public);
        await AddAsync(dto.ConfidentialLevel2Attachments, DataClassification.Confidential);
        await AddAsync(dto.ConfidentialLevel3Attachments, DataClassification.HighlyConfidential);

        async Task AddAsync(List<IFormFile>? files, DataClassification classification)
        {
            foreach (var file in files ?? [])
            {
                await using var stream = file.OpenReadStream();
                await dataRoom.AddFileAsync(subject, ownerPersonId, stream, file.FileName, file.ContentType, FileTypes.Document, classification, ct);
            }
        }
    }

    protected async Task DeleteIntakeAsync(Guid id, CancellationToken ct)
    {
        var view = await facade.FindViewAsync(id, false, ct) ?? throw new NotFoundException($"Intake with ID {id} not found");
        if (view.Type == IntakeFacade.TypeChallenge) await demands.DeleteAsync(id, ct);
        else await technologies.DeleteAsync(id, ct);
    }

    protected async Task<object> ListAsync(bool publishedOnly, Guid? ownerPersonId, Guid? excludeOwnerPersonId, bool includeTotalByStatus,
        string? type, string? status, Guid? sectorId, Guid? categoryId, string? search, int? page, int? limit, CancellationToken ct)
    {
        var pr = PageRequest.Of(page, limit, 20, 100);
        var normalizedStatus = status is null ? null : NormalizeStatus(status);
        var views = new List<IntakeFacade.IntakeView>();
        var total = 0;
        var draft = 0;
        var published = 0;

        if (type is null or IntakeFacade.TypeChallenge)
        {
            var q = new DemandQuery(ownerPersonId, excludeOwnerPersonId, publishedOnly, normalizedStatus, sectorId, categoryId, search, false, pr);
            var result = await demands.ListAsync(q, ct);
            views.AddRange(result.Data.Select(IntakeFacade.From));
            total += result.Total;
            if (includeTotalByStatus)
            {
                var (d, p) = await demands.CountByStatusAsync(q, ct);
                draft += d;
                published += p;
            }
        }
        if (type is null or IntakeFacade.TypeIp)
        {
            var q = new TechnologyQuery(ownerPersonId, excludeOwnerPersonId, publishedOnly, normalizedStatus, sectorId, categoryId, search, false, pr);
            var result = await technologies.ListAsync(q, ct);
            views.AddRange(result.Data.Select(IntakeFacade.From));
            total += result.Total;
            if (includeTotalByStatus)
            {
                var (d, p) = await technologies.CountByStatusAsync(q, ct);
                draft += d;
                published += p;
            }
        }

        // Khi không lọc theo type, hai nguồn được trộn rồi cắt lại theo trang để giữ thứ tự mới nhất.
        var ordered = views.OrderByDescending(v => v.CreatedAt).Take(pr.Limit).ToList();
        var data = await ShapeManyAsync(ordered, ct);

        var body = new Dictionary<string, object?>
        {
            ["success"] = true,
            ["data"] = data,
            ["total"] = total,
            ["page"] = pr.Page,
            ["limit"] = pr.Limit,
            ["totalPages"] = pr.Limit <= 0 ? 0 : (int)Math.Ceiling(total / (double)pr.Limit),
        };
        if (includeTotalByStatus) body["totalByStatus"] = new { draft, published };
        return body;
    }

    protected async Task<List<object>> ShapeManyAsync(IReadOnlyList<IntakeFacade.IntakeView> views, CancellationToken ct)
    {
        if (views.Count == 0) return [];
        var termIds = views.SelectMany(v => v.SectorIds).Concat(views.Where(v => v.CategoryId is not null).Select(v => v.CategoryId!.Value)).Distinct().ToArray();
        var terms = await taxonomy.GetManyAsync(termIds, ct);
        var documents = await dataRoom.ListForSubjectsAsync(views.Select(v => v.Subject).ToArray(), ct);
        return views.Select(v => facade.Shape(v, documents.GetValueOrDefault(v.Subject, []), terms, false, false, null)).ToList();
    }

    protected async Task<object> MatchesResponseAsync(Guid id, int? page, int? limit, CancellationToken ct)
    {
        var view = await facade.FindViewAsync(id, true, ct) ?? throw new NotFoundException($"Intake with ID {id} not found");
        var pr = PageRequest.Of(page, limit, 20, 100);
        var result = await Matching.ListCandidatesAsync(view.Subject, pr, ct);
        var data = await facade.MatchesAsync(result.Data, view, ct);
        return new
        {
            success = true,
            data,
            total = result.Total,
            page = result.Page,
            limit = result.Limit,
            totalPages = result.TotalPages,
        };
    }

    protected static string NormalizeStatus(string? status) => (status ?? "draft").ToLowerInvariant() switch
    {
        "draft" => DemandStatuses.Draft,
        "published" => DemandStatuses.Published,
        _ => throw new ValidationException("status must be one of the following values: draft, published"),
    };
}

// ─── Public ───────────────────────────────────────────────────────────────────────────────────

[Route("api/v1/intakes")]
public sealed class UserIntakesController(
    IDemandService demands, ITechnologyService technologies, IDataRoomService dataRoom,
    IMatchingService matching, ITaxonomyService taxonomy, IntakeFacade facade)
    : IntakesControllerBase(demands, technologies, dataRoom, matching, taxonomy, facade)
{
    // B-35: đường `GET /api/v1/intakes` (danh sách, ẩn danh, publishedOnly=false) đã bị GỠ ngày 2026-09-05. Nó
    // trả bản nháp của mọi người cho bất kỳ ai không cần tài khoản, và rà ba frontend cho thấy KHÔNG client nào
    // gọi nó — bảng quản trị dùng /admin/intakes, cổng người dùng dùng /my/intakes và /marketplace. Một bề mặt
    // công khai không ai dùng đang rò dữ liệu thì không nên tồn tại; bịt cờ chỉ làm nó trùng với /marketplace.

    /// <summary>
    /// B-20: đường này từng cho phép ẩn danh, tra cả bản ghi **đã xoá mềm** (`includeDeleted: true`), và không
    /// kiểm trạng thái xuất bản — nên tiêu đề, mô tả và nội dung công khai của một bản nháp hoặc một bản ghi đã
    /// xoá đọc được bởi bất kỳ ai biết định danh, không cần cả tài khoản. Nay: phải đăng nhập, không tra bản đã
    /// xoá, và bản nháp chỉ chủ sở hữu thấy. Quản trị viên đọc bản nháp và bản đã xoá qua `/api/v1/admin/intakes/{id}`.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var view = await Facade.FindViewAsync(id, false, ct) ?? throw new NotFoundException($"Intake with ID {id} not found");
        var isOwner = view.OwnerPersonId is not null && view.OwnerPersonId == Actor.PersonId;
        var isPublished = string.Equals(view.Status, DemandStatuses.Published, StringComparison.OrdinalIgnoreCase);
        if (!isOwner && !isPublished) throw new NotFoundException($"Intake with ID {id} not found");
        return Ok(Ok200(await Facade.DetailAsync(view, isOwner, isOwner, isOwner, ct)));
    }

    [HttpGet("{id:guid}/matches")]
    public async Task<IActionResult> Matches(Guid id, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
        => Ok(await MatchesResponseAsync(id, page, limit, ct));
}

[Route("api/v1/my/intakes")]
[Authorize]
public sealed class MyIntakesController(
    IDemandService demands, ITechnologyService technologies, IDataRoomService dataRoom,
    IMatchingService matching, ITaxonomyService taxonomy, IntakeFacade facade)
    : IntakesControllerBase(demands, technologies, dataRoom, matching, taxonomy, facade)
{
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] IntakeFormDto dto, CancellationToken ct)
    {
        var view = await CreateIntakeAsync(dto, PersonId, ct);
        return StatusCode(201, Ok200(await Facade.DetailAsync(view, true, false, false, ct)));
    }

    [HttpGet("discover")]
    public async Task<IActionResult> Discover([FromQuery] string? type, [FromQuery] Guid? sectorId, [FromQuery] Guid? categoryId,
        [FromQuery] string? search, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
        => Ok(await ListAsync(true, null, PersonId, false, type, null, sectorId, categoryId, search, page, limit, ct));

    [HttpGet]
    public async Task<IActionResult> Mine([FromQuery] string? type, [FromQuery] string? status, [FromQuery] Guid? sectorId,
        [FromQuery] Guid? categoryId, [FromQuery] string? search, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
        => Ok(await ListAsync(false, PersonId, null, true, type, status, sectorId, categoryId, search, page, limit, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var view = await RequireOwnAsync(id, ct);
        return Ok(Ok200(await Facade.DetailAsync(view, true, true, false, ct)));
    }

    [HttpGet("{id:guid}/matches")]
    public async Task<IActionResult> Matches(Guid id, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        await RequireOwnAsync(id, ct);
        return Ok(await MatchesResponseAsync(id, page, limit, ct));
    }

    [HttpGet("{id:guid}/find-challenges")]
    public async Task<IActionResult> FindChallenges(Guid id, [FromQuery] int? limit, [FromQuery] double? minScore, CancellationToken ct)
    {
        var view = await RequireOwnAsync(id, ct);
        var result = await Matching.SearchAsync(new SearchQuery(
            $"{view.Title}\n{Truncate(view.Content)}", limit ?? 10, SubjectKinds.DemandBrief,
            view.SectorIds.Count > 0 ? view.SectorIds : null, minScore ?? 1.5, view.OwnerPersonId, true), PersonId, ct);
        return Ok(Ok200(new
        {
            hits = result.Hits.Select(h => new
            {
                intakeId = h.Subject.Id,
                title = h.Title,
                aiProcessTitle = h.AiTitle,
                matchedChunk = h.MatchedChunk,
                chunkIndex = h.ChunkIndex,
                score = h.Score,
                intakeType = IntakeFacade.TypeOf(h.Subject),
                sectorIds = h.SectorIds,
                sectorNames = h.SectorNames,
            }).ToList(),
            total = result.Total,
            took = result.TookMs,
        }));
    }

    // B-44: không có [Consumes] thì thân JSON hợp lệ được bind thành DTO rỗng và lệnh trả 200 mà không đổi gì —
    // một lệnh ghi im lặng không ghi. Khai kiểu nội dung để ASP.NET Core trả 415 thay vì giả vờ đã lưu.
    [HttpPatch("{id:guid}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(Guid id, [FromForm] IntakeFormDto dto, CancellationToken ct)
    {
        await RequireOwnAsync(id, ct);
        var view = await UpdateIntakeAsync(id, dto, ct);
        return Ok(Ok200(await Facade.DetailAsync(view, true, true, false, ct)));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await RequireOwnAsync(id, ct);
        await DeleteIntakeAsync(id, ct);
        return Ok(new { success = true, message = "Intake deleted successfully" });
    }

    [HttpPost("{id:guid}/beautify")]
    public async Task<IActionResult> Beautify(Guid id, [FromServices] BeautifyService beautify, CancellationToken ct)
    {
        await RequireOwnAsync(id, ct);
        return Ok(Ok200(await beautify.RunAsync(id, PersonId, ct)));
    }

    [HttpPost("{id:guid}/compute-matches")]
    public async Task<IActionResult> ComputeMatches(Guid id, CancellationToken ct)
    {
        var view = await RequireOwnAsync(id, ct);
        EnsurePublishedWithContent(view);
        await Matching.RequestComputeMatchesAsync(view.Subject, ct);
        return Ok(Ok200(new { message = "Matching has been queued" }));
    }

    [HttpPost("{id:guid}/attachments")]
    public async Task<IActionResult> UploadAttachment(Guid id, [FromForm] IFormFile file, [FromForm] string fileType,
        [FromServices] IDataRoomService dataRoomService, CancellationToken ct)
    {
        var view = await RequireOwnAsync(id, ct);
        await using var stream = file.OpenReadStream();
        var doc = await dataRoomService.AddFileAsync(view.Subject, view.OwnerPersonId, stream, file.FileName, file.ContentType,
            NormalizeFileType(fileType), DataClassification.Public, ct);
        return StatusCode(201, Ok200(V1Mappers.Attachment(doc, id)));
    }

    [HttpDelete("{id:guid}/attachments/{attachmentId:guid}")]
    public async Task<IActionResult> DeleteAttachment(Guid id, Guid attachmentId, [FromServices] IDataRoomService dataRoomService, CancellationToken ct)
    {
        await RequireOwnAsync(id, ct);
        await dataRoomService.DeleteAsync(attachmentId, ct);
        return Ok(new { success = true, message = "Attachment deleted successfully" });
    }

    private async Task<IntakeFacade.IntakeView> RequireOwnAsync(Guid id, CancellationToken ct)
    {
        var view = await Facade.FindViewAsync(id, false, ct) ?? throw new NotFoundException($"Intake with ID {id} not found");
        if (view.OwnerPersonId != PersonId) throw new NotFoundException($"Intake with ID {id} not found");
        return view;
    }

    internal static void EnsurePublishedWithContent(IntakeFacade.IntakeView view)
    {
        if (!string.Equals(view.Status, DemandStatuses.Published, StringComparison.OrdinalIgnoreCase))
            throw new UnprocessableException($"Intake {view.Id} must be published before matching can be performed");
        if (string.IsNullOrWhiteSpace(view.Content))
            throw new UnprocessableException($"Intake {view.Id} has no content to match");
    }

    internal static string NormalizeFileType(string fileType) => fileType switch
    {
        FileTypes.Image or FileTypes.Video or FileTypes.Document => fileType,
        _ => throw new ValidationException("fileType must be one of the following values: image, video, document"),
    };

    private static string Truncate(string? content) => content is null ? string.Empty : content.Length > 1500 ? content[..1500] : content;
}

// ─── Marketplace ──────────────────────────────────────────────────────────────────────────────

[Route("api/v1/marketplace")]
[Authorize]
public sealed class MarketplaceController(
    IDemandService demands, ITechnologyService technologies, IDataRoomService dataRoom,
    IMatchingService matching, ITaxonomyService taxonomy, IntakeFacade facade)
    : IntakesControllerBase(demands, technologies, dataRoom, matching, taxonomy, facade)
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? type, [FromQuery] Guid? sectorId, [FromQuery] Guid? categoryId,
        [FromQuery] string? search, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
        => Ok(await ListAsync(true, null, null, false, type, null, sectorId, categoryId, search, page, limit, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var view = await Facade.FindViewAsync(id, false, ct);
        if (view is null || !string.Equals(view.Status, DemandStatuses.Published, StringComparison.OrdinalIgnoreCase))
            throw new NotFoundException($"Intake with ID {id} not found");
        return Ok(Ok200(await Facade.DetailAsync(view, false, false, false, ct)));
    }
}

// ─── Admin ────────────────────────────────────────────────────────────────────────────────────

[Route("api/v1/admin/intakes")]
[Authorize]
public sealed class AdminIntakesController(
    IDemandService demands, ITechnologyService technologies, IDataRoomService dataRoom,
    IMatchingService matching, ITaxonomyService taxonomy, IntakeFacade facade)
    : IntakesControllerBase(demands, technologies, dataRoom, matching, taxonomy, facade)
{
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] IntakeFormDto dto, CancellationToken ct)
    {
        RequireAdmin();
        var view = await CreateIntakeAsync(dto, PersonId, ct);
        return StatusCode(201, Ok200(await Facade.DetailAsync(view, true, false, false, ct)));
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? type, [FromQuery] string? status, [FromQuery] Guid? sectorId,
        [FromQuery] Guid? categoryId, [FromQuery] string? search, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(await ListAsync(false, null, null, true, type, status, sectorId, categoryId, search, page, limit, ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        var view = await Facade.FindViewAsync(id, true, ct) ?? throw new NotFoundException($"Intake with ID {id} not found");
        return Ok(Ok200(await Facade.DetailAsync(view, true, true, true, ct)));
    }

    [HttpGet("{id:guid}/matches")]
    public async Task<IActionResult> Matches(Guid id, [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(await MatchesResponseAsync(id, page, limit, ct));
    }

    // B-44: không có [Consumes] thì thân JSON hợp lệ được bind thành DTO rỗng và lệnh trả 200 mà không đổi gì —
    // một lệnh ghi im lặng không ghi. Khai kiểu nội dung để ASP.NET Core trả 415 thay vì giả vờ đã lưu.
    [HttpPatch("{id:guid}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(Guid id, [FromForm] IntakeFormDto dto, CancellationToken ct)
    {
        RequireAdmin();
        var view = await UpdateIntakeAsync(id, dto, ct);
        return Ok(Ok200(await Facade.DetailAsync(view, true, true, false, ct)));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        await DeleteIntakeAsync(id, ct);
        return Ok(new { success = true, message = "Intake deleted successfully" });
    }

    [HttpPost("{id:guid}/beautify")]
    public async Task<IActionResult> Beautify(Guid id, [FromServices] BeautifyService beautify, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(Ok200(await beautify.RunAsync(id, null, ct)));
    }

    [HttpPost("{id:guid}/compute-matches")]
    public async Task<IActionResult> ComputeMatches(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        var view = await Facade.FindViewAsync(id, false, ct) ?? throw new NotFoundException($"Intake with ID {id} not found");
        MyIntakesController.EnsurePublishedWithContent(view);
        await Matching.RequestComputeMatchesAsync(view.Subject, ct);
        return Ok(Ok200(new { message = "Matching has been queued" }));
    }

    [HttpPost("{id:guid}/attachments")]
    public async Task<IActionResult> UploadAttachment(Guid id, [FromForm] IFormFile file, [FromForm] string fileType,
        [FromServices] IDataRoomService dataRoomService, CancellationToken ct)
    {
        RequireAdmin();
        var view = await Facade.FindViewAsync(id, false, ct) ?? throw new NotFoundException($"Intake with ID {id} not found");
        await using var stream = file.OpenReadStream();
        var doc = await dataRoomService.AddFileAsync(view.Subject, view.OwnerPersonId, stream, file.FileName, file.ContentType,
            MyIntakesController.NormalizeFileType(fileType), DataClassification.Public, ct);
        return StatusCode(201, Ok200(V1Mappers.Attachment(doc, id)));
    }

    [HttpDelete("{id:guid}/attachments/{attachmentId:guid}")]
    public async Task<IActionResult> DeleteAttachment(Guid id, Guid attachmentId, [FromServices] IDataRoomService dataRoomService, CancellationToken ct)
    {
        RequireAdmin();
        await dataRoomService.DeleteAsync(attachmentId, ct);
        return Ok(new { success = true, message = "Attachment deleted successfully" });
    }
}
