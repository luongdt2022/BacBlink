using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Lms.Domain;

public sealed class LearningMaterial : AggregateRoot
{
    public const string SubjectKind = "LEARNING_MATERIAL";
    public const long MaxVideoSizeBytes = 1_073_741_824; // 1GB

    private readonly List<LearningMaterialInstructor> _instructors = [];
    private readonly List<LearningQuizQuestion> _quizQuestions = [];
    private readonly List<LearningAttachment> _attachments = [];
    private readonly List<LearningDbLink> _dbLinks = [];
    private readonly List<LearningModerationLog> _moderationLogs = [];
    private readonly List<LearningMicroVideo> _microVideos = [];
    private readonly List<LearningInVideoQuiz> _inVideoQuizzes = [];
    private readonly List<LearningPracticeRubric> _practiceRubrics = [];
    private readonly List<LearningFaq> _faqs = [];

    private LearningMaterial() { }

    public LearningMaterial(
        string materialCode,
        string title,
        string lessonType,
        int durationMinutes,
        string descriptionHtml,
        Guid createdBy,
        string createdByName,
        string? sectorCode = null,
        string? videoStorageKey = null,
        string? videoFileName = null,
        long? videoFileSize = null,
        string? videoSha256 = null,
        string? thumbnailUrl = null,
        string status = LmsStatuses.Draft)
    {
        if (string.IsNullOrWhiteSpace(materialCode)) throw new ValidationException("Mã học liệu không được để trống");
        if (string.IsNullOrWhiteSpace(title)) throw new ValidationException("Tiêu đề học liệu không được để trống");
        if (title.Trim().Length > 250) throw new ValidationException("Tiêu đề học liệu không được vượt quá 250 ký tự");
        if (createdBy == Guid.Empty) throw new ValidationException("createdBy không được rỗng");
        if (string.IsNullOrWhiteSpace(createdByName)) throw new ValidationException("createdByName không được để trống");

        if (videoFileSize > MaxVideoSizeBytes)
            throw new ValidationException("Dung lượng video không được vượt quá 1GB");

        MaterialCode = materialCode.Trim();
        Title = title.Trim();
        LessonType = string.IsNullOrWhiteSpace(lessonType) ? LmsLessonTypes.TypeA : lessonType.Trim();
        DurationMinutes = durationMinutes is >= 1 and <= 300 ? durationMinutes : 1;
        DescriptionHtml = descriptionHtml ?? string.Empty;
        CreatedBy = createdBy;
        CreatedByName = createdByName.Trim();
        SectorCode = sectorCode?.Trim();
        VideoStorageKey = videoStorageKey?.Trim();
        VideoFileName = videoFileName?.Trim();
        VideoFileSize = videoFileSize;
        VideoSha256 = videoSha256?.Trim();
        ThumbnailUrl = thumbnailUrl?.Trim();
        Status = status;

        if (status == LmsStatuses.Published)
        {
            ValidateForPublish();
            PublishedAt = DateTimeOffset.UtcNow;
            PublishedBy = createdBy;
        }

        AddModerationLog(LmsModerationActions.Create, createdBy, createdByName, "Tạo mới học liệu", null, Status);
    }

