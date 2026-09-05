using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

/// <summary>
/// ADR-0010: chỉ mục tìm kiếm chuyển từ Elasticsearch vào PostgreSQL. Bảng chiếu `matching.search_chunks`
/// không phải entity EF — nó thuộc về cài đặt `ISearchIndex`, và mô hình EF không biết tới nó, nên migration
/// này là SQL thuần và không đổi model snapshot (không có "pending model changes").
///
/// Ba extension: `vector` (pgvector, cosine + HNSW), `unaccent` (tiếng Việt không dấu khớp có dấu — ca §26.6.1
/// mà baseline Elasticsearch trượt), `pg_trgm` (dự phòng cho tìm gần đúng theo tên; chưa dùng ở truy vấn).
/// `unaccent()` là STABLE nên không đặt vào cột sinh sẵn được; bọc một hàm IMMUTABLE gọi đúng từ điển
/// `public.unaccent` — đó là mẹo chuẩn của cộng đồng PostgreSQL, và nó đúng vì từ điển không đổi lúc chạy.
/// </summary>
[DbContext(typeof(NacenTechDbContext))]
[Migration("20260905090000_PostgresSearchIndex")]
public sealed class PostgresSearchIndex : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE EXTENSION IF NOT EXISTS vector;
            CREATE EXTENSION IF NOT EXISTS unaccent;
            CREATE EXTENSION IF NOT EXISTS pg_trgm;

            CREATE OR REPLACE FUNCTION matching.immutable_unaccent(text)
                RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
                AS $$ SELECT public.unaccent('public.unaccent', $1) $$;

            CREATE TABLE IF NOT EXISTS matching.search_chunks (
                subject_kind     varchar(40)  NOT NULL,
                subject_id       uuid         NOT NULL,
                chunk_index      integer      NOT NULL,
                text             text         NOT NULL,
                embedding        vector(1024) NOT NULL,
                title            text         NOT NULL DEFAULT '',
                ai_title         text         NULL,
                sector_ids       uuid[]       NOT NULL DEFAULT '{}',
                sector_names     text[]       NOT NULL DEFAULT '{}',
                owner_person_id  uuid         NULL,
                is_published     boolean      NOT NULL DEFAULT FALSE,
                tsv              tsvector GENERATED ALWAYS AS (
                    setweight(to_tsvector('simple', matching.immutable_unaccent(coalesce(title, ''))), 'A') ||
                    setweight(to_tsvector('simple', matching.immutable_unaccent(coalesce(text, ''))), 'B')
                ) STORED,
                PRIMARY KEY (subject_kind, subject_id, chunk_index)
            );

            CREATE INDEX IF NOT EXISTS ix_search_chunks_embedding ON matching.search_chunks USING hnsw (embedding vector_cosine_ops);
            CREATE INDEX IF NOT EXISTS ix_search_chunks_tsv ON matching.search_chunks USING gin (tsv);
            CREATE INDEX IF NOT EXISTS ix_search_chunks_sectors ON matching.search_chunks USING gin (sector_ids);
            CREATE INDEX IF NOT EXISTS ix_search_chunks_filter ON matching.search_chunks (subject_kind, is_published, owner_person_id);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP TABLE IF EXISTS matching.search_chunks;
            DROP FUNCTION IF EXISTS matching.immutable_unaccent(text);
            """);
    }
}
