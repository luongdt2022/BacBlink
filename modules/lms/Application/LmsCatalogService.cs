using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Lms.Domain;

namespace NacenTech.Modules.Lms.Application;

public interface ILmsCatalogService
{
    Task<LmsCatalogResponse> GetCatalogAsync(
        LmsMaterialFilterRequest filter,
        CancellationToken ct = default);

    Task<LearningMaterialDetailDto> GetCatalogDetailAsync(
        Guid id,
        Guid? currentUserId,
        bool isStaffOrAuthor = false,
        CancellationToken ct = default);

    Task<LearnerProgress?> GetLearnerProgressAsync(
        Guid materialId,
        Guid personId,
        CancellationToken ct = default);

    Task RecordProgressAsync(
        Guid materialId,
        Guid personId,
        int watchedSeconds,
        CancellationToken ct = default);

    Task<QuizAttemptResultDto> SubmitQuizAttemptAsync(
        Guid materialId,
        Guid personId,
        SubmitQuizAttemptRequest request,
        CancellationToken ct = default);

    Task<PracticeEvaluationResultDto> SubmitPracticeEvaluationAsync(
        Guid materialId,
        Guid personId,
        SubmitPracticeEvaluationRequest request,
        CancellationToken ct = default);
}

public sealed class LmsCatalogService(DbContext db, IObjectStorage? storage = null) : ILmsCatalogService
{
    public async Task<LmsCatalogResponse> GetCatalogAsync(
        LmsMaterialFilterRequest filter,
        CancellationToken ct = default)
    {
        var page = filter.Page <= 0 ? 1 : filter.Page;
        var pageSize = filter.PageSize is <= 0 or > 100 ? 12 : filter.PageSize;

        var baseQuery = db.Set<LearningMaterial>()
            .Where(x => !x.IsDeleted && x.Status == LmsStatuses.Published);

        // 4 Thẻ KPI động truy vấn trực tiếp từ PostgreSQL
        var totalCourses = await baseQuery.CountAsync(ct);
        var totalViews = await baseQuery.SumAsync(x => x.ViewCount, ct);
        var totalCompletions = await baseQuery.SumAsync(x => x.CompletionCount, ct);

        var totalInstructors = await db.Set<LearningMaterialInstructor>()
            .Where(i => db.Set<LearningMaterial>().Any(m => m.Id == i.MaterialId && !m.IsDeleted && m.Status == LmsStatuses.Published))
            .Select(i => i.ExpertProfileId)
            .Distinct()
            .CountAsync(ct);

        var kpis = new LmsKpiDto(totalCourses, totalViews, totalCompletions, totalInstructors);

        // Lọc danh sách bài học
        var query = baseQuery
            .Include(x => x.Instructors)
            .Include(x => x.QuizQuestions)
            .Include(x => x.Attachments)
            .Include(x => x.DbLinks)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.Keyword))
        {
            var kw = filter.Keyword.Trim().ToLower();
            query = query.Where(x =>
                x.Title.ToLower().Contains(kw) ||
                x.DescriptionHtml.ToLower().Contains(kw) ||
                x.Instructors.Any(i => i.FullName.ToLower().Contains(kw)));
        }

        if (!string.IsNullOrWhiteSpace(filter.LessonType))
        {
            query = query.Where(x => x.LessonType == filter.LessonType);
        }

        if (!string.IsNullOrWhiteSpace(filter.ClusterCode))
        {
            query = query.Where(x => x.ClusterCode == filter.ClusterCode);
        }

        if (filter.StepNumber.HasValue)
        {
            query = query.Where(x => x.StepNumber == filter.StepNumber.Value);
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(x => x.PublishedAt ?? x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new LmsMaterialListItemDto(
                x.Id,
                x.MaterialCode,
                x.Title,
                x.LessonType,
                x.SectorCode,
                x.DurationMinutes,
                x.Status,
                x.ThumbnailUrl,
                x.VideoStorageKey,
                x.CreatedBy,
                x.CreatedByName,
                x.CreatedAt,
                x.UpdatedAt,
                x.Version,
                x.ViewCount,
                x.CompletionCount,
                x.Instructors.Count,
                x.QuizQuestions.Count,
                x.Attachments.Count,
                x.DbLinks.Count,
                null,
                x.ClusterCode,
                x.ClusterName,
                x.StepNumber,
                x.MicroVideos.Count,
                x.InVideoQuizzes.Count,
                x.PracticeRubrics.Count,
                x.Faqs.Count,
                x.LearningRoadmapJson,
                x.Instructors.OrderBy(i => i.DisplayOrder).Select(i => i.FullName).FirstOrDefault()))
            .ToListAsync(ct);

        return new LmsCatalogResponse(new PagedResult<LmsMaterialListItemDto>(items, total, page, pageSize), kpis);
    }

    public async Task<LearningMaterialDetailDto> GetCatalogDetailAsync(
        Guid id,
        Guid? currentUserId,
        bool isStaffOrAuthor = false,
        CancellationToken ct = default)
    {
        var material = await db.Set<LearningMaterial>()
            .AsSplitQuery()
            .Include(x => x.Instructors.OrderBy(i => i.DisplayOrder))
            .Include(x => x.QuizQuestions.OrderBy(q => q.DisplayOrder))
            .Include(x => x.Attachments.OrderBy(a => a.DisplayOrder))
            .Include(x => x.DbLinks.OrderBy(l => l.DisplayOrder))
            .Include(x => x.MicroVideos.OrderBy(v => v.VideoOrder))
            .Include(x => x.InVideoQuizzes.OrderBy(q => q.DisplayOrder))
            .Include(x => x.PracticeRubrics.OrderBy(r => r.CriterionNumber))
            .Include(x => x.Faqs.OrderBy(f => f.QuestionNumber))
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted && x.Status == LmsStatuses.Published, ct);

        if (material is null)
            throw new NotFoundException($"Không tìm thấy học liệu số với ID: {id}");

        // Tăng lượt xem (ViewCount)
        material.IncrementViewCount();
        await db.SaveChangesAsync(ct);

        // Với người học thông thường, ẩn đáp án đúng và lời giải thích của câu hỏi trắc nghiệm
        var questions = material.QuizQuestions.Select(q =>
        {
            var correct = isStaffOrAuthor ? q.CorrectOption : ' ';
            var explanation = isStaffOrAuthor ? q.Explanation : string.Empty;
            return new QuizQuestionDto(
                q.Id,
                q.DisplayOrder,
                q.QuestionText,
                q.OptionA,
                q.OptionB,
                q.OptionC,
                q.OptionD,
                correct,
                explanation,
                isStaffOrAuthor && q.HasLengthWarning);
        }).ToList();

        var microVideos = material.MicroVideos.Select(v => new MicroVideoDto(
            v.Id,
            v.VideoOrder,
            v.VideoCode,
            v.Title,
            v.DurationSeconds,
            v.VideoStorageKey,
            v.VideoFileName,
            v.ThumbnailUrl,
            v.CallSheetJson,
            !string.IsNullOrWhiteSpace(v.VideoStorageKey)
                ? (storage != null ? storage.PublicUrl(v.VideoStorageKey) : $"/files/{v.VideoStorageKey}")
                : null)).ToList();

        // BR-EL-07: In-video quiz là câu hỏi tương tác tự học (formative checkpoint), trả về đáp án & giải thích để UI kiểm tra tức thì
        var inVideoQuizzes = material.InVideoQuizzes.Select(q => new InVideoQuizDto(
            q.Id,
            q.MicroVideoId,
            q.QuizCode,
            q.TriggerSeconds,
            q.AfterScene,
            q.QuestionText,
            q.OptionA,
            q.OptionB,
            q.OptionC,
            q.OptionD,
            q.CorrectOption,
            q.Explanation,
            q.DisplayOrder)).ToList();

        var practiceRubrics = material.PracticeRubrics.Select(r => new PracticeRubricDto(
            r.Id,
            r.CriterionNumber,
            r.CriterionName,
            r.DescriptionScore0,
            r.DescriptionScore1,
            r.DescriptionScore2,
            r.WeightMultiplier)).ToList();

        var faqs = material.Faqs.Select(f => new FaqDto(
            f.Id,
            f.QuestionNumber,
            f.QuestionText,
            f.AnswerText,
            f.DisplayOrder)).ToList();

        var videoDownloadUrl = !string.IsNullOrWhiteSpace(material.VideoStorageKey)
            ? (storage != null ? storage.PublicUrl(material.VideoStorageKey) : $"/files/{material.VideoStorageKey}")
            : null;

        return new LearningMaterialDetailDto(
            material.Id,
            material.MaterialCode,
            material.Title,
            material.LessonType,
            material.SectorCode,
            material.DurationMinutes,
            material.DescriptionHtml,
            material.VideoStorageKey,
            material.VideoFileName,
            material.VideoFileSize,
            material.VideoSha256,
            material.ThumbnailUrl,
            material.Status,
            null,
            null,
            null,
            null,
            material.PublishedAt,
            material.PublishedBy,
            material.CreatedBy,
            material.CreatedByName,
            material.CreatedAt,
            material.UpdatedAt,
            material.Version,
            material.IsDeleted,
            material.RagIndexedAt,
            material.RagChunkCount,
            material.ViewCount,
            material.CompletionCount,
            material.RatingAverage,
            material.RatingCount,
            material.Slug,
            material.Instructors.Select(i => new InstructorDto(
                i.Id, i.ExpertProfileId, i.FullName, i.TitleDegree, i.OrgName, i.AvatarUrl, i.DisplayOrder, i.IsLead, i.RoleDescription)).ToList(),
            questions,
            material.Attachments.Select(a => new AttachmentDto(
                a.Id, a.Category, a.FileName, a.StorageKey, a.ContentType, a.FileSizeBytes, a.Sha256Hash, a.DisplayOrder,
                !string.IsNullOrWhiteSpace(a.StorageKey) ? (storage != null ? storage.PublicUrl(a.StorageKey) : $"/files/{a.StorageKey}") : null)).ToList(),
            material.DbLinks.Select(l => new DbLinkDto(
                l.Id, l.TargetUrl, l.DisplayLabel, l.Description, l.TargetEntityType, l.TargetId, l.TargetCode, l.DisplayOrder)).ToList(),
            [],
            videoDownloadUrl,
            material.ClusterCode,
            material.ClusterName,
            material.StepNumber,
            material.TargetAudience,
            material.PreparationNotes,
            material.ExpectedOutcome,
            material.PassScorePercent,
            material.LearningObjectivesJson,
            material.LearningRoadmapJson,
            material.KnowledgeSummaryJson,
            material.PracticeWorkbookJson,
            microVideos,
            inVideoQuizzes,
            practiceRubrics,
            faqs);
    }

    public async Task<LearnerProgress?> GetLearnerProgressAsync(
        Guid materialId,
        Guid personId,
        CancellationToken ct = default)
    {
        return await db.Set<LearnerProgress>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.MaterialId == materialId && x.PersonId == personId, ct);
    }

    public async Task RecordProgressAsync(
        Guid materialId,
        Guid personId,
        int watchedSeconds,
        CancellationToken ct = default)
    {
        var material = await db.Set<LearningMaterial>().FirstOrDefaultAsync(x => x.Id == materialId && !x.IsDeleted, ct);
        if (material is null) throw new NotFoundException("Học liệu không tồn tại");

        var progress = await db.Set<LearnerProgress>()
            .FirstOrDefaultAsync(x => x.MaterialId == materialId && x.PersonId == personId, ct);

        var totalSeconds = material.DurationMinutes * 60;

        if (progress is null)
        {
            progress = new LearnerProgress(materialId, personId);
            progress.UpdateProgress(watchedSeconds, totalSeconds);
            db.Set<LearnerProgress>().Add(progress);
        }
        else
        {
            var wasCompleted = progress.IsCompleted;
            progress.UpdateProgress(watchedSeconds, totalSeconds);
            if (!wasCompleted && progress.IsCompleted)
            {
                material.IncrementCompletionCount();
            }
        }

        await db.SaveChangesAsync(ct);
    }

    public async Task<QuizAttemptResultDto> SubmitQuizAttemptAsync(
        Guid materialId,
        Guid personId,
        SubmitQuizAttemptRequest request,
        CancellationToken ct = default)
    {
        var material = await db.Set<LearningMaterial>()
            .Include(x => x.QuizQuestions)
            .FirstOrDefaultAsync(x => x.Id == materialId && !x.IsDeleted && x.Status == LmsStatuses.Published, ct);

        if (material is null) throw new NotFoundException("Học liệu không tồn tại hoặc chưa công khai");

        var questions = material.QuizQuestions.OrderBy(q => q.DisplayOrder).ToList();
        if (questions.Count == 0)
            throw new ValidationException("Học liệu này không có câu hỏi trắc nghiệm");

        var totalQuestions = questions.Count;
        var correctAnswers = 0;
        var resultList = new List<QuizQuestionResultDto>();

        foreach (var q in questions)
        {
            request.Answers.TryGetValue(q.Id, out var selectedOpt);
            var isCorrect = char.ToUpperInvariant(selectedOpt) == char.ToUpperInvariant(q.CorrectOption);
            if (isCorrect) correctAnswers++;

            resultList.Add(new QuizQuestionResultDto(
                q.Id,
                q.DisplayOrder,
                q.QuestionText,
                q.CorrectOption,
                selectedOpt,
                isCorrect,
                q.Explanation));
        }

        var scorePercent = (int)Math.Round((double)correctAnswers / totalQuestions * 100);
        var passThreshold = material.PassScorePercent > 0 ? material.PassScorePercent : 80;
        var passed = scorePercent >= passThreshold; // BR-EL-09: Tỷ lệ >= 80% đạt chuẩn hoàn thành

        // Lưu bản ghi Attempt
        var attemptCount = await db.Set<LearnerQuizAttempt>()
            .CountAsync(x => x.MaterialId == materialId && x.PersonId == personId, ct) + 1;

        var answersJson = JsonSerializer.Serialize(request.Answers);
        var attempt = new LearnerQuizAttempt(
            materialId,
            personId,
            attemptCount,
            totalQuestions,
            correctAnswers,
            scorePercent,
            answersJson,
            passed);

        db.Set<LearnerQuizAttempt>().Add(attempt);

        // Cập nhật tiến độ người học
        var progress = await db.Set<LearnerProgress>()
            .FirstOrDefaultAsync(x => x.MaterialId == materialId && x.PersonId == personId, ct);

        if (progress is null)
        {
            progress = new LearnerProgress(materialId, personId);
            progress.RecordQuizAttempt(scorePercent, passThreshold);
            db.Set<LearnerProgress>().Add(progress);
            if (progress.IsCompleted)
            {
                material.IncrementCompletionCount();
            }
        }
        else
        {
            var wasCompleted = progress.IsCompleted;
            progress.RecordQuizAttempt(scorePercent, passThreshold);
            if (!wasCompleted && progress.IsCompleted)
            {
                material.IncrementCompletionCount();
            }
        }

        await db.SaveChangesAsync(ct);

        return new QuizAttemptResultDto(
            scorePercent,
            correctAnswers,
            totalQuestions,
            passed,
            resultList);
    }

    public async Task<PracticeEvaluationResultDto> SubmitPracticeEvaluationAsync(
        Guid materialId,
        Guid personId,
        SubmitPracticeEvaluationRequest request,
        CancellationToken ct = default)
    {
        var material = await db.Set<LearningMaterial>()
            .Include(x => x.PracticeRubrics)
            .FirstOrDefaultAsync(x => x.Id == materialId && !x.IsDeleted && x.Status == LmsStatuses.Published, ct);

        if (material is null)
            throw new NotFoundException("Học liệu không tồn tại hoặc chưa công khai");

        var rubrics = material.PracticeRubrics.OrderBy(r => r.CriterionNumber).ToList();
        if (rubrics.Count == 0)
            throw new ValidationException("Học liệu này chưa thiết lập bảng rubric tự chấm");

        // Validate RubricScores: kiểm tra mọi điểm gửi lên không được nằm ngoài {0, 1, 2}
        foreach (var kvp in request.RubricScores)
        {
            if (kvp.Key is < 1 or > 7)
                throw new ValidationException($"Mã tiêu chí {kvp.Key} không hợp lệ (chỉ chấp nhận 1..7)");
            if (kvp.Value is < 0 or > 2)
                throw new ValidationException($"Điểm tiêu chí {kvp.Key} phải là 0, 1 hoặc 2");
        }

        var totalScore = 0;
        foreach (var rubric in rubrics)
        {
            if (!request.RubricScores.TryGetValue(rubric.CriterionNumber, out var score))
            {
                score = 0; // Mặc định 0 nếu học viên chưa chấm
            }

            if (score is < 0 or > 2)
                throw new ValidationException($"Điểm tiêu chí {rubric.CriterionNumber} phải là 0, 1 hoặc 2");

            totalScore += score * rubric.WeightMultiplier;
        }

        const int maxScore = 14;
        const int passThreshold = 11;
        var isUnlockedCta = totalScore >= passThreshold;

        var rubricScoresJson = JsonSerializer.Serialize(request.RubricScores);
        var essayAnswersJson = request.EssayAnswers != null && request.EssayAnswers.Count > 0
            ? JsonSerializer.Serialize(request.EssayAnswers)
            : null;

        var evaluation = new LearnerPracticeEvaluation(
            materialId,
            personId,
            rubricScoresJson,
            totalScore,
            essayAnswersJson,
            request.RequestExpertConsultation && isUnlockedCta,
            request.CreateDemandProfile && isUnlockedCta,
            maxScore,
            passThreshold);

        db.Set<LearnerPracticeEvaluation>().Add(evaluation);
        await db.SaveChangesAsync(ct);

        var feedbackMessage = isUnlockedCta
            ? "Chúc mừng bạn đã hoàn thành bài tập thực hành xuất sắc! Hai nút CTA phản biện Chuyên gia và Tạo hồ sơ nhu cầu công nghệ đã được mở khóa."
            : $"Bạn đạt {totalScore}/{maxScore} điểm (chưa đạt ngưỡng {passThreshold}/{maxScore}). Hãy rà soát lại các tiêu chí và hoàn thiện trước khi gửi phản biện.";

        return new PracticeEvaluationResultDto(
            totalScore,
            maxScore,
            passThreshold,
            isUnlockedCta,
            isUnlockedCta,
            isUnlockedCta,
            feedbackMessage,
            evaluation.SubmittedAt);
    }
}
