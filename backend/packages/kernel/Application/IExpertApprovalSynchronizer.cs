namespace NacenTech.Kernel.Application;

/// <summary>Stages the expert projection transition in the caller's unit of work; never commits.</summary>
public interface IExpertApprovalSynchronizer
{
    Task ApplyAsync(Guid personId, string profilePayloadJson, string action, string? reviewNote, CancellationToken ct);
}
