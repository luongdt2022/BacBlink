using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Blockchain.Api;
using NacenTech.Modules.Blockchain.Application.Ports;
using NacenTech.Modules.Blockchain.Application.Services;
using NacenTech.Modules.Blockchain.Infrastructure.Adapters;
using NacenTech.Modules.Blockchain.Infrastructure.Cryptography;
using NacenTech.Modules.Blockchain.Workers;
using NacenTech.Persistence;
using NacenTech.TestKit;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

[Collection("BlockchainDatabase")]
public class BlockchainControllersTests
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
    public async Task AdminController_WhenUnauthorized_Returns_Forbid()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var zk = new NativeZkProofEngine();
        var ledgerAdapter = new LocalSovereignLedgerAdapter(db, merkle, km);
        var ndaAdapter = new NdaChainGatewayAdapter(new HttpClient(), Microsoft.Extensions.Options.Options.Create(new NdaChainOptions()));
        var bridgeSync = new NdaChainBridgeSyncService(db, ndaAdapter, Microsoft.Extensions.Options.Options.Create(new NdaChainOptions()), Microsoft.Extensions.Logging.Abstractions.NullLogger<NdaChainBridgeSyncService>.Instance);
        var adminService = new BlockchainAdminService(db, ledgerAdapter, ndaAdapter, bridgeSync);

        // Giả lập user thường (không phải Admin)
        var nonAdminActor = new TestActor().AsUser(Guid.NewGuid());
        var controller = new BlockchainAdminController(adminService, nonAdminActor);

        var policiesResult = await controller.GetPolicies(CancellationToken.None);
        policiesResult.ShouldBeOfType<ForbidResult>();

        var blocksResult = await controller.GetBlocks();
        blocksResult.ShouldBeOfType<ForbidResult>();

        var flushResult = await controller.FlushBlock(CancellationToken.None);
        flushResult.ShouldBeOfType<ForbidResult>();

        var bridgeStatusResult = await controller.GetBridgeStatus(CancellationToken.None);
        bridgeStatusResult.ShouldBeOfType<ForbidResult>();

        var syncResult = await controller.TriggerBridgeSync(CancellationToken.None);
        syncResult.ShouldBeOfType<ForbidResult>();
    }

    [Fact]
    public async Task AdminController_WhenAdmin_Returns_200_OK()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var zk = new NativeZkProofEngine();
        var ledgerAdapter = new LocalSovereignLedgerAdapter(db, merkle, km);
        var ndaAdapter = new NdaChainGatewayAdapter(new HttpClient(), Microsoft.Extensions.Options.Options.Create(new NdaChainOptions()));
        var bridgeSync = new NdaChainBridgeSyncService(db, ndaAdapter, Microsoft.Extensions.Options.Options.Create(new NdaChainOptions()), Microsoft.Extensions.Logging.Abstractions.NullLogger<NdaChainBridgeSyncService>.Instance);
        var adminService = new BlockchainAdminService(db, ledgerAdapter, ndaAdapter, bridgeSync);

        // Giả lập Admin
        var adminActor = new TestActor().AsAdmin(Guid.NewGuid());
        var controller = new BlockchainAdminController(adminService, adminActor);

        var policiesResult = await controller.GetPolicies(CancellationToken.None);
        policiesResult.ShouldBeOfType<OkObjectResult>();

        var blocksResult = await controller.GetBlocks();
        blocksResult.ShouldBeOfType<OkObjectResult>();

        var bridgeStatusResult = await controller.GetBridgeStatus(CancellationToken.None);
        bridgeStatusResult.ShouldBeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task PublicController_VerifyLive_Endpoints_Function_Correctly()
    {
        await using var db = CreateTestDbContext();
        using var km = new PlatformKeyManager();
        var merkle = new BinaryMerkleTreeEngine();
        var zk = new NativeZkProofEngine();
        var verifyService = new BlockchainVerificationService(db, zk, merkle, km);

        var controller = new BlockchainPublicController(verifyService);

        // 1. Get status cho entity chưa neo -> 200 OK với verdict NOT_ANCHORED
        var getResult = await controller.GetEntityAnchorStatus("SELLER_OFFER", Guid.NewGuid(), CancellationToken.None);
        getResult.ShouldBeOfType<OkObjectResult>();

        // 2. Bad request khi thiếu entityId
        var badResult = await controller.VerifyLive(new LiveVerificationApiRequest("", Guid.Empty), CancellationToken.None);
        badResult.ShouldBeOfType<BadRequestObjectResult>();

        // 3. Valid verify live call -> 200 OK
        var liveResult = await controller.VerifyLive(new LiveVerificationApiRequest("SELLER_OFFER", Guid.NewGuid()), CancellationToken.None);
        liveResult.ShouldBeOfType<OkObjectResult>();
    }
}
