namespace NacenTech.Kernel.Application;

/// <summary>Stages the enterprise projection transition in the caller's unit of work; never commits.</summary>
public interface IEnterpriseApprovalSynchronizer
{
    Task ApplyAsync(Guid personId, string? scopeId, string payloadJson, string action, string? reviewNote, CancellationToken ct);
}
