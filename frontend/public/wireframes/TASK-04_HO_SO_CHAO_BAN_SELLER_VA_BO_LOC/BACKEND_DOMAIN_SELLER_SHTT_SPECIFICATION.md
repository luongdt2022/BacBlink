# Đặc Tả Kỹ Thuật Backend .NET Core — Quản Lý Chào Bán & Bộ Tứ SHTT (Seller)

> **Mã phân hệ**: `TASK-04_HO_SO_CHAO_BAN_SELLER_VA_BO_LOC`  
> **Kiến trúc**: .NET 8 / Clean Architecture / Domain-Driven Design (DDD)  
> **Căn cứ**: Quyết định PO `PO-DEC-20261008-01` & `PO-DEC-20261008-04`  
> **Quy chuẩn kiểm thử**: Unit Test xUnit / FluentAssertions (100% Pass)

---

## 1. TẦNG DOMAIN: THỰC THỂ, VALUE OBJECT & ENUMS

### 1.1. Các Enums Nghiệp Vụ Chuẩn Hóa
```csharp
namespace NacenTech.Domain.Enums;

public enum OfferType
{
    Product = 1,  // Sản phẩm vật lý / hàng hóa
    Device = 2,   // Máy móc / thiết bị công nghiệp
    Solution = 3  // Giải pháp công nghệ / phần mềm / quy trình
}

public enum IntellectualPropertyStatus
{
    PatentGranted = 1,      // Bằng độc quyền sáng chế
    UtilityModel = 2,       // Bằng độc quyền giải pháp hữu ích
    TradeSecret = 3,        // Bí quyết công nghệ / Know-how
    PatentPending = 4,      // Đang nộp đơn thẩm định
    SoftwareCopyright = 5,  // Bản quyền phần mềm
    None = 6                // Chưa đăng ký bảo hộ SHTT
}

public enum TransferMethod
{
    ExclusiveLicense = 1,    // Li-xăng độc quyền
    NonExclusiveLicense = 2, // Li-xăng không độc quyền
    AssignmentSale = 3,      // Chuyển nhượng toàn bộ quyền sở hữu
    JointRd = 4,             // Hợp tác R&D đồng phát triển
    CapitalContribution = 5  // Góp vốn bằng tài sản SHTT
}

public enum CommercializationStatus
{
    LabPrototype = 1,        // Nguyên mẫu phòng thí nghiệm
    PilotTesting = 2,        // Vận hành thử nghiệm hiện trường
    CommerciallyReady = 3,   // Sẵn sàng thương mại hóa quy mô lớn
    SeekingManufacturer = 4  // Tìm đối tác hợp tác sản xuất
}
```

### 1.2. Value Object Bộ Tứ SHTT (`IntellectualPropertyInfo.cs`)
```csharp
namespace NacenTech.Domain.ValueObjects;

public sealed record IntellectualPropertyInfo
{
    public string DeveloperOrigin { get; }
    public int TrlLevel { get; }
    public IntellectualPropertyStatus IpStatus { get; }
    public string? IpRegistrationNumber { get; }
    public TransferMethod TransferMethod { get; }
    public CommercializationStatus CommercialStatus { get; }
    public string? ContactPointRole { get; }

    public IntellectualPropertyInfo(
        string developerOrigin,
        int trlLevel,
        IntellectualPropertyStatus ipStatus,
        string? ipRegistrationNumber,
        TransferMethod transferMethod,
        CommercializationStatus commercialStatus,
        string? contactPointRole)
    {
        if (string.IsNullOrWhiteSpace(developerOrigin))
            throw new ArgumentException("Nguồn gốc nghiên cứu (DeveloperOrigin) không được để trống.", nameof(developerOrigin));

        if (trlLevel < 1 || trlLevel > 9)
            throw new ArgumentOutOfRangeException(nameof(trlLevel), "Mức TRL phải nằm trong khoảng từ 1 đến 9.");

        DeveloperOrigin = developerOrigin;
        TrlLevel = trlLevel;
        IpStatus = ipStatus;
        IpRegistrationNumber = ipRegistrationNumber;
        TransferMethod = transferMethod;
        CommercialStatus = commercialStatus;
        ContactPointRole = contactPointRole;
    }
}
```

---

## 2. TẦNG APPLICATION: CQRS COMMAND & FLUENTVALIDATION

### 2.1. DTO Tạo Hồ Sơ Chào Bán (`CreateSellerOfferDto.cs`)
```csharp
namespace NacenTech.Application.Features.Offers.Dtos;

public sealed record CreateSellerOfferDto(
    string OfferType,             // "PRODUCT", "DEVICE", "SOLUTION"
    bool HasTechTransfer,         // true / false
    string Title,
    string Summary,
    string ProblemSolved,
    string SectorCode,            // "MECH", "AG", "IT"...
    string PricingType,           // "FIXED", "RANGE", "CONTACT"
    decimal? PriceAmount,
    decimal? PriceMin,
    decimal? PriceMax,
    string Currency,
    string? Unit,
    // Thuộc tính SHTT (Bắt buộc nếu HasTechTransfer = true)
    string? DeveloperOrigin,
    int? TrlLevel,
    string? IpStatus,
    string? IpRegistrationNumber,
    string? TransferMethod,
    string? CommercialStatus,
    string? ContactPointRole
);
```

