using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

/// <summary>
/// Kênh sparse (§26.6.7 bước 4, ADR-0010 câu hỏi mở): cột `sparsevec(250002)` — từ vựng XLM-R của BGE-M3 — trên
/// bảng chiếu, kèm HNSW theo tích vô hướng. Cột nullable: đoạn di trú từ NestJS chỉ có dense; chúng đứng ngoài
/// kênh này cho tới lần chunk-embed kế tiếp. Không đổi model EF (bảng chiếu không phải entity).
/// </summary>
[DbContext(typeof(NacenTechDbContext))]
[Migration("20260905120000_SparseChannel")]
public sealed class SparseChannel : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE matching.search_chunks ADD COLUMN IF NOT EXISTS sparse sparsevec(250002) NULL;
            CREATE INDEX IF NOT EXISTS ix_search_chunks_sparse ON matching.search_chunks USING hnsw (sparse sparsevec_ip_ops);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP INDEX IF EXISTS matching.ix_search_chunks_sparse;
            ALTER TABLE matching.search_chunks DROP COLUMN IF EXISTS sparse;
            """);
    }
}
