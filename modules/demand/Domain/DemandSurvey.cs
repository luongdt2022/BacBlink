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
        Guid? createdBy = null)
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
    public string Status { get; private set; } = "DRAFT";
    public DateTimeOffset? SubmittedAt { get; private set; }
    public Guid? OrganizationId { get; private set; }
    public Guid? CreatedBy { get; private set; }

    public IReadOnlyList<DemandItem> Items => _items.AsReadOnly();

    public void AddItem(DemandItem item)
    {
        _items.Add(item);
        Touch();
    }
}
