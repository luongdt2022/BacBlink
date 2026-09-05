using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Case.Application;

namespace NacenTech.Api.V2;

/// <summary>
/// Hồ sơ vụ việc — phần **đọc**. Đặc tả `docs-v2/api-v2/case-va-quyet-dinh.md`.
///
/// Ba lệnh ghi của nhóm này (`POST /cases`, `POST /cases/{id}/transition`, `POST /cases/{id}/holds`) chưa nằm ở
/// đây, và không phải vì thiếu thời gian: chuyển giai đoạn **bắt buộc mang một loại quyết định**, mà bộ bốn
/// loại hiện có không có loại nào ứng với *rút lui* hay *huỷ*. Theo luật đang chạy, người dùng phải chọn
/// "Chấp thuận" để rút lui một hồ sơ, và bản ghi quyết định là dữ liệu chỉ-ghi-thêm nên dòng thời gian sẽ đọc
/// sai nghĩa mãi về sau. Đó là ADR-0008, và nó rẻ nhất **bây giờ** vì chưa có dữ liệu nào mang giá trị đó.
///
/// Ba đường đọc thì không chạm quyết định ấy, và chúng làm được ngay — cộng thêm một việc: cho `ETag` một bản
/// ghi thật để gắn. Trước đó `/api/v2` không có endpoint nào trả bản ghi có phiên bản.
/// </summary>
/// <summary>Thân của lệnh chuyển giai đoạn.</summary>
public sealed class TransitionDto
{
    public string ToStage { get; set; } = string.Empty;
    public string Decision { get; set; } = string.Empty;
    public List<string> ReasonCodes { get; set; } = [];
    public string Rationale { get; set; } = string.Empty;
    public string? MandateRef { get; set; }
    /// <summary>Có thể gửi ở đây hoặc bằng header `If-Match`; gửi cả hai mà lệch nhau thì bị từ chối.</summary>
    public int? ExpectedVersion { get; set; }
}

public sealed class AssignLeadBrokerDto
{
    public Guid BrokerPersonId { get; set; }
    public int? ExpectedVersion { get; set; }
}

public sealed class OpenHoldDto
{
    public string Reason { get; set; } = string.Empty;
}

public sealed class ReleaseHoldDto
{
    public string Rationale { get; set; } = string.Empty;
}

/// <summary>Thân của lệnh tạo hồ sơ vụ việc.</summary>
public sealed class CreateCaseDto
{
    public string Track { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public Guid ProblemOwnerPersonId { get; set; }
    public Guid DemandBriefId { get; set; }
    public int DemandBriefVersionNo { get; set; }
    public string ConfidentialityLevel { get; set; } = string.Empty;
    public Guid? LeadBrokerPersonId { get; set; }
}

[Route("api/v2/cases")]
public sealed class CasesController(ICaseService cases) : V2ControllerBase
{
    /// <summary>
    /// Lệnh ghi **đầu tiên** của `/api/v2`, và vì thế là lần đầu ba cơ chế giao thức của v2 thực sự chạy trên
    /// một đường thật: thiếu `Idempotency-Key` → **428**; cùng khoá cùng thân → phát lại phản hồi cũ kèm
    /// `Idempotent-Replayed: true`; cùng khoá khác thân → **422**. Cho tới sprint 5 chúng chỉ được kiểm bằng
    /// test đơn vị ở client, vì `/api/v2` chưa có lệnh ghi nào để đo.
    ///
    /// Tạo hồ sơ **không** chạm ADR-0008: bộ loại quyết định chỉ liên quan tới chuyển giai đoạn.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCaseDto dto, CancellationToken ct)
    {
        var created = await cases.CreateAsync(new CreateCaseCommand(
            dto.Track, dto.Title, dto.ProblemOwnerPersonId, dto.DemandBriefId,
            dto.DemandBriefVersionNo, dto.ConfidentialityLevel, dto.LeadBrokerPersonId), ct);

        SetETag(created.Version);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] Guid? brokerPersonId,
        [FromQuery] Guid? problemOwnerPersonId,
        [FromQuery] string? stage,
        [FromQuery] int? page,
        [FromQuery] int? limit,
        CancellationToken ct)
    {
        var result = await cases.ListAsync(brokerPersonId, problemOwnerPersonId, stage, PageRequest.Of(page, limit), ct);
        return Ok(Paged(result));
    }

