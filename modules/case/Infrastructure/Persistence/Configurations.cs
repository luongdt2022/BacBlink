using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Case.Domain;

namespace NacenTech.Modules.Case.Infrastructure.Persistence;

public sealed class CommercializationCaseConfiguration : IEntityTypeConfiguration<CommercializationCase>
{
    public void Configure(EntityTypeBuilder<CommercializationCase> b)
    {
        b.ToTable("commercialization_cases", CaseModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.CaseCode).HasMaxLength(30).IsRequired();
        b.HasIndex(x => x.CaseCode).IsUnique();
        b.Property(x => x.Track).HasMaxLength(40).IsRequired();
        b.Property(x => x.Stage).HasMaxLength(40).IsRequired();
        b.Property(x => x.Title).HasMaxLength(255).IsRequired();
        b.Property(x => x.ConfidentialityLevel).HasMaxLength(30).IsRequired();
        b.Property(x => x.BudgetPathStatus).HasMaxLength(30).IsRequired();
        b.Ignore(x => x.HasOpenHold);
        b.HasIndex(x => x.Stage);
        b.HasIndex(x => x.LeadBrokerPersonId);
        b.HasIndex(x => x.ProblemOwnerPersonId);
        b.HasMany(x => x.Parties).WithOne().HasForeignKey(p => p.CaseId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.Holds).WithOne().HasForeignKey(h => h.CaseId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.Decisions).WithOne().HasForeignKey(d => d.CaseId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(x => x.Parties).UsePropertyAccessMode(PropertyAccessMode.Field).AutoInclude();
        b.Navigation(x => x.Holds).UsePropertyAccessMode(PropertyAccessMode.Field).AutoInclude();
        b.Navigation(x => x.Decisions).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class CasePartyConfiguration : IEntityTypeConfiguration<CaseParty>
{
    public void Configure(EntityTypeBuilder<CaseParty> b)
    {
        b.ToTable("case_parties", CaseModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Role).HasMaxLength(40).IsRequired();
        b.HasIndex(x => new { x.CaseId, x.PersonId, x.Role });
    }
}

public sealed class CaseHoldConfiguration : IEntityTypeConfiguration<CaseHold>
{
    public void Configure(EntityTypeBuilder<CaseHold> b)
    {
        b.ToTable("case_holds", CaseModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Reason).HasMaxLength(200).IsRequired();
        b.HasIndex(x => new { x.CaseId, x.ReleasedAt });
    }
}

public sealed class DecisionRecordConfiguration : IEntityTypeConfiguration<DecisionRecord>
{
    public void Configure(EntityTypeBuilder<DecisionRecord> b)
    {
        b.ToTable("decision_records", CaseModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.FromStage).HasMaxLength(40).IsRequired();
        b.Property(x => x.ToStage).HasMaxLength(40).IsRequired();
        b.Property(x => x.Decision).HasMaxLength(30).IsRequired();
        b.Property(x => x.Rationale).HasMaxLength(4000).IsRequired();
        b.Property(x => x.MandateRef).HasMaxLength(200);
        b.Property(x => x.SignatureRef).HasMaxLength(200);
        b.Property(x => x.ReasonCodes).HasColumnType("text[]").IsRequired();
        b.Property(x => x.EvidenceRefs).HasColumnType("text[]").IsRequired();
        b.HasIndex(x => new { x.CaseId, x.DecidedAt });
    }
}
