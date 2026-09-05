using System.Text.Json;

namespace NacenTech.Tools.LegacyEtl;

/// <summary>
/// §30.2 bước 4: báo cáo đối soát từng bảng là artefact có owner ký, không phải log.
/// Ghi count nguồn/đích, số bản ghi vào review queue và lý do — thiếu nó thì cutover không có căn cứ đóng.
/// </summary>
public sealed class ReconciliationReport
{
    public required string BatchId { get; init; }
    public required DateTimeOffset StartedAt { get; init; }
    public DateTimeOffset? CompletedAt { get; set; }
    public required string SourceConnection { get; init; }
    public required string MappingVersion { get; init; }
    public List<TableReconciliation> Tables { get; } = [];
    public List<ReviewItem> ManualReviewQueue { get; } = [];

    public bool IsClean => Tables.All(t => t.SourceCount == t.TargetCount && t.Failed == 0) && ManualReviewQueue.Count == 0;

    public TableReconciliation Table(string sourceTable, string targetEntity)
    {
        var existing = Tables.FirstOrDefault(t => t.SourceTable == sourceTable && t.TargetEntity == targetEntity);
        if (existing is not null) return existing;
        var created = new TableReconciliation { SourceTable = sourceTable, TargetEntity = targetEntity };
        Tables.Add(created);
        return created;
    }

    public void Review(string sourceTable, string legacyId, string reason)
        => ManualReviewQueue.Add(new ReviewItem(sourceTable, legacyId, reason));

    public string ToJson() => JsonSerializer.Serialize(this, new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true });

    public string ToText()
    {
        var lines = new List<string>
        {
            $"Reconciliation report — batch {BatchId}",
            $"Bắt đầu:  {StartedAt:u}",
            $"Kết thúc: {CompletedAt:u}",
            $"Mapping version: {MappingVersion}",
            string.Empty,
            $"{"Bảng nguồn",-28}{"Đích",-30}{"Nguồn",8}{"Đích",8}{"Lỗi",8}  Trạng thái",
            new string('-', 96),
        };
        foreach (var t in Tables)
        {
            var status = t.SourceCount == t.TargetCount && t.Failed == 0 ? "KHỚP" : "LỆCH";
            lines.Add($"{t.SourceTable,-28}{t.TargetEntity,-30}{t.SourceCount,8}{t.TargetCount,8}{t.Failed,8}  {status}");
        }
        lines.Add(string.Empty);
        lines.Add($"Manual review queue: {ManualReviewQueue.Count} mục");
        foreach (var item in ManualReviewQueue.Take(50)) lines.Add($"  - [{item.SourceTable}] {item.LegacyId}: {item.Reason}");
        if (ManualReviewQueue.Count > 50) lines.Add($"  ... còn {ManualReviewQueue.Count - 50} mục, xem bản JSON");
        lines.Add(string.Empty);
        lines.Add(IsClean ? "KẾT LUẬN: report sạch — đủ điều kiện đóng bước 4 của runbook §30.2." : "KẾT LUẬN: CHƯA SẠCH — không được cutover khi còn lệch hoặc còn mục review.");
        return string.Join(Environment.NewLine, lines);
    }
}

public sealed class TableReconciliation
{
    public required string SourceTable { get; init; }
    public required string TargetEntity { get; init; }
    public int SourceCount { get; set; }
    public int TargetCount { get; set; }
    public int Imported { get; set; }
    public int Skipped { get; set; }
    public int Failed { get; set; }
    public List<string> Errors { get; } = [];

    public void Fail(string legacyId, Exception ex)
    {
        Failed++;
        if (Errors.Count < 50) Errors.Add($"{legacyId}: {ex.Message}");
    }
}

public sealed record ReviewItem(string SourceTable, string LegacyId, string Reason);
