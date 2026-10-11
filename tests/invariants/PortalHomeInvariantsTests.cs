using NacenTech.Kernel.Application;
using NacenTech.Modules.Content.Application;
using NacenTech.Modules.Content.Domain;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public sealed class PortalHomeInvariantsTests
{
    [Fact]
    public void TechmartEvent_initialization_sets_correct_default_status_and_properties()
    {
        var now = DateTimeOffset.UtcNow;
        var ev = new TechmartEvent(
            "Techmart Hà Nội 2026",
            "Trình diễn và kết nối công nghệ số và tự động hóa",
            "Cung Văn Hóa Hữu Nghị Việt Xô, Hà Nội",
            now.AddDays(7),
            now.AddDays(10),
            TechmartEventStatuses.Upcoming,
            42,
            "https://nacentwin.vn/files/techmart-hn-2026.pdf",
            "https://nacentwin.vn/images/techmart-banner.jpg"
        );

        ev.Title.ShouldBe("Techmart Hà Nội 2026");
        ev.Status.ShouldBe(TechmartEventStatuses.Upcoming);
        ev.TechnologiesCount.ShouldBe(42);
        ev.PdfBrochureUrl.ShouldBe("https://nacentwin.vn/files/techmart-hn-2026.pdf");
    }

    [Fact]
    public void EventRegistration_creates_valid_registration_code_starting_with_TM()
    {
        var eventId = Guid.NewGuid();
        var reg = new EventRegistration(
            eventId,
            "Công ty CP Công Nghệ Mới",
            "Nguyễn Văn A",
            "0912345678",
            "contact@newtech.vn",
            EventRegistrationRoles.Buyer,
            "Quan tâm công nghệ IoT nông nghiệp",
            "TM-202610-8888"
        );

        reg.EventId.ShouldBe(eventId);
        reg.OrganizationName.ShouldBe("Công ty CP Công Nghệ Mới");
        reg.RegistrationCode.ShouldStartWith("TM-");
        reg.Status.ShouldBe("CONFIRMED");
    }

    [Theory]
    [InlineData("Công nghệ của tôi đạt mức TRL nào theo TT17?", "TRL_GUIDE", "/dich-vu-khac")]
    [InlineData("Tư vấn định giá chuyển nhượng sáng chế sinh học", "PRICING", "/chao-ban-cong-nghe")]
    [InlineData("Tìm chuyên gia công nghệ vật liệu mới tại Hà Nội", "EXPERT_MATCH", "/experts")]
    [InlineData("Muốn tìm hiểu cơ hội hợp tác cung cầu công nghệ", "GENERAL_DISCOVERY", "/chao-ban-cong-nghe")]
    [InlineData("m làm được những gì", "CAPABILITIES", "/chao-ban-cong-nghe")]
    [InlineData("sao hỏi k trả lời mà toàn ghi nhận câu hỏi vậy", "SUPPORT_ASSISTANCE", "/chao-ban-cong-nghe")]
    [InlineData("hi", "GREETING", "/chao-ban-cong-nghe")]
    public async Task AiAssistant_correctly_classifies_user_intents_and_routes(string prompt, string expectedTopic, string expectedRoute)
    {
        var service = new AiAssistantService();
        var result = await service.QuickAssistAsync(new AiQuickAssistRequestDto(prompt));

        result.ShouldNotBeNull();
        result.SuggestedTopic.ShouldBe(expectedTopic);
        result.RedirectUrl.ShouldBe(expectedRoute);
        result.Reply.ShouldNotBeNullOrWhiteSpace();
        result.Reply.ShouldNotContain("đã ghi nhận yêu cầu");
    }

    [Fact]
    public void PortalOverviewStatsDto_guarantees_structure_and_63_provinces()
    {
        var stats = new PortalOverviewStatsDto(
            120,
            85,
            304,
            94,
            63,
            DateTimeOffset.UtcNow
        );

        stats.TotalOffers.ShouldBe(120);
        stats.TotalDemands.ShouldBe(85);
        stats.TotalEnterprises.ShouldBe(304);
        stats.TotalExperts.ShouldBe(94);
        stats.TotalProvinces.ShouldBe(63);
    }
}
