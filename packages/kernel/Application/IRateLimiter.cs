using Microsoft.Extensions.Caching.Memory;
using NacenTech.Kernel.Domain;

namespace NacenTech.Kernel.Application;

/// <summary>
/// Giới hạn tần suất theo khóa (email/IP) cho register/login/resend/forgot (§23.3, CHUẨN 26.1.8).
/// Bản in-memory đủ cho một instance API; khi scale ngang thay bằng Valkey (§26.2) sau cùng interface.
/// </summary>
public interface IRateLimiter
{
    /// <summary>Ném RateLimitedException(code) khi vượt `max` lần trong `window`.</summary>
    void Assert(string key, int max, TimeSpan window, string code, string message);
}

public sealed class InMemoryRateLimiter(IMemoryCache cache) : IRateLimiter
{
    public void Assert(string key, int max, TimeSpan window, string code, string message)
    {
        var current = cache.GetOrCreate(key, e =>
        {
            e.AbsoluteExpirationRelativeToNow = window;
            return new Counter();
        })!;
        lock (current)
        {
            if (current.Value >= max) throw new RateLimitedException(message, code);
            current.Value++;
        }
    }

    private sealed class Counter
    {
        public int Value;
    }
}
