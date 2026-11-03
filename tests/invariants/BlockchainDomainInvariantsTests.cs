using NacenTech.Kernel.Domain;
using NacenTech.Modules.Blockchain.Domain.Entities;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Domain.Invariants;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public class BlockchainDomainInvariantsTests
{
    [Fact]
    public void BR_BC_01_Entity_status_must_match_policy_trigger_status()
    {
        var policy = AnchorPolicy.Create(
            entityType: "SELLER_OFFER",
            displayName: "Chào bán công nghệ",
            triggerStatus: "APPROVED",
            jsonFieldsExpression: "$.offerId,$.title,$.price"
        );

        // Khớp trạng thái -> Hợp lệ
        Should.NotThrow(() => policy.ValidateEntityCanAnchor("APPROVED"));
        Should.NotThrow(() => policy.ValidateEntityCanAnchor("approved"));

        // Sai trạng thái -> Ném ValidationException mã BR_BC_01_INVALID_TRIGGER_STATUS
        var ex = Should.Throw<ValidationException>(() => policy.ValidateEntityCanAnchor("DRAFT"));
        ex.Code.ShouldBe(BlockchainBusinessRules.CodeBrBc01);
    }

    [Fact]
    public void BR_BC_02_Anchor_record_requires_valid_entity_type_and_id()
    {
        var entityId = Guid.NewGuid();
        var record = AnchorRecord.Create(
            entityType: "DEAL_ROOM_MOU",
            entityId: entityId,
            entityCode: "MOU-001",
            commitmentHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            rawDataHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
        );

        record.EntityType.ShouldBe("DEAL_ROOM_MOU");
        record.EntityId.ShouldBe(entityId);
        record.Status.ShouldBe(AnchorStatus.PENDING);

        // Guid rỗng -> Ném lỗi
        Should.Throw<ValidationException>(() =>
            AnchorRecord.Create(
                entityType: "DEAL_ROOM_MOU",
                entityId: Guid.Empty,
                entityCode: "MOU-001",
                commitmentHash: "0x1234",
                rawDataHash: "0xabcd"
            )
        );
    }

    [Fact]
    public void BR_BC_03_Genesis_block_requires_64_zeros_previous_hash()
    {
        // Khối Genesis #0 với 64 số 0 -> Hợp lệ
        var genesis = LedgerBlock.CreateGenesis(
            blockHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
            merkleRoot: "0x2222222222222222222222222222222222222222222222222222222222222222",
            validatorAddress: "0xNacenTechValidator01",
            blockSignature: "0xSignatureGenesis"
        );
        genesis.BlockNumber.ShouldBe(0);
        genesis.PreviousHash.ShouldBe(BlockchainBusinessRules.GenesisPreviousHash);

        // Kiểm tra phương thức trực tiếp với previous_hash sai
        var ex = Should.Throw<ValidationException>(() =>
            BlockchainBusinessRules.EnsureGenesisBlockValid(0, "0xRandomPreviousHash")
        );
        ex.Code.ShouldBe(BlockchainBusinessRules.CodeBrBc03);
    }

    [Fact]
    public void BR_BC_04_Block_number_must_increment_sequentially()
    {
        // Khối #0 lên #1 -> Hợp lệ
        var block1 = LedgerBlock.CreateNextBlock(
            previousBlockNumber: 0,
            previousBlockHash: "0xGenesisHash",
            newBlockNumber: 1,
            blockHash: "0xBlockHash1",
            merkleRoot: "0xMerkleRoot1",
            txCount: 10,
            validatorAddress: "0xValidator",
            blockSignature: "0xSignature1"
        );
        block1.BlockNumber.ShouldBe(1);

        // Khối #0 lên #3 (đứt đoạn) -> Ném lỗi BR_BC_04_DISCONTINUOUS_BLOCK_NUMBER
        var ex = Should.Throw<ValidationException>(() =>
            LedgerBlock.CreateNextBlock(
                previousBlockNumber: 0,
                previousBlockHash: "0xGenesisHash",
                newBlockNumber: 3,
                blockHash: "0xBlockHash3",
                merkleRoot: "0xMerkleRoot3",
                txCount: 10,
                validatorAddress: "0xValidator",
                blockSignature: "0xSignature3"
            )
        );
        ex.Code.ShouldBe(BlockchainBusinessRules.CodeBrBc04);
    }

    [Fact]
    public void BR_BC_05_Ledger_block_core_fields_are_immutable()
    {
        var block = LedgerBlock.CreateGenesis(
            blockHash: "0xGenesisHash",
            merkleRoot: "0xRoot",
            validatorAddress: "0xVal",
            blockSignature: "0xSig"
        );

        // Kiểm tra qua reflection: Không có public setter cho BlockHash, PreviousHash, MerkleRoot, BlockNumber
        typeof(LedgerBlock).GetProperty(nameof(LedgerBlock.BlockHash))!.SetMethod!.IsPublic.ShouldBeFalse();
        typeof(LedgerBlock).GetProperty(nameof(LedgerBlock.PreviousHash))!.SetMethod!.IsPublic.ShouldBeFalse();
        typeof(LedgerBlock).GetProperty(nameof(LedgerBlock.MerkleRoot))!.SetMethod!.IsPublic.ShouldBeFalse();
        typeof(LedgerBlock).GetProperty(nameof(LedgerBlock.BlockNumber))!.SetMethod!.IsPublic.ShouldBeFalse();
    }

    [Fact]
    public void BR_BC_06_Anchor_record_requires_block_signature_to_anchor()
    {
        var record = AnchorRecord.Create(
            entityType: "TT17_ASSESSMENT",
            entityId: Guid.NewGuid(),
            entityCode: "TT17-001",
            commitmentHash: "0xCommitment",
            rawDataHash: "0xRaw"
        );

        // Có chữ ký số hợp lệ -> Thành công chuyển sang LOCAL_LEDGER_ANCHORED
        record.AttachToBlock(
            blockNumber: 1,
            txIndex: 0,
            merklePathJson: "[]",
            blockSignature: "0xValidSignature"
        );
        record.Status.ShouldBe(AnchorStatus.LOCAL_LEDGER_ANCHORED);
        record.LedgerBlockNumber.ShouldBe(1);

        // Nếu chữ ký số rỗng hoặc null -> Ném lỗi BR_BC_06_BLOCK_SIGNATURE_REQUIRED
        var recordPending = AnchorRecord.Create(
            entityType: "TT17_ASSESSMENT",
            entityId: Guid.NewGuid(),
            entityCode: "TT17-002",
            commitmentHash: "0xCommitment2",
            rawDataHash: "0xRaw2"
        );
        var ex = Should.Throw<ValidationException>(() =>
            recordPending.AttachToBlock(
                blockNumber: 1,
                txIndex: 1,
                merklePathJson: "[]",
                blockSignature: ""
            )
        );
        ex.Code.ShouldBe(BlockchainBusinessRules.CodeBrBc06);
    }

    [Fact]
    public void BR_BC_07_Policy_update_enforces_concurrency_token()
    {
        var policy = AnchorPolicy.Create(
            entityType: "TECH_OFFER",
            displayName: "Chính sách chào bán",
            triggerStatus: "APPROVED",
            jsonFieldsExpression: "$.id"
        );
        policy.Version.ShouldBe(1);

        // Update với version đúng -> Thành công, version tăng lên 2
        policy.UpdateConfig(
            displayName: "Chính sách chào bán V2",
            triggerStatus: "APPROVED",
            jsonFieldsExpression: "$.id,$.price",
            batchSizeThreshold: 20,
            batchTimeoutMinutes: 10,
            expectedVersion: 1
        );
        policy.Version.ShouldBe(2);

        // Update với version sai (vd người khác đã sửa) -> Ném ConcurrencyException
        Should.Throw<ConcurrencyException>(() =>
            policy.UpdateConfig(
                displayName: "Chính sách chào bán V3",
                triggerStatus: "APPROVED",
                jsonFieldsExpression: "$.id,$.price",
                batchSizeThreshold: 20,
                batchTimeoutMinutes: 10,
                expectedVersion: 1
            )
        );
    }

    [Fact]
    public void BR_BC_08_Raw_PII_is_strictly_prohibited_in_string_fields()
    {
        // 1. Thử đưa email cá nhân vào entityCode
        var exEmail = Should.Throw<ValidationException>(() =>
            AnchorRecord.Create(
                entityType: "SELLER_OFFER",
                entityId: Guid.NewGuid(),
                entityCode: "OFFER-user@gmail.com",
                commitmentHash: "0xCommitment",
                rawDataHash: "0xRaw"
            )
        );
        exEmail.Code.ShouldBe(BlockchainBusinessRules.CodeBrBc08);

        // 2. Thử đưa số điện thoại di động VN vào entityCode
        var exPhone = Should.Throw<ValidationException>(() =>
            AnchorRecord.Create(
                entityType: "SELLER_OFFER",
                entityId: Guid.NewGuid(),
                entityCode: "OFFER-0987654321",
                commitmentHash: "0xCommitment",
                rawDataHash: "0xRaw"
            )
        );
        exPhone.Code.ShouldBe(BlockchainBusinessRules.CodeBrBc08);

        // 3. Thử đưa CCCD 12 số vào ZkProofVault
        var exCccd = Should.Throw<ValidationException>(() =>
            ZkProofVaultRecord.Create(
                anchorRecordId: Guid.NewGuid(),
                commitmentHash: "0xCommitment",
                saltCiphertext: "0xSalt",
                proofEnvelopeJson: "{\"citizenId\": \"001201000123\"}",
                publicSignalsJson: "[]"
            )
        );
        exCccd.Code.ShouldBe(BlockchainBusinessRules.CodeBrBc08);
    }
}
