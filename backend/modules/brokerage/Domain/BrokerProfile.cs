using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Application;

namespace NacenTech.Modules.Brokerage.Domain;

/// <summary>§13.1: broker có capacity đo được. AC 84: vượt capacity thành hàng đợi có owner, không giao thêm case.</summary>
public sealed class BrokerProfile : AggregateRoot
{
    private BrokerProfile() { }

    public BrokerProfile(Guid personId, int capacity, IReadOnlyList<Guid> sectorIds)
    {
        if (capacity <= 0) throw new ValidationException("capacity phải lớn hơn 0");
        PersonId = personId;
        Capacity = capacity;
        SectorIds = sectorIds.ToArray();
        Status = BrokerStatuses.Active;
    }

    public Guid PersonId { get; private set; }
    public string Status { get; private set; } = BrokerStatuses.Active;
    public int Capacity { get; private set; }
    public Guid[] SectorIds { get; private set; } = [];

    public void Suspend()
    {
        Status = BrokerStatuses.Suspended;
        Touch();
    }

    public void Reactivate()
    {
        Status = BrokerStatuses.Active;
        Touch();
    }

    public void SetCapacity(int capacity)
    {
        if (capacity <= 0) throw new ValidationException("capacity phải lớn hơn 0");
        Capacity = capacity;
        Touch();
    }
}

public sealed class Assignment : AggregateRoot
{
    private Assignment() { }

    public Assignment(Guid caseId, Guid brokerPersonId, string role, DateTimeOffset assignedAt, DateTimeOffset? slaDueAt)
    {
        CaseId = caseId;
        BrokerPersonId = brokerPersonId;
        Role = role;
        Status = AssignmentStatuses.Active;
        AssignedAt = assignedAt;
        SlaDueAt = slaDueAt;
    }

    public Guid CaseId { get; private set; }
    public Guid BrokerPersonId { get; private set; }
    public string Role { get; private set; } = AssignmentRoles.Lead;
    public string Status { get; private set; } = AssignmentStatuses.Active;
    public DateTimeOffset AssignedAt { get; private set; }
    public DateTimeOffset? SlaDueAt { get; private set; }
    public DateTimeOffset? EndedAt { get; private set; }

    public void End(DateTimeOffset now)
    {
        Status = AssignmentStatuses.Ended;
        EndedAt = now;
        Touch();
    }
}
