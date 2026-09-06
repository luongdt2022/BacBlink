using NacenTech.Kernel.Domain;
using NacenTech.Modules.Case.Application;
using NacenTech.PolicyEngine;

// `Decisions` (hằng số) trùng tên với navigation `Decisions` của aggregate — dùng alias cho rõ.
using CaseDecisions = NacenTech.Modules.Case.Application.Decisions;

namespace NacenTech.Modules.Case.Domain;

/// <summary>
/// §5.1 aggregate root. Stage CHỈ được đổi trong `Transition` (CASE-08, §7.5: không có đường ghi stage nào khác,
/// kể cả job nội bộ). Mọi transition tạo `DecisionRecord` append-only.
/// </summary>
public sealed class CommercializationCase : AggregateRoot
{
    private readonly List<CaseParty> _parties = [];
    private readonly List<CaseHold> _holds = [];
    private readonly List<DecisionRecord> _decisions = [];

    private CommercializationCase() { }

    private CommercializationCase(string caseCode, string track, string title, Guid problemOwnerPersonId,
        Guid demandBriefId, int demandBriefVersionNo, string confidentialityLevel)
    {
        CaseCode = caseCode;
        Track = track;
        Stage = Stages.Discovery;
        Title = title;
        ProblemOwnerPersonId = problemOwnerPersonId;
        DemandBriefId = demandBriefId;
        DemandBriefVersionNo = demandBriefVersionNo;
        ConfidentialityLevel = confidentialityLevel;
        BudgetPathStatus = BudgetPathStatuses.Unknown;
        FundingInstrument = FundingInstruments.Undetermined;
    }

    public string CaseCode { get; private set; } = string.Empty;
    public string Track { get; private set; } = string.Empty;
    public string Stage { get; private set; } = Stages.Discovery;
    public string Title { get; private set; } = string.Empty;
    public Guid ProblemOwnerPersonId { get; private set; }
    public Guid? LeadBrokerPersonId { get; private set; }
    public Guid DemandBriefId { get; private set; }
    public int DemandBriefVersionNo { get; private set; }
    public Guid? PolicySnapshotId { get; private set; }
    public string ConfidentialityLevel { get; private set; } = "CONFIDENTIAL";

    /// <summary>
    /// *Ai trả tiền.* Khác <see cref="FundingInstrument"/> (*dưới công cụ pháp lý nào*) — B-48 ghi lại việc trường
    /// này hiện chưa có đường ghi nào; ADR-0014 tách hai câu hỏi ra chứ không sửa trường này.
    /// </summary>
    public string BudgetPathStatus { get; private set; } = BudgetPathStatuses.Unknown;

    /// <summary>ADR-0014: công cụ pháp lý mà tiền của hồ sơ đi vào. Xem <see cref="FundingInstruments"/>.</summary>
    public string FundingInstrument { get; private set; } = FundingInstruments.Undetermined;

    /// <summary>Tham chiếu văn bản thật cho công cụ đã khai. Bắt buộc với mọi công cụ trừ `PRIVATE`.</summary>
    public string? LegalFormRef { get; private set; }

    /// <summary>
    /// Kết luận đã **đóng băng** cùng ảnh chụp chính sách: hồ sơ này có được thực thi ngay trên nền tảng không.
    /// `null` = chưa chốt, và chưa chốt nghĩa là **không được** — default DENY, không phải "cho qua vì chưa biết".
    ///
    /// Đây là bản sao dẫn xuất của thứ đã nằm trong ảnh chụp. Nó tồn tại để aggregate tự đủ: `Transition` chạy
    /// cho cả ETL và job, những đường không có ảnh chụp để tra. Không lệch được vì hai giá trị ghi trong cùng
    /// <see cref="FreezeFundingPath"/>, ảnh chụp bất biến, và supersede ảnh chụp đã đòi `DecisionRecord` riêng.
    /// </summary>
    public bool? ExecutionInPlatformPermitted { get; private set; }

