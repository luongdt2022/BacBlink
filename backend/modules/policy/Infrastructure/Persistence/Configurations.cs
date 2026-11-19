using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Policy.Domain;

namespace NacenTech.Modules.Policy.Infrastructure.Persistence;

public sealed class TaxonomyTermConfiguration : IEntityTypeConfiguration<TaxonomyTerm>
{
    public void Configure(EntityTypeBuilder<TaxonomyTerm> b)
    {
        b.ToTable("taxonomy_terms", PolicyModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Kind).HasMaxLength(30).IsRequired();
        b.Property(x => x.Name).HasMaxLength(255).IsRequired();
        b.Property(x => x.Code).HasMaxLength(50);
        b.Property(x => x.MetadataJson).HasColumnName("metadata").HasColumnType("jsonb").HasDefaultValue("{}");
        b.HasIndex(x => new { x.Kind, x.Name });
        b.HasIndex(x => new { x.Kind, x.IsActive });
        b.HasIndex(x => new { x.Kind, x.Code }).IsUnique().HasFilter("code IS NOT NULL");
        b.HasIndex(x => x.Code);
    }
}

public sealed class PolicySnapshotConfiguration : IEntityTypeConfiguration<PolicySnapshot>
{
    public void Configure(EntityTypeBuilder<PolicySnapshot> b)
    {
        b.ToTable("policy_snapshots", PolicyModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.PlatformPolicyVersion).HasMaxLength(50).IsRequired();
        b.Property(x => x.TrackPolicyVersion).HasMaxLength(50).IsRequired();
        b.Property(x => x.DocumentJson).HasColumnType("jsonb").IsRequired();
        b.Property(x => x.DocumentHash).HasMaxLength(64).IsRequired();
        b.Property(x => x.CanonicalizationVersion).HasMaxLength(20).IsRequired();
        b.HasIndex(x => new { x.CaseId, x.IsCurrent });
    }
}