    /// <summary>
    /// Trả kèm `ETag` mang số phiên bản. Đây là nửa còn thiếu của ghi có điều kiện (B-40): client không giữ
    /// được số phiên bản nếu máy chủ không đưa nó ra, và khi đó `If-Match` ở lệnh ghi không có gì để gửi.
    /// Số phiên bản cũng có trong thân, vì không phải client nào cũng đọc được header qua CORS.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var @case = await cases.GetAsync(id, ct);
        SetETag(@case.Version);
        return Ok(@case);
    }

    /// <summary>
    /// Dòng thời gian: các bản ghi quyết định của hồ sơ, **chỉ ghi thêm**. Không có đường sửa và không có đường
    /// xoá ở bất kỳ tầng nào — sửa muộn không sửa được quá khứ.
    /// </summary>
    [HttpGet("{id:guid}/timeline")]
    public async Task<IActionResult> Timeline(Guid id, CancellationToken ct)
    {
        // Đọc hồ sơ trước để phép kiểm quyền chạy đúng một lần và ở đúng chỗ: dòng thời gian không có luật
        // quyền riêng, nó thừa hưởng luật của hồ sơ mà nó thuộc về.
        await cases.GetAsync(id, ct);
        return Ok(await cases.TimelineAsync(id, ct));
    }

    /// <summary>
    /// Chuyển giai đoạn. Đường dẫn riêng thay vì `PATCH` trường giai đoạn, vì đây là **một hành động, không
    /// phải một phép gán**: nó cần lý do, mã lý do và diễn giải, và nó sinh một bản ghi quyết định.
    ///
    /// Tám luật chặn lệnh này, và thứ tự của chúng có nghĩa — xem `docs-v2/api-v2/case-va-quyet-dinh.md`.
    /// Hai luật đáng nhớ nhất: lệch phiên bản trả **409** và **không tạo bản ghi quyết định nào**; sai loại
    /// quyết định trả **422** kèm mã nói rõ loại nào được đòi (ADR-0008).
    /// </summary>
    [HttpPost("{id:guid}/transition")]
    public async Task<IActionResult> Transition(Guid id, [FromBody] TransitionDto dto, CancellationToken ct)
    {
        var version = RequireExpectedVersion(dto.ExpectedVersion);
        var updated = await cases.TransitionAsync(id, new TransitionCommand(
            dto.ToStage, dto.Decision, dto.ReasonCodes, dto.Rationale, dto.MandateRef, version), ct);

        SetETag(updated.Version);
        return Ok(updated);
    }

    /// <summary>Gán môi giới chính. Cần trước khi hồ sơ vào `QUALIFICATION` (CASE-01).</summary>
    [HttpPost("{id:guid}/lead-broker")]
    public async Task<IActionResult> AssignLeadBroker(Guid id, [FromBody] AssignLeadBrokerDto dto, CancellationToken ct)
    {
        var version = RequireExpectedVersion(dto.ExpectedVersion);
        var updated = await cases.AssignLeadBrokerAsync(id, dto.BrokerPersonId, version, ct);

        SetETag(updated.Version);
        return Ok(updated);
    }

    /// <summary>
    /// Mở một khoá tạm. Khoá mở **chặn mọi chuyển giai đoạn**, kể cả chuyển hợp lệ theo ma trận (CASE-13) —
    /// nên đây là lệnh có sức nặng hơn vẻ ngoài của nó.
    /// </summary>
    [HttpPost("{id:guid}/holds")]
    public async Task<IActionResult> OpenHold(Guid id, [FromBody] OpenHoldDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Reason)) throw new ValidationException("reason should not be empty");

        var updated = await cases.OpenHoldAsync(id, dto.Reason, ct);
        SetETag(updated.Version);
        return Ok(updated);
    }

    /// <summary>
    /// Gỡ một khoá tạm. Việc này **cũng tạo một bản ghi quyết định** (CASE-13): gỡ khoá là một quyết định có
    /// người chịu trách nhiệm, không phải một thao tác dọn dẹp.
    /// </summary>
    [HttpPost("{id:guid}/holds/{holdId:guid}/release")]
    public async Task<IActionResult> ReleaseHold(Guid id, Guid holdId, [FromBody] ReleaseHoldDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Rationale)) throw new ValidationException("rationale should not be empty");

        var updated = await cases.ReleaseHoldAsync(id, holdId, dto.Rationale, ct);
        SetETag(updated.Version);
        return Ok(updated);
    }

    /// <summary>
    /// Số phiên bản là **bắt buộc** với hai lệnh sửa hồ sơ, và thiếu nó là lỗi của người gọi chứ không phải
    /// một mặc định êm ái: bỏ qua kiểm tranh chấp trên một bản ghi nhiều người cùng sửa là cách ghi đè im lặng.
    ///
    /// `If-Match: *` **cũng bị từ chối** ở hai lệnh này, và đó là chủ ý. Nó mang nghĩa "bản ghi nào cũng được,
    /// miễn là nó tồn tại" — một nghĩa mà tầng dịch vụ không diễn đạt được, vì nó nhận một số phiên bản cụ thể.
    /// Nhận `*` rồi truyền xuống một giá trị giả sẽ cho ra **409 lệch phiên bản** trên một lệnh mà người gọi
    /// vừa nói rõ là không quan tâm phiên bản — đúng loại thông điệp chỉ vào nguyên nhân sai mà B-32 đã dạy.
    /// </summary>
    private int RequireExpectedVersion(int? fromBody)
    {
        var version = ExpectedVersion(fromBody)
            ?? throw new ValidationException(
                "Cần số phiên bản: gửi `expectedVersion` trong thân hoặc header `If-Match`");

        if (version == ConditionalWrite.AnyVersion)
            throw new ValidationException(
                "`If-Match: *` không dùng được cho lệnh này; gửi số phiên bản cụ thể đọc từ `ETag`");

        return version;
    }
}
