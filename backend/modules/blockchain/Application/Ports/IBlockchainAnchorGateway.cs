using NacenTech.Modules.Blockchain.Application.Ports;

namespace NacenTech.Modules.Blockchain.Application.Ports;

public sealed record GatewayStatusDto(
    string GatewayType,
    bool IsConnected,
    string EndpointOrMode,
    long CurrentBlockHeight,
    string ValidatorAddress,
    string? NetworkId = null
);

public sealed record AnchorMerkleRootPayload(
    long BlockNumber,
    string MerkleRoot,
    int TxCount,
    string PreviousHash,
    DateTimeOffset Timestamp,
    IReadOnlyList<string>? LeafHashes = null
);

public sealed record AnchorResultDto(
    bool IsSuccess,
    long BlockNumber,
    string BlockHash,
    string MerkleRoot,
    string? TxHash,
    string? BlockSignature,
    string? ValidatorAddress,
    string? ErrorMessage = null
);

public sealed record VerifyProofRequest(
    string EntityType,
    Guid EntityId,
    string CommitmentHash,
    string MerkleRoot,
    IReadOnlyList<MerklePathNode> MerklePath,
    string? BlockHash = null
);

public sealed record VerificationReceiptDto(
    bool IsVerified,
    string Verdict,
    string Details,
    string? TxHash = null,
    long? BlockNumber = null
);

public interface IBlockchainAnchorGateway
{
    string GatewayType { get; }
    Task<GatewayStatusDto> GetStatusAsync(CancellationToken ct = default);
    Task<AnchorResultDto> AnchorMerkleRootAsync(AnchorMerkleRootPayload payload, CancellationToken ct = default);
    Task<VerificationReceiptDto> VerifyProofAsync(VerifyProofRequest request, CancellationToken ct = default);
}
