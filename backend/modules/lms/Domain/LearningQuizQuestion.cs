using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearningQuizQuestion : Entity
{
    private LearningQuizQuestion() { }

    public LearningQuizQuestion(
        Guid materialId,
        int displayOrder,
        string questionText,
        string optionA,
        string optionB,
        string optionC,
        string optionD,
        char correctOption,
        string explanation)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (displayOrder is < 1 or > 10) throw new ValidationException("displayOrder của câu hỏi phải từ 1 đến 10");
        if (string.IsNullOrWhiteSpace(questionText)) throw new ValidationException("Nội dung câu hỏi không được để trống");
        if (string.IsNullOrWhiteSpace(optionA)) throw new ValidationException("Phương án A không được để trống");
        if (string.IsNullOrWhiteSpace(optionB)) throw new ValidationException("Phương án B không được để trống");
        if (string.IsNullOrWhiteSpace(optionC)) throw new ValidationException("Phương án C không được để trống");
        if (string.IsNullOrWhiteSpace(optionD)) throw new ValidationException("Phương án D không được để trống");

        var opt = char.ToUpperInvariant(correctOption);
        if (opt is not ('A' or 'B' or 'C' or 'D'))
            throw new ValidationException("Đáp án đúng phải là một trong các phương án A, B, C, D");

        if (string.IsNullOrWhiteSpace(explanation)) throw new ValidationException("Giải thích đáp án không được để trống");

        MaterialId = materialId;
        DisplayOrder = displayOrder;
        QuestionText = questionText.Trim();
        OptionA = optionA.Trim();
        OptionB = optionB.Trim();
        OptionC = optionC.Trim();
        OptionD = optionD.Trim();
        CorrectOption = opt;
        Explanation = explanation.Trim();

        // BR-EL-04: Cảnh báo chênh lệch độ dài phương án trắc nghiệm
        HasLengthWarning = CheckLengthWarning(OptionA, OptionB, OptionC, OptionD);
    }

    public Guid MaterialId { get; private set; }
    public int DisplayOrder { get; private set; }
    public string QuestionText { get; private set; } = string.Empty;
    public string OptionA { get; private set; } = string.Empty;
    public string OptionB { get; private set; } = string.Empty;
    public string OptionC { get; private set; } = string.Empty;
    public string OptionD { get; private set; } = string.Empty;
    public char CorrectOption { get; private set; }
    public string Explanation { get; private set; } = string.Empty;
    public bool HasLengthWarning { get; private set; }

    // Aliases
    public int QuestionIndex => DisplayOrder;
    public string ExplanationText => Explanation;
    public bool IsSuspiciousDistractor => HasLengthWarning;

    public void Update(
        string questionText,
        string optionA,
        string optionB,
        string optionC,
        string optionD,
        char correctOption,
        string explanation)
    {
        if (string.IsNullOrWhiteSpace(questionText)) throw new ValidationException("Nội dung câu hỏi không được để trống");
        if (string.IsNullOrWhiteSpace(optionA)) throw new ValidationException("Phương án A không được để trống");
        if (string.IsNullOrWhiteSpace(optionB)) throw new ValidationException("Phương án B không được để trống");
        if (string.IsNullOrWhiteSpace(optionC)) throw new ValidationException("Phương án C không được để trống");
        if (string.IsNullOrWhiteSpace(optionD)) throw new ValidationException("Phương án D không được để trống");

        var opt = char.ToUpperInvariant(correctOption);
        if (opt is not ('A' or 'B' or 'C' or 'D'))
            throw new ValidationException("Đáp án đúng phải là một trong các phương án A, B, C, D");

        if (string.IsNullOrWhiteSpace(explanation)) throw new ValidationException("Giải thích đáp án không được để trống");

        QuestionText = questionText.Trim();
        OptionA = optionA.Trim();
        OptionB = optionB.Trim();
        OptionC = optionC.Trim();
        OptionD = optionD.Trim();
        CorrectOption = opt;
        Explanation = explanation.Trim();
        HasLengthWarning = CheckLengthWarning(OptionA, OptionB, OptionC, OptionD);
    }

    public void UpdateOrder(int newOrder)
    {
        if (newOrder is < 1 or > 10) throw new ValidationException("displayOrder phải từ 1 đến 10");
        DisplayOrder = newOrder;
    }

    public static bool CheckLengthWarning(string a, string b, string c, string d)
    {
        int[] lens = [a.Length, b.Length, c.Length, d.Length];
        var min = lens.Min();
        var max = lens.Max();
        return min > 0 && max > 2 * min;
    }
}
