using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Brokerage.Application;

public sealed class ExpertDraftOptions
{
    public string SigningKey { get; set; } = string.Empty;
    public string FrontendUrl { get; set; } = string.Empty;
}

/// Purpose-separated HMAC bearer token; plaintext is returned once and never stored.
internal sealed class ExpertDraftTokens(ExpertDraftOptions options)
{
    private readonly byte[] _key = DeriveKey(options.SigningKey);
    public (string Token, string Hash, DateTimeOffset ExpiresAt) Issue(DateTimeOffset now)
    {
        var expiry = now.AddHours(72);
        var body = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)) + "." + expiry.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture);
        var token = body + "." + Convert.ToHexString(HMACSHA256.HashData(_key, Encoding.UTF8.GetBytes(body)));
        return (token, Hash(token), expiry);
    }
    public string ValidateAndHash(string? token, DateTimeOffset now)
    {
        if (string.IsNullOrWhiteSpace(token) || token.Length > 200) throw Invalid();
        var parts = token.Split('.');
        if (parts.Length != 3 || parts[0].Length != 64 || parts[2].Length != 64 ||
            !long.TryParse(parts[1], NumberStyles.None, CultureInfo.InvariantCulture, out var expires) || expires <= now.ToUnixTimeSeconds()) throw Invalid();
        try
        {
            if (Convert.FromHexString(parts[0]).Length != 32) throw Invalid();
            var expected = HMACSHA256.HashData(_key, Encoding.UTF8.GetBytes(parts[0] + "." + parts[1]));
            if (!CryptographicOperations.FixedTimeEquals(expected, Convert.FromHexString(parts[2]))) throw Invalid();
        }
        catch (FormatException) { throw Invalid(); }
        return Hash(token);
    }
    private static string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    private static byte[] DeriveKey(string masterKey)
    {
        if (Encoding.UTF8.GetByteCount(masterKey) < 32) throw new InvalidOperationException("Auth:SigningKey phải được cấu hình và dài ít nhất32byte.");
        return HMACSHA256.HashData(Encoding.UTF8.GetBytes(masterKey), Encoding.UTF8.GetBytes("nacentech:expert-draft:v1"));
    }
    internal static UnauthorizedException Invalid() => new("Liên kết hồ sơ không hợp lệ, đã dùng hoặc đã hết hạn.", "ERR_MAGIC_LINK_EXPIRED");
}
