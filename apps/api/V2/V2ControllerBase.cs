using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Api.V2;

/// <summary>
/// Lớp cơ sở của mọi endpoint `/api/v2` (ADR-0009).
///
/// **Cố ý không kế thừa `V1ControllerBase`, và cố ý không dùng lại `V1Mappers`.** Hai bề mặt có hình dạng lỗi
/// khác nhau (`message` so với `detail`), hình dạng phân trang khác nhau (`success: true` so với không có), và
/// một trong hai sẽ bị xoá nguyên khối tại sunset 31/03/2027. Dùng chung lớp cơ sở hay hàm ánh xạ là cách chắc
/// chắn nhất để hành vi v1 rò sang v2 — B-19 đã cho thấy cái giá: một hàm ánh xạ dùng chung giữa đường quản trị
/// và đường công khai đẩy `email` với `phone` của mọi tác giả ra Internet mà không ai thấy trong diff.
/// Ranh giới này được canh bằng test, không bằng lời khuyên — xem `ModuleBoundaryTests`.
///
/// Không cần xử lý lỗi ở đây: `ApiExceptionMiddleware` đã map mọi `DomainException` ngoài `/api/v1` thành
/// problem details RFC 9457 kèm `correlationId`, `code`, `ruleId` và `currentVersion`.
/// </summary>
[ApiController]
[Authorize]
[Produces("application/json")]
public abstract class V2ControllerBase : ControllerBase
{
    protected ICurrentActor Actor => HttpContext.RequestServices.GetRequiredService<ICurrentActor>();

    protected Guid PersonId => Actor.RequirePersonId();

    /// <summary>
    /// Hình dạng phân trang của v2. Khác v1 đúng một chỗ và đó là chủ ý: **không có `success: true`** — mã
    /// trạng thái HTTP đã nói điều đó. `limit` trả về là `limit` **thật** sau khi bị cắt xuống trần, để giao
    /// diện phát hiện được rằng nó không nhận đủ số dòng đã xin.
    /// </summary>
    protected static object Paged<T>(PagedResult<T> page) => new
    {
        data = page.Data,
        total = page.Total,
        page = page.Page,
        limit = page.Limit,
        totalPages = page.TotalPages,
    };

    /// <summary>
    /// Gắn `ETag` cho một bản ghi có phiên bản. Gọi ở **mọi** đường đọc một bản ghi có tranh chấp — client
    /// không giữ được số phiên bản nếu máy chủ không đưa nó ra, và khi đó ghi có điều kiện không dùng được.
    /// </summary>
    protected void SetETag(int version) => Response.Headers.ETag = ConditionalWrite.ETagFor(version);

    /// <summary>
    /// Số phiên bản mà lệnh ghi kỳ vọng, gộp từ header `If-Match` và trường `expectedVersion` của thân request.
    /// Xem <see cref="ConditionalWrite.Resolve"/> để biết luật khi cả hai cùng có mặt.
    /// </summary>
    protected int? ExpectedVersion(int? fromBody = null)
        => ConditionalWrite.Resolve(Request.Headers.IfMatch.FirstOrDefault(), fromBody);

    /// <summary>
    /// Đổi đoạn `{kind}` trong đường dẫn thành `SubjectRef`. Đường dẫn dùng danh từ số nhiều gạch nối theo quy
    /// ước của `api-v2/README.md`; hằng số miền thì viết hoa gạch dưới. Hai bảng chữ khác nhau, nên phép đổi
    /// phải tường minh — không suy từ chuỗi, vì suy sai sẽ cho ra một `SubjectRef` trỏ vào hư không mà mọi truy
    /// vấn đều trả rỗng thay vì báo lỗi.
    /// </summary>
    protected static SubjectRef ParseSubject(string kind, Guid id) => new(kind switch
    {
        "demand-briefs" => SubjectKinds.DemandBrief,
        "technology-assets" => SubjectKinds.TechnologyAsset,
        "commercialization-cases" => SubjectKinds.CommercializationCase,
        _ => throw new ValidationException(
            "kind must be one of the following values: demand-briefs, technology-assets, commercialization-cases"),
    }, id);
}
