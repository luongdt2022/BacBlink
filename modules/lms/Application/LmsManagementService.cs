using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Lms.Domain;

namespace NacenTech.Modules.Lms.Application;

public interface ILmsManagementService
{
    Task<PagedResult<LmsMaterialListItemDto>> GetManagementListAsync(
        LmsMaterialFilterRequest filter,
        Guid actorId,
        bool isAdmin,
        CancellationToken ct = default);

    Task<LearningMaterialDetailDto> GetManagementDetailAsync(
        Guid id,
        Guid actorId,
        bool isAdmin,
        CancellationToken ct = default);

    Task<LearningMaterialDetailDto> CreateMaterialAsync(
        CreateLearningMaterialRequest request,
        Guid actorId,
        string actorName,
        CancellationToken ct = default);

    Task<LearningMaterialDetailDto> UpdateMaterialAsync(
        Guid id,
        UpdateLearningMaterialRequest request,
        Guid actorId,
        string actorName,
        bool isAdmin,
        CancellationToken ct = default);

    Task UnpublishMaterialAsync(
        Guid id,
        UnpublishMaterialRequest request,
        Guid actorId,
        string actorName,
        bool isAdmin,
        CancellationToken ct = default);

    Task DeleteMaterialAsync(
        Guid id,
        Guid actorId,
        string actorName,
        bool isAdmin,
        CancellationToken ct = default);
}

