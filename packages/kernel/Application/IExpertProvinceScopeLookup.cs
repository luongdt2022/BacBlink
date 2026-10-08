namespace NacenTech.Kernel.Application;

/// <summary>Cross-module lookup for authoritative province scopes; keeps Identity entities out of Brokerage.</summary>
public interface IExpertProvinceScopeLookup
{
    Task<IReadOnlyCollection<Guid>> GetPersonIdsInProvinceAsync(string provinceCode, CancellationToken ct);
    Task<IReadOnlyDictionary<Guid, string>> GetProvinceScopesAsync(IReadOnlyCollection<Guid> personIds, CancellationToken ct);
}
