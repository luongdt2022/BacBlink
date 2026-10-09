using System;
using System.Collections.Generic;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Enterprise.Domain;

public class Enterprise : AggregateRoot
{
    public Enterprise() { }
    public Enterprise(Guid id) { Id = id; }

    public string SubjectType { get; set; } = "ENTERPRISE";
    public string LegalName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string TaxCode { get; set; } = string.Empty;
    public string ProvinceCity { get; set; } = string.Empty;
    public string MainSectorName { get; set; } = string.Empty;
    public string? SectorCode { get; set; }
    public string? OwnershipType { get; set; }
    public string? WorkforceScale { get; set; }
    public string? RevenueRange { get; set; }
    public string? OperatingZone { get; set; }
    public string? HighQualificationRatio { get; set; }
    
    public string Status { get; set; } = "ACTIVE";
    public string VerificationStatus { get; set; } = "DRAFT"; // DRAFT, SUBMITTED, VERIFIED, REJECTED
    public bool IsVerified { get; set; } = false;
    
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public bool IsContactPublic { get; set; } = false;
    
    public string? EstablishedDate { get; set; }
    public string? AddressDetail { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
    
    public bool HasRdUnit { get; set; } = false;
    public bool HasRdBudget { get; set; } = false;
    public decimal? RdBudgetAmount { get; set; }
    public int? RdPersonnelCount { get; set; }
    public bool IsExporting { get; set; } = false;
    public bool InValueChain { get; set; } = false;
    
    public decimal? TniScore { get; set; }
    public string? TniClassification { get; set; }
    
    public string AddressInfoJson { get; set; } = "{}";
    public string ProfileDetailsJson { get; set; } = "{}";
    public string TopBottlenecksJson { get; set; } = "[]";
    public string SupportNeedsJson { get; set; } = "[]";
    
    public ICollection<EnterpriseIdentifier> Identifiers { get; set; } = new List<EnterpriseIdentifier>();
    public ICollection<EnterpriseInnovationProject> InnovationProjects { get; set; } = new List<EnterpriseInnovationProject>();
    public ICollection<EnterpriseIntellectualProperty> IntellectualProperties { get; set; } = new List<EnterpriseIntellectualProperty>();

    public void UpdateBasicInfo(string legalName, string addressInfoJson)
    {
        LegalName = legalName;
        Name = legalName;
        AddressInfoJson = addressInfoJson;
        Touch();
    }

    public void SubmitVerification()
    {
        if (string.IsNullOrWhiteSpace(LegalName) && string.IsNullOrWhiteSpace(Name))
            throw new InvalidOperationException("BR-02-003: Tên doanh nghiệp không được để trống.");
        if (string.IsNullOrWhiteSpace(TaxCode))
            throw new InvalidOperationException("BR-02-003: Mã số thuế không được để trống.");
        if (string.IsNullOrWhiteSpace(ProvinceCity))
            throw new InvalidOperationException("BR-02-003: Tỉnh/Thành phố không được để trống.");
        if (string.IsNullOrWhiteSpace(MainSectorName))
            throw new InvalidOperationException("BR-02-003: Ngành hoạt động chính không được để trống.");

        VerificationStatus = "SUBMITTED";
        Touch();
    }

    public void Approve(string approvedBy)
    {
        VerificationStatus = "VERIFIED";
        IsVerified = true;
        Touch();
    }

    public void TouchEntity() => Touch();

    public void Reject(string reason)
    {
        VerificationStatus = "REJECTED";
        IsVerified = false;
        Touch();
    }
}
