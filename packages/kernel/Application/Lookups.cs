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
