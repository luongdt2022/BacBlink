using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using NacenTech.Contracts.Canonical;
using NacenTech.Kernel.Application;
using NacenTech.Persistence;
using NacenTech.Persistence.Platform;

namespace NacenTech.Api.Infrastructure;

/// <summary>
/// §22.1: `Idempotency-Key` bắt buộc với mọi command ghi trên /api/v2. Kết quả lưu kèm key; retry trả cùng response.
/// Cùng key nhưng body khác → 422. Chỉ áp cho /api/v2 (facade v1 giữ hành vi legacy).
/// </summary>
public sealed class IdempotencyMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext ctx, NacenTechDbContext db, ICurrentActor actor)
    {
        var isCommand = HttpMethods.IsPost(ctx.Request.Method) || HttpMethods.IsPut(ctx.Request.Method) || HttpMethods.IsPatch(ctx.Request.Method) || HttpMethods.IsDelete(ctx.Request.Method);
        if (!isCommand || !ctx.Request.Path.StartsWithSegments("/api/v2"))
        {
            await next(ctx);
            return;
        }

        var key = ctx.Request.Headers["Idempotency-Key"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(key))
        {
            ctx.Response.StatusCode = 428;
            ctx.Response.ContentType = "application/problem+json";
            await ctx.Response.WriteAsync("""{"status":428,"title":"Precondition Required","detail":"Thiếu header Idempotency-Key (§22.1)."}""");
            return;
        }
        if (key.Length > 200) key = key[..200];

        ctx.Request.EnableBuffering();
        string bodyHash;
        using (var ms = new MemoryStream())
        {
            await ctx.Request.Body.CopyToAsync(ms);
            ctx.Request.Body.Position = 0;
            bodyHash = Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(ctx.Request.Method + " " + ctx.Request.Path + "\n").Concat(ms.ToArray()).ToArray()));
        }

        var scopedKey = $"{actor.PersonId?.ToString() ?? "anon"}:{key}";
        var existing = await db.IdempotencyRecords.AsNoTracking().FirstOrDefaultAsync(r => r.Key == scopedKey);
        if (existing is not null)
        {
            if (existing.RequestHash != bodyHash)
            {
                ctx.Response.StatusCode = 422;
                ctx.Response.ContentType = "application/problem+json";
                await ctx.Response.WriteAsync("""{"status":422,"title":"Unprocessable Entity","detail":"Idempotency-Key đã dùng cho một request khác."}""");
                return;
            }
            ctx.Response.StatusCode = existing.StatusCode;
            ctx.Response.Headers["Idempotent-Replayed"] = "true";
            if (existing.ResponseBody is not null)
            {
                ctx.Response.ContentType = "application/json; charset=utf-8";
                await ctx.Response.WriteAsync(existing.ResponseBody);
            }
            return;
        }

        var original = ctx.Response.Body;
        await using var buffer = new MemoryStream();
        ctx.Response.Body = buffer;
        try
        {
            await next(ctx);
            buffer.Position = 0;
            var body = await new StreamReader(buffer).ReadToEndAsync();
            if (ctx.Response.StatusCode < 500)
            {
                db.IdempotencyRecords.Add(new IdempotencyRecord
                {
                    Key = scopedKey,
                    ActorRef = actor.PersonId,
                    RequestHash = bodyHash,
                    StatusCode = ctx.Response.StatusCode,
                    ResponseBody = string.IsNullOrEmpty(body) ? null : body,
                    CreatedAt = DateTimeOffset.UtcNow,
                });
                try { await db.SaveChangesAsync(); } catch (DbUpdateException) { /* race: bản ghi khác đã lưu cùng key */ }
            }
            buffer.Position = 0;
            await buffer.CopyToAsync(original);
        }
        finally
        {
            ctx.Response.Body = original;
        }
    }
}
