using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NacenTech.Modules.Blockchain.Application.Ports;
using NacenTech.Modules.Blockchain.Domain.Entities;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Infrastructure.Cryptography;

namespace NacenTech.Modules.Blockchain.Application.Services;

public sealed record VerificationStepResult(
    string StepName,
    bool Passed,
    string Details,
    string? ExpectedValue = null,
    string? ActualValue = null
);

public sealed record VerificationVerdictResult(
    string Verdict, // VERIFIED, TAMPERED, NOT_ANCHORED, BLOCK_UNCONFIRMED
    bool IsSuccess,
    string Summary,
    long? BlockNumber,
    string? BlockHash,
    string? MerkleRoot,
    string? CommitmentHash,
    string? ValidatorAddress,
    DateTimeOffset? AnchoredAt,
    string? NdaChainTxHash,
    IReadOnlyList<VerificationStepResult> Steps
);

public interface IBlockchainVerificationService
{
    Task<VerificationVerdictResult> VerifyEntityAsync(
        string entityType,
        Guid entityId,
        string? customPayloadJson = null,
        CancellationToken ct = default);

    Task<VerificationVerdictResult> GetEntityAnchorStatusAsync(
        string entityType,
        Guid entityId,
        CancellationToken ct = default);
}

public sealed class BlockchainVerificationService : IBlockchainVerificationService
{
    private readonly DbContext _db;
    private readonly IZkProofService _zkProofService;
    private readonly IMerkleTreeEngine _merkleTreeEngine;
    private readonly IPlatformKeyManager _keyManager;

