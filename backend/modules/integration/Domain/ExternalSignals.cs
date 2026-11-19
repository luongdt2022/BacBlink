using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Integration.Domain;

/// <summary>
/// §10.2 — mọi dữ liệu đến từ ngoài phải mang nguồn, định danh gốc, thời điểm lấy, hash, license và mức thẩm quyền.
/// Nguyên tắc 6: NacenX không tự nâng cấp dữ liệu nhập từ nguồn chưa xác minh; bất biến 102: không mở dữ liệu
/// thương mại nếu thiếu nguồn/license/purpose.
///
/// `License` và `AuthorityLevel` **không nullable** là chủ ý. Một bản ghi ngoài mà không ai ghi được nó đến từ đâu
/// và được dùng theo quyền gì là thứ tạo ra đúng vụ việc ghi ở `docs/07-references/mo-hinh-dauthau-net.md` mục 6c.
/// </summary>
public sealed class SourceRecord : Entity
{
    private SourceRecord() { }

    public SourceRecord(string source, string externalId, string contentHash, string license,
        string authorityLevel, DateTimeOffset fetchedAt, string? sourceUrl, string? payloadJson)
    {
        Source = source;
        ExternalId = externalId;
        ContentHash = contentHash;
        License = license;
        AuthorityLevel = authorityLevel;
        FetchedAt = fetchedAt;
        SourceUrl = sourceUrl;
        PayloadJson = payloadJson;
        CreatedAt = fetchedAt;
    }

    /// <summary>Định danh hệ nguồn, ví dụ mã nhà cung cấp dữ liệu. Không phải tên hiển thị.</summary>
    public string Source { get; private set; } = string.Empty;

    /// <summary>Định danh bản ghi ở hệ nguồn. Cùng `Source` tạo thành khoá tự nhiên.</summary>
    public string ExternalId { get; private set; } = string.Empty;

    /// <summary>Hash nội dung đã lấy. Đổi hash = nguồn đã sửa bản ghi; đó là sự kiện cần biết, không phải nhiễu.</summary>
    public string ContentHash { get; private set; } = string.Empty;

    /// <summary>Quyền sử dụng dữ liệu này theo hợp đồng. Chuỗi có kiểm ở <see cref="SourceLicenses"/>.</summary>
    public string License { get; private set; } = string.Empty;

    /// <summary>Mức thẩm quyền của nguồn — xem <see cref="SourceAuthorityLevels"/>.</summary>
    public string AuthorityLevel { get; private set; } = string.Empty;

    public DateTimeOffset FetchedAt { get; private set; }
    public string? SourceUrl { get; private set; }

    /// <summary>Bản gốc đã lấy, để đối chiếu khi ánh xạ sai. jsonb.</summary>
    public string? PayloadJson { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    /// <summary>Nguồn cập nhật bản ghi: giữ nguyên identity, đổi hash và thời điểm lấy.</summary>
    public void Refresh(string contentHash, DateTimeOffset fetchedAt, string? payloadJson)
    {
        ContentHash = contentHash;
        FetchedAt = fetchedAt;
        if (payloadJson is not null) PayloadJson = payloadJson;
    }
}

/// <summary>
/// Quyền sử dụng dữ liệu ngoài. Thứ tự từ hẹp tới rộng; ADR-0011 chặn kích hoạt cho tới khi hợp đồng nói rõ
/// bản ghi thuộc mức nào. Mặc định phải là mức hẹp nhất — đoán rộng hơn hợp đồng là rủi ro pháp lý, không phải
/// tối ưu sản phẩm.
/// </summary>
public static class SourceLicenses
{
    /// <summary>Chỉ đọc trong nội bộ vận hành. Không hiển thị lại cho người dùng cuối.</summary>
    public const string InternalOnly = "INTERNAL_ONLY";

    /// <summary>Được hiển thị lại trong sản phẩm cho người dùng đã đăng nhập.</summary>
    public const string DisplayInProduct = "DISPLAY_IN_PRODUCT";

    /// <summary>Được hiển thị công khai không cần đăng nhập.</summary>
    public const string DisplayPublic = "DISPLAY_PUBLIC";

    /// <summary>Được tạo tác phẩm phái sinh và phân phối lại.</summary>
    public const string Redistribute = "REDISTRIBUTE";

    public static bool IsKnown(string license)
        => license is InternalOnly or DisplayInProduct or DisplayPublic or Redistribute;

    /// <summary>Hiển thị lại cho người đã đăng nhập cần ít nhất <see cref="DisplayInProduct"/>.</summary>
    public static bool AllowsDisplayInProduct(string license)
        => license is DisplayInProduct or DisplayPublic or Redistribute;

    /// <summary>Bề mặt không cần đăng nhập cần ít nhất <see cref="DisplayPublic"/>.</summary>
    public static bool AllowsPublicDisplay(string license)
        => license is DisplayPublic or Redistribute;
}

public static class SourceAuthorityLevels
{
    /// <summary>Cơ quan/registry có thẩm quyền công bố.</summary>
    public const string Official = "OFFICIAL";

    /// <summary>Bên trung gian tổng hợp lại từ nguồn chính thức. Đây là mức của dữ liệu mua theo hợp đồng.</summary>
    public const string Aggregator = "AGGREGATOR";

