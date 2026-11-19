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

    /// <summary>
    /// ADR-0013 — hồ sơ kết thúc **thành công** bằng việc chuyển quyết định sang một quy trình có thẩm quyền
    /// bên ngoài, không phải bằng việc NacenTwin tự thực hiện. Với người trả tiền dùng vốn nhà nước, việc chọn
    /// nhà cung cấp bắt buộc chạy trên Hệ thống mạng đấu thầu quốc gia (Điều 50 Luật Đấu thầu 2023); NacenTwin
    /// làm phần thượng nguồn rồi dừng lại.
    ///
    /// Đây **không** phải `CLOSED`: `CLOSED` nghĩa là đã đi hết vòng đời tại đây. Và không phải `WITHDRAWN`
    /// hay `CANCELLED`: cả hai nghĩa là hỏng. Trước ADR-0013 chỉ có ba lối ra đó, nên một hồ sơ bàn giao thành
    /// công bị ghi như bỏ dở — sai sự thật trong dữ liệu chỉ-ghi-thêm, và làm hụt tỷ lệ chuyển đổi của toàn bộ
    /// dòng khu vực công.
    /// </summary>
    public const string HandedOver = "HANDED_OVER";

    public static readonly IReadOnlyList<string> All =
    [
        Discovery, Qualification, Matching, DueDiligence, DealDesign, Execution, OutcomeVerification,
        CommercializationMonitoring, Closed, HandedOver, Rejected, Withdrawn, Cancelled,
    ];

    public static readonly IReadOnlySet<string> Terminal = new HashSet<string> { Closed, HandedOver, Rejected, Withdrawn, Cancelled };
}

/// <summary>
/// Loại quyết định ghi vào `DecisionRecord`. **Bảy** loại, một loại cho mỗi giai đoạn kết thúc (ADR-0008, ADR-0013).
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

    /// <summary>
    /// ADR-0013: quyết định chuyển sang một quy trình có thẩm quyền bên ngoài. Đích `HANDED_OVER`. **Bắt buộc**
    /// kèm `mandateRef` — tham chiếu tới quy trình nhận bàn giao. Không có tham chiếu thì "đã bàn giao" là một
    /// lời khai không kiểm chứng được, và nó sẽ nằm vĩnh viễn trong dữ liệu chỉ-ghi-thêm.
    /// </summary>
    public const string HandoverToAuthority = "HANDOVER_TO_AUTHORITY";

    public static readonly IReadOnlySet<string> All =
        new HashSet<string> { Approve, Reject, ReturnForRework, Waive, Withdraw, Cancel, HandoverToAuthority };

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
            [Stages.HandedOver] = HandoverToAuthority,
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
    /// <summary>ADR-0014. Xem `FundingInstruments`.</summary>
    string FundingInstrument,
    string? LegalFormRef,
    /// <summary>`null` = chưa chốt ảnh chụp chính sách. Chưa chốt nghĩa là `EXECUTION` chưa mở.</summary>
    bool? ExecutionInPlatformPermitted,
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

/// <summary>
/// ADR-0014: `FundingInstrument` để `null` nghĩa là **chưa khai** — hồ sơ tạo được nhưng không vào được
/// `QUALIFICATION` cho tới khi khai. Đó là chủ đích: người mở hồ sơ ở bước tiếp nhận thường chưa biết tiền đến
/// từ đâu, và bắt khai lúc tạo sẽ đẻ ra những giá trị đoán mò nằm vĩnh viễn trong ảnh chụp chính sách.
/// </summary>
public sealed record CreateCaseCommand(string Track, string Title, Guid ProblemOwnerPersonId, Guid DemandBriefId, int DemandBriefVersionNo, string ConfidentialityLevel, Guid? LeadBrokerPersonId, string? FundingInstrument = null, string? LegalFormRef = null);

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

    /// <summary>
    /// ADR-0014: khai hoặc sửa công cụ tài chính, **chỉ trước khi** ảnh chụp chính sách được chốt. Không có
    /// đường này thì mọi hồ sơ tạo trước ADR-0014 sẽ kẹt vĩnh viễn ở `DISCOVERY`.
    /// </summary>
    Task<CaseDto> DeclareFundingPathAsync(Guid id, string instrument, string? legalFormRef, int expectedVersion, CancellationToken ct);
    Task<IReadOnlyList<DecisionRecordDto>> TimelineAsync(Guid id, CancellationToken ct);
    Task<CaseDto> OpenHoldAsync(Guid id, string reason, CancellationToken ct);
    Task<CaseDto> ReleaseHoldAsync(Guid id, Guid holdId, string rationale, CancellationToken ct);
}

/// <summary>Ma trận transition §7.4 — dữ liệu thuần để test phủ toàn bộ ô hợp lệ và ô bị cấm.</summary>
public static class TransitionMatrix
{
    /// <summary>
    /// ADR-0013 thêm bốn cạnh tới `HANDED_OVER`, và chỉ bốn. Chúng là những giai đoạn mà việc **chọn bên cung
    /// ứng** thật sự đang diễn ra hoặc vừa xong, tức là đúng chỗ NacenTwin phải dừng lại khi người trả tiền
    /// dùng vốn nhà nước:
    ///
    /// - `MATCHING`, `DUE_DILIGENCE`, `DEAL_DESIGN` — đã có danh sách ứng viên, và bước tiếp theo là chọn;
    /// - `OUTCOME_VERIFICATION` — PoC đã chạy và đã được xác minh; quyết định mua ở quy mô thật là một quy
    ///   trình riêng (GIF-08: cam kết venture-client công không phải đơn hàng).
    ///
    /// Không thêm từ `DISCOVERY`/`QUALIFICATION`: chưa tìm giải pháp nào thì không có gì để bàn giao —
    /// `WITHDRAWN` mới là lối ra đúng. Không thêm từ `COMMERCIALIZATION_MONITORING`: chuyển giao đã xong,
    /// bàn giao ở đó không có nghĩa.
    /// </summary>
    private static readonly Dictionary<string, HashSet<string>> Allowed = new()
    {
        [Stages.Discovery] = [Stages.Qualification, Stages.Rejected, Stages.Withdrawn],
        [Stages.Qualification] = [Stages.Matching, Stages.Discovery, Stages.Rejected, Stages.Withdrawn],
        [Stages.Matching] = [Stages.DueDiligence, Stages.Qualification, Stages.Rejected, Stages.Withdrawn, Stages.HandedOver],
        [Stages.DueDiligence] = [Stages.DealDesign, Stages.Matching, Stages.Rejected, Stages.Withdrawn, Stages.HandedOver],
        [Stages.DealDesign] = [Stages.Execution, Stages.DueDiligence, Stages.Withdrawn, Stages.Cancelled, Stages.HandedOver],
        [Stages.Execution] = [Stages.OutcomeVerification, Stages.Cancelled],
        [Stages.OutcomeVerification] = [Stages.CommercializationMonitoring, Stages.Execution, Stages.Closed, Stages.HandedOver],
        [Stages.CommercializationMonitoring] = [Stages.Closed],
        [Stages.Closed] = [],
        [Stages.HandedOver] = [],
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
