using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Modules.Matching.Application;

namespace NacenTech.Api.V2;

public sealed class SearchFeedbackDtoIn
{
    /// <summary>`demand-briefs` | `technology-assets` — cùng bảng chữ với đoạn `{kind}` của các đường v2 khác.</summary>
    [Required] public string SubjectKind { get; set; } = string.Empty;

    [Required] public Guid SubjectId { get; set; }

    /// <summary>`OPENED` | `SHORTLISTED` | `DISMISSED` | `JUDGED`.</summary>
    [Required] public string Kind { get; set; } = string.Empty;

    /// <summary>Chỉ cho `JUDGED`: 0 không liên quan … 3 đúng thứ cần tìm.</summary>
    [Range(0, 3)] public int? Grade { get; set; }

    [MaxLength(1000)] public string? Note { get; set; }
}

/// <summary>
/// §26.6.4–26.6.5 — cửa duy nhất để nhãn liên quan đi vào hệ thống.
///
/// Đây là đường găng của quyết định hội tụ search, không phải một tính năng phụ: `search_query_logs` đã ghi truy
/// vấn, bộ lọc, ngưỡng, engine và kết quả trả về từ trước, nhưng **không có nhãn nào nói kết quả nào là đúng**.
/// Không có nhãn thì không có Recall@50 và nDCG@10, và §26.6.5 cấm tự nghĩ ra golden set. Từ lúc bật thu nhãn tới
/// lúc đủ ~200 truy vấn có người chấm là khoảng ba tháng; đó là lý do đường này mở trước những đường trông cấp
/// thiết hơn.
///
/// Không có đường đọc ở đây. Nhãn là dữ liệu phân tích, không phải nội dung sản phẩm; đọc nó là việc của
/// truy vấn dựng golden set, chạy ngoài API.
/// </summary>
[Route("api/v2/search-logs")]
public sealed class SearchFeedbackController(IMatchingService matching) : V2ControllerBase
{
    [HttpPost("{queryLogId:guid}/feedback")]
    public async Task<IActionResult> Record(Guid queryLogId, [FromBody] SearchFeedbackDtoIn dto, CancellationToken ct)
    {
        var subject = ParseSubject(dto.SubjectKind, dto.SubjectId);
        var result = await matching.RecordSearchFeedbackAsync(
            queryLogId, new SearchFeedbackCommand(subject, dto.Kind, dto.Grade, dto.Note), PersonId, ct);
        return Ok(result);
    }
}
