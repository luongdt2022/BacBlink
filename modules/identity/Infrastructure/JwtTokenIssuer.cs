using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NacenTech.Modules.Identity.Application;

namespace NacenTech.Modules.Identity.Infrastructure;

/// <summary>
/// HS256, claim `sub`/`email`/`role`. Khóa phải ≥ 32 byte và được cấu hình tường minh —
/// không lặp lại `fallback_secret` của NestJS (nợ an toàn §26.1.8).
/// </summary>
public sealed class JwtTokenIssuer : ITokenIssuer
{
    private readonly AuthOptions _options;
    private readonly SigningCredentials _credentials;

    public JwtTokenIssuer(IOptions<AuthOptions> options)
    {
        _options = options.Value;
        if (string.IsNullOrWhiteSpace(_options.SigningKey) || Encoding.UTF8.GetByteCount(_options.SigningKey) < 32)
            throw new InvalidOperationException("Auth:SigningKey phải được cấu hình và dài ít nhất 32 byte.");
        _credentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey)), SecurityAlgorithms.HmacSha256);
    }

    public string Issue(PersonDto person)
    {
        var now = DateTime.UtcNow;
        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims:
            [
                new Claim("sub", person.Id.ToString()),
                new Claim("email", person.Email),
                new Claim("role", person.PlatformRole),
                new Claim("scope_type", person.ScopeType),
                new Claim("scope_id", person.ScopeId ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.CreateVersion7().ToString("N")),
            ],
            notBefore: now,
            expires: now.AddMinutes(_options.AccessTokenMinutes),
            signingCredentials: _credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
