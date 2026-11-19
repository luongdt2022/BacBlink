using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Identity.Application;

/// <summary>
/// Cổng ETL một lần từ NacenTwin (§30.1/§30.2). Giữ UUID legacy, timestamps gốc, bcrypt hash nguyên dạng (D2-150).
/// Idempotent theo legacy id: gọi lại thì cập nhật, không nhân đôi. Không phát domain event.
/// </summary>
public sealed record LegacyUserImport(
    Guid Id,
    string Email,
    string BcryptPasswordHash,
    string? PreviousBcryptPasswordHash,
    string? FirstName,
    string? LastName,
    string? Phone,
    string? Organization,
    string Role,            // "user" | "admin"
    bool IsActive,
    bool MatchingAuto,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    LegacyRef Legacy);

public interface IIdentityImporter
{
    Task ImportPersonAsync(LegacyUserImport user, CancellationToken ct);
    Task<int> CountPersonsAsync(CancellationToken ct);
}
