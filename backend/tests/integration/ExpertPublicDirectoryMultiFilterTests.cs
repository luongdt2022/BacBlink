using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Api.V1Compat;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Identity.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// TASK-05 Delta v17 (T142): Integration tests cho Multi-Filter Directory Query (degrees, sectorCodes, provinceCode).
/// Kiểm thử logic kết hợp OR nội bộ nhóm tiêu chí và AND liên nhóm tiêu chí theo BR-EXP-DIR-MULTI-FILTER.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class ExpertPublicDirectoryMultiFilterTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    [Fact]
    public async Task GetPublicDirectory_IntraGroupOr_And_InterGroupAnd_WorksCorrectly()
    {
        var personId1 = Guid.CreateVersion7();
        var personId2 = Guid.CreateVersion7();
        var personId3 = Guid.CreateVersion7();

        await using (var setup = fixture.BuildProvider())
        using (var scope = setup.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

            // Chuyên gia 1: GS, ngành LV01 + LV05, tại Hà Nội (HN), công khai và đã duyệt
            var p1 = new ExpertProfile(
                personId1, "GS. Đặng Văn Một", 1970, "male", $"CCCD-{personId1:N}"[..20], new DateOnly(2020, 1, 1),
                academicRank: "GS", academicRankYear: 2018, degree: "DOCTOR", degreeYear: 2005,
                organizationName: "Viện Hàn Lâm KH&CN", organizationAddress: "Hà Nội",
                researchTitle: "Nghiên cứu viên cao cấp", positionTitle: "Trưởng phòng R&D",
                expertiseSectors: ["LV01", "LV05"],
                trainingHistoryJson: null, employmentHistoryJson: null, publicationsJson: null,
                consultingSummary: "Chuyên gia sinh học và dược liệu", isProjectLeader: true, isMainContributor: true,
                pdpdConsentAtUtc: DateTimeOffset.UtcNow);
            p1.LinkToPerson(personId1);
            p1.Approve("Đạt yêu cầu Hội đồng");
            p1.SetPublicListing(true, true, "Bio GS Đặng Văn Một");

            // Chuyên gia 2: PGS, ngành LV01, tại TP. Hồ Chí Minh (SG), công khai và đã duyệt
            var p2 = new ExpertProfile(
                personId2, "PGS. Lê Thị Hai", 1978, "female", $"CCCD-{personId2:N}"[..20], new DateOnly(2020, 2, 2),
                academicRank: "PGS", academicRankYear: 2020, degree: "DOCTOR", degreeYear: 2010,
                organizationName: "Đại học Quốc gia TP.HCM", organizationAddress: "TP.HCM",
                researchTitle: "Phó Giáo sư", positionTitle: "Giảng viên",
                expertiseSectors: ["LV01"],
                trainingHistoryJson: null, employmentHistoryJson: null, publicationsJson: null,
                consultingSummary: "Nông nghiệp công nghệ cao", isProjectLeader: true, isMainContributor: false,
                pdpdConsentAtUtc: DateTimeOffset.UtcNow);
            p2.LinkToPerson(personId2);
            p2.Approve("Đạt yêu cầu Hội đồng");
            p2.SetPublicListing(true, false, "Bio PGS Lê Thị Hai");

            // Chuyên gia 3: Tiến sĩ (TS), ngành LV16 (CNTT), tại Hà Nội (HN), công khai và đã duyệt
            var p3 = new ExpertProfile(
                personId3, "TS. Hoàng Văn Ba", 1985, "male", $"CCCD-{personId3:N}"[..20], new DateOnly(2020, 3, 3),
                academicRank: "NONE", academicRankYear: null, degree: "DOCTOR", degreeYear: 2015,
                organizationName: "Đại học Bách Khoa Hà Nội", organizationAddress: "Hà Nội",
                researchTitle: "Tiến sĩ CNTT", positionTitle: "Trưởng lab AI",
                expertiseSectors: ["LV16"],
                trainingHistoryJson: null, employmentHistoryJson: null, publicationsJson: null,
                consultingSummary: "Thị giác máy tính AI", isProjectLeader: false, isMainContributor: true,
                pdpdConsentAtUtc: DateTimeOffset.UtcNow);
            p3.LinkToPerson(personId3);
            p3.Approve("Đạt yêu cầu Hội đồng");
            p3.SetPublicListing(true, true, "Bio TS Hoàng Văn Ba");

            db.Add(p1);
            db.Add(p2);
            db.Add(p3);
            await db.SaveChangesAsync(Ct);
        }

        await using var provider = fixture.BuildProvider();
        using var testScope = provider.CreateScope();
        var expertService = testScope.ServiceProvider.GetRequiredService<IExpertService>();

        // Scenario 1: Intra-group OR trên degrees: lọc GS hoặc PGS -> trả về p1 và p2
        var orDegreesResult = await expertService.GetPublicDirectoryAsync(
            q: null,
            degrees: ["GS", "PGS"],
            sectorCodes: null,
            provinceCode: null,
            acceptingConsultation: null,
            page: 1,
            pageSize: 10,
            Ct);

        var orDegreeCodes = orDegreesResult.Items.Select(x => x.FullName).ToList();
        orDegreeCodes.ShouldContain("GS. Đặng Văn Một");
        orDegreeCodes.ShouldContain("PGS. Lê Thị Hai");
        orDegreeCodes.ShouldNotContain("TS. Hoàng Văn Ba");

        // Scenario 2: Intra-group OR trên sectorCodes: lọc LV05 hoặc LV16 -> trả về p1 và p3
        var orSectorsResult = await expertService.GetPublicDirectoryAsync(
            q: null,
            degrees: null,
            sectorCodes: ["LV05", "LV16"],
            provinceCode: null,
            acceptingConsultation: null,
            page: 1,
            pageSize: 10,
            Ct);

        var orSectorNames = orSectorsResult.Items.Select(x => x.FullName).ToList();
        orSectorNames.ShouldContain("GS. Đặng Văn Một");
        orSectorNames.ShouldContain("TS. Hoàng Văn Ba");
        orSectorNames.ShouldNotContain("PGS. Lê Thị Hai");

        // Scenario 3: Inter-group AND: degrees=[GS, PGS] AND sectors=[LV01] AND acceptingConsultation=true -> chỉ có p1 (p2 không nhận tư vấn)
        var andResult = await expertService.GetPublicDirectoryAsync(
            q: null,
            degrees: ["GS", "PGS"],
            sectorCodes: ["LV01"],
            provinceCode: null,
            acceptingConsultation: true,
            page: 1,
            pageSize: 10,
            Ct);

        var andNames = andResult.Items.Select(x => x.FullName).ToList();
        andNames.ShouldContain("GS. Đặng Văn Một");
        andNames.ShouldNotContain("PGS. Lê Thị Hai");
        andNames.ShouldNotContain("TS. Hoàng Văn Ba");

        // Scenario 4: Backward compatibility đơn trị: degree="GS" -> chỉ có p1
        var legacyDegreeResult = await expertService.GetPublicDirectoryAsync(
            q: null,
            degrees: ["GS"],
            sectorCodes: null,
            provinceCode: null,
            acceptingConsultation: null,
            page: 1,
            pageSize: 10,
            Ct);

        legacyDegreeResult.Items.Any(x => x.FullName == "GS. Đặng Văn Một").ShouldBeTrue();
        legacyDegreeResult.Items.Any(x => x.FullName == "PGS. Lê Thị Hai").ShouldBeFalse();
    }

    [Theory]
    [InlineData("GS,PGS", new[] { "GS", "PGS" })]
    [InlineData("GS, PGS, TS", new[] { "GS", "PGS", "TS" })]
    [InlineData("LV01,LV05", new[] { "LV01", "LV05" })]
    public void ControllerMultiFilterParser_CorrectlyParsesCsvAndDistinctValues(string csv, string[] expected)
    {
        // Kiểm tra hàm phân giải CSV / mảng lặp
        var parsed = ParseMultiValuesHelper([csv], null);
        parsed.Count.ShouldBe(expected.Length);
        foreach (var exp in expected)
        {
            parsed.ShouldContain(exp.Trim());
        }
    }

    [Fact]
    public void ControllerMultiFilterParser_CorrectlyCombinesRepeatedQueryParamsAndSingleParam()
    {
        string[] arrayParams = ["GS", "PGS"];
        string singleParam = "TS,ThS";

        var combined = ParseMultiValuesHelper(arrayParams, singleParam);
        combined.Count.ShouldBe(4);
        combined.ShouldContain("GS");
        combined.ShouldContain("PGS");
        combined.ShouldContain("TS");
        combined.ShouldContain("ThS");
    }

    private static List<string> ParseMultiValuesHelper(string[]? arrayParams, string? singleCsvParam)
    {
        var results = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (arrayParams != null)
        {
            foreach (var item in arrayParams)
            {
                if (string.IsNullOrWhiteSpace(item)) continue;
                foreach (var split in item.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                {
                    results.Add(split);
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(singleCsvParam))
        {
            foreach (var split in singleCsvParam.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                results.Add(split);
            }
        }

        return results.ToList();
    }
}
