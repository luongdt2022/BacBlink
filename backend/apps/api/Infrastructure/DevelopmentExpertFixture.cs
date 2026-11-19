using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Modules.Policy.Application;
using NacenTech.Modules.Policy.Domain;
using NacenTech.Persistence;

namespace NacenTech.Api.Infrastructure;

/// <summary>
/// Fixture E2E local, bị khóa hai lớp: chỉ Development và chỉ khi Demo:SeedExpert=true.
/// Không dùng migration để tránh đưa account/password demo vào database production.
/// </summary>
public static class DevelopmentExpertFixture
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration, IHostEnvironment environment, CancellationToken ct = default)
    {
        if (!environment.IsDevelopment() || !configuration.GetValue<bool>("Demo:SeedExpert")) return;

        var password = configuration["Demo:ExpertPassword"];
        if (string.IsNullOrWhiteSpace(password) || password.Length < 12)
            throw new InvalidOperationException("Demo:ExpertPassword phải được cấu hình (tối thiểu 12 ký tự) khi Demo:SeedExpert=true.");

        var email = Person.Normalize(configuration["Demo:ExpertEmail"] ?? "expert.demo@nacentech.local");
        var db = services.GetRequiredService<NacenTechDbContext>();
        var hasher = services.GetRequiredService<IPasswordHasher>();
        var sectorCode = await db.Set<TaxonomyTerm>()
            .Where(x => x.Kind == TaxonomyKinds.Sector && x.IsActive && x.Code != null)
            .OrderBy(x => x.Code)
            .Select(x => x.Code)
            .FirstOrDefaultAsync(ct)
            ?? throw new InvalidOperationException("Không thể seed expert E2E khi taxonomy SECTOR active chưa có dữ liệu.");

        var profile = await db.Set<ExpertProfile>()
            .SingleOrDefaultAsync(x => x.ExpertCode == "CG-NACEN-DEMOIT01", ct)
            ?? throw new InvalidOperationException("Không tìm thấy profile demo CG-NACEN-DEMOIT01 để liên kết account E2E.");

        var person = await db.Set<Person>().SingleOrDefaultAsync(x => x.Email == email, ct);
        if (person is null)
        {
            person = Person.Register(
                email,
                hasher.Hash(password),
                hasher.CurrentAlgorithm,
                firstName: "An",
                lastName: "Nguyễn Minh",
                phone: null,
                organization: profile.OrganizationName,
                isActive: true,
                platformRole: PlatformRoles.VerifiedExpert,
                scopeType: ScopeTypes.Sector,
                scopeId: sectorCode);
            db.Add(person);
        }
        else
        {
            person.SetActive(true);
            person.AssignRoleAndScope(PlatformRoles.VerifiedExpert, ScopeTypes.Sector, sectorCode);
        }

        profile.LinkToPerson(person.Id);
        await db.SaveChangesAsync(ct);
    }
}
