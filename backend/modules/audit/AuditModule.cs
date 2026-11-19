using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Audit.Application;

namespace NacenTech.Modules.Audit;

public sealed class AuditModule : IModule
{
    public const string SchemaName = "audit";

    public string Name => "audit";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(AuditModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        // IAuditWriter được đăng ký ở packages/persistence (transaction riêng — xem IsolatedAuditWriter).
        services.AddScoped<IAuditQuery, AuditQuery>();

        // B-30: nghĩa vụ rà thời hạn lưu. Trước đây không xử lý nào được đăng ký cho bất kỳ loại nghĩa vụ nào,
        // nên việc cắt dấu vết thiết bị chưa bao giờ chạy dù phương thức cắt đã có sẵn.
        services.Configure<AuditRetentionOptions>(configuration.GetSection(AuditRetentionOptions.Section));
        services.AddScoped<IScheduledObligationHandler, RetentionReviewHandler>();
    }
}
