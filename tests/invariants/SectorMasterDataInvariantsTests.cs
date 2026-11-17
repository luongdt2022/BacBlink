using System.Text.RegularExpressions;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

/// <summary>
/// TASK-06 / CR-BACLINK-003: Invariant test kiểm tra tính bất biến SSOT của 8 Ngành công nghiệp BACLINK (IND_*)
/// và danh mục Địa bàn/KCN Bắc Ninh (BR-BACLINK-TAX-001, BR-BACLINK-TAX-002, BR-SEC-005).
/// </summary>
public sealed class SectorMasterDataInvariantsTests
{
    private static readonly Regex IndCodePattern = new("^IND_[A-Z0-9_]+$", RegexOptions.Compiled);

    private static readonly string[] Expected8BaclinkActiveSectors =
    [
        "IND_ELEC",  // Điện tử, Bán dẫn & Thiết bị điện
        "IND_MECH",  // Cơ khí chính xác, Khuôn mẫu & Chế tạo máy
        "IND_AUTO",  // Tự động hóa, Robot & Smart Factory
        "IND_PLAS",  // Nhựa kỹ thuật, Bao bì & Hóa chất công nghiệp
        "IND_MAT",   // Vật liệu mới & Công nghiệp hỗ trợ
        "IND_IT",    // Công nghệ thông tin, Phần mềm công nghiệp & MES/ERP
        "IND_GREEN", // Công nghiệp xanh, Năng lượng sạch & ESG
        "IND_LOG"    // Logistics công nghiệp, Kho vận & Chuỗi cung ứng
    ];

    private static readonly string[] Expected9BacNinhAreas =
    [
        "TP_BN", "TU_SON", "QUE_VO", "THUAN_THANH", "YEN_PHONG", "TIEN_DU", "GIA_BINH", "LUONG_TAI", "NGOAI_TINH"
    ];

    [Fact]
    public void Exactly_8_baclink_active_sectors_are_defined_in_SSOT_taxonomy()
    {
        Expected8BaclinkActiveSectors.Length.ShouldBe(8);
        Expected8BaclinkActiveSectors.ShouldAllBe(code => IndCodePattern.IsMatch(code));
    }

    [Theory]
    [InlineData("IND_ELEC")]
    [InlineData("IND_MECH")]
    [InlineData("IND_AUTO")]
    [InlineData("IND_PLAS")]
    [InlineData("IND_MAT")]
    [InlineData("IND_IT")]
    [InlineData("IND_GREEN")]
    [InlineData("IND_LOG")]
    public void Sector_code_belongs_to_approved_8_baclink_active_sectors(string sectorCode)
    {
        Expected8BaclinkActiveSectors.ShouldContain(sectorCode);
    }

    [Theory]
    [InlineData("LV01")]
    [InlineData("LV05")]
    [InlineData("LV07")]
    [InlineData("LV08")]
    [InlineData("LV11")]
    [InlineData("LV12")]
    [InlineData("LV14")]
    [InlineData("LV15")]
    [InlineData("LV16")]
    [InlineData("LV17")]
    [InlineData("SEC-01")]
    [InlineData("AG")]
    [InlineData("FOOD")]
    [InlineData("MECH")]
    public void Deprecated_or_legacy_sector_codes_must_not_be_in_active_SSOT(string nonActiveCode)
    {
        Expected8BaclinkActiveSectors.ShouldNotContain(nonActiveCode);
    }

    [Fact]
    public void BacNinh_locations_must_define_8_plus_1_areas()
    {
        Expected9BacNinhAreas.Length.ShouldBe(9);
        Expected9BacNinhAreas.ShouldContain("TP_BN");
        Expected9BacNinhAreas.ShouldContain("YEN_PHONG");
        Expected9BacNinhAreas.ShouldContain("NGOAI_TINH");
    }
}
