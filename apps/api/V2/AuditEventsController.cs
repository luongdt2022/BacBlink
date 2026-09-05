using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Audit.Application;

namespace NacenTech.Api.V2;

/// <summary>
/// Tra cứu nhật ký kiểm toán — đặc tả `docs/02-requirements/san-pham-v2/api-v2/audit.md`.
///
/// Nhật ký là **chỉ ghi thêm**: không có endpoint tạo, sửa hay xoá, và điều đó không phải quy ước tự nguyện mà
/// là hình dạng của tầng dưới. Việc cắt dấu vết thiết bị hết hạn **cố ý không có đường HTTP** — nó là nghĩa vụ
/// định kỳ của hệ thống, không phải một nút bấm; đặt nó sau một endpoint sẽ biến chính sách lưu trữ thành một
/// hành động tuỳ hứng và tạo ra đúng thứ mà nhật ký chỉ-ghi-thêm sinh ra để chặn.
///
/// Phần giá trị nhất của nhật ký là các lượt **bị từ chối**; chúng đã được ghi đầy đủ kèm mã quy tắc, và cho
/// tới endpoint này thì không ai xem được.
/// </summary>
[Route("api/v2/audit-events")]
public sealed class AuditEventsController(IAuditQuery audit) : V2ControllerBase
{
    /// <summary>
    /// Bốn bộ lọc, ghép bằng "và"; bỏ trống một cái nghĩa là không lọc theo chiều đó. Sắp theo thời điểm
    /// **giảm dần** — mới nhất trước.
    ///
    /// Dấu vết thiết bị (IP, trình duyệt) **không nằm trong danh sách**; chúng chỉ có ở đường đọc một dòng.
    ///
    /// Chưa có bộ lọc theo khoảng thời gian, theo hành động, theo mã quy tắc hay theo mã tương quan — xem mục
    /// "Trường hợp biên" trong `api-v2/audit.md`. Cái đầu là khoảng trống nghiêm trọng nhất, vì mọi câu hỏi
    /// kiểm toán thật đều có dạng "trong tháng vừa rồi".
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] Guid? actorRef,
        [FromQuery] string? objectKind,
        [FromQuery] Guid? objectId,
        [FromQuery] string? outcome,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] int? page,
        [FromQuery] int? limit,
        CancellationToken ct)
    {
        if (from is { } f && to is { } t && f >= t)
            throw new ValidationException("from must be earlier than to");

        var filter = new AuditQueryFilter(actorRef, objectKind, objectId, NormalizeOutcome(outcome), from, to);
        return Ok(Paged(await audit.ListAsync(filter, PageRequest.Of(page, limit), ct)));
    }

    /// <summary>Một dòng đầy đủ, gồm dấu vết thiết bị nếu còn hạn lưu.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var detail = await audit.FindAsync(id, ct) ?? throw new NotFoundException($"Audit event with ID {id} not found");
        var e = detail.Event;
        return Ok(new
        {
            e.Id,
            e.ActorRef,
            e.ActorRole,
            e.Action,
            e.ObjectKind,
            e.ObjectId,
            e.ObjectVersion,
            e.Purpose,
            e.Outcome,
            e.RuleId,
            e.CorrelationId,
            e.OccurredAt,
            e.Details,
            detail.IpAddress,
            detail.UserAgent,
            // Mốc để giao diện phân biệt "chưa từng ghi" với "đã hết hạn lưu và bị cắt". Không có nó, một ô IP
            // rỗng gộp ba trạng thái khác nhau làm một, và người đọc kết luận sai theo hướng nguy hiểm nhất:
            // "không có thiết bị nào" trong khi sự thật là "đã có, đã bị cắt theo chính sách".
            detail.DeviceDataRetainedFrom,
        });
    }

    /// <summary>
    /// Chỉ hai giá trị, và sai chính tả phải báo lỗi chứ không im lặng trả rỗng: một bộ lọc gõ nhầm cho ra 0
    /// dòng trông giống hệt "không có gì xảy ra", và đó là kết luận sai nguy hiểm nhất mà màn hình kiểm toán
    /// có thể dẫn người dùng tới.
    /// </summary>
    private static string? NormalizeOutcome(string? outcome)
    {
        if (string.IsNullOrWhiteSpace(outcome)) return null;
        var normalized = outcome.ToUpperInvariant();
        // Đọc từ cùng một chỗ với cửa phân quyền và tầng lệnh — đây là chỗ ba tầng từng lệch nhau (ADR-0006).
        if (!AuditOutcomes.All.Contains(normalized))
            throw new ValidationException($"outcome must be one of the following values: {string.Join(", ", AuditOutcomes.All)}");
        return normalized;
    }
}
