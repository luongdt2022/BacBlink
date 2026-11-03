using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NacenTech.Modules.Blockchain.Application.Ports;
using NacenTech.Modules.Blockchain.Domain.Entities;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Infrastructure.Adapters;

namespace NacenTech.Modules.Blockchain.Workers;

public sealed record BridgeSyncResultDto(
    int TotalProcessed,
    int Succeeded,
    int Failed,
    IReadOnlyList<string> Details
);

public interface INdaChainBridgeSyncService
{
    Task<BridgeSyncResultDto> SyncPendingBlocksAsync(CancellationToken ct = default);
}

public sealed class NdaChainBridgeSyncService : INdaChainBridgeSyncService
{
    private readonly DbContext _db;
    private readonly INdaChainGatewayAdapter _ndaGateway;
    private readonly NdaChainOptions _options;
    private readonly ILogger<NdaChainBridgeSyncService> _logger;

    public NdaChainBridgeSyncService(
        DbContext db,
        INdaChainGatewayAdapter ndaGateway,
        IOptions<NdaChainOptions> options,
        ILogger<NdaChainBridgeSyncService> logger)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _ndaGateway = ndaGateway ?? throw new ArgumentNullException(nameof(ndaGateway));
        _options = options?.Value ?? new NdaChainOptions();
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<BridgeSyncResultDto> SyncPendingBlocksAsync(CancellationToken ct = default)
    {
        var unsyncedBlocks = await _db.Set<LedgerBlock>()
            .Where(b => b.Status != BlockStatus.NDACHAIN_SYNCED)
            .OrderBy(b => b.BlockNumber)
            .Take(20)
            .ToListAsync(ct);

        if (unsyncedBlocks.Count == 0)
        {
            return new BridgeSyncResultDto(0, 0, 0, ["Không có khối nào cần đồng bộ bù lên NDAChain."]);
        }

        int succeeded = 0;
        int failed = 0;
        var details = new List<string>();

        foreach (var block in unsyncedBlocks)
        {
            var syncLog = BridgeSyncLog.CreateInitiated(
                ledgerBlockNumber: block.BlockNumber,
                ndaChainEndpoint: _options.RpcEndpoint,
                rpcMethod: "eth_sendRawTransaction"
            );

            _db.Set<BridgeSyncLog>().Add(syncLog);

            var payload = new AnchorMerkleRootPayload(
                BlockNumber: block.BlockNumber,
                MerkleRoot: block.MerkleRoot,
                TxCount: block.TxCount,
                PreviousHash: block.PreviousHash,
                Timestamp: block.CreatedAt
            );

            var anchorResult = await _ndaGateway.AnchorMerkleRootAsync(payload, ct);

            if (anchorResult.IsSuccess)
            {
                var txHash = anchorResult.TxHash ?? "0x" + new string('f', 64);
                block.MarkNdaChainSynced(txHash, block.BlockNumber);

                var blockRecords = await _db.Set<AnchorRecord>()
                    .Where(r => r.LedgerBlockNumber == block.BlockNumber)
                    .ToListAsync(ct);

                foreach (var rec in blockRecords)
                {
                    rec.MarkNdaChainConfirmed();
                }

                syncLog.MarkSuccess(200, txHash);
                succeeded++;
                details.Add($"Khối #{block.BlockNumber} đồng bộ thành công. TxHash={txHash}");
            }
            else
            {
                syncLog.MarkFailed(500, anchorResult.ErrorMessage ?? "Đồng bộ thất bại.");
                failed++;
                details.Add($"Khối #{block.BlockNumber} đồng bộ lỗi: {anchorResult.ErrorMessage}");

                // Quy tắc BR-BC-07: In-order delivery - nếu khối k lỗi thì dừng, không gửi khối k+1
                _logger.LogWarning("Tạm dừng đồng bộ chuỗi tại Khối #{BlockNumber} do lỗi: {Error}", block.BlockNumber, anchorResult.ErrorMessage);
                await _db.SaveChangesAsync(ct);
                break;
            }

            await _db.SaveChangesAsync(ct);
        }

        return new BridgeSyncResultDto(unsyncedBlocks.Count, succeeded, failed, details);
    }
}

public sealed class NdaChainBridgeSyncWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NdaChainBridgeSyncWorker> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromSeconds(60);

    public NdaChainBridgeSyncWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<NdaChainBridgeSyncWorker> logger)
    {
        _scopeFactory = scopeFactory ?? throw new ArgumentNullException(nameof(scopeFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("NdaChainBridgeSyncWorker đã khởi động. Chu kỳ quét: {Interval}s.", _interval.TotalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var syncService = scope.ServiceProvider.GetRequiredService<INdaChainBridgeSyncService>();
                var result = await syncService.SyncPendingBlocksAsync(stoppingToken);

                if (result.TotalProcessed > 0)
                {
                    _logger.LogInformation("NdaChainBridgeSync: Đã xử lý {Total} khối ({Succeeded} thành công, {Failed} lỗi).",
                        result.TotalProcessed, result.Succeeded, result.Failed);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xảy ra trong chu trình chạy NdaChainBridgeSyncWorker.");
            }

            await Task.Delay(_interval, stoppingToken);
        }

        _logger.LogInformation("NdaChainBridgeSyncWorker đã dừng.");
    }
}
