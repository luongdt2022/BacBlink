using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Integration.Application;
using NacenTech.Modules.Integration.Domain;

namespace NacenTech.Api.V2;

public sealed class IngestSignalDto
{
    /// <summary>Định danh hệ nguồn. Với bản ghi nhập tay, dùng mã nguồn đã thống nhất, không phải tên người nhập.</summary>
    [Required, MaxLength(80)] public string Source { get; set; } = string.Empty;

    [Required, MaxLength(200)] public string ExternalId { get; set; } = string.Empty;

    /// <summary>
    /// Hash nội dung ở nguồn. Adapter tự tính trên payload gốc. Bản ghi nhập tay bỏ trống — máy chủ băm chính
    /// nội dung đã nộp, vì với bản ghi nhập tay thì **nội dung đã nộp chính là ảnh chụp nguồn**.
    /// </summary>
    [MaxLength(64)] public string? ContentHash { get; set; }

    /// <summary>`INTERNAL_ONLY` | `DISPLAY_IN_PRODUCT` | `DISPLAY_PUBLIC` | `REDISTRIBUTE`.</summary>
    [Required, MaxLength(30)] public string License { get; set; } = string.Empty;

    /// <summary>`OFFICIAL` | `AGGREGATOR` | `SELF_DECLARED`.</summary>
    [Required, MaxLength(20)] public string AuthorityLevel { get; set; } = string.Empty;

    public DateTimeOffset? FetchedAt { get; set; }
    [MaxLength(1000)] public string? SourceUrl { get; set; }
    public string? PayloadJson { get; set; }

    /// <summary>`TENDER_TECH_SIGNAL` | `UNMET_TENDER`.</summary>
    [Required, MaxLength(40)] public string SignalClass { get; set; } = string.Empty;

    [Required, MaxLength(500)] public string Title { get; set; } = string.Empty;
    [MaxLength(4000)] public string? Summary { get; set; }
    [MaxLength(300)] public string? BuyerName { get; set; }
    public List<Guid> SectorIds { get; set; } = [];
    public decimal? BudgetAmount { get; set; }
    [MaxLength(3)] public string? BudgetCurrency { get; set; }
    public DateTimeOffset? ObservedAt { get; set; }
}

public sealed class MarkSignalConvertedDto
{
    [Required] public Guid DemandBriefId { get; set; }
    public int? ExpectedVersion { get; set; }
}

public sealed class RejectSignalDto
{
    [Required, MaxLength(1000)] public string Reason { get; set; } = string.Empty;
    public int? ExpectedVersion { get; set; }
}

