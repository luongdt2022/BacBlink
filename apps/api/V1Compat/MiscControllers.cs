using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.DataRoom.Application;
using NacenTech.Modules.Matching.Application;

namespace NacenTech.Api.V1Compat;

public sealed class SearchDto
{
    [Required(ErrorMessage = "query should not be empty")]
    public string Query { get; set; } = string.Empty;
    [Range(1, 50)] public int? Limit { get; set; }
    public string? Type { get; set; }
    public List<Guid>? SectorIds { get; set; }
    [Range(0, double.MaxValue)] public double? MinScore { get; set; }
}

[Route("api/v1/search")]
public sealed class SearchController(IMatchingService matching, IntakeFacade facade) : V1ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Search([FromBody] SearchDto dto, CancellationToken ct)
    {
        var kind = dto.Type is null ? null : IntakeFacade.KindOf(dto.Type);

        // B-27: `PublishedOnly` phải bật. Chỉ mục tìm kiếm chứa cả bản nháp — việc cắt đoạn chạy khi nội dung
        // đổi, không chỉ khi xuất bản — nên với cờ tắt, một cụm từ trong bản nháp của người khác trả về nguyên
        // tiêu đề và đoạn văn khớp. Quản trị viên cần tìm cả bản nháp thì đó là một đường riêng có kiểm quyền.
        var result = await matching.SearchAsync(new SearchQuery(
            dto.Query, dto.Limit ?? 10, kind, dto.SectorIds, dto.MinScore ?? 2.0, null, true), Actor.PersonId, ct);

        return Ok(new
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
        });
    }
}

[Route("api/v1/files")]
[Authorize]
public sealed class FilesController(IDataRoomService dataRoom, IObjectStorage storage) : V1ControllerBase
{
    /// <summary>Legacy `POST /files/upload` cho ảnh chèn vào nội dung. Ảnh gắn với người upload, mức PUBLIC.</summary>
    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, CancellationToken ct)
    {
        await using var stream = file.OpenReadStream();
        var doc = await dataRoom.AddFileAsync(SubjectRef.Person(PersonId), PersonId, stream, file.FileName, file.ContentType,
            FileTypes.Image, DataClassification.Public, ct);
        return Ok(new { url = doc.Url });
    }
}

/// <summary>
/// Phục vụ file đã upload. Legacy dùng `app.useStaticAssets('/uploads')` — không kiểm quyền.
/// V2 đi qua data room nên tài liệu mật được gate (AC 5); file PUBLIC vẫn mở như cũ.
/// </summary>
[Route("files")]
public sealed class FileContentController(IDataRoomService dataRoom) : ControllerBase
{
    [HttpGet("{**key}")]
    public async Task<IActionResult> Get(string key, [FromServices] ICurrentActor actor, CancellationToken ct)
    {
        var doc = await dataRoom.FindByStorageKeyAsync(key, ct);
        if (doc is null) return NotFound();
        var opened = await dataRoom.OpenAsync(doc.Id, actor.PersonId, ct);
        if (opened is null) return NotFound();
        return File(opened.Value.Content, doc.ContentType ?? "application/octet-stream", doc.FileName);
    }
}

// ─── AI (legacy `POST /ai/*`) ─────────────────────────────────────────────────────────────────

public sealed class AiChatMessageDto
{
    [Required] public string Role { get; set; } = string.Empty;
    [Required] public string Content { get; set; } = string.Empty;
}

public sealed class AiChatDto
{
    [Required] public List<AiChatMessageDto> Messages { get; set; } = [];
    public string? Provider { get; set; }
    public string? Model { get; set; }
    [Range(0, 2)] public double? Temperature { get; set; }
    public int? MaxTokens { get; set; }
}

public sealed class AiCompletionDto
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Content { get; set; } = string.Empty;
    public string? Provider { get; set; }
    public string? Model { get; set; }
}

public sealed class AiEmbeddingDto
{
    [Required] public List<string> Input { get; set; } = [];
}

/// <summary>
/// KEEP_WITH_CHANGE (§26.7.4): legacy để ba endpoint AI mở không xác thực — nợ an toàn nghiêm trọng
/// (§26.1.8: "ai cũng gọi được mô hình bằng khóa của hệ thống"). Ở đây bắt buộc đăng nhập và qua gate.
/// </summary>
[Route("api/v1/ai")]
[Authorize]
public sealed class AiController(
    ICompletionClient completions,
    IEmbeddingClient embeddings,
    NacenTech.PolicyEngine.IAuthorizationGate gate,
    ICurrentActor actor) : V1ControllerBase
{
    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] AiChatDto dto, CancellationToken ct)
    {
        RequireAi();
        var result = await completions.ChatAsync(
            dto.Messages.Select(m => new ChatMessage(m.Role, m.Content)).ToList(),
            dto.Provider, dto.Model, dto.Temperature, dto.MaxTokens, ct);
        return Ok(Ok200(new
        {
            content = result.Text,
            model = result.Model,
            provider = result.Provider,
            usage = new { promptTokens = result.PromptTokens, completionTokens = result.CompletionTokens, totalTokens = result.TotalTokens },
        }));
    }

    [HttpPost("completion")]
    public async Task<IActionResult> Completion([FromBody] AiCompletionDto dto, CancellationToken ct)
    {
        RequireAi();
        var prompt = NacenTech.Contracts.Ai.B2bPrompts.BuildMarketingPrompt(dto.Title, dto.Content);
        var result = await completions.CompleteAsync(prompt, dto.Provider, dto.Model, null, null, ct);
        return Ok(Ok200(new
        {
            text = result.Text,
            model = result.Model,
            provider = result.Provider,
            usage = new { promptTokens = result.PromptTokens, completionTokens = result.CompletionTokens, totalTokens = result.TotalTokens },
        }));
    }

    [HttpPost("embedding")]
    public async Task<IActionResult> Embedding([FromBody] AiEmbeddingDto dto, CancellationToken ct)
    {
        RequireAi();
        var result = await embeddings.EmbedAsync(dto.Input, ct);
        return Ok(Ok200(new { embeddings = result.Embeddings, model = result.Model, provider = result.Provider }));
    }

    private void RequireAi()
        => gate.Require(new NacenTech.PolicyEngine.AuthorizationRequest(NacenTech.PolicyEngine.Actions.AiInvoke, actor.PlatformRole), "Ai", null);
}
