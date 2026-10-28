using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261028110000_AddEnterpriseTt17Fields")]
public sealed class AddEnterpriseTt17Fields : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE enterprise.enterprises
                ADD COLUMN IF NOT EXISTS latest_tt17_score numeric(5,2),
                ADD COLUMN IF NOT EXISTS latest_tt17_classification character varying(30),
                ADD COLUMN IF NOT EXISTS latest_tt17_sync_coeff numeric(4,2);

            CREATE INDEX IF NOT EXISTS ix_enterprises_latest_tt17_classification ON enterprise.enterprises(latest_tt17_classification);

            UPDATE enterprise.enterprises e
            SET 
                latest_tt17_score = COALESCE((a.scores_json->>'TotalScore')::numeric, (a.scores_json->>'totalScore')::numeric),
                latest_tt17_classification = CASE 
                    WHEN COALESCE(a.scores_json->>'Classification', a.scores_json->>'classification') = 'CAN_THAM_DINH' THEN 'LAC_HAU'
                    ELSE COALESCE(a.scores_json->>'Classification', a.scores_json->>'classification')
                END,
                latest_tt17_sync_coeff = COALESCE((a.scores_json->>'SyncCoefficient')::numeric, (a.scores_json->>'syncCoefficient')::numeric)
            FROM assessment.tt17_assessments a
            WHERE (e.id = a.enterprise_id OR (e.tax_code IS NOT NULL AND e.tax_code = a.tax_code))
              AND a.scores_json IS NOT NULL;
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP INDEX IF EXISTS enterprise.ix_enterprises_latest_tt17_classification;
            ALTER TABLE enterprise.enterprises
                DROP COLUMN IF EXISTS latest_tt17_score,
                DROP COLUMN IF EXISTS latest_tt17_classification,
                DROP COLUMN IF EXISTS latest_tt17_sync_coeff;
        """);
    }
}
