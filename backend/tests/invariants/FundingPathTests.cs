using NacenTech.Kernel.Domain;
using NacenTech.Modules.Case.Application;
using NacenTech.Modules.Case.Domain;
using NacenTech.PolicyEngine;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

/// <summary>
/// ADR-0014 — công cụ tài chính quyết định lối ra hợp pháp.
///
/// Các bài ở đây chạy thẳng trên aggregate vì đó là chỗ ADR đặt phép kiểm, và lý do đặt ở đó là ETL, job và mọi
/// cửa API đều đi qua nó. Một bài chỉ đo qua HTTP sẽ xanh ngay cả khi luật chỉ nằm ở biểu mẫu.
/// </summary>
public sealed class FundingPathTests
{
    private static CommercializationCase NewCase(string? instrument, string? legalFormRef = null)
        => CommercializationCase.Create(
            "NT-2026-000777",
            new CreateCaseCommand(Tracks.ChallengePilot, "Case thử nghiệm", Guid.NewGuid(), Guid.NewGuid(), 1,
                "CONFIDENTIAL", Guid.NewGuid(), instrument, legalFormRef),
            DateTimeOffset.UtcNow);

    private static void Go(CommercializationCase c, string toStage, string decision = Decisions.Approve)
        => c.Transition(toStage, decision, [], "diễn giải", Guid.NewGuid(), null, DateTimeOffset.UtcNow);

    /// <summary>
    /// Cổng `BUDGET_PATH` mà ảnh chụp chính sách đã khai từ đầu (§9.3) nhưng chưa bao giờ có gì để đọc — B-48.
    /// </summary>
    [Fact]
    public void Qualification_requires_a_funding_instrument()
    {
        var undeclared = NewCase(instrument: null);
        undeclared.FundingInstrument.ShouldBe(FundingInstruments.Undetermined);

        Should.Throw<UnprocessableException>(() => Go(undeclared, Stages.Qualification))
            .Code.ShouldBe("FUNDING_INSTRUMENT_REQUIRED");
        undeclared.Stage.ShouldBe(Stages.Discovery, "bị chặn thì giai đoạn không được đổi");

        // Khai rồi thì đi được — cùng hồ sơ, chỉ thêm một sự kiện.
        undeclared.DeclareFundingPath(FundingInstruments.Private, null);
        Go(undeclared, Stages.Qualification);
        undeclared.Stage.ShouldBe(Stages.Qualification);
    }

    /// <summary>
    /// `PRIVATE` là công cụ duy nhất không cần tham chiếu văn bản. Mọi công cụ còn lại phát sinh từ một quyết
    /// định hoặc hợp đồng, và "chạy bằng ngân sách" mà không nói được theo văn bản nào là lời khai không kiểm
    /// chứng được — cùng luật với `mandateRef` của ADR-0013.
    /// </summary>
    [Fact]
    public void Public_instruments_require_a_legal_form_reference()
    {
        Should.Throw<ValidationException>(() => NewCase(FundingInstruments.RndTask));
        Should.Throw<ValidationException>(() => NewCase(FundingInstruments.Grant, "   "));

        var declared = NewCase(FundingInstruments.RndTask, "QD-1234/QD-BKHCN");
        declared.LegalFormRef.ShouldBe("QD-1234/QD-BKHCN");
    }

    [Fact]
    public void An_unknown_instrument_is_rejected()
        => Should.Throw<ValidationException>(() => NewCase("QUY_NAO_DO"));

    /// <summary>
    /// Cổng hỏi "có phải công cụ đã khai không", không hỏi "có khác `UNDETERMINED` không". Khác biệt chỉ lộ ra
    /// với dữ liệu **không đi qua hàm dựng** — hồ sơ đọc lên từ cột mà migration điền sai giá trị mặc định. EF
    /// sinh `defaultValue: ""` nếu không sửa, và chuỗi rỗng khác `UNDETERMINED`, nên nó sẽ lọt.
    /// </summary>
    [Fact]
    public void An_out_of_vocabulary_value_does_not_pass_the_gate()
    {
        var @case = NewCase(FundingInstruments.Private);
        Set(@case, nameof(CommercializationCase.FundingInstrument), string.Empty);
        // Đặt luôn `LegalFormRef`: nếu để trống thì phép kiểm **thứ hai** sẽ ném cùng một mã lỗi, và bài này sẽ
        // xanh ngay cả khi phép kiểm từ vựng bị gỡ — tức là nó không canh thứ nó nói mình canh.
        Set(@case, nameof(CommercializationCase.LegalFormRef), "VB/BAT-KY");

        Should.Throw<UnprocessableException>(() => @case.EnsureFundingPathDeclared())
            .Code.ShouldBe("FUNDING_INSTRUMENT_REQUIRED");
    }

