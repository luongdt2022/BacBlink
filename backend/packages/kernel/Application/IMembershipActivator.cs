namespace NacenTech.Kernel.Application;

/// <summary>
/// CR-BACLINK-008 · BR-BL08-MEMBER-LIFECYCLE-003 / BR-BL08-CERT-NO-005.
/// Cấp / tạm ngưng tư cách hội viên cho doanh nghiệp do <paramref name="ownerPersonId"/> sở hữu.
/// Được gọi SAU khi phê duyệt đã commit; idempotent (gọi lại không cấp trùng số chứng nhận).
/// </summary>
public interface IMembershipActivator
{
    /// <returns>Số chứng nhận đang hiệu lực, hoặc null nếu chưa tìm thấy doanh nghiệp của người dùng.</returns>
    Task<string?> ActivateForOwnerAsync(Guid ownerPersonId, string? tierCode, Guid? approvedBy, CancellationToken ct);

    Task SuspendForOwnerAsync(Guid ownerPersonId, string reason, CancellationToken ct);

    /// <summary>BR-BL08-JOIN-DEDUP-007: MST đã thuộc một doanh nghiệp hội viên khác (đã xác thực, chủ sở hữu khác).</summary>
    Task<bool> IsTaxCodeOwnedByOtherMemberAsync(string taxCode, Guid personId, CancellationToken ct);
}
