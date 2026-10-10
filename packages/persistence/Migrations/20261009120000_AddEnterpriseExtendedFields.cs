using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261009120000_AddEnterpriseExtendedFields")]
public sealed class AddEnterpriseExtendedFields : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE enterprise.enterprises
                ADD COLUMN IF NOT EXISTS name character varying(255) DEFAULT '',
                ADD COLUMN IF NOT EXISTS tax_code character varying(20) DEFAULT '',
                ADD COLUMN IF NOT EXISTS province_city character varying(100) DEFAULT '',
                ADD COLUMN IF NOT EXISTS main_sector_name character varying(255) DEFAULT '',
                ADD COLUMN IF NOT EXISTS sector_code character varying(20),
                ADD COLUMN IF NOT EXISTS ownership_type text,
                ADD COLUMN IF NOT EXISTS workforce_scale text,
                ADD COLUMN IF NOT EXISTS revenue_range text,
                ADD COLUMN IF NOT EXISTS operating_zone text,
                ADD COLUMN IF NOT EXISTS high_qualification_ratio text,
                ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'DRAFT',
                ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
                ADD COLUMN IF NOT EXISTS contact_person text,
                ADD COLUMN IF NOT EXISTS contact_phone text,
                ADD COLUMN IF NOT EXISTS contact_email text,
                ADD COLUMN IF NOT EXISTS is_contact_public boolean DEFAULT false,
                ADD COLUMN IF NOT EXISTS established_date text,
                ADD COLUMN IF NOT EXISTS address_detail text,
                ADD COLUMN IF NOT EXISTS website text,
                ADD COLUMN IF NOT EXISTS description text,
                ADD COLUMN IF NOT EXISTS has_rd_unit boolean DEFAULT false,
                ADD COLUMN IF NOT EXISTS has_rd_budget boolean DEFAULT false,
                ADD COLUMN IF NOT EXISTS rd_budget_amount numeric(18,2),
                ADD COLUMN IF NOT EXISTS rd_personnel_count integer,
                ADD COLUMN IF NOT EXISTS is_exporting boolean DEFAULT false,
                ADD COLUMN IF NOT EXISTS in_value_chain boolean DEFAULT false,
                ADD COLUMN IF NOT EXISTS tni_score numeric(5,2),
                ADD COLUMN IF NOT EXISTS tni_classification text,
                ADD COLUMN IF NOT EXISTS profile_details_json jsonb DEFAULT '{}',
                ADD COLUMN IF NOT EXISTS top_bottlenecks_json jsonb DEFAULT '[]',
                ADD COLUMN IF NOT EXISTS support_needs_json jsonb DEFAULT '[]';
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
