using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NacenTech.Kernel;
using NacenTech.Kernel.Application;
using NacenTech.Persistence.Workers;
using NacenTech.PolicyEngine;

namespace NacenTech.Persistence;

public static class PersistenceServiceCollectionExtensions
{
    /// <summary>
    /// Đăng ký DbContext duy nhất, UnitOfWork/Outbox/JobQueue, DecisionTable, gate và toàn bộ module.
    /// Host chỉ cần thêm ICurrentActor của riêng nó (HTTP hoặc System).
    /// </summary>
    public static IServiceCollection AddNacenTechPlatform(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddNacenTechKernel();

        var cs = configuration.GetConnectionString("Postgres")
                 ?? throw new InvalidOperationException("Thiếu ConnectionStrings:Postgres");
        void Configure(DbContextOptionsBuilder o)
        {
            o.UseNpgsql(cs, npg =>
            {
                npg.MigrationsHistoryTable("__ef_migrations_history", NacenTechDbContext.PlatformSchema);
                npg.EnableRetryOnFailure(3);
            });
            o.UseQueryTrackingBehavior(QueryTrackingBehavior.TrackAll);
            o.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }

        // optionsLifetime singleton để factory (singleton) và DbContext (scoped) dùng chung một options bất biến.
        services.AddDbContext<NacenTechDbContext>(Configure, optionsLifetime: ServiceLifetime.Singleton);
        // Factory cho audit: context ngắn hạn, transaction riêng, sống sót qua rollback của command.
        services.AddDbContextFactory<NacenTechDbContext>(Configure, lifetime: ServiceLifetime.Singleton);
        services.AddScoped<IAuditWriter, IsolatedAuditWriter>();
        // Cùng lý do dùng factory: nghĩa vụ định kỳ được xếp từ tầng khởi động, nơi chưa có scope nào.
        services.AddSingleton<IObligationScheduler, ObligationScheduler>();

        // Module chỉ biết DbContext trừu tượng (không subclass, không context riêng — MOD-05).
        services.AddScoped<DbContext>(sp => sp.GetRequiredService<NacenTechDbContext>());
        services.AddScoped<EfUnitOfWork>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<EfUnitOfWork>());
        services.AddScoped<IOutbox>(sp => sp.GetRequiredService<EfUnitOfWork>());
        services.AddScoped<IJobQueue>(sp => sp.GetRequiredService<EfUnitOfWork>());

        // Policy engine: rule set versioned từ file cấu hình (§9.4.3).
        var rulesPath = configuration["Authorization:RuleSetPath"] ?? "config/policies/authorization-rules.v1.json";
        services.AddSingleton(_ => new DecisionTable(RuleSetLoader.FromFile(ResolvePath(rulesPath))));
        services.AddScoped<IAuthorizationGate, DefaultAuthorizationGate>();

        // ADR-0014: tập luật công cụ tài chính, cùng khuôn versioned. Nạp ở tầng khởi động chứ không lười — một
        // dòng thiếu `legalBasisRef` phải làm hỏng lúc khởi động, không phải lúc hồ sơ đầu tiên vào QUALIFICATION.
        var fundingPath = configuration["Funding:PolicySetPath"] ?? "config/policies/funding-instruments.v1.json";
        services.AddSingleton(FundingPolicyLoader.FromFile(ResolvePath(fundingPath)));

        var assemblies = ModuleRegistry.All.Select(m => m.Assembly).Append(typeof(Contracts.Canonical.CanonicalJson).Assembly).ToList();
        services.AddSingleton(new TypeCatalog(assemblies));

        foreach (var module in ModuleRegistry.All)
        {
            services.AddSingleton(module);
            module.ConfigureServices(services, configuration);
        }

        return services;
    }

    public static IServiceCollection AddNacenTechWorkers(this IServiceCollection services)
    {
        services.AddHostedService<OutboxDispatcher>();
        services.AddHostedService<JobQueueWorker>();
        services.AddHostedService<ScheduledObligationWorker>();
        // Phải đứng sau ScheduledObligationWorker: nó chỉ tạo mục lịch, việc chạy là của worker ở trên.
        services.AddHostedService<RecurringObligationSeeder>();
        return services;
    }

    /// <summary>Tìm file cấu hình theo cwd rồi đi lên tới root solution (chạy từ bin/ hay từ repo đều được).</summary>
    public static string ResolvePath(string relative)
    {
        if (Path.IsPathRooted(relative) && File.Exists(relative)) return relative;
        var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (dir is not null)
        {
            var candidate = Path.Combine(dir.FullName, relative);
            if (File.Exists(candidate)) return candidate;
            dir = dir.Parent;
        }
        var baseDir = new DirectoryInfo(AppContext.BaseDirectory);
        while (baseDir is not null)
        {
            var candidate = Path.Combine(baseDir.FullName, relative);
            if (File.Exists(candidate)) return candidate;
            baseDir = baseDir.Parent;
        }
        throw new FileNotFoundException($"Không tìm thấy {relative}");
    }
}
