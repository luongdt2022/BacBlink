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

    [Fact]
    public void BrEl07_MicroVideosAndInVideoQuizzes_EnforceLimitsAndValidation()
    {
        var material = new LearningMaterial(
            "MAT-DELTA-01", "Kiểm thử MicroVideos & InVideoQuizzes", LmsLessonTypes.TypeA, 45,
            "<p>Mô tả chi tiết</p>", _creatorId, _creatorName);

        // 1. Thêm 3 micro-videos hợp lệ
        for (int i = 1; i <= 3; i++)
        {
            material.AddMicroVideo(new LearningMicroVideo(
                material.Id, i, $"02.{i}", $"Phần {i}: Giới thiệu chuyên sâu", 300));
        }
        material.MicroVideos.Count.ShouldBe(3);

        // Thêm micro-video thứ 4 -> ném lỗi
        Should.Throw<ValidationException>(() => material.AddMicroVideo(
            new LearningMicroVideo(material.Id, 1, "02.4", "Phần 4 dư thừa")));

        // Micro-video order không hợp lệ (0 hoặc 4) -> ném lỗi
        Should.Throw<ValidationException>(() => new LearningMicroVideo(
            material.Id, 4, "02.4", "Thứ tự không hợp lệ"));

        // 2. Thêm 6 in-video quizzes hợp lệ
        for (int i = 1; i <= 6; i++)
        {
            material.AddInVideoQuiz(new LearningInVideoQuiz(
                material.Id, $"Q{i}", i * 60, $"Câu hỏi tương tác số {i}?",
                "Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D", 'A', "Giải thích"));
        }
        material.InVideoQuizzes.Count.ShouldBe(6);

        // Thêm câu hỏi thứ 7 -> ném lỗi
        Should.Throw<ValidationException>(() => material.AddInVideoQuiz(
            new LearningInVideoQuiz(material.Id, "Q7", 500, "Câu hỏi 7", "A", "B", "C", "D", 'A', "Giải thích")));

        // Quiz với đáp án không hợp lệ ('E') -> ném lỗi
        Should.Throw<ValidationException>(() => new LearningInVideoQuiz(
            material.Id, "Q8", 100, "Câu hỏi sai đáp án", "A", "B", "C", "D", 'E', "Giải thích"));

        // Quiz với triggerSeconds âm -> ném lỗi
        Should.Throw<ValidationException>(() => new LearningInVideoQuiz(
            material.Id, "Q9", -10, "Trigger âm", "A", "B", "C", "D", 'A', "Giải thích"));
    }

    [Fact]
    public void BrEl08_PracticeRubricsAndEvaluation_Threshold11Of14UnlocksCta()
    {
        var material = new LearningMaterial(
            "MAT-DELTA-02", "Kiểm thử Rubric & Tự chấm", LmsLessonTypes.TypeA, 45,
            "<p>Mô tả chi tiết</p>", _creatorId, _creatorName);

        // 1. Thêm 7 tiêu chí rubric
        for (int i = 1; i <= 7; i++)
        {
            material.AddPracticeRubric(new LearningPracticeRubric(
                material.Id, i, $"Tiêu chí {i}", "0: Chưa đạt", "1: Đạt một phần", "2: Đạt hoàn toàn"));
        }
        material.PracticeRubrics.Count.ShouldBe(7);

        // Thêm tiêu chí thứ 8 -> ném lỗi
        Should.Throw<ValidationException>(() => material.AddPracticeRubric(
            new LearningPracticeRubric(material.Id, 1, "Tiêu chí 8", "0", "1", "2")));

        // CriterionNumber ngoài khoảng 1..7 -> ném lỗi
        Should.Throw<ValidationException>(() => new LearningPracticeRubric(
            material.Id, 8, "Tiêu chí 8", "0", "1", "2"));

        // 2. Tự chấm điểm với tổng điểm 10/14 (< 11) -> IsUnlockedCta = false
        var personId = Guid.NewGuid();
        var evalFail = new LearnerPracticeEvaluation(
            material.Id, personId, "{\"1\":2,\"2\":2,\"3\":2,\"4\":2,\"5\":1,\"6\":1,\"7\":0}", 10);

        evalFail.IsUnlockedCta.ShouldBeFalse();
        evalFail.TotalScore.ShouldBe(10);
        evalFail.PassThreshold.ShouldBe(11);

        // Khi chưa đạt ngưỡng, gọi hành động mở khóa CTA -> ném lỗi
        Should.Throw<ValidationException>(() => evalFail.MarkExpertConsultationRequested());
        Should.Throw<ValidationException>(() => evalFail.MarkDemandProfileCreated());

        // 3. Tự chấm điểm với tổng điểm 11/14 (>= 11) -> IsUnlockedCta = true
        var evalPass = new LearnerPracticeEvaluation(
            material.Id, personId, "{\"1\":2,\"2\":2,\"3\":2,\"4\":2,\"5\":2,\"6\":1,\"7\":0}", 11);

        evalPass.IsUnlockedCta.ShouldBeTrue();
        evalPass.TotalScore.ShouldBe(11);

        // Khi đạt ngưỡng -> Mở khóa và đánh dấu thành công
        evalPass.MarkExpertConsultationRequested();
        evalPass.ExpertConsultationRequested.ShouldBeTrue();

        evalPass.MarkDemandProfileCreated();
        evalPass.DemandProfileCreated.ShouldBeTrue();

        // Điểm vượt quá 14 -> ném lỗi
        Should.Throw<ValidationException>(() => new LearnerPracticeEvaluation(
            material.Id, personId, "{}", 15));
    }

    [Fact]
    public void BrEl09_ClusterStepAndPassScorePercent_Invariants()
    {
        var material = new LearningMaterial(
            "MAT-DELTA-03", "Kiểm thử Cụm, Bước và Điểm đạt", LmsLessonTypes.TypeA, 45,
            "<p>Mô tả chi tiết</p>", _creatorId, _creatorName);

        // Mặc định PassScorePercent = 80
        material.PassScorePercent.ShouldBe(80);

        // Cập nhật Cụm và Bước hợp lệ
        material.SetClusterAndStep(LmsClusters.ClusterA, "Cụm Năng lượng Xanh", 2);
        material.ClusterCode.ShouldBe(LmsClusters.ClusterA);
        material.ClusterName.ShouldBe("Cụm Năng lượng Xanh");
        material.StepNumber.ShouldBe(2);

        // Bước ngoài khoảng 1..7 -> ném lỗi
        Should.Throw<ValidationException>(() => material.SetClusterAndStep(LmsClusters.ClusterA, "Cụm A", 0));
        Should.Throw<ValidationException>(() => material.SetClusterAndStep(LmsClusters.ClusterA, "Cụm A", 8));

        // Điểm chuẩn đạt ngoài khoảng 50..100 -> ném lỗi
        Should.Throw<ValidationException>(() => material.SetExtendedContent(
            null, null, null, passScorePercent: 40, null, null, null, null));
        Should.Throw<ValidationException>(() => material.SetExtendedContent(
            null, null, null, passScorePercent: 101, null, null, null, null));

        // FAQs: tối đa 8 câu
        for (int i = 1; i <= 8; i++)
        {
            material.AddFaq(new LearningFaq(material.Id, i, $"Câu hỏi FAQ {i}?", $"Câu trả lời {i}."));
        }
        material.Faqs.Count.ShouldBe(8);

        // FAQ thứ 9 -> ném lỗi
        Should.Throw<ValidationException>(() => material.AddFaq(
            new LearningFaq(material.Id, 1, "FAQ 9?", "Trả lời 9")));
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
