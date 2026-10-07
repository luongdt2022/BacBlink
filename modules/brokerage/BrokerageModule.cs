using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Brokerage.Application;

namespace NacenTech.Modules.Brokerage;

public sealed class BrokerageModule : IModule
{
    public const string SchemaName = "brokerage";

    public string Name => "brokerage";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(BrokerageModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IBrokerService, BrokerService>();
        services.AddScoped<IExpertService, ExpertService>();
        services.AddScoped<IExpertApprovalSynchronizer, ExpertApprovalSynchronizer>();
    }
}
