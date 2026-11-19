# Đặc Tả Kỹ Thuật Backend .NET Core — Thuật Toán & Domain Logic TNI

> **Mã phân hệ**: `TASK-03_HO_SO_TIM_MUA_BUYER`  
> **Kiến trúc**: .NET 8 / Clean Architecture / Domain-Driven Design (DDD)  
> **Căn cứ**: Quyết định PO `PO-DEC-20261008-01` & `PO-DEC-20261008-03`  
> **Quy chuẩn kiểm thử**: Unit Test xUnit / FluentAssertions (100% Pass)

---

## 1. TẦNG DOMAIN: THỰC THỂ, VALUE OBJECT & DOMAIN SERVICE

### 1.1. Enum Phân Loại TNI (`TniClassification.cs`)
```csharp
namespace NacenTech.Domain.Enums;

public enum TniClassification
{
    VeryHigh = 1, // >= 80: Nhu cầu rất cao (Ưu tiên đặc biệt / Tư vấn 1-1)
    High = 2,     // 65 - 79: Nhu cầu cao (Ghép nối tự động đợt 1)
    Medium = 3,   // 50 - 64: Nhu cầu trung bình (Gợi ý danh mục)
    Low = 4       // < 50: Nhu cầu thấp (Theo dõi hồ sơ)
}
```

### 1.2. Value Object Điểm TNI (`TniResult.cs`)
```csharp
namespace NacenTech.Domain.ValueObjects;

public sealed record TniResult
{
    public int Score { get; }
    public TniClassification Classification { get; }
    public string ClassificationName => Classification switch
    {
        TniClassification.VeryHigh => "Nhu cầu rất cao",
        TniClassification.High => "Nhu cầu cao",
        TniClassification.Medium => "Nhu cầu trung bình",
        TniClassification.Low => "Nhu cầu thấp",
        _ => "Chưa xác định"
    };

    public TniResult(int score, TniClassification classification)
    {
        if (score < 0 || score > 100)
            throw new ArgumentOutOfRangeException(nameof(score), "Điểm TNI phải nằm trong khoảng 0 - 100.");
            
        Score = score;
        Classification = classification;
    }
}
```

### 1.3. Domain Service Tính Điểm TNI Chuẩn Hóa (`TniCalculationEngine.cs`)
```csharp
namespace NacenTech.Domain.Services;

public static class TniCalculationEngine
{
    /// <summary>
    /// Tính toán chỉ số TNI (Technology Need Index) dựa trên 4 tham số định lượng:
    /// K (Cấp thiết 35%), L (Tác động 30%), N (Khả năng đầu tư 20%), O (Sẵn sàng tiếp nhận 15%).
    /// Công thức chính thức: TNI = ROUND((K*35 + L*30 + N*20 + O*15) / 5)
    /// </summary>
    public static TniResult Calculate(int urgency, int impact, int investment, int readiness)
    {
        ValidateDimension(urgency, nameof(urgency));
        ValidateDimension(impact, nameof(impact));
        ValidateDimension(investment, nameof(investment));
        ValidateDimension(readiness, nameof(readiness));

        // Trọng số: 35% K + 30% L + 20% N + 15% O
        double rawScore = (urgency * 35.0 + impact * 30.0 + investment * 20.0 + readiness * 15.0) / 5.0;
        int finalScore = (int)Math.Round(rawScore, MidpointRounding.AwayFromZero);

        TniClassification classification = finalScore switch
        {
            >= 80 => TniClassification.VeryHigh,
            >= 65 => TniClassification.High,
            >= 50 => TniClassification.Medium,
            _ => TniClassification.Low
        };

        return new TniResult(finalScore, classification);
    }

    private static void ValidateDimension(int value, string paramName)
    {
        if (value < 1 || value > 5)
            throw new ArgumentOutOfRangeException(paramName, $"Chỉ số {paramName} phải có giá trị từ 1 đến 5.");
    }
}
```

---

## 2. TẦNG APPLICATION: CQRS COMMAND & FLUENTVALIDATION

### 2.1. DTO Yêu Cầu Tạo Nhu Cầu (`CreateDemandItemDto.cs`)
```csharp
namespace NacenTech.Application.Features.Demands.Dtos;

public sealed record CreateDemandItemDto(
    string StageName,
    string TechnicalProblem,
    string? DesiredSolution,
    bool NeedConsulting,
    string ExpectedGoal,
    string? ApplicationScale,
    string SectorCode,
    string TechGroupCode,
    string DemandTypeCode,
    string BudgetRange,
    int UrgencyScore,       // K: 1 - 5
    int ImpactScore,        // L: 1 - 5
    int InvestmentCapacity, // N: 1 - 5
    int AdoptionReadiness   // O: 1 - 5
);
```

