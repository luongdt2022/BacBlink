using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Case.Application;

/// <summary>CommercializationCase §5, stage-gate §7. Đây là lõi V2; Phase 1 chỉ dùng cho concierge.</summary>
public static class Tracks
{
    public const string ChallengePilot = "CHALLENGE_PILOT";
    public const string TechnologyTransfer = "TECHNOLOGY_TRANSFER";
    public const string SharedInfrastructure = "SHARED_INFRASTRUCTURE";
    public static readonly IReadOnlySet<string> All = new HashSet<string> { ChallengePilot, TechnologyTransfer, SharedInfrastructure };
}

public static class Stages
{
    public const string Discovery = "DISCOVERY";
    public const string Qualification = "QUALIFICATION";
    public const string Matching = "MATCHING";
    public const string DueDiligence = "DUE_DILIGENCE";
    public const string DealDesign = "DEAL_DESIGN";
    public const string Execution = "EXECUTION";
    public const string OutcomeVerification = "OUTCOME_VERIFICATION";
    public const string CommercializationMonitoring = "COMMERCIALIZATION_MONITORING";
    public const string Closed = "CLOSED";
    public const string Rejected = "REJECTED";
    public const string Withdrawn = "WITHDRAWN";
    public const string Cancelled = "CANCELLED";

    public static readonly IReadOnlyList<string> All =
    [
        Discovery, Qualification, Matching, DueDiligence, DealDesign, Execution, OutcomeVerification,
        CommercializationMonitoring, Closed, Rejected, Withdrawn, Cancelled,
    ];

    public static readonly IReadOnlySet<string> Terminal = new HashSet<string> { Closed, Rejected, Withdrawn, Cancelled };
}

/// <summary>
/// Loại quyết định ghi vào `DecisionRecord`. **Sáu** loại, một loại cho mỗi giai đoạn kết thúc (ADR-0008).
///
/// `Withdraw` và `Cancel` được thêm vì bốn loại cũ không phủ `WITHDRAWN` và `CANCELLED`: hai giai đoạn đó là
/// chuyển tiến và không phải `REJECTED`, nên chúng rơi vào luật "bước tiến" và **bắt buộc mang `APPROVE` hoặc
/// `WAIVE`**. Nghĩa là để rút lui một hồ sơ, người dùng phải chọn "Chấp thuận" — và vì bản ghi quyết định là
/// dữ liệu chỉ-ghi-thêm, dòng thời gian sẽ đọc sai nghĩa mãi về sau. Đó là lỗi ghi vào dữ liệu, không phải lỗi
/// ở màn hình.
/// </summary>
public static class Decisions
{
    public const string Approve = "APPROVE";
    public const string Reject = "REJECT";
    public const string ReturnForRework = "RETURN_FOR_REWORK";
    public const string Waive = "WAIVE";
    /// <summary>Phía đưa bài toán thôi không theo nữa. Đích `WITHDRAWN`.</summary>
    public const string Withdraw = "WITHDRAW";
    /// <summary>Dừng sau khi đã có thiết kế thương vụ hoặc đang thi công, thường do điều kiện bên ngoài. Đích `CANCELLED`.</summary>
    public const string Cancel = "CANCEL";

    public static readonly IReadOnlySet<string> All =
        new HashSet<string> { Approve, Reject, ReturnForRework, Waive, Withdraw, Cancel };

    /// <summary>
    /// Giai đoạn kết thúc nào đòi loại quyết định nào. Bốn luật cùng một hình dạng — *đích này đòi loại kia* —
    /// nên chúng là một bảng tra cứu, không phải bốn nhánh `if` chép lại nhau.
    /// </summary>
    public static readonly IReadOnlyDictionary<string, string> RequiredForStage =
        new Dictionary<string, string>
        {
            [Stages.Rejected] = Reject,
            [Stages.Withdrawn] = Withdraw,
            [Stages.Cancelled] = Cancel,
        };
}

public static class CaseRoles
{
    public const string ProblemOwner = "PROBLEM_OWNER";
    public const string LeadBroker = "LEAD_BROKER";
    public const string CoBroker = "CO_BROKER";
    public const string Provider = "PROVIDER";
    public const string Evaluator = "EVALUATOR";
    public const string Verifier = "VERIFIER";
    public const string Sponsor = "SPONSOR";
}

public static class BudgetPathStatuses
{
    public const string Unknown = "UNKNOWN";
    public const string OwnerFunded = "OWNER_FUNDED";
    public const string SponsorFunded = "SPONSOR_FUNDED";
    public const string FinanceRequired = "FINANCE_REQUIRED";
    public const string Mixed = "MIXED";
    public const string Confirmed = "CONFIRMED";
}

