using NacenTech.Kernel.Domain;
using NacenTech.Modules.Blockchain.Domain.Enums;

namespace NacenTech.Modules.Blockchain.Domain.Entities;

public sealed class BridgeSyncLog : Entity
{
    public long LedgerBlockNumber { get; private set; }
    public string NdaChainEndpoint { get; private set; } = string.Empty;
    public string RpcMethod { get; private set; } = string.Empty;
    public string? RequestTxHash { get; private set; }
    public int? HttpStatusCode { get; private set; }
    public BridgeSyncStatus Status { get; private set; } = BridgeSyncStatus.RETRYING;
    public string? ErrorMessage { get; private set; }
    public int RetryCount { get; private set; }
    public DateTimeOffset TriggeredAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; private set; }

    // EF Core private constructor
    private BridgeSyncLog() { }

    public static BridgeSyncLog CreateInitiated(
        long ledgerBlockNumber,
        string ndaChainEndpoint,
        string rpcMethod,
        int retryCount = 0)
    {
        if (ledgerBlockNumber < 0)
        {
            throw ValidationException.WithCode("INVALID_BLOCK_NUMBER", "Số thứ tự khối không được âm.");
        }
        ArgumentException.ThrowIfNullOrWhiteSpace(ndaChainEndpoint);
        ArgumentException.ThrowIfNullOrWhiteSpace(rpcMethod);

        return new BridgeSyncLog
        {
            LedgerBlockNumber = ledgerBlockNumber,
            NdaChainEndpoint = ndaChainEndpoint.Trim(),
            RpcMethod = rpcMethod.Trim(),
            RetryCount = Math.Max(0, retryCount),
            Status = BridgeSyncStatus.RETRYING,
            TriggeredAt = DateTimeOffset.UtcNow
        };
    }

    public void MarkSuccess(int httpStatusCode, string? requestTxHash)
    {
        HttpStatusCode = httpStatusCode;
        RequestTxHash = requestTxHash?.Trim();
        Status = BridgeSyncStatus.SUCCESS;
        ErrorMessage = null;
        CompletedAt = DateTimeOffset.UtcNow;
    }

    public void MarkFailed(int? httpStatusCode, string errorMessage)
    {
        HttpStatusCode = httpStatusCode;
        ErrorMessage = errorMessage?.Trim();
        Status = BridgeSyncStatus.FAILED;
        CompletedAt = DateTimeOffset.UtcNow;
    }
}
