using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using NacenTech.Modules.Blockchain.Application.Ports;
using NacenTech.Modules.Blockchain.Application.Services;
using NacenTech.Modules.Blockchain.Domain.Entities;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Domain.Invariants;
using NacenTech.Modules.Blockchain.Infrastructure.Adapters;
using NacenTech.Modules.Blockchain.Infrastructure.Cryptography;
using NacenTech.Modules.Blockchain.Workers;
using NacenTech.Persistence;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

[Collection("BlockchainDatabase")]
public class BlockchainNdaChainBridgeSyncTests
{
    private const string ConnectionString = "Host=localhost;Port=55440;Database=baclink_dev;Username=postgres;Password=postgres";

    private static NacenTechDbContext CreateTestDbContext()
    {
        var options = new DbContextOptionsBuilder<NacenTechDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;
        return new NacenTechDbContext(options);
    }

    private sealed class FakeNdaGateway(bool succeed, string? errorMessage = null) : INdaChainGatewayAdapter
    {
        public string GatewayType => "FAKE_NDACHAIN";

        public Task<GatewayStatusDto> GetStatusAsync(CancellationToken ct = default)
        {
            return Task.FromResult(new GatewayStatusDto("FAKE", true, "https://mock", 100, "0x123"));
        }

        public Task<AnchorResultDto> AnchorMerkleRootAsync(AnchorMerkleRootPayload payload, CancellationToken ct = default)
        {
            if (succeed)
            {
                return Task.FromResult(new AnchorResultDto(
                    IsSuccess: true,
                    BlockNumber: payload.BlockNumber,
                    BlockHash: payload.PreviousHash,
                    MerkleRoot: payload.MerkleRoot,
                    TxHash: "0xndachain_tx_" + payload.BlockNumber,
                    BlockSignature: null,
                    ValidatorAddress: "0xcontract"
                ));
            }
            return Task.FromResult(new AnchorResultDto(
                IsSuccess: false,
                BlockNumber: payload.BlockNumber,
                BlockHash: payload.PreviousHash,
                MerkleRoot: payload.MerkleRoot,
                TxHash: null,
                BlockSignature: null,
                ValidatorAddress: "0xcontract",
                ErrorMessage: errorMessage ?? "Network timeout"
            ));
        }

        public Task<VerificationReceiptDto> VerifyProofAsync(VerifyProofRequest request, CancellationToken ct = default)
        {
            return Task.FromResult(new VerificationReceiptDto(true, "VERIFIED", "OK"));
        }

        public string GenerateNdaDid(string taxCode, Guid entityId) => $"did:nda:{taxCode}:{entityId}";
        public string GenerateNdaTraceUid(string entityType, string entityCode, long blockNumber) => $"NDATrace-{entityType}-{entityCode}-B{blockNumber}";
        public byte[] EncodeAnchorMerkleRootAbi(string merkleRootHex, long blockNumber, string ndaDid, string ndaTraceUid) => [0x01, 0x02];
    }

    [Fact]
    public async Task SyncPendingBlocksAsync_WhenSuccessful_Updates_Block_Records_And_Logs()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var adapter = new LocalSovereignLedgerAdapter(db, merkle, km);

        var entityId = Guid.CreateVersion7();
        var record = AnchorRecord.Create("TEST_SYNC", entityId, "SYNC-01", "0xcommit", "0xraw");
        db.AnchorRecords.Add(record);
        await db.SaveChangesAsync();

        var createdBlock = await adapter.FlushPendingRecordsToBlockAsync(10, "TEST_SYNC");
        createdBlock.ShouldNotBeNull();
        long testBlockNum = createdBlock.BlockNumber;

        try
        {
            var fakeGateway = new FakeNdaGateway(succeed: true);
            var options = Options.Create(new NdaChainOptions { RpcEndpoint = "https://mock-bca.gov.vn" });
            var service = new NdaChainBridgeSyncService(db, fakeGateway, options, NullLogger<NdaChainBridgeSyncService>.Instance);

            var result = await service.SyncPendingBlocksAsync(CancellationToken.None);

            result.Succeeded.ShouldBeGreaterThanOrEqualTo(1);

            // Kiểm tra block đã cập nhật sang NDACHAIN_SYNCED
            var updatedBlock = await db.LedgerBlocks.FirstOrDefaultAsync(b => b.BlockNumber == testBlockNum);
            updatedBlock.ShouldNotBeNull();
            updatedBlock.Status.ShouldBe(BlockStatus.NDACHAIN_SYNCED);
            updatedBlock.NdaChainTxHash.ShouldStartWith("0xndachain_tx_");

            // Kiểm tra record chuyển sang NDACHAIN_CONFIRMED
            var updatedRecord = await db.AnchorRecords.FirstOrDefaultAsync(r => r.Id == record.Id);
            updatedRecord.ShouldNotBeNull();
            updatedRecord.Status.ShouldBe(AnchorStatus.NDACHAIN_CONFIRMED);

            // Kiểm tra log ghi nhận SUCCESS
            var log = await db.BridgeSyncLogs.FirstOrDefaultAsync(l => l.LedgerBlockNumber == testBlockNum);
            log.ShouldNotBeNull();
            log.Status.ShouldBe(BridgeSyncStatus.SUCCESS);
            log.HttpStatusCode.ShouldBe(200);
        }
        finally
        {
            await db.BridgeSyncLogs.Where(l => l.LedgerBlockNumber == testBlockNum).ExecuteDeleteAsync();
            await db.AnchorRecords.Where(r => r.Id == record.Id).ExecuteDeleteAsync();
            await db.LedgerBlocks.Where(b => b.BlockNumber == testBlockNum).ExecuteDeleteAsync();
        }
    }
}
