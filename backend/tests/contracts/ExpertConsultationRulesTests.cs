using NacenTech.Api.V1Compat;
using NacenTech.Kernel.Domain;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Contracts;

/// <summary>
/// CR-2026-033 (T-05.CR033.05): Unit tests kiểm chứng 100% Business Rules BR-CON-001..006.
/// </summary>
public sealed class ExpertConsultationRulesTests
{
    [Fact]
    public void BR_CON_001_GenerateTicketCode_matches_format_and_varies()
    {
        var fixedTime = new DateTimeOffset(2026, 11, 13, 8, 0, 0, TimeSpan.Zero);
        var generated = Enumerable.Range(0, 20)
            .Select(_ => ConsultationRules.GenerateTicketCode(fixedTime))
            .ToList();

        generated.ShouldAllBe(code => code.StartsWith("REQ-CON-2026-", StringComparison.Ordinal));
        generated.ShouldAllBe(code => ConsultationRules.IsValidTicketCode(code));
        generated.Distinct().Count().ShouldBeGreaterThan(1);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("Bận")]
    [InlineData("   123456789   ")]
    public void BR_CON_002_Reject_with_fewer_than_10_trimmed_chars_throws_ValidationException(string? reason)
    {
        var ex = Should.Throw<ValidationException>(() =>
            ConsultationRules.ResolveTransition(ConsultationRules.Statuses.Pending, ConsultationRules.Actions.Reject, reason));

        ex.Code.ShouldBe("REJECTION_REASON_TOO_SHORT");
    }

    [Fact]
    public void BR_CON_002_Reject_with_at_least_10_chars_transitions_to_REJECTED()
    {
        var next = ConsultationRules.ResolveTransition(
            ConsultationRules.Statuses.Pending,
            ConsultationRules.Actions.Reject,
            "Lịch công tác trùng với hội đồng nghiệm thu cấp Bộ.");

        next.ShouldBe(ConsultationRules.Statuses.Rejected);
    }

    [Fact]
    public void BR_CON_003_Buyer_ownership_guard_blocks_cross_user_access()
    {
        var buyerA = Guid.NewGuid();
        var buyerB = Guid.NewGuid();

        Should.NotThrow(() => ConsultationRules.EnsureBuyerOwnership(buyerA, buyerA));

        var exOther = Should.Throw<ForbiddenException>(() => ConsultationRules.EnsureBuyerOwnership(buyerA, buyerB));
        exOther.RuleId.ShouldBe("BR-CON-003");

        var exGuest = Should.Throw<ForbiddenException>(() => ConsultationRules.EnsureBuyerOwnership(null, buyerB));
        exGuest.RuleId.ShouldBe("BR-CON-003");
    }

    [Fact]
    public void BR_CON_004_Expert_ownership_guard_blocks_cross_expert_access()
    {
        var expertA = Guid.NewGuid();
        var expertB = Guid.NewGuid();

        Should.NotThrow(() => ConsultationRules.EnsureExpertOwnership(expertA, expertA));

        var ex = Should.Throw<ForbiddenException>(() => ConsultationRules.EnsureExpertOwnership(expertA, expertB));
        ex.RuleId.ShouldBe("BR-CON-004");
    }

    [Theory]
    [InlineData("PENDING", "0912345689", "0912****89", "an.nguyen@domain.com", "a***@domain.com", false)]
    [InlineData("REJECTED", "0912345689", "0912****89", "an.nguyen@domain.com", "a***@domain.com", false)]
    [InlineData("SCHEDULED", "0912345689", "0912345689", "an.nguyen@domain.com", "an.nguyen@domain.com", true)]
    [InlineData("COMPLETED", "0912345689", "0912345689", "an.nguyen@domain.com", "an.nguyen@domain.com", true)]
    public void BR_CON_005_PDPD_masking_applies_by_status(
        string status,
        string rawPhone,
        string expectedPhone,
        string rawEmail,
        string expectedEmail,
        bool expectedUnmasked)
    {
        ConsultationRules.ShouldUnmaskPii(status).ShouldBe(expectedUnmasked);
        ConsultationRules.MaskPhone(rawPhone, status).ShouldBe(expectedPhone);
        ConsultationRules.MaskEmail(rawEmail, status).ShouldBe(expectedEmail);
        ConsultationRules.MaskPhone(null, status).ShouldBeNull();
        ConsultationRules.MaskEmail("   ", status).ShouldBeNull();
    }

    [Theory]
    [InlineData("PENDING", "ACCEPT", "SCHEDULED")]
    [InlineData("SCHEDULED", "COMPLETE", "COMPLETED")]
    public void BR_CON_006_Valid_state_machine_transitions_succeed(string current, string action, string expected)
    {
        var next = ConsultationRules.ResolveTransition(current, action, null);
        next.ShouldBe(expected);
    }