    public DateTimeOffset? TargetDecisionAt { get; private set; }

    public IReadOnlyList<CaseParty> Parties => _parties;
    public IReadOnlyList<CaseHold> Holds => _holds;
    public IReadOnlyList<DecisionRecord> Decisions => _decisions;

    public bool HasOpenHold => _holds.Any(h => h.ReleasedAt is null);

    public static CommercializationCase Create(string caseCode, CreateCaseCommand command, DateTimeOffset now)
    {
        if (!Tracks.All.Contains(command.Track)) throw new ValidationException($"track không hợp lệ: {command.Track}");
        if (string.IsNullOrWhiteSpace(command.Title)) throw new ValidationException("title should not be empty");

        var @case = new CommercializationCase(caseCode, command.Track, command.Title, command.ProblemOwnerPersonId,
            command.DemandBriefId, command.DemandBriefVersionNo, command.ConfidentialityLevel);
        if (command.FundingInstrument is { } instrument)
            @case.DeclareFundingPath(instrument, command.LegalFormRef);
        @case._parties.Add(new CaseParty(@case.Id, command.ProblemOwnerPersonId, CaseRoles.ProblemOwner, now));
        if (command.LeadBrokerPersonId is { } broker)
        {
            @case.LeadBrokerPersonId = broker;
            @case._parties.Add(new CaseParty(@case.Id, broker, CaseRoles.LeadBroker, now));
        }
        return @case;
    }

    /// <summary>
    /// ADR-0014: khai công cụ tài chính và tham chiếu văn bản. Chỉ khai được **trước khi chốt** ảnh chụp chính
    /// sách — sau đó kết luận đường thực thi đã đóng băng, và đổi công cụ mà không đổi kết luận sẽ tạo ra một hồ
    /// sơ nói một đằng chạy một nẻo. Đổi công cụ giữa vòng đời là câu hỏi còn mở của ADR, không phải lỗ hổng.
    /// </summary>
    public void DeclareFundingPath(string instrument, string? legalFormRef)
    {
        if (!FundingInstruments.All.Contains(instrument))
            throw new ValidationException($"fundingInstrument không hợp lệ: {instrument}");
        if (PolicySnapshotId is not null)
            throw new InvalidOperationException("ADR-0014: đường tài chính đã đóng băng cùng ảnh chụp chính sách");

        var trimmed = string.IsNullOrWhiteSpace(legalFormRef) ? null : legalFormRef.Trim();
        if (FundingInstruments.RequiresLegalFormRef(instrument) && trimmed is null)
            throw new ValidationException($"Công cụ {instrument} phải kèm legalFormRef trỏ tới văn bản áp dụng");

        FundingInstrument = instrument;
        LegalFormRef = trimmed;
        Touch();
    }

    /// <summary>
    /// Cổng `BUDGET_PATH` mà ảnh chụp chính sách đã khai từ đầu (§9.3) nhưng chưa bao giờ có gì để đọc — B-48.
    ///
    /// Tách khỏi <see cref="Transition"/> vì tầng dịch vụ phải hỏi được **trước** khi chốt ảnh chụp: lệnh chốt
    /// tự commit, nên một hồ sơ trượt cổng này sau đó sẽ để lại một ảnh chụp mồ côi. Một cài đặt, hai chỗ gọi —
    /// không phải hai phép kiểm chép tay rồi lệch nhau.
    /// </summary>
    public void EnsureFundingPathDeclared()
    {
        // Hỏi "có phải một công cụ đã khai không", **không** hỏi "có khác UNDETERMINED không". Hai câu chỉ trùng
        // nhau khi mọi giá trị trong cơ sở dữ liệu đều nằm trong từ vựng — và một cột thêm bằng migration với
        // giá trị mặc định sai sẽ phá đúng giả định đó, im lặng, cho toàn bộ hồ sơ cũ.
        if (FundingInstrument == FundingInstruments.Undetermined || !FundingInstruments.All.Contains(FundingInstrument))
            throw new UnprocessableException(
                "Hồ sơ phải khai công cụ tài chính trước khi vào QUALIFICATION", "FUNDING_INSTRUMENT_REQUIRED");

        if (FundingInstruments.RequiresLegalFormRef(FundingInstrument) && string.IsNullOrWhiteSpace(LegalFormRef))
            throw new UnprocessableException(
                $"Công cụ {FundingInstrument} phải kèm legalFormRef trỏ tới văn bản áp dụng", "FUNDING_INSTRUMENT_REQUIRED");
    }

