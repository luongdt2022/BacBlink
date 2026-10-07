using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Application;

namespace NacenTech.Api.Infrastructure;

/// <summary>
/// Map DomainException → HTTP. Hai kiểu body:
/// - `/api/v2/*`: RFC 9457 problem details (§22.1).
/// - `/api/v1/*` (facade): shape NestJS để portal hiện có không phải sửa —
///   {code,message} khi code thuộc AuthResponseKey legacy; ngược lại {statusCode,message,error}.
/// </summary>
public static class ErrorHandling
{
    private static readonly HashSet<string> LegacyObjectCodes = new(StringComparer.Ordinal)
    {
        AuthCodes.InvalidCredentials, AuthCodes.AccountNotActivated, AuthCodes.EmailAlreadyInUse, AuthCodes.ConfirmPasswordMismatch,
        AuthCodes.ActivationTokenInvalid, AuthCodes.AccountNotFound, AuthCodes.RegisterRateLimited, AuthCodes.ResendRateLimited,
        AuthCodes.CurrentPasswordIncorrect, AuthCodes.LoginRateLimited, AuthCodes.ForgotPasswordRateLimited, AuthCodes.ResetPasswordTokenInvalid,
    };

    public static (int Status, string Title) StatusOf(Exception ex) => ex switch
    {
        ValidationException => (400, "Bad Request"),
        UnauthorizedException => (401, "Unauthorized"),
        ForbiddenException => (403, "Forbidden"),
        NotFoundException => (404, "Not Found"),
        ConflictException => (409, "Conflict"),
        ConcurrencyException => (409, "Conflict"),
        RecordAlreadyModifiedException => (409, "Conflict"),
        UnprocessableException => (422, "Unprocessable Entity"),
        RateLimitedException => (429, "Too Many Requests"),
        BadHttpRequestException b => (b.StatusCode, "Bad Request"),
        _ => (500, "Internal Server Error"),
    };

    public static object LegacyBody(Exception ex, int status, string title)
    {
        if (ex is DomainException de && LegacyObjectCodes.Contains(de.Code))
            return new { code = de.Code, message = de.Message };
        if (ex is ValidationException ve && ve.Errors.Count > 1)
            return new { statusCode = status, message = ve.Errors, error = title };
        var message = status == 500 ? "Internal server error" : ex.Message;
        return new { statusCode = status, message, error = title };
    }

    public static ProblemDetails Problem(Exception ex, int status, string title, HttpContext ctx)
    {
        var pd = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = status == 500 ? "Lỗi nội bộ. Mã tương quan đã được ghi log." : ex.Message,
            Instance = ctx.Request.Path,
        };
        pd.Extensions["correlationId"] = ctx.TraceIdentifier;
        if (ex is DomainException de) pd.Extensions["code"] = de.Code;
        if (ex is ForbiddenException fe && fe.RuleId is not null) pd.Extensions["ruleId"] = fe.RuleId;
        if (ex is ConcurrencyException ce) pd.Extensions["currentVersion"] = ce.CurrentVersion;
        if (ex is ValidationException ve) pd.Extensions["errors"] = ve.Errors;
        return pd;
    }
}

public sealed class ApiExceptionMiddleware(RequestDelegate next, ILogger<ApiExceptionMiddleware> log)
{
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await next(ctx);
        }
        catch (Exception ex) when (!ctx.Response.HasStarted)
        {
            var (status, title) = ErrorHandling.StatusOf(ex);
            if (status >= 500) log.LogError(ex, "Unhandled error {Path} corr={Corr}", ctx.Request.Path, ctx.TraceIdentifier);
            else log.LogInformation("Request error {Status} {Path}: {Message}", status, ctx.Request.Path, ex.Message);

            ctx.Response.Clear();
            ctx.Response.StatusCode = status;
            if (ctx.Request.Path.StartsWithSegments("/api/v1"))
            {
                ctx.Response.ContentType = "application/json; charset=utf-8";
                await ctx.Response.WriteAsync(JsonSerializer.Serialize(ErrorHandling.LegacyBody(ex, status, title), Json));
            }
            else
            {
                ctx.Response.ContentType = "application/problem+json; charset=utf-8";
                await ctx.Response.WriteAsync(JsonSerializer.Serialize(ErrorHandling.Problem(ex, status, title, ctx), Json));
            }
        }
    }
}
