using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261021183000_SyncDemandSurveyRevenueRangeColumn")]
public sealed class SyncDemandSurveyRevenueRangeColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE demand.demand_surveys
                ADD COLUMN IF NOT EXISTS revenue_range3y character varying(50);
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
