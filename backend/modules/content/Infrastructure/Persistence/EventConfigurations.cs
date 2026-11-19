using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Content.Domain;

namespace NacenTech.Modules.Content.Infrastructure.Persistence;

public sealed class TechmartEventConfiguration : IEntityTypeConfiguration<TechmartEvent>
{
    public void Configure(EntityTypeBuilder<TechmartEvent> b)
    {
        b.ToTable("techmart_events", ContentModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Title).HasMaxLength(255).IsRequired();
        b.Property(x => x.Description).IsRequired();
        b.Property(x => x.Location).HasMaxLength(255).IsRequired();
        b.Property(x => x.Status).HasMaxLength(50).IsRequired();
        b.Property(x => x.PdfBrochureUrl).HasMaxLength(500);
        b.Property(x => x.BannerUrl).HasMaxLength(500);
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.StartDate);
    }
}

public sealed class EventRegistrationConfiguration : IEntityTypeConfiguration<EventRegistration>
{
    public void Configure(EntityTypeBuilder<EventRegistration> b)
    {
        b.ToTable("event_registrations", ContentModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.OrganizationName).HasMaxLength(255).IsRequired();
        b.Property(x => x.ContactName).HasMaxLength(255).IsRequired();
        b.Property(x => x.PhoneNumber).HasMaxLength(50).IsRequired();
        b.Property(x => x.Email).HasMaxLength(255).IsRequired();
        b.Property(x => x.RoleType).HasMaxLength(50).IsRequired();
        b.Property(x => x.RegistrationCode).HasMaxLength(50).IsRequired();
        b.Property(x => x.Status).HasMaxLength(50).IsRequired();
        b.HasIndex(x => x.EventId);
        b.HasIndex(x => x.RegistrationCode).IsUnique();
    }
}
