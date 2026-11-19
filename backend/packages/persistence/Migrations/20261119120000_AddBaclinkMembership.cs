using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

/// <summary>
/// CR-BACLINK-008 · DB-BL08-TIERS-002 / DB-BL08-MEMBERSHIPS-003 / DB-BL08-BACKFILL-004.
/// Non-destructive: chỉ tạo bảng mới (IF NOT EXISTS), seed hạng demo (ON CONFLICT DO NOTHING)
/// và backfill tư cách hội viên cho doanh nghiệp đã xác thực (idempotent).
/// Hạng & hội phí là DỮ LIỆU DEMO [PROPOSAL] — admin chỉnh tại /admin/members.
/// </summary>
[DbContext(typeof(NacenTechDbContext))]
[Migration("20261119120000_AddBaclinkMembership")]
public partial class AddBaclinkMembership : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE TABLE IF NOT EXISTS enterprise.membership_tiers (
                code varchar(30) PRIMARY KEY,
                name varchar(150) NOT NULL,
                member_type varchar(20) NOT NULL,
                audience text NULL,
                annual_fee numeric(14,0) NOT NULL DEFAULT 0,
                joining_fee numeric(14,0) NOT NULL DEFAULT 0,
                sort_order int NOT NULL DEFAULT 0,
                is_active boolean NOT NULL DEFAULT true,
                updated_at timestamptz NOT NULL DEFAULT now(),
                CONSTRAINT ck_membership_tiers_type CHECK (member_type IN ('OFFICIAL','ASSOCIATE','HONORARY'))
            );

            INSERT INTO enterprise.membership_tiers (code, name, member_type, audience, annual_fee, joining_fee, sort_order) VALUES
              ('OFFICIAL_L', 'Hội viên chính thức – Doanh nghiệp lớn', 'OFFICIAL', 'Doanh nghiệp sản xuất tại Bắc Ninh, trên 300 lao động', 10000000, 1000000, 1),
              ('OFFICIAL_M', 'Hội viên chính thức – Doanh nghiệp vừa', 'OFFICIAL', 'Doanh nghiệp sản xuất tại Bắc Ninh, 100 – 300 lao động', 6000000, 1000000, 2),
              ('OFFICIAL_S', 'Hội viên chính thức – Doanh nghiệp nhỏ & siêu nhỏ', 'OFFICIAL', 'Doanh nghiệp sản xuất tại Bắc Ninh, dưới 100 lao động', 3000000, 1000000, 3),
              ('ASSOCIATE', 'Hội viên liên kết', 'ASSOCIATE', 'Doanh nghiệp ngoài tỉnh, doanh nghiệp FDI, viện/trường, tổ chức hỗ trợ', 5000000, 1000000, 4),
              ('HONORARY', 'Hội viên danh dự', 'HONORARY', 'Cá nhân/tổ chức có đóng góp, do Ban Chấp hành mời', 0, 0, 5)
            ON CONFLICT (code) DO NOTHING;

            CREATE TABLE IF NOT EXISTS enterprise.memberships (
                id uuid PRIMARY KEY,
                enterprise_id uuid NOT NULL REFERENCES enterprise.enterprises(id),
                tier_code varchar(30) NOT NULL REFERENCES enterprise.membership_tiers(code),
                status varchar(20) NOT NULL DEFAULT 'ACTIVE',
                certificate_no varchar(20) NULL,
                valid_from date NULL,
                valid_to date NULL,
                fee_amount numeric(14,0) NULL,
                fee_paid_at timestamptz NULL,
                fee_note text NULL,
                approved_by uuid NULL,
                is_featured boolean NOT NULL DEFAULT false,
                featured_order int NULL,
                renewal_requested_at timestamptz NULL,
                last_reminded_at timestamptz NULL,
                status_note text NULL,
                created_at timestamptz NOT NULL DEFAULT now(),
                updated_at timestamptz NOT NULL DEFAULT now(),
                CONSTRAINT ck_memberships_status CHECK (status IN ('ACTIVE','EXPIRED','SUSPENDED')),
                CONSTRAINT uq_memberships_enterprise UNIQUE (enterprise_id)
            );
            CREATE UNIQUE INDEX IF NOT EXISTS uq_memberships_certificate_no
                ON enterprise.memberships (certificate_no) WHERE certificate_no IS NOT NULL;
            CREATE INDEX IF NOT EXISTS ix_memberships_status_valid_to
                ON enterprise.memberships (status, valid_to);

            -- Backfill: DN đã xác thực, có MST → hội viên ACTIVE hạng OFFICIAL_M tới 31/12 năm hiện hành.
            WITH src AS (
                SELECT e.id, row_number() OVER (ORDER BY e.created_at, e.id) AS rn
                FROM enterprise.enterprises e
                WHERE e.is_verified = true AND e.tax_code IS NOT NULL
                  AND NOT EXISTS (SELECT 1 FROM enterprise.memberships m WHERE m.enterprise_id = e.id)
            ), base AS (
                SELECT coalesce(max(substring(certificate_no from 9)::int), 0) AS n
                FROM enterprise.memberships
                WHERE certificate_no LIKE 'BL-' || extract(year from now())::int || '-%'
            )
            INSERT INTO enterprise.memberships
                (id, enterprise_id, tier_code, status, certificate_no, valid_from, valid_to, fee_amount, status_note)
            SELECT gen_random_uuid(), src.id, 'OFFICIAL_M', 'ACTIVE',
                   'BL-' || extract(year from now())::int || '-' || lpad((base.n + src.rn)::text, 4, '0'),
                   current_date, make_date(extract(year from now())::int, 12, 31), 6000000,
                   'Backfill CR-BACLINK-008 (hội viên hiện hữu)'
            FROM src CROSS JOIN base;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP TABLE IF EXISTS enterprise.memberships;
            DROP TABLE IF EXISTS enterprise.membership_tiers;
            """);
    }
}
