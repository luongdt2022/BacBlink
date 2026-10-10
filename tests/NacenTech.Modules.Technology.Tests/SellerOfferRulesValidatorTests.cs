using NacenTech.Modules.Technology.Application;
using Xunit;

namespace NacenTech.Modules.Technology.Tests;

public class SellerOfferRulesValidatorTests
{
    private static CreateSellerOfferDto CreateValidBaseDto() => new(
        OfferType: "SOLUTION",
        HasTechTransfer: false,
        Title: "Hệ thống sấy thăng hoa chân không thông minh",
        Summary: "Công nghệ sấy nhiệt độ thấp bảo toàn hoạt chất sinh học",
        ProblemSolved: "Giảm hao hụt nông sản và nâng cao giá trị xuất khẩu",
        SectorCode: "FOOD",
        PricingType: "CONTACT",
        PriceAmount: null,
        PriceMin: null,
        PriceMax: null,
        Currency: "VND",
        Unit: "dây chuyền",
        DeveloperOrigin: null,
        TrlLevel: null,
        IpStatus: null,
        IpRegistrationNumber: null,
        TransferMethod: null,
        CommercialStatus: null,
        ContactPointRole: null
    );

    [Fact]
    public void BR_SELLER_01_InvalidOfferType_ShouldFail()
    {
        var dto = CreateValidBaseDto() with { OfferType = "INVALID_TYPE" };
        var result = SellerOfferRulesValidator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.OfferType)));
    }

    [Theory]
    [InlineData("PRODUCT")]
    [InlineData("DEVICE")]
    [InlineData("SOLUTION")]
    public void BR_SELLER_01_ValidOfferType_ShouldPass(string validOfferType)
    {
        var dto = CreateValidBaseDto() with { OfferType = validOfferType };
        var result = SellerOfferRulesValidator.Validate(dto);

        Assert.False(result.Errors.ContainsKey(nameof(dto.OfferType)));
    }

    [Fact]
    public void BR_SELLER_02_WhenHasTechTransferTrue_AndMissingQuadFields_ShouldFail()
    {
        var dto = CreateValidBaseDto() with
        {
            HasTechTransfer = true,
            DeveloperOrigin = null,
            TrlLevel = null,
            IpStatus = null,
            TransferMethod = null,
            CommercialStatus = null
        };

        var result = SellerOfferRulesValidator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.DeveloperOrigin)));
        Assert.True(result.Errors.ContainsKey(nameof(dto.TrlLevel)));
        Assert.True(result.Errors.ContainsKey(nameof(dto.IpStatus)));
        Assert.True(result.Errors.ContainsKey(nameof(dto.TransferMethod)));
        Assert.True(result.Errors.ContainsKey(nameof(dto.CommercialStatus)));
    }

    [Fact]
    public void BR_SELLER_02_WhenHasTechTransferFalse_QuadFieldsCanBeNull()
    {
        var dto = CreateValidBaseDto() with
        {
            HasTechTransfer = false,
            DeveloperOrigin = null,
            TrlLevel = null,
            IpStatus = null,
            TransferMethod = null,
            CommercialStatus = null
        };

        var result = SellerOfferRulesValidator.Validate(dto);

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(10)]
    [InlineData(-1)]
    public void BR_SELLER_03_TrlOutOfRange_ShouldFail(int invalidTrl)
    {
        var dto = CreateValidBaseDto() with
        {
            HasTechTransfer = true,
            DeveloperOrigin = "Viện Khoa Học Nông Nghiệp",
            TrlLevel = invalidTrl,
            IpStatus = "PATENT_GRANTED",
            TransferMethod = "EXCLUSIVE_LICENSE",
            CommercialStatus = "COMMERCIALLY_READY"
        };

        var result = SellerOfferRulesValidator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.TrlLevel)));
    }

    [Theory]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(8)]
    [InlineData(9)]
    public void BR_SELLER_03_TrlWithinRange1To9_ShouldPass(int validTrl)
    {
        var dto = CreateValidBaseDto() with
        {
            HasTechTransfer = true,
            DeveloperOrigin = "Viện Khoa Học Nông Nghiệp",
            TrlLevel = validTrl,
            IpStatus = "PATENT_GRANTED",
            TransferMethod = "EXCLUSIVE_LICENSE",
            CommercialStatus = "COMMERCIALLY_READY"
        };

        var result = SellerOfferRulesValidator.Validate(dto);

        Assert.False(result.Errors.ContainsKey(nameof(dto.TrlLevel)));
        Assert.True(result.IsValid);
    }

    [Fact]
    public void BR_SELLER_04_FixedPricing_WithoutPositiveAmount_ShouldFail()
    {
        var dto = CreateValidBaseDto() with
        {
            PricingType = "FIXED",
            PriceAmount = 0
        };

        var result = SellerOfferRulesValidator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.PriceAmount)));
    }

    [Fact]
    public void BR_SELLER_04_RangePricing_WhenMaxLessThanMin_ShouldFail()
    {
        var dto = CreateValidBaseDto() with
        {
            PricingType = "RANGE",
            PriceMin = 500000000,
            PriceMax = 300000000
        };

        var result = SellerOfferRulesValidator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.PriceMax)));
    }

    [Fact]
    public void BR_SELLER_04_ContactPricing_ShouldPassWithoutPrices()
    {
        var dto = CreateValidBaseDto() with
        {
            PricingType = "CONTACT",
            PriceAmount = null,
            PriceMin = null,
            PriceMax = null
        };

        var result = SellerOfferRulesValidator.Validate(dto);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void BR_SELLER_05_WithoutLegalConsent_ShouldFail()
    {
        var dto = CreateValidBaseDto() with { LegalConsent = false };
        var result = SellerOfferRulesValidator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.LegalConsent)));
    }

    [Fact]
    public void BR_SELLER_05_WithLegalConsent_ShouldPass()
    {
        var dto = CreateValidBaseDto() with { LegalConsent = true };
        var result = SellerOfferRulesValidator.Validate(dto);

        Assert.True(result.IsValid);
    }
}
