using System.Security.Cryptography;
using NacenTech.Modules.Blockchain.Application.Ports;
using NacenTech.Modules.Blockchain.Application.Services;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public class BlockchainMerkleTreeTests
{
    private readonly BinaryMerkleTreeEngine _engine = new();

    private static string GenerateDummyHash(int seed)
    {
        byte[] bytes = BitConverter.GetBytes(seed);
        byte[] hash = SHA256.HashData(bytes);
        return "0x" + Convert.ToHexStringLower(hash);
    }

    [Fact]
    public void Empty_leaf_list_returns_empty_root()
    {
        var result = _engine.BuildTree([]);
        result.RootHash.ShouldBe(BinaryMerkleTreeEngine.EmptyRoot);
        result.LeafCount.ShouldBe(0);
        result.AuditPaths.Count.ShouldBe(0);
    }

    [Fact]
    public void Single_leaf_tree_verifies_successfully()
    {
        string leaf = GenerateDummyHash(42);
        var result = _engine.BuildTree([leaf]);

        result.RootHash.ShouldBe(leaf);
        result.LeafCount.ShouldBe(1);
        result.AuditPaths.Count.ShouldBe(1);

        bool isValid = _engine.VerifyAuditPath(leaf, result.RootHash, result.AuditPaths[0]);
        isValid.ShouldBeTrue();
    }

    [Fact]
    public void Two_leaves_tree_calculates_and_verifies_audit_paths()
    {
        string leaf0 = GenerateDummyHash(1);
        string leaf1 = GenerateDummyHash(2);

        var result = _engine.BuildTree([leaf0, leaf1]);

        string expectedRoot = BinaryMerkleTreeEngine.HashPair(leaf0, leaf1);
        result.RootHash.ShouldBe(expectedRoot);
        result.LeafCount.ShouldBe(2);

        // Verify Leaf 0 (sibling là Leaf 1 nằm bên Phải "R")
        _engine.VerifyAuditPath(leaf0, result.RootHash, result.AuditPaths[0]).ShouldBeTrue();

        // Verify Leaf 1 (sibling là Leaf 0 nằm bên Trái "L")
        _engine.VerifyAuditPath(leaf1, result.RootHash, result.AuditPaths[1]).ShouldBeTrue();
    }

    [Fact]
    public void Seven_leaves_tree_with_odd_leaf_duplication_verifies_all_leaves()
    {
        var leaves = Enumerable.Range(1, 7).Select(GenerateDummyHash).ToList();
        var result = _engine.BuildTree(leaves);

        result.LeafCount.ShouldBe(7);
        result.AuditPaths.Count.ShouldBe(7);

        for (int i = 0; i < leaves.Count; i++)
        {
            bool ok = _engine.VerifyAuditPath(leaves[i], result.RootHash, result.AuditPaths[i]);
            ok.ShouldBeTrue($"Audit path for leaf {i} must be valid.");
        }
    }

    [Fact]
    public void Hundred_leaves_tree_verifies_100_percent_of_audit_paths()
    {
        var leaves = Enumerable.Range(1, 100).Select(GenerateDummyHash).ToList();
        var result = _engine.BuildTree(leaves);

        result.LeafCount.ShouldBe(100);
        result.AuditPaths.Count.ShouldBe(100);

        for (int i = 0; i < leaves.Count; i++)
        {
            bool ok = _engine.VerifyAuditPath(leaves[i], result.RootHash, result.AuditPaths[i]);
            ok.ShouldBeTrue($"Audit path for leaf {i} in 100-leaf tree must be valid.");
        }
    }

    [Fact]
    public void Tampered_leaf_or_audit_path_fails_verification()
    {
        var leaves = Enumerable.Range(1, 4).Select(GenerateDummyHash).ToList();
        var result = _engine.BuildTree(leaves);

        // 1. Cố tình thay đổi 1 ký tự trong leaf hash
        string tamperedLeaf = leaves[0][..^1] + (leaves[0][^1] == 'a' ? 'b' : 'a');
        bool isValidTamperedLeaf = _engine.VerifyAuditPath(tamperedLeaf, result.RootHash, result.AuditPaths[0]);
        isValidTamperedLeaf.ShouldBeFalse();

        // 2. Cố tình sửa đổi 1 sibling hash trong audit path
        var tamperedPath = result.AuditPaths[0].Select(node =>
            new MerklePathNode(node.Position, node.Hash[..^1] + (node.Hash[^1] == '0' ? '1' : '0'))
        ).ToList();

        bool isValidTamperedPath = _engine.VerifyAuditPath(leaves[0], result.RootHash, tamperedPath);
        isValidTamperedPath.ShouldBeFalse();
    }
}
