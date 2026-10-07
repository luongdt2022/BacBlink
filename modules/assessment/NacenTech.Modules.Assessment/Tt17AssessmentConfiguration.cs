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
        builder.Property(x => x.AssessmentYear).IsRequired();
        builder.Property(x => x.ScopeType).HasMaxLength(30).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(30).IsRequired();
        
        builder.Property(x => x.Machineries).HasColumnType("jsonb");
        builder.Property(x => x.Equipments).HasColumnType("jsonb");
        builder.Property(x => x.Materials).HasColumnType("jsonb");
        builder.Property(x => x.Criteria).HasColumnType("jsonb");
        
        builder.HasIndex(x => new { x.EnterpriseId, x.AssessmentYear }).IsUnique();
    }
}
