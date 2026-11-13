using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Lms.Application;
using NacenTech.Modules.Lms.Infrastructure;

namespace NacenTech.Modules.Lms;

public sealed class LmsModule : IModule
{
    public const string SchemaName = "lms";

    public string Name => "lms";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(LmsModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ILmsManagementService, LmsManagementService>();
        services.AddScoped<ILmsMediaService, LmsMediaService>();
        services.AddScoped<ILmsRagIndexer, LmsRagIndexer>();
        services.AddScoped<ILmsCatalogService, LmsCatalogService>();
        services.AddScoped<IExpertLmsCourseLookup, ExpertLmsCourseLookup>();
    }
}
