using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Technology.Application;

public static class OfferTypes
{
    public const string Product = "PRODUCT";
    public const string Device = "DEVICE";
    public const string Solution = "SOLUTION";

    public static readonly string[] All = [Product, Device, Solution];
}

public static class IntellectualPropertyStatuses
{
    public const string PatentGranted = "PATENT_GRANTED";
    public const string UtilityModel = "UTILITY_MODEL";
    public const string TradeSecret = "TRADE_SECRET";
    public const string PatentPending = "PATENT_PENDING";
    public const string SoftwareCopyright = "SOFTWARE_COPYRIGHT";
    public const string None = "NONE";

    public static readonly string[] All = [PatentGranted, UtilityModel, TradeSecret, PatentPending, SoftwareCopyright, None];
}

public static class TransferMethods
{
    public const string ExclusiveLicense = "EXCLUSIVE_LICENSE";
    public const string NonExclusiveLicense = "NON_EXCLUSIVE_LICENSE";
    public const string AssignmentSale = "ASSIGNMENT_SALE";
    public const string JointRd = "JOINT_RD";
    public const string CapitalContribution = "CAPITAL_CONTRIBUTION";

    public static readonly string[] All = [ExclusiveLicense, NonExclusiveLicense, AssignmentSale, JointRd, CapitalContribution];
}

public static class CommercializationStatuses
{
    public const string LabPrototype = "LAB_PROTOTYPE";
    public const string PilotTesting = "PILOT_TESTING";
    public const string CommerciallyReady = "COMMERCIALLY_READY";
    public const string SeekingManufacturer = "SEEKING_MANUFACTURER";

    public static readonly string[] All = [LabPrototype, PilotTesting, CommerciallyReady, SeekingManufacturer];
}

public static class PricingTypes
{
    public const string Fixed = "FIXED";
    public const string Range = "RANGE";
    public const string Contact = "CONTACT";

    public static readonly string[] All = [Fixed, Range, Contact];
}

public static class DocumentTypes
{
    public const string Catalogue = "CATALOGUE";
    public const string PatentCert = "PATENT_CERT";
    public const string TrlEvidence = "TRL_EVIDENCE";
    public const string Video = "VIDEO";
    public const string Other = "OTHER";

    public static readonly string[] All = [Catalogue, PatentCert, TrlEvidence, Video, Other];
}

public static class AccessScopes
{
    public const string Public = "PUBLIC";
    public const string AfterConnection = "AFTER_CONNECTION";
    public const string AdminOnly = "ADMIN_ONLY";

    public static readonly string[] All = [Public, AfterConnection, AdminOnly];
}

public sealed record OfferSpecValueDto(
    Guid? Id,
    string? SpecCode,
    string SpecName,
    string SpecValue,
    string? Unit,
    string SpecCategory = "TIER_3_CUSTOM"
);

public sealed record OfferDocumentDto(
    Guid? Id,
    string DocumentType, // CATALOGUE | PATENT_CERT | TRL_EVIDENCE | VIDEO | OTHER
    string FileName,
    string FileUrl,
    long FileSizeBytes,
    string AccessScope // PUBLIC | AFTER_CONNECTION | ADMIN_ONLY
);