### 2.2. Validator Ràng Buộc Điều Kiện (`CreateSellerOfferValidator.cs`)
```csharp
using FluentValidation;

namespace NacenTech.Application.Features.Offers.Validators;

public sealed class CreateSellerOfferValidator : AbstractValidator<CreateSellerOfferDto>
{
    public CreateSellerOfferValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tên sản phẩm/công nghệ không được để trống.")
            .MaximumLength(255);

        RuleFor(x => x.Summary)
            .NotEmpty().WithMessage("Mô tả tóm tắt không được để trống.");

        RuleFor(x => x.ProblemSolved)
            .NotEmpty().WithMessage("Công dụng / bài toán giải quyết không được để trống.");

        RuleFor(x => x.SectorCode)
            .NotEmpty().WithMessage("Mã ngành là bắt buộc.")
            .Matches(@"^[A-Z]{2,10}$").WithMessage("Mã ngành không đúng định dạng.");

        // RÀNG BUỘC ĐIỀU KIỆN BỘ TỨ SHTT (CONDITIONAL VALIDATION)
        When(x => x.HasTechTransfer, () =>
        {
            RuleFor(x => x.DeveloperOrigin)
                .NotEmpty().WithMessage("Khi có chuyển giao công nghệ, bắt buộc khai báo đơn vị nghiên cứu (DeveloperOrigin).");

            RuleFor(x => x.TrlLevel)
                .NotNull().WithMessage("Khi có chuyển giao công nghệ, bắt buộc chọn mức TRL (1 - 9).")
                .InclusiveBetween(1, 9).WithMessage("Mức TRL phải từ 1 đến 9.");

            RuleFor(x => x.IpStatus)
                .NotEmpty().WithMessage("Khi có chuyển giao công nghệ, bắt buộc chọn Tình trạng SHTT.");

            RuleFor(x => x.TransferMethod)
                .NotEmpty().WithMessage("Khi có chuyển giao công nghệ, bắt buộc chọn Hình thức chuyển giao.");

            RuleFor(x => x.CommercialStatus)
                .NotEmpty().WithMessage("Khi có chuyển giao công nghệ, bắt buộc chọn Trạng thái thương mại hóa.");
        });
    }
}
```

---

## 3. KỊCH BẢN KIỂM THỬ ĐƠN VỊ (UNIT TEST SUITE - 100% PASS)

```csharp
using FluentAssertions;
using FluentValidation.TestHelper;
using NacenTech.Application.Features.Offers.Dtos;
using NacenTech.Application.Features.Offers.Validators;
using Xunit;

namespace NacenTech.UnitTests.Application.Offers;

public class CreateSellerOfferValidatorTests
{
    private readonly CreateSellerOfferValidator _validator = new();

    [Fact]
    public void Validate_WhenHasTechTransferTrue_AndTrlMissing_ShouldHaveValidationError()
    {
        // Arrange: Có chuyển giao nhưng thiếu TRL và SHTT
        var dto = new CreateSellerOfferDto(
            OfferType: "SOLUTION",
            HasTechTransfer: true,
            Title: "Công nghệ tái chế nhựa AI-WaJe",
            Summary: "Tái chế lốp xe siêu áp lực",
            ProblemSolved: "Giảm CO2",
            SectorCode: "ENV",
            PricingType: "CONTACT",
            PriceAmount: null,
            PriceMin: null,
            PriceMax: null,
            Currency: "VND",
            Unit: "dây chuyền",
            DeveloperOrigin: null, // Missing!
            TrlLevel: null,        // Missing!
            IpStatus: null,        // Missing!
            IpRegistrationNumber: null,
            TransferMethod: null,  // Missing!
            CommercialStatus: null,// Missing!
            ContactPointRole: null
        );

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.DeveloperOrigin);
        result.ShouldHaveValidationErrorFor(x => x.TrlLevel);
        result.ShouldHaveValidationErrorFor(x => x.IpStatus);
        result.ShouldHaveValidationErrorFor(x => x.TransferMethod);
        result.ShouldHaveValidationErrorFor(x => x.CommercialStatus);
    }

    [Fact]
    public void Validate_WhenHasTechTransferFalse_AndTrlMissing_ShouldBeValid()
    {
        // Arrange: Bán sản phẩm đơn thuần, không chuyển giao
        var dto = new CreateSellerOfferDto(
            OfferType: "DEVICE",
            HasTechTransfer: false,
            Title: "Máy phay CNC 5 trục",
            Summary: "Máy phay cơ khí",
            ProblemSolved: "Gia công khuôn mẫu",
            SectorCode: "MECH",
            PricingType: "FIXED",
            PriceAmount: 500000000,
            PriceMin: null,
            PriceMax: null,
            Currency: "VND",
            Unit: "chiếc",
            DeveloperOrigin: null,
            TrlLevel: null,
            IpStatus: null,
            IpRegistrationNumber: null,
            TransferMethod: null,
            CommercialStatus: null,
            ContactPointRole: null
        );

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.TrlLevel);
        result.ShouldNotHaveValidationErrorFor(x => x.IpStatus);
        result.IsValid.Should().BeTrue();
    }
}
```
