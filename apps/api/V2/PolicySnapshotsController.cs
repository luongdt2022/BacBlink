using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Case.Application;
using NacenTech.Modules.Policy.Application;

namespace NacenTech.Api.V2;

/// <summary>
/// Đọc một ảnh chụp chính sách — đặc tả `docs-v2/api-v2/policy-va-taxonomy.md`.
///
/// **Không có endpoint tạo, và cố ý không nên có.** Việc chốt luật ở lại bên trong lệnh chuyển giai đoạn của hồ
/// sơ vụ việc; một đường HTTP tạo ảnh chụp sẽ cho phép chốt luật ngoài luồng chuyển giai đoạn, và điều đó phá
/// đúng cái tính chất làm ảnh chụp có giá trị.
/// </summary>
[Route("api/v2/policy-snapshots")]
public sealed class PolicySnapshotsController(IPolicySnapshotService snapshots, ICaseService cases) : V2ControllerBase
{
    /// <summary>
    /// Quyền đọc ảnh chụp **là** quyền đọc hồ sơ vụ việc mà nó thuộc về, không phải một quyền riêng — một ảnh
    /// chụp không có ý nghĩa tách khỏi hồ sơ của nó. Cách rẻ nhất và không lệch được để diễn đạt điều đó là hỏi
    /// chính `ICaseService.GetAsync`, vốn đã gác cửa; ở đây không dựng lại luật quyền nào.
    ///
    /// Người không đọc được hồ sơ nhận **404**, không phải 403: định danh ảnh chụp trỏ về sự tồn tại của một hồ
    /// sơ, nên 403 sẽ xác nhận rằng hồ sơ đó có thật.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var snapshot = await snapshots.FindAsync(id, ct) ?? throw NotFound(id);

        try
        {
            await cases.GetAsync(snapshot.CaseId, ct);
        }
        catch (ForbiddenException)
        {
            throw NotFound(id);
        }
        catch (NotFoundException)
        {
            throw NotFound(id);
        }

        return Ok(snapshot);
    }

    private static NotFoundException NotFound(Guid id) => new($"Policy snapshot with ID {id} not found");
}