public sealed record CaseDto(
    Guid Id,
    string CaseCode,
    string Track,
    string Stage,
    string Title,
    Guid ProblemOwnerPersonId,
    Guid? LeadBrokerPersonId,
    Guid DemandBriefId,
    int DemandBriefVersionNo,
    Guid? PolicySnapshotId,
    string ConfidentialityLevel,
    string BudgetPathStatus,
    DateTimeOffset? TargetDecisionAt,
    bool HasOpenHold,
    int Version,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<CasePartyDto> Parties,
    IReadOnlyList<CaseHoldDto> Holds);

public sealed record CasePartyDto(Guid PersonId, string Role, DateTimeOffset Since, DateTimeOffset? Until);

/// <summary>
/// Danh sách khoá, không chỉ cờ `HasOpenHold`. `moi/console-ho-so-vu-viec.md` ghi đây là lỗ hổng hợp đồng cần
/// lấp trước khi xây màn hình: nhiều khoá mở cùng lúc là được phép, gỡ khoá cần định danh từng khoá, và một cờ
/// đúng/sai không cho giao diện nói "có ba khoá, đây là lý do từng cái, đây là nút gỡ từng cái". Khoá đã gỡ
/// vẫn trả về — nó là lịch sử, và `ReleaseDecisionRecordId` nối nó với mục tương ứng trên dòng thời gian.
/// </summary>
public sealed record CaseHoldDto(Guid Id, string Reason, Guid? OpenedByActorRef, DateTimeOffset OpenedAt, DateTimeOffset? ReleasedAt, Guid? ReleaseDecisionRecordId);

public sealed record DecisionRecordDto(
    Guid Id,
    Guid CaseId,
    string FromStage,
    string ToStage,
    string Decision,
    IReadOnlyList<string> ReasonCodes,
    string Rationale,
    Guid DecidedByActorRef,
    string? MandateRef,
    Guid? PolicySnapshotId,
    DateTimeOffset DecidedAt,
    Guid? SupersedesId);

public sealed record CreateCaseCommand(string Track, string Title, Guid ProblemOwnerPersonId, Guid DemandBriefId, int DemandBriefVersionNo, string ConfidentialityLevel, Guid? LeadBrokerPersonId);

public sealed record TransitionCommand(string ToStage, string Decision, IReadOnlyList<string> ReasonCodes, string Rationale, string? MandateRef, int ExpectedVersion);

public interface ICaseService
{
    Task<CaseDto> CreateAsync(CreateCaseCommand command, CancellationToken ct);
    Task<CaseDto> GetAsync(Guid id, CancellationToken ct);
    Task<PagedResult<CaseDto>> ListAsync(Guid? brokerPersonId, Guid? problemOwnerPersonId, string? stage, PageRequest page, CancellationToken ct);

    /// <summary>
    /// §7.4/§7.5: transition ngoài ma trận bị từ chối bất kể quyền; If-Match qua ExpectedVersion (409 khi lệch);
    /// case có hold mở không transition; một transaction ghi stage + version + DecisionRecord.
    /// Vào QUALIFICATION resolve PolicySnapshot (§9.3); CASE-01 yêu cầu lead broker khi vào QUALIFICATION.
    /// </summary>
    Task<CaseDto> TransitionAsync(Guid id, TransitionCommand command, CancellationToken ct);

    Task<CaseDto> AssignLeadBrokerAsync(Guid id, Guid brokerPersonId, int expectedVersion, CancellationToken ct);
    Task<IReadOnlyList<DecisionRecordDto>> TimelineAsync(Guid id, CancellationToken ct);
    Task<CaseDto> OpenHoldAsync(Guid id, string reason, CancellationToken ct);
    Task<CaseDto> ReleaseHoldAsync(Guid id, Guid holdId, string rationale, CancellationToken ct);
}

/// <summary>Ma trận transition §7.4 — dữ liệu thuần để test phủ toàn bộ ô hợp lệ và ô bị cấm.</summary>
public static class TransitionMatrix
{
    private static readonly Dictionary<string, HashSet<string>> Allowed = new()
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

    private static readonly List<string> Order =
    [
        Stages.Discovery, Stages.Qualification, Stages.Matching, Stages.DueDiligence, Stages.DealDesign,
        Stages.Execution, Stages.OutcomeVerification, Stages.CommercializationMonitoring, Stages.Closed,
    ];

    public static bool IsAllowed(string from, string to) => Allowed.TryGetValue(from, out var set) && set.Contains(to);

    /// <summary>Transition lùi (rework) = to đứng trước from trong thứ tự stage chính.</summary>
    public static bool IsBackward(string from, string to)
    {
        var f = Order.IndexOf(from);
        var t = Order.IndexOf(to);
        return f >= 0 && t >= 0 && t < f;
    }

    public static IEnumerable<(string From, string To)> AllPairs()
        => Stages.All.SelectMany(f => Stages.All.Where(t => t != f).Select(t => (f, t)));
}
