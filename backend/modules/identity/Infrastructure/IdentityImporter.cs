using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Modules.Identity.Infrastructure;

/// <summary>
/// ETL `users` → Person (§30.1). Giữ UUID, timestamps gốc, bcrypt hash nguyên dạng (D2-150).
/// Không migrate activation/reset token và JWT: hết hiệu lực tại cutover, người dùng đăng nhập lại.
/// </summary>
public sealed class IdentityImporter(DbContext db, IUnitOfWork uow) : IIdentityImporter
{
    public async Task ImportPersonAsync(LegacyUserImport user, CancellationToken ct)
    {
        var role = user.Role.Equals("admin", StringComparison.OrdinalIgnoreCase) ? PlatformRoles.Admin : PlatformRoles.User;
        var existing = await db.Set<Person>().FirstOrDefaultAsync(p => p.Id == user.Id, ct);

        if (existing is null)
        {
            var person = Person.Register(user.Email, user.BcryptPasswordHash, PasswordHashAlgorithms.Bcrypt,
                user.FirstName, user.LastName, user.Phone, user.Organization, user.IsActive);
            person.OverrideId(user.Id);
            person.ApplyImport(user.Email, user.BcryptPasswordHash, user.PreviousBcryptPasswordHash, user.FirstName,
                user.LastName, user.Phone, user.Organization, role, user.IsActive, user.MatchingAuto);
            person.ApplyLegacy(user.Legacy, user.CreatedAt, user.UpdatedAt);
            person.ClearDomainEvents();
            db.Add(person);
        }
        else
        {
            existing.ApplyImport(user.Email, user.BcryptPasswordHash, user.PreviousBcryptPasswordHash, user.FirstName,
                user.LastName, user.Phone, user.Organization, role, user.IsActive, user.MatchingAuto);
            existing.ApplyLegacy(user.Legacy, user.CreatedAt, user.UpdatedAt);
            existing.ClearDomainEvents();
        }

        await uow.CommitAsync(ct);
    }

    public Task<int> CountPersonsAsync(CancellationToken ct) => db.Set<Person>().AsNoTracking().CountAsync(ct);
}
