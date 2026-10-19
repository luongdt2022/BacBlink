using System;
using System.Collections.Generic;
using NacenTech.Modules.Technology.Application;
using NacenTech.Modules.Technology.Domain;
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
        ContactPointRole: null,
        ManagingAuthorityId: "VN-HN",
        ManagingAuthorityName: "Sở Khoa học và Công nghệ TP. Hà Nội",
        ScopeType: "PROVINCE",
        ScopeId: "VN-HN",
        LegalConsent: true
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
            DeveloperOrigin = "Viện Cơ Điện Nông Nghiệp",
            TrlLevel = invalidTrl,
            IpStatus = "PATENT_GRANTED",
            IpRegistrationNumber = "VN-1-0028491",
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
            IpRegistrationNumber = "VN-1-0028491",
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

    [Fact]
    public void BR_SELLER_ValidateUpdate_ValidDto_ShouldPass()
    {
        var updateDto = new UpdateSellerOfferDto(
            OfferType: "DEVICE",
            HasTechTransfer: true,
            Title: "Robot hàn laser 6 trục cải tiến",
            Summary: "Tóm tắt giải pháp",
            ProblemSolved: "Bài toán giải quyết",
            SectorCode: "MECH",
            PricingType: "FIXED",
            PriceAmount: 2500000000,
            PriceMin: null,
            PriceMax: null,
            Currency: "VND",
            Unit: "hệ thống",
            DeveloperOrigin: "Đại học Bách Khoa",
            TrlLevel: 8,
            IpStatus: "PATENT_GRANTED",
            IpRegistrationNumber: "VN-1-001234",
            TransferMethod: "EXCLUSIVE_LICENSE",
            CommercialStatus: "COMMERCIALLY_READY",
            ContactPointRole: "Phòng QLKH"
        );

        var result = SellerOfferRulesValidator.ValidateUpdate(updateDto);

        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);
    }

    [Fact]
    public void BR_SELLER_07_WhenCoreIpOrTrlChanges_EntityShouldResetToPending()
    {
        var offer = new SellerTechnologyOffer(
            id: Guid.NewGuid(),
            offerCode: "OFF-20261011-00001",
            offerType: "DEVICE",
            hasTechTransfer: true,
            title: "Thiết bị ban đầu",
            summary: "Tóm tắt",
            problemSolved: "Bài toán",
            sectorCode: "MECH",
            sectorName: "Cơ khí",
            pricingType: "FIXED",
            priceAmount: 1000000000,
            priceMin: null,
            priceMax: null,
            currency: "VND",
            unit: "bộ",
            developerOrigin: "Viện Hàn Lâm",
            trlLevel: 7,
            ipStatus: "UTILITY_MODEL",
            ipRegistrationNumber: "VN-2-001",
            transferMethod: "NON_EXCLUSIVE_LICENSE",
            commercialStatus: "PILOT_TESTING",
            contactPointRole: "Ban KH",
            status: "APPROVED",
            managingAuthorityId: "VN-HN",
            managingAuthorityName: "Sở KH&CN Hà Nội",
            scopeType: "PROVINCE",
            scopeId: "VN-HN",
            legalConsent: true,
            publishedAt: DateTimeOffset.UtcNow
        );

        Assert.Equal("APPROVED", offer.Status);
        Assert.NotNull(offer.PublishedAt);

        // Update with changed TRL from 7 to 8
        offer.Update(
            offerType: "DEVICE",
            hasTechTransfer: true,
            title: "Thiết bị ban đầu (cập nhật)",
            summary: "Tóm tắt",
            problemSolved: "Bài toán",
            sectorCode: "MECH",
            sectorName: "Cơ khí",
            pricingType: "FIXED",
            priceAmount: 1200000000,
            priceMin: null,
            priceMax: null,
            currency: "VND",
            unit: "bộ",
            developerOrigin: "Viện Hàn Lâm",
            trlLevel: 8, // CHANGED from 7 to 8
            ipStatus: "UTILITY_MODEL",
            ipRegistrationNumber: "VN-2-001",
            transferMethod: "NON_EXCLUSIVE_LICENSE",
            commercialStatus: "PILOT_TESTING",
            contactPointRole: "Ban KH",
            managingAuthorityId: "VN-HN",
            managingAuthorityName: "Sở KH&CN Hà Nội",
            scopeType: "PROVINCE",
            scopeId: "VN-HN"
        );

        // BR-SELLER-07 asserts status must be PENDING and PublishedAt null
        Assert.Equal("PENDING", offer.Status);
        Assert.Null(offer.PublishedAt);
    }

    // --- DELTA V5 UNIT TESTS (BR-SELLER-08 to BR-SELLER-11) ---

    [Fact]
    public void BR_SELLER_08_ValidateDraft_WithOnlyTitleMin3Chars_ShouldPass()
    {
        var draftDto = new CreateSellerOfferDto(
            OfferType: "",
            HasTechTransfer: true,
            Title: "Hệ thống sấy AI",
            Summary: "",
            ProblemSolved: "",
            SectorCode: "",
            PricingType: "",
            PriceAmount: null,
            PriceMin: null,
            PriceMax: null,
            Currency: "VND",
            Unit: null,
            DeveloperOrigin: null,
            TrlLevel: null,
            IpStatus: null,
            IpRegistrationNumber: null,
            TransferMethod: null,
            CommercialStatus: null,
            ContactPointRole: null,
            ManagingAuthorityId: null,
            LegalConsent: false,
            Action: "SAVE_DRAFT"
        );

        var result = SellerOfferRulesValidator.ValidateDraft(draftDto);

        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);
    }

    [Fact]
    public void BR_SELLER_08_ValidateDraft_WithTitleUnder3Chars_ShouldFail()
    {
        var draftDto = new CreateSellerOfferDto(
            OfferType: "",
            HasTechTransfer: false,
            Title: "AI",
            Summary: "",
            ProblemSolved: "",
            SectorCode: "",
            PricingType: "",
            PriceAmount: null,
            PriceMin: null,
            PriceMax: null,
            Currency: "VND",
            Unit: null,
            DeveloperOrigin: null,
            TrlLevel: null,
            IpStatus: null,
            IpRegistrationNumber: null,
            TransferMethod: null,
            CommercialStatus: null,
            ContactPointRole: null,
            Action: "SAVE_DRAFT"
        );

        var result = SellerOfferRulesValidator.ValidateDraft(draftDto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(draftDto.Title)));
    }

    [Fact]
    public void BR_SELLER_10_DocumentValidation_InvalidExtension_ShouldFail()
    {
        var dto = CreateValidBaseDto() with
        {
            Documents = new List<OfferDocumentDto>
            {
                new(null, "CATALOGUE", "trojan_file.exe", "https://cdn.example.com/trojan.exe", 1024, "PUBLIC")
            }
        };

        var result = SellerOfferRulesValidator.ValidatePublish(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey("Documents[0].FileName"));
    }

    [Fact]
    public void BR_SELLER_10_DocumentValidation_InvalidAccessScope_ShouldFail()
    {
        var dto = CreateValidBaseDto() with
        {
            Documents = new List<OfferDocumentDto>
            {
                new(null, "CATALOGUE", "catalogue.pdf", "https://cdn.example.com/cat.pdf", 1024, "SECRET_FORBIDDEN")
            }
        };

        var result = SellerOfferRulesValidator.ValidatePublish(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey("Documents[0].AccessScope"));
    }

    [Fact]
    public void BR_SELLER_10_DocumentValidation_FileSizeExceeded_ShouldFail()
    {
        var dto = CreateValidBaseDto() with
        {
            Documents = new List<OfferDocumentDto>
            {
                new(null, "CATALOGUE", "heavy.pdf", "https://cdn.example.com/heavy.pdf", 30 * 1024 * 1024, "PUBLIC") // 30MB > 25MB
            }
        };

        var result = SellerOfferRulesValidator.ValidatePublish(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey("Documents[0].FileSizeBytes"));
    }

    [Fact]
    public void BR_SELLER_11_DynamicSpecs_DuplicateSpecName_ShouldFail()
    {
        var dto = CreateValidBaseDto() with
        {
            SpecValues = new List<OfferSpecValueDto>
            {
                new(null, "SPEC-1", "Công suất sấy", "100", "kg/h"),
                new(null, "SPEC-2", "  công suất sấy  ", "200", "kg/h") // Duplicate
            }
        };

        var result = SellerOfferRulesValidator.ValidatePublish(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey("SpecValues[1].SpecName"));
    }

    [Fact]
    public void BR_SELLER_11_DynamicSpecs_Exceeds50Rows_ShouldFail()
    {
        var specs = new List<OfferSpecValueDto>();
        for (int i = 0; i < 51; i++)
        {
            specs.Add(new OfferSpecValueDto(null, $"SPEC-{i}", $"Thông số thứ {i}", $"{i * 10}", "kW"));
        }

        var dto = CreateValidBaseDto() with { SpecValues = specs };
        var result = SellerOfferRulesValidator.ValidatePublish(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.SpecValues)));
    }

    [Fact]
    public void BR_SELLER_11_DynamicSpecs_ValidSpecs_ShouldPass()
    {
        var dto = CreateValidBaseDto() with
        {
            SpecValues = new List<OfferSpecValueDto>
            {
                new(null, "SPEC-1", "Công suất sấy", "100", "kg/h"),
                new(null, "SPEC-2", "Nhiệt độ cấp đông", "-45", "°C"),
                new(null, "SPEC-3", "Độ chân không buồng sấy", "0.02", "mbar")
            },
            Documents = new List<OfferDocumentDto>
            {
                new(null, "CATALOGUE", "catalogue.pdf", "https://cdn.example.com/cat.pdf", 5 * 1024 * 1024, "PUBLIC"),
                new(null, "VIDEO", "demo-clip.mp4", "https://cdn.example.com/demo.mp4", 45 * 1024 * 1024, "AFTER_CONNECTION")
            }
        };

        var result = SellerOfferRulesValidator.ValidatePublish(dto);

        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);
    }
}
