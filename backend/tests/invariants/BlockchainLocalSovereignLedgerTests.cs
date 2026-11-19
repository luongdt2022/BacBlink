using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using NacenTech.Modules.Blockchain.Application.Ports;
using NacenTech.Modules.Blockchain.Application.Services;
using NacenTech.Modules.Blockchain.Domain.Entities;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Domain.Invariants;
using NacenTech.Modules.Blockchain.Infrastructure.Adapters;
using NacenTech.Modules.Blockchain.Infrastructure.Cryptography;
using NacenTech.Persistence;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

[Collection("BlockchainDatabase")]
public class BlockchainLocalSovereignLedgerTests
{
    private const string ConnectionString = "Host=localhost;Port=55440;Database=baclink_dev;Username=postgres;Password=postgres";

    private static NacenTechDbContext CreateTestDbContext()
    {
        var options = new DbContextOptionsBuilder<NacenTechDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;
        return new NacenTechDbContext(options);
    }

    [Fact]
    public void PlatformKeyManager_Generates_Valid_Key_Address_And_Signature()
    {
        using var km = new PlatformKeyManager();

        km.ValidatorAddress.ShouldStartWith("0x");
        km.ValidatorAddress.Length.ShouldBe(42); // 0x + 40 hex

        km.PublicKeyHex.ShouldStartWith("0x04");
        km.PublicKeyHex.Length.ShouldBe(132); // 0x04 + 64 bytes = 132 chars

        var dummyHash = "0x" + Convert.ToHexStringLower(SHA256.HashData([1, 2, 3, 4]));
        var signature = km.SignHash(dummyHash);

        signature.ShouldStartWith("0x");

        // Verify with internal key
        km.VerifySignature(dummyHash, signature).ShouldBeTrue();

        // Verify with specified public key
        km.VerifySignature(dummyHash, signature, km.PublicKeyHex).ShouldBeTrue();

        // Tampered hash -> should fail
        var tamperedHash = "0x" + Convert.ToHexStringLower(SHA256.HashData([9, 9, 9, 9]));
        km.VerifySignature(tamperedHash, signature).ShouldBeFalse();
    }

    [Fact]
    public void PlatformKeyManager_CalculateBlockHash_Follows_Hash_Chaining_Rule()
    {
        using var km = new PlatformKeyManager();

        var hash1 = km.CalculateBlockHash(1, BlockchainBusinessRules.GenesisPreviousHash, "0x1111", 1700000000, 5);
        var hash2 = km.CalculateBlockHash(1, BlockchainBusinessRules.GenesisPreviousHash, "0x1111", 1700000000, 5);
        var hashDiffTx = km.CalculateBlockHash(1, BlockchainBusinessRules.GenesisPreviousHash, "0x1111", 1700000000, 6);

        hash1.ShouldStartWith("0x");
        hash1.Length.ShouldBe(66);
        hash1.ShouldBe(hash2);
        hash1.ShouldNotBe(hashDiffTx);
    }

    [Fact]
    public async Task LocalSovereignLedgerAdapter_GetStatus_Returns_Correct_Status()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var adapter = new LocalSovereignLedgerAdapter(db, merkle, km);

        var status = await adapter.GetStatusAsync();
        status.GatewayType.ShouldBe("LOCAL_SOVEREIGN_LEDGER");
        status.IsConnected.ShouldBeTrue();
        status.ValidatorAddress.ShouldBe(km.ValidatorAddress);
    }

    [Fact]
    public async Task LocalSovereignLedgerAdapter_FlushPendingRecords_Creates_Genesis_And_Block()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var adapter = new LocalSovereignLedgerAdapter(db, merkle, km);

        // Tạo 3 anchor records ở trạng thái PENDING với EntityId ngẫu nhiên
        var id1 = Guid.CreateVersion7();
        var id2 = Guid.CreateVersion7();
        var id3 = Guid.CreateVersion7();

        var rec1 = AnchorRecord.Create("SELLER_OFFER", id1, "TECH-" + id1.ToString()[..8], "0xaaaa1111", "0xraw1");
        var rec2 = AnchorRecord.Create("SELLER_OFFER", id2, "TECH-" + id2.ToString()[..8], "0xbbbb2222", "0xraw2");
        var rec3 = AnchorRecord.Create("SELLER_OFFER", id3, "TECH-" + id3.ToString()[..8], "0xcccc3333", "0xraw3");

        db.AnchorRecords.AddRange(rec1, rec2, rec3);
        await db.SaveChangesAsync();

        try
        {
            // Kích hoạt đóng khối
            var block = await adapter.FlushPendingRecordsToBlockAsync(maxBatchSize: 10);

            block.ShouldNotBeNull();
            block.TxCount.ShouldBeGreaterThanOrEqualTo(3);
            block.Status.ShouldBe(BlockStatus.COMMITTED);

            // Kiểm tra records đã được cập nhật
            var updatedRec1 = await db.AnchorRecords.FirstOrDefaultAsync(r => r.Id == rec1.Id);
            updatedRec1.ShouldNotBeNull();
            updatedRec1.Status.ShouldBe(AnchorStatus.LOCAL_LEDGER_ANCHORED);
            updatedRec1.LedgerBlockNumber.ShouldBe(block.BlockNumber);
            updatedRec1.MerklePathJson.ShouldNotBeNullOrWhiteSpace();

            // Kiểm chứng toán học audit path
            var pathNodes = System.Text.Json.JsonSerializer.Deserialize<IReadOnlyList<MerklePathNode>>(updatedRec1.MerklePathJson!)!;
            var verifyReq = new VerifyProofRequest(
                EntityType: updatedRec1.EntityType,
                EntityId: updatedRec1.EntityId,
                CommitmentHash: updatedRec1.CommitmentHash,
                MerkleRoot: block.MerkleRoot,
                MerklePath: pathNodes,
                BlockHash: block.BlockHash
            );

            var verifyResult = await adapter.VerifyProofAsync(verifyReq);
            verifyResult.IsVerified.ShouldBeTrue();
            verifyResult.Verdict.ShouldBe("VERIFIED");

            // Kịch bản đối kháng: Cố tình sửa commitmentHash -> phải ra TAMPERED
            var tamperedReq = verifyReq with { CommitmentHash = "0xdeadbeef" };
            var tamperedResult = await adapter.VerifyProofAsync(tamperedReq);
            tamperedResult.IsVerified.ShouldBeFalse();
            tamperedResult.Verdict.ShouldBe("TAMPERED");
        }
        finally
        {
            // Cleanup test records
            db.AnchorRecords.RemoveRange(rec1, rec2, rec3);
            await db.SaveChangesAsync();
        }
    }
}
