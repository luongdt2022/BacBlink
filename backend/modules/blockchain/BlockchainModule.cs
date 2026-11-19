using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NacenTech.Kernel.Application;

namespace NacenTech.Modules.Blockchain;

public sealed class BlockchainModule : IModule
{
    public const string SchemaName = "blockchain";

    public string Name => "blockchain";
    public string Schema => SchemaName;
    public Assembly Assembly => typeof(BlockchainModule).Assembly;

    public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<Application.Ports.IMerkleTreeEngine, Application.Services.BinaryMerkleTreeEngine>();
        services.AddSingleton<Application.Ports.IZkProofService, Application.Services.NativeZkProofEngine>();
        services.AddSingleton<Infrastructure.Cryptography.IPlatformKeyManager, Infrastructure.Cryptography.PlatformKeyManager>();
        services.AddScoped<Infrastructure.Adapters.ILocalSovereignLedgerAdapter, Infrastructure.Adapters.LocalSovereignLedgerAdapter>();
        services.AddScoped<Application.Ports.IBlockchainAnchorGateway, Infrastructure.Adapters.LocalSovereignLedgerAdapter>();
        services.Configure<Infrastructure.Adapters.NdaChainOptions>(configuration.GetSection(Infrastructure.Adapters.NdaChainOptions.SectionName));
        services.AddHttpClient<Infrastructure.Adapters.INdaChainGatewayAdapter, Infrastructure.Adapters.NdaChainGatewayAdapter>();
        services.AddScoped<IJobHandler<NacenTech.Contracts.Jobs.BlockchainAnchorJob>, Workers.BlockchainAnchorJobHandler>();
        services.AddScoped<Workers.INdaChainBridgeSyncService, Workers.NdaChainBridgeSyncService>();
        services.AddHostedService<Workers.NdaChainBridgeSyncWorker>();
        services.AddScoped<Application.Services.IBlockchainVerificationService, Application.Services.BlockchainVerificationService>();
        services.AddScoped<Application.Services.IBlockchainAdminService, Application.Services.BlockchainAdminService>();
    }
}
