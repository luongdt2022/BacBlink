using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Demand.Application;

namespace NacenTech.Modules.Demand;

public sealed class DemandModule : IModule
{
    public const string SchemaName = "demand";

    public string Name => "demand";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(DemandModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IDemandService, DemandService>();
        services.AddScoped<ISubjectSummaryProvider, DemandSubjectProvider>();
        services.AddScoped<ISubjectContentProvider, DemandSubjectProvider>();
        services.AddScoped<IDemandImporter, Infrastructure.DemandImporter>();
        services.AddScoped<IIntegrationEventHandler<Contracts.Events.SubjectChunkingCompleted>, DemandChunkingStatusHandler>();
    }
}
