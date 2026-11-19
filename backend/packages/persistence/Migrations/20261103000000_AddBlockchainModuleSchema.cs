using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261103000000_AddBlockchainModuleSchema")]
public sealed class AddBlockchainModuleSchema : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE SCHEMA IF NOT EXISTS blockchain;

            -- 1. blockchain.anchor_policies
            CREATE TABLE IF NOT EXISTS blockchain.anchor_policies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                entity_type VARCHAR(50) UNIQUE NOT NULL,
                display_name VARCHAR(150) NOT NULL,
                is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                trigger_status VARCHAR(50) NOT NULL,
                json_fields_expression VARCHAR(500) NOT NULL,
                batch_size_threshold INT NOT NULL DEFAULT 10 CHECK (batch_size_threshold >= 1 AND batch_size_threshold <= 500),
                batch_timeout_minutes INT NOT NULL DEFAULT 5 CHECK (batch_timeout_minutes >= 1 AND batch_timeout_minutes <= 60),
                version INT NOT NULL DEFAULT 1,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                legacy_source_system VARCHAR(50) NULL,
                legacy_source_table VARCHAR(80) NULL,
                legacy_id VARCHAR(100) NULL,
                legacy_source_hash VARCHAR(64) NULL,
                legacy_migrated_at TIMESTAMPTZ NULL,
                legacy_mapping_version VARCHAR(30) NULL,
                legacy_batch_id UUID NULL
            );

            CREATE UNIQUE INDEX IF NOT EXISTS ix_anchor_policies_entity_type_unique ON blockchain.anchor_policies (entity_type);

            -- 2. blockchain.ledger_blocks
            CREATE TABLE IF NOT EXISTS blockchain.ledger_blocks (
                block_number BIGINT PRIMARY KEY,
                block_hash VARCHAR(66) UNIQUE NOT NULL,
                previous_hash VARCHAR(66) NOT NULL,
                merkle_root VARCHAR(66) NOT NULL,
                tx_count INT NOT NULL CHECK (tx_count >= 0),
                validator_address VARCHAR(100) NOT NULL,
                block_signature TEXT NOT NULL,
                status VARCHAR(30) NOT NULL DEFAULT 'COMMITTED',
                nda_chain_tx_hash VARCHAR(66) NULL,
                nda_chain_block_number BIGINT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                confirmed_at TIMESTAMPTZ NULL
            );

            CREATE UNIQUE INDEX IF NOT EXISTS ix_ledger_blocks_block_hash ON blockchain.ledger_blocks (block_hash);
            CREATE INDEX IF NOT EXISTS ix_ledger_blocks_status ON blockchain.ledger_blocks (status);

            -- 3. blockchain.zk_proof_vault
            CREATE TABLE IF NOT EXISTS blockchain.zk_proof_vault (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                anchor_record_id UUID NOT NULL,
                proof_scheme VARCHAR(50) NOT NULL DEFAULT 'Groth16_BN254',
                commitment_hash VARCHAR(66) NOT NULL,
                salt_ciphertext VARCHAR(500) NOT NULL,
                proof_envelope JSONB NOT NULL,
                public_signals JSONB NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );

            CREATE INDEX IF NOT EXISTS ix_zk_proof_vault_commitment ON blockchain.zk_proof_vault (commitment_hash);
            CREATE INDEX IF NOT EXISTS ix_zk_proof_vault_anchor_record_id ON blockchain.zk_proof_vault (anchor_record_id);

            -- 4. blockchain.anchor_records
            CREATE TABLE IF NOT EXISTS blockchain.anchor_records (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                entity_type VARCHAR(50) NOT NULL,
                entity_id UUID NOT NULL,
                entity_code VARCHAR(50) NOT NULL,
                schema_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
                commitment_hash VARCHAR(66) NOT NULL,
                raw_data_hash VARCHAR(66) NOT NULL,
                zk_vault_id UUID NULL REFERENCES blockchain.zk_proof_vault(id) ON DELETE SET NULL,
                ledger_block_number BIGINT NULL REFERENCES blockchain.ledger_blocks(block_number) ON DELETE RESTRICT,
                tx_index_in_block INT NULL,
                merkle_path JSONB NULL,
                status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                anchored_at TIMESTAMPTZ NULL,
                version INT NOT NULL DEFAULT 1,
                legacy_source_system VARCHAR(50) NULL,
                legacy_source_table VARCHAR(80) NULL,
                legacy_id VARCHAR(100) NULL,
                legacy_source_hash VARCHAR(64) NULL,
                legacy_migrated_at TIMESTAMPTZ NULL,
                legacy_mapping_version VARCHAR(30) NULL,
                legacy_batch_id UUID NULL,
                CONSTRAINT uq_anchor_records_entity UNIQUE (entity_type, entity_id)
            );

            CREATE INDEX IF NOT EXISTS ix_anchor_records_status_created_at ON blockchain.anchor_records (status, created_at);
            CREATE INDEX IF NOT EXISTS ix_anchor_records_block_number ON blockchain.anchor_records (ledger_block_number);

            -- 5. blockchain.bridge_sync_logs
            CREATE TABLE IF NOT EXISTS blockchain.bridge_sync_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                ledger_block_number BIGINT NOT NULL REFERENCES blockchain.ledger_blocks(block_number),
                nda_chain_endpoint VARCHAR(255) NOT NULL,
                rpc_method VARCHAR(50) NOT NULL,
                request_tx_hash VARCHAR(66) NULL,
                http_status_code INT NULL,
                status VARCHAR(30) NOT NULL,
                error_message TEXT NULL,
                retry_count INT NOT NULL DEFAULT 0,
                triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                completed_at TIMESTAMPTZ NULL
            );

            CREATE INDEX IF NOT EXISTS ix_bridge_sync_logs_block_number ON blockchain.bridge_sync_logs (ledger_block_number);
            CREATE INDEX IF NOT EXISTS ix_bridge_sync_logs_status ON blockchain.bridge_sync_logs (status);

            -- Seed initial policies for standard entities if not exist
            INSERT INTO blockchain.anchor_policies (id, entity_type, display_name, is_enabled, trigger_status, json_fields_expression, batch_size_threshold, batch_timeout_minutes, version, created_at, updated_at)
            VALUES 
                (gen_random_uuid(), 'SELLER_OFFER', 'Chào bán công nghệ', TRUE, 'APPROVED', '$.id,$.title,$.sellerId,$.price,$.status', 10, 5, 1, now(), now()),
                (gen_random_uuid(), 'DEAL_ROOM_MOU', 'Biên bản ghi nhớ Deal Room', TRUE, 'MOU_SIGNED', '$.id,$.dealId,$.mouCode,$.buyerId,$.sellerId,$.agreedPrice', 10, 5, 1, now(), now()),
                (gen_random_uuid(), 'TT17_ASSESSMENT', 'Kết quả thẩm định TT17', TRUE, 'QUALIFIED', '$.id,$.assessmentCode,$.totalScore,$.verdict,$.assessedAt', 10, 5, 1, now(), now())
            ON CONFLICT (entity_type) DO NOTHING;
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP SCHEMA IF EXISTS blockchain CASCADE;
        """);
    }
}
