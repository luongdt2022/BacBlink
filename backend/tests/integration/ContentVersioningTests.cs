using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Demand.Domain;
using NacenTech.Modules.Technology.Application;
using NacenTech.Modules.Technology.Domain;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// Cổng done của ADR-0003 (B-32). Bốn mươi tư test trước đó đều xanh trong khi thao tác trung tâm của sản phẩm
/// — sửa nội dung mình đã đăng — hỏng vĩnh viễn với 409, vì **không test nào ghi một lần sửa xuống cơ sở dữ liệu
/// rồi đọc lại**. Bộ này làm đúng việc đó: ghi ở một scope, đọc lại ở scope khác, và soi thẳng hàng phiên bản.
///
/// Hình dạng của lỗi: `Entity.Id` được gán ngay ở khai báo nên hàng con mới ra đời đã mang khoá khác giá trị mặc
/// định; không có `ValueGeneratedNever` thì change tracker xếp nó vào nhóm "đã tồn tại" và phát ra
/// `UPDATE ... WHERE id = &lt;khoá mới&gt;`. Không hàng nào khớp → `DbUpdateConcurrencyException` → cả giao dịch
/// cuộn ngược, và người dùng nhận câu "bản ghi đã bị thay đổi bởi một yêu cầu khác" trên bản ghi không ai đụng vào.
///
/// Cùng hình dạng có ở mọi aggregate có tập hợp con, nên hai bài dưới đây canh chừng cho cả họ chứ không riêng
/// hai module này.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class ContentVersioningTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    [Fact]
    public async Task Editing_a_technology_title_creates_a_new_version_row_that_survives_a_reload()
    {
        var owner = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor().AsUser(owner));

        Guid id;
        using (var scope = provider.CreateScope())
        {
            var technologies = scope.ServiceProvider.GetRequiredService<ITechnologyService>();
            var created = await technologies.CreateAsync(new CreateTechnologyCommand(
                owner, "Màng lọc nano thế hệ 1", "Mô tả ban đầu", null, PublicationStatuses.Draft, null, null), Ct);
            created.CurrentVersionNo.ShouldBe(1);
            id = created.Id;
        }

        // Scope mới = DbContext mới: aggregate được nạp lại và đang được theo dõi khi hàng con ra đời. Đúng
        // điều kiện làm lỗi nổ; sửa trong cùng scope với lệnh tạo sẽ không tái hiện được.
        using (var scope = provider.CreateScope())
        {
            var technologies = scope.ServiceProvider.GetRequiredService<ITechnologyService>();
            var updated = await technologies.UpdateAsync(id, new UpdateTechnologyCommand(
                "Màng lọc nano thế hệ 2", null, null, null, null, null, ClearCategory: false), Ct);
            updated.Title.ShouldBe("Màng lọc nano thế hệ 2");
            updated.CurrentVersionNo.ShouldBe(2);
        }

        using (var scope = provider.CreateScope())
        {
            var technologies = scope.ServiceProvider.GetRequiredService<ITechnologyService>();
            var reloaded = await technologies.GetAsync(id, false, Ct);
            reloaded.Title.ShouldBe("Màng lọc nano thế hệ 2", "lần sửa phải nằm trong cơ sở dữ liệu, không chỉ trong bộ nhớ");
            reloaded.CurrentVersionNo.ShouldBe(2);
            reloaded.Description.ShouldBe("Mô tả ban đầu", "sửa tiêu đề không được đụng tới mô tả");
        }

        // Hàng phiên bản phải là một hàng MỚI, không phải hàng cũ bị ghi đè: đó chính là ranh giới giữa INSERT
        // và UPDATE mà lỗi nằm ở đó.
        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var versions = await db.Set<TechnologyPackageVersion>().AsNoTracking()
                .Where(v => v.TechnologyAssetId == id).OrderBy(v => v.VersionNo).ToListAsync(Ct);

            versions.Count.ShouldBe(2);
            versions[0].Title.ShouldBe("Màng lọc nano thế hệ 1", "phiên bản cũ là dữ liệu bất biến, phải còn nguyên");
            versions[1].Title.ShouldBe("Màng lọc nano thế hệ 2");
            versions[1].Id.ShouldNotBe(versions[0].Id);
        }
    }

    [Fact]
    public async Task Editing_a_demand_brief_creates_a_new_version_row_that_survives_a_reload()
    {
        var owner = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor().AsUser(owner));

        Guid id;
        using (var scope = provider.CreateScope())
        {
            var demands = scope.ServiceProvider.GetRequiredService<IDemandService>();
            var created = await demands.CreateAsync(new CreateDemandCommand(
                owner, "Cần giải pháp xử lý nước thải", "Bài toán ban đầu", null, DemandStatuses.Draft, null, null), Ct);
            created.CurrentVersionNo.ShouldBe(1);
            id = created.Id;
        }

        using (var scope = provider.CreateScope())
        {
            var demands = scope.ServiceProvider.GetRequiredService<IDemandService>();
            var updated = await demands.UpdateAsync(id, new UpdateDemandCommand(
                null, "Bài toán đã viết lại", null, null, null, null, ClearCategory: false), Ct);
            updated.ProblemStatement.ShouldBe("Bài toán đã viết lại");
            updated.CurrentVersionNo.ShouldBe(2);
        }

        using (var scope = provider.CreateScope())
        {
            var demands = scope.ServiceProvider.GetRequiredService<IDemandService>();
            var reloaded = await demands.GetAsync(id, false, Ct);
            reloaded.ProblemStatement.ShouldBe("Bài toán đã viết lại");
            reloaded.CurrentVersionNo.ShouldBe(2);
            reloaded.Title.ShouldBe("Cần giải pháp xử lý nước thải", "sửa nội dung không được đụng tới tiêu đề");
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var versions = await db.Set<DemandBriefVersion>().AsNoTracking()
                .Where(v => v.DemandBriefId == id).OrderBy(v => v.VersionNo).ToListAsync(Ct);

            versions.Count.ShouldBe(2);
            versions[0].ProblemStatement.ShouldBe("Bài toán ban đầu");
            versions[1].ProblemStatement.ShouldBe("Bài toán đã viết lại");
        }
    }

    /// <summary>
    /// Ranh giới đo được ngày 2026-09-04: đổi trạng thái xuất bản trả 200 còn đổi tiêu đề trả 409, đúng vì chỉ
    /// cái sau tạo hàng con. Bài này giữ cả hai phía của ranh giới đó trong một lần chạy.
    /// </summary>
    [Fact]
    public async Task Publishing_and_repeated_content_edits_both_work_on_the_same_record()
    {
        var owner = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor().AsUser(owner));

        Guid id;
        using (var scope = provider.CreateScope())
        {
            var technologies = scope.ServiceProvider.GetRequiredService<ITechnologyService>();
            id = (await technologies.CreateAsync(new CreateTechnologyCommand(
                owner, "Bản gốc", "Nội dung gốc", null, PublicationStatuses.Draft, null, null), Ct)).Id;
        }

        // Đổi trạng thái: không tạo phiên bản, chạy được cả trước bản vá.
        using (var scope = provider.CreateScope())
        {
            var technologies = scope.ServiceProvider.GetRequiredService<ITechnologyService>();
            var published = await technologies.UpdateAsync(id, new UpdateTechnologyCommand(
                null, null, null, PublicationStatuses.Published, null, null, ClearCategory: false), Ct);
            published.PublicationStatus.ShouldBe(PublicationStatuses.Published);
            published.CurrentVersionNo.ShouldBe(1, "đổi trạng thái không tạo phiên bản nội dung");
        }

        // Gửi lại đúng tiêu đề cũ: cũng không tạo phiên bản.
        using (var scope = provider.CreateScope())
        {
            var technologies = scope.ServiceProvider.GetRequiredService<ITechnologyService>();
            var unchanged = await technologies.UpdateAsync(id, new UpdateTechnologyCommand(
                "Bản gốc", null, null, null, null, null, ClearCategory: false), Ct);
            unchanged.CurrentVersionNo.ShouldBe(1);
        }

        // Ba lần sửa nội dung liên tiếp, mỗi lần một scope: phiên bản phải tăng đúng 1 mỗi lần.
        for (var i = 2; i <= 4; i++)
        {
            using var scope = provider.CreateScope();
            var technologies = scope.ServiceProvider.GetRequiredService<ITechnologyService>();
            var updated = await technologies.UpdateAsync(id, new UpdateTechnologyCommand(
                $"Bản sửa {i}", null, null, null, null, null, ClearCategory: false), Ct);
            updated.CurrentVersionNo.ShouldBe(i);
        }

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<NacenTechDbContext>();
            var titles = await db.Set<TechnologyPackageVersion>().AsNoTracking()
                .Where(v => v.TechnologyAssetId == id).OrderBy(v => v.VersionNo).Select(v => v.Title).ToListAsync(Ct);
            titles.ShouldBe(["Bản gốc", "Bản sửa 2", "Bản sửa 3", "Bản sửa 4"]);
        }
    }
}
