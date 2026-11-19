using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

/// <summary>
/// CR-BACLINK-009 · DB-BL09-CMS-001 — CMS nội dung Hiệp hội. Non-destructive (IF NOT EXISTS).
/// Dữ liệu 98 bài tin hiện có được nạp bởi CmsSeedHostedService (apps/api/Seed/cms_articles.json), không nhúng trong migration.
/// </summary>
[DbContext(typeof(NacenTechDbContext))]
[Migration("20261119140000_AddBaclinkCms")]
public partial class AddBaclinkCms : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE TABLE IF NOT EXISTS content.cms_articles (
                id uuid PRIMARY KEY,
                slug varchar(200) NOT NULL UNIQUE,
                title varchar(500) NOT NULL,
                category_slug varchar(50) NOT NULL,
                committee_code varchar(30) NULL,
                excerpt text NULL,
                body_json jsonb NOT NULL DEFAULT '{}'::jsonb,
                thumbnail_url varchar(500) NULL,
                author varchar(200) NULL,
                location varchar(300) NULL,
                source_url varchar(500) NULL,
                tags_json jsonb NOT NULL DEFAULT '[]'::jsonb,
                is_featured boolean NOT NULL DEFAULT false,
                status varchar(15) NOT NULL DEFAULT 'DRAFT',
                published_at timestamptz NULL,
                created_at timestamptz NOT NULL DEFAULT now(),
                updated_at timestamptz NOT NULL DEFAULT now(),
                CONSTRAINT ck_cms_articles_status CHECK (status IN ('DRAFT','PUBLISHED'))
            );
            CREATE INDEX IF NOT EXISTS ix_cms_articles_pub ON content.cms_articles (status, published_at DESC);
            CREATE INDEX IF NOT EXISTS ix_cms_articles_cat ON content.cms_articles (category_slug, status);
            CREATE INDEX IF NOT EXISTS ix_cms_articles_committee ON content.cms_articles (committee_code) WHERE committee_code IS NOT NULL;

            CREATE TABLE IF NOT EXISTS content.cms_documents (
                id uuid PRIMARY KEY,
                doc_type varchar(40) NOT NULL,
                title varchar(400) NOT NULL,
                description text NULL,
                file_url varchar(600) NOT NULL,
                committee_code varchar(30) NULL,
                issued_on date NULL,
                is_public boolean NOT NULL DEFAULT true,
                sort_order int NOT NULL DEFAULT 0,
                created_at timestamptz NOT NULL DEFAULT now(),
                updated_at timestamptz NOT NULL DEFAULT now(),
                CONSTRAINT ck_cms_documents_type CHECK (doc_type IN
                    ('DIEU_LE','BAO_CAO_THUONG_NIEN','BAO_CAO_NGANH','CAM_NANG','BIEU_MAU','VAN_BAN_CHINH_SACH','DU_LIEU_CONG_NGHIEP'))
            );
            CREATE INDEX IF NOT EXISTS ix_cms_documents_type ON content.cms_documents (doc_type, is_public, issued_on DESC);

            CREATE TABLE IF NOT EXISTS content.cms_media (
                id uuid PRIMARY KEY,
                kind varchar(10) NOT NULL,
                album varchar(200) NOT NULL DEFAULT 'Khác',
                title varchar(300) NULL,
                url varchar(600) NOT NULL,
                thumbnail_url varchar(600) NULL,
                taken_on date NULL,
                is_public boolean NOT NULL DEFAULT true,
                sort_order int NOT NULL DEFAULT 0,
                created_at timestamptz NOT NULL DEFAULT now(),
                CONSTRAINT ck_cms_media_kind CHECK (kind IN ('IMAGE','VIDEO'))
            );
            CREATE INDEX IF NOT EXISTS ix_cms_media_album ON content.cms_media (is_public, album, sort_order);

            CREATE TABLE IF NOT EXISTS content.cms_faqs (
                id uuid PRIMARY KEY,
                question text NOT NULL,
                answer text NOT NULL,
                sort_order int NOT NULL DEFAULT 0,
                is_public boolean NOT NULL DEFAULT true,
                updated_at timestamptz NOT NULL DEFAULT now()
            );

            CREATE TABLE IF NOT EXISTS content.cms_partners (
                id uuid PRIMARY KEY,
                name varchar(300) NOT NULL,
                logo_url varchar(600) NULL,
                website varchar(500) NULL,
                sort_order int NOT NULL DEFAULT 0,
                is_public boolean NOT NULL DEFAULT true,
                updated_at timestamptz NOT NULL DEFAULT now()
            );
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP TABLE IF EXISTS content.cms_partners;
            DROP TABLE IF EXISTS content.cms_faqs;
            DROP TABLE IF EXISTS content.cms_media;
            DROP TABLE IF EXISTS content.cms_documents;
            DROP TABLE IF EXISTS content.cms_articles;
            """);
    }
}
