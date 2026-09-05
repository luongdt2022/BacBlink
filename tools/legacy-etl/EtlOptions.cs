namespace NacenTech.Tools.LegacyEtl;

public sealed class EtlOptions
{
    public const string Section = "Etl";

    /// <summary>Connection string tới PostgreSQL của NacenTwin (chỉ đọc — ETL một chiều, §30.2).</summary>
    public string SourceConnectionString { get; set; } = string.Empty;

    /// <summary>Thư mục `uploads/` của NacenTwin để copy file sang object storage.</summary>
    public string LegacyUploadsPath { get; set; } = "uploads";

    /// <summary>Base URL cũ trong `intake_attachments.file_path` để cắt ra thành đường dẫn tương đối.</summary>
    public string LegacyPublicBaseUrl { get; set; } = "http://localhost:3013";

    public string MappingVersion { get; set; } = "map-v1";

    /// <summary>Thư mục ghi reconciliation report.</summary>
    public string ReportPath { get; set; } = "artifacts/etl";

    /// <summary>Chạy thử: đọc nguồn, đối soát, nhưng không ghi vào .NET.</summary>
    public bool DryRun { get; set; }

    /// <summary>Bỏ qua copy file (khi đã copy bằng công cụ khác).</summary>
    public bool SkipFiles { get; set; }
}
