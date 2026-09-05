import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1773820311631 implements MigrationInterface {
  name = 'InitDatabase1773820311631';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."intake_attachments_file_type_enum" AS ENUM('image', 'video', 'document');
        CREATE TYPE "public"."intakes_type_enum"               AS ENUM('ip', 'challenge');
        CREATE TYPE "public"."users_role_enum"                 AS ENUM('user', 'admin');
        CREATE TYPE "public"."challenges_status_enum"          AS ENUM('pending', 'approved', 'rejected');
        CREATE TYPE "public"."challenges_reject_reason_enum"   AS ENUM('spam', 'wrong_field', 'unreliable', 'other');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sectors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_923fdda0dc12f59add7b3a1782f" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        "first_name" character varying(100),
        "last_name" character varying(100),
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "research_fields" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_f87416e58748911e69a90b7f3a1" UNIQUE ("name"),
        CONSTRAINT "PK_5a0e03dd1c6f00a4d8908e10334" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "owners" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "owner_type" character varying(20) NOT NULL,
        "avatar" character varying(500),
        "address" character varying(500),
        "contact_email" character varying(255),
        "contact_phone" character varying(20),
        "website" character varying(500),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_42838282f2e6b216301a70b02d6" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "experts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "avatar" character varying(500),
        "specialization" character varying(100) NOT NULL,
        "bio" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_714c375ea5ea46e2d0c7c23ccda" UNIQUE ("email"),
        CONSTRAINT "PK_8ecb9ec7e8b977b177fde797e6a" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "intakes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "content" text,
        "ai_processed_content" text,
        "type" "public"."intakes_type_enum" NOT NULL DEFAULT 'ip',
        "sector_ids" text array,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "user_id" uuid,
        CONSTRAINT "PK_a90d2ecf82eb04f663a52d34fef" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "intake_attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "intake_id" uuid NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "file_path" character varying(500) NOT NULL,
        "file_type" "public"."intake_attachments_file_type_enum" NOT NULL,
        "mime_type" character varying(100),
        "file_size" bigint,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_89757d02782f2e240e67cb64fe1" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "intake_sectors" (
        "intake_id" uuid NOT NULL,
        "sector_id" uuid NOT NULL,
        CONSTRAINT "PK_35b1fea31963566d27d4b9ff18c" PRIMARY KEY ("intake_id", "sector_id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "challenges" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "company" character varying(255),
        "company_avatar" character varying(500),
        "title" character varying(500) NOT NULL,
        "description" text NOT NULL,
        "full_description" text,
        "budget" character varying(100),
        "field" character varying(100) NOT NULL,
        "status" "public"."challenges_status_enum" NOT NULL DEFAULT 'pending',
        "reject_reason" "public"."challenges_reject_reason_enum",
        "reject_note" text,
        "contact_email" character varying(255) NOT NULL,
        "contact_phone" character varying(20),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by" uuid,
        "created_by_name" character varying(255),
        "deadline" character varying(100),
        "problem" text,
        "goals" text,
        "technical_requirements" text,
        "benefits" text,
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_1e664e93171e20fe4d6125466af" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "challenge_attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "challenge_id" uuid NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "file_url" character varying(500) NOT NULL,
        "file_size" bigint,
        "mime_type" character varying(100),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_273d3e814a4a1b3c89d49513ae9" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ips" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(50) NOT NULL,
        "name" character varying(500) NOT NULL,
        "description" text,
        "benefits" text,
        "applications" text,
        "thumbnail_url" character varying(500),
        "video_url" character varying(500),
        "video_file_url" character varying(500),
        "owner_id" uuid,
        "owner_name" character varying(255),
        "owner_type" character varying(20),
        "research_team" character varying(255),
        "year" integer,
        "patent_number" character varying(100),
        "legal_status" character varying(20),
        "trl_level" integer,
        "trl_score" integer NOT NULL DEFAULT '0',
        "field" character varying(100),
        "expert_id" uuid,
        "expert_assigned_at" TIMESTAMP,
        "expert_assign_type" character varying(20),
        "expert_name" character varying(255),
        "expert_rejected_at" TIMESTAMP,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "auto_approved" boolean NOT NULL DEFAULT false,
        "review_score" integer,
        "review_comment" text,
        "reviewed_at" TIMESTAMP,
        "internal_notes" text,
        "preliminary_score" integer,
        "view_count" integer NOT NULL DEFAULT '0',
        "interest_count" integer NOT NULL DEFAULT '0',
        "tech_specs" text,
        "achievements" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by" uuid,
        "deleted_at" TIMESTAMP,
        CONSTRAINT "UQ_4bc923449dfc389c69d70c1071b" UNIQUE ("code"),
        CONSTRAINT "PK_9c7e0cec8d2feb53801f29ffacf" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ip_attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ip_id" uuid NOT NULL,
        "type" character varying(20) NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "file_url" character varying(500) NOT NULL,
        "file_size" bigint,
        "mime_type" character varying(100),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ee1fb9ed7d2943eb6d7ec3d8f96" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ip_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ip_id" uuid NOT NULL,
        "action" character varying(255) NOT NULL,
        "log_type" character varying(20) NOT NULL,
        "actor_id" uuid,
        "actor_type" character varying(20),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fc9eec2742ec541fbdb5fec1161" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "intake_attachments" ADD CONSTRAINT "FK_aa5511ab4a0a0ae3e3d5109ee0e" FOREIGN KEY ("intake_id") REFERENCES "intakes"("id")  ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "intake_sectors"     ADD CONSTRAINT "FK_ab41c772055fe537452ba312c19" FOREIGN KEY ("intake_id") REFERENCES "intakes"("id")  ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "intake_sectors"     ADD CONSTRAINT "FK_84f00cb0192e8cd54c3973942e9" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "intakes"            ADD CONSTRAINT "FK_9ef877a7091995ba5b4d026dbf6" FOREIGN KEY ("user_id")    REFERENCES "users"("id")    ON DELETE NO ACTION    ON UPDATE NO ACTION;
        ALTER TABLE "ip_attachments"    ADD CONSTRAINT "FK_649eb39dae4f621320baf12515c" FOREIGN KEY ("ip_id")       REFERENCES "ips"("id")      ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "ip_logs"           ADD CONSTRAINT "FK_4ffa585262c9a7ca362634ffc32" FOREIGN KEY ("ip_id")       REFERENCES "ips"("id")      ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "ips"                ADD CONSTRAINT "FK_6d39332b72d4ad00231419913f3" FOREIGN KEY ("owner_id")    REFERENCES "owners"("id")   ON DELETE NO ACTION    ON UPDATE NO ACTION;
        ALTER TABLE "ips"                ADD CONSTRAINT "FK_e889516d20b3f5b5f8d567549b8" FOREIGN KEY ("expert_id")   REFERENCES "experts"("id")  ON DELETE NO ACTION    ON UPDATE NO ACTION;
        ALTER TABLE "challenge_attachments" ADD CONSTRAINT "FK_e34b028e8f1fafae6d7359603f1" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "challenge_attachments" DROP CONSTRAINT IF EXISTS "FK_e34b028e8f1fafae6d7359603f1";
      ALTER TABLE "ips"                DROP CONSTRAINT IF EXISTS "FK_e889516d20b3f5b5f8d567549b8";
      ALTER TABLE "ips"                DROP CONSTRAINT IF EXISTS "FK_6d39332b72d4ad00231419913f3";
      ALTER TABLE "ip_logs"            DROP CONSTRAINT IF EXISTS "FK_4ffa585262c9a7ca362634ffc32";
      ALTER TABLE "ip_attachments"      DROP CONSTRAINT IF EXISTS "FK_649eb39dae4f621320baf12515c";
      ALTER TABLE "intakes"            DROP CONSTRAINT IF EXISTS "FK_9ef877a7091995ba5b4d026dbf6";
      ALTER TABLE "intake_sectors"      DROP CONSTRAINT IF EXISTS "FK_84f00cb0192e8cd54c3973942e9";
      ALTER TABLE "intake_sectors"     DROP CONSTRAINT IF EXISTS "FK_ab41c772055fe537452ba312c19";
      ALTER TABLE "intake_attachments" DROP CONSTRAINT IF EXISTS "FK_aa5511ab4a0a0ae3e3d5109ee0e"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "challenge_attachments","challenges","ip_logs","ip_attachments",
      "ips","experts","owners","research_fields","users","intake_sectors",
      "intake_attachments","intakes","sectors"
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."challenges_reject_reason_enum","public"."challenges_status_enum",
      "public"."users_role_enum","public"."intakes_type_enum","public"."intake_attachments_file_type_enum"
    `);
  }
}
