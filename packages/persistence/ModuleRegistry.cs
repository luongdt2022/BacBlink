using NacenTech.Kernel.Application;

namespace NacenTech.Persistence;

/// <summary>
/// Danh sách module được biên dịch vào deployment này. Đây là tập con Phase 1 của 26 module tại §33.
/// Capability nào được BẬT do CapabilityProfileVersion quyết định (§9.4), không phải danh sách này.
/// </summary>
public static class ModuleRegistry
{
    public static IReadOnlyList<IModule> All { get; } =
    [
        new Modules.Identity.IdentityModule(),
        new Modules.Policy.PolicyModule(),
        new Modules.Demand.DemandModule(),
        new Modules.Technology.TechnologyModule(),
        new Modules.DataRoom.DataRoomModule(),
        new Modules.Matching.MatchingModule(),
        new Modules.Communication.CommunicationModule(),
        new Modules.Content.ContentModule(),
        new Modules.Case.CaseModule(),
        new Modules.Brokerage.BrokerageModule(),
        new Modules.Audit.AuditModule(),
        new Modules.Integration.IntegrationModule(),
        new Modules.Entitlement.EntitlementModule(),
    ];
}
