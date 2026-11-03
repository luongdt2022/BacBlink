using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NacenTech.Persistence;

/// <summary>Cho `dotnet ef migrations add` chạy không cần host. Connection string chỉ dùng để sinh migration.</summary>
public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<NacenTechDbContext>
{
    public NacenTechDbContext CreateDbContext(string[] args)
    {
        var cs = Environment.GetEnvironmentVariable("NACENTECH_PG")
                 ?? "Host=localhost;Port=5432;Database=nacentech;Username=postgres;Password=postgres";
        var options = new DbContextOptionsBuilder<NacenTechDbContext>()
            .UseNpgsql(cs, npg => npg.MigrationsHistoryTable("__ef_migrations_history", NacenTechDbContext.PlatformSchema))
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning))
            .Options;
        return new NacenTechDbContext(options);
    }
}
