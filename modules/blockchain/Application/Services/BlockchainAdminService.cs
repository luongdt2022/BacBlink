using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Blockchain.Application.Ports;
using NacenTech.Modules.Blockchain.Domain.Entities;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Infrastructure.Adapters;
using NacenTech.Modules.Blockchain.Workers;

namespace NacenTech.Modules.Blockchain.Application.Services;

public sealed record AnchorPolicyDto(
    Guid Id,
    string EntityType,
    string DisplayName,
    bool IsEnabled,
    string TriggerStatus,
    string JsonFieldsExpression,
    int BatchSizeThreshold,
    int BatchTimeoutMinutes,
    int AnchoredRecordsCount,
    int Version
);

public sealed record UpdateAnchorPolicyRequest(
    bool? IsEnabled,
    int? BatchSizeThreshold,
    int? BatchTimeoutMinutes,
    int? ExpectedVersion = null
);

public sealed record LedgerBlockSummaryDto(
    long BlockNumber,
    string BlockHash,
    string PreviousHash,
    string MerkleRoot,
    int TxCount,
    string ValidatorAddress,
    string BlockSignature,
    string Status,
    string? NdaChainTxHash,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ConfirmedAt
);

public sealed record LedgerBlockDetailDto(
    long BlockNumber,
    string BlockHash,
    string PreviousHash,
    string MerkleRoot,
    int TxCount,
    string ValidatorAddress,
    string BlockSignature,
    string Status,
    string? NdaChainTxHash,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ConfirmedAt,
    IReadOnlyList<AnchorRecordSummaryDto> Transactions
);

public sealed record AnchorRecordSummaryDto(
    Guid Id,
    string EntityType,
    Guid EntityId,
    string EntityCode,
    string CommitmentHash,
    string RawDataHash,
    long? LedgerBlockNumber,
    int? TxIndexInBlock,
    string Status,
    string? MerklePathJson,
    DateTimeOffset CreatedAt,
    DateTimeOffset? AnchoredAt
);

public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Total,
    int Page,
    int PageSize,
    int TotalPages
);

public interface IBlockchainAdminService
{
    Task<IReadOnlyList<AnchorPolicyDto>> GetPoliciesAsync(CancellationToken ct = default);
    Task<AnchorPolicyDto> UpdatePolicyAsync(Guid policyId, UpdateAnchorPolicyRequest request, CancellationToken ct = default);
    Task<PagedResult<LedgerBlockSummaryDto>> GetBlocksAsync(int page = 1, int pageSize = 10, CancellationToken ct = default);
    Task<LedgerBlockDetailDto?> GetBlockDetailAsync(long blockNumber, CancellationToken ct = default);
    Task<LedgerBlockSummaryDto?> FlushBlockAsync(CancellationToken ct = default);
    Task<PagedResult<AnchorRecordSummaryDto>> GetRecordsAsync(string? entityType = null, string? status = null, string? keyword = null, int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<GatewayStatusDto> GetBridgeStatusAsync(CancellationToken ct = default);
    Task<BridgeSyncResultDto> TriggerBridgeSyncAsync(CancellationToken ct = default);
}

public sealed class BlockchainAdminService : IBlockchainAdminService
{
    private readonly DbContext _db;
    private readonly ILocalSovereignLedgerAdapter _ledgerAdapter;
    private readonly INdaChainGatewayAdapter _ndaGateway;
    private readonly INdaChainBridgeSyncService _bridgeSyncService;

    public BlockchainAdminService(
        DbContext db,
        ILocalSovereignLedgerAdapter ledgerAdapter,
        INdaChainGatewayAdapter ndaGateway,
        INdaChainBridgeSyncService bridgeSyncService)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _ledgerAdapter = ledgerAdapter ?? throw new ArgumentNullException(nameof(ledgerAdapter));
        _ndaGateway = ndaGateway ?? throw new ArgumentNullException(nameof(ndaGateway));
        _bridgeSyncService = bridgeSyncService ?? throw new ArgumentNullException(nameof(bridgeSyncService));
    }

    public async Task<IReadOnlyList<AnchorPolicyDto>> GetPoliciesAsync(CancellationToken ct = default)
    {
        var policies = await _db.Set<AnchorPolicy>()
            .AsNoTracking()
            .OrderBy(p => p.EntityType)
            .ToListAsync(ct);

        var counts = await _db.Set<AnchorRecord>()
            .AsNoTracking()
            .GroupBy(r => r.EntityType)
            .Select(g => new { EntityType = g.Key, Count = g.Count() })
            .ToDictionaryAsync(k => k.EntityType, v => v.Count, ct);

        return policies.Select(p => new AnchorPolicyDto(
            Id: p.Id,
            EntityType: p.EntityType,
            DisplayName: p.DisplayName,
            IsEnabled: p.IsEnabled,
            TriggerStatus: p.TriggerStatus,
            JsonFieldsExpression: p.JsonFieldsExpression,
            BatchSizeThreshold: p.BatchSizeThreshold,
            BatchTimeoutMinutes: p.BatchTimeoutMinutes,
            AnchoredRecordsCount: counts.TryGetValue(p.EntityType, out var c) ? c : 0,
            Version: p.Version
        )).ToList();
    }

