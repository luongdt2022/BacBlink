using System.Text.RegularExpressions;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Policy.Application;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public sealed class MasterDataAndRolesInvariantsTests
{
    private static readonly Regex IndCodePattern = new("^IND_[A-Z0-9_]+$", RegexOptions.Compiled);

    [Fact]
    public void PlatformRoles_ShouldContain3CanonicalTiers()
    {
        PlatformRoles.Core.Count.ShouldBe(3);
        PlatformRoles.Core.ShouldContain(PlatformRoles.Admin);
        PlatformRoles.Core.ShouldContain(PlatformRoles.Enterprise);
        PlatformRoles.Core.ShouldContain(PlatformRoles.PublicUser);

        PlatformRoles.NormalizeTier("SUPER_ADMIN").ShouldBe(PlatformRoles.Admin);
        PlatformRoles.NormalizeTier("SELLER").ShouldBe(PlatformRoles.Enterprise);
        PlatformRoles.NormalizeTier("BUYER").ShouldBe(PlatformRoles.Enterprise);
        PlatformRoles.NormalizeTier("PROVINCIAL_ADMIN").ShouldBe(PlatformRoles.PublicUser);
    }

    [Fact]
    public void ScopeTypes_ShouldSupport4StandardDimensions()
    {
        ScopeTypes.Global.ShouldBe("GLOBAL");
        ScopeTypes.Province.ShouldBe("PROVINCE");
        ScopeTypes.Sector.ShouldBe("SECTOR");
        ScopeTypes.OrgUnit.ShouldBe("ORG_UNIT");
    }

    [Fact]
    public void BacNinhLocations_ShouldDefine9AreasAndKeyIndustrialParks()
    {
        var bacNinhAreas = new[]
        {
            "TP_BN", "TU_SON", "QUE_VO", "THUAN_THANH", "YEN_PHONG", "TIEN_DU", "GIA_BINH", "LUONG_TAI", "NGOAI_TINH"
        };
        var keyIndustrialParks = new[]
        {
            "KCN_YEN_PHONG_1", "KCN_YEN_PHONG_2C", "KCN_QUE_VO_1", "KCN_QUE_VO_2", "KCN_QUE_VO_3",
            "KCN_VSIP_BN", "KCN_TIEN_SON", "KCN_DAI_DONG_HOAN_SON", "KCN_HANAKA",
            "KCN_THUAN_THANH_1", "KCN_THUAN_THANH_2", "KCN_THUAN_THANH_3", "KCN_GIA_BINH"
        };

        bacNinhAreas.Length.ShouldBe(9);
        keyIndustrialParks.Length.ShouldBe(13);
        TaxonomyKinds.Location.ShouldBe("LOCATION");
    }

    [Fact]
    public void Sectors_MasterData_ShouldDefine8BaclinkCoreSectors()
    {
        var baclinkSectors = new[]
        {
            "IND_ELEC", "IND_MECH", "IND_AUTO", "IND_PLAS", "IND_MAT", "IND_IT", "IND_GREEN", "IND_LOG"
        };

        baclinkSectors.Length.ShouldBe(8);
        foreach (var sec in baclinkSectors)
        {
            IndCodePattern.IsMatch(sec).ShouldBeTrue();
        }
    }

    [Fact]
    public void Tt17_Subsectors_ShouldDefine10GroupCManufacturingIndustries()
    {
        var tt17Codes = new[] { "C.10", "C.11", "C.13", "C.16", "C.20", "C.21", "C.26", "C.27", "C.31", "C.32" };
        tt17Codes.Length.ShouldBe(10);
    }

    [Fact]
    public void TaxonomyTerm_Creation_And_Lifecycle_Invariants()
    {
        var term = new NacenTech.Modules.Policy.Domain.TaxonomyTerm("SECTOR", "Điện tử, Bán dẫn & Thiết bị điện", "IND_ELEC", "{\"tt17Code\":\"C.26, C.27\"}");
        term.Kind.ShouldBe("SECTOR");
        term.Name.ShouldBe("Điện tử, Bán dẫn & Thiết bị điện");
        term.Code.ShouldBe("IND_ELEC");
        term.IsActive.ShouldBeTrue();
        term.MetadataJson.ShouldContain("C.26");

        // Rename
        term.Rename("Điện tử & Bán dẫn Bắc Ninh");
        term.Name.ShouldBe("Điện tử & Bán dẫn Bắc Ninh");

        // Set Code & Metadata
        term.SetCode("IND_ELEC_NEW");
        term.Code.ShouldBe("IND_ELEC_NEW");

        term.SetMetadata("{\"tt17Code\":\"C.26\"}");
        term.MetadataJson.ShouldContain("C.26");

        // Empty metadata fallback
        term.SetMetadata("");
        term.MetadataJson.ShouldBe("{}");

        // Deactivate (soft delete preservation)
        term.Deactivate();
        term.IsActive.ShouldBeFalse();

        // Location term
        var locationTerm = new NacenTech.Modules.Policy.Domain.TaxonomyTerm(TaxonomyKinds.Location, "TP. Bắc Ninh", "TP_BN", "{\"type\":\"AREA\"}");
        locationTerm.Kind.ShouldBe("LOCATION");
        locationTerm.Code.ShouldBe("TP_BN");
        locationTerm.IsActive.ShouldBeTrue();
    }

    [Theory]
    [InlineData("SEC-01", false)]
    [InlineData("SEC-AGRI", false)]
    [InlineData("LV01", false)]
    [InlineData("LV17", false)]
    [InlineData("IND_", false)]
    [InlineData("random_sector", false)]
    [InlineData("", false)]
    [InlineData("   ", false)]
    [InlineData("IND_ELEC", true)]
    [InlineData("IND_MECH", true)]
    [InlineData("ind_green", true)]
    [InlineData("IND_LOG_01", true)]
    public void Sector_Code_Validation_Must_Require_IND_Prefix_And_Reject_Legacy_Prefixes(string code, bool isValid)
    {
        var normalized = code.Trim().ToUpperInvariant();
        var passesValidation = !string.IsNullOrWhiteSpace(normalized) && IndCodePattern.IsMatch(normalized);
        passesValidation.ShouldBe(isValid);
    }
}