public sealed record CreateSellerOfferDto(
    string OfferType,
    bool HasTechTransfer,
    string Title,
    string Summary,
    string ProblemSolved,
    string SectorCode,
    string PricingType,
    decimal? PriceAmount,
    decimal? PriceMin,
    decimal? PriceMax,
    string Currency,
    string? Unit,
    string? DeveloperOrigin,
    int? TrlLevel,
    string? IpStatus,
    string? IpRegistrationNumber,
    string? TransferMethod,
    string? CommercialStatus,
    string? ContactPointRole,
    string? ManagingAuthorityId = "VN-HN",
    string? ManagingAuthorityName = "Sở Khoa học và Công nghệ TP. Hà Nội",
    string? ScopeType = "PROVINCE",
    string? ScopeId = "VN-HN",
    bool LegalConsent = true,
    string? EnterpriseTaxCode = null,
    string? EnterpriseName = null,
    // Delta v5 extensions
    string? MainImageUrl = null,
    IReadOnlyList<string>? GalleryImageUrls = null,
    string? DeliveryTimeline = null,
    string? WarrantyTerms = null,
    string? SupplyScope = null,
    string? PaymentTerms = null,
    bool InstallationSupport = true,
    IReadOnlyList<OfferSpecValueDto>? SpecValues = null,
    IReadOnlyList<OfferDocumentDto>? Documents = null,
    string? Action = "SUBMIT_FOR_REVIEW", // SAVE_DRAFT | SUBMIT_FOR_REVIEW
    string? ContactName = null,
    string? ContactEmail = null,
    string? ContactPhone = null,
    // Delta v6 extensions
    int CurrentStep = 4,
    string? ShortDescription = null,
    string? ModelCode = null,
    string? Manufacturer = null,
    string? OriginCountry = null,
    string? EquipmentStatus = "NEW",
    int? ManufacturingYear = null,
    string? CapacityScale = null,
    string? EnergyConsumption = null,
    string? AutomationLevel = null,
    string? OperatingPrinciple = null,
    string? DeploymentConditions = null,
    string? TransferPriorityMethod = null,
    string? PriceIncludes = null,
    string? TaxAndExtraCosts = null,
    string? TechnicalSupportMethod = null,
    DateOnly? IpIssueDate = null,
    bool LegalCommitmentConfirmed = false
);

public sealed record UpdateSellerOfferDto(
    string OfferType,
    bool HasTechTransfer,
    string Title,
    string Summary,
    string ProblemSolved,
    string SectorCode,
    string PricingType,
    decimal? PriceAmount,
    decimal? PriceMin,
    decimal? PriceMax,
    string Currency,
    string? Unit,
    string? DeveloperOrigin,
    int? TrlLevel,
    string? IpStatus,
    string? IpRegistrationNumber,
    string? TransferMethod,
    string? CommercialStatus,
    string? ContactPointRole,
    string? ManagingAuthorityId = "VN-HN",
    string? ManagingAuthorityName = "Sở Khoa học và Công nghệ TP. Hà Nội",
    string? ScopeType = "PROVINCE",
    string? ScopeId = "VN-HN",
    string? EnterpriseTaxCode = null,
    string? EnterpriseName = null,
    // Delta v5 extensions
    string? MainImageUrl = null,
    IReadOnlyList<string>? GalleryImageUrls = null,
    string? DeliveryTimeline = null,
    string? WarrantyTerms = null,
    string? SupplyScope = null,
    string? PaymentTerms = null,
    bool InstallationSupport = true,
    IReadOnlyList<OfferSpecValueDto>? SpecValues = null,
    IReadOnlyList<OfferDocumentDto>? Documents = null,
    string? Action = "SUBMIT_FOR_REVIEW",
    string? ContactName = null,
    string? ContactEmail = null,
    string? ContactPhone = null,
    // Delta v6 extensions
    int CurrentStep = 4,
    string? ShortDescription = null,
    string? ModelCode = null,
    string? Manufacturer = null,
    string? OriginCountry = null,
    string? EquipmentStatus = "NEW",
    int? ManufacturingYear = null,
    string? CapacityScale = null,
    string? EnergyConsumption = null,
    string? AutomationLevel = null,
    string? OperatingPrinciple = null,
    string? DeploymentConditions = null,
    string? TransferPriorityMethod = null,
    string? PriceIncludes = null,
    string? TaxAndExtraCosts = null,
    string? TechnicalSupportMethod = null,
    DateOnly? IpIssueDate = null,
    bool LegalCommitmentConfirmed = false
);

