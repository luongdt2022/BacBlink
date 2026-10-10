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
    bool LegalConsent = true
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
    string? ScopeId = "VN-HN"
);

public sealed record ReviewOfferDto(
    string Action,
    string? ReviewNote = null
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
    public static CreateSellerOfferValidationResult Validate(CreateSellerOfferDto dto)
    {
        var result = new CreateSellerOfferValidationResult();

        // Title
        if (string.IsNullOrWhiteSpace(dto.Title))
            result.AddError(nameof(dto.Title), "Tên sản phẩm/công nghệ không được để trống.");
        else if (dto.Title.Length > 255)
            result.AddError(nameof(dto.Title), "Tên sản phẩm/công nghệ không được vượt quá 255 ký tự.");

        // Summary
        if (string.IsNullOrWhiteSpace(dto.Summary))
            result.AddError(nameof(dto.Summary), "Mô tả tóm tắt không được để trống.");

        // ProblemSolved
        if (string.IsNullOrWhiteSpace(dto.ProblemSolved))
            result.AddError(nameof(dto.ProblemSolved), "Công dụng / bài toán giải quyết không được để trống.");

        // BR-SELLER-01: Phân loại loại hình chào bán (Offer Type)
        if (string.IsNullOrWhiteSpace(dto.OfferType) || !OfferTypes.All.Contains(dto.OfferType.ToUpperInvariant()))
            result.AddError(nameof(dto.OfferType), "Loại hình chào bán phải là một trong các giá trị: PRODUCT, DEVICE, SOLUTION.");

        // SectorCode
        if (string.IsNullOrWhiteSpace(dto.SectorCode))
            result.AddError(nameof(dto.SectorCode), "Mã ngành là bắt buộc.");
        else if (!Regex.IsMatch(dto.SectorCode, @"^[A-Za-z0-9_-]{2,20}$"))
            result.AddError(nameof(dto.SectorCode), "Mã ngành không đúng định dạng (từ 2-20 ký tự chữ số).");

        // BR-SELLER-04: Quy tắc định dạng giá bán (Pricing Model)
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

        // BR-SELLER-02: Ràng buộc điều kiện Bộ Tứ SHTT (Conditional IP Quad)
        if (dto.HasTechTransfer)
        {
            if (string.IsNullOrWhiteSpace(dto.DeveloperOrigin))
                result.AddError(nameof(dto.DeveloperOrigin), "Khi có chuyển giao công nghệ, bắt buộc khai báo đơn vị nghiên cứu (DeveloperOrigin).");

            // BR-SELLER-03: Khoảng giá trị thang đo TRL (1 - 9)
            if (!dto.TrlLevel.HasValue)
                result.AddError(nameof(dto.TrlLevel), "Khi có chuyển giao công nghệ, bắt buộc chọn mức TRL (1 - 9).");
            else if (dto.TrlLevel.Value < 1 || dto.TrlLevel.Value > 9)
                result.AddError(nameof(dto.TrlLevel), "Mức TRL phải nằm trong khoảng từ 1 đến 9.");

            if (string.IsNullOrWhiteSpace(dto.IpStatus) || !IntellectualPropertyStatuses.All.Contains(dto.IpStatus.ToUpperInvariant()))
                result.AddError(nameof(dto.IpStatus), "Khi có chuyển giao công nghệ, bắt buộc chọn Tình trạng SHTT hợp lệ.");

            if (string.IsNullOrWhiteSpace(dto.TransferMethod) || !TransferMethods.All.Contains(dto.TransferMethod.ToUpperInvariant()))
                result.AddError(nameof(dto.TransferMethod), "Khi có chuyển giao công nghệ, bắt buộc chọn Hình thức chuyển giao hợp lệ.");

            if (string.IsNullOrWhiteSpace(dto.CommercialStatus) || !CommercializationStatuses.All.Contains(dto.CommercialStatus.ToUpperInvariant()))
                result.AddError(nameof(dto.CommercialStatus), "Khi có chuyển giao công nghệ, bắt buộc chọn Trạng thái thương mại hóa hợp lệ.");
        }

        // BR-SELLER-05: Cam kết pháp lý & Cơ quan quản lý
        if (!dto.LegalConsent)
        {
            result.AddError(nameof(dto.LegalConsent), "Doanh nghiệp bắt buộc cam kết trách nhiệm pháp lý trước khi nộp hồ sơ thẩm định.");
        }

        return result;
    }
}
