using System.Globalization;
using System.Text;

namespace NacenTech.Modules.Matching.Infrastructure;

/// <summary>
/// Chuẩn hoá văn bản tiếng Việt **trước khi** vào chỉ mục và trước khi làm truy vấn — hai ca pass/fail của
/// §26.6.6: NFC/NFD phải cho cùng kết quả, và hai kiểu đặt dấu ("hòa" kiểu cũ, "hoà" kiểu mới) phải là một.
/// PostgreSQL không biết hai chuyện đó; cột sinh sẵn không gọi được .NET; nên chuẩn hoá ở đúng một chỗ, ở đây,
/// cho cả hai chiều.
///
/// Quy ước chọn: **kiểu mới** — dấu thanh đặt trên nguyên âm thứ hai của các cặp `oa`, `oe`, `uy` khi nguyên âm
/// thứ nhất là `o`/`u` trần (không phải `ô`, `ơ`, `ư`). Chọn kiểu nào không quan trọng bằng chọn *một* kiểu.
/// </summary>
public static class VietnameseText
{
    private static readonly HashSet<char> ToneMarks = ['̀', '́', '̃', '̉', '̣']; // huyền, sắc, ngã, hỏi, nặng
    private static readonly HashSet<char> FirstVowels = ['o', 'u', 'O', 'U'];
    private static readonly HashSet<char> SecondVowels = ['a', 'e', 'y', 'A', 'E', 'Y'];

    public static string Canonical(string? text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;
        var d = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(d.Length);
        var i = 0;
        while (i < d.Length)
        {
            var ch = d[i];
            // Mẫu kiểu cũ: [o|u] + (dấu thanh) + [a|e|y] + (các dấu khác của nguyên âm 2, không có dấu thanh)
            if (FirstVowels.Contains(ch) && i + 2 < d.Length && ToneMarks.Contains(d[i + 1]))
            {
                var j = i + 2;
                // nguyên âm 1 không được mang dấu mũ/móc (ô, ơ, ư) — chỉ o/u trần
                if (SecondVowels.Contains(d[j]))
                {
                    var tone = d[i + 1];
                    sb.Append(ch).Append(d[j]);
                    var k = j + 1;
                    // giữ các dấu không phải thanh của nguyên âm 2 (ví dụ ă, â) trước dấu thanh
                    while (k < d.Length && CharUnicodeInfo.GetUnicodeCategory(d[k]) == UnicodeCategory.NonSpacingMark && !ToneMarks.Contains(d[k]))
                        sb.Append(d[k++]);
                    sb.Append(tone);
                    i = k;
                    continue;
                }
            }
            sb.Append(ch);
            i++;
        }
        return sb.ToString().Normalize(NormalizationForm.FormC);
    }

    /// <summary>Có dấu tiếng Việt (dấu thanh hoặc dấu mũ/móc/đ) hay không — quyết định tra trường có dấu hay trường không dấu.</summary>
    public static bool HasDiacritics(string? text)
    {
        if (string.IsNullOrEmpty(text)) return false;
        foreach (var ch in text.Normalize(NormalizationForm.FormD))
        {
            if (CharUnicodeInfo.GetUnicodeCategory(ch) == UnicodeCategory.NonSpacingMark) return true;
            if (ch is 'đ' or 'Đ') return true;
        }
        return false;
    }
}