    /// <summary>Tổ chức tự khai. Không tạo trust signal (nguyên tắc 5).</summary>
    public const string SelfDeclared = "SELF_DECLARED";

    public static bool IsKnown(string level) => level is Official or Aggregator or SelfDeclared;
}

/// <summary>
/// ADR-0011 — tín hiệu nhu cầu đến từ dữ liệu ngoài. **Không phải** <c>DemandBrief</c> và không được hiển thị như
/// vậy: nó chưa có problem owner đã xác nhận, chưa có budget path đã kiểm, chưa qua §11 qualification. Nó không có
/// stage, không có broker, không xuất hiện trong ma trận transition §7.4.
///
/// Chuyển thành nhu cầu thật là hành động của người có mandate (nguyên tắc 1, D2-87). Aggregate này chỉ ghi lại
/// việc đó đã xảy ra và trỏ về nguồn, để mọi `DemandBrief` sinh từ tín hiệu đều truy được lineage.
/// </summary>
public sealed class DemandSignal : AggregateRoot
{
    private DemandSignal() { }

    public DemandSignal(Guid sourceRecordId, string signalClass, string title, string? summary,
        string? buyerName, Guid[] sectorIds, decimal? budgetAmount, string? budgetCurrency,
        DateTimeOffset? observedAt, DateTimeOffset now)
    {
        SourceRecordId = sourceRecordId;
        SignalClass = signalClass;
        Title = title;
        Summary = summary;
        BuyerName = buyerName;
        SectorIds = sectorIds;
        BudgetAmount = budgetAmount;
        BudgetCurrency = budgetCurrency;
        ObservedAt = observedAt;
        Status = DemandSignalStatuses.New;
        CreatedAt = now;
        UpdatedAt = now;
    }

    public Guid SourceRecordId { get; private set; }
    public string SignalClass { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? Summary { get; private set; }

    /// <summary>Tên bên mua theo nguồn. Chuỗi, **không** phải khoá ngoại tới `Organization` — nguồn ngoài không
    /// phân giải được tổ chức trong hệ thống, và đoán khớp theo tên là cách tạo dữ liệu sai đã đo ở CHO-01.</summary>
    public string? BuyerName { get; private set; }

    public Guid[] SectorIds { get; private set; } = [];
    public decimal? BudgetAmount { get; private set; }
    public string? BudgetCurrency { get; private set; }

    /// <summary>Thời điểm sự kiện xảy ra ở nguồn, khác thời điểm ta lấy về.</summary>
    public DateTimeOffset? ObservedAt { get; private set; }

    public string Status { get; private set; } = DemandSignalStatuses.New;
    public Guid? ConvertedDemandBriefId { get; private set; }
    public Guid? DecidedByActorRef { get; private set; }
    public string? DecisionReason { get; private set; }
    public DateTimeOffset? DecidedAt { get; private set; }

    public void Update(string title, string? summary, string? buyerName, Guid[] sectorIds,
        decimal? budgetAmount, string? budgetCurrency, DateTimeOffset? observedAt)
    {
        Title = title;
        Summary = summary;
        BuyerName = buyerName;
        SectorIds = sectorIds;
        BudgetAmount = budgetAmount;
        BudgetCurrency = budgetCurrency;
        ObservedAt = observedAt;
        Touch();
    }

    /// <summary>Đánh dấu tín hiệu đã được người có mandate chuyển thành nhu cầu thật.</summary>
    public void MarkConverted(Guid demandBriefId, Guid? actorRef, DateTimeOffset now)
    {
        if (Status == DemandSignalStatuses.Converted) return;
        Status = DemandSignalStatuses.Converted;
        ConvertedDemandBriefId = demandBriefId;
        DecidedByActorRef = actorRef;
        DecidedAt = now;
        Touch();
    }

    /// <summary>
    /// Loại tín hiệu, **có lý do**. Tín hiệu bị loại vẫn giữ lại: đó là dữ liệu về thị trường và về chất lượng
    /// nguồn, không phải rác. Không có lý do thì không đo được nguồn nào đáng tiền.
    /// </summary>
    public void Reject(string reason, Guid? actorRef, DateTimeOffset now)
    {
        Status = DemandSignalStatuses.Rejected;
        DecisionReason = reason;
        DecidedByActorRef = actorRef;
        DecidedAt = now;
        Touch();
    }
}

public static class DemandSignalClasses
{
    /// <summary>Bên mua vừa công bố nhu cầu có yếu tố công nghệ. Có ngân sách, đang đầu tư.</summary>
    public const string TenderTechSignal = "TENDER_TECH_SIGNAL";

    /// <summary>
    /// Nhu cầu công khai **không có bên nào đáp ứng** — phải gia hạn hoặc hủy. Có chủ, có ngân sách đã duyệt, có
    /// thời hạn, và thị trường không giải được. Đây là đầu vào chất lượng cao nhất cho `CHALLENGE_PILOT` (§6.1).
    /// </summary>
    public const string UnmetTender = "UNMET_TENDER";

    public static bool IsKnown(string c) => c is TenderTechSignal or UnmetTender;
}

public static class DemandSignalStatuses
{
    public const string New = "NEW";
    public const string Converted = "CONVERTED";
    public const string Rejected = "REJECTED";
}