    public async Task<AnchorPolicyDto> UpdatePolicyAsync(Guid policyId, UpdateAnchorPolicyRequest request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var policy = await _db.Set<AnchorPolicy>().FirstOrDefaultAsync(p => p.Id == policyId, ct)
            ?? throw ValidationException.WithCode("POLICY_NOT_FOUND", "Không tìm thấy chính sách neo dữ liệu.");

        if (request.IsEnabled.HasValue)
        {
            policy.ToggleStatus(request.IsEnabled.Value, request.ExpectedVersion ?? policy.Version);
        }

        if (request.BatchSizeThreshold.HasValue || request.BatchTimeoutMinutes.HasValue)
        {
            policy.ConfigureBatching(
                batchSizeThreshold: request.BatchSizeThreshold ?? policy.BatchSizeThreshold,
                batchTimeoutMinutes: request.BatchTimeoutMinutes ?? policy.BatchTimeoutMinutes,
                expectedVersion: request.ExpectedVersion ?? policy.Version
            );
        }

        await _db.SaveChangesAsync(ct);

        var count = await _db.Set<AnchorRecord>()
            .CountAsync(r => r.EntityType == policy.EntityType, ct);

        return new AnchorPolicyDto(
            Id: policy.Id,
            EntityType: policy.EntityType,
            DisplayName: policy.DisplayName,
            IsEnabled: policy.IsEnabled,
            TriggerStatus: policy.TriggerStatus,
            JsonFieldsExpression: policy.JsonFieldsExpression,
            BatchSizeThreshold: policy.BatchSizeThreshold,
            BatchTimeoutMinutes: policy.BatchTimeoutMinutes,
            AnchoredRecordsCount: count,
            Version: policy.Version
        );
    }

    public async Task<PagedResult<LedgerBlockSummaryDto>> GetBlocksAsync(int page = 1, int pageSize = 10, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Set<LedgerBlock>().AsNoTracking();
        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(b => b.BlockNumber)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new LedgerBlockSummaryDto(
                b.BlockNumber,
                b.BlockHash,
                b.PreviousHash,
                b.MerkleRoot,
                b.TxCount,
                b.ValidatorAddress,
                b.BlockSignature,
                b.Status.ToString(),
                b.NdaChainTxHash,
                b.CreatedAt,
                b.ConfirmedAt
            ))
            .ToListAsync(ct);

        int totalPages = (int)Math.Ceiling((double)total / pageSize);
        return new PagedResult<LedgerBlockSummaryDto>(items, total, page, pageSize, totalPages);
    }

    public async Task<LedgerBlockDetailDto?> GetBlockDetailAsync(long blockNumber, CancellationToken ct = default)
    {
        var block = await _db.Set<LedgerBlock>()
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.BlockNumber == blockNumber, ct);

        if (block is null) return null;

        var txs = await _db.Set<AnchorRecord>()
            .AsNoTracking()
            .Where(r => r.LedgerBlockNumber == blockNumber)
            .OrderBy(r => r.TxIndexInBlock)
            .Select(r => new AnchorRecordSummaryDto(
                r.Id,
                r.EntityType,
                r.EntityId,
                r.EntityCode,
                r.CommitmentHash,
                r.RawDataHash,
                r.LedgerBlockNumber,
                r.TxIndexInBlock,
                r.Status.ToString(),
                r.MerklePathJson,
                r.CreatedAt,
                r.AnchoredAt
            ))
            .ToListAsync(ct);

        return new LedgerBlockDetailDto(
            block.BlockNumber,
            block.BlockHash,
            block.PreviousHash,
            block.MerkleRoot,
            block.TxCount,
            block.ValidatorAddress,
            block.BlockSignature,
            block.Status.ToString(),
            block.NdaChainTxHash,
            block.CreatedAt,
            block.ConfirmedAt,
            txs
        );
    }

    public async Task<LedgerBlockSummaryDto?> FlushBlockAsync(CancellationToken ct = default)
    {
        var block = await _ledgerAdapter.FlushPendingRecordsToBlockAsync(maxBatchSize: 100, ct: ct);
        if (block is null) return null;

        return new LedgerBlockSummaryDto(
            block.BlockNumber,
            block.BlockHash,
            block.PreviousHash,
            block.MerkleRoot,
            block.TxCount,
            block.ValidatorAddress,
            block.BlockSignature,
            block.Status.ToString(),
            block.NdaChainTxHash,
            block.CreatedAt,
            block.ConfirmedAt
        );
    }

    public async Task<PagedResult<AnchorRecordSummaryDto>> GetRecordsAsync(
        string? entityType = null,
        string? status = null,
        string? keyword = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Set<AnchorRecord>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(entityType))
        {
            var cleanType = entityType.Trim().ToUpperInvariant();
            query = query.Where(r => r.EntityType == cleanType);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<AnchorStatus>(status.Trim(), true, out var anchorStatus))
        {
            query = query.Where(r => r.Status == anchorStatus);
        }

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var cleanKw = keyword.Trim().ToLower();
            query = query.Where(r => r.EntityCode.ToLower().Contains(cleanKw) || r.CommitmentHash.ToLower().Contains(cleanKw));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AnchorRecordSummaryDto(
                r.Id,
                r.EntityType,
                r.EntityId,
                r.EntityCode,
                r.CommitmentHash,
                r.RawDataHash,
                r.LedgerBlockNumber,
                r.TxIndexInBlock,
                r.Status.ToString(),
                r.MerklePathJson,
                r.CreatedAt,
                r.AnchoredAt
            ))
            .ToListAsync(ct);

        int totalPages = (int)Math.Ceiling((double)total / pageSize);
        return new PagedResult<AnchorRecordSummaryDto>(items, total, page, pageSize, totalPages);
    }

    public Task<GatewayStatusDto> GetBridgeStatusAsync(CancellationToken ct = default)
    {
        return _ndaGateway.GetStatusAsync(ct);
    }

    public Task<BridgeSyncResultDto> TriggerBridgeSyncAsync(CancellationToken ct = default)
    {
        return _bridgeSyncService.SyncPendingBlocksAsync(ct);
    }
}
