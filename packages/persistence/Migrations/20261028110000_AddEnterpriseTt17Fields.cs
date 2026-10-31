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

            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'assessment' AND table_name = 'tt17_assessments' AND column_name = 'total_score'
                ) THEN
                    EXECUTE '
                        UPDATE enterprise.enterprises e
                        SET 
                            latest_tt17_score = a.total_score,
                            latest_tt17_classification = a.classification
                        FROM assessment.tt17_assessments a
                        WHERE e.id = a.enterprise_id;
                    ';
                END IF;
            END $$;
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
