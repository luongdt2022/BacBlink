using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261029164500_AddSellerTechnologyOfferSoftDelete")]
public sealed class AddSellerTechnologyOfferSoftDelete : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE technology.seller_technology_offers
                ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

            ALTER TABLE technology.seller_technology_offers
                ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone NULL;

            CREATE INDEX IF NOT EXISTS ix_seller_technology_offers_is_deleted
                ON technology.seller_technology_offers (is_deleted);
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP INDEX IF EXISTS technology.ix_seller_technology_offers_is_deleted;

            ALTER TABLE technology.seller_technology_offers
                DROP COLUMN IF EXISTS deleted_at;

            ALTER TABLE technology.seller_technology_offers
                DROP COLUMN IF EXISTS is_deleted;
        """);
    }
}