    public string MaterialCode { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string LessonType { get; private set; } = LmsLessonTypes.TypeA;
    public string? SectorCode { get; private set; }
    public int DurationMinutes { get; private set; } = 1;
    public string DescriptionHtml { get; private set; } = string.Empty;

    public string? VideoStorageKey { get; private set; }
    public string? VideoFileName { get; private set; }
    public long? VideoFileSize { get; private set; }
    public string? VideoSha256 { get; private set; }
    public string? ThumbnailUrl { get; private set; }

    public string Status { get; private set; } = LmsStatuses.Draft;
    public string? UnpublishReason { get; private set; }
    public Guid? UnpublishedBy { get; private set; }
    public string? UnpublishedByName { get; private set; }
    public DateTimeOffset? UnpublishedAt { get; private set; }

    public DateTimeOffset? PublishedAt { get; private set; }
    public Guid? PublishedBy { get; private set; }

    public Guid CreatedBy { get; private set; }
    public string CreatedByName { get; private set; } = string.Empty;
    public Guid? UpdatedBy { get; private set; }
    public string? UpdatedByName { get; private set; }

    public bool IsDeleted { get; private set; }
    public Guid? DeletedBy { get; private set; }
    public DateTimeOffset? DeletedAt { get; private set; }

    public DateTimeOffset? RagIndexedAt { get; private set; }
    public int RagChunkCount { get; private set; }

    public int ViewCount { get; private set; }
    public int CompletionCount { get; private set; }
    public double RatingAverage { get; private set; }
    public int RatingCount { get; private set; }
    public string? Slug { get; private set; }

    public string? ClusterCode { get; private set; }
    public string? ClusterName { get; private set; }
    public int? StepNumber { get; private set; }
    public string? TargetAudience { get; private set; }
    public string? PreparationNotes { get; private set; }
    public string? ExpectedOutcome { get; private set; }
    public int PassScorePercent { get; private set; } = 80;
    public string? LearningObjectivesJson { get; private set; }
    public string? LearningRoadmapJson { get; private set; }
    public string? KnowledgeSummaryJson { get; private set; }
    public string? PracticeWorkbookJson { get; private set; }

    // Aliases
    public string Code => MaterialCode;
    public Guid CreatedByPersonId => CreatedBy;
    public int VideoDurationSeconds => DurationMinutes * 60;
    public long? VideoSizeBytes => VideoFileSize;
    public string? VideoUrl => VideoStorageKey;
    public string ShortDescription => DescriptionHtml.Length > 200 ? DescriptionHtml[..200] : DescriptionHtml;
    public string DetailedDescription => DescriptionHtml;
    public string Level => LessonType;

    public IReadOnlyCollection<LearningMaterialInstructor> Instructors => _instructors.AsReadOnly();
    public IReadOnlyCollection<LearningQuizQuestion> QuizQuestions => _quizQuestions.AsReadOnly();
    public IReadOnlyCollection<LearningAttachment> Attachments => _attachments.AsReadOnly();
    public IReadOnlyCollection<LearningDbLink> DbLinks => _dbLinks.AsReadOnly();
    public IReadOnlyCollection<LearningModerationLog> ModerationLogs => _moderationLogs.AsReadOnly();
    public IReadOnlyCollection<LearningMicroVideo> MicroVideos => _microVideos.AsReadOnly();
    public IReadOnlyCollection<LearningInVideoQuiz> InVideoQuizzes => _inVideoQuizzes.AsReadOnly();
    public IReadOnlyCollection<LearningPracticeRubric> PracticeRubrics => _practiceRubrics.AsReadOnly();
    public IReadOnlyCollection<LearningFaq> Faqs => _faqs.AsReadOnly();

    public SubjectRef AsSubjectRef() => SubjectRef.LearningMaterial(Id);

    // ─── Business Methods ──────────────────────────────────────────────────────────

    public void UpdateDraft(
        string title,
        string lessonType,
        int durationMinutes,
        string descriptionHtml,
        Guid updatedBy,
        string updatedByName,
        string? sectorCode = null,
        string? videoStorageKey = null,
        string? videoFileName = null,
        long? videoFileSize = null,
        string? videoSha256 = null,
        string? thumbnailUrl = null,
        string? slug = null)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ValidationException("Tiêu đề học liệu không được để trống");
        if (title.Trim().Length > 250) throw new ValidationException("Tiêu đề học liệu không được vượt quá 250 ký tự");
        if (durationMinutes is < 1 or > 300) throw new ValidationException("Thời lượng bài học phải từ 1 đến 300 phút");
        if (videoFileSize > MaxVideoSizeBytes) throw new ValidationException("Dung lượng video không được vượt quá 1GB");

        var oldStatus = Status;
        Title = title.Trim();
        LessonType = string.IsNullOrWhiteSpace(lessonType) ? LessonType : lessonType.Trim();
        DurationMinutes = durationMinutes;
        DescriptionHtml = descriptionHtml ?? string.Empty;
        SectorCode = sectorCode?.Trim();
        VideoStorageKey = videoStorageKey?.Trim();
        VideoFileName = videoFileName?.Trim();
        VideoFileSize = videoFileSize;
        VideoSha256 = videoSha256?.Trim();
        ThumbnailUrl = thumbnailUrl?.Trim();
        Slug = slug?.Trim();
        UpdatedBy = updatedBy;
        UpdatedByName = updatedByName.Trim();
        Touch();

        AddModerationLog(LmsModerationActions.Update, updatedBy, updatedByName, "Cập nhật học liệu", oldStatus, Status);
    }

