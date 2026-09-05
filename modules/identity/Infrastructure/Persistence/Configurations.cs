using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Identity.Domain;

namespace NacenTech.Modules.Identity.Infrastructure.Persistence;

public sealed class PersonConfiguration : IEntityTypeConfiguration<Person>
{
    public void Configure(EntityTypeBuilder<Person> b)
    {
        b.ToTable("persons", IdentityModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Email).HasMaxLength(255).IsRequired();
        b.HasIndex(x => x.Email).IsUnique();
        b.Property(x => x.PasswordHash).HasMaxLength(255).IsRequired();
        b.Property(x => x.PasswordHashAlgorithm).HasMaxLength(20).IsRequired();
        b.Property(x => x.PreviousPasswordHash).HasMaxLength(255);
        b.Property(x => x.PreviousPasswordHashAlgorithm).HasMaxLength(20);
        b.Property(x => x.FirstName).HasMaxLength(100);
        b.Property(x => x.LastName).HasMaxLength(100);
        b.Property(x => x.Phone).HasMaxLength(20);
        b.Property(x => x.OrganizationName).HasMaxLength(255);
        b.Property(x => x.PlatformRole).HasMaxLength(20).IsRequired();
        b.HasIndex(x => new { x.PlatformRole, x.IsActive });
    }
}

public sealed class ActivationTokenConfiguration : IEntityTypeConfiguration<ActivationToken>
{
    public void Configure(EntityTypeBuilder<ActivationToken> b)
    {
        b.ToTable("activation_tokens", IdentityModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Token).HasMaxLength(255).IsRequired();
        b.HasIndex(x => x.Token).IsUnique();
        b.HasIndex(x => x.PersonId);
        b.HasIndex(x => x.ExpiresAt);
    }
}

public sealed class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> b)
    {
        b.ToTable("password_reset_tokens", IdentityModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Token).HasMaxLength(255).IsRequired();
        b.HasIndex(x => x.Token).IsUnique();
        b.HasIndex(x => x.PersonId);
        b.HasIndex(x => x.ExpiresAt);
    }
}
