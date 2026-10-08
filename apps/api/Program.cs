using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NacenTech.Api.Infrastructure;
using NacenTech.Api.V1Compat;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Persistence;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Observability (§26.2): Serilog console + OpenTelemetry (OTLP exporter bật qua OTEL_EXPORTER_OTLP_ENDPOINT).
builder.Host.UseSerilog((ctx, cfg) => cfg.ReadFrom.Configuration(ctx.Configuration).Enrich.FromLogContext().WriteTo.Console());
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation().AddOtlpExporter())
    .WithMetrics(m => m.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation().AddOtlpExporter());

builder.Services.Configure<ApiOptions>(builder.Configuration.GetSection(ApiOptions.Section));
builder.Services.Configure<CorsOptions>(builder.Configuration.GetSection(CorsOptions.Section));

// Platform: DbContext duy nhất, UnitOfWork, policy engine, toàn bộ module.
builder.Services.AddNacenTechPlatform(builder.Configuration);
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentActor, HttpCurrentActor>();
if (builder.Configuration.GetValue<bool>("Api:RunWorkersInProcess")) builder.Services.AddNacenTechWorkers();

// Auth: JwtBearer validate token do identity module phát hành. Legacy JWT (NestJS) vô hiệu vì khác key (D2-150).
var auth = builder.Configuration.GetSection(AuthOptions.Section).Get<AuthOptions>() ?? new AuthOptions();
if (string.IsNullOrWhiteSpace(auth.SigningKey) || Encoding.UTF8.GetByteCount(auth.SigningKey) < 32)
    throw new InvalidOperationException("Auth:SigningKey phải được cấu hình (≥ 32 byte). Không có fallback secret.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o =>
{
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = auth.Issuer,
        ValidateAudience = true,
        ValidAudience = auth.Audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(auth.SigningKey)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(30),
        NameClaimType = "sub",
        RoleClaimType = "role",
    };
    o.MapInboundClaims = false;
    o.Events = new JwtBearerEvents
    {
        // Legacy: JwtStrategy.validate tải user và từ chối nếu inactive.
        OnTokenValidated = async ctx =>
        {
            var sub = ctx.Principal?.FindFirst("sub")?.Value;
            if (!Guid.TryParse(sub, out var id)) { ctx.Fail("invalid sub"); return; }
            var persons = ctx.HttpContext.RequestServices.GetRequiredService<IPersonService>();
            if (!await persons.IsActiveAsync(id, ctx.HttpContext.RequestAborted)) ctx.Fail("inactive");
        },
    };
});
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("Admin", p => p.RequireAuthenticatedUser().RequireClaim("role", "ADMIN"));

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
{
    // B-41: trình duyệt coi `localhost` và `127.0.0.1` là hai origin khác nhau, và Vite in CẢ HAI ra terminal
    // khi khởi động — nên mặc định phát triển phải nhận cả hai, cho cả ba client (5173 cổng, 5174 quản trị,
    // 5175 trang giới thiệu). Thiếu một dạng thì mọi lời gọi fail với net::ERR_FAILED, không mã trạng thái,
    // không thân lỗi, và triệu chứng trông hệt như "backend chết".
    var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ??
    [
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
        "http://localhost:3000", "http://127.0.0.1:3000",
        "https://h5.zdn.vn", "https://mini.zalo.me",
    ];
    p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithExposedHeaders("Deprecation", "Sunset", "Link", "ETag");
}));

builder.Services.AddControllers(o =>
{
    o.Filters.Add<V1ValidationFilter>();
}).ConfigureApiBehaviorOptions(o => o.SuppressModelStateInvalidFilter = true)
  .AddJsonOptions(o =>
  {
      o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
      o.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never;
      o.JsonSerializerOptions.Converters.Add(new JsDateTimeOffsetConverter());
      o.JsonSerializerOptions.Converters.Add(new NullableJsDateTimeOffsetConverter());
  });
// Hai tài liệu riêng. Trước đây có đúng một document tên "v2" chứa toàn đường /api/v1, nên "0 endpoint v2"
// đọc thành "76 endpoint v2" với bất kỳ ai mở tài liệu ra xem — đó là nửa sau của B-01, và nó đã làm cả một
// đợt rà tin rằng v2 đã tồn tại. Tên tài liệu phải nói đúng cái nó chứa.
// Tài liệu v1 lấy "mọi thứ không phải v2" chứ không lấy "mọi thứ bắt đầu bằng api/v1": bề mặt cũ còn hai đường
// cố ý nằm ngoài tiền tố đó — `/files/{key}` phục vụ nội dung tệp tại đúng địa chỉ đã nhúng trong nội dung, và
// hai đường health. Lọc theo tiền tố dương sẽ làm chúng biến mất khỏi cả hai tài liệu.
builder.Services.AddOpenApi("v1", o => o.ShouldInclude = d => d.RelativePath?.StartsWith("api/v2", StringComparison.Ordinal) != true);
builder.Services.AddOpenApi("v2", o => o.ShouldInclude = d => d.RelativePath?.StartsWith("api/v2", StringComparison.Ordinal) == true);
builder.Services.AddProblemDetails();
builder.Services.AddRateLimiter(options => {
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("expert-draft", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 20, Window = TimeSpan.FromMinutes(1), QueueLimit = 0, AutoReplenishment = true }));
});
builder.Services.Configure<FormOptions>(o => o.MultipartBodyLengthLimit = 12 * 1024 * 1024);
builder.Services.AddScoped<V1Mappers>();
builder.Services.AddScoped<IntakeFacade>();
builder.Services.AddScoped<StatsReadModel>();
builder.Services.AddScoped<BeautifyService>();

var app = builder.Build();

app.UseSerilogRequestLogging();
app.UseMiddleware<ApiExceptionMiddleware>();
app.UseCors();
app.UseMiddleware<V1SunsetMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.UseMiddleware<IdempotencyMiddleware>();

app.MapOpenApi("/openapi/{documentName}.json");
if (app.Configuration.GetValue<bool>("Api:EnableSwaggerUi"))
{
    app.UseSwaggerUI(o =>
    {
        o.SwaggerEndpoint("/openapi/v2.json", "NacenTech API v2");
        o.SwaggerEndpoint("/openapi/v1.json", "NacenTech API v1 (facade, sunset 31/03/2027)");
        o.RoutePrefix = "docs";
    });
}

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok", timestamp = DateTimeOffset.UtcNow }));
app.MapGet("/api/v1/health", () => Results.Ok(new { status = "ok", timestamp = DateTimeOffset.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'") }));
app.MapGet("/health/ready", async (NacenTechDbContext db, CancellationToken ct) =>
    await db.Database.CanConnectAsync(ct) ? Results.Ok(new { status = "ready" }) : Results.StatusCode(503));

// Tự apply migration khi được bật (dev/docker). Production dùng runbook §30.2, không tự migrate lúc khởi động.
if (app.Configuration.GetValue<bool>("Api:MigrateOnStartup"))
{
    using var scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<NacenTechDbContext>().Database.MigrateAsync();
}

// Fixture local E2E: chỉ bật rõ ràng trong Development, không nằm trong migration/production seed.
if (app.Environment.IsDevelopment() && app.Configuration.GetValue<bool>("Demo:SeedExpert"))
{
    using var scope = app.Services.CreateScope();
    await DevelopmentExpertFixture.SeedAsync(scope.ServiceProvider, app.Configuration, app.Environment);
}

app.Run();

public partial class Program;
