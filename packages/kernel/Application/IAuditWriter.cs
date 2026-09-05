namespace NacenTech.Kernel.Application;

/// <summary>
/// Audit append-only (§21.4, §23.5). actorRef là surrogate id, không PII.
///
/// **Ghi bằng transaction RIÊNG, không theo UnitOfWork của command** — xem `IsolatedAuditWriter`. Chú thích ở
/// đây trước đây nói ngược lại (B-24), và bộ tài liệu đã viết sai theo nó ở bốn chỗ trước khi ai đó đọc bản
/// cài đặt. Lý do tách: từ chối truy cập luôn kết thúc bằng exception, nên dòng audit nằm trong transaction
/// của command sẽ bị rollback cùng — hệ thống im lặng đúng ở tình huống cần dấu vết nhất.
///
/// Hệ quả phải nói ra: một lệnh ghi **thất bại ở bước sau** vẫn để lại dòng audit nói rằng nó được phép.
/// Người đọc nhật ký phải hiểu một dòng `PERMIT` là "cửa phân quyền đã cho qua", không phải "việc đã xong".
/// </summary>
public interface IAuditWriter
{
    void Append(AuditEntry entry);
}

/// <summary>
/// Từ vựng kết quả của một dòng kiểm toán — **đúng ba từ, khai một chỗ** (ADR-0006, câu 5).
///
/// Trước đó ba tầng dùng ba từ mà không test nào so chúng với nhau: cửa phân quyền ghi `PERMIT`, đặc tả nói
/// `ALLOW`, endpoint lọc theo `ALLOW` — nên lọc "cho phép" không bao giờ khớp dòng nào, và lượt đo đầu tiên
/// đã hiểu nhầm đó là "chưa có dòng nào".
///
/// `Allow` và `Deny` là quyết định của **cửa phân quyền**: được phép hay không. `Success` là của **tầng
/// lệnh**, ghi sau `CommitAsync`: việc đã xảy ra. Vì kiểm toán dùng transaction riêng (ADR-0001), một lệnh
/// được phép nhưng thất bại ở bước sau để lại `Allow` mà không có `Success` — người đọc phân biệt "được phép"
/// với "đã xảy ra" bằng hai dòng, không bằng suy đoán.
/// </summary>
public static class AuditOutcomes
{
    public const string Allow = "ALLOW";
    public const string Deny = "DENY";
    public const string Success = "SUCCESS";

    public static readonly IReadOnlySet<string> All = new HashSet<string> { Allow, Deny, Success };
}

public sealed record AuditEntry(
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
    string? IpAddress,
    string? UserAgent,
    string? Details);
