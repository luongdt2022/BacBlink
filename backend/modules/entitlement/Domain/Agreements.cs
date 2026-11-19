using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Entitlement.Domain;

/// <summary>
/// §20 và bất biến 99/182 — hợp đồng dịch vụ định kỳ với một bên trả tiền: phạm vi, quota, SLA, kỳ thanh toán,
/// gia hạn, change và exit rule. Đây là **chỗ duy nhất** quyền lợi thương mại được ghi.
///
/// Không phải `CapabilityProfileVersion`. Profile là **thẩm quyền** — governance/security/legal duyệt, bất biến
/// sau publish, có effective/expiry và rollback (§9.4.3). Agreement là **thứ khách đã mua** — đổi mỗi lần ký phụ
/// lục, do bộ phận bán hàng chạm vào. Gộp hai thứ nghĩa là một hợp đồng bán hàng sửa được cấu hình quản trị.
/// Quan hệ đúng là phép giao, và nó chỉ đi một chiều: xem <see cref="Entitlement.NarrowsOnly"/>.
/// </summary>
public sealed class ManagedServiceAgreement : AggregateRoot
{
    private readonly List<Entitlement> _entitlements = [];

    private ManagedServiceAgreement() { }

    public ManagedServiceAgreement(PayerRef payer, string serviceLine, string reference,
        DateTimeOffset periodStart, DateTimeOffset periodEnd, string? invoiceReference, DateTimeOffset now)
    {
        if (!PayerKinds.IsKnown(payer.Kind))
            throw new ValidationException($"Loại bên trả tiền không hợp lệ: {payer.Kind}");
        PayerKind = payer.Kind;
        PayerId = payer.Id;
        ServiceLine = serviceLine;
        Reference = reference;
        PeriodStart = periodStart;
        PeriodEnd = periodEnd;
        InvoiceReference = invoiceReference;
        Status = AgreementStatuses.Draft;
        CreatedAt = now;
        UpdatedAt = now;
    }

    public string PayerKind { get; private set; } = string.Empty;
    public Guid PayerId { get; private set; }

    public PayerRef Payer => new(PayerKind, PayerId);

    public string ServiceLine { get; private set; } = string.Empty;

    /// <summary>Số hiệu hợp đồng bên ngoài. Platform không sinh số hợp đồng.</summary>
    public string Reference { get; private set; } = string.Empty;

    public DateTimeOffset PeriodStart { get; private set; }
    public DateTimeOffset PeriodEnd { get; private set; }

    /// <summary>
    /// Tham chiếu hóa đơn ở hệ thống phát hành. Nguyên tắc 10 và non-goal "tự giữ tiền": platform lưu reference
    /// và status, không lưu số tiền đã thu, không giữ tiền, không quyết định tín dụng.
    /// </summary>
    public string? InvoiceReference { get; private set; }

    public string Status { get; private set; } = AgreementStatuses.Draft;

    public IReadOnlyList<Entitlement> Entitlements => _entitlements;

    public Entitlement AddEntitlement(string capabilityCode, int? quotaLimit, DateTimeOffset now)
    {
        if (_entitlements.Any(e => e.CapabilityCode == capabilityCode))
            throw new ConflictException($"Hợp đồng đã có quyền lợi cho capability {capabilityCode}");
        var entitlement = new Entitlement(Id, capabilityCode, quotaLimit, now);
        _entitlements.Add(entitlement);
        Touch();
        return entitlement;
    }

    public void Activate(DateTimeOffset now)
    {
        if (_entitlements.Count == 0)
            throw new UnprocessableException("Không kích hoạt hợp đồng không có quyền lợi nào — bất biến 99 đòi phạm vi và quota trước khi active");
        if (PeriodEnd <= PeriodStart)
            throw new UnprocessableException("Kỳ hiệu lực không hợp lệ");
        Status = AgreementStatuses.Active;
        Touch();
    }

    public void Terminate(DateTimeOffset now)
    {
        Status = AgreementStatuses.Terminated;
        Touch();
    }

    public bool IsInForce(DateTimeOffset at)
        => Status == AgreementStatuses.Active && at >= PeriodStart && at < PeriodEnd;
}

public static class AgreementStatuses
{
    public const string Draft = "DRAFT";
    public const string Active = "ACTIVE";
    public const string Terminated = "TERMINATED";
}

