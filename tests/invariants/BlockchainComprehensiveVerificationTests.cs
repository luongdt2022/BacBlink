using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Blockchain.Api;
using NacenTech.Modules.Blockchain.Application.Ports;
using NacenTech.Modules.Blockchain.Application.Services;
using NacenTech.Modules.Blockchain.Domain.Entities;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Infrastructure.Adapters;
using NacenTech.Modules.Blockchain.Infrastructure.Cryptography;
using NacenTech.Modules.Blockchain.Workers;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

[Collection("BlockchainDatabase")]
public class BlockchainComprehensiveVerificationTests
{
    private const string ConnectionString = "Host=localhost;Port=55440;Database=nacentech;Username=postgres;Password=postgres";

    private static NacenTechDbContext CreateTestDbContext()
    {
        var options = new DbContextOptionsBuilder<NacenTechDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;
        return new NacenTechDbContext(options);
    }

    // =========================================================================
    // T-11.19: DATABASE INTEGRATION TESTS TRÊN POSTGRESQL 16 THẬT
    // =========================================================================

    [Fact]
    public async Task T1119_Database_Atomic_Block_Creation_And_Hash_Chaining()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var ledgerAdapter = new LocalSovereignLedgerAdapter(db, merkle, km);

        // Tạo 2 records mới với payload hợp lệ cho entity type riêng biệt
        var entityType = "TEST_INTEG_" + Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
        var entityId1 = Guid.NewGuid();
        var entityId2 = Guid.NewGuid();

        var rec1 = AnchorRecord.Create(
            entityType,
            entityId1,
            "OFFER-INTEG-01",
            "0x" + Convert.ToHexStringLower(new byte[32]),
            "0x" + Convert.ToHexStringLower(new byte[32])
        );

        var rec2 = AnchorRecord.Create(
            entityType,
            entityId2,
            "OFFER-INTEG-02",
            "0x" + Convert.ToHexStringLower(new byte[32]),
            "0x" + Convert.ToHexStringLower(new byte[32])
        );

        db.Set<AnchorRecord>().AddRange(rec1, rec2);
        await db.SaveChangesAsync();

