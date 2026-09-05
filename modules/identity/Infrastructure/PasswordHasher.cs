using Microsoft.AspNetCore.Identity;
using NacenTech.Modules.Identity.Application;

namespace NacenTech.Modules.Identity.Infrastructure;

/// <summary>
/// D2-150: hash bcrypt của NacenTwin được nhập nguyên dạng và verify bằng BCrypt;
/// lần đăng nhập đầu rehash sang PBKDF2 (ASP.NET Core Identity v3). Không reset mật khẩu hàng loạt.
/// </summary>
public sealed class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<object> _pbkdf2 = new();
    private static readonly object Dummy = new();

    public string CurrentAlgorithm => PasswordHashAlgorithms.Pbkdf2V3;

    public string Hash(string password) => _pbkdf2.HashPassword(Dummy, password);

    public (bool Ok, bool NeedsRehash) Verify(string password, string storedHash, string algorithm)
    {
        if (string.IsNullOrEmpty(storedHash)) return (false, false);
        switch (algorithm)
        {
            case PasswordHashAlgorithms.Bcrypt:
                try
                {
                    return BCrypt.Net.BCrypt.Verify(password, storedHash) ? (true, true) : (false, false);
                }
                catch (BCrypt.Net.SaltParseException)
                {
                    return (false, false);
                }
            case PasswordHashAlgorithms.Pbkdf2V3:
                var result = _pbkdf2.VerifyHashedPassword(Dummy, storedHash, password);
                return result switch
                {
                    PasswordVerificationResult.Success => (true, false),
                    PasswordVerificationResult.SuccessRehashNeeded => (true, true),
                    _ => (false, false),
                };
            default:
                return (false, false);
        }
    }
}