/// <summary>
/// Quyền lợi cho một capability trong một hợp đồng. `QuotaLimit` null = không giới hạn số lượng nhưng **vẫn**
/// phải có hợp đồng còn hiệu lực; đó là hai điều kiện khác nhau và trộn chúng là cách quota lặng lẽ biến mất.
/// </summary>
public sealed class Entitlement : Entity
{
    private Entitlement() { }

    internal Entitlement(Guid agreementId, string capabilityCode, int? quotaLimit, DateTimeOffset now)
    {
        AgreementId = agreementId;
        CapabilityCode = capabilityCode;
        QuotaLimit = quotaLimit;
        Consumed = 0;
        CreatedAt = now;
        UpdatedAt = now;
    }

    public Guid AgreementId { get; private set; }
    public string CapabilityCode { get; private set; } = string.Empty;
    public int? QuotaLimit { get; private set; }
    public int Consumed { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public bool HasRemaining => QuotaLimit is null || Consumed < QuotaLimit.Value;

    public int? Remaining => QuotaLimit is null ? null : Math.Max(0, QuotaLimit.Value - Consumed);

    public void Consume(int amount, DateTimeOffset now)
    {
        if (amount <= 0) throw new ValidationException("Lượng tiêu thụ phải dương");
        Consumed += amount;
        UpdatedAt = now;
    }

    /// <summary>
    /// Quy tắc một chiều của phép giao profile ∩ entitlement: entitlement **chỉ thu hẹp**, không bao giờ nới rộng.
    /// Một hợp đồng bán được nhiều hơn thứ profile cho phép là hợp đồng bán thứ không tồn tại; hệ thống phải trả
    /// lại phần hẹp hơn, không phải phần khách đã trả tiền.
    /// </summary>
    public static bool NarrowsOnly(bool allowedByProfile, bool allowedByEntitlement)
        => allowedByProfile && allowedByEntitlement;
}

/// <summary>
/// Một lần dùng capability. Ghi **luôn**, kể cả ở chế độ chỉ đo — nếu chỉ ghi khi cưỡng chế thì tới lúc bật cưỡng
/// chế sẽ không có dữ liệu nào để đặt quota, và quota đặt bằng cảm tính là quota sai.
/// </summary>
public sealed class UsageRecord : Entity
{
    private UsageRecord() { }

    public UsageRecord(PayerRef payer, string capabilityCode, Guid? agreementId, int amount,
        string outcome, Guid? actorRef, DateTimeOffset occurredAt)
    {
        PayerKind = payer.Kind;
        PayerId = payer.Id;
        CapabilityCode = capabilityCode;
        AgreementId = agreementId;
        Amount = amount;
        Outcome = outcome;
        ActorRef = actorRef;
        OccurredAt = occurredAt;
    }

    public string PayerKind { get; private set; } = string.Empty;
    public Guid PayerId { get; private set; }

    public PayerRef Payer => new(PayerKind, PayerId);

    public string CapabilityCode { get; private set; } = string.Empty;
    public Guid? AgreementId { get; private set; }
    public int Amount { get; private set; }

    /// <summary>Xem <see cref="UsageOutcomes"/>. Đây là trường nói chế độ cưỡng chế đang ở đâu tại thời điểm đó.</summary>
    public string Outcome { get; private set; } = string.Empty;

    public Guid? ActorRef { get; private set; }
    public DateTimeOffset OccurredAt { get; private set; }
}

public static class UsageOutcomes
{
    /// <summary>Có hợp đồng còn hiệu lực và còn quota; đã trừ.</summary>
    public const string Allowed = "ALLOWED";

    /// <summary>Không có quyền lợi hoặc hết quota, nhưng chế độ chỉ đo nên vẫn cho chạy. Đây là số phải nhìn
    /// trước khi bật cưỡng chế: nó nói bật lên thì bao nhiêu thao tác đang chạy sẽ gãy.</summary>
    public const string WouldDeny = "WOULD_DENY";

    /// <summary>Bị chặn thật.</summary>
    public const string Denied = "DENIED";
}

// Danh mục capability bán được nằm ở `NacenTech.Kernel.Application.PlatformCapabilities` — cả bên bán lẫn bên
// tiêu thụ đều cần nó, và hai bản chép tay sẽ lệch nhau.