    /// <summary>
    /// CASE-14: snapshot bất biến; đổi phải qua DecisionRecord riêng, không ghi đè ở đây. ADR-0014 gắn thêm kết
    /// luận đường thực thi vào **cùng một phương thức** — hai giá trị không tách được, nên không có đường nào
    /// chốt ảnh chụp mà quên chốt kết luận.
    /// </summary>
    public void FreezeFundingPath(Guid snapshotId, bool executionInPlatformPermitted)
    {
        if (PolicySnapshotId is not null)
            throw new InvalidOperationException("CASE-14: policySnapshotId đã được gán và là bất biến");
        PolicySnapshotId = snapshotId;
        ExecutionInPlatformPermitted = executionInPlatformPermitted;
        Touch();
    }

    public DecisionRecord Transition(string toStage, string decision, IReadOnlyList<string> reasonCodes, string rationale,
        Guid decidedByActorRef, string? mandateRef, DateTimeOffset now)
    {
        if (string.IsNullOrWhiteSpace(rationale)) throw new ValidationException("rationale should not be empty");

        // CASE-13/§7.4: hold mở chặn mọi transition, kể cả transition hợp lệ theo bảng.
        if (HasOpenHold)
            throw new UnprocessableException("Case đang có hold mở; không transition được", "CASE_ON_HOLD");

        if (!TransitionMatrix.IsAllowed(Stage, toStage))
            throw new UnprocessableException($"Transition {Stage} → {toStage} không có trong ma trận §7.4", "TRANSITION_NOT_ALLOWED");

        var backward = TransitionMatrix.IsBackward(Stage, toStage);
        if (backward && decision != CaseDecisions.ReturnForRework)
            throw new UnprocessableException("Transition lùi phải là RETURN_FOR_REWORK", "REWORK_DECISION_REQUIRED");

        // ADR-0008: mỗi giai đoạn kết thúc đòi đúng loại quyết định của nó. Trước đây chỉ REJECTED có luật
        // riêng, nên WITHDRAWN và CANCELLED rơi vào nhánh "bước tiến" và bắt buộc mang APPROVE hoặc WAIVE —
        // tức là muốn rút lui một hồ sơ thì phải chọn "Chấp thuận". Bản ghi quyết định là dữ liệu chỉ-ghi-thêm,
        // nên đó là một câu sai được đóng đinh vào dòng thời gian, không phải một nhãn sai ở màn hình.
        if (CaseDecisions.RequiredForStage.TryGetValue(toStage, out var required) && decision != required)
        {
            throw new UnprocessableException(
                $"Chuyển sang {toStage} phải kèm decision {required}",
                $"{required}_DECISION_REQUIRED");
        }

        // Nhánh mặc định cho mọi bước tiến còn lại. Loại trừ đúng những đích đã có luật riêng ở trên — thêm
        // hai giá trị vào bộ loại quyết định là cách dễ nhất để vô tình nới lỏng chính nhánh này.
        if (!backward && !CaseDecisions.RequiredForStage.ContainsKey(toStage)
            && decision is not (CaseDecisions.Approve or CaseDecisions.Waive))
        {
            throw new UnprocessableException("Transition tiến phải là APPROVE hoặc WAIVE", "FORWARD_DECISION_REQUIRED");
        }

        // ADR-0013: "đã bàn giao cho quy trình có thẩm quyền" mà không nói được bàn giao cho quy trình nào thì
        // là một lời khai không kiểm chứng được — và nó nằm vĩnh viễn trong dữ liệu chỉ-ghi-thêm. Tham chiếu là
        // bắt buộc, và nó phải là điều kiện của aggregate chứ không phải của biểu mẫu: ETL, job và mọi cửa API
        // khác đều đi qua đây.
        if (decision == CaseDecisions.HandoverToAuthority && string.IsNullOrWhiteSpace(mandateRef))
        {
            throw new UnprocessableException(
                "Bàn giao phải kèm mandateRef trỏ tới quy trình nhận bàn giao",
                "HANDOVER_REFERENCE_REQUIRED");
        }

        // CASE-01: qualified case phải có lead broker (và problem owner, demand version — đã có từ Create).
        if (toStage == Stages.Qualification && LeadBrokerPersonId is null)
            throw new UnprocessableException("CASE-01: cần lead broker trước QUALIFICATION", "CASE_01_LEAD_BROKER_REQUIRED");

        // ADR-0014: cổng `BUDGET_PATH` mà ảnh chụp chính sách đã khai từ đầu, nay có thứ để đọc. Phải trả lời
        // được **tại đây** vì kết luận đường thực thi đóng băng ngay ở bước này và bất biến về sau.
        if (toStage == Stages.Qualification) EnsureFundingPathDeclared();

        // ADR-0014: `EXECUTION` chỉ là đích hợp pháp khi công cụ tài chính cho phép chọn bên cung ứng và thực
        // thi ngay trên nền tảng. Bị chặn ở đây **không** nghĩa là hồ sơ hỏng: với vốn mua sắm công thì đây đúng
        // là chỗ hồ sơ phải rời nền tảng, và lối ra thành công của nó là `HANDED_OVER` (ADR-0013) — nên thông
        // điệp phải nói tên lối ra đó, không chỉ từ chối.
        if (toStage == Stages.Execution && ExecutionInPlatformPermitted != true)
            throw new UnprocessableException(
                $"Công cụ tài chính {FundingInstrument} không cho phép thực thi trên nền tảng; lối ra đúng là {Stages.HandedOver}",
                "EXECUTION_PATH_NOT_LAWFUL");

        var record = new DecisionRecord(Id, Stage, toStage, decision, reasonCodes, rationale, decidedByActorRef, mandateRef, PolicySnapshotId, now);
        _decisions.Add(record);
        Stage = toStage;
        Touch();
        return record;
    }

