namespace NacenTech.Modules.Blockchain.Application.Ports;

public sealed record Groth16ProofEnvelope(
    IReadOnlyList<string> PiA,
    IReadOnlyList<IReadOnlyList<string>> PiB,
    IReadOnlyList<string> PiC,
    string Protocol,
    string Curve
);

public sealed record ZkProofGenerationResult(
    string RawDataHash,
    string CommitmentHash,
    string SaltCiphertext,
    Groth16ProofEnvelope ProofEnvelope,
    IReadOnlyList<string> PublicSignals
);

public interface IZkProofService
{
    ZkProofGenerationResult GenerateProof(object payload, string? customSalt = null);
    bool VerifyCommitment(object payload, string saltCiphertext, string expectedCommitmentHash);
}
