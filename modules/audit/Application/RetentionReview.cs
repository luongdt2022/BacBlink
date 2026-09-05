using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Audit.Application;

/// <summary>
/// Thời hạn lưu của nhật ký kiểm toán.
///
/// **Hai con số này trước đây không tồn tại ở bất kỳ đâu** (B-30). Phương thức cắt dấu vết thiết bị nhận một
/// mốc thời gian làm tham số, và không cấu hình nào nói mốc đó là bao lâu — nên trên thực tế IP và trình duyệt
/// được giữ **vô thời hạn**, đúng ngược với điều kiến trúc mô tả.
///
/// `DeviceDataRetentionDays = 90` **đã được đội chốt** ngày 2026-09-04. Nó bảo thủ theo hướng an toàn: đủ dài
/// để điều tra một sự cố, đủ ngắn để không giữ dấu vết thiết bị của người dùng nhiều năm. Nó nằm trong cấu
/// hình chứ không trong mã, vì đổi nó là đổi một cam kết về dữ liệu cá nhân — và một cam kết như thế phải sửa
/// được mà không cần phát hành lại phần mềm.
///
/// Thời hạn lưu của **bản thân sự kiện kiểm toán** vẫn **chưa được quyết** — lượt chốt ngày 2026-09-04 chỉ
/// trả lời một trong hai con số. Cố ý chưa có ở đây: nhật ký là dữ liệu chỉ-ghi-thêm, nên một cơ chế xoá sự
/// kiện cần quyết định riêng và cần cân nhắc kỹ hơn nhiều.
/// </summary>
public sealed class AuditRetentionOptions
{
    public const string Section = "Audit:Retention";

    /// <summary>Số ngày giữ địa chỉ IP và chuỗi nhận dạng trình duyệt. Hết hạn thì hai trường bị cắt; dòng ở lại nguyên vẹn.</summary>
    public int DeviceDataRetentionDays { get; set; } = 90;

    /// <summary>Khoảng cách giữa hai lượt rà. Mỗi lượt tự xếp lịch cho lượt kế tiếp.</summary>
    public int ReviewIntervalHours { get; set; } = 24;
}

public static class ObligationKinds
{
    /// <summary>Rà thời hạn lưu — cắt dấu vết thiết bị đã quá hạn. Chú thích trong mã đã nhắc tên này từ đầu.</summary>
    public const string RetentionReview = "RETENTION_REVIEW";
}

/// <summary>
/// B-30: việc cắt dấu vết thiết bị **chưa bao giờ chạy**. Phương thức cắt có tồn tại, và chú thích của nó nói
/// nó chạy từ một nghĩa vụ định kỳ — nhưng `IScheduledObligationHandler` không có **bản cài đặt nào** trong
/// toàn bộ mã nguồn, và không gì xếp `RETENTION_REVIEW` vào lịch. Bộ chạy nền có, hàng đợi nghĩa vụ có, chỉ
/// thiếu đúng hai mắt xích ở giữa.
///
/// Bảng nghĩa vụ là **một lần** theo thiết kế (`SCHEDULED` → `FIRED`), nên định kỳ phải tự nối: mỗi lượt chạy
/// xong thì xếp lượt kế tiếp. Cách này chịu được worker chết nhiều ngày — khi sống lại nó xử lý mục quá hạn
/// rồi nối tiếp từ hiện tại, thay vì cố chạy bù từng ngày đã lỡ.
/// </summary>
public sealed class RetentionReviewHandler(
    IAuditQuery audit,
    IObligationScheduler scheduler,
    IOptions<AuditRetentionOptions> options,
    IClock clock,
    ILogger<RetentionReviewHandler> log) : IScheduledObligationHandler
{
    public string Kind => ObligationKinds.RetentionReview;

    public async Task HandleAsync(Guid obligationId, Guid? caseId, Guid? payloadRef, CancellationToken ct)
    {
        var o = options.Value;
        var cutoff = clock.UtcNow.AddDays(-o.DeviceDataRetentionDays);

        var purged = await audit.PurgeDeviceDataAsync(cutoff, ct);
        log.LogInformation(
            "Rà thời hạn lưu: cắt dấu vết thiết bị của {Count} dòng kiểm toán cũ hơn {Cutoff:O} ({Days} ngày)",
            purged, cutoff, o.DeviceDataRetentionDays);

        // Loại chính mục đang chạy ra khỏi phép chống trùng: nó vẫn ở trạng thái chờ tại thời điểm này, vì bộ
        // chạy nền chỉ đánh dấu `FIRED` sau khi phương thức này trả về. Quên tham số đó thì việc rà chạy đúng
        // một lần mỗi lần khởi động rồi im lặng dừng — đo được ngày 2026-09-04, và không test đơn vị nào bắt
        // được vì nó chỉ xuất hiện khi cả vòng chạy thật.
        var scheduled = await scheduler.EnsureScheduledAsync(
            ObligationKinds.RetentionReview,
            clock.UtcNow.AddHours(o.ReviewIntervalHours),
            ct,
            excludeObligationId: obligationId);

        if (!scheduled)
            log.LogWarning("Không xếp được lượt rà thời hạn lưu kế tiếp — đã có một mục đang chờ?");
    }
}
