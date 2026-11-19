using Microsoft.EntityFrameworkCore;
using NacenTech.Contracts.Jobs;
using NacenTech.Modules.Blockchain.Application.Services;
using NacenTech.Modules.Blockchain.Domain.Entities;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Infrastructure.Adapters;
using NacenTech.Modules.Blockchain.Infrastructure.Cryptography;
using NacenTech.Modules.Blockchain.Workers;
using NacenTech.Persistence;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

[Collection("BlockchainDatabase")]
public class BlockchainVerificationServiceTests
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
    public async Task VerifyEntityAsync_WhenNotAnchored_Returns_NOT_ANCHORED()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var zk = new NativeZkProofEngine();
        var service = new BlockchainVerificationService(db, zk, merkle, km);

        var nonExistentId = Guid.CreateVersion7();
        var result = await service.VerifyEntityAsync("SELLER_OFFER", nonExistentId);

        result.Verdict.ShouldBe("NOT_ANCHORED");
        result.IsSuccess.ShouldBeFalse();
        result.Steps.Count.ShouldBe(1);
        result.Steps[0].Passed.ShouldBeFalse();
    }

    [Fact]
    public async Task VerifyEntityAsync_WhenTampered_Payload_Returns_TAMPERED()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var zk = new NativeZkProofEngine();
        var adapter = new LocalSovereignLedgerAdapter(db, merkle, km);
        var jobHandler = new BlockchainAnchorJobHandler(db, zk, adapter, Microsoft.Extensions.Logging.Abstractions.NullLogger<BlockchainAnchorJobHandler>.Instance);
        var verifyService = new BlockchainVerificationService(db, zk, merkle, km);

        var entityType = "VERIFY_TEST_" + Guid.NewGuid().ToString()[..8].ToUpperInvariant();
        var policy = AnchorPolicy.Create(entityType, "Verify Test Entity", "APPROVED", "title,price", batchSizeThreshold: 1);
        db.AnchorPolicies.Add(policy);
        await db.SaveChangesAsync();

        var entityId = Guid.CreateVersion7();
        var originalPayload = "{\"title\":\"Original Tech 100%\",\"price\":500000000}";

        try
        {
            // 1. Đóng khối cho thực thể với payload gốc
            var job = new BlockchainAnchorJob(entityType, entityId, "VER-01", "APPROVED", originalPayload);
            await jobHandler.HandleAsync(job, CancellationToken.None);

            // 2. Kiểm chứng với payload gốc -> Phải ra VERIFIED
            var happyResult = await verifyService.VerifyEntityAsync(entityType, entityId, originalPayload);
            happyResult.Verdict.ShouldBe("VERIFIED");
            happyResult.IsSuccess.ShouldBeTrue();
            happyResult.Steps.Count.ShouldBe(4);
            happyResult.Steps.All(s => s.Passed).ShouldBeTrue();

            // 3. Phá hoại: Cố tình sửa giá tiền hoặc tiêu đề thành "Fake Tech"
            var tamperedPayload = "{\"title\":\"Original Tech 100%\",\"price\":999999999}"; // Giá bị sửa
            var tamperedResult = await verifyService.VerifyEntityAsync(entityType, entityId, tamperedPayload);

            tamperedResult.Verdict.ShouldBe("TAMPERED");
            tamperedResult.IsSuccess.ShouldBeFalse();
            // Bước 2 về Cam kết ZKP phải bị FAIL
            tamperedResult.Steps.Any(s => s.StepName.Contains("Cam kết") && !s.Passed).ShouldBeTrue();
        }
        finally
        {
            var recordIds = await db.AnchorRecords.Where(r => r.EntityType == entityType).Select(r => r.Id).ToListAsync();
            if (recordIds.Count > 0)
            {
                await db.ZkProofVaultRecords.Where(v => recordIds.Contains(v.AnchorRecordId)).ExecuteDeleteAsync();
            }
            await db.AnchorRecords.Where(r => r.EntityType == entityType).ExecuteDeleteAsync();
            await db.AnchorPolicies.Where(p => p.EntityType == entityType).ExecuteDeleteAsync();
        }
    }
}
