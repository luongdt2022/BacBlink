using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Matching.Application;

namespace NacenTech.Modules.Matching.Infrastructure;

/// <summary>
/// Gọi Python sidecar BGE-M3 (`dmst-rag-master`). §26.2: KHÔNG port model sang .NET —
/// rủi ro tokenizer XLM-R làm lệch embedding âm thầm. Adapter chỉ gọi `/embed/text`.
/// </summary>
public sealed class RagEmbeddingClient(HttpClient http, IOptions<MatchingOptions> options) : IEmbeddingClient
{
    private readonly MatchingOptions _options = options.Value;
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task<EmbeddingResult> EmbedAsync(IReadOnlyList<string> inputs, CancellationToken ct)
    {
        if (inputs.Count == 0) return new EmbeddingResult([], _options.EmbeddingModelVersion, "bge-m3");
        if (_options.UseSparse) return await EmbedWithSparseAsync(inputs, ct);

        using var response = await http.PostAsJsonAsync("/embed/text", new { text = inputs }, Json, ct);
        var body = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"BGE-M3 HTTP {(int)response.StatusCode}: {body}");

        var parsed = JsonSerializer.Deserialize<EmbedResponse>(body, Json)
                     ?? throw new InvalidOperationException("BGE-M3 trả về body rỗng");
        var vectors = parsed.Embeddings.Select(v => v.ToArray()).ToList();
        if (vectors.Count != inputs.Count)
            throw new InvalidOperationException($"BGE-M3 trả {vectors.Count} vector cho {inputs.Count} đầu vào");
        return new EmbeddingResult(vectors, parsed.Model ?? _options.EmbeddingModelVersion, "bge-m3");
    }

    /// <summary>
    /// `/embed` với `return_sparse` (§26.6.7 bước 4). Sidecar trả `lexical_weights` dạng *mã token (chuỗi) → trọng
    /// số*; ở đây đổi khoá sang số. Bản sidecar gốc 500 ở đường này (numpy.float32 không tuần tự hoá được) — bản
    /// vá trong `search-bench/patch/embedder.py` sửa nó, và ảnh `dmst-rag:pinned` đã mang bản vá.
    /// </summary>
    private async Task<EmbeddingResult> EmbedWithSparseAsync(IReadOnlyList<string> inputs, CancellationToken ct)
    {
        using var response = await http.PostAsJsonAsync("/embed", new { input = inputs, return_dense = true, return_sparse = true, return_colbert = false }, Json, ct);
        var body = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"BGE-M3 /embed HTTP {(int)response.StatusCode}: {body}");

        var parsed = JsonSerializer.Deserialize<AdvancedEmbedResponse>(body, Json)
                     ?? throw new InvalidOperationException("BGE-M3 trả về body rỗng");
        var dense = (parsed.Dense ?? []).Select(v => v.ToArray()).ToList();
        if (dense.Count != inputs.Count)
            throw new InvalidOperationException($"BGE-M3 trả {dense.Count} vector dense cho {inputs.Count} đầu vào");
        var sparse = (parsed.Sparse ?? []).Select(d => (IReadOnlyDictionary<int, float>)d
            .Where(kv => int.TryParse(kv.Key, out _))
            .ToDictionary(kv => int.Parse(kv.Key), kv => kv.Value)).ToList();
        if (sparse.Count != inputs.Count)
            throw new InvalidOperationException($"BGE-M3 trả {sparse.Count} vector sparse cho {inputs.Count} đầu vào");
        return new EmbeddingResult(dense, parsed.Model ?? _options.EmbeddingModelVersion, "bge-m3", sparse);
    }

    private sealed record AdvancedEmbedResponse(
        [property: JsonPropertyName("dense")] List<List<float>>? Dense,
        [property: JsonPropertyName("sparse")] List<Dictionary<string, float>>? Sparse,
        [property: JsonPropertyName("model")] string? Model,
        [property: JsonPropertyName("count")] int Count);

    private sealed record EmbedResponse(
        [property: JsonPropertyName("embeddings")] List<List<float>> Embeddings,
        [property: JsonPropertyName("model")] string? Model,
        [property: JsonPropertyName("count")] int Count);
}
