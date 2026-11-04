using System;
using System.Collections.Generic;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Demand.Domain;

public sealed class DemandSurvey : AggregateRoot
{
    private readonly List<DemandItem> _items = [];

    private DemandSurvey() { }

    public DemandSurvey(
        string surveyCode,
        string surveyType,
        string companyName,
        string? taxCode,
        string contactName,
        string contactPhone,
        string contactEmail,
        string? businessType,
        string? enterpriseSize,
        string? employeeScale,
        string? revenueRange3y,
        List<string>? topBottlenecks,
        Guid? organizationId = null,
        Guid? createdBy = null,
        string? province = null,
        string? headquartersAddress = null,
        string? surveyedFacility = null,
        string? contactTitle = null,
        string? mainIndustry = null,
        string? mainProducts = null,
        string? confirmedByName = null,
        string? confirmedByTitle = null,
        DateTimeOffset? pdpdConsentAt = null,
        string? surveyDetails = null,
        string? representativeSignatureUrl = null)
    {
        SurveyCode = surveyCode;
        SurveyType = surveyType;
        CompanyName = companyName;
        TaxCode = taxCode;
        ContactName = contactName;
        ContactPhone = contactPhone;
        ContactEmail = contactEmail;
        BusinessType = businessType;
        EnterpriseSize = enterpriseSize;
        EmployeeScale = employeeScale;
        RevenueRange3y = revenueRange3y;
        TopBottlenecks = topBottlenecks ?? [];
        OrganizationId = organizationId;
        CreatedBy = createdBy;
        Province = province;
        HeadquartersAddress = headquartersAddress;
        SurveyedFacility = surveyedFacility;
        ContactTitle = contactTitle;
        MainIndustry = mainIndustry;
        MainProducts = mainProducts;
        ConfirmedByName = confirmedByName;
        ConfirmedByTitle = confirmedByTitle;
        PdpdConsentAt = pdpdConsentAt;
        SurveyDetails = surveyDetails;
        RepresentativeSignatureUrl = representativeSignatureUrl;
        Status = "SUBMITTED";
        SubmittedAt = DateTimeOffset.UtcNow;
    }

    public string SurveyCode { get; private set; } = default!;
    public string SurveyType { get; private set; } = "ONLINE"; // ONLINE, DEEP_SURVEY, EXPO
    public string CompanyName { get; private set; } = default!;
    public string? TaxCode { get; private set; }
    public string ContactName { get; private set; } = default!;
    public string ContactPhone { get; private set; } = default!;
    public string ContactEmail { get; private set; } = default!;
    public string? BusinessType { get; private set; }
    public string? EnterpriseSize { get; private set; }
    public string? EmployeeScale { get; private set; }
    public string? RevenueRange3y { get; private set; }
    public List<string> TopBottlenecks { get; private set; } = [];
    public string? Province { get; private set; }
    public string? HeadquartersAddress { get; private set; }
    public string? SurveyedFacility { get; private set; }
    public string? ContactTitle { get; private set; }
    public string? MainIndustry { get; private set; }
    public string? MainProducts { get; private set; }
    public string? ConfirmedByName { get; private set; }
    public string? ConfirmedByTitle { get; private set; }
    public string? RepresentativeSignatureUrl { get; private set; }
    public DateTimeOffset? PdpdConsentAt { get; private set; }
    public string? SurveyDetails { get; private set; }
    public string Status { get; private set; } = "DRAFT";
    public DateTimeOffset? SubmittedAt { get; private set; }
    public Guid? OrganizationId { get; private set; }
    public Guid? CreatedBy { get; private set; }
    public Guid? EnterpriseId { get; set; }
    public string? SurveyAnswers { get; set; }
    public bool? HasRdUnit { get; set; }
    public bool? HasTechTraining { get; set; }
    public bool? HasMachineryUpgrade { get; set; }
    public bool? HasRdBudget { get; set; }
    public bool? IsExporting { get; set; }
    public bool? InValueChain { get; set; }
    public List<string> SupportNeeds { get; set; } = [];
    public string? Recommendations { get; set; }
    public decimal? TniScore { get; set; }
    public string? TniClassification { get; set; }
    public int? SurveyYear { get; set; }

    public IReadOnlyList<DemandItem> Items => _items.AsReadOnly();

    public void SetInnovationDemandDetails(
        Guid? enterpriseId,
        string? surveyAnswers,
        bool? hasRdUnit,
        bool? hasTechTraining,
        bool? hasMachineryUpgrade,
        bool? hasRdBudget,
        bool? isExporting,
        bool? inValueChain,
        List<string>? supportNeeds,
        string? recommendations,
        decimal? tniScore,
        string? tniClassification,
        int? surveyYear = null)
    {
        EnterpriseId = enterpriseId;
        SurveyAnswers = surveyAnswers;
        HasRdUnit = hasRdUnit;
        HasTechTraining = hasTechTraining;
        HasMachineryUpgrade = hasMachineryUpgrade;
        HasRdBudget = hasRdBudget;
        IsExporting = isExporting;
        InValueChain = inValueChain;
        SupportNeeds = supportNeeds ?? [];
        Recommendations = recommendations;
        TniScore = tniScore;
        TniClassification = tniClassification;
        SurveyYear = surveyYear ?? DateTime.UtcNow.Year;
        Touch();
    }

    public void AddItem(DemandItem item)
    {
        _items.Add(item);
        Touch();
    }
}
