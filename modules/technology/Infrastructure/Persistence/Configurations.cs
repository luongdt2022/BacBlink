using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Technology.Domain;

namespace NacenTech.Modules.Technology.Infrastructure.Persistence;

public sealed class TechnologyAssetConfiguration : IEntityTypeConfiguration<TechnologyAsset>
{
    public void Configure(EntityTypeBuilder<TechnologyAsset> b)
    {
        b.ToTable("technology_assets", TechnologyModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.PublicationStatus).HasMaxLength(20).IsRequired();
        b.Property(x => x.QualityLevel).HasMaxLength(30).IsRequired();
        b.Property(x => x.AiTitle).HasMaxLength(255);
        b.Property(x => x.AiProcessingStatus).HasMaxLength(20);
        b.Property(x => x.AiChunkingStatus).HasMaxLength(20);
        b.Property(x => x.SectorIds).HasColumnType("uuid[]").IsRequired();
        b.HasIndex(x => x.OwnerPersonId);
        b.HasIndex(x => x.PublicationStatus);
        b.HasIndex(x => x.DeletedAt);
        b.HasMany(x => x.Versions).WithOne().HasForeignKey(v => v.TechnologyAssetId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(x => x.Versions).UsePropertyAccessMode(PropertyAccessMode.Field).AutoInclude();
    }
}

public sealed class TechnologyPackageVersionConfiguration : IEntityTypeConfiguration<TechnologyPackageVersion>
{
    public void Configure(EntityTypeBuilder<TechnologyPackageVersion> b)
    {
        b.ToTable("technology_package_versions", TechnologyModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Title).HasMaxLength(255).IsRequired();
        b.HasIndex(x => new { x.TechnologyAssetId, x.VersionNo }).IsUnique();
    }
}

public sealed class SellerTechnologyOfferConfiguration : IEntityTypeConfiguration<SellerTechnologyOffer>
{
    public void Configure(EntityTypeBuilder<SellerTechnologyOffer> b)
    {
        b.ToTable("seller_technology_offers", TechnologyModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.OfferCode).HasMaxLength(50).IsRequired();
        b.Property(x => x.OfferType).HasMaxLength(30).IsRequired();
        b.Property(x => x.Title).HasMaxLength(255).IsRequired();
        b.Property(x => x.Summary).IsRequired();
        b.Property(x => x.ProblemSolved).IsRequired();
        b.Property(x => x.SectorCode).HasMaxLength(20).IsRequired();
        b.Property(x => x.SectorName).HasMaxLength(150).IsRequired();
        b.Property(x => x.PricingType).HasMaxLength(30).IsRequired();
        b.Property(x => x.Currency).HasMaxLength(10).IsRequired();
        b.Property(x => x.Status).HasMaxLength(30).IsRequired();
        b.Property(x => x.ScopeType).HasMaxLength(30);
        b.Property(x => x.ScopeId).HasMaxLength(50);
        b.Property(x => x.EnterpriseTaxCode).HasMaxLength(50);
        b.Property(x => x.EnterpriseName).HasMaxLength(255);

        b.HasIndex(x => x.OfferCode).IsUnique();
        b.HasIndex(x => x.SectorCode);
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.ManagingAuthorityId);
        b.HasIndex(x => x.EnterpriseTaxCode);
    }
}
