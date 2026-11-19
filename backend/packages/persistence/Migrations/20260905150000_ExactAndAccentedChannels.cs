using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

/// <summary>
/// Hai ca pass/fail của §26.6.6 cần hai thứ bảng chiếu chưa có: (1) trường từ khoá **giữ dấu** — truy vấn gõ
/// đủ dấu không bị `unaccent` làm mất phân biệt nghĩa (chiến lược hai trường); (2) chỉ mục trigram cho kênh
/// exact — số hiệu bằng sáng chế, mã sản phẩm, tên tổ chức khớp chuỗi con. Không đổi model EF.
/// </summary>
[DbContext(typeof(NacenTechDbContext))]
[Migration("20260905150000_ExactAndAccentedChannels")]
public sealed class ExactAndAccentedChannels : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE matching.search_chunks ADD COLUMN IF NOT EXISTS tsv_vi tsvector GENERATED ALWAYS AS (
                setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
                setweight(to_tsvector('simple', coalesce(text, '')), 'B')
            ) STORED;
            CREATE INDEX IF NOT EXISTS ix_search_chunks_tsv_vi ON matching.search_chunks USING gin (tsv_vi);
            CREATE INDEX IF NOT EXISTS ix_search_chunks_title_trgm ON matching.search_chunks USING gin (title gin_trgm_ops);
            CREATE INDEX IF NOT EXISTS ix_search_chunks_text_trgm ON matching.search_chunks USING gin (text gin_trgm_ops);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP INDEX IF EXISTS matching.ix_search_chunks_text_trgm;
            DROP INDEX IF EXISTS matching.ix_search_chunks_title_trgm;
            DROP INDEX IF EXISTS matching.ix_search_chunks_tsv_vi;
            ALTER TABLE matching.search_chunks DROP COLUMN IF EXISTS tsv_vi;
            """);
    }
}
