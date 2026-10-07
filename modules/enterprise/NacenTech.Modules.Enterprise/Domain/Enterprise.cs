using System;
using System.Collections.Generic;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Enterprise.Domain;

public class Enterprise : AggregateRoot
{
    public string SubjectType { get; set; } = "INNOVATIVE_ENTERPRISE";
    public string LegalName { get; set; } = string.Empty;
    public string AddressInfoJson { get; set; } = string.Empty;
    public string Status { get; set; } = "ACTIVE";
    
    public ICollection<EnterpriseIdentifier> Identifiers { get; set; } = new List<EnterpriseIdentifier>();
    public ICollection<EnterpriseInnovationProject> InnovationProjects { get; set; } = new List<EnterpriseInnovationProject>();
    public ICollection<EnterpriseIntellectualProperty> IntellectualProperties { get; set; } = new List<EnterpriseIntellectualProperty>();

    public void UpdateBasicInfo(string legalName, string addressInfoJson)
    {
        LegalName = legalName;
        AddressInfoJson = addressInfoJson;
        Touch();
    }
}
