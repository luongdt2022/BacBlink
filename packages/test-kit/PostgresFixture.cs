using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Persistence;
using Testcontainers.PostgreSql;
using Xunit;

namespace NacenTech.TestKit;

/// <summary>
/// PostgreSQL thật trong container cho integration/invariant test — schema, `uuid[]`, `jsonb`, ILIKE
/// và `FOR UPDATE SKIP LOCKED` không mô phỏng được bằng in-memory provider.
/// Đặt `NACENTECH_TEST_PG` để dùng một PostgreSQL sẵn có thay vì khởi container.
/// </summary>
public sealed class PostgresFixture : IAsyncLifetime
{
    private PostgreSqlContainer? _container;

    public string ConnectionString { get; private set; } = string.Empty;

    public async Task InitializeAsync()
    {
        var external = Environment.GetEnvironmentVariable("NACENTECH_TEST_PG");
        if (!string.IsNullOrWhiteSpace(external))
        {
            ConnectionString = external;
        }
        else
        {
            _container = new PostgreSqlBuilder()
                .WithImage("pgvector/pgvector:pg16") // ADR-0010: cần extension `vector`
                .WithDatabase("nacentech_test")
                .WithUsername("postgres")
                .WithPassword("postgres")
                .Build();
            await _container.StartAsync();
            ConnectionString = _container.GetConnectionString();
        }

        await using var provider = BuildProvider();
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
        await db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        if (_container is not null) await _container.DisposeAsync();
    }

    /// <summary>Provider có đầy đủ module; actor/clock là bản test thay đổi được.</summary>
    public ServiceProvider BuildProvider(TestActor? actor = null, TestClock? clock = null,
        IDictionary<string, string?>? settings = null, Action<IServiceCollection>? configure = null)
    {
        var values = new Dictionary<string, string?>
        {
            ["ConnectionStrings:Postgres"] = ConnectionString,
            ["Authorization:RuleSetPath"] = "config/policies/authorization-rules.v1.json",
            ["Auth:SigningKey"] = "test-signing-key-at-least-32-bytes-long-0123456789",
            ["Auth:FrontendUrl"] = "http://localhost:5173",
            ["ObjectStorage:RootPath"] = Path.Combine(Path.GetTempPath(), "nacentech-test-storage", Guid.NewGuid().ToString("N")),
            ["ObjectStorage:PublicBaseUrl"] = "http://localhost:5000",
            ["Mail:DryRun"] = "true",
            ["Matching:ScoringMode"] = "LEGACY_SCORING",
        };
        if (settings is not null) foreach (var (k, v) in settings) values[k] = v;
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(values).Build();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddNacenTechPlatform(configuration);
        services.AddSingleton<ICurrentActor>(actor ?? new TestActor());
        if (clock is not null) services.AddSingleton<IClock>(clock);
        // Đăng ký sau nền tảng để ghi đè (DI lấy đăng ký cuối): sidecar giả cho test đường ghép cặp.
        configure?.Invoke(services);
        return services.BuildServiceProvider();
    }
}

[CollectionDefinition(Name)]
public sealed class PostgresCollection : ICollectionFixture<PostgresFixture>
{
    public const string Name = "postgres";
}