    public void AssignLeadBroker(Guid brokerPersonId, DateTimeOffset now)
    {
        foreach (var party in _parties.Where(p => p.Role == CaseRoles.LeadBroker && p.Until is null)) party.End(now);
        _parties.Add(new CaseParty(Id, brokerPersonId, CaseRoles.LeadBroker, now));
        LeadBrokerPersonId = brokerPersonId;
        Touch();
    }

    public CaseHold OpenHold(string reason, Guid? actorRef, DateTimeOffset now)
    {
        var hold = new CaseHold(Id, reason, actorRef, now);
        _holds.Add(hold);
        Touch();
        return hold;
    }

    public DecisionRecord ReleaseHold(Guid holdId, string rationale, Guid decidedByActorRef, DateTimeOffset now)
    {
        var hold = _holds.FirstOrDefault(h => h.Id == holdId && h.ReleasedAt is null)
                   ?? throw new NotFoundException($"Hold {holdId} không tồn tại hoặc đã được gỡ");
        // Gỡ hold là một quyết định có người chịu trách nhiệm (CASE-13), nên vẫn tạo DecisionRecord.
        var record = new DecisionRecord(Id, Stage, Stage, CaseDecisions.Waive, ["HOLD_RELEASED"], rationale, decidedByActorRef, null, PolicySnapshotId, now);
        _decisions.Add(record);
        hold.Release(record.Id, now);
        Touch();
        return record;
    }

