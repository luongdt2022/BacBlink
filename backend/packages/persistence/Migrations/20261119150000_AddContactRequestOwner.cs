using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

/// <summary>CR-BACLINK-010 — gắn yêu cầu liên hệ với người gửi đã đăng nhập để họ theo dõi trạng thái; ghi chú phản hồi của Văn phòng. Non-destructive.</summary>
[DbContext(typeof(NacenTechDbContext))]
[Migration("20261119150000_AddContactRequestOwner")]
public partial class AddContactRequestOwner : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE communication.contact_requests ADD COLUMN IF NOT EXISTS person_id uuid NULL;
            ALTER TABLE communication.contact_requests ADD COLUMN IF NOT EXISTS handled_note text NULL;
            CREATE INDEX IF NOT EXISTS ix_contact_requests_person ON communication.contact_requests (person_id, created_at DESC) WHERE person_id IS NOT NULL;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP INDEX IF EXISTS communication.ix_contact_requests_person;
            ALTER TABLE communication.contact_requests DROP COLUMN IF EXISTS handled_note;
            ALTER TABLE communication.contact_requests DROP COLUMN IF EXISTS person_id;
            """);
    }
}
