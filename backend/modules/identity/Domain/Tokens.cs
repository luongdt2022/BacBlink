using System.Security.Cryptography;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Identity.Domain;

/// <summary>Token kích hoạt tài khoản. 24 byte ngẫu nhiên → 48 ký tự hex, giống legacy `randomBytes(24).toString('hex')`.</summary>
public sealed class ActivationToken : Entity
{
    private ActivationToken() { }

    public ActivationToken(Guid personId, DateTimeOffset expiresAt, DateTimeOffset createdAt)
    {
        PersonId = personId;
        Token = NewToken();
        ExpiresAt = expiresAt;
        CreatedAt = createdAt;
    }

    public Guid PersonId { get; private set; }
    public string Token { get; private set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? ConsumedAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public bool IsUsable(DateTimeOffset now) => ConsumedAt is null && ExpiresAt > now;

    public void Consume(DateTimeOffset now) => ConsumedAt = now;

    public static string NewToken() => Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(24));
}

public sealed class PasswordResetToken : Entity
{
    private PasswordResetToken() { }

    public PasswordResetToken(Guid personId, DateTimeOffset expiresAt, DateTimeOffset createdAt)
    {
        PersonId = personId;
        Token = ActivationToken.NewToken();
        ExpiresAt = expiresAt;
        CreatedAt = createdAt;
    }

    public Guid PersonId { get; private set; }
    public string Token { get; private set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? ConsumedAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public bool IsUsable(DateTimeOffset now) => ConsumedAt is null && ExpiresAt > now;

    public void Consume(DateTimeOffset now) => ConsumedAt = now;
}
