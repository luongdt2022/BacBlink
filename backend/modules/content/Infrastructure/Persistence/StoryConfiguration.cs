using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Content.Domain;

namespace NacenTech.Modules.Content.Infrastructure.Persistence;

public sealed class StoryConfiguration : IEntityTypeConfiguration<Story>
{
    public void Configure(EntityTypeBuilder<Story> b)
    {
        b.ToTable("stories", ContentModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Title).HasMaxLength(255).IsRequired();
        b.Property(x => x.Type).HasMaxLength(20).IsRequired();
        b.Property(x => x.Status).HasMaxLength(20).IsRequired();
        b.Property(x => x.Content).IsRequired();
        b.HasIndex(x => x.AuthorPersonId);
        b.HasIndex(x => new { x.Status, x.IsHidden });
    }
}
