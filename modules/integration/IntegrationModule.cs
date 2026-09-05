using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Contracts.Jobs;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Integration.Application;
using NacenTech.Modules.Integration.Infrastructure;

namespace NacenTech.Modules.Integration;

/// <summary>Adapter ra ngoài biên (§8.1 integration plane): object storage, SMTP, LLM provider. Không có bảng riêng.</summary>
public sealed class IntegrationModule : IModule
{
    public string Name => "integration";
    public string Schema => "integration";
    public Assembly Assembly => typeof(IntegrationModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<ObjectStorageOptions>(configuration.GetSection(ObjectStorageOptions.Section));
        services.Configure<MailOptions>(configuration.GetSection(MailOptions.Section));
        services.Configure<AiProviderOptions>(configuration.GetSection(AiProviderOptions.Section));

        services.AddSingleton<IObjectStorage, LocalDiskObjectStorage>();
        services.AddSingleton<IMailSender, SmtpMailSender>();
        services.AddSingleton<IMailTemplateRenderer, EmbeddedMailTemplateRenderer>();
        services.AddHttpClient<ICompletionClient, OpenAiCompatibleCompletionClient>(http =>
        {
            http.Timeout = TimeSpan.FromSeconds(120);
        });
        services.AddScoped<IJobHandler<SendMailJob>, SendMailJobHandler>();
    }
}
