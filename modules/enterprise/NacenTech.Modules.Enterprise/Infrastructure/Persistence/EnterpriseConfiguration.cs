using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Enterprise.Domain;

namespace NacenTech.Modules.Enterprise.Infrastructure.Persistence;

internal sealed class EnterpriseConfiguration : IEntityTypeConfiguration<Domain.Enterprise>
{
    public void Configure(EntityTypeBuilder<Domain.Enterprise> b)
    {
        b.ToTable("enterprises", "enterprise");
        b.HasKey(x => x.Id);
        
        b.Property(x => x.AddressInfoJson).HasColumnType("jsonb");
        
        b.HasMany(x => x.Identifiers).WithOne().HasForeignKey(x => x.EnterpriseId);
        b.HasMany(x => x.InnovationProjects).WithOne().HasForeignKey(x => x.EnterpriseId);
        b.HasMany(x => x.IntellectualProperties).WithOne().HasForeignKey(x => x.EnterpriseId);
    }
}

internal sealed class EnterpriseIdentifierConfiguration : IEntityTypeConfiguration<EnterpriseIdentifier>
{
    public void Configure(EntityTypeBuilder<EnterpriseIdentifier> b)
    {
        b.ToTable("enterprise_identifiers", "enterprise");
        b.HasKey(x => x.Id);
    }
}

internal sealed class EnterpriseInnovationProjectConfiguration : IEntityTypeConfiguration<EnterpriseInnovationProject>
{
    public void Configure(EntityTypeBuilder<EnterpriseInnovationProject> b)
    {
        b.ToTable("enterprise_innovation_projects", "enterprise");
        b.HasKey(x => x.Id);
    }
}

internal sealed class EnterpriseIntellectualPropertyConfiguration : IEntityTypeConfiguration<EnterpriseIntellectualProperty>
{
    public void Configure(EntityTypeBuilder<EnterpriseIntellectualProperty> b)
    {
        b.ToTable("enterprise_intellectual_properties", "enterprise");
        b.HasKey(x => x.Id);
    }
}
