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

public sealed class ExpertProfileConfiguration : IEntityTypeConfiguration<ExpertProfile>
{
    public void Configure(EntityTypeBuilder<ExpertProfile> b)
    {
        b.ToTable("expert_profiles", BrokerageModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.FullName).HasMaxLength(100).IsRequired();
        b.Property(x => x.ExpertCode).HasMaxLength(40).IsRequired();
        b.Property(x => x.VisibilityStatus).HasMaxLength(20).IsRequired().HasDefaultValue("PRIVATE");
        b.Property(x => x.PublicBio).HasMaxLength(4000);
        b.Property(x => x.Phone).HasMaxLength(20);
        b.Property(x => x.Email).HasMaxLength(100);
        b.Property(x => x.IdCardNumber).HasMaxLength(20);
        b.Property(x => x.Gender).HasMaxLength(10).IsRequired();
        b.Property(x => x.AcademicRank).HasMaxLength(50).IsRequired();
        b.Property(x => x.Degree).HasMaxLength(50).IsRequired();
        b.Property(x => x.OrganizationName).HasMaxLength(255).IsRequired();
        b.Property(x => x.OrganizationAddress).HasMaxLength(255);
        b.Property(x => x.ResearchTitle).HasMaxLength(100);
        b.Property(x => x.PositionTitle).HasMaxLength(100);
        b.Property(x => x.ExpertiseSectors).HasColumnType("text[]").IsRequired();
        b.Property(x => x.SpecializedKeywords).HasColumnType("text[]").IsRequired();
        b.Property(x => x.MasteredTechCodes).HasColumnType("text[]").IsRequired();
        b.Property(x => x.TrainingHistoryJson).HasColumnType("jsonb");
        b.Property(x => x.EmploymentHistoryJson).HasColumnType("jsonb");
        b.Property(x => x.PublicationsJson).HasColumnType("jsonb");
        b.Property(x => x.CvFileUrl).HasMaxLength(500);
        b.Property(x => x.DraftSource).HasMaxLength(30).IsRequired().HasDefaultValue("PORTAL");
        b.Property(x => x.MagicLinkToken).HasMaxLength(255);
        b.Property(x => x.Status).HasMaxLength(30).IsRequired();
        b.Property(x => x.ConnectionCount).HasColumnName("connection_count").HasDefaultValue(0).IsRequired();
        b.Property(x => x.LegalOath).IsRequired().HasDefaultValue(false);
        b.HasIndex(x => x.PersonId).IsUnique();
        b.HasIndex(x => x.MagicLinkToken);
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.ExpertCode).IsUnique();
        b.HasIndex(x => new { x.Status, x.VisibilityStatus });
    }
}

public sealed class ExpertDetailConfiguration : IEntityTypeConfiguration<ExpertDocument>, IEntityTypeConfiguration<ExpertProfilePrivateDetail>, IEntityTypeConfiguration<ExpertTrainingRecord>, IEntityTypeConfiguration<ExpertEmploymentRecord>, IEntityTypeConfiguration<ExpertPublication>, IEntityTypeConfiguration<ExpertPatent>, IEntityTypeConfiguration<ExpertPracticalProject>, IEntityTypeConfiguration<ExpertResearchProject>, IEntityTypeConfiguration<ExpertAward>, IEntityTypeConfiguration<ExpertAiIngestion>, IEntityTypeConfiguration<ExpertConsent>, IEntityTypeConfiguration<ExpertProfileStatusHistory>
{
    private static void Base(EntityTypeBuilder b, string table)
    {
        b.ToTable(table, BrokerageModule.SchemaName);
        b.HasKey("Id");
        b.Property<Guid>("ExpertProfileId");
        b.HasIndex("ExpertProfileId");
        b.HasOne(typeof(ExpertProfile)).WithMany().HasForeignKey("ExpertProfileId").OnDelete(DeleteBehavior.Cascade);
    }
    public void Configure(EntityTypeBuilder<ExpertDocument> b) { Base(b, "expert_documents"); b.Property(x => x.DocumentType).HasMaxLength(30); b.Property(x => x.StorageKey).HasMaxLength(500); b.Property(x => x.Sha256).HasMaxLength(64); b.Property(x => x.MimeType).HasMaxLength(100); b.HasIndex(x => new { x.ExpertProfileId, x.DocumentType, x.IsActive }); }
    public void Configure(EntityTypeBuilder<ExpertProfilePrivateDetail> b) { Base(b, "expert_profile_private_details"); b.HasIndex(x => x.ExpertProfileId).IsUnique(); foreach (var p in b.Metadata.GetProperties().Where(x => x.Name.EndsWith("Ciphertext"))) p.SetMaxLength(4096); }
    public void Configure(EntityTypeBuilder<ExpertTrainingRecord> b) { Base(b, "expert_training_records"); b.Property(x => x.Level).HasMaxLength(50); b.Property(x => x.Institution).HasMaxLength(255); Public(b); }
    public void Configure(EntityTypeBuilder<ExpertEmploymentRecord> b) { Base(b, "expert_employment_records"); b.Property(x => x.Organization).HasMaxLength(255); Public(b); }
    public void Configure(EntityTypeBuilder<ExpertPublication> b) { Base(b, "expert_publications"); b.Property(x => x.Title).HasMaxLength(500); b.Property(x => x.Doi).HasMaxLength(255); Public(b); }
    public void Configure(EntityTypeBuilder<ExpertPatent> b) { Base(b, "expert_patents"); b.Property(x => x.Title).HasMaxLength(500); b.Property(x => x.Description).HasMaxLength(4000); Public(b); }
    public void Configure(EntityTypeBuilder<ExpertPracticalProject> b) { Base(b, "expert_practical_projects"); b.Property(x => x.Title).HasMaxLength(500); b.Property(x => x.Outcome).HasMaxLength(1000); Public(b); }
    public void Configure(EntityTypeBuilder<ExpertResearchProject> b) { Base(b, "expert_research_projects"); b.Property(x => x.Title).HasMaxLength(500); b.Property(x => x.BudgetAmount).HasPrecision(18, 2); Public(b); }
    public void Configure(EntityTypeBuilder<ExpertAward> b) { Base(b, "expert_awards"); b.Property(x => x.Name).HasMaxLength(500); b.Property(x => x.Description).HasMaxLength(4000); Public(b); }
    public void Configure(EntityTypeBuilder<ExpertAiIngestion> b) { Base(b, "expert_ai_ingestions"); b.Property(x => x.Status).HasMaxLength(30); b.Property(x => x.ResultJson).HasColumnType("jsonb"); }
    public void Configure(EntityTypeBuilder<ExpertConsent> b) { Base(b, "expert_consents"); b.Property(x => x.ConsentType).HasMaxLength(30); b.Property(x => x.PolicyVersion).HasMaxLength(50); }
    public void Configure(EntityTypeBuilder<ExpertProfileStatusHistory> b) { Base(b, "expert_profile_status_history"); b.Property(x => x.ToStatus).HasMaxLength(30); }

    private static void Public<TEntity>(EntityTypeBuilder<TEntity> b) where TEntity : class
    {
        b.Property<bool>("IsPublic").HasDefaultValue(false);
        b.Property<bool>("IsActive").HasDefaultValue(true);
        b.HasIndex("ExpertProfileId", "IsPublic", "IsActive");
    }
}
