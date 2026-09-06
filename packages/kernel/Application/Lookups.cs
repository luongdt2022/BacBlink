namespace NacenTech.Kernel.Application;

/// <summary>
/// Các lookup xuyên module đi qua abstraction ở Kernel để module không tham chiếu assembly của nhau (MOD-02, §9.1).
/// Module sở hữu dữ liệu implement interface; module dùng chỉ biết interface.
/// </summary>

/// <summary>policy module: tên taxonomy (sector/category) theo id.</summary>
public interface ITaxonomyNameResolver
{
    Task<IReadOnlyDictionary<Guid, string>> NamesAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct);
}

/// <summary>identity module: preference auto-matching của chủ subject (legacy user_settings.matching_auto).</summary>
public interface IMatchingPreferenceProvider
{
    Task<bool> AutoMatchingEnabledAsync(Guid personId, CancellationToken ct);
}

public sealed record PersonBrief(Guid Id, string Email, string? FirstName, string? LastName, string? Phone, string? Organization, string PlatformRole, bool IsActive, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt);

/// <summary>identity module: thông tin hiển thị người dùng cho module khác (không PII ngoài email/tên đã có consent nội bộ).</summary>
public interface IPersonDirectory
{
    Task<PersonBrief?> GetAsync(Guid personId, CancellationToken ct);
    Task<IReadOnlyDictionary<Guid, PersonBrief>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct);
}

/// <summary>policy module: resolve PolicySnapshot bất biến cho case tại QUALIFICATION (§9.3). Trả snapshot id.</summary>
public interface IPolicySnapshotResolver
{
    Task<Guid> ResolveForCaseAsync(Guid caseId, string track, CancellationToken ct);
}

/// <summary>
/// Thành tích giao hàng đã kiểm chứng của một bên cung ứng, tính từ hồ sơ vụ việc chứ không từ hồ sơ tự khai
/// (nguyên tắc 5: *evidence before score*). Ba con số tách nhau vì chúng nói ba điều khác nhau:
/// tham gia không phải là giao được, và giao được không phải là outcome đã được xác minh.
/// </summary>
public sealed record DeliveryTrackRecord(
    int CasesAsProvider,
    int CasesReachedExecution,
    int CasesWithVerifiedOutcome,
    DateTimeOffset? LastDeliveryAt)
{
    public static readonly DeliveryTrackRecord Empty = new(0, 0, 0, null);

    /// <summary>Đã đi qua giai đoạn thực thi ít nhất một lần. Đây là ngưỡng thấp nhất còn có nghĩa.</summary>
    public bool HasDelivered => CasesReachedExecution > 0;
}

/// <summary>
/// case module: thành tích giao hàng theo chủ sở hữu nội dung. Dùng để giải thích vì sao một ứng viên vào
/// shortlist (§14, nguyên tắc 11) — **không** để chấm điểm hay xếp hạng. Trả bản ghi rỗng cho người chưa có
/// lịch sử; không có lịch sử là một sự thật cần nói ra, không phải lỗi.
/// </summary>
public interface IDeliveryTrackRecordProvider
{
    Task<IReadOnlyDictionary<Guid, DeliveryTrackRecord>> ForOwnersAsync(
        IReadOnlyCollection<Guid> ownerPersonIds, CancellationToken ct);
}

/// <summary>
/// Bên trả tiền của một hợp đồng dịch vụ.
///
/// **Không phải `Guid` trần, và không phải `organizationId`.** Phase 1 chưa có aggregate `Organization`:
/// `Person.OrganizationName` là chuỗi tự do thừa kế từ hệ cũ, không phải khoá. Đặt tên trường là
/// `payerOrganizationId` rồi nhét một `personId` vào đó là đúng loại lỗi mà ADR-0007 và ADR-0008 đã phải gỡ hai
/// lần: một từ sai đóng đinh vào dữ liệu, và người đọc sau sẽ tin cái tên chứ không tin cái giá trị.
///
/// Cặp (kind, id) nói thật ở cả hai thời điểm: hôm nay bên trả tiền là một `PERSON`; khi `Organization` có thật
/// thì hợp đồng mới trỏ `ORGANIZATION`, và hợp đồng cũ vẫn đọc đúng nghĩa của nó.
/// </summary>
public readonly record struct PayerRef(string Kind, Guid Id)
{
    public static PayerRef Person(Guid id) => new(PayerKinds.Person, id);

    public static PayerRef Organization(Guid id) => new(PayerKinds.Organization, id);

    public override string ToString() => $"{Kind}:{Id}";
}

