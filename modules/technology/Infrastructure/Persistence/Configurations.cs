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

        // Delta v6 extensions
        b.Property(x => x.ModelCode).HasMaxLength(100);
        b.Property(x => x.Manufacturer).HasMaxLength(255);
        b.Property(x => x.OriginCountry).HasMaxLength(100);
        b.Property(x => x.EquipmentStatus).HasMaxLength(50).HasDefaultValue("NEW");
        b.Property(x => x.ManufacturingYear);
        b.Property(x => x.CapacityScale).HasMaxLength(255);
        b.Property(x => x.EnergyConsumption).HasMaxLength(255);
        b.Property(x => x.AutomationLevel).HasMaxLength(100);
        b.Property(x => x.OperatingPrinciple);
        b.Property(x => x.DeploymentConditions);

        b.Property(x => x.TransferPriorityMethod).HasMaxLength(100);
        b.Property(x => x.PriceIncludes);
        b.Property(x => x.TaxAndExtraCosts);
        b.Property(x => x.TechnicalSupportMethod).HasMaxLength(255);

        b.Property(x => x.IpIssueDate);
        b.Property(x => x.LegalCommitmentConfirmed).HasDefaultValue(false);

        // Verification fields (Two-tier review)
        b.Property(x => x.TrlVerificationStatus).HasMaxLength(30).HasDefaultValue("SELF_DECLARED");
        b.Property(x => x.IpVerificationStatus).HasMaxLength(30).HasDefaultValue("SELF_DECLARED");
        b.Property(x => x.VerifiedAuthorityName).HasMaxLength(255);
        b.Property(x => x.TrlVerifiedBy);
        b.Property(x => x.TrlVerifiedAt);
        b.Property(x => x.TrlReviewNote);

        // DEFECT-09: Soft Delete mapping and global query filter
        b.Property(x => x.IsDeleted).HasDefaultValue(false);
        b.Property(x => x.DeletedAt);
        b.HasQueryFilter(x => !x.IsDeleted);

        b.HasMany(x => x.SpecValues).WithOne().HasForeignKey(x => x.OfferId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(x => x.SpecValues).UsePropertyAccessMode(PropertyAccessMode.Field);

        b.HasMany(x => x.Documents).WithOne().HasForeignKey(x => x.OfferId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(x => x.Documents).UsePropertyAccessMode(PropertyAccessMode.Field);

        b.HasIndex(x => x.OfferCode).IsUnique();
        b.HasIndex(x => x.SectorCode);
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.ManagingAuthorityId);
        b.HasIndex(x => x.EnterpriseTaxCode);
        b.HasIndex(x => x.TrlVerificationStatus);
        b.HasIndex(x => x.IpVerificationStatus);
        b.HasIndex(x => x.IsDeleted);
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
        b.Property(x => x.SpecCategory).HasMaxLength(50).HasDefaultValue("TIER_3_CUSTOM");

        b.HasIndex(x => x.OfferId);
        b.HasIndex(x => x.SpecCode);
        b.HasIndex(x => new { x.OfferId, x.SpecCategory });
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