    /// <summary>
    /// BR-EL-01: Cưỡng chế điều kiện công khai bài học ngay lập tức.
    /// </summary>
    public void Publish(Guid actorId, string actorName)
    {
        ValidateForPublish();

        var oldStatus = Status;
        Status = LmsStatuses.Published;
        PublishedAt = DateTimeOffset.UtcNow;
        PublishedBy = actorId;
        UpdatedBy = actorId;
        UpdatedByName = actorName.Trim();
        UnpublishReason = null;
        UnpublishedBy = null;
        UnpublishedByName = null;
        UnpublishedAt = null;
        Touch();

        AddModerationLog(LmsModerationActions.Publish, actorId, actorName, "Công khai học liệu", oldStatus, Status);
    }

    /// <summary>
    /// BR-EL-05 & BR-EL-06: Gỡ bài công khai bắt buộc lý do <= 250 ký tự.
    /// </summary>
    public void Unpublish(Guid actorId, string actorName, string reason)
    {
        if (Status != LmsStatuses.Published)
            throw new ValidationException("Chỉ có thể gỡ công khai học liệu đang ở trạng thái CÔNG KHAI");

        if (string.IsNullOrWhiteSpace(reason))
            throw new ValidationException("Lý do gỡ bài không được để trống");

        if (reason.Trim().Length > 250)
            throw new ValidationException("Lý do gỡ bài không được vượt quá 250 ký tự");

        var oldStatus = Status;
        Status = LmsStatuses.Unpublished;
        UnpublishReason = reason.Trim();
        UnpublishedBy = actorId;
        UnpublishedByName = actorName.Trim();
        UnpublishedAt = DateTimeOffset.UtcNow;
        UpdatedBy = actorId;
        UpdatedByName = actorName.Trim();
        Touch();

        AddModerationLog(LmsModerationActions.Unpublish, actorId, actorName, $"Gỡ công khai: {UnpublishReason}", oldStatus, Status);
    }

    /// <summary>
    /// BR-EL-03: Cảnh báo chuyển bài đang PUBLISHED về DRAFT.
    /// </summary>
    public void RevertToDraft(Guid actorId, string actorName)
    {
        var oldStatus = Status;
        Status = LmsStatuses.Draft;
        UpdatedBy = actorId;
        UpdatedByName = actorName.Trim();
        Touch();

        AddModerationLog(LmsModerationActions.RevertToDraft, actorId, actorName, "Chuyển về bản nháp", oldStatus, Status);
    }

    /// <summary>
    /// BR-EL-06: Chặn xóa bài đang PUBLISHED. Đánh dấu xóa mềm is_deleted = true.
    /// </summary>
    public void SoftDelete(Guid actorId, string actorName)
    {
        if (Status == LmsStatuses.Published)
            throw new ValidationException("Không thể xóa học liệu đang ở trạng thái CÔNG KHAI. Vui lòng gỡ bài trước khi xóa.");

        IsDeleted = true;
        DeletedBy = actorId;
        DeletedAt = DateTimeOffset.UtcNow;
        UpdatedBy = actorId;
        UpdatedByName = actorName.Trim();
        Touch();

        AddModerationLog(LmsModerationActions.Delete, actorId, actorName, "Xóa mềm học liệu", Status, Status);
    }

