using System;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Technology.Domain;

public sealed class OfferSpecValue : Entity
{
    private OfferSpecValue() { }

    public OfferSpecValue(
        Guid offerId,
        string? specCode,
        string specName,
        string specValue,
        string? unit = null)
    {
        OfferId = offerId;
        SpecCode = specCode;
        SpecName = specName;
        SpecValue = specValue;
        Unit = unit;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public Guid OfferId { get; private set; }
    public string? SpecCode { get; private set; }
    public string SpecName { get; private set; } = default!;
    public string SpecValue { get; private set; } = default!;
    public string? Unit { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    public void Update(string specName, string specValue, string? unit, string? specCode = null)
    {
        SpecName = specName;
        SpecValue = specValue;
        Unit = unit;
        if (!string.IsNullOrWhiteSpace(specCode))
        {
            SpecCode = specCode;
        }
    }
}
