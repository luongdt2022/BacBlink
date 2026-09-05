namespace NacenTech.Kernel.Domain;

/// <summary>
/// Lỗi nghiệp vụ có mã ổn định. Host map sang HTTP: v2 dùng RFC 9457, facade v1 dùng shape NestJS.
/// </summary>
public abstract class DomainException(string code, string message) : Exception(message)
{
    public string Code { get; } = code;
}

public sealed class NotFoundException(string message, string code = "NOT_FOUND") : DomainException(code, message);

public sealed class ForbiddenException(string message, string code = "FORBIDDEN") : DomainException(code, message)
{
    public string? RuleId { get; init; }
}

public sealed class UnauthorizedException(string message, string code = "UNAUTHORIZED") : DomainException(code, message);

public sealed class ConflictException(string message, string code = "CONFLICT") : DomainException(code, message);

public sealed class UnprocessableException(string message, string code = "UNPROCESSABLE") : DomainException(code, message);

public sealed class RateLimitedException(string message, string code = "RATE_LIMITED") : DomainException(code, message);

/// <summary>
/// Lỗi kiểm tra dữ liệu.
///
/// **Mã lỗi đi qua <see cref="WithCode"/>, không qua một hàm dựng thứ hai.** Trước đây lớp này có hai hàm dựng
/// `(params string[] errors)` và `(string code, params string[] errors)`; với một đối số chuỗi duy nhất — dạng
/// gọi của 41 trong 46 chỗ trong mã — phân giải nạp chồng chọn hàm thứ hai, nên câu lỗi trở thành **mã** còn
/// `Message` thành **chuỗi rỗng**. Hệ quả đo được ngày 2026-09-04: mọi lỗi 400 trên cả hai bề mặt trả
/// `{"statusCode":400,"message":"","error":"Bad Request"}` và `"detail": ""`. Xem B-37.
///
/// Một hàm dựng duy nhất làm phép gọi nhập nhằng đó không diễn đạt được nữa.
/// </summary>
public sealed class ValidationException : DomainException
{
    public IReadOnlyList<string> Errors { get; }

    public ValidationException(params string[] errors) : base("VALIDATION_FAILED", string.Join("; ", errors))
    {
        Errors = errors;
    }

    private ValidationException(string code, string[] errors) : base(code, string.Join("; ", errors))
    {
        Errors = errors;
    }

    /// <summary>Lỗi kiểm tra dữ liệu mang mã nghiệp vụ ổn định mà giao diện phân nhánh theo.</summary>
    public static ValidationException WithCode(string code, params string[] errors) => new(code, errors);
}

/// <summary>Version không khớp (If-Match / optimistic concurrency, §7.5).</summary>
public sealed class ConcurrencyException(string message, int currentVersion) : DomainException("VERSION_CONFLICT", message)
{
    public int CurrentVersion { get; } = currentVersion;
}
