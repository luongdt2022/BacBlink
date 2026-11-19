using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Policy.Application;

namespace NacenTech.Modules.Policy;

public sealed class PolicyModule : IModule
{
    public const string SchemaName = "policy";

    public string Name => "policy";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(PolicyModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ITaxonomyService, TaxonomyService>();
        services.AddScoped<ITaxonomyNameResolver, TaxonomyService>();
        services.AddScoped<ITaxonomyImporter, Infrastructure.TaxonomyImporter>();
        services.AddScoped<IPolicySnapshotService, PolicySnapshotService>();
        services.AddScoped<IPolicySnapshotResolver, PolicySnapshotService>();
    }
}
