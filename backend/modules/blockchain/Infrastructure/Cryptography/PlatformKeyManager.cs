using System.Security.Cryptography;
using System.Text;

namespace NacenTech.Modules.Blockchain.Infrastructure.Cryptography;

public interface IPlatformKeyManager
{
    string ValidatorAddress { get; }
    string PublicKeyHex { get; }
    string SignHash(string hashHex);
    string SignBytes(byte[] data);
    bool VerifySignature(string hashHex, string signatureHex, string? publicKeyHex = null);
    string CalculateBlockHash(long blockNumber, string previousHash, string merkleRoot, long timestampUnixSeconds, int txCount);
}

public sealed class PlatformKeyManager : IPlatformKeyManager, IDisposable
{
    private readonly ECDsa _ecdsa;
    private readonly string _publicKeyHex;
    private readonly string _validatorAddress;

    public PlatformKeyManager(string? privateKeyHex = null)
    {
        _ecdsa = ECDsa.Create(ECCurve.NamedCurves.nistP256);

        if (!string.IsNullOrWhiteSpace(privateKeyHex))
        {
            var rawKey = Convert.FromHexString(privateKeyHex.StartsWith("0x", StringComparison.OrdinalIgnoreCase) 
                ? privateKeyHex[2..] 
                : privateKeyHex);
            _ecdsa.ImportECPrivateKey(rawKey, out _);
        }

        var pubParams = _ecdsa.ExportParameters(false);
        var qx = pubParams.Q.X ?? throw new InvalidOperationException("Invalid ECDSA public key X.");
        var qy = pubParams.Q.Y ?? throw new InvalidOperationException("Invalid ECDSA public key Y.");
        
        // Uncompressed EC point: 0x04 || X || Y
        var pubKeyBytes = new byte[1 + qx.Length + qy.Length];
        pubKeyBytes[0] = 0x04;
        Buffer.BlockCopy(qx, 0, pubKeyBytes, 1, qx.Length);
        Buffer.BlockCopy(qy, 0, pubKeyBytes, 1 + qx.Length, qy.Length);
        
        _publicKeyHex = "0x" + Convert.ToHexString(pubKeyBytes).ToLowerInvariant();

        // Validator Address: 0x + first 20 bytes of SHA-256(PublicKey)
        var pubHash = SHA256.HashData(pubKeyBytes);
        var addrBytes = new byte[20];
        Buffer.BlockCopy(pubHash, 12, addrBytes, 0, 20);
        _validatorAddress = "0x" + Convert.ToHexString(addrBytes).ToLowerInvariant();
    }

    public string ValidatorAddress => _validatorAddress;
    public string PublicKeyHex => _publicKeyHex;

    public string SignHash(string hashHex)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(hashHex);
        var clean = hashHex.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? hashHex[2..] : hashHex;
        var hashBytes = Convert.FromHexString(clean);
        var signatureBytes = _ecdsa.SignHash(hashBytes);
        return "0x" + Convert.ToHexString(signatureBytes).ToLowerInvariant();
    }

    public string SignBytes(byte[] data)
    {
        ArgumentNullException.ThrowIfNull(data);
        var hashBytes = SHA256.HashData(data);
        var signatureBytes = _ecdsa.SignHash(hashBytes);
        return "0x" + Convert.ToHexString(signatureBytes).ToLowerInvariant();
    }

    public bool VerifySignature(string hashHex, string signatureHex, string? publicKeyHex = null)
    {
        if (string.IsNullOrWhiteSpace(hashHex) || string.IsNullOrWhiteSpace(signatureHex))
        {
            return false;
        }

        try
        {
            var cleanHash = hashHex.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? hashHex[2..] : hashHex;
            var hashBytes = Convert.FromHexString(cleanHash);

            var cleanSig = signatureHex.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? signatureHex[2..] : signatureHex;
            var sigBytes = Convert.FromHexString(cleanSig);

            if (string.IsNullOrWhiteSpace(publicKeyHex) || string.Equals(publicKeyHex, _publicKeyHex, StringComparison.OrdinalIgnoreCase))
            {
                return _ecdsa.VerifyHash(hashBytes, sigBytes);
            }

            // Verify with external public key
            var cleanPub = publicKeyHex.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? publicKeyHex[2..] : publicKeyHex;
            var pubBytes = Convert.FromHexString(cleanPub);

            using var verifier = ECDsa.Create(ECCurve.NamedCurves.nistP256);
            if (pubBytes[0] == 0x04 && pubBytes.Length == 65)
            {
                var qx = new byte[32];
                var qy = new byte[32];
                Buffer.BlockCopy(pubBytes, 1, qx, 0, 32);
                Buffer.BlockCopy(pubBytes, 33, qy, 0, 32);

                var parameters = new ECParameters
                {
                    Curve = ECCurve.NamedCurves.nistP256,
                    Q = new ECPoint { X = qx, Y = qy }
                };
                verifier.ImportParameters(parameters);
                return verifier.VerifyHash(hashBytes, sigBytes);
            }

            return false;
        }
        catch
        {
            return false;
        }
    }

    public string CalculateBlockHash(long blockNumber, string previousHash, string merkleRoot, long timestampUnixSeconds, int txCount)
    {
        var cleanPrev = (previousHash.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? previousHash[2..] : previousHash).ToLowerInvariant();
        var cleanRoot = (merkleRoot.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? merkleRoot[2..] : merkleRoot).ToLowerInvariant();
        
        var payload = $"{blockNumber}:{cleanPrev}:{cleanRoot}:{timestampUnixSeconds}:{txCount}";
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(payload));
        return "0x" + Convert.ToHexString(hash).ToLowerInvariant();
    }

    public void Dispose()
    {
        _ecdsa.Dispose();
    }
}
