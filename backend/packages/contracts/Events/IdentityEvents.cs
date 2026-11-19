using NacenTech.Kernel.Domain;

namespace NacenTech.Contracts.Events;

/// <summary>Integration event của module identity. Token đi qua outbox để mail job gửi; không log token.</summary>
public sealed record PersonRegistered(Guid PersonId, string Email, string? FirstName, string ActivationToken) : DomainEvent;

public sealed record ActivationResent(Guid PersonId, string Email, string? FirstName, string ActivationToken) : DomainEvent;

public sealed record AccountActivated(Guid PersonId, string Email, string? FirstName) : DomainEvent;

public sealed record PasswordChanged(Guid PersonId, string Email, string? FirstName, string? IpAddress, string? UserAgent) : DomainEvent;

public sealed record PasswordResetRequested(Guid PersonId, string Email, string ResetToken) : DomainEvent;
