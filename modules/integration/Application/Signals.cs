using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Integration.Domain;
using NacenTech.PolicyEngine;

namespace NacenTech.Modules.Integration.Application;

/// <summary>
/// Một bản ghi từ nguồn ngoài. `ContentHash` do người gọi tính trên payload gốc — adapter biết payload thật
/// trông thế nào, tầng này thì không.
/// </summary>
public sealed record IngestSignalCommand(
    string Source,
    string ExternalId,
    string ContentHash,
    string License,
    string AuthorityLevel,
    DateTimeOffset FetchedAt,
    string? SourceUrl,
    string? PayloadJson,
    string SignalClass,
    string Title,
    string? Summary,
    string? BuyerName,
    IReadOnlyList<Guid>? SectorIds,
    decimal? BudgetAmount,
    string? BudgetCurrency,
    DateTimeOffset? ObservedAt);

public sealed record DemandSignalDto(
    Guid Id,
    Guid SourceRecordId,
    string Source,
    string SignalClass,
    string Title,
    string? Summary,
    string? BuyerName,
    IReadOnlyList<Guid> SectorIds,
    decimal? BudgetAmount,
    string? BudgetCurrency,
    DateTimeOffset? ObservedAt,
    string Status,
    Guid? ConvertedDemandBriefId,
    string? DecisionReason,
    int Version,
    DateTimeOffset CreatedAt);

public sealed record DemandSignalFilter(string? Status, string? SignalClass);

/// <summary>
/// Ai sẽ nhìn thấy kết quả của lần đọc này. **Tham số bắt buộc, không có giá trị mặc định** — đó là chủ đích:
/// một mặc định an toàn vẫn là một mặc định, và người viết cửa mới sẽ không phải nghĩ. Ở đây phải nghĩ.
///
/// Ranh giới không phải do kiến trúc tự đặt ra. Dữ liệu đấu thầu công khai được truy cập không hạn chế theo
/// Điều 51 Luật Đấu thầu 2023, nên **đọc** nó không bị cấm; thứ bị quản lý là **xuất bản lại có tổ chức**.
/// Ba mức dưới đây là ba phía của ranh giới đó.
/// </summary>
public enum SignalAudience
{
    /// <summary>Người vận hành đọc để làm việc. Không phải xuất bản lại.</summary>
    Internal = 0,

    /// <summary>Hiển thị trong sản phẩm cho người đã đăng nhập.</summary>
    InProduct = 1,

    /// <summary>Bề mặt không cần đăng nhập.</summary>
    Public = 2,
}

public interface ISignalIngestService
{
    /// <summary>
    /// Nạp hoặc cập nhật một tín hiệu. Idempotent theo `(Source, ExternalId)`: gọi lại với cùng khoá là cập nhật,
    /// không tạo bản ghi thứ hai. Trả tín hiệu sau khi nạp.
    /// </summary>
    Task<DemandSignalDto> IngestAsync(IngestSignalCommand command, CancellationToken ct);

    /// <summary>
    /// Tín hiệu mà <paramref name="audience"/> được phép nhìn thấy theo license của nguồn. Tín hiệu không đủ
    /// license **không xuất hiện** trong kết quả — lọc, không che: một dòng bị che vẫn nói cho người xem biết
    /// rằng ở đó có gì đó, và với dữ liệu mua theo hợp đồng thì chính điều đó là thứ hợp đồng không cho.
    /// </summary>
    Task<PagedResult<DemandSignalDto>> ListAsync(DemandSignalFilter filter, SignalAudience audience, PageRequest page, CancellationToken ct);

    /// <summary>Ném <c>ForbiddenException</c> khi license của nguồn không cho phép hiển thị cho đối tượng này.</summary>
    Task<DemandSignalDto> GetAsync(Guid id, SignalAudience audience, CancellationToken ct);

    /// <summary>
    /// Ghi nhận một tín hiệu đã được người có mandate chuyển thành nhu cầu thật. **Không** tự tạo `DemandBrief` —
    /// nguyên tắc 1 và D2-87: chỉ người có thẩm quyền xác nhận owner, mục tiêu, baseline và budget path mới tạo
    /// được nhu cầu đủ điều kiện. Người gọi tạo `DemandBrief` trước rồi báo lại id ở đây.
    /// </summary>
    Task<DemandSignalDto> MarkConvertedAsync(Guid signalId, Guid demandBriefId, int? expectedVersion, CancellationToken ct);

