using NacenTech.Modules.Lms.Domain;

namespace NacenTech.Modules.Lms.Application;

public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Total,
    int Page,
    int PageSize)
{
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)Total / PageSize) : 0;
}

public sealed class LmsMaterialFilterRequest
{
    public string? Keyword { get; set; }
    public string? LessonType { get; set; }
    public string? Status { get; set; }
    public string? ClusterCode { get; set; }
    public int? StepNumber { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public sealed record LmsMaterialListItemDto(
    Guid Id,
    string MaterialCode,
    string Title,
    string LessonType,
    string? SectorCode,
    int DurationMinutes,
    string Status,
    string? ThumbnailUrl,
    string? VideoStorageKey,
    Guid CreatedBy,
    string CreatedByName,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    int Version,
    int ViewCount,
    int CompletionCount,
    int InstructorsCount,
    int QuizQuestionsCount,
    int AttachmentsCount,
    int DbLinksCount,
    string? UnpublishReason,
    string? ClusterCode = null,
    string? ClusterName = null,
    int? StepNumber = null,
    int MicroVideosCount = 0,
    int InVideoQuizzesCount = 0,
    int PracticeRubricsCount = 0,
    int FaqsCount = 0,
    string? LearningRoadmapJson = null,
    string? LeadInstructorName = null);

public sealed record MicroVideoDto(
    Guid? Id,
    int VideoOrder,
    string VideoCode,
    string Title,
    int DurationSeconds,
    string? VideoStorageKey,
    string? VideoFileName,
    string? ThumbnailUrl,
    string? CallSheetJson,
    string? VideoDownloadUrl = null);

public sealed record InVideoQuizDto(
    Guid? Id,
    Guid? MicroVideoId,
    string QuizCode,
    int TriggerSeconds,
    string? AfterScene,
    string QuestionText,
    string OptionA,
    string OptionB,
    string OptionC,
    string OptionD,
    char CorrectOption,
    string Explanation,
    int DisplayOrder);

public sealed record PracticeRubricDto(
    Guid? Id,
    int CriterionNumber,
    string CriterionName,
    string DescriptionScore0,
    string DescriptionScore1,
    string DescriptionScore2,
    int WeightMultiplier = 1);

public sealed record FaqDto(
    Guid? Id,
    int QuestionNumber,
    string QuestionText,
    string AnswerText,
    int DisplayOrder);

public sealed class SubmitPracticeEvaluationRequest
{
    public Dictionary<int, int> RubricScores { get; set; } = []; // CriterionNumber (1..7) -> Score (0,1,2)
    public Dictionary<string, string>? EssayAnswers { get; set; } // "PartA", "PartB", "PartC"
    public bool RequestExpertConsultation { get; set; }
    public bool CreateDemandProfile { get; set; }
}

public sealed record PracticeEvaluationResultDto(
    int TotalScore,
    int MaxScore,
    int PassThreshold,
    bool IsUnlockedCta,
    bool UnlockedExpertReviewCta,
    bool UnlockedDemandCreateCta,
    string FeedbackMessage,
    DateTimeOffset SubmittedAt);

public sealed record InstructorDto(
    Guid? Id,
    Guid ExpertProfileId,
    string FullName,
    string? TitleDegree,
    string? OrgName,
    string? AvatarUrl,
    int DisplayOrder,
    bool IsLead = false,
    string? RoleDescription = null);

public sealed record QuizQuestionDto(
    Guid? Id,
    int DisplayOrder,
    string QuestionText,
    string OptionA,
    string OptionB,
    string OptionC,
    string OptionD,
    char CorrectOption,
    string Explanation,
    bool HasLengthWarning = false);

public sealed record AttachmentDto(
    Guid? Id,
    string Category,
    string FileName,
    string StorageKey,
    string ContentType,
    long FileSizeBytes,
    string? Sha256Hash,
    int DisplayOrder,
    string? DownloadUrl = null);

public sealed record DbLinkDto(
    Guid? Id,
    string TargetUrl,
    string? DisplayLabel,
    string? Description,
    string? TargetEntityType,
    Guid? TargetId,
    string? TargetCode,
    int DisplayOrder);

public sealed record ModerationLogDto(
    Guid Id,
    string Action,
    string? Reason,
    Guid ActorId,
    string ActorName,
    string? OldStatus,
    string? NewStatus,
    DateTimeOffset OccurredAt);

public sealed record LearningMaterialDetailDto(
    Guid Id,
    string MaterialCode,
    string Title,
    string LessonType,
    string? SectorCode,
    int DurationMinutes,
    string DescriptionHtml,
    string? VideoStorageKey,
    string? VideoFileName,
    long? VideoFileSize,
    string? VideoSha256,
    string? ThumbnailUrl,
    string Status,
    string? UnpublishReason,
    Guid? UnpublishedBy,
    string? UnpublishedByName,
    DateTimeOffset? UnpublishedAt,
    DateTimeOffset? PublishedAt,
    Guid? PublishedBy,
    Guid CreatedBy,
    string CreatedByName,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    int Version,
    bool IsDeleted,
    DateTimeOffset? RagIndexedAt,
    int RagChunkCount,
    int ViewCount,
    int CompletionCount,
    double RatingAverage,
    int RatingCount,
    string? Slug,
    IReadOnlyList<InstructorDto> Instructors,
    IReadOnlyList<QuizQuestionDto> QuizQuestions,
    IReadOnlyList<AttachmentDto> Attachments,
    IReadOnlyList<DbLinkDto> DbLinks,
    IReadOnlyList<ModerationLogDto> ModerationLogs,
    string? VideoDownloadUrl = null,
    string? ClusterCode = null,
    string? ClusterName = null,
    int? StepNumber = null,
    string? TargetAudience = null,
    string? PreparationNotes = null,
    string? ExpectedOutcome = null,
    int PassScorePercent = 80,
    string? LearningObjectivesJson = null,
    string? LearningRoadmapJson = null,
    string? KnowledgeSummaryJson = null,
    string? PracticeWorkbookJson = null,
    IReadOnlyList<MicroVideoDto>? MicroVideos = null,
    IReadOnlyList<InVideoQuizDto>? InVideoQuizzes = null,
    IReadOnlyList<PracticeRubricDto>? PracticeRubrics = null,
    IReadOnlyList<FaqDto>? Faqs = null);

public sealed class CreateLearningMaterialRequest
{
    public string Title { get; set; } = string.Empty;
    public string LessonType { get; set; } = LmsLessonTypes.TypeA;
    public string? SectorCode { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public string DescriptionHtml { get; set; } = string.Empty;

    public string? VideoStorageKey { get; set; }
    public string? VideoFileName { get; set; }
    public long? VideoFileSize { get; set; }
    public string? VideoSha256 { get; set; }
    public string? ThumbnailUrl { get; set; }

    public string Status { get; set; } = LmsStatuses.Draft;

    public List<InstructorDto> Instructors { get; set; } = [];
    public List<QuizQuestionDto> QuizQuestions { get; set; } = [];
    public List<AttachmentDto> Attachments { get; set; } = [];
    public List<DbLinkDto> DbLinks { get; set; } = [];
}

public sealed class UpdateLearningMaterialRequest
{
    public string Title { get; set; } = string.Empty;
    public string LessonType { get; set; } = LmsLessonTypes.TypeA;
    public string? SectorCode { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public string DescriptionHtml { get; set; } = string.Empty;

    public string? VideoStorageKey { get; set; }
    public string? VideoFileName { get; set; }
    public long? VideoFileSize { get; set; }
    public string? VideoSha256 { get; set; }
    public string? ThumbnailUrl { get; set; }

    public string Status { get; set; } = LmsStatuses.Draft;
    public int Version { get; set; }

    public List<InstructorDto> Instructors { get; set; } = [];
    public List<QuizQuestionDto> QuizQuestions { get; set; } = [];
    public List<AttachmentDto> Attachments { get; set; } = [];
    public List<DbLinkDto> DbLinks { get; set; } = [];
}

public sealed class UnpublishMaterialRequest
{
    public string Reason { get; set; } = string.Empty;
}

public sealed record LmsKpiDto(
    int TotalCourses,
    int TotalViews,
    int TotalCompletions,
    int TotalInstructors);

public sealed record LmsCatalogResponse(
    PagedResult<LmsMaterialListItemDto> Materials,
    LmsKpiDto Kpis);

public sealed class SubmitQuizAttemptRequest
{
    public Dictionary<Guid, char> Answers { get; set; } = [];
}

public sealed record QuizQuestionResultDto(
    Guid QuestionId,
    int DisplayOrder,
    string QuestionText,
    char CorrectOption,
    char SelectedOption,
    bool IsCorrect,
    string Explanation);

public sealed record QuizAttemptResultDto(
    int ScorePercent,
    int CorrectAnswers,
    int TotalQuestions,
    bool Passed,
    IReadOnlyList<QuizQuestionResultDto> Questions);
