using System;
using System.Collections.Generic;
using System.Linq;
using NacenTech.Kernel.Application;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public class InterleavedRotationTests
{
    private record TestItem(string Id, string Title, string SectorCode);

    [Fact]
    public void RotateAndInterleave_WithSameSeed_ProducesDeterministicResult()
    {
        var items = new List<TestItem>
        {
            new("1", "Giải pháp AI 1", "LV01"),
            new("2", "Giải pháp AI 2", "LV01"),
            new("3", "Giải pháp AI 3", "LV01"),
            new("4", "Robot hàn 1", "LV08"),
            new("5", "Robot hàn 2", "LV08"),
            new("6", "Xử lý nước thải 1", "LV11"),
            new("7", "Xử lý nước thải 2", "LV11"),
            new("8", "Công nghệ sấy 1", "LV05"),
        };

        const int seed = 20261022;
        var run1 = InterleavedRotation.RotateAndInterleave(items, x => x.Title, x => x.SectorCode, limit: 6, maxPerSector: 2, seed: seed);
        var run2 = InterleavedRotation.RotateAndInterleave(items, x => x.Title, x => x.SectorCode, limit: 6, maxPerSector: 2, seed: seed);

        run1.Count.ShouldBe(6);
        run2.Count.ShouldBe(6);
        run1.Select(x => x.Id).ShouldBe(run2.Select(x => x.Id));
    }

    [Fact]
    public void RotateAndInterleave_DeduplicatesTitles_CaseAndWhitespaceInsensitive()
    {
        var items = new List<TestItem>
        {
            new("1", "Giải pháp AI kiểm soát phế phẩm", "LV08"),
            new("2", "  Giải pháp AI kiểm soát phế phẩm  ", "LV08"),
            new("3", "GIẢI PHÁP AI KIỂM SOÁT PHẾ PHẨM", "LV08"),
            new("4", "Robot hàn laser", "LV08"),
            new("5", "Khử màu nước thải", "LV11"),
            new("6", "Công nghệ sinh học tôm", "LV01"),
        };

        var result = InterleavedRotation.RotateAndInterleave(items, x => x.Title, x => x.SectorCode, limit: 6, maxPerSector: 2, seed: 12345);

        // Titles must be unique
        var normalizedTitles = result.Select(x => x.Title.Trim().ToLowerInvariant()).ToList();
        normalizedTitles.Distinct().Count().ShouldBe(normalizedTitles.Count);
        result.Count(x => x.Title.Trim().ToLowerInvariant().Contains("kiểm soát phế phẩm")).ShouldBe(1);
    }

    [Fact]
    public void RotateAndInterleave_EnforcesMaxPerSector_Limit()
    {
        var items = new List<TestItem>
        {
            new("1", "Agri 1", "LV01"),
            new("2", "Agri 2", "LV01"),
            new("3", "Agri 3", "LV01"),
            new("4", "Agri 4", "LV01"),
            new("5", "Agri 5", "LV01"),
            new("6", "Tech 1", "LV08"),
            new("7", "Tech 2", "LV08"),
            new("8", "Water 1", "LV11"),
            new("9", "Water 2", "LV11"),
            new("10", "Food 1", "LV05"),
        };

        var result = InterleavedRotation.RotateAndInterleave(items, x => x.Title, x => x.SectorCode, limit: 6, maxPerSector: 2, seed: 42);

        result.Count.ShouldBe(6);

        // Verify no sector has more than 2 items
        var sectorGroups = result.GroupBy(x => x.SectorCode.ToUpperInvariant());
        foreach (var group in sectorGroups)
        {
            group.Count().ShouldBeLessThanOrEqualTo(2);
        }

        // Must span at least 3 distinct sectors when limit is 6 and maxPerSector is 2
        sectorGroups.Count().ShouldBeGreaterThanOrEqualTo(3);
    }

    [Fact]
    public void RotateAndInterleave_WithDifferentSeed_ProducesDifferentOrder()
    {
        var items = Enumerable.Range(1, 20)
            .Select(i => new TestItem(i.ToString(), $"Item {i}", $"LV{i % 5:D2}"))
            .ToList();

        var resultDay1 = InterleavedRotation.RotateAndInterleave(items, x => x.Title, x => x.SectorCode, limit: 6, maxPerSector: 2, seed: 20261022);
        var resultDay2 = InterleavedRotation.RotateAndInterleave(items, x => x.Title, x => x.SectorCode, limit: 6, maxPerSector: 2, seed: 20261023);

        resultDay1.Select(x => x.Id).ShouldNotBe(resultDay2.Select(x => x.Id));
    }

    [Fact]
    public void RotateAndInterleave_HandlesEmptyOrSmallListGracefully()
    {
        var empty = InterleavedRotation.RotateAndInterleave(new List<TestItem>(), x => x.Title, x => x.SectorCode, limit: 6);
        empty.ShouldBeEmpty();

        var single = new List<TestItem> { new("1", "Single Item", "LV01") };
        var resultSingle = InterleavedRotation.RotateAndInterleave(single, x => x.Title, x => x.SectorCode, limit: 6);
        resultSingle.Count.ShouldBe(1);
        resultSingle[0].Id.ShouldBe("1");
    }
}
