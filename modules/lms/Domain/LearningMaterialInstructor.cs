using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearningMaterialInstructor : Entity
{
    private LearningMaterialInstructor() { }

    public LearningMaterialInstructor(
        Guid materialId,
        Guid expertProfileId,
        string fullName,
        string? titleDegree = null,
        string? orgName = null,
        string? avatarUrl = null,
        int displayOrder = 1,
        bool isLead = false,
        string? roleDescription = null)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (expertProfileId == Guid.Empty) throw new ValidationException("expertProfileId không được rỗng");
        if (string.IsNullOrWhiteSpace(fullName)) throw new ValidationException("Họ tên chuyên gia không được để trống");
        if (displayOrder is < 1 or > 10) throw new ValidationException("displayOrder của chuyên gia phải từ 1 đến 10");

        MaterialId = materialId;
        ExpertProfileId = expertProfileId;
        FullName = fullName.Trim();
        TitleDegree = titleDegree?.Trim();
        OrgName = orgName?.Trim();
        AvatarUrl = avatarUrl?.Trim();
        DisplayOrder = displayOrder;
        IsLead = isLead;
        RoleDescription = roleDescription?.Trim();
    }

    public Guid MaterialId { get; private set; }
    public Guid ExpertProfileId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string? TitleDegree { get; private set; }
    public string? OrgName { get; private set; }
    public string? AvatarUrl { get; private set; }
    public int DisplayOrder { get; private set; } = 1;
    public bool IsLead { get; private set; }
    public string? RoleDescription { get; private set; }

    // Aliases
    public Guid PersonId => ExpertProfileId;
    public string DisplayName => FullName;
    public string? AcademicTitle => TitleDegree;
    public string? OrganizationName => OrgName;

    public void UpdateOrder(int newOrder)
    {
        if (newOrder is < 1 or > 10) throw new ValidationException("displayOrder phải từ 1 đến 10");
        DisplayOrder = newOrder;
    }
}
