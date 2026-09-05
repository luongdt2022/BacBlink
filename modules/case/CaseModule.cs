using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Case.Application;

namespace NacenTech.Modules.Case;

public sealed class CaseModule : IModule
{
    public const string SchemaName = "casework";

    public string Name => "case";
    /// <summary>`case` là từ khóa SQL nên schema dùng tên `casework`.</summary>
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(CaseModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ICaseService, CaseService>();
        services.AddScoped<ISubjectSummaryProvider, CaseSubjectProvider>();
    }
}
