import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiProcess1773824434916 implements MigrationInterface {
  name = 'AddAiProcess1773824434916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Drop old FKs / indexes / columns (old naming convention) ──────────
    await queryRunner.query(`
      ALTER TABLE "intake_attachments" DROP CONSTRAINT IF EXISTS "FK_intake_attachments_intake";
      ALTER TABLE "intake_sectors"   DROP CONSTRAINT IF EXISTS "FK_intake_sectors_intake";
      ALTER TABLE "intake_sectors"   DROP CONSTRAINT IF EXISTS "FK_intake_sectors_sector";
      ALTER TABLE "intakes"          DROP CONSTRAINT IF EXISTS "intakes_user_id_fkey"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS
        "public"."idx_intake_attachments_intake","public"."idx_sectors_name",
        "public"."idx_intake_sectors_intake","public"."idx_intake_sectors_sector",
        "public"."idx_intakes_type","public"."idx_intakes_created_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "intakes" DROP COLUMN IF EXISTS "vsc_link";
      ALTER TABLE "ips"     DROP COLUMN IF EXISTS "capability_profile"
    `);

    // ── 2. Add new column (idempotent) ─────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "intakes" ADD "aiProcessTitle" character varying(255);
      EXCEPTION WHEN duplicate_column THEN null;
      END $$;
    `);

    // ── 3. Ensure enums exist (idempotent) ─────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."intake_attachments_file_type_enum" AS ENUM('image', 'video', 'document');
        CREATE TYPE "public"."intakes_type_enum"               AS ENUM('ip', 'challenge');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // ── 4. Add new FKs (idempotent) ─────────────────────────────────────────
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "intake_attachments" ADD CONSTRAINT "FK_aa5511ab4a0a0ae3e3d5109ee0e" FOREIGN KEY ("intake_id") REFERENCES "intakes"("id")  ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "intake_sectors"   ADD CONSTRAINT "FK_ab41c772055fe537452ba312c19" FOREIGN KEY ("intake_id") REFERENCES "intakes"("id")  ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "intake_sectors"   ADD CONSTRAINT "FK_84f00cb0192e8cd54c3973942e9" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "intakes"          ADD CONSTRAINT "FK_9ef877a7091995ba5b4d026dbf6" FOREIGN KEY ("user_id")    REFERENCES "users"("id")    ON DELETE NO ACTION    ON UPDATE NO ACTION;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert FKs to old naming (InitDatabase will drop these when it reverts)
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "intakes"          ADD CONSTRAINT "intakes_user_id_fkey"           FOREIGN KEY ("user_id")    REFERENCES "users"("id")    ON DELETE SET NULL ON UPDATE CASCADE;
        ALTER TABLE "intake_sectors"   ADD CONSTRAINT "FK_intake_sectors_sector"       FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "intake_sectors"   ADD CONSTRAINT "FK_intake_sectors_intake"      FOREIGN KEY ("intake_id") REFERENCES "intakes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        ALTER TABLE "intake_attachments" ADD CONSTRAINT "FK_intake_attachments_intake"  FOREIGN KEY ("intake_id") REFERENCES "intakes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "intakes"          DROP CONSTRAINT IF EXISTS "FK_9ef877a7091995ba5b4d026dbf6";
      ALTER TABLE "intake_sectors"   DROP CONSTRAINT IF EXISTS "FK_84f00cb0192e8cd54c3973942e9";
      ALTER TABLE "intake_sectors"   DROP CONSTRAINT IF EXISTS "FK_ab41c772055fe537452ba312c19";
      ALTER TABLE "intake_attachments" DROP CONSTRAINT IF EXISTS "FK_aa5511ab4a0a0ae3e3d5109ee0e"
    `);
    await queryRunner.query(
      `ALTER TABLE "intakes" DROP COLUMN IF EXISTS "aiProcessTitle"`,
    );
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_intakes_created_at"        ON "intakes" ("created_at");
      CREATE INDEX IF NOT EXISTS "idx_intakes_type"               ON "intakes" ("type");
      CREATE INDEX IF NOT EXISTS "idx_intake_sectors_sector"      ON "intake_sectors" ("sector_id");
      CREATE INDEX IF NOT EXISTS "idx_intake_sectors_intake"     ON "intake_sectors" ("intake_id");
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_sectors_name"       ON "sectors" ("name");
      CREATE INDEX IF NOT EXISTS "idx_intake_attachments_intake" ON "intake_attachments" ("intake_id")
    `);
  }
}
