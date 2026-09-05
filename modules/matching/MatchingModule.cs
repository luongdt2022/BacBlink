using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Contracts.Events;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Matching.Application;
using NacenTech.Modules.Matching.Infrastructure;

namespace NacenTech.Modules.Matching;

public sealed class MatchingModule : IModule
{
    public const string SchemaName = "matching";

    public string Name => "matching";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(MatchingModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MatchingOptions>(configuration.GetSection(MatchingOptions.Section));
        services.AddScoped<IMatchingService, MatchingService>();
        services.AddScoped<ITextChunker, RecursiveCharacterTextChunker>();
        services.AddScoped<IMatchingImporter, Infrastructure.MatchingImporter>();

        services.AddHttpClient<IEmbeddingClient, RagEmbeddingClient>((sp, http) =>
        {
            var url = configuration[$"{MatchingOptions.Section}:EmbeddingBaseUrl"] ?? "http://localhost:8003";
            http.BaseAddress = new Uri(url);
            http.Timeout = TimeSpan.FromSeconds(120);
        });
        services.AddHttpClient<IReranker, RagRerankClient>((sp, http) =>
        {
            var url = configuration[$"{MatchingOptions.Section}:EmbeddingBaseUrl"] ?? "http://localhost:8003";
            http.BaseAddress = new Uri(url);
            http.Timeout = TimeSpan.FromSeconds(180); // lần gọi đầu nạp mô hình reranker
        });
        // ADR-0010: chỉ mục tìm kiếm nằm trong PostgreSQL, cùng DbContext và cùng giao dịch với nội dung.
        services.AddScoped<ISearchIndex>(sp => new PostgresSearchIndex(sp.GetRequiredService<Microsoft.EntityFrameworkCore.DbContext>()));

        // Jobs (thay BullMQ ai-queue/intakes-queue)
        services.AddScoped<IJobHandler<ChunkEmbedJob>, ChunkEmbedJobHandler>();
        services.AddScoped<IJobHandler<ComputeMatchesJob>, ComputeMatchesJobHandler>();
        services.AddScoped<IJobHandler<RebuildSearchIndexJob>, RebuildSearchIndexJobHandler>();

        // Event handlers
        services.AddScoped<IIntegrationEventHandler<SubjectContentChanged>, SubjectEventsHandler>();
        services.AddScoped<IIntegrationEventHandler<SubjectPublished>, SubjectEventsHandler>();
        services.AddScoped<IIntegrationEventHandler<SubjectUnpublished>, SubjectEventsHandler>();
        services.AddScoped<IIntegrationEventHandler<SubjectDeleted>, SubjectEventsHandler>();
    }
}
