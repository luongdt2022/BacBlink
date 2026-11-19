using NacenTech.Kernel.Application;

namespace NacenTech.Contracts.Jobs;

/// <summary>
/// Job neo dữ liệu chuỗi khối & ZKP bất đồng bộ qua platform.job_queue (TASK-11).
/// </summary>
public sealed record BlockchainAnchorJob(
    string EntityType,
    Guid EntityId,
    string EntityCode,
    string? TriggerEvent = null,
    string? RawDataJson = null
) : IJob;
