namespace NacenTech.Kernel.Application;

/// <summary>
/// Actor đang thực hiện request. PersonId là surrogate id dùng làm actorRef trong audit (§23.5).
/// PlatformRole: "USER" | "ADMIN" | "SYSTEM". Case role/purpose đến từ AccessGrant, không từ token.
/// </summary>
public interface ICurrentActor
{
    bool IsAuthenticated { get; }
    Guid? PersonId { get; }
    string? Email { get; }
    string PlatformRole { get; }
    string ScopeType { get; }
    string? ScopeId { get; }
    string? IpAddress { get; }
    string? UserAgent { get; }
    string CorrelationId { get; }

    Guid RequirePersonId();
}

public static class PlatformRoles
{
    public const string Anonymous = "ANONYMOUS";
    public const string User = "USER";
    public const string Admin = "ADMIN";
    public const string System = "SYSTEM";

    // --- 10 Vai Trò Hạt Nhân Phân Tầng (Multi-Tier Scoped RBAC) ---
    public const string SuperAdmin = "SUPER_ADMIN";
    public const string OperatorAdmin = "OPERATOR_ADMIN";
    public const string ProvincialAdmin = "PROVINCIAL_ADMIN";
    public const string SectorAdmin = "SECTOR_ADMIN";
    public const string ClusterAdmin = "CLUSTER_ADMIN";
    public const string Seller = "SELLER";
    public const string Buyer = "BUYER";
    public const string InnovationEntity = "INNOVATION_ENTITY";
    public const string VerifiedExpert = "VERIFIED_EXPERT";
    public const string PublicUser = "PUBLIC_USER";

    /// <summary>Danh mục role có thể được tạo/gán bởi các use case mới. Role legacy không được cấp mới.</summary>
    public static readonly IReadOnlySet<string> Core = new HashSet<string>(StringComparer.Ordinal)
    {
        SuperAdmin, OperatorAdmin,
        ProvincialAdmin, SectorAdmin, ClusterAdmin,
        Seller, Buyer, InnovationEntity, VerifiedExpert,
        PublicUser,
    };

    public static bool IsCore(string? role) => role is not null && Core.Contains(role);

    public static bool IsAdministrative(string? role)
        => role is Admin or SuperAdmin or OperatorAdmin;
}

public static class ScopeTypes
{
    public const string Global = "GLOBAL";
    public const string Province = "PROVINCE";
    public const string Sector = "SECTOR";
    public const string OrgUnit = "ORG_UNIT";

    public static readonly IReadOnlySet<string> All = new HashSet<string>(StringComparer.Ordinal)
    {
        Global, Province, Sector, OrgUnit,
    };

    /// <summary>
    /// Kiểm tra cặp role/scope trước khi ghi. Tầng 0 và PUBLIC_USER luôn toàn cục; ba role quản trị phân cấp
    /// phải mang đúng loại scope. Role tầng 2 dùng scope theo hồ sơ đã được duyệt nên nhận mọi scope hợp lệ.
    /// </summary>
    public static bool IsValidForRole(string role, string scopeType, string? scopeId)
    {
        if (!PlatformRoles.IsCore(role) || !All.Contains(scopeType)) return false;
        if (scopeType == Global && !string.IsNullOrWhiteSpace(scopeId)) return false;
        if (scopeType != Global && string.IsNullOrWhiteSpace(scopeId)) return false;

        return role switch
        {
            PlatformRoles.SuperAdmin or PlatformRoles.OperatorAdmin or PlatformRoles.PublicUser
                => scopeType == Global,
            PlatformRoles.ProvincialAdmin => scopeType == Province,
            PlatformRoles.SectorAdmin => scopeType == Sector,
            PlatformRoles.ClusterAdmin => scopeType == OrgUnit,
            _ => true,
        };
    }
}

/// <summary>Actor hệ thống cho worker/ETL (không có người thật).</summary>
public sealed class SystemActor(string correlationId) : ICurrentActor
{
    public bool IsAuthenticated => true;
    public Guid? PersonId => null;
    public string? Email => null;
    public string PlatformRole => PlatformRoles.System;
    public string ScopeType => ScopeTypes.Global;
    public string? ScopeId => null;
    public string? IpAddress => null;
    public string? UserAgent => null;
    public string CorrelationId { get; } = correlationId;
    public Guid RequirePersonId() => throw new InvalidOperationException("System actor không có PersonId.");
}
