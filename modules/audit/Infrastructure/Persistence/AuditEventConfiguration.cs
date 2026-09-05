using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Audit.Domain;

namespace NacenTech.Modules.Audit.Infrastructure.Persistence;

public sealed class AuditEventConfiguration : IEntityTypeConfiguration<AuditEvent>
{
    public void Configure(EntityTypeBuilder<AuditEvent> b)
    {
        b.ToTable("audit_events", AuditModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.ActorRole).HasMaxLength(20).IsRequired();
        b.Property(x => x.Action).HasMaxLength(100).IsRequired();
        b.Property(x => x.ObjectKind).HasMaxLength(60).IsRequired();
        b.Property(x => x.Purpose).HasMaxLength(60);
        b.Property(x => x.Outcome).HasMaxLength(20).IsRequired();
        b.Property(x => x.RuleId).HasMaxLength(120);
        b.Property(x => x.CorrelationId).HasMaxLength(100).IsRequired();
        b.Property(x => x.IpAddress).HasMaxLength(64);
        b.Property(x => x.UserAgent).HasMaxLength(512);
        b.Property(x => x.Details).HasMaxLength(4000);
        b.HasIndex(x => new { x.ObjectKind, x.ObjectId });
        b.HasIndex(x => new { x.ActorRef, x.OccurredAt });
        b.HasIndex(x => x.OccurredAt);
    }
}
