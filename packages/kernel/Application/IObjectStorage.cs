namespace NacenTech.Kernel.Application;

/// <summary>
/// Kho đối tượng (§26.2). Bản đầu: đĩa cục bộ có hash; đích: S3-compatible + Object Lock (D2-24).
/// Key là đường dẫn tương đối `folder/uuid.ext`; URL public do host cấp qua endpoint /files.
/// </summary>
public interface IObjectStorage
{
    Task<StoredObject> PutAsync(Stream content, string folder, string originalFileName, string contentType, CancellationToken ct);
    Task<Stream?> OpenReadAsync(string key, CancellationToken ct);
    Task<bool> ExistsAsync(string key, CancellationToken ct);
    string PublicUrl(string key);
}

public sealed record StoredObject(string Key, string FileName, string ContentType, long Size, string Sha256);