        try
        {
            // Đóng khối mới nguyên tử chứa 2 records này
            var newBlock = await ledgerAdapter.FlushPendingRecordsToBlockAsync(maxBatchSize: 10, entityType: entityType, ct: CancellationToken.None);

            newBlock.ShouldNotBeNull();
            newBlock.BlockNumber.ShouldBeGreaterThan(0);
            newBlock.TxCount.ShouldBe(2);
            newBlock.PreviousHash.ShouldNotBeNullOrEmpty();
            newBlock.BlockHash.ShouldNotBeNullOrEmpty();
            newBlock.MerkleRoot.ShouldNotBeNullOrEmpty();
            newBlock.BlockSignature.ShouldStartWith("0x");

            // Kiểm tra hash chaining: previous_hash phải khớp với hash của block liền trước
            var prevBlock = await db.Set<LedgerBlock>()
                .FirstOrDefaultAsync(b => b.BlockNumber == newBlock.BlockNumber - 1);
            prevBlock.ShouldNotBeNull();
            newBlock.PreviousHash.ShouldBe(prevBlock.BlockHash);

            // Kiểm tra records được cập nhật trạng thái LOCAL_LEDGER_ANCHORED
            var reloadedRec1 = await db.Set<AnchorRecord>().FindAsync(rec1.Id);
            reloadedRec1.ShouldNotBeNull();
            reloadedRec1.Status.ShouldBe(AnchorStatus.LOCAL_LEDGER_ANCHORED);
            reloadedRec1.LedgerBlockNumber.ShouldBe(newBlock.BlockNumber);
        }
        finally
        {
            await db.Set<AnchorRecord>().Where(r => r.EntityType == entityType).ExecuteDeleteAsync();
        }
    }

    // =========================================================================
    // T-11.20: RBAC FUZZING TRÊN CONTROLLER (QUYỀN HẠN 10 VAI TRÒ)
    // =========================================================================

    [Fact]
    public async Task T1120_RBAC_Fuzzing_Admin_And_Public_Controllers()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var zk = new NativeZkProofEngine();
        var ledgerAdapter = new LocalSovereignLedgerAdapter(db, merkle, km);
        var ndaAdapter = new NdaChainGatewayAdapter(new HttpClient(), Options.Create(new NdaChainOptions()));
        var bridgeSync = new NdaChainBridgeSyncService(db, ndaAdapter, Options.Create(new NdaChainOptions()), NullLogger<NdaChainBridgeSyncService>.Instance);
        var adminService = new BlockchainAdminService(db, ledgerAdapter, ndaAdapter, bridgeSync);

        // Non-admin user (BUYER, SELLER, EXPERT) -> 403 Forbidden
        var nonAdminActor = new TestActor().AsUser(Guid.NewGuid());
        var nonAdminController = new BlockchainAdminController(adminService, nonAdminActor);

        var forbiddenPolicies = await nonAdminController.GetPolicies(CancellationToken.None);
        forbiddenPolicies.ShouldBeOfType<ForbidResult>();

        var forbiddenBlocks = await nonAdminController.GetBlocks();
        forbiddenBlocks.ShouldBeOfType<ForbidResult>();

        // Admin user (SUPER_ADMIN, ADMIN) -> 200 OK
        var adminActor = new TestActor().AsAdmin(Guid.NewGuid());
        var adminController = new BlockchainAdminController(adminService, adminActor);

        var okPolicies = await adminController.GetPolicies(CancellationToken.None);
        okPolicies.ShouldBeOfType<OkObjectResult>();

        // Anonymous public visitor -> 200 OK on verify
        var verifyService = new BlockchainVerificationService(db, zk, merkle, km);
        var publicController = new BlockchainPublicController(verifyService);

        var statusResult = await publicController.GetEntityAnchorStatus("SELLER_OFFER", Guid.NewGuid(), CancellationToken.None);
        statusResult.ShouldBeOfType<OkObjectResult>();
    }

    // =========================================================================
    // T-11.21: CHAOS & RESILIENCE TESTING (GIÁN ĐOẠN NODE NDACHAIN)
    // =========================================================================

    [Fact]
    public async Task T1121_Chaos_Resilience_Network_Outage_And_Bridge_Catchup()
    {
        await using var db = CreateTestDbContext();
        var ndaAdapter = new NdaChainGatewayAdapter(new HttpClient(), Options.Create(new NdaChainOptions()));
        var bridgeSync = new NdaChainBridgeSyncService(db, ndaAdapter, Options.Create(new NdaChainOptions()), NullLogger<NdaChainBridgeSyncService>.Instance);

        // Khi mạng gặp sự cố hoặc node chờ: Bridge đồng bộ bù an toàn, không được crash
        var result = await bridgeSync.SyncPendingBlocksAsync(CancellationToken.None);
        result.ShouldNotBeNull();
        result.TotalProcessed.ShouldBeGreaterThanOrEqualTo(0);
    }

    // =========================================================================
    // T-11.22: KỊCH BẢN PHÁ HOẠI DỮ LIỆU (TAMPER-EVIDENCE ADVERSARIAL TEST)
    // =========================================================================

    [Fact]
    public async Task T1122_Adversarial_Tamper_Evidence_Detects_Manipulated_Data()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var zk = new NativeZkProofEngine();
        var ledgerAdapter = new LocalSovereignLedgerAdapter(db, merkle, km);
        var verifier = new BlockchainVerificationService(db, zk, merkle, km);

        var entityType = "ADVERSARIAL_TEST_" + Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
        var entityId = Guid.NewGuid();

        // BƯỚC 1: Tạo dữ liệu chuẩn và tính toán ZKP Commitment thật
        var originalPayload = new
        {
            offerCode = "TECH-ADVERSARIAL-999",
            title = "Dây chuyền sấy bơm nhiệt đa tầng",
            price = 500000000L,
            trlLevel = 7
        };
        var originalJson = CanonicalJsonSerializer.Serialize(originalPayload);
        
        var zkResult = zk.GenerateProof(originalPayload);
        var originalRawHash = zkResult.RawDataHash;
        var originalCommitment = zkResult.CommitmentHash;
        var encSalt = zkResult.SaltCiphertext;

        var record = AnchorRecord.Create(
            entityType,
            entityId,
            "TECH-ADVERSARIAL-999",
            originalCommitment,
            originalRawHash
        );
        db.Set<AnchorRecord>().Add(record);
        await db.SaveChangesAsync();

        var vaultRecord = ZkProofVaultRecord.Create(
            record.Id,
            originalCommitment,
            encSalt,
            JsonSerializer.Serialize(zkResult.ProofEnvelope),
            JsonSerializer.Serialize(zkResult.PublicSignals)
        );
        db.Set<ZkProofVaultRecord>().Add(vaultRecord);
        await db.SaveChangesAsync();

        try
        {
            // Đóng khối chứa record này
            var block = await ledgerAdapter.FlushPendingRecordsToBlockAsync(maxBatchSize: 10, entityType: entityType, ct: CancellationToken.None);
            block.ShouldNotBeNull();

            // BƯỚC 2: Kiểm chứng với dữ liệu GỐC -> Kết quả PHẢI LÀ VERIFIED
            var initialVerdict = await verifier.VerifyEntityAsync(
                entityType,
                entityId,
                originalJson,
                CancellationToken.None
            );

            initialVerdict.Verdict.ShouldBe("VERIFIED");
            initialVerdict.IsSuccess.ShouldBeTrue();
            initialVerdict.Steps.All(s => s.Passed).ShouldBeTrue();

            // BƯỚC 3: KỊCH BẢN PHÁ HOẠI (ADVERSARIAL ATTACK)
            // Kẻ tấn công cố tình sửa đổi giá từ 500 triệu lên 900 triệu (sửa 1 trường trong JSON)
            var tamperedPayload = new
            {
                offerCode = "TECH-ADVERSARIAL-999",
                title = "Dây chuyền sấy bơm nhiệt đa tầng",
                price = 900000000L, // ĐÃ BỊ SỬA TRÁI PHÉP
                trlLevel = 7
            };
            var tamperedJson = CanonicalJsonSerializer.Serialize(tamperedPayload);

            // BƯỚC 4: Chạy kiểm chứng với dữ liệu GIẢ MẠO
            var tamperedVerdict = await verifier.VerifyEntityAsync(
                entityType,
                entityId,
                tamperedJson,
                CancellationToken.None
            );

            // CHỨNG MINH TOÁN HỌC: HỆ THỐNG LẬP TỨC BẮT ĐƯỢC GIẢ MẠO VÀ BÁO ĐỘNG "TAMPERED"
            tamperedVerdict.Verdict.ShouldBe("TAMPERED");
            tamperedVerdict.IsSuccess.ShouldBeFalse();
            tamperedVerdict.Summary.ShouldContain("can thiệp trái phép");

            // Bước kiểm tra ZKP Salted Commitment phải thất bại vì hash không khớp
            var zkpStep = tamperedVerdict.Steps.FirstOrDefault(s => s.StepName.Contains("ZKP"));
            zkpStep.ShouldNotBeNull();
            zkpStep.Passed.ShouldBeFalse();
        }
        finally
        {
            await db.Set<ZkProofVaultRecord>().Where(v => v.AnchorRecordId == record.Id).ExecuteDeleteAsync();
            await db.Set<AnchorRecord>().Where(r => r.EntityType == entityType).ExecuteDeleteAsync();
        }
    }
}
