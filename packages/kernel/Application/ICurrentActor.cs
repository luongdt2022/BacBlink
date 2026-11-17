namespace NacenTech.Kernel.Application;

/// <summary>
/// Actor đang thực hiện request. PersonId là surrogate id dùng làm actorRef trong audit (§23.5).
/// PlatformRole 3 cấp chuẩn hóa (CR-BACLINK-001): "ADMIN" | "ENTERPRISE" | "PUBLIC_USER" (cùng "ANONYMOUS" / "SYSTEM").
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
    public const string System = "SYSTEM";

    // --- 3 Cấp Vai Trò Chuẩn Hóa BACLINK (CR-BACLINK-001) ---
    public const string Admin = "ADMIN";
    public const string Enterprise = "ENTERPRISE";
    public const string PublicUser = "PUBLIC_USER";

    // --- Hằng số Legacy giữ lại phục vụ tương thích ngược token/DB chuyển tiếp ---
    [Obsolete("CR-BACLINK-001: Thu gọn về PlatformRoles.Admin. Dùng PlatformRoles.NormalizeTier().")]
    public const string SuperAdmin = "SUPER_ADMIN";

    [Obsolete("CR-BACLINK-001: Thu gọn về PlatformRoles.Admin. Dùng PlatformRoles.NormalizeTier().")]
    public const string OperatorAdmin = "OPERATOR_ADMIN";

    [Obsolete("CR-BACLINK-001: Bãi bỏ quản trị theo Sở Tỉnh; chuẩn hóa về PublicUser qua NormalizeTier().")]
    public const string ProvincialAdmin = "PROVINCIAL_ADMIN";

    [Obsolete("CR-BACLINK-001: Bãi bỏ quản trị theo Ngành; chuẩn hóa về PublicUser qua NormalizeTier().")]
    public const string SectorAdmin = "SECTOR_ADMIN";

    [Obsolete("CR-BACLINK-001: Bãi bỏ chuyên viên Sở Tỉnh; chuẩn hóa về PublicUser qua NormalizeTier().")]
    public const string ClusterAdmin = "CLUSTER_ADMIN";

    [Obsolete("CR-BACLINK-001: Hợp nhất vào PlatformRoles.Enterprise (Dual-Mode). Dùng PlatformRoles.NormalizeTier().")]
    public const string Seller = "SELLER";

    [Obsolete("CR-BACLINK-001: Hợp nhất vào PlatformRoles.Enterprise (Dual-Mode). Dùng PlatformRoles.NormalizeTier().")]
    public const string Buyer = "BUYER";

    [Obsolete("CR-BACLINK-001: Hợp nhất vào PlatformRoles.Enterprise (Dual-Mode). Dùng PlatformRoles.NormalizeTier().")]
    public const string InnovationEntity = "INNOVATION_ENTITY";

    [Obsolete("CR-BACLINK-001: Hợp nhất vào PlatformRoles.Enterprise (Dual-Mode). Dùng PlatformRoles.NormalizeTier().")]
    public const string VerifiedExpert = "VERIFIED_EXPERT";

    /// <summary>Danh mục 3 vai trò chuẩn hóa của BACLINK (không tạo role thứ 4).</summary>
    public static readonly IReadOnlySet<string> Core = new HashSet<string>(StringComparer.Ordinal)
    {
        Admin,
        Enterprise,
        PublicUser,
    };

    public static bool IsCore(string? role) => role is not null && Core.Contains(role);

    /// <summary>Chuẩn hóa bất kỳ mã role nào (kể cả legacy JWT/DB) về 1 trong 3 cấp: ADMIN | ENTERPRISE | PUBLIC_USER.</summary>
    public static string NormalizeTier(string? role)
    {
        if (string.IsNullOrWhiteSpace(role)) return PublicUser;
        return role.Trim().ToUpperInvariant() switch
        {
            Admin or "SUPER_ADMIN" or "OPERATOR_ADMIN" => Admin,
            Enterprise or "SELLER" or "BUYER" or "INNOVATION_ENTITY" or "VERIFIED_EXPERT" => Enterprise,
            PublicUser or User or "PROVINCIAL_ADMIN" or "SECTOR_ADMIN" or "CLUSTER_ADMIN" => PublicUser,
            _ => PublicUser,
        };
    }

    public static bool IsAdministrative(string? role)
    {
#pragma warning disable CS0618
        return role is Admin or SuperAdmin or OperatorAdmin;
#pragma warning restore CS0618
    }

    public static bool IsEnterprise(string? role)
        => NormalizeTier(role) == Enterprise;
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
    /// Kiểm tra cặp role/scope trước khi ghi. Trong BACLINK 3 cấp (ADMIN, ENTERPRISE, PUBLIC_USER),
    /// mọi vai trò chuẩn hóa đều dùng ScopeTypes.Global với scopeId = null.
    /// </summary>
    public static bool IsValidForRole(string role, string scopeType, string? scopeId)
    {
        if (!PlatformRoles.IsCore(role) || !All.Contains(scopeType)) return false;
        if (scopeType == Global && !string.IsNullOrWhiteSpace(scopeId)) return false;
        if (scopeType != Global && string.IsNullOrWhiteSpace(scopeId)) return false;

        return role switch
        {
            PlatformRoles.Admin or PlatformRoles.Enterprise or PlatformRoles.PublicUser
                => scopeType == Global,
            _ => false,
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