    // ─── Sub-entities Management & Invariants ─────────────────────────────────────

    public void SetInstructors(IEnumerable<LearningMaterialInstructor> instructors)
    {
        var list = instructors.ToList();
        // BR-EL-05: Tối đa 10 giảng viên
        if (list.Count > 10)
            throw new ValidationException("Một học liệu tối đa có 10 chuyên gia giảng dạy");

        _instructors.Clear();
        _instructors.AddRange(list);
        Touch();
    }

    public void AddInstructor(LearningMaterialInstructor instructor)
    {
        // BR-EL-05: Tối đa 10 giảng viên
        if (_instructors.Count >= 10)
            throw new ValidationException("Một học liệu tối đa có 10 chuyên gia giảng dạy");

        if (_instructors.Any(i => i.ExpertProfileId == instructor.ExpertProfileId))
            throw new ValidationException("Chuyên gia này đã được thêm vào học liệu");

        _instructors.Add(instructor);
        Touch();
    }

    public void SetQuizQuestions(IEnumerable<LearningQuizQuestion> questions)
    {
        var list = questions.ToList();
        // BR-EL-05: Tối đa 10 câu hỏi
        if (list.Count > 10)
            throw new ValidationException("Một học liệu tối đa có 10 câu hỏi trắc nghiệm");

        _quizQuestions.Clear();
        _quizQuestions.AddRange(list);
        Touch();
    }

    public void AddQuizQuestion(LearningQuizQuestion question)
    {
        // BR-EL-05: Tối đa 10 câu hỏi
        if (_quizQuestions.Count >= 10)
            throw new ValidationException("Một học liệu tối đa có 10 câu hỏi trắc nghiệm");

        _quizQuestions.Add(question);
        Touch();
    }

    public void SetAttachments(IEnumerable<LearningAttachment> attachments)
    {
        var list = attachments.ToList();
        var practiceCount = list.Count(a => a.Category == LmsAttachmentCategories.PracticeTool);
        var summaryCount = list.Count(a => a.Category == LmsAttachmentCategories.SummarySheet);
        var policyCount = list.Count(a => a.Category == LmsAttachmentCategories.PolicyDoc);

        // BR-EL-05: Tối đa 10 practice, 1 summary, 10 policy
        if (practiceCount > 10)
            throw new ValidationException("Tối đa 10 tệp Công cụ thực hành");
        if (summaryCount > 1)
            throw new ValidationException("Tối đa 1 tệp Phiếu tóm tắt");
        if (policyCount > 10)
            throw new ValidationException("Tối đa 10 tệp Tài liệu chính sách / khác");

        _attachments.Clear();
        _attachments.AddRange(list);
        Touch();
    }

    public void AddAttachment(LearningAttachment attachment)
    {
        // BR-EL-05: Giới hạn cấu phần
        if (attachment.Category == LmsAttachmentCategories.PracticeTool &&
            _attachments.Count(a => a.Category == LmsAttachmentCategories.PracticeTool) >= 10)
            throw new ValidationException("Tối đa 10 tệp Công cụ thực hành");

        if (attachment.Category == LmsAttachmentCategories.SummarySheet &&
            _attachments.Count(a => a.Category == LmsAttachmentCategories.SummarySheet) >= 1)
            throw new ValidationException("Tối đa 1 tệp Phiếu tóm tắt");

        if (attachment.Category == LmsAttachmentCategories.PolicyDoc &&
            _attachments.Count(a => a.Category == LmsAttachmentCategories.PolicyDoc) >= 10)
            throw new ValidationException("Tối đa 10 tệp Tài liệu chính sách / khác");

        _attachments.Add(attachment);
        Touch();
    }

    public void SetDbLinks(IEnumerable<LearningDbLink> links)
    {
        var list = links.ToList();
        // BR-EL-05: Tối đa 5 DbLinks
        if (list.Count > 5)
            throw new ValidationException("Một học liệu tối đa có 5 liên kết cơ sở dữ liệu");

        _dbLinks.Clear();
        _dbLinks.AddRange(list);
        Touch();
    }

