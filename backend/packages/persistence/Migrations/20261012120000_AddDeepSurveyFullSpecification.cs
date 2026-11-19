using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261012120000_AddDeepSurveyFullSpecification")]
public sealed class AddDeepSurveyFullSpecification : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE demand.demand_surveys
                ADD COLUMN IF NOT EXISTS province character varying(100),
                ADD COLUMN IF NOT EXISTS headquarters_address character varying(255),
                ADD COLUMN IF NOT EXISTS surveyed_facility character varying(255),
                ADD COLUMN IF NOT EXISTS contact_title character varying(100),
                ADD COLUMN IF NOT EXISTS main_industry character varying(100),
                ADD COLUMN IF NOT EXISTS main_products text,
                ADD COLUMN IF NOT EXISTS confirmed_by_name character varying(150),
                ADD COLUMN IF NOT EXISTS confirmed_by_title character varying(100),
                ADD COLUMN IF NOT EXISTS pdpd_consent_at timestamp with time zone,
                ADD COLUMN IF NOT EXISTS survey_details jsonb DEFAULT '{}';
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
