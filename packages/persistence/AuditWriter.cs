using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Audit.Domain;

namespace NacenTech.Persistence;

/// <summary>
/// Audit quyết định truy cập được ghi bằng **transaction riêng**, không đi theo UnitOfWork của command.
///
/// Lý do: §23.2 yêu cầu ghi audit khi TỪ CHỐI truy cập tài liệu mật, mà từ chối luôn kết thúc bằng
/// exception — nếu bản ghi audit nằm trong transaction của command thì nó bị rollback cùng, và hệ thống
/// im lặng đúng ở tình huống cần dấu vết nhất. Đường đọc (GET tài liệu) cũng không commit, nên PERMIT
/// trên tài liệu mật cũng sẽ mất. Vì vậy audit dùng DbContext ngắn hạn riêng.
///
/// Đặt ở `packages/persistence` chứ không trong module `audit` vì chỉ tầng này được biết `NacenTechDbContext`;
/// module chỉ sở hữu entity và truy vấn (MOD-02).
/// </summary>
public sealed class IsolatedAuditWriter(IDbContextFactory<NacenTechDbContext> factory, IClock clock) : IAuditWriter
{
    public void Append(AuditEntry entry)
    {
        using var db = factory.CreateDbContext();
        db.Add(new AuditEvent(
            entry.ActorRef, entry.ActorRole, entry.Action, entry.ObjectKind, entry.ObjectId, entry.ObjectVersion,
            entry.Purpose, entry.Outcome, entry.RuleId, entry.CorrelationId, entry.IpAddress, entry.UserAgent,
            entry.Details, clock.UtcNow));
        db.SaveChanges();
    }
}
