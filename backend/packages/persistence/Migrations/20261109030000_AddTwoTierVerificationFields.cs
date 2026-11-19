using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261109030000_AddTwoTierVerificationFields")]
public sealed class AddTwoTierVerificationFields : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE technology.seller_technology_offers
                ADD COLUMN IF NOT EXISTS trl_verification_status varchar(30) NOT NULL DEFAULT 'SELF_DECLARED',
                ADD COLUMN IF NOT EXISTS ip_verification_status varchar(30) NOT NULL DEFAULT 'SELF_DECLARED',
                ADD COLUMN IF NOT EXISTS verified_authority_name varchar(255) NULL,
                ADD COLUMN IF NOT EXISTS trl_verified_by uuid NULL,
                ADD COLUMN IF NOT EXISTS trl_verified_at timestamptz NULL,
                ADD COLUMN IF NOT EXISTS trl_review_note text NULL;

            CREATE INDEX IF NOT EXISTS ix_seller_technology_offers_trl_verification_status
                ON technology.seller_technology_offers (trl_verification_status);

            CREATE INDEX IF NOT EXISTS ix_seller_technology_offers_ip_verification_status
                ON technology.seller_technology_offers (ip_verification_status);

            ALTER TABLE demand.demand_items
                ADD COLUMN IF NOT EXISTS tni_verification_status varchar(30) NOT NULL DEFAULT 'SELF_DECLARED',
                ADD COLUMN IF NOT EXISTS verified_authority_name varchar(255) NULL,
                ADD COLUMN IF NOT EXISTS tni_review_note text NULL;

            CREATE INDEX IF NOT EXISTS ix_demand_items_tni_verification_status
                ON demand.demand_items (tni_verification_status);
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP INDEX IF EXISTS technology.ix_seller_technology_offers_trl_verification_status;
            DROP INDEX IF EXISTS technology.ix_seller_technology_offers_ip_verification_status;

            ALTER TABLE technology.seller_technology_offers
                DROP COLUMN IF EXISTS trl_verification_status,
                DROP COLUMN IF EXISTS ip_verification_status,
                DROP COLUMN IF EXISTS verified_authority_name,
                DROP COLUMN IF EXISTS trl_verified_by,
                DROP COLUMN IF EXISTS trl_verified_at,
                DROP COLUMN IF EXISTS trl_review_note;

            DROP INDEX IF EXISTS demand.ix_demand_items_tni_verification_status;

            ALTER TABLE demand.demand_items
                DROP COLUMN IF EXISTS tni_verification_status,
                DROP COLUMN IF EXISTS verified_authority_name,
                DROP COLUMN IF EXISTS tni_review_note;
        """);
    }
}