    Task<DemandSignalDto> RejectAsync(Guid signalId, string reason, int? expectedVersion, CancellationToken ct);
}

public sealed class SignalIngestService(
    DbContext db, IUnitOfWork uow, ICurrentActor actor, IAuthorizationGate gate, IClock clock) : ISignalIngestService
{
    public async Task<DemandSignalDto> IngestAsync(IngestSignalCommand c, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.SignalIngest, actor.PlatformRole), "DemandSignal", null);

        if (!SourceLicenses.IsKnown(c.License))
            throw new ValidationException($"License không hợp lệ: {c.License}");
        if (!SourceAuthorityLevels.IsKnown(c.AuthorityLevel))
            throw new ValidationException($"Mức thẩm quyền không hợp lệ: {c.AuthorityLevel}");
        if (!DemandSignalClasses.IsKnown(c.SignalClass))
            throw new ValidationException($"Loại tín hiệu không hợp lệ: {c.SignalClass}");
        if (string.IsNullOrWhiteSpace(c.Source) || string.IsNullOrWhiteSpace(c.ExternalId))
            throw new ValidationException("Tín hiệu ngoài phải có nguồn và định danh gốc");

        var sectorIds = (c.SectorIds ?? []).ToArray();

        var source = await db.Set<SourceRecord>()
            .FirstOrDefaultAsync(s => s.Source == c.Source && s.ExternalId == c.ExternalId, ct);

        DemandSignal signal;
        if (source is null)
        {
            source = new SourceRecord(c.Source, c.ExternalId, c.ContentHash, c.License, c.AuthorityLevel,
                c.FetchedAt, c.SourceUrl, c.PayloadJson);
            db.Add(source);
            signal = new DemandSignal(source.Id, c.SignalClass, c.Title, c.Summary, c.BuyerName, sectorIds,
                c.BudgetAmount, c.BudgetCurrency, c.ObservedAt, clock.UtcNow);
            db.Add(signal);
        }
        else
        {
            source.Refresh(c.ContentHash, c.FetchedAt, c.PayloadJson);
            signal = await db.Set<DemandSignal>().FirstOrDefaultAsync(s => s.SourceRecordId == source.Id, ct)
                     ?? throw new ConflictException($"Bản ghi nguồn {source.Id} có nhưng tín hiệu tương ứng không có");
            signal.Update(c.Title, c.Summary, c.BuyerName, sectorIds, c.BudgetAmount, c.BudgetCurrency, c.ObservedAt);
        }

        await uow.CommitAsync(ct);
        return ToDto(signal, source);
    }

    /// <summary>
    /// License nào đủ cho đối tượng nào. Đây là **một** chỗ duy nhất trả lời câu hỏi đó; mọi đường đọc gọi vào
    /// đây thay vì tự so chuỗi, vì một phép so chép ra hai nơi là hai phép so sẽ lệch nhau.
    /// </summary>
    private static bool Allows(string license, SignalAudience audience) => audience switch
    {
        SignalAudience.Internal => true,
        SignalAudience.InProduct => SourceLicenses.AllowsDisplayInProduct(license),
        SignalAudience.Public => SourceLicenses.AllowsPublicDisplay(license),
        _ => false, // Đối tượng chưa biết là từ chối, không phải cho qua.
    };

    public async Task<PagedResult<DemandSignalDto>> ListAsync(DemandSignalFilter filter, SignalAudience audience, PageRequest page, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.SignalRead, actor.PlatformRole), "DemandSignal", null);

        // Lọc license **trong truy vấn**, trước cả phân trang. Lọc sau khi lấy về sẽ làm `total` và số dòng mỗi
        // trang nói dối: người xem thấy "12 kết quả" rồi đếm được 9 — và chênh lệch đó chính là thông tin mà
        // license không cho họ có.
        var q =
            from s in db.Set<DemandSignal>().AsNoTracking()
            join src in db.Set<SourceRecord>().AsNoTracking() on s.SourceRecordId equals src.Id
            select new { Signal = s, Source = src };

        if (filter.Status is { } status) q = q.Where(x => x.Signal.Status == status);
        if (filter.SignalClass is { } cls) q = q.Where(x => x.Signal.SignalClass == cls);

        if (audience != SignalAudience.Internal)
        {
            var allowed = audience == SignalAudience.Public
                ? new[] { SourceLicenses.DisplayPublic, SourceLicenses.Redistribute }
                : [SourceLicenses.DisplayInProduct, SourceLicenses.DisplayPublic, SourceLicenses.Redistribute];
            q = q.Where(x => allowed.Contains(x.Source.License));
        }

        var total = await q.CountAsync(ct);
        var rows = await q.OrderByDescending(x => x.Signal.ObservedAt).ThenByDescending(x => x.Signal.CreatedAt)
            .Skip(page.Skip).Take(page.Limit).ToListAsync(ct);

        var data = rows.Select(x => ToDto(x.Signal, x.Source)).ToList();
        return new PagedResult<DemandSignalDto>(data, total, page.Page, page.Limit);
    }

    public async Task<DemandSignalDto> GetAsync(Guid id, SignalAudience audience, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.SignalRead, actor.PlatformRole), "DemandSignal", id);
        var signal = await Load(id, null, ct);
        var source = await db.Set<SourceRecord>().AsNoTracking().FirstOrDefaultAsync(s => s.Id == signal.SourceRecordId, ct)
                     ?? throw new ConflictException($"Tín hiệu {id} không có bản ghi nguồn — không xác định được license");

        if (!Allows(source.License, audience))
            throw new ForbiddenException($"License {source.License} không cho phép hiển thị cho {audience}", "SOURCE_LICENSE_FORBIDS_DISPLAY");

        return ToDto(signal, source);
    }

    public async Task<DemandSignalDto> MarkConvertedAsync(Guid signalId, Guid demandBriefId, int? expectedVersion, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.SignalTriage, actor.PlatformRole), "DemandSignal", signalId);
        var signal = await Load(signalId, expectedVersion, ct);
        signal.MarkConverted(demandBriefId, actor.PersonId, clock.UtcNow);
        await uow.CommitAsync(ct);
        return ToDto(signal, await db.Set<SourceRecord>().AsNoTracking().FirstOrDefaultAsync(s => s.Id == signal.SourceRecordId, ct));
    }

    public async Task<DemandSignalDto> RejectAsync(Guid signalId, string reason, int? expectedVersion, CancellationToken ct)
    {
        gate.Require(new AuthorizationRequest(Actions.SignalTriage, actor.PlatformRole), "DemandSignal", signalId);
        if (string.IsNullOrWhiteSpace(reason))
            throw new ValidationException("Loại tín hiệu phải có lý do — không có lý do thì không đo được chất lượng nguồn");

        var signal = await Load(signalId, expectedVersion, ct);
        signal.Reject(reason, actor.PersonId, clock.UtcNow);
        await uow.CommitAsync(ct);
        return ToDto(signal, await db.Set<SourceRecord>().AsNoTracking().FirstOrDefaultAsync(s => s.Id == signal.SourceRecordId, ct));
    }

    private async Task<DemandSignal> Load(Guid id, int? expectedVersion, CancellationToken ct)
    {
        var signal = await db.Set<DemandSignal>().FirstOrDefaultAsync(s => s.Id == id, ct)
                     ?? throw new NotFoundException($"Demand signal {id} not found");
        if (expectedVersion is { } v && signal.Version != v)
            throw new ConcurrencyException($"Demand signal {id} đã đổi", signal.Version);
        return signal;
    }

    private static DemandSignalDto ToDto(DemandSignal s, SourceRecord? source) => new(
        s.Id, s.SourceRecordId, source?.Source ?? string.Empty, s.SignalClass, s.Title, s.Summary, s.BuyerName,
        s.SectorIds, s.BudgetAmount, s.BudgetCurrency, s.ObservedAt, s.Status, s.ConvertedDemandBriefId,
        s.DecisionReason, s.Version, s.CreatedAt);
}