public sealed record SellerOfferDto(
    Guid Id,
    string OfferCode,
    string OfferType,
    bool HasTechTransfer,
    string Title,
    string Summary,
    string ProblemSolved,
    string SectorCode,
    string SectorName,
    string PricingType,
    decimal? PriceAmount,
    decimal? PriceMin,
    decimal? PriceMax,
    string Currency,
    string? Unit,
    string? DeveloperOrigin,
    int? TrlLevel,
    string? IpStatus,
    string? IpRegistrationNumber,
    string? TransferMethod,
    string? CommercialStatus,
    string? ContactPointRole,
    string Status,
    int SuccessfulConnections,
    decimal RatingScore,
    int ReviewCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset? PublishedAt,
    string? ManagingAuthorityId = "VN-HN",
    string? ManagingAuthorityName = "Sở Khoa học và Công nghệ TP. Hà Nội",
    string? ScopeType = "PROVINCE",
    string? ScopeId = "VN-HN",
    string? EnterpriseTaxCode = null,
    string? EnterpriseName = null,
    // Delta v5 extensions
    string? MainImageUrl = null,
    IReadOnlyList<string>? GalleryImageUrls = null,
    string? DeliveryTimeline = null,
    string? WarrantyTerms = null,
    string? SupplyScope = null,
    string? PaymentTerms = null,
    bool InstallationSupport = true,
    IReadOnlyList<OfferSpecValueDto>? SpecValues = null,
    IReadOnlyList<OfferDocumentDto>? Documents = null,
    string? ContactName = null,
    string? ContactEmail = null,
    string? ContactPhone = null,
    // Delta v6 extensions
    string? ModelCode = null,
    string? Manufacturer = null,
    string? OriginCountry = null,
    string? EquipmentStatus = "NEW",
    int? ManufacturingYear = null,
    string? CapacityScale = null,
    string? EnergyConsumption = null,
    string? AutomationLevel = null,
    string? OperatingPrinciple = null,
    string? DeploymentConditions = null,
    string? TransferPriorityMethod = null,
    string? PriceIncludes = null,
    string? TaxAndExtraCosts = null,
    string? TechnicalSupportMethod = null,
    DateOnly? IpIssueDate = null,
    bool LegalCommitmentConfirmed = false
);

public sealed record ReviewOfferDto(
    string Action,
    string? ReviewNote = null
);

// AI Extractor DTOs (DD-02-ai-extractor-contracts.md)
public sealed record TechTransferDraftDto(
    bool Success,
    string ExtractionId,
    double ConfidenceScore,
    TechTransferDraftData Data,
    TechTransferExtractionMetadata? ExtractionMetadata = null
);

public sealed record TechTransferDraftData(
    string? Title,
    string? TechnicalSummary,
    string? ProblemSolved,
    string? TargetSectorCode,
    string? TechGroupCode,
    IpQuadDraftData? IpQuad,
    string? OriginDeveloper,
    string? SuggestedPriceRange,
    IReadOnlyList<OfferSpecValueDto>? SuggestedSpecs = null
);

public sealed record IpQuadDraftData(
    int? TrlLevel,
    string? TrlEvidenceSummary,
    string? IpStatus,
    string? PatentNumber,
    string? PatentOwner,
    string? TransferMethod,
    string? CommercialReadiness
);

public sealed record TechTransferExtractionMetadata(
    string? ModelUsed,
    int? ProcessingTimeMs,
    IReadOnlyList<string>? HighlightFields
);

public sealed class CreateSellerOfferValidationResult
{
    public bool IsValid => Errors.Count == 0;
    public Dictionary<string, string> Errors { get; } = new();

    public void AddError(string propertyName, string errorMessage)
    {
        if (!Errors.ContainsKey(propertyName))
            Errors[propertyName] = errorMessage;
    }
}

