using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Matching.Infrastructure;

/// <summary>
/// Cross-encoder rerank qua sidecar (`POST /rerank`, mô hình `BAAI/bge-reranker-v2-m3`) — §26.6.3 chọn
/// cross-encoder thay ColBERT vì nó nhìn thấy đầy đủ cặp truy vấn–đoạn. Sidecar trả điểm đã qua sigmoid (0–1),
/// nên điểm này đứng được cạnh ngưỡng của chế độ đã sửa mà không cần quy đổi.
/// </summary>
public sealed class RagRerankClient(HttpClient http) : IReranker
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task<IReadOnlyList<float>> ScoreAsync(string query, IReadOnlyList<string> passages, CancellationToken ct)
    {
        if (passages.Count == 0) return [];
        using var response = await http.PostAsJsonAsync("/rerank", new { query, passages, normalize = true }, Json, ct);
        var body = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Reranker HTTP {(int)response.StatusCode}: {body}");
        var parsed = JsonSerializer.Deserialize<RerankResponse>(body, Json) ?? throw new InvalidOperationException("Reranker trả về body rỗng");
        if (parsed.Scores.Count != passages.Count)
            throw new InvalidOperationException($"Reranker trả {parsed.Scores.Count} điểm cho {passages.Count} đoạn");
        return parsed.Scores;
    }

    private sealed record RerankResponse([property: JsonPropertyName("scores")] List<float> Scores, [property: JsonPropertyName("model")] string? Model);
}
