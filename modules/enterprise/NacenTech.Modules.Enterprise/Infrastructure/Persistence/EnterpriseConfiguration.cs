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
        
        b.Property(x => x.Name).HasMaxLength(255);
        b.Property(x => x.TaxCode).HasMaxLength(20).IsRequired(false);
        b.Property(x => x.ProvinceCity).HasMaxLength(100);
        b.Property(x => x.MainSectorName).HasMaxLength(255);
        b.Property(x => x.SectorCode).HasMaxLength(20);
        b.Property(x => x.CapabilityTier).HasMaxLength(30).HasDefaultValue("BASIC");
        b.Property(x => x.ActiveRole).HasMaxLength(30).HasDefaultValue("BUYER");
        
        b.Property(x => x.AddressInfoJson).HasColumnType("jsonb");
        b.Property(x => x.ProfileDetailsJson).HasColumnType("jsonb");
        b.Property(x => x.TopBottlenecksJson).HasColumnType("jsonb");
        b.Property(x => x.SupportNeedsJson).HasColumnType("jsonb");
        
        b.HasIndex(x => x.TaxCode).IsUnique().HasFilter("tax_code IS NOT NULL").HasDatabaseName("ix_enterprises_tax_code_unique");
        b.HasIndex(x => x.CapabilityTier);
        b.HasIndex(x => x.OwnerPersonId);
        b.HasIndex(x => x.ProvinceCity);
        b.HasIndex(x => x.SectorCode);
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.IsVerified);

        b.HasMany(x => x.Identifiers).WithOne().HasForeignKey(x => x.EnterpriseId);
        b.HasMany(x => x.InnovationProjects).WithOne().HasForeignKey(x => x.EnterpriseId);
        b.HasMany(x => x.IntellectualProperties).WithOne().HasForeignKey(x => x.EnterpriseId);
        b.HasMany(x => x.InnovationEvaluations).WithOne().HasForeignKey(x => x.EnterpriseId).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class EnterpriseInnovationEvaluationConfiguration : IEntityTypeConfiguration<EnterpriseInnovationEvaluation>
{
    public void Configure(EntityTypeBuilder<EnterpriseInnovationEvaluation> b)
    {
        b.ToTable("innovation_evaluations", "enterprise");
        b.HasKey(x => x.Id);

        b.Property(x => x.TaxCode).HasMaxLength(20).IsRequired();
        b.Property(x => x.CriteriaVersion).HasMaxLength(20).HasDefaultValue("v1.0");
        b.Property(x => x.TotalScore).HasPrecision(5, 2).HasDefaultValue(0.0m);
        b.Property(x => x.Classification).HasMaxLength(30).HasDefaultValue("UNRATED");
        b.Property(x => x.Status).HasMaxLength(30).HasDefaultValue("DRAFT_CALCULATED");
        b.Property(x => x.ReviewedBy).HasMaxLength(150);

        b.Property(x => x.GroupScoresJson).HasColumnType("jsonb").HasDefaultValue("{}");
        b.Property(x => x.CriteriaDetailsJson).HasColumnType("jsonb").HasDefaultValue("[]");

        b.HasIndex(x => x.EnterpriseId);
        b.HasIndex(x => x.TaxCode);
        b.HasIndex(x => x.Classification);
        b.HasIndex(x => x.Status);
        b.HasIndex(x => new { x.EnterpriseId, x.EvaluationYear, x.CriteriaVersion }).IsUnique();
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
