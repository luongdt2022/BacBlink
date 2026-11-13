using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Brokerage.Application;
using NacenTech.Modules.Brokerage.Domain;
using NacenTech.Modules.Lms.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// TASK-05 CR-2026-032 (T-05.CR032.04): Integration tests cho ExpertLmsCourseLookup & Public Expert DTOs
/// (BR-EXP-LMS-001, API-EXP-DIR-006).
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class ExpertPublicLmsIntegrationTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    [Fact]
    public async Task ExpertLmsCourseLookup_And_PublicExpertDtos_FilterPublishedAndReturnLmsCourses()
    {
        var actorId = Guid.CreateVersion7();
        var personIdA = Guid.CreateVersion7();
        var personIdB = Guid.CreateVersion7();
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];

        var consultingSummaryA = $"Tư vấn chuyên sâu chuyển đổi số {uniqueSuffix}";
        var orgAddressA = $"18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội ({uniqueSuffix})";

        Guid profileIdA;
        Guid profileIdB;
        string expertCodeA;
        string publishedCode;

        await using (var setup = fixture.BuildProvider())
        using (var scope = setup.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();

            var profileA = new ExpertProfile(
                personIdA,
                $"PGS.TS. Nguyễn LMS {uniqueSuffix}",
                1975,
                "male",
                $"CCCD-{personIdA:N}"[..20],
                new DateOnly(2020, 1, 15),
                academicRank: "PGS",
                academicRankYear: 2019,
                degree: "DOCTOR",
                degreeYear: 2010,
                organizationName: "Viện Công nghệ NacenTech",
                organizationAddress: orgAddressA,
                researchTitle: "Nghiên cứu viên chính",
                positionTitle: "Giám đốc Trung tâm",
                expertiseSectors: ["LV16"],
                trainingHistoryJson: null,
                employmentHistoryJson: null,
                publicationsJson: null,
                consultingSummary: consultingSummaryA,
                isProjectLeader: true,
                isMainContributor: true,
                pdpdConsentAtUtc: DateTimeOffset.UtcNow);
            profileA.LinkToPerson(personIdA);
            profileA.Approve("Đạt tiêu chuẩn Hội đồng");
            profileA.SetPublicListing(true, true, "Hồ sơ công khai chuyên gia LMS");

            var profileB = new ExpertProfile(
                personIdB,
                $"TS. Trần Draft {uniqueSuffix}",
                1982,
                "female",
                $"CCCD-{personIdB:N}"[..20],
                new DateOnly(2021, 5, 10),
                academicRank: "NONE",
                academicRankYear: null,
                degree: "DOCTOR",
                degreeYear: 2016,
                organizationName: "Đại học Khoa học Tự nhiên",
                organizationAddress: "227 Nguyễn Văn Cừ, TP.HCM",
                researchTitle: "Giảng viên chính",
                positionTitle: "Phó Trưởng khoa",
                expertiseSectors: ["LV01"],
                trainingHistoryJson: null,
                employmentHistoryJson: null,
                publicationsJson: null,
                consultingSummary: "Tư vấn công nghệ sinh học",
                isProjectLeader: false,
                isMainContributor: true,
                pdpdConsentAtUtc: DateTimeOffset.UtcNow);
            profileB.LinkToPerson(personIdB);
            profileB.Approve("Đạt tiêu chuẩn Hội đồng");
            profileB.SetPublicListing(true, true, "Hồ sơ công khai chuyên gia B");

            db.Add(profileA);
            db.Add(profileB);
            await db.SaveChangesAsync(Ct);

            profileIdA = profileA.Id;
            profileIdB = profileB.Id;
            expertCodeA = profileA.ExpertCode;

            publishedCode = $"LMS-PUB-{uniqueSuffix}";
            var publishedCourse = new LearningMaterial(
                publishedCode,
                $"Khóa học Công khai {uniqueSuffix}",
                LmsLessonTypes.TypeA,
                45,
                "<p>Nội dung khóa học đã xuất bản</p>",
                actorId,
                "Admin LMS",
                sectorCode: "LV16",
                videoStorageKey: $"lms/videos/{uniqueSuffix}-pub.mp4",
                videoFileName: "pub.mp4",
                videoFileSize: 10_000_000);
            publishedCourse.SetClusterAndStep(LmsClusters.ClusterA, "Cụm A: Nền tảng", 1);
            publishedCourse.AddInstructor(new LearningMaterialInstructor(
                publishedCourse.Id,
                profileIdA,
                profileA.FullName,
                profileA.Degree,
                profileA.OrganizationName,
                displayOrder: 1,
                isLead: true));
            publishedCourse.Publish(actorId, "Admin LMS");

            var draftCourse = new LearningMaterial(
                $"LMS-DRF-{uniqueSuffix}",
                $"Khóa học Nháp {uniqueSuffix}",
                LmsLessonTypes.TypeB,
                30,
                "<p>Nội dung nháp</p>",
                actorId,
                "Admin LMS",
                sectorCode: "LV16",
                videoStorageKey: $"lms/videos/{uniqueSuffix}-draft.mp4",
                videoFileName: "draft.mp4",
                videoFileSize: 5_000_000);
            draftCourse.AddInstructor(new LearningMaterialInstructor(
                draftCourse.Id,
                profileIdA,
                profileA.FullName,
                profileA.Degree,
                profileA.OrganizationName,
                displayOrder: 1,
                isLead: true));

            var deletedCourse = new LearningMaterial(
                $"LMS-DEL-{uniqueSuffix}",
                $"Khóa học Đã Xóa {uniqueSuffix}",
                LmsLessonTypes.TypeA,
                25,
                "<p>Nội dung đã xóa mềm</p>",
                actorId,
                "Admin LMS",
                sectorCode: "LV16",
                videoStorageKey: $"lms/videos/{uniqueSuffix}-del.mp4",
                videoFileName: "del.mp4",
                videoFileSize: 5_000_000);
            deletedCourse.AddInstructor(new LearningMaterialInstructor(
                deletedCourse.Id,
                profileIdA,
                profileA.FullName,
                profileA.Degree,
                profileA.OrganizationName,
                displayOrder: 1,
                isLead: true));
            deletedCourse.SoftDelete(actorId, "Admin LMS");

            var unpublishedCourseB = new LearningMaterial(
                $"LMS-UNP-{uniqueSuffix}",
                $"Khóa học Gỡ công khai {uniqueSuffix}",
                LmsLessonTypes.TypeA,
                20,
                "<p>Nội dung gỡ công khai</p>",
                actorId,
                "Admin LMS",
                sectorCode: "LV01",
                videoStorageKey: $"lms/videos/{uniqueSuffix}-unp.mp4",
                videoFileName: "unp.mp4",
                videoFileSize: 5_000_000);
            unpublishedCourseB.AddInstructor(new LearningMaterialInstructor(
                unpublishedCourseB.Id,
                profileIdB,
                profileB.FullName,
                profileB.Degree,
                profileB.OrganizationName,
                displayOrder: 1,
                isLead: true));
            unpublishedCourseB.Publish(actorId, "Admin LMS");
            unpublishedCourseB.Unpublish(actorId, "Admin LMS", "Cập nhật nội dung");

            db.Add(publishedCourse);
            db.Add(draftCourse);
            db.Add(deletedCourse);
            db.Add(unpublishedCourseB);
            await db.SaveChangesAsync(Ct);

            // Đảm bảo kiểm chứng cứng điều kiện !IsDeleted ngay cả khi status == PUBLISHED
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE lms.learning_materials SET status = {LmsStatuses.Published} WHERE id = {deletedCourse.Id}",
                Ct);
        }

        await using var provider = fixture.BuildProvider();
        using var testScope = provider.CreateScope();

        var lmsLookup = testScope.ServiceProvider.GetRequiredService<IExpertLmsCourseLookup>();
        var expertService = testScope.ServiceProvider.GetRequiredService<IExpertService>();

        // 1. Kiểm chứng batch GetPublishedCourseCountsAsync (BR-EXP-LMS-001)
        var counts = await lmsLookup.GetPublishedCourseCountsAsync([profileIdA, profileIdB], Ct);
        counts.GetValueOrDefault(profileIdA, 0).ShouldBe(1);
        counts.GetValueOrDefault(profileIdB, 0).ShouldBe(0);

        // 2. Kiểm chứng GetPublishedCoursesByExpertAsync chỉ trả về PUBLISHED & !IsDeleted
        var coursesA = await lmsLookup.GetPublishedCoursesByExpertAsync(profileIdA, Ct);
        coursesA.Count.ShouldBe(1);
        coursesA[0].MaterialCode.ShouldBe(publishedCode);
        coursesA[0].Title.ShouldBe($"Khóa học Công khai {uniqueSuffix}");
        coursesA[0].LessonType.ShouldBe(LmsLessonTypes.TypeA);
        coursesA[0].DurationMinutes.ShouldBe(45);
        coursesA[0].ClusterName.ShouldBe("Cụm A: Nền tảng");
        coursesA[0].SectorCode.ShouldBe("LV16");

        // 3. Kiểm chứng Public Directory DTO trả về ConsultingSummary, OrganizationAddress, CourseCount
        var directory = await expertService.GetPublicDirectoryAsync(
            q: uniqueSuffix,
            degrees: null,
            sectorCodes: null,
            provinceCode: null,
            acceptingConsultation: null,
            page: 1,
            pageSize: 10,
            Ct);

        var cardA = directory.Items.FirstOrDefault(x => x.ExpertCode == expertCodeA);
        cardA.ShouldNotBeNull();
        cardA.ConsultingSummary.ShouldBe(consultingSummaryA);
        cardA.OrganizationAddress.ShouldBe(orgAddressA);
        cardA.CourseCount.ShouldBe(1);

        // 4. Kiểm chứng Public Detail DTO trả về ConsultingSummary, OrganizationAddress, Courses
        var detailA = await expertService.GetPublicDetailAsync(expertCodeA, Ct);
        detailA.ShouldNotBeNull();
        detailA.ConsultingSummary.ShouldBe(consultingSummaryA);
        detailA.OrganizationAddress.ShouldBe(orgAddressA);
        detailA.Courses.ShouldNotBeNull();
        detailA.Courses.Count.ShouldBe(1);
        detailA.Courses[0].MaterialCode.ShouldBe(publishedCode);
        detailA.Courses[0].Title.ShouldBe($"Khóa học Công khai {uniqueSuffix}");
    }
}
