using Microsoft.Extensions.Options;

namespace NacenTech.Api.Infrastructure;

/// <summary>Thêm header Deprecation/Sunset cho /api/v1 (D2-148); sau sunset hoặc khi tắt → 410 Gone.</summary>
public sealed class V1SunsetMiddleware(RequestDelegate next, IOptions<ApiOptions> options)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        if (ctx.Request.Path.StartsWithSegments("/api/v1"))
        {
            var o = options.Value;
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (!o.V1CompatEnabled || (o.V1SunsetDate is { } d && today > d))
            {
                ctx.Response.StatusCode = StatusCodes.Status410Gone;
                ctx.Response.ContentType = "application/json; charset=utf-8";
                await ctx.Response.WriteAsync("""{"statusCode":410,"message":"API v1 đã ngừng (D2-148). Dùng /api/v2.","error":"Gone"}""");
                return;
            }
            ctx.Response.Headers["Deprecation"] = "true";
            if (o.V1SunsetDate is { } sunset) ctx.Response.Headers["Sunset"] = sunset.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc).ToString("R");
            ctx.Response.Headers["Link"] = "</api/v2>; rel=\"successor-version\"";
        }
        await next(ctx);
    }
}
