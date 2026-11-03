using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearnerProgress : Entity
{
    private LearnerProgress() { }

    public LearnerProgress(Guid materialId, Guid personId)
    {
        if (materialId == Guid.Empty) throw new ValidationException("materialId không được rỗng");
        if (personId == Guid.Empty) throw new ValidationException("personId không được rỗng");

        MaterialId = materialId;
        PersonId = personId;
        WatchedSeconds = 0;
        ProgressPercent = 0;
        BestQuizScore = 0;
        QuizAttemptsCount = 0;
        IsCompleted = false;
        LastAccessedAt = DateTimeOffset.UtcNow;
    }

    public Guid MaterialId { get; private set; }
    public Guid PersonId { get; private set; }
    public int WatchedSeconds { get; private set; }
    public int ProgressPercent { get; private set; }
    public int BestQuizScore { get; private set; }
    public int QuizAttemptsCount { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateTimeOffset LastAccessedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; private set; }

    // Aliases
    public Guid LearningMaterialId => MaterialId;
    public Guid LearnerPersonId => PersonId;
    public int LastWatchedSeconds => WatchedSeconds;

    public void UpdateProgress(int watchedSeconds, int totalDurationSeconds)
    {
        if (watchedSeconds < 0) watchedSeconds = 0;
        WatchedSeconds = Math.Max(WatchedSeconds, watchedSeconds);
        LastAccessedAt = DateTimeOffset.UtcNow;

        if (totalDurationSeconds > 0)
        {
            var calculated = (int)Math.Min(100, (double)WatchedSeconds / totalDurationSeconds * 100);
            ProgressPercent = Math.Max(ProgressPercent, calculated);
        }

        CheckCompletion();
    }

    public void RecordQuizAttempt(int scorePercent)
    {
        QuizAttemptsCount++;
        BestQuizScore = Math.Max(BestQuizScore, scorePercent);
        LastAccessedAt = DateTimeOffset.UtcNow;
        CheckCompletion();
    }

    private void CheckCompletion()
    {
        if (!IsCompleted && ProgressPercent >= 80 && BestQuizScore >= 60)
        {
            IsCompleted = true;
            CompletedAt = DateTimeOffset.UtcNow;
        }
    }
}
