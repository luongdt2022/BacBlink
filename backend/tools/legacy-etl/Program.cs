using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NacenTech.Kernel.Application;
using NacenTech.Persistence;
using NacenTech.Tools.LegacyEtl;
using Serilog;

// Công cụ ETL một lần của runbook cutover §30.2. Chạy được lặp lại (idempotent) để diễn tập nhiều lần.
//   dotnet run --project tools/legacy-etl -- --Etl:DryRun=true
var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSerilog((sp, cfg) => cfg.ReadFrom.Configuration(builder.Configuration).Enrich.FromLogContext().WriteTo.Console());
builder.Services.Configure<EtlOptions>(builder.Configuration.GetSection(EtlOptions.Section));
builder.Services.AddNacenTechPlatform(builder.Configuration);
builder.Services.AddScoped<ICurrentActor>(_ => new SystemActor($"etl-{Guid.CreateVersion7():N}"));
builder.Services.AddSingleton<EtlRunner>();

using var host = builder.Build();
var options = host.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<EtlOptions>>().Value;

if (string.IsNullOrWhiteSpace(options.SourceConnectionString))
{
    Console.Error.WriteLine("Thiếu Etl:SourceConnectionString (PostgreSQL của NacenTwin).");
    return 2;
}

var runner = host.Services.GetRequiredService<EtlRunner>();
var report = await runner.RunAsync(CancellationToken.None);

Directory.CreateDirectory(options.ReportPath);
var stamp = DateTimeOffset.UtcNow.ToString("yyyyMMdd-HHmmss");
var jsonPath = Path.Combine(options.ReportPath, $"reconciliation-{stamp}.json");
var textPath = Path.Combine(options.ReportPath, $"reconciliation-{stamp}.txt");
await File.WriteAllTextAsync(jsonPath, report.ToJson());
await File.WriteAllTextAsync(textPath, report.ToText());

Console.WriteLine();
Console.WriteLine(report.ToText());
Console.WriteLine();
Console.WriteLine($"Report: {jsonPath}");

// Exit code khác 0 khi report chưa sạch — runbook §30.2 không cho cutover trong trạng thái đó.
return report.IsClean ? 0 : 1;
