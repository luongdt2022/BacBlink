using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Brokerage.Domain;

namespace NacenTech.Modules.Brokerage.Infrastructure.Persistence;

public sealed class BrokerProfileConfiguration : IEntityTypeConfiguration<BrokerProfile>
{
    public void Configure(EntityTypeBuilder<BrokerProfile> b)
    {
        b.ToTable("broker_profiles", BrokerageModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Status).HasMaxLength(20).IsRequired();
        b.Property(x => x.SectorIds).HasColumnType("uuid[]").IsRequired();
        b.HasIndex(x => x.PersonId).IsUnique();
    }
}

public sealed class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
    public void Configure(EntityTypeBuilder<Assignment> b)
    {
        b.ToTable("assignments", BrokerageModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Role).HasMaxLength(20).IsRequired();
        b.Property(x => x.Status).HasMaxLength(20).IsRequired();
        b.HasIndex(x => new { x.BrokerPersonId, x.Status });
        b.HasIndex(x => x.CaseId);
    }
}
