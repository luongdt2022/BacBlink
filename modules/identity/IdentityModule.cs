using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Infrastructure;

namespace NacenTech.Modules.Identity;

public sealed class IdentityModule : IModule
{
    public const string SchemaName = "identity";

    public string Name => "identity";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(IdentityModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AuthOptions>(configuration.GetSection(AuthOptions.Section));
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        services.AddScoped<IPersonService, PersonService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ITokenIssuer, JwtTokenIssuer>();
        services.AddScoped<IPersonDirectory, PersonDirectory>();
        services.AddScoped<IMatchingPreferenceProvider, PersonDirectory>();
        services.AddScoped<IIdentityImporter, IdentityImporter>();
    }
}
