using System;
using System.Collections.Generic;
using System.Linq;

namespace NacenTech.Kernel.Application;

/// <summary>
/// Cung cấp thuật toán xoay tua xác định hàng ngày (Deterministic Daily Rotation)
/// và lựa chọn ngành đan xen (Interleaved Sector Selection) phục vụ Cung - Cầu Trang chủ.
/// Reference: TASK-01 Delta v2 (BR-01-DELTA-01, BR-01-DELTA-02, BR-01-DELTA-03).
/// </summary>
public static class InterleavedRotation
{
    /// <summary>
    /// Tính toán seed xác định theo định dạng yyyyMMdd (UTC) để đảm bảo ổn định phiên trong ngày.
    /// </summary>
    public static int GetDailySeed(DateTime? date = null)
    {
        var targetDate = date ?? DateTime.UtcNow;
        return int.Parse(targetDate.ToString("yyyyMMdd"));
    }

    /// <summary>
    /// Áp dụng khử trùng lặp theo khóa (tiêu đề chuẩn hóa), xáo trộn ngẫu nhiên xác định theo seed ngày,
    /// và lựa chọn luân phiên các ngành (mỗi ngành tối đa <paramref name="maxPerSector"/> items) đến khi đạt <paramref name="limit"/>.
    /// </summary>
    public static List<T> RotateAndInterleave<T>(
        IEnumerable<T> source,
        Func<T, string> keySelector,
        Func<T, string?> sectorSelector,
        int limit = 6,
        int maxPerSector = 2,
        int? seed = null)
    {
        if (source == null) return new List<T>();
        if (limit <= 0) return new List<T>();

        // 1. Deduplication theo khóa chuẩn hóa (giữ lại item đầu tiên thỏa mãn độ ưu tiên)
        var deduplicated = new List<T>();
        var seenKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var item in source)
        {
            var rawKey = keySelector(item);
            var key = rawKey?.Trim().ToLowerInvariant() ?? string.Empty;
            if (string.IsNullOrEmpty(key) || seenKeys.Add(key))
            {
                deduplicated.Add(item);
            }
        }

        if (deduplicated.Count == 0) return deduplicated;

        // 2. Deterministic RNG dựa trên seed ngày
        var actualSeed = seed ?? GetDailySeed();
        var rng = new Random(actualSeed);

        // 3. Phân nhóm theo mã ngành chuẩn hóa
        var groups = deduplicated
            .GroupBy(x => sectorSelector(x)?.Trim().ToUpperInvariant() ?? "OTHER")
            .ToDictionary(g => g.Key, g => g.ToList());

        // 4. Xáo trộn ngẫu nhiên thứ tự các ngành và danh sách items trong từng ngành
        var sectorKeys = groups.Keys.ToList();
        Shuffle(sectorKeys, rng);

        foreach (var key in sectorKeys)
        {
            Shuffle(groups[key], rng);
        }

        // 5. Interleaved Round-Robin Selection (tối đa maxPerSector items mỗi ngành)
        var result = new List<T>(limit);
        var sectorCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var k in sectorKeys)
        {
            sectorCounts[k] = 0;
        }

        bool pickedAnyInRound;
        do
        {
            pickedAnyInRound = false;
            foreach (var sector in sectorKeys)
            {
                if (result.Count >= limit) break;

                if (sectorCounts[sector] < maxPerSector && groups[sector].Count > 0)
                {
                    var item = groups[sector][0];
                    groups[sector].RemoveAt(0);
                    result.Add(item);
                    sectorCounts[sector]++;
                    pickedAnyInRound = true;
                }
            }
        } while (pickedAnyInRound && result.Count < limit);

        return result;
    }

    private static void Shuffle<TItem>(IList<TItem> list, Random rng)
    {
        int n = list.Count;
        while (n > 1)
        {
            n--;
            int k = rng.Next(n + 1);
            (list[k], list[n]) = (list[n], list[k]);
        }
    }
}
