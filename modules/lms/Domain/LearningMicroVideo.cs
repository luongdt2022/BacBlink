using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearningMicroVideo : Entity
{
    private LearningMicroVideo() { }

    public LearningMicroVideo(
        Guid materialId,
        int videoOrder,
        string videoCode,
        string title,
        int durationSeconds = 0,
        string? videoStorageKey = null,
        string? videoFileName = null,
        string? thumbnailUrl = null,
        string? callSheetJson = null)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (videoOrder is < 1 or > 3) throw new ValidationException("videoOrder của micro-video phải từ 1 đến 3");
        if (string.IsNullOrWhiteSpace(videoCode)) throw new ValidationException("videoCode không được để trống");
        if (string.IsNullOrWhiteSpace(title)) throw new ValidationException("title của micro-video không được để trống");

        MaterialId = materialId;
        VideoOrder = videoOrder;
        VideoCode = videoCode.Trim();
        Title = title.Trim();
        DurationSeconds = Math.Max(0, durationSeconds);
        VideoStorageKey = videoStorageKey?.Trim();
        VideoFileName = videoFileName?.Trim();
        ThumbnailUrl = thumbnailUrl?.Trim();
        CallSheetJson = callSheetJson;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public Guid MaterialId { get; private set; }
    public int VideoOrder { get; private set; }
    public string VideoCode { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public int DurationSeconds { get; private set; }
    public string? VideoStorageKey { get; private set; }
    public string? VideoFileName { get; private set; }
    public string? ThumbnailUrl { get; private set; }
    public string? CallSheetJson { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public void UpdateMedia(string? videoStorageKey, string? videoFileName, int durationSeconds, string? thumbnailUrl = null)
    {
        VideoStorageKey = videoStorageKey?.Trim();
        VideoFileName = videoFileName?.Trim();
        DurationSeconds = Math.Max(0, durationSeconds);
        ThumbnailUrl = thumbnailUrl?.Trim() ?? ThumbnailUrl;
    }

    public void UpdateCallSheet(string? callSheetJson)
    {
        CallSheetJson = callSheetJson;
    }
}
