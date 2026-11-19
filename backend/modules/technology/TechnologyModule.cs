using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Technology.Application;

namespace NacenTech.Modules.Technology;

public sealed class TechnologyModule : IModule
{
    public const string SchemaName = "technology";

    public string Name => "technology";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(TechnologyModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ITechnologyService, TechnologyService>();
        services.AddScoped<ISubjectSummaryProvider, TechnologySubjectProvider>();
        services.AddScoped<ISubjectContentProvider, TechnologySubjectProvider>();
        services.AddScoped<ITechnologyImporter, Infrastructure.TechnologyImporter>();
        services.AddScoped<IIntegrationEventHandler<Contracts.Events.SubjectChunkingCompleted>, TechnologyChunkingStatusHandler>();
    }
}
