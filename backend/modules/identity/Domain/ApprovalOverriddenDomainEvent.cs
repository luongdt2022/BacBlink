using NacenTech.Kernel.Domain;

namespace NacenTech.Modules.Identity.Domain;

/// <summary>
/// Domain event phát sinh khi Quản trị viên Trung ương (SuperAdmin / OperatorAdmin) thực hiện duyệt vượt cấp hồ sơ.
/// </summary>
public sealed record ApprovalOverriddenDomainEvent(
    Guid RequestId,
    Guid ActorId,
    string ActorRole,
    string ScopeType,
    string? ScopeId,
    string Reason,
    DateTimeOffset OverriddenAt
) : DomainEvent;
