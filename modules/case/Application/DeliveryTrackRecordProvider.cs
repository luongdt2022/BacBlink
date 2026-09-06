using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Case.Domain;

namespace NacenTech.Modules.Case.Application;

/// <summary>
/// Thành tích giao hàng dựng từ hồ sơ vụ việc, không từ hồ sơ tự khai.
///
/// Ba con số, ba ngưỡng khác nhau, và khoảng cách giữa chúng chính là thứ đáng đọc:
/// tham gia với vai `PROVIDER`; đi được tới `EXECUTION`; và có outcome đã xác minh. Một bên cung ứng vào
/// mười case mà chưa lần nào tới `EXECUTION` là một sự thật quan trọng hơn hẳn con số mười.
///
/// **Đây là dữ kiện, không phải điểm.** Nó đi vào phần giải thích của shortlist (nguyên tắc 11) chứ không vào
/// hàm xếp hạng — nếu nó vào hàm xếp hạng thì bên đã có lịch sử sẽ tự động đứng trên bên mới, và shortlist
/// biến thành vòng lặp tự củng cố thay vì một phép tìm.
/// </summary>
public sealed class DeliveryTrackRecordProvider(DbContext db) : IDeliveryTrackRecordProvider
{
    /// <summary>
    /// Các stage chứng minh case đã đi tới thực thi. Bao gồm cả stage sau `EXECUTION` — một case đang ở
    /// `COMMERCIALIZATION_MONITORING` thì hiển nhiên đã qua thực thi rồi, và cả `CLOSED` cũng vậy nếu nó từng
    /// tới đó. Ma trận §7.4 không cho đi ngược từ các stage này về trước mà không có `DecisionRecord`, nên
    /// stage hiện tại là bằng chứng đủ; không cần dựng lại toàn bộ lịch sử chuyển stage.
    /// </summary>
    private static readonly string[] DeliveredStages =
    [
        Stages.Execution, Stages.OutcomeVerification, Stages.CommercializationMonitoring,
    ];

    private static readonly string[] VerifiedStages =
    [
        Stages.CommercializationMonitoring,
    ];

    public async Task<IReadOnlyDictionary<Guid, DeliveryTrackRecord>> ForOwnersAsync(
        IReadOnlyCollection<Guid> ownerPersonIds, CancellationToken ct)
    {
        if (ownerPersonIds.Count == 0) return new Dictionary<Guid, DeliveryTrackRecord>();

        // Một truy vấn, không N+1: lấy mọi vai PROVIDER của nhóm người này kèm stage của case tương ứng.
        var rows = await (
            from party in db.Set<CaseParty>().AsNoTracking()
            join c in db.Set<CommercializationCase>().AsNoTracking() on party.CaseId equals c.Id
            where party.Role == CaseRoles.Provider && ownerPersonIds.Contains(party.PersonId)
            select new { party.PersonId, c.Stage, c.UpdatedAt }).ToListAsync(ct);

        return rows.GroupBy(r => r.PersonId).ToDictionary(
            g => g.Key,
            g =>
            {
                var delivered = g.Where(r => DeliveredStages.Contains(r.Stage)).ToList();
                return new DeliveryTrackRecord(
                    CasesAsProvider: g.Count(),
                    CasesReachedExecution: delivered.Count,
                    CasesWithVerifiedOutcome: g.Count(r => VerifiedStages.Contains(r.Stage)),
                    LastDeliveryAt: delivered.Count == 0 ? null : delivered.Max(r => r.UpdatedAt));
            });
    }
}