    public void AddDbLink(LearningDbLink link)
    {
        // BR-EL-05: Tối đa 5 DbLinks
        if (_dbLinks.Count >= 5)
            throw new ValidationException("Một học liệu tối đa có 5 liên kết cơ sở dữ liệu");

        _dbLinks.Add(link);
        Touch();
    }

    public void SetClusterAndStep(string? clusterCode, string? clusterName, int? stepNumber)
    {
        if (!string.IsNullOrWhiteSpace(clusterCode) && !LmsClusters.IsValid(clusterCode))
            throw new ValidationException($"Mã cụm năng lực không hợp lệ: {clusterCode}");

        if (stepNumber.HasValue && stepNumber is < 1 or > 7)
            throw new ValidationException("Bước lộ trình phải từ 1 đến 7");

        ClusterCode = clusterCode?.Trim();
        ClusterName = clusterName?.Trim();
        StepNumber = stepNumber;
        Touch();
    }

    public void SetExtendedContent(
        string? targetAudience,
        string? preparationNotes,
        string? expectedOutcome,
        int? passScorePercent,
        string? learningObjectivesJson,
        string? learningRoadmapJson,
        string? knowledgeSummaryJson,
        string? practiceWorkbookJson)
    {
        if (passScorePercent.HasValue && passScorePercent is < 50 or > 100)
            throw new ValidationException("Điểm chuẩn đạt bài học phải từ 50% đến 100%");

        TargetAudience = targetAudience?.Trim();
        PreparationNotes = preparationNotes?.Trim();
        ExpectedOutcome = expectedOutcome?.Trim();
        PassScorePercent = passScorePercent ?? 80;
        LearningObjectivesJson = learningObjectivesJson;
        LearningRoadmapJson = learningRoadmapJson;
        KnowledgeSummaryJson = knowledgeSummaryJson;
        PracticeWorkbookJson = practiceWorkbookJson;
        Touch();
    }

    public void SetMicroVideos(IEnumerable<LearningMicroVideo> microVideos)
    {
        var list = microVideos.ToList();
        if (list.Count > 3)
            throw new ValidationException("Một học liệu tối đa có 3 micro-videos");

        if (list.Select(v => v.VideoOrder).Distinct().Count() != list.Count)
            throw new ValidationException("Thứ tự video_order của micro-videos không được trùng lặp");

        _microVideos.Clear();
        _microVideos.AddRange(list);
        Touch();
    }

    public void AddMicroVideo(LearningMicroVideo video)
    {
        if (_microVideos.Count >= 3)
            throw new ValidationException("Một học liệu tối đa có 3 micro-videos");

        if (_microVideos.Any(v => v.VideoOrder == video.VideoOrder))
            throw new ValidationException($"Đã tồn tại micro-video với videoOrder={video.VideoOrder}");

        _microVideos.Add(video);
        Touch();
    }

    public void SetInVideoQuizzes(IEnumerable<LearningInVideoQuiz> quizzes)
    {
        var list = quizzes.ToList();
        if (list.Count > 6)
            throw new ValidationException("Một học liệu tối đa có 6 câu hỏi tương tác trong video");

        if (list.Select(q => q.QuizCode).Distinct().Count() != list.Count)
            throw new ValidationException("Mã quiz_code câu hỏi tương tác không được trùng lặp");

        _inVideoQuizzes.Clear();
        _inVideoQuizzes.AddRange(list);
        Touch();
    }

    public void AddInVideoQuiz(LearningInVideoQuiz quiz)
    {
        if (_inVideoQuizzes.Count >= 6)
            throw new ValidationException("Một học liệu tối đa có 6 câu hỏi tương tác trong video");

        if (_inVideoQuizzes.Any(q => q.QuizCode.Equals(quiz.QuizCode, StringComparison.OrdinalIgnoreCase)))
            throw new ValidationException($"Đã tồn tại câu hỏi tương tác với quizCode={quiz.QuizCode}");

        _inVideoQuizzes.Add(quiz);
        Touch();
    }

