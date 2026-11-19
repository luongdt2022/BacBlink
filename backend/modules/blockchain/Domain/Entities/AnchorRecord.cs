using NacenTech.Kernel.Domain;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Domain.Invariants;

namespace NacenTech.Modules.Blockchain.Domain.Entities;

public sealed class AnchorRecord : AggregateRoot
{
    public string EntityType { get; private set; } = string.Empty;
    public Guid EntityId { get; private set; }
    public string EntityCode { get; private set; } = string.Empty;
    public string SchemaVersion { get; private set; } = "v1.0";
    public string CommitmentHash { get; private set; } = string.Empty;
    public string RawDataHash { get; private set; } = string.Empty;
    public Guid? ZkVaultId { get; private set; }
    public long? LedgerBlockNumber { get; private set; }
    public int? TxIndexInBlock { get; private set; }
    public string? MerklePathJson { get; private set; }
    public AnchorStatus Status { get; private set; } = AnchorStatus.PENDING;
    public DateTimeOffset? AnchoredAt { get; private set; }

    // EF Core private constructor
    private AnchorRecord() { }

    public static AnchorRecord Create(
        string entityType,
        Guid entityId,
        string entityCode,
        string commitmentHash,
        string rawDataHash,
        Guid? zkVaultId = null,
        string schemaVersion = "v1.0")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(entityType);
        if (entityId == Guid.Empty)
        {
            throw ValidationException.WithCode("INVALID_ENTITY_ID", "entityId không được là Guid rỗng.");
        }
        ArgumentException.ThrowIfNullOrWhiteSpace(entityCode);
        ArgumentException.ThrowIfNullOrWhiteSpace(commitmentHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(rawDataHash);

        BlockchainBusinessRules.EnsureNoRawPiiInField("entityCode", entityCode);
        BlockchainBusinessRules.EnsureNoRawPiiInField("commitmentHash", commitmentHash);

        var record = new AnchorRecord
        {
            EntityType = entityType.Trim().ToUpperInvariant(),
            EntityId = entityId,
            EntityCode = entityCode.Trim(),
            CommitmentHash = commitmentHash.Trim().ToLowerInvariant(),
            RawDataHash = rawDataHash.Trim().ToLowerInvariant(),
            ZkVaultId = zkVaultId,
            SchemaVersion = schemaVersion.Trim(),
            Status = AnchorStatus.PENDING,
            Version = 1,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        return record;
    }

    public void LinkZkVault(Guid zkVaultId)
    {
        if (zkVaultId == Guid.Empty)
        {
            throw ValidationException.WithCode("INVALID_VAULT_ID", "zkVaultId không được là Guid rỗng.");
        }

        ZkVaultId = zkVaultId;
        Touch();
    }

    public void AttachToBlock(
        long blockNumber,
        int txIndex,
        string merklePathJson,
        string blockSignature)
    {
        if (Status != AnchorStatus.PENDING && Status != AnchorStatus.FAILED)
        {
            throw ValidationException.WithCode(
                "INVALID_ANCHOR_TRANSITION",
                $"Không thể gán khối cho bản ghi neo đang ở trạng thái '{Status}'."
            );
        }

        if (blockNumber < 0)
        {
            throw ValidationException.WithCode("INVALID_BLOCK_NUMBER", "Số thứ tự khối không được âm.");
        }

        if (txIndex < 0)
        {
            throw ValidationException.WithCode("INVALID_TX_INDEX", "Chỉ số giao dịch trong khối không được âm.");
        }

        ArgumentException.ThrowIfNullOrWhiteSpace(merklePathJson);

        // Quy tắc BR-BC-06: Bản ghi neo chỉ chuyển sang LOCAL_LEDGER_ANCHORED khi khối đã được ký số hợp lệ
        BlockchainBusinessRules.EnsureBlockSignatureProvided(blockSignature);

        LedgerBlockNumber = blockNumber;
        TxIndexInBlock = txIndex;
        MerklePathJson = merklePathJson;
        Status = AnchorStatus.LOCAL_LEDGER_ANCHORED;
        AnchoredAt = DateTimeOffset.UtcNow;
        Touch();
    }

    public void MarkNdaChainSubmitted()
    {
        if (Status != AnchorStatus.LOCAL_LEDGER_ANCHORED)
        {
            throw ValidationException.WithCode(
                "INVALID_ANCHOR_TRANSITION",
                $"Chỉ bản ghi ở trạng thái LOCAL_LEDGER_ANCHORED mới được chuyển sang NDACHAIN_SUBMITTED (hiện tại: {Status})."
            );
        }

        Status = AnchorStatus.NDACHAIN_SUBMITTED;
        Touch();
    }

    public void MarkNdaChainConfirmed()
    {
        if (Status != AnchorStatus.NDACHAIN_SUBMITTED && Status != AnchorStatus.LOCAL_LEDGER_ANCHORED)
        {
            throw ValidationException.WithCode(
                "INVALID_ANCHOR_TRANSITION",
                $"Trạng thái '{Status}' không hợp lệ để xác nhận NDACHAIN_CONFIRMED."
            );
        }

        Status = AnchorStatus.NDACHAIN_CONFIRMED;
        Touch();
    }

    public void MarkFailed(string reason)
    {
        Status = AnchorStatus.FAILED;
        Touch();
    }
}