    /// <summary>
    /// Hồ sơ mua sắm công bị chặn ở `EXECUTION`, và thông điệp phải **nói tên lối ra đúng**. Bị chặn ở đây không
    /// nghĩa là hồ sơ hỏng: đó đúng là chỗ nó phải rời nền tảng, và `HANDED_OVER` là lối ra thành công (ADR-0013).
    /// </summary>
    [Fact]
    public void Procurement_cannot_reach_execution()
    {
        var @case = AtDealDesign(FundingInstruments.PublicProcurement, "LUAT-DAU-THAU-2023/DIEU-50",
            executionPermitted: false);

        var ex = Should.Throw<UnprocessableException>(() => Go(@case, Stages.Execution));
        ex.Code.ShouldBe("EXECUTION_PATH_NOT_LAWFUL");
        ex.Message.ShouldContain(Stages.HandedOver);
        @case.Stage.ShouldBe(Stages.DealDesign);

        // Cùng hồ sơ đó đi được lối ra đúng.
        var record = @case.Transition(Stages.HandedOver, Decisions.HandoverToAuthority, ["PUBLIC_PROCUREMENT_ROUTE"],
            "chọn nhà thầu chạy ở quy trình chính thức", Guid.NewGuid(), "HTMDTQG/IB-2026-0007", DateTimeOffset.UtcNow);

        @case.Stage.ShouldBe(Stages.HandedOver);
        record.MandateRef.ShouldBe("HTMDTQG/IB-2026-0007");
    }

    /// <summary>Công cụ cho phép thì đường cũ chạy nguyên vẹn — cổng chỉ chặn đúng cái nó phải chặn.</summary>
    [Fact]
    public void A_permitted_instrument_reaches_execution()
    {
        var @case = AtDealDesign(FundingInstruments.Private, null, executionPermitted: true);
        Go(@case, Stages.Execution);
        @case.Stage.ShouldBe(Stages.Execution);
    }

    /// <summary>
    /// Chưa chốt ảnh chụp thì kết luận là `null`, và `null` nghĩa là **không được** — default DENY (§23.2/D2-21),
    /// không phải "cho qua vì chưa biết". Đây là ca mà một hồ sơ nhập từ hệ cũ sẽ rơi vào.
    /// </summary>
    [Fact]
    public void Execution_requires_a_frozen_lawful_path()
    {
        var @case = NewCase(FundingInstruments.Private);
        var actor = Guid.NewGuid();
        // Đi tới DEAL_DESIGN mà **không** chốt đường tài chính — mô phỏng hồ sơ chưa qua tầng dịch vụ.
        foreach (var stage in new[] { Stages.Qualification, Stages.Matching, Stages.DueDiligence, Stages.DealDesign })
            @case.Transition(stage, Decisions.Approve, [], "ok", actor, null, DateTimeOffset.UtcNow);

        @case.ExecutionInPlatformPermitted.ShouldBeNull();
        Should.Throw<UnprocessableException>(() => Go(@case, Stages.Execution))
            .Code.ShouldBe("EXECUTION_PATH_NOT_LAWFUL");
    }

    /// <summary>
    /// Đóng băng nghĩa là đóng băng: sau khi chốt, khai lại công cụ bị từ chối. Cho phép đổi mà không đổi kết
    /// luận sẽ tạo ra một hồ sơ nói một đằng chạy một nẻo, và ảnh chụp là dữ liệu bất biến (CASE-14).
    /// </summary>
    [Fact]
    public void Frozen_funding_path_cannot_be_redeclared()
    {
        var @case = NewCase(FundingInstruments.Private);
        @case.FreezeFundingPath(Guid.NewGuid(), executionInPlatformPermitted: true);

        Should.Throw<InvalidOperationException>(
            () => @case.DeclareFundingPath(FundingInstruments.PublicProcurement, "LUAT-DAU-THAU-2023/DIEU-50"));

        @case.FundingInstrument.ShouldBe(FundingInstruments.Private);
        @case.ExecutionInPlatformPermitted.ShouldBe(true);
    }

