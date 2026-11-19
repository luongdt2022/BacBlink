using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Blockchain.Application.Ports;
using NacenTech.Modules.Blockchain.Domain.Entities;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Domain.Invariants;
using NacenTech.Modules.Blockchain.Infrastructure.Cryptography;

namespace NacenTech.Modules.Blockchain.Infrastructure.Adapters;

public interface ILocalSovereignLedgerAdapter : IBlockchainAnchorGateway
{
    Task<LedgerBlock?> FlushPendingRecordsToBlockAsync(int maxBatchSize = 100, string? entityType = null, CancellationToken ct = default);
}

public sealed class LocalSovereignLedgerAdapter : ILocalSovereignLedgerAdapter
{
    private readonly DbContext _db;
    private readonly IMerkleTreeEngine _merkleTreeEngine;
    private readonly IPlatformKeyManager _keyManager;

    public LocalSovereignLedgerAdapter(
        DbContext db,
        IMerkleTreeEngine merkleTreeEngine,
        IPlatformKeyManager keyManager)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _merkleTreeEngine = merkleTreeEngine ?? throw new ArgumentNullException(nameof(merkleTreeEngine));
        _keyManager = keyManager ?? throw new ArgumentNullException(nameof(keyManager));
    }

    public string GatewayType => "LOCAL_SOVEREIGN_LEDGER";

    public async Task<GatewayStatusDto> GetStatusAsync(CancellationToken ct = default)
    {
        var highestBlock = await _db.Set<LedgerBlock>()
            .AsNoTracking()
            .OrderByDescending(b => b.BlockNumber)
            .FirstOrDefaultAsync(ct);

        return new GatewayStatusDto(
            GatewayType: GatewayType,
            IsConnected: true,
            EndpointOrMode: "PostgreSQL:blockchain.ledger_blocks",
            CurrentBlockHeight: highestBlock?.BlockNumber ?? 0,
            ValidatorAddress: _keyManager.ValidatorAddress,
            NetworkId: "LOCAL_POA_LEDGER"
        );
    }

    public async Task<AnchorResultDto> AnchorMerkleRootAsync(AnchorMerkleRootPayload payload, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(payload);

        var timestampUnix = payload.Timestamp.ToUnixTimeSeconds();
        var blockHash = _keyManager.CalculateBlockHash(
            payload.BlockNumber,
            payload.PreviousHash,
            payload.MerkleRoot,
            timestampUnix,
            payload.TxCount
        );

        var blockSignature = _keyManager.SignHash(blockHash);

        LedgerBlock block;
        if (payload.BlockNumber == 0)
        {
            block = LedgerBlock.CreateGenesis(
                blockHash,
                payload.MerkleRoot,
                _keyManager.ValidatorAddress,
                blockSignature
            );
        }
        else
        {
            block = LedgerBlock.CreateNextBlock(
                previousBlockNumber: payload.BlockNumber - 1,
                previousBlockHash: payload.PreviousHash,
                newBlockNumber: payload.BlockNumber,
                blockHash: blockHash,
                merkleRoot: payload.MerkleRoot,
                txCount: payload.TxCount,
                validatorAddress: _keyManager.ValidatorAddress,
                blockSignature: blockSignature
            );
        }

        _db.Set<LedgerBlock>().Add(block);
        await _db.SaveChangesAsync(ct);

        return new AnchorResultDto(
            IsSuccess: true,
            BlockNumber: block.BlockNumber,
            BlockHash: block.BlockHash,
            MerkleRoot: block.MerkleRoot,
            TxHash: block.BlockHash,
            BlockSignature: block.BlockSignature,
            ValidatorAddress: block.ValidatorAddress
        );
    }

    public async Task<LedgerBlock?> FlushPendingRecordsToBlockAsync(int maxBatchSize = 100, string? entityType = null, CancellationToken ct = default)
    {
        if (maxBatchSize <= 0)
        {
            throw ValidationException.WithCode("INVALID_BATCH_SIZE", "maxBatchSize phải lớn hơn 0.");
        }

        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        await _db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(778899);", ct);

        var query = _db.Set<AnchorRecord>().Where(r => r.Status == AnchorStatus.PENDING);
        if (!string.IsNullOrWhiteSpace(entityType))
        {
            var normalizedType = entityType.Trim().ToUpperInvariant();
            query = query.Where(r => r.EntityType == normalizedType);
        }

        var pendingRecords = await query
            .OrderBy(r => r.CreatedAt)
            .Take(maxBatchSize)
            .ToListAsync(ct);

        if (pendingRecords.Count == 0)
        {
            await tx.RollbackAsync(ct);
            return null;
        }

        var highestBlock = await _db.Set<LedgerBlock>()
            .OrderByDescending(b => b.BlockNumber)
            .FirstOrDefaultAsync(ct);

        long newBlockNumber;
        string previousHash;

        if (highestBlock is null)
        {
            // Genesis Block #0
            var genesisTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var genesisRoot = "0x" + new string('0', 64);
            var genesisHash = _keyManager.CalculateBlockHash(
                0,
                BlockchainBusinessRules.GenesisPreviousHash,
                genesisRoot,
                genesisTimestamp,
                0
            );
            var genesisSig = _keyManager.SignHash(genesisHash);

            var genesisBlock = LedgerBlock.CreateGenesis(
                genesisHash,
                genesisRoot,
                _keyManager.ValidatorAddress,
                genesisSig
            );

            _db.Set<LedgerBlock>().Add(genesisBlock);
            await _db.SaveChangesAsync(ct);

            newBlockNumber = 1;
            previousHash = genesisBlock.BlockHash;
        }
        else
        {
            newBlockNumber = highestBlock.BlockNumber + 1;
            previousHash = highestBlock.BlockHash;
        }

        var leaves = pendingRecords.Select(r => r.CommitmentHash).ToList();
        var treeResult = _merkleTreeEngine.BuildTree(leaves);

        var timestamp = DateTimeOffset.UtcNow;
        var blockHash = _keyManager.CalculateBlockHash(
            newBlockNumber,
            previousHash,
            treeResult.RootHash,
            timestamp.ToUnixTimeSeconds(),
            pendingRecords.Count
        );

        var blockSignature = _keyManager.SignHash(blockHash);

        var newBlock = LedgerBlock.CreateNextBlock(
            previousBlockNumber: newBlockNumber - 1,
            previousBlockHash: previousHash,
            newBlockNumber: newBlockNumber,
            blockHash: blockHash,
            merkleRoot: treeResult.RootHash,
            txCount: pendingRecords.Count,
            validatorAddress: _keyManager.ValidatorAddress,
            blockSignature: blockSignature
        );

        _db.Set<LedgerBlock>().Add(newBlock);
        await _db.SaveChangesAsync(ct);

        for (int i = 0; i < pendingRecords.Count; i++)
        {
            var rec = pendingRecords[i];
            var auditPath = treeResult.AuditPaths[i];
            var merklePathJson = JsonSerializer.Serialize(auditPath);
            rec.AttachToBlock(newBlockNumber, i, merklePathJson, blockSignature);
        }

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return newBlock;
    }

    public async Task<VerificationReceiptDto> VerifyProofAsync(VerifyProofRequest request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var isPathValid = _merkleTreeEngine.VerifyAuditPath(request.CommitmentHash, request.MerkleRoot, request.MerklePath);
        if (!isPathValid)
        {
            return new VerificationReceiptDto(
                IsVerified: false,
                Verdict: "TAMPERED",
                Details: "Đường dẫn Merkle Path không dẫn tới Merkle Root của khối."
            );
        }

        if (!string.IsNullOrWhiteSpace(request.BlockHash))
        {
            var block = await _db.Set<LedgerBlock>()
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BlockHash == request.BlockHash.ToLowerInvariant(), ct);

            if (block is null)
            {
                return new VerificationReceiptDto(
                    IsVerified: false,
                    Verdict: "NOT_ANCHORED",
                    Details: "Không tìm thấy khối sổ cái tương ứng với block_hash."
                );
            }

            var isSigValid = _keyManager.VerifySignature(block.BlockHash, block.BlockSignature);
            if (!isSigValid)
            {
                return new VerificationReceiptDto(
                    IsVerified: false,
                    Verdict: "BLOCK_UNCONFIRMED",
                    Details: "Chữ ký số ECDSA của khối sổ cái không hợp lệ hoặc bị giả mạo."
                );
            }

            return new VerificationReceiptDto(
                IsVerified: true,
                Verdict: "VERIFIED",
                Details: $"Bản ghi được bảo chứng thành công trong Khối #{block.BlockNumber}.",
                TxHash: block.BlockHash,
                BlockNumber: block.BlockNumber
            );
        }

        return new VerificationReceiptDto(
            IsVerified: true,
            Verdict: "VERIFIED",
            Details: "Merkle Path khớp hoàn hảo với Merkle Root."
        );
    }
}