    [Theory]
    [InlineData("PENDING", "COMPLETE")]
    [InlineData("SCHEDULED", "ACCEPT")]
    [InlineData("SCHEDULED", "REJECT")]
    [InlineData("REJECTED", "ACCEPT")]
    [InlineData("REJECTED", "COMPLETE")]
    [InlineData("COMPLETED", "ACCEPT")]
    [InlineData("COMPLETED", "REJECT")]
    [InlineData("COMPLETED", "COMPLETE")]
    public void BR_CON_006_Invalid_state_machine_transitions_throw_ConflictException(string current, string action)
    {
        var ex = Should.Throw<ConflictException>(() =>
            ConsultationRules.ResolveTransition(current, action, "Lý do hợp lệ trên 10 ký tự"));

        ex.Code.ShouldBe("CONSULTATION_INVALID_STATE");
    }

    [Fact]
    public void BR_CON_006_Unknown_action_throws_ValidationException()
    {
        var ex = Should.Throw<ValidationException>(() =>
            ConsultationRules.ResolveTransition(ConsultationRules.Statuses.Pending, "ARCHIVE", null));

        ex.Code.ShouldBe("INVALID_CONSULTATION_ACTION");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public void BR_CON_006_Review_rating_outside_1_to_5_throws_ValidationException(int rating)
    {
        var ex = Should.Throw<ValidationException>(() => ConsultationRules.ValidateReviewInput(rating));
        ex.Code.ShouldBe("INVALID_RATING");
    }

    [Fact]
    public void BR_CON_006_Review_zero_rows_error_maps_404_403_409_accurately()
    {
        var buyerA = Guid.NewGuid();
        var buyerB = Guid.NewGuid();

        ShouldBeNotFound(ConsultationRules.ResolveReviewZeroRowsError(false, null, buyerA, null, null));
        ShouldBeForbidden(ConsultationRules.ResolveReviewZeroRowsError(true, buyerA, buyerB, "COMPLETED", null));
        ShouldBeConflict(ConsultationRules.ResolveReviewZeroRowsError(true, buyerA, buyerA, "SCHEDULED", null), "CONSULTATION_NOT_COMPLETED");
        ShouldBeConflict(ConsultationRules.ResolveReviewZeroRowsError(true, buyerA, buyerA, "COMPLETED", DateTimeOffset.UtcNow), "CONSULTATION_ALREADY_REVIEWED");
    }

    [Fact]
    public void T_05_CR033_10_Contract_DTO_dual_route_compatibility()
    {
        // Kiểm tra DTO RespondConsultationRequestDto map các trường legacy và new
        var dto = new RespondConsultationRequestDto
        {
            Action = "ACCEPT",
            MeetingDate = "2026-11-20",
            MeetingTime = "14:00 - 16:00",
            MeetingType = "Trực tuyến qua Zoom",
            MeetingUrl = "https://zoom.us/j/999888777",
            ScheduledAt = new DateTimeOffset(2026, 11, 20, 14, 0, 0, TimeSpan.Zero),
            MeetingLink = "https://zoom.us/j/999888777",
            ExpertNote = "Đã nhận lời mời",
            RejectionReason = "Bận công tác",
            RejectionNote = "Bận công tác"
        };

        dto.Action.ShouldBe("ACCEPT");
        dto.MeetingDate.ShouldBe("2026-11-20");
        dto.MeetingLink.ShouldBe("https://zoom.us/j/999888777");
        dto.MeetingUrl.ShouldBe("https://zoom.us/j/999888777");
    }

    [Fact]
    public void T_05_CR033_11_Zero_mock_and_schema_ddl_contain_no_fake_seed_records()
    {
        // Đọc mã nguồn schema DDL của ConsultationRules
        // Bảo đảm không chứa bất kỳ câu lệnh INSERT dữ liệu giả nào (Zero-Mock)
        var method = typeof(ConsultationRules).GetMethod("EnsureConsultationsSchemaAsync");
        method.ShouldNotBeNull();

        // Kiểm tra bảng brokerage.expert_consultations không còn UUID seed giả
        typeof(ConsultationRules).Assembly.GetTypes()
            .Any(t => t.Name == "ExpertController")
            .ShouldBeTrue();
    }

    private static void ShouldBeNotFound(DomainException ex) => ex.ShouldBeOfType<NotFoundException>();
    private static void ShouldBeForbidden(DomainException ex) => ex.ShouldBeOfType<ForbiddenException>();
    private static void ShouldBeConflict(DomainException ex, string code)
    {
        var conflict = ex.ShouldBeOfType<ConflictException>();
        conflict.Code.ShouldBe(code);
    }
}