    public void SetPracticeRubrics(IEnumerable<LearningPracticeRubric> rubrics)
    {
        var list = rubrics.ToList();
        if (list.Count > 7)
            throw new ValidationException("Một học liệu tối đa có 7 tiêu chí rubric tự chấm");

        if (list.Select(r => r.CriterionNumber).Distinct().Count() != list.Count)
            throw new ValidationException("Số thứ tự criterion_number của rubric không được trùng lặp");

        _practiceRubrics.Clear();
        _practiceRubrics.AddRange(list);
        Touch();
    }

    public void AddPracticeRubric(LearningPracticeRubric rubric)
    {
        if (_practiceRubrics.Count >= 7)
            throw new ValidationException("Một học liệu tối đa có 7 tiêu chí rubric tự chấm");

        if (_practiceRubrics.Any(r => r.CriterionNumber == rubric.CriterionNumber))
            throw new ValidationException($"Đã tồn tại rubric với criterionNumber={rubric.CriterionNumber}");

        _practiceRubrics.Add(rubric);
        Touch();
    }

    public void SetFaqs(IEnumerable<LearningFaq> faqs)
    {
        var list = faqs.ToList();
        if (list.Count > 8)
            throw new ValidationException("Một học liệu tối đa có 8 câu hỏi đáp thường gặp (FAQ)");

        if (list.Select(f => f.QuestionNumber).Distinct().Count() != list.Count)
            throw new ValidationException("Số thứ tự question_number của FAQ không được trùng lặp");

        _faqs.Clear();
        _faqs.AddRange(list);
        Touch();
    }

    public void AddFaq(LearningFaq faq)
    {
        if (_faqs.Count >= 8)
            throw new ValidationException("Một học liệu tối đa có 8 câu hỏi đáp thường gặp (FAQ)");

        if (_faqs.Any(f => f.QuestionNumber == faq.QuestionNumber))
            throw new ValidationException($"Đã tồn tại FAQ với questionNumber={faq.QuestionNumber}");

        _faqs.Add(faq);
        Touch();
    }

    public void RecordRagIndexed(int chunkCount)
    {
        RagIndexedAt = DateTimeOffset.UtcNow;
        RagChunkCount = chunkCount;
        Touch();
    }

    public void ClearRagIndex()
    {
        RagIndexedAt = null;
        RagChunkCount = 0;
        Touch();
    }

    public void IncrementViewCount() => ViewCount++;
    public void IncrementCompletionCount() => CompletionCount++;

    private void AddModerationLog(string action, Guid actorId, string actorName, string? reason, string? oldStatus, string? newStatus)
    {
        _moderationLogs.Add(new LearningModerationLog(Id, action, actorId, actorName, reason, oldStatus, newStatus));
    }

    private void ValidateForPublish()
    {
        if (string.IsNullOrWhiteSpace(Title))
            throw new ValidationException("Tiêu đề học liệu không được để trống khi công khai");
        if (string.IsNullOrWhiteSpace(LessonType) || !LmsLessonTypes.IsValid(LessonType))
            throw new ValidationException("Loại bài học không hợp lệ khi công khai");
        if (DurationMinutes is < 1 or > 300)
            throw new ValidationException("Thời lượng bài học phải từ 1 đến 300 phút khi công khai");
        if (string.IsNullOrWhiteSpace(DescriptionHtml))
            throw new ValidationException("Mô tả chi tiết bài học không được để trống khi công khai");
        if (string.IsNullOrWhiteSpace(VideoStorageKey))
            throw new ValidationException("Tệp video bài học là bắt buộc khi công khai");
        if (VideoFileSize > MaxVideoSizeBytes)
            throw new ValidationException("Dung lượng video không được vượt quá 1GB");
        if (_instructors.Count == 0)
            throw new ValidationException("Học liệu phải có ít nhất 1 chuyên gia giảng dạy khi công khai");
    }
}
