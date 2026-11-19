using NacenTech.Kernel.Domain;

namespace NacenTech.Kernel.Application;

/// <summary>
/// Outbox transactional (§21.2, MOD-03): enqueue nằm trong cùng UnitOfWork; worker phát tán at-least-once.
/// Domain event của aggregate được UnitOfWork tự đưa vào outbox; Enqueue dùng cho event không gắn aggregate.
/// </summary>
public interface IOutbox
{
    void Enqueue(IDomainEvent @event);
}

public interface IIntegrationEventHandler<in TEvent> where TEvent : IDomainEvent
{
    Task HandleAsync(TEvent @event, CancellationToken ct);
}

/// <summary>Job nền chạy qua bảng PostgreSQL `FOR UPDATE SKIP LOCKED` (D2-145).</summary>
public interface IJob
{
}

public interface IJobQueue
{
    /// <summary>Enqueue trong cùng transaction với ghi dữ liệu. runAfter null = chạy ngay.</summary>
    void Enqueue<TJob>(TJob job, DateTimeOffset? runAfter = null, string? dedupKey = null) where TJob : IJob;
}

public interface IJobHandler<in TJob> where TJob : IJob
{
    Task HandleAsync(TJob job, CancellationToken ct);
}

/// <summary>Lịch dài hạn §26.5 — khác outbox về vòng đời (tháng/năm).</summary>
public interface IScheduledObligationHandler
{
    string Kind { get; }
    Task HandleAsync(Guid obligationId, Guid? caseId, Guid? payloadRef, CancellationToken ct);
}

/// <summary>
/// Xếp một nghĩa vụ định kỳ vào lịch, **không trùng lặp**.
///
/// Bảng nghĩa vụ là một-lần theo thiết kế (`SCHEDULED` → `FIRED`), nên việc "định kỳ" phải tự nối: mỗi lượt
/// chạy xong thì xếp lượt kế tiếp. Cần một đường không-trùng-lặp vì hai chỗ cùng gọi nó — tầng khởi động (để
/// hệ thống có mục lịch đầu tiên) và chính handler (để nối lượt sau) — và cả hai có thể chạy cùng lúc.
///
/// Nằm ở kernel vì module không được biết `NacenTechDbContext` (MOD-02); bản cài đặt ở `packages/persistence`.
/// </summary>
public interface IObligationScheduler
{
    /// <summary>
    /// Tạo một mục lịch nếu chưa có mục nào đang chờ cho loại này. Trả `true` khi đã tạo mới.
    ///
    /// `excludeObligationId` **bắt buộc** khi gọi từ bên trong một xử lý đang chạy, và bỏ sót nó là một lỗi im
    /// lặng đã đo được: bộ chạy nền chỉ đánh dấu mục lịch là `FIRED` **sau khi** xử lý trả về, nên trong lúc xử
    /// lý chạy, mục của chính nó vẫn đang ở trạng thái chờ. Phép chống trùng khi đó thấy chính nó, bỏ qua, và
    /// lượt kế tiếp không bao giờ được xếp — việc định kỳ chạy đúng một lần mỗi lần khởi động rồi thôi.
    /// </summary>
    Task<bool> EnsureScheduledAsync(string kind, DateTimeOffset dueAt, CancellationToken ct, Guid? excludeObligationId = null);
}
