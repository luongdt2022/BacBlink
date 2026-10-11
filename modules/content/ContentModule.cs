using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Content.Application;

namespace NacenTech.Modules.Content;

/// <summary>Stories (câu chuyện thành công/thất bại) — content/read model theo §30.1; xem ADR-0002.</summary>
public sealed class ContentModule : IModule
{
    public const string SchemaName = "content";

    public string Name => "content";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(ContentModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IStoryService, StoryService>();
        services.AddScoped<ITechmartEventService, TechmartEventService>();
        services.AddScoped<IAiAssistantService, AiAssistantService>();
        services.AddScoped<IContentImporter, Infrastructure.ContentImporter>();
    }
}
