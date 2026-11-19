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
        var count = await db.Set<OrganizationUnit>().AsNoTracking().CountAsync(ct);
        if (count == 0)
        {
            await SeedDefaultBaselineAsync(ct);
        }

        var units = await db.Set<OrganizationUnit>().AsNoTracking()
            .OrderBy(x => x.Code)
            .ToListAsync(ct);

        return units.Select(ToDto).ToList();
    }

    private async Task SeedDefaultBaselineAsync(CancellationToken ct)
    {
        // Level 1: Root Central
        var root = new OrganizationUnit(
            "NACENTECH-CENTRAL",
            "Cơ quan Đầu mối Trung ương NacenTech (Bộ KH&CN)",
            OrganizationUnitTypes.National);
        db.Set<OrganizationUnit>().Add(root);

        // Level 2: Provincial
        var hn = new OrganizationUnit("SO-KHCN-HN", "Sở Khoa học và Công nghệ TP. Hà Nội", OrganizationUnitTypes.Provincial, root.Id, "HN");
        var hcm = new OrganizationUnit("SO-KHCN-HCM", "Sở Khoa học và Công nghệ TP. Hồ Chí Minh", OrganizationUnitTypes.Provincial, root.Id, "SG");
        var hp = new OrganizationUnit("SO-KHCN-HP", "Sở Khoa học và Công nghệ TP. Hải Phòng", OrganizationUnitTypes.Provincial, root.Id, "HP");
        var dn = new OrganizationUnit("SO-KHCN-DN", "Sở Khoa học và Công nghệ TP. Đà Nẵng", OrganizationUnitTypes.Provincial, root.Id, "DN");
        var bn = new OrganizationUnit("SO-KHCN-BN", "Sở Khoa học và Công nghệ Tỉnh Bắc Ninh", OrganizationUnitTypes.Provincial, root.Id, "BN");

        db.Set<OrganizationUnit>().AddRange(hn, hcm, hp, dn, bn);

        // Level 3: Institutions
        var hust = new OrganizationUnit("DH-BACHKHOA-HN", "Đại học Bách Khoa Hà Nội", OrganizationUnitTypes.Institution, hn.Id, "HN");
        var nacenInst = new OrganizationUnit("VIEN-NACENTECH", "Viện Ứng Dụng Công Nghệ (NacenTech)", OrganizationUnitTypes.Institution, hn.Id, "HN");
        var vnuhcm = new OrganizationUnit("DHQG-HCM", "Đại học Quốc gia TP. Hồ Chí Minh", OrganizationUnitTypes.Institution, hcm.Id, "SG");

        db.Set<OrganizationUnit>().AddRange(hust, nacenInst, vnuhcm);

        await uow.CommitAsync(ct);
    }

    public async Task<OrganizationUnitDto> CreateUnitAsync(
        CreateOrganizationUnitCommand cmd,
        ICurrentActor actor,
        string ipAddress,
        CancellationToken ct)
    {
        if (!PlatformRoles.IsAdministrative(actor.PlatformRole))
        {
            throw new ForbiddenException("Chỉ Quản trị viên (ADMIN) mới có quyền tạo đơn vị liên kết mới.");
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

    public async Task<OrganizationUnitDto> UpdateUnitAsync(
        Guid id,
        UpdateOrganizationUnitCommand cmd,
        ICurrentActor actor,
        string ipAddress,
        CancellationToken ct)
    {
        if (!PlatformRoles.IsAdministrative(actor.PlatformRole))
        {
            throw new ForbiddenException("Chỉ Quản trị viên (ADMIN) mới có quyền cập nhật thông tin đơn vị.");
        }

        var unit = await db.Set<OrganizationUnit>().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (unit is null)
        {
            throw new NotFoundException($"Không tìm thấy đơn vị với ID '{id}'.");
        }

        unit.Update(cmd.Name, cmd.ProvinceId);

        var audit = new ApprovalAuditLog(
            actor.PersonId ?? Guid.Empty,
            actor.PlatformRole,
            "UPDATE_ORG_UNIT",
            "organization_units",
            unit.Id.ToString(),
            ipAddress,
            $"{{\"name\":\"{cmd.Name}\",\"provinceId\":\"{cmd.ProvinceId}\"}}");

        db.Set<ApprovalAuditLog>().Add(audit);

        await uow.CommitAsync(ct);
        return ToDto(unit);
    }

    public async Task DeactivateUnitAsync(
        Guid id,
        ICurrentActor actor,
        string ipAddress,
        CancellationToken ct)
    {
        if (!PlatformRoles.IsAdministrative(actor.PlatformRole))
        {
            throw new ForbiddenException("Chỉ Quản trị viên (ADMIN) mới có quyền vô hiệu hóa đơn vị.");
        }

        var unit = await db.Set<OrganizationUnit>().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (unit is null)
        {
            throw new NotFoundException($"Không tìm thấy đơn vị với ID '{id}'.");
        }

        // BR-TREE-003: Chặn vô hiệu hóa / xoá node cha khi còn node con active trực thuộc
        var hasActiveChildren = await db.Set<OrganizationUnit>()
            .AsNoTracking()
            .AnyAsync(x => x.ParentId == id && x.Status == OrganizationUnitStatuses.Active, ct);

        if (hasActiveChildren)
        {
            throw new ConflictException("Không thể vô hiệu hóa đơn vị khi còn cơ sở con trực thuộc đang hoạt động. Vui lòng vô hiệu hóa các cơ sở con trước.");
        }

        unit.Deactivate();

        var audit = new ApprovalAuditLog(
            actor.PersonId ?? Guid.Empty,
            actor.PlatformRole,
            "DEACTIVATE_ORG_UNIT",
            "organization_units",
            unit.Id.ToString(),
            ipAddress,
            $"{{\"status\":\"INACTIVE\",\"code\":\"{unit.Code}\"}}");

        db.Set<ApprovalAuditLog>().Add(audit);

        await uow.CommitAsync(ct);
    }

    public Task<PersonDto> ProvisionProvinceLeaderAsync(
        ProvisionProvinceAdminCommand cmd,
        ICurrentActor actor,
        string ipAddress,
        CancellationToken ct)
    {
        throw new ForbiddenException("Hệ thống BACLINK đã hợp nhất quản trị 1 cấp ADMIN, bãi bỏ khởi tạo tài khoản Lãnh đạo Sở KH&CN.", "ERR_PROVINCIAL_ADMIN_DEPRECATED");
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

