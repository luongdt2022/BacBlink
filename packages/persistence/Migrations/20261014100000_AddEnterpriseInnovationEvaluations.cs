using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261014100000_AddEnterpriseInnovationEvaluations")]
public sealed class AddEnterpriseInnovationEvaluations : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            -- 1. Bổ sung các cột chỉ số ĐMST mới nhất trên bảng enterprise.enterprises nếu chưa tồn tại
            ALTER TABLE enterprise.enterprises
                ADD COLUMN IF NOT EXISTS latest_innovation_score numeric(5,2),
                ADD COLUMN IF NOT EXISTS latest_innovation_tier character varying(30);

            CREATE INDEX IF NOT EXISTS ix_enterprises_latest_innovation_tier ON enterprise.enterprises(latest_innovation_tier);

            -- 2. Tạo bảng enterprise.innovation_evaluations lưu trữ kết quả đánh giá theo kỳ
            CREATE TABLE IF NOT EXISTS enterprise.innovation_evaluations (
                id uuid PRIMARY KEY,
                enterprise_id uuid NOT NULL,
                tax_code character varying(20) NOT NULL,
                evaluation_year integer NOT NULL DEFAULT 2024,
                criteria_version character varying(20) NOT NULL DEFAULT 'v1.0',
                total_score numeric(5,2) NOT NULL DEFAULT 0.0,
                classification character varying(30) NOT NULL DEFAULT 'UNRATED',
                group_scores_json jsonb NOT NULL DEFAULT '{}'::jsonb,
                criteria_details_json jsonb NOT NULL DEFAULT '[]'::jsonb,
                status character varying(30) NOT NULL DEFAULT 'DRAFT_CALCULATED',
                reviewed_by character varying(150),
                reviewed_at timestamp with time zone,
                notes text,
                created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                version integer NOT NULL DEFAULT 0,
                CONSTRAINT fk_innovation_evaluations_enterprise_id FOREIGN KEY (enterprise_id) 
                    REFERENCES enterprise.enterprises(id) ON DELETE CASCADE,
                CONSTRAINT uq_enterprise_evaluation_period UNIQUE (enterprise_id, evaluation_year, criteria_version)
            );

            -- 3. Tạo các chỉ mục tra cứu hiệu năng cao
            CREATE INDEX IF NOT EXISTS ix_innovation_evaluations_enterprise_id 
                ON enterprise.innovation_evaluations(enterprise_id);
            CREATE INDEX IF NOT EXISTS ix_innovation_evaluations_tax_code 
                ON enterprise.innovation_evaluations(tax_code);
            CREATE INDEX IF NOT EXISTS ix_innovation_evaluations_classification 
                ON enterprise.innovation_evaluations(classification);
            CREATE INDEX IF NOT EXISTS ix_innovation_evaluations_status 
                ON enterprise.innovation_evaluations(status);
            CREATE INDEX IF NOT EXISTS ix_innovation_evaluations_group_scores 
                ON enterprise.innovation_evaluations USING gin (group_scores_json);
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
