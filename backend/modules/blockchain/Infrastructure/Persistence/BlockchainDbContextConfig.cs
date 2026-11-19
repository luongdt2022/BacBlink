using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Blockchain.Domain.Entities;

namespace NacenTech.Modules.Blockchain.Infrastructure.Persistence;

public sealed class AnchorPolicyConfiguration : IEntityTypeConfiguration<AnchorPolicy>
{
    public void Configure(EntityTypeBuilder<AnchorPolicy> b)
    {
        b.ToTable("anchor_policies", BlockchainModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.EntityType).HasMaxLength(50).IsRequired();
        b.Property(x => x.DisplayName).HasMaxLength(150).IsRequired();
        b.Property(x => x.TriggerStatus).HasMaxLength(50).IsRequired();
        b.Property(x => x.JsonFieldsExpression).HasMaxLength(500).IsRequired();
        b.Property(x => x.BatchSizeThreshold).HasDefaultValue(10).IsRequired();
        b.Property(x => x.BatchTimeoutMinutes).HasDefaultValue(5).IsRequired();
        b.Property(x => x.IsEnabled).HasDefaultValue(true).IsRequired();
        b.Property(x => x.Version).IsConcurrencyToken();

        b.HasIndex(x => x.EntityType).IsUnique().HasDatabaseName("ix_anchor_policies_entity_type_unique");
    }
}

public sealed class LedgerBlockConfiguration : IEntityTypeConfiguration<LedgerBlock>
{
    public void Configure(EntityTypeBuilder<LedgerBlock> b)
    {
        b.ToTable("ledger_blocks", BlockchainModule.SchemaName);
        b.HasKey(x => x.BlockNumber);
        b.Property(x => x.BlockNumber).ValueGeneratedNever();

        b.Property(x => x.BlockHash).HasMaxLength(66).IsRequired();
        b.Property(x => x.PreviousHash).HasMaxLength(66).IsRequired();
        b.Property(x => x.MerkleRoot).HasMaxLength(66).IsRequired();
        b.Property(x => x.TxCount).IsRequired();
        b.Property(x => x.ValidatorAddress).HasMaxLength(100).IsRequired();
        b.Property(x => x.BlockSignature).IsRequired();
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
        b.Property(x => x.NdaChainTxHash).HasColumnName("nda_chain_tx_hash").HasMaxLength(66);
        b.Property(x => x.NdaChainBlockNumber).HasColumnName("nda_chain_block_number");
        b.Property(x => x.CreatedAt).IsRequired();
        b.Property(x => x.ConfirmedAt);

        b.HasIndex(x => x.BlockHash).IsUnique().HasDatabaseName("ix_ledger_blocks_block_hash");
        b.HasIndex(x => x.Status).HasDatabaseName("ix_ledger_blocks_status");
    }
}

public sealed class AnchorRecordConfiguration : IEntityTypeConfiguration<AnchorRecord>
{
    public void Configure(EntityTypeBuilder<AnchorRecord> b)
    {
        b.ToTable("anchor_records", BlockchainModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.EntityType).HasMaxLength(50).IsRequired();
        b.Property(x => x.EntityId).IsRequired();
        b.Property(x => x.EntityCode).HasMaxLength(50).IsRequired();
        b.Property(x => x.SchemaVersion).HasMaxLength(20).HasDefaultValue("v1.0").IsRequired();
        b.Property(x => x.CommitmentHash).HasMaxLength(66).IsRequired();
        b.Property(x => x.RawDataHash).HasMaxLength(66).IsRequired();
        b.Property(x => x.ZkVaultId);
        b.Property(x => x.LedgerBlockNumber);
        b.Property(x => x.TxIndexInBlock);
        b.Property(x => x.MerklePathJson).HasColumnName("merkle_path").HasColumnType("jsonb");
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
        b.Property(x => x.Version).IsConcurrencyToken();

        b.HasIndex(x => new { x.EntityType, x.EntityId }).IsUnique().HasDatabaseName("ix_anchor_records_entity_unique");
        b.HasIndex(x => new { x.Status, x.CreatedAt }).HasDatabaseName("ix_anchor_records_status_created_at");
        b.HasIndex(x => x.LedgerBlockNumber).HasDatabaseName("ix_anchor_records_block_number");
    }
}

public sealed class ZkProofVaultRecordConfiguration : IEntityTypeConfiguration<ZkProofVaultRecord>
{
    public void Configure(EntityTypeBuilder<ZkProofVaultRecord> b)
    {
        b.ToTable("zk_proof_vault", BlockchainModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.AnchorRecordId).IsRequired();
        b.Property(x => x.ProofScheme).HasMaxLength(50).HasDefaultValue("Groth16_BN254").IsRequired();
        b.Property(x => x.CommitmentHash).HasMaxLength(66).IsRequired();
        b.Property(x => x.SaltCiphertext).HasMaxLength(500).IsRequired();
        b.Property(x => x.ProofEnvelopeJson).HasColumnName("proof_envelope").HasColumnType("jsonb").IsRequired();
        b.Property(x => x.PublicSignalsJson).HasColumnName("public_signals").HasColumnType("jsonb").IsRequired();

        b.HasIndex(x => x.CommitmentHash).HasDatabaseName("ix_zk_proof_vault_commitment");
        b.HasIndex(x => x.AnchorRecordId).HasDatabaseName("ix_zk_proof_vault_anchor_record_id");
    }
}

public sealed class BridgeSyncLogConfiguration : IEntityTypeConfiguration<BridgeSyncLog>
{
    public void Configure(EntityTypeBuilder<BridgeSyncLog> b)
    {
        b.ToTable("bridge_sync_logs", BlockchainModule.SchemaName);
        b.HasKey(x => x.Id);

        b.Property(x => x.LedgerBlockNumber).IsRequired();
        b.Property(x => x.NdaChainEndpoint).HasColumnName("nda_chain_endpoint").HasMaxLength(255).IsRequired();
        b.Property(x => x.RpcMethod).HasMaxLength(50).IsRequired();
        b.Property(x => x.RequestTxHash).HasMaxLength(66);
        b.Property(x => x.HttpStatusCode);
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
        b.Property(x => x.ErrorMessage);
        b.Property(x => x.RetryCount).HasDefaultValue(0).IsRequired();

        b.HasIndex(x => x.LedgerBlockNumber).HasDatabaseName("ix_bridge_sync_logs_block_number");
        b.HasIndex(x => x.Status).HasDatabaseName("ix_bridge_sync_logs_status");
    }
}
