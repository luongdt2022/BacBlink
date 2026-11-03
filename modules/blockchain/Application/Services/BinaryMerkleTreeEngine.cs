using System.Security.Cryptography;
using NacenTech.Modules.Blockchain.Application.Ports;

namespace NacenTech.Modules.Blockchain.Application.Services;

/// <summary>
/// Động cơ dựng cây Merkle nhị phân cân bằng (Binary Merkle Tree) và sinh đường dẫn Audit Path O(log N).
/// Tuân thủ quy chuẩn toán học:
/// - Nếu số lá ở một tầng là lẻ, nhân đôi lá cuối cùng.
/// - Nút cha H = SHA-256(Left_Bytes || Right_Bytes).
/// </summary>
public sealed class BinaryMerkleTreeEngine : IMerkleTreeEngine
{
    public const string EmptyRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";

    public MerkleTreeResult BuildTree(IReadOnlyList<string> leafHashes)
    {
        ArgumentNullException.ThrowIfNull(leafHashes);

        if (leafHashes.Count == 0)
        {
            return new MerkleTreeResult(EmptyRoot, 0, []);
        }

        var normalizedLeaves = leafHashes.Select(NormalizeHex).ToList();

        if (normalizedLeaves.Count == 1)
        {
            return new MerkleTreeResult(
                normalizedLeaves[0],
                1,
                new List<IReadOnlyList<MerklePathNode>> { Array.Empty<MerklePathNode>() }
            );
        }

        // Lưu lại toàn bộ các tầng của cây Merkle để sinh Audit Path
        var layers = new List<List<string>>();
        var currentLayer = new List<string>(normalizedLeaves);
        layers.Add(new List<string>(currentLayer));

        while (currentLayer.Count > 1)
        {
            if (currentLayer.Count % 2 != 0)
            {
                currentLayer.Add(currentLayer[^1]);
            }

            var nextLayer = new List<string>();
            for (int i = 0; i < currentLayer.Count; i += 2)
            {
                string parentHash = HashPair(currentLayer[i], currentLayer[i + 1]);
                nextLayer.Add(parentHash);
            }

            layers.Add(nextLayer);
            currentLayer = nextLayer;
        }

        string rootHash = currentLayer[0];

        // Dựng Audit Path cho từng lá gốc ban đầu (từ 0 đến normalizedLeaves.Count - 1)
        var auditPaths = new List<IReadOnlyList<MerklePathNode>>();
        for (int leafIdx = 0; leafIdx < normalizedLeaves.Count; leafIdx++)
        {
            var path = new List<MerklePathNode>();
            int currentIndex = leafIdx;

            // Duyệt từ tầng lá lên tầng kế cuối (trước tầng Root)
            for (int layerIdx = 0; layerIdx < layers.Count - 1; layerIdx++)
            {
                var layer = layers[layerIdx];
                int layerCount = layer.Count;
                if (layerCount % 2 != 0)
                {
                    // Lớp có số phần tử lẻ đã được đệm thêm phần tử cuối
                    layerCount++;
                }

                bool isRightNode = (currentIndex % 2 != 0);
                int siblingIndex = isRightNode ? (currentIndex - 1) : (currentIndex + 1);

                string siblingHash;
                if (siblingIndex < layer.Count)
                {
                    siblingHash = layer[siblingIndex];
                }
                else
                {
                    // Trường hợp phần tử cuối cùng tự bắt cặp với chính nó
                    siblingHash = layer[currentIndex];
                }

                // Nếu sibling là nút bên trái, người verify sẽ ghép: sibling (L) + current
                // Nếu sibling là nút bên phải, người verify sẽ ghép: current + sibling (R)
                string position = isRightNode ? "L" : "R";
                path.Add(new MerklePathNode(position, siblingHash));

                currentIndex /= 2;
            }

            auditPaths.Add(path);
        }

        return new MerkleTreeResult(rootHash, normalizedLeaves.Count, auditPaths);
    }

    public bool VerifyAuditPath(string leafHash, string rootHash, IReadOnlyList<MerklePathNode> auditPath)
    {
        ArgumentNullException.ThrowIfNull(leafHash);
        ArgumentNullException.ThrowIfNull(rootHash);
        ArgumentNullException.ThrowIfNull(auditPath);

        string current = NormalizeHex(leafHash);
        string normalizedRoot = NormalizeHex(rootHash);

        if (auditPath.Count == 0)
        {
            return string.Equals(current, normalizedRoot, StringComparison.OrdinalIgnoreCase);
        }

        foreach (var node in auditPath)
        {
            string sibling = NormalizeHex(node.Hash);
            if (string.Equals(node.Position, "L", StringComparison.OrdinalIgnoreCase))
            {
                // Sibling ở bên trái: Hash(sibling || current)
                current = HashPair(sibling, current);
            }
            else
            {
                // Sibling ở bên phải: Hash(current || sibling)
                current = HashPair(current, sibling);
            }
        }

        return string.Equals(current, normalizedRoot, StringComparison.OrdinalIgnoreCase);
    }

    public static string HashPair(string leftHex, string rightHex)
    {
        byte[] leftBytes = Convert.FromHexString(leftHex.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? leftHex[2..] : leftHex);
        byte[] rightBytes = Convert.FromHexString(rightHex.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? rightHex[2..] : rightHex);

        byte[] combined = new byte[leftBytes.Length + rightBytes.Length];
        Buffer.BlockCopy(leftBytes, 0, combined, 0, leftBytes.Length);
        Buffer.BlockCopy(rightBytes, 0, combined, leftBytes.Length, rightBytes.Length);

        byte[] hash = SHA256.HashData(combined);
        return "0x" + Convert.ToHexStringLower(hash);
    }

    private static string NormalizeHex(string hex)
    {
        if (string.IsNullOrWhiteSpace(hex))
        {
            return EmptyRoot;
        }

        string clean = hex.Trim();
        if (clean.StartsWith("0x", StringComparison.OrdinalIgnoreCase))
        {
            clean = clean[2..];
        }

        return "0x" + clean.ToLowerInvariant();
    }
}
