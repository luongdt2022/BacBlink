using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace NacenTech.Modules.Assessment.Infrastructure.Persistence;

public class Tt17AssessmentConfiguration : IEntityTypeConfiguration<Tt17Assessment>
{
    public void Configure(EntityTypeBuilder<Tt17Assessment> builder)
    {
        builder.ToTable("tt17_assessments", "assessment");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.EnterpriseId).IsRequired();
        builder.Property(x => x.EnterpriseName).HasMaxLength(255).IsRequired();
        builder.Property(x => x.TaxCode).HasMaxLength(30).IsRequired();
        builder.Property(x => x.AssessmentYear).IsRequired();
        builder.Property(x => x.ScopeType).HasMaxLength(30).IsRequired();
        builder.Property(x => x.ScopeId).HasMaxLength(20).IsRequired();
        builder.Property(x => x.IndustryCode).HasMaxLength(20).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(30).IsRequired();
        
        builder.Property(x => x.SurveyDataJson).HasColumnType("jsonb").IsRequired();
        builder.Property(x => x.ScoresJson).HasColumnType("jsonb").IsRequired();
        builder.Property(x => x.AuditTrailJson).HasColumnType("jsonb");
        
        builder.Property(x => x.ReviewNotes).HasMaxLength(2000);

        builder.HasIndex(x => new { x.EnterpriseId, x.AssessmentYear }).IsUnique();
        builder.HasIndex(x => new { x.ScopeId, x.Status });
    }
}