public sealed class LmsManagementService(
    DbContext db,
    ILmsRagIndexer ragIndexer) : ILmsManagementService
{
    public async Task<PagedResult<LmsMaterialListItemDto>> GetManagementListAsync(
        LmsMaterialFilterRequest filter,
        Guid actorId,
        bool isAdmin,
        CancellationToken ct = default)
    {
        var page = filter.Page <= 0 ? 1 : filter.Page;
        var pageSize = filter.PageSize is <= 0 or > 100 ? 10 : filter.PageSize;

        var query = db.Set<LearningMaterial>()
            .Include(x => x.Instructors)
            .Include(x => x.QuizQuestions)
            .Include(x => x.Attachments)
            .Include(x => x.DbLinks)
            .Where(x => !x.IsDeleted)
            .AsNoTracking();

        // Phạm vi dữ liệu Scoping (BR-EL-06): Admin thấy tất cả, Expert chỉ thấy bài của mình
        if (!isAdmin)
        {
            query = query.Where(x => x.CreatedBy == actorId);
        }

        // Lọc kết hợp AND (REQ-EL-001)
        if (!string.IsNullOrWhiteSpace(filter.Keyword))
        {
            var kw = filter.Keyword.Trim().ToLower();
            query = query.Where(x =>
                x.Title.ToLower().Contains(kw) ||
                x.MaterialCode.ToLower().Contains(kw) ||
                x.CreatedByName.ToLower().Contains(kw) ||
                x.Instructors.Any(i => i.FullName.ToLower().Contains(kw)));
        }

        if (!string.IsNullOrWhiteSpace(filter.LessonType))
        {
            query = query.Where(x => x.LessonType == filter.LessonType);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            query = query.Where(x => x.Status == filter.Status);
        }

        var total = await query.CountAsync(ct);

        // Sắp xếp ngày cập nhật giảm dần (updated_at DESC)
        var items = await query
            .OrderByDescending(x => x.UpdatedAt)
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
                x.UnpublishReason))
            .ToListAsync(ct);

        return new PagedResult<LmsMaterialListItemDto>(items, total, page, pageSize);
    }

    public async Task<LearningMaterialDetailDto> GetManagementDetailAsync(
        Guid id,
        Guid actorId,
        bool isAdmin,
        CancellationToken ct = default)
    {
        var material = await LoadMaterialWithAllRelationsAsync(id, ct);
        if (material is null || material.IsDeleted)
            throw new NotFoundException($"Không tìm thấy học liệu với ID: {id}");

        // Kiểm tra quyền sở hữu BR-EL-06
        if (!isAdmin && material.CreatedBy != actorId)
            throw new ForbiddenException("Bạn không có quyền truy cập học liệu này.");

        return MapToDetailDto(material);
    }

    public async Task<LearningMaterialDetailDto> CreateMaterialAsync(
        CreateLearningMaterialRequest request,
        Guid actorId,
        string actorName,
        CancellationToken ct = default)
    {
        var materialCode = GenerateMaterialCode();

        var material = new LearningMaterial(
            materialCode: materialCode,
            title: request.Title,
            lessonType: request.LessonType,
            durationMinutes: request.DurationMinutes,
            descriptionHtml: request.DescriptionHtml,
            createdBy: actorId,
            createdByName: actorName,
            sectorCode: request.SectorCode,
            videoStorageKey: request.VideoStorageKey,
            videoFileName: request.VideoFileName,
            videoFileSize: request.VideoFileSize,
            videoSha256: request.VideoSha256,
            thumbnailUrl: request.ThumbnailUrl,
            status: LmsStatuses.Draft);

        // Thêm giảng viên
        if (request.Instructors.Count > 0)
        {
            var instructors = request.Instructors.Select(i => new LearningMaterialInstructor(
                material.Id,
                i.ExpertProfileId,
                i.FullName,
                i.TitleDegree,
                i.OrgName,
                i.AvatarUrl,
                i.DisplayOrder,
                i.IsLead,
                i.RoleDescription));
            material.SetInstructors(instructors);
        }

        // Thêm câu hỏi trắc nghiệm
        if (request.QuizQuestions.Count > 0)
        {
            var questions = request.QuizQuestions.Select(q => new LearningQuizQuestion(
                material.Id,
                q.DisplayOrder,
                q.QuestionText,
                q.OptionA,
                q.OptionB,
                q.OptionC,
                q.OptionD,
                q.CorrectOption,
                q.Explanation));
            material.SetQuizQuestions(questions);
        }

        // Thêm tài liệu đính kèm
        if (request.Attachments.Count > 0)
        {
            var attachments = request.Attachments.Select(a => new LearningAttachment(
                material.Id,
                a.Category,
                a.FileName,
                a.StorageKey,
                a.ContentType,
                a.FileSizeBytes,
                a.Sha256Hash,
                a.DisplayOrder));
            material.SetAttachments(attachments);
        }

        // Thêm liên kết CSDL
        if (request.DbLinks.Count > 0)
        {
            var links = request.DbLinks.Select(l => new LearningDbLink(
                material.Id,
                l.TargetUrl,
                l.DisplayLabel,
                l.Description,
                l.TargetEntityType,
                l.TargetId,
                l.TargetCode,
                l.DisplayOrder));
            material.SetDbLinks(links);
        }

        // Nếu người dùng chọn xuất bản ngay lập tức
        if (request.Status == LmsStatuses.Published)
        {
            material.Publish(actorId, actorName);
        }

        db.Set<LearningMaterial>().Add(material);
        await db.SaveChangesAsync(ct);

        // Kích hoạt AI RAG indexing nếu công khai
        if (material.Status == LmsStatuses.Published)
        {
            await ragIndexer.IndexMaterialAsync(material.Id, ct);
        }

        return MapToDetailDto(material);
    }

    public async Task<LearningMaterialDetailDto> UpdateMaterialAsync(
        Guid id,
        UpdateLearningMaterialRequest request,
        Guid actorId,
        string actorName,
        bool isAdmin,
        CancellationToken ct = default)
    {
        var material = await LoadMaterialWithAllRelationsAsync(id, ct);
        if (material is null || material.IsDeleted)
            throw new NotFoundException($"Không tìm thấy học liệu với ID: {id}");

        // BR-EL-06: Bảo vệ quyền sở hữu
        if (!isAdmin && material.CreatedBy != actorId)
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa học liệu này.");

        // BR-EL-02: Bắt xung đột Optimistic Concurrency
        if (material.Version != request.Version)
            throw new RecordAlreadyModifiedException("Học liệu đã được người khác cập nhật trước đó. Vui lòng tải lại trang.");

        // Cập nhật thông tin chính Tab A
        material.UpdateDraft(
            title: request.Title,
            lessonType: request.LessonType,
            durationMinutes: request.DurationMinutes,
            descriptionHtml: request.DescriptionHtml,
            updatedBy: actorId,
            updatedByName: actorName,
            sectorCode: request.SectorCode,
            videoStorageKey: request.VideoStorageKey,
            videoFileName: request.VideoFileName,
            videoFileSize: request.VideoFileSize,
            videoSha256: request.VideoSha256,
            thumbnailUrl: request.ThumbnailUrl);

        // Cập nhật giảng viên
        var instructors = request.Instructors.Select(i => new LearningMaterialInstructor(
            material.Id,
            i.ExpertProfileId,
            i.FullName,
            i.TitleDegree,
            i.OrgName,
            i.AvatarUrl,
            i.DisplayOrder,
            i.IsLead,
            i.RoleDescription));
        material.SetInstructors(instructors);

        // Cập nhật câu hỏi Quiz
        var questions = request.QuizQuestions.Select(q => new LearningQuizQuestion(
            material.Id,
            q.DisplayOrder,
            q.QuestionText,
            q.OptionA,
            q.OptionB,
            q.OptionC,
            q.OptionD,
            q.CorrectOption,
            q.Explanation));
        material.SetQuizQuestions(questions);

        // Cập nhật tài liệu
        var attachments = request.Attachments.Select(a => new LearningAttachment(
            material.Id,
            a.Category,
            a.FileName,
            a.StorageKey,
            a.ContentType,
            a.FileSizeBytes,
            a.Sha256Hash,
            a.DisplayOrder));
        material.SetAttachments(attachments);

        // Cập nhật DB links
        var links = request.DbLinks.Select(l => new LearningDbLink(
            material.Id,
            l.TargetUrl,
            l.DisplayLabel,
            l.Description,
            l.TargetEntityType,
            l.TargetId,
            l.TargetCode,
            l.DisplayOrder));
        material.SetDbLinks(links);

        var prevStatus = material.Status;

        // Xử lý chuyển đổi trạng thái
        if (request.Status == LmsStatuses.Published && prevStatus != LmsStatuses.Published)
        {
            material.Publish(actorId, actorName);
        }
        else if (request.Status == LmsStatuses.Draft && prevStatus == LmsStatuses.Published)
        {
            // BR-EL-03: Cảnh báo chuyển về nháp
            material.RevertToDraft(actorId, actorName);
        }

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new RecordAlreadyModifiedException("Học liệu đã được người khác cập nhật trước đó. Vui lòng tải lại trang.");
        }

        // Cập nhật AI RAG
        if (material.Status == LmsStatuses.Published)
        {
            await ragIndexer.IndexMaterialAsync(material.Id, ct);
        }
        else if (prevStatus == LmsStatuses.Published && material.Status != LmsStatuses.Published)
        {
            await ragIndexer.RemoveMaterialIndexAsync(material.Id, ct);
        }

        return MapToDetailDto(material);
    }

    public async Task UnpublishMaterialAsync(
        Guid id,
        UnpublishMaterialRequest request,
        Guid actorId,
        string actorName,
        bool isAdmin,
        CancellationToken ct = default)
    {
        var material = await db.Set<LearningMaterial>().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (material is null || material.IsDeleted)
            throw new NotFoundException($"Không tìm thấy học liệu với ID: {id}");

        // BR-EL-06: Bảo vệ quyền sở hữu
        if (!isAdmin && material.CreatedBy != actorId)
            throw new ForbiddenException("Bạn không có quyền gỡ học liệu này.");

        // BR-EL-05 & 06: Gỡ bài kèm lý do
        material.Unpublish(actorId, actorName, request.Reason);

        await db.SaveChangesAsync(ct);

        // Tự động xóa vector chunks AI RAG
        await ragIndexer.RemoveMaterialIndexAsync(material.Id, ct);
    }

    public async Task DeleteMaterialAsync(
        Guid id,
        Guid actorId,
        string actorName,
        bool isAdmin,
        CancellationToken ct = default)
    {
        var material = await db.Set<LearningMaterial>().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (material is null || material.IsDeleted)
            throw new NotFoundException($"Không tìm thấy học liệu với ID: {id}");

        // BR-EL-06: Bảo vệ quyền sở hữu
        if (!isAdmin && material.CreatedBy != actorId)
            throw new ForbiddenException("Bạn không có quyền xóa học liệu này.");

        // BR-EL-06: Chặn xóa bài đang PUBLISHED, đánh dấu xóa mềm
        material.SoftDelete(actorId, actorName);

        await db.SaveChangesAsync(ct);

        // Xóa vector chunks AI RAG
        await ragIndexer.RemoveMaterialIndexAsync(material.Id, ct);
    }

    private async Task<LearningMaterial?> LoadMaterialWithAllRelationsAsync(Guid id, CancellationToken ct)
    {
        return await db.Set<LearningMaterial>()
            .Include(x => x.Instructors.OrderBy(i => i.DisplayOrder))
            .Include(x => x.QuizQuestions.OrderBy(q => q.DisplayOrder))
            .Include(x => x.Attachments.OrderBy(a => a.DisplayOrder))
            .Include(x => x.DbLinks.OrderBy(l => l.DisplayOrder))
            .Include(x => x.ModerationLogs.OrderByDescending(m => m.OccurredAt))
            .FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    private static string GenerateMaterialCode()
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var randPart = Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
        return $"MAT-{datePart}-{randPart}";
    }

    private static LearningMaterialDetailDto MapToDetailDto(LearningMaterial m)
    {
        return new LearningMaterialDetailDto(
            m.Id,
            m.MaterialCode,
            m.Title,
            m.LessonType,
            m.SectorCode,
            m.DurationMinutes,
            m.DescriptionHtml,
            m.VideoStorageKey,
            m.VideoFileName,
            m.VideoFileSize,
            m.VideoSha256,
            m.ThumbnailUrl,
            m.Status,
            m.UnpublishReason,
            m.UnpublishedBy,
            m.UnpublishedByName,
            m.UnpublishedAt,
            m.PublishedAt,
            m.PublishedBy,
            m.CreatedBy,
            m.CreatedByName,
            m.CreatedAt,
            m.UpdatedAt,
            m.Version,
            m.IsDeleted,
            m.RagIndexedAt,
            m.RagChunkCount,
            m.ViewCount,
            m.CompletionCount,
            m.RatingAverage,
            m.RatingCount,
            m.Slug,
            m.Instructors.Select(i => new InstructorDto(
                i.Id, i.ExpertProfileId, i.FullName, i.TitleDegree, i.OrgName, i.AvatarUrl, i.DisplayOrder, i.IsLead, i.RoleDescription)).ToList(),
            m.QuizQuestions.Select(q => new QuizQuestionDto(
                q.Id, q.DisplayOrder, q.QuestionText, q.OptionA, q.OptionB, q.OptionC, q.OptionD, q.CorrectOption, q.Explanation, q.HasLengthWarning)).ToList(),
            m.Attachments.Select(a => new AttachmentDto(
                a.Id, a.Category, a.FileName, a.StorageKey, a.ContentType, a.FileSizeBytes, a.Sha256Hash, a.DisplayOrder)).ToList(),
            m.DbLinks.Select(l => new DbLinkDto(
                l.Id, l.TargetUrl, l.DisplayLabel, l.Description, l.TargetEntityType, l.TargetId, l.TargetCode, l.DisplayOrder)).ToList(),
            m.ModerationLogs.Select(log => new ModerationLogDto(
                log.Id, log.Action, log.Reason, log.ActorId, log.ActorName, log.OldStatus, log.NewStatus, log.OccurredAt)).ToList());
    }
}
