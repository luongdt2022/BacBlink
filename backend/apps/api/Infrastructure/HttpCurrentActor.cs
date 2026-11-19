using System.Security.Claims;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Api.Infrastructure;

/// <summary>Actor từ JWT của request. PersonId là claim `sub`. Không đọc purpose/case role từ token (§23.2).</summary>
public sealed class HttpCurrentActor(IHttpContextAccessor accessor) : ICurrentActor
{
    private HttpContext? Ctx => accessor.HttpContext;

    public bool IsAuthenticated => Ctx?.User.Identity?.IsAuthenticated == true;

    public Guid? PersonId
    {
        get
        {
            var sub = Ctx?.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Ctx?.User.FindFirstValue("sub");
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    public string? Email => Ctx?.User.FindFirstValue(ClaimTypes.Email) ?? Ctx?.User.FindFirstValue("email");

    public string PlatformRole
    {
        get
        {
            if (!IsAuthenticated) return PlatformRoles.Anonymous;
            var role = Ctx?.User.FindFirstValue(ClaimTypes.Role) ?? Ctx?.User.FindFirstValue("role");
            return string.IsNullOrEmpty(role) ? PlatformRoles.User : role.ToUpperInvariant();
        }
    }

    public string ScopeType
    {
        get
        {
            if (!IsAuthenticated) return ScopeTypes.Global;
            var scope = Ctx?.User.FindFirstValue("scope_type");
            return string.IsNullOrEmpty(scope) ? ScopeTypes.Global : scope.ToUpperInvariant();
        }
    }

    public string? ScopeId
    {
        get
        {
            if (!IsAuthenticated) return null;
            var id = Ctx?.User.FindFirstValue("scope_id");
            return string.IsNullOrWhiteSpace(id) ? null : id;
        }
    }

    public string? IpAddress => Ctx is null ? null : ClientIp.Resolve(Ctx);

    public string? UserAgent => Ctx?.Request.Headers.UserAgent.ToString();

    public string CorrelationId => Ctx?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

    public Guid RequirePersonId() => PersonId ?? throw new UnauthorizedException("Yêu cầu đăng nhập");
}

/// <summary>Port `resolveClientIp` của NestJS: x-forwarded-for → forwarded → x-real-ip → remote.</summary>
public static class ClientIp
{
    public static string Resolve(HttpContext ctx)
    {
        var xff = Normalize(First(ctx.Request.Headers["x-forwarded-for"]));
        if (xff is not null) return xff;
        var fwd = ParseForwarded(First(ctx.Request.Headers["forwarded"]));
        if (fwd is not null) return fwd;
        var real = Normalize(First(ctx.Request.Headers["x-real-ip"]));
        if (real is not null) return real;
        return Normalize(ctx.Connection.RemoteIpAddress?.ToString()) ?? "unknown";
    }

    private static string? First(Microsoft.Extensions.Primitives.StringValues values)
    {
        var v = values.FirstOrDefault();
        return string.IsNullOrWhiteSpace(v) ? null : v.Trim();
    }

    private static string? Normalize(string? ip)
    {
        if (string.IsNullOrWhiteSpace(ip)) return null;
        var v = ip.Trim();
        if (v.Contains(',')) return Normalize(v.Split(',')[0]);
        if (v == "::1") return "127.0.0.1";
        if (v.StartsWith('[') && v.EndsWith(']')) return Normalize(v[1..^1]);
        if (v.StartsWith("::ffff:", StringComparison.OrdinalIgnoreCase)) return v[7..];
        return v;
    }

    private static string? ParseForwarded(string? header)
    {
        if (header is null) return null;
        var first = header.Split(',')[0].Trim();
        var m = System.Text.RegularExpressions.Regex.Match(first, "for=(?:\"?)(\\[?[^\\s;,\"\\\\]+\\]?)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        return m.Success ? Normalize(m.Groups[1].Value) : null;
    }
}
