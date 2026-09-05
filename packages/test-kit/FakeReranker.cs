using NacenTech.Kernel.Application;

namespace NacenTech.TestKit;

/// <summary>
/// Reranker giả, tất định: điểm = 1 nếu đoạn chứa dấu `★`, ngược lại = tỷ lệ từ của truy vấn có mặt trong đoạn.
/// Đủ để kiểm rằng tầng dịch vụ **gọi** reranker và **xếp lại** theo điểm của nó; không nói gì về chất lượng.
/// </summary>
public sealed class FakeReranker : IReranker
{
    public List<(string Query, int Passages)> Calls { get; } = [];

    public Task<IReadOnlyList<float>> ScoreAsync(string query, IReadOnlyList<string> passages, CancellationToken ct)
    {
        Calls.Add((query, passages.Count));
        var q = query.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries).Distinct().ToList();
        IReadOnlyList<float> scores = passages.Select(p =>
        {
            if (p.Contains('★')) return 1f;
            var lower = p.ToLowerInvariant();
            return q.Count == 0 ? 0f : (float)q.Count(t => lower.Contains(t)) / q.Count * 0.5f;
        }).ToList();
        return Task.FromResult(scores);
    }
}
