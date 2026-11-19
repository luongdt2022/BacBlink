using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261102143000_AddAssignedExpertIdAndLegacyBatchId")]
public sealed class AddAssignedExpertIdAndLegacyBatchId : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE demand.demand_items
                ADD COLUMN IF NOT EXISTS assigned_expert_id uuid NULL;

            ALTER TABLE technology.seller_technology_offers
                ADD COLUMN IF NOT EXISTS legacy_batch_id uuid NULL;
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE technology.seller_technology_offers
                DROP COLUMN IF EXISTS legacy_batch_id;

            ALTER TABLE demand.demand_items
                DROP COLUMN IF EXISTS assigned_expert_id;
        """);
    }
}
