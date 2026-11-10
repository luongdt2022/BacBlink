using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearningFaq : Entity
{
    private LearningFaq() { }

    public LearningFaq(
        Guid materialId,
        int questionNumber,
        string questionText,
        string answerText,
        int displayOrder = 1)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (questionNumber is < 1 or > 8) throw new ValidationException("questionNumber phải từ 1 đến 8");
        if (string.IsNullOrWhiteSpace(questionText)) throw new ValidationException("questionText không được để trống");
        if (string.IsNullOrWhiteSpace(answerText)) throw new ValidationException("answerText không được để trống");

        MaterialId = materialId;
        QuestionNumber = questionNumber;
        QuestionText = questionText.Trim();
        AnswerText = answerText.Trim();
        DisplayOrder = displayOrder;
    }

    public Guid MaterialId { get; private set; }
    public int QuestionNumber { get; private set; }
    public string QuestionText { get; private set; } = string.Empty;
    public string AnswerText { get; private set; } = string.Empty;
    public int DisplayOrder { get; private set; }
}
