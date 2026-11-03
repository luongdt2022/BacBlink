using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Lms.Application;
using NacenTech.Modules.Lms.Domain;
using NacenTech.Persistence;
using NacenTech.PolicyEngine;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

[Collection(PostgresCollection.Name)]
public sealed class LmsBackendIntegrationTests(PostgresFixture fixture)
{
    private static ServiceProvider CreateProvider(PostgresFixture f, TestActor? actor = null) =>
        f.BuildProvider(actor, configure: s => s.AddSingleton<IEmbeddingClient, FakeEmbeddingClient>());

    private readonly Guid _expertA = Guid.CreateVersion7();
    private readonly Guid _expertB = Guid.CreateVersion7();
    private readonly Guid _learner = Guid.CreateVersion7();
    private readonly Guid _admin = Guid.CreateVersion7();

    [Fact]
    public async Task Lms_FullLifecycle_Crud_Rbac_RAG_Quiz_TestedOnRealPostgres()
    {
        var expertProfileId = Guid.CreateVersion7();

        // 1. Chuyên gia A tạo học liệu số ở trạng thái DRAFT
        await using var expertAProvider = CreateProvider(fixture, new TestActor
        {
            PersonId = _expertA,
            Email = "expert.a@nacentech.vn",
            PlatformRole = PlatformRoles.VerifiedExpert,
            ScopeType = ScopeTypes.Sector,
            ScopeId = "CN_THONG_TIN"
        });

        Guid materialId;
        int currentVersion;

        using (var scope = expertAProvider.CreateScope())
        {
            var mgmt = scope.ServiceProvider.GetRequiredService<ILmsManagementService>();
            var created = await mgmt.CreateMaterialAsync(new CreateLearningMaterialRequest
            {
                Title = "Nhập môn Trí tuệ Nhân tạo và Đổi mới Sáng tạo",
                LessonType = LmsLessonTypes.TypeA,
                SectorCode = "LV01",
                DurationMinutes = 60,
                DescriptionHtml = "<p>Bài giảng tổng quan ứng dụng AI trong doanh nghiệp</p>",
                VideoStorageKey = "lms/videos/ai-intro.mp4",
                VideoFileName = "ai-intro.mp4",
                VideoFileSize = 150_000_000,
                ThumbnailUrl = "https://cdn.nacentech.vn/thumbs/ai.jpg",
                Status = LmsStatuses.Draft,
                Instructors =
                [
                    new InstructorDto(null, expertProfileId, "GS. Trần Văn Khoa", "Tiến sĩ", "Đại học Bách Khoa", null, 1, true)
                ],
                QuizQuestions =
                [
                    new QuizQuestionDto(null, 1, "AI là viết tắt của từ gì?", "Artificial Intelligence", "Automated Information", "Applied Internet", "Actual Insight", 'A', "AI là Artificial Intelligence")
                ],
                Attachments =
                [
                    new AttachmentDto(null, LmsAttachmentCategories.PracticeTool, "prompt-guide.pdf", "keys/prompt.pdf", "application/pdf", 2_000_000, null, 1)
                ],
                DbLinks =
                [
                    new DbLinkDto(null, "https://nacentech.vn/tech/ai-solution", "Giải pháp AI NacenTech", "Liên kết giải pháp", "TECHNOLOGY_ASSET", Guid.NewGuid(), "TECH-01", 1)
                ]
            }, _expertA, "GS. Trần Văn Khoa", CancellationToken.None);

            materialId = created.Id;
            currentVersion = created.Version;
            created.Status.ShouldBe(LmsStatuses.Draft);
            created.MaterialCode.ShouldStartWith("MAT-");
        }

        // 2. Chuyên gia A xuất bản học liệu (PUBLISHED)
        using (var scope = expertAProvider.CreateScope())
        {
            var mgmt = scope.ServiceProvider.GetRequiredService<ILmsManagementService>();
            var updated = await mgmt.UpdateMaterialAsync(materialId, new UpdateLearningMaterialRequest
            {
                Title = "Nhập môn Trí tuệ Nhân tạo và Đổi mới Sáng tạo",
                LessonType = LmsLessonTypes.TypeA,
                SectorCode = "LV01",
                DurationMinutes = 60,
                DescriptionHtml = "<p>Bài giảng tổng quan ứng dụng AI trong doanh nghiệp đạt chuẩn</p>",
                VideoStorageKey = "lms/videos/ai-intro.mp4",
                VideoFileName = "ai-intro.mp4",
                VideoFileSize = 150_000_000,
                Status = LmsStatuses.Published,
                Version = currentVersion,
                Instructors =
                [
                    new InstructorDto(null, expertProfileId, "GS. Trần Văn Khoa", "Tiến sĩ", "Đại học Bách Khoa", null, 1, true)
                ],
                QuizQuestions =
                [
                    new QuizQuestionDto(null, 1, "AI là viết tắt của từ gì?", "Artificial Intelligence", "Automated Information", "Applied Internet", "Actual Insight", 'A', "AI là Artificial Intelligence")
                ]
            }, _expertA, "GS. Trần Văn Khoa", false, CancellationToken.None);

            updated.Status.ShouldBe(LmsStatuses.Published);
            currentVersion = updated.Version;
        }

        // 3. Kiểm tra CSDL thật: Có vector chunks trong matching.search_chunks
        await using (var checkProvider = CreateProvider(fixture))
        using (var scope = checkProvider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var chunkCount = await db.Database.SqlQueryRaw<int>(
                $"SELECT count(*)::int AS \"Value\" FROM matching.search_chunks WHERE subject_kind = 'LEARNING_MATERIAL' AND subject_id = '{materialId}'")
                .FirstAsync();

            chunkCount.ShouldBeGreaterThan(0);
        }

        // 4. KIỂM THỬ BẢO MẬT CHỐNG IDOR: Chuyên gia B cố tình sửa/gỡ/xóa bài của Chuyên gia A
        await using var expertBProvider = CreateProvider(fixture, new TestActor
        {
            PersonId = _expertB,
            Email = "expert.b@nacentech.vn",
            PlatformRole = PlatformRoles.VerifiedExpert,
            ScopeType = ScopeTypes.Sector,
            ScopeId = "CN_THONG_TIN"
        });

        using (var scope = expertBProvider.CreateScope())
        {
            var mgmt = scope.ServiceProvider.GetRequiredService<ILmsManagementService>();

            // IDOR Attack 1: Sửa bài
            await Should.ThrowAsync<ForbiddenException>(async () =>
            {
                await mgmt.UpdateMaterialAsync(materialId, new UpdateLearningMaterialRequest
                {
                    Title = "Bị Hacker B sửa bài",
                    Version = currentVersion
                }, _expertB, "Chuyên gia B", false, CancellationToken.None);
            });

            // IDOR Attack 2: Gỡ bài
            await Should.ThrowAsync<ForbiddenException>(async () =>
            {
                await mgmt.UnpublishMaterialAsync(materialId, new UnpublishMaterialRequest
                {
                    Reason = "Hacker B muốn gỡ"
                }, _expertB, "Chuyên gia B", false, CancellationToken.None);
            });

            // IDOR Attack 3: Xóa bài
            await Should.ThrowAsync<ForbiddenException>(async () =>
            {
                await mgmt.DeleteMaterialAsync(materialId, _expertB, "Chuyên gia B", false, CancellationToken.None);
            });
        }

        // 5. CỔNG HỌC TẬP CÔNG KHAI: Kiểm tra Catalog, KPIs & Người học làm bài Quiz
        await using var learnerProvider = CreateProvider(fixture, new TestActor
        {
            PersonId = _learner,
            Email = "hocvien@nacentech.vn",
            PlatformRole = PlatformRoles.User
        });

        using (var scope = learnerProvider.CreateScope())
        {
            var catalog = scope.ServiceProvider.GetRequiredService<ILmsCatalogService>();

            // Kiểm tra danh mục và 4 KPIs
            var catalogResult = await catalog.GetCatalogAsync(new LmsMaterialFilterRequest(), CancellationToken.None);
            catalogResult.Materials.Items.Any(m => m.Id == materialId).ShouldBeTrue();
            catalogResult.Kpis.TotalCourses.ShouldBeGreaterThanOrEqualTo(1);

            // Học viên xem chi tiết: Đáp án đúng bị ẩn để chống gian lận
            var detail = await catalog.GetCatalogDetailAsync(materialId, _learner, false, CancellationToken.None);
            detail.QuizQuestions.Count.ShouldBe(1);
            detail.QuizQuestions[0].CorrectOption.ShouldBe(' '); // Ẩn đáp án đúng!
            detail.QuizQuestions[0].Explanation.ShouldBe(string.Empty); // Ẩn giải thích!

            // Học viên cập nhật tiến độ xem video (30 phút / 60 phút)
            await catalog.RecordProgressAsync(materialId, _learner, 1800, CancellationToken.None);
            var progress = await catalog.GetLearnerProgressAsync(materialId, _learner, CancellationToken.None);
            progress.ShouldNotBeNull();
            progress.WatchedSeconds.ShouldBe(1800);
            progress.ProgressPercent.ShouldBe(50);

            // Học viên nộp bài làm Quiz đúng đáp án
            var quizId = detail.QuizQuestions[0].Id!.Value;
            var attemptResult = await catalog.SubmitQuizAttemptAsync(materialId, _learner, new SubmitQuizAttemptRequest
            {
                Answers = new Dictionary<Guid, char> { [quizId] = 'A' }
            }, CancellationToken.None);

            attemptResult.ScorePercent.ShouldBe(100);
            attemptResult.Passed.ShouldBeTrue();
            attemptResult.CorrectAnswers.ShouldBe(1);
        }

        // 6. GỠ BÀI & XÓA MỀM BẢO VỆ TOÀN VẸN
        using (var scope = expertAProvider.CreateScope())
        {
            var mgmt = scope.ServiceProvider.GetRequiredService<ILmsManagementService>();

            // Không thể xóa khi đang PUBLISHED
            await Should.ThrowAsync<ValidationException>(async () =>
            {
                await mgmt.DeleteMaterialAsync(materialId, _expertA, "GS. Trần Văn Khoa", false, CancellationToken.None);
            });

            // Gỡ bài thành công
            await mgmt.UnpublishMaterialAsync(materialId, new UnpublishMaterialRequest
            {
                Reason = "Cập nhật bài giảng năm học mới"
            }, _expertA, "GS. Trần Văn Khoa", false, CancellationToken.None);

            // Sau khi gỡ bài: vector chunks trong matching.search_chunks bị dọn sạch
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var cleanChunks = await db.Database.SqlQueryRaw<int>(
                $"SELECT count(*)::int AS \"Value\" FROM matching.search_chunks WHERE subject_kind = 'LEARNING_MATERIAL' AND subject_id = '{materialId}'")
                .FirstAsync();

            cleanChunks.ShouldBe(0);

            // Giờ có thể xóa mềm
            await mgmt.DeleteMaterialAsync(materialId, _expertA, "GS. Trần Văn Khoa", false, CancellationToken.None);
        }

        // 7. Xác nhận trong PostgreSQL: Học liệu đã bị đánh dấu is_deleted = true
        await using (var verifyProvider = CreateProvider(fixture))
        using (var scope = verifyProvider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var final = await db.Set<LearningMaterial>().FirstOrDefaultAsync(x => x.Id == materialId);
            final.ShouldNotBeNull();
            final.IsDeleted.ShouldBeTrue();
            final.DeletedBy.ShouldBe(_expertA);
            final.DeletedAt.ShouldNotBeNull();
        }
    }
}
