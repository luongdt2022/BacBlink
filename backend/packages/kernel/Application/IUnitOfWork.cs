namespace NacenTech.Kernel.Application;

/// <summary>
/// MOD-01/MOD-02: một command = một transaction PostgreSQL do host mở. Module KHÔNG tự BeginTransaction.
/// CommitAsync ghi mọi thay đổi của mọi module đang tham gia + outbox + job queue trong một SaveChanges.
/// </summary>
public interface IUnitOfWork
{
    Task CommitAsync(CancellationToken ct = default);
}
