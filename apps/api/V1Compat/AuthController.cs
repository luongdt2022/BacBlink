using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Application;

namespace NacenTech.Api.V1Compat;

public sealed class LoginDto
{
    private string _email = string.Empty;
    [Required, RegularExpression(@"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", ErrorMessage = "email must be a valid email")]
    public string Email
    {
        get => _email;
        set => _email = value?.Trim().ToLowerInvariant() ?? string.Empty;
    }
    [Required(ErrorMessage = "password must be a string")]
    public string Password { get; set; } = string.Empty;
}

public sealed class RegisterDto
{
    private string _email = string.Empty;
    [Required, RegularExpression(@"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", ErrorMessage = "email must be a valid email")]
    public string Email
    {
        get => _email;
        set => _email = value?.Trim().ToLowerInvariant() ?? string.Empty;
    }
    [Required, MinLength(8, ErrorMessage = "password must be longer than or equal to 8 characters")]
    public string Password { get; set; } = string.Empty;
    [Required, MinLength(8, ErrorMessage = "confirmPassword must be longer than or equal to 8 characters")]
    public string ConfirmPassword { get; set; } = string.Empty;
    [Required(ErrorMessage = "firstName should not be empty"), MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    [MaxLength(100)] public string? LastName { get; set; }
    [MaxLength(20)] public string? Phone { get; set; }
    [MaxLength(255)] public string? Organization { get; set; }
}

public sealed class ActivateAccountDto
{
    [Required, MinLength(16, ErrorMessage = "token must be longer than or equal to 16 characters")]
    public string Token { get; set; } = string.Empty;
}

public sealed class EmailDto
{
    private string _email = string.Empty;
    [Required, RegularExpression(@"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", ErrorMessage = "email must be a valid email")]
    public string Email
    {
        get => _email;
        set => _email = value?.Trim().ToLowerInvariant() ?? string.Empty;
    }
}

public sealed class ChangePasswordDto
{
    [Required(ErrorMessage = "currentPassword should not be empty")] public string CurrentPassword { get; set; } = string.Empty;
    [Required, RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?"":{}|<>]).{8,}$",
        ErrorMessage = "Password must be at least 8 characters, including uppercase, lowercase, number, and special character")]
    public string NewPassword { get; set; } = string.Empty;
    [Required(ErrorMessage = "confirmPassword should not be empty")] public string ConfirmPassword { get; set; } = string.Empty;
}

public sealed class ResetPasswordDto
{
    [Required(ErrorMessage = "token should not be empty")] public string Token { get; set; } = string.Empty;
    [Required, MinLength(8, ErrorMessage = "Password must be at least 8 characters long"), MaxLength(128)]
    public string NewPassword { get; set; } = string.Empty;
}

[Route("api/v1/auth")]
public sealed class AuthController(IAuthenticationService auth, IPersonService persons) : V1ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto, CancellationToken ct)
    {
        var person = await auth.RegisterAsync(new RegisterCommand(dto.Email.Trim(), dto.Password, dto.ConfirmPassword, dto.FirstName, dto.LastName, dto.Phone, dto.Organization),
            Infrastructure.ClientIp.Resolve(HttpContext), ct);
        return StatusCode(201, new
        {
            code = AuthCodes.RegisterSuccess,
            message = "Registration successful. You can sign in now.",
            data = new { user = V1Mappers.SanitizedUser(person) },
        });
    }

    [HttpPost("activate")]
    public async Task<IActionResult> Activate([FromBody] ActivateAccountDto dto, CancellationToken ct)
    {
        await auth.ActivateAsync(dto.Token, ct);
        return Ok(new { code = AuthCodes.AccountActivatedSuccess, message = "Account activated successfully.", data = (object?)null });
    }

    [HttpPost("resend-activation")]
    public async Task<IActionResult> Resend([FromBody] EmailDto dto, CancellationToken ct)
    {
        var outcome = await auth.ResendActivationAsync(dto.Email.Trim(), Infrastructure.ClientIp.Resolve(HttpContext), ct);
        return Ok(new
        {
            code = AuthCodes.ActivationEmailResent,
            message = outcome.AlreadyActive
                ? "Account is already active. Please sign in."
                : "If the account exists and is not active, a new activation email has been sent.",
            data = (object?)null,
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto, CancellationToken ct)
    {
        var result = await auth.LoginAsync(dto.Email.Trim(), dto.Password, requiredRole: null, ct);
        return Ok(new { accessToken = result.AccessToken, user = V1Mappers.AuthSessionUser(result.Person) });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken ct)
        => Ok(V1Mappers.User(await persons.GetAsync(PersonId, ct)));

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto, CancellationToken ct)
    {
        await auth.ChangePasswordAsync(PersonId, dto.CurrentPassword, dto.NewPassword, dto.ConfirmPassword,
            Infrastructure.ClientIp.Resolve(HttpContext), Request.Headers.UserAgent.ToString() is { Length: > 0 } ua ? ua : "unknown", ct);
        return Ok(new { code = AuthCodes.PasswordChangedSuccess, message = "Password changed successfully. Please log in again.", data = (object?)null });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> Forgot([FromBody] EmailDto dto, CancellationToken ct)
    {
        await auth.ForgotPasswordAsync(dto.Email.Trim(), ct);
        return Ok(new { code = AuthCodes.ForgotPasswordEmailSent, message = "If the email exists in our system, a password reset link has been sent.", data = (object?)null });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> Reset([FromBody] ResetPasswordDto dto, CancellationToken ct)
    {
        await auth.ResetPasswordAsync(dto.Token, dto.NewPassword, ct);
        return Ok(new { code = AuthCodes.ResetPasswordSuccess, message = "Password reset successfully. Please log in with your new password.", data = (object?)null });
    }
}

[Route("api/v1/admin/auth")]
public sealed class AdminAuthController(IAuthenticationService auth, IPersonService persons) : V1ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto, CancellationToken ct)
    {
        var result = await auth.LoginAsync(dto.Email.Trim(), dto.Password, Kernel.Application.PlatformRoles.Admin, ct);
        return Ok(new { accessToken = result.AccessToken, user = V1Mappers.AuthSessionUser(result.Person) });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        RequireAdmin();
        return Ok(V1Mappers.User(await persons.GetAsync(PersonId, ct)));
    }
}
