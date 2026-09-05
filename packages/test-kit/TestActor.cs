using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.TestKit;

/// <summary>Actor giả cho test: đổi được PersonId/role giữa các bước để kiểm tra ranh giới quyền.</summary>
public sealed class TestActor : ICurrentActor
{
    public bool IsAuthenticated => PersonId is not null || PlatformRole == PlatformRoles.System;
    public Guid? PersonId { get; set; }
    public string? Email { get; set; }
    public string PlatformRole { get; set; } = PlatformRoles.Anonymous;
    public string? IpAddress { get; set; } = "127.0.0.1";
    public string? UserAgent { get; set; } = "test";
    public string CorrelationId { get; set; } = Guid.NewGuid().ToString("N");

    public Guid RequirePersonId() => PersonId ?? throw new UnauthorizedException("Yêu cầu đăng nhập");

    public TestActor AsUser(Guid personId, string? email = null)
    {
        PersonId = personId;
        Email = email;
        PlatformRole = PlatformRoles.User;
        return this;
    }

    public TestActor AsAdmin(Guid personId)
    {
        PersonId = personId;
        PlatformRole = PlatformRoles.Admin;
        return this;
    }

    public TestActor AsAnonymous()
    {
        PersonId = null;
        PlatformRole = PlatformRoles.Anonymous;
        return this;
    }

    public TestActor AsSystem()
    {
        PersonId = null;
        PlatformRole = PlatformRoles.System;
        return this;
    }
}

/// <summary>Đồng hồ điều khiển được để test lịch/hết hạn token mà không cần chờ thật.</summary>
public sealed class TestClock(DateTimeOffset? start = null) : IClock
{
    public DateTimeOffset UtcNow { get; set; } = start ?? new DateTimeOffset(2026, 9, 3, 0, 0, 0, TimeSpan.Zero);

    public void Advance(TimeSpan by) => UtcNow = UtcNow.Add(by);
}
