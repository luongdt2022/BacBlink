using NacenTech.Kernel.Domain;
using NacenTech.Modules.Blockchain.Domain.Invariants;

namespace NacenTech.Modules.Blockchain.Domain.Entities;

public sealed class AnchorPolicy : AggregateRoot
{
    public string EntityType { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public bool IsEnabled { get; private set; } = true;
    public string TriggerStatus { get; private set; } = string.Empty;
    public string JsonFieldsExpression { get; private set; } = string.Empty;
    public int BatchSizeThreshold { get; private set; } = 10;
    public int BatchTimeoutMinutes { get; private set; } = 5;

    // EF Core private constructor
    private AnchorPolicy() { }

    public static AnchorPolicy Create(
        string entityType,
        string displayName,
        string triggerStatus,
        string jsonFieldsExpression,
        int batchSizeThreshold = 10,
        int batchTimeoutMinutes = 5,
        bool isEnabled = true)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(entityType);
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);
        ArgumentException.ThrowIfNullOrWhiteSpace(triggerStatus);
        ArgumentException.ThrowIfNullOrWhiteSpace(jsonFieldsExpression);

        if (batchSizeThreshold < 1 || batchSizeThreshold > 500)
        {
            throw ValidationException.WithCode(
                "INVALID_BATCH_SIZE",
                "Ngưỡng kích thước lô batch_size_threshold phải từ 1 đến 500."
            );
        }

        if (batchTimeoutMinutes < 1 || batchTimeoutMinutes > 60)
        {
            throw ValidationException.WithCode(
                "INVALID_BATCH_TIMEOUT",
                "Thời gian chờ gom lô batch_timeout_minutes phải từ 1 đến 60 phút."
            );
        }

        var policy = new AnchorPolicy
        {
            EntityType = entityType.Trim().ToUpperInvariant(),
            DisplayName = displayName.Trim(),
            TriggerStatus = triggerStatus.Trim().ToUpperInvariant(),
            JsonFieldsExpression = jsonFieldsExpression.Trim(),
            BatchSizeThreshold = batchSizeThreshold,
            BatchTimeoutMinutes = batchTimeoutMinutes,
            IsEnabled = isEnabled,
            Version = 1,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        return policy;
    }

    public void ValidateEntityCanAnchor(string entityStatus)
    {
        if (!IsEnabled)
        {
            throw ValidationException.WithCode(
                "POLICY_DISABLED",
                $"Chính sách neo cho thực thể '{EntityType}' đang bị tạm tắt."
            );
        }

        BlockchainBusinessRules.EnsureTriggerStatusMatches(entityStatus, TriggerStatus);
    }

    public void UpdateConfig(
        string displayName,
        string triggerStatus,
        string jsonFieldsExpression,
        int batchSizeThreshold,
        int batchTimeoutMinutes,
        int expectedVersion)
    {
        if (expectedVersion != Version)
        {
            throw new ConcurrencyException(
                $"Quy tắc BR-BC-07 vi phạm: Concurrency token không khớp. Phiên bản hiện tại là {Version}, phiên bản yêu cầu là {expectedVersion}.",
                Version
            );
        }

        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);
        ArgumentException.ThrowIfNullOrWhiteSpace(triggerStatus);
        ArgumentException.ThrowIfNullOrWhiteSpace(jsonFieldsExpression);

        if (batchSizeThreshold < 1 || batchSizeThreshold > 500)
        {
            throw ValidationException.WithCode("INVALID_BATCH_SIZE", "batch_size_threshold phải từ 1 đến 500.");
        }

        if (batchTimeoutMinutes < 1 || batchTimeoutMinutes > 60)
        {
            throw ValidationException.WithCode("INVALID_BATCH_TIMEOUT", "batch_timeout_minutes phải từ 1 đến 60 phút.");
        }

        DisplayName = displayName.Trim();
        TriggerStatus = triggerStatus.Trim().ToUpperInvariant();
        JsonFieldsExpression = jsonFieldsExpression.Trim();
        BatchSizeThreshold = batchSizeThreshold;
        BatchTimeoutMinutes = batchTimeoutMinutes;
        Version++;
        Touch();
    }

    public void ToggleStatus(bool isEnabled, int expectedVersion)
    {
        if (expectedVersion != Version)
        {
            throw new ConcurrencyException(
                $"Quy tắc BR-BC-07 vi phạm: Concurrency token không khớp. Phiên bản hiện tại là {Version}, phiên bản yêu cầu là {expectedVersion}.",
                Version
            );
        }

        IsEnabled = isEnabled;
        Version++;
        Touch();
    }

    public void ConfigureBatching(int batchSizeThreshold, int batchTimeoutMinutes, int? expectedVersion = null)
    {
        if (expectedVersion.HasValue && expectedVersion.Value != Version)
        {
            throw new ConcurrencyException(
                $"Quy tắc BR-BC-07 vi phạm: Concurrency token không khớp. Phiên bản hiện tại là {Version}, phiên bản yêu cầu là {expectedVersion}.",
                Version
            );
        }

        if (batchSizeThreshold < 1 || batchSizeThreshold > 500)
        {
            throw ValidationException.WithCode("INVALID_BATCH_SIZE", "batch_size_threshold phải từ 1 đến 500.");
        }

        if (batchTimeoutMinutes < 1 || batchTimeoutMinutes > 60)
        {
            throw ValidationException.WithCode("INVALID_BATCH_TIMEOUT", "batch_timeout_minutes phải từ 1 đến 60 phút.");
        }

        BatchSizeThreshold = batchSizeThreshold;
        BatchTimeoutMinutes = batchTimeoutMinutes;
        Version++;
        Touch();
    }
}
