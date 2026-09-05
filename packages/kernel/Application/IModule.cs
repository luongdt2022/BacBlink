using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace NacenTech.Kernel.Application;

/// <summary>
/// Mỗi module là một project, đăng ký service của mình qua đây. Host gom `Assembly` để:
/// - DbContext duy nhất apply IEntityTypeConfiguration của mọi module (MOD-05);
/// - worker quét IIntegrationEventHandler / IJobHandler.
/// </summary>
public interface IModule
{
    string Name { get; }
    string Schema { get; }
    Assembly Assembly { get; }
    void ConfigureServices(IServiceCollection services, IConfiguration configuration);
}
