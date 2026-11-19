using Microsoft.Extensions.DependencyInjection;
using NacenTech.Api.V1Compat;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.DataRoom.Application;
using NacenTech.Modules.Demand.Application;
using NacenTech.Modules.Matching.Application;
using NacenTech.Modules.Policy.Application;
using NacenTech.Modules.Technology.Application;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Contracts;

/// <summary>
/// B-31, và đây là cái bẫy đã lên cò phía sau B-32. Facade ghi lại cả bốn đoạn nội dung mật ở mọi lần cập nhật,
/// lấy giá trị thẳng từ thân request; `UpsertTextSectionAsync` hiểu rỗng là **gỡ đoạn**. Một biểu mẫu chỉ gửi
/// `title` vì thế xoá sạch nội dung mức 2 và mức 3. Hôm qua vô hại vì mọi lệnh sửa đều cuộn ngược — ngày B-32
/// được chữa, đây là thứ nổ tiếp theo, và nó nổ **im lặng với một phản hồi 2xx**.
///
/// Ranh giới phải giữ: trường **vắng mặt** ≠ trường **gửi rỗng**. Multipart bind cả hai thành `null`, nên phép
/// phân biệt duy nhất đúng là kiểm tên trường có trong form hay không.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class IntakeConfidentialSectionsTests(PostgresFixture fixture)
{
    private static CancellationToken Ct => CancellationToken.None;

    [Fact]
    public async Task Updating_only_the_title_leaves_every_confidential_section_intact()
    {
        var owner = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor().AsUser(owner));

        var subject = await CreateTechnologyAsync(provider, owner);
        await ApplyAsync(provider, subject, owner, Full());

        (await SectionsAsync(provider, subject)).ShouldSatisfyAllConditions(
            s => s[TextSections.Level2Content].ShouldBe("Bí mật mức 2"),
            s => s[TextSections.Level3Content].ShouldBe("Bí mật mức 3"));

        // Đúng cái biểu mẫu của cổng người dùng gửi khi người dùng chỉ sửa tiêu đề.
        var titleOnly = new IntakeWriteDto { Title = "Tiêu đề mới" };
        titleOnly.MarkProvidedFields(["title"]);
        await ApplyAsync(provider, subject, owner, titleOnly);

        var after = await SectionsAsync(provider, subject);
        after[TextSections.Level2Content].ShouldBe("Bí mật mức 2", "sửa tiêu đề không được xoá nội dung mật");
        after[TextSections.Level2AiProcessedContent].ShouldBe("Bản AI mức 2");
        after[TextSections.Level3Content].ShouldBe("Bí mật mức 3");
        after[TextSections.Level3AiProcessedContent].ShouldBe("Bản AI mức 3");
    }

    /// <summary>
    /// Mặt còn lại của cùng ranh giới: gỡ đoạn vẫn phải làm được. Người dùng gửi trường lên với giá trị rỗng là
    /// một ý định rõ ràng, khác hẳn việc không gửi trường đó.
    /// </summary>
    [Fact]
    public async Task Sending_an_explicitly_empty_section_still_removes_that_section_and_only_that_one()
    {
        var owner = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor().AsUser(owner));

        var subject = await CreateTechnologyAsync(provider, owner);
        await ApplyAsync(provider, subject, owner, Full());

        var clearLevel2 = new IntakeWriteDto { Title = "Tiêu đề mới", ConfidentialLevel2Content = string.Empty };
        clearLevel2.MarkProvidedFields(["title", TextSections.Level2Content]);
        await ApplyAsync(provider, subject, owner, clearLevel2);

        var after = await SectionsAsync(provider, subject);
        after[TextSections.Level2Content].ShouldBeNull("gửi rỗng là yêu cầu gỡ đoạn");
        after[TextSections.Level2AiProcessedContent].ShouldBe("Bản AI mức 2", "chỉ đoạn được gửi rỗng mới bị gỡ");
        after[TextSections.Level3Content].ShouldBe("Bí mật mức 3");
    }

    /// <summary>
    /// Hướng an toàn của phép đoán: chỗ gọi quên khai báo trường nào có mặt thì không đoạn nào bị chạm tới.
    /// Hướng sai của phép đoán này là mất dữ liệu, nên mặc định phải là "không đụng vào".
    /// </summary>
    [Fact]
    public async Task A_dto_that_never_declared_its_fields_touches_nothing()
    {
        var owner = Guid.CreateVersion7();
        await using var provider = fixture.BuildProvider(new TestActor().AsUser(owner));

        var subject = await CreateTechnologyAsync(provider, owner);
        await ApplyAsync(provider, subject, owner, Full());

        await ApplyAsync(provider, subject, owner, new IntakeWriteDto { Title = "Tiêu đề mới" });

        var after = await SectionsAsync(provider, subject);
        after[TextSections.Level2Content].ShouldBe("Bí mật mức 2");
        after[TextSections.Level3Content].ShouldBe("Bí mật mức 3");
    }

    [Fact]
    public void Provided_fields_are_matched_case_insensitively()
    {
        var dto = new IntakeWriteDto();
        dto.MarkProvidedFields(["confidentialLevel2Content"]);

        dto.WasProvided(nameof(IntakeWriteDto.ConfidentialLevel2Content)).ShouldBeTrue(
            "form gửi camelCase còn thuộc tính là PascalCase — cùng một trường");
        dto.WasProvided(nameof(IntakeWriteDto.ConfidentialLevel3Content)).ShouldBeFalse();
    }

    // ─── Dàn dựng ─────────────────────────────────────────────────────────────────────────────

    private static IntakeWriteDto Full()
    {
        var dto = new IntakeWriteDto
        {
            Title = "Tài sản có nội dung mật",
            ConfidentialLevel2Content = "Bí mật mức 2",
            ConfidentialLevel2AiProcessedContent = "Bản AI mức 2",
            ConfidentialLevel3Content = "Bí mật mức 3",
            ConfidentialLevel3AiProcessedContent = "Bản AI mức 3",
        };
        dto.MarkProvidedFields([
            "title",
            TextSections.Level2Content,
            TextSections.Level2AiProcessedContent,
            TextSections.Level3Content,
            TextSections.Level3AiProcessedContent,
        ]);
        return dto;
    }

    private static async Task<SubjectRef> CreateTechnologyAsync(ServiceProvider provider, Guid owner)
    {
        using var scope = provider.CreateScope();
        var technologies = scope.ServiceProvider.GetRequiredService<ITechnologyService>();
        var created = await technologies.CreateAsync(new CreateTechnologyCommand(
            owner, "Tài sản có nội dung mật", "Mô tả công khai", null, PublicationStatuses.Draft, null, null), Ct);
        return SubjectRef.Technology(created.Id);
    }

    private static async Task ApplyAsync(ServiceProvider provider, SubjectRef subject, Guid owner, IntakeWriteDto dto)
    {
        using var scope = provider.CreateScope();
        await FacadeOf(scope.ServiceProvider).ApplyConfidentialSectionsAsync(subject, owner, dto, Ct);
    }

    private static async Task<Dictionary<string, string?>> SectionsAsync(ServiceProvider provider, SubjectRef subject)
    {
        using var scope = provider.CreateScope();
        var dataRoom = scope.ServiceProvider.GetRequiredService<IDataRoomService>();
        var docs = await dataRoom.ListForSubjectAsync(subject, Ct);
        return docs.Where(d => d.Kind == DocumentKinds.TextSection).ToDictionary(d => d.SectionCode!, d => d.TextContent);
    }

    private static IntakeFacade FacadeOf(IServiceProvider sp) => new(
        sp.GetRequiredService<IDemandService>(),
        sp.GetRequiredService<ITechnologyService>(),
        sp.GetRequiredService<IDataRoomService>(),
        sp.GetRequiredService<IMatchingService>(),
        sp.GetRequiredService<ITaxonomyService>(),
        sp.GetRequiredService<IPersonDirectory>(),
        sp.GetRequiredService<ICurrentActor>());
}
