using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Lms.Domain;
using NacenTech.Persistence.Platform;

namespace NacenTech.Persistence;

/// <summary>
/// DbContext DUY NHẤT của hệ thống (MOD-05, D2-147). Module tách nhau bằng schema PostgreSQL,
/// không tách bằng DbContext. Cấu hình entity của mọi module được apply từ assembly của module.
/// Tên bảng/cột chuyển snake_case tự động để không lệ thuộc package naming-convention ngoài.
/// </summary>
public sealed partial class NacenTechDbContext(DbContextOptions<NacenTechDbContext> options) : DbContext(options)
{
    public const string PlatformSchema = "platform";

    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();
    public DbSet<JobQueueEntry> JobQueue => Set<JobQueueEntry>();
    public DbSet<ScheduledObligation> ScheduledObligations => Set<ScheduledObligation>();
    public DbSet<IdempotencyRecord> IdempotencyRecords => Set<IdempotencyRecord>();

    // LMS Module (TASK-10)
    public DbSet<LearningMaterial> LearningMaterials => Set<LearningMaterial>();
    public DbSet<LearningMaterialInstructor> LearningMaterialInstructors => Set<LearningMaterialInstructor>();
    public DbSet<LearningQuizQuestion> LearningQuizQuestions => Set<LearningQuizQuestion>();
    public DbSet<LearningAttachment> LearningAttachments => Set<LearningAttachment>();
    public DbSet<LearningDbLink> LearningDbLinks => Set<LearningDbLink>();
    public DbSet<LearningModerationLog> LearningModerationLogs => Set<LearningModerationLog>();
    public DbSet<LearnerProgress> LearnerProgresses => Set<LearnerProgress>();
    public DbSet<LearnerQuizAttempt> LearnerQuizAttempts => Set<LearnerQuizAttempt>();

    // Blockchain & ZKProof Module (TASK-11)
    public DbSet<Modules.Blockchain.Domain.Entities.AnchorPolicy> AnchorPolicies => Set<Modules.Blockchain.Domain.Entities.AnchorPolicy>();
    public DbSet<Modules.Blockchain.Domain.Entities.AnchorRecord> AnchorRecords => Set<Modules.Blockchain.Domain.Entities.AnchorRecord>();
    public DbSet<Modules.Blockchain.Domain.Entities.LedgerBlock> LedgerBlocks => Set<Modules.Blockchain.Domain.Entities.LedgerBlock>();
    public DbSet<Modules.Blockchain.Domain.Entities.ZkProofVaultRecord> ZkProofVaultRecords => Set<Modules.Blockchain.Domain.Entities.ZkProofVaultRecord>();
    public DbSet<Modules.Blockchain.Domain.Entities.BridgeSyncLog> BridgeSyncLogs => Set<Modules.Blockchain.Domain.Entities.BridgeSyncLog>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasPostgresExtension("pgcrypto");

        b.Entity<OutboxMessage>(e =>
        {
            e.ToTable("outbox_messages", PlatformSchema);
            e.HasKey(x => x.Id);
            e.Property(x => x.Type).HasMaxLength(400);
            e.Property(x => x.Payload).HasColumnType("jsonb");
            e.HasIndex(x => new { x.ProcessedAt, x.OccurredAt });
        });
        b.Entity<JobQueueEntry>(e =>
        {
            e.ToTable("job_queue", PlatformSchema);
            e.HasKey(x => x.Id);
            e.Property(x => x.Kind).HasMaxLength(400);
            e.Property(x => x.Payload).HasColumnType("jsonb");
            e.Property(x => x.DedupKey).HasMaxLength(300);
            e.HasIndex(x => x.DedupKey).IsUnique().HasFilter("dedup_key IS NOT NULL AND completed_at IS NULL AND failed_at IS NULL");
            e.HasIndex(x => new { x.CompletedAt, x.FailedAt, x.RunAfter });
        });
        b.Entity<ScheduledObligation>(e =>
        {
            e.ToTable("scheduled_obligations", PlatformSchema);
            e.HasKey(x => x.Id);
            e.Property(x => x.Kind).HasMaxLength(100);
            e.Property(x => x.State).HasMaxLength(30);
            e.HasIndex(x => new { x.State, x.DueAt });
        });
        b.Entity<IdempotencyRecord>(e =>
        {
            e.ToTable("idempotency_records", PlatformSchema);
            e.HasKey(x => x.Key);
            e.Property(x => x.Key).HasMaxLength(200);
            e.Property(x => x.RequestHash).HasMaxLength(64);
            e.HasIndex(x => x.CreatedAt);
        });

        foreach (var module in ModuleRegistry.All)
        {
            b.ApplyConfigurationsFromAssembly(module.Assembly);
        }

