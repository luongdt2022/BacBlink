using System;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Enterprise.Domain;

public class EnterpriseIntellectualProperty : Entity
{
    public Guid EnterpriseId { get; set; }
    public string Type { get; set; } = "PATENT";
    public string Title { get; set; } = string.Empty;
    public string? RegistrationNumber { get; set; }
}
