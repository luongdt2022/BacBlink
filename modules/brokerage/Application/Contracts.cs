using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Brokerage.Application;

/// <summary>Brokerage §13.1–13.4: BrokerProfile + Assignment. AC 84: từ chối giao case vượt capacity.</summary>
public static class BrokerStatuses
{
    public const string Active = "ACTIVE";
    public const string Suspended = "SUSPENDED";
}

public static class AssignmentRoles
{
    public const string Lead = "LEAD";
    public const string Co = "CO";
}

public static class AssignmentStatuses
{
    public const string Active = "ACTIVE";
    public const string Ended = "ENDED";
}

public sealed record BrokerProfileDto(Guid Id, Guid PersonId, string Status, int Capacity, int ActiveAssignments, IReadOnlyList<Guid> SectorIds, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt, int Version);

public sealed record AssignmentDto(Guid Id, Guid CaseId, Guid BrokerPersonId, string Role, string Status, DateTimeOffset AssignedAt, DateTimeOffset? SlaDueAt, DateTimeOffset? EndedAt);

public interface IBrokerService
{
    Task<BrokerProfileDto> RegisterAsync(Guid personId, int capacity, IReadOnlyList<Guid> sectorIds, CancellationToken ct);
    Task<BrokerProfileDto?> FindByPersonAsync(Guid personId, CancellationToken ct);
    Task<PagedResult<BrokerProfileDto>> ListAsync(PageRequest page, CancellationToken ct);
    /// <summary>Ném UnprocessableException(CAPACITY_EXCEEDED) khi vượt capacity — không rơi case âm thầm (AC 84).</summary>
    Task<AssignmentDto> AssignAsync(Guid caseId, Guid brokerPersonId, string role, DateTimeOffset? slaDueAt, CancellationToken ct);
    Task EndAssignmentAsync(Guid assignmentId, CancellationToken ct);
    Task<IReadOnlyList<AssignmentDto>> ListForCaseAsync(Guid caseId, CancellationToken ct);
}
