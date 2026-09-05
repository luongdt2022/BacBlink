using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.DataRoom.Domain;

namespace NacenTech.Modules.DataRoom.Infrastructure.Persistence;

public sealed class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> b)
    {
        b.ToTable("documents", DataRoomModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.SubjectKind).HasMaxLength(40).IsRequired();
        b.Property(x => x.Kind).HasMaxLength(30).IsRequired();
        b.Property(x => x.FileType).HasMaxLength(30).IsRequired();
        b.Property(x => x.Classification).HasConversion<string>().HasMaxLength(30).IsRequired();
        b.Property(x => x.SectionCode).HasMaxLength(60);
        b.Ignore(x => x.Subject);
        b.Ignore(x => x.Current);
        b.HasIndex(x => new { x.SubjectKind, x.SubjectId });
        b.HasIndex(x => new { x.SubjectKind, x.SubjectId, x.SectionCode });
        b.HasMany(x => x.Versions).WithOne().HasForeignKey(v => v.DocumentId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(x => x.Versions).UsePropertyAccessMode(PropertyAccessMode.Field).AutoInclude();
    }
}

public sealed class DocumentVersionConfiguration : IEntityTypeConfiguration<DocumentVersion>
{
    public void Configure(EntityTypeBuilder<DocumentVersion> b)
    {
        b.ToTable("document_versions", DataRoomModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.FileName).HasMaxLength(255);
        b.Property(x => x.StorageKey).HasMaxLength(500);
        b.Property(x => x.ContentType).HasMaxLength(120);
        b.Property(x => x.Sha256).HasMaxLength(64).IsRequired();
        b.HasIndex(x => new { x.DocumentId, x.VersionNo }).IsUnique();
        b.HasIndex(x => x.StorageKey);
    }
}

public sealed class AccessGrantConfiguration : IEntityTypeConfiguration<AccessGrant>
{
    public void Configure(EntityTypeBuilder<AccessGrant> b)
    {
        b.ToTable("access_grants", DataRoomModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.SubjectKind).HasMaxLength(40).IsRequired();
        b.Property(x => x.Purpose).HasMaxLength(60).IsRequired();
        b.Property(x => x.Ceiling).HasConversion<string>().HasMaxLength(30).IsRequired();
        b.Ignore(x => x.Subject);
        b.HasIndex(x => new { x.SubjectKind, x.SubjectId, x.GranteePersonId });
    }
}
