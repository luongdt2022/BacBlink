using NacenTech.Kernel.Application;
using NacenTech.Persistence;
using Serilog;

// Worker deployment (§26.1): outbox dispatcher, job queue, scheduled obligations. Không nhận HTTP.
var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSerilog((sp, cfg) => cfg.ReadFrom.Configuration(builder.Configuration).Enrich.FromLogContext().WriteTo.Console());
builder.Services.AddNacenTechPlatform(builder.Configuration);
builder.Services.AddScoped<ICurrentActor>(_ => new SystemActor(Guid.NewGuid().ToString("N")));
builder.Services.AddNacenTechWorkers();

var host = builder.Build();
await host.RunAsync();
