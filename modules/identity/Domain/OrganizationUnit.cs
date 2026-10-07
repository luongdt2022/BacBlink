using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Identity.Domain;

public static class OrganizationUnitTypes
{
    public const string National = "NATIONAL";
    public const string Provincial = "PROVINCIAL";
    public const string Institution = "INSTITUTION";

    public static readonly HashSet<string> All = [National, Provincial, Institution];
}

public static class OrganizationUnitStatuses
{
    public const string Active = "ACTIVE";
    public const string Inactive = "INACTIVE";

    public static readonly HashSet<string> All = [Active, Inactive];
}

/// <summary>
/// TASK-07: Đơn vị hành chính và cơ sở liên kết (Viện/Trường/Sở) hỗ trợ cây 3 cấp (Trung ương - Tỉnh - Cơ sở).
/// </summary>
public sealed class OrganizationUnit : Entity
{
    private OrganizationUnit() { }

    public OrganizationUnit(
        string code,
        string name,
        string unitType,
        Guid? parentId = null,
        string? provinceId = null)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new ValidationException("Mã đơn vị (Code) không được để trống.");
        if (string.IsNullOrWhiteSpace(name)) throw new ValidationException("Tên đơn vị (Name) không được để trống.");
        if (!OrganizationUnitTypes.All.Contains(unitType)) throw new ValidationException($"Loại đơn vị '{unitType}' không hợp lệ.");

        Code = code.Trim().ToUpperInvariant();
        Name = name.Trim();
        UnitType = unitType;
        ParentId = parentId;
        ProvinceId = provinceId?.Trim().ToUpperInvariant();
        Status = OrganizationUnitStatuses.Active;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string UnitType { get; private set; } = OrganizationUnitTypes.National;
    public Guid? ParentId { get; private set; }
    public string? ProvinceId { get; private set; }
    public string Status { get; private set; } = OrganizationUnitStatuses.Active;
    public DateTimeOffset CreatedAtUtc { get; private set; }

    public void Deactivate()
    {
        Status = OrganizationUnitStatuses.Inactive;
    }

    public void Activate()
    {
        Status = OrganizationUnitStatuses.Active;
    }

    public void Update(string name, string? provinceId)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ValidationException("Tên đơn vị (Name) không được để trống.");
        Name = name.Trim();
        ProvinceId = provinceId?.Trim().ToUpperInvariant();
    }
}
