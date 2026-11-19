using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearningAttachment : Entity
{
    private LearningAttachment() { }

    public LearningAttachment(
        Guid materialId,
        string category,
        string fileName,
        string storageKey,
        string contentType,
        long fileSizeBytes,
        string? sha256Hash = null,
        int displayOrder = 1)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (!LmsAttachmentCategories.All.Contains(category))
            throw new ValidationException($"Loại tài liệu không hợp lệ: {category}. Phải là một trong: {string.Join(", ", LmsAttachmentCategories.All)}");
        if (string.IsNullOrWhiteSpace(fileName)) throw new ValidationException("Tên tệp không được để trống");
        if (string.IsNullOrWhiteSpace(storageKey)) throw new ValidationException("Đường dẫn lưu trữ storageKey không được để trống");
        if (fileSizeBytes <= 0) throw new ValidationException("Dung lượng tệp phải lớn hơn 0");

        // Giới hạn dung lượng theo loại tài liệu
        // Practice tool <= 10MB, Summary sheet <= 10MB, Policy doc <= 25MB
        const long mb10 = 10 * 1024 * 1024;
        const long mb25 = 25 * 1024 * 1024;

        if (category == LmsAttachmentCategories.PracticeTool && fileSizeBytes > mb10)
            throw new ValidationException("Công cụ thực hành không được vượt quá 10MB");
        if (category == LmsAttachmentCategories.SummarySheet && fileSizeBytes > mb10)
            throw new ValidationException("Phiếu tóm tắt không được vượt quá 10MB");
        if (category == LmsAttachmentCategories.PolicyDoc && fileSizeBytes > mb25)
            throw new ValidationException("Tài liệu chính sách / tài liệu khác không được vượt quá 25MB");

        MaterialId = materialId;
        Category = category;
        FileName = fileName.Trim();
        StorageKey = storageKey.Trim();
        ContentType = string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType.Trim();
        FileSizeBytes = fileSizeBytes;
        Sha256Hash = sha256Hash?.Trim();
        DisplayOrder = displayOrder;
        UploadedAt = DateTimeOffset.UtcNow;
    }

    public Guid MaterialId { get; private set; }
    public string Category { get; private set; } = LmsAttachmentCategories.PracticeTool;
    public string FileName { get; private set; } = string.Empty;
    public string StorageKey { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = "application/octet-stream";
    public long FileSizeBytes { get; private set; }
    public string? Sha256Hash { get; private set; }
    public int DisplayOrder { get; private set; } = 1;
    public DateTimeOffset UploadedAt { get; private set; } = DateTimeOffset.UtcNow;

    // Aliases
    public string FileUrl => StorageKey;
    public string FileType => Category;

    public void UpdateOrder(int newOrder)
    {
        if (newOrder < 1) throw new ValidationException("displayOrder phải lớn hơn hoặc bằng 1");
        DisplayOrder = newOrder;
    }
}
