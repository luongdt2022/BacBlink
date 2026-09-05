using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Audit.Application;

/// <summary>Audit append-only §21.4/§23.5. Không có API sửa/xóa; IP/device có retention riêng.</summary>
public sealed record AuditEventDto(
    Guid Id,
    Guid? ActorRef,
    string ActorRole,
    string Action,
    string ObjectKind,
    Guid? ObjectId,
    int? ObjectVersion,
    string? Purpose,
    string Outcome,
    string? RuleId,
    string CorrelationId,
    DateTimeOffset OccurredAt,
    string? Details);

/// <summary>
/// Một dòng đầy đủ, gồm dấu vết thiết bị. Hai trường đó có **thời hạn lưu riêng, ngắn hơn bản thân sự kiện**
/// và bị `PurgeDeviceDataAsync` cắt về `null` mà không đụng tới dòng — nên `null` ở đây nghĩa là "đã hết hạn
/// lưu" **hoặc** "không ghi nhận", và tầng này không phân biệt được hai chuyện đó.
/// Chúng cố ý **không** có trong <see cref="AuditEventDto"/>: danh sách không được mang dấu vết thiết bị.
/// </summary>
public sealed record AuditEventDetailDto(
    AuditEventDto Event,
    string? IpAddress,
    string? UserAgent,
    /// <summary>
    /// Mốc mà từ đó dấu vết thiết bị còn được giữ, tính từ cấu hình thời hạn lưu. Đây là thứ cho phép giao
    /// diện phân biệt **ba** trạng thái mà một ô IP rỗng đang gộp làm một:
    /// dòng cũ hơn mốc và rỗng = *đã hết hạn lưu và bị cắt*; dòng mới hơn mốc và rỗng = *chưa từng ghi* (hành
    /// động đến từ tác vụ nền, không từ trình duyệt); có giá trị = giá trị thật.
    ///
    /// Giao diện **không được tự suy** trạng thái này từ giá trị rỗng — một ô trống không nhãn gộp cả ba lại,
    /// và đó là chỗ một cuộc điều tra đi sai hướng: người đọc kết luận "không có thiết bị nào" trong khi sự
    /// thật là "đã có, đã hết hạn".
    /// </summary>
    DateTimeOffset DeviceDataRetainedFrom);

/// <summary>
/// Bộ lọc tra cứu nhật ký.
///
/// `From`/`To` là năng lực **mới thêm** ở sprint 4. Trước đó hàm tra cứu chỉ nhận bốn tham số và không có
/// tham số thời gian nào — trong khi mọi câu hỏi kiểm toán thật đều có dạng *"trong tháng vừa rồi"*, và cách
/// duy nhất để trả lời là lật trang cho tới khi qua khỏi mốc cần tìm. Bảng đã có chỉ mục theo thời điểm, nên
/// đây là việc thêm hai tham số chứ không phải một cuộc thiết kế lại.
///
/// Vẫn **chưa có**: lọc theo hành động, theo mã quy tắc, và theo mã tương quan. Cái cuối là thứ bộ phận hỗ trợ
/// cần khi người dùng đọc cho họ một mã lỗi.
/// </summary>
public sealed record AuditQueryFilter(
    Guid? ActorRef = null,
    string? ObjectKind = null,
    Guid? ObjectId = null,
    string? Outcome = null,
    DateTimeOffset? From = null,
    DateTimeOffset? To = null);

public interface IAuditQuery
{
    Task<PagedResult<AuditEventDto>> ListAsync(AuditQueryFilter filter, PageRequest page, CancellationToken ct);
    /// <summary>Một dòng đầy đủ kèm dấu vết thiết bị. Đi qua cùng cửa phân quyền với <see cref="ListAsync"/>.</summary>
    Task<AuditEventDetailDto?> FindAsync(Guid id, CancellationToken ct);
    /// <summary>Cắt IP/device đã hết retention (không đụng event) — chạy từ ScheduledObligation RETENTION_REVIEW.</summary>
    Task<int> PurgeDeviceDataAsync(DateTimeOffset olderThan, CancellationToken ct);
}
