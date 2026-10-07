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
