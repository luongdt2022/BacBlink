using System.Security.Cryptography;
using Microsoft.AspNetCore.Http;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Lms.Domain;

namespace NacenTech.Modules.Lms.Application;

public sealed record LmsMediaUploadResultDto(
    string StorageKey,
    string FileName,
    long FileSizeBytes,
    string ContentType,
    string DownloadUrl,
    string Sha256);

public interface ILmsMediaService
{
    Task<LmsMediaUploadResultDto> UploadVideoAsync(IFormFile file, CancellationToken ct = default);
    Task<LmsMediaUploadResultDto> UploadAttachmentAsync(IFormFile file, string category, CancellationToken ct = default);
}

public sealed class LmsMediaService(IObjectStorage storage) : ILmsMediaService
{
    private const long MaxVideoBytes = 1_073_741_824; // 1GB
    private const long MaxToolBytes = 10 * 1024 * 1024; // 10MB
    private const long MaxPolicyBytes = 25 * 1024 * 1024; // 25MB

    private static readonly HashSet<string> AllowedVideoExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".mp4"
    };

    private static readonly HashSet<string> AllowedAttachmentExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".docx", ".doc", ".pptx", ".ppt", ".xlsx", ".xls", ".zip"
    };

    public async Task<LmsMediaUploadResultDto> UploadVideoAsync(IFormFile file, CancellationToken ct = default)
    {
        if (file is null || file.Length == 0)
            throw new ValidationException("Tệp video không được để trống");

        if (file.Length > MaxVideoBytes)
            throw new ValidationException("Dung lượng tệp video vượt quá giới hạn cho phép (tối đa 1GB)");

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedVideoExtensions.Contains(ext))
            throw new ValidationException("Định dạng video không được hỗ trợ. Chỉ chấp nhận tệp .mp4");

        var contentType = string.IsNullOrWhiteSpace(file.ContentType) ? "video/mp4" : file.ContentType;
        await using var stream = file.OpenReadStream();

        var stored = await storage.PutAsync(stream, "lms/videos", file.FileName, contentType, ct);
        var url = storage.PublicUrl(stored.Key);

        return new LmsMediaUploadResultDto(
            stored.Key,
            stored.FileName,
            stored.Size,
            stored.ContentType,
            url,
            stored.Sha256);
    }

    public async Task<LmsMediaUploadResultDto> UploadAttachmentAsync(IFormFile file, string category, CancellationToken ct = default)
    {
        if (file is null || file.Length == 0)
            throw new ValidationException("Tệp đính kèm không được để trống");

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedAttachmentExtensions.Contains(ext))
            throw new ValidationException($"Định dạng tệp '{ext}' không được hỗ trợ.");

        if (category == LmsAttachmentCategories.PracticeTool && file.Length > MaxToolBytes)
            throw new ValidationException("Dung lượng Công cụ thực hành không được vượt quá 10MB");

        if (category == LmsAttachmentCategories.SummarySheet && file.Length > MaxToolBytes)
            throw new ValidationException("Dung lượng Phiếu tóm tắt không được vượt quá 10MB");

        if (category == LmsAttachmentCategories.PolicyDoc && file.Length > MaxPolicyBytes)
            throw new ValidationException("Dung lượng Tài liệu chính sách / khác không được vượt quá 25MB");

        var contentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType;
        await using var stream = file.OpenReadStream();

        var stored = await storage.PutAsync(stream, "lms/attachments", file.FileName, contentType, ct);
        var url = storage.PublicUrl(stored.Key);

        return new LmsMediaUploadResultDto(
            stored.Key,
            stored.FileName,
            stored.Size,
            stored.ContentType,
            url,
            stored.Sha256);
    }
}
