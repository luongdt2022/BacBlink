using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Identity.Application;

// ─── Public application interface của module identity (MOD-02) ────────────────────────────────

/// <summary>Cấu hình xác thực: khóa ký JWT, TTL token, TTL activation/reset, rate limit, URL frontend.</summary>
public sealed class AuthOptions
{
    public const string Section = "Auth";
    public string Issuer { get; set; } = "nacentech";
    public string Audience { get; set; } = "nacentech-portals";
    /// <summary>Khóa HMAC ≥ 32 byte. Không có mặc định: thiếu là fail-fast (không lặp lại `fallback_secret` của NestJS).</summary>
    public string SigningKey { get; set; } = string.Empty;
    public int AccessTokenMinutes { get; set; } = 24 * 60;
    public int ActivationTokenMinutes { get; set; } = 60;
    public int PasswordResetTokenMinutes { get; set; } = 60;
    public string FrontendUrl { get; set; } = "http://localhost:5173";
    public string ActivationPath { get; set; } = "/activate-account";
    public int RegisterRateLimitMax { get; set; } = 5;
    public int RegisterRateLimitWindowSeconds { get; set; } = 300;
    public int ResendRateLimitMax { get; set; } = 3;
    public int ResendRateLimitWindowSeconds { get; set; } = 600;
    public int LoginRateLimitMax { get; set; } = 10;
    public int LoginRateLimitWindowSeconds { get; set; } = 300;
}

/// <summary>Mã phản hồi giữ nguyên tên từ NestJS `AuthResponseKey` để portal không phải sửa.</summary>
public static class AuthCodes
{
    public const string PasswordChangedSuccess = "PASSWORD_CHANGED_SUCCESS";
    public const string RegisterSuccessPendingActivation = "REGISTER_SUCCESS_PENDING_ACTIVATION";
    public const string AccountActivatedSuccess = "ACCOUNT_ACTIVATED_SUCCESS";
    public const string ActivationEmailResent = "ACTIVATION_EMAIL_RESENT";
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string AccountNotActivated = "ACCOUNT_NOT_ACTIVATED";
    public const string EmailAlreadyInUse = "EMAIL_ALREADY_IN_USE";
    public const string ConfirmPasswordMismatch = "CONFIRM_PASSWORD_MISMATCH";
    public const string ActivationTokenInvalid = "ACTIVATION_TOKEN_INVALID";
    public const string AccountNotFound = "ACCOUNT_NOT_FOUND";
    public const string RegisterRateLimited = "REGISTER_RATE_LIMITED";
    public const string ResendRateLimited = "RESEND_RATE_LIMITED";
    public const string CurrentPasswordIncorrect = "CURRENT_PASSWORD_INCORRECT";
    public const string LoginRateLimited = "LOGIN_RATE_LIMITED";
    public const string ForgotPasswordRateLimited = "FORGOT_PASSWORD_RATE_LIMITED";
    public const string ResetPasswordTokenInvalid = "RESET_PASSWORD_TOKEN_INVALID";
    public const string ResetPasswordSuccess = "RESET_PASSWORD_SUCCESS";
    public const string ForgotPasswordEmailSent = "FORGOT_PASSWORD_EMAIL_SENT";
}

public sealed record PersonDto(
    Guid Id,
    string Email,
    string? FirstName,
    string? LastName,
    string? Phone,
    string? Organization,
    string PlatformRole,
    bool IsActive,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record PersonPreferencesDto(Guid Id, Guid PersonId, bool MatchingAuto, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt);

public sealed record AuthResult(string AccessToken, PersonDto Person);

public sealed record RegisterCommand(string Email, string Password, string ConfirmPassword, string FirstName, string? LastName, string? Phone, string? Organization);

public sealed record UpdateProfileCommand(string? FirstName, string? LastName, string? Phone, string? Organization);

public sealed record AdminCreatePersonCommand(string Email, string? Password, string? FirstName, string? LastName, string? Phone, string? Organization, bool? IsActive);

public sealed record AdminUpdatePersonCommand(string? FirstName, string? LastName, string? Phone, string? Organization, bool? IsActive);

public sealed record ResendActivationOutcome(bool AlreadyActive);

public interface IAuthenticationService
{
    /// <summary>requiredRole: "USER" hoặc "ADMIN" (portal user vs admin login). Sai role → INVALID_CREDENTIALS như legacy.</summary>
    Task<AuthResult> LoginAsync(string email, string password, string requiredRole, CancellationToken ct);

    /// <summary>Tạo person inactive + activation token + event PersonRegistered. Rate limit theo ip:email.</summary>
    Task<PersonDto> RegisterAsync(RegisterCommand command, string requesterIp, CancellationToken ct);

    Task ActivateAsync(string token, CancellationToken ct);

    Task<ResendActivationOutcome> ResendActivationAsync(string email, string requesterIp, CancellationToken ct);

    Task ChangePasswordAsync(Guid personId, string currentPassword, string newPassword, string confirmPassword, string? ipAddress, string? userAgent, CancellationToken ct);

    /// <summary>Luôn thành công (chống dò email); phát PasswordResetRequested nếu có người dùng.</summary>
    Task ForgotPasswordAsync(string email, CancellationToken ct);

    Task ResetPasswordAsync(string token, string newPassword, CancellationToken ct);
}

public interface IPersonService
{
    Task<PersonDto> GetAsync(Guid id, CancellationToken ct);
    Task<PersonDto?> FindAsync(Guid id, CancellationToken ct);
    Task<PersonDto?> FindByEmailAsync(string email, CancellationToken ct);
    Task<IReadOnlyDictionary<Guid, PersonDto>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct);
    Task<bool> IsActiveAsync(Guid id, CancellationToken ct);
    Task<PersonDto> UpdateProfileAsync(Guid id, UpdateProfileCommand command, CancellationToken ct);
    Task<PersonPreferencesDto> GetPreferencesAsync(Guid id, CancellationToken ct);
    Task<PersonPreferencesDto> UpdatePreferencesAsync(Guid id, bool? matchingAuto, CancellationToken ct);

    // Operator/admin
    Task<PersonDto> AdminCreateAsync(AdminCreatePersonCommand command, CancellationToken ct);
    Task<PagedResult<PersonDto>> AdminListAsync(PageRequest page, string? search, string status, CancellationToken ct);
    Task<PersonDto> AdminUpdateAsync(Guid id, AdminUpdatePersonCommand command, CancellationToken ct);
    Task AdminResetPasswordAsync(Guid id, string newPassword, CancellationToken ct);
}

/// <summary>D2-150: verify bcrypt legacy, rehash sang PBKDF2 (ASP.NET Core Identity v3) ở lần đăng nhập đầu.</summary>
public interface IPasswordHasher
{
    string Hash(string password);
    /// <summary>Trả về (ok, needsRehash).</summary>
    (bool Ok, bool NeedsRehash) Verify(string password, string storedHash, string algorithm);
    string CurrentAlgorithm { get; }
}

public static class PasswordHashAlgorithms
{
    public const string Bcrypt = "bcrypt";
    public const string Pbkdf2V3 = "pbkdf2-v3";
}

public interface ITokenIssuer
{
    string Issue(PersonDto person);
}
