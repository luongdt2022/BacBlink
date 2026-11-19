using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearnerPracticeEvaluation : Entity
{
    public const int DefaultMaxScore = 14;
    public const int DefaultPassThreshold = 11;

    private LearnerPracticeEvaluation() { }

    public LearnerPracticeEvaluation(
        Guid materialId,
        Guid personId,
        string rubricScoresJson,
        int totalScore,
        string? essayAnswersJson = null,
        bool expertConsultationRequested = false,
        bool demandProfileCreated = false,
        int maxScore = DefaultMaxScore,
        int passThreshold = DefaultPassThreshold)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (personId == Guid.Empty) throw new ValidationException("personId không được rỗng");
        if (string.IsNullOrWhiteSpace(rubricScoresJson)) throw new ValidationException("rubricScoresJson không được để trống");
        if (totalScore is < 0 or > DefaultMaxScore) throw new ValidationException($"totalScore phải từ 0 đến {DefaultMaxScore}");

        MaterialId = materialId;
        PersonId = personId;
        RubricScoresJson = rubricScoresJson;
        EssayAnswersJson = essayAnswersJson;
        TotalScore = totalScore;
        MaxScore = maxScore;
        PassThreshold = passThreshold;
        // BR-EL-08: Ngưỡng >= 11/14 mở khóa CTA kép
        IsUnlockedCta = totalScore >= passThreshold;
        ExpertConsultationRequested = expertConsultationRequested;
        DemandProfileCreated = demandProfileCreated;
        SubmittedAt = DateTimeOffset.UtcNow;
    }

    public Guid MaterialId { get; private set; }
    public Guid PersonId { get; private set; }
    public string RubricScoresJson { get; private set; } = string.Empty;
    public string? EssayAnswersJson { get; private set; }
    public int TotalScore { get; private set; }
    public int MaxScore { get; private set; } = DefaultMaxScore;
    public int PassThreshold { get; private set; } = DefaultPassThreshold;
    public bool IsUnlockedCta { get; private set; }
    public bool ExpertConsultationRequested { get; private set; }
    public bool DemandProfileCreated { get; private set; }
    public DateTimeOffset SubmittedAt { get; private set; }

    public void MarkExpertConsultationRequested()
    {
        if (!IsUnlockedCta)
            throw new ValidationException("Chưa đạt điểm ngưỡng yêu cầu để gửi chuyên gia phản biện");
        ExpertConsultationRequested = true;
    }

    public void MarkDemandProfileCreated()
    {
        if (!IsUnlockedCta)
            throw new ValidationException("Chưa đạt điểm ngưỡng yêu cầu để tạo hồ sơ nhu cầu công nghệ");
        DemandProfileCreated = true;
    }
}
