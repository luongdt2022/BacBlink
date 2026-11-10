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
    public void BR_SELLER_07_WhenCoreIpOrTrlChanges_EntityShouldKeepApprovedStatus_AndResetVerificationToPending()
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

        // Ban đầu đã được Sở xác thực
        var verifiedBy = Guid.NewGuid();
        offer.VerifyTrlAndIp("VERIFIED_BY_GOV", "Sở KH&CN Hà Nội", verifiedBy, "Đạt chuẩn TRL 7");
        Assert.Equal("APPROVED", offer.Status);
        Assert.NotNull(offer.PublishedAt);
        Assert.Equal("VERIFIED_BY_GOV", offer.TrlVerificationStatus);
        Assert.Equal("VERIFIED_BY_GOV", offer.IpVerificationStatus);

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

        // BR-SELLER-07 mới: KHÔNG gỡ khỏi sàn, Status giữ nguyên APPROVED, chỉ hạ cấp verification về PENDING_VERIFICATION
        Assert.Equal("APPROVED", offer.Status);
        Assert.NotNull(offer.PublishedAt);
        Assert.Equal("PENDING_VERIFICATION", offer.TrlVerificationStatus);
        Assert.Equal("PENDING_VERIFICATION", offer.IpVerificationStatus);
    }

    [Fact]
    public void BR_SELLER_07_TwoTierVerification_VerifyTrlAndIp_ShouldUpdateVerificationMetadata()
    {
        var offer = new SellerTechnologyOffer(
            id: Guid.NewGuid(),
            offerCode: "OFF-20261011-00002",
            offerType: "SOLUTION",
            hasTechTransfer: true,
            title: "Giải pháp công nghệ",
            summary: "Tóm tắt",
            problemSolved: "Bài toán",
            sectorCode: "IT",
            sectorName: "CNTT",
            pricingType: "CONTACT",
            priceAmount: null,
            priceMin: null,
            priceMax: null,
            currency: "VND",
            unit: "gói",
            developerOrigin: "Đại học Bách Khoa",
            trlLevel: 6,
            ipStatus: "PATENT_PENDING",
            ipRegistrationNumber: null,
            transferMethod: "EXCLUSIVE_LICENSE",
            commercialStatus: "COMMERCIALLY_READY",
            contactPointRole: "Ban Giám Đốc",
            status: "APPROVED",
            managingAuthorityId: "VN-HN",
            managingAuthorityName: "Sở KH&CN Hà Nội",
            scopeType: "PROVINCE",
            scopeId: "VN-HN",
            legalConsent: true
        );

        Assert.Equal("SELF_DECLARED", offer.TrlVerificationStatus);
        Assert.Equal("SELF_DECLARED", offer.IpVerificationStatus);

        var officerId = Guid.NewGuid();
        offer.VerifyTrl("VERIFIED_BY_GOV", "Sở Khoa học và Công nghệ TP. Hà Nội", officerId, "Xác minh TRL 6 đạt yêu cầu");
        offer.VerifyIp("VERIFIED_BY_GOV", "Sở Khoa học và Công nghệ TP. Hà Nội", officerId, "Xác minh đơn Patent Pending hợp lệ");

        Assert.Equal("VERIFIED_BY_GOV", offer.TrlVerificationStatus);
        Assert.Equal("VERIFIED_BY_GOV", offer.IpVerificationStatus);
        Assert.Equal("Sở Khoa học và Công nghệ TP. Hà Nội", offer.VerifiedAuthorityName);
        Assert.Equal(officerId, offer.TrlVerifiedBy);
        Assert.NotNull(offer.TrlVerifiedAt);
        Assert.Equal("Xác minh đơn Patent Pending hợp lệ", offer.TrlReviewNote);
    }

    [Fact]
    public void BR_SELLER_07_Whitelist_And_IndividualDecision_Check()
    {
        var offer = new SellerTechnologyOffer(
            id: Guid.NewGuid(),
            offerCode: "OFF-20261011-00003",
            offerType: "PRODUCT",
            hasTechTransfer: true,
            title: "Sản phẩm công nghệ",
            summary: "Tóm tắt",
            problemSolved: "Bài toán",
            sectorCode: "IT",
            sectorName: "CNTT",
            pricingType: "CONTACT",
            priceAmount: null,
            priceMin: null,
            priceMax: null,
            currency: "VND",
            unit: "cái",
            developerOrigin: "Viện Hàn Lâm",
            trlLevel: 5,
            ipStatus: "NONE",
            ipRegistrationNumber: null,
            transferMethod: "NON_EXCLUSIVE_LICENSE",
            commercialStatus: "PILOT_TESTING",
            contactPointRole: "Ban KH",
            status: "APPROVED",
            managingAuthorityId: "VN-HN",
            managingAuthorityName: "Sở KH&CN Hà Nội",
            scopeType: "PROVINCE",
            scopeId: "VN-HN",
            legalConsent: true
        );

        var officerId = Guid.NewGuid();

        // Whitelist check: Không chấp nhận chuỗi lạ hoặc chuỗi > 30 ký tự
        Assert.Throws<ArgumentException>(() => offer.VerifyTrl("INVALID_STATUS_CODE", "Sở KH&CN", officerId));
        Assert.Throws<ArgumentException>(() => offer.VerifyTrl(new string('A', 35), "Sở KH&CN", officerId));
        Assert.Throws<ArgumentException>(() => offer.VerifyIp("INVALID_IP_STATUS", "Sở KH&CN", officerId));

        // Tách bạch: Duyệt TRL thành công nhưng từ chối SHTT
        offer.VerifyTrl("VERIFIED_BY_GOV", "Sở KH&CN Hà Nội", officerId, "TRL đạt");
        offer.VerifyIp("REJECTED_IP", "Sở KH&CN Hà Nội", officerId, "SHTT thiếu chứng cứ");

        Assert.Equal("VERIFIED_BY_GOV", offer.TrlVerificationStatus);
        Assert.Equal("REJECTED_IP", offer.IpVerificationStatus);
    }

    [Fact]
    public void BR_SELLER_TRL_Boundary_And_Evidence_Check()
    {
        // 1. TrlLevel ngoài khoảng 1-9 dù HasTechTransfer = false phải báo lỗi
        var dtoOutOfBound = CreateValidBaseDto() with { HasTechTransfer = false, TrlLevel = 10 };
        var resultOutOfBound = SellerOfferRulesValidator.Validate(dtoOutOfBound);
        Assert.False(resultOutOfBound.IsValid);
        Assert.True(resultOutOfBound.Errors.ContainsKey(nameof(dtoOutOfBound.TrlLevel)));

        var dtoZero = CreateValidBaseDto() with { HasTechTransfer = false, TrlLevel = 0 };
        var resultZero = SellerOfferRulesValidator.Validate(dtoZero);
        Assert.False(resultZero.IsValid);
        Assert.True(resultZero.Errors.ContainsKey(nameof(dtoZero.TrlLevel)));

        // 2. TrlLevel >= 7 khi nộp Full mà không có tài liệu TRL_EVIDENCE hay PatentCert/Số văn bằng phải báo lỗi
        var dtoTrl7NoEvidence = CreateValidBaseDto() with
        {
            HasTechTransfer = true,
            DeveloperOrigin = "Viện Hàn Lâm",
            TrlLevel = 7,
            IpStatus = "TRADE_SECRET",
            IpRegistrationNumber = null,
            TransferMethod = "EXCLUSIVE_LICENSE",
            CommercialStatus = "PILOT_TESTING",
            Documents = new List<OfferDocumentDto>() // Rỗng
        };
        var resultTrl7 = SellerOfferRulesValidator.ValidateFull4Steps(dtoTrl7NoEvidence);
        Assert.False(resultTrl7.IsValid);
        Assert.True(resultTrl7.Errors.ContainsKey("TrlEvidence") || resultTrl7.Errors.ContainsKey(nameof(dtoTrl7NoEvidence.IpRegistrationNumber)));
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

    #region Delta v6 - 3-Mode Validation Tests (T-04.84)

    [Fact]
    public void ValidateDraft_WithLessThan3Chars_ShouldFail()
    {
        var dto = CreateValidBaseDto() with { Title = "Ab" };
        var result = SellerOfferRulesValidator.ValidateDraft(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.Title)));
    }

    [Fact]
    public void ValidateDraft_WithValidTitle_ShouldPassEvenIfOtherFieldsEmpty()
    {
        var dto = CreateValidBaseDto() with
        {
            Title = "Công nghệ sấy mới",
            OfferType = "",
            Summary = "",
            ProblemSolved = "",
            SectorCode = "",
            PricingType = ""
        };

        var result = SellerOfferRulesValidator.ValidateDraft(dto);

        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);
    }

    [Fact]
    public void ValidateFastTrackStep1_ValidStep1Only_ShouldPassWithoutStep2To4()
    {
        // Step 1 filled validly, Step 2-4 (developer, IP, managing authority, legal consent) are null/false
        var dto = CreateValidBaseDto() with
        {
            OfferType = "SOLUTION",
            HasTechTransfer = false,
            Title = "Hệ thống quản lý chuỗi cung ứng thông minh",
            Summary = "Tối ưu hóa logistic",
            ProblemSolved = "Giảm thời gian xử lý đơn hàng",
            SectorCode = "FOOD",
            PricingType = "CONTACT",
            ManagingAuthorityId = null, // Step 4 not filled yet
            LegalConsent = false,        // Step 4 not confirmed yet
            CurrentStep = 1
        };

        var result = SellerOfferRulesValidator.ValidateFastTrackStep1(dto);

        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);

        // Also test dispatch through Validate() with CurrentStep = 1
        var dispatchResult = SellerOfferRulesValidator.Validate(dto);
        Assert.True(dispatchResult.IsValid);
    }

    [Fact]
    public void ValidateFastTrackStep1_HasTechTransferTrue_WithoutTrl_ShouldFail()
    {
        var dto = CreateValidBaseDto() with
        {
            OfferType = "DEVICE",
            HasTechTransfer = true,
            Title = "Cánh tay robot hàn tự động",
            Summary = "Tự động hóa hàn",
            ProblemSolved = "Nâng cao năng suất sản xuất",
            SectorCode = "MECH",
            PricingType = "CONTACT",
            TrlLevel = null,
            CurrentStep = 1
        };

        var result = SellerOfferRulesValidator.ValidateFastTrackStep1(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.TrlLevel)));
    }

    [Fact]
    public void ValidateFastTrackStep1_HasTechTransferTrue_WithValidTrl_ShouldPass()
    {
        var dto = CreateValidBaseDto() with
        {
            OfferType = "DEVICE",
            HasTechTransfer = true,
            Title = "Cánh tay robot hàn tự động",
            Summary = "Tự động hóa hàn",
            ProblemSolved = "Nâng cao năng suất sản xuất",
            SectorCode = "MECH",
            PricingType = "CONTACT",
            TrlLevel = 6,
            CurrentStep = 1
        };

        var result = SellerOfferRulesValidator.ValidateFastTrackStep1(dto);

        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);
    }

    [Fact]
    public void ValidateFastTrackStep1_MissingCoreFields_ShouldFail()
    {
        var dto = CreateValidBaseDto() with
        {
            OfferType = "",
            HasTechTransfer = false,
            Title = "",
            Summary = "",
            ProblemSolved = "",
            SectorCode = "",
            PricingType = "",
            CurrentStep = 1
        };

        var result = SellerOfferRulesValidator.ValidateFastTrackStep1(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.Title)));
        Assert.True(result.Errors.ContainsKey(nameof(dto.Summary)));
        Assert.True(result.Errors.ContainsKey(nameof(dto.ProblemSolved)));
        Assert.True(result.Errors.ContainsKey(nameof(dto.OfferType)));
        Assert.True(result.Errors.ContainsKey(nameof(dto.SectorCode)));
        Assert.True(result.Errors.ContainsKey(nameof(dto.PricingType)));
    }

    [Fact]
    public void ValidateFull4Steps_MissingStep4Consent_ShouldFail()
    {
        var dto = CreateValidBaseDto() with
        {
            LegalConsent = false,
            LegalCommitmentConfirmed = false,
            CurrentStep = 4
        };

        var result = SellerOfferRulesValidator.ValidateFull4Steps(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.LegalConsent)));
    }

    [Fact]
    public void ValidateFull4Steps_MissingManagingAuthority_ShouldFail()
    {
        var dto = CreateValidBaseDto() with
        {
            ManagingAuthorityId = null,
            CurrentStep = 4
        };

        var result = SellerOfferRulesValidator.ValidateFull4Steps(dto);

        Assert.False(result.IsValid);
        Assert.True(result.Errors.ContainsKey(nameof(dto.ManagingAuthorityId)));
    }

    [Fact]
    public void ValidateFull4Steps_LegalCommitmentConfirmed_AcceptsEitherConsentOrCommitment()
    {
        var dto = CreateValidBaseDto() with
        {
            LegalConsent = false,
            LegalCommitmentConfirmed = true,
            CurrentStep = 4
        };

        var result = SellerOfferRulesValidator.ValidateFull4Steps(dto);

        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);
    }

    #endregion
}