public static class SellerOfferRulesValidator
{
    private static readonly HashSet<string> AllowedDocExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".jpg", ".jpeg", ".png", ".docx", ".xlsx", ".mp4"
    };

    /// <summary>
    /// BR-SELLER-08: Thẩm định trạng thái lưu nháp DRAFT (nới lỏng, chỉ yêu cầu Title >= 3 ký tự)
    /// </summary>
    public static CreateSellerOfferValidationResult ValidateDraft(CreateSellerOfferDto dto)
    {
        var result = new CreateSellerOfferValidationResult();

        if (string.IsNullOrWhiteSpace(dto.Title) || dto.Title.Trim().Length < 3)
        {
            result.AddError(nameof(dto.Title), "Tiêu đề hồ sơ chào bán tối thiểu phải có 3 ký tự khi lưu nháp.");
        }
        else if (dto.Title.Trim().Length > 255)
        {
            result.AddError(nameof(dto.Title), "Tên sản phẩm/công nghệ không được vượt quá 255 ký tự.");
        }

        return result;
    }

    /// <summary>
    /// Fast-Track Bước 1: Thẩm định tối thiểu để nộp duyệt ngay từ Bước 1 (BR-SELLER-08, BR-SELLER-09).
    /// Yêu cầu 6 trường lõi + Cụm giá + Bắt buộc TRL 1-9 nếu có chuyển giao công nghệ.
    /// Cho phép Bước 2, 3, 4 rỗng hoàn toàn.
    /// </summary>
    public static CreateSellerOfferValidationResult ValidateFastTrackStep1(CreateSellerOfferDto dto)
    {
        var result = new CreateSellerOfferValidationResult();

        // 1. Title
        if (string.IsNullOrWhiteSpace(dto.Title))
            result.AddError(nameof(dto.Title), "Tên sản phẩm/công nghệ không được để trống.");
        else if (dto.Title.Length > 255)
            result.AddError(nameof(dto.Title), "Tên sản phẩm/công nghệ không được vượt quá 255 ký tự.");

        // 2. Summary / ShortDescription
        var summary = !string.IsNullOrWhiteSpace(dto.Summary) ? dto.Summary : dto.ShortDescription;
        if (string.IsNullOrWhiteSpace(summary))
            result.AddError(nameof(dto.Summary), "Mô tả ngắn không được để trống.");

        // 3. ProblemSolved
        if (string.IsNullOrWhiteSpace(dto.ProblemSolved))
            result.AddError(nameof(dto.ProblemSolved), "Công dụng / bài toán giải quyết không được để trống.");

        // 4. OfferType
        if (string.IsNullOrWhiteSpace(dto.OfferType) || !OfferTypes.All.Contains(dto.OfferType.ToUpperInvariant()))
            result.AddError(nameof(dto.OfferType), "Loại hình chào bán phải là một trong các giá trị: PRODUCT, DEVICE, SOLUTION.");

        // 5. SectorCode
        if (string.IsNullOrWhiteSpace(dto.SectorCode))
            result.AddError(nameof(dto.SectorCode), "Mã ngành là bắt buộc.");
        else if (!Regex.IsMatch(dto.SectorCode, @"^[A-Za-z0-9_-]{2,20}$"))
            result.AddError(nameof(dto.SectorCode), "Mã ngành không đúng định dạng (từ 2-20 ký tự chữ số).");

        // 6. Pricing Model
        if (string.IsNullOrWhiteSpace(dto.PricingType) || !PricingTypes.All.Contains(dto.PricingType.ToUpperInvariant()))
        {
            result.AddError(nameof(dto.PricingType), "Loại giá phải là một trong các giá trị: FIXED, RANGE, CONTACT.");
        }
        else
        {
            var pType = dto.PricingType.ToUpperInvariant();
            if (pType == PricingTypes.Fixed)
            {
                if (!dto.PriceAmount.HasValue || dto.PriceAmount.Value <= 0)
                    result.AddError(nameof(dto.PriceAmount), "Khi chọn giá cố định, số tiền phải lớn hơn 0.");
            }
            else if (pType == PricingTypes.Range)
            {
                if (!dto.PriceMin.HasValue || dto.PriceMin.Value <= 0)
                    result.AddError(nameof(dto.PriceMin), "Khoảng giá từ phải lớn hơn 0.");
                if (!dto.PriceMax.HasValue || (dto.PriceMin.HasValue && dto.PriceMax.Value < dto.PriceMin.Value))
                    result.AddError(nameof(dto.PriceMax), "Khoảng giá đến phải lớn hơn hoặc bằng khoảng giá từ.");
            }
        }

        // 7. Reactive TRL: nếu HasTechTransfer = true thì bắt buộc TRL 1-9
        if (dto.HasTechTransfer)
        {
            if (!dto.TrlLevel.HasValue)
            {
                result.AddError(nameof(dto.TrlLevel), "Khi có chuyển giao công nghệ, bắt buộc chọn mức TRL (1 - 9).");
            }
            else if (dto.TrlLevel.Value < 1 || dto.TrlLevel.Value > 9)
            {
                result.AddError(nameof(dto.TrlLevel), "Mức TRL phải nằm trong khoảng từ 1 đến 9.");
            }
        }

        return result;
    }

    /// <summary>
    /// Thẩm định đầy đủ 4 bước khi nộp phê duyệt: BR-SELLER-01..13, TRL 1-9, tài liệu an toàn, specs tối đa 50 dòng, cam kết pháp lý.
    /// </summary>
    public static CreateSellerOfferValidationResult ValidateFull4Steps(CreateSellerOfferDto dto)
    {
        var result = new CreateSellerOfferValidationResult();

        // 1. Kiểm tra các điều kiện cốt lõi Bước 1
        var step1Result = ValidateFastTrackStep1(dto);
        foreach (var error in step1Result.Errors)
        {
            result.AddError(error.Key, error.Value);
        }

        // 2. BR-SELLER-02 & BR-SELLER-09: Ràng buộc bổ sung khi có chuyển giao công nghệ ở mức Full
        if (dto.HasTechTransfer)
        {
            if (string.IsNullOrWhiteSpace(dto.DeveloperOrigin))
                result.AddError(nameof(dto.DeveloperOrigin), "Khi có chuyển giao công nghệ, bắt buộc khai báo đơn vị nghiên cứu (DeveloperOrigin).");

            if (dto.TrlLevel.HasValue && dto.TrlLevel.Value >= 1 && dto.TrlLevel.Value <= 9)
            {
                // Cấp độ 1..3: Bắt buộc khai báo đơn vị nghiên cứu
                if (dto.TrlLevel.Value >= 1 && dto.TrlLevel.Value <= 3)
                {
                    if (string.IsNullOrWhiteSpace(dto.DeveloperOrigin))
                        result.AddError(nameof(dto.DeveloperOrigin), "Với mức TRL 1-3, bắt buộc khai báo đơn vị nghiên cứu phát triển.");
                }
                // Cấp độ 7..9: Yêu cầu số văn bằng SHTT hoặc minh chứng kiểm định
                if (dto.TrlLevel.Value >= 7 && dto.TrlLevel.Value <= 9)
                {
                    bool hasIpReg = !string.IsNullOrWhiteSpace(dto.IpRegistrationNumber);
                    bool hasTrlDoc = dto.Documents != null && dto.Documents.Any(d =>
                        d.DocumentType == DocumentTypes.TrlEvidence || d.DocumentType == DocumentTypes.PatentCert);
                    if (!hasIpReg && !hasTrlDoc)
                    {
                        result.AddError(nameof(dto.IpRegistrationNumber),
                            "Với mức TRL 7-9 (Vận hành & Thương mại), bắt buộc khai báo Số văn bằng SHTT hoặc đính kèm tài liệu minh chứng kiểm định / bằng sáng chế.");
                    }
                }
            }

            if (string.IsNullOrWhiteSpace(dto.IpStatus) || !IntellectualPropertyStatuses.All.Contains(dto.IpStatus.ToUpperInvariant()))
                result.AddError(nameof(dto.IpStatus), "Khi có chuyển giao công nghệ, bắt buộc chọn Tình trạng SHTT hợp lệ.");

            if (string.IsNullOrWhiteSpace(dto.TransferMethod) || !TransferMethods.All.Contains(dto.TransferMethod.ToUpperInvariant()))
                result.AddError(nameof(dto.TransferMethod), "Khi có chuyển giao công nghệ, bắt buộc chọn Hình thức chuyển giao hợp lệ.");

            if (string.IsNullOrWhiteSpace(dto.CommercialStatus) || !CommercializationStatuses.All.Contains(dto.CommercialStatus.ToUpperInvariant()))
                result.AddError(nameof(dto.CommercialStatus), "Khi có chuyển giao công nghệ, bắt buộc chọn Trạng thái thương mại hóa hợp lệ.");
        }

        // 3. BR-SELLER-05: Cam kết pháp lý & Cơ quan quản lý
        if (!dto.LegalConsent && !dto.LegalCommitmentConfirmed)
        {
            result.AddError(nameof(dto.LegalConsent), "Doanh nghiệp bắt buộc cam kết trách nhiệm pháp lý trước khi nộp hồ sơ thẩm định.");
        }

        if (string.IsNullOrWhiteSpace(dto.ManagingAuthorityId))
        {
            result.AddError(nameof(dto.ManagingAuthorityId), "Bắt buộc chọn Sở KH&CN tiếp nhận thẩm định hồ sơ.");
        }

        // 4. BR-SELLER-10: Kiểm tra an toàn tài liệu (OfferDocuments)
        if (dto.Documents != null && dto.Documents.Count > 0)
        {
            for (int i = 0; i < dto.Documents.Count; i++)
            {
                var doc = dto.Documents[i];
                var prefix = $"Documents[{i}]";

                if (string.IsNullOrWhiteSpace(doc.FileName))
                {
                    result.AddError($"{prefix}.FileName", "Tên tệp không được để trống.");
                }
                else
                {
                    var ext = Path.GetExtension(doc.FileName);
                    if (string.IsNullOrEmpty(ext) || !AllowedDocExtensions.Contains(ext))
                    {
                        result.AddError($"{prefix}.FileName", $"Định dạng tệp '{doc.FileName}' không được hỗ trợ. Chỉ chấp nhận .pdf, .jpg, .jpeg, .png, .docx, .xlsx, .mp4.");
                    }
                }

                if (string.IsNullOrWhiteSpace(doc.FileUrl))
                {
                    result.AddError($"{prefix}.FileUrl", "Đường dẫn tệp không được để trống.");
                }

                if (!DocumentTypes.All.Contains(doc.DocumentType?.ToUpperInvariant() ?? ""))
                {
                    result.AddError($"{prefix}.DocumentType", $"Loại tài liệu '{doc.DocumentType}' không hợp lệ.");
                }

                if (!AccessScopes.All.Contains(doc.AccessScope?.ToUpperInvariant() ?? ""))
                {
                    result.AddError($"{prefix}.AccessScope", $"Phân quyền tài liệu '{doc.AccessScope}' không hợp lệ. Phải là PUBLIC, AFTER_CONNECTION hoặc ADMIN_ONLY.");
                }

                // File size check: 25MB for docs, 50MB for video
                var isVideo = string.Equals(doc.DocumentType, DocumentTypes.Video, StringComparison.OrdinalIgnoreCase)
                    || doc.FileName?.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase) == true;
                long maxSize = isVideo ? 52_428_800L : 26_214_400L;
                if (doc.FileSizeBytes > maxSize)
                {
                    result.AddError($"{prefix}.FileSizeBytes", $"Dung lượng tệp vượt quá giới hạn cho phép ({maxSize / (1024 * 1024)}MB).");
                }
            }
        }

        // 5. BR-SELLER-11: Kiểm tra thông số kỹ thuật động (OfferSpecValues)
        if (dto.SpecValues != null && dto.SpecValues.Count > 0)
        {
            if (dto.SpecValues.Count > 50)
            {
                result.AddError(nameof(dto.SpecValues), "Số lượng dòng thông số kỹ thuật tối đa cho mỗi hồ sơ là 50 dòng.");
            }

            var seenNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            for (int i = 0; i < dto.SpecValues.Count; i++)
            {
                var spec = dto.SpecValues[i];
                var prefix = $"SpecValues[{i}]";

                if (string.IsNullOrWhiteSpace(spec.SpecName))
                {
                    result.AddError($"{prefix}.SpecName", "Tên thông số kỹ thuật không được để trống.");
                }
                else
                {
                    var cleanName = spec.SpecName.Trim();
                    if (cleanName.Length < 2 || cleanName.Length > 255)
                    {
                        result.AddError($"{prefix}.SpecName", "Tên thông số kỹ thuật phải từ 2 đến 255 ký tự.");
                    }
                    else if (!seenNames.Add(cleanName))
                    {
                        result.AddError($"{prefix}.SpecName", $"Thông số '{cleanName}' bị trùng lặp trong hồ sơ.");
                    }
                }

                if (string.IsNullOrWhiteSpace(spec.SpecValue))
                {
                    result.AddError($"{prefix}.SpecValue", "Giá trị thông số kỹ thuật không được để trống.");
                }
                else if (spec.SpecValue.Length > 2000)
                {
                    result.AddError($"{prefix}.SpecValue", "Giá trị thông số kỹ thuật không được vượt quá 2000 ký tự.");
                }

                if (!string.IsNullOrWhiteSpace(spec.Unit) && spec.Unit.Length > 50)
                {
                    result.AddError($"{prefix}.Unit", "Đơn vị đo không được vượt quá 50 ký tự.");
                }
            }
        }

        return result;
    }

    /// <summary>
    /// Giữ tương thích ngược với các test suites hiện có
    /// </summary>
    public static CreateSellerOfferValidationResult ValidatePublish(CreateSellerOfferDto dto)
    {
        return ValidateFull4Steps(dto);
    }

    public static CreateSellerOfferValidationResult Validate(CreateSellerOfferDto dto)
    {
        if (string.Equals(dto.Action, "SAVE_DRAFT", StringComparison.OrdinalIgnoreCase))
        {
            return ValidateDraft(dto);
        }

        if (dto.CurrentStep == 1)
        {
            return ValidateFastTrackStep1(dto);
        }

        return ValidateFull4Steps(dto);
    }

    public static CreateSellerOfferValidationResult ValidateUpdate(UpdateSellerOfferDto dto)
    {
        var createDto = new CreateSellerOfferDto(
            dto.OfferType,
            dto.HasTechTransfer,
            dto.Title,
            dto.Summary,
            dto.ProblemSolved,
            dto.SectorCode,
            dto.PricingType,
            dto.PriceAmount,
            dto.PriceMin,
            dto.PriceMax,
            dto.Currency,
            dto.Unit,
            dto.DeveloperOrigin,
            dto.TrlLevel,
            dto.IpStatus,
            dto.IpRegistrationNumber,
            dto.TransferMethod,
            dto.CommercialStatus,
            dto.ContactPointRole,
            dto.ManagingAuthorityId,
            dto.ManagingAuthorityName,
            dto.ScopeType,
            dto.ScopeId,
            LegalConsent: true,
            EnterpriseTaxCode: dto.EnterpriseTaxCode,
            EnterpriseName: dto.EnterpriseName,
            MainImageUrl: dto.MainImageUrl,
            GalleryImageUrls: dto.GalleryImageUrls,
            DeliveryTimeline: dto.DeliveryTimeline,
            WarrantyTerms: dto.WarrantyTerms,
            SupplyScope: dto.SupplyScope,
            PaymentTerms: dto.PaymentTerms,
            InstallationSupport: dto.InstallationSupport,
            SpecValues: dto.SpecValues,
            Documents: dto.Documents,
            Action: dto.Action,
            ContactName: dto.ContactName,
            ContactEmail: dto.ContactEmail,
            ContactPhone: dto.ContactPhone,
            CurrentStep: dto.CurrentStep,
            ShortDescription: dto.ShortDescription,
            ModelCode: dto.ModelCode,
            Manufacturer: dto.Manufacturer,
            OriginCountry: dto.OriginCountry,
            EquipmentStatus: dto.EquipmentStatus,
            ManufacturingYear: dto.ManufacturingYear,
            CapacityScale: dto.CapacityScale,
            EnergyConsumption: dto.EnergyConsumption,
            AutomationLevel: dto.AutomationLevel,
            OperatingPrinciple: dto.OperatingPrinciple,
            DeploymentConditions: dto.DeploymentConditions,
            TransferPriorityMethod: dto.TransferPriorityMethod,
            PriceIncludes: dto.PriceIncludes,
            TaxAndExtraCosts: dto.TaxAndExtraCosts,
            TechnicalSupportMethod: dto.TechnicalSupportMethod,
            IpIssueDate: dto.IpIssueDate,
            LegalCommitmentConfirmed: dto.LegalCommitmentConfirmed
        );

        return Validate(createDto);
    }
}
