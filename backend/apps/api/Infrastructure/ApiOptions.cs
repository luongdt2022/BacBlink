namespace NacenTech.Api.Infrastructure;

public sealed class ApiOptions
{
    public const string Section = "Api";
    /// <summary>D2-148: facade /api/v1 có ngày sunset; sau ngày này trả 410 kèm Link tới v2.</summary>
    public bool V1CompatEnabled { get; set; } = true;
    public DateOnly? V1SunsetDate { get; set; }
    /// <summary>Dev: chạy outbox/job worker trong tiến trình API. Production: tách sang apps/worker.</summary>
    public bool RunWorkersInProcess { get; set; }
    public bool EnableSwaggerUi { get; set; } = true;
}

public sealed class CorsOptions
{
    public const string Section = "Cors";
    public string[] Origins { get; set; } = ["http://localhost:5173", "http://localhost:5174"];
}
