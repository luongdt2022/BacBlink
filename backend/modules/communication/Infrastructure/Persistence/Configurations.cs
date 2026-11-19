using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Communication.Domain;

namespace NacenTech.Modules.Communication.Infrastructure.Persistence;

public sealed class CaseInvitationConfiguration : IEntityTypeConfiguration<CaseInvitation>
{
    public void Configure(EntityTypeBuilder<CaseInvitation> b)
    {
        b.ToTable("case_invitations", CommunicationModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.RequesterKind).HasMaxLength(40).IsRequired();
        b.Property(x => x.TargetKind).HasMaxLength(40).IsRequired();
        b.Property(x => x.Status).HasMaxLength(20).IsRequired();
        b.Property(x => x.Message).HasMaxLength(1000);
        b.Ignore(x => x.RequesterSubject);
        b.Ignore(x => x.TargetSubject);
        b.HasIndex(x => x.RequesterPersonId);
        b.HasIndex(x => x.TargetPersonId);
        b.HasIndex(x => new { x.TargetKind, x.TargetId, x.Status });
        b.HasIndex(x => new { x.RequesterKind, x.RequesterId, x.Status });
    }
}

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> b)
    {
        b.ToTable("notifications", CommunicationModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Type).HasMaxLength(60).IsRequired();
        b.Property(x => x.Payload).HasColumnType("jsonb").IsRequired();
        b.HasIndex(x => new { x.PersonId, x.CreatedAt });
        b.HasIndex(x => new { x.PersonId, x.IsRead });
    }
}
