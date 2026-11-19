using System;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Demand.Domain;

public sealed class DemandBookmark : Entity
{
    private DemandBookmark() { }

    public DemandBookmark(Guid personId, Guid demandItemId)
    {
        PersonId = personId;
        DemandItemId = demandItemId;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public Guid PersonId { get; private set; }
    public Guid DemandItemId { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
}
