using System.Text.Json;
using Microsoft.EntityFrameworkCore;
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
}

public sealed class LmsCatalogService(DbContext db) : ILmsCatalogService
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
                null))
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
            .Include(x => x.Instructors.OrderBy(i => i.DisplayOrder))
            .Include(x => x.QuizQuestions.OrderBy(q => q.DisplayOrder))
            .Include(x => x.Attachments.OrderBy(a => a.DisplayOrder))
            .Include(x => x.DbLinks.OrderBy(l => l.DisplayOrder))
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
                a.Id, a.Category, a.FileName, a.StorageKey, a.ContentType, a.FileSizeBytes, a.Sha256Hash, a.DisplayOrder)).ToList(),
            material.DbLinks.Select(l => new DbLinkDto(
                l.Id, l.TargetUrl, l.DisplayLabel, l.Description, l.TargetEntityType, l.TargetId, l.TargetCode, l.DisplayOrder)).ToList(),
            []);
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
        var passed = scorePercent >= 60; // Chuẩn 60% đạt

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
            progress.RecordQuizAttempt(scorePercent);
            db.Set<LearnerProgress>().Add(progress);
        }
        else
        {
            var wasCompleted = progress.IsCompleted;
            progress.RecordQuizAttempt(scorePercent);
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
}