    public BlockchainVerificationService(
        DbContext db,
        IZkProofService zkProofService,
        IMerkleTreeEngine merkleTreeEngine,
        IPlatformKeyManager keyManager)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _zkProofService = zkProofService ?? throw new ArgumentNullException(nameof(zkProofService));
        _merkleTreeEngine = merkleTreeEngine ?? throw new ArgumentNullException(nameof(merkleTreeEngine));
        _keyManager = keyManager ?? throw new ArgumentNullException(nameof(keyManager));
    }

    public async Task<VerificationVerdictResult> GetEntityAnchorStatusAsync(string entityType, Guid entityId, CancellationToken ct = default)
    {
        var cleanType = entityType.Trim().ToUpperInvariant();

        var record = await _db.Set<AnchorRecord>()
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.EntityType == cleanType && r.EntityId == entityId, ct);

        if (record is null || record.Status == AnchorStatus.PENDING)
        {
            return new VerificationVerdictResult(
                Verdict: "NOT_ANCHORED",
                IsSuccess: false,
                Summary: "Thực thể chưa được đưa vào sổ cái khối nội bộ.",
                BlockNumber: null,
                BlockHash: null,
                MerkleRoot: null,
                CommitmentHash: null,
                ValidatorAddress: null,
                AnchoredAt: null,
                NdaChainTxHash: null,
                Steps: []
            );
        }

        LedgerBlock? block = null;
        if (record.LedgerBlockNumber.HasValue)
        {
            block = await _db.Set<LedgerBlock>()
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BlockNumber == record.LedgerBlockNumber.Value, ct);
        }

        return new VerificationVerdictResult(
            Verdict: record.Status == AnchorStatus.NDACHAIN_CONFIRMED ? "NDACHAIN_VERIFIED" : "VERIFIED",
            IsSuccess: true,
            Summary: $"Thực thể được bảo chứng toàn vẹn tại Khối #{record.LedgerBlockNumber}.",
            BlockNumber: record.LedgerBlockNumber,
            BlockHash: block?.BlockHash,
            MerkleRoot: block?.MerkleRoot,
            CommitmentHash: record.CommitmentHash,
            ValidatorAddress: block?.ValidatorAddress,
            AnchoredAt: record.AnchoredAt,
            NdaChainTxHash: block?.NdaChainTxHash,
            Steps: []
        );
    }

    public async Task<VerificationVerdictResult> VerifyEntityAsync(
        string entityType,
        Guid entityId,
        string? customPayloadJson = null,
        CancellationToken ct = default)
    {
        var cleanType = entityType.Trim().ToUpperInvariant();
        var steps = new List<VerificationStepResult>();

        // 1. Tìm bản ghi neo
        var record = await _db.Set<AnchorRecord>()
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.EntityType == cleanType && r.EntityId == entityId, ct);

        if (record is null || record.Status == AnchorStatus.PENDING)
        {
            steps.Add(new VerificationStepResult(
                StepName: "1. Tra cứu bản ghi neo",
                Passed: false,
                Details: "Không tìm thấy bản ghi neo hoặc bản ghi đang ở trạng thái PENDING chờ đóng khối."
            ));

            return new VerificationVerdictResult(
                Verdict: "NOT_ANCHORED",
                IsSuccess: false,
                Summary: "Thực thể chưa được đưa vào sổ cái khối nội bộ.",
                BlockNumber: null,
                BlockHash: null,
                MerkleRoot: null,
                CommitmentHash: null,
                ValidatorAddress: null,
                AnchoredAt: null,
                NdaChainTxHash: null,
                Steps: steps
            );
        }

        steps.Add(new VerificationStepResult(
            StepName: "1. Tra cứu bản ghi neo",
            Passed: true,
            Details: $"Đã tìm thấy bản ghi neo #{record.Id} tại Khối #{record.LedgerBlockNumber}.",
            ExpectedValue: record.CommitmentHash,
            ActualValue: record.CommitmentHash
        ));

        // 2. Tra cứu ZK Vault
        var vault = await _db.Set<ZkProofVaultRecord>()
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.AnchorRecordId == record.Id, ct);

        // Bước 2: Kiểm chứng Canonical Hash & ZKP Commitment
        string payloadToVerify = customPayloadJson ?? $"{{\"entityType\":\"{cleanType}\",\"entityId\":\"{entityId}\"}}";
        bool commitmentMatch = false;

        if (vault != null)
        {
            commitmentMatch = _zkProofService.VerifyCommitment(payloadToVerify, vault.SaltCiphertext, record.CommitmentHash);
        }

        if (!commitmentMatch)
        {
            steps.Add(new VerificationStepResult(
                StepName: "2. Kiểm chứng Cam kết Mật mã học ZKP",
                Passed: false,
                Details: "Dữ liệu thực thể đã bị thay đổi trái phép. Mã cam kết băm tính lại không khớp với cam kết trong sổ cái.",
                ExpectedValue: record.CommitmentHash,
                ActualValue: "HASH_MISMATCH"
            ));

            return new VerificationVerdictResult(
                Verdict: "TAMPERED",
                IsSuccess: false,
                Summary: "CẢNH BÁO: Phát hiện dữ liệu thực thể đã bị can thiệp trái phép so với thời điểm đóng khối!",
                BlockNumber: record.LedgerBlockNumber,
                BlockHash: null,
                MerkleRoot: null,
                CommitmentHash: record.CommitmentHash,
                ValidatorAddress: null,
                AnchoredAt: record.AnchoredAt,
                NdaChainTxHash: null,
                Steps: steps
            );
        }

        steps.Add(new VerificationStepResult(
            StepName: "2. Kiểm chứng Cam kết Mật mã học ZKP",
            Passed: true,
            Details: "Cam kết ZKP trùng khớp hoàn toàn với dữ liệu thực thể ban đầu.",
            ExpectedValue: record.CommitmentHash,
            ActualValue: record.CommitmentHash
        ));

        // Bước 3: Tra cứu khối và kiểm chứng Merkle Path
        if (!record.LedgerBlockNumber.HasValue)
        {
            steps.Add(new VerificationStepResult(
                StepName: "3. Kiểm chứng Cây Merkle",
                Passed: false,
                Details: "Bản ghi chưa được liên kết với khối sổ cái."
            ));

            return new VerificationVerdictResult(
                Verdict: "TAMPERED",
                IsSuccess: false,
                Summary: "Bản ghi neo không có thông tin khối.",
                BlockNumber: null,
                BlockHash: null,
                MerkleRoot: null,
                CommitmentHash: record.CommitmentHash,
                ValidatorAddress: null,
                AnchoredAt: record.AnchoredAt,
                NdaChainTxHash: null,
                Steps: steps
            );
        }

        var block = await _db.Set<LedgerBlock>()
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.BlockNumber == record.LedgerBlockNumber.Value, ct);

        if (block is null)
        {
            steps.Add(new VerificationStepResult(
                StepName: "3. Kiểm chứng Cây Merkle",
                Passed: false,
                Details: $"Không tìm thấy Khối #{record.LedgerBlockNumber.Value} trong CSDL."
            ));

            return new VerificationVerdictResult(
                Verdict: "TAMPERED",
                IsSuccess: false,
                Summary: $"Không tìm thấy Khối #{record.LedgerBlockNumber.Value}.",
                BlockNumber: record.LedgerBlockNumber,
                BlockHash: null,
                MerkleRoot: null,
                CommitmentHash: record.CommitmentHash,
                ValidatorAddress: null,
                AnchoredAt: record.AnchoredAt,
                NdaChainTxHash: null,
                Steps: steps
            );
        }

        IReadOnlyList<MerklePathNode> auditPath = [];
        if (!string.IsNullOrWhiteSpace(record.MerklePathJson))
        {
            auditPath = JsonSerializer.Deserialize<IReadOnlyList<MerklePathNode>>(record.MerklePathJson) ?? [];
        }

        bool pathValid = _merkleTreeEngine.VerifyAuditPath(record.CommitmentHash, block.MerkleRoot, auditPath);
        if (!pathValid)
        {
            steps.Add(new VerificationStepResult(
                StepName: "3. Kiểm chứng Cây Merkle",
                Passed: false,
                Details: "Đường dẫn Merkle Path không dẫn tới Merkle Root của khối. Phát hiện dữ liệu cây bị làm giả.",
                ExpectedValue: block.MerkleRoot,
                ActualValue: "PATH_INVALID"
            ));

            return new VerificationVerdictResult(
                Verdict: "TAMPERED",
                IsSuccess: false,
                Summary: "CẢNH BÁO: Đường dẫn chứng chỉ Merkle không khớp với Merkle Root của Khối!",
                BlockNumber: block.BlockNumber,
                BlockHash: block.BlockHash,
                MerkleRoot: block.MerkleRoot,
                CommitmentHash: record.CommitmentHash,
                ValidatorAddress: block.ValidatorAddress,
                AnchoredAt: record.AnchoredAt,
                NdaChainTxHash: block.NdaChainTxHash,
                Steps: steps
            );
        }

        steps.Add(new VerificationStepResult(
            StepName: "3. Kiểm chứng Cây Merkle",
            Passed: true,
            Details: $"Đường dẫn Merkle Audit Path ({auditPath.Count} nhánh) khớp chính xác với Merkle Root của Khối #{block.BlockNumber}.",
            ExpectedValue: block.MerkleRoot,
            ActualValue: block.MerkleRoot
        ));

        // Bước 4: Kiểm chứng Chữ ký số ECDSA của khối
        bool sigValid = _keyManager.VerifySignature(block.BlockHash, block.BlockSignature);
        if (!sigValid)
        {
            steps.Add(new VerificationStepResult(
                StepName: "4. Xác thực Chữ ký số ECDSA Khối",
                Passed: false,
                Details: "Chữ ký số ECDSA của khối không hợp lệ hoặc được ký bởi khóa không được ủy quyền.",
                ExpectedValue: block.ValidatorAddress,
                ActualValue: "SIGNATURE_INVALID"
            ));

            return new VerificationVerdictResult(
                Verdict: "BLOCK_UNCONFIRMED",
                IsSuccess: false,
                Summary: "Khối sổ cái chứa chữ ký số không hợp lệ.",
                BlockNumber: block.BlockNumber,
                BlockHash: block.BlockHash,
                MerkleRoot: block.MerkleRoot,
                CommitmentHash: record.CommitmentHash,
                ValidatorAddress: block.ValidatorAddress,
                AnchoredAt: record.AnchoredAt,
                NdaChainTxHash: block.NdaChainTxHash,
                Steps: steps
            );
        }

        steps.Add(new VerificationStepResult(
            StepName: "4. Xác thực Chữ ký số ECDSA Khối",
            Passed: true,
            Details: $"Chữ ký số ECDSA secp256k1 của Validator '{block.ValidatorAddress}' hoàn toàn hợp lệ.",
            ExpectedValue: block.ValidatorAddress,
            ActualValue: block.ValidatorAddress
        ));

        return new VerificationVerdictResult(
            Verdict: "VERIFIED",
            IsSuccess: true,
            Summary: "XÁC THỰC TOÁN HỌC THÀNH CÔNG 100%: Dữ liệu toàn vẹn tuyệt đối, không có dấu hiệu bị can thiệp trái phép.",
            BlockNumber: block.BlockNumber,
            BlockHash: block.BlockHash,
            MerkleRoot: block.MerkleRoot,
            CommitmentHash: record.CommitmentHash,
            ValidatorAddress: block.ValidatorAddress,
            AnchoredAt: record.AnchoredAt,
            NdaChainTxHash: block.NdaChainTxHash,
            Steps: steps
        );
    }
}