public static class PayerKinds
{
    public const string Person = "PERSON";
    public const string Organization = "ORGANIZATION";

    public static bool IsKnown(string kind) => kind is Person or Organization;
}

/// <summary>
/// Capability bán được. Danh sách đóng và đặt ở Kernel vì cả bên bán (module `entitlement`) lẫn bên tiêu thụ
/// (`case`, `dataroom`, …) đều cần cùng bộ mã — hai bản chép tay sẽ lệch nhau, và lệch ở đây nghĩa là đo sai.
/// </summary>
public static class PlatformCapabilities
{
    public const string CaseIntake = "CASE_INTAKE";
    public const string BrokerAssistance = "BROKER_ASSISTANCE";
    public const string ExpertEngagement = "EXPERT_ENGAGEMENT";
    public const string DataRoom = "DATA_ROOM";
    public const string MarketplaceListing = "MARKETPLACE_LISTING";
    public const string SignalDigest = "SIGNAL_DIGEST";

    public static bool IsKnown(string code)
        => code is CaseIntake or BrokerAssistance or ExpertEngagement or DataRoom or MarketplaceListing or SignalDigest;
}

/// <summary>
/// `Allowed` là quyết định cuối. `WouldDenyInEnforceMode` nói cùng thao tác đó sẽ bị chặn khi bật cưỡng chế —
/// hai trường tách nhau để đo được "bật lên thì gãy bao nhiêu" trước khi bật.
/// </summary>
public sealed record EntitlementDecision(bool Allowed, bool WouldDenyInEnforceMode, string Reason, int? Remaining);

/// <summary>
/// entitlement module: quyền lợi thương mại. **Không** thay cổng phân quyền — `IAuthorizationGate` trả lời
/// "người này được phép làm việc này không", cổng này trả lời "bên trả tiền đã mua chưa và còn quota không".
/// Một câu trả lời có không bao giờ suy ra câu kia.
///
/// Kiểm và ghi mức dùng trong **cùng giao dịch** với thao tác nghiệp vụ (MOD-03). Người gọi commit; cổng không commit.
/// </summary>
public interface IEntitlementGate
{
    Task<EntitlementDecision> CheckAndMeterAsync(PayerRef payer, string capabilityCode, int amount, CancellationToken ct);
}

public sealed record MailMessage(string To, string Subject, string HtmlBody);

/// <summary>integration module: gửi mail thật. Chỉ được gọi từ job handler, không gọi trong transaction (MOD-03).</summary>
public interface IMailSender
{
    Task SendAsync(MailMessage message, CancellationToken ct);
}

public sealed record CompletionResult(string Text, string Model, string Provider, int? PromptTokens, int? CompletionTokens, int? TotalTokens);

public sealed record ChatMessage(string Role, string Content);

/// <summary>integration module: LLM provider allowlist (§24, D2-14). Không có business logic, không truy cập DB.</summary>
public interface ICompletionClient
{
    Task<CompletionResult> CompleteAsync(string prompt, string? provider, string? model, double? temperature, int? maxTokens, CancellationToken ct);
    Task<CompletionResult> ChatAsync(IReadOnlyList<ChatMessage> messages, string? provider, string? model, double? temperature, int? maxTokens, CancellationToken ct);
}

/// <summary>
/// `Sparse` là kênh từ vựng đã học của BGE-M3 (`lexical_weights`): mỗi phần tử là bản đồ *mã token → trọng số*
/// cho một đầu vào; `null` khi client không xin (`Matching:UseSparse = false`). Nó là lối thoát cho bài toán tách
/// từ tiếng Việt (§26.6.3): tokenizer đã học thay cho tokenizer của cơ sở dữ liệu.
/// </summary>
public sealed record EmbeddingResult(IReadOnlyList<float[]> Embeddings, string Model, string Provider, IReadOnlyList<IReadOnlyDictionary<int, float>>? Sparse = null);

/// <summary>Embedding qua Python sidecar BGE-M3 (§26.2: không port sang .NET).</summary>
public interface IEmbeddingClient
{
    Task<EmbeddingResult> EmbedAsync(IReadOnlyList<string> inputs, CancellationToken ct);
}

/// <summary>
/// Cross-encoder rerank (§26.6.3): chấm từng cặp truy vấn–đoạn khi đã thấy cả hai. Điểm trong [0, 1]. Chỉ chạy
/// trên N ứng viên đầu sau hợp nhất RRF — là bước xếp lại, không phải bước thu hồi.
/// </summary>
public interface IReranker
{
    Task<IReadOnlyList<float>> ScoreAsync(string query, IReadOnlyList<string> passages, CancellationToken ct);
}