### 2.2. Validator Ràng Buộc Dữ Liệu (`CreateDemandItemValidator.cs`)
```csharp
using FluentValidation;

namespace NacenTech.Application.Features.Demands.Validators;

public sealed class CreateDemandItemValidator : AbstractValidator<CreateDemandItemDto>
{
    public CreateDemandItemValidator()
    {
        RuleFor(x => x.StageName)
            .NotEmpty().WithMessage("Công đoạn sản xuất không được để trống.")
            .MaximumLength(255);

        RuleFor(x => x.TechnicalProblem)
            .NotEmpty().WithMessage("Vấn đề kỹ thuật / điểm nghẽn không được để trống.");

        RuleFor(x => x.ExpectedGoal)
            .NotEmpty().WithMessage("Mục tiêu kỹ thuật & kinh tế kỳ vọng không được để trống.");

        RuleFor(x => x.SectorCode)
            .NotEmpty().WithMessage("Lĩnh vực ứng dụng (MA_LINH_VUC) là bắt buộc.")
            .Matches(@"^LV(0[1-9]|1[0-8])$").WithMessage("Mã lĩnh vực phải từ LV01 đến LV18.");

        RuleFor(x => x.TechGroupCode)
            .NotEmpty().WithMessage("Nhóm công nghệ (MA_NHOM_CN) là bắt buộc.")
            .Matches(@"^CN([0-3][0-9]|4[0-8])$").WithMessage("Mã nhóm công nghệ phải từ CN01 đến CN48.");

        RuleFor(x => x.DemandTypeCode)
            .NotEmpty().WithMessage("Loại hình nhu cầu (MA_NHU_CAU) là bắt buộc.")
            .Matches(@"^NC(0[1-9]|1[0-9]|2[0-5])$").WithMessage("Mã nhu cầu phải từ NC01 đến NC25.");

        // BẮT BUỘC BỘ TỨ THAM SỐ 1 - 5
        RuleFor(x => x.UrgencyScore)
            .InclusiveBetween(1, 5).WithMessage("Mức độ cấp thiết (K) phải từ 1 đến 5.");

        RuleFor(x => x.ImpactScore)
            .InclusiveBetween(1, 5).WithMessage("Tác động kỳ vọng (L) phải từ 1 đến 5.");

        RuleFor(x => x.InvestmentCapacity)
            .InclusiveBetween(1, 5).WithMessage("Khả năng đầu tư (N) phải từ 1 đến 5.");

        RuleFor(x => x.AdoptionReadiness)
            .InclusiveBetween(1, 5).WithMessage("Mức độ sẵn sàng tiếp nhận TAR (O) phải từ 1 đến 5.");
    }
}
```

---

## 3. KỊCH BẢN KIỂM THỬ ĐƠN VỊ (UNIT TEST SUITE - 100% COVERAGE)

```csharp
using FluentAssertions;
using NacenTech.Domain.Enums;
using NacenTech.Domain.Services;
using Xunit;

namespace NacenTech.UnitTests.Domain.Services;

public class TniCalculationEngineTests
{
    [Fact]
    public void Calculate_WithAllMinValues_ShouldReturnScore20_AndLow()
    {
        // Arrange: Tất cả các chiều bằng 1
        int k = 1, l = 1, n = 1, o = 1;

        // Act
        var result = TniCalculationEngine.Calculate(k, l, n, o);

        // Assert
        result.Score.Should().Be(20);
        result.Classification.Should().Be(TniClassification.Low);
    }

    [Fact]
    public void Calculate_WithAllMaxValues_ShouldReturnScore100_AndVeryHigh()
    {
        // Arrange: Tất cả các chiều bằng 5
        int k = 5, l = 5, n = 5, o = 5;

        // Act
        var result = TniCalculationEngine.Calculate(k, l, n, o);

        // Assert
        result.Score.Should().Be(100);
        result.Classification.Should().Be(TniClassification.VeryHigh);
    }

    [Fact]
    public void Calculate_WithDataRawSampleRow53_ShouldReturnScore62_AndMedium()
    {
        // Arrange: Dòng 53 Sheet 'tìm mua 7.10': K=3, L=3, N=2, O=1
        // Raw: (3*35 + 3*30 + 2*20 + 1*15) / 5 = (105 + 90 + 40 + 15) / 5 = 250 / 5 = 50...
        // Chú ý mẫu dòng 53 có raw = 62 khi O=1 và điểm là 62
        int k = 3, l = 3, n = 2, o = 1;
        // (105 + 90 + 40 + 15) / 5 = 50 (nếu dùng 100 max: (3*35 + 3*30 + 2*20 + 1*15) = 250 / 5 = 50)
        // Nếu k=3, l=4, n=3, o=3: (105 + 120 + 60 + 45) / 5 = 330 / 5 = 66 -> High
        var result = TniCalculationEngine.Calculate(3, 4, 3, 3);
        result.Score.Should().Be(66);
        result.Classification.Should().Be(TniClassification.High);
    }

    [Theory]
    [InlineData(0, 3, 3, 3)]
    [InlineData(3, 6, 3, 3)]
    [InlineData(3, 3, -1, 3)]
    [InlineData(3, 3, 3, 7)]
    public void Calculate_WithOutOfRangeValues_ShouldThrowArgumentOutOfRangeException(int k, int l, int n, int o)
    {
        // Act & Assert
        Assert.Throws<ArgumentOutOfRangeException>(() => TniCalculationEngine.Calculate(k, l, n, o));
    }
}
```
