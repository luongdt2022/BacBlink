using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Matching.Domain;

namespace NacenTech.Modules.Matching.Infrastructure.Persistence;

public sealed class ContentChunkConfiguration : IEntityTypeConfiguration<ContentChunk>
{
    public void Configure(EntityTypeBuilder<ContentChunk> b)
    {
        b.ToTable("content_chunks", MatchingModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.SubjectKind).HasMaxLength(40).IsRequired();
        b.Property(x => x.EmbeddingModelVersion).HasMaxLength(60).IsRequired();
        b.Property(x => x.Embedding).HasColumnType("real[]").IsRequired();
        b.Ignore(x => x.Subject);
        b.HasIndex(x => new { x.SubjectKind, x.SubjectId, x.Index }).IsUnique();
    }
}

public sealed class MatchRoundConfiguration : IEntityTypeConfiguration<MatchRound>
{
    public void Configure(EntityTypeBuilder<MatchRound> b)
    {
        b.ToTable("match_rounds", MatchingModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.SubjectKind).HasMaxLength(40).IsRequired();
        b.Property(x => x.SearchEngineVersion).HasMaxLength(120).IsRequired();
        b.Property(x => x.EmbeddingModelVersion).HasMaxLength(60).IsRequired();
        b.Property(x => x.ScoringMode).HasMaxLength(40).IsRequired();
        b.Ignore(x => x.Subject);
        b.HasIndex(x => new { x.SubjectKind, x.SubjectId, x.CreatedAt });
        b.HasIndex(x => new { x.SubjectKind, x.SubjectId, x.IsAuthoritative });
        b.HasMany(x => x.Candidates).WithOne().HasForeignKey(c => c.RoundId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(x => x.Candidates).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class MatchCandidateConfiguration : IEntityTypeConfiguration<MatchCandidate>
{
    public void Configure(EntityTypeBuilder<MatchCandidate> b)
    {
        b.ToTable("match_candidates", MatchingModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.CandidateKind).HasMaxLength(40).IsRequired();
        b.Property(x => x.Reason).HasMaxLength(120);
        b.Ignore(x => x.Candidate);
        b.HasIndex(x => new { x.RoundId, x.Rank });
        b.HasIndex(x => new { x.CandidateKind, x.CandidateId });
    }
}

public sealed class SearchQueryLogConfiguration : IEntityTypeConfiguration<SearchQueryLog>
{
    public void Configure(EntityTypeBuilder<SearchQueryLog> b)
    {
        b.ToTable("search_query_logs", MatchingModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.QueryText).IsRequired();
        b.Property(x => x.TargetKind).HasMaxLength(40);
        b.Property(x => x.ScoringMode).HasMaxLength(40).IsRequired();
        b.Property(x => x.EngineVersion).HasMaxLength(120).IsRequired();
        b.Property(x => x.SectorIds).HasColumnType("uuid[]").IsRequired();
        b.Property(x => x.ResultSubjectIds).HasColumnType("uuid[]").IsRequired();
        b.HasIndex(x => x.CreatedAt);
    }
}
