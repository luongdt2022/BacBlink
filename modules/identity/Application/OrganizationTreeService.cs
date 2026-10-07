using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Modules.Identity.Application;

public sealed class OrganizationTreeService(
    DbContext db,
    IUnitOfWork uow,
    IPasswordHasher hasher) : IOrganizationTreeService
{
    public async Task<IReadOnlyList<OrganizationUnitDto>> GetOrgTreeAsync(CancellationToken ct)
    {
        var units = await db.Set<OrganizationUnit>().AsNoTracking()
            .OrderBy(x => x.Code)
            .ToListAsync(ct);

        return units.Select(ToDto).ToList();
    }

    public async Task<OrganizationUnitDto> CreateUnitAsync(
        CreateOrganizationUnitCommand cmd,
        ICurrentActor actor,
        string ipAddress,
        CancellationToken ct)
    {
        if (actor.PlatformRole is not (PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.Admin))
        {
            throw new ForbiddenException("Chỉ Quản trị viên cấp cao mới có quyền tạo đơn vị liên kết mới.");
        }

        var normalizedCode = cmd.Code.Trim().ToUpperInvariant();
        var exists = await db.Set<OrganizationUnit>().AsNoTracking().AnyAsync(x => x.Code == normalizedCode, ct);
        if (exists)
        {
            throw new ConflictException($"Mã đơn vị '{normalizedCode}' đã tồn tại trên hệ thống.");
        }

        var unit = new OrganizationUnit(
            normalizedCode,
            cmd.Name,
            cmd.UnitType,
            cmd.ParentId,
            cmd.ProvinceId);

        db.Set<OrganizationUnit>().Add(unit);

        var audit = new ApprovalAuditLog(
            actor.PersonId ?? Guid.Empty,
            actor.PlatformRole,
            "CREATE_ORG_UNIT",
            "organization_units",
            unit.Id.ToString(),
            ipAddress,
            $"{{\"code\":\"{normalizedCode}\",\"name\":\"{cmd.Name}\",\"unitType\":\"{cmd.UnitType}\"}}");

        db.Set<ApprovalAuditLog>().Add(audit);

        await uow.CommitAsync(ct);
        return ToDto(unit);
    }

    public async Task<PersonDto> ProvisionProvinceLeaderAsync(
        ProvisionProvinceAdminCommand cmd,
        ICurrentActor actor,
        string ipAddress,
        CancellationToken ct)
    {
        if (actor.PlatformRole is not (PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.Admin))
        {
            throw new ForbiddenException("Chỉ Quản trị viên cấp cao mới có quyền khởi tạo tài khoản Lãnh đạo Sở.");
        }

        var normalizedEmail = Person.Normalize(cmd.Email);
        var emailExists = await db.Set<Person>().AsNoTracking().AnyAsync(x => x.Email == normalizedEmail, ct);
        if (emailExists)
        {
            throw new ConflictException($"Email '{normalizedEmail}' đã được đăng ký trên hệ thống.");
        }

        var passwordHash = hasher.Hash(cmd.Password);
        var person = Person.Register(
            normalizedEmail,
            passwordHash,
            hasher.CurrentAlgorithm,
            cmd.FirstName,
            cmd.LastName,
            cmd.Phone,
            $"Sở KH&CN {cmd.ProvinceId}",
            isActive: true,
            platformRole: PlatformRoles.ProvincialAdmin,
            scopeType: ScopeTypes.Province,
            scopeId: cmd.ProvinceId.Trim().ToUpperInvariant());

        db.Set<Person>().Add(person);

        var audit = new ApprovalAuditLog(
            actor.PersonId ?? Guid.Empty,
            actor.PlatformRole,
            "PROVISION_PROVINCE_ADMIN",
            "persons",
            person.Id.ToString(),
            ipAddress,
            $"{{\"email\":\"{normalizedEmail}\",\"provinceId\":\"{cmd.ProvinceId}\"}}");

        db.Set<ApprovalAuditLog>().Add(audit);

        await uow.CommitAsync(ct);
        return PersonMapper.ToDto(person);
    }

    private static OrganizationUnitDto ToDto(OrganizationUnit u) => new(
        u.Id,
        u.Code,
        u.Name,
        u.UnitType,
        u.ParentId,
        u.ProvinceId,
        u.Status,
        u.CreatedAtUtc);
}
