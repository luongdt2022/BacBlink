using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Demand.Domain;

namespace NacenTech.Modules.Demand.Infrastructure.Persistence;

public sealed class DemandBriefConfiguration : IEntityTypeConfiguration<DemandBrief>
{
    public void Configure(EntityTypeBuilder<DemandBrief> b)
    {
        b.ToTable("demand_briefs", DemandModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Status).HasMaxLength(20).IsRequired();
        b.Property(x => x.AiTitle).HasMaxLength(255);
        b.Property(x => x.AiProcessingStatus).HasMaxLength(20);
        b.Property(x => x.AiChunkingStatus).HasMaxLength(20);
        b.Property(x => x.SectorIds).HasColumnType("uuid[]").IsRequired();
        b.HasIndex(x => x.OwnerPersonId);
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.DeletedAt);
        b.HasMany(x => x.Versions).WithOne().HasForeignKey(v => v.DemandBriefId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(x => x.Versions).UsePropertyAccessMode(PropertyAccessMode.Field).AutoInclude();
    }
}

public sealed class DemandBriefVersionConfiguration : IEntityTypeConfiguration<DemandBriefVersion>
{
    public void Configure(EntityTypeBuilder<DemandBriefVersion> b)
    {
        b.ToTable("demand_brief_versions", DemandModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Title).HasMaxLength(255).IsRequired();
        b.HasIndex(x => new { x.DemandBriefId, x.VersionNo }).IsUnique();
    }
}

public sealed class SurveySubmissionConfiguration : IEntityTypeConfiguration<SurveySubmission>
{
    public void Configure(EntityTypeBuilder<SurveySubmission> b)
    {
        b.ToTable("survey_submissions", DemandModule.SchemaName);
        b.HasKey(x => x.Id);
        
        b.Property(x => x.NeedItems).HasColumnType("jsonb");
        b.Property(x => x.Bottlenecks).HasColumnType("jsonb");
        
        b.HasIndex(x => new { x.EnterpriseId, x.Year }).IsUnique();
    }
}

public sealed class DemandSurveyConfiguration : IEntityTypeConfiguration<DemandSurvey>
{
    public void Configure(EntityTypeBuilder<DemandSurvey> b)
    {
        b.ToTable("demand_surveys", DemandModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.SurveyCode).HasMaxLength(50).IsRequired();
        b.Property(x => x.SurveyType).HasMaxLength(20).IsRequired();
        b.Property(x => x.CompanyName).HasMaxLength(255).IsRequired();
        b.Property(x => x.TaxCode).HasMaxLength(30);
        b.Property(x => x.ContactName).HasMaxLength(150).IsRequired();
        b.Property(x => x.ContactPhone).HasMaxLength(50).IsRequired();
        b.Property(x => x.ContactEmail).HasMaxLength(150).IsRequired();
        b.Property(x => x.BusinessType).HasMaxLength(50);
        b.Property(x => x.EnterpriseSize).HasMaxLength(50);
        b.Property(x => x.EmployeeScale).HasMaxLength(50);
        b.Property(x => x.RevenueRange3y).HasColumnName("revenue_range_3y").HasMaxLength(50);
        b.Property(x => x.TopBottlenecks).HasColumnType("text[]");
        b.Property(x => x.Province).HasMaxLength(100);
        b.Property(x => x.HeadquartersAddress).HasMaxLength(255);
        b.Property(x => x.SurveyedFacility).HasMaxLength(255);
        b.Property(x => x.ContactTitle).HasMaxLength(100);
        b.Property(x => x.MainIndustry).HasMaxLength(100);
        b.Property(x => x.MainProducts).HasColumnType("text");
        b.Property(x => x.ConfirmedByName).HasMaxLength(150);
        b.Property(x => x.ConfirmedByTitle).HasMaxLength(100);
        b.Property(x => x.SurveyDetails).HasColumnType("jsonb");
        b.Property(x => x.EnterpriseId);
        b.Property(x => x.SurveyAnswers).HasColumnType("jsonb");
        b.Property(x => x.HasRdUnit);
        b.Property(x => x.HasTechTraining);
        b.Property(x => x.HasMachineryUpgrade);
        b.Property(x => x.HasRdBudget);
        b.Property(x => x.IsExporting);
        b.Property(x => x.InValueChain);
        b.Property(x => x.SupportNeeds).HasColumnType("text[]");
        b.Property(x => x.Recommendations);
        b.Property(x => x.TniScore);
        b.Property(x => x.TniClassification).HasMaxLength(30);
        b.Property(x => x.SurveyYear);
        b.Property(x => x.Status).HasMaxLength(30).IsRequired();

        b.HasIndex(x => x.SurveyCode).IsUnique();
        b.HasIndex(x => x.TaxCode);
        b.HasIndex(x => x.Status);
        b.HasMany(x => x.Items).WithOne().HasForeignKey(i => i.SurveyId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class DemandItemConfiguration : IEntityTypeConfiguration<DemandItem>
{
    public void Configure(EntityTypeBuilder<DemandItem> b)
    {
        b.ToTable("demand_items", DemandModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.ItemCode).HasMaxLength(50).IsRequired();
        b.Property(x => x.StageName).HasMaxLength(255).IsRequired();
        b.Property(x => x.TechnicalProblem).IsRequired();
        b.Property(x => x.ExpectedGoal).IsRequired();
        b.Property(x => x.SectorCode).HasMaxLength(20).IsRequired();
        b.Property(x => x.TechGroupCode).HasMaxLength(20).IsRequired();
        b.Property(x => x.DemandTypeCode).HasMaxLength(20).IsRequired();
        b.Property(x => x.BudgetRange).HasMaxLength(50).IsRequired();
        b.Property(x => x.TniClassification).HasMaxLength(30).IsRequired();
        b.Property(x => x.Status).HasMaxLength(30).IsRequired();

        b.HasIndex(x => x.ItemCode).IsUnique();
        b.HasIndex(x => x.SurveyId);
        b.HasIndex(x => x.SectorCode);
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.IsPublicListed);
    }
}

public sealed class DemandBookmarkConfiguration : IEntityTypeConfiguration<DemandBookmark>
{
    public void Configure(EntityTypeBuilder<DemandBookmark> b)
    {
        b.ToTable("demand_bookmarks", DemandModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.PersonId).IsRequired();
        b.Property(x => x.DemandItemId).IsRequired();
        b.Property(x => x.CreatedAt).IsRequired();

        b.HasIndex(x => new { x.PersonId, x.DemandItemId }).IsUnique();
        b.HasIndex(x => x.PersonId);
        b.HasIndex(x => x.DemandItemId);
    }
}