    /// <summary>
    /// Vai trò **đầu tiên** đang hoạt động — giữ cho chỗ gọi cũ và cho hiển thị. KHÔNG dùng để kiểm quyền:
    /// người giữ hai vai trò sẽ bị chấm theo vai đầu tiên theo thứ tự chèn (B-42). Dùng <see cref="RolesOf"/>.
    /// </summary>
    public string? RoleOf(Guid personId) => RolesOf(personId).FirstOrDefault();

    /// <summary>
    /// **Mọi** vai trò đang hoạt động của một người trong hồ sơ. Chủ bài toán được thêm lúc tạo; môi giới
    /// chính thêm sau; một người có thể là cả hai — và với kiểm quyền, câu hỏi đúng là "có vai trò nào cho
    /// phép không", không phải "vai trò đầu tiên có cho phép không".
    /// </summary>
    public IReadOnlyList<string> RolesOf(Guid personId)
        => _parties.Where(p => p.PersonId == personId && p.Until is null).Select(p => p.Role).Distinct().ToList();
}

public sealed class CaseParty : Entity
{
    private CaseParty() { }

    public CaseParty(Guid caseId, Guid personId, string role, DateTimeOffset since)
    {
        CaseId = caseId;
        PersonId = personId;
        Role = role;
        Since = since;
    }

    public Guid CaseId { get; private set; }
    public Guid PersonId { get; private set; }
    public string Role { get; private set; } = string.Empty;
    public DateTimeOffset Since { get; private set; }
    public DateTimeOffset? Until { get; private set; }

    public void End(DateTimeOffset now) => Until = now;
}

/// <summary>§10.6/CASE-13: case thiếu owner bắt buộc mang hold; stage giữ nguyên và mọi gate bị chặn.</summary>
public sealed class CaseHold : Entity
{
    private CaseHold() { }

    public CaseHold(Guid caseId, string reason, Guid? openedByActorRef, DateTimeOffset openedAt)
    {
        CaseId = caseId;
        Reason = reason;
        OpenedByActorRef = openedByActorRef;
        OpenedAt = openedAt;
    }

    public Guid CaseId { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public Guid? OpenedByActorRef { get; private set; }
    public DateTimeOffset OpenedAt { get; private set; }
    public DateTimeOffset? ReleasedAt { get; private set; }
    public Guid? ReleaseDecisionRecordId { get; private set; }

    public void Release(Guid decisionRecordId, DateTimeOffset now)
    {
        ReleasedAt = now;
        ReleaseDecisionRecordId = decisionRecordId;
    }
}

/// <summary>§7.2: append-only. Không update; quyết định mới supersede quyết định cũ bằng reference.</summary>
public sealed class DecisionRecord : Entity
{
    private DecisionRecord() { }

    public DecisionRecord(Guid caseId, string fromStage, string toStage, string decision, IReadOnlyList<string> reasonCodes,
        string rationale, Guid decidedByActorRef, string? mandateRef, Guid? policySnapshotId, DateTimeOffset decidedAt)
    {
        CaseId = caseId;
        FromStage = fromStage;
        ToStage = toStage;
        Decision = decision;
        ReasonCodes = reasonCodes.ToArray();
        Rationale = rationale;
        DecidedByActorRef = decidedByActorRef;
        MandateRef = mandateRef;
        PolicySnapshotId = policySnapshotId;
        DecidedAt = decidedAt;
    }

    public Guid CaseId { get; private set; }
    public string FromStage { get; private set; } = string.Empty;
    public string ToStage { get; private set; } = string.Empty;
    public string Decision { get; private set; } = string.Empty;
    public string[] ReasonCodes { get; private set; } = [];
    public string Rationale { get; private set; } = string.Empty;
    public Guid DecidedByActorRef { get; private set; }
    public string? MandateRef { get; private set; }
    public string[] EvidenceRefs { get; private set; } = [];
    public Guid? PolicySnapshotId { get; private set; }
    public DateTimeOffset DecidedAt { get; private set; }
    public Guid? SupersedesId { get; private set; }
    public string? SignatureRef { get; private set; }
}
