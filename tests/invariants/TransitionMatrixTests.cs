using NacenTech.Kernel.Domain;
using NacenTech.Modules.Case.Application;
using NacenTech.Modules.Case.Domain;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

/// <summary>
/// AC 34 và §7.4: ma trận transition có test phủ TOÀN BỘ ô hợp lệ và ô bị cấm.
/// Transition ngoài bảng bị từ chối bất kể quyền của actor — nên test chạy thẳng trên aggregate.
/// </summary>
public sealed class TransitionMatrixTests
{
    private static readonly Dictionary<string, string[]> Expected = new()
    {
        [Stages.Discovery] = [Stages.Qualification, Stages.Rejected, Stages.Withdrawn],
        [Stages.Qualification] = [Stages.Matching, Stages.Discovery, Stages.Rejected, Stages.Withdrawn],
        [Stages.Matching] = [Stages.DueDiligence, Stages.Qualification, Stages.Rejected, Stages.Withdrawn],
        [Stages.DueDiligence] = [Stages.DealDesign, Stages.Matching, Stages.Rejected, Stages.Withdrawn],
        [Stages.DealDesign] = [Stages.Execution, Stages.DueDiligence, Stages.Withdrawn, Stages.Cancelled],
        [Stages.Execution] = [Stages.OutcomeVerification, Stages.Cancelled],
        [Stages.OutcomeVerification] = [Stages.CommercializationMonitoring, Stages.Execution, Stages.Closed],
        [Stages.CommercializationMonitoring] = [Stages.Closed],
        [Stages.Closed] = [],
        [Stages.Rejected] = [],
        [Stages.Withdrawn] = [],
        [Stages.Cancelled] = [],
    };

    [Fact]
    public void Matrix_matches_specification_exactly()
    {
        foreach (var (from, to) in TransitionMatrix.AllPairs())
        {
            var allowed = Expected[from].Contains(to);
            TransitionMatrix.IsAllowed(from, to).ShouldBe(allowed, $"{from} → {to}");
        }
    }

    [Fact]
    public void Terminal_stages_have_no_outgoing_transition()
    {
        foreach (var terminal in Stages.Terminal)
        {
            foreach (var to in Stages.All.Where(s => s != terminal))
            {
                TransitionMatrix.IsAllowed(terminal, to).ShouldBeFalse($"{terminal} là terminal nhưng cho phép → {to}");
            }
        }
    }

    [Theory]
    [InlineData(Stages.Qualification, Stages.Discovery)]
    [InlineData(Stages.Matching, Stages.Qualification)]
    [InlineData(Stages.DueDiligence, Stages.Matching)]
    [InlineData(Stages.DealDesign, Stages.DueDiligence)]
    [InlineData(Stages.OutcomeVerification, Stages.Execution)]
    public void Backward_transitions_are_detected(string from, string to) => TransitionMatrix.IsBackward(from, to).ShouldBeTrue();

    [Fact]
    public void Forward_transition_is_not_backward()
        => TransitionMatrix.IsBackward(Stages.Discovery, Stages.Qualification).ShouldBeFalse();

    // ─── Hành vi aggregate ───────────────────────────────────────────────────────────────────

    [Fact]
    public void Transition_outside_matrix_is_rejected()
    {
        var @case = NewCase(withBroker: true);
        var ex = Should.Throw<UnprocessableException>(() =>
            @case.Transition(Stages.Execution, Decisions.Approve, [], "bỏ qua các stage giữa", Guid.NewGuid(), null, DateTimeOffset.UtcNow));
        ex.Code.ShouldBe("TRANSITION_NOT_ALLOWED");
    }

    /// <summary>CASE-01: không QUALIFIED khi thiếu lead broker.</summary>
    [Fact]
    public void Qualification_requires_lead_broker()
    {
        var @case = NewCase(withBroker: false);
        var ex = Should.Throw<UnprocessableException>(() =>
            @case.Transition(Stages.Qualification, Decisions.Approve, [], "đủ điều kiện", Guid.NewGuid(), null, DateTimeOffset.UtcNow));
        ex.Code.ShouldBe("CASE_01_LEAD_BROKER_REQUIRED");
    }

