using NacenTech.Kernel.Domain;
using NacenTech.Modules.Case.Application;
using NacenTech.Modules.Case.Domain;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

/// <summary>
/// Cổng done của ADR-0008: mỗi giai đoạn kết thúc đòi đúng loại quyết định của nó.
///
/// Trước bản vá, chỉ `REJECTED` có luật riêng. `WITHDRAWN` và `CANCELLED` là chuyển tiến và không phải
/// `REJECTED`, nên chúng rơi vào nhánh "bước tiến" và **bắt buộc mang `APPROVE` hoặc `WAIVE`** — muốn rút lui
/// một hồ sơ thì phải chọn "Chấp thuận".
///
/// Đây là lỗi **ghi vào dữ liệu**, không phải lỗi ở màn hình: bản ghi quyết định là chỉ-ghi-thêm, nên câu sai
/// đó ở lại trong dòng thời gian vĩnh viễn và không phân biệt được với một lần chấp thuận thật. Bộ test này
/// canh đúng ranh giới ấy — và nhóm bài **bị từ chối** quan trọng hơn nhóm được chấp nhận, vì chính đường
/// `APPROVE` là thứ hôm qua còn hợp lệ và phải thôi hợp lệ.
/// </summary>
public sealed class TerminalDecisionTypeTests
{
    private static CommercializationCase NewCase() => CommercializationCase.Create(
        "NT-2026-000042",
        new CreateCaseCommand(Tracks.ChallengePilot, "Case thử nghiệm", Guid.NewGuid(), Guid.NewGuid(), 1, "CONFIDENTIAL", Guid.NewGuid()),
        DateTimeOffset.UtcNow);

    private static DecisionRecord Go(CommercializationCase c, string toStage, string decision) =>
        c.Transition(toStage, decision, ["LY_DO"], "diễn giải", Guid.NewGuid(), null, DateTimeOffset.UtcNow);

    // ─── Đường đúng ───────────────────────────────────────────────────────────────────────────

    [Fact]
    public void Withdrawing_a_case_records_a_withdraw_decision()
    {
        var @case = NewCase();
        var record = Go(@case, Stages.Withdrawn, Decisions.Withdraw);

        @case.Stage.ShouldBe(Stages.Withdrawn);
        record.Decision.ShouldBe(Decisions.Withdraw);
        record.Decision.ShouldNotBe(Decisions.Approve, "dòng thời gian không được đọc thành một lần chấp thuận");
    }

    [Fact]
    public void Cancelling_a_case_records_a_cancel_decision()
    {
        var @case = NewCase();
        Go(@case, Stages.Qualification, Decisions.Approve);
        Go(@case, Stages.Matching, Decisions.Approve);
        Go(@case, Stages.DueDiligence, Decisions.Approve);
        Go(@case, Stages.DealDesign, Decisions.Approve);

        var record = Go(@case, Stages.Cancelled, Decisions.Cancel);

        @case.Stage.ShouldBe(Stages.Cancelled);
        record.Decision.ShouldBe(Decisions.Cancel);
    }

    // ─── Đường phải bị chặn: chính là đường hôm qua còn hợp lệ ─────────────────────────────────

    [Theory]
    [InlineData(Decisions.Approve)]
    [InlineData(Decisions.Waive)]
    [InlineData(Decisions.Reject)]
    [InlineData(Decisions.Cancel)]
    public void Withdrawing_with_any_other_decision_is_refused(string wrong)
    {
        var @case = NewCase();
        var ex = Should.Throw<UnprocessableException>(() => Go(@case, Stages.Withdrawn, wrong));

        ex.Code.ShouldBe("WITHDRAW_DECISION_REQUIRED");
        @case.Stage.ShouldBe(Stages.Discovery, "bị từ chối thì giai đoạn không được đổi");
    }

    [Theory]
    [InlineData(Decisions.Approve)]
    [InlineData(Decisions.Waive)]
    [InlineData(Decisions.Withdraw)]
    public void Cancelling_with_any_other_decision_is_refused(string wrong)
    {
        var @case = NewCase();
        Go(@case, Stages.Qualification, Decisions.Approve);
        Go(@case, Stages.Matching, Decisions.Approve);
        Go(@case, Stages.DueDiligence, Decisions.Approve);
        Go(@case, Stages.DealDesign, Decisions.Approve);

        var ex = Should.Throw<UnprocessableException>(() => Go(@case, Stages.Cancelled, wrong));

        ex.Code.ShouldBe("CANCEL_DECISION_REQUIRED");
        @case.Stage.ShouldBe(Stages.DealDesign);
    }

    [Fact]
    public void Rejecting_still_needs_a_reject_decision()
    {
        var @case = NewCase();
        Should.Throw<UnprocessableException>(() => Go(@case, Stages.Rejected, Decisions.Approve))
            .Code.ShouldBe("REJECT_DECISION_REQUIRED");
    }

    // ─── Luật cũ không được nới ra ────────────────────────────────────────────────────────────

    /// <summary>
    /// Thêm hai giá trị vào một kiểu liệt kê là cách dễ nhất để vô tình nới lỏng phần còn lại. Một bước tiến
    /// bình thường vẫn chỉ nhận `APPROVE` hoặc `WAIVE`; hai loại mới **không** dùng được ở đó.
    /// </summary>
    [Theory]
    [InlineData(Decisions.Withdraw)]
    [InlineData(Decisions.Cancel)]
    [InlineData(Decisions.Reject)]
    public void A_normal_forward_step_still_refuses_the_new_decision_types(string wrong)
    {
        var @case = NewCase();
        Should.Throw<UnprocessableException>(() => Go(@case, Stages.Qualification, wrong))
            .Code.ShouldBe("FORWARD_DECISION_REQUIRED");
    }

    [Theory]
    [InlineData(Decisions.Approve)]
    [InlineData(Decisions.Waive)]
    public void A_normal_forward_step_still_accepts_approve_and_waive(string ok)
    {
        var @case = NewCase();
        Go(@case, Stages.Qualification, ok);
        @case.Stage.ShouldBe(Stages.Qualification);
    }

    /// <summary>Bước lùi vẫn chỉ nhận `RETURN_FOR_REWORK`, không nhận hai loại mới.</summary>
    [Fact]
    public void A_backward_step_still_needs_return_for_rework()
    {
        var @case = NewCase();
        Go(@case, Stages.Qualification, Decisions.Approve);

        Should.Throw<UnprocessableException>(() => Go(@case, Stages.Discovery, Decisions.Withdraw))
            .Code.ShouldBe("REWORK_DECISION_REQUIRED");

        Go(@case, Stages.Discovery, Decisions.ReturnForRework);
        @case.Stage.ShouldBe(Stages.Discovery);
    }

    /// <summary>Bốn giai đoạn kết thúc, và ba trong số đó có loại quyết định bắt buộc riêng.</summary>
    [Fact]
    public void Every_terminal_stage_except_closed_has_its_own_required_decision()
    {
        Decisions.RequiredForStage[Stages.Rejected].ShouldBe(Decisions.Reject);
        Decisions.RequiredForStage[Stages.Withdrawn].ShouldBe(Decisions.Withdraw);
        Decisions.RequiredForStage[Stages.Cancelled].ShouldBe(Decisions.Cancel);

        // `CLOSED` là kết thúc BÌNH THƯỜNG của quy trình, nên nó đi qua nhánh bước tiến với `APPROVE`/`WAIVE`
        // — đó là chủ ý, không phải sót.
        Decisions.RequiredForStage.ContainsKey(Stages.Closed).ShouldBeFalse();
    }
}
