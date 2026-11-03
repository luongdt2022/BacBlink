using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearnerQuizAttempt : Entity
{
    private LearnerQuizAttempt() { }

    public LearnerQuizAttempt(
        Guid materialId,
        Guid personId,
        int attemptCount,
        int totalQuestions,
        int correctAnswers,
        int scorePercent,
        string answersJson,
        bool passed)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (personId == Guid.Empty) throw new ValidationException("personId không được rỗng");
        if (totalQuestions <= 0) throw new ValidationException("totalQuestions phải lớn hơn 0");
        if (correctAnswers < 0 || correctAnswers > totalQuestions)
            throw new ValidationException("correctAnswers không hợp lệ");
        if (scorePercent is < 0 or > 100)
            throw new ValidationException("scorePercent phải từ 0 đến 100");
        if (string.IsNullOrWhiteSpace(answersJson)) throw new ValidationException("answersJson không được để trống");

        MaterialId = materialId;
        PersonId = personId;
        AttemptCount = attemptCount <= 0 ? 1 : attemptCount;
        TotalQuestions = totalQuestions;
        CorrectAnswers = correctAnswers;
        ScorePercent = scorePercent;
        AnswersJson = answersJson;
        Passed = passed;
        SubmittedAt = DateTimeOffset.UtcNow;
    }

    public Guid MaterialId { get; private set; }
    public Guid PersonId { get; private set; }
    public int AttemptCount { get; private set; } = 1;
    public int TotalQuestions { get; private set; }
    public int CorrectAnswers { get; private set; }
    public int ScorePercent { get; private set; }
    public string AnswersJson { get; private set; } = "{}";
    public bool Passed { get; private set; }
    public DateTimeOffset SubmittedAt { get; private set; } = DateTimeOffset.UtcNow;

    // Aliases
    public Guid LearningMaterialId => MaterialId;
    public Guid LearnerPersonId => PersonId;
    public DateTimeOffset CompletedAt => SubmittedAt;
}
