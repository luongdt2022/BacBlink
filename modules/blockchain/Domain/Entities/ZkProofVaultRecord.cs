using NacenTech.Kernel.Domain;
using NacenTech.Modules.Blockchain.Domain.Invariants;

namespace NacenTech.Modules.Blockchain.Domain.Entities;

public sealed class ZkProofVaultRecord : Entity
{
    public Guid AnchorRecordId { get; private set; }
    public string ProofScheme { get; private set; } = "Groth16_BN254";
    public string CommitmentHash { get; private set; } = string.Empty;
    public string SaltCiphertext { get; private set; } = string.Empty;
    public string ProofEnvelopeJson { get; private set; } = string.Empty;
    public string PublicSignalsJson { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    // EF Core private constructor
    private ZkProofVaultRecord() { }

    public static ZkProofVaultRecord Create(
        Guid anchorRecordId,
        string commitmentHash,
        string saltCiphertext,
        string proofEnvelopeJson,
        string publicSignalsJson,
        string proofScheme = "Groth16_BN254")
    {
        if (anchorRecordId == Guid.Empty)
        {
            throw ValidationException.WithCode("INVALID_ANCHOR_RECORD_ID", "anchorRecordId không được là Guid rỗng.");
        }
        ArgumentException.ThrowIfNullOrWhiteSpace(commitmentHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(saltCiphertext);
        ArgumentException.ThrowIfNullOrWhiteSpace(proofEnvelopeJson);
        ArgumentException.ThrowIfNullOrWhiteSpace(publicSignalsJson);

        // Quy tắc BR-BC-08: Không lưu trữ thô PII
        BlockchainBusinessRules.EnsureNoRawPiiInField("proofEnvelopeJson", proofEnvelopeJson);
        BlockchainBusinessRules.EnsureNoRawPiiInField("publicSignalsJson", publicSignalsJson);

        return new ZkProofVaultRecord
        {
            AnchorRecordId = anchorRecordId,
            CommitmentHash = commitmentHash.Trim().ToLowerInvariant(),
            SaltCiphertext = saltCiphertext.Trim(),
            ProofEnvelopeJson = proofEnvelopeJson.Trim(),
            PublicSignalsJson = publicSignalsJson.Trim(),
            ProofScheme = proofScheme.Trim(),
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
}
