using System;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Technology.Domain;

public sealed class SellerTechnologyOffer : AggregateRoot
{
    private SellerTechnologyOffer() { }

    public SellerTechnologyOffer(
        Guid id,
        string offerCode,
        string offerType,
        bool hasTechTransfer,
        string title,
        string summary,
        string problemSolved,
        string sectorCode,
        string sectorName,
        string pricingType,
        decimal? priceAmount,
        decimal? priceMin,
        decimal? priceMax,
        string currency,
        string? unit,
        string? developerOrigin,
        int? trlLevel,
        string? ipStatus,
        string? ipRegistrationNumber,
        string? transferMethod,
        string? commercialStatus,
        string? contactPointRole,
        string status,
        string? managingAuthorityId,
        string? managingAuthorityName,
        string? scopeType,
        string? scopeId,
        bool legalConsent = true,
        Guid? createdBy = null,
        DateTimeOffset? publishedAt = null,
        string? enterpriseTaxCode = null,
        string? enterpriseName = null)
    {
        Id = id;
        OfferCode = offerCode;
        OfferType = offerType;
        HasTechTransfer = hasTechTransfer;
        Title = title;
        Summary = summary;
        ProblemSolved = problemSolved;
        SectorCode = sectorCode;
        SectorName = sectorName;
        PricingType = pricingType;
        PriceAmount = priceAmount;
        PriceMin = priceMin;
        PriceMax = priceMax;
        Currency = currency;
        Unit = unit;
        DeveloperOrigin = developerOrigin;
        TrlLevel = trlLevel;
        IpStatus = ipStatus;
        IpRegistrationNumber = ipRegistrationNumber;
        TransferMethod = transferMethod;
        CommercialStatus = commercialStatus;
        ContactPointRole = contactPointRole;
        Status = status;
        ManagingAuthorityId = managingAuthorityId;
        ManagingAuthorityName = managingAuthorityName;
        ScopeType = scopeType;
        ScopeId = scopeId;
        LegalConsent = legalConsent;
        CreatedBy = createdBy;
        PublishedAt = publishedAt;
        EnterpriseTaxCode = enterpriseTaxCode;
        EnterpriseName = enterpriseName;
        SuccessfulConnections = 0;
        RatingScore = 5.0m;
        ReviewCount = 0;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public string OfferCode { get; private set; } = default!;
    public string OfferType { get; private set; } = default!;
    public bool HasTechTransfer { get; private set; }
    public string Title { get; private set; } = default!;
    public string Summary { get; private set; } = default!;
    public string ProblemSolved { get; private set; } = default!;
    public string SectorCode { get; private set; } = default!;
    public string SectorName { get; private set; } = default!;
    public string PricingType { get; private set; } = default!;
    public decimal? PriceAmount { get; private set; }
    public decimal? PriceMin { get; private set; }
    public decimal? PriceMax { get; private set; }
    public string Currency { get; private set; } = "VND";
    public string? Unit { get; private set; }
    public string? DeveloperOrigin { get; private set; }
    public int? TrlLevel { get; private set; }
    public string? IpStatus { get; private set; }
    public string? IpRegistrationNumber { get; private set; }
    public string? TransferMethod { get; private set; }
    public string? CommercialStatus { get; private set; }
    public string? ContactPointRole { get; private set; }
    public string Status { get; private set; } = "PENDING";
    public int SuccessfulConnections { get; private set; }
    public decimal RatingScore { get; private set; } = 5.0m;
    public int ReviewCount { get; private set; }
    public DateTimeOffset? PublishedAt { get; private set; }
    public string? ManagingAuthorityId { get; private set; }
    public string? ManagingAuthorityName { get; private set; }
    public string? ScopeType { get; private set; }
    public string? ScopeId { get; private set; }
    public bool LegalConsent { get; private set; } = true;
    public Guid? CreatedBy { get; private set; }
    public string? EnterpriseTaxCode { get; private set; }
    public string? EnterpriseName { get; private set; }

    public void SetEnterpriseLink(string? taxCode, string? name)
    {
        EnterpriseTaxCode = taxCode;
        EnterpriseName = name;
        Touch();
    }

    public void Review(string action, string? reviewNote = null)
    {
        switch (action.ToUpperInvariant())
        {
            case "APPROVE":
                Status = "APPROVED";
                PublishedAt = DateTimeOffset.UtcNow;
                break;
            case "REJECT":
                Status = "REJECTED";
                break;
            case "REQUEST_CHANGES":
                Status = "CHANGES_REQUESTED";
                break;
            default:
                throw new ArgumentException($"Hành động thẩm định không hợp lệ: {action}");
        }
        Touch();
    }

    public void Update(
        string offerType,
        bool hasTechTransfer,
        string title,
        string summary,
        string problemSolved,
        string sectorCode,
        string sectorName,
        string pricingType,
        decimal? priceAmount,
        decimal? priceMin,
        decimal? priceMax,
        string currency,
        string? unit,
        string? developerOrigin,
        int? trlLevel,
        string? ipStatus,
        string? ipRegistrationNumber,
        string? transferMethod,
        string? commercialStatus,
        string? contactPointRole,
        string? managingAuthorityId,
        string? managingAuthorityName,
        string? scopeType,
        string? scopeId,
        string? enterpriseTaxCode = null,
        string? enterpriseName = null)
    {
        // BR-SELLER-07: Nếu hasTechTransfer và có sự thay đổi các trường cốt lõi (TRL, IP, TransferMethod)
        // Hệ thống tự động chuyển về PENDING để Sở KH&CN thẩm định lại trước khi tái xuất bản
        bool coreIpChanged = HasTechTransfer && hasTechTransfer && (
            TrlLevel != trlLevel ||
            !string.Equals(IpStatus, ipStatus, StringComparison.OrdinalIgnoreCase) ||
            !string.Equals(IpRegistrationNumber, ipRegistrationNumber, StringComparison.OrdinalIgnoreCase) ||
            !string.Equals(TransferMethod, transferMethod, StringComparison.OrdinalIgnoreCase)
        );

        OfferType = offerType;
        HasTechTransfer = hasTechTransfer;
        Title = title;
        Summary = summary;
        ProblemSolved = problemSolved;
        SectorCode = sectorCode;
        SectorName = sectorName;
        PricingType = pricingType;
        PriceAmount = priceAmount;
        PriceMin = priceMin;
        PriceMax = priceMax;
        Currency = currency;
        Unit = unit;
        DeveloperOrigin = developerOrigin;
        TrlLevel = trlLevel;
        IpStatus = ipStatus;
        IpRegistrationNumber = ipRegistrationNumber;
        TransferMethod = transferMethod;
        CommercialStatus = commercialStatus;
        ContactPointRole = contactPointRole;
        ManagingAuthorityId = managingAuthorityId;
        ManagingAuthorityName = managingAuthorityName;
        ScopeType = scopeType;
        ScopeId = scopeId;
        if (!string.IsNullOrWhiteSpace(enterpriseTaxCode)) EnterpriseTaxCode = enterpriseTaxCode;
        if (!string.IsNullOrWhiteSpace(enterpriseName)) EnterpriseName = enterpriseName;

        if (coreIpChanged)
        {
            Status = "PENDING";
            PublishedAt = null;
        }

        Touch();
    }
}
