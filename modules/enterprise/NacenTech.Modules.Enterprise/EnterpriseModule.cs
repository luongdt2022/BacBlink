using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Enterprise.Application;
using NacenTech.Modules.Enterprise.Infrastructure.Persistence;

namespace NacenTech.Modules.Enterprise;

public sealed class EnterpriseModule : IModule
{
    public string Name => "Enterprise";
    public string Schema => "enterprise";
    public Assembly Assembly => typeof(EnterpriseModule).Assembly;
    
    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IEnterpriseRepository, EfEnterpriseRepository>();
        services.AddScoped<IEnterpriseService, EnterpriseService>();
        services.AddScoped<IEnterpriseApprovalSynchronizer, EnterpriseApprovalSynchronizer>();
    }
}
