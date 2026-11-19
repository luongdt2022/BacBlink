using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Entitlement.Domain;

namespace NacenTech.Modules.Entitlement.Infrastructure.Persistence;

public sealed class ManagedServiceAgreementConfiguration : IEntityTypeConfiguration<ManagedServiceAgreement>
{
    public void Configure(EntityTypeBuilder<ManagedServiceAgreement> b)
    {
        b.ToTable("managed_service_agreements", EntitlementModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.PayerKind).HasMaxLength(20).IsRequired();
        b.Property(x => x.ServiceLine).HasMaxLength(80).IsRequired();
        b.Property(x => x.Reference).HasMaxLength(120).IsRequired();
        b.Property(x => x.InvoiceReference).HasMaxLength(120);
        b.Property(x => x.Status).HasMaxLength(20).IsRequired();
        b.Ignore(x => x.Payer);
        b.HasIndex(x => new { x.PayerKind, x.PayerId, x.Status, x.PeriodEnd });
        b.HasIndex(x => x.Reference).IsUnique();
        b.HasMany(x => x.Entitlements).WithOne().HasForeignKey(e => e.AgreementId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(x => x.Entitlements).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class EntitlementConfiguration : IEntityTypeConfiguration<Domain.Entitlement>
{
    public void Configure(EntityTypeBuilder<Domain.Entitlement> b)
    {
        b.ToTable("entitlements", EntitlementModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.CapabilityCode).HasMaxLength(60).IsRequired();
        b.Ignore(x => x.HasRemaining);
        b.Ignore(x => x.Remaining);
        b.HasIndex(x => new { x.AgreementId, x.CapabilityCode }).IsUnique();
    }
}

public sealed class UsageRecordConfiguration : IEntityTypeConfiguration<UsageRecord>
{
    public void Configure(EntityTypeBuilder<UsageRecord> b)
    {
        b.ToTable("usage_records", EntitlementModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.PayerKind).HasMaxLength(20).IsRequired();
        b.Property(x => x.CapabilityCode).HasMaxLength(60).IsRequired();
        b.Property(x => x.Outcome).HasMaxLength(20).IsRequired();
        b.Ignore(x => x.Payer);

        // Truy vấn duy nhất thật sự quan trọng trước khi bật cưỡng chế: "bao nhiêu thao tác sẽ bị chặn, của ai,
        // ở capability nào". Chỉ mục theo đúng thứ tự đó.
        b.HasIndex(x => new { x.Outcome, x.CapabilityCode, x.OccurredAt });
        b.HasIndex(x => new { x.PayerKind, x.PayerId, x.OccurredAt });
    }
}
