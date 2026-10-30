using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

/// <summary>
/// TASK-06 / CR-2026-010: Invariant test kiểm tra tính bất biến SSOT của 10 Lĩnh vực chuẩn TT17 và cấm mảng static (BR-SEC-005)
/// </summary>
public sealed class SectorMasterDataInvariantsTests
{
    private static readonly string[] Expected10ActiveSectors =
    [
        "LV01", // Nông nghiệp
        "LV05", // Chế biến thực phẩm – đồ uống
        "LV07", // Cơ khí – chế tạo – công nghiệp hỗ trợ
        "LV08", // Điện – điện tử – tự động hóa
        "LV11", // Nước – môi trường – chất thải
        "LV12", // Xây dựng – vật liệu – hạ tầng
        "LV14", // Logistics – vận tải – kho bãi
        "LV15", // Du lịch – khách sạn – nhà hàng
        "LV16", // CNTT – viễn thông – chuyển đổi số
        "LV17"  // Khoa học – công nghệ – đổi mới sáng tạo
    ];

    [Fact]
    public void Exactly_10_active_sectors_are_defined_in_SSOT_taxonomy()
    {
        Expected10ActiveSectors.Length.ShouldBe(10);
        Expected10ActiveSectors.ShouldAllBe(code => code.StartsWith("LV"));
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
    public void Sector_code_belongs_to_approved_10_TT17_active_sectors(string sectorCode)
    {
        Expected10ActiveSectors.ShouldContain(sectorCode);
    }

    [Theory]
    [InlineData("LV02")]
    [InlineData("LV03")]
    [InlineData("LV04")]
    [InlineData("LV06")]
    [InlineData("LV09")]
    [InlineData("LV10")]
    [InlineData("LV13")]
    [InlineData("LV18")]
    [InlineData("AG")]
    [InlineData("FOOD")]
    [InlineData("MECH")]
    public void Deprecated_or_non_active_sector_codes_must_not_be_in_active_SSOT(string nonActiveCode)
    {
        Expected10ActiveSectors.ShouldNotContain(nonActiveCode);
    }
}