        ApplyEntityKeyConventions(b);
        ApplyAggregateConventions(b);
        ApplySnakeCase(b);
    }

    /// <summary>
    /// ADR-0003: khoá chính do ứng dụng sinh (`Entity.Id = Guid.CreateVersion7()` ngay ở khai báo) phải khai
    /// `ValueGeneratedNever`. Nếu không, EF giữ mặc định `ValueGenerated.OnAdd` cho khoá Guid; một hàng con mới
    /// thêm vào collection của aggregate ĐANG được theo dõi đã mang khoá khác giá trị mặc định, nên change
    /// tracker xếp nó vào nhóm "đã tồn tại" và phát ra `UPDATE ... WHERE id = &lt;khoá mới&gt;` thay vì `INSERT`.
    /// Không hàng nào khớp → `DbUpdateConcurrencyException` → cả transaction cuộn ngược (B-32).
    ///
    /// Quy ước phải phủ **mọi** `Entity`, không chỉ `AggregateRoot`: hàng con — nơi lỗi thật sự nằm — không phải
    /// aggregate root. Đây là thay đổi ánh xạ, không đổi lược đồ, nên không cần migration.
    /// </summary>
    private static void ApplyEntityKeyConventions(ModelBuilder b)
    {
        var entities = b.Model.GetEntityTypes()
            .Where(et => et.BaseType is null && !et.IsOwned() && typeof(Entity).IsAssignableFrom(et.ClrType))
            .Select(et => et.ClrType)
            .ToList();

        foreach (var clrType in entities)
        {
            b.Entity(clrType).Property(nameof(Entity.Id)).ValueGeneratedNever();
        }
    }

    /// <summary>
    /// Quy ước cho mọi aggregate: Version là concurrency token (§7.5), domain event không map,
    /// và LegacyRef là owned type để dấu vết ETL (§30.3) nằm ngay trên bảng của aggregate.
    /// `OwnsOne` thêm entity type mới nên danh sách phải được materialize trước khi duyệt.
    /// </summary>
    private static void ApplyAggregateConventions(ModelBuilder b)
    {
        var aggregates = b.Model.GetEntityTypes()
            .Where(et => et.ClrType.IsSubclassOf(typeof(AggregateRoot)) && et.BaseType is null)
            .Select(et => et.ClrType)
            .ToList();

        foreach (var clrType in aggregates)
        {
            {
                var eb = b.Entity(clrType);
                eb.Property(nameof(AggregateRoot.Version)).IsConcurrencyToken();
                eb.Ignore(nameof(AggregateRoot.DomainEvents));
                eb.OwnsOne(typeof(LegacyRef), nameof(AggregateRoot.Legacy), o =>
                {
                    o.Property(nameof(LegacyRef.SourceSystem)).HasColumnName("legacy_source_system").HasMaxLength(50);
                    o.Property(nameof(LegacyRef.SourceTable)).HasColumnName("legacy_source_table").HasMaxLength(80);
                    o.Property(nameof(LegacyRef.LegacyId)).HasColumnName("legacy_id").HasMaxLength(100);
                    o.Property(nameof(LegacyRef.SourceHash)).HasColumnName("legacy_source_hash").HasMaxLength(64);
                    o.Property(nameof(LegacyRef.MigratedAt)).HasColumnName("legacy_migrated_at");
                    o.Property(nameof(LegacyRef.MappingVersion)).HasColumnName("legacy_mapping_version").HasMaxLength(30);
                    o.Property(nameof(LegacyRef.BatchId)).HasColumnName("legacy_batch_id");
                });
            }
        }
    }

    /// <summary>
    /// Đặt tên bảng/cột theo snake_case để SQL đọc được và khớp thói quen PostgreSQL, mà không cần package ngoài.
    /// Mọi collection metadata phải được materialize trước khi sửa — đổi tên làm EF dựng lại collection đang duyệt.
    /// </summary>
    private static void ApplySnakeCase(ModelBuilder b)
    {
        var entityTypes = b.Model.GetEntityTypes().ToList();

        foreach (var et in entityTypes)
        {
            if (et.IsOwned()) continue;
            var table = et.GetTableName();
            if (table is not null) et.SetTableName(ToSnake(table));
        }

        foreach (var et in entityTypes)
        {
            var storeObject = Microsoft.EntityFrameworkCore.Metadata.StoreObjectIdentifier.Create(et, Microsoft.EntityFrameworkCore.Metadata.StoreObjectType.Table);
            if (storeObject is not null)
            {
                foreach (var p in et.GetProperties().ToList())
                {
                    var current = p.GetColumnName(storeObject.Value);
                    if (current is not null) p.SetColumnName(ToSnake(current));
                }
            }
            foreach (var k in et.GetKeys().ToList())
            {
                var name = k.GetName();
                if (name is not null) k.SetName(ToSnake(name));
            }
            foreach (var fk in et.GetForeignKeys().ToList())
            {
                var name = fk.GetConstraintName();
                if (name is not null) fk.SetConstraintName(ToSnake(name));
            }
            foreach (var ix in et.GetIndexes().ToList())
            {
                var name = ix.GetDatabaseName();
                if (name is not null) ix.SetDatabaseName(ToSnake(name));
            }
        }
    }

    internal static string ToSnake(string name)
    {
        if (string.IsNullOrEmpty(name)) return name;
        if (name.Contains('_') && name.ToLowerInvariant() == name) return name;
        var s = SnakeRegex().Replace(name, "$1_$2");
        return s.Replace("__", "_").ToLowerInvariant();
    }

    [GeneratedRegex("([a-z0-9])([A-Z])")]
    private static partial Regex SnakeRegex();
}
