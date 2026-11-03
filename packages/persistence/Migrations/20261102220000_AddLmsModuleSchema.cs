using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261102220000_AddLmsModuleSchema")]
public sealed class AddLmsModuleSchema : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE SCHEMA IF NOT EXISTS lms;

            -- 1. lms.learning_materials
            CREATE TABLE IF NOT EXISTS lms.learning_materials (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                material_code VARCHAR(30) UNIQUE NOT NULL,
                title VARCHAR(250) NOT NULL,
                lesson_type VARCHAR(20) NOT NULL,
                sector_code VARCHAR(30) NULL,
                duration_minutes INT NOT NULL CHECK (duration_minutes >= 1 AND duration_minutes <= 300),
                description_html TEXT NOT NULL,
                video_storage_key VARCHAR(500) NULL,
                video_file_name VARCHAR(255) NULL,
                video_file_size BIGINT NULL CHECK (video_file_size IS NULL OR video_file_size <= 1073741824),
                video_sha256 VARCHAR(64) NULL,
                thumbnail_url VARCHAR(500) NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
                unpublish_reason VARCHAR(250) NULL,
                unpublished_by UUID NULL,
                unpublished_by_name VARCHAR(150) NULL,
                unpublished_at TIMESTAMPTZ NULL,
                published_at TIMESTAMPTZ NULL,
                published_by UUID NULL,
                created_by UUID NOT NULL,
                created_by_name VARCHAR(150) NOT NULL,
                updated_by UUID NULL,
                updated_by_name VARCHAR(150) NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
                deleted_by UUID NULL,
                deleted_at TIMESTAMPTZ NULL,
                version INT NOT NULL DEFAULT 1,
                rag_indexed_at TIMESTAMPTZ NULL,
                rag_chunk_count INT NOT NULL DEFAULT 0,
                view_count INT NOT NULL DEFAULT 0,
                completion_count INT NOT NULL DEFAULT 0,
                rating_average DOUBLE PRECISION NOT NULL DEFAULT 0,
                rating_count INT NOT NULL DEFAULT 0,
                slug VARCHAR(300) NULL,
                legacy_source_system VARCHAR(50) NULL,
                legacy_source_table VARCHAR(80) NULL,
                legacy_id VARCHAR(100) NULL,
                legacy_source_hash VARCHAR(64) NULL,
                legacy_migrated_at TIMESTAMPTZ NULL,
                legacy_mapping_version VARCHAR(30) NULL,
                legacy_batch_id UUID NULL
            );

            CREATE INDEX IF NOT EXISTS ix_learning_materials_status ON lms.learning_materials (status);
            CREATE INDEX IF NOT EXISTS ix_learning_materials_lesson_type ON lms.learning_materials (lesson_type);
            CREATE INDEX IF NOT EXISTS ix_learning_materials_sector_code ON lms.learning_materials (sector_code);
            CREATE INDEX IF NOT EXISTS ix_learning_materials_created_by ON lms.learning_materials (created_by);
            CREATE INDEX IF NOT EXISTS ix_learning_materials_updated_at ON lms.learning_materials (updated_at);
            CREATE INDEX IF NOT EXISTS ix_learning_materials_is_deleted ON lms.learning_materials (is_deleted);

            -- 2. lms.learning_material_instructors
            CREATE TABLE IF NOT EXISTS lms.learning_material_instructors (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id UUID NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                expert_profile_id UUID NOT NULL,
                full_name VARCHAR(150) NOT NULL,
                title_degree VARCHAR(150) NULL,
                org_name VARCHAR(250) NULL,
                avatar_url VARCHAR(500) NULL,
                display_order INT NOT NULL CHECK (display_order >= 1 AND display_order <= 10),
                is_lead BOOLEAN NOT NULL DEFAULT FALSE,
                role_description VARCHAR(250) NULL,
                CONSTRAINT uq_learning_material_instructors UNIQUE (material_id, expert_profile_id)
            );

            CREATE INDEX IF NOT EXISTS ix_learning_material_instructors_expert ON lms.learning_material_instructors (expert_profile_id);

            -- 3. lms.learning_quiz_questions
            CREATE TABLE IF NOT EXISTS lms.learning_quiz_questions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id UUID NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                display_order INT NOT NULL CHECK (display_order >= 1 AND display_order <= 10),
                question_text VARCHAR(500) NOT NULL,
                option_a VARCHAR(200) NOT NULL,
                option_b VARCHAR(200) NOT NULL,
                option_c VARCHAR(200) NOT NULL,
                option_d VARCHAR(200) NOT NULL,
                correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
                explanation VARCHAR(1000) NOT NULL,
                has_length_warning BOOLEAN NOT NULL DEFAULT FALSE,
                CONSTRAINT uq_learning_quiz_questions_order UNIQUE (material_id, display_order)
            );

            -- 4. lms.learning_attachments
            CREATE TABLE IF NOT EXISTS lms.learning_attachments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id UUID NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                category VARCHAR(30) NOT NULL CHECK (category IN ('PRACTICE_TOOL', 'SUMMARY_SHEET', 'POLICY_DOC')),
                file_name VARCHAR(255) NOT NULL,
                storage_key VARCHAR(500) NOT NULL,
                content_type VARCHAR(100) NOT NULL,
                file_size_bytes BIGINT NOT NULL,
                sha256_hash VARCHAR(64) NULL,
                display_order INT NOT NULL DEFAULT 1,
                uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );

            CREATE INDEX IF NOT EXISTS ix_learning_attachments_material_category ON lms.learning_attachments (material_id, category);

            -- 5. lms.learning_db_links
            CREATE TABLE IF NOT EXISTS lms.learning_db_links (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id UUID NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                display_label VARCHAR(100) NULL,
                description VARCHAR(250) NULL,
                target_url VARCHAR(500) NOT NULL,
                target_entity_type VARCHAR(50) NULL,
                target_id UUID NULL,
                target_code VARCHAR(50) NULL,
                display_order INT NOT NULL CHECK (display_order >= 1 AND display_order <= 5)
            );

            CREATE INDEX IF NOT EXISTS ix_learning_db_links_order ON lms.learning_db_links (material_id, display_order);

            -- 6. lms.learning_moderation_logs
            CREATE TABLE IF NOT EXISTS lms.learning_moderation_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id UUID NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                action VARCHAR(30) NOT NULL,
                reason VARCHAR(250) NULL,
                actor_id UUID NOT NULL,
                actor_name VARCHAR(150) NOT NULL,
                old_status VARCHAR(20) NULL,
                new_status VARCHAR(20) NULL,
                occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );

            CREATE INDEX IF NOT EXISTS ix_learning_moderation_logs_material_date ON lms.learning_moderation_logs (material_id, occurred_at);

            -- 7. lms.learner_progress
            CREATE TABLE IF NOT EXISTS lms.learner_progress (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id UUID NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                person_id UUID NOT NULL,
                watched_seconds INT NOT NULL DEFAULT 0,
                progress_percent INT NOT NULL DEFAULT 0,
                best_quiz_score INT NOT NULL DEFAULT 0,
                quiz_attempts_count INT NOT NULL DEFAULT 0,
                is_completed BOOLEAN NOT NULL DEFAULT FALSE,
                last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                completed_at TIMESTAMPTZ NULL,
                CONSTRAINT uq_learner_progress_material_person UNIQUE (material_id, person_id)
            );

            CREATE INDEX IF NOT EXISTS ix_learner_progress_person_completed ON lms.learner_progress (person_id, is_completed);

            -- 8. lms.learner_quiz_attempts
            CREATE TABLE IF NOT EXISTS lms.learner_quiz_attempts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                material_id UUID NOT NULL REFERENCES lms.learning_materials(id) ON DELETE CASCADE,
                person_id UUID NOT NULL,
                attempt_count INT NOT NULL DEFAULT 1,
                total_questions INT NOT NULL,
                correct_answers INT NOT NULL,
                score_percent INT NOT NULL,
                answers_json JSONB NOT NULL,
                passed BOOLEAN NOT NULL DEFAULT FALSE,
                submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );

            CREATE INDEX IF NOT EXISTS ix_learner_quiz_attempts_material_person ON lms.learner_quiz_attempts (material_id, person_id);
            CREATE INDEX IF NOT EXISTS ix_learner_quiz_attempts_person_date ON lms.learner_quiz_attempts (person_id, submitted_at);
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP SCHEMA IF EXISTS lms CASCADE;
        """);
    }
}
