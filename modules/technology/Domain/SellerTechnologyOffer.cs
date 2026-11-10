using System;
using System.Collections.Generic;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Technology.Domain;

public sealed class SellerTechnologyOffer : AggregateRoot
{
    private readonly List<OfferSpecValue> _specValues = [];
    private readonly List<OfferDocument> _documents = [];

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
        string? enterpriseName = null,
        string? mainImageUrl = null,
        List<string>? galleryImageUrls = null,
        string? deliveryTimeline = null,
        string? warrantyTerms = null,
        string? supplyScope = null,
        string? paymentTerms = null,
        bool installationSupport = true,
        string? modelCode = null,
        string? manufacturer = null,
        string? originCountry = null,
        string? equipmentStatus = "NEW",
        int? manufacturingYear = null,
        string? capacityScale = null,
        string? energyConsumption = null,
        string? automationLevel = null,
        string? operatingPrinciple = null,
        string? deploymentConditions = null,
        string? transferPriorityMethod = null,
        string? priceIncludes = null,
        string? taxAndExtraCosts = null,
        string? technicalSupportMethod = null,
        DateOnly? ipIssueDate = null,
        bool legalCommitmentConfirmed = false)
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
        MainImageUrl = mainImageUrl;
        GalleryImageUrls = galleryImageUrls;
        DeliveryTimeline = deliveryTimeline;
        WarrantyTerms = warrantyTerms;
        SupplyScope = supplyScope;
        PaymentTerms = paymentTerms;
        InstallationSupport = installationSupport;
        ModelCode = modelCode;
        Manufacturer = manufacturer;
        OriginCountry = originCountry;
        EquipmentStatus = equipmentStatus ?? "NEW";
        ManufacturingYear = manufacturingYear;
        CapacityScale = capacityScale;
        EnergyConsumption = energyConsumption;
        AutomationLevel = automationLevel;
        OperatingPrinciple = operatingPrinciple;
        DeploymentConditions = deploymentConditions;
        TransferPriorityMethod = transferPriorityMethod;
        PriceIncludes = priceIncludes;
        TaxAndExtraCosts = taxAndExtraCosts;
        TechnicalSupportMethod = technicalSupportMethod;
        IpIssueDate = ipIssueDate;
        LegalCommitmentConfirmed = legalCommitmentConfirmed;
        TrlVerificationStatus = hasTechTransfer ? "SELF_DECLARED" : "NOT_APPLICABLE";
        IpVerificationStatus = hasTechTransfer ? (string.IsNullOrWhiteSpace(ipStatus) || ipStatus == "NONE" ? "NOT_APPLICABLE" : "SELF_DECLARED") : "NOT_APPLICABLE";
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

    // Delta v5 Extensions
    public string? MainImageUrl { get; private set; }
    public List<string>? GalleryImageUrls { get; private set; }
    public string? DeliveryTimeline { get; private set; }
    public string? WarrantyTerms { get; private set; }
    public string? SupplyScope { get; private set; }
    public string? PaymentTerms { get; private set; }
    public bool InstallationSupport { get; private set; } = true;

    // Delta v6 Extensions: Lớp 2 (Kỹ thuật chung)
    public string? ModelCode { get; private set; }
    public string? Manufacturer { get; private set; }
    public string? OriginCountry { get; private set; }
    public string EquipmentStatus { get; private set; } = "NEW";
    public int? ManufacturingYear { get; private set; }
    public string? CapacityScale { get; private set; }
    public string? EnergyConsumption { get; private set; }
    public string? AutomationLevel { get; private set; }
    public string? OperatingPrinciple { get; private set; }
    public string? DeploymentConditions { get; private set; }

    // Delta v6 Extensions: Lớp 4 (Thương mại chi tiết)
    public string? TransferPriorityMethod { get; private set; }
    public string? PriceIncludes { get; private set; }
    public string? TaxAndExtraCosts { get; private set; }
    public string? TechnicalSupportMethod { get; private set; }

    // Delta v6 Extensions: Pháp lý & SHTT
    public DateOnly? IpIssueDate { get; private set; }
    public bool LegalCommitmentConfirmed { get; private set; } = false;

    // Two-tier Verification (CR-2026-TRL-TNI-VERIFY)
    // TrlVerificationStatus: SELF_DECLARED, PENDING_VERIFICATION, VERIFIED_BY_GOV, REJECTED_TRL
    public string TrlVerificationStatus { get; private set; } = "SELF_DECLARED";
    // IpVerificationStatus: NOT_APPLICABLE, SELF_DECLARED, PENDING_VERIFICATION, VERIFIED_BY_GOV, REJECTED_IP
    public string IpVerificationStatus { get; private set; } = "SELF_DECLARED";
    public string? VerifiedAuthorityName { get; private set; }
    public Guid? TrlVerifiedBy { get; private set; }
    public DateTimeOffset? TrlVerifiedAt { get; private set; }
    public string? TrlReviewNote { get; private set; }

    // DEFECT-09: Soft Delete to preserve audit & deal room relations
    public bool IsDeleted { get; private set; } = false;
    public DateTimeOffset? DeletedAt { get; private set; }

    public void SoftDelete()
    {
        IsDeleted = true;
        DeletedAt = DateTimeOffset.UtcNow;
        Status = "DELETED";
        Touch();
    }

    public IReadOnlyCollection<OfferSpecValue> SpecValues => _specValues.AsReadOnly();
    public IReadOnlyCollection<OfferDocument> Documents => _documents.AsReadOnly();

    public void AddSpecValue(OfferSpecValue spec) => _specValues.Add(spec);
    public void ClearSpecValues() => _specValues.Clear();

    public void AddDocument(OfferDocument doc) => _documents.Add(doc);
    public void ClearDocuments() => _documents.Clear();

    public void SetMediaAndCommercial(
        string? mainImageUrl,
        List<string>? galleryImageUrls,
        string? deliveryTimeline,
        string? warrantyTerms,
        string? supplyScope,
        string? paymentTerms,
        bool installationSupport)
    {
        MainImageUrl = mainImageUrl;
        GalleryImageUrls = galleryImageUrls;
        DeliveryTimeline = deliveryTimeline;
        WarrantyTerms = warrantyTerms;
        SupplyScope = supplyScope;
        PaymentTerms = paymentTerms;
        InstallationSupport = installationSupport;
        Touch();
    }

    public void UpdateTier2Details(
        string? modelCode,
        string? manufacturer,
        string? originCountry,
        string? equipmentStatus,
        int? manufacturingYear,
        string? capacityScale,
        string? energyConsumption,
        string? automationLevel,
        string? operatingPrinciple,
        string? deploymentConditions)
    {
        ModelCode = modelCode;
        Manufacturer = manufacturer;
        OriginCountry = originCountry;
        if (!string.IsNullOrWhiteSpace(equipmentStatus)) EquipmentStatus = equipmentStatus;
        ManufacturingYear = manufacturingYear;
        CapacityScale = capacityScale;
        EnergyConsumption = energyConsumption;
        AutomationLevel = automationLevel;
        OperatingPrinciple = operatingPrinciple;
        DeploymentConditions = deploymentConditions;
        Touch();
    }

    public void UpdateTier4Commercial(
        string? transferPriorityMethod,
        string? priceIncludes,
        string? taxAndExtraCosts,
        string? technicalSupportMethod,
        string? supplyScope,
        string? deliveryTimeline,
        string? paymentTerms,
        string? warrantyTerms,
        bool? installationSupport)
    {
        TransferPriorityMethod = transferPriorityMethod;
        PriceIncludes = priceIncludes;
        TaxAndExtraCosts = taxAndExtraCosts;
        TechnicalSupportMethod = technicalSupportMethod;
        if (supplyScope != null) SupplyScope = supplyScope;
        if (deliveryTimeline != null) DeliveryTimeline = deliveryTimeline;
        if (paymentTerms != null) PaymentTerms = paymentTerms;
        if (warrantyTerms != null) WarrantyTerms = warrantyTerms;
        if (installationSupport.HasValue) InstallationSupport = installationSupport.Value;
        Touch();
    }

    public void UpdateIpAndCommitment(
        DateOnly? ipIssueDate,
        bool legalCommitmentConfirmed)
    {
        IpIssueDate = ipIssueDate;
        LegalCommitmentConfirmed = legalCommitmentConfirmed;
        Touch();
    }

    public void SetEnterpriseLink(string? taxCode, string? name)
    {
        EnterpriseTaxCode = taxCode;
        EnterpriseName = name;
        Touch();
    }

    public void SetManagingAuthority(string? scopeId, string? authorityName)
    {
        ScopeId = scopeId;
        ScopeType = "PROVINCE";
        ManagingAuthorityId = scopeId;
        ManagingAuthorityName = authorityName;
        Touch();
    }

    public void SetStatus(string status)
    {
        Status = status;
        if (status == "APPROVED" && PublishedAt == null)
        {
            PublishedAt = DateTimeOffset.UtcNow;
        }
        else if (status != "APPROVED")
        {
            PublishedAt = null;
        }
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
                PublishedAt = null;
                break;
            case "REQUEST_CHANGES":
                Status = "CHANGES_REQUESTED";
                PublishedAt = null;
                break;
            default:
                throw new ArgumentException($"Hành động thẩm định không hợp lệ: {action}");
        }
        Touch();
    }

    public void VerifyTrl(string trlDecision, string? authorityName, Guid verifiedBy, string? note = null)
    {
        if (string.IsNullOrWhiteSpace(trlDecision))
            throw new ArgumentException("Quyết định kiểm định TRL không được để trống.", nameof(trlDecision));

        var norm = trlDecision.Trim().ToUpperInvariant();
        string mappedStatus = norm switch
        {
            "VERIFIED_BY_GOV" or "VERIFIED" or "APPROVE" or "APPROVED" => "VERIFIED_BY_GOV",
            "REJECTED_TRL" or "REJECT" or "REJECTED" => "REJECTED_TRL",
            "PENDING_VERIFICATION" => "PENDING_VERIFICATION",
            "SELF_DECLARED" => "SELF_DECLARED",
            _ => throw new ArgumentException($"Quyết định kiểm định TRL không hợp lệ: '{trlDecision}'. Chỉ chấp nhận: VERIFIED_BY_GOV, REJECTED_TRL, PENDING_VERIFICATION, SELF_DECLARED.", nameof(trlDecision))
        };

        if (mappedStatus.Length > 30)
            throw new ArgumentException("Mã trạng thái TRL vượt quá độ dài tối đa 30 ký tự.", nameof(trlDecision));

        TrlVerificationStatus = mappedStatus;
        if (!string.IsNullOrWhiteSpace(authorityName)) VerifiedAuthorityName = authorityName;
        TrlVerifiedBy = verifiedBy;
        TrlVerifiedAt = DateTimeOffset.UtcNow;
        if (note != null) TrlReviewNote = note;
        Touch();
    }

    public void VerifyIp(string ipDecision, string? authorityName, Guid verifiedBy, string? note = null)
    {
        if (string.IsNullOrWhiteSpace(ipDecision))
            throw new ArgumentException("Quyết định kiểm định SHTT không được để trống.", nameof(ipDecision));

        var norm = ipDecision.Trim().ToUpperInvariant();
        string mappedStatus = norm switch
        {
            "VERIFIED_BY_GOV" or "VERIFIED" or "APPROVE" or "APPROVED" => "VERIFIED_BY_GOV",
            "REJECTED_IP" or "REJECT" or "REJECTED" => "REJECTED_IP",
            "PENDING_VERIFICATION" => "PENDING_VERIFICATION",
            "SELF_DECLARED" => "SELF_DECLARED",
            "NOT_APPLICABLE" => "NOT_APPLICABLE",
            _ => throw new ArgumentException($"Quyết định kiểm định SHTT không hợp lệ: '{ipDecision}'. Chỉ chấp nhận: VERIFIED_BY_GOV, REJECTED_IP, PENDING_VERIFICATION, SELF_DECLARED, NOT_APPLICABLE.", nameof(ipDecision))
        };

        if (mappedStatus.Length > 30)
            throw new ArgumentException("Mã trạng thái SHTT vượt quá độ dài tối đa 30 ký tự.", nameof(ipDecision));

        IpVerificationStatus = mappedStatus;
        if (!string.IsNullOrWhiteSpace(authorityName)) VerifiedAuthorityName = authorityName;
        TrlVerifiedBy = verifiedBy;
        TrlVerifiedAt = DateTimeOffset.UtcNow;
        if (note != null) TrlReviewNote = note;
        Touch();
    }

    public void VerifyTrlAndIp(string trlDecision, string? authorityName, Guid verifiedBy, string? note = null)
    {
        VerifyTrl(trlDecision, authorityName, verifiedBy, note);
        var ipDecision = trlDecision.Trim().ToUpperInvariant() switch
        {
            "REJECTED_TRL" or "REJECT" or "REJECTED" => "REJECTED_IP",
            _ => trlDecision
        };
        VerifyIp(ipDecision, authorityName, verifiedBy, note);
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
        string? enterpriseName = null,
        string? mainImageUrl = null,
        List<string>? galleryImageUrls = null,
        string? deliveryTimeline = null,
        string? warrantyTerms = null,
        string? supplyScope = null,
        string? paymentTerms = null,
        bool? installationSupport = null,
        string? modelCode = null,
        string? manufacturer = null,
        string? originCountry = null,
        string? equipmentStatus = null,
        int? manufacturingYear = null,
        string? capacityScale = null,
        string? energyConsumption = null,
        string? automationLevel = null,
        string? operatingPrinciple = null,
        string? deploymentConditions = null,
        string? transferPriorityMethod = null,
        string? priceIncludes = null,
        string? taxAndExtraCosts = null,
        string? technicalSupportMethod = null,
        DateOnly? ipIssueDate = null,
        bool? legalCommitmentConfirmed = null)
    {
        // BR-SELLER-07: Nếu hasTechTransfer và có sự thay đổi các trường cốt lõi (TRL, IP, TransferMethod)
        // Hệ thống KHÔNG gỡ sản phẩm khỏi sàn (Status = APPROVED giữ nguyên) mà chỉ hạ cấp xác thực TRL & SHTT
        // về PENDING_VERIFICATION để Sở KH&CN hậu kiểm/tái thẩm định.
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

        if (mainImageUrl != null) MainImageUrl = mainImageUrl;
        if (galleryImageUrls != null) GalleryImageUrls = galleryImageUrls;
        if (deliveryTimeline != null) DeliveryTimeline = deliveryTimeline;
        if (warrantyTerms != null) WarrantyTerms = warrantyTerms;
        if (supplyScope != null) SupplyScope = supplyScope;
        if (paymentTerms != null) PaymentTerms = paymentTerms;
        if (installationSupport.HasValue) InstallationSupport = installationSupport.Value;

        if (modelCode != null) ModelCode = modelCode;
        if (manufacturer != null) Manufacturer = manufacturer;
        if (originCountry != null) OriginCountry = originCountry;
        if (!string.IsNullOrWhiteSpace(equipmentStatus)) EquipmentStatus = equipmentStatus;
        if (manufacturingYear.HasValue) ManufacturingYear = manufacturingYear;
        if (capacityScale != null) CapacityScale = capacityScale;
        if (energyConsumption != null) EnergyConsumption = energyConsumption;
        if (automationLevel != null) AutomationLevel = automationLevel;
        if (operatingPrinciple != null) OperatingPrinciple = operatingPrinciple;
        if (deploymentConditions != null) DeploymentConditions = deploymentConditions;

        if (transferPriorityMethod != null) TransferPriorityMethod = transferPriorityMethod;
        if (priceIncludes != null) PriceIncludes = priceIncludes;
        if (taxAndExtraCosts != null) TaxAndExtraCosts = taxAndExtraCosts;
        if (technicalSupportMethod != null) TechnicalSupportMethod = technicalSupportMethod;
        if (ipIssueDate.HasValue) IpIssueDate = ipIssueDate;
        if (legalCommitmentConfirmed.HasValue) LegalCommitmentConfirmed = legalCommitmentConfirmed.Value;

        if (coreIpChanged && Status == "APPROVED")
        {
            TrlVerificationStatus = "PENDING_VERIFICATION";
            IpVerificationStatus = "PENDING_VERIFICATION";
        }

        Touch();
    }
}
