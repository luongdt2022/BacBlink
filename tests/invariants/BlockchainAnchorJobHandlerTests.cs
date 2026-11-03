using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
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
public class BlockchainAnchorJobHandlerTests
{
    private const string ConnectionString = "Host=localhost;Port=55440;Database=nacentech;Username=postgres;Password=postgres";

    private static NacenTechDbContext CreateTestDbContext()
    {
        var options = new DbContextOptionsBuilder<NacenTechDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;
        return new NacenTechDbContext(options);
    }

    [Fact]
    public async Task HandleAsync_WhenPolicyDisabled_DoesNotCreateRecord()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var zk = new NativeZkProofEngine();
        var adapter = new LocalSovereignLedgerAdapter(db, merkle, km);
        var handler = new BlockchainAnchorJobHandler(db, zk, adapter, NullLogger<BlockchainAnchorJobHandler>.Instance);

        var entityType = "DISABLED_ENTITY_" + Guid.NewGuid().ToString()[..8].ToUpperInvariant();
        var policy = AnchorPolicy.Create(entityType, "Disabled Entity", "APPROVED", "title,price", isEnabled: false);
        db.AnchorPolicies.Add(policy);
        await db.SaveChangesAsync();

        try
        {
            var entityId = Guid.CreateVersion7();
            var job = new BlockchainAnchorJob(entityType, entityId, "TEST-01");
            await handler.HandleAsync(job, CancellationToken.None);

            var createdRecord = await db.AnchorRecords.FirstOrDefaultAsync(r => r.EntityType == entityType && r.EntityId == entityId);
            createdRecord.ShouldBeNull();
        }
        finally
        {
            await db.AnchorPolicies.Where(p => p.EntityType == entityType).ExecuteDeleteAsync();
        }
    }

    [Fact]
    public async Task HandleAsync_Creates_Pending_Record_And_Flushes_When_Threshold_Met()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var zk = new NativeZkProofEngine();
        var adapter = new LocalSovereignLedgerAdapter(db, merkle, km);
        var handler = new BlockchainAnchorJobHandler(db, zk, adapter, NullLogger<BlockchainAnchorJobHandler>.Instance);

        var entityType = "TEST_BATCH_ENTITY_" + Guid.NewGuid().ToString()[..8].ToUpperInvariant();
        // Ngưỡng 2 bản ghi để kích hoạt tự động gom lô
        var policy = AnchorPolicy.Create(
            entityType,
            "Test Batch Entity",
            "APPROVED",
            "title,code",
            batchSizeThreshold: 2,
            batchTimeoutMinutes: 10
        );
        db.AnchorPolicies.Add(policy);
        await db.SaveChangesAsync();

        var id1 = Guid.CreateVersion7();
        var id2 = Guid.CreateVersion7();

        try
        {
            // 1. Enqueue Job 1
            var job1 = new BlockchainAnchorJob(entityType, id1, "JOB-01", "APPROVED", "{\"title\":\"Item 1\"}");
            await handler.HandleAsync(job1, CancellationToken.None);

            var record1 = await db.AnchorRecords.FirstOrDefaultAsync(r => r.EntityType == entityType && r.EntityId == id1);
            record1.ShouldNotBeNull();
            // Chưa đủ ngưỡng 2 nên vẫn PENDING
            record1.Status.ShouldBe(AnchorStatus.PENDING);

            // Kiểm tra Idempotency: Gửi lại job 1 -> không tạo mới, không đổi trạng thái
            await handler.HandleAsync(job1, CancellationToken.None);
            var countForJob1 = await db.AnchorRecords.CountAsync(r => r.EntityType == entityType && r.EntityId == id1);
            countForJob1.ShouldBe(1);

            // 2. Enqueue Job 2 (đạt ngưỡng 2)
            var job2 = new BlockchainAnchorJob(entityType, id2, "JOB-02", "APPROVED", "{\"title\":\"Item 2\"}");
            await handler.HandleAsync(job2, CancellationToken.None);

            // Cả 2 bản ghi phải được tự động flush vào block và chuyển sang LOCAL_LEDGER_ANCHORED
            var updatedRec1 = await db.AnchorRecords.FirstOrDefaultAsync(r => r.EntityType == entityType && r.EntityId == id1);
            var updatedRec2 = await db.AnchorRecords.FirstOrDefaultAsync(r => r.EntityType == entityType && r.EntityId == id2);

            updatedRec1.ShouldNotBeNull();
            updatedRec2.ShouldNotBeNull();

            updatedRec1.Status.ShouldBe(AnchorStatus.LOCAL_LEDGER_ANCHORED);
            updatedRec2.Status.ShouldBe(AnchorStatus.LOCAL_LEDGER_ANCHORED);

            updatedRec1.LedgerBlockNumber.ShouldNotBeNull();
            updatedRec2.LedgerBlockNumber.ShouldBe(updatedRec1.LedgerBlockNumber);
        }
        finally
        {
            var recIds = await db.AnchorRecords.Where(r => r.EntityType == entityType).Select(r => r.Id).ToListAsync();
            if (recIds.Count > 0)
            {
                await db.ZkProofVaultRecords.Where(v => recIds.Contains(v.AnchorRecordId)).ExecuteDeleteAsync();
            }
            await db.AnchorRecords.Where(r => r.EntityType == entityType).ExecuteDeleteAsync();
            await db.AnchorPolicies.Where(p => p.EntityType == entityType).ExecuteDeleteAsync();
        }
    }
}
