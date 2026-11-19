using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Contracts.Jobs;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Integration.Application;
using NacenTech.Modules.Integration.Infrastructure;

namespace NacenTech.Modules.Integration;

/// <summary>
/// Adapter ra ngoài biên (§8.1 integration plane): object storage, SMTP, LLM provider, và từ ADR-0011 là
/// nguồn dữ liệu ngoài có lineage (`source_records`, `demand_signals`).
/// </summary>
public sealed class IntegrationModule : IModule
{
    public const string SchemaName = "integration";

    public string Name => "integration";
    public string Schema => SchemaName;
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

        // ADR-0011: nguồn tín hiệu ngoài. Adapter kéo dữ liệu **chưa** có ở đây — nó bị chặn bởi cổng license
        // và cổng pháp lý của ADR. Cửa nạp thì có, để đường dữ liệu được kiểm chứng bằng test trước khi có hợp đồng.
        services.AddScoped<ISignalIngestService, SignalIngestService>();
    }
}
