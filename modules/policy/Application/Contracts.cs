namespace NacenTech.Modules.Policy.Application;

/// <summary>Taxonomy có quản trị (§9.4.2 "cấu hình versioned"): sector và category kế thừa từ NacenTwin.</summary>
public static class TaxonomyKinds
{
    public const string Sector = "SECTOR";
    public const string Category = "CATEGORY";
}

public sealed record TaxonomyTermDto(Guid Id, string Kind, string Name, bool IsActive);

public interface ITaxonomyService
{
    Task<IReadOnlyList<TaxonomyTermDto>> ListAsync(string kind, bool activeOnly, CancellationToken ct);
    Task<TaxonomyTermDto?> FindAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyDictionary<Guid, TaxonomyTermDto>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct);
    Task<TaxonomyTermDto> CreateAsync(string kind, string name, CancellationToken ct);
    Task<TaxonomyTermDto> RenameAsync(Guid id, string name, CancellationToken ct);
    /// <summary>Xóa = deactivate (append-only spirit); term đã gắn vào subject vẫn resolve được tên.</summary>
    Task DeleteAsync(Guid id, CancellationToken ct);
}

/// <summary>PolicySnapshot §9.3: JSONB bất biến, resolve tại QUALIFICATION.</summary>
public sealed record PolicySnapshotDto(Guid Id, Guid CaseId, DateTimeOffset ResolvedAt, string PlatformPolicyVersion, string TrackPolicyVersion, string DocumentJson, string DocumentHash, Guid? SupersedesId);

public interface IPolicySnapshotService
{
    /// <summary>Resolve rule mà case chạm tới theo track; lưu inline JSONB + hash JCS. Idempotent theo caseId khi chưa supersede.</summary>
    Task<PolicySnapshotDto> ResolveForCaseAsync(Guid caseId, string track, CancellationToken ct);
    Task<PolicySnapshotDto?> FindAsync(Guid snapshotId, CancellationToken ct);
}
