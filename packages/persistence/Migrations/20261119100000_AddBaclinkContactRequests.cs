using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

/// <summary>
/// CR-BACLINK-008 · DB-BL08-CONTACT-005 — hộp thư "Gửi yêu cầu / Liên hệ" công khai của Hiệp hội.
/// Non-destructive: chỉ tạo mới, IF NOT EXISTS.
/// </summary>
[DbContext(typeof(NacenTechDbContext))]
[Migration("20261119100000_AddBaclinkContactRequests")]
public partial class AddBaclinkContactRequests : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE SCHEMA IF NOT EXISTS communication;
            CREATE TABLE IF NOT EXISTS communication.contact_requests (
                id uuid PRIMARY KEY,
                full_name varchar(150) NOT NULL,
                phone varchar(30) NULL,
                email varchar(200) NULL,
                organization varchar(200) NULL,
                topic varchar(50) NOT NULL DEFAULT 'GENERAL',
                message text NOT NULL,
                source_path varchar(300) NULL,
                status varchar(20) NOT NULL DEFAULT 'NEW',
                created_at timestamptz NOT NULL DEFAULT now(),
                handled_by uuid NULL,
                handled_at timestamptz NULL,
                CONSTRAINT ck_contact_requests_status CHECK (status IN ('NEW','IN_PROGRESS','DONE','SPAM')),
                CONSTRAINT ck_contact_requests_reachable CHECK (phone IS NOT NULL OR email IS NOT NULL)
            );
            CREATE INDEX IF NOT EXISTS ix_contact_requests_status_created
                ON communication.contact_requests (status, created_at DESC);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("DROP TABLE IF EXISTS communication.contact_requests;");
    }
}
