using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Modules.Identity.Infrastructure.Persistence;

public sealed class PersonConfiguration : IEntityTypeConfiguration<Person>
{
    public void Configure(EntityTypeBuilder<Person> b)
    {
        b.ToTable("persons", IdentityModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Email).HasMaxLength(255).IsRequired();
        b.HasIndex(x => x.Email).IsUnique();
        b.Property(x => x.PasswordHash).HasMaxLength(255).IsRequired();
        b.Property(x => x.PasswordHashAlgorithm).HasMaxLength(20).IsRequired();
        b.Property(x => x.PreviousPasswordHash).HasMaxLength(255);
        b.Property(x => x.PreviousPasswordHashAlgorithm).HasMaxLength(20);
        b.Property(x => x.FirstName).HasMaxLength(100);
        b.Property(x => x.LastName).HasMaxLength(100);
        b.Property(x => x.Phone).HasMaxLength(20);
        b.Property(x => x.OrganizationName).HasMaxLength(255);
        b.Property(x => x.PlatformRole).HasMaxLength(50).IsRequired();
        b.Property(x => x.ScopeType).HasMaxLength(20).IsRequired().HasDefaultValue("GLOBAL");
        b.Property(x => x.ScopeId).HasMaxLength(50);
        b.HasIndex(x => new { x.PlatformRole, x.IsActive });
        b.HasIndex(x => new { x.ScopeType, x.ScopeId });
    }
}

public sealed class ActivationTokenConfiguration : IEntityTypeConfiguration<ActivationToken>
{
    public void Configure(EntityTypeBuilder<ActivationToken> b)
    {
        b.ToTable("activation_tokens", IdentityModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Token).HasMaxLength(255).IsRequired();
        b.HasIndex(x => x.Token).IsUnique();
        b.HasIndex(x => x.PersonId);
        b.HasIndex(x => x.ExpiresAt);
    }
}

public sealed class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> b)
    {
        b.ToTable("password_reset_tokens", IdentityModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Token).HasMaxLength(255).IsRequired();
        b.HasIndex(x => x.Token).IsUnique();
        b.HasIndex(x => x.PersonId);
        b.HasIndex(x => x.ExpiresAt);
    }
}

public sealed class ApprovalRequestConfiguration : IEntityTypeConfiguration<ApprovalRequest>
{
    public void Configure(EntityTypeBuilder<ApprovalRequest> b)
    {
        b.ToTable("approval_requests", IdentityModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.UserId).IsRequired();
        b.Property(x => x.RequestType).HasMaxLength(50).IsRequired();
        b.Property(x => x.ScopeType).HasMaxLength(50).IsRequired().HasDefaultValue("GLOBAL");
        b.Property(x => x.ScopeId).HasMaxLength(100);
        b.Property(x => x.PayloadJson).HasColumnType("jsonb").IsRequired();
        b.Property(x => x.Status).HasMaxLength(30).IsRequired().HasDefaultValue("PENDING_REVIEW");
        b.Property(x => x.Version).IsRequired().HasDefaultValue(1);
        b.Property(x => x.ReviewNote).HasColumnType("text");
        b.Property(x => x.SlaDeadlineUtc).IsRequired();

        // TASK-07 DELTA V4 (CR-2026-020): Override & SLA monitoring fields
        b.Property(x => x.IsOverride).IsRequired().HasDefaultValue(false);
        b.Property(x => x.OverrideReason).HasColumnType("text");
        b.Property(x => x.OverriddenByUserId);
        b.Property(x => x.OverriddenAtUtc);
        b.Property(x => x.IsSlaBreached).IsRequired().HasDefaultValue(false);
        b.Property(x => x.SlaOverdueHours).IsRequired().HasDefaultValue(0.0);
        b.Property(x => x.IsNationalPriority).IsRequired().HasDefaultValue(false);
        b.Ignore(x => x.RowVersion);

        b.HasIndex(x => new { x.ScopeType, x.ScopeId, x.Status }).HasDatabaseName("idx_approval_scope");
        b.HasIndex(x => new { x.Status, x.SlaDeadlineUtc }).HasDatabaseName("idx_approval_sla");
        b.HasIndex(x => x.UserId);
        b.HasIndex(x => new { x.IsSlaBreached, x.Status }).HasDatabaseName("idx_approval_sla_breach");
        b.HasIndex(x => new { x.ScopeType, x.ScopeId, x.RequestType, x.Status, x.CreatedAt }).HasDatabaseName("idx_approval_central_queue");
    }
}

public sealed class OrganizationUnitConfiguration : IEntityTypeConfiguration<OrganizationUnit>
{
    public void Configure(EntityTypeBuilder<OrganizationUnit> b)
    {
        b.ToTable("organization_units", IdentityModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Code).HasMaxLength(50).IsRequired();
        b.HasIndex(x => x.Code).IsUnique();
        b.Property(x => x.Name).HasMaxLength(255).IsRequired();
        b.Property(x => x.UnitType).HasMaxLength(30).IsRequired();
        b.Property(x => x.ProvinceId).HasMaxLength(10);
        b.Property(x => x.Status).HasMaxLength(30).IsRequired().HasDefaultValue("ACTIVE");

        b.HasIndex(x => x.ParentId).HasDatabaseName("idx_org_parent");
    }
}

public sealed class ApprovalAuditLogConfiguration : IEntityTypeConfiguration<ApprovalAuditLog>
{
    public void Configure(EntityTypeBuilder<ApprovalAuditLog> b)
    {
        b.ToTable("approval_audit_logs", IdentityModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.ActorId).IsRequired();
        b.Property(x => x.ActorRole).HasMaxLength(50).IsRequired();
        b.Property(x => x.Action).HasMaxLength(100).IsRequired();
        b.Property(x => x.TargetEntity).HasMaxLength(50).IsRequired();
        b.Property(x => x.TargetId).HasMaxLength(100).IsRequired();
        b.Property(x => x.IpAddress).HasMaxLength(45).IsRequired();
        b.Property(x => x.DetailsJson).HasColumnType("jsonb");

        b.HasIndex(x => new { x.ActorId, x.CreatedAtUtc }).HasDatabaseName("idx_audit_actor");
        b.HasIndex(x => new { x.TargetEntity, x.TargetId });
    }
}

