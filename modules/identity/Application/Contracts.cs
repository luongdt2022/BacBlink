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
    public const string RegisterSuccess = "REGISTER_SUCCESS";
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
    DateTimeOffset UpdatedAt,
    string ScopeType = ScopeTypes.Global,
    string? ScopeId = null);

public sealed record PersonPreferencesDto(Guid Id, Guid PersonId, bool MatchingAuto, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt);

public sealed record AuthResult(string AccessToken, PersonDto Person);

public sealed record RegisterCommand(string Email, string Password, string ConfirmPassword, string FirstName, string? LastName, string? Phone, string? Organization);

public sealed record UpdateProfileCommand(string? FirstName, string? LastName, string? Phone, string? Organization);

public sealed record AdminCreatePersonCommand(string Email, string? Password, string? FirstName, string? LastName, string? Phone, string? Organization, bool? IsActive);

public sealed record AdminUpdatePersonCommand(string? FirstName, string? LastName, string? Phone, string? Organization, bool? IsActive);

public sealed record ProvisionPersonCommand(
    string Email, string Password, string FirstName, string? LastName, string? Phone, string? Organization,
    string PlatformRole, string ScopeType, string? ScopeId, bool IsActive = true);

public sealed record AssignRoleScopeCommand(string PlatformRole, string ScopeType, string? ScopeId);

public sealed record ResendActivationOutcome(bool AlreadyActive);

public interface IAuthenticationService
{
    /// <summary>
    /// Đăng nhập portal khi requiredRole là null; giữ role thật trong JWT. Admin login truyền ADMIN
    /// để tách bề mặt quản trị khỏi portal người dùng.
    /// </summary>
    Task<AuthResult> LoginAsync(string email, string password, string? requiredRole, CancellationToken ct);

    /// <summary>Tạo PUBLIC_USER active ngay; rate limit theo ip:email. Activation endpoint chỉ giữ cho account legacy.</summary>
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
    Task<PersonDto> ProvisionAsync(ProvisionPersonCommand command, CancellationToken ct);
    Task<PersonDto> AssignRoleAndScopeAsync(Guid id, AssignRoleScopeCommand command, CancellationToken ct);
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

// ─── TASK-07: Governance, Approval & Org Unit Contracts ──────────────────────────────────────────

public sealed record ApprovalRequestDto(
    Guid Id,
    Guid UserId,
    string RequestType,
    string ScopeType,
    string? ScopeId,
    string PayloadJson,
    string Status,
    int Version,
    Guid? AssignedOfficerId,
    Guid? ReviewedById,
    string? ReviewNote,
    DateTimeOffset SlaDeadlineUtc,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    PersonDto? User = null);

public sealed record SubmitApprovalRequestCommand(
    Guid UserId,
    string RequestType,
    string ScopeType,
    string? ScopeId,
    string PayloadJson,
    DateTimeOffset? SlaDeadlineUtc = null);

public sealed record ReviewApprovalRequestCommand(
    string Action,
    int ExpectedVersion,
    string? ReviewNote = null);

public sealed record ApprovalListFilter(
    string? RequestType = null,
    string? Status = null,
    string? ScopeType = null,
    string? ScopeId = null,
    int Page = 1,
    int PageSize = 20);

public sealed record OrganizationUnitDto(
    Guid Id,
    string Code,
    string Name,
    string UnitType,
    Guid? ParentId,
    string? ProvinceId,
    string Status,
    DateTimeOffset CreatedAtUtc);

public sealed record CreateOrganizationUnitCommand(
    string Code,
    string Name,
    string UnitType,
    Guid? ParentId = null,
    string? ProvinceId = null);

public sealed record UpdateOrganizationUnitCommand(
    string Name,
    string? ProvinceId = null);

public sealed record ProvisionProvinceAdminCommand(
    string Email,
    string Password,
    string FirstName,
    string? LastName,
    string? Phone,
    string ProvinceId);

public sealed record ApprovalAuditLogDto(
    Guid Id,
    Guid ActorId,
    string ActorRole,
    string Action,
    string TargetEntity,
    string TargetId,
    string IpAddress,
    string? DetailsJson,
    DateTimeOffset CreatedAtUtc);

public interface IApprovalService
{
    Task<PagedResult<ApprovalRequestDto>> GetApprovalsAsync(ApprovalListFilter filter, ICurrentActor actor, CancellationToken ct);
    Task<ApprovalRequestDto> GetByIdAsync(Guid id, ICurrentActor actor, CancellationToken ct);
    Task<ApprovalRequestDto> SubmitRequestAsync(SubmitApprovalRequestCommand cmd, CancellationToken ct);
    Task<ApprovalRequestDto> ReviewRequestAsync(Guid id, ReviewApprovalRequestCommand cmd, ICurrentActor actor, string ipAddress, CancellationToken ct);
    Task<IReadOnlyList<ApprovalAuditLogDto>> GetAuditLogsAsync(string targetEntity, string targetId, CancellationToken ct);

    // TASK-07 DELTA V4 (CR-2026-020): Central Queue & Admin Override
    Task<PagedResult<CentralApprovalItemDto>> GetCentralApprovalQueueAsync(ApprovalQueueQueryFilter filter, ICurrentActor actor, CancellationToken ct);
    Task<ApprovalRequestDto> OverrideApproveAsync(Guid id, OverrideApprovalCommand cmd, ICurrentActor actor, string ipAddress, CancellationToken ct);
}

public sealed record OverrideApprovalCommand(
    string OverrideReason,
    bool ConfirmCommitment,
    int ExpectedVersion);

public sealed record ApprovalQueueQueryFilter(
    string? ProvinceId = null,
    string? RequestType = null,
    string? SlaStatus = null, // 'ALL', 'NORMAL', 'WARNING', 'BREACHED'
    string? SearchTerm = null,
    int Page = 1,
    int PageSize = 20);

public sealed record CentralApprovalItemDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string RequestType,
    string ScopeType,
    string? ScopeId,
    string? ProvinceName,
    string Status,
    int Version,
    bool IsSlaBreached,
    double SlaOverdueHours,
    bool IsOverride,
    string? OverrideReason,
    DateTimeOffset SlaDeadlineUtc,
    DateTimeOffset CreatedAtUtc);

public interface IOrganizationTreeService
{
    Task<IReadOnlyList<OrganizationUnitDto>> GetOrgTreeAsync(CancellationToken ct);
    Task<OrganizationUnitDto> CreateUnitAsync(CreateOrganizationUnitCommand cmd, ICurrentActor actor, string ipAddress, CancellationToken ct);
    Task<OrganizationUnitDto> UpdateUnitAsync(Guid id, UpdateOrganizationUnitCommand cmd, ICurrentActor actor, string ipAddress, CancellationToken ct);
    Task DeactivateUnitAsync(Guid id, ICurrentActor actor, string ipAddress, CancellationToken ct);
    Task<PersonDto> ProvisionProvinceLeaderAsync(ProvisionProvinceAdminCommand cmd, ICurrentActor actor, string ipAddress, CancellationToken ct);
}

