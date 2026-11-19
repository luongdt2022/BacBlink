using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearningDbLink : Entity
{
    private LearningDbLink() { }

    public LearningDbLink(
        Guid materialId,
        string targetUrl,
        string? displayLabel = null,
        string? description = null,
        string? targetEntityType = null,
        Guid? targetId = null,
        string? targetCode = null,
        int displayOrder = 1)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (string.IsNullOrWhiteSpace(targetUrl)) throw new ValidationException("targetUrl không được để trống");
        if (!Uri.TryCreate(targetUrl, UriKind.Absolute, out var uri) || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            throw new ValidationException("targetUrl phải là một URL http hoặc https hợp lệ");
        if (displayOrder is < 1 or > 5) throw new ValidationException("displayOrder của liên kết CSDL phải từ 1 đến 5");

        MaterialId = materialId;
        TargetUrl = targetUrl.Trim();
        DisplayLabel = displayLabel?.Trim();
        Description = description?.Trim();
        TargetEntityType = targetEntityType?.Trim();
        TargetId = targetId;
        TargetCode = targetCode?.Trim();
        DisplayOrder = displayOrder;
    }

    public Guid MaterialId { get; private set; }
    public string TargetUrl { get; private set; } = string.Empty;
    public string? DisplayLabel { get; private set; }
    public string? Description { get; private set; }
    public string? TargetEntityType { get; private set; }
    public Guid? TargetId { get; private set; }
    public string? TargetCode { get; private set; }
    public int DisplayOrder { get; private set; } = 1;

    // Aliases
    public string? TargetTitle => DisplayLabel;
    public string? TargetKind => TargetEntityType;
    public string? Note => Description;

    public void UpdateOrder(int newOrder)
    {
        if (newOrder is < 1 or > 5) throw new ValidationException("displayOrder phải từ 1 đến 5");
        DisplayOrder = newOrder;
    }
}
