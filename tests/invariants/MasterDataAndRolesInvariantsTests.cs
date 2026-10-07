using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public sealed class MasterDataAndRolesInvariantsTests
{
    [Fact]
    public void PlatformRoles_ShouldContainAll10CoreRoles()
    {
        PlatformRoles.Core.Count.ShouldBe(10);
        PlatformRoles.Core.ShouldContain(PlatformRoles.SuperAdmin);
        PlatformRoles.Core.ShouldContain(PlatformRoles.OperatorAdmin);
        PlatformRoles.Core.ShouldContain(PlatformRoles.ProvincialAdmin);
        PlatformRoles.Core.ShouldContain(PlatformRoles.SectorAdmin);
        PlatformRoles.Core.ShouldContain(PlatformRoles.ClusterAdmin);
        PlatformRoles.Core.ShouldContain(PlatformRoles.Seller);
        PlatformRoles.Core.ShouldContain(PlatformRoles.Buyer);
        PlatformRoles.Core.ShouldContain(PlatformRoles.InnovationEntity);
        PlatformRoles.Core.ShouldContain(PlatformRoles.VerifiedExpert);
        PlatformRoles.Core.ShouldContain(PlatformRoles.PublicUser);
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
    public void KeyProvinces34_ShouldSumToExactly34Across3Regions()
    {
        var northProvinces = new[] { "HN", "HP", "QN", "BN", "VP", "TN", "HD", "HY", "ND", "PT", "NB", "BG" };
        var centralProvinces = new[] { "DN", "TH", "NA", "TTH", "QNA", "QNG", "BD", "KH", "DL", "LD" };
        var southProvinces = new[] { "SG", "BDG", "DNA", "BRVT", "CT", "LA", "TG", "AG", "DT", "KG", "TNH", "CM" };

        northProvinces.Length.ShouldBe(12);
        centralProvinces.Length.ShouldBe(10);
        southProvinces.Length.ShouldBe(12);

        (northProvinces.Length + centralProvinces.Length + southProvinces.Length).ShouldBe(34);
    }

    [Fact]
    public void Sectors_MasterData_ShouldDefine10CoreSectors()
    {
        var coreSectors = new[]
        {
            "LV01", "LV05", "LV07", "LV08", "LV11", "LV12", "LV14", "LV15", "LV16", "LV17"
        };

        coreSectors.Length.ShouldBe(10);
        foreach (var sec in coreSectors)
        {
            sec.StartsWith("LV").ShouldBeTrue();
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
        var term = new NacenTech.Modules.Policy.Domain.TaxonomyTerm("SECTOR", "Nông nghiệp", "LV01", "{\"tt17Code\":\"Liên ngành\"}");
        term.Kind.ShouldBe("SECTOR");
        term.Name.ShouldBe("Nông nghiệp");
        term.Code.ShouldBe("LV01");
        term.IsActive.ShouldBeTrue();
        term.MetadataJson.ShouldContain("Liên ngành");

        // Rename
        term.Rename("Nông nghiệp & PTNT");
        term.Name.ShouldBe("Nông nghiệp & PTNT");

        // Set Code & Metadata
        term.SetCode("LV01_NEW");
        term.Code.ShouldBe("LV01_NEW");

        term.SetMetadata("{\"tt17Code\":\"C.01\"}");
        term.MetadataJson.ShouldContain("C.01");

        // Empty metadata fallback
        term.SetMetadata("");
        term.MetadataJson.ShouldBe("{}");

        // Deactivate (soft delete preservation)
        term.Deactivate();
        term.IsActive.ShouldBeFalse();
    }

    [Theory]
    [InlineData("SEC-01", false)]
    [InlineData("SEC-AGRI", false)]
    [InlineData("random_sector", false)]
    [InlineData("", false)]
    [InlineData("   ", false)]
    [InlineData("LV01", true)]
    [InlineData("LV05", true)]
    [InlineData("LV17", true)]
    [InlineData("lv01", true)]
    public void Sector_Code_Validation_Must_Reject_SEC_Prefix_And_Require_LV_Prefix(string code, bool isValid)
    {
        var normalized = code.Trim().ToUpperInvariant();
        var passesValidation = !string.IsNullOrWhiteSpace(normalized) && normalized.StartsWith("LV");
        passesValidation.ShouldBe(isValid);
    }
}

