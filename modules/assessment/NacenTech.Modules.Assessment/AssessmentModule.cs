using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using NacenTech.Kernel.Application;
using Microsoft.AspNetCore.Routing;
using System.Reflection;

namespace NacenTech.Modules.Assessment;

public class AssessmentModule : IModule
{
    public string Name => "Assessment";
    public string Schema => "assessment";
    public Assembly Assembly => typeof(AssessmentModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
    }
}
