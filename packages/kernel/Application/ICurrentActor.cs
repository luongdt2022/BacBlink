namespace NacenTech.Kernel.Application;

/// <summary>
/// Actor đang thực hiện request. PersonId là surrogate id dùng làm actorRef trong audit (§23.5).
/// PlatformRole: "USER" | "ADMIN" | "SYSTEM". Case role/purpose đến từ AccessGrant, không từ token.
/// </summary>
public interface ICurrentActor
{
    bool IsAuthenticated { get; }
    Guid? PersonId { get; }
    string? Email { get; }
    string PlatformRole { get; }
    string? IpAddress { get; }
    string? UserAgent { get; }
    string CorrelationId { get; }

    Guid RequirePersonId();
}

public static class PlatformRoles
{
    public const string Anonymous = "ANONYMOUS";
    public const string User = "USER";
    public const string Admin = "ADMIN";
    public const string System = "SYSTEM";
}

/// <summary>Actor hệ thống cho worker/ETL (không có người thật).</summary>
public sealed class SystemActor(string correlationId) : ICurrentActor
{
    public bool IsAuthenticated => true;
    public Guid? PersonId => null;
    public string? Email => null;
    public string PlatformRole => PlatformRoles.System;
    public string? IpAddress => null;
    public string? UserAgent => null;
    public string CorrelationId { get; } = correlationId;
    public Guid RequirePersonId() => throw new InvalidOperationException("System actor không có PersonId.");
}
