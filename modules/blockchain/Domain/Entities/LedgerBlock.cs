using NacenTech.Kernel.Domain;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Domain.Invariants;

namespace NacenTech.Modules.Blockchain.Domain.Entities;

public sealed class LedgerBlock
{
    public long BlockNumber { get; private set; }
    public string BlockHash { get; private set; } = string.Empty;
    public string PreviousHash { get; private set; } = string.Empty;
    public string MerkleRoot { get; private set; } = string.Empty;
    public int TxCount { get; private set; }
    public string ValidatorAddress { get; private set; } = string.Empty;
    public string BlockSignature { get; private set; } = string.Empty;
    public BlockStatus Status { get; private set; } = BlockStatus.COMMITTED;
    public string? NdaChainTxHash { get; private set; }
    public long? NdaChainBlockNumber { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ConfirmedAt { get; private set; }

    // EF Core private constructor
    private LedgerBlock() { }

    public static LedgerBlock CreateGenesis(
        string blockHash,
        string merkleRoot,
        string validatorAddress,
        string blockSignature)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(blockHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(merkleRoot);
        ArgumentException.ThrowIfNullOrWhiteSpace(validatorAddress);
        ArgumentException.ThrowIfNullOrWhiteSpace(blockSignature);

        // Quy tắc BR-BC-03: Khối #0 phải là Genesis với previous_hash là 64 số 0
        string previousHash = BlockchainBusinessRules.GenesisPreviousHash;
        BlockchainBusinessRules.EnsureGenesisBlockValid(0, previousHash);

        return new LedgerBlock
        {
            BlockNumber = 0,
            BlockHash = blockHash.Trim().ToLowerInvariant(),
            PreviousHash = previousHash,
            MerkleRoot = merkleRoot.Trim().ToLowerInvariant(),
            TxCount = 0,
            ValidatorAddress = validatorAddress.Trim(),
            BlockSignature = blockSignature.Trim(),
            Status = BlockStatus.COMMITTED,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public static LedgerBlock CreateNextBlock(
        long previousBlockNumber,
        string previousBlockHash,
        long newBlockNumber,
        string blockHash,
        string merkleRoot,
        int txCount,
        string validatorAddress,
        string blockSignature)
    {
        // Quy tắc BR-BC-04: Số thứ tự khối phải tăng tuần tự liên tục không đứt đoạn
        BlockchainBusinessRules.EnsureBlockNumberSequential(previousBlockNumber, newBlockNumber);

        ArgumentException.ThrowIfNullOrWhiteSpace(previousBlockHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(blockHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(merkleRoot);
        ArgumentException.ThrowIfNullOrWhiteSpace(validatorAddress);
        ArgumentException.ThrowIfNullOrWhiteSpace(blockSignature);

        if (txCount < 0)
        {
            throw ValidationException.WithCode("INVALID_TX_COUNT", "tx_count không được âm.");
        }

        return new LedgerBlock
        {
            BlockNumber = newBlockNumber,
            BlockHash = blockHash.Trim().ToLowerInvariant(),
            PreviousHash = previousBlockHash.Trim().ToLowerInvariant(),
            MerkleRoot = merkleRoot.Trim().ToLowerInvariant(),
            TxCount = txCount,
            ValidatorAddress = validatorAddress.Trim(),
            BlockSignature = blockSignature.Trim(),
            Status = BlockStatus.COMMITTED,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public void MarkNdaChainSynced(string ndaChainTxHash, long ndaChainBlockNumber)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(ndaChainTxHash);
        if (ndaChainBlockNumber < 0)
        {
            throw ValidationException.WithCode("INVALID_NDACHAIN_BLOCK", "Số thứ tự khối NDAChain không được âm.");
        }

        NdaChainTxHash = ndaChainTxHash.Trim();
        NdaChainBlockNumber = ndaChainBlockNumber;
        Status = BlockStatus.NDACHAIN_SYNCED;
        ConfirmedAt = DateTimeOffset.UtcNow;
    }

    public void MarkNdaChainPending()
    {
        Status = BlockStatus.NDACHAIN_PENDING;
    }
}