    // ─── Tập luật có phiên bản ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Dòng thiếu căn cứ pháp lý **không nạp được**, và đó là toàn bộ điểm của thiết kế: đội không ship được một
    /// khẳng định pháp lý mà chưa ai ký. Hỏng lúc nạp, không phải một mặc định im lặng.
    /// </summary>
    [Fact]
    public void Funding_rule_without_legal_basis_fails_to_load()
    {
        const string json = """
        { "version": "test-v1", "effectiveFrom": "2026-09-06T00:00:00Z",
          "rules": [ { "instrument": "RND_TASK", "executionInPlatformPermitted": true } ] }
        """;

        Should.Throw<InvalidOperationException>(() => FundingPolicyLoader.FromJson(json))
            .Message.ShouldContain("legalBasisRef");
    }

    [Fact]
    public void An_instrument_outside_the_vocabulary_fails_to_load()
    {
        const string json = """
        { "version": "test-v1", "effectiveFrom": "2026-09-06T00:00:00Z",
          "rules": [ { "instrument": "QUY_NAO_DO", "executionInPlatformPermitted": true, "legalBasisRef": "X" } ] }
        """;

        Should.Throw<InvalidOperationException>(() => FundingPolicyLoader.FromJson(json));
    }

    /// <summary>Công cụ không có dòng nào thì không được phép — không cần dòng `Deny` để nói điều đó.</summary>
    [Fact]
    public void An_instrument_without_a_rule_is_denied()
    {
        var set = FundingPolicyLoader.FromJson("""
        { "version": "test-v1", "effectiveFrom": "2026-09-06T00:00:00Z",
          "rules": [ { "instrument": "PRIVATE", "executionInPlatformPermitted": true, "legalBasisRef": "X" } ] }
        """);

        set.IsExecutionInPlatformPermitted(FundingInstruments.Private).ShouldBeTrue();
        set.IsExecutionInPlatformPermitted(FundingInstruments.RndTask).ShouldBeFalse();
        set.IsExecutionInPlatformPermitted(FundingInstruments.Undetermined).ShouldBeFalse();
        set.Find(FundingInstruments.RndTask).ShouldBeNull();
    }

    /// <summary>Tập luật đang phát hành phải nạp được — nếu không, máy chủ không khởi động.</summary>
    [Fact]
    public void The_shipped_rule_set_loads_and_keeps_procurement_closed()
    {
        var set = FundingPolicyLoader.FromFile(ShippedRuleSetPath());

        set.IsExecutionInPlatformPermitted(FundingInstruments.Private).ShouldBeTrue();
        set.IsExecutionInPlatformPermitted(FundingInstruments.PublicProcurement).ShouldBeFalse();
        set.Find(FundingInstruments.PublicProcurement)!.LegalBasisRef.ShouldBe("LUAT-DAU-THAU-2023/DIEU-50");

        // Năm công cụ còn lại xuất xưởng **không có dòng nào**, chờ legal memo. Bài này canh đúng điều đó:
        // ai thêm dòng cho chúng phải sửa bài test và nhìn thấy mình đang khẳng định một kết luận pháp lý.
        foreach (var pending in new[]
                 {
                     FundingInstruments.RndTask, FundingInstruments.Grant,
                     FundingInstruments.CoFundedProgram, FundingInstruments.RegulatorySandbox,
                 })
        {
            set.Find(pending).ShouldBeNull($"{pending} chưa có legal memo — xem Câu hỏi còn mở của ADR-0014");
        }
    }

    private static void Set(CommercializationCase @case, string property, string? value)
        => typeof(CommercializationCase).GetProperty(property)!.GetSetMethod(nonPublic: true)!.Invoke(@case, [value]);

    /// <summary>Đi lên từ thư mục chạy tới gốc kho — bộ test này không tham chiếu `NacenTech.Persistence`.</summary>
    private static string ShippedRuleSetPath()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null)
        {
            var candidate = Path.Combine(dir.FullName, "config", "policies", "funding-instruments.v1.json");
            if (File.Exists(candidate)) return candidate;
            dir = dir.Parent;
        }
        throw new FileNotFoundException("Không tìm thấy config/policies/funding-instruments.v1.json");
    }

    private static CommercializationCase AtDealDesign(string instrument, string? legalFormRef, bool executionPermitted)
    {
        var @case = NewCase(instrument, legalFormRef);
        // Tầng dịch vụ chốt đường tài chính ngay trước khi vào QUALIFICATION; ở đây làm cùng thứ tự đó.
        @case.FreezeFundingPath(Guid.NewGuid(), executionPermitted);

        var actor = Guid.NewGuid();
        foreach (var stage in new[] { Stages.Qualification, Stages.Matching, Stages.DueDiligence, Stages.DealDesign })
            @case.Transition(stage, Decisions.Approve, [], "ok", actor, null, DateTimeOffset.UtcNow);

        return @case;
    }
}
