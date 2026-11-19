using System.Globalization;
using System.Text;
using NacenTech.Kernel.Application;

namespace NacenTech.TestKit;

/// <summary>
/// Sidecar giả, **tất định**: dense là túi-từ băm vào 1024 chiều rồi chuẩn hoá (hai câu chung nhiều từ thì gần
/// nhau), sparse là *băm(từ) → 1* trên từ vựng 250002. Đủ để kiểm đường đi của tầng dịch vụ và chỉ mục — lọc,
/// ngưỡng, hợp nhất kênh — mà không cần mô hình thật; **không** đo được chất lượng xếp hạng, và không được dùng
/// để kết luận gì về BGE-M3.
/// </summary>
public sealed class FakeEmbeddingClient : IEmbeddingClient
{
    public const int Dims = 1024;
    public const int SparseDims = 250002;

    public Task<EmbeddingResult> EmbedAsync(IReadOnlyList<string> inputs, CancellationToken ct)
    {
        var dense = inputs.Select(Dense).ToList();
        var sparse = inputs.Select(Sparse).ToList();
        return Task.FromResult(new EmbeddingResult(dense, "fake-bow", "test", sparse));
    }

    public static float[] Dense(string text)
    {
        var v = new float[Dims];
        foreach (var token in Tokens(text)) v[Hash(token) % Dims] += 1f;
        var norm = MathF.Sqrt(v.Sum(x => x * x));
        if (norm > 0) for (var i = 0; i < v.Length; i++) v[i] /= norm;
        return v;
    }

    public static IReadOnlyDictionary<int, float> Sparse(string text)
        => Tokens(text).Distinct().ToDictionary(t => (int)(Hash(t) % SparseDims), _ => 1f);

    private static IEnumerable<string> Tokens(string text)
        => text.ToLowerInvariant().Normalize(NormalizationForm.FormD)
            .Where(ch => CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
            .Aggregate(new StringBuilder(), (sb, ch) => sb.Append(ch)).ToString()
            .Split([' ', '\n', ',', '.', ';', ':', '-'], StringSplitOptions.RemoveEmptyEntries);

    private static uint Hash(string s)
    {
        unchecked
        {
            uint h = 2166136261;
            foreach (var ch in s) h = (h ^ ch) * 16777619;
            return h;
        }
    }
}
