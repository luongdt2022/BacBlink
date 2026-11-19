using Microsoft.AspNetCore.Mvc;
using NacenTech.Modules.Demand.Application;

namespace NacenTech.Api.V2;

/// <summary>
/// Đề bài — chỉ **một đường đọc**, đặc tả `docs/02-requirements/san-pham-v2/api-v2/demand-va-technology.md`. Cả bộ sưu tập (danh sách,
/// tạo, sửa, xoá mềm, khôi phục, lịch sử phiên bản) chưa mở ở v2; đường này mở trước vì console hồ sơ vụ việc
/// cần đúng một con số của nó — `currentVersionNo` — để cảnh báo "đề bài đã có bản mới hơn bản hồ sơ đang
/// ghim", chỗ dễ hiểu nhầm nhất trong hệ thống theo đặc tả console.
///
/// Quyền đọc là luật của `IDemandService.GetAsync` (chủ sở hữu, đã xuất bản, hoặc quyền đọc bất kỳ); ở đây
/// không dựng lại. Trả kèm `ETag` mang số phiên bản vì đây là bản ghi có tranh chấp.
/// </summary>
[Route("api/v2/demand-briefs")]
public sealed class DemandBriefsController(IDemandService demands) : V2ControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var brief = await demands.GetAsync(id, false, ct);
        SetETag(brief.Version);
        return Ok(brief);
    }
}
