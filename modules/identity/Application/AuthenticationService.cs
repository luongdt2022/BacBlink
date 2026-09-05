using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Modules.Identity.Application;

/// <summary>
/// Port `auth.service.ts`. Giữ nguyên mã lỗi và thông điệp để facade v1 trả đúng shape legacy;
/// khác biệt có chủ đích: JWT ký bằng khóa mới (mọi phiên cũ vô hiệu tại cutover — D2-150).
/// </summary>
public sealed class AuthenticationService(
    DbContext db,
    IUnitOfWork uow,
    IClock clock,
    IRateLimiter rateLimiter,
    IPasswordHasher hasher,
    ITokenIssuer tokens,
    IOptions<AuthOptions> options) : IAuthenticationService
{
    private readonly AuthOptions _options = options.Value;

    public async Task<AuthResult> LoginAsync(string email, string password, string requiredRole, CancellationToken ct)
    {
        var normalized = Person.Normalize(email);

        // Legacy chỉ rate-limit login của portal người dùng, không limit admin login.
        if (requiredRole == PlatformRoles.User)
        {
            rateLimiter.Assert($"login:{normalized}", _options.LoginRateLimitMax, TimeSpan.FromSeconds(_options.LoginRateLimitWindowSeconds),
                AuthCodes.LoginRateLimited, "Too many login attempts. Please try again later.");
        }

        var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Email == normalized, ct);
        if (person is null) throw Invalid();

        var (ok, needsRehash) = hasher.Verify(password, person.PasswordHash, person.PasswordHashAlgorithm);
        if (!ok) throw Invalid();

        if (!person.IsActive)
        {
            throw new UnauthorizedException(
                requiredRole == PlatformRoles.Admin ? "Account is disabled" : "Account is not activated yet",
                AuthCodes.AccountNotActivated);
        }

        if (person.PlatformRole != requiredRole) throw Invalid();

        if (needsRehash)
        {
            person.RehashPassword(hasher.Hash(password), hasher.CurrentAlgorithm);
            await uow.CommitAsync(ct);
        }

        var dto = PersonMapper.ToDto(person);
        return new AuthResult(tokens.Issue(dto), dto);
    }

    public async Task<PersonDto> RegisterAsync(RegisterCommand command, string requesterIp, CancellationToken ct)
    {
        if (command.Password != command.ConfirmPassword)
            throw ValidationException.WithCode(AuthCodes.ConfirmPasswordMismatch, "Confirm password does not match");

        var normalized = Person.Normalize(command.Email);
        rateLimiter.Assert($"register:{requesterIp}:{normalized}", _options.RegisterRateLimitMax,
            TimeSpan.FromSeconds(_options.RegisterRateLimitWindowSeconds), AuthCodes.RegisterRateLimited,
            "Too many registration attempts. Please try again later.");

        if (await db.Set<Person>().AnyAsync(p => p.Email == normalized, ct))
            throw new ConflictException("Email is already in use", AuthCodes.EmailAlreadyInUse);

        var person = Person.Register(normalized, hasher.Hash(command.Password), hasher.CurrentAlgorithm,
            command.FirstName, command.LastName, command.Phone, command.Organization, isActive: false);
        db.Add(person);

        var token = await IssueActivationTokenAsync(person.Id, ct);
        person.RaiseRegistered(token.Token);

        await uow.CommitAsync(ct);
        return PersonMapper.ToDto(person);
    }

    public async Task ActivateAsync(string token, CancellationToken ct)
    {
        var now = clock.UtcNow;
        var record = await db.Set<ActivationToken>().FirstOrDefaultAsync(t => t.Token == token && t.ConsumedAt == null, ct);
        if (record is null || !record.IsUsable(now))
            throw ValidationException.WithCode(AuthCodes.ActivationTokenInvalid, "Activation link is invalid or has expired. Please request a new one.");

        var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Id == record.PersonId, ct)
                     ?? throw new NotFoundException("User account not found", AuthCodes.AccountNotFound);

        person.Activate();
        record.Consume(now);
        await uow.CommitAsync(ct);
    }

    public async Task<ResendActivationOutcome> ResendActivationAsync(string email, string requesterIp, CancellationToken ct)
    {
        var normalized = Person.Normalize(email);
        rateLimiter.Assert($"resend-activation:{requesterIp}:{normalized}", _options.ResendRateLimitMax,
            TimeSpan.FromSeconds(_options.ResendRateLimitWindowSeconds), AuthCodes.ResendRateLimited,
            "Too many resend requests. Please try again later.");

        var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Email == normalized, ct)
                     ?? throw new NotFoundException("User account not found", AuthCodes.AccountNotFound);

        if (person.IsActive) return new ResendActivationOutcome(AlreadyActive: true);

        var token = await IssueActivationTokenAsync(person.Id, ct);
        person.RaiseActivationResent(token.Token);
        await uow.CommitAsync(ct);
        return new ResendActivationOutcome(AlreadyActive: false);
    }

    public async Task ChangePasswordAsync(Guid personId, string currentPassword, string newPassword, string confirmPassword, string? ipAddress, string? userAgent, CancellationToken ct)
    {
        if (newPassword != confirmPassword)
            throw ValidationException.WithCode(AuthCodes.ConfirmPasswordMismatch, "Confirm password does not match");

        var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Id == personId, ct)
                     ?? throw new NotFoundException("User not found");

        var (ok, _) = hasher.Verify(currentPassword, person.PasswordHash, person.PasswordHashAlgorithm);
        if (!ok) throw new UnauthorizedException("Current password is incorrect", AuthCodes.CurrentPasswordIncorrect);

        var (sameAsCurrent, _) = hasher.Verify(newPassword, person.PasswordHash, person.PasswordHashAlgorithm);
        if (sameAsCurrent) throw new ValidationException("New password cannot be the same as the current password");

        if (person.PreviousPasswordHash is not null && person.PreviousPasswordHashAlgorithm is not null)
        {
            var (sameAsPrevious, _) = hasher.Verify(newPassword, person.PreviousPasswordHash, person.PreviousPasswordHashAlgorithm);
            if (sameAsPrevious) throw new ValidationException("New password cannot be the same as the recently used password");
        }

        person.ChangePassword(hasher.Hash(newPassword), hasher.CurrentAlgorithm, ipAddress, userAgent, raiseEvent: true);
        await uow.CommitAsync(ct);
    }

    /// <summary>Không tiết lộ email có tồn tại hay không (chống dò email) — luôn trả thành công.</summary>
    public async Task ForgotPasswordAsync(string email, CancellationToken ct)
    {
        var normalized = Person.Normalize(email);
        var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Email == normalized, ct);
        if (person is null) return;

        var now = clock.UtcNow;
        var open = await db.Set<PasswordResetToken>().Where(t => t.PersonId == person.Id && t.ConsumedAt == null).ToListAsync(ct);
        foreach (var t in open) t.Consume(now);

        var token = new PasswordResetToken(person.Id, now.AddMinutes(_options.PasswordResetTokenMinutes), now);
        db.Add(token);
        person.RaisePasswordResetRequested(token.Token);
        await uow.CommitAsync(ct);
    }

    public async Task ResetPasswordAsync(string token, string newPassword, CancellationToken ct)
    {
        var now = clock.UtcNow;
        var record = await db.Set<PasswordResetToken>().FirstOrDefaultAsync(t => t.Token == token && t.ConsumedAt == null, ct);
        if (record is null || !record.IsUsable(now))
            throw ValidationException.WithCode(AuthCodes.ResetPasswordTokenInvalid, "Reset link is invalid or has expired. Please request a new one.");

        var person = await db.Set<Person>().FirstOrDefaultAsync(p => p.Id == record.PersonId, ct)
                     ?? throw ValidationException.WithCode(AuthCodes.ResetPasswordTokenInvalid, "Reset link is invalid or has expired. Please request a new one.");

        person.ChangePassword(hasher.Hash(newPassword), hasher.CurrentAlgorithm, null, null, raiseEvent: false);
        record.Consume(now);
        await uow.CommitAsync(ct);
    }

    private async Task<ActivationToken> IssueActivationTokenAsync(Guid personId, CancellationToken ct)
    {
        var now = clock.UtcNow;
        var open = await db.Set<ActivationToken>().Where(t => t.PersonId == personId && t.ConsumedAt == null).ToListAsync(ct);
        foreach (var t in open) t.Consume(now);

        var token = new ActivationToken(personId, now.AddMinutes(_options.ActivationTokenMinutes), now);
        db.Add(token);
        return token;
    }

    private static UnauthorizedException Invalid() => new("Invalid credentials", AuthCodes.InvalidCredentials);
}