    [Fact]
    public void Backward_transition_requires_rework_decision()
    {
        var @case = NewCase(withBroker: true);
        @case.Transition(Stages.Qualification, Decisions.Approve, [], "ok", Guid.NewGuid(), null, DateTimeOffset.UtcNow);

        var ex = Should.Throw<UnprocessableException>(() =>
            @case.Transition(Stages.Discovery, Decisions.Approve, [], "quay lại", Guid.NewGuid(), null, DateTimeOffset.UtcNow));
        ex.Code.ShouldBe("REWORK_DECISION_REQUIRED");

        @case.Transition(Stages.Discovery, Decisions.ReturnForRework, ["MISSING_BUDGET"], "thiếu ngân sách", Guid.NewGuid(), null, DateTimeOffset.UtcNow);
        @case.Stage.ShouldBe(Stages.Discovery);
    }

    /// <summary>CASE-08: mọi transition tạo DecisionRecord; append-only nên số record chỉ tăng.</summary>
    [Fact]
    public void Every_transition_creates_a_decision_record()
    {
        var @case = NewCase(withBroker: true);
        @case.Decisions.Count.ShouldBe(0);

        @case.Transition(Stages.Qualification, Decisions.Approve, [], "ok", Guid.NewGuid(), null, DateTimeOffset.UtcNow);
        @case.Transition(Stages.Matching, Decisions.Approve, [], "ok", Guid.NewGuid(), null, DateTimeOffset.UtcNow);

        @case.Decisions.Count.ShouldBe(2);
        @case.Decisions[0].FromStage.ShouldBe(Stages.Discovery);
        @case.Decisions[0].ToStage.ShouldBe(Stages.Qualification);
        @case.Decisions[1].ToStage.ShouldBe(Stages.Matching);
    }

    /// <summary>CASE-13: hold mở chặn cả transition hợp lệ theo bảng.</summary>
    [Fact]
    public void Open_hold_blocks_transition()
    {
        var @case = NewCase(withBroker: true);
        @case.OpenHold("REASSIGNMENT_REQUIRED", null, DateTimeOffset.UtcNow);

        var ex = Should.Throw<UnprocessableException>(() =>
            @case.Transition(Stages.Qualification, Decisions.Approve, [], "ok", Guid.NewGuid(), null, DateTimeOffset.UtcNow));
        ex.Code.ShouldBe("CASE_ON_HOLD");

        var hold = @case.Holds[0];
        @case.ReleaseHold(hold.Id, "đã bổ nhiệm broker mới", Guid.NewGuid(), DateTimeOffset.UtcNow);
        @case.Transition(Stages.Qualification, Decisions.Approve, [], "ok", Guid.NewGuid(), null, DateTimeOffset.UtcNow);
        @case.Stage.ShouldBe(Stages.Qualification);
    }

    /// <summary>CASE-14: policySnapshotId bất biến.</summary>
    [Fact]
    public void Policy_snapshot_is_immutable()
    {
        var @case = NewCase(withBroker: true);
        @case.SetPolicySnapshot(Guid.NewGuid());
        Should.Throw<InvalidOperationException>(() => @case.SetPolicySnapshot(Guid.NewGuid()));
    }

    [Fact]
    public void Rejected_requires_reject_decision()
    {
        var @case = NewCase(withBroker: true);
        var ex = Should.Throw<UnprocessableException>(() =>
            @case.Transition(Stages.Rejected, Decisions.Approve, [], "loại", Guid.NewGuid(), null, DateTimeOffset.UtcNow));
        ex.Code.ShouldBe("REJECT_DECISION_REQUIRED");
    }

    [Fact]
    public void Rationale_is_required()
    {
        var @case = NewCase(withBroker: true);
        Should.Throw<ValidationException>(() =>
            @case.Transition(Stages.Qualification, Decisions.Approve, [], "  ", Guid.NewGuid(), null, DateTimeOffset.UtcNow));
    }

    private static CommercializationCase NewCase(bool withBroker) => CommercializationCase.Create(
        "NT-2026-000001",
        new CreateCaseCommand(Tracks.ChallengePilot, "Case thử nghiệm", Guid.NewGuid(), Guid.NewGuid(), 1, "CONFIDENTIAL",
            withBroker ? Guid.NewGuid() : null),
        DateTimeOffset.UtcNow);
}
