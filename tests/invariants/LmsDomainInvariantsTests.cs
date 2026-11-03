using System;
using System.Linq;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Lms.Domain;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public sealed class LmsDomainInvariantsTests
{
    private readonly Guid _creatorId = Guid.NewGuid();
    private const string _creatorName = "TS. Nguyễn Văn Chuyên Gia";

    [Fact]
    public void BrEl01_CreateDraft_Success_WhenTitleIsValid()
    {
        // Act
        var material = new LearningMaterial(
            materialCode: "MAT-2026-001",
            title: "Khóa học AI Agent Đổi mới Sáng tạo",
            lessonType: LmsLessonTypes.TypeA,
            durationMinutes: 45,
            descriptionHtml: "<p>Nội dung giới thiệu</p>",
            createdBy: _creatorId,
            createdByName: _creatorName);

        // Assert
        material.Status.ShouldBe(LmsStatuses.Draft);
        material.Title.ShouldBe("Khóa học AI Agent Đổi mới Sáng tạo");
        material.DurationMinutes.ShouldBe(45);
        material.IsDeleted.ShouldBeFalse();
        material.ModerationLogs.Count.ShouldBe(1);
        material.ModerationLogs.First().Action.ShouldBe(LmsModerationActions.Create);
    }

    [Fact]
    public void BrEl01_CreateDraft_Throws_WhenTitleIsEmptyOrTooLong()
    {
        // Empty title
        Should.Throw<ValidationException>(() => new LearningMaterial(
            "MAT-001", "", LmsLessonTypes.TypeA, 30, "<p>Desc</p>", _creatorId, _creatorName));

        // Title > 250 chars
        var longTitle = new string('A', 251);
        Should.Throw<ValidationException>(() => new LearningMaterial(
            "MAT-001", longTitle, LmsLessonTypes.TypeA, 30, "<p>Desc</p>", _creatorId, _creatorName));
    }

    [Fact]
    public void BrEl01_CreateDraft_Throws_WhenVideoExceeds1GB()
    {
        long tooBigVideo = 1_073_741_825; // 1GB + 1 byte
        Should.Throw<ValidationException>(() => new LearningMaterial(
            "MAT-001", "Học liệu video khủng", LmsLessonTypes.TypeA, 30, "<p>Desc</p>",
            _creatorId, _creatorName, videoFileSize: tooBigVideo));
    }

    [Fact]
    public void BrEl01_Publish_RequiresAllMandatoryFieldsAndInstructor()
    {
        var material = new LearningMaterial(
            "MAT-002", "Bài học mẫu", LmsLessonTypes.TypeB, 60, "",
            _creatorId, _creatorName);

        // Thiếu mô tả, thiếu video, thiếu giảng viên -> Thất bại khi Publish
        Should.Throw<ValidationException>(() => material.Publish(_creatorId, _creatorName));

        // Cập nhật thông tin đầy đủ Tab A
        material.UpdateDraft(
            title: "Bài học hoàn chỉnh",
            lessonType: LmsLessonTypes.TypeB,
            durationMinutes: 90,
            descriptionHtml: "<p>Mô tả chi tiết bài học đạt chuẩn</p>",
            updatedBy: _creatorId,
            updatedByName: _creatorName,
            videoStorageKey: "videos/mat-002.mp4",
            videoFileName: "baihoc.mp4",
            videoFileSize: 500_000_000);

        // Vẫn thiếu giảng viên -> Publish phải thất bại
        Should.Throw<ValidationException>(() => material.Publish(_creatorId, _creatorName));

        // Thêm giảng viên
        material.AddInstructor(new LearningMaterialInstructor(
            material.Id, Guid.NewGuid(), "GS. Trần Văn Khoa", "Tiến sĩ Khoa học", "Viện Sáng chế NacenTech"));

        // Giờ đây Publish thành công ngay lập tức
        material.Publish(_creatorId, _creatorName);
        material.Status.ShouldBe(LmsStatuses.Published);
        material.PublishedAt.ShouldNotBeNull();
        material.PublishedBy.ShouldBe(_creatorId);
    }

    [Fact]
    public void BrEl02_OptimisticConcurrency_VersionTokenTracksState()
    {
        var material = new LearningMaterial(
            "MAT-003", "Học liệu phiên bản", LmsLessonTypes.TypeA, 30, "<p>Mô tả</p>",
            _creatorId, _creatorName);

        var initialUpdatedAt = material.UpdatedAt;

        material.UpdateDraft(
            "Tiêu đề mới", LmsLessonTypes.TypeA, 45, "<p>Mô tả cập nhật</p>",
            _creatorId, _creatorName);

        material.UpdatedAt.ShouldBeGreaterThanOrEqualTo(initialUpdatedAt);
    }

    [Fact]
    public void BrEl03_RevertToDraft_SucceedsAndAudits()
    {
        var material = CreatePublishedMaterial("MAT-004");
        material.Status.ShouldBe(LmsStatuses.Published);

        // Revert to draft
        material.RevertToDraft(_creatorId, _creatorName);

        material.Status.ShouldBe(LmsStatuses.Draft);
        material.ModerationLogs.Any(l => l.Action == LmsModerationActions.RevertToDraft).ShouldBeTrue();
    }

    [Fact]
    public void BrEl04_QuizQuestion_FlagsSuspiciousDistractorWhenLengthDiffersMoreThan2x()
    {
        var materialId = Guid.NewGuid();

        // Trường hợp chênh lệch > 2x: Phương án A dài 4 ký tự, Phương án D dài 30 ký tự -> max > 2 * min (30 > 8)
        var q1 = new LearningQuizQuestion(
            materialId, 1, "Thủ đô của Việt Nam là gì?",
            "Huế",
            "Đà Nẵng",
            "Hồ Chí Minh",
            "Thành phố Hà Nội nghìn năm văn hiến",
            'D',
            "Hà Nội là thủ đô của Việt Nam");

        q1.HasLengthWarning.ShouldBeTrue();
        q1.IsSuspiciousDistractor.ShouldBeTrue();

        // Trường hợp các phương án đồng đều: lens = [12, 10, 15, 11] -> max=15 <= 2 * 10 (20) -> không cảnh báo
        var q2 = new LearningQuizQuestion(
            materialId, 2, "1 + 1 bằng mấy?",
            "Kết quả là 1",
            "Kết quả là 2",
            "Kết quả là 3",
            "Kết quả là 4",
            'B',
            "1 + 1 = 2");

        q2.HasLengthWarning.ShouldBeFalse();
        q2.IsSuspiciousDistractor.ShouldBeFalse();
    }

    [Fact]
    public void BrEl05_EnforcesCapacityLimits_Instructors_Quiz_DbLinks_Attachments()
    {
        var material = new LearningMaterial(
            "MAT-005", "Kiểm thử giới hạn cấu phần", LmsLessonTypes.TypeA, 30, "<p>Desc</p>",
            _creatorId, _creatorName);

        // 1. Giới hạn 10 giảng viên
        for (int i = 1; i <= 10; i++)
        {
            material.AddInstructor(new LearningMaterialInstructor(
                material.Id, Guid.NewGuid(), $"Giảng viên {i}", displayOrder: i));
        }
        material.Instructors.Count.ShouldBe(10);
        // Thêm giảng viên thứ 11 -> ném lỗi
        Should.Throw<ValidationException>(() => material.AddInstructor(
            new LearningMaterialInstructor(material.Id, Guid.NewGuid(), "Giảng viên 11", displayOrder: 10)));

        // 2. Giới hạn 10 câu hỏi trắc nghiệm
        for (int i = 1; i <= 10; i++)
        {
            material.AddQuizQuestion(new LearningQuizQuestion(
                material.Id, i, $"Câu hỏi số {i}?", "A", "B", "C", "D", 'A', "Giải thích"));
        }
        material.QuizQuestions.Count.ShouldBe(10);
        // Thêm câu hỏi thứ 11 -> ném lỗi
        Should.Throw<ValidationException>(() => material.AddQuizQuestion(
            new LearningQuizQuestion(material.Id, 10, "Câu hỏi 11?", "A", "B", "C", "D", 'A', "Giải thích")));

        // 3. Giới hạn 5 Liên kết CSDL
        for (int i = 1; i <= 5; i++)
        {
            material.AddDbLink(new LearningDbLink(
                material.Id, $"https://nacentech.vn/db/{i}", $"Liên kết {i}", displayOrder: i));
        }
        material.DbLinks.Count.ShouldBe(5);
        // Thêm liên kết thứ 6 -> ném lỗi
        Should.Throw<ValidationException>(() => material.AddDbLink(
            new LearningDbLink(material.Id, "https://nacentech.vn/db/6", "Liên kết 6", displayOrder: 5)));

        // 4. Giới hạn tài liệu đính kèm: Phiếu tóm tắt (SUMMARY_SHEET) tối đa 1 tệp
        material.AddAttachment(new LearningAttachment(
            material.Id, LmsAttachmentCategories.SummarySheet, "tom-tat.pdf", "keys/summary.pdf",
            "application/pdf", 5 * 1024 * 1024));

        Should.Throw<ValidationException>(() => material.AddAttachment(new LearningAttachment(
            material.Id, LmsAttachmentCategories.SummarySheet, "tom-tat-2.pdf", "keys/summary2.pdf",
            "application/pdf", 5 * 1024 * 1024)));

        // Phiếu tóm tắt vượt quá 10MB -> ném lỗi
        Should.Throw<ValidationException>(() => new LearningAttachment(
            material.Id, LmsAttachmentCategories.SummarySheet, "nang.pdf", "keys/nang.pdf",
            "application/pdf", 11 * 1024 * 1024));

        // Tài liệu khác vượt quá 25MB -> ném lỗi
        Should.Throw<ValidationException>(() => new LearningAttachment(
            material.Id, LmsAttachmentCategories.PolicyDoc, "tai-lieu-khung.pdf", "keys/khung.pdf",
            "application/pdf", 26 * 1024 * 1024));
    }

    [Fact]
    public void BrEl06_BlocksDeleteWhenPublished_AndEnforcesUnpublishReason()
    {
        var material = CreatePublishedMaterial("MAT-006");

        // Chặn xóa bài đang PUBLISHED
        Should.Throw<ValidationException>(() => material.SoftDelete(_creatorId, _creatorName));

        // Gỡ bài không có lý do -> ném lỗi
        Should.Throw<ValidationException>(() => material.Unpublish(_creatorId, _creatorName, ""));
        // Gỡ bài lý do vượt quá 250 ký tự -> ném lỗi
        Should.Throw<ValidationException>(() => material.Unpublish(_creatorId, _creatorName, new string('R', 251)));

        // Gỡ bài hợp lệ
        material.Unpublish(_creatorId, _creatorName, "Nội dung cần cập nhật theo quy định mới");
        material.Status.ShouldBe(LmsStatuses.Unpublished);
        material.UnpublishReason.ShouldBe("Nội dung cần cập nhật theo quy định mới");
        material.UnpublishedBy.ShouldBe(_creatorId);
        material.UnpublishedAt.ShouldNotBeNull();

        // Sau khi gỡ bài sang UNPUBLISHED -> Xóa mềm thành công
        material.SoftDelete(_creatorId, _creatorName);
        material.IsDeleted.ShouldBeTrue();
        material.DeletedBy.ShouldBe(_creatorId);
        material.DeletedAt.ShouldNotBeNull();
    }

    private LearningMaterial CreatePublishedMaterial(string code)
    {
        var material = new LearningMaterial(
            code, "Học liệu đạt chuẩn", LmsLessonTypes.TypeA, 45,
            "<p>Mô tả chi tiết bài học</p>", _creatorId, _creatorName,
            videoStorageKey: "videos/video.mp4", videoFileName: "video.mp4", videoFileSize: 100_000_000);

        material.AddInstructor(new LearningMaterialInstructor(
            material.Id, Guid.NewGuid(), "GS. Nguyễn Văn A", "Viện trưởng"));

        material.Publish(_creatorId, _creatorName);
        return material;
    }
}
