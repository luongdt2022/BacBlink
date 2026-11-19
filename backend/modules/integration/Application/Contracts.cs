namespace NacenTech.Modules.Integration.Application;

public sealed class ObjectStorageOptions
{
    public const string Section = "ObjectStorage";
    /// <summary>Thư mục gốc lưu file (đích: S3-compatible + Object Lock, D2-24). Mặc định ./storage.</summary>
    public string RootPath { get; set; } = "storage";
    /// <summary>URL public của API để dựng link file: {PublicBaseUrl}/files/{key}.</summary>
    public string PublicBaseUrl { get; set; } = "http://localhost:5000";
    public long MaxFileBytes { get; set; } = 10 * 1024 * 1024;
}

public sealed class MailOptions
{
    public const string Section = "Mail";
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 587;
    public bool UseSsl { get; set; }
    public bool UseStartTls { get; set; } = true;
    public string? User { get; set; }
    public string? Password { get; set; }
    public string From { get; set; } = "noreply@example.com";
    public string FromName { get; set; } = "NacenTech";
    /// <summary>Khi true, không gửi thật mà ghi log (dev/test).</summary>
    public bool DryRun { get; set; } = true;
}

public sealed class AiProviderOptions
{
    public const string Section = "Ai";
    public string DefaultProvider { get; set; } = "openai";
    public ProviderEndpoint OpenAi { get; set; } = new() { BaseUrl = "https://api.openai.com/v1", DefaultModel = "gpt-4o-mini" };
    public ProviderEndpoint OpenRouter { get; set; } = new() { BaseUrl = "https://openrouter.ai/api/v1", DefaultModel = "openai/gpt-4o-mini" };

    public sealed class ProviderEndpoint
    {
        public string BaseUrl { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string DefaultModel { get; set; } = string.Empty;
    }
}

public interface IMailTemplateRenderer
{
    string Render(string template, IReadOnlyDictionary<string, string> context);
    string SubjectFor(string template, IReadOnlyDictionary<string, string> context);
}
