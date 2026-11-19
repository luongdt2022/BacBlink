using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261110110000_AddLmsInteractiveWorkbookAnd30CoursesDelta")]
public sealed class AddLmsInteractiveWorkbookAnd30CoursesDelta : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            -- 1. Bổ sung 11 cột mở rộng cho lms.learning_materials
            ALTER TABLE lms.learning_materials
                ADD COLUMN IF NOT EXISTS cluster_code varchar(20) NULL,
                ADD COLUMN IF NOT EXISTS cluster_name varchar(250) NULL,
                ADD COLUMN IF NOT EXISTS step_number int NULL CHECK (step_number IS NULL OR (step_number >= 1 AND step_number <= 7)),
                ADD COLUMN IF NOT EXISTS target_audience text NULL,
                ADD COLUMN IF NOT EXISTS preparation_notes text NULL,
                ADD COLUMN IF NOT EXISTS expected_outcome text NULL,
                ADD COLUMN IF NOT EXISTS pass_score_percent int NOT NULL DEFAULT 80,
                ADD COLUMN IF NOT EXISTS learning_objectives_json jsonb NULL,
                ADD COLUMN IF NOT EXISTS learning_roadmap_json jsonb NULL,
                ADD COLUMN IF NOT EXISTS knowledge_summary_json jsonb NULL,
                ADD COLUMN IF NOT EXISTS practice_workbook_json jsonb NULL;

            CREATE INDEX IF NOT EXISTS ix_learning_materials_cluster_code ON lms.learning_materials(cluster_code);
            CREATE INDEX IF NOT EXISTS ix_learning_materials_step_number ON lms.learning_materials(step_number);

            -- 2. lms.learning_micro_videos (Playlist 3 micro-videos kèm CALL SHEET)
            CREATE TABLE IF NOT EXISTS lms.learning_micro_videos (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                video_order int NOT NULL CHECK (video_order >= 1 AND video_order <= 3),
                video_code varchar(30) NOT NULL,
                title varchar(250) NOT NULL,
                duration_seconds int NOT NULL DEFAULT 0,
                video_storage_key varchar(500) NULL,
                video_file_name varchar(255) NULL,
                thumbnail_url varchar(500) NULL,
                call_sheet_json jsonb NULL,
                created_at timestamptz NOT NULL DEFAULT now(),
                CONSTRAINT uq_learning_micro_videos_order UNIQUE (material_id, video_order)
            );
            CREATE INDEX IF NOT EXISTS ix_learning_micro_videos_material ON lms.learning_micro_videos(material_id);

            -- 3. lms.learning_in_video_quizzes (Pop-up quiz dừng video tại trigger_seconds)
            CREATE TABLE IF NOT EXISTS lms.learning_in_video_quizzes (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                micro_video_id uuid NULL REFERENCES lms.learning_micro_videos(id) ON DELETE CASCADE,
                quiz_code varchar(20) NOT NULL,
                trigger_seconds int NOT NULL CHECK (trigger_seconds >= 0),
                after_scene varchar(50) NULL,
                question_text varchar(500) NOT NULL,
                option_a varchar(250) NOT NULL,
                option_b varchar(250) NOT NULL,
                option_c varchar(250) NOT NULL,
                option_d varchar(250) NOT NULL,
                correct_option char(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
                explanation varchar(1000) NOT NULL,
                display_order int NOT NULL DEFAULT 1,
                CONSTRAINT uq_learning_in_video_quizzes_code UNIQUE (material_id, quiz_code)
            );
            CREATE INDEX IF NOT EXISTS ix_learning_in_video_quizzes_trigger ON lms.learning_in_video_quizzes(material_id, trigger_seconds);

            -- 4. lms.learning_practice_rubrics (7 tiêu chí tự chấm thang 0-1-2)
            CREATE TABLE IF NOT EXISTS lms.learning_practice_rubrics (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                criterion_number int NOT NULL CHECK (criterion_number >= 1 AND criterion_number <= 7),
                criterion_name varchar(250) NOT NULL,
                description_score_0 varchar(500) NOT NULL,
                description_score_1 varchar(500) NOT NULL,
                description_score_2 varchar(500) NOT NULL,
                weight_multiplier int NOT NULL DEFAULT 1,
                CONSTRAINT uq_learning_practice_rubrics_criterion UNIQUE (material_id, criterion_number)
            );
            CREATE INDEX IF NOT EXISTS ix_learning_practice_rubrics_material ON lms.learning_practice_rubrics(material_id);

            -- 5. lms.learning_faqs (8 câu hỏi đáp thường gặp)
            CREATE TABLE IF NOT EXISTS lms.learning_faqs (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                question_number int NOT NULL CHECK (question_number >= 1 AND question_number <= 8),
                question_text varchar(500) NOT NULL,
                answer_text text NOT NULL,
                display_order int NOT NULL DEFAULT 1,
                CONSTRAINT uq_learning_faqs_question UNIQUE (material_id, question_number)
            );
            CREATE INDEX IF NOT EXISTS ix_learning_faqs_material ON lms.learning_faqs(material_id);

            -- 6. lms.learner_practice_evaluations (Kết quả tự chấm 7 tiêu chí)
            CREATE TABLE IF NOT EXISTS lms.learner_practice_evaluations (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id uuid NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                person_id uuid NOT NULL,
                rubric_scores_json jsonb NOT NULL,
                essay_answers_json jsonb NULL,
                total_score int NOT NULL CHECK (total_score >= 0 AND total_score <= 14),
                max_score int NOT NULL DEFAULT 14,
                pass_threshold int NOT NULL DEFAULT 11,
                is_unlocked_cta boolean NOT NULL DEFAULT FALSE,
                expert_consultation_requested boolean NOT NULL DEFAULT FALSE,
                demand_profile_created boolean NOT NULL DEFAULT FALSE,
                submitted_at timestamptz NOT NULL DEFAULT now()
            );
            CREATE INDEX IF NOT EXISTS ix_learner_practice_evaluations_person_material ON lms.learner_practice_evaluations(material_id, person_id);
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP TABLE IF EXISTS lms.learner_practice_evaluations CASCADE;
            DROP TABLE IF EXISTS lms.learning_faqs CASCADE;
            DROP TABLE IF EXISTS lms.learning_practice_rubrics CASCADE;
            DROP TABLE IF EXISTS lms.learning_in_video_quizzes CASCADE;
            DROP TABLE IF EXISTS lms.learning_micro_videos CASCADE;

            DROP INDEX IF EXISTS lms.ix_learning_materials_cluster_code;
            DROP INDEX IF EXISTS lms.ix_learning_materials_step_number;

            ALTER TABLE lms.learning_materials 
                DROP COLUMN IF EXISTS cluster_code,
                DROP COLUMN IF EXISTS cluster_name,
                DROP COLUMN IF EXISTS step_number,
                DROP COLUMN IF EXISTS target_audience,
                DROP COLUMN IF EXISTS preparation_notes,
                DROP COLUMN IF EXISTS expected_outcome,
                DROP COLUMN IF EXISTS pass_score_percent,
                DROP COLUMN IF EXISTS learning_objectives_json,
                DROP COLUMN IF EXISTS learning_roadmap_json,
                DROP COLUMN IF EXISTS knowledge_summary_json,
                DROP COLUMN IF EXISTS practice_workbook_json;
        """);
    }
}
