using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NacenTech.Modules.Integration.Domain;

namespace NacenTech.Modules.Integration.Infrastructure.Persistence;

public sealed class SourceRecordConfiguration : IEntityTypeConfiguration<SourceRecord>
{
    public void Configure(EntityTypeBuilder<SourceRecord> b)
    {
        b.ToTable("source_records", IntegrationModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.Source).HasMaxLength(80).IsRequired();
        b.Property(x => x.ExternalId).HasMaxLength(200).IsRequired();
        b.Property(x => x.ContentHash).HasMaxLength(64).IsRequired();

        // Bất biến 102 ở tầng lược đồ, không ở tầng ứng dụng: một bản ghi ngoài không có license và không có
        // mức thẩm quyền thì không tồn tại được, kể cả khi có người viết mã bỏ qua kiểm tra.
        b.Property(x => x.License).HasMaxLength(30).IsRequired();
        b.Property(x => x.AuthorityLevel).HasMaxLength(20).IsRequired();

        b.Property(x => x.SourceUrl).HasMaxLength(1000);
        b.Property(x => x.PayloadJson).HasColumnType("jsonb");

        // Khoá tự nhiên của dữ liệu ngoài. Nạp lại cùng (nguồn, id gốc) là cập nhật, không phải bản ghi thứ hai.
        b.HasIndex(x => new { x.Source, x.ExternalId }).IsUnique();
    }
}

public sealed class DemandSignalConfiguration : IEntityTypeConfiguration<DemandSignal>
{
    public void Configure(EntityTypeBuilder<DemandSignal> b)
    {
        b.ToTable("demand_signals", IntegrationModule.SchemaName);
        b.HasKey(x => x.Id);
        b.Property(x => x.SignalClass).HasMaxLength(40).IsRequired();
        b.Property(x => x.Title).HasMaxLength(500).IsRequired();
        b.Property(x => x.Summary).HasMaxLength(4000);
        b.Property(x => x.BuyerName).HasMaxLength(300);
        b.Property(x => x.SectorIds).HasColumnType("uuid[]").IsRequired();
        b.Property(x => x.BudgetAmount).HasPrecision(18, 2);
        b.Property(x => x.BudgetCurrency).HasMaxLength(3);
        b.Property(x => x.Status).HasMaxLength(20).IsRequired();
        b.Property(x => x.DecisionReason).HasMaxLength(1000);

        // Một tín hiệu cho một bản ghi nguồn. Không có khoá ngoại xuyên schema ở write path (§9.1) — nhưng
        // source_records cùng schema `integration`, nên ràng buộc này là hợp lệ và đáng có.
        b.HasIndex(x => x.SourceRecordId).IsUnique();
        b.HasIndex(x => new { x.Status, x.SignalClass, x.ObservedAt });
    }
}
