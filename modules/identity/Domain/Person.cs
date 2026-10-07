using NacenTech.Contracts.Events;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Application;

namespace NacenTech.Modules.Identity.Domain;

/// <summary>
/// Person = `users` của NacenTwin sau ETL (§30.1). Email lưu đã trim + lower.
/// Password hash giữ nguyên bcrypt khi import; rehash sang PBKDF2 ở lần đăng nhập đầu (D2-150).
/// </summary>
public sealed class Person : AggregateRoot
{
    private Person() { }

    private Person(string email, string passwordHash, string algorithm, string? firstName, string? lastName, string? phone, string? organization, string platformRole, bool isActive, string scopeType = ScopeTypes.Global, string? scopeId = null)
    {
        Email = email;
        PasswordHash = passwordHash;
        PasswordHashAlgorithm = algorithm;
        FirstName = firstName;
        LastName = lastName;
        Phone = phone;
        OrganizationName = organization;
        PlatformRole = platformRole;
        ScopeType = string.IsNullOrWhiteSpace(scopeType) ? ScopeTypes.Global : scopeType;
        ScopeId = scopeId;
        IsActive = isActive;
        PreferencesUpdatedAt = CreatedAt;
    }

    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string PasswordHashAlgorithm { get; private set; } = PasswordHashAlgorithms.Pbkdf2V3;
    public string? PreviousPasswordHash { get; private set; }
    public string? PreviousPasswordHashAlgorithm { get; private set; }
    public string? FirstName { get; private set; }
    public string? LastName { get; private set; }
    public string? Phone { get; private set; }
    public string? OrganizationName { get; private set; }
    public string PlatformRole { get; private set; } = PlatformRoles.PublicUser;
    public string ScopeType { get; private set; } = ScopeTypes.Global;
    public string? ScopeId { get; private set; }
    public bool IsActive { get; private set; }
    public bool MatchingAuto { get; private set; }
    public DateTimeOffset PreferencesUpdatedAt { get; private set; }

    public static Person Register(string email, string passwordHash, string algorithm, string? firstName, string? lastName, string? phone, string? organization, bool isActive, string platformRole = PlatformRoles.PublicUser, string scopeType = ScopeTypes.Global, string? scopeId = null)
        => new(Normalize(email), passwordHash, algorithm, firstName, lastName, phone, organization, platformRole, isActive, scopeType, scopeId);

    public static string Normalize(string email) => email.Trim().ToLowerInvariant();

    public void RaiseRegistered(string activationToken) => Raise(new PersonRegistered(Id, Email, FirstName, activationToken));

    public void RaiseActivationResent(string activationToken) => Raise(new ActivationResent(Id, Email, FirstName, activationToken));

    public void RaisePasswordResetRequested(string token) => Raise(new PasswordResetRequested(Id, Email, token));

    public void Activate()
    {
        if (IsActive) return;
        IsActive = true;
        Touch();
        Raise(new AccountActivated(Id, Email, FirstName));
    }

    /// <summary>Đổi hash tại chỗ khi thuật toán cũ (bcrypt) cần nâng cấp; không đổi mật khẩu, không phát event.</summary>
    public void RehashPassword(string newHash, string algorithm)
    {
        PasswordHash = newHash;
        PasswordHashAlgorithm = algorithm;
        Touch();
    }

    /// <summary>Đổi mật khẩu: xoay current → previous (depth 1 như legacy) rồi đặt hash mới.</summary>
    public void ChangePassword(string newHash, string algorithm, string? ipAddress, string? userAgent, bool raiseEvent)
    {
        PreviousPasswordHash = PasswordHash;
        PreviousPasswordHashAlgorithm = PasswordHashAlgorithm;
        PasswordHash = newHash;
        PasswordHashAlgorithm = algorithm;
        Touch();
        if (raiseEvent) Raise(new PasswordChanged(Id, Email, FirstName, ipAddress, userAgent));
    }

    /// <summary>Admin reset: xóa lịch sử mật khẩu trước như legacy.</summary>
    public void AdminResetPassword(string newHash, string algorithm)
    {
        PasswordHash = newHash;
        PasswordHashAlgorithm = algorithm;
        PreviousPasswordHash = null;
        PreviousPasswordHashAlgorithm = null;
        Touch();
    }

    public void UpdateProfile(string? firstName, string? lastName, string? phone, string? organization)
    {
        if (firstName is not null) FirstName = firstName;
        if (lastName is not null) LastName = lastName;
        if (phone is not null) Phone = phone;
        if (organization is not null) OrganizationName = organization;
        Touch();
    }

    public void SetActive(bool isActive)
    {
        IsActive = isActive;
        Touch();
    }

    public void AssignRoleAndScope(string platformRole, string scopeType, string? scopeId)
    {
        PlatformRole = platformRole;
        ScopeType = string.IsNullOrWhiteSpace(scopeType) ? ScopeTypes.Global : scopeType;
        ScopeId = scopeId;
        Touch();
    }

    public void SetMatchingAuto(bool value, DateTimeOffset now)
    {
        MatchingAuto = value;
        PreferencesUpdatedAt = now;
        Touch();
    }

    public void ApplyImport(
        string email, string bcryptHash, string? previousBcryptHash, string? firstName, string? lastName,
        string? phone, string? organization, string platformRole, bool isActive, bool matchingAuto,
        string scopeType = ScopeTypes.Global, string? scopeId = null)
    {
        Email = Normalize(email);
        PasswordHash = bcryptHash;
        PasswordHashAlgorithm = PasswordHashAlgorithms.Bcrypt;
        PreviousPasswordHash = previousBcryptHash;
        PreviousPasswordHashAlgorithm = previousBcryptHash is null ? null : PasswordHashAlgorithms.Bcrypt;
        FirstName = firstName;
        LastName = lastName;
        Phone = phone;
        OrganizationName = organization;
        PlatformRole = platformRole;
        ScopeType = string.IsNullOrWhiteSpace(scopeType) ? ScopeTypes.Global : scopeType;
        ScopeId = scopeId;
        IsActive = isActive;
        MatchingAuto = matchingAuto;
    }
}
