using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearningPracticeRubric : Entity
{
    private LearningPracticeRubric() { }

    public LearningPracticeRubric(
        Guid materialId,
        int criterionNumber,
        string criterionName,
        string descriptionScore0,
        string descriptionScore1,
        string descriptionScore2,
        int weightMultiplier = 1)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (criterionNumber is < 1 or > 7) throw new ValidationException("criterionNumber phải từ 1 đến 7");
        if (string.IsNullOrWhiteSpace(criterionName)) throw new ValidationException("criterionName không được để trống");
        if (string.IsNullOrWhiteSpace(descriptionScore0)) throw new ValidationException("descriptionScore0 không được để trống");
        if (string.IsNullOrWhiteSpace(descriptionScore1)) throw new ValidationException("descriptionScore1 không được để trống");
        if (string.IsNullOrWhiteSpace(descriptionScore2)) throw new ValidationException("descriptionScore2 không được để trống");

        MaterialId = materialId;
        CriterionNumber = criterionNumber;
        CriterionName = criterionName.Trim();
        DescriptionScore0 = descriptionScore0.Trim();
        DescriptionScore1 = descriptionScore1.Trim();
        DescriptionScore2 = descriptionScore2.Trim();
        WeightMultiplier = Math.Max(1, weightMultiplier);
    }

    public Guid MaterialId { get; private set; }
    public int CriterionNumber { get; private set; }
    public string CriterionName { get; private set; } = string.Empty;
    public string DescriptionScore0 { get; private set; } = string.Empty;
    public string DescriptionScore1 { get; private set; } = string.Empty;
    public string DescriptionScore2 { get; private set; } = string.Empty;
    public int WeightMultiplier { get; private set; } = 1;
}
