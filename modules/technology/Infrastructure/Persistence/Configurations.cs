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

        // Delta v5 extensions
        b.Property(x => x.MainImageUrl);
        b.Property(x => x.GalleryImageUrls).HasColumnType("text[]");
        b.Property(x => x.DeliveryTimeline).HasMaxLength(255);
        b.Property(x => x.WarrantyTerms).HasMaxLength(255);
        b.Property(x => x.SupplyScope).HasMaxLength(255);
        b.Property(x => x.PaymentTerms);
        b.Property(x => x.InstallationSupport).HasDefaultValue(true);

        b.HasMany(x => x.SpecValues).WithOne().HasForeignKey(x => x.OfferId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(x => x.SpecValues).UsePropertyAccessMode(PropertyAccessMode.Field);

        b.HasMany(x => x.Documents).WithOne().HasForeignKey(x => x.OfferId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(x => x.Documents).UsePropertyAccessMode(PropertyAccessMode.Field);

        b.HasIndex(x => x.OfferCode).IsUnique();
        b.HasIndex(x => x.SectorCode);
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.ManagingAuthorityId);
        b.HasIndex(x => x.EnterpriseTaxCode);
    }
}

public sealed class OfferSpecValueConfiguration : IEntityTypeConfiguration<OfferSpecValue>
{
    public void Configure(EntityTypeBuilder<OfferSpecValue> b)
    {
        b.ToTable("offer_spec_values", TechnologyModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.SpecCode).HasMaxLength(50);
        b.Property(x => x.SpecName).HasMaxLength(255).IsRequired();
        b.Property(x => x.SpecValue).IsRequired();
        b.Property(x => x.Unit).HasMaxLength(50);

        b.HasIndex(x => x.OfferId);
        b.HasIndex(x => x.SpecCode);
    }
}

public sealed class OfferDocumentConfiguration : IEntityTypeConfiguration<OfferDocument>
{
    public void Configure(EntityTypeBuilder<OfferDocument> b)
    {
        b.ToTable("offer_documents", TechnologyModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.DocumentType).HasMaxLength(50).IsRequired();
        b.Property(x => x.FileName).HasMaxLength(255).IsRequired();
        b.Property(x => x.FileUrl).IsRequired();
        b.Property(x => x.AccessScope).HasMaxLength(30).IsRequired();

        b.HasIndex(x => x.OfferId);
        b.HasIndex(x => x.DocumentType);
        b.HasIndex(x => x.AccessScope);
    }
}
