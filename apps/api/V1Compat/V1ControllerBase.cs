using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Api.V1Compat;

/// <summary>
/// Facade tương thích NestJS `/api/v1` (D2-148). Mọi controller ở đây chỉ gọi public application interface
/// của module (MOD-02) và tái tạo shape/status code legacy. Không có schema riêng, không nhận endpoint mới.
/// </summary>
[ApiController]
[Produces("application/json")]
public abstract class V1ControllerBase : ControllerBase
{
    protected ICurrentActor Actor => HttpContext.RequestServices.GetRequiredService<ICurrentActor>();

    protected Guid PersonId => Actor.RequirePersonId();

    /// <summary>Legacy AdminAuthGuard: 403 "Admin access required".</summary>
    protected void RequireAdmin()
    {
        if (Actor.PlatformRole != PlatformRoles.Admin) throw new ForbiddenException("Admin access required");
    }

    protected static object Ok200(object data) => new { success = true, data };

    protected static object Paged<T>(PagedResult<T> page, IReadOnlyList<object> data) => new
    {
        success = true,
        data,
        total = page.Total,
        page = page.Page,
        limit = page.Limit,
        totalPages = page.TotalPages,
    };
}

/// <summary>
/// ModelState → 400 NestJS ValidationPipe shape: {statusCode:400, message:[...], error:"Bad Request"}.
/// </summary>
public sealed class V1ValidationFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (context.ModelState.IsValid) return;
        var messages = context.ModelState
            .Where(kv => kv.Value is { Errors.Count: > 0 })
            .SelectMany(kv => kv.Value!.Errors.Select(e => string.IsNullOrEmpty(e.ErrorMessage) ? $"{kv.Key} is invalid" : e.ErrorMessage))
            .ToList();
        if (context.HttpContext.Request.Path.StartsWithSegments("/api/v1"))
        {
            context.Result = new ObjectResult(new { statusCode = 400, message = messages, error = "Bad Request" }) { StatusCode = 400 };
        }
        else
        {
            context.Result = new ObjectResult(new ProblemDetails { Status = 400, Title = "Bad Request", Detail = string.Join("; ", messages) }) { StatusCode = 400 };
        }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}
