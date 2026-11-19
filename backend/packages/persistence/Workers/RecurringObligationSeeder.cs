using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NacenTech.Kernel.Application;

namespace NacenTech.Persistence.Workers;

/// <summary>
/// Mắt xích cuối của B-30: **thứ xếp nghĩa vụ định kỳ vào lịch lần đầu tiên**.
///
/// Ba mảnh phải có đủ thì một nghĩa vụ định kỳ mới chạy được, và trước sprint 4 hệ thống chỉ có mảnh thứ nhất:
/// bộ chạy nền quét mục quá hạn (`ScheduledObligationWorker`) — **có**; một xử lý đăng ký cho loại nghĩa vụ —
/// **không**; và một thứ tạo ra mục lịch đầu tiên — **không**. Thiếu mảnh thứ ba thì dù có xử lý, bảng lịch
/// vẫn rỗng và không gì được gọi.
///
/// Không cần khai báo thêm ở đâu: mọi `IScheduledObligationHandler` đã đăng ký đều được xếp lịch. Một loại
/// nghĩa vụ có xử lý mà không có mục lịch là một lỗi im lặng, và đây là chỗ chặn nó.
///
/// Hạn đầu tiên là **ngay lập tức**; lượt kế tiếp do chính xử lý tự nối theo chu kỳ của nó. Chạy nhiều bản sao
/// cùng lúc là an toàn vì `EnsureScheduledAsync` bỏ qua khi đã có mục đang chờ.
/// </summary>
public sealed class RecurringObligationSeeder(
    IServiceScopeFactory scopes,
    IObligationScheduler scheduler,
    IClock clock,
    ILogger<RecurringObligationSeeder> log) : IHostedService
{
    public async Task StartAsync(CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        var handlers = scope.ServiceProvider.GetServices<IScheduledObligationHandler>().ToList();

        if (handlers.Count == 0)
        {
            log.LogWarning("Không có xử lý nghĩa vụ định kỳ nào được đăng ký — mọi nghĩa vụ dài hạn sẽ không chạy");
            return;
        }

        foreach (var kind in handlers.Select(h => h.Kind).Distinct())
        {
            try
            {
                var created = await scheduler.EnsureScheduledAsync(kind, clock.UtcNow, ct);
                if (created) log.LogInformation("Đã xếp lịch nghĩa vụ định kỳ {Kind}", kind);
            }
            catch (Exception ex)
            {
                // Không được làm hỏng khởi động vì một mục lịch: hệ thống vẫn phục vụ được khi thiếu nó.
                log.LogError(ex, "Không xếp được lịch cho nghĩa vụ {Kind}", kind);
            }
        }
    }

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}
