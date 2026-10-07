using System;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Enterprise.Domain;

public class EnterpriseInnovationProject : Entity
{
    public Guid EnterpriseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
