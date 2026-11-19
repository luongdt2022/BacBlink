using NacenTech.Modules.Blockchain.Application.Services;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public class BlockchainZkProofEngineTests
{
    private readonly NativeZkProofEngine _engine = new();

    [Fact]
    public void Generate_proof_produces_valid_salted_commitment_and_envelope()
    {
        var payload = new
        {
            dealId = "deal-999",
            buyerMst = "0101234567",
            technologyCode = "TECH-AI-2026",
            agreedPrice = 1200000000m
        };

        var result = _engine.GenerateProof(payload);

        result.RawDataHash.ShouldStartWith("0x");
        result.RawDataHash.Length.ShouldBe(66);

        result.CommitmentHash.ShouldStartWith("0x");
        result.CommitmentHash.Length.ShouldBe(66);
        result.CommitmentHash.ShouldNotBe(result.RawDataHash);

        result.SaltCiphertext.ShouldStartWith("0x");
        result.SaltCiphertext.Length.ShouldBe(66);

        // Kiểm tra Groth16 Envelope
        result.ProofEnvelope.Protocol.ShouldBe("groth16");
        result.ProofEnvelope.Curve.ShouldBe("bn128");
        result.ProofEnvelope.PiA.Count.ShouldBe(3);
        result.ProofEnvelope.PiA[2].ShouldBe("1");

        result.ProofEnvelope.PiB.Count.ShouldBe(3);
        result.ProofEnvelope.PiB[0].Count.ShouldBe(2);
        result.ProofEnvelope.PiB[1].Count.ShouldBe(2);
        result.ProofEnvelope.PiB[2].Count.ShouldBe(2);

        result.ProofEnvelope.PiC.Count.ShouldBe(3);
        result.ProofEnvelope.PiC[2].ShouldBe("1");

        // Public signals
        result.PublicSignals.Count.ShouldBe(3);

        // Verify cam kết đúng
        bool isValid = _engine.VerifyCommitment(payload, result.SaltCiphertext, result.CommitmentHash);
        isValid.ShouldBeTrue();
    }

    [Fact]
    public void Tampered_payload_fails_commitment_verification()
    {
        var originalPayload = new
        {
            sellerId = "usr-01",
            technologyTitle = "Hệ thống AI xử lý dữ liệu lớn",
            status = "APPROVED"
        };

        var result = _engine.GenerateProof(originalPayload);

        var tamperedPayload = new
        {
            sellerId = "usr-01",
            technologyTitle = "Hệ thống AI xử lý dữ liệu lớn",
            status = "REJECTED" // Thay đổi trạng thái
        };

        bool isValid = _engine.VerifyCommitment(tamperedPayload, result.SaltCiphertext, result.CommitmentHash);
        isValid.ShouldBeFalse();
    }

    [Fact]
    public void Same_payload_with_different_salts_produces_different_commitments()
    {
        var payload = new { secretCode = "VIP-SECRET-KEY" };

        var proof1 = _engine.GenerateProof(payload);
        var proof2 = _engine.GenerateProof(payload);

        proof1.RawDataHash.ShouldBe(proof2.RawDataHash); // Dữ liệu thô giống nhau
        proof1.SaltCiphertext.ShouldNotBe(proof2.SaltCiphertext); // Salt ngẫu nhiên khác nhau
        proof1.CommitmentHash.ShouldNotBe(proof2.CommitmentHash); // Cam kết khác nhau (Unlinkability)
    }
}
