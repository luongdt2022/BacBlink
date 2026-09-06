using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Entitlement.Application;

namespace NacenTech.Modules.Entitlement;

/// <summary>
/// §20 — quyền lợi thương mại: hợp đồng dịch vụ, quota theo capability và bản ghi mức dùng.
///
/// Module này **không** quyết định ai được phép làm gì (đó là `packages/policy-engine`) và **không** giữ tiền
/// (nguyên tắc 10: platform chỉ lưu tham chiếu hóa đơn). Nó trả lời đúng một câu hỏi: tổ chức này đã mua
/// capability đó chưa, và còn quota không.
/// </summary>
public sealed class EntitlementModule : IModule
{
    public const string SchemaName = "entitlement";

    public string Name => "entitlement";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(EntitlementModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<EntitlementOptions>(configuration.GetSection(EntitlementOptions.Section));
        services.AddScoped<IEntitlementGate, EntitlementGate>();
        services.AddScoped<IAgreementService, AgreementService>();
    }
}
