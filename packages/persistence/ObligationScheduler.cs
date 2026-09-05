using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Persistence.Platform;

namespace NacenTech.Persistence;

/// <summary>
/// Bản cài đặt của <see cref="IObligationScheduler"/>.
///
/// Dùng `IDbContextFactory` chứ không dùng `DbContext` của scope hiện tại: nó được gọi từ tầng khởi động —
/// nơi chưa có scope của một request nào — và từ bên trong handler, nơi `DbContext` của scope đang giữ chính
/// mục lịch vừa `FIRED` và không nên bị trộn thêm hàng mới.
/// </summary>
public sealed class ObligationScheduler(IDbContextFactory<NacenTechDbContext> factory, IClock clock) : IObligationScheduler
{
    public async Task<bool> EnsureScheduledAsync(string kind, DateTimeOffset dueAt, CancellationToken ct, Guid? excludeObligationId = null)
    {
        await using var db = await factory.CreateDbContextAsync(ct);

        // Mục đang chạy vẫn mang trạng thái `SCHEDULED` cho tới khi bộ chạy nền commit — nên nó phải bị loại
        // ra, nếu không xử lý sẽ thấy chính mình và không bao giờ xếp được lượt kế tiếp.
        var pending = await db.ScheduledObligations
            .AnyAsync(o => o.Kind == kind
                        && o.State == ScheduledObligationStates.Scheduled
                        && (excludeObligationId == null || o.Id != excludeObligationId), ct);
        if (pending) return false;

        db.ScheduledObligations.Add(new ScheduledObligation
        {
            Kind = kind,
            DueAt = dueAt,
            State = ScheduledObligationStates.Scheduled,
            CreatedAt = clock.UtcNow,
        });
        await db.SaveChangesAsync(ct);
        return true;
    }
}
