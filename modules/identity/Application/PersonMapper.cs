using NacenTech.Kernel.Application;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Modules.Identity.Application;

public static class PersonMapper
{
    public static PersonDto ToDto(Person p) => new(
        p.Id, p.Email, p.FirstName, p.LastName, p.Phone, p.OrganizationName, p.PlatformRole, p.IsActive, p.CreatedAt, p.UpdatedAt, p.ScopeType, p.ScopeId);

    public static PersonBrief ToBrief(Person p) => new(
        p.Id, p.Email, p.FirstName, p.LastName, p.Phone, p.OrganizationName, p.PlatformRole, p.IsActive, p.CreatedAt, p.UpdatedAt, p.ScopeType, p.ScopeId);

    public static PersonPreferencesDto ToPreferences(Person p) => new(p.Id, p.Id, p.MatchingAuto, p.CreatedAt, p.PreferencesUpdatedAt);
}