/// <summary>
/// ADR-0011 — bàn làm việc với tín hiệu nhu cầu từ nguồn ngoài.
///
/// **Mọi đường ở đây đọc với <see cref="SignalAudience.Internal"/>, và điều đó là chủ đích.** Đây là công cụ của
/// người vận hành, không phải bề mặt xuất bản: đọc dữ liệu công khai để làm việc không phải là xuất bản lại nó.
/// Ai thêm một đường hiển thị cho người dùng cuối hoặc cho khách vãng lai thì phải truyền
/// <see cref="SignalAudience.InProduct"/> hoặc <see cref="SignalAudience.Public"/>, và khi đó license của nguồn
/// sẽ quyết định có gì lọt ra — tham số không có giá trị mặc định chính là để buộc người viết phải chọn.
///
/// Tín hiệu **không phải** nhu cầu đã đủ điều kiện. Nó không có stage, không có broker, không nằm trong ma trận
/// §7.4. Chuyển nó thành `DemandBrief` là việc của người có thẩm quyền: tạo nhu cầu trước theo đường của nó, rồi
/// báo lại id ở đây để giữ lineage.
/// </summary>
[Route("api/v2/demand-signals")]
public sealed class DemandSignalsController(ISignalIngestService signals) : V2ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? status, [FromQuery] string? signalClass,
        [FromQuery] int? page, [FromQuery] int? limit, CancellationToken ct)
        => Ok(Paged(await signals.ListAsync(new DemandSignalFilter(status, signalClass),
            SignalAudience.Internal, PageRequest.Of(page, limit), ct)));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var signal = await signals.GetAsync(id, SignalAudience.Internal, ct);
        SetETag(signal.Version);
        return Ok(signal);
    }

    /// <summary>
    /// Nạp hoặc cập nhật một tín hiệu. Idempotent theo `(source, externalId)` — gọi lại là cập nhật, không sinh
    /// bản ghi thứ hai. Trả 200 cho cả hai trường hợp vì người gọi không cần biết mình là người đầu tiên.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Ingest([FromBody] IngestSignalDto dto, CancellationToken ct)
    {
        var fetchedAt = dto.FetchedAt ?? DateTimeOffset.UtcNow;
        var command = new IngestSignalCommand(
            Source: dto.Source,
            ExternalId: dto.ExternalId,
            ContentHash: string.IsNullOrWhiteSpace(dto.ContentHash) ? SubmissionHash(dto) : dto.ContentHash,
            License: dto.License,
            AuthorityLevel: dto.AuthorityLevel,
            FetchedAt: fetchedAt,
            SourceUrl: dto.SourceUrl,
            PayloadJson: dto.PayloadJson,
            SignalClass: dto.SignalClass,
            Title: dto.Title,
            Summary: dto.Summary,
            BuyerName: dto.BuyerName,
            SectorIds: dto.SectorIds,
            BudgetAmount: dto.BudgetAmount,
            BudgetCurrency: dto.BudgetCurrency,
            ObservedAt: dto.ObservedAt);

        return Ok(await signals.IngestAsync(command, ct));
    }

    /// <summary>
    /// Ghi nhận tín hiệu đã được chuyển thành nhu cầu thật. Đường này **không tạo** `DemandBrief` — nguyên tắc 1
    /// và D2-87: chỉ người có thẩm quyền xác nhận chủ bài toán, mục tiêu, baseline và đường ngân sách mới tạo
    /// được nhu cầu đủ điều kiện. Ở đây chỉ nối lineage giữa hai bản ghi đã tồn tại.
    /// </summary>
    [HttpPost("{id:guid}/converted")]
    public async Task<IActionResult> MarkConverted(Guid id, [FromBody] MarkSignalConvertedDto dto, CancellationToken ct)
        => Ok(await signals.MarkConvertedAsync(id, dto.DemandBriefId, ExpectedVersion(dto.ExpectedVersion), ct));

    /// <summary>
    /// Loại một tín hiệu, **có lý do bắt buộc**. Tín hiệu bị loại vẫn giữ lại: đó là dữ liệu về thị trường và về
    /// chất lượng của nguồn. Không có lý do thì không đo được nguồn nào đáng tiền.
    /// </summary>
    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectSignalDto dto, CancellationToken ct)
        => Ok(await signals.RejectAsync(id, dto.Reason, ExpectedVersion(dto.ExpectedVersion), ct));

    /// <summary>
    /// Băm nội dung đã nộp cho bản ghi nhập tay. Tất định và độc lập thứ tự trường, để nộp lại y hệt cho ra cùng
    /// hash — đó là điều kiện để `ContentHash` phát hiện được "nguồn đã sửa bản ghi" thay vì báo động giả mỗi lần
    /// nhập lại. Không dùng cho đường adapter: ở đó hash phải tính trên payload gốc, không phải trên bản đã ánh xạ.
    /// </summary>
    private static string SubmissionHash(IngestSignalDto dto)
    {
        // Ngăn cách bằng U+001F (unit separator) — ký tự không xuất hiện trong dữ liệu người nhập, nên hai
        // trường liền nhau không thể ghép thành cùng một chuỗi với một cách chia khác.
        var canonical = string.Join((char)31,
            dto.Source, dto.ExternalId, dto.SignalClass, dto.Title, dto.Summary ?? string.Empty,
            dto.BuyerName ?? string.Empty, dto.SourceUrl ?? string.Empty,
            dto.BudgetAmount?.ToString(System.Globalization.CultureInfo.InvariantCulture) ?? string.Empty,
            dto.BudgetCurrency ?? string.Empty,
            dto.ObservedAt?.ToUniversalTime().ToString("O") ?? string.Empty,
            string.Join(',', dto.SectorIds.OrderBy(g => g)));
        return Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(canonical)));
    }
}
