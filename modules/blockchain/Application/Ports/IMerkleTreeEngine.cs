namespace NacenTech.Modules.Blockchain.Application.Ports;

public sealed record MerklePathNode(string Position, string Hash);

public sealed record MerkleTreeResult(
    string RootHash,
    int LeafCount,
    IReadOnlyList<IReadOnlyList<MerklePathNode>> AuditPaths
);

public interface IMerkleTreeEngine
{
    MerkleTreeResult BuildTree(IReadOnlyList<string> leafHashes);
    bool VerifyAuditPath(string leafHash, string rootHash, IReadOnlyList<MerklePathNode> auditPath);
}
