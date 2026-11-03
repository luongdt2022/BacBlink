using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NacenTech.Contracts.Jobs;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Blockchain.Application.Ports;
using NacenTech.Modules.Blockchain.Domain.Entities;
using NacenTech.Modules.Blockchain.Domain.Enums;
using NacenTech.Modules.Blockchain.Infrastructure.Adapters;

namespace NacenTech.Modules.Blockchain.Workers;

public sealed class BlockchainAnchorJobHandler : IJobHandler<BlockchainAnchorJob>
{
    private readonly DbContext _db;
    private readonly IZkProofService _zkProofService;
    private readonly ILocalSovereignLedgerAdapter _ledgerAdapter;
    private readonly ILogger<BlockchainAnchorJobHandler> _logger;

    public BlockchainAnchorJobHandler(
        DbContext db,
        IZkProofService zkProofService,
        ILocalSovereignLedgerAdapter ledgerAdapter,
        ILogger<BlockchainAnchorJobHandler> logger)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _zkProofService = zkProofService ?? throw new ArgumentNullException(nameof(zkProofService));
        _ledgerAdapter = ledgerAdapter ?? throw new ArgumentNullException(nameof(ledgerAdapter));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task HandleAsync(BlockchainAnchorJob job, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(job);

        var entityType = job.EntityType.Trim().ToUpperInvariant();

        // 1. Kiểm tra chính sách neo dữ liệu
        var policy = await _db.Set<AnchorPolicy>()
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.EntityType == entityType, ct);

        if (policy is null)
        {
            _logger.LogInformation("Bỏ qua neo dữ liệu: Chưa cấu hình chính sách cho loại thực thể '{EntityType}'.", entityType);
            return;
        }

        if (!policy.IsEnabled)
        {
            _logger.LogInformation("Bỏ qua neo dữ liệu: Chính sách '{EntityType}' đang bị tắt.", entityType);
            return;
        }

        // 2. Chống trùng lặp (Idempotency - Quy tắc BR-BC-03)
        var existingRecord = await _db.Set<AnchorRecord>()
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.EntityType == entityType && r.EntityId == job.EntityId, ct);

        if (existingRecord is not null && existingRecord.Status != AnchorStatus.FAILED)
        {
            _logger.LogInformation(
                "Bản ghi neo cho '{EntityType}' #{EntityId} đã tồn tại ở trạng thái '{Status}'. Bỏ qua tạo mới.",
                entityType,
                job.EntityId,
                existingRecord.Status
            );
            return;
        }

        // 3. Tạo Cam kết ZKP và Phong bì mật mã qua IZkProofService
        var rawPayload = job.RawDataJson ?? $"{{\"entityType\":\"{entityType}\",\"entityId\":\"{job.EntityId}\"}}";
        var zkpResult = _zkProofService.GenerateProof(rawPayload);

        var anchorRecord = AnchorRecord.Create(
            entityType: entityType,
            entityId: job.EntityId,
            entityCode: job.EntityCode,
            commitmentHash: zkpResult.CommitmentHash,
            rawDataHash: zkpResult.RawDataHash
        );

        var envelopeJson = System.Text.Json.JsonSerializer.Serialize(zkpResult.ProofEnvelope);
        var signalsJson = System.Text.Json.JsonSerializer.Serialize(zkpResult.PublicSignals);

        var vaultRecord = ZkProofVaultRecord.Create(
            anchorRecordId: anchorRecord.Id,
            commitmentHash: zkpResult.CommitmentHash,
            saltCiphertext: zkpResult.SaltCiphertext,
            proofEnvelopeJson: envelopeJson,
            publicSignalsJson: signalsJson
        );

        _db.Set<ZkProofVaultRecord>().Add(vaultRecord);
        await _db.SaveChangesAsync(ct);

        anchorRecord.LinkZkVault(vaultRecord.Id);
        _db.Set<AnchorRecord>().Add(anchorRecord);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Đã tạo bản ghi neo PENDING #{RecordId} cho thực thể '{EntityType}' #{EntityId}.",
            anchorRecord.Id,
            entityType,
            job.EntityId
        );

        // 4. Kiểm tra điều kiện gom lô (Threshold & Timeout) theo loại thực thể
        var pendingCount = await _db.Set<AnchorRecord>()
            .CountAsync(r => r.EntityType == entityType && r.Status == AnchorStatus.PENDING, ct);

        var oldestPendingCreatedAt = await _db.Set<AnchorRecord>()
            .Where(r => r.EntityType == entityType && r.Status == AnchorStatus.PENDING)
            .OrderBy(r => r.CreatedAt)
            .Select(r => (DateTimeOffset?)r.CreatedAt)
            .FirstOrDefaultAsync(ct);

        var elapsed = oldestPendingCreatedAt.HasValue
            ? DateTimeOffset.UtcNow - oldestPendingCreatedAt.Value
            : TimeSpan.Zero;

        bool thresholdMet = pendingCount >= policy.BatchSizeThreshold;
        bool timeoutMet = elapsed >= TimeSpan.FromMinutes(policy.BatchTimeoutMinutes);

        if (thresholdMet || timeoutMet)
        {
            _logger.LogInformation(
                "Kích hoạt gom lô đóng khối tự động cho '{EntityType}': PendingCount={Count} (Ngưỡng={Threshold}), Elapsed={Elapsed} phút (Timeout={Timeout} phút).",
                entityType,
                pendingCount,
                policy.BatchSizeThreshold,
                elapsed.TotalMinutes,
                policy.BatchTimeoutMinutes
            );

            var createdBlock = await _ledgerAdapter.FlushPendingRecordsToBlockAsync(policy.BatchSizeThreshold, entityType, ct);
            if (createdBlock is not null)
            {
                _logger.LogInformation(
                    "Đã đóng khối #{BlockNumber} thành công với {TxCount} giao dịch. Hash={BlockHash}.",
                    createdBlock.BlockNumber,
                    createdBlock.TxCount,
                    createdBlock.BlockHash
                );
            }
        }
    }
}
