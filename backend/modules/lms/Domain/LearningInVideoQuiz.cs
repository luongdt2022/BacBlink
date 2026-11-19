using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearningInVideoQuiz : Entity
{
    private LearningInVideoQuiz() { }

    public LearningInVideoQuiz(
        Guid materialId,
        string quizCode,
        int triggerSeconds,
        string questionText,
        string optionA,
        string optionB,
        string optionC,
        string optionD,
        char correctOption,
        string explanation,
        Guid? microVideoId = null,
        string? afterScene = null,
        int displayOrder = 1)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (string.IsNullOrWhiteSpace(quizCode)) throw new ValidationException("quizCode không được để trống");
        if (triggerSeconds < 0) throw new ValidationException("triggerSeconds không được âm");
        if (string.IsNullOrWhiteSpace(questionText)) throw new ValidationException("questionText không được để trống");
        if (string.IsNullOrWhiteSpace(optionA)) throw new ValidationException("optionA không được để trống");
        if (string.IsNullOrWhiteSpace(optionB)) throw new ValidationException("optionB không được để trống");
        if (string.IsNullOrWhiteSpace(optionC)) throw new ValidationException("optionC không được để trống");
        if (string.IsNullOrWhiteSpace(optionD)) throw new ValidationException("optionD không được để trống");

        var opt = char.ToUpperInvariant(correctOption);
        if (opt is not ('A' or 'B' or 'C' or 'D'))
            throw new ValidationException("correctOption phải là A, B, C hoặc D");

        if (string.IsNullOrWhiteSpace(explanation)) throw new ValidationException("explanation không được để trống");

        MaterialId = materialId;
        MicroVideoId = microVideoId;
        QuizCode = quizCode.Trim();
        TriggerSeconds = triggerSeconds;
        AfterScene = afterScene?.Trim();
        QuestionText = questionText.Trim();
        OptionA = optionA.Trim();
        OptionB = optionB.Trim();
        OptionC = optionC.Trim();
        OptionD = optionD.Trim();
        CorrectOption = opt;
        Explanation = explanation.Trim();
        DisplayOrder = displayOrder;
    }

    public Guid MaterialId { get; private set; }
    public Guid? MicroVideoId { get; private set; }
    public string QuizCode { get; private set; } = string.Empty;
    public int TriggerSeconds { get; private set; }
    public string? AfterScene { get; private set; }
    public string QuestionText { get; private set; } = string.Empty;
    public string OptionA { get; private set; } = string.Empty;
    public string OptionB { get; private set; } = string.Empty;
    public string OptionC { get; private set; } = string.Empty;
    public string OptionD { get; private set; } = string.Empty;
    public char CorrectOption { get; private set; }
    public string Explanation { get; private set; } = string.Empty;
    public int DisplayOrder { get; private set; }
}
