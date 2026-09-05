using System.Security.Cryptography;
using Microsoft.Extensions.Options;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Integration.Application;

namespace NacenTech.Modules.Integration.Infrastructure;

/// <summary>
/// Kho đối tượng bản đầu: đĩa cục bộ có hash. Đích là S3-compatible + Object Lock (D2-24) —
/// đổi adapter không đụng module nghiệp vụ vì mọi nơi chỉ dùng IObjectStorage.
/// Khác legacy: tên file ngẫu nhiên UUIDv7, và hash SHA-256 được tính khi ghi (§16.3).
/// </summary>
public sealed class LocalDiskObjectStorage(IOptions<ObjectStorageOptions> options) : IObjectStorage
{
    private readonly ObjectStorageOptions _options = options.Value;

    public async Task<StoredObject> PutAsync(Stream content, string folder, string originalFileName, string contentType, CancellationToken ct)
    {
        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        var safeFolder = SanitizeSegment(folder);
        var key = $"{safeFolder}/{Guid.CreateVersion7():N}{ext}";
        var path = ResolvePath(key);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);

        long size;
        string hash;
        await using (var file = File.Create(path))
        using (var sha = SHA256.Create())
        {
            var buffer = new byte[81920];
            int read;
            size = 0;
            while ((read = await content.ReadAsync(buffer, ct)) > 0)
            {
                size += read;
                if (size > _options.MaxFileBytes)
                {
                    file.Close();
                    File.Delete(path);
                    throw new ValidationException($"File vượt giới hạn {_options.MaxFileBytes} byte");
                }
                sha.TransformBlock(buffer, 0, read, null, 0);
                await file.WriteAsync(buffer.AsMemory(0, read), ct);
            }
            sha.TransformFinalBlock([], 0, 0);
            hash = Convert.ToHexStringLower(sha.Hash!);
        }

        return new StoredObject(key, Path.GetFileName(key), contentType, size, hash);
    }

    public Task<Stream?> OpenReadAsync(string key, CancellationToken ct)
    {
        var path = ResolvePath(key);
        if (!File.Exists(path)) return Task.FromResult<Stream?>(null);
        return Task.FromResult<Stream?>(File.OpenRead(path));
    }

    public Task<bool> ExistsAsync(string key, CancellationToken ct) => Task.FromResult(File.Exists(ResolvePath(key)));

    public string PublicUrl(string key) => $"{_options.PublicBaseUrl.TrimEnd('/')}/files/{key}";

    private string ResolvePath(string key)
    {
        if (key.Contains("..", StringComparison.Ordinal) || Path.IsPathRooted(key))
            throw new ValidationException("Storage key không hợp lệ");
        var root = Path.GetFullPath(_options.RootPath);
        var full = Path.GetFullPath(Path.Combine(root, key.Replace('/', Path.DirectorySeparatorChar)));
        if (!full.StartsWith(root, StringComparison.Ordinal)) throw new ValidationException("Storage key không hợp lệ");
        return full;
    }

    private static string SanitizeSegment(string segment)
        => new(segment.Where(c => char.IsLetterOrDigit(c) || c is '-' or '_').ToArray());
}
