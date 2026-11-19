namespace NacenTech.Kernel.Domain;

/// <summary>
/// Tham chiếu đa hình tới một artifact nghiệp vụ mà module khác không cần biết kiểu cụ thể.
/// Dùng cho data room (document thuộc subject nào), matching (chunk của subject nào),
/// communication (invitation giữa hai subject). Module chỉ trao đổi ID (§9.1).
/// </summary>
public readonly record struct SubjectRef(string Kind, Guid Id)
{
    public static SubjectRef Demand(Guid id) => new(SubjectKinds.DemandBrief, id);
    public static SubjectRef Technology(Guid id) => new(SubjectKinds.TechnologyAsset, id);
    public static SubjectRef Case(Guid id) => new(SubjectKinds.CommercializationCase, id);
    public static SubjectRef Person(Guid id) => new(SubjectKinds.Person, id);
    public static SubjectRef DemandItem(Guid id) => new(SubjectKinds.DemandItem, id);
    public static SubjectRef SellerOffer(Guid id) => new(SubjectKinds.SellerOffer, id);
    public static SubjectRef LearningMaterial(Guid id) => new(SubjectKinds.LearningMaterial, id);

    public override string ToString() => $"{Kind}:{Id}";

    public static SubjectRef Parse(string value)
    {
        var idx = value.IndexOf(':');
        if (idx <= 0) throw new FormatException($"SubjectRef không hợp lệ: {value}");
        return new SubjectRef(value[..idx], Guid.Parse(value[(idx + 1)..]));
    }
}

public static class SubjectKinds
{
    public const string DemandBrief = "DEMAND_BRIEF";
    public const string TechnologyAsset = "TECHNOLOGY_ASSET";
    public const string CommercializationCase = "COMMERCIALIZATION_CASE";
    public const string Person = "PERSON";

    // Mở rộng Cung - Cầu thực tế TASK-08
    public const string DemandItem = "DEMAND_ITEM";
    public const string SellerOffer = "SELLER_OFFER";

    // Phân hệ Học liệu số & Đào tạo E-Learning TASK-10
    public const string LearningMaterial = "LEARNING_MATERIAL";
}
