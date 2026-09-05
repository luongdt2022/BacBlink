import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiProcessingStatus1773826334689 implements MigrationInterface {
  name = 'AddAiProcessingStatus1773826334689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."intakes_ai_processing_status_enum"
          AS ENUM('processing', 'completed', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "intakes"
          ADD "ai_processed_content" text;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "intakes"
          ADD "ai_processing_status" "public"."intakes_ai_processing_status_enum";
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "intakes" DROP COLUMN IF EXISTS "ai_processing_status"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."intakes_ai_processing_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "intakes" DROP COLUMN IF EXISTS "ai_processed_content"`,
    );
  }
}
